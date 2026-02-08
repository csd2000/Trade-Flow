import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PredictiveIndicator, PredictiveChip, type PredictiveData } from '@/components/shared/predictive-indicator';
import { 
  TrendingUp, TrendingDown, Activity, Brain, Search, RefreshCw,
  Target, AlertTriangle, BarChart3, Zap, Eye, ArrowUpRight, ArrowDownRight,
  Volume2, VolumeX, CheckCircle2, XCircle, Bell, Shield, ShoppingCart, Link2, Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';
import { useTTS } from '@/hooks/use-tts';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

const playAlarmSound = (type: 'reversal' | 'alert' = 'reversal') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'reversal') {
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1320, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.error('Audio error:', error);
  }
};

const sendReversalNotification = (title: string, body: string, type: 'bullish' | 'bearish') => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const icon = type === 'bullish' ? '📈' : '📉';
  new Notification(`${icon} ${title}`, {
    body,
    icon: '/favicon.ico',
    tag: `reversal-${Date.now()}`,
    requireInteraction: false
  });
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

interface DivergenceSignal {
  type: 'bullish' | 'bearish' | 'hidden_bullish' | 'hidden_bearish' | 'none';
  indicator: string;
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  confidence: number;
}

interface InstitutionalSignals {
  liquiditySweep: {
    detected: boolean;
    direction: 'bullish' | 'bearish' | 'none';
    sweepLevel: number;
    rejectionStrength: number;
  };
  fairValueGap: {
    detected: boolean;
    direction: 'bullish' | 'bearish' | 'none';
    gapSize: number;
    gapZone: { high: number; low: number };
  };
  orderBlock: {
    detected: boolean;
    type: 'accumulation' | 'distribution' | 'none';
    zone: { high: number; low: number };
    volumeConfirmation: boolean;
  };
  volumeDelta: {
    cvd: number;
    deltaZScore: number;
    absorption: boolean;
    exhaustion: boolean;
  };
  rvol: number;
}

interface SevenGateValidation {
  gate1_rsiExtreme: boolean;
  gate2_divergencePresent: boolean;
  gate3_macdCrossover: boolean;
  gate4_stochOversoldOverbought: boolean;
  gate5_volumeSpike: boolean;
  gate6_priceAtSupRes: boolean;
  gate7_sentimentExtreme: boolean;
  gate8_liquiditySweep: boolean;
  gate9_fvgPresent: boolean;
  gate10_orderBlockConfirm: boolean;
  gatesPassed: number;
  institutionalGatesPassed: number;
  isConfirmed: boolean;
  confidencePercent: number;
}

interface ReversalSignal {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent: number;
  reversalType: 'bullish_reversal' | 'bearish_reversal' | 'continuation' | 'neutral';
  reversalProbability: number;
  aiScore: number;
  technicalScore: number;
  sentimentScore: number;
  divergences: DivergenceSignal[];
  sevenGates?: SevenGateValidation;
  institutionalSignals?: InstitutionalSignals;
  audioTrigger?: 'reversal' | 'alert' | null;
  indicators: {
    rsi14: number;
    macd: number;
    stochK: number;
    stochD: number;
    atr14: number;
    volumeRatio?: number;
  };
  sentiment: {
    overallScore: number;
    fearGreedIndex: number;
    institutionalFlow: string;
  };
  aiAnalysis: string;
  hedgeFundInsight?: string;
  keyLevels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    pivotPoint: number;
  };
  tradeSetup: {
    direction: 'long' | 'short' | 'wait';
    entryZone: { low: number; high: number };
    stopLoss: number;
    target1: number;
    target2: number;
    riskRewardRatio: number;
  };
  timestamp: string;
  timeframe?: string;
  predictive?: PredictiveData;
}

interface ScanResult {
  timestamp: string;
  dataSource: string;
  assetClassScanned?: string;
  summary: {
    totalScanned: number;
    reversalsDetected: number;
    bullishReversals: number;
    bearishReversals: number;
    analyzed?: number;
    signaled?: number;
    throttled?: number;
    errors?: number;
    byAssetClass?: {
      stocks: number;
      crypto: number;
      forex: number;
      futures: number;
    };
  };
  topBullishReversals: ReversalSignal[];
  topBearishReversals: ReversalSignal[];
  allResults: (ReversalSignal & { assetClass?: string })[];
  byAssetClass?: {
    stocks: ReversalSignal[];
    crypto: ReversalSignal[];
    forex: ReversalSignal[];
    futures: ReversalSignal[];
  };
}

const SevenGatesDisplay = ({ gates }: { gates?: SevenGateValidation }) => {
  if (!gates) return null;
  
  const technicalGates = [
    { key: 'gate1_rsiExtreme', label: 'RSI', desc: '<30 or >70' },
    { key: 'gate2_divergencePresent', label: 'DIV', desc: 'Divergence' },
    { key: 'gate3_macdCrossover', label: 'MACD', desc: 'Crossover' },
    { key: 'gate4_stochOversoldOverbought', label: 'STOCH', desc: '<20 or >80' },
    { key: 'gate5_volumeSpike', label: 'VOL', desc: '>1.5x Avg' },
    { key: 'gate6_priceAtSupRes', label: 'S/R', desc: 'At Level' },
    { key: 'gate7_sentimentExtreme', label: 'SENT', desc: 'F&G <25/>75' }
  ];
  
  const institutionalGates = [
    { key: 'gate8_liquiditySweep', label: 'SWEEP', desc: 'Liquidity Hunt' },
    { key: 'gate9_fvgPresent', label: 'FVG', desc: 'Fair Value Gap' },
    { key: 'gate10_orderBlockConfirm', label: 'OB', desc: 'Order Block' }
  ];
  
  const confidencePercent = gates.confidencePercent || Math.round((gates.gatesPassed / 10) * 100);
  
  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-200 font-medium">HEDGE FUND 10-GATE VALIDATION</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${gates.isConfirmed ? 'bg-emerald-500/20 text-emerald-400' : confidencePercent >= 70 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
          {gates.gatesPassed}/10 ({confidencePercent}%) {gates.isConfirmed ? '✓ 90%+ CONFIRMED' : confidencePercent >= 70 ? 'HIGH PROB' : 'WAIT'}
        </span>
      </div>
      
      <div className="mb-2">
        <span className="text-[9px] text-slate-300 uppercase">Technical Gates (7)</span>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {technicalGates.map(({ key, label, desc }) => {
            const passed = gates[key as keyof SevenGateValidation] as boolean;
            return (
              <div key={key} className={`flex flex-col items-center p-1 rounded text-center ${passed ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-700/30 border border-slate-600'}`}>
                {passed ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                <span className={`text-[8px] font-medium ${passed ? 'text-emerald-300' : 'text-slate-300'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div>
        <span className="text-[9px] text-cyan-400 uppercase font-bold">Institutional Gates (3)</span>
        <div className="grid grid-cols-3 gap-1 mt-1">
          {institutionalGates.map(({ key, label, desc }) => {
            const passed = gates[key as keyof SevenGateValidation] as boolean;
            return (
              <div key={key} className={`flex flex-col items-center p-1.5 rounded text-center ${passed ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-slate-700/30 border border-slate-600'}`}>
                {passed ? <CheckCircle2 className="h-3 w-3 text-cyan-400" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                <span className={`text-[9px] font-medium ${passed ? 'text-cyan-300' : 'text-slate-300'}`}>{label}</span>
                <span className={`text-[7px] ${passed ? 'text-cyan-400/70' : 'text-slate-600'}`}>{desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function ReversalDetection() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('15m');
  const [assetClass, setAssetClass] = useState<'all' | 'stocks' | 'crypto' | 'forex' | 'futures'>('all');
  const [fullScan, setFullScan] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastAlertRef = useRef<string>('');
  const { speak, stop, isPlaying, isLoading: ttsLoading } = useTTS();

  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

  const { data: scanData, isLoading: scanLoading, refetch: refetchScan } = useQuery<ScanResult>({
    queryKey: ['/api/reversal/scan', timeframe, assetClass, fullScan],
    queryFn: async () => {
      const params = new URLSearchParams({ timeframe });
      if (fullScan || assetClass === 'all') {
        params.set('fullScan', 'true');
      } else {
        params.set('assetClass', assetClass);
      }
      const res = await fetch(`/api/reversal/scan?${params.toString()}`);
      if (!res.ok) throw new Error('Scan failed');
      return res.json();
    },
    refetchInterval: fullScan ? 60000 : 10000
  });
  
  useEffect(() => {
    if (!scanData?.allResults) return;
    
    const confirmedReversals = scanData.allResults.filter(
      r => r.sevenGates?.isConfirmed && r.reversalType.includes('reversal')
    );
    
    const highProbReversals = scanData.allResults.filter(
      r => {
        const gates = r.sevenGates?.gatesPassed || 0;
        return gates >= 7 && r.reversalType.includes('reversal');
      }
    );
    
    if (confirmedReversals.length > 0) {
      const alertId = confirmedReversals.map(r => `${r.symbol}-${r.timestamp}`).join(',');
      if (alertId !== lastAlertRef.current) {
        if (audioEnabled) playAlarmSound('reversal');
        if (notificationsEnabled) {
          confirmedReversals.forEach((signal, index) => {
            setTimeout(() => {
              const type = signal.reversalType.includes('bullish') ? 'bullish' : 'bearish';
              sendReversalNotification(
                `90%+ ${type.toUpperCase()} REVERSAL CONFIRMED`,
                `${signal.symbol}: ${signal.sevenGates?.gatesPassed}/10 gates passed - ${signal.reversalProbability}% probability`,
                type
              );
            }, index * 500);
          });
        }
        lastAlertRef.current = alertId;
      }
    } else if (highProbReversals.length > 0) {
      const alertId = 'highprob-' + highProbReversals.map(r => `${r.symbol}-${r.timestamp}`).join(',');
      if (alertId !== lastAlertRef.current) {
        if (audioEnabled) playAlarmSound('alert');
        if (notificationsEnabled) {
          highProbReversals.forEach((signal, index) => {
            setTimeout(() => {
              const type = signal.reversalType.includes('bullish') ? 'bullish' : 'bearish';
              sendReversalNotification(
                `High Probability ${type} Signal`,
                `${signal.symbol}: ${signal.sevenGates?.gatesPassed}/10 gates passed`,
                type
              );
            }, index * 500);
          });
        }
        lastAlertRef.current = alertId;
      }
    }
  }, [scanData, audioEnabled, notificationsEnabled]);
  
  const testSound = () => {
    playAlarmSound('reversal');
  };

  const testNotification = () => {
    sendReversalNotification('Test Reversal Alert', 'This is a test notification from Reversal Detection AI', 'bullish');
  };

  const { data: singleAnalysis, isLoading: analyzeLoading, refetch: refetchAnalysis } = useQuery<{ signal: ReversalSignal }>({
    queryKey: ['/api/reversal/analyze', selectedSymbol],
    queryFn: async () => {
      if (!selectedSymbol) throw new Error('No symbol');
      const res = await fetch(`/api/reversal/analyze/${selectedSymbol}`);
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    enabled: !!selectedSymbol
  });

  const handleAnalyze = () => {
    if (searchSymbol.trim()) {
      setSelectedSymbol(searchSymbol.trim().toUpperCase());
    }
  };

  const getReversalColor = (type: string) => {
    switch (type) {
      case 'bullish_reversal': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'bearish_reversal': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'continuation': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-200 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getDivergenceColor = (type: string) => {
    if (type.includes('bullish')) return 'text-green-400 bg-green-500/20';
    if (type.includes('bearish')) return 'text-red-400 bg-red-500/20';
    return 'text-gray-200 bg-gray-500/20';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-purple-400';
      case 'moderate': return 'text-yellow-400';
      default: return 'text-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(4)}`;
  };

  const getAssetClassStyle = (assetClass?: string) => {
    switch (assetClass) {
      case 'crypto': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'forex': return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'futures': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const ReversalCard = ({ signal }: { signal: ReversalSignal & { assetClass?: string } }) => (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all" data-testid={`card-reversal-${signal.symbol}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white" data-testid={`text-symbol-${signal.symbol}`}>{signal.symbol}</h3>
              {signal.assetClass && (
                <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${getAssetClassStyle(signal.assetClass)}`}>
                  {signal.assetClass.toUpperCase()}
                </Badge>
              )}
              <Badge className={getReversalColor(signal.reversalType)} data-testid={`badge-reversal-${signal.symbol}`}>
                {signal.reversalType.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-2xl font-semibold text-white mt-1" data-testid={`text-price-${signal.symbol}`}>
              {formatPrice(signal.currentPrice)}
            </p>
            <p className={`text-sm flex items-center gap-1 ${signal.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {signal.priceChangePercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {signal.priceChangePercent >= 0 ? '+' : ''}{signal.priceChangePercent.toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-200">Reversal Probability</div>
            <div className="text-3xl font-bold text-cyan-400" data-testid={`text-probability-${signal.symbol}`}>{signal.reversalProbability}%</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-slate-700/50 rounded p-2 text-center">
            <div className="text-xs text-gray-200">Technical</div>
            <div className="text-lg font-semibold text-blue-400">{signal.technicalScore.toFixed(0)}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2 text-center">
            <div className="text-xs text-gray-200">Sentiment</div>
            <div className="text-lg font-semibold text-purple-400">{signal.sentimentScore.toFixed(0)}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2 text-center">
            <div className="text-xs text-gray-200">AI Score</div>
            <div className="text-lg font-semibold text-cyan-400">{signal.aiScore}</div>
          </div>
        </div>

        {signal.divergences.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-200 mb-1">Divergences Detected:</div>
            <div className="flex flex-wrap gap-1">
              {signal.divergences.map((div, i) => (
                <Badge key={i} className={`${getDivergenceColor(div.type)} ${getStrengthColor(div.strength)}`}>
                  {div.type.replace('_', ' ')} ({div.strength})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-700/30 rounded p-2">
            <span className="text-gray-200">RSI: </span>
            <span className={signal.indicators.rsi14 < 30 ? 'text-green-400' : signal.indicators.rsi14 > 70 ? 'text-red-400' : 'text-white'}>
              {signal.indicators.rsi14.toFixed(1)}
            </span>
          </div>
          <div className="bg-slate-700/30 rounded p-2">
            <span className="text-gray-200">Fear/Greed: </span>
            <span className="text-white">{signal.sentiment.fearGreedIndex}</span>
          </div>
        </div>

        {signal.tradeSetup.direction !== 'wait' && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <Badge className={signal.tradeSetup.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {signal.tradeSetup.direction.toUpperCase()} Setup
              </Badge>
              <span className="text-sm text-gray-200">
                R/R: <span className="text-cyan-400">{signal.tradeSetup.riskRewardRatio.toFixed(2)}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div>
                <span className="text-gray-200">Entry:</span>
                <div className="text-white">{formatPrice(signal.tradeSetup.entryZone.low)} - {formatPrice(signal.tradeSetup.entryZone.high)}</div>
              </div>
              <div>
                <span className="text-gray-200">Stop:</span>
                <div className="text-red-400">{formatPrice(signal.tradeSetup.stopLoss)}</div>
              </div>
              <div>
                <span className="text-gray-200">Target:</span>
                <div className="text-green-400">{formatPrice(signal.tradeSetup.target1)}</div>
              </div>
            </div>
          </div>
        )}
        
        <SevenGatesDisplay gates={signal.sevenGates} />
        
        {signal.predictive && (
          <div className="mt-3">
            <PredictiveIndicator data={signal.predictive} compact={false} />
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-slate-600 hover:bg-slate-700"
            onClick={() => setSelectedSymbol(signal.symbol)}
            data-testid={`button-details-${signal.symbol}`}
          >
            <Eye className="w-4 h-4 mr-2" /> Analysis
          </Button>
          {signal.tradeSetup.direction !== 'wait' && (
            <Link href={`/trading-connections?execute=${signal.symbol}&side=${signal.tradeSetup.direction === 'long' ? 'buy' : 'sell'}&price=${signal.currentPrice}&stop=${signal.tradeSetup.stopLoss}&target=${signal.tradeSetup.target1}`}>
              <Button 
                size="sm" 
                className={signal.tradeSetup.direction === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                data-testid={`button-trade-${signal.symbol}`}
              >
                <ShoppingCart className="w-4 h-4 mr-1" /> Trade
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <IntermarketBanner />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                Reversal Detection AI
              </h1>
              <WalkthroughGuide steps={MODULE_GUIDES['reversal']} title="Guide" accentColor="cyan" />
              <Link href="/trading-connections">
                <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-900/30">
                  <Link2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Trading</span>
                </Button>
              </Link>
            </div>
            <p className="text-gray-200 mt-1">10-Gate Validation + Divergence + Sentiment + AI Scoring</p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={assetClass} onValueChange={(v) => { setAssetClass(v as any); setFullScan(false); }}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Asset Class" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">All Classes</SelectItem>
                <SelectItem value="stocks" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Stocks (60)</SelectItem>
                <SelectItem value="crypto" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Crypto (30)</SelectItem>
                <SelectItem value="forex" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Forex (20)</SelectItem>
                <SelectItem value="futures" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Futures (25)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="5m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">5 Min</SelectItem>
                <SelectItem value="15m" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">15 Min</SelectItem>
                <SelectItem value="1h" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">1 Hour</SelectItem>
                <SelectItem value="1d" className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">Daily</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => { setFullScan(true); setAssetClass('all'); }}
              variant={fullScan ? "default" : "outline"}
              className={fullScan ? "bg-cyan-600 hover:bg-cyan-700" : "border-cyan-500 text-cyan-400 hover:bg-cyan-900/30"}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-1" />
              Full Scan (135)
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md border border-slate-600">
              <button onClick={testSound} className="p-1 hover:bg-slate-700 rounded" title="Test sound">
                {audioEnabled ? <Volume2 className="h-4 w-4 text-green-400" /> : <VolumeX className="h-4 w-4 text-slate-300" />}
              </button>
              <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} className="scale-90" />
              <Label className="text-slate-200 text-xs">Sound</Label>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md border border-slate-600">
              <Bell className={`h-4 w-4 ${notificationsEnabled ? 'text-blue-400' : 'text-slate-300'}`} />
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} className="scale-90" />
              <Label className="text-slate-200 text-xs">Alerts</Label>
            </div>
            
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-40 bg-slate-800 border-slate-600 text-white"
              data-testid="input-symbol"
            />
            <Button onClick={handleAnalyze} disabled={analyzeLoading} className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-analyze">
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </Button>
            <Button onClick={() => refetchScan()} variant="outline" className="border-slate-600" data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 ${scanLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-cyan-900/20 via-slate-800/50 to-cyan-900/20 border-cyan-500/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              7-Gate Reversal Confirmation System - All Gates Must Pass for 100% Confirmed Reversals
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 1</div>
                <div className="text-xs text-white font-medium">RSI Extreme</div>
                <div className="text-[9px] text-slate-200">&lt;30 or &gt;70</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 2</div>
                <div className="text-xs text-white font-medium">Divergence</div>
                <div className="text-[9px] text-slate-200">RSI/MACD/Stoch</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 3</div>
                <div className="text-xs text-white font-medium">MACD Cross</div>
                <div className="text-[9px] text-slate-200">Signal Line</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 4</div>
                <div className="text-xs text-white font-medium">Stochastic</div>
                <div className="text-[9px] text-slate-200">&lt;20 or &gt;80</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 5</div>
                <div className="text-xs text-white font-medium">Volume Spike</div>
                <div className="text-[9px] text-slate-200">&gt;1.5x Average</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 6</div>
                <div className="text-xs text-white font-medium">Support/Resist</div>
                <div className="text-[9px] text-slate-200">At Key Level</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-center">
                <div className="text-[10px] text-cyan-400 font-semibold">GATE 7</div>
                <div className="text-xs text-white font-medium">Sentiment</div>
                <div className="text-[9px] text-slate-200">F&G &lt;25/&gt;75</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-200">
                <span className="text-emerald-400 font-medium">9-10/10 Gates (90%+) = CONFIRMED</span> | 
                <span className="text-amber-400 font-medium ml-2">7-8 Gates (70-80%) = HIGH PROB</span> |
                <span className="text-cyan-400 font-medium ml-2">+3 Institutional Gates</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {scanData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{scanData.summary.totalScanned}</div>
                  <div className="text-sm text-gray-200">Assets Scanned</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{scanData.summary.reversalsDetected}</div>
                  <div className="text-sm text-gray-200">Reversals Detected</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-green-400">{scanData.summary.bullishReversals}</div>
                  <div className="text-sm text-gray-200">Bullish Reversals</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="w-8 h-8 mx-auto text-red-400 mb-2" />
                  <div className="text-2xl font-bold text-red-400">{scanData.summary.bearishReversals}</div>
                  <div className="text-sm text-gray-200">Bearish Reversals</div>
                </CardContent>
              </Card>
            </div>
            
            {scanData.summary.byAssetClass && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="bg-slate-800/40 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">{scanData.summary.byAssetClass.stocks}</div>
                  <div className="text-[10px] text-slate-200 uppercase">Stocks</div>
                </div>
                <div className="bg-slate-800/40 border border-orange-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-400">{scanData.summary.byAssetClass.crypto}</div>
                  <div className="text-[10px] text-slate-200 uppercase">Crypto</div>
                </div>
                <div className="bg-slate-800/40 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{scanData.summary.byAssetClass.forex}</div>
                  <div className="text-[10px] text-slate-200 uppercase">Forex</div>
                </div>
                <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{scanData.summary.byAssetClass.futures}</div>
                  <div className="text-[10px] text-slate-200 uppercase">Futures</div>
                </div>
              </div>
            )}
          </>
        )}

        <Tabs defaultValue="scanner" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-cyan-600" data-testid="tab-scanner">
              <Target className="w-4 h-4 mr-2" /> Scanner
            </TabsTrigger>
            <TabsTrigger value="bullish" className="data-[state=active]:bg-green-600" data-testid="tab-bullish">
              <TrendingUp className="w-4 h-4 mr-2" /> Bullish
            </TabsTrigger>
            <TabsTrigger value="bearish" className="data-[state=active]:bg-red-600" data-testid="tab-bearish">
              <TrendingDown className="w-4 h-4 mr-2" /> Bearish
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600" data-testid="tab-analysis">
              <Brain className="w-4 h-4 mr-2" /> Deep Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            {scanLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                <p className="text-gray-200">
                  {fullScan 
                    ? 'Scanning all 135 assets across stocks, crypto, forex & futures...' 
                    : assetClass === 'all' 
                      ? 'Scanning top 10 stocks...' 
                      : `Scanning ${assetClass} markets for reversal patterns...`}
                </p>
              </div>
            ) : scanData?.allResults ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanData.allResults.map((signal) => (
                  <ReversalCard key={signal.symbol} signal={signal} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-200">No scan results available. Click refresh to start scanning.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bullish">
            {scanData?.topBullishReversals && scanData.topBullishReversals.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanData.topBullishReversals.map((signal) => (
                  <ReversalCard key={signal.symbol} signal={signal} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-12 h-12 text-green-400/30 mx-auto mb-4" />
                  <p className="text-gray-200">No bullish reversals detected in current scan.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bearish">
            {scanData?.topBearishReversals && scanData.topBearishReversals.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanData.topBearishReversals.map((signal) => (
                  <ReversalCard key={signal.symbol} signal={signal} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <TrendingDown className="w-12 h-12 text-red-400/30 mx-auto mb-4" />
                  <p className="text-gray-200">No bearish reversals detected in current scan.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {selectedSymbol && <SignalFusionAnalysis symbol={selectedSymbol} assetType="stock" compact />}
            
            {singleAnalysis?.signal ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                      AI Analysis: {singleAnalysis.signal.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200">Current Price:</span>
                      <span className="text-2xl font-bold text-white">{formatPrice(singleAnalysis.signal.currentPrice)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-200">Reversal Probability</span>
                        <span className="text-cyan-400 font-bold">{singleAnalysis.signal.reversalProbability}%</span>
                      </div>
                      <Progress value={singleAnalysis.signal.reversalProbability} className="h-2" />
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-200">AI Insight:</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => isPlaying ? stop() : speak(singleAnalysis.signal.aiAnalysis)}
                          disabled={ttsLoading}
                          className="h-7 w-7 p-0 text-gray-200 hover:text-white"
                          title={isPlaying ? "Stop reading" : "AI Read Analysis"}
                        >
                          {ttsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-white">{singleAnalysis.signal.aiAnalysis}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-700/30 rounded p-3">
                        <div className="text-xs text-gray-200">RSI (14)</div>
                        <div className={`text-xl font-bold ${singleAnalysis.signal.indicators.rsi14 < 30 ? 'text-green-400' : singleAnalysis.signal.indicators.rsi14 > 70 ? 'text-red-400' : 'text-white'}`}>
                          {singleAnalysis.signal.indicators.rsi14.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded p-3">
                        <div className="text-xs text-gray-200">MACD</div>
                        <div className={`text-xl font-bold ${singleAnalysis.signal.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {singleAnalysis.signal.indicators.macd.toFixed(3)}
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded p-3">
                        <div className="text-xs text-gray-200">Stochastic %K</div>
                        <div className="text-xl font-bold text-white">{singleAnalysis.signal.indicators.stochK.toFixed(1)}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded p-3">
                        <div className="text-xs text-gray-200">ATR (14)</div>
                        <div className="text-xl font-bold text-white">{singleAnalysis.signal.indicators.atr14.toFixed(2)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-6 h-6 text-cyan-400" />
                      Trade Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <Badge className={`text-lg px-4 py-2 ${getReversalColor(singleAnalysis.signal.reversalType)}`}>
                        {singleAnalysis.signal.reversalType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {singleAnalysis.signal.divergences.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-200 mb-2">Active Divergences:</h4>
                        {singleAnalysis.signal.divergences.map((div, i) => (
                          <div key={i} className="bg-slate-700/50 rounded p-3 mb-2">
                            <div className="flex justify-between items-center">
                              <Badge className={getDivergenceColor(div.type)}>{div.type.replace('_', ' ')}</Badge>
                              <span className={getStrengthColor(div.strength)}>{div.strength}</span>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{div.description}</p>
                            <div className="flex justify-between mt-2">
                              <span className="text-xs text-gray-200">Confidence:</span>
                              <span className="text-xs text-cyan-400">{div.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-slate-700 pt-4">
                      <h4 className="text-sm font-medium text-gray-200 mb-3">Key Price Levels:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-200">Resistance 2:</span>
                          <span className="text-red-400">{formatPrice(singleAnalysis.signal.keyLevels.resistance2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">Resistance 1:</span>
                          <span className="text-red-300">{formatPrice(singleAnalysis.signal.keyLevels.resistance1)}</span>
                        </div>
                        <div className="flex justify-between bg-slate-700/50 rounded p-2">
                          <span className="text-gray-200">Pivot Point:</span>
                          <span className="text-white font-bold">{formatPrice(singleAnalysis.signal.keyLevels.pivotPoint)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">Support 1:</span>
                          <span className="text-green-300">{formatPrice(singleAnalysis.signal.keyLevels.support1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">Support 2:</span>
                          <span className="text-green-400">{formatPrice(singleAnalysis.signal.keyLevels.support2)}</span>
                        </div>
                      </div>
                    </div>

                    {singleAnalysis.signal.tradeSetup.direction !== 'wait' && (
                      <div className="border-t border-slate-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-200 mb-3">Suggested Trade:</h4>
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <Badge className={singleAnalysis.signal.tradeSetup.direction === 'long' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                              {singleAnalysis.signal.tradeSetup.direction.toUpperCase()}
                            </Badge>
                            <span className="text-cyan-400">R/R: {singleAnalysis.signal.tradeSetup.riskRewardRatio.toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-200">Entry Zone:</span>
                              <div className="text-white">
                                {formatPrice(singleAnalysis.signal.tradeSetup.entryZone.low)} - {formatPrice(singleAnalysis.signal.tradeSetup.entryZone.high)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-200">Stop Loss:</span>
                              <div className="text-red-400">{formatPrice(singleAnalysis.signal.tradeSetup.stopLoss)}</div>
                            </div>
                            <div>
                              <span className="text-gray-200">Target 1:</span>
                              <div className="text-green-400">{formatPrice(singleAnalysis.signal.tradeSetup.target1)}</div>
                            </div>
                            <div>
                              <span className="text-gray-200">Target 2:</span>
                              <div className="text-green-300">{formatPrice(singleAnalysis.signal.tradeSetup.target2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Brain className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                  <p className="text-gray-200">Enter a symbol above and click Analyze for deep AI analysis.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-gray-300">
          Data Source: {scanData?.dataSource || 'Yahoo Finance + Alpha Vantage + AI Analysis'} | 
          Last Updated: {scanData?.timestamp ? new Date(scanData.timestamp).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}
