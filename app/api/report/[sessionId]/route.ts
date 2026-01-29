import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateReport } from '@/lib/scoring';

export async function GET(req: NextRequest, props: { params: Promise<{ sessionId: string }> }) {
    const params = await props.params;
    const sessionId = params.sessionId;

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await db.getSession(sessionId);
    if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const events = await db.getEvents(sessionId);
    const { report, metrics } = calculateReport(sessionId, events);

    return NextResponse.json({
        session,
        events,
        report,
        metrics
    });
}
