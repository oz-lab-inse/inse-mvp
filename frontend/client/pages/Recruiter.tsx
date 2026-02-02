import SideMenu from "@/components/SideMenu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Candidate, Recruiter, Report, Session, UUID } from "@shared/api";

export default function RecruiterDashboard() {
  const recruiter: Recruiter = {
    recruiter_id: "c6d3f1e5-63cb-4d52-9c1a-5a9f1a3b3d88",
    name: "Recruiter User",
    company: "INSE",
  };

  const rows: Array<{
    candidate: Candidate;
    session: Session;
    report: Report;
  }> = [
    {
      candidate: {
        candidate_id: "321" as UUID,
        name: "Candidate 321",
        email: "candidate321@example.com",
      },
      session: {
        session_id: "s_321" as UUID,
        candidate_id: "321" as UUID,
        task_id: "t_001" as UUID,
        started_at: "2026-01-30T21:00:00Z",
        ended_at: "2026-01-30T21:42:00Z",
        status: "completed",
      },
      report: {
        report_id: "r_321" as UUID,
        session_id: "s_321" as UUID,
        overall_score: 70,
        ai_reliance: 0.85,
        debugging_score: 72,
      },
    },
    {
      candidate: {
        candidate_id: "123" as UUID,
        name: "Candidate 123",
        email: "candidate123@example.com",
      },
      session: {
        session_id: "s_123" as UUID,
        candidate_id: "123" as UUID,
        task_id: "t_001" as UUID,
        started_at: "2026-01-30T21:10:00Z",
        ended_at: "2026-01-30T21:22:00Z",
        status: "in_progress",
      },
      report: {
        report_id: "r_123" as UUID,
        session_id: "s_123" as UUID,
        overall_score: 65,
        ai_reliance: 0.45,
        debugging_score: 60,
      },
    },
    {
      candidate: {
        candidate_id: "322" as UUID,
        name: "Candidate 322",
        email: "candidate322@example.com",
      },
      session: {
        session_id: "s_322" as UUID,
        candidate_id: "322" as UUID,
        task_id: "t_001" as UUID,
        started_at: "2026-01-30T20:30:00Z",
        ended_at: "2026-01-30T21:12:00Z",
        status: "completed",
      },
      report: {
        report_id: "r_322" as UUID,
        session_id: "s_322" as UUID,
        overall_score: 80,
        ai_reliance: 0.25,
        debugging_score: 82,
      },
    },
    {
      candidate: {
        candidate_id: "7889" as UUID,
        name: "Candidate 7889",
        email: "candidate7889@example.com",
      },
      session: {
        session_id: "s_7889" as UUID,
        candidate_id: "7889" as UUID,
        task_id: "t_001" as UUID,
        started_at: "2026-01-30T20:00:00Z",
        ended_at: "2026-01-30T20:42:00Z",
        status: "completed",
      },
      report: {
        report_id: "r_7889" as UUID,
        session_id: "s_7889" as UUID,
        overall_score: 88,
        ai_reliance: 0.55,
        debugging_score: 90,
      },
    },
    {
      candidate: {
        candidate_id: "3244" as UUID,
        name: "Candidate 3244",
        email: "candidate3244@example.com",
      },
      session: {
        session_id: "s_3244" as UUID,
        candidate_id: "3244" as UUID,
        task_id: "t_001" as UUID,
        started_at: "2026-01-30T20:00:00Z",
        ended_at: "2026-01-30T20:42:00Z",
        status: "completed",
      },
      report: {
        report_id: "r_3244" as UUID,
        session_id: "s_3244" as UUID,
        overall_score: 76,
        ai_reliance: 0.5,
        debugging_score: 78,
      },
    },
  ];

  const minutes_between = (started_at: string, ended_at: string | null) => {
    if (!ended_at) return 0;
    const start_ms = new Date(started_at).getTime();
    const end_ms = new Date(ended_at).getTime();
    if (!Number.isFinite(start_ms) || !Number.isFinite(end_ms) || end_ms <= start_ms) return 0;
    return Math.round((end_ms - start_ms) / 60000);
  };

  const completion_label = (session: Session) => {
    return session.status === "completed" ? "Complete" : "Incomplete";
  };

  const completion_class_name = (session: Session) => {
    return session.status === "completed" ? "bg-[#DAFFE4]" : "bg-[#FFE7E7]";
  };

  const ai_usage_label = (report: Report) => {
    if (report.ai_reliance >= 0.75) return "Overused";
    if (report.ai_reliance >= 0.45) return "Balanced";
    return "Strategic";
  };
  const [searchId, setSearchId] = useState("");
  
  const sortedRows = [...rows].sort((a, b) => {
  const q = searchId.trim().toLowerCase();
  if (!q) return 0;

  const aId = String(a.candidate.candidate_id).toLowerCase();
  const bId = String(b.candidate.candidate_id).toLowerCase();

  const aMatch = aId.includes(q) ? 1 : 0;
  const bMatch = bId.includes(q) ? 1 : 0;

  // match 되는 애가 위로
  if (aMatch !== bMatch) return bMatch - aMatch;

  // 둘 다 매치 
  const aNum = parseInt(aId, 10);
  const bNum = parseInt(bId, 10);
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;

  return aId.localeCompare(bId);
});

const navigate = useNavigate();


return (
  <div className="bg-[#FFF] w-screen min-h-screen">
    <SideMenu mode="absolute" brandTitle="INSE MVP" />

  <div className="absolute left-[299px] top-[133px] w-[1141px] flex items-center justify-between">
    <p className="text-[#000] font-inter text-[25px] font-semibold tracking-[-0.01em]">
      Candidates
    </p>

    <div className="flex items-center gap-3">
      {/* Search 이거 아이디 값을 쳐야함 그럼 정렬 322 이런식으로*/}
      <div className="flex items-center gap-3 rounded-lg border border-[#E0E0E0] bg-[#FFF] w-[420px] h-10 px-3">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="#828282"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 13L16.5 16.5"
            stroke="#828282"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full text-[#000] font-inter text-base outline-none"
          placeholder="Search by candidate ID..."
        />
      </div>

      {/* Filter (UI만 구현해놈) */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-[#E0E0E0] bg-[#FFF] h-10 px-4 hover:bg-gray-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
            stroke="#828282"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[#828282] font-inter text-base">Filter</span>
      </button>
    </div>
  </div>

    <div className="flex flex-col items-start w-[993px] h-[392px] absolute left-[351px] top-[251px] overflow-hidden">
      {/* Header*/}
    <div className="grid grid-cols-[340px_120px_160px_160px_120px] items-center shrink-0 w-full h-14 border-b border-b-[#E0E0E0]">
      <p className="text-[#828282] font-inter text-base font-medium px-2 text-left">
        Name
      </p>
      <p className="text-[#000] font-inter text-base font-medium px-2 text-center">
        Overall
      </p>
      <p className="text-[#000] font-inter text-base font-medium px-2 text-center">
        Completion
      </p>
      <p className="text-[#000] font-inter text-base font-medium px-2 text-center">
        AI Usage
      </p>
      <p className="text-[#000] font-inter text-base font-medium px-2 text-center">
        Time
      </p>
    </div>
          {sortedRows.map((row) => (
      <div
        key={row.candidate.candidate_id}
        onClick={() => navigate(`/report/${row.candidate.candidate_id}`)}
        className="grid grid-cols-[340px_120px_160px_160px_120px] items-center shrink-0 border-b border-b-[#E0E0E0] w-full h-14"
      >
        {/* Name*/}
        <div className="px-2 text-left">
          <p className="text-[#000] font-inter text-base font-medium line-clamp-1 overflow-hidden text-ellipsis">
            {row.candidate.name}{" "}
            <span className="text-[#828282] font-medium">
              (ID {row.candidate.candidate_id})
            </span>
          </p>
        </div>

        {/* Overall */}
        <div className="flex justify-center px-2">
          <p className="text-[#000] font-inter text-base font-medium">
            {row.report.overall_score}
          </p>
        </div>

        {/* Completion */}
        <div className="flex justify-center px-2">
          <button
            type="button"
            className={`cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] ${completion_class_name(
              row.session
            )} w-fit`}
          >
            <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
              {completion_label(row.session)}
            </p>
          </button>
        </div>

        {/* AI Usage*/}
        <div className="flex justify-center px-2">
          <p className="text-[#828282] font-inter text-base font-medium">
            {ai_usage_label(row.report)}
          </p>
        </div>

        {/* Time */}
        <div className="flex justify-center px-2">
          <p className="text-[#828282] font-inter text-base font-medium">
            {minutes_between(row.session.started_at, row.session.ended_at)} min
          </p>
        </div>
      </div>
    ))}
    </div>
  </div>
);
}
