'use client';

import { useState, use } from 'react';
import { useAssessmentLogger } from '@/hooks/useAssessmentLogger';
import CodeEditor from '@/components/candidate/CodeEditor';
import ChatPanel from '@/components/candidate/ChatPanel';
import { Play, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CandidatePage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const { logEvent } = useAssessmentLogger(sessionId);
    const [code, setCode] = useState('// Write a function to reverse a string.\nfunction solution(str) {\n  \n}');
    const [output, setOutput] = useState<{ type: 'info' | 'error' | 'success'; message: string } | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [testCount, setTestCount] = useState(0);

    const handleRun = async () => {
        setIsRunning(true);
        const startTime = Date.now();
        setOutput({ type: 'info', message: 'Running tests...' });

        // Mock Execution Logic for MVP
        setTimeout(() => {
            const duration = Date.now() - startTime;
            const isActuallySuccess = code.length > 50 + (testCount * 10); // Simulate improvement requirement
            const passRate = isActuallySuccess ? 1.0 : Math.min(0.9, 0.2 + (code.length / 200));

            const payload = {
                exec_type: 'TEST',
                status: isActuallySuccess ? 'SUCCESS' : 'FAIL',
                duration_ms: duration,
                failure_fingerprint_summary: isActuallySuccess ? '' : 'AssertionError: expected output to match',
                pass_rate: passRate,
            };

            // 1. Log Detailed Run Event
            logEvent('test', payload);

            if (isActuallySuccess) {
                setOutput({ type: 'success', message: `All Tests Passed! (Pass Rate: ${Math.round(passRate * 100)}%)` });
            } else {
                setOutput({ type: 'error', message: `Test Failed (Pass Rate: ${Math.round(passRate * 100)}%)\n${payload.failure_fingerprint_summary}` });
            }

            setTestCount(prev => prev + 1);
            setIsRunning(false);
        }, 1000);
    };

    const handleSubmit = async () => {
        if (!confirm('Are you sure you want to submit?')) return;
        logEvent('submit', { final_code: code });
        alert('Assessment Submitted! Thank you.');
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            {/* Left: Problem Description */}
            <div className="w-1/4 min-w-[300px] border-r border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900">
                    <h1 className="font-bold text-lg text-white">Challenge #1: String Reversal</h1>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-zinc-300 leading-relaxed">
                    <p>Write a function that reverses a given string.</p>
                    <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 font-mono text-sm">
                        Input: "hello"<br />Output: "olleh"
                    </div>
                </div>
            </div>

            {/* Middle: Code Editor & Console */}
            <div className="flex-1 flex flex-col min-w-[400px]">
                <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between">
                    <span className="text-sm text-zinc-400">solution.js</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Play size={16} /> Run Test
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                            Submit
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-[#1e1e1e]">
                    <CodeEditor initialCode={code} logEvent={logEvent} onCodeChange={setCode} />
                </div>
                <div className="h-1/3 min-h-[150px] border-t border-zinc-800 bg-zinc-900 flex flex-col">
                    <div className="px-4 py-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Console Output</div>
                    <div className="p-4 font-mono text-sm overflow-auto">
                        {output && (
                            <div className={`flex items-start gap-2 ${output.type === 'error' ? 'text-red-400' : output.type === 'success' ? 'text-green-400' : 'text-zinc-300'}`}>
                                {output.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: AI Chat */}
            <div className="w-[350px] border-l border-zinc-800 bg-zinc-900">
                <ChatPanel logEvent={logEvent} />
            </div>
        </div>
    );
}
