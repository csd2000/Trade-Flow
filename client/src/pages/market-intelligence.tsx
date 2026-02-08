import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Globe,
  RefreshCw,
  Brain,
  ArrowLeft,
  DollarSign,
  Building2,
  Wallet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus
} from "lucide-react";
import { Link } from "wouter";

interface TechnicalAnalysis {
  sma50: number;
  sma200: number;
  rsi: number;
  price: number;
  goldenCross: boolean;
  deathCross: boolean;
  priceAbove200SMA: boolean;
  bullish: boolean;
  score: number;
  reasoning: string;
}

interface OnChainAnalysis {
  exchangeInflow: number;
  exchangeOutflow: number;
  netFlow: number;
  bullish: boolean;
  score: number;
  reasoning: string;
}

interface MacroAnalysis {
  fedStatus: "dovish" | "hawkish" | "neutral";
  dxyTrend: "up" | "down" | "neutral";
  bullish: boolean;
  score: number;
  reasoning: string;
}

interface MarketHealthScore {
  score: number;
  signal: "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";
  technical: TechnicalAnalysis;
  onChain: OnChainAnalysis;
  macro: MacroAnalysis;
  reasoning: string;
  timestamp: string;
}

interface AIAnalysisResponse {
  analysis: string;
  healthScore: MarketHealthScore;
}

function getSignalColor(signal: string): string {
  switch (signal) {
    case "Strong Buy": return "bg-green-600";
    case "Buy": return "bg-green-500";
    case "Neutral": return "bg-yellow-500";
    case "Sell": return "bg-red-500";
    case "Strong Sell": return "bg-red-600";
    default: return "bg-gray-500";
  }
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-500";
  if (score >= 60) return "text-green-400";
  if (score >= 40) return "text-yellow-500";
  if (score >= 25) return "text-red-400";
  return "text-red-500";
}

function BullishBearishIndicator({ bullish }: { bullish: boolean }) {
  return bullish ? (
    <div className="flex items-center gap-1 text-green-500">
      <CheckCircle className="w-4 h-4" />
      <span className="text-sm font-medium">Bullish</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 text-red-500">
      <XCircle className="w-4 h-4" />
      <span className="text-sm font-medium">Bearish</span>
    </div>
  );
}

export default function MarketIntelligence() {
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery<MarketHealthScore>({
    queryKey: ["/api/market-intelligence/health-score"],
    refetchInterval: 60000,
  });

  const { data: aiData, isLoading: aiLoading, refetch: refetchAI } = useQuery<AIAnalysisResponse>({
    queryKey: ["/api/market-intelligence/ai-analysis"],
    refetchInterval: 120000,
  });

  const handleRefresh = () => {
    refetchHealth();
    refetchAI();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="w-8 h-8 text-amber-400" />
                Market Intelligence Engine
              </h1>
              <p className="text-gray-200 mt-1">Tri-Factor Bitcoin Analysis: Technical + On-Chain + Macro</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>

        {healthLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
          </div>
        ) : healthData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    Market Health Score
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    Weighted composite of Technical (40%), On-Chain (30%), and Macro (30%) factors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(healthData.score)}`} data-testid="text-health-score">
                        {healthData.score}
                      </div>
                      <div className="text-gray-200 text-sm mt-1">/ 100</div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-lg px-4 py-2 ${getSignalColor(healthData.signal)}`} data-testid="badge-signal">
                        {healthData.signal}
                      </Badge>
                      <div className="text-gray-200 text-sm mt-2">
                        Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200">Technical (40%)</span>
                      <span className={getScoreColor(healthData.technical.score)}>{healthData.technical.score}</span>
                    </div>
                    <Progress value={healthData.technical.score} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200">On-Chain (30%)</span>
                      <span className={getScoreColor(healthData.onChain.score)}>{healthData.onChain.score}</span>
                    </div>
                    <Progress value={healthData.onChain.score} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200">Macro (30%)</span>
                      <span className={getScoreColor(healthData.macro.score)}>{healthData.macro.score}</span>
                    </div>
                    <Progress value={healthData.macro.score} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-900/30 to-gray-800/50 border-amber-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-amber-400" />
                    AI Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-pulse text-gray-200">Generating AI analysis...</div>
                    </div>
                  ) : aiData?.analysis ? (
                    <p className="text-gray-300 leading-relaxed" data-testid="text-ai-analysis">
                      {aiData.analysis}
                    </p>
                  ) : (
                    <p className="text-gray-200">AI analysis unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="technical" className="space-y-6">
              <TabsList className="bg-gray-800/50 border border-gray-700">
                <TabsTrigger value="technical" className="data-[state=active]:bg-amber-600" data-testid="tab-technical">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="onchain" className="data-[state=active]:bg-amber-600" data-testid="tab-onchain">
                  <Wallet className="w-4 h-4 mr-2" />
                  On-Chain
                </TabsTrigger>
                <TabsTrigger value="macro" className="data-[state=active]:bg-amber-600" data-testid="tab-macro">
                  <Globe className="w-4 h-4 mr-2" />
                  Macro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="technical" className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Technical Analysis
                      </span>
                      <BullishBearishIndicator bullish={healthData.technical.bullish} />
                    </CardTitle>
                    <CardDescription className="text-gray-200">
                      Moving averages, RSI, and trend analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <div className="text-2xl font-bold text-white" data-testid="text-btc-price">
                          ${healthData.technical.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-200">BTC Price</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <div className="text-2xl font-bold text-white">
                          ${healthData.technical.sma50.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-gray-200">50 SMA</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <TrendingDown className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <div className="text-2xl font-bold text-white">
                          ${healthData.technical.sma200.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-gray-200">200 SMA</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                        <div className="text-2xl font-bold text-white">
                          {healthData.technical.rsi.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-200">RSI (14)</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg">
                        {healthData.technical.goldenCross ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-300">Golden Cross</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg">
                        {healthData.technical.deathCross ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-300">Death Cross</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg">
                        {healthData.technical.priceAbove200SMA ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-sm text-gray-300">Above 200 SMA</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg">
                        {healthData.technical.rsi > 70 ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : healthData.technical.rsi < 30 ? (
                          <AlertTriangle className="w-5 h-5 text-blue-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <span className="text-sm text-gray-300">
                          {healthData.technical.rsi > 70 ? "Overbought" : healthData.technical.rsi < 30 ? "Oversold" : "Healthy RSI"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/30 rounded-lg">
                      <p className="text-gray-300 text-sm">{healthData.technical.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="onchain" className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-400" />
                        On-Chain Analysis
                      </span>
                      <BullishBearishIndicator bullish={healthData.onChain.bullish} />
                    </CardTitle>
                    <CardDescription className="text-gray-200">
                      Exchange flows and accumulation patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-400" />
                        <div className="text-2xl font-bold text-white">
                          {healthData.onChain.exchangeInflow.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC
                        </div>
                        <div className="text-xs text-gray-200">Exchange Inflow</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <div className="text-2xl font-bold text-white">
                          {healthData.onChain.exchangeOutflow.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC
                        </div>
                        <div className="text-xs text-gray-200">Exchange Outflow</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                        <div className={`text-2xl font-bold ${healthData.onChain.netFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {healthData.onChain.netFlow > 0 ? '+' : ''}{healthData.onChain.netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC
                        </div>
                        <div className="text-xs text-gray-200">Net Flow</div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/30 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {healthData.onChain.bullish ? (
                          <Badge className="bg-green-600">Accumulation Phase</Badge>
                        ) : (
                          <Badge className="bg-red-600">Distribution Phase</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">
                        {healthData.onChain.bullish 
                          ? "More BTC is leaving exchanges than entering, indicating accumulation by long-term holders."
                          : "More BTC is entering exchanges than leaving, indicating potential selling pressure."}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-900/30 rounded-lg">
                      <p className="text-gray-300 text-sm">{healthData.onChain.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="macro" className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Macro Analysis
                      </span>
                      <BullishBearishIndicator bullish={healthData.macro.bullish} />
                    </CardTitle>
                    <CardDescription className="text-gray-200">
                      Federal Reserve policy and Dollar Index trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Building2 className="w-8 h-8 text-blue-400" />
                          <div>
                            <div className="text-lg font-semibold text-white">Federal Reserve</div>
                            <div className="text-sm text-gray-200">Monetary Policy Stance</div>
                          </div>
                        </div>
                        <Badge className={
                          healthData.macro.fedStatus === "dovish" ? "bg-green-600" :
                          healthData.macro.fedStatus === "hawkish" ? "bg-red-600" : "bg-yellow-600"
                        }>
                          {healthData.macro.fedStatus.charAt(0).toUpperCase() + healthData.macro.fedStatus.slice(1)}
                        </Badge>
                        <p className="text-gray-200 text-sm mt-3">
                          {healthData.macro.fedStatus === "dovish" 
                            ? "Lower rates expected - bullish for risk assets"
                            : healthData.macro.fedStatus === "hawkish"
                            ? "Higher rates expected - bearish for risk assets"
                            : "Policy direction unclear - neutral for markets"}
                        </p>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <DollarSign className="w-8 h-8 text-green-400" />
                          <div>
                            <div className="text-lg font-semibold text-white">Dollar Index (DXY)</div>
                            <div className="text-sm text-gray-200">Currency Strength</div>
                          </div>
                        </div>
                        <Badge className={
                          healthData.macro.dxyTrend === "down" ? "bg-green-600" :
                          healthData.macro.dxyTrend === "up" ? "bg-red-600" : "bg-yellow-600"
                        }>
                          Trending {healthData.macro.dxyTrend.charAt(0).toUpperCase() + healthData.macro.dxyTrend.slice(1)}
                        </Badge>
                        <p className="text-gray-200 text-sm mt-3">
                          {healthData.macro.dxyTrend === "down" 
                            ? "Weaker dollar supports Bitcoin prices"
                            : healthData.macro.dxyTrend === "up"
                            ? "Stronger dollar pressures Bitcoin prices"
                            : "Neutral dollar impact on Bitcoin"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/30 rounded-lg">
                      <p className="text-gray-300 text-sm">{healthData.macro.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-gray-200">Failed to load market intelligence data</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
