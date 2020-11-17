import axios from 'axios';
import { API_URL } from '../constants';
import { Monitor } from '../shared/types';


export const monitorService = {
    getPageToMonitor,
    createMonitor
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
