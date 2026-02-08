import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Brain, TrendingUp, TrendingDown, Target, Shield, Activity,
  AlertTriangle, CheckCircle, XCircle, Minus, Search, RefreshCcw,
  BarChart3, Zap, Scale, BookOpen, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface ConfluenceFactor {
  name: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  score: number;
  description: string;
}

interface TradingSignal {
  score: number;
  direction: 'long' | 'short' | 'neutral';
  confidence: number;
  factors: ConfluenceFactor[];
  recommendation: string;
  reasoning: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  positionSizePercent: number;
  maxRiskPercent: number;
}

interface MarketRegime {
  type: string;
  direction: string;
  strength: number;
  confidence: number;
}

interface AnalysisResult {
  symbol: string;
  currentPrice: number;
  signal: TradingSignal;
  regime: MarketRegime;
  tradingRules: string[];
  expectedWinRate: string;
  disclaimer: string;
}

const recommendationConfig: Record<string, { color: string; icon: any; bgColor: string }> = {
  strong_buy: { color: 'text-green-400', icon: ArrowUpRight, bgColor: 'bg-green-900/30' },
  buy: { color: 'text-emerald-400', icon: TrendingUp, bgColor: 'bg-emerald-900/30' },
  hold: { color: 'text-yellow-400', icon: Minus, bgColor: 'bg-yellow-900/30' },
  sell: { color: 'text-orange-400', icon: TrendingDown, bgColor: 'bg-orange-900/30' },
  strong_sell: { color: 'text-red-400', icon: ArrowDownRight, bgColor: 'bg-red-900/30' },
  no_trade: { color: 'text-slate-400', icon: XCircle, bgColor: 'bg-slate-900/30' }
};

function ConfluenceFactorCard({ factor }: { factor: ConfluenceFactor }) {
  const signalColor = factor.signal === 'bullish' ? 'text-green-400' : factor.signal === 'bearish' ? 'text-red-400' : 'text-yellow-400';
  const bgColor = factor.signal === 'bullish' ? 'bg-green-900/20' : factor.signal === 'bearish' ? 'bg-red-900/20' : 'bg-yellow-900/20';

  return (
    <div className={`p-3 rounded-lg ${bgColor} border border-slate-700`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-white">{factor.name}</span>
        <Badge variant="outline" className={signalColor}>
          {factor.signal.toUpperCase()}
        </Badge>
      </div>
      <p className="text-xs text-slate-300 mb-2">{factor.description}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Weight: {factor.weight}%</span>
        <span className={`text-xs font-bold ${factor.score > 0 ? 'text-green-400' : factor.score < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
          Score: {factor.score > 0 ? '+' : ''}{factor.score.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

function TradingPlanCard({ analysis }: { analysis: AnalysisResult }) {
  const { signal, regime } = analysis;
  const config = recommendationConfig[signal.recommendation] || recommendationConfig.hold;
  const RecIcon = config.icon;

  const bullishCount = signal.factors.filter(f => f.signal === 'bullish').length;
  const bearishCount = signal.factors.filter(f => f.signal === 'bearish').length;

  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white">{analysis.symbol}</CardTitle>
            <CardDescription className="text-slate-300">
              ${analysis.currentPrice.toFixed(2)}
            </CardDescription>
          </div>
          <div className={`p-3 rounded-lg ${config.bgColor}`}>
            <RecIcon className={`h-8 w-8 ${config.color}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation Banner */}
        <div className={`p-4 rounded-lg ${config.bgColor} border border-slate-600`}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-white">AI Recommendation</span>
            <Badge className={`ml-auto ${config.color} border-0`}>
              {signal.recommendation.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-slate-200">{signal.reasoning}</p>
        </div>

        {/* Confidence & Score */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Confidence</div>
            <div className="flex items-center gap-2">
              <Progress value={signal.confidence} className="h-2 flex-1" />
              <span className="text-sm font-bold text-white">{signal.confidence.toFixed(0)}%</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Confluence Score</div>
            <div className={`text-lg font-bold ${signal.score > 0 ? 'text-green-400' : signal.score < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              {signal.score > 0 ? '+' : ''}{signal.score.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Market Regime */}
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">Market Regime</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-cyan-400">
              {regime.type.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant={regime.direction === 'bullish' ? 'default' : regime.direction === 'bearish' ? 'destructive' : 'secondary'}>
              {regime.direction.toUpperCase()}
            </Badge>
            <span className="text-xs text-slate-300 ml-auto">
              Strength: {regime.strength.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Factor Summary */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-bold">{bullishCount}</span>
            <span className="text-slate-400 text-sm">Bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-bold">{bearishCount}</span>
            <span className="text-slate-400 text-sm">Bearish</span>
          </div>
        </div>

        {/* Trade Levels */}
        {signal.recommendation !== 'no_trade' && signal.recommendation !== 'hold' && (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Trade Setup</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-400">Entry:</span>
                <span className="text-white ml-2">${signal.entryPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-red-400">Stop Loss:</span>
                <span className="text-white ml-2">${signal.stopLoss.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-green-400">TP1 (1:1):</span>
                <span className="text-white ml-2">${signal.takeProfit1.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-green-400">TP2 (2:1):</span>
                <span className="text-white ml-2">${signal.takeProfit2.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-green-400">TP3 (3:1):</span>
                <span className="text-white ml-2">${signal.takeProfit3.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-purple-400">R:R Ratio:</span>
                <span className="text-white ml-2">{signal.riskRewardRatio.toFixed(1)}:1</span>
              </div>
            </div>
          </div>
        )}

        {/* Risk Management */}
        <div className="flex items-center gap-2 p-2 bg-slate-900/30 rounded text-xs">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-slate-300">
            Position Size: {signal.positionSizePercent.toFixed(2)}% | Max Risk: {signal.maxRiskPercent}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnhancedAIStrategy() {
  const [symbol, setSymbol] = useState('SPY');
  const [assetType, setAssetType] = useState('stock');
  const [searchTrigger, setSearchTrigger] = useState(0);

  const { data: analysis, isLoading, error, refetch } = useQuery<{ success: boolean; data: AnalysisResult }>({
    queryKey: ['/api/enhanced-strategy/analyze', symbol, assetType, searchTrigger],
    queryFn: async () => {
      const res = await fetch(`/api/enhanced-strategy/analyze/${symbol}?assetType=${assetType}`);
      if (!res.ok) throw new Error('Failed to analyze');
      return res.json();
    },
    enabled: searchTrigger > 0
  });

  const { data: rulesData } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enhanced-strategy/rules'],
    queryFn: async () => {
      const res = await fetch('/api/enhanced-strategy/rules');
      return res.json();
    }
  });

  const { data: scanData, isLoading: scanLoading } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enhanced-strategy/quick-scan'],
    queryFn: async () => {
      const res = await fetch('/api/enhanced-strategy/quick-scan');
      return res.json();
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const handleAnalyze = () => {
    setSearchTrigger(prev => prev + 1);
  };

  const rules = rulesData?.data;
  const quickScan = scanData?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-400" />
              Enhanced AI Trading Strategy
            </h1>
            <p className="text-slate-300 mt-1">
              Multi-factor confluence system with realistic expectations
            </p>
          </div>
          <Badge variant="outline" className="text-yellow-400 border-yellow-600 px-3 py-1">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Target Win Rate: 60-70% (Professional Standard)
          </Badge>
        </div>

        {/* Disclaimer Banner */}
        <Card className="bg-amber-900/20 border-amber-700/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-400">Important: Realistic Expectations</h3>
                <p className="text-sm text-amber-200/80">
                  A 95% win rate is NOT achievable through any legitimate trading strategy.
                  Professional traders achieve 55-65% with proper risk management. This system
                  targets 60-70% with 2:1+ risk/reward, which maximizes long-term profitability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter symbol (SPY, AAPL, BTC, etc.)"
                  className="bg-slate-900 border-slate-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
                <option value="forex">Forex</option>
                <option value="futures">Futures</option>
              </select>
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isLoading ? (
                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['SPY', 'QQQ', 'AAPL', 'NVDA', 'TSLA', 'BTC', 'ETH', 'GOLD'].map((sym) => (
                <Button
                  key={sym}
                  size="sm"
                  variant="outline"
                  className="text-xs bg-slate-900 border-slate-600 hover:bg-slate-700"
                  onClick={() => {
                    setSymbol(sym);
                    setAssetType(['BTC', 'ETH', 'SOL'].includes(sym) ? 'crypto' : sym === 'GOLD' ? 'futures' : 'stock');
                  }}
                >
                  {sym}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="scanner" className="data-[state=active]:bg-blue-600">
              <Zap className="h-4 w-4 mr-2" />
              Quick Scan
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-green-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Trading Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analysis Result */}
              {analysis?.data ? (
                <>
                  <TradingPlanCard analysis={analysis.data} />

                  {/* Confluence Factors */}
                  <Card className="bg-slate-800/80 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Scale className="h-5 w-5 text-purple-400" />
                        Confluence Factors ({analysis.data.signal.factors.length})
                      </CardTitle>
                      <CardDescription>
                        Each factor is weighted by importance. 4+ aligned factors required for trade.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                      {analysis.data.signal.factors.map((factor, idx) => (
                        <ConfluenceFactorCard key={idx} factor={factor} />
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Enter a Symbol to Analyze</h3>
                    <p className="text-slate-300">
                      Get multi-factor confluence analysis with entry/exit levels and risk management
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scanner">
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  Quick Market Scan
                </CardTitle>
                <CardDescription>
                  Top setups across major stocks and crypto (refreshes every 5 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanLoading ? (
                  <div className="text-center py-8">
                    <RefreshCcw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-slate-300">Scanning markets...</p>
                  </div>
                ) : quickScan ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>Fear & Greed: {quickScan.fearGreedIndex}</span>
                      <span>Scanned: {quickScan.scannedSymbols} symbols</span>
                    </div>

                    {quickScan.topSetups?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickScan.topSetups.map((setup: any, idx: number) => {
                          const config = recommendationConfig[setup.recommendation] || recommendationConfig.hold;
                          return (
                            <Card key={idx} className={`${config.bgColor} border-slate-600`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-white text-lg">{setup.symbol}</span>
                                  <Badge className={config.color}>
                                    {setup.recommendation.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Price:</span>
                                    <span className="text-white">${setup.price.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Confidence:</span>
                                    <span className="text-white">{setup.confidence.toFixed(0)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">R:R:</span>
                                    <span className="text-white">{setup.riskRewardRatio.toFixed(1)}:1</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Factors:</span>
                                    <span>
                                      <span className="text-green-400">{setup.bullishFactors}B</span>
                                      <span className="text-slate-400"> / </span>
                                      <span className="text-red-400">{setup.bearishFactors}S</span>
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-3"
                                  onClick={() => {
                                    setSymbol(setup.symbol);
                                    setAssetType(setup.assetType);
                                    handleAnalyze();
                                  }}
                                >
                                  View Full Analysis
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-slate-300">No strong setups found currently</p>
                        <p className="text-xs text-slate-400">This is normal - quality over quantity</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            {rules && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Principles */}
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-400" />
                      Core Principles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rules.corePrinciples?.map((p: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{p.rule}</span>
                          <Badge variant={p.importance === 'Critical' ? 'destructive' : 'secondary'}>
                            {p.importance}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">{p.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Entry Rules */}
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5 text-green-400" />
                      Entry Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {rules.entryRules?.map((rule: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-200">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Exit Rules */}
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ArrowDownRight className="h-5 w-5 text-red-400" />
                      Exit Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {rules.exitRules?.map((rule: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Target className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-200">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Risk Management */}
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      Risk Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {rules.riskManagement?.map((rule: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-200">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Confluence Factors */}
                <Card className="bg-slate-800/80 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Scale className="h-5 w-5 text-purple-400" />
                      Confluence Factor Weights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {rules.confluenceFactors?.map((f: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white text-sm">{f.name}</span>
                            <span className="text-purple-400 font-bold">{f.weight}%</span>
                          </div>
                          <p className="text-xs text-slate-400">{f.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Realistic Expectations */}
                <Card className="bg-amber-900/20 border-amber-700/50 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Realistic Expectations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{rules.realisticExpectations?.targetWinRate}</div>
                        <div className="text-xs text-slate-400">Target Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{rules.realisticExpectations?.targetRiskReward}</div>
                        <div className="text-xs text-slate-400">Average R:R</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{rules.realisticExpectations?.expectedDrawdown}</div>
                        <div className="text-xs text-slate-400">Max Drawdown</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{rules.realisticExpectations?.monthlyReturnTarget}</div>
                        <div className="text-xs text-slate-400">Monthly Target</div>
                      </div>
                    </div>
                    <p className="text-sm text-amber-200/80">{rules.realisticExpectations?.disclaimer}</p>

                    <div className="mt-4">
                      <h4 className="font-bold text-red-400 mb-2">What This System Does NOT Do:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {rules.whatThisSystemDoesNOTDo?.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-red-300">
                            <XCircle className="h-4 w-4" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
