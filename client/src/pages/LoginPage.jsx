import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';
import './AuthPage.css';

export default function LoginPage() {
    useSEO('Login - Manage SnipShare Account', 'Log in to your SnipShare dashboard to track snippet views, manage expiration times, and review your online code sharing history.');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
    const [loading, setLoading] = useState(false);
    const [sendingVerification, setSendingVerification] = useState(false);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm((p) => ({
            ...p,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            login(res.data, res.data.accessToken, res.data.refreshToken, form.rememberMe);
            toast.success(`Welcome back, ${res.data.username}!`);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
                toast.error('Please verify your email first.');
                return;
            }
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!form.email) {
            toast.error('Enter your email first');
            return;
        }
        setSendingVerification(true);
        try {
            const res = await api.post('/auth/resend-verification', { email: form.email });
            toast.success(res.data?.message || 'Verification email sent');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send verification email');
        } finally {
            setSendingVerification(false);
        }
    };

    return (
        <div className="page fade-in">
            <div className="auth-container">
                <div className="card auth-card">
                    <div className="auth-header">
                        <h1>Welcome back</h1>
                        <p className="text-muted">Sign in to manage your pastes</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email" name="email" type="email"
                                placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password" name="password" type="password"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={form.rememberMe}
                                    onChange={handleChange}
                                />
                                Remember me for 7 days
                            </label>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-full mt-1"
                            onClick={handleResendVerification}
                            disabled={sendingVerification}
                        >
                            {sendingVerification ? 'Sending…' : 'Resend verification email'}
                        </button>
                    </form>
                    <p className="auth-footer">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
