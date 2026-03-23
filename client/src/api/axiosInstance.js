import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const fallbackBaseUrl = isLocal ? 'http://localhost:5005/api' : 'https://api-snipshare.vaibhavmakvana.in/api';

const api = axios.create();

api.interceptors.request.use((config) => {
    // Manually stitch the URL to bypass Axios dropping the /api prefix
    const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
    config.url = `${fallbackBaseUrl}${path}`;

    const token = localStorage.getItem('snipshare_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
