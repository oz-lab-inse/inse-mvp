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

    const handleEditorChange = (value: string | undefined) => {
        if (value === undefined) return;

        setCode(value);
        onCodeChange(value);

        // Debounce logic would go here
        // For now we assume logging is handled by parent or specific triggers
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
