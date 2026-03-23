import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import CodeBlock from '../components/CodeBlock';
import CopyButton from '../components/CopyButton';
import useSEO from '../hooks/useSEO';
import './PasteViewPage.css';

function formatDate(iso) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function formatExpiry(expiresAt) {
    if (!expiresAt) return 'Never';
    const diff = new Date(expiresAt) - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export default function PasteViewPage() {
    useSEO('View Snippet - SnipShare', 'Enter your 6-digit code to securely load a shared snippet. Quick note sharing and code retrieval made easy and perfectly formatted.');
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [paste, setPaste] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordRequired, setPasswordRequired] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    useEffect(() => {
        fetchPaste();
    }, [id]);

    const fetchPaste = async () => {
        try {
            const params = password ? { password } : {};
            const res = await api.get(`/paste/${id}`, { params });
            setPaste(res.data);
            setPasswordRequired(false);
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                setPasswordRequired(true);
                setError('This paste is password protected.');
            } else if (status === 410) {
                setError('This snippet has expired.');
            } else if (status === 404) {
                setError('Snippet not found.');
            } else {
                setError('Failed to load snippet.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            toast.error('Please enter a password');
            return;
        }
        setSubmittingPassword(true);
        try {
            const res = await api.get(`/paste/${id}`, { params: { password } });
            setPaste(res.data);
            setPasswordRequired(false);
            toast.success('Access granted');
        } catch (err) {
            toast.error('Incorrect password');
        } finally {
            setSubmittingPassword(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this paste?')) return;
        setDeleting(true);
        try {
            await api.delete(`/paste/${id}`);
            toast.success('Snippet deleted');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
            setDeleting(false);
        }
    };

    const handleEdit = () => {
        navigate(`/paste/${id}/edit`);
    };

    if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

    if (passwordRequired) {
        return (
            <div className="page fade-in">
                <div className="container">
                    <div className="password-gate card text-center">
                        <div className="password-icon">🔒</div>
                        <h2>{error}</h2>
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            <input
                                type="password"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary" disabled={submittingPassword}>
                                {submittingPassword ? 'Verifying…' : 'Unlock'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page fade-in">
                <div className="container">
                    <div className="error-state card text-center">
                        <div className="error-icon">⚠</div>
                        <h2>{error}</h2>
                        <p className="text-muted mt-1">The snippet might have expired or never existed.</p>
                        <Link to="/" className="btn btn-primary mt-2">Create New Snippet</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = user && paste?.userId && paste.userId === (user._id || user.id);

    return (
        <div className="page fade-in">
            <div className="container">
                {/* Header */}
                <div className="paste-header card card-sm">
                    <div className="paste-title-row">
                        <div>
                            <h1 className="paste-title">{paste.title || 'Untitled'}</h1>
                            <div className="paste-meta flex gap-1 items-center">
                                <span className="badge">{paste.language}</span>
                                {typeof paste.viewCount === 'number' && (
                                    <>
                                        <span className="text-muted text-sm">·</span>
                                        <span className="text-muted text-sm">👁 {paste.viewCount}</span>
                                    </>
                                )}
                                <span className="text-muted text-sm">·</span>
                                <span className="text-muted text-sm">{formatDate(paste.createdAt)}</span>
                                {paste.expiresAt && (
                                    <>
                                        <span className="text-muted text-sm">·</span>
                                        <span className="text-sm expiry-badge">
                                            ⏱ {formatExpiry(paste.expiresAt)}
                                        </span>
                                    </>
                                )}
                                {paste.selfDestruct && (
                                    <>
                                        <span className="text-muted text-sm">·</span>
                                        <span className="text-sm expiry-badge">💥 Auto-destruct</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="paste-actions">
                            <CopyButton text={paste.slug} label="Code" />
                            <CopyButton text={window.location.href} label="Link" />
                            <CopyButton text={paste.content} label="Content" />
                            {isOwner && (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="btn btn-danger btn-sm"
                                    >
                                        {deleting ? 'Deleting…' : 'Delete'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Code */}
                <div className="paste-code">
                    <CodeBlock content={paste.content} language={paste.language} />
                </div>

                {/* Footer */}
                <div className="paste-footer">
                    <Link to="/" className="btn btn-secondary btn-sm">+ New Snippet</Link>
                    <div className="share-url flex gap-1 items-center">
                        <span className="text-muted text-sm">Snippet Code:</span>
                        <span className="text-muted text-sm font-mono" style={{ color: 'var(--text)', fontSize: '1.05rem', letterSpacing: '0.1rem' }}>{paste.slug}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
