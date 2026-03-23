import { useCallback, useEffect, useMemo, useRef } from 'react';
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
    const lineNumbersRef = useRef(null);
    const scrollerRef = useRef(null);

    // Sync line numbers scroll when the editor scrolls
    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const onScroll = () => {
            if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = scroller.scrollTop;
            }
        };

        // The editor's inner scrollable div is the one we injected via ref
        scroller.addEventListener('scroll', onScroll, { passive: true });
        return () => scroller.removeEventListener('scroll', onScroll);
    }, []);

    const prismLang = useMemo(() => LANG_MAP[language] || 'none', [language]);

    const escapeHtml = (code) =>
        code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const highlight = useCallback((code) => {
        try {
            if (prismLang === 'none' || !Prism.languages[prismLang]) {
                return escapeHtml(code);
            }
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
        <div className="code-editor">
            <div className="editor-gutter" ref={lineNumbersRef} aria-hidden="true">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i + 1} className="editor-line-number">{i + 1}</div>
                ))}
            </div>
            {/* This outer div becomes the scroll container */}
            <div className="editor-scroll-area" ref={scrollerRef}>
                <Editor
                    value={value}
                    onValueChange={handleInput}
                    highlight={highlight}
                    padding={12}
                    placeholder="Write your snippet here..."
                    textareaId="content"
                    className="editor-input"
                    style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        lineHeight: 1.65,
                        minHeight: '100%',
                    }}
                    readOnly={readonly}
                />
            </div>
        </div>
    );
}
