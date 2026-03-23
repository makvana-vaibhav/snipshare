import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';
import './EditPastePage.css';

const LANGUAGES = [
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'markdown', label: 'Markdown' },
];

export default function EditPastePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        language: 'plaintext',
    });

    useEffect(() => {
        const loadPaste = async () => {
            try {
                const res = await api.get(`/paste/${id}`);
                const paste = res.data;

                if (!user || !paste.userId || paste.userId !== (user._id || user.id)) {
                    toast.error('Not authorized to edit this snippet');
                    navigate(`/paste/${id}`);
                    return;
                }

                setForm({
                    title: paste.title || '',
                    content: paste.content || '',
                    language: paste.language || 'plaintext',
                });
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load snippet');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadPaste();
    }, [id, navigate, user]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleContentChange = (e) => {
        setForm((prev) => ({ ...prev, content: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.content.trim()) {
            toast.error('Content cannot be empty');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/paste/${id}`, {
                title: form.title,
                content: form.content,
                language: form.language,
            });
            toast.success('Snippet updated');
            navigate(`/paste/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update snippet');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

    return (
        <div className="page fade-in">
            <div className="container">
                <div className="card edit-card">
                    <h1 className="edit-title">Edit Snippet</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Title (optional)</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={200}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="language">Language</label>
                            <select id="language" name="language" value={form.language} onChange={handleChange}>
                                {LANGUAGES.map((l) => (
                                    <option key={l.value} value={l.value}>{l.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">Content <span className="text-danger">*</span></label>
                            <CodeEditor
                                value={form.content}
                                onChange={handleContentChange}
                                language={form.language}
                            />
                        </div>

                        <div className="edit-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/paste/${id}`)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
