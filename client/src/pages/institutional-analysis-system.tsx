import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, TrendingUp, TrendingDown, Activity, BarChart3, 
  Target, Shield, Zap, Brain, AlertTriangle, CheckCircle,
  Clock, DollarSign, Globe, Layers, Lock, Unlock,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Search,
  Eye, Radio, Radar, Signal, ChevronRight, ChevronDown,
  Wallet, PieChart, LineChart, GitCompare, Loader2,
  AlertOctagon, XOctagon, Bot, Timer, Sparkles, Calculator
} from 'lucide-react';
import { http, apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface InstitutionalFlowData {
  symbol: string;
  darkPoolVolume: number;
  darkPoolPercent: number;
  blockTrades: number;
  blockTradeValue: number;
  institutionalBuying: number;
  institutionalSelling: number;
  netInstitutionalFlow: number;
  flowDirection: 'accumulation' | 'distribution' | 'neutral';
  smartMoneyIndex: number;
  unusualActivity: boolean;
  timestamp: string;
}

interface MarketMakerSignal {
  symbol: string;
  bidAskSpread: number;
  bidDepth: number;
  askDepth: number;
  imbalanceRatio: number;
  marketMakerBias: 'bullish' | 'bearish' | 'neutral';
  hiddenBids: number;
  hiddenAsks: number;
  spoofingAlert: boolean;
  icebergDetected: boolean;
}

interface HedgeFundActivity {
  symbol: string;
  thirteenFHoldings: number;
  quarterlyChange: number;
  topHolders: Array<{ name: string; shares: number; changePercent: number }>;
  putCallRatio: number;
  optionsFlow: {
    callVolume: number;
    putVolume: number;
    callPremium: number;
    putPremium: number;
    unusualCalls: boolean;
    unusualPuts: boolean;
  };
  shortInterest: number;
  shortInterestChange: number;
  daysToCover: number;
}

interface PriceForecast {
  symbol: string;
  currentPrice: number;
  forecast1Day: { low: number; mid: number; high: number; confidence: number };
  forecast3Day: { low: number; mid: number; high: number; confidence: number };
  forecast7Day: { low: number; mid: number; high: number; confidence: number };
  keyLevels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
  };
  probabilityUp: number;
  probabilityDown: number;
  volatilityForecast: number;
  aiReasoning: string;
}

interface SevenGateStatus {
  gatesCompleted: number;
  totalGates: number;
  currentGate: number;
  gateStatuses: Array<{
    gate: number;
    name: string;
    passed: boolean;
    locked: boolean;
    reason?: string;
  }>;
  overallSignal: 'GO' | 'NO_GO' | 'WAIT';
  liquiditySweepDetected: boolean;
  killzoneActive: boolean;
}

interface QuantSignal {
  symbol: string;
  signalType: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  direction: 'long' | 'short' | 'neutral';
  strength: number;
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  keyFactors: string[];
}

interface IntermarketAnalysis {
  marketRegime: 'risk_on' | 'risk_off' | 'transitioning' | 'uncertain';
  correlations: Array<{ asset1: string; asset2: string; correlation: number }>;
  divergences: string[];
  sectorRotation: Array<{ sector: string; flow: 'inflow' | 'outflow'; strength: number }>;
}

interface UnifiedAnalysis {
  symbol: string;
  timestamp: string;
  institutionalFlow: InstitutionalFlowData;
  marketMaker: MarketMakerSignal;
  hedgeFund: HedgeFundActivity;
  priceForecast: PriceForecast;
  sevenGate: SevenGateStatus;
  quantSignal: QuantSignal;
  intermarket: IntermarketAnalysis;
  overallScore: number;
  overallSignal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  aiSummary: string;
}

const TIMEFRAMES = [
  { value: '1m', label: '1 Min' },
  { value: '5m', label: '5 Min' },
  { value: '15m', label: '15 Min' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hour' },
  { value: '1D', label: 'Daily' },
  { value: '1W', label: 'Weekly' },
];

const DEFAULT_WATCHLIST = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'META', 'GOOGL', 'AMZN', 'MSFT'];

function SignalBadge({ signal }: { signal: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    'STRONG_BUY': { bg: 'bg-green-600', text: 'STRONG BUY' },
    'BUY': { bg: 'bg-green-500', text: 'BUY' },
    'HOLD': { bg: 'bg-amber-500', text: 'HOLD' },
    'SELL': { bg: 'bg-red-500', text: 'SELL' },
    'STRONG_SELL': { bg: 'bg-red-600', text: 'STRONG SELL' },
    'strong_buy': { bg: 'bg-green-600', text: 'STRONG BUY' },
    'buy': { bg: 'bg-green-500', text: 'BUY' },
    'hold': { bg: 'bg-amber-500', text: 'HOLD' },
    'sell': { bg: 'bg-red-500', text: 'SELL' },
    'strong_sell': { bg: 'bg-red-600', text: 'STRONG SELL' },
  };
  const c = config[signal] || { bg: 'bg-slate-500', text: signal };
  return <Badge className={`${c.bg} text-white font-bold`}>{c.text}</Badge>;
}

function FlowIndicator({ direction, value }: { direction: string; value: number }) {
  if (direction === 'accumulation') {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <ArrowUpRight className="h-4 w-4" />
        <span className="font-bold">Accumulation</span>
        <span className="text-xs">(${(value / 1e6).toFixed(1)}M)</span>
      </div>
    );
  }
  if (direction === 'distribution') {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <ArrowDownRight className="h-4 w-4" />
        <span className="font-bold">Distribution</span>
        <span className="text-xs">(${(value / 1e6).toFixed(1)}M)</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-slate-200">
      <Minus className="h-4 w-4" />
      <span>Neutral</span>
    </div>
  );
}

function GateProgress({ status }: { status: SevenGateStatus }) {
  const percent = (status.gatesCompleted / status.totalGates) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-200">7-Gate Progress</span>
        <span className="font-bold text-white">{status.gatesCompleted}/{status.totalGates}</span>
      </div>
      <Progress value={percent} className="h-2" />
      <div className="flex gap-1">
        {status.gateStatuses.map((g) => (
          <div
            key={g.gate}
            className={`flex-1 h-6 rounded flex items-center justify-center text-xs font-bold ${
              g.passed ? 'bg-green-600 text-white' : g.locked ? 'bg-red-900 text-red-400' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {g.passed ? <CheckCircle className="h-3 w-3" /> : g.locked ? <Lock className="h-3 w-3" /> : g.gate}
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceForecastCard({ forecast }: { forecast: PriceForecast | null | undefined }) {
  if (!forecast) {
    return (
      <Card className="bg-slate-900/80 border-slate-700">
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-200">No forecast data available. Run analysis first.</p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (val: number | null | undefined) => {
    if (val == null || isNaN(val)) return '--';
    return `$${val.toFixed(2)}`;
  };

  const formatPercent = (val: number | null | undefined) => {
    if (val == null || isNaN(val)) return '--';
    return `${val}%`;
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-400" />
          Price Forecast - {forecast.symbol || 'N/A'}
        </CardTitle>
        <CardDescription className="text-slate-200 text-sm">
          AI-powered price predictions with probability ranges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forecasts - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xs text-slate-200 mb-1">1 Day Forecast</div>
            <div className="text-lg sm:text-xl font-bold text-cyan-400">{formatPrice(forecast.forecast1Day?.mid)}</div>
            <div className="text-xs text-slate-300">
              {formatPrice(forecast.forecast1Day?.low)} - {formatPrice(forecast.forecast1Day?.high)}
            </div>
            <div className="text-xs mt-1">
              <Badge variant="outline" className="text-xs">{forecast.forecast1Day?.confidence ?? '--'}% confidence</Badge>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xs text-slate-200 mb-1">3 Day Forecast</div>
            <div className="text-lg sm:text-xl font-bold text-blue-400">{formatPrice(forecast.forecast3Day?.mid)}</div>
            <div className="text-xs text-slate-300">
              {formatPrice(forecast.forecast3Day?.low)} - {formatPrice(forecast.forecast3Day?.high)}
            </div>
            <div className="text-xs mt-1">
              <Badge variant="outline" className="text-xs">{forecast.forecast3Day?.confidence ?? '--'}% confidence</Badge>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xs text-slate-200 mb-1">7 Day Forecast</div>
            <div className="text-lg sm:text-xl font-bold text-purple-400">{formatPrice(forecast.forecast7Day?.mid)}</div>
            <div className="text-xs text-slate-300">
              {formatPrice(forecast.forecast7Day?.low)} - {formatPrice(forecast.forecast7Day?.high)}
            </div>
            <div className="text-xs mt-1">
              <Badge variant="outline" className="text-xs">{forecast.forecast7Day?.confidence ?? '--'}% confidence</Badge>
            </div>
          </div>
        </div>

        {/* Probability - responsive */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3">
            <div className="text-xs text-green-400 mb-1">Chance Price Goes UP</div>
            <div className="text-xl sm:text-2xl font-bold text-green-400">{formatPercent(forecast.probabilityUp)}</div>
            <Progress value={forecast.probabilityUp ?? 0} className="h-1 mt-2" />
          </div>
          <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-3">
            <div className="text-xs text-red-400 mb-1">Chance Price Goes DOWN</div>
            <div className="text-xl sm:text-2xl font-bold text-red-400">{formatPercent(forecast.probabilityDown)}</div>
            <Progress value={forecast.probabilityDown ?? 0} className="h-1 mt-2" />
          </div>
        </div>

        {/* Key Levels - responsive */}
        <div>
          <div className="text-xs text-slate-200 mb-2">Key Price Levels (Support & Resistance)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800 rounded p-2">
              <div className="text-xs text-slate-200">Resistance 1</div>
              <div className="text-sm font-bold text-green-400">{formatPrice(forecast.keyLevels?.resistance1)}</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-xs text-slate-200">Resistance 2</div>
              <div className="text-sm font-bold text-green-300">{formatPrice(forecast.keyLevels?.resistance2)}</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-xs text-slate-200">Support 1</div>
              <div className="text-sm font-bold text-red-400">{formatPrice(forecast.keyLevels?.support1)}</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-xs text-slate-200">Support 2</div>
              <div className="text-sm font-bold text-red-300">{formatPrice(forecast.keyLevels?.support2)}</div>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <Brain className="h-4 w-4" />
            Why This Prediction?
          </div>
          <p className="text-sm text-slate-300">{forecast.aiReasoning || 'No analysis available'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InstitutionalAnalysisSystem() {
  const { toast } = useToast();
  const [symbol, setSymbol] = useState('SPY');
  const [timeframe, setTimeframe] = useState('1D');
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<UnifiedAnalysis | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [selectedWatchlistSymbol, setSelectedWatchlistSymbol] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (sym: string) => {
      const response = await http.post('/api/institutional-analysis/analyze', {
        symbol: sym,
        timeframe,
        includeForecasts: true,
        include7Gate: true,
        includeQuantSignals: true,
        includeIntermarket: true,
      }) as { data: UnifiedAnalysis };
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: 'Analysis Complete',
        description: `Institutional analysis for ${data.symbol} ready`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to run institutional analysis',
        variant: 'destructive',
      });
    },
  });

  const handleAnalyze = () => {
    if (!symbol.trim()) {
      toast({ title: 'Enter a symbol', variant: 'destructive' });
      return;
    }
    analyzeMutation.mutate(symbol.toUpperCase());
  };

  const handleWatchlistSelect = (sym: string) => {
    setSelectedWatchlistSymbol(sym);
    setSymbol(sym);
    analyzeMutation.mutate(sym);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 lg:p-6">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-2">
          <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex-shrink-0">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Institutional Analysis</h1>
            <p className="text-xs sm:text-sm text-slate-200">
              See what hedge funds, banks, and big traders are doing
            </p>
          </div>
        </div>
        
        {/* Quick Help for New Users */}
        <div className="bg-slate-800/50 rounded-lg p-3 mt-3 border border-slate-700/50">
          <p className="text-xs sm:text-sm text-slate-300">
            <span className="text-cyan-400 font-medium">How to use:</span> Enter a stock symbol (like SPY, AAPL, or TSLA), select a timeframe, and click "Run Full Analysis" to see institutional trading activity, price predictions, and trading signals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Left Sidebar - Controls & Watchlist */}
        <div className="lg:col-span-1 space-y-4">
          {/* Analysis Controls */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-cyan-400" />
                Analyze Symbol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Symbol</Label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="SPY, AAPL, TSLA..."
                  className="bg-slate-800 border-slate-700 text-white font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {TIMEFRAMES.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {analyzeMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Radar className="h-4 w-4 mr-2" /> Run Full Analysis</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {watchlist.map((sym) => (
                  <Button
                    key={sym}
                    variant={selectedWatchlistSymbol === sym ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleWatchlistSelect(sym)}
                    className={`font-mono text-xs ${
                      selectedWatchlistSymbol === sym
                        ? 'bg-cyan-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {sym}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {analysis && (
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm">Overall Score</span>
                  <span className="text-2xl font-bold text-cyan-400">{analysis.overallScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm">Signal</span>
                  <SignalBadge signal={analysis.overallSignal} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm">7-Gate</span>
                  <Badge className={
                    analysis.sevenGate.overallSignal === 'GO' ? 'bg-green-600' :
                    analysis.sevenGate.overallSignal === 'WAIT' ? 'bg-amber-600' : 'bg-red-600'
                  }>
                    {analysis.sevenGate.overallSignal}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm">Market Regime</span>
                  <Badge variant="outline" className="text-xs">
                    {analysis.intermarket.marketRegime.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {analysis ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="bg-slate-800/50 border border-slate-700 p-1 inline-flex min-w-max sm:w-full">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600 text-xs sm:text-sm px-2 sm:px-3">
                    <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="institutional" className="data-[state=active]:bg-cyan-600 text-xs sm:text-sm px-2 sm:px-3">
                    <Building2 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Institutional</span>
                    <span className="sm:hidden">Flow</span>
                  </TabsTrigger>
                  <TabsTrigger value="forecast" className="data-[state=active]:bg-cyan-600 text-xs sm:text-sm px-2 sm:px-3">
                    <Target className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Price Forecast</span>
                    <span className="sm:hidden">Predict</span>
                  </TabsTrigger>
                  <TabsTrigger value="7gate" className="data-[state=active]:bg-cyan-600 text-xs sm:text-sm px-2 sm:px-3">
                    <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                    7-Gate
                  </TabsTrigger>
                  <TabsTrigger value="quant" className="data-[state=active]:bg-cyan-600 text-xs sm:text-sm px-2 sm:px-3">
                    <Brain className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Quant Signals</span>
                    <span className="sm:hidden">Signals</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Current Price */}
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-slate-200 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        ${analysis.priceForecast?.currentPrice?.toFixed(2) ?? '--'}
                      </div>
                      <div className="text-xs text-slate-200">Current Price</div>
                    </CardContent>
                  </Card>

                  {/* Institutional Flow */}
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 mx-auto mb-2" />
                      <FlowIndicator 
                        direction={analysis.institutionalFlow?.flowDirection ?? 'neutral'}
                        value={Math.abs(analysis.institutionalFlow?.netInstitutionalFlow ?? 0)}
                      />
                      <div className="text-xs text-slate-200 mt-1">Big Money Flow</div>
                    </CardContent>
                  </Card>

                  {/* Smart Money Index */}
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-purple-400">
                        {analysis.institutionalFlow?.smartMoneyIndex ?? '--'}
                      </div>
                      <div className="text-xs text-slate-200">Smart Money</div>
                    </CardContent>
                  </Card>

                  {/* Market Maker Bias */}
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-auto mb-2" />
                      <Badge className={
                        analysis.marketMaker?.marketMakerBias === 'bullish' ? 'bg-green-600' :
                        analysis.marketMaker?.marketMakerBias === 'bearish' ? 'bg-red-600' : 'bg-slate-600'
                      }>
                        {(analysis.marketMaker?.marketMakerBias ?? 'neutral').toUpperCase()}
                      </Badge>
                      <div className="text-xs text-slate-200 mt-1">Market Maker</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 7-Gate Progress */}
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardContent className="p-4">
                    <GateProgress status={analysis.sevenGate} />
                  </CardContent>
                </Card>

                {/* AI Summary */}
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-cyan-400" />
                      AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{analysis.aiSummary}</p>
                  </CardContent>
                </Card>

                {/* Hedge Fund Activity */}
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-400" />
                      Hedge Fund Activity
                    </CardTitle>
                    <CardDescription className="text-slate-200 text-xs sm:text-sm">
                      What big investors are doing with options and shorts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-slate-800 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-slate-200">Put/Call</div>
                        <div className={`text-lg sm:text-xl font-bold ${
                          (analysis.hedgeFund?.putCallRatio ?? 0) > 1 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {analysis.hedgeFund?.putCallRatio?.toFixed(2) ?? '--'}
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-slate-200">Short %</div>
                        <div className="text-lg sm:text-xl font-bold text-amber-400">
                          {analysis.hedgeFund?.shortInterest?.toFixed(1) ?? '--'}%
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-slate-200">Days Cover</div>
                        <div className="text-lg sm:text-xl font-bold text-white">
                          {analysis.hedgeFund?.daysToCover?.toFixed(1) ?? '--'}
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-slate-200">Options</div>
                        <div className="flex justify-center gap-1 mt-1">
                          {analysis.hedgeFund?.optionsFlow?.unusualCalls && (
                            <Badge className="bg-green-600 text-[10px] sm:text-xs">CALLS</Badge>
                          )}
                          {analysis.hedgeFund?.optionsFlow?.unusualPuts && (
                            <Badge className="bg-red-600 text-[10px] sm:text-xs">PUTS</Badge>
                          )}
                          {!analysis.hedgeFund?.optionsFlow?.unusualCalls && !analysis.hedgeFund?.optionsFlow?.unusualPuts && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">NONE</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Institutional Flow Tab */}
              <TabsContent value="institutional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-base sm:text-lg">Dark Pool Activity</CardTitle>
                      <CardDescription className="text-slate-200 text-xs sm:text-sm">
                        Large hidden trades by institutions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Dark Pool Volume</span>
                        <span className="font-bold text-white">
                          {((analysis.institutionalFlow?.darkPoolVolume ?? 0) / 1e6).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">% of Total</span>
                        <span className="font-bold text-cyan-400">
                          {analysis.institutionalFlow?.darkPoolPercent?.toFixed(1) ?? '--'}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Block Trades</span>
                        <span className="font-bold text-white">
                          {analysis.institutionalFlow?.blockTrades ?? '--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Block Value</span>
                        <span className="font-bold text-green-400">
                          ${((analysis.institutionalFlow?.blockTradeValue ?? 0) / 1e6).toFixed(1)}M
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-base sm:text-lg">Market Maker Signals</CardTitle>
                      <CardDescription className="text-slate-200 text-xs sm:text-sm">
                        What professionals are doing behind the scenes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Bid/Ask Spread</span>
                        <span className="font-bold text-white">
                          ${analysis.marketMaker?.bidAskSpread?.toFixed(3) ?? '--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Imbalance</span>
                        <span className={`font-bold ${
                          (analysis.marketMaker?.imbalanceRatio ?? 1) > 1.2 ? 'text-green-400' :
                          (analysis.marketMaker?.imbalanceRatio ?? 1) < 0.8 ? 'text-red-400' : 'text-slate-300'
                        }`}>
                          {analysis.marketMaker?.imbalanceRatio?.toFixed(2) ?? '--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Hidden Orders</span>
                        <div className="flex gap-1 sm:gap-2">
                          <Badge variant="outline" className="text-[10px] sm:text-xs text-green-400">
                            Bid: {analysis.marketMaker?.hiddenBids ?? 0}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs text-red-400">
                            Ask: {analysis.marketMaker?.hiddenAsks ?? 0}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">Alerts</span>
                        <div className="flex gap-1">
                          {analysis.marketMaker?.spoofingAlert && (
                            <Badge className="bg-red-600 text-[10px] sm:text-xs">SPOOFING</Badge>
                          )}
                          {analysis.marketMaker?.icebergDetected && (
                            <Badge className="bg-amber-600 text-[10px] sm:text-xs">ICEBERG</Badge>
                          )}
                          {!analysis.marketMaker?.spoofingAlert && !analysis.marketMaker?.icebergDetected && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">CLEAR</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Price Forecast Tab */}
              <TabsContent value="forecast" className="space-y-4">
                <PriceForecastCard forecast={analysis.priceForecast} />
              </TabsContent>

              {/* 7-Gate Tab */}
              <TabsContent value="7gate" className="space-y-4">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-cyan-400" />
                      7-Gate Sequential Decision Engine
                    </CardTitle>
                    <CardDescription className="text-slate-200">
                      Multi-stage trade validation with kill-switch logic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <GateProgress status={analysis.sevenGate} />
                    
                    <div className="grid gap-3">
                      {analysis.sevenGate.gateStatuses.map((gate) => (
                        <div
                          key={gate.gate}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            gate.passed ? 'bg-green-900/20 border-green-600/30' :
                            gate.locked ? 'bg-red-900/20 border-red-600/30' :
                            'bg-slate-800/50 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              gate.passed ? 'bg-green-600' :
                              gate.locked ? 'bg-red-600' : 'bg-slate-700'
                            }`}>
                              {gate.passed ? <CheckCircle className="h-4 w-4 text-white" /> :
                               gate.locked ? <Lock className="h-4 w-4 text-white" /> :
                               <span className="text-white font-bold">{gate.gate}</span>}
                            </div>
                            <div>
                              <div className="font-medium text-white">{gate.name}</div>
                              {gate.reason && (
                                <div className="text-xs text-slate-200">{gate.reason}</div>
                              )}
                            </div>
                          </div>
                          <Badge className={
                            gate.passed ? 'bg-green-600' :
                            gate.locked ? 'bg-red-600' : 'bg-slate-600'
                          }>
                            {gate.passed ? 'PASSED' : gate.locked ? 'LOCKED' : 'PENDING'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className={`p-4 rounded-lg border ${
                        analysis.sevenGate.liquiditySweepDetected
                          ? 'bg-green-900/20 border-green-600/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Radar className="h-5 w-5 text-cyan-400" />
                          <span className="text-white font-medium">Liquidity Sweep</span>
                        </div>
                        <Badge className={analysis.sevenGate.liquiditySweepDetected ? 'bg-green-600 mt-2' : 'bg-slate-600 mt-2'}>
                          {analysis.sevenGate.liquiditySweepDetected ? 'DETECTED' : 'NOT DETECTED'}
                        </Badge>
                      </div>
                      <div className={`p-4 rounded-lg border ${
                        analysis.sevenGate.killzoneActive
                          ? 'bg-amber-900/20 border-amber-600/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Timer className="h-5 w-5 text-amber-400" />
                          <span className="text-white font-medium">Killzone</span>
                        </div>
                        <Badge className={analysis.sevenGate.killzoneActive ? 'bg-amber-600 mt-2' : 'bg-slate-600 mt-2'}>
                          {analysis.sevenGate.killzoneActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quant Signals Tab */}
              <TabsContent value="quant" className="space-y-4">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      Quantitative Trading Signal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-200 mb-2">Signal</div>
                        <SignalBadge signal={analysis.quantSignal.signalType} />
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-200 mb-2">Direction</div>
                        <Badge className={
                          analysis.quantSignal.direction === 'long' ? 'bg-green-600' :
                          analysis.quantSignal.direction === 'short' ? 'bg-red-600' : 'bg-slate-600'
                        }>
                          {analysis.quantSignal.direction.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-200 mb-2">Strength</div>
                        <div className="text-xl font-bold text-cyan-400">{analysis.quantSignal.strength}%</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-200 mb-2">Confidence</div>
                        <div className="text-xl font-bold text-purple-400">{analysis.quantSignal.confidence}%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-blue-400">Entry</div>
                        <div className="text-lg font-bold text-blue-400">
                          ${analysis.quantSignal.entryPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-green-400">Target</div>
                        <div className="text-lg font-bold text-green-400">
                          ${analysis.quantSignal.targetPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-red-400">Stop Loss</div>
                        <div className="text-lg font-bold text-red-400">
                          ${analysis.quantSignal.stopLoss.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-purple-400">R:R</div>
                        <div className="text-lg font-bold text-purple-400">
                          1:{analysis.quantSignal.riskRewardRatio.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-200 mb-2">Key Factors</div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.quantSignal.keyFactors.map((factor, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Intermarket Analysis */}
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      Intermarket Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <span className="text-slate-200">Market Regime</span>
                      <Badge className={
                        analysis.intermarket.marketRegime === 'risk_on' ? 'bg-green-600' :
                        analysis.intermarket.marketRegime === 'risk_off' ? 'bg-red-600' :
                        analysis.intermarket.marketRegime === 'transitioning' ? 'bg-amber-600' : 'bg-slate-600'
                      }>
                        {analysis.intermarket.marketRegime.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {analysis.intermarket.divergences.length > 0 && (
                      <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          Divergences Detected
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1">
                          {analysis.intermarket.divergences.map((div, i) => (
                            <li key={i}>• {div}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-slate-200 mb-2">Sector Rotation</div>
                      <div className="grid grid-cols-2 gap-2">
                        {analysis.intermarket.sectorRotation.map((sector, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-2 rounded border ${
                              sector.flow === 'inflow'
                                ? 'bg-green-900/20 border-green-600/30'
                                : 'bg-red-900/20 border-red-600/30'
                            }`}
                          >
                            <span className="text-sm text-white">{sector.sector}</span>
                            <div className="flex items-center gap-1">
                              {sector.flow === 'inflow' ? (
                                <ArrowUpRight className="h-3 w-3 text-green-400" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-400" />
                              )}
                              <span className={`text-xs font-bold ${
                                sector.flow === 'inflow' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {sector.strength}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            /* Empty State - User Friendly */
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="py-8 sm:py-16 text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-cyan-600/20 to-blue-600/20 flex items-center justify-center">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-sm sm:text-base text-slate-200 max-w-md mx-auto mb-6">
                  Select a stock from the watchlist or type a symbol to see what big investors are doing.
                  Get price predictions, trading signals, and more!
                </p>
                
                {/* Quick Start - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                  {['SPY', 'AAPL', 'TSLA', 'NVDA'].map((sym) => (
                    <Button
                      key={sym}
                      variant="outline"
                      onClick={() => {
                        setSymbol(sym);
                        analyzeMutation.mutate(sym);
                      }}
                      disabled={analyzeMutation.isPending}
                      className="font-mono border-slate-600 text-slate-300 hover:bg-cyan-600 hover:text-white hover:border-cyan-600"
                    >
                      {sym}
                    </Button>
                  ))}
                </div>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
                  <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-[10px] sm:text-xs text-slate-200">Big Money Flow</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-[10px] sm:text-xs text-slate-200">Price Predictions</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-[10px] sm:text-xs text-slate-200">Trade Checklist</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 text-center">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-[10px] sm:text-xs text-slate-200">AI Signals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
