import fs from 'fs';
import path from 'path';
import { Session, IdeEvent, AiInteraction, CodeRun } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
const EVENTS_DIR = path.join(DATA_DIR, 'events');

// Ensure directories exist
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}
if (!fs.existsSync(EVENTS_DIR)) {
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
}

export const db = {
    createSession: async (session: Session): Promise<void> => {
        const filePath = path.join(SESSIONS_DIR, `${session.session_id}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(session, null, 2));
    },

    getSession: async (sessionId: string): Promise<Session | null> => {
        const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
        if (!fs.existsSync(filePath)) return null;
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    },

    getAllSessions: async (): Promise<Session[]> => {
        const files = await fs.promises.readdir(SESSIONS_DIR);
        const sessions = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(SESSIONS_DIR, file);
                const data = await fs.promises.readFile(filePath, 'utf-8');
                return JSON.parse(data);
            })
        );
        return sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    },

    logEvent: async (event: IdeEvent): Promise<void> => {
        const filePath = path.join(EVENTS_DIR, `${event.session_id}.jsonl`);
        const line = JSON.stringify(event) + '\n';
        await fs.promises.appendFile(filePath, line);
    },

    getEvents: async (sessionId: string): Promise<IdeEvent[]> => {
        const filePath = path.join(EVENTS_DIR, `${sessionId}.jsonl`);
        if (!fs.existsSync(filePath)) return [];
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return data
            .trim()
            .split('\n')
            .map((line) => JSON.parse(line));
    },

    // NOTE: For MVP file-system, we are storing "AI interactions" and "Code Runs" as generic Events with 'type'.
    // But to support the Schema strictly in the future, we would separate them.
    // The 'getEvents' above returns everything. 
};
