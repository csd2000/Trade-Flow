import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play,
  CheckCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Target,
  ChevronRight,
  Award,
  Star,
  ArrowLeft,
  ExternalLink,
  BarChart3
} from "lucide-react";
import { strategies } from "../data/strategies";
import { saveUserStrategy, setAlertsForStrategy, openInBuilder, backtestStrategy } from "../services/strategies";

export default function StrategyTraining() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/training/:slug');
  const [completedSteps, setCompletedSteps] = useState(0);
  
  const strategy = strategies.find(s => s.slug === params?.slug);
  
  if (!strategy) {
    return (
      <div className="p-6 bg-[#1A1F27] min-h-screen text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl mb-4">Strategy not found.</p>
          <Link href="/strategies" className="text-cyan-400 hover:text-cyan-300 underline">
            ← Back to strategies
          </Link>
        </div>
      </div>
    );
  }
  
  const handleActionClick = async (action: string) => {
    switch (action) {
      case "save":
        await saveUserStrategy(strategy);
        break;
      case "alerts":
        await setAlertsForStrategy(strategy.slug);
        break;
      case "builder":
        await openInBuilder(strategy.slug);
        break;
      case "backtest":
        await backtestStrategy(strategy.slug);
        break;
    }
  };

  // Training modules for each strategy
  const trainingModules = [
    {
      id: 1,
      step: 1,
      title: "Strategy Overview & Fundamentals",
      duration: "15 minutes",
      description: "Master the core concepts and theoretical foundation",
      completed: completedSteps >= 1
    },
    {
      id: 2,
      step: 2,
      title: "Market Analysis & Setup",
      duration: "20 minutes",
      description: "Learn to identify optimal market conditions",
      completed: completedSteps >= 2
    },
    {
      id: 3,
      step: 3,
      title: "Entry Signals & Timing",
      duration: "25 minutes", 
      description: "Precise entry techniques and signal confirmation",
      completed: completedSteps >= 3
    },
    {
      id: 4,
      step: 4,
      title: "Risk Management Protocol",
      duration: "20 minutes",
      description: "Position sizing and stop-loss strategies",
      completed: completedSteps >= 4
    },
    {
      id: 5,
      step: 5,
      title: "Exit Strategies & Profit Taking",
      duration: "25 minutes",
      description: "Systematic profit-taking and trade management",
      completed: completedSteps >= 5
    },
    {
      id: 6,
      step: 6,
      title: "Live Trading Practice",
      duration: "30 minutes",
      description: "Step-by-step guided practice with real examples",
      completed: completedSteps >= 6
    }
  ];

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

  const handleStartModule = (moduleId: number) => {
    setCompletedSteps(moduleId);
  };

  const progressPercentage = (completedSteps / trainingModules.length) * 100;

  return (
    <div className="min-h-screen bg-[#1A1F27] text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/strategies" className="text-cyan-400 hover:text-cyan-300 underline mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Strategies
          </Link>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {strategy.title}
          </h1>
          
          <p className="text-lg text-gray-300 mb-6 max-w-4xl">
            {strategy.summary}
          </p>

          {/* Strategy Info */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`text-xs px-3 py-1 rounded border ${getCategoryColor(strategy.category)}`}>
              {strategy.category}
            </span>
            <span className={`text-xs px-3 py-1 rounded ${getRiskColor(strategy.risk)}`}>
              {strategy.risk} Risk
            </span>
            {strategy.roiRange && (
              <span className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400">
                {strategy.roiRange}
              </span>
            )}
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Training Modules */}
          <div className="bg-[#232B36] rounded-xl p-6 border border-[#2C3744] hover:shadow-lg transition">
            <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Training Modules
            </h2>
            
            <div className="space-y-3">
              {trainingModules.map((module) => (
                <div 
                  key={module.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    module.completed 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                      : 'bg-[#1A2431] border-[#2C3744] text-gray-300 hover:border-cyan-500/30'
                  }`}
                  onClick={() => handleStartModule(module.step)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      module.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-cyan-600 text-white'
                    }`}>
                      {module.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-bold">{module.step}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{module.title}</div>
                      <div className="text-xs opacity-70">{module.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#2C3744]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-200">Progress</span>
                <span className="text-white">{completedSteps}/{trainingModules.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[#232B36] rounded-xl p-6 border border-[#2C3744] hover:shadow-lg transition">
            <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Strategy Actions
            </h2>
            <div className="grid gap-3">
              <button 
                onClick={() => handleActionClick("builder")}
                className="rounded-lg px-4 py-3 bg-cyan-600 hover:bg-cyan-500 hover:shadow-lg transition-all text-white font-medium flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Builder
              </button>
              <button 
                onClick={() => handleActionClick("backtest")}
                className="rounded-lg px-4 py-3 bg-[#1F2630] border border-[#2C3744] hover:bg-[#263140] transition-all text-gray-300 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Backtest Strategy
              </button>
              <button 
                onClick={() => handleActionClick("alerts")}
                className="rounded-lg px-4 py-3 bg-[#1F2630] border border-[#2C3744] hover:bg-[#263140] transition-all text-gray-300 flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Set Alerts
              </button>
              <button 
                onClick={() => handleActionClick("save")}
                className="rounded-lg px-4 py-3 bg-[#1F2630] border border-[#2C3744] hover:bg-[#263140] transition-all text-gray-300 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Save Strategy
              </button>
            </div>
          </div>
        </div>

        {/* Completion Card */}
        {completedSteps === trainingModules.length && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-green-400 mb-2">Training Complete!</h2>
            <p className="text-green-300">You've mastered {strategy.title}. Ready to put your skills into practice!</p>
          </div>
        )}
      </div>
    </div>
  );
}