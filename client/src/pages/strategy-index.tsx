import { Link } from "wouter";
import { strategies } from "../data/strategies";

export default function StrategyIndex() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DeFi": return "bg-cyan-600/20 text-cyan-400 border-cyan-500/30";
      case "Day": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Swing": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Alpha": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Education": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-200 border-gray-500/30";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-500/20 text-green-400";
      case "Medium": return "bg-yellow-500/20 text-yellow-400";
      case "High": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-200";
    }
  };

  return (
    <div className="p-6 bg-[#1A1F27] min-h-screen text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Professional Trading Strategies
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 max-w-4xl leading-relaxed">
            Master 24 elite trading strategies with step-by-step guidance, real-world applications, and professional execution systems.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-[#232B36] border border-[#2C3744] rounded-xl p-4 lg:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="text-2xl lg:text-3xl font-bold text-cyan-400 mb-2">{strategies.length}</div>
            <div className="text-sm lg:text-base text-gray-300 font-medium">Elite Strategies</div>
          </div>
          <div className="bg-[#232B36] border border-[#2C3744] rounded-xl p-4 lg:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="text-2xl lg:text-3xl font-bold text-purple-400 mb-2">100+</div>
            <div className="text-sm lg:text-base text-gray-300 font-medium">Training Modules</div>
          </div>
          <div className="bg-[#232B36] border border-[#2C3744] rounded-xl p-4 lg:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-sm lg:text-base text-gray-300 font-medium">Free Access</div>
          </div>
          <div className="bg-[#232B36] border border-[#2C3744] rounded-xl p-4 lg:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="text-2xl lg:text-3xl font-bold text-orange-400 mb-2">90%+</div>
            <div className="text-sm lg:text-base text-gray-300 font-medium">Success Rate</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {strategies.map(s => (
            <Link key={s.id} href={`/training/${s.slug}`}>
              <div className="bg-[#232B36] border border-[#2C3744] rounded-xl p-4 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(s.category)}`}>
                    {s.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getRiskColor(s.risk)}`}>
                    {s.risk}
                  </span>
                </div>
                
                <div className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {s.title}
                </div>
                
                <div className="text-sm text-gray-300 mb-3 leading-relaxed">
                  {s.summary}
                </div>

                {s.roiRange && (
                  <div className="text-sm text-green-400 mb-3 font-medium">
                    ROI: {s.roiRange}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(t => (
                    <span key={`${s.slug}-${t}`} className="text-xs px-2 py-1 rounded bg-[#1A2431] text-gray-200 border border-[#2C3744]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}