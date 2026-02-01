import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import SideMenu from "@/components/SideMenu";


export default function Index() {
  const [problemText, setProblemText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>(
    [],
  );
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");


  async function handleRun() {
    try {
      setIsRunning(true);
      setOutputText("Running...\n");

      const baseUrl = (import.meta as any).env?.VITE_PYTHON_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeText,
          stdin: "",
          timeout_ms: 3000,
        }),
      });

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
      const baseUrl = (import.meta as any).env?.VITE_PYTHON_BACKEND_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeoutMs = 20000;
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${baseUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      window.clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        setAiMessages([...nextMessages, { role: "assistant", content: `HTTP ${res.status}\n${text}` }]);
        return;
      }

      const data = (await res.json()) as { assistant: string };
      setAiMessages([...nextMessages, { role: "assistant", content: data.assistant || "" }]);
    } catch (e: any) {
      const msg = e?.name === "AbortError" ? "Request timed out. Is Ollama running and the model downloaded?" : e;
      setAiMessages([
        ...nextMessages,
        { role: "assistant", content: msg?.message ? String(msg.message) : String(msg) },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  }

if (isSubmitted) {
  return (
    <div className="flex h-screen items-center justify-center bg-white font-['Inter']">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-black">
          Your answer is submitted
        </h1>
        <p className="text-gray-600">
          Thank you for your submission.
        </p>
      </div>
    </div>
  );
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
            <div className="px-2 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded text-xs lg:text-sm text-black">
              Time {hh}:{mm}:{ss}
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
{/* Code Editor + Console (Coding test style) */}
<div className="border border-gray-300 rounded bg-white overflow-hidden">
  {/* Top bar */}
  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
    <div className="flex items-center gap-3">
      <div className="text-sm font-medium text-black">Code Editor</div>
      <div className="text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 bg-white">
        Python
      </div>
      <div className="text-xs text-gray-600">main.py</div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRunning ? "Running..." : "Run"}
      </button>
      <button
        type="button"
        className="px-4 py-2 border border-gray-300 text-black text-sm font-medium rounded hover:bg-gray-100 transition-colors"
      >
        Run Tests
      </button>
    </div>
  </div>

  {/* Editor */}
  <div className="bg-slate-900">
    <textarea
      value={codeText}
      onChange={(e) => setCodeText(e.target.value)}
      className="w-full h-72 bg-transparent p-4 font-mono text-sm text-white resize-none focus:outline-none"
      placeholder="// write code here.."
      spellCheck={false}
    />
  </div>

      {/* Console */}
      <div className="border-t border-gray-200 bg-white">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="text-sm font-medium text-black">Console</div>
          <div className="text-xs text-gray-600">Output / Error logs</div>
        </div>
        <div className="w-full min-h-[140px] max-h-[220px] overflow-auto bg-slate-900 p-4 font-mono text-sm text-slate-100 whitespace-pre-wrap">
          {outputText || ""}
        </div>
      </div>
    </div> 
  </div> 
</div>   

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsSubmitted(true)}
            className="w-full sm:w-auto px-4 lg:px-6 py-2 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors"
          >
            Submit Solution
          </button>
          <div className="text-xs lg:text-sm text-black">AI usage is allowed</div>
        </footer>
      </div>
    </div>
  );
}
