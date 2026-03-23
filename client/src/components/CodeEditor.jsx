import { useRef } from 'react';
import './CodeEditor.css';

export default function CodeEditor({ value, onChange, readonly = false }) {
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);

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
    };

    const handleInput = (e) => {
        if (!readonly) {
            onChange(e);
        }
    };

    const handleScroll = (e) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    };

    const lineCount = (value || '').split('\n').length;

    return (
        <div className="code-editor">
            <div className="editor-container">
                <div className="line-numbers" ref={lineNumbersRef} aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i + 1} className="line-number">
                            {i + 1}
                        </div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    name="content"
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    placeholder="Paste your code here..."
                    className="editor-input"
                    spellCheck="false"
                    readOnly={readonly}
                />
            </div>
        </div>
    );
}
