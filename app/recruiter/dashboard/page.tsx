'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/lib/types';
import Link from 'next/link';
import { Calendar, User, Code } from 'lucide-react';

export default function RecruiterDashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        fetch('/api/session')
            .then((res) => res.json())
            .then((data) => setSessions(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 dark:text-zinc-100">Recruiter Dashboard</h1>

                <div className="grid gap-4">
                    {sessions.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            No sessions found. Share the assessment link to candidates.
                        </div>
                    )}
                    {sessions.map((session) => (
                        <Link
                            href={`/recruiter/report/${session.session_id}`}
                            key={session.session_id}
                            className="block bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold dark:text-zinc-100 flex items-center gap-2">
                                        <User size={20} className="text-blue-500" />
                                        {session.candidate_id}
                                    </h2>
                                    <div className="text-sm text-zinc-500 mt-1 flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Code size={14} /> {session.task_id}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(session.started_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${session.status === 'submitted' ? 'bg-green-100 text-green-700' :
                                        session.status === 'abandoned' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {session.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
