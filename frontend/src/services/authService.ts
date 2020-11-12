import axios from 'axios';
import { UserPasses, User } from '../shared/types';
import { API_URL } from '../constants';

export const authService = {
    login,
    logout,
    register
};

const headers = { headers: { "Content-Type": "application/json" } }

function login(userPasses: UserPasses) {
    const {mail, password} = userPasses;
    return axios.post(`${API_URL}/login`, {
        mail: mail,
        password: password
      },
      headers)
}

function logout() {
    return axios.post(`${API_URL}/logout`,{},
        headers)
}

function register(user: User) {
    const {name, surname, password, mail} = user;
    return axios.post(`${API_URL}/register`, {
        name: name,
        surname: surname,
        password: password,
        mail: mail
    },
    headers)
}