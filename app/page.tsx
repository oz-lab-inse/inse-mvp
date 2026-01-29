'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: 'candidate-' + Math.floor(Math.random() * 1000) }),
      });
      const data = await res.json();
      router.push(`/candidate/${data.session_id}`);
    } catch (e) {
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tighter">INSE MVP</h1>
        <p className="text-zinc-400 text-lg">Process over Result. Assessment Platform.</p>

        <div className="space-y-4">
          <button
            onClick={startSession}
            disabled={loading}
            className="w-full py-4 bg-white text-indigo-900 rounded-xl font-bold text-xl hover:bg-gray-100 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Candidate Demo'}
          </button>

          <Link href="/recruiter/dashboard" className="block w-full py-4 border border-zinc-700 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors">
            Recruiter Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
