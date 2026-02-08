import SideMenu from "@/components/SideMenu";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type MCQOpt = { option_label: "A" | "B" | "C" | "D"; option_text: string };

type DBQuestion = {
  attitude_question_id: string;
  question_type: "FREE_RESPONSE" | "MULTIPLE_CHOICE" | "ORAL_RESPONSE" | string;
  question_text: string;
  question_index: number;
  options?: MCQOpt[];
};

type AttitudeTestPayload = {
  attitude_test_id: string;
  session_id: string;
  questions: DBQuestion[];
};

type Props = {
  // if you want later: allow passing a testId from router/parent
  attitudeTestId?: string;
};

// ✅ PUT YOUR EXISTING TEST ID HERE
const DEFAULT_ATTITUDE_TEST_ID = "3c7b13b6-a961-445f-8801-fac58c86c10b";

// ✅ Explicit backend base URL
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

// ✅ Timeout wrapper
async function apiFetch(path: string, init?: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function readErrorBody(res: Response) {
  try {
    const txt = await res.text();
    return txt?.slice(0, 4000) || "";
  } catch {
    return "";
  }
}

export default function AttitudeTest({ attitudeTestId }: Props) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<AttitudeTestPayload | null>(null);

  // answers by question id
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const resolvedTestId = attitudeTestId || DEFAULT_ATTITUDE_TEST_ID;

  // ------------------------------------------------------------
  // Load attitude test BY TEST ID (this matches your seeded DB)
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadTest() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch(`/api/attitude-tests/${resolvedTestId}`);
        if (!res.ok) {
          const body = await readErrorBody(res);
          throw new Error(body || `GET /api/attitude-tests/${resolvedTestId} failed (${res.status})`);
        }

        const data: AttitudeTestPayload = await res.json();

        if (!cancelled) {
          setTest(data);

          // init answers map
          const init: Record<string, string> = {};
          for (const q of data.questions ?? []) init[q.attitude_question_id] = "";
          setAnswers(init);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.name === "AbortError" ? "Request timed out loading attitude test" : (e?.message ?? "Failed to load attitude test"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (resolvedTestId) loadTest();
    else {
      setError("Missing attitudeTestId");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [resolvedTestId]);

  const questions = useMemo(() => {
    const qs = (test?.questions ?? []).slice();
    qs.sort((a, b) => a.question_index - b.question_index);
    return qs;
  }, [test]);

  const setFrq = (qid: string, v: string) => setAnswers((p) => ({ ...p, [qid]: v }));
  const setMcq = (qid: string, label: string) => setAnswers((p) => ({ ...p, [qid]: label }));

  const allAnswered = useMemo(() => {
    return questions.every((q) => (answers[q.attitude_question_id] ?? "").trim().length > 0);
  }, [questions, answers]);

  async function saveOneAnswer(q: DBQuestion) {
    const qid = q.attitude_question_id;
    const value = (answers[qid] ?? "").trim();

    const payload =
      q.question_type === "FREE_RESPONSE"
        ? { answer_text: value }
        : { selected_option_label: value };

    const res = await apiFetch(`/api/attitude-questions/${qid}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await readErrorBody(res);
      throw new Error(body || `Failed to save answer (${res.status})`);
    }
  }

  async function saveAllAnswers() {
    for (const q of questions) {
      await saveOneAnswer(q);
    }
  }

  // ---------------- UI STATES ----------------
  if (loading) {
    return (
      <div className="bg-[#FFF] w-screen min-h-screen">
        <SideMenu mode="absolute" brandTitle="INSE MVP" />
        <div className="absolute left-[351px] top-[95px] w-[1141px]">
          <p className="text-[#000] font-inter text-[25px] font-semibold tracking-[-0.01em]">
            Attitude Test
          </p>
          <p className="mt-4 text-[#000] font-inter text-base">
            Loading…
            <br />
            <span className="text-xs opacity-70">
              test_id: {resolvedTestId}
              <br />
              api: {API_BASE}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="bg-[#FFF] w-screen min-h-screen">
        <SideMenu mode="absolute" brandTitle="INSE MVP" />
        <div className="absolute left-[351px] top-[95px] w-[1141px]">
          <p className="text-[#000] font-inter text-[25px] font-semibold tracking-[-0.01em]">
            Attitude Test
          </p>

          <p className="mt-4 text-red-600 font-inter text-base whitespace-pre-wrap">
            {error ?? "Failed to load."}
          </p>

          <div className="mt-4 text-xs opacity-70">
            <div>test_id: {resolvedTestId}</div>
            <div>api: {API_BASE}</div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="bg-[#FFF] w-screen min-h-screen">
      <SideMenu mode="absolute" brandTitle="INSE MVP" />

      <div className="absolute left-[351px] top-[95px] w-[1141px] flex items-center justify-between">
        <p className="text-[#000] font-inter text-[25px] font-semibold tracking-[-0.01em]">
          Attitude Test
        </p>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E0E0E0]" />
          <p className="text-[#000] font-inter text-base font-medium">User Kim</p>
        </div>
      </div>

      <div className="absolute left-[351px] top-[155px] w-[1141px]">
        <p className="text-[#000] font-inter text-[18px] font-semibold leading-7">
          Answering the following questions will allow us to know you well and give specific coding question for you.
          <br />
          Answer each question to best describe yourself
        </p>
      </div>

      <div className="absolute left-[351px] top-[245px] w-[1141px] pb-24">
        {/* <div className="mb-6 text-xs opacity-60">
          session: {test.session_id} • attitude_test: {test.attitude_test_id} • questions: {test.questions?.length ?? 0}
        </div> */}

        <div className="flex flex-col gap-10">
          {questions.map((q) => {
            const qid = q.attitude_question_id;
            const isFR = q.question_type === "FREE_RESPONSE";
            const isMCQ = q.question_type === "MULTIPLE_CHOICE";
            const value = answers[qid] ?? "";

            return (
              <div key={qid}>
                <p className="text-[#000] font-inter text-[20px] font-semibold mb-4">
                  {q.question_index}. {q.question_text}
                  {isFR ? " Please Explain" : ""}
                </p>

                {isFR ? (
                  <textarea
                    value={value}
                    onChange={(e) => setFrq(qid, e.target.value)}
                    className="w-full h-[56px] resize-none rounded-lg border border-[#E0E0E0] bg-[#F7F7F7] px-4 py-3 text-[#000] font-inter text-base outline-none focus:border-[#BDBDBD]"
                  />
                ) : isMCQ ? (
                  <div className="flex flex-col gap-4">
                    {(q.options ?? []).map((opt) => {
                      const selected = value === opt.option_label;
                      return (
                        <button
                          key={opt.option_label}
                          type="button"
                          onClick={() => setMcq(qid, opt.option_label)}
                          className={[
                            "w-full text-left rounded-lg border border-[#E0E0E0] px-6 py-6",
                            selected ? "bg-[#BDBDBD]" : "bg-[#D9D9D9] hover:bg-[#CFCFCF]",
                          ].join(" ")}
                        >
                          <span className="text-[#000] font-inter text-[18px] font-semibold">
                            {opt.option_label}:{" "}
                          </span>
                          <span className="text-[#000] font-inter text-[18px] font-medium">
                            {opt.option_text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#000] font-inter text-base">
                    Unsupported question type: {q.question_type}
                  </p>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await saveOneAnswer(q);
                      } catch (e: any) {
                        alert(e?.message ?? "Failed to save");
                      }
                    }}
                    className="px-5 py-2 rounded-lg border border-[#E0E0E0] bg-[#F2F2F2] hover:bg-[#EDEDED] font-inter text-sm font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex items-center justify-between">
          <button
            type="button"
            disabled={!allAnswered}
            onClick={async () => {
              try {
                await saveAllAnswers();
                navigate("/");
              } catch (e: any) {
                alert(e?.message ?? "Failed to save all answers");
              }
            }}
            className={[
              "px-8 py-3 rounded-lg border border-[#E0E0E0] font-inter text-base font-semibold",
              allAnswered
                ? "bg-[#F2F2F2] hover:bg-[#EDEDED]"
                : "bg-[#F2F2F2] opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            Move to Coding Test
          </button>

          <p className="text-[#000] font-inter text-[18px] font-semibold">
            AI usage is NOT allowed
          </p>
        </div>
      </div>
    </div>
  );
}