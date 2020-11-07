import React from 'react';
import './HomePage.scss'
import { StyledLink } from '../../shared/BasicElements'
import { FaArrowRight, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default class HomePage extends React.Component {

    componentDidMount() {
       // const ifLogged = localStorage.getItem('logged');
    }

    setLeftPanel() {
        // wez ze statu czy odbywa sie logowanie rejestracja czy co
        // zwroc albo ul albo panel rejestracji ...
    }
    setButtons() {
        //const ifLogged = localStorage.getItem('logged');
        const ifLogged = 'true';
        if(ifLogged && ifLogged === 'true') {
            return ( 
                <React.Fragment>
                    <p>You're logged in. </p>
                    <StyledLink to="new-monitor">
                        Go to application                
                        <span className="glyph-wrapper"> 
                            <FaArrowRight/>
                        </span>
                    </StyledLink>
                </React.Fragment>               
            );
        } else { // ALbo tutaj zamiast linkow zrobic render logowanie / rejestracja / ul
            return (     
                <React.Fragment>
                    <StyledLink to="sign-in">
                        Sign in
                        <span className="glyph-wrapper"> 
                            <FaSignInAlt/>
                        </span>
                    </StyledLink>
                    <StyledLink to="sign-up">
                        Sign up
                        <span className="glyph-wrapper"> 
                            <FaUserPlus/>
                        </span>
                    </StyledLink>
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
                    <ul className="col-lg-5 offset-lg-1 col-12 "> 
                        <li>Monitor changes on favourites websites</li>
                        <li>Get instant information via mail or push notifications</li>
                        <li>Share results of monitoring with colleagues</li>
                        <li>Generate raport in PDF</li>
                        <li>Create automatic chart</li>
                    </ul>
                    <div className="col-lg-5 col-12 img-wrapper">
                        <img  src="/logo400.png" alt="landscape" ></img>
                    </div>
                </div>
                <div className="row row-flex flex-grow-1 align-items-center ">
                    <div className="col-lg-5 offset-lg-1 col-12 d-flex justify-content-around align-items-baseline">
                            {this.setButtons()}
                    </div>
                </div>
            </div>
        );
    }
}
