import { useCallback } from 'react';

// Using 'any' for payload to be flexible, but logEvent expects mapped types in types.ts
export function useAssessmentLogger(sessionId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logEvent = useCallback(async (type: string, payload: any) => {
        try {
            if (!sessionId) return;

            const body = {
                session_id: sessionId,
                type, // API expects 'type' in body, which maps to 'event_type' in DB
                payload,
                ts: Date.now(), // API expects 'ts' legacy or just handles timestamp gen
            };

            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error('Failed to log event:', error);
        }
    }, [sessionId]);

    return { logEvent };
}
