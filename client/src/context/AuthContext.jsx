import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('snipshare_token');
        const refreshToken = localStorage.getItem('snipshare_refresh_token');
        
        if (token) {
            api.get('/auth/me')
                .then((res) => setUser(res.data))
                .catch(async (err) => {
                    if (err.response?.status === 401 && refreshToken) {
                        try {
                            const res = await api.post('/auth/refresh', { refreshToken });
                            localStorage.setItem('snipshare_token', res.data.accessToken);
                            api.defaults.headers.Authorization = `Bearer ${res.data.accessToken}`;
                            const userRes = await api.get('/auth/me');
                            setUser(userRes.data);
                        } catch {
                            localStorage.removeItem('snipshare_token');
                            localStorage.removeItem('snipshare_refresh_token');
                            setUser(null);
                        }
                    } else {
                        localStorage.removeItem('snipshare_token');
                        localStorage.removeItem('snipshare_refresh_token');
                        setUser(null);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData, token, refreshToken, rememberMe) => {
        localStorage.setItem('snipshare_token', token);
        localStorage.setItem('snipshare_refresh_token', refreshToken || '');
        if (rememberMe) {
            localStorage.setItem('snipshare_rememberMe', 'true');
        }
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('snipshare_token');
        localStorage.removeItem('snipshare_refresh_token');
        localStorage.removeItem('snipshare_rememberMe');
        delete api.defaults.headers.Authorization;
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
