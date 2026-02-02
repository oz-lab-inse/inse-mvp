'use client';

import { useState, use, useEffect } from 'react';
import { useAssessmentLogger } from '@/hooks/useAssessmentLogger';
import CodeEditor from '@/components/candidate/CodeEditor';
import ChatPanel from '@/components/candidate/ChatPanel';
import { Play, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { TASKS, Task, TestCase } from '@/lib/tasks';

export default function CandidatePage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const { logEvent } = useAssessmentLogger(sessionId);

    // For MVP, we'll just pick the first task
    const currentTask = TASKS[0];

    const [code, setCode] = useState(currentTask.starter_code);
    const [output, setOutput] = useState<{ type: 'info' | 'error' | 'success'; message: string; results?: any[] } | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds

    // Timer Logic (TIME_UP)
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    logEvent('TIME_UP', { reason: 'Duration exceeded' });
                    alert('Time is up!');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [logEvent]);

    // Track tab visibility / Focus Lost (LEAVE_TAB)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleBlur = () => logEvent('LEAVE_TAB', { url: window.location.href });
            window.addEventListener('blur', handleBlur);
            return () => window.removeEventListener('blur', handleBlur);
        }
    }, [logEvent]);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput({ type: 'info', message: 'Running test cases...' });

        const results: any[] = [];
        let passedCount = 0;

        try {
            for (const tc of currentTask.test_cases) {
                // Determine if we should include session_id for logging
                const res = await fetch('http://localhost:8000/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: code,
                        stdin: tc.input,
                        timeout_ms: 3000,
                        session_id: sessionId,
                        mode: 'TEST'
                    }),
                });

                if (!res.ok) throw new Error('Failed to connect to execution server');

                const data = await res.json();
                const actualOutput = data.stdout.trim();
                const passed = actualOutput === tc.expected_output.trim();

                if (passed) passedCount++;

                results.push({
                    tc_id: tc.id,
                    passed,
                    input: tc.input,
                    expected: tc.expected_output,
                    actual: actualOutput,
                    hidden: tc.hidden,
                    error: data.stderr
                });
            }

            const passRate = passedCount / currentTask.test_cases.length;
            const eventType = passRate === 1.0 ? 'TEST_PASS' : 'TEST_FAIL';

            logEvent(eventType as any, {
                pass_rate: passRate,
                passed_count: passedCount,
                total_count: currentTask.test_cases.length,
                results: results.map(r => ({ tc_id: r.tc_id, passed: r.passed }))
            });

            // Also log RUN_SUCCEED since we got results for all
            logEvent('RUN_SUCCEED' as any, { duration_ms: 0 });

            if (passRate === 1.0) {
                setOutput({ type: 'success', message: 'All Tests Passed!', results });
            } else {
                setOutput({ type: 'error', message: `${passedCount}/${currentTask.test_cases.length} Tests Passed`, results });
            }
        } catch (error: any) {
            setOutput({ type: 'error', message: `Execution Error: ${error.message}` });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!confirm('Are you sure you want to submit?')) return;
        logEvent('END_SESSION' as any, { final_code: code });
        alert('Assessment Submitted! Thank you.');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            {/* Left: Problem Description */}
            <div className="w-1/4 min-w-[300px] border-r border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
                    <h1 className="font-bold text-lg text-white">INSE MVP</h1>
                    <div className="text-sm font-mono text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-zinc-300 leading-relaxed">
                    <h2 className="text-xl font-semibold text-white">{currentTask.title}</h2>
                    <p>{currentTask.description}</p>
                    <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 font-mono text-sm space-y-2">
                        <div className="text-xs text-zinc-500 uppercase">Example</div>
                        <div>Input: "{currentTask.test_cases[0].input}"</div>
                        <div>Output: "{currentTask.test_cases[0].expected_output}"</div>
                    </div>
                </div>
            </div>

            {/* Middle: Code Editor & Console */}
            <div className="flex-1 flex flex-col min-w-[400px]">
                <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between">
                    <span className="text-sm text-zinc-400">solution.py</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                            RUN TEST
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                            SUBMIT
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-[#1e1e1e]">
                    <CodeEditor initialCode={code} logEvent={logEvent} onCodeChange={setCode} />
                </div>
                <div className="h-1/3 min-h-[150px] border-t border-zinc-800 bg-zinc-900 flex flex-col">
                    <div className="px-4 py-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between">
                        <span>Console Output</span>
                    </div>
                    <div className="p-4 font-mono text-sm overflow-auto space-y-2">
                        {output && (
                            <div className={`mb-4 px-3 py-2 rounded border ${output.type === 'error' ? 'bg-red-400/10 border-red-400/20 text-red-400' :
                                    output.type === 'success' ? 'bg-green-400/10 border-green-400/20 text-green-400' :
                                        'bg-blue-400/10 border-blue-400/20 text-blue-400'
                                }`}>
                                {output.message}
                            </div>
                        )}
                        {output?.results?.map((res, i) => (
                            <div key={i} className={`text-xs p-2 rounded flex justify-between items-center ${res.passed ? 'bg-green-400/5 text-green-500/80' : 'bg-red-400/5 text-red-500/80'}`}>
                                <span>Test Case #{i + 1} {res.hidden ? '(Hidden)' : ''}</span>
                                <span className="font-bold">{res.passed ? 'PASS' : 'FAIL'}</span>
                            </div>
                        ))}
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
