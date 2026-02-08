import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Target,
  Shield,
  Brain,
  Activity,
  Award,
  CheckCircle,
  Play,
  BarChart3,
  Zap,
  Globe,
  Users,
  Star,
  ArrowRight,
  Eye,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PortfolioData {
  totalValue: number;
  dailyIncome: number;
  totalEarnings: number;
  apr: number;
  riskScore: number;
}

interface StrategyModule {
  id: number;
  title: string;
  category: string;
  network: string;
  apy: string;
  tvl: string;
  riskLevel: string;
  completed: boolean;
  progress: number;
  badge?: string;
}

interface MarketSentiment {
  fearGreedIndex: number;
  sentiment: string;
  trendingAssets: string[];
  whaleActivity: string;
  lastUpdated: string;
}

export default function DeFiStrategistDashboard() {
  const [portfolioValue, setPortfolioValue] = useState(125000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fearGreedIndex, setFearGreedIndex] = useState(67);
  const { toast } = useToast();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioValue(prev => prev + (Math.random() - 0.5) * 100);
      setFearGreedIndex(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const portfolioData: PortfolioData = {
    totalValue: portfolioValue,
    dailyIncome: 342.50,
    totalEarnings: 15420.80,
    apr: 18.7,
    riskScore: 7.2
  };

  const strategyModules: StrategyModule[] = [
    {
      id: 1,
      title: "Compound V3 USDC Lending",
      category: "Lending",
      network: "Ethereum",
      apy: "4.2%",
      tvl: "$2.1B",
      riskLevel: "Low",
      completed: true,
      progress: 100,
      badge: "Master"
    },
    {
      id: 2,
      title: "Uniswap V3 LP Farming",
      category: "Liquidity",
      network: "Arbitrum",
      apy: "12.8%",
      tvl: "$890M",
      riskLevel: "Medium",
      completed: true,
      progress: 100,
      badge: "Expert"
    },
    {
      id: 3,
      title: "Aave V3 Leveraged Yield",
      category: "Leverage",
      network: "Polygon",
      apy: "23.4%",
      tvl: "$450M",
      riskLevel: "High",
      completed: false,
      progress: 65
    },
    {
      id: 4,
      title: "Curve 3pool Staking",
      category: "Stablecoins",
      network: "Ethereum",
      apy: "6.1%",
      tvl: "$1.2B",
      riskLevel: "Low",
      completed: false,
      progress: 30
    }
  ];

  const marketSentiment: MarketSentiment = {
    fearGreedIndex: fearGreedIndex,
    sentiment: fearGreedIndex > 75 ? "Extreme Greed" : fearGreedIndex > 55 ? "Greed" : fearGreedIndex > 45 ? "Neutral" : fearGreedIndex > 25 ? "Fear" : "Extreme Fear",
    trendingAssets: ["ETH", "ARB", "MATIC", "AAVE", "UNI"],
    whaleActivity: "High accumulation in DeFi protocols",
    lastUpdated: new Date().toLocaleTimeString()
  };

  const getSentimentColor = (index: number) => {
    if (index > 75) return "text-red-600";
    if (index > 55) return "text-orange-500";
    if (index > 45) return "text-yellow-500";
    if (index > 25) return "text-blue-500";
    return "text-green-600";
  };

  const getSentimentIcon = (index: number) => {
    if (index > 75) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (index > 25) return <Activity className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-600" />;
  };

  const handleStartModule = (module: StrategyModule) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    toast({
      title: "Module Started!",
      description: `Beginning "${module.title}" with step-by-step guidance`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">DeFi Strategist Dashboard</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Elite DeFi trading system with AI guidance, animated progress tracking, and real-time market insights
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className={`text-3xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
                  ${portfolioData.totalValue.toLocaleString()}
                </div>
                <div className="text-sm opacity-80">Portfolio Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">+${portfolioData.dailyIncome}</div>
                <div className="text-sm opacity-80">Daily Income</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{portfolioData.apr}%</div>
                <div className="text-sm opacity-80">Average APR</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">{portfolioData.riskScore}/10</div>
                <div className="text-sm opacity-80">Risk Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strategies">Strategy Hub</TabsTrigger>
            <TabsTrigger value="training">AI Training</TabsTrigger>
            <TabsTrigger value="market">Market Pulse</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Market Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Market Sentiment
                  <Badge variant="outline" className="ml-auto">
                    Updated: {marketSentiment.lastUpdated}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getSentimentIcon(marketSentiment.fearGreedIndex)}
                      <span className={`text-2xl font-bold ${getSentimentColor(marketSentiment.fearGreedIndex)}`}>
                        {marketSentiment.fearGreedIndex}
                      </span>
                    </div>
                    <Progress value={marketSentiment.fearGreedIndex} className="mb-2" />
                    <div className="text-sm font-medium">{marketSentiment.sentiment}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Trending Assets</div>
                    <div className="flex flex-wrap gap-1">
                      {marketSentiment.trendingAssets.map(asset => (
                        <Badge key={asset} variant="outline" className="text-xs">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Whale Activity</div>
                    <div className="text-sm text-slate-600 dark:text-slate-200">
                      {marketSentiment.whaleActivity}
                    </div>
                  </div>
                  <div>
                    <Button className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Earning Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategyModules.slice(0, 2).map(strategy => (
                    <div key={strategy.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{strategy.title}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          {strategy.apy}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span>{strategy.network}</span>
                        <span>TVL: {strategy.tvl}</span>
                        <Badge variant="outline" className={
                          strategy.riskLevel === 'Low' ? 'border-green-200 text-green-700' :
                          strategy.riskLevel === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-red-200 text-red-700'
                        }>
                          {strategy.riskLevel} Risk
                        </Badge>
                      </div>
                      {strategy.completed ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed</span>
                          {strategy.badge && (
                            <Badge className="bg-purple-100 text-purple-800">
                              {strategy.badge}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{strategy.progress}%</span>
                          </div>
                          <Progress value={strategy.progress} className="mb-2" />
                          <Button 
                            size="sm" 
                            onClick={() => handleStartModule(strategy)}
                            className="w-full"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Comparison Dashboard</CardTitle>
                <CardDescription>
                  Compare ROI, APY, TVL, and risk levels across all available strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {strategyModules.map(strategy => (
                    <div key={strategy.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div>
                          <h4 className="font-medium">{strategy.title}</h4>
                          <p className="text-sm text-slate-600">{strategy.category}</p>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{strategy.apy}</div>
                          <div className="text-xs text-slate-300">APY</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{strategy.tvl}</div>
                          <div className="text-xs text-slate-300">TVL</div>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className={
                            strategy.riskLevel === 'Low' ? 'border-green-200 text-green-700' :
                            strategy.riskLevel === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-red-200 text-red-700'
                          }>
                            {strategy.riskLevel}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline">{strategy.network}</Badge>
                        </div>
                        <div>
                          <Button 
                            size="sm" 
                            onClick={() => handleStartModule(strategy)}
                            className="w-full"
                          >
                            {strategy.completed ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Learning Assistant
                </CardTitle>
                <CardDescription>
                  Contextual guidance and personalized learning paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      AI Assistant: Based on your portfolio, I recommend focusing on Aave V3 Leveraged Yield next. 
                      Your risk tolerance suggests you can handle the complexity, and it would diversify your current positions.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Learning Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Completed Modules</span>
                          <span>2/4</span>
                        </div>
                        <Progress value={50} />
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>Next Badge: Advanced Strategist (1 module away)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Recommended Next Steps</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          <span>Complete Aave V3 module (65% done)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          <span>Learn about impermanent loss</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          <span>Practice with testnet first</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fear & Greed Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-4 ${getSentimentColor(marketSentiment.fearGreedIndex)}`}>
                      {marketSentiment.fearGreedIndex}
                    </div>
                    <Progress value={marketSentiment.fearGreedIndex} className="mb-4" />
                    <div className="text-lg font-medium">{marketSentiment.sentiment}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span>Portfolio Risk Score</span>
                        <span className="font-bold">{portfolioData.riskScore}/10</span>
                      </div>
                      <Progress value={portfolioData.riskScore * 10} />
                    </div>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your current risk level is moderate. Consider adding some low-risk stablecoin strategies for better balance.
                      </AlertDescription>
                    </Alert>
                    <Button className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Retake Risk Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}