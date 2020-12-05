import React, { useState, useEffect } from 'react';
import { Monitor } from '../../shared/types';
import { monitorService } from '../../services/monitorsService';
import { useHistory } from 'react-router-dom';
import get from 'lodash/get';
import { Button, Modal } from 'react-bootstrap';
import { NewMonitorForm } from '../newMonitorForm/NewMonitorForm';


type manageProps = {
    monitorId: string,
    monitor: Monitor,
    isVisible: boolean,
    onSubmitClick: (monitor: Monitor) => void,
    onManageClose: () => void,
}

export function ManageRoom ({monitorId, monitor, isVisible, onSubmitClick, onManageClose}: manageProps) {
    const history = useHistory();
    const [state, setState] = useState({monitor: monitor, isVisible: isVisible });

    useEffect( () => {
        setState({monitor: monitor, isVisible: isVisible})
    },  [monitor, isVisible])

    const handleMonitorDelete = () => {
        onManageClose()
        monitorService.deleteMonitor(monitorId)
            .then(res => {
                history.push({
                    pathname: `/all-monitors`
                });
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                alert(response.msg)
                console.log(response.msg);
            });
    }

    const handleSubmit = (monitor: Monitor) => {
        onManageClose()
        monitorService.updateMonitor(monitor)
            .then(res => {
                const data = get(res, 'data', '');
                const roomId = data ? data.roomId : '';
                onSubmitClick(monitor)
            })
            .catch(error => {
                const response = get(error.response, 'data', '');
                alert(response.msg)
                console.log('errir');
            });
    }

    return (
        <Modal show={state.isVisible} onHide={onManageClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Manage</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NewMonitorForm onSubmitClick={handleSubmit} monitor={state.monitor}></NewMonitorForm>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleMonitorDelete}>Delete monitor</Button>
            </Modal.Footer>
        </Modal>
    )
}
