import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const fallbackBaseUrl = isLocal ? 'http://localhost:5000/api' : 'https://api-snipshare.vaibhavmakvana.in/api';

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

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('snipshare_refresh_token');

            if (refreshToken) {
                try {
                    const res = await axios.post(`${fallbackBaseUrl}/auth/refresh`, { refreshToken });
                    const newAccessToken = res.data.accessToken;
                    localStorage.setItem('snipshare_token', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (err) {
                    localStorage.removeItem('snipshare_token');
                    localStorage.removeItem('snipshare_refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
