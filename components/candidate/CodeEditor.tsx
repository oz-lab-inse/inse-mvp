'use client';

import Editor, { OnMount } from '@monaco-editor/react';
import { useRef, useState } from 'react';

interface CodeEditorProps {
    initialCode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logEvent: (type: string, payload: any) => void;
    onCodeChange: (code: string) => void;
}

export default function CodeEditor({ initialCode = '// Write your code here...', logEvent, onCodeChange }: CodeEditorProps) {
    const editorRef = useRef(null);
    const [code, setCode] = useState(initialCode);

    const lastLoggedCode = useRef(initialCode);

    const handleEditorChange = (value: string | undefined) => {
        if (value === undefined) return;

        setCode(value);
        onCodeChange(value);

        // Debounced Event Logging for CODE_EDIT
        const timeout = setTimeout(() => {
            if (value !== lastLoggedCode.current) {
                const delta = value.length - lastLoggedCode.current.length;
                // Heuristic: If delta is very large, it might be a paste, 
                // but the taxonomy says "Keyboard input (Not Copy Paste)".
                // For now, we log it as CODE_EDIT if it's a reasonable change.
                if (Math.abs(delta) < 500) {
                    logEvent('CODE_EDIT', {
                        length_delta: delta,
                        content_preview: value.substring(0, 50)
                    });
                }
                lastLoggedCode.current = value;
            }
        }, 2000);

        return () => clearTimeout(timeout);
    };

    const handleMount: OnMount = (editor, monaco) => {
        // editorRef.current = editor;
    };

    return (
        <div className="h-full w-full border rounded-md overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue={initialCode}
                theme="vs-dark"
                onChange={handleEditorChange}
                onMount={handleMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                }}
            />
        </div>
    );
}
