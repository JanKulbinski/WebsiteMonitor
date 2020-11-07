import React, { useState } from 'react';
import { Navbar, Nav} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { NavbarLink } from './BasicElements';
import './Navbar.scss'


const ulStyle = {
    paddingTop: '30%',
}

const activeStyle = {
    color: '#0e0700',
    fontWeight: 600
}

interface Props {
    componentId : string
}

export const MyNavbar = ({componentId}: Props) => {

    const [activeLink] = useState(componentId);

    return (
        <React.Fragment>

            <Navbar expand="lg" className="d-lg-none navbar-custom">
                <Navbar.Brand>Website Monitor</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link style={activeLink === '1' ? activeStyle:undefined} as={Link} to="/new-monitor">New Monitor</Nav.Link>
                        <Nav.Link style={activeLink === '2' ? activeStyle:undefined} as={Link} to="/all-monitors">All monitors</Nav.Link>
                        <Nav.Link style={activeLink === '3' ? activeStyle:undefined} as={Link} to="/">Charts</Nav.Link>
                        <Nav.Link style={activeLink === '4' ? activeStyle:undefined} as={Link} to="/">Back</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className='row vh-100 d-none d-lg-block nav-wrapper'>
                    <ul className= 'flex-column justify-content-start' style={ulStyle}>
                        <NavbarLink id='1' style={activeLink === '1' ? activeStyle:undefined} to="/new-monitor">New Monitor</NavbarLink>
                        <NavbarLink id='2' style={activeLink === '2' ? activeStyle:undefined} to="/all-monitors">All monitors</NavbarLink>
                        <NavbarLink id='3' style={activeLink === '3' ? activeStyle:undefined} to="/">Charts</NavbarLink>
                        <NavbarLink id='4' style={activeLink === '4' ? activeStyle:undefined} to="/">Back</NavbarLink>
                    </ul>
            </div>
        </React.Fragment>

    );
}