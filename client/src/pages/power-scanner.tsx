import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, TrendingDown, Search, RefreshCw, Brain, Zap, Target,
  CheckCircle2, Loader2, Shield, Layers, ArrowUp, ArrowDown, LineChart, HelpCircle,
  BarChart3, DollarSign, Activity, Clock, Eye, Star, AlertTriangle, Filter,
  ChevronRight, Play, Pause, Volume2, Percent, Calendar, Globe, Settings
} from 'lucide-react';
import { http, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

// ============================================================
// TYPES - Professional Grade Scanner Data Structures
// ============================================================

interface ScanSignal {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  aiScore: number;
  technicalScore: number;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2?: number;
  target3?: number;
  riskRewardRatio: number;
  reasoning?: string;
  signals?: string[];
  volume?: number;
  avgVolume?: number;
  relativeVolume?: number;
  sector?: string;
  marketCap?: string;
}

interface OptionsSetup {
  symbol: string;
  optionType: 'call' | 'put';
  strike: number;
  expiration: string;
  premium: number;
  delta: number;
  iv: number;
  volume: number;
  openInterest: number;
  bidAsk: { bid: number; ask: number };
  probabilityOTM: number;
  maxProfit: number;
  maxLoss: number;
  breakeven: number;
  recommendation: string;
  isQualified: boolean;
  score: number;
  underlyingPrice: number;
  daysToExpiration: number;
}

interface StockAnalysis {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  technicals: {
    rsi14: number;
    macd: { value: number; signal: number; histogram: number };
    sma20: number;
    sma50: number;
    sma200: number;
    atr14: number;
    bollingerBands?: { upper: number; middle: number; lower: number };
    stochastic?: { k: number; d: number };
  };
  aiAnalysis: {
    summary: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    keyPoints: string[];
    risks: string[];
    priceTargets: { support: number; resistance: number };
  };
}

interface PriceForecast {
  symbol: string;
  currentPrice: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  predictions?: { date: string; price: number; lower: number; upper: number }[];
  targets?: { price: number; probability: number }[];
  stopLoss?: number;
  timeframe?: string;
  reasoning?: string;
}

interface MAFibSetup {
  symbol: string;
  type: 'BULLISH' | 'BEARISH';
  currentPrice: number;
  ema50?: number;
  sma100?: number;
  fib50?: number;
  fib618?: number;
  inGoldenZone?: boolean;
  confluenceScore?: number;
  entryZone?: { low: number; high: number };
  stopLoss?: number;
  target1?: number;
  target2?: number;
}

interface ScanStats {
  lastScanDate: string;
  totalScanned: number;
  meetingCriteria: number;
  bullish: number;
  bearish: number;
  avgConfidence: number;
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PowerScanner() {
  const [activeTab, setActiveTab] = useState('quick-scan');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<ScanSignal | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionsSetup | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<PriceForecast | null>(null);
  const [scanFilter, setScanFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [optionType, setOptionType] = useState<'both' | 'calls' | 'puts'>('both');
  const [autoScanTriggered, setAutoScanTriggered] = useState(false);
  const { toast } = useToast();

  // ============================================================
  // QUICK SCAN - One-click market scan
  // ============================================================
  
  const { data: scanStats } = useQuery<ScanStats>({
    queryKey: ['/api/ai-profit/stats'],
  });

  const { data: existingSignals, isLoading: signalsLoading, refetch: refetchSignals } = useQuery<ScanSignal[]>({
    queryKey: ['/api/ai-profit/signals'],
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      return data?.signals || data?.data || [];
    },
  });

  const quickScanMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post('/api/ai-profit/scan', { useFullMarket: false });
      return response;
    },
    onSuccess: (data: any) => {
      const count = data?.meetingCriteria || data?.signals?.length || 0;
      toast({ title: 'Quick Scan Complete', description: `Found ${count} high-probability setups` });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-profit/signals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-profit/stats'] });
    },
    onError: () => {
      toast({ title: 'Scan Failed', description: 'Please try again', variant: 'destructive' });
    },
  });

  const fullScanMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post('/api/ai-profit/scan', { useFullMarket: true });
      return response;
    },
    onSuccess: (data: any) => {
      const count = data?.meetingCriteria || data?.signals?.length || 0;
      toast({ title: 'Full Market Scan Complete', description: `Scanned ${data?.totalScanned || 0} stocks, found ${count} opportunities` });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-profit/signals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-profit/stats'] });
    },
    onError: () => {
      toast({ title: 'Scan Failed', description: 'Please try again', variant: 'destructive' });
    },
  });

  // ============================================================
  // OPTIONS SCANNER - High probability options
  // ============================================================

  const { data: optionsData, isLoading: optionsLoading, refetch: refetchOptions } = useQuery<{
    opportunities: OptionsSetup[];
    topPicks: { call?: OptionsSetup; put?: OptionsSetup };
    stats: { totalScanned: number; qualifiedSetups: number };
  }>({
    queryKey: ['/api/income-machine/latest'],
    enabled: activeTab === 'options',
  });

  const optionsScanMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post('/api/income-machine/scan', { scanType: optionType });
      return response;
    },
    onSuccess: (data: any) => {
      toast({ title: 'Options Scan Complete', description: `Found ${data?.opportunities?.length || 0} option setups` });
      queryClient.invalidateQueries({ queryKey: ['/api/income-machine/latest'] });
    },
  });

  // High probability 70-delta scan
  const delta70ScanMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post('/api/income-machine/70-delta/scan', {});
      return response;
    },
    onSuccess: (data: any) => {
      toast({ title: '70-Delta Scan Complete', description: `Found ${data?.qualifiedSetups || 0} high-probability setups` });
      queryClient.invalidateQueries({ queryKey: ['/api/income-machine/latest'] });
    },
  });

  // ============================================================
  // STOCK ANALYSIS - Deep dive individual
  // ============================================================

  const { data: stockAnalysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery<{ success: boolean; data: StockAnalysis }>({
    queryKey: ['/api/stock-research/analyze', searchSymbol],
    enabled: searchSymbol.length > 0 && activeTab === 'analysis',
  });

  // ============================================================
  // FORECAST - AI price predictions
  // ============================================================

  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useQuery<{ success: boolean; data: PriceForecast }>({
    queryKey: ['/api/forecaster/forecast', searchSymbol],
    enabled: searchSymbol.length > 0 && activeTab === 'forecast',
  });

  // ============================================================
  // MA + FIBONACCI - Technical setups
  // ============================================================

  const { data: maFibData, isLoading: maFibLoading, refetch: refetchMAFib } = useQuery<{ success: boolean; data: { bullishSetups: MAFibSetup[]; bearishSetups: MAFibSetup[] } }>({
    queryKey: ['/api/ma-fibonacci/scan'],
    enabled: activeTab === 'ma-fib',
  });

  // ============================================================
  // MULTI-ASSET FORECASTS - Real-time AI predictions
  // ============================================================

  const { data: multiAssetData, isLoading: multiAssetLoading, refetch: refetchMultiAsset } = useQuery<{
    forecasts: PriceForecast[];
  }>({
    queryKey: ['/api/forecaster/multi-asset'],
    enabled: activeTab === 'forecast',
  });

  // ============================================================
  // AUTO-SCAN ON PAGE LOAD
  // ============================================================

  useEffect(() => {
    if (!autoScanTriggered && !signalsLoading && (!existingSignals || existingSignals.length === 0)) {
      setAutoScanTriggered(true);
      quickScanMutation.mutate();
    }
  }, [autoScanTriggered, signalsLoading, existingSignals]);

  // ============================================================
  // FILTERED SIGNALS
  // ============================================================

  const filteredSignals = (existingSignals || []).filter(signal => {
    if (scanFilter === 'bullish' && signal.direction !== 'bullish') return false;
    if (scanFilter === 'bearish' && signal.direction !== 'bearish') return false;
    if (signal.confidence < confidenceFilter) return false;
    return true;
  });

  // Use API data for options - no fallback to simulated data
  const optionsSource = optionsData?.opportunities || [];
    
  const filteredOptions = optionsSource.filter((opt: OptionsSetup) => {
    if (optionType === 'calls' && opt.optionType !== 'call') return false;
    if (optionType === 'puts' && opt.optionType !== 'put') return false;
    return true;
  });
  
  // Get top picks from options
  const topCallPick = optionsSource.find((o: OptionsSetup) => o.optionType === 'call' && o.isQualified);
  const topPutPick = optionsSource.find((o: OptionsSetup) => o.optionType === 'put' && o.isQualified);
  
  // Multi-asset forecasts from API
  const multiAssetForecasts = multiAssetData?.forecasts || [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Professional Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              Power Scanner Pro
              <Badge className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs">
                INSTITUTIONAL GRADE
              </Badge>
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-1">
              AI-Powered Market Analysis • Options Flow • Real-Time Signals • Multi-Asset Coverage
            </p>
          </div>
          <div className="flex items-center gap-3">
            <IntermarketBanner />
          </div>
        </div>

        {/* Live Stats Banner */}
        {scanStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{scanStats.totalScanned || 0}</div>
                <div className="text-xs text-slate-200">Stocks Scanned</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{scanStats.meetingCriteria || 0}</div>
                <div className="text-xs text-slate-200">Opportunities</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{scanStats.avgConfidence?.toFixed(0) || '--'}%</div>
                <div className="text-xs text-slate-200">Avg Confidence</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-violet-400">{scanStats.bullish || 0}/{scanStats.bearish || 0}</div>
                <div className="text-xs text-slate-200">Bull/Bear Split</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Scanner Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="bg-slate-800/80 border border-slate-700 p-1 inline-flex min-w-max">
              <TabsTrigger value="quick-scan" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white whitespace-nowrap">
                <Zap className="h-4 w-4 mr-2" /> Quick Scan
              </TabsTrigger>
              <TabsTrigger value="options" className="data-[state=active]:bg-green-600 data-[state=active]:text-white whitespace-nowrap">
                <DollarSign className="h-4 w-4 mr-2" /> Options
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white whitespace-nowrap">
                <Brain className="h-4 w-4 mr-2" /> Analysis
              </TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white whitespace-nowrap">
                <LineChart className="h-4 w-4 mr-2" /> Forecast
              </TabsTrigger>
              <TabsTrigger value="ma-fib" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white whitespace-nowrap">
                <Layers className="h-4 w-4 mr-2" /> MA + Fib
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ================================================================ */}
          {/* QUICK SCAN TAB */}
          {/* ================================================================ */}
          <TabsContent value="quick-scan" className="space-y-4 mt-4">
            {/* Scan Controls */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => quickScanMutation.mutate()}
                      disabled={quickScanMutation.isPending || fullScanMutation.isPending}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    >
                      {quickScanMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
                      ) : (
                        <><Zap className="h-4 w-4 mr-2" /> Quick Scan</>
                      )}
                    </Button>
                    <Button 
                      onClick={() => fullScanMutation.mutate()}
                      disabled={quickScanMutation.isPending || fullScanMutation.isPending}
                      variant="outline"
                      className="border-violet-500 text-violet-400 hover:bg-violet-500/20"
                    >
                      {fullScanMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Full Scan...</>
                      ) : (
                        <><Globe className="h-4 w-4 mr-2" /> Full Market Scan</>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => refetchSignals()}
                      className="text-slate-200"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select value={scanFilter} onValueChange={(v) => setScanFilter(v as any)}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Signals</SelectItem>
                        <SelectItem value="bullish">Bullish Only</SelectItem>
                        <SelectItem value="bearish">Bearish Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={confidenceFilter.toString()} onValueChange={(v) => setConfidenceFilter(parseInt(v))}>
                      <SelectTrigger className="w-36 bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Confidence</SelectItem>
                        <SelectItem value="60">60%+ Confidence</SelectItem>
                        <SelectItem value="70">70%+ Confidence</SelectItem>
                        <SelectItem value="80">80%+ Confidence</SelectItem>
                        <SelectItem value="90">90%+ Confidence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Signal List */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-cyan-400" />
                        Trading Opportunities
                      </CardTitle>
                      <Badge variant="outline" className="text-cyan-400 border-cyan-500">
                        {filteredSignals.length} signals
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {signalsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                        <span className="ml-3 text-slate-200">Loading signals...</span>
                      </div>
                    ) : filteredSignals.length > 0 ? (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                          {filteredSignals.map((signal, idx) => (
                            <SignalCard 
                              key={`${signal.symbol}-${idx}`}
                              signal={signal} 
                              isSelected={selectedSignal?.symbol === signal.symbol}
                              onSelect={() => setSelectedSignal(signal)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No Signals Yet</h3>
                        <p className="text-slate-200 mb-4">Click "Quick Scan" or "Full Market Scan" to find opportunities</p>
                        <Button 
                          onClick={() => quickScanMutation.mutate()}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Zap className="h-4 w-4 mr-2" /> Run Quick Scan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Signal Details Panel */}
              <div className="lg:col-span-1">
                {selectedSignal ? (
                  <SignalDetailsPanel signal={selectedSignal} />
                ) : (
                  <Card className="bg-slate-900/80 border-slate-700 h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <Eye className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Select a Signal</h3>
                      <p className="text-slate-200">Click on any signal to see detailed breakdown</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================================================================ */}
          {/* OPTIONS SCANNER TAB */}
          {/* ================================================================ */}
          <TabsContent value="options" className="space-y-4 mt-4">
            {/* Options Scan Controls */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => optionsScanMutation.mutate()}
                      disabled={optionsScanMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {optionsScanMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
                      ) : (
                        <><DollarSign className="h-4 w-4 mr-2" /> Options Scan</>
                      )}
                    </Button>
                    <Button 
                      onClick={() => delta70ScanMutation.mutate()}
                      disabled={delta70ScanMutation.isPending}
                      variant="outline"
                      className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
                    >
                      {delta70ScanMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
                      ) : (
                        <><Target className="h-4 w-4 mr-2" /> 70-Delta High Prob</>
                      )}
                    </Button>
                    <Button variant="ghost" onClick={() => refetchOptions()} className="text-slate-200">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Select value={optionType} onValueChange={(v) => setOptionType(v as any)}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">All Options</SelectItem>
                      <SelectItem value="calls">Calls Only</SelectItem>
                      <SelectItem value="puts">Puts Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Top Picks - Real-time API data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topCallPick && (
                <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-500/40 cursor-pointer hover:border-green-400" onClick={() => setSelectedOption(topCallPick)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Top Call Pick - {topCallPick.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OptionsCard option={topCallPick} />
                  </CardContent>
                </Card>
              )}
              {topPutPick && (
                <Card className="bg-gradient-to-br from-red-900/40 to-rose-900/20 border-red-500/40 cursor-pointer hover:border-red-400" onClick={() => setSelectedOption(topPutPick)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" /> Top Put Pick - {topPutPick.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OptionsCard option={topPutPick} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        Options Opportunities
                      </CardTitle>
                      <Badge variant="outline" className="text-green-400 border-green-500">
                        {filteredOptions.length} setups
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {optionsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                      </div>
                    ) : filteredOptions.length > 0 ? (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                          {filteredOptions.map((opt, idx) => (
                            <OptionsListCard 
                              key={`${opt.symbol}-${opt.strike}-${idx}`}
                              option={opt}
                              isSelected={selectedOption?.symbol === opt.symbol && selectedOption?.strike === opt.strike}
                              onSelect={() => setSelectedOption(opt)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No Options Data</h3>
                        <p className="text-slate-200 mb-4">Run an options scan to find high-probability setups</p>
                        <Button onClick={() => optionsScanMutation.mutate()} className="bg-green-600 hover:bg-green-700">
                          <DollarSign className="h-4 w-4 mr-2" /> Scan Options
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                {selectedOption ? (
                  <OptionsDetailsPanel option={selectedOption} />
                ) : (
                  <Card className="bg-slate-900/80 border-slate-700 h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <Eye className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Select an Option</h3>
                      <p className="text-slate-200">Click on any option to see full details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================================================================ */}
          {/* ANALYSIS TAB */}
          {/* ================================================================ */}
          <TabsContent value="analysis" className="space-y-4 mt-4">
            {/* Search Bar */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Input
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter stock symbol (e.g., AAPL, TSLA, NVDA)"
                    className="bg-slate-800 border-slate-600 text-white flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && refetchAnalysis()}
                  />
                  <Button 
                    onClick={() => refetchAnalysis()}
                    disabled={!searchSymbol || analysisLoading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {analysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Quick Select */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META', 'SPY', 'QQQ'].map(sym => (
                    <Button
                      key={sym}
                      variant="outline"
                      size="sm"
                      onClick={() => { setSearchSymbol(sym); }}
                      className={`text-xs ${searchSymbol === sym ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-600 text-slate-200'}`}
                    >
                      {sym}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Signal Fusion AI */}
            {searchSymbol && (
              <SignalFusionAnalysis symbol={searchSymbol} assetType="stock" compact />
            )}

            {/* Analysis Results */}
            {analysisLoading ? (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
                  <p className="text-slate-200 mt-3">Analyzing {searchSymbol}...</p>
                </CardContent>
              </Card>
            ) : stockAnalysis?.data ? (
              <AnalysisPanel data={stockAnalysis.data} />
            ) : searchSymbol ? (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Ready to Analyze</h3>
                  <p className="text-slate-200">Click the search button to analyze {searchSymbol}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Enter a Symbol</h3>
                  <p className="text-slate-200">Type a stock symbol above for deep AI analysis</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ================================================================ */}
          {/* FORECAST TAB - Multi-Asset View */}
          {/* ================================================================ */}
          <TabsContent value="forecast" className="space-y-4 mt-4">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Multi-Asset AI Forecasts</h3>
                    <p className="text-sm text-slate-200">Professional price predictions with detailed reasoning for each asset</p>
                  </div>
                  <Badge className="bg-amber-600 text-white">{multiAssetForecasts.length} Assets</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Forecast Grid - List + Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-amber-400" />
                      AI Price Forecasts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {multiAssetLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                      </div>
                    ) : multiAssetForecasts.length > 0 ? (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                          {multiAssetForecasts.map((forecast: PriceForecast, idx: number) => (
                            <ForecastListCard 
                              key={`forecast-${idx}`}
                              forecast={forecast}
                              isSelected={selectedForecast?.symbol === forecast.symbol}
                              onSelect={() => setSelectedForecast(forecast)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <LineChart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Loading Forecasts</h3>
                        <p className="text-slate-200 mb-4">AI is generating real-time price predictions...</p>
                        <Button onClick={() => refetchMultiAsset()} className="bg-amber-600 hover:bg-amber-700">
                          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Forecasts
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                {selectedForecast ? (
                  <ForecastDetailsPanel data={selectedForecast} />
                ) : (
                  <Card className="bg-slate-900/80 border-slate-700 h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <LineChart className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Select an Asset</h3>
                      <p className="text-slate-200">Click any forecast to see detailed AI analysis and reasoning</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================================================================ */}
          {/* MA + FIB TAB */}
          {/* ================================================================ */}
          <TabsContent value="ma-fib" className="space-y-4 mt-4">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Moving Average + Fibonacci Scanner</h3>
                    <p className="text-sm text-slate-200">Find stocks in the "Golden Zone" with EMA/SMA confluence</p>
                  </div>
                  <Button 
                    onClick={() => refetchMAFib()}
                    disabled={maFibLoading}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {maFibLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4 mr-2" /> Scan</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {maFibLoading ? (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-400 mx-auto" />
                </CardContent>
              </Card>
            ) : maFibData?.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bullish Setups */}
                <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Bullish Setups ({maFibData.data.bullishSetups?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {maFibData.data.bullishSetups?.map((setup, idx) => (
                          <MAFibCard key={`bull-${idx}`} setup={setup} />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Bearish Setups */}
                <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" /> Bearish Setups ({maFibData.data.bearishSetups?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {maFibData.data.bearishSetups?.map((setup, idx) => (
                          <MAFibCard key={`bear-${idx}`} setup={setup} />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">MA + Fibonacci Scanner</h3>
                  <p className="text-slate-200">Click Scan to find stocks in the Golden Zone</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SignalCard({ signal, isSelected, onSelect }: { signal: ScanSignal; isSelected: boolean; onSelect: () => void }) {
  const isBullish = signal.direction === 'bullish';
  
  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-cyan-500 bg-cyan-900/30' 
          : isBullish 
            ? 'border-green-500/30 bg-gradient-to-r from-green-900/20 to-transparent hover:border-green-500/50' 
            : 'border-red-500/30 bg-gradient-to-r from-red-900/20 to-transparent hover:border-red-500/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isBullish ? <TrendingUp className="h-4 w-4 text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
          <span className="font-bold text-white">{signal.symbol}</span>
          {signal.name && <span className="text-xs text-slate-200">{signal.name}</span>}
        </div>
        <Badge className={`${isBullish ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {signal.confidence != null ? Number(signal.confidence).toFixed(0) : '--'}%
        </Badge>
      </div>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-slate-200">Price</span>
          <div className="text-white font-medium">${signal.price != null ? Number(signal.price).toFixed(2) : '--'}</div>
        </div>
        <div>
          <span className="text-slate-200">Entry</span>
          <div className="text-cyan-400">${signal.entryPrice != null ? Number(signal.entryPrice).toFixed(2) : '--'}</div>
        </div>
        <div>
          <span className="text-slate-200">Target</span>
          <div className="text-green-400">${signal.target1 != null ? Number(signal.target1).toFixed(2) : '--'}</div>
        </div>
        <div>
          <span className="text-slate-200">R:R</span>
          <div className="text-amber-400">{signal.riskRewardRatio != null ? Number(signal.riskRewardRatio).toFixed(1) : '--'}:1</div>
        </div>
      </div>
    </div>
  );
}

function SignalDetailsPanel({ signal }: { signal: ScanSignal }) {
  const isBullish = signal.direction === 'bullish';
  
  return (
    <Card className={`${isBullish ? 'bg-gradient-to-br from-green-900/40 to-slate-900' : 'bg-gradient-to-br from-red-900/40 to-slate-900'} border-slate-700`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              {isBullish ? <TrendingUp className="h-6 w-6 text-green-400" /> : <TrendingDown className="h-6 w-6 text-red-400" />}
              {signal.symbol}
            </CardTitle>
            <CardDescription className="text-slate-300">{signal.name}</CardDescription>
          </div>
          <Badge className={`${isBullish ? 'bg-green-600' : 'bg-red-600'} text-white text-lg px-3 py-1`}>
            {signal.confidence != null ? Number(signal.confidence).toFixed(0) : '--'}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-200">Current Price</div>
            <div className="text-xl font-bold text-white">${signal.price != null ? Number(signal.price).toFixed(2) : '--'}</div>
            <div className={`text-sm ${Number(signal.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(signal.changePercent || 0) >= 0 ? '+' : ''}{signal.changePercent != null ? Number(signal.changePercent).toFixed(2) : '--'}%
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-200">AI Score</div>
            <div className="text-xl font-bold text-violet-400">{signal.aiScore || '--'}</div>
            <div className="text-sm text-slate-200">Technical: {signal.technicalScore || '--'}</div>
          </div>
        </div>

        {/* Trade Setup */}
        <div className="space-y-2">
          <h4 className="text-white font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" /> Trade Setup
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between p-2 bg-cyan-900/30 rounded border border-cyan-500/30">
              <span className="text-cyan-300">Entry</span>
              <span className="text-white font-medium">${signal.entryPrice != null ? Number(signal.entryPrice).toFixed(2) : '--'}</span>
            </div>
            <div className="flex justify-between p-2 bg-red-900/30 rounded border border-red-500/30">
              <span className="text-red-300">Stop Loss</span>
              <span className="text-white font-medium">${signal.stopLoss != null ? Number(signal.stopLoss).toFixed(2) : '--'}</span>
            </div>
            <div className="flex justify-between p-2 bg-green-900/30 rounded border border-green-500/30">
              <span className="text-green-300">Target 1</span>
              <span className="text-white font-medium">${signal.target1 != null ? Number(signal.target1).toFixed(2) : '--'}</span>
            </div>
            {signal.target2 && (
              <div className="flex justify-between p-2 bg-green-900/20 rounded border border-green-500/20">
                <span className="text-green-300">Target 2</span>
                <span className="text-white font-medium">${Number(signal.target2).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Risk/Reward */}
        <div className="p-3 bg-amber-900/30 rounded-lg border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-amber-300">Risk/Reward Ratio</span>
            <span className="text-2xl font-bold text-amber-400">{signal.riskRewardRatio != null ? Number(signal.riskRewardRatio).toFixed(1) : '--'}:1</span>
          </div>
        </div>

        {/* Signals */}
        {signal.signals && signal.signals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Active Signals</h4>
            <div className="flex flex-wrap gap-1">
              {signal.signals.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs text-cyan-400 border-cyan-500/50">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* WHY THIS STOCK WAS SELECTED - Main Reasoning Section */}
        <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-500/30">
          <h4 className="text-violet-300 font-medium mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4" /> Why {signal.symbol} Was Selected
          </h4>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            {signal.reasoning ? (
              <p>{signal.reasoning}</p>
            ) : (
              <>
                <p>
                  <strong className="text-white">Technical Analysis:</strong> {signal.symbol} demonstrates a {isBullish ? 'bullish' : 'bearish'} setup with {Number(signal.confidence).toFixed(0)}% confidence. 
                  The AI score of {signal.aiScore || '--'} combined with a technical score of {signal.technicalScore || '--'} indicates {isBullish ? 'strong buying' : 'selling'} pressure.
                </p>
                <p>
                  <strong className="text-white">Risk/Reward:</strong> Entry at ${Number(signal.entryPrice).toFixed(2)} with stop at ${Number(signal.stopLoss).toFixed(2)} offers a {Number(signal.riskRewardRatio).toFixed(1)}:1 risk-to-reward ratio.
                  {Number(signal.riskRewardRatio) >= 2 ? ' This exceeds our 2:1 minimum threshold for optimal position sizing.' : ''}
                </p>
                <p>
                  <strong className="text-white">Price Action:</strong> Current price at ${Number(signal.price).toFixed(2)} 
                  {signal.relativeVolume && Number(signal.relativeVolume) > 1.5 ? ` with ${Number(signal.relativeVolume).toFixed(1)}x relative volume indicating institutional interest.` : '.'}
                  Target 1 at ${Number(signal.target1).toFixed(2)} represents a {(((Number(signal.target1) - Number(signal.price)) / Number(signal.price)) * 100).toFixed(1)}% potential move.
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Volume Analysis */}
        {signal.volume && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-slate-800/30 rounded">
              <span className="text-slate-200">Volume:</span>
              <span className="text-white ml-2">{Number(signal.volume).toLocaleString()}</span>
            </div>
            <div className="p-2 bg-slate-800/30 rounded">
              <span className="text-slate-200">Rel. Volume:</span>
              <span className={`ml-2 ${Number(signal.relativeVolume || 1) > 1.5 ? 'text-green-400' : 'text-white'}`}>
                {signal.relativeVolume ? `${Number(signal.relativeVolume).toFixed(1)}x` : '--'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OptionsCard({ option }: { option: OptionsSetup }) {
  const isCall = option.optionType === 'call';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-lg">{option.symbol}</span>
        <Badge className={isCall ? 'bg-green-600' : 'bg-red-600'}>{option.optionType.toUpperCase()}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-slate-200">Strike:</span> <span className="text-white">${option.strike}</span></div>
        <div><span className="text-slate-200">Premium:</span> <span className="text-cyan-400">${option.premium != null ? Number(option.premium).toFixed(2) : '--'}</span></div>
        <div><span className="text-slate-200">Delta:</span> <span className="text-amber-400">{option.delta != null ? (Number(option.delta) * 100).toFixed(0) : '--'}%</span></div>
        <div><span className="text-slate-200">Prob OTM:</span> <span className="text-violet-400">{option.probabilityOTM != null ? Number(option.probabilityOTM).toFixed(0) : '--'}%</span></div>
      </div>
    </div>
  );
}

function OptionsListCard({ option, isSelected, onSelect }: { option: OptionsSetup; isSelected: boolean; onSelect: () => void }) {
  const isCall = option.optionType === 'call';
  
  return (
    <div 
      onClick={onSelect}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-cyan-500 bg-cyan-900/30' 
          : isCall 
            ? 'border-green-500/30 bg-green-900/20 hover:border-green-500/50' 
            : 'border-red-500/30 bg-red-900/20 hover:border-red-500/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={isCall ? 'bg-green-600' : 'bg-red-600'}>{option.optionType.toUpperCase()}</Badge>
          <span className="font-bold text-white">{option.symbol}</span>
          <span className="text-slate-200 text-sm">${option.strike} Strike</span>
        </div>
        <span className="text-amber-400 font-medium">{option.score != null ? Number(option.score).toFixed(0) : '--'} pts</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div><span className="text-slate-200">Prem:</span> <span className="text-cyan-400">${option.premium != null ? Number(option.premium).toFixed(2) : '--'}</span></div>
        <div><span className="text-slate-200">Delta:</span> <span className="text-white">{option.delta != null ? (Number(option.delta) * 100).toFixed(0) : '--'}%</span></div>
        <div><span className="text-slate-200">IV:</span> <span className="text-violet-400">{option.iv != null ? (Number(option.iv) * 100).toFixed(0) : '--'}%</span></div>
        <div><span className="text-slate-200">DTE:</span> <span className="text-white">{option.daysToExpiration}d</span></div>
      </div>
    </div>
  );
}

function OptionsDetailsPanel({ option }: { option: OptionsSetup }) {
  const isCall = option.optionType === 'call';
  
  return (
    <Card className={`${isCall ? 'bg-gradient-to-br from-green-900/40 to-slate-900' : 'bg-gradient-to-br from-red-900/40 to-slate-900'} border-slate-700`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{option.symbol} ${option.strike} {option.optionType.toUpperCase()}</CardTitle>
          <Badge className={isCall ? 'bg-green-600' : 'bg-red-600'}>{option.score != null ? Number(option.score).toFixed(0) : '--'} Score</Badge>
        </div>
        <CardDescription>Expires: {option.expiration} ({option.daysToExpiration} days)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-200">Premium</div>
            <div className="text-xl font-bold text-cyan-400">${option.premium != null ? Number(option.premium).toFixed(2) : '--'}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-200">Delta</div>
            <div className="text-xl font-bold text-amber-400">{option.delta != null ? (Number(option.delta) * 100).toFixed(0) : '--'}%</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between p-2 bg-slate-800/30 rounded">
            <span className="text-slate-200">Underlying Price</span>
            <span className="text-white">${option.underlyingPrice != null ? Number(option.underlyingPrice).toFixed(2) : '--'}</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800/30 rounded">
            <span className="text-slate-200">Implied Volatility</span>
            <span className="text-violet-400">{option.iv != null ? (Number(option.iv) * 100).toFixed(1) : '--'}%</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800/30 rounded">
            <span className="text-slate-200">Probability OTM</span>
            <span className="text-green-400">{option.probabilityOTM != null ? Number(option.probabilityOTM).toFixed(1) : '--'}%</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800/30 rounded">
            <span className="text-slate-200">Volume / OI</span>
            <span className="text-white">{option.volume || '--'} / {option.openInterest || '--'}</span>
          </div>
          <div className="flex justify-between p-2 bg-green-900/30 rounded border border-green-500/30">
            <span className="text-green-300">Max Profit</span>
            <span className="text-green-400 font-bold">${option.maxProfit != null ? Number(option.maxProfit).toFixed(2) : '--'}</span>
          </div>
          <div className="flex justify-between p-2 bg-red-900/30 rounded border border-red-500/30">
            <span className="text-red-300">Max Loss</span>
            <span className="text-red-400 font-bold">${option.maxLoss != null ? Number(option.maxLoss).toFixed(2) : '--'}</span>
          </div>
          <div className="flex justify-between p-2 bg-amber-900/30 rounded border border-amber-500/30">
            <span className="text-amber-300">Breakeven</span>
            <span className="text-amber-400 font-bold">${option.breakeven != null ? Number(option.breakeven).toFixed(2) : '--'}</span>
          </div>
        </div>

        {option.recommendation && (
          <div className="p-3 bg-violet-900/30 rounded-lg border border-violet-500/30">
            <div className="text-xs text-violet-400 mb-1">Recommendation</div>
            <p className="text-white">{option.recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisPanel({ data }: { data: StockAnalysis }) {
  const sentiment = data.aiAnalysis?.sentiment;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Price & Technicals */}
      <Card className="bg-slate-900/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            {data.symbol} - Technical Analysis
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">${data.price != null ? Number(data.price).toFixed(2) : '--'}</span>
            <Badge className={Number(data.changePercent || 0) >= 0 ? 'bg-green-600' : 'bg-red-600'}>
              {Number(data.changePercent || 0) >= 0 ? '+' : ''}{data.changePercent != null ? Number(data.changePercent).toFixed(2) : '--'}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-200">RSI (14)</div>
              <div className={`text-xl font-bold ${Number(data.technicals?.rsi14 || 50) > 70 ? 'text-red-400' : Number(data.technicals?.rsi14 || 50) < 30 ? 'text-green-400' : 'text-white'}`}>
                {data.technicals?.rsi14 != null ? Number(data.technicals.rsi14).toFixed(1) : '--'}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-200">MACD</div>
              <div className={`text-xl font-bold ${Number(data.technicals?.macd?.histogram || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.technicals?.macd?.histogram != null ? Number(data.technicals.macd.histogram).toFixed(2) : '--'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-slate-800/30 rounded">
              <span className="text-slate-200">SMA 20</span>
              <span className="text-white">${data.technicals?.sma20 != null ? Number(data.technicals.sma20).toFixed(2) : '--'}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/30 rounded">
              <span className="text-slate-200">SMA 50</span>
              <span className="text-white">${data.technicals?.sma50 != null ? Number(data.technicals.sma50).toFixed(2) : '--'}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/30 rounded">
              <span className="text-slate-200">SMA 200</span>
              <span className="text-white">${data.technicals?.sma200 != null ? Number(data.technicals.sma200).toFixed(2) : '--'}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/30 rounded">
              <span className="text-slate-200">ATR (14)</span>
              <span className="text-amber-400">${data.technicals?.atr14 != null ? Number(data.technicals.atr14).toFixed(2) : '--'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card className={`${sentiment === 'bullish' ? 'bg-gradient-to-br from-green-900/30 to-slate-900' : sentiment === 'bearish' ? 'bg-gradient-to-br from-red-900/30 to-slate-900' : 'bg-slate-900/80'} border-slate-700`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-400" />
            AI Analysis
          </CardTitle>
          <Badge className={sentiment === 'bullish' ? 'bg-green-600' : sentiment === 'bearish' ? 'bg-red-600' : 'bg-slate-600'}>
            {sentiment?.toUpperCase() || 'NEUTRAL'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300">{data.aiAnalysis?.summary}</p>
          
          {data.aiAnalysis?.keyPoints?.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">Key Points</h4>
              <ul className="space-y-1">
                {data.aiAnalysis.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.aiAnalysis?.risks?.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">Risks</h4>
              <ul className="space-y-1">
                {data.aiAnalysis.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.aiAnalysis?.priceTargets && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                <div className="text-xs text-green-400">Resistance</div>
                <div className="text-lg font-bold text-white">${data.aiAnalysis.priceTargets.resistance != null ? Number(data.aiAnalysis.priceTargets.resistance).toFixed(2) : '--'}</div>
              </div>
              <div className="p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                <div className="text-xs text-red-400">Support</div>
                <div className="text-lg font-bold text-white">${data.aiAnalysis.priceTargets.support != null ? Number(data.aiAnalysis.priceTargets.support).toFixed(2) : '--'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ForecastPanel({ data }: { data: PriceForecast }) {
  const isBullish = data.direction === 'BULLISH';
  const isBearish = data.direction === 'BEARISH';
  
  return (
    <div className="space-y-4">
      {/* Forecast Header */}
      <Card className={`${isBullish ? 'bg-gradient-to-r from-green-900/40 to-slate-900' : isBearish ? 'bg-gradient-to-r from-red-900/40 to-slate-900' : 'bg-slate-900/80'} border-slate-700`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{data.symbol}</h2>
              <div className="text-3xl font-bold text-white mt-1">${data.currentPrice != null ? Number(data.currentPrice).toFixed(2) : '--'}</div>
            </div>
            <div className="text-right">
              <Badge className={`${isBullish ? 'bg-green-600' : isBearish ? 'bg-red-600' : 'bg-slate-600'} text-white text-xl px-6 py-2`}>
                {data.direction}
              </Badge>
              <div className="text-lg text-slate-300 mt-2">
                {data.confidence != null ? Number(data.confidence).toFixed(0) : '--'}% Confidence
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targets & Stop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.targets?.slice(0, 3).map((target, i) => (
          <Card key={i} className="bg-gradient-to-br from-green-900/30 to-slate-900 border-green-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-xs text-green-400 mb-1">Target {i + 1}</div>
              <div className="text-2xl font-bold text-white">${target.price != null ? Number(target.price).toFixed(2) : '--'}</div>
              <div className="text-sm text-slate-200">{target.probability != null ? Number(target.probability).toFixed(0) : '--'}% probability</div>
            </CardContent>
          </Card>
        ))}
        {data.stopLoss && (
          <Card className="bg-gradient-to-br from-red-900/30 to-slate-900 border-red-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-xs text-red-400 mb-1">Stop Loss</div>
              <div className="text-2xl font-bold text-white">${Number(data.stopLoss).toFixed(2)}</div>
              <div className="text-sm text-slate-200">Risk management</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reasoning */}
      {data.reasoning && (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-400" /> AI Reasoning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{data.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MAFibCard({ setup }: { setup: MAFibSetup }) {
  const isBullish = setup.type === 'BULLISH';
  
  return (
    <div className={`p-3 rounded-lg border ${isBullish ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isBullish ? <TrendingUp className="h-4 w-4 text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
          <span className="font-bold text-white">{setup.symbol}</span>
        </div>
        {setup.inGoldenZone && (
          <Badge className="bg-amber-600 text-white text-xs">Golden Zone</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-slate-200">Price:</span> <span className="text-white">${setup.currentPrice != null ? Number(setup.currentPrice).toFixed(2) : '--'}</span></div>
        <div><span className="text-slate-200">Confluence:</span> <span className="text-cyan-400">{setup.confluenceScore != null ? Number(setup.confluenceScore).toFixed(0) : '--'}%</span></div>
        <div><span className="text-slate-200">Entry:</span> <span className="text-white">${setup.entryZone?.low != null ? Number(setup.entryZone.low).toFixed(2) : '--'} - ${setup.entryZone?.high != null ? Number(setup.entryZone.high).toFixed(2) : '--'}</span></div>
        <div><span className="text-slate-200">Target:</span> <span className="text-green-400">${setup.target1 != null ? Number(setup.target1).toFixed(2) : '--'}</span></div>
      </div>
    </div>
  );
}

// ============================================================
// FORECAST LIST CARD - For Multi-Asset View
// ============================================================

function ForecastListCard({ forecast, isSelected, onSelect }: { forecast: PriceForecast; isSelected: boolean; onSelect: () => void }) {
  const isBullish = forecast.direction === 'BULLISH';
  const isBearish = forecast.direction === 'BEARISH';
  
  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-amber-500 bg-amber-900/30' 
          : isBullish 
            ? 'border-green-500/30 bg-gradient-to-r from-green-900/20 to-transparent hover:border-green-500/50' 
            : isBearish
              ? 'border-red-500/30 bg-gradient-to-r from-red-900/20 to-transparent hover:border-red-500/50'
              : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isBullish ? <TrendingUp className="h-5 w-5 text-green-400" /> : isBearish ? <TrendingDown className="h-5 w-5 text-red-400" /> : <Activity className="h-5 w-5 text-slate-200" />}
          <span className="font-bold text-white text-lg">{forecast.symbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${isBullish ? 'bg-green-600' : isBearish ? 'bg-red-600' : 'bg-slate-600'} text-white`}>
            {forecast.direction}
          </Badge>
          <Badge variant="outline" className="text-amber-400 border-amber-500">
            {Number(forecast.confidence).toFixed(0)}%
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-slate-200">Price</span>
          <div className="text-white font-medium">${forecast.currentPrice != null ? (forecast.currentPrice > 1000 ? Number(forecast.currentPrice).toLocaleString() : Number(forecast.currentPrice).toFixed(2)) : '--'}</div>
        </div>
        <div>
          <span className="text-slate-200">Target 1</span>
          <div className="text-green-400 font-medium">${forecast.targets?.[0]?.price != null ? (Number(forecast.targets[0].price) > 1000 ? Number(forecast.targets[0].price).toLocaleString() : Number(forecast.targets[0].price).toFixed(2)) : '--'}</div>
        </div>
        <div>
          <span className="text-slate-200">Stop</span>
          <div className="text-red-400 font-medium">${forecast.stopLoss != null ? (Number(forecast.stopLoss) > 1000 ? Number(forecast.stopLoss).toLocaleString() : Number(forecast.stopLoss).toFixed(2)) : '--'}</div>
        </div>
        <div>
          <span className="text-slate-200">Timeframe</span>
          <div className="text-cyan-400 font-medium">{forecast.timeframe || '--'}</div>
        </div>
      </div>
      
      {/* Preview of reasoning */}
      <div className="mt-3 text-xs text-slate-200 line-clamp-2">
        {forecast.reasoning?.substring(0, 150)}...
      </div>
    </div>
  );
}

// ============================================================
// FORECAST DETAILS PANEL - Full AI Analysis
// ============================================================

function ForecastDetailsPanel({ data }: { data: PriceForecast }) {
  const isBullish = data.direction === 'BULLISH';
  const isBearish = data.direction === 'BEARISH';
  
  return (
    <Card className={`${isBullish ? 'bg-gradient-to-br from-green-900/40 to-slate-900' : isBearish ? 'bg-gradient-to-br from-red-900/40 to-slate-900' : 'bg-slate-900/80'} border-slate-700`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              {isBullish ? <TrendingUp className="h-6 w-6 text-green-400" /> : isBearish ? <TrendingDown className="h-6 w-6 text-red-400" /> : <Activity className="h-6 w-6 text-slate-200" />}
              {data.symbol}
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              ${data.currentPrice != null ? (Number(data.currentPrice) > 1000 ? Number(data.currentPrice).toLocaleString() : Number(data.currentPrice).toFixed(2)) : '--'}
            </CardDescription>
          </div>
          <Badge className={`${isBullish ? 'bg-green-600' : isBearish ? 'bg-red-600' : 'bg-slate-600'} text-white text-lg px-4 py-1`}>
            {data.direction}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence & Timeframe */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-200">Confidence</div>
            <div className="text-xl font-bold text-amber-400">{data.confidence != null ? Number(data.confidence).toFixed(0) : '--'}%</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-200">Timeframe</div>
            <div className="text-xl font-bold text-cyan-400">{data.timeframe || '--'}</div>
          </div>
        </div>
        
        {/* Price Targets */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">Price Targets</h4>
          {data.targets?.map((target, i) => (
            <div key={i} className="flex justify-between p-2 bg-green-900/20 rounded border border-green-500/20">
              <span className="text-green-300">Target {i + 1}</span>
              <div className="text-right">
                <span className="text-white font-bold">${Number(target.price) > 1000 ? Number(target.price).toLocaleString() : Number(target.price).toFixed(2)}</span>
                <span className="text-slate-200 text-sm ml-2">({Number(target.probability).toFixed(0)}%)</span>
              </div>
            </div>
          ))}
          {data.stopLoss && (
            <div className="flex justify-between p-2 bg-red-900/20 rounded border border-red-500/20">
              <span className="text-red-300">Stop Loss</span>
              <span className="text-white font-bold">${Number(data.stopLoss) > 1000 ? Number(data.stopLoss).toLocaleString() : Number(data.stopLoss).toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {/* AI Reasoning - The Key Breakdown */}
        {data.reasoning && (
          <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-500/30">
            <h4 className="text-violet-300 font-medium mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" /> Why This Asset Was Selected
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">{data.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
