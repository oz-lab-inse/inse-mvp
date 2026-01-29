import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Session } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { candidate_id, task_id } = body;

        const session: Session = {
            session_id: uuidv4(),
            candidate_id: candidate_id || 'anonymous',
            task_id: task_id || 'default-task-001', // New Schema requires task_id (FK)
            started_at: new Date().toISOString(),
            status: 'active',
        };

        await db.createSession(session);
        return NextResponse.json(session);
    } catch (error) {
        console.error('Create Session Error:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Fix: This is a Route handler, not a Page.
    // Route Handlers in App Router do NOT receive 'params' unless it's a dynamic route segment.
    // APP ROUTER GET Handlers: (req: NextRequest, { params }: { params: { ... } })
    // But wait, this file is `app/api/session/route.ts` (not dynamic).
    // content of previous implementation check:
    // It handles searchParams. So it doesn't need 'params' argument.

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        // Return all sessions
        const sessions = await db.getAllSessions();
        return NextResponse.json(sessions);
    }

    const session = await db.getSession(sessionId);
    if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
}
