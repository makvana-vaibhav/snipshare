import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import CodeEditor from '../components/CodeEditor';
import './HomePage.css';

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

const EXPIRY_OPTIONS = [
    { value: 'never', label: 'Never' },
    { value: '1hour', label: '1 Hour' },
    { value: '1day', label: '1 Day' },
    { value: '1week', label: '1 Week' },
];

// Language detection based on content patterns
const detectLanguage = (content) => {
    if (!content) return 'plaintext';

    const patterns = {
        javascript: /(?:const|let|var|function|=>|console\.log|import|export)/,
        python: /(?:def |import |class |print\(|if __name__|:$)/m,
        java: /(?:public class |import java|void main|new |String\[\])/,
        html: /<!DOCTYPE|<html>|<head>|<body>/i,
        css: /(?:@media|@keyframes|{[\s\S]*?:[\s\S]*?;})/,
        json: /^\s*{[\s\S]*}\s*$|^\s*\[[\s\S]*\]\s*$/,
        sql: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\s/i,
        bash: /#!\/bin\/bash|^export |^alias /m,
        php: /<\?php|echo |function /,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(content)) return lang;
    }

    return 'plaintext';
};

export default function HomePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        content: '',
        language: 'plaintext',
        expiry: 'never',
        isPublic: false,
        password: '',
        selfDestruct: false,
    });
    const [loading, setLoading] = useState(false);
    const [pasteCode, setPasteCode] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleContentChange = (e) => {
        const content = e.target.value;
        const detected = detectLanguage(content);
        setForm((prev) => ({
            ...prev,
            content,
            language: detected !== 'plaintext' ? detected : prev.language,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.content.trim()) {
            toast.error('Content cannot be empty');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/paste', form);
            toast.success('Paste created!');
            navigate(`/paste/${res.data.slug}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create paste');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (pasteCode.trim()) {
            navigate(`/paste/${pasteCode.trim()}`);
        }
    };

    return (
        <div className="page fade-in">
            <div className="container">
                <div className="home-hero">
                    <h1>Share code <span className="hero-accent">instantly</span></h1>
                    <p className="hero-sub">Paste, share, and view code snippets with syntax highlighting.</p>

                    <form onSubmit={handleJoin} className="join-form">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code..."
                            value={pasteCode}
                            onChange={(e) => setPasteCode(e.target.value)}
                            maxLength={10}
                        />
                        <button type="submit" className="btn btn-secondary" disabled={!pasteCode.trim()}>
                            Get Paste
                        </button>
                    </form>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Title (optional)</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="Give your snippet a title..."
                                value={form.title}
                                onChange={handleChange}
                                maxLength={200}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="language">Language</label>
                                <select id="language" name="language" value={form.language} onChange={handleChange}>
                                    {LANGUAGES.map((l) => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expiry">Expires</label>
                                <select id="expiry" name="expiry" value={form.expiry} onChange={handleChange}>
                                    {EXPIRY_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">Content <span className="text-danger">*</span></label>
                            <CodeEditor
                                value={form.content}
                                onChange={handleContentChange}
                                language={form.language}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? '▼ Advanced Options' : '▶ Advanced Options'}
                        </button>

                        {showAdvanced && (
                            <div className="advanced-options">
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={form.isPublic}
                                            onChange={handleChange}
                                        />
                                        Make Public (shareable)
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="selfDestruct"
                                            checked={form.selfDestruct}
                                            onChange={handleChange}
                                        />
                                        Self-destruct after first view
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password Protect (optional)</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Leave blank for no password"
                                        value={form.password}
                                        onChange={handleChange}
                                        maxLength={50}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-actions">
                            <span className="text-xs text-muted">
                                {form.content.length.toLocaleString()} chars
                            </span>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? 'Creating…' : '✦ Create Paste'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
