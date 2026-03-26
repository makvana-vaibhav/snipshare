import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
                    <NavLink to="/" end className="nav-link btn btn-primary btn-sm new-snippet-btn">
                        + New Snippet
                    </NavLink>
                    {user ? (
                        <>
                            <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="nav-link hide-mobile-login">Login</NavLink>
                            <Link to="/signup" className="btn btn-secondary btn-sm">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
