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

        // 1. Log the AI Call
        logEvent('ai_call', {
            prompt: input,
            provider: 'mock-ai',
        });

        // 2. Simulate AI Response (Mock for MVP)
        setTimeout(() => {
            const responseText = `(Mock AI Response) That's a great question about "${input}". Have you considered checking edge cases?`;
            const aiMsg: Message = { role: 'assistant', content: responseText };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1000);
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
