import SideMenu from "@/components/SideMenu";

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

  return (
    <div className="bg-[#FFF] min-w-screen min-h-screen">
      <SideMenu mode="absolute" brandTitle="INSE MVP" />
      <div className="flex flex-col items-start w-[993px] h-[392px] absolute left-[351px] top-[251px] overflow-hidden">
        <div className="flex items-center gap-8 shrink-0 w-full h-14">
          <div className="flex pr-5 items-center w-[90px] h-6">
            <p className="text-[#828282] font-inter text-base font-medium w-[70px] h-6">
              Name
            </p>
          </div>
          <div className="flex justify-end items-center w-[90px] h-6">
            <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px] h-6">
              Overall
            </p>
          </div>
          <div className="flex pr-[88px] items-center w-[180px] h-6">
            <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[92px] h-6">
              Completion
            </p>
          </div>
          <div className="flex pr-[106px] items-center w-[180px] h-6">
            <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[74px] h-6">
              AI Usage
            </p>
          </div>
          <div className="flex pr-[72px] items-center w-[120px] h-6">
            <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-12 h-6 text-right">
              Time
            </p>
          </div>
        </div>
        {rows.map((row, idx) => {
          const is_first = idx === 0;
          const completion = completion_label(row.session);
          const time_minutes = minutes_between(row.session.started_at, row.session.ended_at);

          return (
            <div
              key={row.candidate.candidate_id}
              className={`flex items-center ${is_first ? "gap-8" : "gap-[30px]"} shrink-0 border-t border-t-[#E0E0E0] w-full h-14`}
            >
              {is_first ? (
                <div className="flex pr-5 items-center w-[90px] h-6">
                  <p className="text-[#828282] font-inter text-base font-medium w-[70px] h-6 text-center">
                    ID {row.candidate.candidate_id}
                  </p>
                </div>
              ) : (
                <p className="text-[#828282] font-inter text-base font-medium w-[70px]">
                  ID {row.candidate.candidate_id}
                </p>
              )}

              {is_first ? (
                <div className="flex justify-end items-center w-[90px] h-6">
                  <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px] h-6">
                    {row.report.overall_score}
                  </p>
                </div>
              ) : (
                <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px]">
                  {row.report.overall_score}
                </p>
              )}

              {is_first ? (
                <div className="flex pr-[107px] items-center w-[180px] h-7">
                  <button
                    className={`cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] ${completion_class_name(row.session)} w-fit`}
                  >
                    <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                      {completion}
                    </p>
                  </button>
                </div>
              ) : (
                <div className="flex pt-px justify-end items-center w-16 h-7">
                  <button
                    className={`cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] ${completion_class_name(row.session)} w-[71px] h-[27px]`}
                  >
                    <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                      {completion}
                    </p>
                  </button>
                </div>
              )}

              {is_first ? (
                <div className="flex pr-[105px] items-center w-[180px] h-6">
                  <p className="text-[#828282] font-inter text-base font-medium w-[75px] h-6">
                    {ai_usage_label(row.report)}
                  </p>
                </div>
              ) : (
                <p className="text-[#828282] font-inter text-base font-medium w-fit">
                  {ai_usage_label(row.report)}
                </p>
              )}

              {is_first ? (
                <div className="flex pr-[106px] items-center w-[180px] h-6">
                  <p className="text-[#828282] font-inter text-base font-medium w-[74px] h-6">
                    {time_minutes} min
                  </p>
                </div>
              ) : (
                <p className="text-[#828282] font-inter text-base font-medium w-[74px]">
                  {time_minutes} min
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex pt-[21px] pr-0 pb-5 pl-[1254px] justify-end items-center border-b border-b-[#E0E0E0] bg-[#FFF] w-[1182px] h-[71px] absolute left-[258px] top-0 overflow-hidden">
        <p className="text-[#000] font-inter text-xl font-semibold w-[137px] h-[30px] tracking-[-0.01em]">
          {recruiter.name}
        </p>
      </div>
      <div className="flex pt-2 pr-4 pb-2 pl-3 items-center gap-3 rounded-lg border border-[#E0E0E0] bg-[#FFF] w-[405px] h-10 absolute left-[832px] top-[133px]">
        <div className="shrink-0 w-6 h-6 overflow-hidden relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 absolute left-[3px] top-[3px] "
          >
            <path
              d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
              stroke="#828282"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width="7"
            height="7"
            viewBox="0 0 7 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-1 h-1 absolute left-[17px] top-[17px] "
          >
            <path
              d="M5.35 5.35L1 1"
              stroke="#828282"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="line-clamp-1 overflow-hidden text-[#828282] text-ellipsis font-inter text-base leading-6 w-full">
          Search tickets...
        </p>
      </div>
      <div className="inline-flex pt-2 pr-4 pb-2 pl-3 items-center gap-3 rounded-lg border border-[#E0E0E0] bg-[#FFF] h-10 absolute left-[1254px] top-[133px]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 absolute left-3 top-2 overflow-hidden "
        >
          <path
            d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
            stroke="#828282"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="line-clamp-1 overflow-hidden text-[#828282] text-ellipsis font-inter text-base leading-6 absolute left-12 top-2">
          Filter
        </p>
      </div>
      <p className="flex flex-col justify-center text-[#000] font-inter text-[25px] font-semibold w-[469px] h-[45px] absolute left-[299px] top-[133px] tracking-[-0.01em]">
        Candidates
      </p>
      <div className="inline-flex items-center gap-2.5 bg-[#FFF] h-[37px] absolute left-[1077px] top-[206px]">
        <button className="cursor-pointer text-nowrap flex py-0 px-4 justify-center items-center gap-2 rounded-lg border border-[#A2A2A2] bg-[#E2E2E2] h-[37px] absolute left-0 top-0">
          <p className="text-[#FFF] font-inter text-base font-medium w-fit">
            Occupation
          </p>
        </button>
        <button className="cursor-pointer text-nowrap flex py-0 px-4 justify-center items-center gap-2 rounded-lg border border-[#A2A2A2] bg-[#E2E2E2] h-[37px] absolute left-[131px] top-0">
          <p className="text-[#FFF] font-inter text-base font-medium w-fit">
            eeee
          </p>
        </button>
        <button className="cursor-pointer text-nowrap flex py-0 px-4 justify-center items-center gap-2 rounded-lg border border-[#A2A2A2] bg-[#E2E2E2] h-[37px] absolute left-[211px] top-0">
          <p className="text-[#FFF] font-inter text-base font-medium w-fit">
            eeee
          </p>
        </button>
      </div>
    </div>
  );
}
