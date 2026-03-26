import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import useSEO from '../hooks/useSEO';
import './AuthPage.css';

export default function SignupPage() {
    useSEO('Sign Up - Secure Online Snippet Tool', 'Create a free SnipShare account to manage and edit your snippets securely. The perfect utility to share code online and track your notes.');
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
            toast.error(res.data?.message || 'Account created. Please verify your email before login.');
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Signup failed';

            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                toast.error('Signup timed out. Please check your backend and SMTP settings.');
                return;
            }
            if (!err.response) {
                // This could be a CORS issue caused by 502/504
                toast.error('Network error. This may be a server-side error blocked by CORS (e.g. SMTP failure).');
                return;
            }
            toast.error(errorMessage);
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
                    <form onSubmit={handleSubmit} autoComplete="on">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username" name="username" type="text"
                                placeholder="coolcoder"
                                value={form.username} onChange={handleChange}
                                autoComplete="username"
                                minLength={3} maxLength={30} required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email" name="email" type="email"
                                placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password" name="password" type="password"
                                placeholder="Min. 6 characters"
                                value={form.password} onChange={handleChange}
                                autoComplete="new-password"
                                minLength={6} required
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
