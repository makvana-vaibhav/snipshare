import { useCallback, useMemo } from 'react';
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
    plaintext: 'none', html: 'markup', javascript: 'javascript',
    typescript: 'typescript', python: 'python', java: 'java',
    c: 'c', cpp: 'cpp', csharp: 'csharp', go: 'go', rust: 'rust',
    ruby: 'ruby', php: 'php', swift: 'swift', kotlin: 'kotlin',
    css: 'css', json: 'json', yaml: 'yaml', sql: 'sql',
    bash: 'bash', markdown: 'markdown',
};

export default function CodeEditor({ value, onChange, language = 'plaintext', readonly = false }) {
    const prismLang = useMemo(() => LANG_MAP[language] || 'none', [language]);

    const escapeHtml = (code) =>
        code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const highlight = useCallback((code) => {
        try {
            if (prismLang === 'none' || !Prism.languages[prismLang]) return escapeHtml(code);
            return Prism.highlight(code, Prism.languages[prismLang], prismLang);
        } catch {
            return escapeHtml(code);
        }
    }, [prismLang]);

    const handleInput = (nextValue) => {
        if (readonly) return;
        onChange({ target: { name: 'content', value: nextValue } });
    };

    const lineCount = (value || '').split('\n').length;

    return (
        <div className="code-editor-wrap">
            {/* Gutter */}
            <div className="ce-gutter" aria-hidden="true">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="ce-line-no">{i + 1}</div>
                ))}
            </div>

            {/* Editor — react-simple-code-editor is the scroll container */}
            <div className="ce-body">
                <Editor
                    value={value}
                    onValueChange={handleInput}
                    highlight={highlight}
                    padding={12}
                    placeholder="Write your snippet here..."
                    textareaId="content"
                    className="ce-editor"
                    style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: 14,
                        lineHeight: 1.65,
                    }}
                    readOnly={readonly}
                />
            </div>
        </div>
    );
}
