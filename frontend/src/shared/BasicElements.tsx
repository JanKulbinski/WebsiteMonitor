import { Link } from 'react-router-dom';
import styled from 'styled-components';


// TODO: import colors from sass
const black = '#0e0700';
const  beige = '#fcd489';

// TODO: DRY -> styled button and link are repeated
export const StyledButton = styled.button`
    padding: 5px 15px;
    color: ${beige};
    font-size: 1.75rem;
    background-color: transparent;
    border: 2px solid ${beige};
    border-radius: 5px;

    &:hover {
        background-color:${beige};
        color: ${black};
        cursor: pointer;
        text-decoration: none;
    }
`

export const StyledLink = styled(Link)`
    padding: 5px 15px;
    color: ${beige};
    font-size: 1.75rem;
    background-color: transparent;
    border: 2px solid ${beige};
    border-radius: 5px;

    &:hover {
        background-color:${beige};
        color: ${black};
        cursor: pointer;
        text-decoration: none;
    }
`

export const NavbarLink = styled(Link)`
    color: #0e0700;
    font-size: 1.75rem;
    margin: 25px 0; 

    &:hover {
        color: #684C2D;
        text-decoration: none;
    }
`