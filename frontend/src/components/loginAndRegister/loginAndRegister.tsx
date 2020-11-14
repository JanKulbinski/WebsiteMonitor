import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { FaUserPlus, FaUserShield, FaTimes } from 'react-icons/fa';
import { UserPasses, User } from '../../shared/types';
import './loginAndRegister.scss'


type loginProps = {
    onExitClick: (event: MouseEvent<HTMLDivElement>) => void,
    onSubmitClick: (login: UserPasses) => void
}

type registerProps = {
    onExitClick: (event: MouseEvent<HTMLDivElement>) => void,
    onSubmitClick: (user: User) => void
}


export function LoginWindow({onExitClick, onSubmitClick }: loginProps) {
    const [loginValue, setLoginValue] = useState({ mail: '', password: '', mailError: '', passwordError: '' });

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setLoginValue({ ...loginValue, [name]: value });
    }

    const handleSubmit = () => {
        let mailMsg = '';
        let passMsg = '';

        if (loginValue.mail === '')
            mailMsg = "Empty field"
        else if (!loginValue.mail.includes('@'))
            mailMsg = "Lack of @"

        if (loginValue.password === '')
            passMsg = "Empty field"

        if (mailMsg === '' && passMsg === '') {
            onSubmitClick(loginValue);
        } else {
            setLoginValue({ ...loginValue, mailError: mailMsg, passwordError: passMsg })
        }
    }

    return (
        <div className='col-lg-5 offset-lg-1 col-12 d-flex justify-content-center align-items-center'>
            <div className='window'>
                <div className="exit" onClick={onExitClick}>
                    <FaTimes style={{ fill: 'black' }} size={20}>
                    </FaTimes>
                </div>
                <div className='d-flex justify-content-center align-items-center'>
                    <FaUserShield style={{ fill: 'black' }} size={120}></FaUserShield>
                </div>
                <form>
                    <div className='input-wrapper'>
                        <label><b>Mail</b></label><br></br>
                        <input type="text" onChange={handleValueChange} placeholder="Enter mail" name="mail" required />
                        <label className='error'>{loginValue.mailError}</label>
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Password</b></label><br></br>
                        <input type="password" onChange={handleValueChange} placeholder="Enter password" name="password" required />
                        <label className='error'>{loginValue.passwordError}</label>
                    </div>
                    <button onClick={handleSubmit} type="button">Login</button>
                </form>
            </div>
        </div>
    )
}

export function RegisterWindow({ onExitClick, onSubmitClick }: registerProps) {
    const [userValue, setUserValue] = useState({
        name: '',
        surname: '',
        mail: '',
        password: '',
        password2: '',
        error: { name: '', surname: '', mail: '', password: '', password2: '' }
    });

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserValue({ ...userValue, [name]: value });
    }

    const handleSubmit = () => {
        const { name, surname, mail, password, password2 } = userValue;

        let nameMsg = '';
        if (name === '')
            nameMsg = "Empty field";
        else if (/\d/.test(name))
            nameMsg = "Cant't contain number";

        let surnameMsg = '';
        if (surname === '')
            surnameMsg = "Empty field";
        else if (/\d/.test(surname))
            surnameMsg = "Cant't contain number";

        let mailMsg = '';
        if (mail === '')
            mailMsg = "Empty field";
        else if (!mail.includes('@'))
            mailMsg = "Lack of @";

        let passwordMsg = '';
            if (password === '')
                passwordMsg = "Empty field";
        
        let password2Msg = '';
            if (password2 === '')
                password2Msg = "Empty field";
            else if (password !== '' && password !== password2)
                password2Msg = "Passwords aren't same";

        if (nameMsg === '' && surnameMsg === '' && mailMsg === '' && passwordMsg === '' && password2Msg === '') {
            onSubmitClick(userValue);
        } else {
            setUserValue({ ...userValue, error: {name:nameMsg, surname:surnameMsg, mail:mailMsg, password:passwordMsg, password2:password2Msg }})
        }
    }

    return (
        <div className='col-lg-5 offset-lg-1 col-12 d-flex justify-content-center align-items-center'>
            <div className='window'>
                <div className="exit" onClick={onExitClick}>
                    <FaTimes style={{ fill: 'black' }} size={20}>
                    </FaTimes>
                </div>
                <div className='d-flex justify-content-center align-items-center'>
                    <FaUserPlus style={{ fill: 'black' }} size={120}></FaUserPlus>
                </div>
                <form>
                    <div className='input-wrapper'>
                        <label><b>Name</b></label><br></br>
                        <input type="text" onChange={handleValueChange} placeholder="Enter name" name="name" required />
                        <label className='error'>{userValue.error.name}</label>
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Surname</b></label><br></br>
                        <input type="text" onChange={handleValueChange} placeholder="Enter surname" name="surname" required />
                        <label className='error'>{userValue.error.surname}</label>
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Mail</b></label><br></br>
                        <input type="text" onChange={handleValueChange} placeholder="Enter mail" name="mail" required />
                        <label className='error'>{userValue.error.mail}</label>
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Password</b></label><br></br>
                        <input type="password" onChange={handleValueChange} placeholder="Enter password" name="password" required />
                        <label className='error'>{userValue.error.password}</label>
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Confirm password</b></label><br></br>
                        <input type="password" onChange={handleValueChange} placeholder="Enter password" name="password2" required />
                        <label className='error'>{userValue.error.password2}</label>
                    </div>
                    <button onClick={handleSubmit} type="button">Register</button>
                </form>
            </div>
        </div>
    )
}

