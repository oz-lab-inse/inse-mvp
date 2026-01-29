import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function History() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-semibold text-black">History</h1>
        <p className="text-gray-600">
          This page is under construction. Continue prompting to fill in this
          page's content if you'd like.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to IDE
        </Link>
      </div>
    </div>
  );
}
