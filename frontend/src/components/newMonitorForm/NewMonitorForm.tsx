import React, { ChangeEvent, useState } from 'react';
import { FaArrowDown } from 'react-icons/fa';
import { Monitor } from '../../shared/types';
import Datetime from "react-datetime";
import styled from 'styled-components';
import { StyledButton } from '../../shared/BasicElements';


type monitorProps = {
    onSubmitClick: (monitor: Monitor) => void,
    monitor?: Monitor
}

const Wrapper = styled.div`
    width:100%;
    background-color: ${'rgba(252, 218, 156, 0.548)'};
    font-size: 1rem;
    padding: 10px 0 25px;

`
const Label = styled.label`
    font-weight: 500;
    margin-left: 20px;

    @media screen and (max-width: 480px) {
        margin: 5px 0 0 2px;

    }
`
const CheckBoxLabel = styled(Label)`
    margin-right:10px;

`
const Input = styled.input`
    height: calc(1.5em + .75rem + 2px);
    padding: .375rem .75rem !important;
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
    width:30%;
    
    @media screen and (max-width: 480px) {
        margin: 5px auto;
    }
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
    textChange: false,
    allFilesChange: false,
    author: localStorage.getItem('mail') || '',
    mailNotification: localStorage.getItem('mail') || '',
    url: '',
    startInitial: '',
    endInitial: ''
}

const convertTimeInMonitor = (monitor: Monitor) => {
    const { start, end } = monitor;
    const startDate = new Date(Date.parse(start) + 60*60*1000).toISOString().slice(0, 19).replace('T', ' ')
    const endDate = new Date(Date.parse(end) + 60*60*1000).toISOString().slice(0, 19).replace('T', ' ')

    const convertedStart = `${startDate.slice(5, 7)}/${startDate.slice(8, 10)}/${startDate.slice(0, 4)} ${startDate.slice(10)}`
    const convertedEnd = `${endDate.slice(5, 7)}/${endDate.slice(8, 10)}/${endDate.slice(0, 4)} ${endDate.slice(10)}`

    const monitorWithInitials = { ...monitor, start: startDate, end: endDate, startInitial: convertedStart, endInitial: convertedEnd }
    return monitorWithInitials
}

export function NewMonitorForm({ onSubmitClick, monitor }: monitorProps) {
    const intialMonitor = monitor ? convertTimeInMonitor(monitor) : emptyMonitor;
    const submitButtonText = monitor ? 'Submit changes' : 'Create';
    const [monitorValue, setMonitorValue] = useState(intialMonitor);

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setMonitorValue({ ...monitorValue, [name]: value });
    }

    const handleOnChangeStartDate = (date: any) => {
        setMonitorValue({ ...monitorValue, start: date.format("YYYY-MM-DD HH:mm:ss") });
    }

    const handleOnChangeEndDate = (date: any) => {
        setMonitorValue({ ...monitorValue, end: date.format("YYYY-MM-DD HH:mm:ss") });
    }

    const handleOnChangeCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
        const { name } = event.target;
        name === 'textChange' ?
            setMonitorValue({ ...monitorValue, textChange: !monitorValue.textChange })
            :
            setMonitorValue({ ...monitorValue, allFilesChange: !monitorValue.allFilesChange })
    }

    const handleSubmit = () => {
        // TODO: alert to prettier info method
  
          if (monitorValue.start === '' || monitorValue.end === '') {
              alert('Empty date!')
              return
          }
          if (!monitorValue.textChange && !monitorValue.allFilesChange) {
              alert('Any of scans type is selected!')
              return
          }
         
          if (!monitorValue.intervalMinutes || isNaN(monitorValue.intervalMinutes)) {
              alert('Wrong interval minutes')
              return
          }
        onSubmitClick(monitorValue);
    }

    return (
        <Wrapper>
            <div className='d-flex-column justify-content-center align-items-baseline '>
                <div className="row align-items-baseline py-2">
                    <Label className='col-lg-1 col-12' >Start time</Label>
                    <Datetime className='col-lg-3 col-12' initialValue={monitorValue.startInitial} onChange={handleOnChangeStartDate} timeFormat="HH:mm:ss" />

                    <Label className='col-lg-1 col-12 ' >Key words</Label>
                    <Input className='input-text col-lg-3 col-12 ' type="text" value={monitorValue.keyWords} onChange={handleValueChange} placeholder="Word 1; Word 2;   . . . " name="keyWords" required />

                    <div className='d-flex col-lg-2 col-12 align-items-baseline'>
                        <CheckBoxLabel>All files change</CheckBoxLabel>
                        <input
                            type="checkbox"
                            name='allFilesChange'
                            defaultChecked={monitorValue.allFilesChange}
                            onChange={handleOnChangeCheckbox}
                        />
                    </div>
                </div>
                <div className="row align-items-baseline py-2 ">
                    <Label className='col-lg-1 col-12'>End time</Label>
                    <Datetime className='col-lg-3 col-12' initialValue={monitorValue.endInitial} onChange={handleOnChangeEndDate} timeFormat="HH:mm:ss" />

                    <Label className='col-lg-1 col-12' >Mail</Label>
                    <Input className='input-text col-lg-3 col-12' type="text" onChange={handleValueChange} placeholder="Enter mail" value={monitorValue.mailNotification} name="mailNotification" required />

                    <div className='d-flex col-lg-2 col-12 align-items-baseline'>
                        <CheckBoxLabel>Text change</CheckBoxLabel>
                        <input
                            type="checkbox"
                            name='textChange'
                            defaultChecked={monitorValue.textChange}
                            onChange={handleOnChangeCheckbox}
                        />
                    </div>

                </div>
                <div className='row align-items-baseline py-2'>
                    <Label className='col-lg-1 col-12' >Interval</Label>
                    <Input className='input-text col-lg-2 col-12' value={monitorValue.intervalMinutes} type="text" onChange={handleValueChange} placeholder="Enter minutes" name="intervalMinutes" required />
                    <div className='input-text col-lg-5 col-12'>
                        <Label className='mr-3' >Double click on element you want observe</Label>
                        <FaArrowDown></FaArrowDown>
                    </div>

                    <CreateButton onClick={handleSubmit}>{submitButtonText}</CreateButton>
                </div>
            </div>
        </Wrapper>
    )
}