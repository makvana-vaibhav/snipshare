import { useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Import common Prism language components
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

// Prism dark theme
import 'prismjs/themes/prism-tomorrow.css';

const LANG_MAP = {
    plaintext: 'none',
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
    html: 'markup',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    sql: 'sql',
    bash: 'bash',
    markdown: 'markdown',
};

export default function CodeBlock({ content, language = 'plaintext' }) {
    const codeRef = useRef(null);

    useEffect(() => {
        if (codeRef.current) {
            try {
                // Ensure Prism grammar exists before highlighting to prevent throws
                const prismLang = LANG_MAP[language] || 'none';
                if (prismLang !== 'none' && !Prism.languages[prismLang]) {
                    console.warn(`Prism grammar not loaded for: ${prismLang}`);
                }
                Prism.highlightElement(codeRef.current);
            } catch (err) {
                console.error("Prism syntax highlight error:", err);
            }
        }
    }, [content, language]);

    const prismLang = LANG_MAP[language] || 'none';
    const langClass = prismLang !== 'none' ? `language-${prismLang}` : '';

    return (
        <div className="code-wrapper">
            <div className="code-scroll">
                <pre className={langClass || 'language-none'} style={{ background: 'transparent' }}>
                    <code ref={codeRef} className={langClass}>
                        {content}
                    </code>
                </pre>
            </div>
        </div>
    );
}
