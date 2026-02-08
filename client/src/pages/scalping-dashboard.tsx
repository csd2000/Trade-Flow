import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PredictiveIndicator, PredictiveChip, type PredictiveData } from '@/components/shared/predictive-indicator';
import { 
  Zap, TrendingUp, TrendingDown, Clock, Target, AlertTriangle,
  Activity, BarChart3, RefreshCw, Search, Timer, ArrowUpRight, ArrowDownRight,
  Volume2, VolumeX, Link2, Play, ExternalLink, Filter, Flame, DollarSign,
  CheckCircle2, XCircle, Globe, Layers, ShoppingCart, Radio
} from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLivePrices } from '@/hooks/use-live-prices';
import OrderConfirmationModal from '@/components/order-confirmation-modal';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import StrongTrendPanel from '@/components/StrongTrendPanel';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

interface ConfluenceTechnicalIndicators {
  ema8: number;
  ema9: number;
  ema18: number;
  ema21: number;
  ema50: number;
  ema200: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  prevMacdHistogram: number;
  prevMacd: number;
  prevMacdSignal: number;
  macdCrossover: 'bullish' | 'bearish' | 'none';
  adx: number;
  rsi: number;
  atr: number;
  rvol: number;
  candleColor: 'green' | 'red';
  goldenCross: boolean;
  priceAbove200EMA: boolean;
  priceAbove50EMA: boolean;
}

interface MacroContext {
  dxyTrend: 'bullish' | 'bearish' | 'neutral';
  dxyValue: number;
  rvol: number;
  newsSentiment: number;
  orderFlow: 'positive' | 'negative' | 'neutral';
  fearGreedIndex: number;
}

interface ConfluenceSignal {
  symbol: string;
  displayName: string;
  assetClass: string;
  timeframe: string;
  signalType: 'ENTRY' | 'EXIT' | 'HOLD';
  confluenceScore: number;
  maxScore: number;
  indicators: ConfluenceTechnicalIndicators;
  macro: MacroContext;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: number;
  reasoning: string[];
  timestamp: string;
  audioTrigger: 'entry' | 'exit' | null;
}

interface ConfluenceScanResult {
  assetClass: string;
  timeframe: string;
  timestamp: string;
  totalScanned: number;
  signals: ConfluenceSignal[];
  entrySignals: ConfluenceSignal[];
  exitSignals: ConfluenceSignal[];
  activePositions: any[];
  macro: MacroContext;
}

const CONFLUENCE_AUDIO_FREQUENCIES = {
  entry: [523.25, 659.25, 783.99],
  exit: [392.00, 329.63, 261.63]
};

interface ScalpingSignal {
  asset: string;
  signal: 'STRONG BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG SELL';
  uiCommand: 'ACTION_FLASH_BUY' | 'ACTION_FLASH_SELL' | 'ACTION_WAIT' | 'ACTION_CLOSE_NOW';
  signalStrength: number;
  confidence: number;
  timing: string;
  entryPrice: number;
  exitTarget: number;
  exitTarget2: number;
  stopLoss: number;
  reasoning: string[];
  indicators: {
    rsi9: number;
    ema9: number;
    ema20: number;
    ema21?: number;
    atr: number;
    atrTrending: boolean;
    stochK: number;
    stochD: number;
    volumeDelta: number;
  };
  sentiment: {
    score: number;
    classification: string;
    fearGreedIndex: number;
  };
  conditionsMet: {
    momentum: boolean;
    structure: boolean;
    volatility: boolean;
    sentiment: boolean;
    total: number;
  };
  tripleThrust: {
    emaCross: boolean;
    stochastic: boolean;
    atrTrending: boolean;
    passed: boolean;
  };
  pivotPoints?: {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  gsrData?: {
    currentRatio: number;
    fiveDayMean: number;
    deviation: number;
    deviationPercent: number;
    signal: 'BUY_SILVER' | 'BUY_GOLD' | 'NEUTRAL';
    reasoning: string;
  };
  isPreciousMetal?: boolean;
  stochRsi?: number;
  trendStrength?: {
    score: number;
    isBullish: boolean;
    slope: number;
    expanding: boolean;
    bars: number;
    dominantFactor?: string;
    components?: { direction: number; momentum: number; volatility: number; confirmation: number };
  };
  timeframe: '1m' | '5m' | '15m' | '30m';
  timestamp: string;
  expiresAt: string;
  lifespan: number;
  predictive?: PredictiveData;
}

interface ScanResponse {
  timestamp: string;
  timeframe: string;
  category: string;
  dataSource: string;
  summary: {
    totalScanned: number;
    activeSignals: number;
    buySignals: number;
    sellSignals: number;
  };
  topSignals: ScalpingSignal[];
  allSignals: (ScalpingSignal & { displayName?: string })[];
}

interface AssetCategory {
  id: string;
  name: string;
  symbolCount: number;
  symbols: { symbol: string; displayName: string }[];
}

interface CategoriesResponse {
  categories: AssetCategory[];
  totalAssets: number;
  displayNames: Record<string, string>;
}

const CATEGORY_ICONS: Record<string, string> = {
  all: '🌐',
  forex_major: '💱',
  forex_cross: '💹',
  forex_exotic: '🌍',
  indices: '📊',
  crypto: '₿',
  commodities: '🥇',
  stocks: '📈'
};

const playAlarmSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (startTime: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.8, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    };
    
    const now = audioContext.currentTime;
    playBeep(now, 1200);
    playBeep(now + 0.2, 1500);
    playBeep(now + 0.4, 1200);
    playBeep(now + 0.6, 1500);
    playBeep(now + 0.8, 1800);
    
  } catch (e) {
    console.log('Audio not available');
  }
};

const SignalBadge = ({ signal, isFlashing }: { signal: ScalpingSignal['signal']; isFlashing: boolean }) => {
  const config = {
    'STRONG BUY': { color: 'bg-green-600 text-white', icon: ArrowUpRight },
    'BUY': { color: 'bg-green-500 text-white', icon: TrendingUp },
    'WAIT': { color: 'bg-gray-500 text-white', icon: Clock },
    'SELL': { color: 'bg-red-500 text-white', icon: TrendingDown },
    'STRONG SELL': { color: 'bg-red-600 text-white', icon: ArrowDownRight }
  };
  
  const { color, icon: Icon } = config[signal];
  const flashClass = isFlashing ? 'animate-pulse shadow-lg shadow-current' : '';
  
  return (
    <Badge className={`${color} ${flashClass} flex items-center gap-1 px-3 py-1`} data-testid={`signal-badge-${signal.toLowerCase().replace(' ', '-')}`}>
      <Icon className="h-3 w-3" />
      {signal}
    </Badge>
  );
};

const TripleThrustIndicator = ({ thrust }: { thrust: ScalpingSignal['tripleThrust'] }) => (
  <div className="grid grid-cols-3 gap-1 mt-2">
    <div className={`text-center p-1 rounded text-xs ${thrust.emaCross ? 'bg-green-500/30 text-green-400' : 'bg-gray-700/30 text-gray-300'}`}>
      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${thrust.emaCross ? 'bg-green-500' : 'bg-gray-600'}`} />
      EMA Cross
    </div>
    <div className={`text-center p-1 rounded text-xs ${thrust.stochastic ? 'bg-green-500/30 text-green-400' : 'bg-gray-700/30 text-gray-300'}`}>
      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${thrust.stochastic ? 'bg-green-500' : 'bg-gray-600'}`} />
      Stochastic
    </div>
    <div className={`text-center p-1 rounded text-xs ${thrust.atrTrending ? 'bg-green-500/30 text-green-400' : 'bg-gray-700/30 text-gray-300'}`}>
      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${thrust.atrTrending ? 'bg-green-500' : 'bg-gray-600'}`} />
      ATR Trend
    </div>
  </div>
);

const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setSecondsLeft(diff);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  
  return (
    <div className={`text-xs font-mono ${secondsLeft < 60 ? 'text-red-400' : 'text-amber-400'}`}>
      <Clock className="h-3 w-3 inline mr-1" />
      {minutes}:{seconds.toString().padStart(2, '0')} remaining
    </div>
  );
};

const FACTOR_LABELS: Record<string, { label: string; color: string }> = {
  strong_direction: { label: 'Strong Direction', color: 'text-blue-400' },
  momentum_driven: { label: 'Momentum Driven', color: 'text-purple-400' },
  volatility_expansion: { label: 'Volatility Expansion', color: 'text-orange-400' },
  volume_confirmed: { label: 'Volume Confirmed', color: 'text-cyan-400' },
  balanced: { label: 'Balanced', color: 'text-slate-200' },
  insufficient_data: { label: 'Limited Data', color: 'text-slate-300' }
};

const TrendStrengthMeter = ({ trendStrength }: { trendStrength: ScalpingSignal['trendStrength'] }) => {
  if (!trendStrength) return null;
  
  const { score, isBullish, expanding, bars, dominantFactor, components } = trendStrength;
  const activeColor = isBullish ? 'bg-green-500' : 'bg-red-500';
  const inactiveColor = 'bg-slate-700';
  const isHighMomentum = score >= 75 && expanding;
  const isStrongTrend = score >= 60;
  const isConsolidation = score < 30;
  
  const factorInfo = FACTOR_LABELS[dominantFactor || 'balanced'] || FACTOR_LABELS.balanced;
  
  return (
    <div className={`rounded p-2 mt-2 ${isHighMomentum ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-500/50' : 'bg-slate-800/50'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-200 font-medium">TREND STRENGTH</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isHighMomentum ? 'text-green-400' : isConsolidation ? 'text-slate-300' : isBullish ? 'text-green-400' : 'text-red-400'}`}>
            {score}%
          </span>
          {isHighMomentum && (
            <Badge className="bg-green-600 text-white text-xs px-1 py-0 animate-pulse">
              HIGH MOMENTUM
            </Badge>
          )}
          {isStrongTrend && !isHighMomentum && (
            <Badge className="bg-blue-600 text-white text-xs px-1 py-0">
              TRENDING
            </Badge>
          )}
          {isConsolidation && (
            <Badge className="bg-slate-600 text-slate-300 text-xs px-1 py-0">
              CONSOLIDATION
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-sm transition-all ${
              i < bars ? activeColor : inactiveColor
            } ${isHighMomentum && i < bars ? 'shadow-sm shadow-green-500/50' : ''}`}
            data-testid={`trend-bar-${i}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-slate-300">Weak</span>
        <span className={`font-medium ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
          {isBullish ? '▲ BULLISH' : '▼ BEARISH'} {expanding && '↑'}
        </span>
        <span className="text-slate-300">Strong</span>
      </div>
      
      {components && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-300">Factor Breakdown</span>
            <span className={`text-xs font-medium ${factorInfo.color}`}>{factorInfo.label}</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.round(components.direction)}%` }} />
              </div>
              <span className="text-xs text-slate-300 mt-0.5 block">Dir</span>
            </div>
            <div className="text-center">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.round(components.momentum)}%` }} />
              </div>
              <span className="text-xs text-slate-300 mt-0.5 block">Mom</span>
            </div>
            <div className="text-center">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.round(components.volatility)}%` }} />
              </div>
              <span className="text-xs text-slate-300 mt-0.5 block">Vol</span>
            </div>
            <div className="text-center">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.round(components.confirmation)}%` }} />
              </div>
              <span className="text-xs text-slate-300 mt-0.5 block">Conf</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FlashingSignalCard = ({ signal, audioEnabled, onExecute, displayName, livePrice }: { signal: ScalpingSignal; audioEnabled: boolean; onExecute?: (signal: ScalpingSignal) => void; displayName?: string; livePrice?: { price: number; change: number; changePercent: number } }) => {
  const lastTimestampRef = useRef<string>('');
  const isFlashing = signal.uiCommand === 'ACTION_FLASH_BUY' || signal.uiCommand === 'ACTION_FLASH_SELL';
  const isBuy = signal.signal.includes('BUY');
  
  useEffect(() => {
    const signalKey = `${signal.timestamp}-${signal.uiCommand}`;
    if (isFlashing && (signal.signalStrength || 0) >= 8.5 && audioEnabled && signalKey !== lastTimestampRef.current) {
      playAlarmSound();
      lastTimestampRef.current = signalKey;
    }
  }, [isFlashing, signal.signalStrength, signal.timestamp, signal.uiCommand, audioEnabled]);
  
  const flashBgClass = isFlashing 
    ? isBuy 
      ? 'animate-pulse bg-gradient-to-r from-green-900/50 to-green-800/30 border-green-500' 
      : 'animate-pulse bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500'
    : 'bg-slate-900 border-slate-700';
  
  const riskReward = Math.abs(signal.exitTarget - signal.entryPrice) / Math.abs(signal.entryPrice - signal.stopLoss);
  
  return (
    <Card className={`${flashBgClass} border-2 hover:border-primary/50 transition-all relative overflow-hidden`} data-testid={`signal-card-${signal.asset}`}>
      {isFlashing && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${isBuy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {displayName || signal.asset}
              {isFlashing && <Zap className={`h-5 w-5 ${isBuy ? 'text-green-400' : 'text-red-400'} animate-pulse`} />}
            </h3>
            <p className="text-sm text-slate-200">{signal.timeframe} timeframe</p>
          </div>
          <SignalBadge signal={signal.signal} isFlashing={isFlashing} />
        </div>
        
        <div className={`rounded-lg p-3 mb-3 ${isFlashing ? 'bg-black/40 border border-primary/30' : 'bg-gradient-to-r from-slate-800 to-slate-700'}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-200 uppercase tracking-wide">
              {livePrice ? '🔴 LIVE PRICE' : 'Entry Price'}
            </span>
            {livePrice && <Radio className="h-3 w-3 text-green-400 animate-pulse" />}
          </div>
          <div className="flex items-end gap-2">
            <p className={`text-2xl font-bold font-mono ${livePrice ? (livePrice.change >= 0 ? 'text-green-400' : 'text-red-400') : (isBuy ? 'text-green-400' : 'text-red-400')}`}>
              ${(livePrice?.price || signal.entryPrice || 0).toFixed((livePrice?.price || signal.entryPrice || 0) < 10 ? 5 : 2)}
            </p>
            {livePrice && (
              <span className={`text-sm font-mono ${livePrice.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {livePrice.changePercent >= 0 ? '+' : ''}{livePrice.changePercent?.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className={`rounded p-2 ${isFlashing ? 'bg-black/30' : 'bg-slate-800'}`}>
            <p className="text-xs text-slate-200">Signal Strength</p>
            <p className={`text-lg font-bold ${(signal.signalStrength || 0) >= 8.5 ? 'text-green-400' : 'text-primary'}`}>
              {(signal.signalStrength || signal.confidence || 5).toFixed(1)}/10
            </p>
          </div>
          <div className={`rounded p-2 ${isFlashing ? 'bg-black/30' : 'bg-slate-800'}`}>
            <p className="text-xs text-slate-200">Risk/Reward</p>
            <p className="text-lg font-bold text-amber-400">{isNaN(riskReward) ? '1.50' : riskReward.toFixed(2)}:1</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-200">TP1 (1.5:1)</span>
            <span className="text-green-400 font-mono">${(signal.exitTarget || 0).toFixed((signal.exitTarget || 0) < 10 ? 5 : 2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-200">TP2 (2:1)</span>
            <span className="text-green-300 font-mono">${(signal.exitTarget2 || signal.exitTarget || 0).toFixed((signal.exitTarget2 || 0) < 10 ? 5 : 2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-200">Stop Loss</span>
            <span className="text-red-400 font-mono">${(signal.stopLoss || 0).toFixed((signal.stopLoss || 0) < 10 ? 5 : 2)}</span>
          </div>
        </div>
        
        {signal.tripleThrust && <TripleThrustIndicator thrust={signal.tripleThrust} />}
        
        <TrendStrengthMeter trendStrength={signal.trendStrength} />
        
        {signal.isPreciousMetal && signal.gsrData && (
          <div className="rounded p-2 mt-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-600/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 font-bold text-xs">🥇 GOLD-SILVER RATIO</span>
              <Badge className={`text-xs ${signal.gsrData.signal === 'NEUTRAL' ? 'bg-slate-600' : signal.gsrData.signal === 'BUY_SILVER' ? 'bg-blue-600' : 'bg-amber-600'}`}>
                {signal.gsrData.signal.replace('_', ' ')}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-200">GSR</p>
                <p className="text-amber-300 font-mono">{signal.gsrData.currentRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-200">5D Mean</p>
                <p className="text-white font-mono">{signal.gsrData.fiveDayMean.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-200">Deviation</p>
                <p className={`font-mono ${Math.abs(signal.gsrData.deviationPercent) > 2 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {signal.gsrData.deviationPercent > 0 ? '+' : ''}{signal.gsrData.deviationPercent.toFixed(2)}%
                </p>
              </div>
            </div>
            {signal.pivotPoints && (
              <div className="mt-2 pt-2 border-t border-amber-700/30">
                <p className="text-xs text-slate-200 mb-1">Pivot Points</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-red-400">S1: ${signal.pivotPoints.s1.toFixed(2)}</span>
                  <span className="text-amber-300">P: ${signal.pivotPoints.pivot.toFixed(2)}</span>
                  <span className="text-green-400">R1: ${signal.pivotPoints.r1.toFixed(2)}</span>
                </div>
              </div>
            )}
            {signal.stochRsi !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-200">StochRSI:</span>
                <span className={`text-xs font-mono ${signal.stochRsi >= 95 ? 'text-red-400 font-bold' : signal.stochRsi <= 5 ? 'text-green-400 font-bold' : 'text-white'}`}>
                  {signal.stochRsi.toFixed(1)} {signal.stochRsi >= 95 && '⚠️ EXHAUSTION'}
                </span>
              </div>
            )}
          </div>
        )}
        
        {signal.predictive && (
          <div className="mt-3">
            <PredictiveIndicator data={signal.predictive} compact={false} showDetails={true} />
          </div>
        )}
        
        <div className={`rounded p-2 mt-3 ${isFlashing ? 'bg-black/30' : 'bg-slate-800/50'}`}>
          <div className="flex justify-between items-center">
            <p className="text-sm text-amber-300">{signal.timing}</p>
            {signal.expiresAt && <CountdownTimer expiresAt={signal.expiresAt} />}
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          {signal.reasoning.slice(0, 4).map((reason, i) => (
            <p key={i} className="text-xs text-slate-300">• {reason}</p>
          ))}
        </div>
        
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <p className="text-slate-300">Stoch K</p>
            <p className={`font-mono ${(signal.indicators?.stochK || 50) < 20 ? 'text-green-400' : (signal.indicators?.stochK || 50) > 80 ? 'text-red-400' : 'text-white'}`}>
              {signal.indicators?.stochK?.toFixed(1) || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300">EMA 9/20</p>
            <p className={`font-mono ${(signal.indicators?.ema9 || 0) > (signal.indicators?.ema20 || signal.indicators?.ema21 || 0) ? 'text-green-400' : 'text-red-400'}`}>
              {(signal.indicators?.ema9 || 0) > (signal.indicators?.ema20 || signal.indicators?.ema21 || 0) ? '↑' : '↓'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300">ATR</p>
            <p className={`font-mono ${signal.indicators?.atrTrending ? 'text-green-400' : 'text-gray-200'}`}>
              {signal.indicators?.atrTrending ? '↑' : '→'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300">F&G</p>
            <p className={`font-mono ${(signal.sentiment?.fearGreedIndex || 50) < 30 ? 'text-red-400' : (signal.sentiment?.fearGreedIndex || 50) > 70 ? 'text-green-400' : 'text-amber-400'}`}>
              {signal.sentiment?.fearGreedIndex || 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700 flex gap-2">
          <Button 
            onClick={() => onExecute?.({...signal, signal: 'BUY'})}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
            data-testid={`buy-${signal.asset}`}
          >
            <Play className="h-4 w-4 mr-2" />
            Buy
          </Button>
          <Button 
            onClick={() => onExecute?.({...signal, signal: 'SELL'})}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
            data-testid={`sell-${signal.asset}`}
          >
            <Play className="h-4 w-4 mr-2" />
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ConfluenceSignalCard = ({ signal }: { signal: ConfluenceSignal }) => {
  const isEntry = signal.signalType === 'ENTRY';
  const isExit = signal.signalType === 'EXIT';
  
  return (
    <Card className={`border-2 ${
      isEntry ? 'bg-emerald-900/20 border-emerald-500/50' :
      isExit ? 'bg-red-900/20 border-red-500/50' :
      'bg-slate-900 border-slate-700'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{signal.displayName}</h3>
            <p className="text-xs text-slate-200">{signal.symbol}</p>
          </div>
          <Badge className={`${
            isEntry ? 'bg-emerald-600' :
            isExit ? 'bg-red-600' : 'bg-slate-600'
          }`}>
            {signal.signalType}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-200">Confluence Score</span>
            <span className={`font-bold ${
              signal.confluenceScore >= 4 ? 'text-emerald-400' :
              signal.confluenceScore >= 3 ? 'text-amber-400' : 'text-red-400'
            }`}>{signal.confluenceScore}/{signal.maxScore}</span>
          </div>
          <Progress value={(signal.confluenceScore / signal.maxScore) * 100} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="bg-slate-800 rounded p-2 text-center">
            <p className="text-slate-300">Entry</p>
            <p className="text-white font-mono">${signal.entryPrice?.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <p className="text-slate-300">Target</p>
            <p className="text-green-400 font-mono">${signal.targetPrice?.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <p className="text-slate-300">Stop</p>
            <p className="text-red-400 font-mono">${signal.stopLoss?.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-1 text-xs mb-3">
          <div className="flex flex-col items-center gap-0.5 p-1 bg-slate-800/50 rounded">
            {signal.indicators?.priceAbove50EMA ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
            <span className="text-[9px] text-slate-300">50EMA</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1 bg-slate-800/50 rounded">
            {signal.indicators?.ema8 > signal.indicators?.ema18 ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
            <span className="text-[9px] text-slate-300">8/18</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1 bg-slate-800/50 rounded">
            {signal.indicators?.adx > 25 ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
            <span className="text-[9px] text-slate-300">ADX</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1 bg-slate-800/50 rounded">
            {signal.indicators?.macdHistogram > 0 && signal.indicators?.macdHistogram > signal.indicators?.prevMacdHistogram ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
            <span className="text-[9px] text-slate-300">MACD</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1 bg-slate-800/50 rounded">
            {signal.indicators?.rvol > 2.0 ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
            <span className="text-[9px] text-slate-300">RVOL</span>
          </div>
        </div>
        
        {signal.indicators?.macdCrossover && signal.indicators.macdCrossover !== 'none' && (
          <div className={`mb-2 p-2 rounded text-xs font-bold text-center ${
            signal.indicators.macdCrossover === 'bullish' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50' :
            'bg-red-900/50 text-red-400 border border-red-500/50'
          }`}>
            {signal.indicators.macdCrossover === 'bullish' ? '📈 MACD BULLISH CROSSOVER' : '📉 MACD BEARISH CROSSOVER'}
          </div>
        )}
        
        <div className="space-y-1">
          {signal.reasoning?.slice(0, 5).map((r, i) => (
            <p key={i} className="text-[10px] text-slate-200">{r}</p>
          ))}
        </div>
        
        {(isEntry || isExit) && (
          <div className="mt-3">
            <Link href={`/trading-connections?execute=${signal.symbol}&side=${isEntry ? 'buy' : 'sell'}&entry=${signal.entryPrice}&target=${signal.targetPrice}&stop=${signal.stopLoss}`}>
              <Button 
                size="sm" 
                className={`w-full ${isEntry ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {isEntry ? 'Buy' : 'Sell'} {signal.symbol}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function ScalpingDashboard() {
  const [strategyMode, setStrategyMode] = useState<'scalping' | 'confluence'>('scalping');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '30m'>('5m');
  const [category, setCategory] = useState('all');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<ScalpingSignal | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const [confluenceAssetClass, setConfluenceAssetClass] = useState('hfscalp');
  const [confluenceTimeframe, setConfluenceTimeframe] = useState('5m');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAudioTrigger = useRef<string | null>(null);

  const handleExecuteSignal = (signal: ScalpingSignal) => {
    setSelectedSignal(signal);
    setIsOrderModalOpen(true);
  };
  
  const playConfluenceAudio = useCallback((type: 'entry' | 'exit') => {
    if (!audioEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const frequencies = CONFLUENCE_AUDIO_FREQUENCIES[type];
      const duration = type === 'entry' ? 0.25 : 0.3;
      const repeats = 3;
      
      for (let r = 0; r < repeats; r++) {
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = type === 'entry' ? 'square' : 'sawtooth';
          const startTime = ctx.currentTime + r * (frequencies.length * duration + 0.1) + i * duration;
          gain.gain.setValueAtTime(1.0, startTime);
          gain.gain.exponentialRampToValueAtTime(0.1, startTime + duration);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, [audioEnabled]);

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ['/api/scalping/categories']
  });
  
  const { data: confluenceResult, isLoading: confluenceLoading, refetch: refetchConfluence, isFetching: confluenceFetching } = useQuery<ConfluenceScanResult>({
    queryKey: ['/api/confluence/scan', confluenceAssetClass, confluenceTimeframe],
    queryFn: async () => {
      const res = await fetch(`/api/confluence/scan/${confluenceAssetClass}/${confluenceTimeframe}`);
      if (!res.ok) throw new Error('Confluence scan failed');
      return res.json();
    },
    enabled: strategyMode === 'confluence',
    refetchInterval: autoRefresh && strategyMode === 'confluence' ? 10000 : false,
  });

  const { data: confluenceAssetClasses } = useQuery<{ assetClasses: any[]; timeframes: string[] }>({
    queryKey: ['/api/confluence/asset-classes'],
    enabled: strategyMode === 'confluence',
  });
  
  useEffect(() => {
    if (confluenceResult?.signals && strategyMode === 'confluence') {
      const triggerSignal = confluenceResult.signals.find(s => s.audioTrigger);
      if (triggerSignal?.audioTrigger) {
        const triggerId = `${triggerSignal.symbol}-${triggerSignal.audioTrigger}-${triggerSignal.timestamp}`;
        if (lastAudioTrigger.current !== triggerId) {
          lastAudioTrigger.current = triggerId;
          playConfluenceAudio(triggerSignal.audioTrigger);
        }
      }
    }
  }, [confluenceResult, strategyMode, playConfluenceAudio]);
  
  const { data: scanData, isLoading: isScanning, refetch: refetchScan } = useQuery<ScanResponse>({
    queryKey: ['/api/scalping/scan', timeframe, category],
    queryFn: async () => {
      const res = await fetch(`/api/scalping/scan?timeframe=${timeframe}&category=${category}`);
      if (!res.ok) throw new Error('Scan failed');
      return res.json();
    },
    refetchInterval: 10000
  });
  
  const analyzeQuery = useQuery<{ fullData: ScalpingSignal }>({
    queryKey: [`/api/scalping/analyze/${searchSymbol.toUpperCase()}?timeframe=${timeframe}`],
    enabled: false
  });
  
  const handleAnalyze = () => {
    if (searchSymbol.trim()) {
      analyzeQuery.refetch();
    }
  };
  
  const flashSignals = scanData?.allSignals?.filter(s => 
    s.uiCommand === 'ACTION_FLASH_BUY' || s.uiCommand === 'ACTION_FLASH_SELL'
  ) || [];
  const activeSignals = scanData?.allSignals?.filter(s => s.signal !== 'WAIT') || [];
  const buySignals = scanData?.allSignals?.filter(s => s.signal === 'BUY' || s.signal === 'STRONG BUY') || [];
  const sellSignals = scanData?.allSignals?.filter(s => s.signal === 'SELL' || s.signal === 'STRONG SELL') || [];
  
  // Live prices from Finnhub (updates every 2 seconds)
  const allSymbols = scanData?.allSignals?.map(s => s.asset) || [];
  const { prices: livePrices, lastUpdate: livePriceUpdate, source: priceSource } = useLivePrices(allSymbols, 2000);
  
  return (
    <div className="min-h-screen bg-slate-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <IntermarketBanner />
        
        {/* Strategy Mode Selector */}
        <div className="flex items-center justify-center gap-2 bg-slate-900 rounded-xl p-2 border border-slate-700 flex-wrap">
          <Button
            variant={strategyMode === 'scalping' ? 'default' : 'ghost'}
            onClick={() => setStrategyMode('scalping')}
            className={`flex-1 sm:flex-none ${strategyMode === 'scalping' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'text-slate-200 hover:text-white hover:bg-slate-800'}`}
            data-testid="btn-strategy-scalping"
          >
            <Zap className="h-4 w-4 mr-2" />
            Scalping Strategy
          </Button>
          <Button
            variant={strategyMode === 'confluence' ? 'default' : 'ghost'}
            onClick={() => setStrategyMode('confluence')}
            className={`flex-1 sm:flex-none ${strategyMode === 'confluence' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'text-slate-200 hover:text-white hover:bg-slate-800'}`}
            data-testid="btn-strategy-confluence"
          >
            <Layers className="h-4 w-4 mr-2" />
            Confluence Strategy
          </Button>
          <Link href="/hfc-apex">
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none text-slate-200 hover:text-white hover:bg-slate-800 border border-purple-500/50"
              data-testid="btn-strategy-apex"
            >
              <Target className="h-4 w-4 mr-2 text-purple-400" />
              HFC Apex Scanner
            </Button>
          </Link>
          <Link href="/scanner">
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none text-slate-200 hover:text-white hover:bg-slate-800 border border-cyan-500/50"
              data-testid="btn-strategy-engine"
            >
              <Activity className="h-4 w-4 mr-2 text-cyan-400" />
              5:1 Scanner
            </Button>
          </Link>
        </div>

        {/* Live Price Feed Indicator */}
        {Object.keys(livePrices).length > 0 && (
          <div className="flex items-center justify-between bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg px-4 py-2 border border-green-500/30">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="text-green-400 font-semibold text-sm">LIVE PRICES</span>
              <span className="text-slate-200 text-xs">• {priceSource}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-200">
              <span>{Object.keys(livePrices).length} assets streaming</span>
              {livePriceUpdate && (
                <span>Updated: {new Date(livePriceUpdate).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 sm:p-3 rounded-xl ${strategyMode === 'scalping' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
              {strategyMode === 'scalping' ? <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" /> : <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {strategyMode === 'scalping' ? 'HF Scalping Strategist' : 'HF Confluence Scanner'}
                </h1>
                <Link href="/trading-connections">
                  <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-900/30">
                    <Link2 className="w-4 h-4 mr-1" /> Trading
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
                {strategyMode === 'scalping' ? 'Triple-Thrust Flash Signals • EMA + Stochastic + ATR' : 'EMA 9/21/200 + MACD + Candle Color + Macro Confluence'}
              </p>
            </div>
          </div>
          
          {/* Controls - Conditional based on strategy */}
          {strategyMode === 'scalping' ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger 
                  className="w-[140px] sm:w-[180px] bg-slate-800 border-slate-600 text-white text-xs sm:text-sm"
                  data-testid="select-category"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-400" />
                  <SelectValue placeholder="All Assets" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">
                    {CATEGORY_ICONS['all']} All Assets ({categoriesData?.totalAssets || 55})
                  </SelectItem>
                  {categoriesData?.categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-slate-700">
                      {CATEGORY_ICONS[cat.id] || '📊'} {cat.name} ({cat.symbolCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant={audioEnabled ? 'default' : 'outline'}
                size="default"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`${audioEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-slate-500 text-slate-300 hover:bg-slate-700'} px-2 sm:px-4 py-2 text-xs sm:text-sm`}
                data-testid="btn-audio-toggle"
              >
                {audioEnabled ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="hidden sm:inline ml-2">{audioEnabled ? 'Sound ON' : 'Sound OFF'}</span>
              </Button>
              
              <div className="flex bg-slate-800 rounded-xl p-1 sm:p-1.5 border border-slate-600">
                {['1m', '5m', '15m', '30m'].map((tf) => (
                  <Button 
                    key={tf}
                    variant={timeframe === tf ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeframe(tf as any)}
                    className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${timeframe === tf ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    data-testid={`btn-timeframe-${tf}`}
                  >
                    {tf.toUpperCase()}
                  </Button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchScan()}
                className="border-blue-500 text-blue-400 hover:bg-blue-900/30 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                data-testid="btn-refresh-scan"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <Select value={confluenceAssetClass} onValueChange={setConfluenceAssetClass}>
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-slate-800 border-slate-600 text-white text-xs sm:text-sm" data-testid="select-confluence-asset">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-emerald-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {confluenceAssetClasses?.assetClasses?.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id} className="text-white hover:bg-slate-700">{ac.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex bg-slate-800 rounded-xl p-1 sm:p-1.5 border border-slate-600">
                {['1m', '5m', '15m', '1h'].map((tf) => (
                  <Button 
                    key={tf}
                    variant={confluenceTimeframe === tf ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setConfluenceTimeframe(tf)}
                    className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${confluenceTimeframe === tf ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    data-testid={`btn-confluence-tf-${tf}`}
                  >
                    {tf.toUpperCase()}
                  </Button>
                ))}
              </div>
              
              <Button
                variant={audioEnabled ? 'default' : 'outline'}
                size="default"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`${audioEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-slate-500 text-slate-300 hover:bg-slate-700'} px-2 sm:px-4 py-2 text-xs sm:text-sm`}
                data-testid="btn-confluence-audio"
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-600">
                <Switch id="autoRefresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <Label htmlFor="autoRefresh" className="text-xs text-slate-200">Auto</Label>
              </div>
              
              <Button 
                onClick={() => refetchConfluence()}
                disabled={confluenceFetching}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm"
                data-testid="btn-confluence-scan"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${confluenceFetching ? 'animate-spin' : ''}`} />
                Scan
              </Button>
            </div>
          )}
        </div>
        
        {/* SCALPING MODE CONTENT */}
        {strategyMode === 'scalping' && (
          <>
            {flashSignals.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <span className="text-amber-400 font-bold text-sm sm:text-base">FLASH SIGNALS ACTIVE</span>
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {flashSignals.map(s => (
                    <Badge 
                      key={s.asset} 
                      className={`${s.signal.includes('BUY') ? 'bg-green-600' : 'bg-red-600'} text-white animate-pulse text-xs sm:text-sm`}
                    >
                      {s.asset}: {s.signal} ({s.signalStrength.toFixed(1)}/10)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Scanned</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{scanData?.summary?.totalScanned || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Flash Signals</p>
                  <p className="text-lg sm:text-2xl font-bold text-amber-400">{flashSignals.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Buy Signals</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-400">{buySignals.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Sell Signals</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-400">{sellSignals.length}</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 mb-4 w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="scanner" data-testid="tab-scanner" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Live </span>Scanner
            </TabsTrigger>
            <TabsTrigger value="analyze" data-testid="tab-analyze" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Active ({activeSignals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner">
            {isScanning ? (
              <div className="text-center py-8 sm:py-12">
                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-slate-200 text-sm sm:text-base">Scanning {scanData?.summary?.totalScanned || 17} assets...</p>
              </div>
            ) : (() => {
              const sortedSignals = scanData?.allSignals
                ?.slice()
                .sort((a, b) => (b.trendStrength?.score || 0) - (a.trendStrength?.score || 0)) || [];
              const topSignal = sortedSignals[0];
              const remainingSignals = sortedSignals.slice(1);
              
              return (
                <div className="space-y-4">
                  {topSignal && (
                    <div className="relative">
                      <div className="absolute -top-2 left-4 z-10 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        STRONGEST TREND
                      </div>
                      <div className="border-2 border-amber-500/50 rounded-lg p-1 bg-gradient-to-r from-amber-900/20 to-transparent">
                        <FlashingSignalCard key={topSignal.asset} signal={topSignal} audioEnabled={audioEnabled} onExecute={handleExecuteSignal} displayName={(topSignal as any).displayName} livePrice={livePrices[topSignal.asset]} />
                      </div>
                    </div>
                  )}
                  {remainingSignals.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {remainingSignals.map(signal => (
                        <FlashingSignalCard key={signal.asset} signal={signal} audioEnabled={audioEnabled} onExecute={handleExecuteSignal} displayName={(signal as any).displayName} livePrice={livePrices[signal.asset]} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </TabsContent>
          
          <TabsContent value="analyze">
            {searchSymbol && <SignalFusionAnalysis symbol={searchSymbol} assetType="stock" compact />}
            {searchSymbol && <StrongTrendPanel symbol={searchSymbol} showReasons={true} />}
            <Card className="bg-slate-900 border-slate-700 mb-4">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Input 
                    placeholder="Symbol (EURUSD, BTC-USD)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    className="bg-slate-800 border-slate-600 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    data-testid="input-symbol-search"
                  />
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzeQuery.isLoading}
                    data-testid="btn-analyze-symbol"
                    className="w-full sm:w-auto"
                  >
                    {analyzeQuery.isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 mt-2">
                  Forex: EURUSD, GBPUSD | Futures: GC=F, SI=F | Crypto: BTC-USD
                </p>
              </CardContent>
            </Card>
            
            {analyzeQuery.data?.fullData && (
              <FlashingSignalCard signal={analyzeQuery.data.fullData} audioEnabled={audioEnabled} onExecute={handleExecuteSignal} livePrice={livePrices[analyzeQuery.data.fullData.asset]} />
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {activeSignals.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-200 text-sm sm:text-base">No active signals - Triple-Thrust conditions not met</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-2">Waiting for EMA cross + Stochastic extreme + ATR trending</p>
              </div>
            ) : (() => {
              const sortedActive = activeSignals
                .slice()
                .sort((a, b) => (b.trendStrength?.score || 0) - (a.trendStrength?.score || 0));
              const topActive = sortedActive[0];
              const remainingActive = sortedActive.slice(1);
              
              return (
                <div className="space-y-4">
                  {topActive && (
                    <div className="relative">
                      <div className="absolute -top-2 left-4 z-10 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        STRONGEST TREND
                      </div>
                      <div className="border-2 border-amber-500/50 rounded-lg p-1 bg-gradient-to-r from-amber-900/20 to-transparent">
                        <FlashingSignalCard key={topActive.asset} signal={topActive} audioEnabled={audioEnabled} onExecute={handleExecuteSignal} displayName={(topActive as any).displayName} livePrice={livePrices[topActive.asset]} />
                      </div>
                    </div>
                  )}
                  {remainingActive.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {remainingActive.map(signal => (
                        <FlashingSignalCard key={signal.asset} signal={signal} audioEnabled={audioEnabled} onExecute={handleExecuteSignal} displayName={(signal as any).displayName} livePrice={livePrices[signal.asset]} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </TabsContent>
            </Tabs>
            
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-bold text-sm sm:text-base mb-2 flex items-center gap-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />
                Triple-Thrust Logic Gate
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="bg-slate-800/50 p-2 sm:p-3 rounded">
                  <p className="text-amber-400 font-bold text-xs sm:text-sm">Momentum</p>
                  <p className="text-slate-300 text-xs">9 EMA above/below 20 EMA</p>
                </div>
                <div className="bg-slate-800/50 p-2 sm:p-3 rounded">
                  <p className="text-amber-400 font-bold text-xs sm:text-sm">Oscillation</p>
                  <p className="text-slate-300 text-xs">Stochastic(5,3,3) &lt;20 or &gt;80</p>
                </div>
                <div className="bg-slate-800/50 p-2 sm:p-3 rounded">
                  <p className="text-amber-400 font-bold text-xs sm:text-sm">Volatility</p>
                  <p className="text-slate-300 text-xs">ATR(14) trending higher</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 mt-2 sm:mt-3">
                Flash signals trigger when Confluence Score &gt; 8.5/10 • Valid for 180 seconds
              </p>
            </div>
          </>
        )}

        {/* CONFLUENCE MODE CONTENT */}
        {strategyMode === 'confluence' && (
          <>
            {/* Flash Signals Banner for Entry Signals */}
            {confluenceResult?.entrySignals && confluenceResult.entrySignals.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/50 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm sm:text-base">ENTRY SIGNALS ACTIVE</span>
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {confluenceResult.entrySignals.map(s => (
                    <Badge 
                      key={s.symbol} 
                      className="bg-emerald-600 text-white animate-pulse text-xs sm:text-sm"
                    >
                      {s.displayName}: {s.confluenceScore}/{s.maxScore} Gates
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Exit Signals Banner */}
            {confluenceResult?.exitSignals && confluenceResult.exitSignals.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                  <span className="text-red-400 font-bold text-sm sm:text-base">EXIT SIGNALS - KILL SWITCH TRIGGERED</span>
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {confluenceResult.exitSignals.map(s => (
                    <Badge 
                      key={s.symbol} 
                      className="bg-red-600 text-white text-xs sm:text-sm"
                    >
                      {s.displayName}: EXIT
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Scanned</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{confluenceResult?.totalScanned || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Entry Signals</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-400">{confluenceResult?.entrySignals?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <p className="text-slate-200 text-xs sm:text-sm">Exit Signals</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-400">{confluenceResult?.exitSignals?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-2 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="h-3 w-3 text-orange-400" />
                    <p className="text-slate-200 text-xs sm:text-sm">Fear/Greed</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-orange-400">{confluenceResult?.macro?.fearGreedIndex || '--'}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Confluence Tabs - Same as Scalping */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 mb-4 w-full sm:w-auto flex overflow-x-auto">
                <TabsTrigger value="scanner" data-testid="tab-confluence-scanner" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Live </span>Scanner
                </TabsTrigger>
                <TabsTrigger value="analyze" data-testid="tab-confluence-analyze" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Analyze
                </TabsTrigger>
                <TabsTrigger value="active" data-testid="tab-confluence-active" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Active ({confluenceResult?.entrySignals?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="scanner">
                {confluenceLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-200 text-sm sm:text-base">Scanning {confluenceResult?.totalScanned || 5} assets...</p>
                  </div>
                ) : (() => {
                  const sortedSignals = confluenceResult?.signals
                    ?.slice()
                    .sort((a, b) => b.confluenceScore - a.confluenceScore) || [];
                  const topSignal = sortedSignals[0];
                  const remainingSignals = sortedSignals.slice(1);
                  
                  return (
                    <div className="space-y-4">
                      {topSignal && (
                        <div className="relative">
                          <div className="absolute -top-2 left-4 z-10 bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            HIGHEST CONFLUENCE
                          </div>
                          <div className="border-2 border-emerald-500/50 rounded-lg p-1 bg-gradient-to-r from-emerald-900/20 to-transparent">
                            <ConfluenceSignalCard signal={topSignal} />
                          </div>
                        </div>
                      )}
                      {remainingSignals.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {remainingSignals.map(signal => (
                            <ConfluenceSignalCard key={signal.symbol} signal={signal} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="analyze">
                <Card className="bg-slate-900 border-slate-700 mb-4">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Input 
                        placeholder="Symbol (AAPL, BTC-USD, EURUSD)"
                        value={searchSymbol}
                        onChange={(e) => setSearchSymbol(e.target.value)}
                        className="bg-slate-800 border-slate-600 flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        data-testid="input-confluence-symbol"
                      />
                      <Button 
                        onClick={handleAnalyze}
                        disabled={analyzeQuery.isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                        data-testid="btn-confluence-analyze"
                      >
                        {analyzeQuery.isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-300 mt-2">
                      Stocks: AAPL, TSLA, NVDA | Crypto: BTC-USD, ETH-USD | Forex: EURUSD, GBPUSD | Futures: GC=F, ES=F
                    </p>
                  </CardContent>
                </Card>
                
                {analyzeQuery.data?.fullData && (
                  <div className="border-2 border-emerald-500/30 rounded-lg p-1">
                    <ConfluenceSignalCard signal={analyzeQuery.data.fullData as any} />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="active">
                {!confluenceResult?.entrySignals?.length ? (
                  <div className="text-center py-8 sm:py-12">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-200 text-sm sm:text-base">No active entry signals - 5-Gate conditions not met</p>
                    <p className="text-slate-300 text-xs sm:text-sm mt-2">Waiting for all 5 gates to align with MACD crossover</p>
                  </div>
                ) : (() => {
                  const sortedActive = confluenceResult.entrySignals
                    .slice()
                    .sort((a, b) => b.confluenceScore - a.confluenceScore);
                  const topActive = sortedActive[0];
                  const remainingActive = sortedActive.slice(1);
                  
                  return (
                    <div className="space-y-4">
                      {topActive && (
                        <div className="relative">
                          <div className="absolute -top-2 left-4 z-10 bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            STRONGEST ENTRY
                          </div>
                          <div className="border-2 border-emerald-500/50 rounded-lg p-1 bg-gradient-to-r from-emerald-900/20 to-transparent">
                            <ConfluenceSignalCard signal={topActive} />
                          </div>
                        </div>
                      )}
                      {remainingActive.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {remainingActive.map(signal => (
                            <ConfluenceSignalCard key={signal.symbol} signal={signal} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>

            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                HFC 5-Gate System (Hedge Fund Edition)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                <div className="bg-slate-800/50 p-2 rounded text-center">
                  <p className="text-emerald-400 font-bold">Gate 1</p>
                  <p className="text-slate-300">Price &gt; 50 EMA</p>
                  <p className="text-slate-300 text-[9px]">Floor Trend</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded text-center">
                  <p className="text-emerald-400 font-bold">Gate 2</p>
                  <p className="text-slate-300">8 EMA &gt; 18 EMA</p>
                  <p className="text-slate-300 text-[9px]">Fast Cross</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded text-center">
                  <p className="text-emerald-400 font-bold">Gate 3</p>
                  <p className="text-slate-300">ADX(14) &gt; 25</p>
                  <p className="text-slate-300 text-[9px]">Trend Strength</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded text-center">
                  <p className="text-emerald-400 font-bold">Gate 4</p>
                  <p className="text-slate-300">MACD(8,21,5) Rising</p>
                  <p className="text-slate-300 text-[9px]">Momentum</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded text-center">
                  <p className="text-emerald-400 font-bold">Gate 5</p>
                  <p className="text-slate-300">RVOL &gt; 2.0</p>
                  <p className="text-slate-300 text-[9px]">Volume Participation</p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
                <p className="text-red-400 text-xs font-bold">Mismatch Kill Switch (Exit Rules)</p>
                <div className="grid grid-cols-3 gap-2 mt-1 text-[10px] text-slate-200">
                  <span>A: Red Candle</span>
                  <span>B: Momentum Fade</span>
                  <span>C: Price &lt; 8 EMA</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        signal={selectedSignal ? {
          asset: selectedSignal.asset,
          signal: selectedSignal.signal,
          entryPrice: selectedSignal.entryPrice,
          exitTarget: selectedSignal.exitTarget,
          exitTarget2: selectedSignal.exitTarget2,
          stopLoss: selectedSignal.stopLoss,
          confidence: selectedSignal.confidence
        } : null}
      />
    </div>
  );
}
