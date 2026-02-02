import { useState, useEffect, useRef, useCallback } from "react";
import { Menu } from "lucide-react";
import SideMenu from "@/components/SideMenu";

const BASE_URL = (import.meta as any).env?.VITE_PYTHON_BACKEND_URL || "http://localhost:8000";

function DbStatusIndicator({ baseUrl }: { baseUrl: string }) {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`${baseUrl}/db-health`);
        const data = await res.json();
        setStatus(data.db_ok ? "connected" : "disconnected");
      } catch {
        setStatus("disconnected");
      }
    }
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [baseUrl]);

  if (status === "checking") return <span className="text-xs text-gray-400">DB...</span>;
  if (status === "disconnected") return <span className="text-xs text-red-500 font-bold">DB OFF</span>;
  return <span className="text-xs text-green-600 font-bold">DB ON</span>;
}

export default function Index() {
  const [problemText, setProblemText] = useState("");
  const [codeText, setCodeText] = useState(
    "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
  );
  const [prevCode, setPrevCode] = useState(
    "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
  );
  const [outputText, setOutputText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>(
    [],
  );
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const codeEditTimeoutRef = useRef<number | null>(null);

  // Timer: 60 minutes in seconds
  const INITIAL_TIME = 60 * 60; // 60 minutes
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);

  // Helper function to log events to backend
  const logEvent = useCallback(async (type: string, payload: object) => {
    console.log(`[logEvent] Attempting to log: ${type}`, { sessionId });

    if (!sessionId) {
      console.warn("[logEvent] Skipped: No sessionId available yet.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          type,
          payload,
          ts: Date.now(),
        }),
      });
      if (!res.ok) {
        console.error(`[logEvent] Failed: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.error(`[logEvent] Response: ${text}`);
      } else {
        console.log(`[logEvent] Success: ${type}`);
      }
    } catch (e) {
      console.error("Failed to log event:", type, e);
    }
  }, [sessionId]);

  // Initialize session on page load
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`${BASE_URL}/api/sessions`, { method: "POST" });
        const data = await res.json();
        setSessionId(data.session_id);
        console.log("Session initialized:", data.session_id);
      } catch (e) {
        console.error("Failed to initialize session:", e);
      }
    }
    initSession();
  }, []);

  // Track LEAVE_TAB events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessionId) {
        logEvent("LEAVE_TAB", { timestamp: new Date().toISOString() });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionId, logEvent]);

  // Timer countdown and TIME_UP event
  useEffect(() => {
    if (isSessionEnded || !sessionId) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up!
          clearInterval(interval);
          logEvent("TIME_UP", {
            session_duration_seconds: INITIAL_TIME,
            timestamp: new Date().toISOString()
          });
          setIsSessionEnded(true);
          alert("Time's up! Session has ended.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, isSessionEnded, logEvent]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Track CODE_EDIT events (debounced)
  const handleCodeChange = (newCode: string) => {
    setCodeText(newCode);

    // Debounce CODE_EDIT logging
    if (codeEditTimeoutRef.current) {
      window.clearTimeout(codeEditTimeoutRef.current);
    }
    codeEditTimeoutRef.current = window.setTimeout(() => {
      if (sessionId && newCode !== prevCode) {
        logEvent("CODE_EDIT", {
          added_lines: newCode.split("\n").length - prevCode.split("\n").length,
          total_lines: newCode.split("\n").length,
        });
      }
    }, 1000); // Log after 1 second of no typing
  };

  // Handle END_SESSION
  const handleEndSession = async () => {
    if (!sessionId || isSessionEnded) return;
    await logEvent("END_SESSION", {
      final_code_length: codeText.length,
      total_ai_messages: aiMessages.length,
    });
    setIsSessionEnded(true);
    alert("Session submitted successfully!");
  };

  async function handleRun(mode: "RUN" | "TEST" = "RUN") {
    try {
      setIsRunning(true);
      setOutputText("Running...\n");

      const res = await fetch(`${BASE_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeText,
          prev_code: prevCode,
          stdin: "",
          timeout_ms: 3000,
          session_id: sessionId,
          mode: mode,
        }),
      });

      // Update prevCode after run
      setPrevCode(codeText);

      if (!res.ok) {
        const text = await res.text();
        setOutputText(`HTTP ${res.status}\n${text}`);
        return;
      }
      const data = (await res.json()) as {
        stdout: string;
        stderr: string;
        exit_code: number;
        timed_out: boolean;
      };

      const parts: string[] = [];
      if (data.timed_out) parts.push("[Timed out]\n");
      if (typeof data.exit_code === "number") parts.push(`[Exit code: ${data.exit_code}]\n`);
      if (data.stdout) parts.push(data.stdout);
      if (data.stderr) parts.push(data.stderr ? `\n${data.stderr}` : "");
      setOutputText(parts.join("") || "");
    } catch (e: any) {
      setOutputText(e?.message ? String(e.message) : String(e));
    } finally {
      setIsRunning(false);
    }
  }

  async function handleAiSend() {
    const content = aiInput.trim();
    if (!content || isAiLoading) return;

    const nextMessages = [...aiMessages, { role: "user", content } as const];
    setAiMessages(nextMessages);
    setAiInput("");

    try {
      setIsAiLoading(true);
      const controller = new AbortController();
      const timeoutMs = 60000;
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextMessages,
          session_id: sessionId,
        }),
      });

      window.clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        setAiMessages([...nextMessages, { role: "assistant", content: `HTTP ${res.status}\n${text}` }]);
        return;
      }

      const data = (await res.json()) as {
        assistant: string;
        latency_ms?: number;
        in_token?: number;
        out_token?: number;
      };

      // Log AI metrics
      console.log("AI Response Metrics:", {
        latency_ms: data.latency_ms,
        in_token: data.in_token,
        out_token: data.out_token,
      });

      setAiMessages([...nextMessages, { role: "assistant", content: data.assistant || "" }]);
    } catch (e: any) {
      const msg = e?.name === "AbortError" ? "Request timed out. Please try again." : e;
      setAiMessages([
        ...nextMessages,
        { role: "assistant", content: msg?.message ? String(msg.message) : String(msg) },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-white font-['Inter']">
      <SideMenu
        brandTitle="INSE MVP"
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-sm lg:text-base font-medium text-black">
              INSE CANDIDATE IDE
            </h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <DbStatusIndicator baseUrl={BASE_URL} />
            <div className={`px-2 lg:px-4 py-1.5 lg:py-2 border rounded text-xs lg:text-sm font-mono ${timeRemaining <= 300
              ? "border-red-500 text-red-600 bg-red-50"
              : "border-gray-300 text-black"
              }`}>
              Time {formatTime(timeRemaining)}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                alt="User Kim"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm text-black hidden md:inline">
                User Kim
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Top Section: Problem Description & AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problem Description */}
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-black mb-4">
                  Problem Description
                </h2>
                <div className="flex-1 border border-gray-300 rounded bg-white p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-600">Title</div>
                      <div className="text-base text-black font-medium">
                        Two Sum (Easy)
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600">Problem statement</div>
                      <div className="text-sm text-black whitespace-pre-wrap">
                        Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

                        You may assume that each input would have exactly one solution, and you may not use the same element twice.

                        Return the answer in any order.
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600">Constraints</div>
                      <div className="text-sm text-black whitespace-pre-wrap">
                        2 ≤ nums.length ≤ 10^4
                        -10^9 ≤ nums[i] ≤ 10^9
                        -10^9 ≤ target ≤ 10^9
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setExamplesOpen((v) => !v)}
                        className="text-sm font-medium text-black underline underline-offset-4 hover:text-gray-700"
                      >
                        Examples {examplesOpen ? "(hide)" : "(show)"}
                      </button>

                      {examplesOpen ? (
                        <div className="mt-3 text-sm text-black whitespace-pre-wrap">
                          Example 1
                          nums = [2, 7, 11, 15], target = 9
                          Output: [0, 1]

                          Example 2
                          nums = [3, 2, 4], target = 6
                          Output: [1, 2]
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-black mb-4">
                  AI Assistant
                </h2>
                <div className="flex-1 border border-gray-300 rounded bg-white p-6 flex flex-col">
                  <div className="flex-1 overflow-auto space-y-3">
                    {aiMessages.length === 0 ? (
                      <div className="text-sm text-gray-600">Ask AI...</div>
                    ) : (
                      aiMessages.map((m, idx) => (
                        <div key={idx} className="text-sm text-black whitespace-pre-wrap">
                          <span className="font-semibold">{m.role === "user" ? "You" : "AI"}:</span>{" "}
                          {m.content}
                        </div>
                      ))
                    )}
                    {isAiLoading ? <div className="text-sm text-gray-600">Thinking...</div> : null}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAiSend();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Ask AI..."
                      disabled={isAiLoading}
                    />
                    <button
                      onClick={handleAiSend}
                      disabled={isAiLoading}
                      className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-base lg:text-lg font-medium text-black">
                  Code editor / TERMINAL
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRun("RUN")}
                    disabled={isRunning}
                    className="px-4 lg:px-6 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    RUN
                  </button>
                  <button
                    onClick={() => handleRun("TEST")}
                    disabled={isRunning}
                    className="px-4 lg:px-6 py-2 border border-gray-300 text-black text-sm font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Run Test
                  </button>
                </div>
              </div>
              <textarea
                value={codeText}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-64 border border-gray-300 rounded bg-gray-50 p-4 font-mono text-sm text-black resize-none focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="// write code here.."
              />
            </div>

            {/* Output Section */}
            <div className="flex flex-col">
              <h2 className="text-base font-medium text-black mb-4">
                Output / Error logs
              </h2>
              <div className="w-full min-h-[120px] border border-gray-300 rounded bg-gray-50 p-4 font-mono text-sm text-black whitespace-pre-wrap">
                {outputText || ""}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={handleEndSession}
            disabled={isSessionEnded}
            className={`w-full sm:w-auto px-4 lg:px-6 py-2 text-sm font-semibold rounded transition-colors ${isSessionEnded
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            {isSessionEnded ? "Submitted" : "Submit Solution"}
          </button>
          <div className="text-xs lg:text-sm text-black">AI usage is allowed</div>
        </footer>
      </div>
    </div>
  );
}
