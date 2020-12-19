import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get } from 'lodash';
import { monitorService } from '../../services/monitorsService';
import { Monitor, Scan } from '../../shared/types';
import { StyledButton } from '../../shared/BasicElements';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import addNotification from 'react-push-notification';
import { ManageRoom } from './ManageRoom';
import { ScanCard } from './ScanCard';
import './Room.scss'

type PathParamsType = {
    id: string
}

type RoomState = {
    isMonitorsAuthor: boolean,
    isLogged: boolean,
    monitor: Monitor,
    monitorId: string,
    newestScanId: number,
    scans: Scan[],
    modalVisible: boolean,
    manageVisible: boolean,
    iframeUrl: string
}

type PropsType = RouteComponentProps<PathParamsType> & {
    msg?: string,
}

const emptyMonitor = {
    start: '',
    end: '',
    choosenElement: {
        tag: '',
        index: 0
    },
    keyWords: '',
    intervalMinutes: 1440,
    textChange: false,
    allFilesChange: false,
    author: localStorage.getItem('mail') || '',
    mailNotification: '',
    url: ''
}

const black = '#0e0700';
const beige = '#fcd489';

export const DiffButton = styled.button`
    padding: 5px 15px;
    color: ${black};
    background-color: ${beige};
    border: 2px solid ${beige};
    border-radius: 5px;

    &:hover {
        cursor: pointer;
    }
`

const parseKeyWordsOccurences = (keyWords: string) => {
    const words = keyWords.split('!%^');
    const result: string[][] = [];
    words.forEach((word, index) => {
        result[index] = word.split('#$@')
    });
    return result;
}

class Room extends React.Component<PropsType, RoomState> {

    private intervalPing = 0;

    constructor(props: PropsType) {
        super(props);
        this.state = {
            isMonitorsAuthor: false,
            isLogged: false,
            monitor: emptyMonitor,
            monitorId: '',
            newestScanId: 1,
            scans: [],
            modalVisible: false,
            manageVisible: false,
            iframeUrl: ''
        }
    }

    componentDidMount() {
        const id = get(this.props.match.params, 'id', '').slice(1);
        monitorService.getMonitor(id)
            .then(res => {
                const monitor = res.data.monitor;
                const isMonitorsAuthor = (localStorage.getItem('mail') === monitor.author);
                const isLogged = localStorage.getItem('token') ? true : false;
                this.setState({ monitor: monitor, isMonitorsAuthor: isMonitorsAuthor, isLogged: isLogged, monitorId: id });
                const { intervalMinutes, start, end } = monitor
                this.getExistingScans(id)
                this.setIntervalApiPing(intervalMinutes, start, end, id);
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                console.log(response.msg);
            });
    }

    componentWillUnmount() {
        clearInterval(this.intervalPing);
    }

    getExistingScans(id: string) {
        monitorService.getExistingScans(id)
        .then(res => {
            if ('scans' in res.data) {                
                const scansArray:Scan[] = []
                res.data.scans.forEach((scanElement: Scan) => {
                    let keyWordsOccuranceList;
                    if ('keyWordsOccurance' in scanElement) {
                        keyWordsOccuranceList = parseKeyWordsOccurences(scanElement.keyWordsOccurance)
                        const newScan = { ...scanElement, isOpen: false, keyWordsOccuranceList: keyWordsOccuranceList };
                        scansArray.unshift(newScan)
                    }
                });
                this.setState({ scans: scansArray, newestScanId: res.data.scans.length + 1 });
            }
        })
        .catch(error => {
            const response = get(error.response, 'data', '');
            console.log(response.msg);
        });
    }

    setIntervalApiPing(intervalMinutes: number, start: string, end: string, monitorId: string) {
        const startDate = Date.parse(start);
        const endDate = Date.parse(end);
        const miliseconds = intervalMinutes * 60 * 1000

        this.intervalPing = setInterval(async () => {
            const now = Date.now()
            if (now > startDate && now < endDate) {
                monitorService.getScan(monitorId, this.state.newestScanId)
                    .then(res => {
                        let keyWordsOccuranceList;
                        if ('keyWordsOccurance' in res.data) {
                            keyWordsOccuranceList = parseKeyWordsOccurences(res.data.keyWordsOccurance)
                        }
                        const scan = { ...res.data, id: this.state.newestScanId, isOpen: false, keyWordsOccuranceList: keyWordsOccuranceList };
                        this.setState({ scans: [scan, ...this.state.scans ], newestScanId: this.state.newestScanId + 1 });
         
                        addNotification({
                                title: 'NEW SCAN',
                                message: `${this.state.monitor.url} `,
                                theme: 'darkblue',
                                native: true
                        });
                    })
                    .catch(error => {
                        const response = get(error.response, 'data', '');
                        console.log(response.msg);
                    });
            } else if (now > endDate) {
                clearInterval(this.intervalPing)
            }
        }, miliseconds)
    }

    handleToggle = (id: number) => {
        const index = this.state.scans.length - id
        let scans = [...this.state.scans]
        let scan = {
            ...scans[index],
            isOpen: !scans[index].isOpen
        }
        scans[index] = scan
        this.setState({ scans })
    }

    handleModalClose = () => {
        this.setState({ modalVisible: false })
    }

    handleModalOpen = (url: string) => {
        if (url === 'noPath') {
            url = '';
        }
        this.setState({ modalVisible: true, iframeUrl: url })
    }

    handleManageSubmit = (monitor:Monitor) => {
        this.setState({monitor});
        const { intervalMinutes, start, end } = monitor
        clearInterval(this.intervalPing)
        this.setIntervalApiPing(intervalMinutes, start, end, this.state.monitorId);
        alert(`Monitor ${this.state.monitorId} changed!`)
        console.log(`Monitor ${this.state.monitorId} changed!`)
    }

    handleManageOpen = () => {
        this.setState({ manageVisible: true });
    }

    handleManageClose = () => {
        this.setState({ manageVisible: false });
    }

    render() {
        return (
            <div className='row'>
                <Modal show={this.state.modalVisible} onHide={this.handleModalClose} size="xl" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Htmls comparsion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.iframeUrl ?
                            <iframe className="modal-iframe" title="Inline Frame Example" src={this.state.iframeUrl}></iframe>
                            :
                            <p>No changes</p>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <DiffButton onClick={this.handleModalClose}> Close </DiffButton>
                    </Modal.Footer>
                </Modal>

                {this.state.isLogged &&
                    <div className='col-lg-2 col-12'>
                        <MyNavbar componentId='3'></MyNavbar>
                    </div>
                }

                <main className={this.state.isLogged ? 'room col-lg-10 col-12' : 'room col-12'}>
                    <header>
                        <h1>{this.state.monitor.url}</h1>
                    </header>
                    <ManageRoom monitorId={this.state.monitorId} monitor={this.state.monitor} 
                    onSubmitClick={this.handleManageSubmit} isVisible={this.state.manageVisible}
                    onManageClose={this.handleManageClose}/>
                    {this.state.isMonitorsAuthor &&
                        <div className='manageWrapper'>
                            <StyledButton onClick={this.handleManageOpen}>Manage</StyledButton>
                        </div>
                    }

                    { this.state.scans.map((value, index) => 
                     <ScanCard value={value} index={index} monitorUrl={this.state.monitor.url} onToggle={this.handleToggle} onModalOpen={this.handleModalOpen} />
                     )}
                </main>
            </div>
        );
    }
}

export default withRouter(Room);