import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, AlertTriangle, BarChart3, Building2, CheckCircle2,
  ChevronDown, ChevronUp, Clock, Crown, Eye, Filter,
  Flame, Layers, Lock, Radio, RefreshCcw, Search, Shield,
  Target, TrendingDown, TrendingUp, Volume2, Zap, XCircle,
  ArrowUpRight, ArrowDownRight, DollarSign, Crosshair
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface InstitutionalSignal {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  relativeVolume: number;
  sector: string;
  technicals: {
    rsi: number;
    atr: number;
    atrPercent: number;
    sma20: number;
    sma50: number;
    sma200: number;
    ema8: number;
    ema21: number;
    bbUpper: number;
    bbLower: number;
    bbWidth: number;
    macdLine: number;
    macdSignal: number;
    macdHist: number;
    adx: number;
    stochK: number;
    stochD: number;
    vwap: number;
  };
  scores: {
    composite: number;
    darkPool: number;
    smartMoney: number;
    optionsFlow: number;
    momentum: number;
    accumulation: number;
    liquiditySweep: number;
  };
  setup: {
    type: string;
    direction: 'LONG' | 'SHORT';
    entry: number;
    stopLoss: number;
    target1: number;
    target2: number;
    target3: number;
    riskReward: number;
    positionSize: string;
    confidence: number;
    timeframe: string;
  };
  signals: string[];
  category: 'A+' | 'A' | 'B' | 'C';
  darkPoolActivity: {
    detected: boolean;
    volumeAnomaly: number;
    priceAbsorption: boolean;
    institutionalPrints: number;
    sentiment: 'accumulation' | 'distribution' | 'neutral';
  };
  smartMoneyFlow: {
    direction: 'inflow' | 'outflow' | 'neutral';
    strength: number;
    largeOrderRatio: number;
    blockTradeDetected: boolean;
    institutionalMomentum: number;
  };
  optionsFlowData: {
    callPutRatio: number;
    unusualActivity: boolean;
    largestStrike: number;
    largestExpiry: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    premiumFlow: number;
    gammaExposure: string;
  };
}

interface ScanSummary {
  totalScanned: number;
  aPlus: number;
  a: number;
  b: number;
  c: number;
  topLong: number;
  topShort: number;
  avgComposite: number;
  scanTime: string;
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
}

function getCategoryColor(cat: string) {
  switch (cat) {
    case 'A+': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black';
    case 'A': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    case 'B': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    case 'C': return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white';
    default: return 'bg-slate-600 text-white';
  }
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function SignalCard({ signal, onExpand }: { signal: InstitutionalSignal; onExpand: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) onExpand();
  };

  return (
    <Card className="bg-slate-800/90 border-slate-700 hover:border-slate-500 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge className={`${getCategoryColor(signal.category)} px-2 py-0.5 text-xs font-bold`}>
              {signal.category}
            </Badge>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{signal.symbol}</span>
                {signal.setup.direction === 'LONG' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
              </div>
              <span className="text-slate-400 text-xs">{signal.name}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-lg">${signal.price.toFixed(2)}</div>
            <div className={`text-sm font-medium ${signal.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {signal.changePercent >= 0 ? '+' : ''}{signal.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs border-slate-600">
            <Crosshair className="h-3 w-3 mr-1" />
            {signal.setup.type}
          </Badge>
          <Badge variant="outline" className={`text-xs ${signal.setup.direction === 'LONG' ? 'border-green-600 text-green-400' : 'border-red-600 text-red-400'}`}>
            {signal.setup.direction}
          </Badge>
          <Badge variant="outline" className="text-xs border-slate-600">
            <Target className="h-3 w-3 mr-1" />
            {signal.setup.riskReward}:1 R/R
          </Badge>
          <Badge variant="outline" className="text-xs border-slate-600">
            {signal.setup.confidence}% conf
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <ScoreBar label="Composite" value={signal.scores.composite} color="bg-gradient-to-r from-purple-500 to-pink-500" />
          <ScoreBar label="Dark Pool" value={signal.scores.darkPool} color="bg-gradient-to-r from-indigo-500 to-blue-500" />
          <ScoreBar label="Smart Money" value={signal.scores.smartMoney} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              {signal.relativeVolume.toFixed(1)}x vol
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {signal.setup.timeframe}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="text-slate-400 hover:text-white"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" /> Trade Setup
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry</span>
                    <span className="text-white font-medium">${signal.setup.entry.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Stop Loss</span>
                    <span className="text-red-400 font-medium">${signal.setup.stopLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Target 1</span>
                    <span className="text-green-400 font-medium">${signal.setup.target1.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Target 2</span>
                    <span className="text-green-400 font-medium">${signal.setup.target2.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Target 3</span>
                    <span className="text-emerald-400 font-medium">${signal.setup.target3.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Position Size</span>
                    <span className="text-yellow-400 text-xs">{signal.setup.positionSize}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> All Scores
                </h4>
                <div className="space-y-1.5">
                  <ScoreBar label="Options Flow" value={signal.scores.optionsFlow} color="bg-gradient-to-r from-amber-500 to-orange-500" />
                  <ScoreBar label="Momentum" value={signal.scores.momentum} color="bg-gradient-to-r from-cyan-500 to-blue-500" />
                  <ScoreBar label="Accumulation" value={signal.scores.accumulation} color="bg-gradient-to-r from-green-500 to-emerald-500" />
                  <ScoreBar label="Liq. Sweep" value={signal.scores.liquiditySweep} color="bg-gradient-to-r from-red-500 to-pink-500" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Institutional Flow Details
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-1">Dark Pool</div>
                  <div className={`text-xs font-medium ${signal.darkPoolActivity.sentiment === 'accumulation' ? 'text-green-400' : signal.darkPoolActivity.sentiment === 'distribution' ? 'text-red-400' : 'text-slate-300'}`}>
                    {signal.darkPoolActivity.sentiment.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {signal.darkPoolActivity.volumeAnomaly.toFixed(1)}x anomaly
                  </div>
                  {signal.darkPoolActivity.priceAbsorption && (
                    <Badge className="mt-1 text-[10px] bg-purple-900/50 text-purple-300">Absorption</Badge>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-1">Smart Money</div>
                  <div className={`text-xs font-medium ${signal.smartMoneyFlow.direction === 'inflow' ? 'text-green-400' : signal.smartMoneyFlow.direction === 'outflow' ? 'text-red-400' : 'text-slate-300'}`}>
                    {signal.smartMoneyFlow.direction.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Strength: {signal.smartMoneyFlow.strength.toFixed(0)}%
                  </div>
                  {signal.smartMoneyFlow.blockTradeDetected && (
                    <Badge className="mt-1 text-[10px] bg-blue-900/50 text-blue-300">Block Trades</Badge>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-1">Options Flow</div>
                  <div className={`text-xs font-medium ${signal.optionsFlowData.sentiment === 'bullish' ? 'text-green-400' : signal.optionsFlowData.sentiment === 'bearish' ? 'text-red-400' : 'text-slate-300'}`}>
                    {signal.optionsFlowData.sentiment.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    C/P: {signal.optionsFlowData.callPutRatio.toFixed(2)}
                  </div>
                  {signal.optionsFlowData.unusualActivity && (
                    <Badge className="mt-1 text-[10px] bg-amber-900/50 text-amber-300">Unusual</Badge>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Technicals
              </h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded p-1.5 text-center">
                  <div className="text-slate-500">RSI</div>
                  <div className={`font-medium ${signal.technicals.rsi < 30 ? 'text-green-400' : signal.technicals.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
                    {signal.technicals.rsi.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-1.5 text-center">
                  <div className="text-slate-500">ADX</div>
                  <div className={`font-medium ${signal.technicals.adx > 25 ? 'text-green-400' : 'text-slate-300'}`}>
                    {signal.technicals.adx.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-1.5 text-center">
                  <div className="text-slate-500">MACD</div>
                  <div className={`font-medium ${signal.technicals.macdHist > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.technicals.macdHist > 0 ? '+' : ''}{signal.technicals.macdHist.toFixed(2)}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-1.5 text-center">
                  <div className="text-slate-500">VWAP</div>
                  <div className={`font-medium ${signal.price > signal.technicals.vwap ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.price > signal.technicals.vwap ? 'Above' : 'Below'}
                  </div>
                </div>
              </div>
            </div>

            {signal.signals.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Active Signals
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {signal.signals.map((sig, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                      {sig}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HedgeFundScanner() {
  const [activeTab, setActiveTab] = useState('top');
  const [searchTicker, setSearchTicker] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('composite');
  const [scanMode, setScanMode] = useState<'quick' | 'full'>('quick');

  const statusQuery = useQuery<{ isScanning: boolean; progress: { current: number; total: number; phase: string } }>({
    queryKey: ['/api/hedge-fund/status'],
    refetchInterval: 3000,
  });

  const buildResultsUrl = () => {
    const params = new URLSearchParams();
    if (filterCategory !== 'all') params.set('category', filterCategory);
    if (sortBy !== 'composite') params.set('sortBy', sortBy);
    params.set('limit', '50');
    return `/api/hedge-fund/results?${params}`;
  };

  const resultsQuery = useQuery({
    queryKey: ['/api/hedge-fund/results', filterCategory, sortBy],
    queryFn: async () => {
      const res = await fetch(buildResultsUrl());
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    refetchInterval: statusQuery.data?.isScanning ? 3000 : 30000,
    enabled: true,
  });

  const [scanError, setScanError] = useState<string | null>(null);

  const scanMutation = useMutation({
    mutationFn: async () => {
      setScanError(null);
      const res = await apiRequest('/api/hedge-fund/scan', 'POST', { mode: scanMode });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => resultsQuery.refetch(), 2000);
    },
    onError: (error: Error) => {
      setScanError(error.message || 'Scan failed. Please try again.');
    },
  });

  const singleAnalyzeMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await apiRequest('/api/hedge-fund/analyze-single', 'POST', { symbol });
      return res.json();
    },
  });

  const isScanning = statusQuery.data?.isScanning;
  const progress = statusQuery.data?.progress;
  const results = resultsQuery.data?.data;
  const signals: InstitutionalSignal[] = results?.signals || [];
  const summary: ScanSummary | null = results?.summary || null;

  const getFilteredSignals = (tab: string): InstitutionalSignal[] => {
    let filtered = [...signals];
    switch (tab) {
      case 'top':
        return filtered.filter(s => s.category === 'A+' || s.category === 'A').slice(0, 20);
      case 'darkpool':
        return [...filtered].sort((a, b) => b.scores.darkPool - a.scores.darkPool).filter(s => s.darkPoolActivity.detected).slice(0, 20);
      case 'smartmoney':
        return [...filtered].sort((a, b) => b.scores.smartMoney - a.scores.smartMoney).filter(s => s.smartMoneyFlow.direction !== 'neutral').slice(0, 20);
      case 'options':
        return [...filtered].sort((a, b) => b.scores.optionsFlow - a.scores.optionsFlow).filter(s => s.optionsFlowData.unusualActivity).slice(0, 20);
      case 'momentum':
        return [...filtered].sort((a, b) => b.scores.momentum - a.scores.momentum).slice(0, 20);
      case 'sweeps':
        return [...filtered].sort((a, b) => b.scores.liquiditySweep - a.scores.liquiditySweep).filter(s => s.scores.liquiditySweep > 40).slice(0, 20);
      default:
        return filtered.slice(0, 20);
    }
  };

  const displaySignals = getFilteredSignals(activeTab);

  const handleSearch = () => {
    if (searchTicker.trim()) {
      singleAnalyzeMutation.mutate(searchTicker.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              Hedge Fund & Market Maker Scanner
            </h1>
            <p className="text-slate-400 mt-1">Institutional-grade opportunity detection across 100+ assets</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={scanMode === 'quick' ? 'default' : 'ghost'}
                onClick={() => setScanMode('quick')}
                className="text-xs"
              >
                Quick (30)
              </Button>
              <Button
                size="sm"
                variant={scanMode === 'full' ? 'default' : 'ghost'}
                onClick={() => setScanMode('full')}
                className="text-xs"
              >
                Full (100+)
              </Button>
            </div>
            <Button
              onClick={() => scanMutation.mutate()}
              disabled={isScanning || scanMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
            >
              {isScanning ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Scan Market
                </>
              )}
            </Button>
          </div>
        </div>

        {isScanning && progress && (
          <Card className="bg-slate-800/80 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-400 font-medium flex items-center gap-2">
                  <Radio className="h-4 w-4 animate-pulse" />
                  {progress.phase}
                </span>
                <span className="text-sm text-slate-400">
                  {progress.current}/{progress.total} symbols
                </span>
              </div>
              <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} className="h-2" />
            </CardContent>
          </Card>
        )}

        {scanError && (
          <Card className="bg-slate-800/80 border-red-500/30">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{scanError}</span>
              <Button size="sm" variant="ghost" onClick={() => setScanError(null)} className="ml-auto text-slate-400">
                <XCircle className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Analyze any ticker (e.g. AAPL, TSLA)"
              className="pl-9 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchTicker.trim() || singleAnalyzeMutation.isPending}
            variant="outline"
            className="border-slate-600"
          >
            {singleAnalyzeMutation.isPending ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {singleAnalyzeMutation.data?.data && (
          <Card className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                <Crosshair className="h-4 w-4" />
                Individual Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalCard signal={singleAnalyzeMutation.data.data} onExpand={() => {}} />
            </CardContent>
          </Card>
        )}

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-slate-400">Scanned</div>
                <div className="text-xl font-bold text-white">{summary.totalScanned}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-yellow-500/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-yellow-400">A+ Setups</div>
                <div className="text-xl font-bold text-yellow-400">{summary.aPlus}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-green-500/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-green-400">A Setups</div>
                <div className="text-xl font-bold text-green-400">{summary.a}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-blue-400">B Setups</div>
                <div className="text-xl font-bold text-blue-400">{summary.b}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-green-500/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-green-400">Top Longs</div>
                <div className="text-xl font-bold text-green-400">{summary.topLong}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-red-500/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-red-400">Top Shorts</div>
                <div className="text-xl font-bold text-red-400">{summary.topShort}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-purple-400">Avg Score</div>
                <div className="text-xl font-bold text-purple-400">{summary.avgComposite}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-slate-400">Last Scan</div>
                <div className="text-xs font-medium text-white mt-1">
                  {summary.scanTime ? new Date(summary.scanTime).toLocaleTimeString() : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 w-full flex flex-wrap h-auto p-1 gap-1">
            <TabsTrigger value="top" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Crown className="h-3.5 w-3.5" /> Top Setups
            </TabsTrigger>
            <TabsTrigger value="darkpool" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Eye className="h-3.5 w-3.5" /> Dark Pool
            </TabsTrigger>
            <TabsTrigger value="smartmoney" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <DollarSign className="h-3.5 w-3.5" /> Smart Money
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Layers className="h-3.5 w-3.5" /> Options Flow
            </TabsTrigger>
            <TabsTrigger value="momentum" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <TrendingUp className="h-3.5 w-3.5" /> Momentum
            </TabsTrigger>
            <TabsTrigger value="sweeps" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Flame className="h-3.5 w-3.5" /> Sweeps
            </TabsTrigger>
          </TabsList>

          {['top', 'darkpool', 'smartmoney', 'options', 'momentum', 'sweeps'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {resultsQuery.isError ? (
                <Card className="bg-slate-800/60 border-red-500/30">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg text-white font-semibold mb-2">Failed to Load Results</h3>
                    <p className="text-slate-400 mb-4">There was an error fetching scan results. Please try again.</p>
                    <Button onClick={() => resultsQuery.refetch()} variant="outline" className="border-red-500/30 text-red-400">
                      <RefreshCcw className="h-4 w-4 mr-2" /> Retry
                    </Button>
                  </CardContent>
                </Card>
              ) : resultsQuery.isLoading && !signals.length ? (
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <RefreshCcw className="h-10 w-10 text-slate-500 mx-auto mb-3 animate-spin" />
                    <p className="text-slate-400">Loading scanner data...</p>
                  </CardContent>
                </Card>
              ) : !signals.length && !isScanning ? (
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl text-white font-semibold mb-2">Ready to Scan</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      Click "Scan Market" to analyze 100+ stocks for institutional-grade trading opportunities using dark pool, smart money, and options flow analysis.
                    </p>
                    <Button
                      onClick={() => scanMutation.mutate()}
                      disabled={scanMutation.isPending}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Start Institutional Scan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {displaySignals.length === 0 && !isScanning && (
                    <Card className="bg-slate-800/60 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <Filter className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">No signals match this filter. Try a different tab or run a new scan.</p>
                      </CardContent>
                    </Card>
                  )}
                  {displaySignals.map((signal, idx) => (
                    <SignalCard key={`${signal.symbol}-${idx}`} signal={signal} onExpand={() => {}} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Card className="bg-slate-800/40 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 text-center">
              This scanner uses technical analysis algorithms and volume-based heuristics to identify potential institutional activity patterns. 
              All data is derived from public market feeds. This is for educational purposes only and does not constitute financial advice. 
              Past patterns do not guarantee future results. Always do your own research and manage risk appropriately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
