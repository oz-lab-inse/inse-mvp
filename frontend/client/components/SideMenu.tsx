import { Home, Search, Circle, List, Users, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type SideMenuMode = "responsive" | "absolute";

type SideMenuProps = {
  mode?: SideMenuMode;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  brandTitle?: string;
};

function SideMenuDesktop({ brandTitle }: { brandTitle: string }) {
  const location = useLocation();

  const linkClassName = (to: string) => {
    const isActive = location.pathname === to;
    return [
      "flex items-center gap-3 px-6 py-2 text-sm text-black transition-colors",
      isActive ? "bg-gray-50" : "hover:bg-gray-50",
    ].join(" ");
  };

  return (
    <aside className="w-[240px] border-r border-gray-200 bg-white flex-shrink-0 hidden lg:flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-black">{brandTitle}</h1>
      </div>

      <nav className="flex-1 py-6">
        <div className="mb-6">
          <h2 className="px-6 mb-3 text-sm font-medium text-black">Discover</h2>
          <ul className="space-y-1">
            <li>
              <Link to="/" className={linkClassName("/")}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className={linkClassName("/browse")}
              >
                <Search className="w-5 h-5" />
                <span>Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/recruiter" className={linkClassName("/recruiter")}
              >
                <Users className="w-5 h-5" />
                <span>Recruiter</span>
              </Link>
            </li>
            <li>
              <Link to="/setting" className={linkClassName("/setting")}
              >
                <Circle className="w-5 h-5" />
                <span>Setting</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="px-6 mb-3 text-sm font-medium text-black">Report</h2>
          <ul className="space-y-1">
            <li>
              <Link to="/history" className={linkClassName("/history")}
              >
                <List className="w-5 h-5" />
                <span>History</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function SideMenuMobile({
  brandTitle,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  brandTitle: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const location = useLocation();

  const linkClassName = (to: string) => {
    const isActive = location.pathname === to;
    return [
      "flex items-center gap-3 px-6 py-2 text-sm text-black transition-colors",
      isActive ? "bg-gray-50" : "hover:bg-gray-50",
    ].join(" ");
  };

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">{brandTitle}</h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6">
          <div className="mb-6">
            <h2 className="px-6 mb-3 text-sm font-medium text-black">Discover</h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className={linkClassName("/")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className={linkClassName("/browse")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  <span>Browse</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/recruiter"
                  className={linkClassName("/recruiter")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Recruiter</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/setting"
                  className={linkClassName("/setting")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Circle className="w-5 h-5" />
                  <span>Setting</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="px-6 mb-3 text-sm font-medium text-black">Report</h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/history"
                  className={linkClassName("/history")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <List className="w-5 h-5" />
                  <span>History</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default function SideMenu({
  mode = "responsive",
  mobileMenuOpen,
  setMobileMenuOpen,
  brandTitle = "INSE MVP",
}: SideMenuProps) {
  if (mode === "absolute") {
    return (
      <div className="border-r border-r-[#E0E0E0] bg-[#FFF] w-64 h-full absolute left-0 top-0 overflow-hidden">
        <div className="flex flex-col items-start gap-1 w-60 absolute left-2 top-[78px]">
          <div className="flex py-0 px-4 items-center gap-4 rounded-lg w-full h-10">
            <p className="flex flex-col justify-center text-[#000] font-inter text-base font-semibold w-52 h-6">
              Discover
            </p>
          </div>
          <div className="flex py-0 px-4 items-center gap-4 rounded-lg bg-[#F7F7F7] w-full h-10">
            <Link to="/" className="flex items-center gap-4 w-full">
              <Home className="w-5 h-5" />
              <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-full">
                Home
              </p>
            </Link>
          </div>
          <div className="flex py-0 px-4 items-center gap-4 rounded-lg bg-[#FFF] w-full h-10">
            <Link to="/browse" className="flex items-center gap-4 w-full">
              <Search className="w-5 h-5" />
              <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-full">
                Browse
              </p>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 w-60 absolute left-2 top-[274px]">
          <div className="flex py-0 px-4 items-center gap-2 w-full">
            <p className="text-[#000] font-inter text-base font-semibold w-full">
              Report
            </p>
          </div>
          <div className="flex py-0 px-4 items-center gap-4 rounded-lg bg-[#FFF] w-full h-10">
            <Link to="/history" className="flex items-center gap-4 w-full">
              <List className="w-5 h-5" />
              <p className="line-clamp-1 overflow-hidden text-[#000] text-ellipsis font-inter text-base font-medium w-full">
                History
              </p>
            </Link>
          </div>
        </div>
        <p className="text-[#000] font-inter text-xl font-semibold w-[95px] h-[30px] absolute left-6 top-6 tracking-[-0.01em]">
          {brandTitle}
        </p>
      </div>
    );
  }

  return (
    <>
      <SideMenuDesktop brandTitle={brandTitle} />
      {typeof mobileMenuOpen === "boolean" && setMobileMenuOpen ? (
        <SideMenuMobile
          brandTitle={brandTitle}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      ) : null}
    </>
  );
}
