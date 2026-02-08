import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertTriangle,
  RefreshCw,
  Layers,
  Clock,
  BarChart3,
  ZoomIn,
  ZoomOut,
  Move,
  Volume2,
  VolumeX,
  BookOpen,
  Info,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';
import { useTTS } from '@/hooks/use-tts';
import StrongTrendPanel from '@/components/StrongTrendPanel';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SupplyDemandZone {
  id: string;
  type: 'supply' | 'demand';
  timeframe: string;
  topPrice: number;
  bottomPrice: number;
  startTime: number;
  strength: number;
  retested: boolean;
  retestCount: number;
  broken: boolean;
  brokenTime: number | null;
  momentumCandles: number;
  isHistoric: boolean;
  combinedFrom?: string[];
}

interface ZoneSignal {
  type: 'retest' | 'breakout' | 'approaching';
  zoneType: 'supply' | 'demand';
  zone: SupplyDemandZone;
  distance: number;
  percentDistance: number;
}

interface ScanResult {
  symbol: string;
  assetClass: string;
  timeframe: string;
  zones: SupplyDemandZone[];
  currentPrice: number;
  nearestSupply: SupplyDemandZone | null;
  nearestDemand: SupplyDemandZone | null;
  inZone: boolean;
  zoneType: 'supply' | 'demand' | null;
  timestamp: string;
}

interface MultiTimeframeScan {
  symbol: string;
  assetClass: string;
  timeframes: { [tf: string]: SupplyDemandZone[] };
  combinedZones: SupplyDemandZone[];
  currentPrice: number;
  signals: ZoneSignal[];
  timestamp: string;
}

interface SevenGateData {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  gates: {
    gate: number;
    name: string;
    passed: boolean;
    details: any;
  }[];
  gatesPassed: number;
  allGatesPassed: boolean;
  signalActive: boolean;
  direction: 'bullish' | 'bearish' | null;
  optionContract: {
    type: 'CALL' | 'PUT';
    strike: number;
    delta: number;
    dte: number;
    expiry: string;
    rationale?: string;
  } | null;
  alertMessage: string | null;
  entryDetails?: {
    entryPrice: number | null;
    fibLevel: number | null;
    invalidationLevel: number | null;
    invalidated: boolean;
  };
}

function SevenGatePanel({ symbol, timeframe, assetClass }: { symbol: string; timeframe: string; assetClass: string }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { data: gateData, isLoading, refetch } = useQuery<SevenGateData>({
    queryKey: ['/api/supply-demand/7-gate', symbol, timeframe, assetClass],
    queryFn: async () => {
      const res = await fetch(`/api/supply-demand/7-gate/${symbol}?timeframe=${timeframe}&assetClass=${assetClass}`);
      if (!res.ok) throw new Error('Failed to fetch 7-gate data');
      return res.json();
    },
    enabled: !!symbol
  });

  // 2026 Master Prompt Gate Icons & Descriptions
  const gateIcons = ['🎯', '📍', '⚡', '🔄', '📐', '📊', '🚦'];
  const gateDescriptions = [
    'Gate 1: Liquidity Sweep (Primary Trigger)',
    'Gate 2: S/D Zone Tap (Institutional Confluence)',
    'Gate 3: Velocity Displacement (150% body + FVG)',
    'Gate 4: Market Structure Shift (MSS)',
    'Gate 5: Fair Value Entry (0.5 Fib)',
    'Gate 6: R/R ≥2:1 (2 ticks stop)',
    'Gate 7: Kill-Switch (EST Windows)'
  ];
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 border-indigo-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            7-Gate Master System (2026)
            {gateData?.allGatesPassed && (
              <Badge className="bg-green-600 ml-2 animate-pulse">ALL GATES PASSED</Badge>
            )}
            {gateData?.signalActive && !gateData?.allGatesPassed && (
              <Badge className="bg-amber-600 ml-2">{gateData.gatesPassed}/7 GATES</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-200">
          Momentum-Scalping Engine: Sweep → Zone → Displacement → MSS → 0.5 Fib Entry → 2:1 R/R → 0.60 Delta (1-3 DTE)
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2">
          {isLoading && (
            <div className="text-center py-6">
              <RefreshCw className="h-8 w-8 text-indigo-400 mx-auto animate-spin mb-2" />
              <p className="text-slate-200 text-sm">Validating 7-Gate system...</p>
            </div>
          )}
          
          {gateData && !isLoading && (
            <div className="space-y-4">
              {/* Gate Status Grid */}
              <div className="grid grid-cols-7 gap-1">
                {gateData.gates.map((gate, idx) => (
                  <div
                    key={gate.gate}
                    className={`p-2 rounded-lg text-center transition-all ${
                      gate.passed 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                    title={`Gate ${gate.gate}: ${gate.name}`}
                  >
                    <div className="text-lg">{gateIcons[idx]}</div>
                    <div className={`text-[10px] font-medium ${gate.passed ? 'text-green-400' : 'text-slate-300'}`}>
                      G{gate.gate}
                    </div>
                    <div className={`text-[8px] ${gate.passed ? 'text-green-300' : 'text-slate-600'}`}>
                      {gate.passed ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Gate Details - 2026 Master Prompt */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {gateData.gates.slice(0, 4).map((gate, idx) => (
                  <div key={gate.gate} className={`p-2 rounded-lg ${gate.passed ? 'bg-green-900/20' : 'bg-slate-800/30'}`}>
                    <div className="text-slate-200 mb-1 text-[10px]">{gateDescriptions[idx]?.split(':')[1] || gate.name}</div>
                    {gate.gate === 1 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        {gate.details.detected ? `${gate.details.levelName}: $${gate.details.level?.toFixed(2)}` : 'No sweep detected'}
                      </div>
                    )}
                    {gate.gate === 2 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        {gate.passed ? `${gate.details.zone?.type?.toUpperCase()} zone aligned` : 'No zone confluence'}
                      </div>
                    )}
                    {gate.gate === 3 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        {gate.passed ? (
                          <span>{gate.details.velocityMultiple?.toFixed(1)}x velocity {gate.details.hasFVG && '+ FVG'}</span>
                        ) : 'No displacement'}
                      </div>
                    )}
                    {gate.gate === 4 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        {gate.passed ? `Body close @ $${gate.details.pivotLevel?.toFixed(2)}` : 'Awaiting MSS'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                {gateData.gates.slice(4).map((gate, idx) => (
                  <div key={gate.gate} className={`p-2 rounded-lg ${gate.passed ? 'bg-green-900/20' : 'bg-slate-800/30'}`}>
                    <div className="text-slate-200 mb-1 text-[10px]">{gateDescriptions[idx + 4]?.split(':')[1] || gate.name}</div>
                    {gate.gate === 5 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        {gate.details.entryPrice ? `$${gate.details.entryPrice} (0.5 Fib)` : 'Awaiting entry'}
                        {gate.details.invalidated && <span className="text-red-400 ml-1">INVALID (0.786)</span>}
                      </div>
                    )}
                    {gate.gate === 6 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        R:R {gate.details.ratio?.toFixed(1)}:1 {gate.passed && '≥2:1 ✓'}
                      </div>
                    )}
                    {gate.gate === 7 && gate.details && (
                      <div className={gate.passed ? 'text-green-400' : 'text-slate-300'}>
                        {gate.details.window} ({gate.details.estTime})
                        {gate.details.newsBlocked && <span className="text-red-400 ml-1">NEWS</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Option Contract Recommendation - 2026 Best Scenario */}
              {gateData.optionContract && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      ITM CONTRACT (0.60-0.65Δ)
                    </span>
                    <Badge className={gateData.optionContract.type === 'CALL' ? 'bg-green-600' : 'bg-red-600'}>
                      {gateData.optionContract.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-slate-200">Strike (ITM)</div>
                      <div className="text-white font-mono">${gateData.optionContract.strike}</div>
                    </div>
                    <div>
                      <div className="text-slate-200">Delta</div>
                      <div className="text-cyan-400 font-mono">Δ{gateData.optionContract.delta}</div>
                    </div>
                    <div>
                      <div className="text-slate-200">DTE</div>
                      <div className="text-amber-400 font-mono">{gateData.optionContract.dte}D</div>
                    </div>
                    <div>
                      <div className="text-slate-200">Expiry</div>
                      <div className="text-white font-mono">{gateData.optionContract.expiry}</div>
                    </div>
                  </div>
                  {gateData.optionContract.rationale && (
                    <div className="mt-2 text-[10px] text-emerald-300 italic">{gateData.optionContract.rationale}</div>
                  )}
                  <div className="mt-2 text-[9px] text-slate-300">
                    LIMIT ORDER ONLY at 0.5 Fib | Gamma explosion on Gate 3 velocity
                  </div>
                </div>
              )}
              
              {/* Risk/Reward Details */}
              {gateData.gates[5]?.passed && gateData.gates[5]?.details && (
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-800/50 text-center">
                    <div className="text-slate-200">Entry</div>
                    <div className="text-white font-mono">${gateData.gates[5].details.entry?.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded bg-red-900/30 text-center">
                    <div className="text-slate-200">Stop</div>
                    <div className="text-red-400 font-mono">${gateData.gates[5].details.stop?.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded bg-green-900/30 text-center">
                    <div className="text-slate-200">Target</div>
                    <div className="text-green-400 font-mono">${gateData.gates[5].details.target?.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded bg-indigo-900/30 text-center">
                    <div className="text-slate-200">R:R</div>
                    <div className="text-indigo-400 font-mono">1:{gateData.gates[5].details.ratio?.toFixed(1)}</div>
                  </div>
                </div>
              )}
              
              {/* Alert Message */}
              {gateData.alertMessage && (
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                  <pre className="text-xs text-green-300 whitespace-pre-wrap font-mono">
                    {gateData.alertMessage}
                  </pre>
                </div>
              )}
              
              {/* Direction Badge */}
              {gateData.direction && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge className={`text-sm ${gateData.direction === 'bullish' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {gateData.direction === 'bullish' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {gateData.direction.toUpperCase()} BIAS
                  </Badge>
                  <span className="text-slate-200 text-xs">@ ${gateData.currentPrice?.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Comprehensive Institutional Breakdown Panel
interface InstitutionalData {
  success: boolean;
  symbol: string;
  timestamp: string;
  quote: any;
  institutionalFlows: any;
  darkPool: {
    summary: any;
    analysis: any;
  };
  metrics: {
    institutionalScore: number;
    signalStrength: number;
    bias: string;
    activity: string;
  };
  breakdown: string;
}

function InstitutionalBreakdownPanel({ symbol }: { symbol: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { speak, stop, isPlaying, isLoading: ttsLoading } = useTTS();
  
  const { data: instData, isLoading, refetch } = useQuery<InstitutionalData>({
    queryKey: ['/api/supply-demand/institutional-breakdown', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/supply-demand/institutional-breakdown/${symbol}`);
      if (!res.ok) throw new Error('Failed to fetch institutional data');
      return res.json();
    },
    enabled: isExpanded && !!symbol
  });

  const handleFetchBreakdown = () => {
    setIsExpanded(true);
  };

  // Helper to safely format numbers
  const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
  };

  const formatMillions = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return (num / 1000000).toFixed(1) + 'M';
  };

  const formatPercent = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toFixed(2) + '%';
  };

  const getBiasColor = (bias: string) => {
    if (bias === 'bullish') return 'text-green-400';
    if (bias === 'bearish') return 'text-red-400';
    return 'text-slate-200';
  };

  const getActivityBadge = (activity: string) => {
    if (activity === 'high') return 'bg-purple-600';
    if (activity === 'medium') return 'bg-amber-600';
    return 'bg-slate-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 border-purple-500/30 mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Institutional Breakdown
            {instData?.metrics?.bias && (
              <Badge className={instData.metrics.bias === 'bullish' ? 'bg-green-600' : instData.metrics.bias === 'bearish' ? 'bg-red-600' : 'bg-slate-600'}>
                {instData.metrics.bias.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isExpanded && (
              <Button variant="outline" size="sm" onClick={handleFetchBreakdown} className="border-purple-500/50 text-purple-400 hover:bg-purple-900/30">
                <Brain className="h-4 w-4 mr-1" />
                Analyze Institutions
              </Button>
            )}
            {isExpanded && (
              <>
                <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-200 mt-1">
          Dark Pool + Options Flow + Short Interest + AI Analysis
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2">
          {isLoading && (
            <div className="text-center py-6">
              <Brain className="h-8 w-8 text-purple-400 mx-auto animate-pulse mb-2" />
              <p className="text-slate-200 text-sm">Analyzing institutional activity...</p>
              <p className="text-slate-300 text-xs mt-1">Fetching dark pool, options flow, and AI insights</p>
            </div>
          )}
          
          {instData && !isLoading && (
            <div className="space-y-4">
              {/* Metrics Overview */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-xs text-slate-200 mb-1">Inst. Score</div>
                  <div className={`text-xl font-bold ${getScoreColor(instData.metrics.institutionalScore)}`}>
                    {instData.metrics.institutionalScore}
                  </div>
                </div>
                <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-xs text-slate-200 mb-1">Signal Strength</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {instData.metrics.signalStrength}%
                  </div>
                </div>
                <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-xs text-slate-200 mb-1">Inst. Bias</div>
                  <div className={`text-lg font-bold ${getBiasColor(instData.metrics.bias)}`}>
                    {instData.metrics.bias?.toUpperCase() || 'NEUTRAL'}
                  </div>
                </div>
                <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-xs text-slate-200 mb-1">Activity</div>
                  <Badge className={getActivityBadge(instData.metrics.activity)}>
                    {instData.metrics.activity?.toUpperCase() || 'LOW'}
                  </Badge>
                </div>
              </div>

              {/* Quote & Flows Grid */}
              {(instData.quote || instData.institutionalFlows) && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Quote Data */}
                  {instData.quote && (
                    <div className="p-3 rounded bg-slate-800/30 border border-slate-700">
                      <div className="text-xs text-slate-200 font-semibold mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> MARKET DATA
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-300">Price:</span> <span className="text-white">${formatNumber(instData.quote.price)}</span></div>
                        <div><span className="text-slate-300">Change:</span> <span className={(instData.quote.changePercent ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}>{formatPercent(instData.quote.changePercent)}</span></div>
                        <div><span className="text-slate-300">Volume:</span> <span className="text-white">{formatMillions(instData.quote.volume)}</span></div>
                        <div><span className="text-slate-300">Avg Vol:</span> <span className="text-slate-300">{formatMillions(instData.quote.avgVolume)}</span></div>
                        <div><span className="text-slate-300">Beta:</span> <span className="text-white">{formatNumber(instData.quote.beta)}</span></div>
                        <div><span className="text-slate-300">P/E:</span> <span className="text-white">{formatNumber(instData.quote.pe, 1)}</span></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Institutional Flows */}
                  {instData.institutionalFlows && (
                    <div className="p-3 rounded bg-slate-800/30 border border-slate-700">
                      <div className="text-xs text-slate-200 font-semibold mb-2 flex items-center gap-1">
                        <Activity className="h-3 w-3" /> INSTITUTIONAL FLOWS
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-300">Inst. Own:</span> <span className="text-purple-400">{instData.institutionalFlows.institutionalOwnership ?? 'N/A'}%</span></div>
                        <div><span className="text-slate-300">Insider:</span> <span className="text-amber-400">{instData.institutionalFlows.insiderOwnership ?? 'N/A'}%</span></div>
                        <div><span className="text-slate-300">Short Int:</span> <span className="text-red-400">{instData.institutionalFlows.shortInterest ?? 'N/A'}%</span></div>
                        <div><span className="text-slate-300">Days Cover:</span> <span className="text-white">{formatNumber(instData.institutionalFlows.shortRatio, 1)}</span></div>
                        <div className="col-span-2">
                          <span className="text-slate-300">Options Flow:</span>{' '}
                          <Badge className={instData.institutionalFlows.optionsFlow === 'bullish' ? 'bg-green-600' : instData.institutionalFlows.optionsFlow === 'bearish' ? 'bg-red-600' : 'bg-slate-600'}>
                            {instData.institutionalFlows.optionsFlow?.toUpperCase() || 'NEUTRAL'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dark Pool Data */}
              {instData.darkPool?.summary && (
                <div className="p-3 rounded bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30">
                  <div className="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> DARK POOL ACTIVITY
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-slate-200">Volume</div>
                      <div className="text-white font-bold">{formatMillions(instData.darkPool.summary.totalDarkPoolVolume)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-200">% of Total</div>
                      <div className="text-purple-400 font-bold">{formatNumber(instData.darkPool.summary.darkPoolPercent, 1)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-200">Block Trades</div>
                      <div className="text-cyan-400 font-bold">{instData.darkPool.summary.blockTradeCount ?? 'N/A'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-200">Avg Size</div>
                      <div className="text-white font-bold">{instData.darkPool.summary.averageTradeSize?.toLocaleString() ?? 'N/A'}</div>
                    </div>
                  </div>
                  {instData.darkPool.analysis && (
                    <div className="mt-2 pt-2 border-t border-purple-500/30 flex items-center justify-between">
                      <span className="text-xs text-slate-200">AI Signal:</span>
                      <Badge className={
                        instData.darkPool.analysis.signalType === 'accumulation' ? 'bg-green-600' :
                        instData.darkPool.analysis.signalType === 'distribution' ? 'bg-red-600' : 'bg-slate-600'
                      }>
                        {instData.darkPool.analysis.signalType?.toUpperCase() || 'NEUTRAL'} ({instData.darkPool.analysis.confidence ?? 0}% conf)
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* AI Breakdown */}
              {instData.breakdown && (
                <div className="p-3 rounded bg-slate-800/50 border border-slate-700">
                  <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" /> AI-POWERED INSTITUTIONAL ANALYSIS
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => isPlaying ? stop() : speak(instData.breakdown)}
                      disabled={ttsLoading}
                      className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300"
                      title={isPlaying ? "Stop reading" : "AI Read Analysis"}
                    >
                      {ttsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {instData.breakdown}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!instData && !isLoading && (
            <div className="text-center py-4 text-slate-300 text-sm">
              Click "Analyze Institutions" to fetch comprehensive institutional data
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

export default function SupplyDemandScanner() {
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("15m");
  const [assetClass, setAssetClass] = useState("stocks");
  const [showHistoric, setShowHistoric] = useState(false);
  const [selectedTimeframes, setSelectedTimeframes] = useState(["5m", "15m", "1h"]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEducation, setShowEducation] = useState(false);
  const { speak: speakTrend, stop: stopTrend, isPlaying: isTrendPlaying, isLoading: trendTTSLoading } = useTTS();
  
  const [chartScale, setChartScale] = useState(1);
  const [chartOffset, setChartOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);
  
  const [zoneAlert, setZoneAlert] = useState<{type: 'enter' | 'exit', zoneType: 'supply' | 'demand'} | null>(null);
  const [previousZoneStatus, setPreviousZoneStatus] = useState<{inZone: boolean, zoneType: 'supply' | 'demand' | null}>({inZone: false, zoneType: null});
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{explanation: string, summary: any} | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setAudioInitialized(true);
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playAlertSound = useCallback((type: 'enter' | 'exit', zoneType: 'supply' | 'demand') => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'enter') {
      oscillator.frequency.value = zoneType === 'supply' ? 880 : 660;
      oscillator.type = 'sine';
    } else {
      oscillator.frequency.value = zoneType === 'supply' ? 440 : 550;
      oscillator.type = 'triangle';
    }
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }, [soundEnabled]);

  const { data: scanResult, isLoading: scanLoading, refetch: refetchScan } = useQuery<ScanResult & { heikinAshi?: CandleData[], candles?: CandleData[], multiTfZones?: Record<string, SupplyDemandZone[]> }>({
    queryKey: ['/api/supply-demand/scan', symbol, timeframe, assetClass, selectedTimeframes.join(',')],
    queryFn: async () => {
      const res = await fetch(`/api/supply-demand/scan?symbol=${symbol}&timeframe=${timeframe}&assetClass=${assetClass}&includeCandles=true`);
      const singleData = await res.json();
      
      const tfRes = await fetch(`/api/supply-demand/multi-timeframe?symbol=${symbol}&timeframes=${selectedTimeframes.join(',')}&assetClass=${assetClass}`);
      const tfData = await tfRes.json();
      
      return {
        ...singleData,
        multiTfZones: tfData.timeframes
      };
    },
    enabled: false
  });

  useEffect(() => {
    if (scanResult) {
      const currentStatus = { inZone: scanResult.inZone, zoneType: scanResult.zoneType };
      
      if (previousZoneStatus.inZone !== currentStatus.inZone || previousZoneStatus.zoneType !== currentStatus.zoneType) {
        if (currentStatus.inZone && currentStatus.zoneType) {
          setZoneAlert({ type: 'enter', zoneType: currentStatus.zoneType });
          playAlertSound('enter', currentStatus.zoneType);
          setTimeout(() => setZoneAlert(null), 3000);
        } else if (previousZoneStatus.inZone && previousZoneStatus.zoneType) {
          setZoneAlert({ type: 'exit', zoneType: previousZoneStatus.zoneType });
          playAlertSound('exit', previousZoneStatus.zoneType);
          setTimeout(() => setZoneAlert(null), 3000);
        }
      }
      
      setPreviousZoneStatus(currentStatus);
    }
  }, [scanResult, previousZoneStatus, playAlertSound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        refetchScan();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refetchScan]);

  const { data: multiTfResult, isLoading: multiTfLoading, refetch: refetchMultiTf } = useQuery<MultiTimeframeScan>({
    queryKey: ['/api/supply-demand/multi-timeframe', symbol, selectedTimeframes.join(','), assetClass],
    queryFn: async () => {
      const res = await fetch(`/api/supply-demand/multi-timeframe?symbol=${symbol}&timeframes=${selectedTimeframes.join(',')}&assetClass=${assetClass}`);
      return res.json();
    },
    enabled: false
  });

  const { data: scanAllResult, isLoading: scanAllLoading, refetch: refetchScanAll } = useQuery<{ results: ScanResult[], summary: any }>({
    queryKey: ['/api/supply-demand/scan-all', timeframe, assetClass],
    queryFn: async () => {
      const res = await fetch(`/api/supply-demand/scan-all?timeframe=${timeframe}&assetClass=${assetClass}`);
      return res.json();
    },
    enabled: false
  });

  // 7-Gate data query for AI analysis alignment
  const { data: sevenGateData } = useQuery<SevenGateData>({
    queryKey: ['/api/supply-demand/seven-gate', symbol, timeframe, assetClass],
    queryFn: async () => {
      const res = await fetch(`/api/supply-demand/seven-gate?symbol=${symbol}&timeframe=${timeframe}&assetClass=${assetClass}`);
      return res.json();
    },
    enabled: !!symbol && symbol.length > 0
  });

  const explainMutation = useMutation({
    mutationFn: async (scanData: any) => {
      const response = await fetch('/api/supply-demand/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAiExplanation({ explanation: data.explanation, summary: data.summary });
      }
    }
  });

  const handleSingleScan = async () => {
    setAiExplanation(null);
    await refetchScan();
  };

  const handleMultiTimeframeScan = () => {
    refetchMultiTf();
  };

  const handleScanAll = () => {
    refetchScanAll();
  };

  const handleGetExplanation = () => {
    if (scanResult) {
      explainMutation.mutate({
        symbol,
        currentPrice: scanResult.currentPrice,
        zones: scanResult.zones,
        inZone: scanResult.inZone,
        zoneType: scanResult.zoneType,
        nearestSupply: scanResult.nearestSupply,
        nearestDemand: scanResult.nearestDemand,
        timeframe,
        assetClass,
        gateDirection: sevenGateData?.direction || null,
        candles: scanResult.candles || []
      });
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setChartScale(prev => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - chartOffset.x, y: e.clientY - chartOffset.y });
  }, [chartOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setChartOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetChartView = useCallback(() => {
    setChartScale(1);
    setChartOffset({ x: 0, y: 0 });
  }, []);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatTime = (timestamp: number) => new Date(timestamp).toLocaleString();

  const renderZoneCard = (zone: SupplyDemandZone) => (
    <div 
      key={zone.id}
      className={`p-3 rounded-lg border-2 ${
        zone.type === 'supply' 
          ? 'border-red-500/50 bg-red-500/10' 
          : 'border-green-500/50 bg-green-500/10'
      } ${zone.broken ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {zone.type === 'supply' ? (
            <TrendingDown className="w-4 h-4 text-red-400" />
          ) : (
            <TrendingUp className="w-4 h-4 text-green-400" />
          )}
          <span className={`font-semibold ${zone.type === 'supply' ? 'text-red-400' : 'text-green-400'}`}>
            {zone.type.toUpperCase()} ZONE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {zone.timeframe}
          </Badge>
          {zone.retested && (
            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
              Retested x{zone.retestCount}
            </Badge>
          )}
          {zone.broken && (
            <Badge variant="destructive" className="text-xs">
              Broken
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-200">Top:</span>
          <span className="ml-2 font-mono text-white">${formatPrice(zone.topPrice)}</span>
        </div>
        <div>
          <span className="text-slate-200">Bottom:</span>
          <span className="ml-2 font-mono text-white">${formatPrice(zone.bottomPrice)}</span>
        </div>
        <div>
          <span className="text-slate-200">Strength:</span>
          <span className={`ml-2 font-semibold ${zone.strength >= 70 ? 'text-green-400' : zone.strength >= 50 ? 'text-yellow-400' : 'text-slate-200'}`}>
            {zone.strength}%
          </span>
        </div>
        <div>
          <span className="text-slate-200">Momentum:</span>
          <span className="ml-2 text-purple-400">{zone.momentumCandles} candles</span>
        </div>
      </div>

      {zone.combinedFrom && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-200">Combined from: </span>
          {zone.combinedFrom.map((tf, i) => (
            <Badge key={i} variant="outline" className="text-xs ml-1">
              {tf}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const renderInteractiveChart = (candles: CandleData[], zones: SupplyDemandZone[], currentPrice: number) => {
    if (!candles || candles.length === 0) {
      return (
        <div className="h-[500px] bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
          <p className="text-slate-200">No candle data available - waiting for live market data</p>
        </div>
      );
    }

    const filteredZones = showHistoric ? zones : zones.filter(z => !z.isHistoric && !z.broken);
    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const zonePrices = filteredZones.flatMap(z => [z.topPrice, z.bottomPrice]);
    const maxPrice = Math.max(...allPrices, ...zonePrices) * 1.005;
    const minPrice = Math.min(...allPrices, ...zonePrices) * 0.995;
    const priceRange = maxPrice - minPrice;

    const chartWidth = 100;
    const candleWidth = chartWidth / candles.length;
    const candleBodyWidth = candleWidth * 0.7;

    const getYPosition = (price: number) => ((maxPrice - price) / priceRange) * 100;

    const isInSupplyZone = scanResult?.inZone && scanResult?.zoneType === 'supply';
    const isInDemandZone = scanResult?.inZone && scanResult?.zoneType === 'demand';

    return (
      <div className="relative">
        <div className="absolute top-2 left-2 z-40 flex gap-2">
          <Button size="sm" variant="outline" className="bg-slate-800/80" onClick={() => setChartScale(s => Math.min(5, s * 1.2))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-slate-800/80" onClick={() => setChartScale(s => Math.max(0.5, s * 0.8))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-slate-800/80" onClick={resetChartView}>
            <Move className="w-4 h-4" />
          </Button>
          <Badge className="bg-slate-800/80 text-white">{Math.round(chartScale * 100)}%</Badge>
        </div>

        <div 
          ref={chartRef}
          className={`relative h-[500px] bg-slate-900 rounded-lg border-2 overflow-hidden cursor-grab select-none transition-all duration-300 ${
            zoneAlert 
              ? zoneAlert.zoneType === 'supply' 
                ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' 
                : 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-pulse'
              : 'border-slate-700'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {zoneAlert && (
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 rounded-xl text-xl font-bold animate-bounce ${
              zoneAlert.zoneType === 'supply' 
                ? 'bg-red-600 text-white' 
                : 'bg-green-600 text-white'
            }`}>
              {zoneAlert.type === 'enter' ? '🚨 ENTERED' : '✅ EXITED'} {zoneAlert.zoneType.toUpperCase()} ZONE!
            </div>
          )}

          <div 
            style={{ 
              transform: `scale(${chartScale}) translate(${chartOffset.x / chartScale}px, ${chartOffset.y / chartScale}px)`,
              transformOrigin: 'center center',
              width: '100%',
              height: '100%'
            }}
          >
            {filteredZones.map((zone) => {
              const top = getYPosition(zone.topPrice);
              const height = ((zone.topPrice - zone.bottomPrice) / priceRange) * 100;
              
              return (
                <div
                  key={zone.id}
                  className={`absolute left-0 right-0 ${
                    zone.type === 'supply' 
                      ? 'bg-red-500/20 border-red-500/60' 
                      : 'bg-cyan-500/20 border-cyan-500/60'
                  } border-y-2 border-dashed z-10 transition-all duration-300 ${
                    (zone.type === 'supply' && isInSupplyZone) || (zone.type === 'demand' && isInDemandZone)
                      ? 'animate-pulse brightness-150'
                      : ''
                  }`}
                  style={{
                    top: `${top}%`,
                    height: `${Math.max(height, 1)}%`
                  }}
                >
                  <div className={`absolute left-2 top-0.5 text-xs font-bold ${
                    zone.type === 'supply' ? 'text-red-400' : 'text-cyan-400'
                  }`}>
                    {zone.type === 'supply' ? '🔴 SUPPLY' : '🟢 DEMAND'}
                    {zone.retested && <span className="ml-2 text-yellow-400">↻ Retest</span>}
                  </div>
                  <div className="absolute right-2 top-0.5 text-xs text-slate-300">
                    ${formatPrice(zone.topPrice)} - ${formatPrice(zone.bottomPrice)}
                  </div>
                </div>
              );
            })}

            <svg 
              className="absolute inset-0 w-full h-full z-20" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {candles.map((candle, i) => {
                const isBullish = candle.close >= candle.open;
                const bodyTop = getYPosition(Math.max(candle.open, candle.close));
                const bodyBottom = getYPosition(Math.min(candle.open, candle.close));
                const bodyHeight = Math.max(bodyBottom - bodyTop, 0.2);
                const wickTop = getYPosition(candle.high);
                const wickBottom = getYPosition(candle.low);
                const x = (i / candles.length) * 100 + candleWidth / 2;
                
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={wickTop}
                      x2={x}
                      y2={wickBottom}
                      stroke={isBullish ? '#22c55e' : '#ef4444'}
                      strokeWidth={0.15}
                    />
                    <rect
                      x={x - candleBodyWidth / 2}
                      y={bodyTop}
                      width={candleBodyWidth}
                      height={bodyHeight}
                      fill={isBullish ? '#22c55e' : '#ef4444'}
                      stroke={isBullish ? '#16a34a' : '#dc2626'}
                      strokeWidth={0.1}
                    />
                  </g>
                );
              })}
            </svg>

            <div 
              className={`absolute left-0 right-0 h-0.5 z-30 transition-all ${
                isInSupplyZone ? 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                isInDemandZone ? 'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]' :
                'bg-white'
              }`}
              style={{ top: `${getYPosition(currentPrice)}%` }}
            >
              <div className={`absolute right-2 -top-3 px-2 py-0.5 rounded text-xs font-bold shadow-lg ${
                isInSupplyZone ? 'bg-red-500 text-white' :
                isInDemandZone ? 'bg-green-500 text-white' :
                'bg-white text-black'
              }`}>
                ${formatPrice(currentPrice)}
              </div>
            </div>
          </div>

          <div className="absolute top-2 left-2 text-xs text-slate-200 z-30">${formatPrice(maxPrice)}</div>
          <div className="absolute bottom-2 left-2 text-xs text-slate-200 z-30">${formatPrice(minPrice)}</div>
          
          <div className="absolute top-2 right-2 flex gap-2 z-30">
            <Badge className="bg-cyan-500/30 text-cyan-400 text-xs">Demand = Bullish</Badge>
            <Badge className="bg-red-500/30 text-red-400 text-xs">Supply = Bearish</Badge>
          </div>

          <div className="absolute bottom-2 right-2 text-xs text-slate-300 z-30">
            Scroll to zoom • Drag to pan
          </div>
        </div>
      </div>
    );
  };

  const renderZoneVisualization = (zones: SupplyDemandZone[], currentPrice: number) => {
    const filteredZones = showHistoric ? zones : zones.filter(z => !z.isHistoric && !z.broken);
    const allPrices = filteredZones.flatMap(z => [z.topPrice, z.bottomPrice]).concat(currentPrice);
    const maxPrice = Math.max(...allPrices) * 1.02;
    const minPrice = Math.min(...allPrices) * 0.98;
    const priceRange = maxPrice - minPrice;

    const getYPosition = (price: number) => {
      return ((maxPrice - price) / priceRange) * 100;
    };

    return (
      <div className="relative h-[400px] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        {filteredZones.map((zone) => {
          const top = getYPosition(zone.topPrice);
          const height = ((zone.topPrice - zone.bottomPrice) / priceRange) * 100;
          
          return (
            <div
              key={zone.id}
              className={`absolute left-0 right-0 ${
                zone.type === 'supply' 
                  ? 'bg-red-500/20 border-red-500/50' 
                  : 'bg-green-500/20 border-green-500/50'
              } border-y-2 border-dashed`}
              style={{
                top: `${top}%`,
                height: `${Math.max(height, 2)}%`
              }}
            >
              <div className={`absolute left-2 top-1 text-xs font-semibold ${
                zone.type === 'supply' ? 'text-red-400' : 'text-green-400'
              }`}>
                {zone.type === 'supply' ? '📉 Supply' : '📈 Demand'} (${formatPrice(zone.topPrice)} - ${formatPrice(zone.bottomPrice)})
              </div>
              {zone.retested && (
                <div className="absolute right-2 top-1">
                  <Badge className="bg-yellow-500/30 text-yellow-400 text-xs">
                    🔄 Retested
                  </Badge>
                </div>
              )}
            </div>
          );
        })}

        <div 
          className="absolute left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{ top: `${getYPosition(currentPrice)}%` }}
        >
          <div className="absolute right-2 -top-3 bg-white text-black px-2 py-0.5 rounded text-xs font-bold">
            ${formatPrice(currentPrice)}
          </div>
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs text-slate-200">
          <div>${formatPrice(maxPrice)}</div>
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 text-xs text-slate-200">
          <div>${formatPrice(minPrice)}</div>
        </div>
      </div>
    );
  };

  const renderEducationPanel = () => (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-cyan-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Understanding Supply & Demand Zones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5" />
              Supply Zone (Resistance)
            </h3>
            <p className="text-slate-300 mb-3">
              A <strong>Supply Zone</strong> is an area on the chart where sellers have historically shown strength. 
              When price sharply dropped from this level, it indicates institutional selling pressure.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">📍</span>
                <span className="text-slate-200"><strong className="text-white">When price enters:</strong> Expect selling pressure. Buyers beware!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">📉</span>
                <span className="text-slate-200"><strong className="text-white">Trading action:</strong> Look for SHORT (sell) opportunities</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">🛑</span>
                <span className="text-slate-200"><strong className="text-white">Stop-loss:</strong> Place ABOVE the supply zone top</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">🎯</span>
                <span className="text-slate-200"><strong className="text-white">Target:</strong> Next demand zone below or recent swing low</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              Demand Zone (Support)
            </h3>
            <p className="text-slate-300 mb-3">
              A <strong>Demand Zone</strong> is an area where buyers have historically shown strength. 
              When price sharply rallied from this level, it indicates institutional buying interest.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">📍</span>
                <span className="text-slate-200"><strong className="text-white">When price enters:</strong> Expect buying pressure. Sellers beware!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">📈</span>
                <span className="text-slate-200"><strong className="text-white">Trading action:</strong> Look for LONG (buy) opportunities</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">🛑</span>
                <span className="text-slate-200"><strong className="text-white">Stop-loss:</strong> Place BELOW the demand zone bottom</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">🎯</span>
                <span className="text-slate-200"><strong className="text-white">Target:</strong> Next supply zone above or recent swing high</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            Zone Trading Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-slate-300"><strong className="text-white">✅ Fresh zones</strong> are strongest (never retested)</p>
              <p className="text-slate-300"><strong className="text-white">✅ Higher timeframe zones</strong> are more significant</p>
              <p className="text-slate-300"><strong className="text-white">✅ Multi-timeframe alignment</strong> increases probability</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-300"><strong className="text-white">⚠️ Retested zones</strong> get weaker with each touch</p>
              <p className="text-slate-300"><strong className="text-white">⚠️ Broken zones</strong> flip to opposite type</p>
              <p className="text-slate-300"><strong className="text-white">⚠️ Always use</strong> proper risk management (1-2% max)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              Supply & Demand Scanner
            </h1>
            <p className="text-slate-200 mt-1 text-xs sm:text-sm">
              Multi-timeframe zone detection with live alerts and momentum analysis
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <WalkthroughGuide steps={MODULE_GUIDES['supply-demand']} title="Guide" accentColor="cyan" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEducation(!showEducation)}
              className={showEducation ? 'bg-cyan-600 border-cyan-500' : ''}
            >
              <Info className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{showEducation ? 'Hide Guide' : 'Learn Zones'}</span>
            </Button>
            <div className="flex items-center gap-2">
              <Switch 
                checked={soundEnabled} 
                onCheckedChange={(checked) => {
                  if (checked && !audioInitialized) {
                    initializeAudio();
                  }
                  setSoundEnabled(checked);
                }}
                id="sound-toggle"
              />
              <Label htmlFor="sound-toggle" className="text-slate-200 text-xs sm:text-sm flex items-center gap-1">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Alerts {audioInitialized ? '(Active)' : ''}</span>
              </Label>
            </div>
          </div>
        </div>

        {showEducation && renderEducationPanel()}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Scanner Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              <div>
                <Label className="text-slate-200 text-sm">Symbol</Label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-slate-200 text-sm">Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="30m">30 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-200 text-sm">Asset Class</Label>
                <Select value={assetClass} onValueChange={setAssetClass}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="all">All Assets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={showHistoric} 
                    onCheckedChange={setShowHistoric}
                    id="historic-toggle"
                  />
                  <Label htmlFor="historic-toggle" className="text-slate-200 text-sm">
                    Historic
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={autoRefresh} 
                    onCheckedChange={setAutoRefresh}
                    id="auto-refresh"
                  />
                  <Label htmlFor="auto-refresh" className="text-slate-200 text-sm">
                    Live
                  </Label>
                </div>
              </div>

              <div className="flex items-end gap-2 col-span-2">
                <Button 
                  onClick={handleSingleScan}
                  disabled={scanLoading}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {scanLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="ml-2">Scan</span>
                </Button>
                <Button 
                  onClick={handleScanAll}
                  disabled={scanAllLoading}
                  variant="outline"
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                >
                  {scanAllLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                  <span className="ml-2">Scan All</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="single" className="data-[state=active]:bg-cyan-600">
              Single Asset
            </TabsTrigger>
            <TabsTrigger value="multi-tf" className="data-[state=active]:bg-cyan-600">
              Multi-Timeframe
            </TabsTrigger>
            <TabsTrigger value="scanner" className="data-[state=active]:bg-cyan-600">
              Market Scanner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            {symbol && <SignalFusionAnalysis symbol={symbol} assetType="stock" compact />}
            {symbol && <StrongTrendPanel symbol={symbol} showReasons={true} />}
            {scanResult && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="text-slate-200 text-sm">Current Price</div>
                      <div className="text-2xl font-bold text-white">${formatPrice(scanResult.currentPrice)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className={`bg-slate-800/50 border-slate-700 transition-all duration-500 ${
                    scanResult.inZone 
                      ? scanResult.zoneType === 'supply' 
                        ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                        : 'ring-2 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                      : ''
                  }`}>
                    <CardContent className="pt-4">
                      <div className="text-slate-200 text-sm">Zone Status</div>
                      <div className={`text-xl font-bold ${
                        scanResult.inZone 
                          ? scanResult.zoneType === 'supply' ? 'text-red-400' : 'text-green-400'
                          : 'text-slate-300'
                      }`}>
                        {scanResult.inZone ? `In ${scanResult.zoneType?.toUpperCase()} Zone` : 'Outside Zones'}
                      </div>
                      {scanResult.inZone && (
                        <div className="text-xs mt-1">
                          {scanResult.zoneType === 'supply' 
                            ? '⚠️ Look for SHORT setups' 
                            : '✅ Look for LONG setups'}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="text-slate-200 text-sm flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-400" /> Nearest Supply
                      </div>
                      <div className="text-xl font-bold text-red-400">
                        {scanResult.nearestSupply 
                          ? `$${formatPrice(scanResult.nearestSupply.bottomPrice)}`
                          : 'None'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="text-slate-200 text-sm flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" /> Nearest Demand
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        {scanResult.nearestDemand 
                          ? `$${formatPrice(scanResult.nearestDemand.topPrice)}`
                          : 'None'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Live Interactive Chart - {scanResult.symbol}
                        {autoRefresh && <Badge className="bg-green-500 text-xs ml-2 animate-pulse">LIVE</Badge>}
                      </div>
                      <div className="flex gap-2">
                        {selectedTimeframes.map(tf => (
                          <Badge key={tf} variant="outline" className="text-[10px] bg-slate-700">
                            {tf}
                          </Badge>
                        ))}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scanResult.heikinAshi ? 
                      renderInteractiveChart(
                        scanResult.heikinAshi, 
                        scanResult.multiTfZones ? Object.values(scanResult.multiTfZones).flat() : scanResult.zones, 
                        scanResult.currentPrice
                      ) :
                      renderZoneVisualization(scanResult.zones, scanResult.currentPrice)
                    }
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Active Zones ({scanResult.zones.filter(z => !z.broken).length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(showHistoric ? scanResult.zones : scanResult.zones.filter(z => !z.broken && !z.isHistoric))
                        .map(zone => renderZoneCard(zone))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Trend Explanation Section */}
                <Card className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        AI Trend Analysis
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        {aiExplanation && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => isTrendPlaying ? stopTrend() : speakTrend(aiExplanation.explanation)}
                              disabled={trendTTSLoading}
                              className="text-purple-400 hover:text-purple-300"
                              title={isTrendPlaying ? "Stop reading" : "AI Read Analysis"}
                            >
                              {trendTTSLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isTrendPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowExplanation(!showExplanation)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={handleGetExplanation}
                          disabled={explainMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          {explainMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              {aiExplanation ? 'Refresh Analysis' : 'Get AI Analysis'}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!aiExplanation && !explainMutation.isPending && (
                      <div className="text-center py-8">
                        <Brain className="w-16 h-16 text-purple-500/40 mx-auto mb-4" />
                        <p className="text-slate-200 mb-2">Get AI-powered analysis of the detected zones</p>
                        <p className="text-slate-300 text-sm">Understand why the trend is what it is based on supply & demand logic</p>
                      </div>
                    )}
                    
                    {explainMutation.isPending && (
                      <div className="text-center py-8">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
                          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                        </div>
                        <p className="text-purple-400 font-semibold">Analyzing supply & demand zones...</p>
                        <p className="text-slate-300 text-sm mt-1">AI is evaluating trend structure and key levels</p>
                      </div>
                    )}

                    {aiExplanation && showExplanation && (
                      <div className="space-y-4">
                        {/* Summary Cards - Row 1 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                          <div className={`p-3 rounded-lg border ${
                            aiExplanation.summary.trend.toLowerCase().includes('bullish') 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : aiExplanation.summary.trend.toLowerCase().includes('bearish')
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-yellow-500/10 border-yellow-500/30'
                          }`}>
                            <div className="text-xs text-slate-200 mb-1">Trend Assessment</div>
                            <div className={`font-bold text-sm ${
                              aiExplanation.summary.trend.toLowerCase().includes('bullish') 
                                ? 'text-green-400' 
                                : aiExplanation.summary.trend.toLowerCase().includes('bearish')
                                ? 'text-red-400'
                                : 'text-yellow-400'
                            }`}>
                              {aiExplanation.summary.trend}
                            </div>
                            {aiExplanation.summary.trendScore && (
                              <div className="text-[10px] text-slate-300 mt-1">
                                Score: {aiExplanation.summary.trendScore}/100
                              </div>
                            )}
                          </div>
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <div className="text-xs text-slate-200 mb-1">Supply Zones</div>
                            <div className="font-bold text-red-400">{aiExplanation.summary.activeSupplyZones}</div>
                            {aiExplanation.summary.avgSupplyStrength !== undefined && (
                              <div className="text-[10px] text-slate-300">Avg: {aiExplanation.summary.avgSupplyStrength}% strength</div>
                            )}
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div className="text-xs text-slate-200 mb-1">Demand Zones</div>
                            <div className="font-bold text-green-400">{aiExplanation.summary.activeDemandZones}</div>
                            {aiExplanation.summary.avgDemandStrength !== undefined && (
                              <div className="text-[10px] text-slate-300">Avg: {aiExplanation.summary.avgDemandStrength}% strength</div>
                            )}
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            aiExplanation.summary.inZone 
                              ? aiExplanation.summary.zoneType === 'supply'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-green-500/10 border-green-500/30'
                              : 'bg-slate-700/50 border-slate-600'
                          }`}>
                            <div className="text-xs text-slate-200 mb-1">Zone Status</div>
                            <div className={`font-bold text-sm ${
                              aiExplanation.summary.inZone 
                                ? aiExplanation.summary.zoneType === 'supply' ? 'text-red-400' : 'text-green-400'
                                : 'text-slate-200'
                            }`}>
                              {aiExplanation.summary.inZone ? `In ${aiExplanation.summary.zoneType}` : 'Outside zones'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Summary Cards - Row 2 */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <div className="text-xs text-slate-200 mb-1">Fresh Zones</div>
                            <div className="font-bold text-purple-400">{aiExplanation.summary.freshZones || 0}</div>
                            <div className="text-[10px] text-slate-300">High probability</div>
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            aiExplanation.summary.institutionalBias === 'bullish' 
                              ? 'bg-green-500/10 border-green-500/30'
                              : aiExplanation.summary.institutionalBias === 'bearish'
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-slate-700/50 border-slate-600'
                          }`}>
                            <div className="text-xs text-slate-200 mb-1">Smart Money Bias</div>
                            <div className={`font-bold text-sm capitalize ${
                              aiExplanation.summary.institutionalBias === 'bullish' ? 'text-green-400' :
                              aiExplanation.summary.institutionalBias === 'bearish' ? 'text-red-400' : 'text-slate-200'
                            }`}>
                              {aiExplanation.summary.institutionalBias || 'Neutral'}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                            <div className="text-xs text-slate-200 mb-1">Distance to Zones</div>
                            <div className="text-xs space-y-1">
                              {aiExplanation.summary.distanceToSupply && (
                                <div className="text-red-400">Supply: {aiExplanation.summary.distanceToSupply}%</div>
                              )}
                              {aiExplanation.summary.distanceToDemand && (
                                <div className="text-green-400">Demand: {aiExplanation.summary.distanceToDemand}%</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Full AI Analysis */}
                        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                          <div className="prose prose-invert prose-sm max-w-none">
                            {aiExplanation.explanation.split('\n').map((line, i) => {
                              if (line.startsWith('## ')) {
                                return (
                                  <h3 key={i} className="text-purple-400 font-bold text-lg mt-4 mb-2 flex items-center gap-2">
                                    {line.replace('## ', '')}
                                  </h3>
                                );
                              }
                              if (line.startsWith('- ')) {
                                return (
                                  <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span className="text-slate-300">{line.replace('- ', '')}</span>
                                  </div>
                                );
                              }
                              if (line.trim() === '') return <div key={i} className="h-2" />;
                              return <p key={i} className="text-slate-300 mb-2 leading-relaxed">{line}</p>;
                            })}
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 text-center pt-2">
                          Analysis generated at {new Date().toLocaleTimeString()} • For educational purposes only
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 7-Gate Liquidity & S/D Validation System */}
                <SevenGatePanel symbol={symbol} timeframe={timeframe} assetClass={assetClass} />
                
                {/* Comprehensive Institutional Breakdown */}
                <InstitutionalBreakdownPanel symbol={symbol} />
              </>
            )}

            {!scanResult && !scanLoading && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-200">Enter a symbol and click Scan to detect Supply & Demand zones</p>
                  <p className="text-slate-300 text-sm mt-2">Try: AAPL, TSLA, MSFT, BTC, ETH, EURUSD</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="multi-tf" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Multi-Timeframe Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-2">
                    {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map(tf => (
                      <Badge
                        key={tf}
                        variant={selectedTimeframes.includes(tf) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedTimeframes.includes(tf) 
                            ? 'bg-purple-600' 
                            : 'hover:bg-purple-600/20'
                        }`}
                        onClick={() => {
                          if (selectedTimeframes.includes(tf)) {
                            setSelectedTimeframes(selectedTimeframes.filter(t => t !== tf));
                          } else if (selectedTimeframes.length < 3) {
                            setSelectedTimeframes([...selectedTimeframes, tf]);
                          }
                        }}
                      >
                        {tf}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={handleMultiTimeframeScan}
                    disabled={multiTfLoading || selectedTimeframes.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {multiTfLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    <span className="ml-2">Analyze</span>
                  </Button>
                </div>

                {multiTfResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="pt-4">
                          <div className="text-slate-200 text-sm">Symbol</div>
                          <div className="text-2xl font-bold text-white">{multiTfResult.symbol}</div>
                          <div className="text-lg text-cyan-400">${formatPrice(multiTfResult.currentPrice)}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="pt-4">
                          <div className="text-slate-200 text-sm">Combined Zones</div>
                          <div className="text-2xl font-bold text-purple-400">{multiTfResult.combinedZones.length}</div>
                          <div className="text-sm text-slate-200">
                            {multiTfResult.combinedZones.filter(z => z.type === 'supply').length} Supply / 
                            {multiTfResult.combinedZones.filter(z => z.type === 'demand').length} Demand
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="pt-4">
                          <div className="text-slate-200 text-sm">Active Signals</div>
                          <div className="text-2xl font-bold text-yellow-400">{multiTfResult.signals.length}</div>
                          <div className="text-sm text-slate-200">
                            {multiTfResult.signals.filter(s => s.type === 'retest').length} Retests
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {multiTfResult.signals.length > 0 && (
                      <Card className="bg-yellow-500/10 border-yellow-500/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Active Signals
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {multiTfResult.signals.map((signal, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                                <div className="flex items-center gap-2">
                                  <Badge className={
                                    signal.type === 'retest' ? 'bg-yellow-500' :
                                    signal.type === 'breakout' ? 'bg-red-500' :
                                    'bg-blue-500'
                                  }>
                                    {signal.type.toUpperCase()}
                                  </Badge>
                                  <span className={signal.zoneType === 'supply' ? 'text-red-400' : 'text-green-400'}>
                                    {signal.zoneType.toUpperCase()} Zone
                                  </span>
                                </div>
                                <span className="text-slate-200">
                                  {signal.percentDistance.toFixed(2)}% away
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {renderZoneVisualization(multiTfResult.combinedZones, multiTfResult.currentPrice)}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {multiTfResult.combinedZones.map(zone => renderZoneCard(zone))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4">
            {scanAllResult && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-white">{scanAllResult.summary.totalScanned}</div>
                      <div className="text-slate-200 text-sm">Scanned</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-red-400">{scanAllResult.summary.withSupplyZones}</div>
                      <div className="text-slate-200 text-sm">With Supply</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{scanAllResult.summary.withDemandZones}</div>
                      <div className="text-slate-200 text-sm">With Demand</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{scanAllResult.summary.inZone}</div>
                      <div className="text-slate-200 text-sm">In Zone</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-cyan-400">{scanAllResult.summary.nearZone}</div>
                      <div className="text-slate-200 text-sm">Near Zone</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Scan Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {scanAllResult.results.map((result) => (
                        <div 
                          key={result.symbol}
                          className={`p-3 rounded-lg border ${
                            result.inZone 
                              ? result.zoneType === 'supply' 
                                ? 'border-red-500/50 bg-red-500/10' 
                                : 'border-green-500/50 bg-green-500/10'
                              : 'border-slate-700 bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-white text-lg">{result.symbol}</span>
                              <span className="text-slate-200">${formatPrice(result.currentPrice)}</span>
                              {result.inZone && (
                                <Badge className={result.zoneType === 'supply' ? 'bg-red-500' : 'bg-green-500'}>
                                  IN {result.zoneType?.toUpperCase()} ZONE
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <TrendingDown className="w-4 h-4 text-red-400" />
                                <span className="text-red-400">
                                  {result.zones.filter(z => z.type === 'supply' && !z.broken).length}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">
                                  {result.zones.filter(z => z.type === 'demand' && !z.broken).length}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSymbol(result.symbol);
                                  handleSingleScan();
                                }}
                              >
                                <Target className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!scanAllResult && !scanAllLoading && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-200">Click "Scan All" to analyze all test assets for Supply & Demand zones</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
