import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PredictiveIndicator, PredictiveChip, type PredictiveData } from '@/components/shared/predictive-indicator';
import { TrendStrengthBar } from '@/components/ui/trend-strength-bar';
import { 
  Zap, Target, TrendingUp, TrendingDown, Clock, AlertTriangle,
  CheckCircle2, XCircle, BarChart3, Flame, BookOpen, Play,
  ArrowRight, Shield, DollarSign, Brain, Activity, RefreshCw,
  Search, Volume2, VolumeX, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';
import { useTTS } from '@/hooks/use-tts';
import StrongTrendPanel from '@/components/StrongTrendPanel';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

interface FiveGateResult {
  gate1_emaStack: boolean;
  gate2_adx: boolean;
  gate3_macdCrossover: boolean;
  gate4_price50EMA: boolean;
  gate5_rvol: boolean;
  gatesPassed: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  details: {
    ema8: number;
    ema18: number;
    ema50: number;
    adx: number;
    macdLine: number;
    macdSignal: number;
    macdCrossover: 'bullish' | 'bearish' | 'none';
    currentPrice: number;
    rvol: number;
  };
}

interface SecretSauceSignal {
  symbol: string;
  displayName: string;
  assetClass: string;
  signalType: 'ICC_LONG' | 'ICC_SHORT' | 'WICK_FILL_LONG' | 'WICK_FILL_SHORT' | 'ORB_LONG' | 'ORB_SHORT' | 'NO_SIGNAL';
  signalStrength: number;
  confluenceScore: number;
  maxScore: number;
  fiveGates: FiveGateResult;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  reasoning: string[];
  indicators: {
    rsi: number;
    atr: number;
    ema8: number;
    ema18: number;
    ema50: number;
    adx: number;
    macdLine: number;
    macdSignal: number;
    macdHistogram: number;
    rvol: number;
  };
  timestamp: string;
  timeframe: string;
  audioTrigger: 'entry' | 'exit' | null;
  predictive?: PredictiveData;
}

interface ScanResponse {
  timestamp: string;
  timeframe: string;
  category: string;
  summary: {
    totalScanned: number;
    activeSignals: number;
    longSignals: number;
    shortSignals: number;
    iccSignals: number;
    fvgFillSignals: number;
    orbSignals: number;
  };
  topSignals: SecretSauceSignal[];
  allSignals: SecretSauceSignal[];
}

interface CategoriesResponse {
  categories: { id: string; name: string; symbolCount: number }[];
  totalAssets: number;
}

interface TrendStrengthData {
  value: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  sweepDetected: boolean;
  sweepType: 'bullish' | 'bearish' | null;
  adx: number;
  adxRising: boolean;
  rsi: number;
  emaCross: 'bullish' | 'bearish' | 'none';
  intensity: number;
}

interface TrendStrengthResponse {
  success: boolean;
  symbol: string;
  timeframe: string;
  trendStrength: TrendStrengthData;
  timestamp: string;
}

const AUDIO_FREQUENCIES = {
  entry: [587.33, 739.99, 880.00],
  exit: [440.00, 349.23, 293.66]
};

const playAlarmSound = (type: 'entry' | 'exit' = 'entry') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = AUDIO_FREQUENCIES[type];
    
    for (let r = 0; r < 3; r++) {
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = type === 'entry' ? 'square' : 'sawtooth';
        const startTime = audioContext.currentTime + r * 0.5 + i * 0.15;
        gain.gain.setValueAtTime(1.0, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    }
  } catch (error) {
    console.error('Audio error:', error);
  }
};

const SignalTypeBadge = ({ signalType }: { signalType: string }) => {
  const isLong = signalType.includes('LONG');
  const isShort = signalType.includes('SHORT');
  const isICC = signalType.includes('ICC');
  const isFVGFill = signalType.includes('WICK_FILL');
  const isORB = signalType.includes('ORB');
  
  if (signalType === 'NO_SIGNAL') {
    return <Badge className="bg-slate-600">NO SIGNAL</Badge>;
  }
  
  let label = '';
  if (isICC) label = 'ICC';
  else if (isFVGFill) label = 'WICK FILL';
  else if (isORB) label = 'ORB';
  
  return (
    <Badge className={`${isLong ? 'bg-emerald-600' : 'bg-red-600'} flex items-center gap-1`}>
      {isLong ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {label} {isLong ? 'LONG' : 'SHORT'}
    </Badge>
  );
};

const TrendMeter = ({ direction, strength, gates }: { direction: 'bullish' | 'bearish' | 'neutral'; strength: number; gates: FiveGateResult }) => {
  const normalizedStrength = Math.min(100, Math.max(0, strength * 10));
  const gateCount = gates.gatesPassed;
  
  const getBgColor = () => {
    if (direction === 'bullish') return 'from-green-600 to-emerald-500';
    if (direction === 'bearish') return 'from-red-600 to-rose-500';
    return 'from-slate-600 to-slate-500';
  };
  
  const getLabel = () => {
    if (direction === 'bullish') {
      if (gateCount >= 4) return 'STRONG BULLISH';
      if (gateCount >= 3) return 'BULLISH';
      return 'WEAK BULLISH';
    }
    if (direction === 'bearish') {
      if (gateCount >= 4) return 'STRONG BEARISH';
      if (gateCount >= 3) return 'BEARISH';
      return 'WEAK BEARISH';
    }
    return 'NEUTRAL';
  };
  
  return (
    <div className="bg-slate-800/80 rounded-lg p-2 mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-200 font-medium">Trend Meter</span>
        <span className={`text-xs font-bold ${direction === 'bullish' ? 'text-emerald-400' : direction === 'bearish' ? 'text-red-400' : 'text-slate-200'}`}>
          {getLabel()}
        </span>
      </div>
      <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-gradient-to-r from-red-900/40 to-red-700/20" />
          <div className="w-1/2 bg-gradient-to-r from-green-700/20 to-green-900/40" />
        </div>
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50 transition-all duration-500"
          style={{ 
            left: direction === 'bullish' 
              ? `${50 + normalizedStrength / 2}%` 
              : direction === 'bearish' 
                ? `${50 - normalizedStrength / 2}%` 
                : '50%' 
          }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500/50" />
      </div>
    </div>
  );
};

const FiveGatesDisplay = ({ gates }: { gates: FiveGateResult }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider text-slate-200 font-medium">5-Gate Confluence</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${gates.gatesPassed >= 4 ? 'bg-emerald-500/20 text-emerald-400' : gates.gatesPassed >= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
        {gates.gatesPassed}/5 GATES
      </span>
    </div>
    <div className="grid grid-cols-5 gap-1 text-xs">
      <div className={`flex flex-col items-center gap-0.5 p-1.5 rounded transition-all ${gates.gate1_emaStack ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/50 border border-slate-700'}`}>
        {gates.gate1_emaStack ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
        <span className={`text-[9px] ${gates.gate1_emaStack ? 'text-emerald-300' : 'text-slate-300'}`}>EMA</span>
        <span className="text-[7px] text-slate-600">8/18/50</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 p-1.5 rounded transition-all ${gates.gate2_adx ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/50 border border-slate-700'}`}>
        {gates.gate2_adx ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
        <span className={`text-[9px] ${gates.gate2_adx ? 'text-emerald-300' : 'text-slate-300'}`}>ADX</span>
        <span className="text-[7px] text-slate-600">&gt;25</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 p-1.5 rounded transition-all ${gates.gate3_macdCrossover ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/50 border border-slate-700'}`}>
        {gates.gate3_macdCrossover ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
        <span className={`text-[9px] ${gates.gate3_macdCrossover ? 'text-emerald-300' : 'text-slate-300'}`}>MACD</span>
        <span className="text-[7px] text-slate-600">Cross</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 p-1.5 rounded transition-all ${gates.gate4_price50EMA ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/50 border border-slate-700'}`}>
        {gates.gate4_price50EMA ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
        <span className={`text-[9px] ${gates.gate4_price50EMA ? 'text-emerald-300' : 'text-slate-300'}`}>Price</span>
        <span className="text-[7px] text-slate-600">vs 50</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 p-1.5 rounded transition-all ${gates.gate5_rvol ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/50 border border-slate-700'}`}>
        {gates.gate5_rvol ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
        <span className={`text-[9px] ${gates.gate5_rvol ? 'text-emerald-300' : 'text-slate-300'}`}>RVOL</span>
        <span className="text-[7px] text-slate-600">&gt;1.5x</span>
      </div>
    </div>
  </div>
);

const SetupTypeBadge = ({ signalType }: { signalType: string }) => {
  const isICC = signalType.includes('ICC');
  const isWickFill = signalType.includes('WICK_FILL');
  const isORB = signalType.includes('ORB');
  
  if (signalType === 'NO_SIGNAL') return null;
  
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      <div className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${isICC ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-slate-700/30 text-slate-300 border border-slate-600'}`}>
        ICC {isICC ? '✓' : '−'}
      </div>
      <div className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${isWickFill ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-slate-700/30 text-slate-300 border border-slate-600'}`}>
        Secret-Fill {isWickFill ? '✓' : '−'}
      </div>
      <div className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${isORB ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-slate-700/30 text-slate-300 border border-slate-600'}`}>
        ORB {isORB ? '✓' : '−'}
      </div>
    </div>
  );
};

interface SevenGateData {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  gates: { gate: number; name: string; passed: boolean; details: any; }[];
  gatesPassed: number;
  allGatesPassed: boolean;
  signalActive: boolean;
  direction: 'bullish' | 'bearish' | null;
  optionContract: { type: 'CALL' | 'PUT'; strike: number; delta: number; dte: number; expiry: string; } | null;
  alertMessage: string | null;
}

const SevenGatePanelSecretSauce = ({ symbol, timeframe, category = 'stocks' }: { symbol: string; timeframe: string; category?: string }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getAssetClass = (sym: string, cat: string): string => {
    if (cat === 'crypto' || sym.includes('-USD')) return 'crypto';
    if (cat === 'forex_major' || cat === 'forex_cross' || sym.includes('USD')) return 'forex';
    if (cat === 'indices' || sym.startsWith('^')) return 'indices';
    if (cat === 'commodities' || sym.includes('=F')) return 'commodities';
    return 'stocks';
  };

  const assetClass = getAssetClass(symbol, category);
  
  const { data: gateData, isLoading, refetch } = useQuery<SevenGateData>({
    queryKey: ['/api/secret-sauce/7-gate', symbol, timeframe, assetClass],
    queryFn: async () => {
      const res = await fetch(`/api/secret-sauce/7-gate/${symbol}?timeframe=${timeframe}&assetClass=${assetClass}`);
      if (!res.ok) throw new Error('Failed to fetch 7-gate data');
      return res.json();
    },
    enabled: !!symbol && symbol.length > 0
  });

  // 2026 Master Prompt Gate Icons & Descriptions
  const gateIcons = ['🎯', '📍', '⚡', '🔄', '📐', '📊', '🚦'];
  const gateDescriptions = [
    'Gate 1: Liquidity Sweep (Primary Trigger)',
    'Gate 2: S/D Zone Tap (Institutional)',
    'Gate 3: Velocity Displacement (150% + FVG)',
    'Gate 4: Market Structure Shift (MSS)',
    'Gate 5: Fair Value Entry (0.5 Fib)',
    'Gate 6: R/R ≥2:1 (2 ticks stop)',
    'Gate 7: Kill-Switch (EST Windows)'
  ];
  
  if (!symbol) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-orange-900/10 to-slate-900 border-orange-500/30 mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-400" />
            7-Gate Master System (2026)
            {gateData?.allGatesPassed && (
              <Badge className="bg-green-600 ml-2 animate-pulse">ALL GATES PASSED</Badge>
            )}
            {gateData?.signalActive && !gateData?.allGatesPassed && (
              <Badge className="bg-amber-600 ml-2">{gateData.gatesPassed}/7</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-200 mt-1">
          Sweep → Zone → 150% Displacement → MSS → 0.5 Fib → 2:1 R/R → 0.60Δ (1-3 DTE)
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2">
          {isLoading && (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 text-orange-400 mx-auto animate-spin mb-2" />
              <p className="text-slate-200 text-sm">Validating 7-Gate system...</p>
            </div>
          )}
          
          {gateData && !isLoading && (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1">
                {gateData.gates.map((gate, idx) => (
                  <div
                    key={gate.gate}
                    className={`p-2 rounded text-center ${
                      gate.passed ? 'bg-green-500/20 border border-green-500/50' : 'bg-slate-800/50 border border-slate-700'
                    }`}
                    title={gateDescriptions[idx]}
                  >
                    <div className="text-base">{gateIcons[idx]}</div>
                    <div className={`text-[9px] ${gate.passed ? 'text-green-400' : 'text-slate-300'}`}>
                      G{gate.gate} {gate.passed ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {gateData.gates.map((gate, idx) => (
                  <div key={gate.gate} className={`p-2 rounded ${gate.passed ? 'bg-green-900/20' : 'bg-slate-800/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 text-[10px]">{gateDescriptions[idx]?.split(':')[1] || gate.name}</span>
                      <span className={gate.passed ? 'text-green-400' : 'text-red-400'}>{gate.passed ? '✓' : '✗'}</span>
                    </div>
                    {gate.gate === 1 && gate.details?.detected && (
                      <div className="text-green-300 text-[10px] mt-1">{gate.details.levelName}: ${gate.details.level?.toFixed(2)}</div>
                    )}
                    {gate.gate === 2 && gate.details && (
                      <div className={`text-[10px] mt-1 ${gate.passed ? 'text-green-300' : 'text-slate-300'}`}>
                        {gate.passed ? `${gate.details.zone?.type?.toUpperCase()} zone` : 'No confluence'}
                      </div>
                    )}
                    {gate.gate === 3 && gate.details && (
                      <div className={`text-[10px] mt-1 ${gate.passed ? 'text-green-300' : 'text-slate-300'}`}>
                        {gate.passed ? `${gate.details.velocityMultiple?.toFixed(1)}x ${gate.details.hasFVG ? '+ FVG' : ''}` : 'No velocity'}
                      </div>
                    )}
                    {gate.gate === 4 && gate.details && (
                      <div className={`text-[10px] mt-1 ${gate.passed ? 'text-green-300' : 'text-slate-300'}`}>
                        {gate.passed ? `MSS @ $${gate.details.pivotLevel?.toFixed(2)}` : 'No break'}
                      </div>
                    )}
                    {gate.gate === 5 && gate.details && (
                      <div className={`text-[10px] mt-1 ${gate.passed ? 'text-green-300' : 'text-slate-300'}`}>
                        {gate.details.entryPrice ? `$${gate.details.entryPrice} (0.5 Fib)` : 'Awaiting'}
                        {gate.details.invalidated && <span className="text-red-400 ml-1">INVALID</span>}
                      </div>
                    )}
                    {gate.gate === 6 && gate.details && (
                      <div className={`text-[10px] mt-1 ${gate.passed ? 'text-green-300' : 'text-slate-300'}`}>
                        R:R {gate.details.ratio?.toFixed(1)}:1 {gate.passed && '≥2:1'}
                      </div>
                    )}
                    {gate.gate === 7 && gate.details && (
                      <div className={`text-[10px] mt-1 ${gate.passed ? 'text-green-300' : 'text-slate-300'}`}>
                        {gate.details.window} ({gate.details.estTime})
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {gateData.optionContract && (
                <div className="p-3 rounded bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-bold text-sm">ITM CONTRACT (0.60-0.65Δ)</span>
                    <Badge className={gateData.optionContract.type === 'CALL' ? 'bg-green-600' : 'bg-red-600'}>
                      {gateData.optionContract.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><div className="text-slate-200">Strike</div><div className="text-white">${gateData.optionContract.strike}</div></div>
                    <div><div className="text-slate-200">Delta</div><div className="text-cyan-400">Δ{gateData.optionContract.delta}</div></div>
                    <div><div className="text-slate-200">DTE</div><div className="text-amber-400">{gateData.optionContract.dte}D</div></div>
                    <div><div className="text-slate-200">Expiry</div><div className="text-white">{gateData.optionContract.expiry}</div></div>
                  </div>
                  <div className="mt-2 text-[9px] text-slate-300">LIMIT ORDER at 0.5 Fib | Gamma on Gate 3</div>
                </div>
              )}
              
              {gateData.alertMessage && (
                <div className="p-2 rounded bg-green-900/20 border border-green-500/30">
                  <pre className="text-[10px] text-green-300 whitespace-pre-wrap">{gateData.alertMessage}</pre>
                </div>
              )}
              
              {gateData.direction && gateData.gatesPassed >= 5 && (
                <div className="text-center">
                  <Badge className={gateData.direction === 'bullish' ? 'bg-green-600' : 'bg-red-600'}>
                    {gateData.direction === 'bullish' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {gateData.direction.toUpperCase()}
                  </Badge>
                  <span className="text-slate-200 text-xs ml-2">@ ${gateData.currentPrice?.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface AIAnalysisData {
  success: boolean;
  explanation: string;
  summary: {
    trend: string;
    trendScore: number;
    signalType: string;
    gatesPassed: number;
    direction: string;
    signalStrength: string;
    institutionalBias: 'bullish' | 'bearish' | 'neutral';
    gateDetails: {
      emaStack: boolean;
      adxStrong: boolean;
      macdConfirmed: boolean;
      priceAbove50EMA: boolean;
      highVolume: boolean;
    };
    keyMetrics: {
      rsi: string;
      adx: string;
      rvol: string;
      riskReward: string;
    };
  };
}

const AIAnalysisPanel = ({ signal, audioEnabled }: { signal: SecretSauceSignal; audioEnabled: boolean }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, stop, isPlaying, isLoading: ttsLoading } = useTTS();

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/secret-sauce/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal })
      });
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data);
        setShowAnalysis(true);
      }
    } catch (error) {
      console.error('Failed to fetch AI analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExplanation = (text: string) => {
    const sections = text.split(/##\s+/).filter(Boolean);
    return sections.map((section, i) => {
      const [title, ...content] = section.split('\n');
      return (
        <div key={i} className="mb-4">
          <h3 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
            {title.includes('TREND') && <TrendingUp className="h-4 w-4" />}
            {title.includes('GATE') && <Target className="h-4 w-4" />}
            {title.includes('IMPULSE') && <Zap className="h-4 w-4" />}
            {title.includes('PRICE') && <DollarSign className="h-4 w-4" />}
            {title.includes('KEY LEVELS') && <BarChart3 className="h-4 w-4" />}
            {title.includes('BIAS') && <Brain className="h-4 w-4" />}
            {title.trim()}
          </h3>
          <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
            {content.map((line, j) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <p key={j} className="font-semibold text-white mt-2">{trimmed.replace(/\*\*/g, '')}</p>;
              }
              if (trimmed.startsWith('- ')) {
                return <p key={j} className="pl-3 text-slate-200">{trimmed}</p>;
              }
              if (trimmed.startsWith('✅') || trimmed.startsWith('❌')) {
                return <p key={j} className={trimmed.startsWith('✅') ? 'text-green-400' : 'text-red-400'}>{trimmed}</p>;
              }
              return <p key={j}>{trimmed.replace(/\*\*/g, '')}</p>;
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="max-w-2xl mx-auto">
        <SignalCard signal={signal} isTop={true} audioEnabled={audioEnabled} />
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating AI Analysis...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Get Complete AI Breakdown
            </>
          )}
        </Button>
      </div>

      {showAnalysis && aiAnalysis && (
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-orange-500/30">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-400">
              <Brain className="h-5 w-5" />
              AI-Powered Institutional Analysis
            </CardTitle>
            <CardDescription>
              Complete breakdown using Smart Money Concepts and Supply/Demand methodology
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className={`p-3 rounded-lg border ${
                aiAnalysis.summary.trend.includes('Bullish') 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : aiAnalysis.summary.trend.includes('Bearish')
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="text-xs text-slate-200 mb-1">Trend</div>
                <div className={`font-bold text-sm ${
                  aiAnalysis.summary.trend.includes('Bullish') ? 'text-green-400' 
                  : aiAnalysis.summary.trend.includes('Bearish') ? 'text-red-400' 
                  : 'text-yellow-400'
                }`}>
                  {aiAnalysis.summary.trend}
                </div>
                <div className="text-[10px] text-slate-300 mt-1">
                  Score: {aiAnalysis.summary.trendScore}/100
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                aiAnalysis.summary.gatesPassed >= 4 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : aiAnalysis.summary.gatesPassed >= 3
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="text-xs text-slate-200 mb-1">Gates Passed</div>
                <div className={`font-bold ${
                  aiAnalysis.summary.gatesPassed >= 4 ? 'text-green-400' 
                  : aiAnalysis.summary.gatesPassed >= 3 ? 'text-amber-400' 
                  : 'text-red-400'
                }`}>
                  {aiAnalysis.summary.gatesPassed}/5
                </div>
                <div className="text-[10px] text-slate-300">Confluence</div>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                aiAnalysis.summary.institutionalBias === 'bullish' 
                  ? 'bg-green-500/10 border-green-500/30'
                  : aiAnalysis.summary.institutionalBias === 'bearish'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-700/50 border-slate-600'
              }`}>
                <div className="text-xs text-slate-200 mb-1">Smart Money</div>
                <div className={`font-bold text-sm capitalize ${
                  aiAnalysis.summary.institutionalBias === 'bullish' ? 'text-green-400' :
                  aiAnalysis.summary.institutionalBias === 'bearish' ? 'text-red-400' : 'text-slate-200'
                }`}>
                  {aiAnalysis.summary.institutionalBias}
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="text-xs text-slate-200 mb-1">Signal Strength</div>
                <div className="font-bold text-orange-400">{aiAnalysis.summary.signalStrength}/10</div>
                <div className="text-[10px] text-slate-300">Quality</div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              <div className={`p-2 rounded text-center ${aiAnalysis.summary.gateDetails.emaStack ? 'bg-green-500/20' : 'bg-slate-800/50'}`}>
                <div className={`text-xs ${aiAnalysis.summary.gateDetails.emaStack ? 'text-green-400' : 'text-slate-300'}`}>
                  {aiAnalysis.summary.gateDetails.emaStack ? '✅' : '❌'} EMA
                </div>
              </div>
              <div className={`p-2 rounded text-center ${aiAnalysis.summary.gateDetails.adxStrong ? 'bg-green-500/20' : 'bg-slate-800/50'}`}>
                <div className={`text-xs ${aiAnalysis.summary.gateDetails.adxStrong ? 'text-green-400' : 'text-slate-300'}`}>
                  {aiAnalysis.summary.gateDetails.adxStrong ? '✅' : '❌'} ADX
                </div>
              </div>
              <div className={`p-2 rounded text-center ${aiAnalysis.summary.gateDetails.macdConfirmed ? 'bg-green-500/20' : 'bg-slate-800/50'}`}>
                <div className={`text-xs ${aiAnalysis.summary.gateDetails.macdConfirmed ? 'text-green-400' : 'text-slate-300'}`}>
                  {aiAnalysis.summary.gateDetails.macdConfirmed ? '✅' : '❌'} MACD
                </div>
              </div>
              <div className={`p-2 rounded text-center ${aiAnalysis.summary.gateDetails.priceAbove50EMA ? 'bg-green-500/20' : 'bg-slate-800/50'}`}>
                <div className={`text-xs ${aiAnalysis.summary.gateDetails.priceAbove50EMA ? 'text-green-400' : 'text-slate-300'}`}>
                  {aiAnalysis.summary.gateDetails.priceAbove50EMA ? '✅' : '❌'} 50EMA
                </div>
              </div>
              <div className={`p-2 rounded text-center ${aiAnalysis.summary.gateDetails.highVolume ? 'bg-green-500/20' : 'bg-slate-800/50'}`}>
                <div className={`text-xs ${aiAnalysis.summary.gateDetails.highVolume ? 'text-green-400' : 'text-slate-300'}`}>
                  {aiAnalysis.summary.gateDetails.highVolume ? '✅' : '❌'} RVOL
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-6 text-center">
              <div className="p-2 rounded bg-slate-800/50">
                <div className="text-[10px] text-slate-300">RSI</div>
                <div className={`text-sm font-mono ${parseFloat(aiAnalysis.summary.keyMetrics.rsi) < 30 ? 'text-green-400' : parseFloat(aiAnalysis.summary.keyMetrics.rsi) > 70 ? 'text-red-400' : 'text-white'}`}>
                  {aiAnalysis.summary.keyMetrics.rsi}
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/50">
                <div className="text-[10px] text-slate-300">ADX</div>
                <div className={`text-sm font-mono ${parseFloat(aiAnalysis.summary.keyMetrics.adx) > 25 ? 'text-green-400' : 'text-slate-200'}`}>
                  {aiAnalysis.summary.keyMetrics.adx}
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/50">
                <div className="text-[10px] text-slate-300">RVOL</div>
                <div className={`text-sm font-mono ${parseFloat(aiAnalysis.summary.keyMetrics.rvol) > 1.5 ? 'text-green-400' : 'text-slate-200'}`}>
                  {aiAnalysis.summary.keyMetrics.rvol}x
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/50">
                <div className="text-[10px] text-slate-300">R:R</div>
                <div className="text-sm font-mono text-amber-400">{aiAnalysis.summary.keyMetrics.riskReward}:1</div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-400" />
                  Complete Analysis Breakdown
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => isPlaying ? stop() : speak(aiAnalysis.explanation)}
                  disabled={ttsLoading}
                  className="h-7 w-7 p-0 text-orange-400 hover:text-orange-300"
                  title={isPlaying ? "Stop reading" : "AI Read Analysis"}
                >
                  {ttsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </h4>
              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {formatExplanation(aiAnalysis.explanation)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SignalCard = ({ signal, isTop, audioEnabled }: { signal: SecretSauceSignal; isTop?: boolean; audioEnabled: boolean }) => {
  const lastTriggerRef = useRef<string>('');
  const isActive = signal.signalType !== 'NO_SIGNAL';
  const isLong = signal.signalType.includes('LONG');
  
  useEffect(() => {
    const triggerId = `${signal.symbol}-${signal.signalType}-${signal.timestamp}`;
    if (isActive && signal.audioTrigger && audioEnabled && triggerId !== lastTriggerRef.current) {
      playAlarmSound(signal.audioTrigger);
      lastTriggerRef.current = triggerId;
    }
  }, [signal, isActive, audioEnabled]);
  
  const cardClass = isTop && isActive
    ? 'bg-gradient-to-br from-orange-900/30 to-amber-900/20 border-2 border-orange-500/50 animate-pulse'
    : isActive
    ? `border-2 ${isLong ? 'bg-emerald-900/20 border-emerald-500/40' : 'bg-red-900/20 border-red-500/40'}`
    : 'bg-slate-900 border-slate-700';
  
  return (
    <Card className={cardClass}>
      {isTop && isActive && (
        <div className="absolute top-0 left-0 right-0">
          <Badge className="w-full justify-center rounded-b-none bg-gradient-to-r from-orange-600 to-amber-600 text-white">
            <Flame className="h-3 w-3 mr-1" /> STRONGEST SIGNAL
          </Badge>
        </div>
      )}
      <CardContent className={`p-4 ${isTop && isActive ? 'pt-8' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-white">{signal.displayName}</h3>
            <p className="text-xs text-slate-200">{signal.symbol} · {signal.timeframe}</p>
          </div>
          <SignalTypeBadge signalType={signal.signalType} />
        </div>
        
        <SetupTypeBadge signalType={signal.signalType} />
        
        <TrendMeter 
          direction={signal.fiveGates.direction} 
          strength={signal.signalStrength} 
          gates={signal.fiveGates} 
        />
        
        <FiveGatesDisplay gates={signal.fiveGates} />
        
        {isActive && (
          <>
            <div className="grid grid-cols-3 gap-2 text-xs my-3">
              <div className="bg-slate-800 rounded p-2 text-center">
                <p className="text-slate-300">Entry</p>
                <p className="text-white font-mono">${signal.entryPrice.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 rounded p-2 text-center">
                <p className="text-slate-300">Target 1</p>
                <p className="text-green-400 font-mono">${signal.target1.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 rounded p-2 text-center">
                <p className="text-slate-300">Stop</p>
                <p className="text-red-400 font-mono">${signal.stopLoss.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-slate-200">Signal Strength</span>
              <span className={`font-bold ${signal.signalStrength >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {signal.signalStrength.toFixed(1)}/10
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-slate-200">Risk/Reward</span>
              <span className="text-amber-400 font-bold">{signal.riskRewardRatio.toFixed(2)}:1</span>
            </div>
          </>
        )}
        
        <div className="space-y-1 mt-3">
          {signal.reasoning.slice(0, 4).map((r, i) => (
            <p key={i} className="text-[10px] text-slate-200">• {r}</p>
          ))}
        </div>
        
        {signal.predictive && (
          <div className="mt-3">
            <PredictiveIndicator data={signal.predictive} compact={true} />
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
          <div className="text-center">
            <p className="text-slate-300">RSI</p>
            <p className={`font-mono ${signal.indicators.rsi < 30 ? 'text-green-400' : signal.indicators.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
              {signal.indicators.rsi.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300">ADX</p>
            <p className={`font-mono ${signal.indicators.adx > 25 ? 'text-green-400' : 'text-slate-200'}`}>
              {signal.indicators.adx.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300">MACD</p>
            <p className={`font-mono ${signal.fiveGates.details.macdCrossover === 'bullish' ? 'text-green-400' : signal.fiveGates.details.macdCrossover === 'bearish' ? 'text-red-400' : 'text-slate-200'}`}>
              {signal.fiveGates.details.macdCrossover === 'none' ? '—' : signal.fiveGates.details.macdCrossover === 'bullish' ? '↑' : '↓'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300">RVOL</p>
            <p className={`font-mono ${signal.indicators.rvol > 1.5 ? 'text-green-400' : 'text-slate-200'}`}>
              {signal.indicators.rvol.toFixed(1)}x
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const trainingModules = [
  {
    id: 1,
    title: 'Understanding Smart Money Concepts (SMC)',
    duration: '15 min',
    description: 'Learn the foundation of institutional trading patterns',
    content: {
      intro: 'Smart Money Concepts (SMC) is a trading methodology based on how institutional traders (banks, hedge funds) move the market.',
      objectives: ['Understand what "Smart Money" represents', 'Learn why institutions create liquidity traps', 'Identify retail vs institutional trading'],
      steps: [
        { step: 1, title: 'What is Smart Money?', detail: 'Smart Money refers to institutional traders who have the capital to move markets.' },
        { step: 2, title: 'Liquidity Concepts', detail: 'Institutions hunt for liquidity at swing highs/lows where retail traders place stop losses.' },
        { step: 3, title: 'Market Structure', detail: 'Price moves in waves: Impulse → Correction → Continuation. This is the ICC pattern.' },
        { step: 4, title: 'Order Blocks', detail: 'Order blocks are zones where institutions placed significant orders.' }
      ]
    }
  },
  {
    id: 2,
    title: 'The ICC Method (Indication, Correction, Continuation)',
    duration: '20 min',
    description: 'Master the core pattern of institutional price movement',
    content: {
      intro: 'The ICC Method is the backbone of the Secret Sauce strategy.',
      objectives: ['Identify the Indication candle (displacement)', 'Recognize the Correction phase', 'Time entries on Continuation'],
      steps: [
        { step: 1, title: 'Indication (Displacement)', detail: 'Look for aggressive candle with large body (3x average). This shows institutional commitment.' },
        { step: 2, title: 'Fair Value Gap (FVG)', detail: 'FVG = Gap between Candle 1 high and Candle 3 low (bullish) or vice versa (bearish).' },
        { step: 3, title: 'Correction Phase', detail: 'After displacement, price corrects slowly back toward the FVG.' },
        { step: 4, title: 'Continuation Entry', detail: 'When price retraces into FVG and shows rejection, enter with 5-Gate confirmation.' }
      ]
    }
  },
  {
    id: 3,
    title: 'Secret-Fill Logic for Precision Entries',
    duration: '15 min',
    description: 'Use candlestick wicks to find institutional entry zones',
    content: {
      intro: 'Wicks represent rejection and unfilled orders. Target areas where wicks are "unfilled."',
      objectives: ['Identify significant wicks', 'Calculate fvg-fill zone', 'Combine with ICC'],
      steps: [
        { step: 1, title: 'Significant Wicks', detail: 'Wicks >= 50% of total candle range show aggressive rejection.' },
        { step: 2, title: 'Secret-Fill Zone', detail: 'Bullish = wick low to candle body low. Bearish = wick high to body high.' },
        { step: 3, title: 'Entry Trigger', detail: 'Enter when price returns to zone AND shows reversal candle.' },
        { step: 4, title: 'Stop Placement', detail: 'Stop just beyond wick extreme (invalidation point).' }
      ]
    }
  },
  {
    id: 4,
    title: 'Opening Range Breakout (ORB)',
    duration: '15 min',
    description: 'Capitalize on the first 15 minutes of market action',
    content: {
      intro: 'The Opening Range captures the battle between overnight orders and new participants.',
      objectives: ['Define opening range', 'Identify valid breakouts', 'Combine with 5-Gate'],
      steps: [
        { step: 1, title: 'Mark Range', detail: '9:30-9:45 AM ET: identify HIGH and LOW of all candles.' },
        { step: 2, title: 'Wait for Breakout', detail: 'Wait for candle to CLOSE above high (bullish) or below low (bearish).' },
        { step: 3, title: 'Confirm with 5-Gate', detail: 'Verify 4/5 gates aligned before entry.' },
        { step: 4, title: 'Entry and Targets', detail: 'Stop = opposite range side. Target 1 = 1x range. Target 2 = 2x range.' }
      ]
    }
  }
];

export default function SecretSauceStrategy() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [timeframe, setTimeframe] = useState('5m');
  const [category, setCategory] = useState('all');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeModule, setActiveModule] = useState(1);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  
  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ['/api/secret-sauce/categories']
  });
  
  const { data: scanData, isLoading: isScanning, refetch: refetchScan } = useQuery<ScanResponse>({
    queryKey: ['/api/secret-sauce/scan', timeframe, category],
    queryFn: async () => {
      const res = await fetch(`/api/secret-sauce/scan?timeframe=${timeframe}&category=${category}`);
      if (!res.ok) throw new Error('Scan failed');
      return res.json();
    },
    refetchInterval: 10000
  });
  
  const analyzeQuery = useQuery<SecretSauceSignal>({
    queryKey: [`/api/secret-sauce/analyze/${searchSymbol.toUpperCase()}?timeframe=${timeframe}`],
    enabled: false
  });
  
  const { data: examplesData } = useQuery<{ examples: any[]; exitRules: string[] }>({
    queryKey: ['/api/secret-sauce/examples']
  });
  
  const handleAnalyze = () => {
    if (searchSymbol.trim()) {
      analyzeQuery.refetch();
    }
  };
  
  const activeSignals = scanData?.allSignals?.filter(s => s.signalType !== 'NO_SIGNAL') || [];
  const topSignal = activeSignals[0];

  // Trend Strength query for top signal or searched symbol
  const trendSymbol = searchSymbol.trim() || topSignal?.symbol || 'SPY';
  const { data: trendStrengthData } = useQuery<TrendStrengthResponse>({
    queryKey: ['/api/secret-sauce/trend-strength', trendSymbol, timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/secret-sauce/trend-strength/${trendSymbol}?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch trend strength');
      return res.json();
    },
    refetchInterval: 15000,
    enabled: !!trendSymbol
  });
  
  const toggleComplete = (moduleId: number) => {
    setCompletedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };
  
  const currentModule = trainingModules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <IntermarketBanner />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Secret Sauce Strategy Scanner
                </h1>
                <p className="text-xs sm:text-sm text-slate-200">ICC + Secret-Fill + ORB + 5-Gate Confluence</p>
              </div>
            </div>
            <WalkthroughGuide steps={MODULE_GUIDES['secret-sauce']} title="Guide" accentColor="orange" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
              <Label className="text-slate-200 flex items-center gap-1">
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Audio
              </Label>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-orange-600">
              <Activity className="h-4 w-4 mr-2" /> Scanner
            </TabsTrigger>
            <TabsTrigger value="analyze" className="data-[state=active]:bg-orange-600">
              <Search className="h-4 w-4 mr-2" /> Analyze Stock
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-orange-600">
              <BookOpen className="h-4 w-4 mr-2" /> Examples
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-orange-600">
              <Brain className="h-4 w-4 mr-2" /> Training
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner" className="space-y-4">
            {trendSymbol && <StrongTrendPanel symbol={trendSymbol} showReasons={true} />}
            <Card className="bg-gradient-to-r from-slate-900/80 via-slate-800/50 to-slate-900/80 border-slate-700/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  Strategy Guide - How Signals Are Generated
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-bold text-blue-300">ICC (Indication-Correction-Continuation)</span>
                    </div>
                    <p className="text-[10px] text-slate-200 leading-relaxed">
                      Detects aggressive institutional moves (3x body candles), waits for price to retrace into Fair Value Gap, 
                      then enters on continuation. Best for trend-following after displacement.
                    </p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-xs font-bold text-purple-300">Secret-Fill (Wick Rejection Zones)</span>
                    </div>
                    <p className="text-[10px] text-slate-200 leading-relaxed">
                      Identifies candles with significant wicks (50%+ of range). These wicks show rejection and unfilled orders. 
                      When price returns to the wick zone, institutions often defend it.
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-bold text-amber-300">ORB (Opening Range Breakout)</span>
                    </div>
                    <p className="text-[10px] text-slate-200 leading-relaxed">
                      Marks the first 15 minutes high/low after market open. When price breaks and holds outside this range 
                      with volume, it signals institutional direction for the day.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-[10px] text-slate-300 text-center">
                    All signals require <span className="text-emerald-400 font-medium">4+ of 5 gates</span> passing: 
                    EMA Stack (8/18/50) + ADX &gt;25 + MACD Crossover + Price vs 50 EMA + Relative Volume &gt;1.5x
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trend Strength Engine - Top Strongest Trending Assets */}
            <Card className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 border-cyan-500/30 overflow-hidden">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    Trend Strength Engine
                    <Badge className="bg-cyan-600 text-white ml-2">
                      TOP MOVERS
                    </Badge>
                  </CardTitle>
                  <span className="text-xs text-slate-300">{timeframe} timeframe</span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  Assets ranked by trend momentum: ADX strength + directional movement + volume confirmation
                </p>
              </CardHeader>
              <CardContent className="pb-4">
                {scanData?.allSignals && scanData.allSignals.length > 0 ? (
                  <div className="space-y-3">
                    {scanData.allSignals
                      .filter(s => s.signalType !== 'NO_SIGNAL' || s.signalStrength > 3)
                      .sort((a, b) => {
                        const scoreA = (a.signalStrength || 0) + (a.indicators?.adx || 0) / 10 + (a.confluenceScore || 0);
                        const scoreB = (b.signalStrength || 0) + (b.indicators?.adx || 0) / 10 + (b.confluenceScore || 0);
                        return scoreB - scoreA;
                      })
                      .slice(0, 8)
                      .map((signal, idx) => {
                        const isBullish = signal.fiveGates?.direction === 'bullish' || signal.signalType?.includes('LONG');
                        const isBearish = signal.fiveGates?.direction === 'bearish' || signal.signalType?.includes('SHORT');
                        const trendScore = Math.round((signal.signalStrength || 0) * 10 + (signal.indicators?.adx || 0));
                        const momentum = isBullish ? trendScore : isBearish ? -trendScore : 0;
                        
                        return (
                          <div 
                            key={signal.symbol}
                            className={`p-3 rounded-lg border transition-all ${
                              idx === 0 ? 'bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border-cyan-500/50' :
                              'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                                  idx === 0 ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-white">{signal.displayName || signal.symbol}</span>
                                {signal.signalType !== 'NO_SIGNAL' && (
                                  <Badge className={`text-[10px] ${
                                    signal.signalType?.includes('LONG') ? 'bg-green-600' : 
                                    signal.signalType?.includes('SHORT') ? 'bg-red-600' : 'bg-slate-600'
                                  }`}>
                                    {signal.signalType?.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-slate-200'}`}>
                                  {isBullish ? '+' : ''}{momentum}
                                </span>
                                {isBullish && <TrendingUp className="h-4 w-4 text-green-400" />}
                                {isBearish && <TrendingDown className="h-4 w-4 text-red-400" />}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 mb-2">
                              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    isBullish ? 'bg-gradient-to-r from-green-600 to-green-400' :
                                    isBearish ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                    'bg-gradient-to-r from-slate-600 to-slate-400'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.abs(momentum))}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                              <div>
                                <div className="text-slate-300">ADX</div>
                                <div className={`font-semibold ${(signal.indicators?.adx || 0) > 25 ? 'text-green-400' : 'text-slate-200'}`}>
                                  {signal.indicators?.adx?.toFixed(0) || '-'}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-300">RSI</div>
                                <div className={`font-semibold ${
                                  (signal.indicators?.rsi || 50) < 30 ? 'text-green-400' :
                                  (signal.indicators?.rsi || 50) > 70 ? 'text-red-400' : 'text-slate-200'
                                }`}>
                                  {signal.indicators?.rsi?.toFixed(0) || '-'}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-300">RVOL</div>
                                <div className={`font-semibold ${(signal.indicators?.rvol || 0) > 1.5 ? 'text-green-400' : 'text-slate-200'}`}>
                                  {signal.indicators?.rvol?.toFixed(1) || '-'}x
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-300">Gates</div>
                                <div className={`font-semibold ${(signal.confluenceScore || 0) >= 4 ? 'text-green-400' : 'text-amber-400'}`}>
                                  {signal.confluenceScore || 0}/5
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-300">Strength</div>
                                <div className="font-semibold text-cyan-400">
                                  {signal.signalStrength?.toFixed(1) || '-'}/10
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-200">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Scanning markets for trending assets...</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Single Asset Trend Strength Bar */}
            {trendStrengthData?.trendStrength && (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader className="pb-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-200">Detailed View:</span>
                    <Badge variant="outline">{trendSymbol}</Badge>
                    {trendStrengthData.trendStrength.sweepDetected && (
                      <Badge className={trendStrengthData.trendStrength.sweepType === 'bullish' ? 'bg-green-600' : 'bg-red-600'}>
                        <Zap className="h-3 w-3 mr-1" />
                        SWEEP
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <TrendStrengthBar data={trendStrengthData.trendStrength} showDetails={true} />
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">1 Minute</SelectItem>
                  <SelectItem value="5m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">5 Minutes</SelectItem>
                  <SelectItem value="15m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">15 Minutes</SelectItem>
                  <SelectItem value="30m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">30 Minutes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">All Markets</SelectItem>
                  <SelectItem value="hfc_watchlist" className="text-orange-400 hover:bg-slate-700 focus:bg-slate-700 focus:text-orange-300">HFC Liquidity Hunter</SelectItem>
                  <SelectItem value="stocks" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Stocks & ETFs</SelectItem>
                  <SelectItem value="crypto" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Cryptocurrencies</SelectItem>
                  <SelectItem value="forex_major" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Major Forex</SelectItem>
                  <SelectItem value="forex_cross" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Cross Forex</SelectItem>
                  <SelectItem value="indices" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Indices</SelectItem>
                  <SelectItem value="commodities" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Commodities</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => refetchScan()} disabled={isScanning} className="bg-orange-600 hover:bg-orange-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan Now'}
              </Button>
            </div>

            {scanData && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-white">{scanData.summary.totalScanned}</p>
                    <p className="text-xs text-slate-200">Scanned</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-900/30 border-orange-500/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-orange-400">{scanData.summary.activeSignals}</p>
                    <p className="text-xs text-slate-200">Active</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-900/30 border-emerald-500/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{scanData.summary.longSignals}</p>
                    <p className="text-xs text-slate-200">Long</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-900/30 border-red-500/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-red-400">{scanData.summary.shortSignals}</p>
                    <p className="text-xs text-slate-200">Short</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-900/30 border-blue-500/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{scanData.summary.iccSignals}</p>
                    <p className="text-xs text-slate-200">ICC</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-900/30 border-purple-500/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-purple-400">{scanData.summary.fvgFillSignals}</p>
                    <p className="text-xs text-slate-200">Wick Fill</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-900/30 border-amber-500/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-amber-400">{scanData.summary.orbSignals}</p>
                    <p className="text-xs text-slate-200">ORB</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {scanData?.allSignals?.map((signal, i) => (
                <SignalCard 
                  key={signal.symbol} 
                  signal={signal} 
                  isTop={i === 0 && signal.signalType !== 'NO_SIGNAL'}
                  audioEnabled={audioEnabled}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-orange-400" />
                  Analyze Individual Asset
                </CardTitle>
                <CardDescription>Enter a symbol to get detailed Secret Sauce analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter symbol (e.g., AAPL, BTC-USD, EURUSD)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">1 Min</SelectItem>
                      <SelectItem value="5m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">5 Min</SelectItem>
                      <SelectItem value="15m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">15 Min</SelectItem>
                      <SelectItem value="30m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">30 Min</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAnalyze} disabled={analyzeQuery.isFetching} className="bg-orange-600 hover:bg-orange-700">
                    {analyzeQuery.isFetching ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {analyzeQuery.data && (
              <AIAnalysisPanel signal={analyzeQuery.data} audioEnabled={audioEnabled} />
            )}
            
            {/* Signal Fusion AI */}
            {searchSymbol && (
              <SignalFusionAnalysis symbol={searchSymbol} assetType="stock" compact />
            )}

            {/* 7-Gate Liquidity & S/D System for Analyzed Asset */}
            {searchSymbol && (
              <SevenGatePanelSecretSauce symbol={searchSymbol} timeframe={timeframe} category={category} />
            )}
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examplesData?.examples?.map((example, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{example.name}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-orange-400 mb-2">Entry Criteria:</h4>
                      <ul className="space-y-1">
                        {example.criteria?.map((c: string, j: number) => (
                          <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-300">Entry</p>
                        <p className="text-white">{example.entry}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-300">Stop</p>
                        <p className="text-red-400">{example.stop}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-300">Target 1</p>
                        <p className="text-green-400">{example.target1}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-300">Target 2</p>
                        <p className="text-green-400">{example.target2}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-red-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Exit Rules (Mismatch System)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {examplesData?.exitRules?.map((rule, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-200">Training Progress</span>
                <span className="text-orange-400 font-bold">{completedModules.length}/{trainingModules.length} modules</span>
              </div>
              <Progress value={(completedModules.length / trainingModules.length) * 100} className="h-3 bg-slate-800" />
            </div>
            
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card className="bg-slate-900/50 border-slate-700 sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-400" /> Modules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trainingModules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => setActiveModule(module.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          activeModule === module.id 
                            ? 'bg-orange-600/20 border border-orange-500/50' 
                            : 'bg-slate-800/50 border border-transparent hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 ${completedModules.includes(module.id) ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {completedModules.includes(module.id) ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${activeModule === module.id ? 'text-orange-300' : 'text-white'}`}>
                              {module.id}. {module.title}
                            </p>
                            <p className="text-xs text-slate-300">{module.duration}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                {currentModule && (
                  <Card className="bg-slate-900/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-xl text-white">Module {currentModule.id}: {currentModule.title}</CardTitle>
                      <CardDescription>{currentModule.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-slate-300">{currentModule.content.intro}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Target className="h-5 w-5 text-orange-400" /> Learning Objectives
                        </h3>
                        <ul className="space-y-1">
                          {currentModule.content.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Accordion type="single" collapsible className="space-y-2">
                        {currentModule.content.steps.map((step) => (
                          <AccordionItem key={step.step} value={`step-${step.step}`} className="border border-slate-700 rounded-lg bg-slate-800/30 px-4">
                            <AccordionTrigger className="hover:no-underline py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-orange-600/20 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold text-sm">
                                  {step.step}
                                </div>
                                <span className="text-white font-medium text-sm">{step.title}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 text-slate-300 text-sm pl-10">
                              {step.detail}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                        <Button
                          variant="outline"
                          onClick={() => setActiveModule(Math.max(1, activeModule - 1))}
                          disabled={activeModule === 1}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => toggleComplete(currentModule.id)}
                          className={completedModules.includes(currentModule.id) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}
                        >
                          {completedModules.includes(currentModule.id) ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Completed</> : <><Play className="h-4 w-4 mr-2" /> Mark Complete</>}
                        </Button>
                        <Button
                          onClick={() => setActiveModule(Math.min(trainingModules.length, activeModule + 1))}
                          disabled={activeModule === trainingModules.length}
                          className="bg-slate-700 hover:bg-slate-600"
                        >
                          Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
