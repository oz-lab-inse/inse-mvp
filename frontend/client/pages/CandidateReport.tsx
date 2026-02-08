import type { Candidate, IdeEvent, Metric, Report, Session, UUID } from "@shared/api";
import { useNavigate, useParams } from "react-router-dom";

export default function CandidateReport() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const id = (candidateId || "unknown") as UUID;
    const candidate: Candidate = {
    candidate_id: id,
    name: `Candidate ${id}`,
    email: `candidate${id}@example.com`,
  };

  const session: Session = {
    session_id: "s_3333" as UUID,
    candidate_id: candidate.candidate_id,
    task_id: "t_001" as UUID,
    started_at: "2026-01-30T21:00:00Z",
    ended_at: "2026-01-30T21:42:00Z",
    status: "completed",
  };

  const report: Report = {
    report_id: "r_3333" as UUID,
    session_id: session.session_id,
    overall_score: 80,
    ai_reliance: 0.85,
    debugging_score: 79,
  };

  const metrics: Metric[] = [
    {
      metric_id: "m_1" as UUID,
      report_id: report.report_id,
      name: "Completion",
      value: 90,
      weight: 1,
      time: 0,
      completed: true,
    },
    {
      metric_id: "m_2" as UUID,
      report_id: report.report_id,
      name: "Efficiency",
      value: 80,
      weight: 1,
      time: 0,
      completed: true,
    },
  ];

  const ide_events: IdeEvent[] = [
    {
      ide_event_id: "e_1" as UUID,
      session_id: session.session_id,
      timestamp: "2026-01-30T21:00:00Z",
      event_type: "read_problem",
      payload: { action: "START_TEST" },
    },
    {
      ide_event_id: "e_2" as UUID,
      session_id: session.session_id,
      timestamp: "2026-01-30T21:04:12Z",
      event_type: "read_problem",
      payload: { action: "ASK_AI" },
    },
    {
      ide_event_id: "e_3" as UUID,
      session_id: session.session_id,
      timestamp: "2026-01-30T21:09:40Z",
      event_type: "read_problem",
      payload: { action: "CODE_EDIT" },
    },
    {
      ide_event_id: "e_4" as UUID,
      session_id: session.session_id,
      timestamp: "2026-01-30T21:14:50Z",
      event_type: "read_problem",
      payload: { action: "RUN_CODE" },
    },
    {
      ide_event_id: "e_5" as UUID,
      session_id: session.session_id,
      timestamp: "2026-01-30T21:20:00Z",
      event_type: "read_problem",
      payload: { action: "TEST_PASSED" },
    },
    {
      ide_event_id: "e_6" as UUID,
      session_id: session.session_id,
      timestamp: "2026-01-30T21:26:00Z",
      event_type: "read_problem",
      payload: { action: "END_TEST" },
    },
  ];

  const safe_minutes_since_start = (timestamp: string) => {
    const start_ms = new Date(session.started_at).getTime();
    const ts_ms = new Date(timestamp).getTime();
    if (!Number.isFinite(start_ms) || !Number.isFinite(ts_ms) || ts_ms < start_ms) return 0;
    return Math.floor((ts_ms - start_ms) / 60000);
  };

  const safe_seconds_remainder = (timestamp: string) => {
    const start_ms = new Date(session.started_at).getTime();
    const ts_ms = new Date(timestamp).getTime();
    if (!Number.isFinite(start_ms) || !Number.isFinite(ts_ms) || ts_ms < start_ms) return 0;
    return Math.floor(((ts_ms - start_ms) % 60000) / 1000);
  };

  const format_mm_ss = (timestamp: string) => {
    const mm = safe_minutes_since_start(timestamp);
    const ss = safe_seconds_remainder(timestamp);
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const ai_usage_score = Math.round(report.ai_reliance * 100);
  const completion_score = Math.round(
    (metrics.filter((m) => m.completed).length / Math.max(metrics.length, 1)) * 100,
  );

  const one_line_summary = "<One-line Summary>";
  const summary_text =
    "Used AI to plan approach, independently debugged, and validated\nsolution with multiple test runs.";

  return (
    <div className="bg-[#FFF] min-w-screen min-h-screen">
      <div className="inline-flex pt-[17px] pr-[140px] pb-[17px] pl-[57px] items-start gap-[888px] border-b border-b-[#E0E0E0] bg-[#FFF] w-full h-16 absolute left-0 top-0 overflow-hidden">
        <button
          type="button"
          onClick={() => navigate("/recruiter")}
          className="text-[#000] font-inter text-xl font-semibold tracking-[-0.01em]"
        > Back to the List
        </button>

        <p className="text-[#000] font-inter text-xl font-semibold w-[185px] h-[30px] absolute left-[1115px] top-[17px] tracking-[-0.01em]">
          Candidate: ID {candidate.candidate_id}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2.5 w-[1279px] absolute left-[81px] top-[105px]">
        <p className="text-[#000] font-inter text-[40px] font-extrabold w-full tracking-[-0.01em]">
          Score
        </p>
        <div className="flex items-start gap-8 w-full">
          <div className="flex p-6 flex-col items-start gap-4 rounded-lg border border-[#E0E0E0] bg-[#FFF] shadow-[04px12px0rgba(0,0,0,0.04)] w-full overflow-hidden">
            <p className="text-[#000] font-inter text-base font-semibold w-full">
              Problem
            </p>
            <p className="text-[#000] font-inter text-[40px] font-semibold leading-[1.1em] w-full tracking-[-0.02em]">
              {report.debugging_score}
            </p>
            <p className="text-[#828282] font-inter text-base font-medium w-full">
              extra comment
            </p>
          </div>
          <div className="flex p-6 flex-col items-start gap-4 rounded-lg border border-[#E0E0E0] bg-[#FFF] shadow-[04px12px0rgba(0,0,0,0.04)] w-full overflow-hidden">
            <p className="text-[#000] font-inter text-base font-semibold w-full">
              AI usage
            </p>
            <p className="text-[#000] font-inter text-[40px] font-semibold leading-[1.1em] w-full tracking-[-0.02em]">
              {ai_usage_score}
            </p>
            <p className="text-[#828282] font-inter text-base font-medium w-full">
              extra comment
            </p>
          </div>
          <div className="flex p-6 flex-col justify-between items-start rounded-lg border border-[#E0E0E0] bg-[#FFF] shadow-[04px12px0rgba(0,0,0,0.04)] w-full h-[172px] overflow-hidden">
            <p className="text-[#000] font-inter text-base font-semibold w-full">
              Efficiency
            </p>
            <p className="text-[#000] font-inter text-[40px] font-semibold leading-[1.1em] w-full tracking-[-0.02em]">
              {report.overall_score}
            </p>
            <p className="text-[#828282] font-inter text-base font-medium w-full">
              extra comment
            </p>
          </div>
          <div className="flex p-6 flex-col justify-between items-start rounded-lg border border-[#E0E0E0] bg-[#FFF] shadow-[04px12px0rgba(0,0,0,0.04)] w-full h-[172px] overflow-hidden">
            <p className="text-[#000] font-inter text-base font-semibold w-full">
              Completion
            </p>
            <p className="text-[#000] font-inter text-[40px] font-semibold leading-[1.1em] w-full tracking-[-0.02em]">
              {completion_score}
            </p>
            <p className="text-[#828282] font-inter text-base font-medium w-full">
              extra comment
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-[#E0E0E0] bg-[#FFF] shadow-[04px12px0rgba(0,0,0,0.04)] w-[892px] h-[380px] absolute left-[81px] top-[543px] overflow-hidden">
        <p className="text-[#828282] font-inter text-base font-semibold w-[681px] h-6 absolute left-6 top-16">
          Time
        </p>
        <p className="text-[#828282] font-inter text-base font-semibold w-[51px] h-6 absolute left-[119px] top-16 text-right">
          Action
        </p>
        <div className="flex flex-col items-start w-[844px] absolute left-6 top-[92px]">
          {ide_events.map((ide_event) => {
            const action_value = ide_event.payload["action"];
            const action = typeof action_value === "string" ? String(action_value) : ide_event.event_type;

            return (
              <div
                key={ide_event.ide_event_id}
                className="border-t border-t-[#E0E0E0] w-full h-12 relative"
              >
                <p className="text-[#000] font-inter text-base font-medium w-[434px] h-6 absolute left-0 top-3">
                  {format_mm_ss(ide_event.timestamp)}
                </p>
                <p className="text-[#000] font-inter text-base w-[107px] h-6 absolute left-[94px] top-3 text-right">
                  {action}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-[#000] font-inter text-base font-semibold w-[67px] h-6 absolute left-6 top-6">
          Timeline
        </p>
      </div>
      <div className="inline-flex pt-4 pr-[13px] pb-0.5 pl-5 flex-col justify-end items-start gap-3 rounded-lg bg-[#F3F3F3] w-[1273px] h-[137px] absolute left-[87px] top-[378px] overflow-hidden">
        <p className="text-[#000] font-inter text-[22px] w-[1240px] h-[68px] absolute left-5 top-[67px]">
          {summary_text}
        </p>
        <p className="text-[#000] font-inter text-[25px] font-semibold w-[304px] h-[39px] absolute left-[21px] top-4">
          {one_line_summary}
        </p>
      </div>
    </div>
  );
}
