import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PredictiveIndicator, PredictiveChip, type PredictiveData } from '@/components/shared/predictive-indicator';
import { 
  Activity, AlertTriangle, BarChart3, CheckCircle2, Clock, 
  Lock, Radio, RefreshCcw, Search, Shield, Target, 
  TrendingDown, TrendingUp, Volume2, Zap, ChevronDown, ChevronUp,
  AlertCircle, Eye, XCircle
} from 'lucide-react';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

interface GateResult {
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  details: string;
}

interface PressureMeterData {
  pressure: 'buy' | 'sell' | 'neutral' | 'absorption';
  score: number;
  label: string;
  color: 'green' | 'red' | 'yellow';
  cvd: number;
  delta: number;
  absorptionActive: boolean;
  momentumSurge: boolean;
}

interface SevenGateAnalysis {
  symbol: string;
  timestamp: number;
  totalScore: number;
  maxScore: number;
  gates: GateResult[];
  signalType: 'A+_ENTRY' | 'ENTRY' | 'WAIT' | 'GATE_LOCKED';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  reasoning: string[];
  gateLockReason?: string;
  auditData?: {
    pressureMeter?: PressureMeterData;
  };
  predictive?: PredictiveData;
}

interface ScanResponse {
  success: boolean;
  data: {
    timestamp: number;
    total: number;
    summary: { aplus: number; entry: number; wait: number; locked: number };
    signals: SevenGateAnalysis[];
  };
}

interface SystemHealthResponse {
  success: boolean;
  data: {
    timestamp: number;
    dataFeed: { status: string; latency: string; testSymbol: string; latestPrice: number; dataAge: number };
    engine: { status: string; version: string; features: string[] };
  };
}

function SignalCard({ signal, onAnalyze }: { signal: SevenGateAnalysis; onAnalyze: (symbol: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const confidencePercent = (signal.totalScore / signal.maxScore) * 100;
  const passedGates = signal.gates.filter(g => g.passed).length;

  const getSignalColor = () => {
    switch (signal.signalType) {
      case 'A+_ENTRY': return 'bg-gradient-to-r from-green-600 to-emerald-500';
      case 'ENTRY': return 'bg-gradient-to-r from-blue-600 to-cyan-500';
      case 'WAIT': return 'bg-gradient-to-r from-yellow-600 to-amber-500';
      case 'GATE_LOCKED': return 'bg-gradient-to-r from-red-600 to-rose-500';
    }
  };

  const getDirectionIcon = () => {
    if (signal.direction === 'LONG') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (signal.direction === 'SHORT') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-slate-200" />;
  };

  return (
    <Card className="bg-slate-800/80 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg text-white font-bold text-sm ${getSignalColor()}`}>
              {signal.symbol}
            </div>
            <Badge variant={signal.signalType === 'A+_ENTRY' ? 'default' : 'outline'} 
                   className={signal.signalType === 'A+_ENTRY' ? 'bg-green-600 text-white' : ''}>
              {signal.signalType.replace('_', ' ')}
            </Badge>
            {getDirectionIcon()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{confidencePercent.toFixed(0)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-slate-200">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-200 mb-1">
            <span>{passedGates}/{signal.gates.length} Gates Passed</span>
            <span>{signal.totalScore}/{signal.maxScore} Score</span>
          </div>
          <Progress value={confidencePercent} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-slate-200 text-xs">Entry</div>
            <div className="text-blue-400 font-mono">${signal.entryPrice.toFixed(2)}</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-slate-200 text-xs">Target</div>
            <div className="text-green-400 font-mono">${signal.target1.toFixed(2)}</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-slate-200 text-xs">Stop</div>
            <div className="text-red-400 font-mono">${signal.stopLoss.toFixed(2)}</div>
          </div>
        </div>

        {signal.gateLockReason && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Lock className="h-4 w-4" />
              {signal.gateLockReason}
            </div>
          </div>
        )}

        {signal.predictive && (
          <div className="mb-3">
            <PredictiveChip data={signal.predictive} />
          </div>
        )}

        {expanded && (
          <div className="space-y-3 pt-3 border-t border-slate-700">
            {signal.predictive && (
              <PredictiveIndicator data={signal.predictive} />
            )}
            
            <div className="text-sm font-semibold text-slate-300">8-Gate Analysis</div>
            <div className="grid gap-2">
              {signal.gates.map((gate, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    {gate.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-slate-300">{gate.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${gate.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {gate.score}/{gate.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm font-semibold text-slate-300 mt-3">Trade Reasoning</div>
            <div className="space-y-1">
              {signal.reasoning.map((reason, i) => (
                <div key={i} className="text-xs text-slate-200 flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  {reason}
                </div>
              ))}
            </div>

            <Button 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
              onClick={() => onAnalyze(signal.symbol)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Full Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SystemHealthPanel({ health }: { health: SystemHealthResponse['data'] | undefined }) {
  if (!health) return null;

  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'operational') return 'text-green-400';
    if (status === 'degraded') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-200">Data Feed</div>
            <div className={`text-sm font-semibold ${getStatusColor(health.dataFeed.status)}`}>
              {health.dataFeed.status.toUpperCase()}
            </div>
            <div className="text-xs text-slate-300">
              Latency: {health.dataFeed.latency} | Age: {health.dataFeed.dataAge}s
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-200">Engine</div>
            <div className={`text-sm font-semibold ${getStatusColor(health.engine.status)}`}>
              {health.engine.version}
            </div>
            <div className="text-xs text-slate-300">{health.engine.status}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HFCApexScanner() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');
  const queryClient = useQueryClient();

  const { data: scanData, isLoading: isScanning, refetch: refetchScan } = useQuery<ScanResponse>({
    queryKey: ['/api/hfc-apex/scan'],
    refetchInterval: 60000
  });

  const { data: healthData } = useQuery<SystemHealthResponse>({
    queryKey: ['/api/hfc-apex/system-health'],
    refetchInterval: 30000
  });

  const analyzeSymbol = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(`/api/hfc-apex/analyze/${symbol}`);
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hfc-apex'] });
    }
  });

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      analyzeSymbol.mutate(searchSymbol.toUpperCase());
    }
  };

  const signals = scanData?.data?.signals || [];
  const summary = scanData?.data?.summary || { aplus: 0, entry: 0, wait: 0, locked: 0 };

  const aplusSignals = signals.filter(s => s.signalType === 'A+_ENTRY');
  const entrySignals = signals.filter(s => s.signalType === 'ENTRY');
  const waitSignals = signals.filter(s => s.signalType === 'WAIT');
  const lockedSignals = signals.filter(s => s.signalType === 'GATE_LOCKED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                8-Gate Options Scanner
              </h1>
              <p className="text-sm text-slate-200">
                8-Gate Options System • OBI Pressure Analysis • Institutional Grade
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <Input
                placeholder="Symbol..."
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-28 bg-transparent border-0 p-0 h-auto text-white placeholder:text-slate-300"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSearch}
                disabled={analyzeSymbol.isPending}
                className="h-7 px-2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={() => refetchScan()} 
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              Scan Market
            </Button>
          </div>
        </div>

        <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Not Financial Advice</span>
          </div>
          <p className="text-sm text-amber-300/80 mt-1">
            This scanner is for educational purposes only. Always conduct your own research and consult with a financial advisor before making trading decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border-green-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{summary.aplus}</div>
              <div className="text-sm text-green-300/80">A+ Signals</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-blue-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{summary.entry}</div>
              <div className="text-sm text-blue-300/80">Entry Signals</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-900/50 to-amber-900/30 border-yellow-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{summary.wait}</div>
              <div className="text-sm text-yellow-300/80">Wait Status</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-900/50 to-rose-900/30 border-red-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{summary.locked}</div>
              <div className="text-sm text-red-300/80">Gate Locked</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="scanner" className="data-[state=active]:bg-blue-600">
                  <Radio className="h-4 w-4 mr-2" />
                  Market Scanner
                </TabsTrigger>
                <TabsTrigger value="analyze" className="data-[state=active]:bg-purple-600">
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Stock
                </TabsTrigger>
                <TabsTrigger value="aplus" className="data-[state=active]:bg-green-600">
                  <Target className="h-4 w-4 mr-2" />
                  A+ Setups ({summary.aplus})
                </TabsTrigger>
                <TabsTrigger value="locked" className="data-[state=active]:bg-red-600">
                  <Lock className="h-4 w-4 mr-2" />
                  Gate Locked ({summary.locked})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scanner" className="mt-4">
                <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50 mb-4">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-400" />
                          Full Market Scan
                        </h3>
                        <p className="text-sm text-slate-200">
                          Scans 100+ stocks across tech, financials, healthcare, energy, consumer, and ETFs
                        </p>
                      </div>
                      <Button 
                        onClick={() => refetchScan()} 
                        disabled={isScanning}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <RefreshCcw className={`h-5 w-5 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Scanning...' : 'Scan Entire Market'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {isScanning ? (
                  <div className="text-center py-12">
                    <RefreshCcw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-slate-200">Scanning market for 8-gate setups...</p>
                    <p className="text-xs text-slate-300 mt-2">Analyzing 50 symbols with real-time data...</p>
                  </div>
                ) : signals.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-200">No signals found. Click "Scan Entire Market" to analyze.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {signals.slice(0, 12).map((signal) => (
                      <SignalCard 
                        key={signal.symbol} 
                        signal={signal} 
                        onAnalyze={(s) => analyzeSymbol.mutate(s)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analyze" className="mt-4">
                <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700/50">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white flex items-center justify-center gap-2 mb-2">
                        <Search className="h-6 w-6 text-purple-400" />
                        Analyze Individual Stock
                      </h3>
                      <p className="text-sm text-slate-200">
                        Enter any stock symbol to run a full 8-Gate analysis with OBI pressure metrics
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-3 border border-slate-600 w-full sm:w-auto">
                        <Input
                          placeholder="Enter symbol (e.g., AAPL, TSLA, NVDA)"
                          value={searchSymbol}
                          onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          className="w-full sm:w-64 bg-transparent border-0 p-0 h-auto text-white text-lg placeholder:text-slate-300"
                        />
                      </div>
                      <Button 
                        size="lg"
                        onClick={handleSearch}
                        disabled={analyzeSymbol.isPending || !searchSymbol.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                      >
                        {analyzeSymbol.isPending ? (
                          <>
                            <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search className="h-5 w-5 mr-2" />
                            Analyze Stock
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      {['AAPL', 'TSLA', 'NVDA', 'AMD', 'SPY', 'QQQ', 'META', 'GOOGL'].map((sym) => (
                        <Button
                          key={sym}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchSymbol(sym);
                            analyzeSymbol.mutate(sym);
                          }}
                          disabled={analyzeSymbol.isPending}
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-300"
                        >
                          {sym}
                        </Button>
                      ))}
                    </div>

                    {searchSymbol && (
                      <div className="mt-6">
                        <SignalFusionAnalysis symbol={searchSymbol} assetType="stock" compact />
                      </div>
                    )}

                    {analyzeSymbol.data && (
                      <div className="mt-6">
                        <SignalCard 
                          signal={analyzeSymbol.data.data.analysis} 
                          onAnalyze={(s) => analyzeSymbol.mutate(s)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="aplus" className="mt-4">
                {aplusSignals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-200">No A+ setups currently detected.</p>
                    <p className="text-xs text-slate-300 mt-2">A+ requires all 8 gates passing + liquidity sweep trigger</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aplusSignals.map((signal) => (
                      <SignalCard 
                        key={signal.symbol} 
                        signal={signal} 
                        onAnalyze={(s) => analyzeSymbol.mutate(s)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="locked" className="mt-4">
                {lockedSignals.length === 0 ? (
                  <div className="text-center py-12">
                    <Lock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-200">No gate-locked signals.</p>
                    <p className="text-xs text-slate-300 mt-2">Signals are locked by AI sentiment filter or circuit breakers</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedSignals.map((signal) => (
                      <SignalCard 
                        key={signal.symbol} 
                        signal={signal} 
                        onAnalyze={(s) => analyzeSymbol.mutate(s)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <SystemHealthPanel health={healthData?.data} />

            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  8-Gate Options Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-slate-200">Gate 1: Liquidity Sweep Detection</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-200">Gate 2: EMA 8/18 Cross Confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-slate-200">Gate 3: ADX Trend Strength &gt; 25</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-slate-200">Gate 4: RVOL Volume Surge &gt; 2.5x</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-slate-200">Gate 5: SMC + Fair Value Gap</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-slate-200">Gate 6: Outside 15m ORB Range</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-200">Gate 7: Fibonacci 0.382 Zone</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-slate-200">Gate 8: OBI Pressure & Delta Flow</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  Fail-Safes Active
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  Circuit Breaker (10% drawdown pause)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  AI Sentiment Gate-Lock
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  Macro 200 SMA Filter
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  Audit Trail Logging
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
