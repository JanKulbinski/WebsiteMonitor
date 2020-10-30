import React from 'react';
import {API_URL}  from '../constants'

const HomePageStyle = {
    width: '100vw',
    height: '60vh',
    overflow: 'scroll'
};

const HomeDescription = () => {
    
    const description = 'This app enables to...';
    const reasonsToUse = ['first', 'second', 'third'];
    const reasons = reasonsToUse.map(r => <li>{r}</li>)
    const ifShow = true;
    return ifShow && (
        <div>
        <ul>
            {reasons}
        </ul>

        <p>{description}</p>
        </div>

    )
}



export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
      }

    state = {
        title: 'dwa'
    }
    
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

        const change = () => {
            this.setState({
                title :'trzeci'
            })}

        return (
            <div>
                <h1>{this.state.title}</h1>
                <HomeDescription></HomeDescription>
                <button onClick={change}>Change</button>
                <iframe style={HomePageStyle} title="Inline Frame Example" src='http://localhost:5000/static/www.lfc.pl/www.lfc.pl/index.html'></iframe>
            </div>
        )
    }
}
