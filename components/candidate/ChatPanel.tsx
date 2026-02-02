'use client';

import { useState } from 'react';
import { Send, Bot } from 'lucide-react';

interface ChatPanelProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logEvent: (type: string, payload: any) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPanel({ logEvent }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you regarding this problem?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Determine Taxonomy Event Type
        let eventType = 'ASK_AI';
        const hasDebugKeywords = /debug|fix/i.test(input);

        // 1. Send Request to Back-end
        const startTime = Date.now();
        try {
            const res = await fetch('http://localhost:8000/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    model: 'gemini-3-flash-preview'
                }),
            });

            if (!res.ok) throw new Error('AI API Error');

            const data = await res.json();
            const responseText = data.assistant;
            const latency = Date.now() - startTime;

            // Simple token estimation (4 chars per token)
            const inToken = Math.ceil(input.length / 4);
            const outToken = Math.ceil(responseText.length / 4);

            // Heuristic for categorization
            const isCodeResponse = responseText.includes('```') || /function|const|let|var|return/i.test(responseText);

            if (hasDebugKeywords) {
                eventType = 'DEBUG_CODE_AI';
            } else if (isCodeResponse) {
                eventType = 'GENERATE_CODE_AI';
            } else {
                eventType = 'ASK_AI';
            }

            logEvent(eventType as any, {
                prompt: input,
                response: responseText,
                latency_ms: latency,
                in_token: inToken,
                out_token: outToken,
                provider: 'gemini-3-flash'
            });

            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to connect to AI assistant.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900 border-l dark:border-zinc-800">
            <div className="p-4 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h2 className="font-semibold flex items-center gap-2">
                    <Bot size={20} /> AI Assistant
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-zinc-800 border dark:border-zinc-700'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-gray-500 text-center">Thinking...</div>}
            </div>

            <div className="p-4 border-t dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex gap-2">
                    <input
                        className="flex-1 px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
