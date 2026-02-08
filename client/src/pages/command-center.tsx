import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Newspaper,
  Brain,
  Calculator,
  AlertTriangle,
  ArrowRightLeft,
  Wallet,
  Building2,
  RefreshCw,
  Clock,
  Zap,
  Shield,
  Target,
  DollarSign,
  BarChart3,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { AlertSettings } from '@/components/AlertSettings';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

interface WhaleTransaction {
  id: string;
  timestamp: string;
  amount: number;
  symbol: string;
  from: string;
  to: string;
  type: 'exchange_inflow' | 'exchange_outflow' | 'wallet_transfer';
  usdValue: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  keywords: string[];
}

interface AIAnalysis {
  summary: string;
  volatilityScore: number;
  marketBias: 'bullish' | 'bearish' | 'neutral';
  keyInsights: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: string;
}

export default function CommandCenter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [positionSize, setPositionSize] = useState({
    balance: '',
    riskPercent: '2',
    entryPrice: '',
    stopLoss: ''
  });
  const [calculatedPosition, setCalculatedPosition] = useState<{
    shares: number;
    riskAmount: number;
    positionValue: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: whaleData, isLoading: whalesLoading, refetch: refetchWhales } = useQuery<{ transactions: WhaleTransaction[] }>({
    queryKey: ['/api/command-center/whales'],
    refetchInterval: 15000
  });

  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery<{ news: NewsItem[] }>({
    queryKey: ['/api/command-center/news'],
    refetchInterval: 30000
  });

  const { data: aiAnalysis, isLoading: aiLoading, refetch: refetchAI } = useQuery<AIAnalysis>({
    queryKey: ['/api/command-center/ai-analysis'],
    refetchInterval: 60000
  });

  const calculatePosition = () => {
    const balance = parseFloat(positionSize.balance);
    const riskPercent = parseFloat(positionSize.riskPercent);
    const entry = parseFloat(positionSize.entryPrice);
    const stop = parseFloat(positionSize.stopLoss);

    if (isNaN(balance) || isNaN(riskPercent) || isNaN(entry) || isNaN(stop)) {
      return;
    }

    const riskAmount = balance * (riskPercent / 100);
    const riskPerShare = Math.abs(entry - stop);
    const shares = Math.floor(riskAmount / riskPerShare);
    const positionValue = shares * entry;

    setCalculatedPosition({ shares, riskAmount, positionValue });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getWhaleTypeConfig = (type: string) => {
    switch (type) {
      case 'exchange_inflow':
        return { 
          label: 'TO EXCHANGE', 
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <Building2 className="h-4 w-4" />,
          signal: 'SELL RISK'
        };
      case 'exchange_outflow':
        return { 
          label: 'FROM EXCHANGE', 
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: <Wallet className="h-4 w-4" />,
          signal: 'ACCUMULATION'
        };
      default:
        return { 
          label: 'TRANSFER', 
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <ArrowRightLeft className="h-4 w-4" />,
          signal: 'NEUTRAL'
        };
    }
  };

  const getVolatilityColor = (score: number) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 5) return 'text-yellow-400';
    if (score <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'extreme': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-200 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <IntermarketBanner />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" data-testid="page-title">
              <Activity className="h-8 w-8 text-emerald-400" />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Smart Money Command Center
              </span>
            </h1>
            <p className="text-slate-200 text-sm mt-1">Real-time whale tracking, news, and AI analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <WalkthroughGuide steps={MODULE_GUIDES['command-center']} title="Guide" accentColor="emerald" />
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
              <p className="text-xs text-slate-200">MARKET TIME</p>
              <p className="text-xl font-mono text-emerald-400" data-testid="market-time">{formatTime(currentTime)}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                refetchWhales();
                refetchNews();
                refetchAI();
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              data-testid="button-refresh-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1 bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <span className="text-white">Whale Stream</span>
                </div>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-2">
                {whalesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-200" />
                  </div>
                ) : whaleData?.transactions && whaleData.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {whaleData.transactions.map((tx) => {
                      const config = getWhaleTypeConfig(tx.type);
                      return (
                        <div 
                          key={tx.id}
                          className={`p-3 rounded-lg border ${config.color} transition-all hover:scale-[1.02]`}
                          data-testid={`whale-tx-${tx.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {config.icon}
                              <span className="font-bold text-lg">{tx.symbol}</span>
                            </div>
                            <Badge variant="outline" className={config.color}>
                              {config.signal}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold">{formatCurrency(tx.usdValue)}</p>
                          <p className="text-xs text-slate-200 mt-1">
                            {tx.amount.toLocaleString()} {tx.symbol} • {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <Zap className="h-12 w-12 mb-2 opacity-50" />
                    <p>No whale activity detected</p>
                    <p className="text-xs">Monitoring transactions &gt;$10M</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-cyan-400" />
                  <span className="text-white">Breaking News</span>
                </div>
                <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  HIGH IMPACT
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-2">
                {newsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-200" />
                  </div>
                ) : newsData?.news && newsData.news.length > 0 ? (
                  <div className="space-y-3">
                    {newsData.news.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-all"
                        data-testid={`news-item-${item.id}`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {item.sentiment === 'positive' ? (
                            <TrendingUp className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                          ) : item.sentiment === 'negative' ? (
                            <TrendingDown className="h-4 w-4 text-red-400 mt-1 flex-shrink-0" />
                          ) : (
                            <Activity className="h-4 w-4 text-slate-200 mt-1 flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium text-white leading-tight">{item.title}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              item.impact === 'high' 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30 text-xs'
                                : item.impact === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs'
                                  : 'bg-slate-500/20 text-slate-200 border-slate-500/30 text-xs'
                            }>
                              {item.impact.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-300">{item.source}</span>
                          </div>
                          <span className="text-xs text-slate-300">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {item.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.keywords.slice(0, 3).map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <Newspaper className="h-12 w-12 mb-2 opacity-50" />
                    <p>No breaking news</p>
                    <p className="text-xs">Filtering: SEC, Fed, Hack, ETF</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-amber-400" />
                  <span className="text-white">AI Alpha Analyst</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchAI()}
                  className="text-slate-200 hover:text-white"
                  data-testid="button-refresh-ai"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-amber-400 animate-pulse mx-auto mb-2" />
                    <p className="text-slate-200">Analyzing market data...</p>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div>
                      <p className="text-xs text-slate-200 mb-1">VOLATILITY SCORE</p>
                      <p className={`text-4xl font-bold ${getVolatilityColor(aiAnalysis.volatilityScore)}`}>
                        {aiAnalysis.volatilityScore}/10
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-200 mb-1">MARKET BIAS</p>
                      <Badge variant="outline" className={
                        aiAnalysis.marketBias === 'bullish'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : aiAnalysis.marketBias === 'bearish'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-slate-500/20 text-slate-200 border-slate-500/30'
                      }>
                        {aiAnalysis.marketBias.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-200">RISK LEVEL</p>
                      <Badge variant="outline" className={getRiskBadgeColor(aiAnalysis.riskLevel)}>
                        {aiAnalysis.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-200">KEY INSIGHTS</p>
                    {aiAnalysis.keyInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{insight}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 text-right">
                    Updated: {new Date(aiAnalysis.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-300">
                  <Brain className="h-12 w-12 mb-2 opacity-50" />
                  <p>AI analysis unavailable</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchAI()}
                    className="mt-4 border-slate-600"
                  >
                    Retry Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Position Sizer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200 text-sm">Account Balance</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      type="number"
                      placeholder="10000"
                      value={positionSize.balance}
                      onChange={(e) => setPositionSize(p => ({ ...p, balance: e.target.value }))}
                      className="pl-9 bg-slate-800 border-slate-700 text-white"
                      data-testid="input-balance"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-200 text-sm">Risk %</Label>
                  <div className="relative mt-1">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      type="number"
                      placeholder="2"
                      value={positionSize.riskPercent}
                      onChange={(e) => setPositionSize(p => ({ ...p, riskPercent: e.target.value }))}
                      className="pl-9 bg-slate-800 border-slate-700 text-white"
                      data-testid="input-risk-percent"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-200 text-sm">Entry Price</Label>
                  <div className="relative mt-1">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      type="number"
                      placeholder="150.00"
                      value={positionSize.entryPrice}
                      onChange={(e) => setPositionSize(p => ({ ...p, entryPrice: e.target.value }))}
                      className="pl-9 bg-slate-800 border-slate-700 text-white"
                      data-testid="input-entry-price"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-200 text-sm">Stop Loss</Label>
                  <div className="relative mt-1">
                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      type="number"
                      placeholder="145.00"
                      value={positionSize.stopLoss}
                      onChange={(e) => setPositionSize(p => ({ ...p, stopLoss: e.target.value }))}
                      className="pl-9 bg-slate-800 border-slate-700 text-white"
                      data-testid="input-stop-loss"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={calculatePosition}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-calculate"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Position
              </Button>

              {calculatedPosition && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-200">SHARES</p>
                      <p className="text-2xl font-bold text-emerald-400" data-testid="result-shares">
                        {calculatedPosition.shares}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-200">RISK AMOUNT</p>
                      <p className="text-2xl font-bold text-amber-400" data-testid="result-risk">
                        ${calculatedPosition.riskAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-200">POSITION VALUE</p>
                      <p className="text-2xl font-bold text-cyan-400" data-testid="result-position">
                        ${calculatedPosition.positionValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span className="text-white">Market Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm text-slate-200">NYSE</span>
                  </div>
                  <p className="text-lg font-semibold text-white">Open</p>
                  <p className="text-xs text-slate-300">9:30 AM - 4:00 PM ET</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm text-slate-200">CRYPTO</span>
                  </div>
                  <p className="text-lg font-semibold text-white">24/7</p>
                  <p className="text-xs text-slate-300">Always trading</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-slate-200">Fear & Greed</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">--</p>
                  <p className="text-xs text-slate-300">Loading...</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-slate-200">VIX</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">--</p>
                  <p className="text-xs text-slate-300">Volatility Index</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AlertSettings />
        </div>
      </div>
    </div>
  );
}
