import SideMenu from "@/components/SideMenu";

export default function RecruiterDashboard() {
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
        <div className="flex items-center gap-8 shrink-0 border-t border-t-[#E0E0E0] w-full h-14">
          <div className="flex pr-5 items-center w-[90px] h-6">
            <p className="text-[#828282] font-inter text-base font-medium w-[70px] h-6 text-center">
              ID 321
            </p>
          </div>
          <div className="flex justify-end items-center w-[90px] h-6">
            <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px] h-6">
              70
            </p>
          </div>
          <div className="flex pr-[107px] items-center w-[180px] h-7">
            <button className="cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] bg-[#DAFFE4] w-fit">
              <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                Complete
              </p>
            </button>
          </div>
          <div className="flex pr-[105px] items-center w-[180px] h-6">
            <p className="text-[#828282] font-inter text-base font-medium w-[75px] h-6">
              Overused
            </p>
          </div>
          <div className="flex pr-[106px] items-center w-[180px] h-6">
            <p className="text-[#828282] font-inter text-base font-medium w-[74px] h-6">
              42 min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-[30px] shrink-0 border-t border-t-[#E0E0E0] w-full h-14">
          <p className="text-[#828282] font-inter text-base font-medium w-[70px]">
            ID 123
          </p>
          <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px]">
            65
          </p>
          <div className="flex pt-px justify-end items-center w-16 h-7">
            <button className="cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] bg-[#FFE7E7] w-[71px] h-[27px]">
              <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                Incomplete
              </p>
            </button>
          </div>
          <p className="text-[#828282] font-inter text-base font-medium w-fit">
            Balanced
          </p>
          <p className="text-[#828282] font-inter text-base font-medium w-[74px]">
            12 min
          </p>
        </div>
        <div className="flex items-center gap-[30px] shrink-0 border-t border-t-[#E0E0E0] w-full h-14">
          <p className="text-[#828282] font-inter text-base font-medium w-[70px]">
            ID 322
          </p>
          <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px]">
            80
          </p>
          <div className="flex justify-end items-center w-16 h-7">
            <button className="cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] bg-[#FFF] w-fit">
              <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                Complete
              </p>
            </button>
          </div>
          <p className="text-[#828282] font-inter text-base font-medium w-fit">
            Strategic
          </p>
          <p className="text-[#828282] font-inter text-base font-medium w-[74px]">
            42 min
          </p>
        </div>
        <div className="flex items-center gap-[30px] shrink-0 border-t border-t-[#E0E0E0] w-full h-14">
          <p className="text-[#828282] font-inter text-base font-medium w-[70px]">
            ID 7889
          </p>
          <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px]">
            88
          </p>
          <div className="flex justify-end items-center w-16 h-7">
            <button className="cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] bg-[#FFF] w-fit">
              <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                Complete
              </p>
            </button>
          </div>
          <p className="text-[#828282] font-inter text-base font-medium w-fit">
            Balanced
          </p>
          <p className="text-[#828282] font-inter text-base font-medium w-[74px]">
            42 min
          </p>
        </div>
        <div className="flex items-center gap-[30px] shrink-0 border-t border-t-[#E0E0E0] w-full h-14">
          <p className="text-[#828282] font-inter text-base font-medium w-[70px]">
            ID 3244
          </p>
          <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-[430px]">
            76
          </p>
          <div className="flex justify-end items-center w-16 h-7">
            <button className="cursor-pointer text-nowrap flex py-1.5 px-2 justify-center items-center gap-2 rounded-lg border border-[#E0E0E0] bg-[#FFF] w-fit">
              <p className="text-[#000] font-inter text-xs font-semibold leading-4 w-fit">
                Complete
              </p>
            </button>
          </div>
          <p className="text-[#828282] font-inter text-base font-medium w-fit">
            Balanced
          </p>
          <p className="text-[#828282] font-inter text-base font-medium w-[74px]">
            42 min
          </p>
        </div>
      </div>
      <div className="flex pt-[21px] pr-0 pb-5 pl-[1254px] justify-end items-center border-b border-b-[#E0E0E0] bg-[#FFF] w-[1182px] h-[71px] absolute left-[258px] top-0 overflow-hidden">
        <p className="text-[#000] font-inter text-xl font-semibold w-[137px] h-[30px] tracking-[-0.01em]">
          Recruiter User
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
