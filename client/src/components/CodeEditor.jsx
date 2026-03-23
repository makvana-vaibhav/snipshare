import { useRef } from 'react';
import './CodeEditor.css';

export default function CodeEditor({ value, onChange, readonly = false }) {
    const textareaRef = useRef(null);
    const gutterRef = useRef(null);

    const handleScroll = () => {
        if (gutterRef.current && textareaRef.current) {
            // Sync the gutter's vertical scroll with the textarea's scroll position
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const handleKeyDown = (e) => {
        // Support pressing TAB to insert spaces instead of shifting focus
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = value.substring(0, start) + '    ' + value.substring(end);

            // Trigger standard change event simulation
            onChange({ target: { name: 'content', value: newValue } });

            // Restore cursor position after state update
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                }
            }, 0);
        }
    };

    const handleInput = (e) => {
        if (readonly) return;
        onChange(e);
    };

    const lineCount = Math.max(1, (value || '').split('\n').length);

    return (
        <div className="code-editor-wrap">
            <div className="ce-gutter" ref={gutterRef} aria-hidden="true">
                {Array.from({ length: Math.max(lineCount, 50) }, (_, i) => (
                    <div key={i} className="ce-line-no">{i + 1}</div>
                ))}
            </div>
            <textarea
                ref={textareaRef}
                name="content"
                className="ce-textarea"
                value={value}
                onChange={handleInput}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                placeholder="Write your snippet here..."
                readOnly={readonly}
                spellCheck={false}
                autoComplete="off"
            />
        </div>
    );
}
