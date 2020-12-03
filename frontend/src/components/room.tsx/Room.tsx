import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './Room.scss'
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get } from 'lodash';
import { monitorService } from '../../services/monitorsService';
import { Monitor, Scan } from '../../shared/types';
import { StyledButton } from '../../shared/BasicElements';
import { Card, Button, Collapse, Modal } from 'react-bootstrap';
import { FaExchangeAlt, FaClipboardCheck, FaFilePdf } from 'react-icons/fa';
import styled from 'styled-components';
import { NewMonitorForm } from '../newMonitorForm/NewMonitorForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import addNotification from 'react-push-notification';


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
                this.setState({ scans: res.data.scans, newestScanId: res.data.scans.length + 1 });
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
                        this.setState({ scans: [...this.state.scans, scan], newestScanId: this.state.newestScanId + 1 });
                        
                        addNotification({
                                title: 'New scan executed!',
                                message: `Web page: ${this.state.monitor.url} `,
                                theme: 'darkblue',
                                native: true // when using native, your OS will handle theming.
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

    handlePDF = (id: string, date: string, url: string) => {
        const div = document.getElementById(id);
        if (div) {
            html2canvas(div).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();

                pdf.setFontSize(25);
                pdf.setFont("times", "bold");
                pdf.text(10, 20, this.state.monitor.url)

                pdf.setFontSize(10);
                pdf.text(10, 30, date)

                if (url !== 'noPath') {
                    pdf.text(`Link to HTML comparsion:`, 10, 50);
                    pdf.setTextColor(52, 29, 145);
                    pdf.text(url, 10, 54);
                }

                pdf.addImage(imgData, 'PNG', 10, 60);
                pdf.save(`scan-${date.slice(5, -3)}.pdf`);
            });
        }
    }

    toggle = (id: number) => {
        let scans = [...this.state.scans]
        let scan = {
            ...scans[id - 1],
            isOpen: !scans[id - 1].isOpen
        }
        scans[id - 1] = scan
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

    getCards() {
        return this.state.scans.map((value, index) => {
            return (
                <div id='cardsWrapper'>
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
                                <p>{value.date}</p>
                            </div>
                        </Card.Header>
                        <Collapse in={value.isOpen}>
                            <Card.Body >
                                <Card.Text id="example-collapse-text">
                                    <div className="h2-wrapper">
                                        <h2>Monitor Raport</h2>
                                    </div>
                                    <div id={`pdf-${index}`}>

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
                                    </div>

                                    <div className="body">
                                        <div className="title">
                                            <b>Text changes</b>
                                        </div>
                                        {
                                            value.isDiffrence > 0 && (
                                            <div className="buttons">
                                                <DiffButton onClick={() => this.handleModalOpen(value.raportPath)}>Check out text difference</DiffButton>
                                                <DiffButton onClick={() => this.handlePDF(`pdf-${index}`, value.date, value.raportPath)}>Generate PDF <FaFilePdf></FaFilePdf></DiffButton>
                                            </div>
                                            )
                                        }

                                    </div>
                                </Card.Text>
                            </Card.Body>
                        </Collapse>
                    </Card>
                </div>
            )
        })
    }

    handleManageClose = () => {
        this.setState({ manageVisible: false })
    }

    handleManageOpen = () => {
        this.setState({ manageVisible: true })
    }

    handleMonitorDelete = () => {
        monitorService.deleteMonitor(this.state.monitorId)
            .then(res => {
                this.props.history.push({
                    pathname: `/all-monitors`
                });
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                alert(response.msg)
                console.log(response.msg);
            });


    }

    handleSubmit = (monitor: Monitor) => {

        monitorService.updateMonitor(monitor)
            .then(res => {
                const data = get(res, 'data', '');
                const roomId = data ? data.roomId : '';

                alert(`Monitor ${roomId} changed!`)
                console.log(`Monitor ${roomId} changed!`)

                this.setState({ monitor: monitor });
                const { intervalMinutes, start, end } = monitor

                clearInterval(this.intervalPing)
                this.setIntervalApiPing(intervalMinutes, start, end, this.state.monitorId);
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                alert(response.msg)
                console.log(response.msg);
            });

        this.handleManageClose()
    }

    getManageModal() {
        return (
            <Modal show={this.state.manageVisible} onHide={this.handleManageClose} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Manage</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewMonitorForm onSubmitClick={this.handleSubmit} monitor={this.state.monitor}></NewMonitorForm>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.handleMonitorDelete}>Delete monitor</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    render() {
        return (
            <div className='row'>
                {this.getManageModal()}
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
                    {this.state.isMonitorsAuthor &&
                        <div className='manageWrapper'>
                            <StyledButton onClick={this.handleManageOpen}>Manage</StyledButton>
                        </div>
                    }

                    {this.getCards()}
                </main>
            </div>
        );
    }
}

export default withRouter(Room);
