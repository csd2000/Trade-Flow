import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen,
  TrendingUp,
  DollarSign,
  Brain,
  Target,
  Users,
  Shield,
  Calendar,
  CheckCircle,
  Play,
  ArrowRight,
  Star,
  Zap,
  BarChart3,
  Activity,
  Unlock,
  Trophy,
  Clock,
  Download
} from "lucide-react";

interface Strategy {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  lessons: number;
  completedLessons: number;
  successRate: string;
  keyPoints: string[];
  isUnlocked: boolean;
  isFree: boolean;
}

export default function FreeTrainingAcademyComplete() {
  const [, setLocation] = useLocation();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Top 8 World-Class Free Trading Strategies
  const strategies: Strategy[] = [
    {
      id: 1,
      title: "Complete DeFi Mastery",
      category: "DeFi",
      difficulty: "Beginner",
      duration: "4-6 weeks",
      description: "Master DeFi from basics to advanced strategies including passive income, yield farming, and safety protocols.",
      lessons: 25,
      completedLessons: 0,
      successRate: "94%",
      keyPoints: [
        "DeFi fundamentals and wallet setup",
        "Yield farming and liquidity mining",
        "Safety protocols and rug pull detection",
        "Portfolio tracking and optimization",
        "Exit strategies and profit taking"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 2,
      title: "Professional Stock Trading",
      category: "Stocks",
      difficulty: "Intermediate",
      duration: "6-8 weeks",
      description: "Complete stock trading system combining day trading, swing trading, and momentum strategies.",
      lessons: 30,
      completedLessons: 0,
      successRate: "87%",
      keyPoints: [
        "Technical analysis and chart patterns",
        "Day trading setups and execution",
        "Risk management and position sizing",
        "Market scanning and stock selection",
        "Psychology and discipline"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 3,
      title: "Forex Trading Mastery",
      category: "Forex",
      difficulty: "Intermediate",
      duration: "3-4 weeks",
      description: "Complete forex trading course covering currency analysis, risk management, and profitable strategies.",
      lessons: 20,
      completedLessons: 0,
      successRate: "82%",
      keyPoints: [
        "Currency pair analysis",
        "Technical and fundamental analysis",
        "Trading sessions and timing",
        "Risk management for forex",
        "Economic calendar integration"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 4,
      title: "Trading Psychology Mastery",
      category: "Psychology",
      difficulty: "All Levels",
      duration: "2-3 weeks",
      description: "Master the mental game of trading with emotional control and disciplined decision-making.",
      lessons: 15,
      completedLessons: 0,
      successRate: "96%",
      keyPoints: [
        "Emotional regulation techniques",
        "Mindfulness for traders",
        "Discipline and consistency",
        "Stress management",
        "Building winning habits"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 5,
      title: "Passive Income Systems",
      category: "Income",
      difficulty: "Beginner",
      duration: "3-4 weeks",
      description: "Build multiple passive income streams through crypto staking, dividends, and yield generation.",
      lessons: 18,
      completedLessons: 0,
      successRate: "91%",
      keyPoints: [
        "Crypto staking and rewards",
        "Dividend stock selection",
        "Yield pool optimization",
        "Risk diversification",
        "Automated income tracking"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 6,
      title: "Market Analysis & Research",
      category: "Analysis",
      difficulty: "Advanced",
      duration: "4-5 weeks",
      description: "Advanced market analysis combining technical, fundamental, and sentiment analysis.",
      lessons: 22,
      completedLessons: 0,
      successRate: "89%",
      keyPoints: [
        "Advanced technical analysis",
        "Fundamental research methods",
        "Market sentiment indicators",
        "Economic event analysis",
        "Multi-timeframe analysis"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 7,
      title: "Risk Management Pro",
      category: "Risk",
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      description: "Professional risk management techniques to protect capital and maximize returns.",
      lessons: 16,
      completedLessons: 0,
      successRate: "93%",
      keyPoints: [
        "Position sizing calculations",
        "Stop loss optimization",
        "Portfolio risk assessment",
        "Correlation analysis",
        "Capital preservation strategies"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 8,
      title: "Crypto Project Discovery",
      category: "Research",
      difficulty: "Intermediate",
      duration: "3-4 weeks",
      description: "Find and evaluate promising crypto projects before they explode in value.",
      lessons: 19,
      completedLessons: 0,
      successRate: "85%",
      keyPoints: [
        "Project evaluation frameworks",
        "Tokenomics analysis",
        "Team and roadmap assessment",
        "Community and adoption metrics",
        "Risk vs reward calculation"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 9,
      title: "Exit Strategy Planning",
      category: "Strategy",
      difficulty: "Advanced",
      duration: "2-3 weeks",
      description: "Master the art of taking profits and exiting positions at optimal times.",
      lessons: 14,
      completedLessons: 0,
      successRate: "88%",
      keyPoints: [
        "Profit taking strategies",
        "Market cycle timing",
        "Exit signal recognition",
        "Portfolio rebalancing",
        "Tax optimization"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 10,
      title: "Box Strategy Trading",
      category: "Patterns",
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      description: "Master the box trading strategy for consistent profits in ranging markets and breakout opportunities.",
      lessons: 16,
      completedLessons: 0,
      successRate: "89%",
      keyPoints: [
        "Box pattern identification",
        "Support and resistance levels",
        "Range trading techniques",
        "Breakout confirmation signals",
        "Risk management in box trades"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 11,
      title: "ORB (Opening Range Breakout)",
      category: "Breakouts",
      difficulty: "Advanced",
      duration: "3-4 weeks",
      description: "Learn the powerful Opening Range Breakout strategy for capturing explosive morning moves in stocks and crypto.",
      lessons: 20,
      completedLessons: 0,
      successRate: "91%",
      keyPoints: [
        "Opening range identification",
        "Breakout confirmation techniques",
        "Volume analysis for ORB",
        "Time-based entry strategies",
        "Profit-taking in ORB trades"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 12,
      title: "5-Minute Investing System",
      category: "Quick",
      difficulty: "Beginner",
      duration: "1-2 weeks",
      description: "Master the simple 5-minute daily investing system for consistent market gains with minimal time commitment.",
      lessons: 12,
      completedLessons: 0,
      successRate: "88%",
      keyPoints: [
        "5-minute daily routine setup",
        "Simple market scanning techniques",
        "Quick decision-making framework",
        "Automated investing strategies",
        "Time-efficient portfolio management"
      ],
      isUnlocked: true,
      isFree: true
    },
    {
      id: 13,
      title: "Master Crypto Profit-Taking Strategy",
      category: "Advanced",
      difficulty: "Expert",
      duration: "4-6 weeks",
      description: "Complete systematic framework for crypto profit-taking using ABN methodology, technical triggers, and automated orders.",
      lessons: 18,
      completedLessons: 0,
      successRate: "94%",
      keyPoints: [
        "Systematic profit-taking framework",
        "RSI and Fibonacci technical triggers", 
        "Automated take-profit and trailing stops",
        "Portfolio rebalancing strategies",
        "Tax-optimized exit planning"
      ],
      isUnlocked: true,
      isFree: true
    }
  ];

  const categories = Array.from(new Set(strategies.map(s => s.category)));

  const filteredStrategies = activeTab === "all" 
    ? strategies 
    : strategies.filter(s => s.category === activeTab);

  const handleStartTraining = (strategy: Strategy) => {
    // Navigate to specific training page
    setLocation(`/training/${strategy.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-white dark:text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DeFi': return <DollarSign className="h-5 w-5" />;
      case 'Stocks': return <TrendingUp className="h-5 w-5" />;
      case 'Forex': return <BarChart3 className="h-5 w-5" />;
      case 'Psychology': return <Brain className="h-5 w-5" />;
      case 'Income': return <DollarSign className="h-5 w-5" />;
      case 'Analysis': return <Activity className="h-5 w-5" />;
      case 'Risk': return <Shield className="h-5 w-5" />;
      case 'Research': return <Target className="h-5 w-5" />;
      case 'Strategy': return <Zap className="h-5 w-5" />;
      case 'Technology': return <Star className="h-5 w-5" />;
      case 'Patterns': return <Target className="h-5 w-5" />;
      case 'Breakouts': return <Zap className="h-5 w-5" />;
      case 'Quick': return <Clock className="h-5 w-5" />;
      case 'Advanced': return <TrendingUp className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-green-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-gray-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              🎓 World's Simplest Trading Academy
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto opacity-95 px-4">
              Learn 13 proven strategies step-by-step. Including master crypto profit-taking system with automated alerts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4">
              <Badge className="bg-green-500 text-gray-900 text-base sm:text-lg px-3 sm:px-4 py-2 font-bold shadow-lg">
                🆓 100% FREE FOREVER
              </Badge>
              <Badge className="bg-yellow-400 text-black text-base sm:text-lg px-3 sm:px-4 py-2 font-bold shadow-lg">
                ⚡ NO PAYWALLS
              </Badge>
              <Badge className="bg-blue-500 text-gray-900 text-base sm:text-lg px-3 sm:px-4 py-2 font-bold shadow-lg">
                🎯 STEP BY STEP
              </Badge>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
              <p className="text-base sm:text-lg font-semibold mb-2">🎯 FEATURED: Master Crypto Profit-Taking Strategy</p>
              <p className="text-sm sm:text-base opacity-90">Complete systematic framework with ABN methodology, automated orders, and tax optimization!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="text-center bg-white/90 dark:bg-gray-800/90 shadow-lg border-2 border-green-200 hover:border-green-400 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">13</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-600">Complete Strategies</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/90 dark:bg-gray-800/90 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">271</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-600">Total Lessons</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/90 dark:bg-gray-800/90 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-600">Free Access</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/90 dark:bg-gray-800/90 shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">5 min</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-600">Daily Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Category Filter - Mobile Friendly */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-900">
            Choose Your Learning Path 👇
          </h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-2 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg">
              <TabsTrigger 
                value="all" 
                className="px-4 py-2 rounded-xl font-semibold text-sm sm:text-base data-[state=active]:bg-green-500 data-[state=active]:text-gray-900"
              >
                🎯 All (13)
              </TabsTrigger>
              <TabsTrigger 
                value="Quick" 
                className="px-4 py-2 rounded-xl font-semibold text-sm sm:text-base data-[state=active]:bg-blue-500 data-[state=active]:text-gray-900"
              >
                ⚡ Quick Start
              </TabsTrigger>
              <TabsTrigger 
                value="DeFi" 
                className="px-4 py-2 rounded-xl font-semibold text-sm sm:text-base data-[state=active]:bg-purple-500 data-[state=active]:text-gray-900"
              >
                💰 DeFi
              </TabsTrigger>
              <TabsTrigger 
                value="Stocks" 
                className="px-4 py-2 rounded-xl font-semibold text-sm sm:text-base data-[state=active]:bg-orange-500 data-[state=active]:text-gray-900"
              >
                📈 Stocks
              </TabsTrigger>
              <TabsTrigger 
                value="Advanced" 
                className="px-4 py-2 rounded-xl font-semibold text-sm sm:text-base data-[state=active]:bg-red-500 data-[state=active]:text-gray-900"
              >
                🚀 Advanced
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Strategies Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {filteredStrategies.map(strategy => (
            <Card 
              key={strategy.id}
              className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-white/95 dark:bg-gray-800/95 border-2 hover:border-green-400 shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400">
                    {getCategoryIcon(strategy.category)}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Badge className="bg-green-500 text-gray-900 text-xs sm:text-sm font-bold shadow-md">
                      🆓 FREE
                    </Badge>
                    <Badge className={`${getDifficultyColor(strategy.difficulty)} text-xs sm:text-sm font-semibold`}>
                      {strategy.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-900 leading-tight">
                  {strategy.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-600 mt-2 leading-relaxed">
                  {strategy.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{strategy.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{strategy.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="text-green-600 font-semibold">{strategy.successRate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Unlocked</span>
                  </div>
                </div>
                
                <Progress 
                  value={(strategy.completedLessons / strategy.lessons) * 100} 
                  className="h-2"
                />
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-gray-900 font-bold py-3 sm:py-2 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handleStartTraining(strategy)}
                  >
                    🚀 Start Learning
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-400 font-semibold py-3 sm:py-2 text-sm sm:text-base"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    📋 Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Free Access Guarantee */}
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <Unlock className="h-4 w-4" />
          <AlertDescription className="text-lg">
            <strong>100% Free Forever Guarantee:</strong> All 13 strategies including Master Crypto Profit-Taking Strategy are completely free with no hidden costs, 
            no trial periods, and no premium upgrades required. Full access to every lesson, tool, and resource.
          </AlertDescription>
        </Alert>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-gray-900 border-0 mt-12">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-6">
                Start Your Trading Journey Today
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                Choose any strategy and begin learning immediately. No registration required, no credit card needed.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-4"
                  onClick={() => handleStartTraining(strategies[0])}
                >
                  Start with DeFi Mastery
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-gray-900 border-white hover:bg-white hover:text-green-600 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-bold shadow-lg"
                  onClick={() => handleStartTraining(strategies[12])}
                >
                  🎯 Crypto Profit Master
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-gray-900 border-white hover:bg-white hover:text-blue-600 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-bold shadow-lg"
                  onClick={() => handleStartTraining(strategies[9])}
                >
                  📦 Box Strategy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Details Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(selectedStrategy.category)}
                  <div>
                    <CardTitle className="text-2xl">{selectedStrategy.title}</CardTitle>
                    <CardDescription className="mt-1 text-lg">
                      {selectedStrategy.description}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedStrategy(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedStrategy.lessons}</div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedStrategy.successRate}</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedStrategy.duration}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">FREE</div>
                  <div className="text-sm text-gray-600">Cost</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">What You'll Learn:</h4>
                <div className="grid gap-2">
                  {selectedStrategy.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <Star className="h-4 w-4" />
                <AlertDescription>
                  This complete strategy is 100% free forever. No trial periods, no premium upgrades, 
                  no hidden costs. Full access to all lessons and materials.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={() => {
                    setSelectedStrategy(null);
                    handleStartTraining(selectedStrategy);
                  }}
                >
                  Start This Strategy Now
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}