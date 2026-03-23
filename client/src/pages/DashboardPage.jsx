import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [pastes, setPastes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        api.get('/paste')
            .then((res) => setPastes(res.data))
            .catch(() => toast.error('Failed to load pastes'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (slug) => {
        if (!window.confirm('Delete this paste?')) return;
        setDeletingId(slug);
        try {
            await api.delete(`/paste/${slug}`);
            setPastes((prev) => prev.filter((p) => p.slug !== slug));
            toast.success('Paste deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="page fade-in">
            <div className="container">
                <div className="dash-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="text-muted text-sm">Welcome, <strong>{user?.username}</strong></p>
                    </div>
                    <Link to="/" className="btn btn-primary">+ New Paste</Link>
                </div>

                {loading ? (
                    <div className="spinner" />
                ) : pastes.length === 0 ? (
                    <div className="empty-state card">
                        <h3>No pastes yet</h3>
                        <p>Create your first paste to get started.</p>
                        <Link to="/" className="btn btn-primary mt-2">Create Paste</Link>
                    </div>
                ) : (
                    <>
                        <p className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>
                            {pastes.length} paste{pastes.length !== 1 ? 's' : ''}
                        </p>
                        <div className="paste-list">
                            {pastes.map((p) => (
                                <div key={p.slug} className="paste-item card card-sm">
                                    <div className="paste-item-main">
                                        <Link to={`/paste/${p.slug}`} className="paste-item-title">
                                            {p.title || 'Untitled'}
                                        </Link>
                                        <div className="flex gap-1 items-center">
                                            <span className="badge">{p.language}</span>
                                            <span className="text-muted text-xs">{timeAgo(p.createdAt)}</span>
                                            {p.expiresAt && (
                                                <span className="text-xs" style={{ color: 'var(--warning)' }}>
                                                    ⏱ expires
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="paste-item-actions">
                                        <Link
                                            to={`/paste/${p.slug}`}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(p.slug)}
                                            disabled={deletingId === p.slug}
                                            className="btn btn-danger btn-sm"
                                        >
                                            {deletingId === p.slug ? '…' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
