import axios from 'axios';
import { API_URL } from '../constants';


export const monitorService = {
    getPageToMonitor
};

const headers = {
    headers: { 
       'Content-Type': 'application/json',
       'Authorization': localStorage.getItem('token')
   }
}

const prefix = '/monitors'

function getPageToMonitor(webpageAdress: string) {
    return axios.get(`${API_URL}${prefix}/page-to-monitor`, {
        ...headers, 
        params: {
            adress: webpageAdress
        }
      });
}
