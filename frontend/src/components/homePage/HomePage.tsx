import React from 'react';
import './HomePage.scss'
import { StyledLink, StyledButton } from '../../shared/BasicElements'
import { FaArrowRight, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { UserPasses, User } from '../../shared/types';
import Loader from 'react-loader-spinner'

import { RegisterWindow, LoginWindow } from '../loginAndRegister/loginAndRegister';
import get from 'lodash/get';

type HomeState = {
    leftPanel: {
        register: boolean,
        login: boolean,
        loading: boolean,
        error: boolean,
    },
    isLogged: boolean,
    errorMessage: string
}


export default class HomePage extends React.Component<{}, HomeState> {

    constructor(props: {}) {
        super(props)
       const isLogged = localStorage.getItem('isLogged') ? true : false;
       // const isLogged = true;
        const state = { leftPanel: { register: false, login: false, loading: false, error: false }, isLogged: isLogged, errorMessage: '' };
        this.state = state;
    }

    changeLeftPanelState(panelToTurnOn: string) {
        const allFalse = { register: false, login: false, loading: false, error: false };
        if (panelToTurnOn === 'register') {
            return { ...allFalse, register: true };
        } else if (panelToTurnOn === 'login') {
            return { ...allFalse, login: true };
        } else if (panelToTurnOn === 'loading') {
            return { ...allFalse, loading: true };
        } else if (panelToTurnOn === 'error') {
            return { ...allFalse, error: true };
        } else {
            return allFalse;
        }
    }

    logInUser = () => {
        this.setState({ leftPanel: this.changeLeftPanelState(''), isLogged: true });
        localStorage.setItem('isLogged', 'true');
    }

    handleExit = () => this.setState({ leftPanel: this.changeLeftPanelState('') });

    handleRegister = (user: User) => {
        this.setState({ leftPanel: this.changeLeftPanelState('loading') });
        authService.register(user).then((response) => {
            localStorage.setItem('token', response.data.token)
            this.logInUser()
        }).catch(error => {
            const response = get(error.response, 'data', '');
            this.setState({ leftPanel: this.changeLeftPanelState('error'), errorMessage: response.message })
        });

    }

    handleLogin = (userPasses: UserPasses) => {
        this.setState({ leftPanel: this.changeLeftPanelState('loading') })
        authService.login(userPasses).then((response) => {
            localStorage.setItem('token', response.data.token)
            this.logInUser()
        }).catch(error => {
            const response = get(error.response, 'data', '');
            this.setState({ leftPanel: this.changeLeftPanelState('error'), errorMessage: response.message })
        });
    }

    setLeftPanel() {
        const { register, login, loading, error } = this.state.leftPanel;

        if (loading) {
            return (
                <div className='col-lg-5 offset-lg-1 col-12 d-flex justify-content-center align-items-center'>
                    <Loader
                        type="ThreeDots"
                        color="#0e0700"
                        height={150}
                        width={150}
                    />
                </div>
            )
        } else if (register) {
            return <RegisterWindow onExitClick={this.handleExit} onSubmitClick={this.handleRegister}></RegisterWindow>
        } else if (login) {
            return <LoginWindow onExitClick={this.handleExit} onSubmitClick={this.handleLogin}></LoginWindow>
        } else if (error) {
            return (
                <div className='col-lg-5 offset-lg-1 col-12 d-flex justify-content-center align-items-center'>
                    <b className="error-message">{this.state.errorMessage}</b>
                </div>
            )
        } else {
            return (
                <ul className="col-lg-5 offset-lg-1 col-12 ">
                    <li>Monitor changes on favourites websites</li>
                    <li>Get instant information via mail or push notifications</li>
                    <li>Share results of monitoring with colleagues</li>
                    <li>Generate raport in PDF</li>
                    <li>Create automatic chart</li>
                </ul>
            )
        }
    }

    setButtons() {
        const { isLogged } = this.state;
        if (isLogged) {
            return (
                <React.Fragment>
                    <p>You're logged in. </p>
                    <StyledLink to="new-monitor">
                        Go to application
                        <span className="glyph-wrapper">
                            <FaArrowRight />
                        </span>
                    </StyledLink>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <StyledButton onClick={() => this.setState({ leftPanel: this.changeLeftPanelState('login') })}>
                        Sign in
                        <span className="glyph-wrapper">
                            <FaSignInAlt />
                        </span>
                    </StyledButton>
                    <StyledButton onClick={() => this.setState({ leftPanel: this.changeLeftPanelState('register') })}>
                        Sign up
                        <span className="glyph-wrapper">
                            <FaUserPlus />
                        </span>
                    </StyledButton>
                </React.Fragment>
            );
        }
    }

    render() {
        return (
            <div className="home-page-wrapper background container-fluid d-flex flex-column" >
                <header className="homepage-header row row-flex flex-grow-1">
                    <h1>Website Monitor</h1>
                </header>
                <div className="row row-flex flex-grow-2">
                    {this.setLeftPanel()}
                    <div className="col-lg-5 col-12 img-wrapper">
                        <img src="/logo400.png" alt="landscape" ></img>
                    </div>
                </div>
                <div className="row row-flex flex-grow-1 align-items-center ">
                    <div className="buttons-bottom col-lg-5 offset-lg-1 col-12 d-flex justify-content-around align-items-baseline">
                        {this.setButtons()}
                    </div>
                </div>
            </div>
        );
    }
}
