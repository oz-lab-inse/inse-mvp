import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { IdeEvent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { session_id, type, payload } = body;

        if (!session_id || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const event: IdeEvent = {
            ide_event_id: uuidv4(),
            session_id,
            // Convert numeric timestamp to ISO string if needed, or use current time
            timestamp: new Date().toISOString(),
            event_type: type,
            payload: payload || {},
        };

        await db.logEvent(event);
        return NextResponse.json({ success: true, event_id: event.ide_event_id });
    } catch (error) {
        console.error('Log Event Error:', error);
        return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
    }
}
