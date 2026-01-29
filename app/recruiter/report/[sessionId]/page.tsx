'use client';

import { useEffect, useState, use } from 'react';
import { Session, IdeEvent, Report, Metric } from '@/lib/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, Clock, Code, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ReportData {
    session: Session;
    events: IdeEvent[];
    report: Report;
    metrics: Metric[];
}

export default function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/report/${sessionId}`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [sessionId]);

    if (loading) return <div className="p-8 text-center text-zinc-400">Analyzing behavior...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Report not found.</div>;

    const { session, report, metrics } = data;

    const chartData = metrics.map(m => ({
        subject: m.name,
        A: m.value,
        fullMark: 100
    }));

    return (
        <div className="min-h-screen bg-zinc-950 p-8 font-sans text-zinc-200">
            <div className="max-w-6xl mx-auto space-y-6">
                <Link href="/recruiter/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>

                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex justify-between items-center shadow-2xl">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Process Integrity Report</h1>
                        <div className="flex gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1"><Code size={16} /> {session.candidate_id}</span>
                            <span className="flex items-center gap-1"><Activity size={16} /> Task: {session.task_id}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Critical Usage</div>
                            <div className="text-4xl font-black text-blue-500">{Math.round(report.overall_score)}</div>
                        </div>
                        <div className="text-right border-l border-zinc-800 pl-8">
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Confidence</div>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${report.confidence > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {report.confidence > 70 ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
                                {Math.round(report.confidence)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-[400px]">
                        <h2 className="text-xl font-semibold mb-4 text-white">Consistency Radar</h2>
                        <ResponsiveContainer width="100%" height="80%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Candidate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-6 text-white tracking-tight">Behavioral Metrics</h2>
                        <div className="space-y-6">
                            {metrics.map(m => (
                                <div key={m.metric_id}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{m.name}</span>
                                        <span className="text-xl font-bold text-white">{Math.round(m.value)}</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${m.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Analysis Insight</h3>
                                <p className="text-sm text-zinc-300 leading-relaxed italic">
                                    {report.overall_score > 70
                                        ? "Candidate shows high evidence responsiveness and consistent improvement loops."
                                        : "Lower loop productivity detected. Frequent failures without corresponding code improvements."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
