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


export function LoginWindow(props: loginProps) {
    const { onExitClick, onSubmitClick } = props;
    const [loginValue, setLoginValue] = useState({ mail: '', password: '' });

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setLoginValue({ ...loginValue, [name]: value });
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
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Password</b></label><br></br>
                        <input type="password" onChange={handleValueChange} placeholder="Enter password" name="password" required />
                    </div>
                    <button onClick={() => onSubmitClick(loginValue)} type="button">Login</button>
                </form>
            </div>
        </div>
    )
}

export function RegisterWindow(props: registerProps) {
    const { onExitClick, onSubmitClick } = props;
    const [userValue, setUserValue] = useState({ name: '', surname: '', mail: '', password: '', password2: '' });

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserValue({ ...userValue, [name]: value });
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
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Surname</b></label><br></br>
                        <input type="text" onChange={handleValueChange} placeholder="Enter surname" name="surname" required />
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Mail</b></label><br></br>
                        <input type="text" onChange={handleValueChange} placeholder="Enter mail" name="mail" required />
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Password</b></label><br></br>
                        <input type="password" onChange={handleValueChange} placeholder="Enter password" name="password" required />
                    </div>
                    <div className='input-wrapper'>
                        <label><b>Confirm password</b></label><br></br>
                        <input type="password" placeholder="Enter password" name="password2" required />
                    </div>
                    <button onClick={() => onSubmitClick(userValue)} type="button">Register</button>
                </form>
            </div>
        </div>
    )
}

