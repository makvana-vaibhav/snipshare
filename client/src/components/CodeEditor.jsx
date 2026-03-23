import { useState, useRef, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import './CodeEditor.css';

const EDITOR_LANG_MAP = {
    plaintext: 'none',
    html: 'markup',
};

export default function CodeEditor({ value, onChange, language, onLanguageChange, readonly = false }) {
    const [fullscreen, setFullscreen] = useState(false);
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);

    useEffect(() => {
        if (highlightRef.current) {
            highlightRef.current.textContent = value || '';
            Prism.highlightElement(highlightRef.current);
        }
    }, [value, language]);

    const prismLang = EDITOR_LANG_MAP[language] || language || 'none';

    const handleKeyDown = (e) => {
        if (readonly) return;

        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const newValue = value.substring(0, start) + '\t' + value.substring(end);
            onChange({ target: { name: 'content', value: newValue } });

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1;
            }, 0);
        }

        // Cmd/Ctrl + K for fullscreen
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setFullscreen(!fullscreen);
        }
    };

    const handleInput = (e) => {
        if (!readonly) {
            onChange(e);
        }
    };

    const lineCount = (value || '').split('\n').length;

    return (
        <div className={`code-editor ${fullscreen ? 'fullscreen' : ''}`}>
            <div className="editor-header">
                <div className="editor-controls">
                    <button
                        className="btn btn-sm"
                        onClick={() => setFullscreen(!fullscreen)}
                        title="Fullscreen (Ctrl+K)"
                    >
                        {fullscreen ? '↙ Exit' : '↗ Fullscreen'}
                    </button>
                </div>
            </div>

            <div className="editor-container">
                <div className="line-numbers">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i + 1} className="line-number">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <div className="editor-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste your code here..."
                        className="editor-input"
                        spellCheck="false"
                        readOnly={readonly}
                    />
                    <pre className="editor-highlight">
                        <code
                            ref={highlightRef}
                            className={`language-${prismLang}`}
                        />
                    </pre>
                </div>
            </div>
        </div>
    );
}
