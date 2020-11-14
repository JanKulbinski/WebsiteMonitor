import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { FaArrowDown, FaUserShield, FaTimes } from 'react-icons/fa';
import { UserPasses, User, Monitor } from '../../shared/types';
import Datetime from "react-datetime";
import styled from 'styled-components';
import { StyledButton } from '../../shared/BasicElements';


type monitorProps = {
    onSubmitClick: (monitor: Monitor) => void
}

const Wrapper = styled.div`
    width:100%;
    background-color: ${'rgba(252, 218, 156, 0.548)'};
    font-size: 1.25rem;
    padding: 10px 0 25px;

`
const Label = styled.label`
    font-weight: 500;
    margin-left: 20px;
`
const Input = styled.input`
display: block;
height: calc(1.5em + .75rem + 2px);
padding: .375rem .75rem;
font-size: 1rem;
font-weight: 400;
line-height: 1.5;
color: #495057;
background-color: #fff;
background-clip: padding-box;
border: 1px solid #ced4da;
border-radius: .25rem;
transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
padding: 5px;

`
const CreateButton = styled(StyledButton)`
    width:30%
`
const emptyMonitor = {
    start: '',
    end: '',
    choosenElement: {
        tag: '',
        index: 0
    },
    keyWords: '',
    intervalMinutes: 1440,
    mailNotification: false,
    browserNotification: false,
    mail: localStorage.getItem('mail') || ''

}

export function NewMonitorForm({ onSubmitClick }: monitorProps) {
    const [monitorValue, setMonitorValue] = useState(emptyMonitor);

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setMonitorValue({ ...monitorValue, [name]: value });
    }

    const handleOnChangeStartDate = (date: any) => {
        setMonitorValue({ ...monitorValue, start: date.format("YYYY-MM-DD hh:mm:ss") });
    }

    const handleOnChangeEndDate = (date: any) => {
        setMonitorValue({ ...monitorValue, end: date.format("YYYY-MM-DD hh:mm:ss") });
    }

    const handleOnChangeCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
        const { name } = event.target;
        name === 'mailNotification' ? 
            setMonitorValue({ ...monitorValue, mailNotification: !monitorValue.mailNotification })
        :
            setMonitorValue({ ...monitorValue, browserNotification: !monitorValue.browserNotification })
    }

    const handleSubmit = () => {

        // TODO: Validation

        /*  let mailMsg = '';
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
          }*/
        onSubmitClick(monitorValue);

    }

    return (
        <Wrapper>
            <div className='d-flex-column justify-content-center align-items-baseline '>
                <div className="row align-items-baseline py-2">
                    <Label className='col-lg-1 col-12' >Start time</Label>
                    <Datetime className='col-lg-2 col-12' onChange={handleOnChangeStartDate} />

                    <Label className='col-lg-1 col-12 ' >Key words</Label>
                    <Input className='input-text col-lg-3 col-12 ' type="text" onChange={handleValueChange} placeholder="Word 1; Word 2;   . . . " name="keyWords" required />
                
                    <Label className='col-lg-2 col-12' >Browser notification</Label>
                    <input className='col-lg-1 col-12'
                        type="checkbox"
                        name='browserNotification'
                        defaultChecked={monitorValue.browserNotification}
                        onChange={handleOnChangeCheckbox}
                    />
                </div>
                <div className="row align-items-baseline py-2 ">
                    <Label className='col-lg-1 col-12'>End time</Label>
                    <Datetime className='col-lg-2 col-12' onChange={handleOnChangeEndDate} />

                    <Label className='col-lg-1 col-12' >Mail</Label>
                    <Input className='input-text col-lg-3 col-12' type="text" onChange={handleValueChange} placeholder="Enter mail" value={monitorValue.mail} name="mail" required />
                    
                    <Label className='col-lg-2 col-12' >Mail notification</Label>
                    <input className='col-lg-1 col-12'
                        type="checkbox"
                        name='mailNotification'
                        defaultChecked={monitorValue.mailNotification}
                        onChange={handleOnChangeCheckbox}
                    />
                </div>
                <div className='row align-items-baseline py-2'>
                    <Label className='col-lg-1 col-12' >Interval</Label>
                    <Input className='input-text col-lg-2 col-12' type="text" onChange={handleValueChange} placeholder="Enter minutes" name="intervalMinutes" required />
                    <div className='input-text col-lg-5 col-12'>
                        <Label className='mr-3' >Double click on element you want observe</Label>
                        <FaArrowDown></FaArrowDown>
                    </div>

                    <CreateButton onClick={handleSubmit}>Create</CreateButton>
                </div>
            </div>
        </Wrapper>
    )
}