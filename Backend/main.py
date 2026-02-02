from __future__ import annotations

import os
import subprocess
import tempfile

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from psycopg_pool import ConnectionPool
import difflib
import time
from contextlib import contextmanager

load_dotenv()

app = FastAPI(title="INSE Python Runner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Gemini Configuration
GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# DB Connection
pool: ConnectionPool | None = None


def init_db() -> None:
    global pool
    db_url = os.environ.get("DATABASE_URL") or "postgresql://postgres:saram1nse001@db.xcymbfpvltvntopbxaym.supabase.co:5432/postgres"
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set")
    pool = ConnectionPool(conninfo=db_url, min_size=1, max_size=10)


def close_db() -> None:
    global pool
    if pool is not None:
        pool.close()
        pool = None


@contextmanager
def get_db():
    if pool is None:
        raise RuntimeError("DB pool not initialized")
    with pool.connection() as conn:
        with conn.cursor() as cur:
            yield conn, cur


@app.on_event("startup")
def _startup():
    init_db()


@app.on_event("shutdown")
def _shutdown():
    close_db()

# Models
class RunRequest(BaseModel):
    code: str = Field(..., description="Python source code")
    prev_code: str | None = Field(None, description="Previous version of code for delta calculation")
    stdin: str = Field("", description="stdin content")
    timeout_ms: int = Field(3000, ge=100, le=30000)
    session_id: str | None = None
    mode: str = "RUN" # "RUN" or "TEST"


class RunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    timed_out: bool


class ChatMessage(BaseModel):
    role: str
    content: str


class AiChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str | None = None
    session_id: str | None = None
    ide_event_id: str | None = None
    latency_ms: int | None = None
    in_token: int | None = None
    out_token: int | None = None


class AiChatResponse(BaseModel):
    assistant: str
    latency_ms: int = 0
    in_token: int = 0
    out_token: int = 0


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-health")
def db_health():
    with get_db() as (_, cur):
        cur.execute("SELECT 1;")
        return {"db_ok": cur.fetchone()[0] == 1}

@app.post("/api/sessions")
def create_session():
    import uuid
    session_id = str(uuid.uuid4())
    # Optionally insert into a sessions table if it exists
    # For now, we just return the UUID
    return {"session_id": session_id}

def insert_ide_event(session_id: str, event_type: str, payload: dict) -> str:
    with get_db() as (conn, cur):
        cur.execute(
            """
            INSERT INTO ide_events (session_id, event_type, payload)
            VALUES (%s, %s, %s)
            RETURNING ide_event_id
            """,
            (session_id, event_type, payload),
        )
        ide_event_id = cur.fetchone()[0]
        conn.commit()
        return ide_event_id


def count_added_lines(prev: str, curr: str) -> int:
    added = 0
    for line in difflib.unified_diff(prev.splitlines(), curr.splitlines()):
        if line.startswith("+") and not line.startswith("+++"):
            added += 1
    return added

def is_syntax_error(stderr: str) -> bool:
    return "syntaxerror" in (stderr or "").lower()

class EventCreate(BaseModel):
    session_id: str
    type: str
    payload: dict
    ts: int

@app.post("/api/events")
def create_event(body: EventCreate):
    ide_event_id = insert_ide_event(
        body.session_id,
        body.type,
        {**body.payload, "client_ts": body.ts},
    )
    return {"ide_event_id": ide_event_id}

@app.post("/run", response_model=RunResponse)
def run_code(body: RunRequest):
    python_exe = os.environ.get("PYTHON_EXECUTABLE") or "python"
    start_ms = int(time.time() * 1000)
    # CODE_EDIT 
    if body.session_id:
        insert_ide_event(
            body.session_id,
            "CODE_EDIT",
            {
                "added_lines": (
                    count_added_lines(body.prev_code, body.code)
                    if body.prev_code is not None
                    else None
                ),
                "total_lines": len(body.code.splitlines()),
            },
        )
        
    with tempfile.TemporaryDirectory(prefix="inse_py_") as tmpdir:
        file_path = os.path.join(tmpdir, "main.py")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(body.code)

        try:
            proc = subprocess.run(
                [python_exe, file_path],
                input=body.stdin,
                text=True,
                capture_output=True,
                timeout=body.timeout_ms / 1000.0,
            )
            # Run Result
            if body.session_id:
                if is_syntax_error(proc.stderr):
                    insert_ide_event(
                        body.session_id,
                        "SYNTAX_ERROR",
                        {"stderr": proc.stderr},
                    )
                else:
                    insert_ide_event(
                        body.session_id,
                        "RUN_SUCCEED",
                        {"exit_code": proc.returncode},
                    )

                if body.mode.upper() == "TEST":
                    insert_ide_event(
                        body.session_id,
                        "TEST_PASS" if proc.returncode == 0 else "TEST_FAIL",
                        {"exit_code": proc.returncode},
                    )
            return RunResponse(
                stdout=proc.stdout or "",
                stderr=proc.stderr or "",
                exit_code=int(proc.returncode),
                timed_out=False,
            )
        except subprocess.TimeoutExpired as e:
            stdout = "" if e.stdout is None else str(e.stdout)
            stderr = "" if e.stderr is None else str(e.stderr)
            # TLE
            if body.session_id:
                insert_ide_event(
                    body.session_id,
                    "TIME_LENGTH_EXCEEDED",
                    {"timeout_ms": body.timeout_ms},
                )
            
            return RunResponse(stdout=stdout, stderr=stderr, exit_code=-1, timed_out=True)


@app.post("/ai/chat", response_model=AiChatResponse)
def ai_chat(body: AiChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    model_name = body.model or os.environ.get("GEMINI_MODEL") or "gemini-3-flash-preview"
    
    # ASK_AI
    ide_event_id = body.ide_event_id
    if ide_event_id is None and body.session_id:
        ide_event_id = insert_ide_event(
            body.session_id,
            "ASK_AI",
            {"model": model_name, "messages": len(body.messages)},
        )

    try:
        # Start timing
        start_time = time.time()
        
        model = genai.GenerativeModel(model_name)
        
        # Convert chat history to Gemini format
        history = []
        for m in body.messages[:-1]:
            role = "user" if m.role == "user" else "model"
            history.append({"role": role, "parts": [m.content]})
            
        chat = model.start_chat(history=history)
        
        last_message = body.messages[-1].content
        response = chat.send_message(last_message)
        content = response.text
        
        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Extract token counts from response
        in_token = 0
        out_token = 0
        if hasattr(response, 'usage_metadata') and response.usage_metadata:
            in_token = getattr(response.usage_metadata, 'prompt_token_count', 0) or 0
            out_token = getattr(response.usage_metadata, 'candidates_token_count', 0) or 0

        # AI_INTERACTION SAVE
        if ide_event_id:
            with get_db() as (conn, cur):
                cur.execute(
                    """
                    INSERT INTO ai_interactions
                        (ide_event_id, prompt, response, model_name, latency_ms, in_token, out_token)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        ide_event_id,
                        last_message,
                        content,
                        model_name,
                        latency_ms,
                        in_token,
                        out_token,
                    ),
                )
                conn.commit()
        return AiChatResponse(
            assistant=str(content),
            latency_ms=latency_ms,
            in_token=in_token,
            out_token=out_token,
        )

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=502, detail=f"Gemini API request failed: {e}")
