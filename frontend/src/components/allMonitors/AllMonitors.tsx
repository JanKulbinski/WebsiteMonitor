import React from 'react';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './AllMonitors.scss'

export default class AllMonitors extends React.Component {
    render() {
        return (
            <div className='row'>
                <div className='col-lg-2 col-12'>
                    <MyNavbar componentId='2'></MyNavbar>
                </div>
                <main className='col-lg-10 col-12'>
                    <iframe title="Inline Frame Example" src='http://localhost:5000/static/www.lfc.pl/www.lfc.pl/index.html'></iframe>
                    <p>Selected: All</p>

                </main>
            </div>
        );
    }
}