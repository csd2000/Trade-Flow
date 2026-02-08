import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from "@/hooks/useAuth";
import { useSkillLevel } from "@/hooks/useSkillLevel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnlockProgressCard } from "@/components/UnlockProgressCard";
import {
  BookOpen,
  TrendingUp,
  Shield,
  Clock,
  Play,
  Star,
  BarChart3,
  Settings,
  User,
  Brain,
  LineChart,
  Zap,
  DollarSign,
  Building2,
  Newspaper,
  GraduationCap,
  ArrowRight,
  Target,
  Lightbulb
} from 'lucide-react';
import { trainingApi } from '@/services/training-api';

export default function EnhancedStrategyIndex() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { skillLevel, unlockProgress, isExperiencedUnlocked } = useSkillLevel();

  const isBeginner = skillLevel === 'beginner' && !isExperiencedUnlocked;

  // Fetch all strategies
  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['/api/strategies'],
    queryFn: () => trainingApi.getStrategies()
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['/api/analytics/user/stats'],
    queryFn: () => trainingApi.getUserStats()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <div className="h-12 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg w-3/4 mx-auto"></div>
              <div className="h-6 bg-muted/30 rounded w-1/2 mx-auto"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card p-6 space-y-3">
                  <div className="h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded"></div>
                  <div className="h-4 bg-muted/30 rounded w-3/4"></div>
                  <div className="h-2 bg-muted/20 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Search skeleton */}
            <div className="glass-card p-6">
              <div className="h-12 bg-muted/30 rounded"></div>
            </div>
            
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted/30 rounded w-16"></div>
                    <div className="h-6 bg-muted/30 rounded w-12"></div>
                  </div>
                  <div className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded"></div>
                  <div className="h-4 bg-muted/20 rounded w-full"></div>
                  <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                  <div className="h-10 bg-gradient-to-r from-primary/30 to-accent/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section - Clean Professional Design */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-700/50 p-8 sm:p-10 lg:p-14">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-400 text-sm font-medium">
              <Zap className="h-4 w-4" />
              AI-Powered Trading Platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Professional Trading Academy
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Master institutional-grade trading strategies with AI-powered analytics, 
              real-time signals, and proven methodologies.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button onClick={() => setLocation('/login')} className="bg-violet-600 hover:bg-violet-700 text-white text-base px-6 py-3 rounded-lg font-semibold w-full sm:w-auto">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline" onClick={() => setLocation('/strategies')} className="text-base px-6 py-3 rounded-lg font-medium border-slate-600 text-slate-200 hover:bg-slate-800 w-full sm:w-auto">
                  Browse Strategies
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Beginner Guidance Section - Only shown to beginners */}
        {isBeginner && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 px-4 md:px-0">
              <div className="p-2 rounded-lg bg-emerald-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Your Learning Journey
              </h2>
              <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-xs">
                Recommended
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Unlock Progress Card */}
              <div className="lg:col-span-2">
                <UnlockProgressCard />
              </div>

              {/* Quick Start Card */}
              <Card className="bg-slate-800/90 border-slate-700/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Getting Started
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm">
                    Recommended first steps for new traders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setLocation('/master-academy')}
                    className="w-full justify-between bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Start with Academy
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setLocation('/training/defi-mastery')}
                    variant="outline"
                    className="w-full justify-between border-slate-600 text-slate-200 hover:bg-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      DeFi Fundamentals
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setLocation('/daily-checklist')}
                    variant="outline"
                    className="w-full justify-between border-slate-600 text-slate-200 hover:bg-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Daily Checklist
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* AI Tools Section - Professional Cards */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-4 md:px-0">
            <div className="p-2 rounded-lg bg-violet-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              AI-Powered Trading Tools
            </h2>
            {isBeginner && (
              <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-xs">
                Explore after training
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-violet-500/50 transition-all duration-200"
              onClick={() => setLocation('/timeseries')}
              data-testid="card-timeseries-ai"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-violet-600">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">AI</Badge>
                </div>
                <CardTitle className="text-white text-base">Time Series AI</CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  AI-powered forecasting for stocks, crypto, and forex
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Stocks</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Crypto</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Forex</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-200"
              onClick={() => setLocation('/quant')}
              data-testid="card-quant-ai"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-cyan-600">
                    <LineChart className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Live</Badge>
                </div>
                <CardTitle className="text-white text-base">Quant AI Trading</CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Advanced technical analysis with AI signals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">RSI</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">MACD</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Signals</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-orange-500/50 transition-all duration-200"
              onClick={() => setLocation('/ai-profit-studio')}
              data-testid="card-ai-profit-studio"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-600">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Hot</Badge>
                </div>
                <CardTitle className="text-white text-base">AI Profit Studio</CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Scan 8,000+ stocks for high-probability setups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Scanner</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Signals</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Analysis</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-yellow-500/50 transition-all duration-200"
              onClick={() => setLocation('/universal-forecaster')}
              data-testid="card-universal-forecaster"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-yellow-600">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">New</Badge>
                </div>
                <CardTitle className="text-white text-base">Universal Forecaster</CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Multi-asset predictions with real-time alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Stocks</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Crypto</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Forex</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Training Programs - Clean Design */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-4 md:px-0">
            <div className="p-2 rounded-lg bg-emerald-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Training Programs
            </h2>
            <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Professional</Badge>
          </div>
          <p className="text-slate-200 px-4 md:px-0">
            Comprehensive trading education with step-by-step guidance
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/defi-mastery')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-blue-600">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  DeFi Mastery
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Complete DeFi education: yield farming, protocols, safety, stablecoins, and passive income
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">7 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Yields</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-green-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/exit-profit')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-green-600">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Exit & Profit
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Profit-taking strategies and protecting gains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Exits</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/portfolio-tools')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-purple-600">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Portfolio Tools
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Track positions and manage allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Portfolio</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-yellow-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/community-tools')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-yellow-600">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  Strategy Builder
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Build custom strategies with community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Builder</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-orange-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/education-planning')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-orange-600">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Education & Planning
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Economic calendar and structured learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Calendar</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-emerald-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/options-income')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-emerald-600">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  Options Income
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Credit spreads and overnight setups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Income</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-indigo-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/smart-money')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-indigo-600">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  Smart Money
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Institutional capital and order flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Institutional</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/day-trading')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-amber-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Day Trading
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Fast-paced intraday and scalping techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">3 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Scalping</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/ai-tools')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-cyan-600">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  AI Tools
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  AI decision systems and pattern mastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">3 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">AI</Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/90 border-slate-700/60 cursor-pointer hover:bg-slate-800 hover:border-rose-500/50 transition-all duration-200"
              onClick={() => setLocation('/training/news-discovery')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-rose-600">
                    <Newspaper className="h-4 w-4 text-white" />
                  </div>
                  News Trading
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  Narrative and contrarian strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">2 Variants</Badge>
                  <Badge className="bg-slate-700 text-slate-200 border-slate-600 text-xs">Discovery</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Dashboard */}
        {userStats && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 px-4 md:px-0">
              <div className="p-2 rounded-lg bg-blue-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Your Trading Journey</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="metric-card group">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      {userStats.strategiesCompleted}
                    </div>
                    <div className="text-sm text-slate-300 font-medium">Strategies Mastered</div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000" 
                           style={{ width: `${(userStats.strategiesCompleted / 24) * 100}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="metric-card group">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold profit-green">
                      {userStats.modulesCompleted}
                    </div>
                    <div className="text-sm text-slate-300 font-medium">Modules Complete</div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000" 
                           style={{ width: `${(userStats.modulesCompleted / 100) * 100}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="metric-card group">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                      {userStats.totalTimeSpent}h
                    </div>
                    <div className="text-sm text-slate-300 font-medium">Learning Hours</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-200">
                      <Clock className="w-3 h-3" />
                      This month
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="metric-card group">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                      {userStats.alertsActive}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Active Alerts</div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="metric-card group">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                      {userStats.strategiesSaved}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Saved Strategies</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      Favorites
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="metric-card group">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                      {userStats.backtestsRun}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Backtests Run</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="w-3 h-3" />
                      Analyzed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}