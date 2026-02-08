import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1A1F27] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-200 mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/strategies">
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Go to Strategies
          </button>
        </Link>
      </div>
    </div>
  );
}