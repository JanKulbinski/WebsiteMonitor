import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './AllMonitors.scss'
import { monitorService } from '../../services/monitorsService';
import { get } from 'lodash';
import { Card } from 'react-bootstrap';
import { FaDoorOpen, FaCalendarTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type monitorCard = {
    active: boolean,
    end: string,
    start: string,
    url: string,
    id: string
};

type allMonitorsState = {
    monitors: monitorCard[]
};

export default class AllMonitors extends React.Component<{},allMonitorsState> {
    
    constructor(props: {}) {
        super(props);
        this.state = {
            monitors: []
        }
    }

    componentDidMount() {
        monitorService.getAllUsersMonitors().then(res => {
            this.setState({monitors:get(res, 'data', []) });
        })
        .catch(error => {
            const response = get(error.response, 'data', '');
            console.log(response.msg);
            alert(response.msg)
        });
    }

    getCards() {
        return this.state.monitors.map((monitor) => {
            return (
                <div className='cards-wrapper'>
                    <Card>
                        <Card.Header>
                        <div className='header'>
                            <p>{monitor.url}</p>
                            {
                            monitor.active ?
                            <Link to={`/room/:${monitor.id}`}>
                                <FaDoorOpen style={{ fill: 'rgb(49, 211, 49)' }} size={30}></FaDoorOpen>
                            </Link>
                            :
                            <FaCalendarTimes style={{ fill: 'rgb(197, 37, 37)' }} size={30}></FaCalendarTimes>
                            }
                        </div>

                        <div className="dates">
                            <span>
                                {monitor.start.slice(0,- 3)}
                            </span>
                            <span className="delimilator">
                            - 
                            </span>
                            <span>
                                {monitor.end.slice(0, -3)}

                            </span>
                        </div>
                        </Card.Header>
                    </Card>
                </div>
            )
        })
    }

    render() {
        return (
            <div className='row'>
                <div className='col-lg-2 col-12'>
                    <MyNavbar componentId='2'></MyNavbar>
                </div>
                <main className='all-monitors col-lg-10 col-12'>
                    <header>
                        <h1>All Monitors</h1>
                    </header>
                {this.getCards()}
                </main>
            </div>
        );
    }
}