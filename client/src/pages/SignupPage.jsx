import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function SignupPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', rememberMe: true });
    const [loading, setLoading] = useState(false);

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
            const res = await api.post('/auth/signup', form);
            login(res.data, res.data.accessToken, res.data.refreshToken, form.rememberMe);
            toast.success(`Account created! Welcome, ${res.data.username}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page fade-in">
            <div className="auth-container">
                <div className="card auth-card">
                    <div className="auth-header">
                        <h1>Create account</h1>
                        <p className="text-muted">Start saving and sharing your snippets</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username" name="username" type="text"
                                placeholder="coolcoder"
                                value={form.username} onChange={handleChange}
                                minLength={3} maxLength={30} required
                            />
                        </div>
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
                                placeholder="Min. 6 characters"
                                value={form.password} onChange={handleChange}
                                minLength={6} required
                            />
                        </div>
                        <div className="form-group">
                            <label>
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
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>
                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
