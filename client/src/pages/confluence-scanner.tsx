import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderConfirmationModal from '@/components/order-confirmation-modal';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Volume2,
  VolumeX,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  DollarSign,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShoppingCart
} from 'lucide-react';
import StrongTrendPanel from '@/components/StrongTrendPanel';

interface TechnicalIndicators {
  ema9: number;
  ema21: number;
  ema200: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  prevMacdHistogram: number;
  rsi: number;
  atr: number;
  candleColor: 'green' | 'red';
  goldenCross: boolean;
  priceAbove200EMA: boolean;
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
  indicators: TechnicalIndicators;
  macro: MacroContext;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: number;
  reasoning: string[];
  timestamp: string;
  audioTrigger: 'entry' | 'exit' | null;
}

interface ScanResult {
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

const AUDIO_FREQUENCIES = {
  entry: [523.25, 659.25, 783.99],
  exit: [392.00, 329.63, 261.63]
};

export default function ConfluenceScanner() {
  const [assetClass, setAssetClass] = useState('crypto');
  const [timeframe, setTimeframe] = useState('5m');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<ConfluenceSignal | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAudioTrigger = useRef<string | null>(null);
  
  const handleExecuteSignal = (signal: ConfluenceSignal) => {
    setSelectedSignal(signal);
    setIsOrderModalOpen(true);
  };

  const { data: scanResult, isLoading, refetch, isFetching } = useQuery<ScanResult>({
    queryKey: ['/api/confluence/scan', assetClass, timeframe],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: assetClasses } = useQuery<{ assetClasses: any[]; timeframes: string[] }>({
    queryKey: ['/api/confluence/asset-classes'],
  });

  const playAudioAlert = useCallback((type: 'entry' | 'exit') => {
    if (!audioEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const frequencies = AUDIO_FREQUENCIES[type];
      const duration = type === 'entry' ? 0.15 : 0.2;
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = freq;
        osc.type = type === 'entry' ? 'sine' : 'triangle';
        
        const startTime = ctx.currentTime + i * duration;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, [audioEnabled]);

  useEffect(() => {
    if (scanResult?.signals) {
      const triggerSignal = scanResult.signals.find(s => s.audioTrigger);
      if (triggerSignal?.audioTrigger) {
        const triggerId = `${triggerSignal.symbol}-${triggerSignal.audioTrigger}-${triggerSignal.timestamp}`;
        if (lastAudioTrigger.current !== triggerId) {
          lastAudioTrigger.current = triggerId;
          playAudioAlert(triggerSignal.audioTrigger);
        }
      }
    }
  }, [scanResult, playAudioAlert]);

  const getSignalColor = (signal: ConfluenceSignal) => {
    if (signal.signalType === 'ENTRY') return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
    if (signal.signalType === 'EXIT') return 'bg-red-500/20 border-red-500/50 text-red-400';
    return 'bg-slate-500/20 border-slate-500/50 text-slate-200';
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="h-8 w-8 text-amber-400" />
              HF Confluence Scanner
            </h1>
            <p className="text-slate-200 mt-1">
              EMA 9/21/200 + MACD + Candle Color + Macro Confluence
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="audio"
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
                data-testid="switch-audio"
              />
              <Label htmlFor="audio" className="flex items-center gap-1 text-sm">
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Audio Alerts
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="autoRefresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                data-testid="switch-autorefresh"
              />
              <Label htmlFor="autoRefresh" className="text-sm">Auto-Refresh (30s)</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200">Asset Class</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={assetClass} onValueChange={setAssetClass}>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-asset-class">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetClasses?.assetClasses?.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id}>{ac.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200">Timeframe</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Fear & Greed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400" data-testid="text-fear-greed">
                {scanResult?.macro?.fearGreedIndex || '--'}
              </div>
              <p className="text-xs text-slate-300">
                {scanResult?.macro?.fearGreedIndex
                  ? scanResult.macro.fearGreedIndex > 70 ? 'Extreme Greed'
                    : scanResult.macro.fearGreedIndex > 55 ? 'Greed'
                    : scanResult.macro.fearGreedIndex > 45 ? 'Neutral'
                    : scanResult.macro.fearGreedIndex > 30 ? 'Fear'
                    : 'Extreme Fear'
                  : 'Loading...'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                DXY Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" data-testid="text-dxy">
                  {scanResult?.macro?.dxyValue?.toFixed(2) || '--'}
                </span>
                {scanResult?.macro?.dxyTrend === 'bullish' && <ArrowUpRight className="h-5 w-5 text-green-400" />}
                {scanResult?.macro?.dxyTrend === 'bearish' && <ArrowDownRight className="h-5 w-5 text-red-400" />}
              </div>
              <p className="text-xs text-slate-300 capitalize">{scanResult?.macro?.dxyTrend || 'Loading...'}</p>
            </CardContent>
          </Card>
        </div>

        <StrongTrendPanel symbol="SPY" showReasons={true} />
        
        <div className="flex gap-4">
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-scan"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Scanning...' : 'Scan Now'}
          </Button>
          <Button
            variant="outline"
            onClick={() => playAudioAlert('entry')}
            className="border-slate-700"
            data-testid="button-test-entry"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Test Entry Sound
          </Button>
          <Button
            variant="outline"
            onClick={() => playAudioAlert('exit')}
            className="border-slate-700"
            data-testid="button-test-exit"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Test Exit Sound
          </Button>
        </div>

        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="signals" data-testid="tab-signals">
              All Signals ({scanResult?.signals?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="entry" data-testid="tab-entry">
              <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" />
              Entry ({scanResult?.entrySignals?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="exit" data-testid="tab-exit">
              <XCircle className="h-4 w-4 mr-1 text-red-400" />
              Exit ({scanResult?.exitSignals?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? (
                <Card className="bg-[#12121a] border-slate-800 col-span-2 p-8">
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
                    <span className="text-slate-200">Scanning {assetClass} assets...</span>
                  </div>
                </Card>
              ) : scanResult?.signals?.length === 0 ? (
                <Card className="bg-[#12121a] border-slate-800 col-span-2 p-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-200">No signals found. Try a different timeframe or asset class.</p>
                </Card>
              ) : (
                scanResult?.signals?.map((signal, idx) => (
                  <SignalCard key={`${signal.symbol}-${idx}`} signal={signal} getScoreColor={getScoreColor} getSignalColor={getSignalColor} onExecute={handleExecuteSignal} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="entry" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scanResult?.entrySignals?.map((signal, idx) => (
                <SignalCard key={`${signal.symbol}-${idx}`} signal={signal} getScoreColor={getScoreColor} getSignalColor={getSignalColor} onExecute={handleExecuteSignal} />
              ))}
              {!scanResult?.entrySignals?.length && (
                <Card className="bg-[#12121a] border-slate-800 col-span-2 p-8 text-center">
                  <p className="text-slate-200">No entry signals at this time.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exit" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scanResult?.exitSignals?.map((signal, idx) => (
                <SignalCard key={`${signal.symbol}-${idx}`} signal={signal} getScoreColor={getScoreColor} getSignalColor={getSignalColor} onExecute={handleExecuteSignal} />
              ))}
              {!scanResult?.exitSignals?.length && (
                <Card className="bg-[#12121a] border-slate-800 col-span-2 p-8 text-center">
                  <p className="text-slate-200">No exit signals at this time.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="bg-[#12121a] border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              Confluence Entry Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-amber-400 mb-2">1. Long-Term Trend</h4>
                <p className="text-slate-200">Price must be above the 200 EMA for bullish confirmation</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-amber-400 mb-2">2. Momentum Shift</h4>
                <p className="text-slate-200">9 EMA crosses above 21 EMA (Golden Cross)</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-amber-400 mb-2">3. Visual Agreement</h4>
                <p className="text-slate-200">Candle is Green AND MACD Histogram &gt; 0 and increasing</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-amber-400 mb-2">4. Macro Context</h4>
                <p className="text-slate-200">
                  Forex: DXY bearish | Stocks: RVOL &gt; 2.0 | Crypto: Order Flow positive
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Dynamic Exit Rule ("Mismatch Logic")
              </h4>
              <p className="text-slate-200">
                Exit when: <span className="text-red-400">Candle turns Red</span> OR{' '}
                <span className="text-red-400">MACD Histogram decreases</span> from previous bar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        signal={selectedSignal ? {
          asset: selectedSignal.symbol,
          signal: selectedSignal.signalType === 'ENTRY' ? 'BUY' : 'SELL',
          entryPrice: selectedSignal.entryPrice,
          exitTarget: selectedSignal.targetPrice,
          stopLoss: selectedSignal.stopLoss,
          confidence: selectedSignal.confluenceScore / selectedSignal.maxScore
        } : null}
      />
    </div>
  );
}

function SignalCard({
  signal,
  getScoreColor,
  getSignalColor,
  onExecute
}: {
  signal: ConfluenceSignal;
  getScoreColor: (score: number, max: number) => string;
  getSignalColor: (signal: ConfluenceSignal) => string;
  onExecute?: (signal: ConfluenceSignal) => void;
}) {
  const isEntry = signal.signalType === 'ENTRY';
  const isExit = signal.signalType === 'EXIT';
  return (
    <Card className={`bg-[#12121a] border ${getSignalColor(signal)}`} data-testid={`card-signal-${signal.symbol}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{signal.displayName}</CardTitle>
            <Badge variant="outline" className="text-xs">{signal.symbol}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={
                signal.signalType === 'ENTRY'
                  ? 'bg-emerald-500 text-white'
                  : signal.signalType === 'EXIT'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-500 text-white'
              }
            >
              {signal.signalType}
            </Badge>
            {signal.audioTrigger && (
              <Volume2 className="h-4 w-4 text-amber-400 animate-pulse" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-200">Confluence Score</span>
          <span className={`text-xl font-bold ${getScoreColor(signal.confluenceScore, signal.maxScore)}`}>
            {signal.confluenceScore}/{signal.maxScore}
          </span>
        </div>
        <Progress
          value={(signal.confluenceScore / signal.maxScore) * 100}
          className="h-2"
        />

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-2 bg-slate-800/50 rounded">
            <p className="text-slate-300 text-xs">Entry</p>
            <p className="font-semibold">${signal.entryPrice.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded">
            <p className="text-slate-300 text-xs">Stop Loss</p>
            <p className="font-semibold text-red-400">${signal.stopLoss.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded">
            <p className="text-slate-300 text-xs">Target</p>
            <p className="font-semibold text-emerald-400">${signal.targetPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={signal.indicators.priceAbove200EMA ? 'text-emerald-400' : 'text-red-400'}>
              {signal.indicators.priceAbove200EMA ? '✅' : '❌'}
            </span>
            <span className="text-slate-200">Price &gt; 200 EMA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={signal.indicators.ema9 > signal.indicators.ema21 ? 'text-emerald-400' : 'text-red-400'}>
              {signal.indicators.ema9 > signal.indicators.ema21 ? '✅' : '❌'}
            </span>
            <span className="text-slate-200">9 EMA &gt; 21 EMA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={signal.indicators.candleColor === 'green' ? 'text-emerald-400' : 'text-red-400'}>
              {signal.indicators.candleColor === 'green' ? '✅' : '❌'}
            </span>
            <span className="text-slate-200">Green Candle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={signal.indicators.macdHistogram > 0 ? 'text-emerald-400' : 'text-red-400'}>
              {signal.indicators.macdHistogram > 0 ? '✅' : '❌'}
            </span>
            <span className="text-slate-200">MACD Hist &gt; 0</span>
          </div>
        </div>

        <ScrollArea className="h-24">
          <div className="space-y-1 text-xs">
            {signal.reasoning.map((reason, i) => (
              <p key={i} className="text-slate-200">{reason}</p>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {signal.timeframe}
          </span>
          <span>R:R {signal.riskRewardRatio.toFixed(1)}:1</span>
        </div>
        
        {onExecute && (
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={() => onExecute({...signal, signalType: 'ENTRY'})}
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy
            </Button>
            <Button 
              onClick={() => onExecute({...signal, signalType: 'EXIT'})}
              size="sm" 
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sell
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
