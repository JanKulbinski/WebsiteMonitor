import axios from 'axios';
import { API_URL } from '../constants';
import { Monitor } from '../shared/types';


export const monitorService = {
    getPageToMonitor,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    getMonitor,
    getAllUsersMonitors,
    getScan,
    getExistingScans
};

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
    } 
}

const prefix = '/monitors'

function getPageToMonitor(webpageAdress: string) {
    return axios.get(`${API_URL}${prefix}/page-to-monitor`, {
        headers: getHeaders(), 
        params: {
            adress: webpageAdress
        }
      });
}

function createMonitor(monitor: Monitor) {
    const headers = { headers: getHeaders() }
    
    return axios.post(`${API_URL}${prefix}/create-monitor`, {
        ...monitor
    },
    headers)
}

function updateMonitor(monitor: Monitor) {
    const headers = { headers: getHeaders() }
    
    return axios.put(`${API_URL}${prefix}/update-monitor`, {
        ...monitor
    },
    headers)
}

function getMonitor(monitorId: string) {
    return axios.get(`${API_URL}${prefix}/get-monitor`, {
        headers: getHeaders(), 
        params: {
            monitorId: monitorId
        }
      });
}

function getAllUsersMonitors() {
    return axios.get(`${API_URL}${prefix}/get-users-monitors`, {
        headers: getHeaders()
      });
}

function deleteMonitor(monitorId: string) {
    return axios.delete(`${API_URL}${prefix}/delete-monitor`, {
        headers: getHeaders(),
        params: {
            monitorId: monitorId
        }
    });
}

function getScan(monitorId: string, scanId: number) {
    return axios.get(`${API_URL}${prefix}/get-scan`, {
        headers: getHeaders(), 
        params: {
            monitorId: monitorId,
            scanId: scanId
        }
      });
}

function getExistingScans(monitorId: string) {
    return axios.get(`${API_URL}${prefix}/get-existing-scans`, {
        headers: getHeaders(), 
        params: {
            monitorId: monitorId
        }
      });
}