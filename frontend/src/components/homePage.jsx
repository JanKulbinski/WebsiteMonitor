import React from 'react';
import {API_URL}  from '../constants'
import './homePage.scss'


export default class HomePage extends React.Component {
    
    onElementToMonitor = (message) => {
        const { data, origin } = message;
        if (origin === API_URL) {
            console.log(data)
        }
    }

    componentDidMount() {
        window.addEventListener('message', this.onElementToMonitor, false);
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.onElementToMonitor, false);
    }

    render() {
        return (
            <div>
            <main>
                <header>
                    <h1>Website Monitor</h1>
                </header>
                <ul>
                    <li>Monitor changes on favourites websites</li>
                    <li>Get instant information via mail or push notifications</li>
                    <li>Share results of monitoring with colleagues</li>
                    <li>Generate raport in PDF</li>
                    <li>Create automatic chart</li>
                </ul>
                <img src="/logo400.png" alt="landscape" ></img>
                <div className="buttons">
                    <button>Sign in</button>
                    <button>Sign up</button>
                </div>
            </main>
            
            <div>
                <iframe title="Inline Frame Example" src='http://localhost:5000/static/www.lfc.pl/www.lfc.pl/index.html'></iframe>
            </div>
            </div>

        )
    }
}
