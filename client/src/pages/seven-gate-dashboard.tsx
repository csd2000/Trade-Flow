import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Shield, Lock, Unlock, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Target, Activity, Newspaper, 
  BarChart3, RefreshCw, Search, Zap, AlertCircle,
  ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Gate0Status {
  checked: boolean;
  checkTime: number;
  hasHighImpactNews: boolean;
  newsEvents: Array<{
    title: string;
    pubDate: string;
    source: string;
    isHighImpact: boolean;
  }>;
  systemStatus: 'ACTIVE' | 'PAUSED' | 'RELEASED';
  pauseReason?: string;
}

interface OpeningRangeBox {
  high: number;
  low: number;
  midpoint: number;
  range: number;
  isComplete: boolean;
}

interface SECRiskFlags {
  symbol: string;
  status: 'ALERT' | 'CLEAR' | 'UNAVAILABLE';
  riskScore: number;
  keywordsFound: string[];
  filingType: string | null;
  filingDate: string | null;
}

interface SevenGateAnalysis {
  symbol: string;
  timestamp: number;
  gates: {
    gate0: Gate0Status;
    gate1_2: {
      openingRange: OpeningRangeBox;
      liquidityPools: Array<{ level: number; type: string; swept: boolean }>;
      sweeps: Array<{ direction: string; level: number }>;
    };
    gate3: {
      passed: boolean;
      breakoutDirection: 'LONG' | 'SHORT' | null;
      antiTrapTriggered: boolean;
      powerBarDetected: boolean;
    };
    gate4_5: {
      passed: boolean;
      rejectionType: string;
      confidenceScore: number;
      riskAllocation: string;
    };
    gate6_7: {
      entryPrice: number;
      stopLoss: number;
      target05SD: number;
      target10SD: number;
    } | null;
  };
  secRisk?: SECRiskFlags;
  overallStatus: string;
  signalType: string;
  direction: string;
  confidenceScore: number;
  reasoning: string[];
}

const GateStatusIcon = ({ passed, locked }: { passed?: boolean; locked?: boolean }) => {
  if (locked) return <Lock className="h-5 w-5 text-red-400" />;
  if (passed === true) return <CheckCircle className="h-5 w-5 text-green-400" />;
  if (passed === false) return <Clock className="h-5 w-5 text-amber-400" />;
  return <AlertCircle className="h-5 w-5 text-slate-200" />;
};

const GateCard = ({ 
  gateNumber, 
  title, 
  status, 
  details, 
  children 
}: { 
  gateNumber: string; 
  title: string; 
  status: 'passed' | 'waiting' | 'locked' | 'inactive'; 
  details: string;
  children?: React.ReactNode;
}) => {
  const statusConfig = {
    passed: { bg: 'bg-green-900/30 border-green-500/50', badge: 'bg-green-600', icon: CheckCircle },
    waiting: { bg: 'bg-amber-900/30 border-amber-500/50', badge: 'bg-amber-600', icon: Clock },
    locked: { bg: 'bg-red-900/30 border-red-500/50', badge: 'bg-red-600', icon: Lock },
    inactive: { bg: 'bg-slate-800/50 border-slate-600', badge: 'bg-slate-600', icon: AlertCircle }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`${config.bg} border-2 transition-all hover:scale-[1.02]`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`${config.badge} text-white px-2 py-1`}>{gateNumber}</Badge>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-sm text-slate-300 mb-3">{details}</p>
        {children}
      </CardContent>
    </Card>
  );
};

export default function SevenGateDashboard() {
  const [symbol, setSymbol] = useState('SPY');
  const [activeTab, setActiveTab] = useState('scanner');
  const queryClient = useQueryClient();

  const { data: gate0Data, isLoading: isLoadingGate0, refetch: refetchGate0 } = useQuery<{ success: boolean; data: Gate0Status }>({
    queryKey: ['/api/seven-gate/gate0/status'],
    refetchInterval: 60000
  });

  const { data: analysisData, isLoading: isLoadingAnalysis, refetch: refetchAnalysis } = useQuery<{ success: boolean; data: SevenGateAnalysis }>({
    queryKey: ['/api/seven-gate/analyze', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/seven-gate/analyze/${symbol}`);
      return res.json();
    },
    enabled: symbol.length > 0,
    refetchInterval: 30000
  });

  const releaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/seven-gate/gate0/release', 'POST');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seven-gate/gate0/status'] });
    }
  });

  const gate0 = gate0Data?.data;
  const analysis = analysisData?.data;

  const getGate0Status = (): 'passed' | 'waiting' | 'locked' => {
    if (!gate0) return 'waiting';
    if (gate0.systemStatus === 'PAUSED') return 'locked';
    return 'passed';
  };

  const formatPrice = (price: number) => price?.toFixed(2) || '0.00';
  const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">7-Gate ORB System</h1>
              <p className="text-sm text-slate-200">Opening Range Breakout • NewsData.io Integration • v2026.01.13</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-600">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Symbol"
                className="w-24 bg-transparent border-0 text-white focus-visible:ring-0"
              />
              <Button
                onClick={() => refetchAnalysis()}
                disabled={isLoadingAnalysis}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => { refetchGate0(); refetchAnalysis(); }}
              disabled={isLoadingGate0 || isLoadingAnalysis}
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingGate0 || isLoadingAnalysis ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card className={`border-2 ${
          gate0?.systemStatus === 'PAUSED' 
            ? 'bg-red-900/20 border-red-500/50' 
            : gate0?.systemStatus === 'RELEASED'
            ? 'bg-blue-900/20 border-blue-500/50'
            : 'bg-green-900/20 border-green-500/50'
        }`}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                {gate0?.systemStatus === 'PAUSED' ? (
                  <Lock className="h-8 w-8 text-red-400" />
                ) : (
                  <Unlock className="h-8 w-8 text-green-400" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Gate 0: System Safety
                  </h2>
                  <p className="text-sm text-slate-300">
                    {gate0?.systemStatus === 'PAUSED' 
                      ? gate0.pauseReason 
                      : gate0?.systemStatus === 'RELEASED'
                      ? 'Manually released - Trading active'
                      : 'No high-impact USD news detected'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={`px-3 py-1 ${
                  gate0?.systemStatus === 'PAUSED' ? 'bg-red-600' : 
                  gate0?.systemStatus === 'RELEASED' ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {gate0?.systemStatus || 'CHECKING'}
                </Badge>

                {gate0?.systemStatus === 'PAUSED' && (
                  <Button
                    onClick={() => releaseMutation.mutate()}
                    disabled={releaseMutation.isPending}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    /release
                  </Button>
                )}
              </div>
            </div>

            {gate0?.newsEvents && gate0.newsEvents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  Recent News ({gate0.newsEvents.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {gate0.newsEvents.slice(0, 5).map((news, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-800/50">
                      {news.isHighImpact && <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />}
                      <div>
                        <p className="text-sm text-white">{news.title}</p>
                        <p className="text-xs text-slate-200">{news.source} • {news.pubDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-600">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-indigo-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Gate Scanner
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-indigo-600">
              <Activity className="h-4 w-4 mr-2" />
              Full Analysis
            </TabsTrigger>
            <TabsTrigger value="signals" className="data-[state=active]:bg-indigo-600">
              <Zap className="h-4 w-4 mr-2" />
              Active Signals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GateCard
                gateNumber="G0"
                title="News Filter"
                status={getGate0Status()}
                details={gate0?.systemStatus === 'PAUSED' ? 'High-impact news detected' : 'Clear for trading'}
              >
                <div className="text-xs text-slate-200">
                  Last check: {gate0?.checkTime ? formatTime(gate0.checkTime) : 'Never'}
                </div>
              </GateCard>

              <GateCard
                gateNumber="G1-2"
                title="Opening Range"
                status={analysis?.gates.gate1_2.openingRange.isComplete ? 'passed' : 'waiting'}
                details={`15m Anchor: ${formatPrice(analysis?.gates.gate1_2.openingRange.high || 0)} - ${formatPrice(analysis?.gates.gate1_2.openingRange.low || 0)}`}
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-800 rounded p-2">
                    <p className="text-xs text-slate-200">BSL (High)</p>
                    <p className="text-sm font-mono text-green-400">${formatPrice(analysis?.gates.gate1_2.openingRange.high || 0)}</p>
                  </div>
                  <div className="bg-slate-800 rounded p-2">
                    <p className="text-xs text-slate-200">SSL (Low)</p>
                    <p className="text-sm font-mono text-red-400">${formatPrice(analysis?.gates.gate1_2.openingRange.low || 0)}</p>
                  </div>
                </div>
              </GateCard>

              <GateCard
                gateNumber="G3"
                title="5-Min Validation"
                status={analysis?.gates.gate3.passed ? 'passed' : analysis?.gates.gate3.antiTrapTriggered ? 'locked' : 'waiting'}
                details={analysis?.gates.gate3.antiTrapTriggered 
                  ? 'REJECTED: Sweep Trap detected' 
                  : analysis?.gates.gate3.breakoutDirection 
                    ? `${analysis.gates.gate3.breakoutDirection} breakout confirmed`
                    : 'Waiting for breakout'
                }
              >
                {analysis?.gates.gate3.powerBarDetected && (
                  <Badge className="bg-red-600 mt-2">Power Bar Detected</Badge>
                )}
              </GateCard>

              <GateCard
                gateNumber="G4-5"
                title="1-Min Retest"
                status={analysis?.gates.gate4_5.passed ? 'passed' : 'waiting'}
                details={analysis?.gates.gate4_5.passed 
                  ? `${analysis.gates.gate4_5.rejectionType} rejection at entry`
                  : 'Waiting for 1-min retest'
                }
              >
                {analysis?.gates.gate4_5.passed && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-200">Confidence</span>
                      <span className={`text-sm font-bold ${
                        analysis.gates.gate4_5.confidenceScore >= 85 ? 'text-green-400' : 'text-amber-400'
                      }`}>
                        {analysis.gates.gate4_5.confidenceScore}%
                      </span>
                    </div>
                    <Badge className={`mt-1 ${
                      analysis.gates.gate4_5.riskAllocation === 'HIGH' ? 'bg-green-600' : 'bg-slate-600'
                    }`}>
                      {analysis.gates.gate4_5.riskAllocation} Risk
                    </Badge>
                  </div>
                )}
              </GateCard>

              <GateCard
                gateNumber="G6-7"
                title="Management"
                status={analysis?.gates.gate6_7 ? 'passed' : 'inactive'}
                details={analysis?.gates.gate6_7 
                  ? `Entry: $${formatPrice(analysis.gates.gate6_7.entryPrice)}`
                  : 'No active trade'
                }
              >
                {analysis?.gates.gate6_7 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-800 rounded p-2">
                      <p className="text-xs text-slate-200">Stop Loss</p>
                      <p className="text-sm font-mono text-red-400">${formatPrice(analysis.gates.gate6_7.stopLoss)}</p>
                    </div>
                    <div className="bg-slate-800 rounded p-2">
                      <p className="text-xs text-slate-200">Target (1.0 SD)</p>
                      <p className="text-sm font-mono text-green-400">${formatPrice(analysis.gates.gate6_7.target10SD)}</p>
                    </div>
                  </div>
                )}
              </GateCard>

              <GateCard
                gateNumber="SIG"
                title="Signal Status"
                status={analysis?.signalType === 'EXECUTE' ? 'passed' : analysis?.signalType === 'PAUSED' ? 'locked' : 'waiting'}
                details={analysis?.signalType || 'Analyzing...'}
              >
                <div className="flex items-center gap-2 mt-2">
                  {analysis?.direction === 'LONG' ? (
                    <Badge className="bg-green-600 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      LONG
                    </Badge>
                  ) : analysis?.direction === 'SHORT' ? (
                    <Badge className="bg-red-600 flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3" />
                      SHORT
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-600">NEUTRAL</Badge>
                  )}
                  <span className="text-xs text-slate-200">{symbol}</span>
                </div>
              </GateCard>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  Full Analysis: {symbol}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAnalysis ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs text-slate-200">Overall Status</p>
                        <p className="text-lg font-bold text-white">{analysis.overallStatus}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs text-slate-200">Signal Type</p>
                        <p className={`text-lg font-bold ${
                          analysis.signalType === 'EXECUTE' ? 'text-green-400' : 
                          analysis.signalType === 'PAUSED' ? 'text-red-400' : 'text-amber-400'
                        }`}>{analysis.signalType}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs text-slate-200">Direction</p>
                        <p className={`text-lg font-bold ${
                          analysis.direction === 'LONG' ? 'text-green-400' : 
                          analysis.direction === 'SHORT' ? 'text-red-400' : 'text-slate-200'
                        }`}>{analysis.direction}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs text-slate-200">Confidence</p>
                        <p className="text-lg font-bold text-indigo-400">{analysis.confidenceScore}%</p>
                      </div>
                      {analysis.secRisk && (
                        <div className="bg-slate-900 rounded-lg p-4">
                          <p className="text-xs text-slate-200">SEC Risk</p>
                          <p className={`text-lg font-bold ${
                            analysis.secRisk.status === 'ALERT' ? 'text-red-400' : 
                            analysis.secRisk.status === 'CLEAR' ? 'text-green-400' : 'text-slate-200'
                          }`}>
                            {analysis.secRisk.status === 'ALERT' ? '⚠️ ALERT' : 
                             analysis.secRisk.status === 'CLEAR' ? '✅ CLEAR' : '—'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">Reasoning</h4>
                      <div className="space-y-2">
                        {analysis.reasoning.map((reason, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-indigo-400 mt-0.5" />
                            <p className="text-sm text-slate-300">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysis.gates.gate6_7 && (
                      <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-indigo-300 mb-3">Trade Management</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-200">Entry</p>
                            <p className="text-lg font-mono text-white">${formatPrice(analysis.gates.gate6_7.entryPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-200">Stop Loss</p>
                            <p className="text-lg font-mono text-red-400">${formatPrice(analysis.gates.gate6_7.stopLoss)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-200">BE Target (0.5 SD)</p>
                            <p className="text-lg font-mono text-amber-400">${formatPrice(analysis.gates.gate6_7.target05SD)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-200">TP Target (1.0 SD)</p>
                            <p className="text-lg font-mono text-green-400">${formatPrice(analysis.gates.gate6_7.target10SD)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-200">
                    Enter a symbol and click search to analyze
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  Active Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-200">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Run analysis on symbols to generate active signals</p>
                  <p className="text-sm mt-2">Signals with confidence {'>'}85% will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
