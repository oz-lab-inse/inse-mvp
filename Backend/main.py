from __future__ import annotations

import os
import subprocess
import tempfile

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from psycopg_pool import ConnectionPool

app = FastAPI(title="INSE Python Runner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# DB Connection
pool: ConnectionPool | None = None


def init_db() -> None:
    global pool
    db_url = os.environ.get("postgresql://postgres:saram1nse001@db.xcymbfpvltvntopbxaym.supabase.co:5432/postgres")
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
    stdin: str = Field("", description="stdin content")
    timeout_ms: int = Field(3000, ge=100, le=30000)


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


class AiChatResponse(BaseModel):
    assistant: str


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-health")
def db_health():
    with get_db() as (_, cur):
        cur.execute("SELECT 1;")
        return {"db_ok": cur.fetchone()[0] == 1}

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
    ollama_base_url = os.environ.get("OLLAMA_BASE_URL") or "http://localhost:11434"
    model = body.model or (os.environ.get("OLLAMA_MODEL") or "llama3.1")
    # ASK_AI
    ide_event_id = body.ide_event_id
    if ide_event_id is None and body.session_id:
        ide_event_id = insert_ide_event(
            body.session_id,
            "ASK_AI",
            {"model": model, "messages": len(body.messages)},
        )

    timeout_sec_raw = os.environ.get("OLLAMA_TIMEOUT_SEC")
    timeout_sec = 30.0
    if timeout_sec_raw:
        try:
            timeout_sec = float(timeout_sec_raw)
        except ValueError:
            timeout_sec = 30.0

    payload = {
        "model": model,
        "messages": [m.model_dump() for m in body.messages],
        "stream": False,
    }

    try:
        with httpx.Client(timeout=timeout_sec) as client:
            res = client.post(f"{ollama_base_url}/api/chat", json=payload)
            res.raise_for_status()
            data = res.json()
    except httpx.TimeoutException as e:
        raise HTTPException(status_code=502, detail=f"Ollama request timed out: {e}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {e}")
    except httpx.HTTPStatusError as e:
        text = ""
        try:
            text = e.response.text
        except Exception:
            text = ""
        raise HTTPException(status_code=502, detail=f"Ollama bad response: HTTP {e.response.status_code}\n{text}")

    message = data.get("message") or {}
    content = message.get("content")
    if content is None:
        content = ""
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
                    body.messages[-1].content if body.messages else "",
                    content,
                    model,
                    body.latency_ms or 0,
                    body.in_token or 0,
                    body.out_token or 0,
                ),
            )
            conn.commit()
    return AiChatResponse(assistant=str(content))
