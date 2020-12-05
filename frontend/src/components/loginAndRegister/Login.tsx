import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { FaUserShield, FaTimes } from 'react-icons/fa';
import { UserPasses } from '../../shared/types';
import './loginAndRegister.scss'


type loginProps = {
    onExitClick: (event: MouseEvent<HTMLDivElement>) => void,
    onSubmitClick: (login: UserPasses) => void
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