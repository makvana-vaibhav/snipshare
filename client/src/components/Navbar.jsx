import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('snipshare_theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('snipshare_theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <img src="/favicon.png" alt="SnipShare Logo" className="brand-logo" />
                    <span className="brand-name">SnipShare</span>
                </Link>

                <nav className="navbar-nav">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-sm theme-btn" title="Toggle theme">
                        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
                    </button>
                    <Link to="/" className="nav-link btn btn-primary btn-sm hide-sm">
                        + New Snippet
                    </Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="btn btn-secondary btn-sm">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
