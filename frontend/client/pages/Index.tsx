import { useState } from "react";
import { Home, Search, Circle, List, Menu, X, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [problemText, setProblemText] = useState("");
  const [codeText, setCodeText] = useState("// write code here..");
  const [outputText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white font-['Inter']">
      {/* Sidebar */}
      <aside className="w-[240px] border-r border-gray-200 bg-white flex-shrink-0 hidden lg:flex flex-col">
        {/* Logo/Brand */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-black">INSE MVP</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {/* Discover Section */}
          <div className="mb-6">
            <h2 className="px-6 mb-3 text-sm font-medium text-black">
              Discover
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span>Browse</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/recruiter"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>Recruiter</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/setting"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                >
                  <Circle className="w-5 h-5" />
                  <span>Setting</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Report Section */}
          <div>
            <h2 className="px-6 mb-3 text-sm font-medium text-black">
              Report
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/history"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                >
                  <List className="w-5 h-5" />
                  <span>History</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Brand */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">INSE MVP</h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {/* Discover Section */}
          <div className="mb-6">
            <h2 className="px-6 mb-3 text-sm font-medium text-black">
              Discover
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  <span>Browse</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/recruiter"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Recruiter</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/setting"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Circle className="w-5 h-5" />
                  <span>Setting</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Report Section */}
          <div>
            <h2 className="px-6 mb-3 text-sm font-medium text-black">
              Report
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/history"
                  className="flex items-center gap-3 px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
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
              Time 42:13
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
                    <div className="text-base text-black">Title</div>
                    <div className="text-base text-black">
                      Problem statement
                    </div>
                    <div className="text-base text-black">Constraints</div>
                    <div className="text-base text-black">
                      Examples (toggle)
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-black mb-4">
                  AI Assistant
                </h2>
                <div className="flex-1 border border-gray-300 rounded bg-white p-6">
                  <div className="space-y-4">
                    <div className="text-base text-black">AI Chat</div>
                    <div className="text-base text-black">Q / A history</div>
                    <div className="text-base text-black">[ Ask AI ... ]</div>
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
                  <button className="px-4 lg:px-6 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
                    RUN
                  </button>
                  <button className="px-4 lg:px-6 py-2 border border-gray-300 text-black text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                    Run Test
                  </button>
                </div>
              </div>
              <textarea
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                className="w-full h-64 border border-gray-300 rounded bg-gray-50 p-4 font-mono text-sm text-black resize-none focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="// write code here.."
              />
            </div>

            {/* Output Section */}
            <div className="flex flex-col">
              <h2 className="text-base font-medium text-black mb-4">
                Output / Error logs
              </h2>
              <div className="w-full min-h-[120px] border border-gray-300 rounded bg-gray-50 p-4 font-mono text-sm text-black">
                {outputText || ""}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-4 lg:px-6 py-2 bg-gray-300 text-gray-600 text-sm font-semibold rounded cursor-not-allowed"
          >
            Submit Solution
          </button>
          <div className="text-xs lg:text-sm text-black">AI usage is allowed</div>
        </footer>
      </div>
    </div>
  );
}
