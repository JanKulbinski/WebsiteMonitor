import React from 'react';
import './HomePage.scss'
import { StyledLink, StyledButton } from '../../shared/BasicElements'
import { FaArrowRight, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { UserPasses, User } from '../../shared/types';
import Spinner from 'react-bootstrap/esm/Spinner';
import { RegisterWindow, LoginWindow } from '../loginAndRegister/loginAndRegister';

type HomeState = {
    leftPanel: {
        register: boolean,
        login: boolean,
        loading: boolean
    },
    isLogged: boolean
}


export default class HomePage extends React.Component<{}, HomeState> {

    constructor(props: {}) {
        super(props)
        const isLogged = localStorage.getItem('isLogged') ? true : false;
        const state = { leftPanel: { register: false, login: false, loading: false }, isLogged: isLogged };
        this.state = state;
    }

    changeLeftPanelState(panelToTurnOn: string) {
        if (panelToTurnOn === 'register') {
            return { register: true, login: false, loading: false }
        } else if (panelToTurnOn === 'login') {
            return { register: false, login: true, loading: false }
        } else if (panelToTurnOn === 'loading') {
            return { register: false, login: false, loading: true }
        } else {
            return { register: false, login: false, loading: false }
        }
    }

    logInUser = () => {
        this.setState({ leftPanel: this.changeLeftPanelState(''), isLogged: true });
        localStorage.setItem('isLogged', 'true');
    }

    handleExit = () => this.setState({ leftPanel: this.changeLeftPanelState('') });

    handleRegister = (user: User) => {
        this.setState({ leftPanel: this.changeLeftPanelState('loading') });
        authService.register(user).then(response => {
            this.logInUser()
        }).catch(e => {
            console.log(`error catch: ${e}`)
        });

    }

    handleLogin = (userPasses: UserPasses) => {
        this.setState({ leftPanel: this.changeLeftPanelState('loading') })
        authService.login(userPasses).then(response => {
            this.logInUser()
        }).catch(e => {
            console.log(`error catch: ${e}`)
        });
    }

    setLeftPanel() {
        const { register, login, loading } = this.state.leftPanel;

        if (loading) {
            return (
                <div className='col-lg-5 offset-lg-1 col-12 d-flex justify-content-center align-items-center'>  
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </div>
            )
        } else if (register) {
            return <RegisterWindow onExitClick={this.handleExit} onSubmitClick={this.handleRegister}></RegisterWindow>
        } else if (login) {
            return <LoginWindow onExitClick={this.handleExit} onSubmitClick={this.handleLogin}></LoginWindow>
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
