from __future__ import annotations

import os
import subprocess
import tempfile
import json
import uuid
import time
import difflib
from datetime import datetime
from contextlib import contextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from psycopg_pool import ConnectionPool
from psycopg.types.json import Json

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
        print("DATABASE_URL is not set, skipping DB init")
        return
    try:
        pool = ConnectionPool(conninfo=db_url, min_size=1, max_size=10)
        print("DB Connection Pool initialized")
    except Exception as e:
        print(f"Failed to initialize DB pool: {e}")
        pool = None

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

# Models & Initial Data
DEFAULT_CANDIDATE_ID = None
DEFAULT_TASK_ID = None

def ensure_initial_data():
    global DEFAULT_CANDIDATE_ID, DEFAULT_TASK_ID
    if pool is None:
        print("DB Pool is None, skipping initial data")
        return
    try:
        with get_db() as (conn, cur):
            print("Starting initial data check...")
            # 1. Recruiter
            cur.execute("SELECT recruiter_id FROM recruiters LIMIT 1")
            row = cur.fetchone()
            if row:
                rid = row[0]
                print(f"Using existing recruiter: {rid}")
            else:
                rid = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO recruiters (recruiter_id, name, company) VALUES (%s, %s, %s)",
                    (rid, "Inse Recruiter", "INSE AI")
                )
                print(f"Created Default Recruiter: {rid}")

            # 2. Assessment
            cur.execute("SELECT assessment_id FROM assessments LIMIT 1")
            row = cur.fetchone()
            if row:
                aid = row[0]
                print(f"Using existing assessment: {aid}")
            else:
                aid = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO assessments (assessment_id, recruiter_id, title, level, duration_minutes, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (aid, rid, "Python Coding Test", "Junior", 60, "DRAFT")
                )
                print(f"Created Default Assessment: {aid}")

            # 3. Task
            cur.execute("SELECT task_id FROM tasks LIMIT 1")
            row = cur.fetchone()
            if row:
                DEFAULT_TASK_ID = row[0]
                print(f"Using existing task: {DEFAULT_TASK_ID}")
            else:
                tid = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO tasks (task_id, assessment_id, title, description, language, time_limit) VALUES (%s, %s, %s, %s, %s, %s)",
                    (tid, aid, "Two Sum", "Implement Two Sum", "python", 3600)
                )
                DEFAULT_TASK_ID = tid
                print(f"Created Default Task: {tid}")

            # 4. Candidate
            cur.execute("SELECT candidate_id FROM candidates WHERE email = 'guest@inse.ai'")
            row = cur.fetchone()
            if row:
                DEFAULT_CANDIDATE_ID = row[0]
                print(f"Using existing candidate: {DEFAULT_CANDIDATE_ID}")
            else:
                uid = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO candidates (candidate_id, name, email) VALUES (%s, %s, %s)",
                    (uid, "Guest User", "guest@inse.ai")
                )
                DEFAULT_CANDIDATE_ID = uid
                print(f"Created Default Candidate: {uid}")
            
            conn.commit()
            print("Initial data ensure SUCCESS.")
    except Exception as e:
        print(f"!!! Failed to ensure initial data: {e}")
        import traceback
        traceback.print_exc()

@app.on_event("startup")
def _startup():
    init_db()
    ensure_initial_data()

@app.on_event("shutdown")
def _shutdown():
    close_db()

# Request/Response Models
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

class EventRequest(BaseModel):
    session_id: str
    type: str
    payload: dict = {}
    ts: int | None = None

# API Endpoints
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-health")
def db_health():
    if pool is None:
        return {"db_ok": False, "error": "Pool not initialized"}
    try:
        with get_db() as (_, cur):
            cur.execute("SELECT 1;")
            return {"db_ok": cur.fetchone()[0] == 1}
    except Exception as e:
        return {"db_ok": False, "error": str(e)}

@app.post("/api/sessions")
def create_session():
    session_id = str(uuid.uuid4())
    if pool is not None:
        try:
            global DEFAULT_CANDIDATE_ID, DEFAULT_TASK_ID
            if not DEFAULT_CANDIDATE_ID or not DEFAULT_TASK_ID:
                ensure_initial_data()
            cid = DEFAULT_CANDIDATE_ID
            tid = DEFAULT_TASK_ID
            with get_db() as (conn, cur):
                if cid and tid:
                    cur.execute(
                        "INSERT INTO sessions (session_id, candidate_id, task_id, status) VALUES (%s, %s, %s, %s)",
                        (session_id, cid, tid, 'NOT_STARTED')
                    )
                    conn.commit()
                    print(f"Created session in DB: {session_id}")
                else:
                     print(f"Missing Cid({cid}) or Tid({tid})")
        except Exception as e:
            print(f"Failed to create session in DB: {e}")
    return {"session_id": session_id}

@app.post("/api/events")
def log_event_endpoint(body: EventRequest):
    if not body.session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    evt_id = insert_ide_event(body.session_id, body.type, body.payload)
    if not evt_id:
        raise HTTPException(status_code=500, detail="Failed to save event")
    if body.type in ("END_SESSION", "TIME_UP"):
        generate_report(body.session_id)
    return {"status": "ok", "event_id": evt_id}

@app.post("/run", response_model=RunResponse)
def run_code(body: RunRequest):
    python_exe = os.environ.get("PYTHON_EXECUTABLE") or "python"
    
    if body.session_id:
        insert_ide_event(
            body.session_id,
            "CODE_EDIT",
            {
                "added_lines": count_added_lines(body.prev_code, body.code) if body.prev_code is not None else 0,
                "total_lines": len(body.code.splitlines()),
            }
        )

    # Simplified test runner logic as per taxonomies
    test_cases_json = json.dumps([
        {"input": {"nums": [2, 7, 11, 15], "target": 9}, "expected": [0, 1]},
        {"input": {"nums": [3, 2, 4], "target": 6}, "expected": [1, 2]},
        {"input": {"nums": [3, 3], "target": 6}, "expected": [0, 1]},
    ])
    
    code_to_run = f"""
from typing import List
import sys
{body.code}
if __name__ == "__main__":
    test_cases = {test_cases_json}
    try:
        sol = Solution()
        passed = 0
        for tc in test_cases:
            res = sol.twoSum(tc['input']['nums'], tc['input']['target'])
            if sorted(res or []) == sorted(tc['expected']):
                passed += 1
        if passed == len(test_cases): sys.exit(0)
        else: sys.exit(1)
    except Exception: sys.exit(1)
"""
    with tempfile.TemporaryDirectory() as tmpdir:
        fpath = os.path.join(tmpdir, "main.py")
        with open(fpath, "w", encoding="utf-8") as f: f.write(code_to_run)
        try:
            proc = subprocess.run([python_exe, fpath], capture_output=True, text=True, timeout=body.timeout_ms/1000.0)
            if body.session_id:
                if is_syntax_error(proc.stderr):
                    insert_ide_event(body.session_id, "SYNTAX_ERROR", {"stderr": proc.stderr})
                else:
                    insert_ide_event(body.session_id, "RUN_SUCCEED", {"exit_code": proc.returncode})
                if body.mode.upper() == "TEST":
                    insert_ide_event(body.session_id, "TEST_PASS" if proc.returncode == 0 else "TEST_FAIL", {"exit_code": proc.returncode})
            return RunResponse(stdout=proc.stdout, stderr=proc.stderr, exit_code=proc.returncode, timed_out=False)
        except subprocess.TimeoutExpired:
            if body.session_id: insert_ide_event(body.session_id, "TIME_LENGTH_EXCEEDED", {"timeout_ms": body.timeout_ms})
            return RunResponse(stdout="", stderr="Timeout", exit_code=-1, timed_out=True)

@app.post("/ai/chat", response_model=AiChatResponse)
def ai_chat(body: AiChatRequest):
    if not GEMINI_API_KEY: raise HTTPException(status_code=500, detail="No Gemini Key")
    model_name = body.model or "gemini-1.5-flash"
    
    start_time = time.time()
    model = genai.GenerativeModel(model_name)
    last_msg = body.messages[-1].content
    
    # Simple classification for taxonomy
    etype = "ASK_AI"
    if "fix" in last_msg.lower() or "error" in last_msg.lower(): etype = "DEBUG_CODE_AI"
    elif "write" in last_msg.lower() or "code" in last_msg.lower(): etype = "GENERATE_CODE_AI"
    
    evt_id = None
    if body.session_id:
        evt_id = insert_ide_event(body.session_id, etype, {"model": model_name})

    try:
        response = model.generate_content(last_msg)
        content = response.text
        latency = int((time.time() - start_time) * 1000)
        
        in_t = getattr(response.usage_metadata, 'prompt_token_count', 0) if hasattr(response, 'usage_metadata') else 0
        out_t = getattr(response.usage_metadata, 'candidates_token_count', 0) if hasattr(response, 'usage_metadata') else 0

        if evt_id:
            with get_db() as (conn, cur):
                cur.execute(
                    "INSERT INTO ai_interactions (ide_event_id, prompt, response, model_name, latency_ms, in_token, out_token) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (evt_id, last_msg, content, model_name, latency, in_t, out_t)
                )
                conn.commit()
        return AiChatResponse(assistant=content, latency_ms=latency, in_token=in_t, out_token=out_t)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

# Logic Functions
def calculate_metrics(events: list):
    stats = {
        "tests_run": 0,
        "tests_passed": 0,
        "syntax_errors": 0,
        "ai_calls": 0,
        "code_edits": 0,
        "total_added_lines": 0
    }
    for etype, payload in events:
        if etype == "TEST_PASS":
            stats["tests_run"] += 1
            stats["tests_passed"] += 1
        elif etype == "TEST_FAIL":
            stats["tests_run"] += 1
        elif etype == "SYNTAX_ERROR":
            stats["syntax_errors"] += 1
        elif etype.endswith("_AI"):
            stats["ai_calls"] += 1
        elif etype == "CODE_EDIT":
            stats["code_edits"] += 1
            stats["total_added_lines"] += payload.get("added_lines", 0)
    
    # AEQ: Algorithmic Efficiency Quotient (Accuracy Score 0-100)
    aeq = (stats["tests_passed"] / stats["tests_run"] * 100) if stats["tests_run"] > 0 else 0
    
    # IPS: Iterative Problem Solving (Debugging Score 0-100)
    ips = max(0, 100 - (stats["syntax_errors"] * 10))
    
    # EFF: Efficiency (Low AI reliance & concise coding)
    # Higher is better. Let's base it on (1 - AI_reliance)
    total_actions = stats["code_edits"] + stats["ai_calls"]
    ai_reliance = (stats["ai_calls"] / total_actions) if total_actions > 0 else 0
    eff = max(0, (1 - ai_reliance) * 100)

    # Overall Score (Weighted Average)
    overall = (aeq * 0.5) + (ips * 0.3) + (eff * 0.2)
    
    return {
        "overall": round(overall, 2),
        "aeq": round(aeq, 2),
        "ips": round(ips, 2),
        "eff": round(eff, 2)
    }

def generate_report(session_id: str):
    if pool is None: return
    try:
        with get_db() as (conn, cur):
            cur.execute("SELECT event_type, payload FROM ide_events WHERE session_id = %s", (session_id,))
            events = cur.fetchall()
            if not events: return
            
            res = calculate_metrics(events)
            rid = str(uuid.uuid4())
            
            # Match schema in image: report_id, session_id, overall_score, aeq, eff, ips
            cur.execute(
                """
                INSERT INTO reports (report_id, session_id, overall_score, aeq, eff, ips) 
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (rid, session_id, res["overall"], res["aeq"], res["eff"], res["ips"])
            )
            
            # Also insert into detailed metrics table
            for name, val in [("AEQ", res["aeq"]), ("IPS", res["ips"]), ("EFF", res["eff"])]:
                cur.execute(
                    "INSERT INTO metrics (report_id, name, value, completed) VALUES (%s, %s, %s, %s)",
                    (rid, name, val, True)
                )
            
            conn.commit()
            print(f">>> Report generated for {session_id} | Overall: {res['overall']}")
    except Exception as e:
        print(f"Report fail: {e}")
        import traceback
        traceback.print_exc()

def insert_ide_event(session_id: str, event_type: str, payload: dict) -> str | None:
    if pool is None: return None
    try:
        with get_db() as (conn, cur):
            cur.execute(
                "INSERT INTO ide_events (session_id, event_type, payload, timestamp) VALUES (%s, %s, %s, %s) RETURNING ide_event_id",
                (session_id, event_type, Json(payload), datetime.now())
            )
            eid = cur.fetchone()[0]
            conn.commit()
            return eid
    except Exception as e: print(f"Insert fail: {e}"); return None

def count_added_lines(prev: str, curr: str) -> int:
    if not prev: return len(curr.splitlines())
    added = 0
    for line in difflib.unified_diff(prev.splitlines(), curr.splitlines()):
        if line.startswith("+") and not line.startswith("+++"): added += 1
    return added

def is_syntax_error(stderr: str) -> bool:
    return "syntaxerror" in (stderr or "").lower()
