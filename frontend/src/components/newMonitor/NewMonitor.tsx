import React from 'react';
import { API_URL } from '../../constants';
import { IPostMessage } from '../../shared/types';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './NewMonitor.scss'


type NoticeProps = {
    msg?: string
}

export default class MainApp extends React.Component<NoticeProps, { tag: string, index: string }> {

    constructor(props: NoticeProps) {
        super(props);
        this.state = { tag: '', index: '' };
    }

    onElementToMonitor = (message: IPostMessage) => {
        const { data, origin } = message;
        if (origin === API_URL) {
            const { tag, index } = data;
            this.setState({ tag: tag, index: index });
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
            <div className='row'>
                <div className='col-lg-2 col-12'>
                    <MyNavbar componentId='1'></MyNavbar>
                </div>
                <main className='newMonitor col-lg-10 col-12'>
                    <iframe title="Inline Frame Example" src='http://localhost:5000/static/www.lfc.pl/www.lfc.pl/index.html'></iframe>
                    <p>Selected: {this.state.tag} : {this.state.index} </p>
                    <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Vivamus porta tortor sed metus. Nam pretium. Sed tempor. Integer ullamcorper, odio quis porttitor sagittis, nisl erat tincidunt massa, eu eleifend eros nibh sollicitudin est. Nulla dignissim. Mauris sollicitudin, arcu id sagittis placerat, tellus mauris egestas felis, eget interdum mi nibh vel lorem. Aliquam egestas hendrerit massa. Suspendisse sed nunc et lacus feugiat hendrerit. Nam cursus euismod augue. Aenean vehicula nisl eu quam luctus adipiscing. Nunc consequat justo pretium orci. Mauris hendrerit fermentum massa. Aenean consectetuer est ut arcu. Aliquam nisl massa, blandit at, accumsan sed, porta vel, metus. Duis fringilla quam ut eros.</p>
					<p>Sed eu ligula eget eros vulputate tincidunt. Etiam sapien urna, auctor a, viverra sit amet, convallis a, enim. Nullam ut nulla. Nam laoreet massa aliquet tortor. Mauris in quam ut dui bibendum malesuada. Nulla vel erat. Pellentesque metus risus, aliquet eget, eleifend in, ultrices vitae, nisi. Vivamus non nulla. Praesent ac lacus. Donec augue turpis, convallis sed, lacinia et, vestibulum nec, lacus. Suspendisse feugiat semper nunc. Donec nisl elit, varius sed, sodales volutpat, commodo in, elit. Proin ornare hendrerit lectus. Sed non dolor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis suscipit. Mauris egestas tincidunt lectus. Phasellus sed quam et velit laoreet pretium. Nunc metus.</p>
                </main>
            </div>
        );
    }
}
