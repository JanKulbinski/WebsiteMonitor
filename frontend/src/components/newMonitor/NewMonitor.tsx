import React, { ChangeEvent } from 'react';
import { API_URL } from '../../constants';
import { IPostMessage, Monitor } from '../../shared/types';
import { MyNavbar } from '../../shared/navbar/Nabar';
import './NewMonitor.scss'
import { StyledButton } from '../../shared/BasicElements';
import styled from 'styled-components';
import { monitorService } from '../../services/monitorsService';
import get from 'lodash/get';
import { FaCloud } from 'react-icons/fa';
import Loader from 'react-loader-spinner'
import { NewMonitorForm } from '../newMonitorForm/NewMonitorForm';


type NewMonitorState = {
    iFrameUrl: string;
    iFrameInput: string;
    isFrameLoading: boolean;
    isFrameLoaded: boolean;
    form: {
        inputWebsite: string;
    },
    tag: string;
    index: string;
}

const GoButton = styled(StyledButton)`
    width:15%;
`

export default class NewMonitor extends React.Component<{}, NewMonitorState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            iFrameUrl: '',
            iFrameInput: '',
            isFrameLoading: false,
            isFrameLoaded: false,
            form: {
                inputWebsite: '',
            },
            tag: '',
            index: ''
        }
    }

    componentDidMount() {
        window.addEventListener('message', this.onElementToMonitor, false);
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.onElementToMonitor, false);
    }

    handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        this.setState({ ...this.state, [name]: value });
    }

    handleGo = () => {
        monitorService.getPageToMonitor(this.state.iFrameInput).then(response => {
            const data = get(response, 'data', '');
            const url = data ? data.location : '';
            this.setState({ iFrameUrl: url, isFrameLoading: false, isFrameLoaded: true })
        }).catch(error => {
            const response = get(error.response, 'data', '');
            alert(response.message)
            console.log(response);
        });
        this.setState({ isFrameLoading: true })
    }

    onElementToMonitor = (message: IPostMessage) => {
        const { data, origin } = message;
        if (origin === API_URL) {
            const { tag, index } = data;
            this.setState({ tag: tag, index: index });
        }
    }

    setIframe = () => {
        const { isFrameLoaded, isFrameLoading } = this.state;
        let result;

        if (!isFrameLoaded && !isFrameLoading) {
            result = <FaCloud color="#0e0700" size={140}></FaCloud>
        } else if (isFrameLoading) {
            result = <Loader
                type="ThreeDots"
                color="#0e0700"
                height={150}
                width={150}
         />
        } else if (isFrameLoaded) {
            result = <iframe title="Inline Frame Example" src={this.state.iFrameUrl}></iframe>
        }

        return (
            <div className='iframe-place'>
                {result}
            </div>
        )
    }

    handleSubmitClick = (monitor: Monitor) => {
        console.log({monitor})
    }

    render() {
        return (
            <div className='row'>
                <div className='col-lg-2 col-12'>
                    <MyNavbar componentId='1'></MyNavbar>
                </div>
                <main className='newMonitor col-lg-10 col-12'>
                    <div className='inhalt'>
                        <h1>Create new monitor</h1>
                        <div className='url-wrapper'>
                            <input type='text' placeholder='Enter Website...' name='iFrameInput' onChange={(e) => this.handleValueChange(e)}></input>
                            <GoButton onClick={this.handleGo}>GO</GoButton>
                        </div>
                        {this.state.isFrameLoaded &&
                            <div className='form-wrapper'>
                                <NewMonitorForm onSubmitClick={this.handleSubmitClick}></NewMonitorForm>
                            </div>
                        }
                        {this.setIframe()}
                    </div>
                </main>
            </div>
        );
    }
}
