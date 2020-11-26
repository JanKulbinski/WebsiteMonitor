import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './Room.scss'
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get } from 'lodash';
import { monitorService } from '../../services/monitorsService';
import { Monitor, Scan } from '../../shared/types';
import { StyledButton } from '../../shared/BasicElements';
import { Accordion, Card, Button, Collapse, Modal } from 'react-bootstrap';
import { FaExchangeAlt, FaClipboardCheck } from 'react-icons/fa';
import styled from 'styled-components';


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
    mail: localStorage.getItem('mail') || '',
    url: ''
}

const black = '#0e0700';
const beige = '#fcd489';

export const DiffButton = styled.button`
    padding: 5px 15px;
    color: ${black};
    font-size: 1.25rem;
    background-color: ${beige};
    border: 2px solid ${beige};
    border-radius: 5px;

    &:hover {
        cursor: pointer;
    }
`


const changeDetect = (scan: Scan) => {
    return ((scan.changed_files && scan.changed_files.length) ||
    (scan.new_files && scan.new_files.length) ||
        (scan.deleted_files && scan.deleted_files.length) ||
        scan.isDiffrence)
};

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
            newestScanId: 0,
            scans: [],
            modalVisible: false,
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
                this.setIntervalApiPing(intervalMinutes, start, end, id);
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                alert(response.msg)
                console.log(response.msg);
            });
    }

    componentWillUnmount() {
        clearInterval(this.intervalPing);
    }

    setIntervalApiPing(intervalMinutes: number, start: string, end: string, monitorId: string) {
        const startDate = Date.parse(start);
        const endDate = Date.parse(end);
        const miliseconds = intervalMinutes * 60 * 1000
        this.intervalPing = setInterval(() => {
            const now = Date.now()
            if (now > startDate && now < endDate) {
                monitorService.getScan(monitorId, this.state.newestScanId)
                    .then(res => {
                        let keyWordsOccuranceList;
                        if ('keyWordsOccurance' in res.data) {
                            keyWordsOccuranceList = parseKeyWordsOccurences(res.data.keyWordsOccurance)
                        }
                        const scan = { ...res.data, id: this.state.newestScanId, isOpen: false, keyWordsOccuranceList: keyWordsOccuranceList };
                        this.setState({ scans: [...this.state.scans, scan], newestScanId: this.state.newestScanId + 1 });
                        console.log(res)
                    })
                    .catch(error => {
                        const response = get(error.response, 'data', '');
                        alert(response.msg)
                        console.log(response.msg);
                    });
            }
        }, miliseconds)

    }

    computeTime = (id: number) => {
        const timestamp = Date.parse(this.state.monitor.start) + id * this.state.monitor.intervalMinutes * 60 * 1000
        const date = new Date(timestamp).toLocaleDateString("pl-PL")
        const time = new Date(timestamp).toLocaleTimeString("pl-PL")
        return `${date} ${time}`
    }

    toggle = (id: number) => {
        let scans = [...this.state.scans]
        let scan = {
            ...scans[id],
            isOpen: !scans[id].isOpen
        }
        scans[id] = scan
        this.setState({ scans })
    }

    handleModalClose = () => {
        this.setState({modalVisible:false})
    }

    handleModalOpen = (url: string) => {
        this.setState({modalVisible:true, iframeUrl:url})
    }

    getCards() {
        return this.state.scans.map((value) => {
            return (
                <div className='cardsWrapper'>
                    <Card>
                        <Card.Header
                            onClick={() => this.toggle(value.id)}
                            aria-controls="example-collapse-text"
                            aria-expanded={value.isOpen}>
                            <div className="header">
                                {changeDetect(value) ?
                                    <FaExchangeAlt style={{ color: 'green' }}></FaExchangeAlt>
                                    : <FaClipboardCheck></FaClipboardCheck>
                                }
                                <p>{this.computeTime(value.id)}</p>
                            </div>
                        </Card.Header>
                        <Collapse in={value.isOpen}>
                            <Card.Body >
                                <Card.Text id="example-collapse-text">
                                    <div className="h2-wrapper">
                                        <h2>Monitor Raport</h2>
                                    </div>

                                    <div className="body">
                                        <div className="title">
                                            <b>Files changes</b>
                                        </div>
                                        {value.new_files && value.new_files.map((name) => (<p className="new">+ {name}</p>))}
                                        {value.changed_files && value.changed_files.map((name) => (<p className="modified">~ {name}</p>))}
                                        {value.deleted_files && value.deleted_files.map((name) => (<p className="deleted">- {name}</p>))}
                                    </div>

                                    <div className="body">
                                        <div className="title">
                                            <b>Key words occurences</b>
                                        </div>
                                        {value.keyWordsOccuranceList && value.keyWordsOccuranceList.map((name) => {
                                           return (
                                            <React.Fragment>
                                            <p className="key-word"> {name[0]}</p>
                                                    {name.slice(1).map((line) => {
                                                        const lineNumber = line.split(" ").splice(-1)[0]
                                                        const lastIndex = line.lastIndexOf(" ");
                                                        const lineCut = line.substring(0, lastIndex);
                                                        return (
                                                                <span>
                                                                    <i>
                                                                        {lineNumber}
                                                                    </i>
                                                                <p className="modified">{lineCut}</p>
                                                                </span>
                                                        )
                                                    })}
                                            </React.Fragment>
                                           ) 
                                        })}
                                    </div>
                                    <div className="body">
                                        <div className="title">
                                            <b>Text changes</b>
                                        </div>
                                        <DiffButton onClick={() => this.handleModalOpen(value.raportPath)}>Check out text difference</DiffButton>
                                    </div>
                                </Card.Text>
                            </Card.Body>
                        </Collapse>
                    </Card>
                </div>
            )
        })
    }

    render() {
        return (
            <div className='row'>
                <Modal show={this.state.modalVisible} onHide={this.handleModalClose}  size="xl" centered>
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
                    {this.state.isMonitorsAuthor &&
                        <div className='manageWrapper'>
                            <StyledButton>Manage</StyledButton>
                        </div>
                    }

                    {this.getCards()}
                </main>
            </div>
        );
    }
}

export default withRouter(Room);
