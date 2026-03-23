import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">✦</span>
                    <span className="brand-name">SnipShare</span>
                </Link>

                <nav className="navbar-nav">
                    <Link to="/" className="nav-link btn btn-primary btn-sm hide-sm">
                        + New Paste
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
