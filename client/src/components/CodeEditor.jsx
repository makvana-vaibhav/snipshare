import { useEffect, useMemo, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import './CodeEditor.css';

const LANG_MAP = {
    plaintext: 'none',
    html: 'markup',
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'csharp',
    go: 'go',
    rust: 'rust',
    ruby: 'ruby',
    php: 'php',
    swift: 'swift',
    kotlin: 'kotlin',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    sql: 'sql',
    bash: 'bash',
    markdown: 'markdown',
};

export default function CodeEditor({ value, onChange, language = 'plaintext', readonly = false }) {
    const editorWrapRef = useRef(null);
    const lineNumbersRef = useRef(null);

    useEffect(() => {
        const root = editorWrapRef.current;
        if (!root) return;

        const textarea = root.querySelector('.npm__react-simple-code-editor__textarea');
        if (!textarea) return;

        const syncScroll = () => {
            if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = textarea.scrollTop;
            }
        };

        textarea.addEventListener('scroll', syncScroll);
        return () => textarea.removeEventListener('scroll', syncScroll);
    }, []);

    const prismLang = useMemo(() => LANG_MAP[language] || 'none', [language]);

    const escapeHtml = (code) => code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const highlight = (code) => {
        try {
            if (prismLang === 'none' || !Prism.languages[prismLang]) {
                return escapeHtml(code);
            }

            return Prism.highlight(code, Prism.languages[prismLang], prismLang);
        } catch (err) {
            return escapeHtml(code);
        }
    };

    const handleInput = (nextValue) => {
        if (readonly) return;
        onChange({ target: { name: 'content', value: nextValue } });
    };

    const lineCount = (value || '').split('\n').length;

    return (
        <div className="code-editor" ref={editorWrapRef}>
            <div className="editor-container">
                <div className="line-numbers" ref={lineNumbersRef} aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i + 1} className="line-number">
                            {i + 1}
                        </div>
                    ))}
                </div>
                <Editor
                    value={value}
                    onValueChange={handleInput}
                    highlight={highlight}
                    padding={12}
                    placeholder="Paste your code here..."
                    textareaId="content"
                    className="editor-input"
                    style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 14,
                        lineHeight: 1.65,
                    }}
                    readOnly={readonly}
                />
            </div>
        </div>
    );
}
