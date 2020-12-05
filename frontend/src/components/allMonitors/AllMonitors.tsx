import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import { monitorService } from '../../services/monitorsService';
import { get } from 'lodash';
import { MonitorCardType } from '../../shared/types';
import { MonitorCard } from './MonitorCard';
import './AllMonitors.scss'

type allMonitorsState = {
    monitors: MonitorCardType[]
};

export default class AllMonitors extends React.Component<{}, allMonitorsState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            monitors: []
        }
    }

    componentDidMount() {
        monitorService.getAllUsersMonitors().then(res => {
            this.setState({ monitors: get(res, 'data', []) });
        })
            .catch(error => {
                const response = get(error.response, 'data', '');
                console.log(response.msg);
                alert(response.msg)
            });
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
                    { 
                    this.state.monitors.map((monitor) => 
                     (<MonitorCard monitor={monitor}></MonitorCard>))
                    }
                </main>
            </div>
        );
    }
}