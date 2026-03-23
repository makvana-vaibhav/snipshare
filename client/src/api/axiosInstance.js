import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseUrl = isLocal ? 'http://localhost:5005/api' : 'https://api-snipshare.vaibhavmakvana.in/api';

const api = axios.create({
    baseURL: baseUrl,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('snipshare_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
