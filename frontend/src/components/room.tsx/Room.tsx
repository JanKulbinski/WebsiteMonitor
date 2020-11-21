import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './Room.scss'
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get } from 'lodash';
import { monitorService } from '../../services/monitorsService';
import { Monitor } from '../../shared/types';
import { StyledButton } from '../../shared/BasicElements';


type PathParamsType = {
    id: string,
}

type RoomState = {
    isMonitorsAuthor: boolean,
    isLogged: boolean,
    monitor: Monitor,
    monitorId: string
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

class Room extends React.Component<PropsType, RoomState> {

    constructor(props: PropsType) {
        super(props);
        this.state = {
            isMonitorsAuthor: false,
            isLogged: false,
            monitor: emptyMonitor,
            monitorId: ''
        }
    }

    componentDidMount() {
        const id = get(this.props.match.params, 'id', '').slice(1);
        monitorService.getMonitor(id)
            .then(res => {
                const monitor = res.data.monitor;
                const isMonitorsAuthor = (localStorage.getItem('mail') === monitor.author);
                const isLogged = localStorage.getItem('token') ? true : false;
                this.setState({ monitor:monitor, isMonitorsAuthor: isMonitorsAuthor, isLogged: isLogged, monitorId:id});
                const {intervalMinutes, start, end} = monitor
                this.setIntervalApiPing(intervalMinutes, start, end, id);
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                alert(response.msg)
                console.log(response.msg);
            });
    }

    setIntervalApiPing(intervalMinutes:number, start:string, end:string, monitorId:string) {
        const startDate = Date.parse(start);
        const endDate = Date.parse(end);
        const miliseconds = intervalMinutes * 60 * 1000
        setInterval(() => {
            const now = Date.now()
            console.log({startDate, endDate, miliseconds, comp:(now > startDate && now < endDate)})
            if(now > startDate && now < endDate) {
                monitorService.getScan(monitorId)
                .then(res => {
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
    render() {


        return (
            <div className='row'>
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
                </main>
            </div>
        );
    }
}

export default withRouter(Room);
