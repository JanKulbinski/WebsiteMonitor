import axios from 'axios';
import { API_URL } from '../constants';
import { Monitor } from '../shared/types';


export const monitorService = {
    getPageToMonitor,
    createMonitor,
    getMonitor,
    getScan
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

function getMonitor(monitorId: string) {
    return axios.get(`${API_URL}${prefix}/get-monitor`, {
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