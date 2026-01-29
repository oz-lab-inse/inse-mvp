from __future__ import annotations

import os
import subprocess
import tempfile

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="INSE Python Runner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/run", response_model=RunResponse)
def run_code(body: RunRequest):
    python_exe = os.environ.get("PYTHON_EXECUTABLE") or "python"

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
            return RunResponse(
                stdout=proc.stdout or "",
                stderr=proc.stderr or "",
                exit_code=int(proc.returncode),
                timed_out=False,
            )
        except subprocess.TimeoutExpired as e:
            stdout = "" if e.stdout is None else str(e.stdout)
            stderr = "" if e.stderr is None else str(e.stderr)
            return RunResponse(stdout=stdout, stderr=stderr, exit_code=-1, timed_out=True)


@app.post("/ai/chat", response_model=AiChatResponse)
def ai_chat(body: AiChatRequest):
    ollama_base_url = os.environ.get("OLLAMA_BASE_URL") or "http://localhost:11434"
    model = body.model or (os.environ.get("OLLAMA_MODEL") or "llama3.1")
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
    return AiChatResponse(assistant=str(content))
