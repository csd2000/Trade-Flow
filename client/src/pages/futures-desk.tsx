import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  RefreshCw,
  Calculator,
  Target,
  AlertTriangle,
  BarChart3,
  Coins,
  DollarSign,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  VolumeX,
  Search,
  Play,
  Bell,
  Timer,
  Newspaper,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import TradingViewChart from '@/components/TradingViewChart';
import MarketClock from '@/components/MarketClock';

interface FuturesQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  volume: number;
  timestamp: number;
}

interface FuturesIndicators {
  rsi: number;
  macd: { line: number; signal: number; histogram: number };
  ema9: number;
  ema20: number;
  ema50: number;
  atr: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: 'low' | 'medium' | 'high';
}

interface FuturesSignal {
  symbol: string;
  signalType: 'long' | 'short' | 'hold';
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: number;
  confidence: number;
  reasoning: string;
}

interface ContractSpec {
  symbol: string;
  name: string;
  contractSize: number;
  tickSize: number;
  tickValue: number;
  marginRequirement: number;
}

interface FuturesData {
  contract: ContractSpec;
  quote: FuturesQuote;
  indicators: FuturesIndicators;
  signal: FuturesSignal;
}

interface FuturesNewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  impact: 'high' | 'medium' | 'low';
  relevance: number;
  keywords: string[];
  contract: 'GC' | 'SI' | 'BOTH';
}

interface SentimentAnalysis {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  summary: string;
  keyFactors: string[];
  tradingImplication: string;
}

interface NewsResponse {
  success: boolean;
  data: {
    news: FuturesNewsItem[];
    analysis: SentimentAnalysis | null;
    timestamp: string;
  };
}

interface AIFlashPrediction {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  timeframe: string;
  reasoning: string;
  keyFactors: string[];
  marketCondition: string;
  timestamp: string;
}

interface AIFlashResponse {
  success: boolean;
  data: {
    prediction: AIFlashPrediction;
    quote: FuturesQuote;
    indicators: FuturesIndicators;
    contract: ContractSpec;
  };
}

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
    playBeep(now, 800);
    playBeep(now + 0.2, 1000);
    playBeep(now + 0.4, 800);
    playBeep(now + 0.6, 1200);
    
  } catch (e) {
    console.log('Audio not available');
  }
};

const SignalBadge = ({ signalType, isFlashing }: { signalType: 'long' | 'short' | 'hold'; isFlashing: boolean }) => {
  const config = {
    'long': { color: 'bg-green-600 text-white', icon: ArrowUpRight, label: 'LONG' },
    'short': { color: 'bg-red-600 text-white', icon: ArrowDownRight, label: 'SHORT' },
    'hold': { color: 'bg-amber-500 text-white', icon: Clock, label: 'HOLD' }
  };
  
  const { color, icon: Icon, label } = config[signalType];
  const flashClass = isFlashing ? 'animate-pulse shadow-lg shadow-current' : '';
  
  return (
    <Badge className={`${color} ${flashClass} flex items-center gap-1 px-3 py-1`} data-testid={`signal-badge-${signalType}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const CountdownTimer = ({ lastUpdate }: { lastUpdate: number }) => {
  const [secondsAgo, setSecondsAgo] = useState(0);
  
  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      setSecondsAgo(Math.floor((now - lastUpdate) / 1000));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);
  
  const minutes = Math.floor(secondsAgo / 60);
  const seconds = secondsAgo % 60;
  
  return (
    <div className={`text-xs font-mono ${secondsAgo > 60 ? 'text-amber-400' : 'text-green-400'}`}>
      <Clock className="h-3 w-3 inline mr-1" />
      {minutes}:{seconds.toString().padStart(2, '0')} ago
    </div>
  );
};

const TrendStrengthMeter = ({ confidence, trend, signalType }: { confidence: number; trend: 'bullish' | 'bearish' | 'neutral'; signalType?: 'long' | 'short' | 'hold' }) => {
  // Align display with signal direction when available, otherwise use trend
  const displayBullish = signalType === 'long' ? true : signalType === 'short' ? false : trend === 'bullish';
  const displayTrend = signalType === 'long' ? 'bullish' : signalType === 'short' ? 'bearish' : trend;
  
  const activeColor = displayBullish ? 'bg-green-500' : displayTrend === 'bearish' ? 'bg-red-500' : 'bg-amber-500';
  const bars = Math.round(confidence / 10);
  
  return (
    <div className="rounded p-2 mt-2 bg-slate-800/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-200 font-medium">TREND STRENGTH</span>
        <span className={`text-xs font-bold ${displayBullish ? 'text-green-400' : displayTrend === 'bearish' ? 'text-red-400' : 'text-amber-400'}`}>
          {confidence}%
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-sm transition-all ${i < bars ? activeColor : 'bg-slate-700'}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-slate-300">Weak</span>
        <span className={`font-medium ${displayBullish ? 'text-green-400' : displayTrend === 'bearish' ? 'text-red-400' : 'text-amber-400'}`}>
          {displayTrend === 'bullish' ? '▲ BULLISH' : displayTrend === 'bearish' ? '▼ BEARISH' : '◆ NEUTRAL'}
        </span>
        <span className="text-slate-300">Strong</span>
      </div>
    </div>
  );
};

const FlashingFuturesCard = ({ 
  data, 
  audioEnabled, 
  isSelected, 
  onClick,
  timeframe = '15m'
}: { 
  data: FuturesData; 
  audioEnabled: boolean; 
  isSelected: boolean; 
  onClick: () => void;
  timeframe?: string;
}) => {
  const lastPlayedRef = useRef<number>(0);
  const isStrong = data.signal.confidence >= 75;
  const isFlashing = isStrong && data.signal.signalType !== 'hold';
  const isBuy = data.signal.signalType === 'long';
  
  useEffect(() => {
    const now = Date.now();
    if (isFlashing && audioEnabled && now - lastPlayedRef.current > 30000) {
      playAlarmSound();
      lastPlayedRef.current = now;
    }
  }, [isFlashing, audioEnabled, data.signal.confidence]);
  
  const flashBgClass = isFlashing 
    ? isBuy 
      ? 'animate-pulse bg-gradient-to-r from-green-900/50 to-green-800/30 border-green-500' 
      : 'animate-pulse bg-gradient-to-r from-red-900/50 to-red-800/30 border-red-500'
    : isSelected 
      ? 'bg-amber-500/10 border-amber-500/50'
      : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/30';
  
  const formatPrice = (price: number) => {
    return data.contract.symbol === 'SI' ? price.toFixed(3) : price.toFixed(2);
  };
  
  return (
    <Card 
      className={`${flashBgClass} border-2 cursor-pointer transition-all relative overflow-hidden`}
      onClick={onClick}
      data-testid={`futures-card-${data.contract.symbol.toLowerCase()}`}
    >
      {isFlashing && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${isBuy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${data.contract.symbol === 'GC' ? 'bg-amber-500/20' : 'bg-slate-500/20'}`}>
              <Coins className={`h-6 w-6 ${data.contract.symbol === 'GC' ? 'text-amber-400' : 'text-slate-200'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {data.contract.name}
                {isFlashing && <Zap className={`h-5 w-5 ${isBuy ? 'text-green-400' : 'text-red-400'} animate-pulse`} />}
              </h3>
              <p className="text-xs text-slate-200">{data.contract.symbol} • COMEX • {timeframe}</p>
            </div>
          </div>
          <SignalBadge signalType={data.signal.signalType} isFlashing={isFlashing} />
        </div>
        
        <div className={`rounded-lg p-3 mb-3 ${isFlashing ? 'bg-black/40 border border-primary/30' : 'bg-gradient-to-r from-slate-800 to-slate-700'}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-200 uppercase tracking-wide">Live Price</span>
            <Activity className="h-3 w-3 text-green-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold font-mono ${isBuy ? 'text-green-400' : data.signal.signalType === 'short' ? 'text-red-400' : 'text-white'}`}>
              ${formatPrice(data.quote.price)}
            </p>
            <span className={`text-sm ${data.quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.quote.change >= 0 ? '+' : ''}{formatPrice(data.quote.change)} ({data.quote.changePercent >= 0 ? '+' : ''}{data.quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className={`rounded p-2 ${isFlashing ? 'bg-black/30' : 'bg-slate-800'}`}>
            <p className="text-xs text-slate-200">Confidence</p>
            <p className={`text-lg font-bold ${data.signal.confidence >= 75 ? 'text-green-400' : data.signal.confidence >= 50 ? 'text-amber-400' : 'text-slate-200'}`}>
              {data.signal.confidence.toFixed(0)}%
            </p>
          </div>
          <div className={`rounded p-2 ${isFlashing ? 'bg-black/30' : 'bg-slate-800'}`}>
            <p className="text-xs text-slate-200">R:R Ratio</p>
            <p className="text-lg font-bold text-amber-400">{data.signal.riskRewardRatio.toFixed(1)}:1</p>
          </div>
          <div className={`rounded p-2 ${isFlashing ? 'bg-black/30' : 'bg-slate-800'}`}>
            <p className="text-xs text-slate-200">RSI (14)</p>
            <p className={`text-lg font-bold ${data.indicators.rsi > 70 ? 'text-red-400' : data.indicators.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>
              {data.indicators.rsi.toFixed(1)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-200">Entry</span>
            <span className="text-blue-400 font-mono">${formatPrice(data.signal.entryPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-200">Target</span>
            <span className="text-green-400 font-mono">${formatPrice(data.signal.targetPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-200">Stop Loss</span>
            <span className="text-red-400 font-mono">${formatPrice(data.signal.stopLoss)}</span>
          </div>
        </div>
        
        <TrendStrengthMeter confidence={data.signal.confidence} trend={data.indicators.trend} signalType={data.signal.signalType} />
        
        <div className="mt-3 pt-2 border-t border-slate-700/50">
          <CountdownTimer lastUpdate={data.quote.timestamp} />
        </div>
      </CardContent>
    </Card>
  );
};

export default function FuturesDesk() {
  const [selectedSymbol, setSelectedSymbol] = useState('GC');
  const [activeTab, setActiveTab] = useState('scanner');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [timeframe, setTimeframe] = useState('15m');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [positionCalc, setPositionCalc] = useState({
    accountBalance: '',
    riskPercent: '2',
    entryPrice: '',
    stopLoss: ''
  });
  const queryClient = useQueryClient();

  const { data: signalsData, isLoading, refetch } = useQuery<{ success: boolean; data: FuturesData[] }>({
    queryKey: ['/api/futures/signals', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/futures/signals?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch signals');
      return res.json();
    },
    refetchInterval: 30000
  });

  const positionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/futures/position-size', 'POST', data);
      return response.json();
    }
  });

  const { data: newsData, isLoading: isLoadingNews, refetch: refetchNews, error: newsError, isError: isNewsError } = useQuery<NewsResponse>({
    queryKey: ['/api/futures/news', selectedSymbol],
    queryFn: async () => {
      const res = await fetch(`/api/futures/news?contract=${selectedSymbol}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch news' }));
        throw new Error(errorData.error || 'Failed to fetch news');
      }
      return res.json();
    },
    refetchInterval: 60000,
    retry: 1
  });

  const newsItems = newsData?.data?.news || [];
  const sentimentAnalysis = newsData?.data?.analysis;

  const [aiPrediction, setAiPrediction] = useState<AIFlashPrediction | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIPrediction = async (symbol: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/futures/ai-flash-prediction/${symbol}?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch AI prediction');
      const data: AIFlashResponse = await res.json();
      if (data.success) {
        setAiPrediction(data.data.prediction);
        if (audioEnabled && data.data.prediction.direction !== 'NEUTRAL') {
          playAlarmSound();
        }
      }
    } catch (error) {
      console.error('AI prediction error:', error);
    } finally {
      setAiLoading(false);
    }
  };
  const newsErrorMessage = newsError instanceof Error ? newsError.message : 'Failed to load news';

  const signals = signalsData?.data || [];
  const selectedData = signals.find((s) => s.contract.symbol === selectedSymbol);
  
  const longSignals = signals.filter(s => s.signal.signalType === 'long');
  const shortSignals = signals.filter(s => s.signal.signalType === 'short');
  const flashSignals = signals.filter(s => s.signal.confidence >= 75 && s.signal.signalType !== 'hold');

  const calculatePosition = () => {
    const { accountBalance, riskPercent, entryPrice, stopLoss } = positionCalc;
    if (!accountBalance || !entryPrice || !stopLoss) return;

    positionMutation.mutate({
      symbol: selectedSymbol,
      accountBalance,
      riskPercent,
      entryPrice,
      stopLoss
    });
  };

  const formatPrice = (price: number, symbol: string) => {
    return symbol === 'SI' ? price.toFixed(3) : price.toFixed(2);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <IntermarketBanner />
        <MarketClock />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white" data-testid="page-title-futures">
                Futures Trading Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-200">Gold & Silver • Real-Time Flash Signals • {timeframe} Timeframe</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-600">
              {['5m', '15m', '30m', '1h'].map((tf) => (
                <Button 
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (tf !== timeframe) {
                      setTimeframe(tf);
                      queryClient.invalidateQueries({ queryKey: ['/api/futures/signals'] });
                    }
                  }}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm ${timeframe === tf ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                  data-testid={`btn-timeframe-${tf}`}
                >
                  {tf.toUpperCase()}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 px-2 sm:px-4 py-2 text-xs sm:text-sm"
              data-testid="button-refresh-futures"
            >
              <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-500/50 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-400" />
              <span className="text-violet-300 font-bold">AI FLASH PREDICTION</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchAIPrediction('GC')}
                disabled={aiLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm"
              >
                {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                Gold AI
              </Button>
              <Button
                onClick={() => fetchAIPrediction('SI')}
                disabled={aiLoading}
                className="bg-slate-600 hover:bg-slate-700 text-white text-xs sm:text-sm"
              >
                {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                Silver AI
              </Button>
            </div>
          </div>
          
          {aiPrediction && (
            <div className={`p-4 rounded-lg border ${
              aiPrediction.direction === 'LONG' ? 'bg-green-900/30 border-green-500/50' :
              aiPrediction.direction === 'SHORT' ? 'bg-red-900/30 border-red-500/50' :
              'bg-slate-900/30 border-slate-500/50'
            }`}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className={`text-lg px-4 py-1 ${
                  aiPrediction.direction === 'LONG' ? 'bg-green-600' :
                  aiPrediction.direction === 'SHORT' ? 'bg-red-600' :
                  'bg-slate-600'
                }`}>
                  {aiPrediction.direction}
                </Badge>
                <span className="text-white font-bold">{aiPrediction.symbol}</span>
                <Badge variant="outline" className="text-violet-400 border-violet-400">
                  {aiPrediction.confidence}% Confidence
                </Badge>
                <Badge variant="outline" className="text-amber-400 border-amber-400">
                  {aiPrediction.riskReward.toFixed(1)}:1 R:R
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <p className="text-xs text-slate-200">Entry</p>
                  <p className="text-sm font-bold text-white">${aiPrediction.entryPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-red-900/30 rounded">
                  <p className="text-xs text-red-400">Stop Loss</p>
                  <p className="text-sm font-bold text-red-400">${aiPrediction.stopLoss.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-green-900/30 rounded">
                  <p className="text-xs text-green-400">Target 1</p>
                  <p className="text-sm font-bold text-green-400">${aiPrediction.target1.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-green-900/50 rounded">
                  <p className="text-xs text-green-300">Target 2</p>
                  <p className="text-sm font-bold text-green-300">${aiPrediction.target2.toFixed(2)}</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 mb-2">{aiPrediction.reasoning}</p>
              
              <div className="flex flex-wrap gap-1">
                {aiPrediction.keyFactors.map((factor, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-slate-200 border-slate-600">
                    {factor}
                  </Badge>
                ))}
              </div>
              
              <p className="text-xs text-slate-300 mt-2">
                Market: {aiPrediction.marketCondition} | Updated: {new Date(aiPrediction.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
          
          {!aiPrediction && !aiLoading && (
            <p className="text-slate-200 text-sm text-center py-4">
              Click Gold AI or Silver AI to get real-time AI-powered trading predictions based on all available market data.
            </p>
          )}
          
          {aiLoading && (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-violet-400 mr-2" />
              <span className="text-violet-300">Analyzing market data with AI...</span>
            </div>
          )}
        </div>

        {flashSignals.length > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm sm:text-base">FLASH SIGNALS ACTIVE</span>
            </div>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {flashSignals.map(s => (
                <Badge 
                  key={s.contract.symbol} 
                  className={`${s.signal.signalType === 'long' ? 'bg-green-600' : 'bg-red-600'} text-white animate-pulse text-xs sm:text-sm`}
                >
                  {s.contract.name}: {s.signal.signalType.toUpperCase()} ({s.signal.confidence}% conf)
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-slate-200 text-xs sm:text-sm">Contracts</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{signals.length}</p>
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
              <p className="text-slate-200 text-xs sm:text-sm">Long Signals</p>
              <p className="text-lg sm:text-2xl font-bold text-green-400">{longSignals.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-slate-200 text-xs sm:text-sm">Short Signals</p>
              <p className="text-lg sm:text-2xl font-bold text-red-400">{shortSignals.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/80 border-slate-700 mb-4">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-400" />
                TradingView Charts
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedSymbol === 'GC' ? 'default' : 'outline'}
                  onClick={() => setSelectedSymbol('GC')}
                  className={selectedSymbol === 'GC' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-500/50 text-amber-400'}
                >
                  Gold Futures (GC)
                </Button>
                <Button
                  size="sm"
                  variant={selectedSymbol === 'SI' ? 'default' : 'outline'}
                  onClick={() => setSelectedSymbol('SI')}
                  className={selectedSymbol === 'SI' ? 'bg-slate-600 hover:bg-slate-700' : 'border-slate-500/50 text-slate-200'}
                >
                  Silver Futures (SI)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[450px] w-full">
              <TradingViewChart 
                symbol={selectedSymbol === 'GC' ? 'CME_MINI:GC1!' : 'CME_MINI:SI1!'}
                interval={timeframe === '5m' ? '5' : timeframe === '15m' ? '15' : timeframe === '30m' ? '30' : '60'}
                theme="dark"
                height={450}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 mb-4 w-full sm:w-auto flex">
            <TabsTrigger value="scanner" data-testid="tab-scanner" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="analyze" data-testid="tab-analyze" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="signals" data-testid="tab-signals" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Active Signals
            </TabsTrigger>
            <TabsTrigger value="calculator" data-testid="tab-calculator" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Position Calc
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Newspaper className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              News Sentiment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
                  <p className="text-slate-200">Scanning futures markets...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {signals.map((item) => (
                  <FlashingFuturesCard
                    key={item.contract.symbol}
                    data={item}
                    audioEnabled={audioEnabled}
                    isSelected={selectedSymbol === item.contract.symbol}
                    onClick={() => setSelectedSymbol(item.contract.symbol)}
                    timeframe={timeframe}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analyze">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-amber-400" />
                  Analyze Futures Contract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-6">
                  <Select value={searchSymbol || selectedSymbol} onValueChange={setSearchSymbol}>
                    <SelectTrigger className="w-[200px] bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select Contract" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="GC" className="text-white hover:bg-slate-700">🥇 Gold (GC)</SelectItem>
                      <SelectItem value="SI" className="text-white hover:bg-slate-700">🥈 Silver (SI)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      setSelectedSymbol(searchSymbol || selectedSymbol);
                      setActiveTab('scanner');
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                    data-testid="btn-analyze-contract"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>

                {selectedData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-200 mb-1">Current Price</p>
                        <p className="text-xl font-bold text-white">${formatPrice(selectedData.quote.price, selectedData.contract.symbol)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-200 mb-1">Day Change</p>
                        <p className={`text-xl font-bold ${selectedData.quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedData.quote.changePercent >= 0 ? '+' : ''}{selectedData.quote.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-200 mb-1">Signal</p>
                        <p className={`text-xl font-bold capitalize ${selectedData.signal.signalType === 'long' ? 'text-green-400' : selectedData.signal.signalType === 'short' ? 'text-red-400' : 'text-amber-400'}`}>
                          {selectedData.signal.signalType.toUpperCase()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-200 mb-1">Confidence</p>
                        <p className="text-xl font-bold text-amber-400">{selectedData.signal.confidence}%</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                        <p className="text-sm font-medium text-white">AI Analysis</p>
                      </div>
                      <p className="text-slate-300">{selectedData.signal.reasoning}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals">
            <div className="space-y-4">
              {signals.filter(s => s.signal.signalType !== 'hold').length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-200">No active signals at the moment</p>
                    <p className="text-sm text-slate-300">Waiting for market conditions to align</p>
                  </CardContent>
                </Card>
              ) : (
                signals.filter(s => s.signal.signalType !== 'hold').map((item) => (
                  <Card key={item.contract.symbol} className={`border-2 ${item.signal.signalType === 'long' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Coins className={`h-8 w-8 ${item.contract.symbol === 'GC' ? 'text-amber-400' : 'text-slate-200'}`} />
                          <div>
                            <h3 className="text-xl font-bold text-white">{item.contract.name}</h3>
                            <p className="text-sm text-slate-200">{item.contract.symbol} • COMEX</p>
                          </div>
                        </div>
                        <SignalBadge signalType={item.signal.signalType} isFlashing={item.signal.confidence >= 75} />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-slate-900/50">
                          <p className="text-xs text-slate-300">Entry</p>
                          <p className="text-lg font-bold text-blue-400">${formatPrice(item.signal.entryPrice, item.contract.symbol)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/50">
                          <p className="text-xs text-slate-300">Target</p>
                          <p className="text-lg font-bold text-green-400">${formatPrice(item.signal.targetPrice, item.contract.symbol)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/50">
                          <p className="text-xs text-slate-300">Stop Loss</p>
                          <p className="text-lg font-bold text-red-400">${formatPrice(item.signal.stopLoss, item.contract.symbol)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/50">
                          <p className="text-xs text-slate-300">R:R Ratio</p>
                          <p className="text-lg font-bold text-amber-400">{item.signal.riskRewardRatio.toFixed(1)}:1</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 rounded-lg bg-slate-900/50">
                        <p className="text-sm text-slate-300">{item.signal.reasoning}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="calculator">
            {selectedData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-green-400" />
                      Position Size Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                      <p className="text-amber-400 font-medium mb-1">Contract Specs - {selectedData.contract.name}</p>
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <p>Size: {selectedData.contract.contractSize} oz</p>
                        <p>Tick: ${selectedData.contract.tickValue}</p>
                        <p>Margin: {formatCurrency(selectedData.contract.marginRequirement)}</p>
                        <p>Tick Size: {selectedData.contract.tickSize}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-slate-200 text-sm">Account Balance ($)</Label>
                        <Input
                          type="number"
                          placeholder="50000"
                          value={positionCalc.accountBalance}
                          onChange={(e) => setPositionCalc(p => ({ ...p, accountBalance: e.target.value }))}
                          className="bg-slate-900/50 border-slate-700 text-white"
                          data-testid="input-account-balance"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200 text-sm">Risk % per Trade</Label>
                        <Input
                          type="number"
                          placeholder="2"
                          value={positionCalc.riskPercent}
                          onChange={(e) => setPositionCalc(p => ({ ...p, riskPercent: e.target.value }))}
                          className="bg-slate-900/50 border-slate-700 text-white"
                          data-testid="input-risk-percent"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200 text-sm">Entry Price ($)</Label>
                        <Input
                          type="number"
                          placeholder={formatPrice(selectedData.quote.price, selectedData.contract.symbol)}
                          value={positionCalc.entryPrice}
                          onChange={(e) => setPositionCalc(p => ({ ...p, entryPrice: e.target.value }))}
                          className="bg-slate-900/50 border-slate-700 text-white"
                          data-testid="input-entry-price"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200 text-sm">Stop Loss ($)</Label>
                        <Input
                          type="number"
                          placeholder={formatPrice(selectedData.signal.stopLoss, selectedData.contract.symbol)}
                          value={positionCalc.stopLoss}
                          onChange={(e) => setPositionCalc(p => ({ ...p, stopLoss: e.target.value }))}
                          className="bg-slate-900/50 border-slate-700 text-white"
                          data-testid="input-stop-loss"
                        />
                      </div>

                      <Button 
                        onClick={calculatePosition}
                        disabled={positionMutation.isPending}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
                        data-testid="button-calculate-position"
                      >
                        {positionMutation.isPending ? 'Calculating...' : 'Calculate Position'}
                      </Button>
                    </div>

                    {positionMutation.data && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 space-y-2">
                        <p className="text-green-400 font-medium text-sm">Position Result</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-slate-300">Contracts</p>
                            <p className="text-xl font-bold text-white">
                              {(positionMutation.data as any).data?.contracts || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-300">Risk Amount</p>
                            <p className="text-lg font-medium text-red-400">
                              {formatCurrency((positionMutation.data as any).data?.dollarRisk || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-300">Margin Required</p>
                            <p className="text-slate-300">
                              {formatCurrency((positionMutation.data as any).data?.marginRequired || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-300">Position Value</p>
                            <p className="text-slate-300">
                              {formatCurrency((positionMutation.data as any).data?.positionValue || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-amber-400" />
                      Signal Analysis - {selectedData.contract.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-400" />
                          <p className="text-xs text-slate-200">Entry</p>
                        </div>
                        <p className="text-xl font-bold text-white">
                          ${formatPrice(selectedData.signal.entryPrice, selectedData.contract.symbol)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <p className="text-xs text-slate-200">Stop Loss</p>
                        </div>
                        <p className="text-xl font-bold text-red-400">
                          ${formatPrice(selectedData.signal.stopLoss, selectedData.contract.symbol)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <p className="text-xs text-slate-200">Target</p>
                        </div>
                        <p className="text-xl font-bold text-green-400">
                          ${formatPrice(selectedData.signal.targetPrice, selectedData.contract.symbol)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-amber-400" />
                          <p className="text-xs text-slate-200">R:R Ratio</p>
                        </div>
                        <p className="text-xl font-bold text-amber-400">
                          {selectedData.signal.riskRewardRatio.toFixed(1)}:1
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                        <p className="text-xs text-slate-300">EMA 9</p>
                        <p className="text-lg font-medium text-white">
                          ${formatPrice(selectedData.indicators.ema9, selectedData.contract.symbol)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                        <p className="text-xs text-slate-300">EMA 20</p>
                        <p className="text-lg font-medium text-white">
                          ${formatPrice(selectedData.indicators.ema20, selectedData.contract.symbol)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                        <p className="text-xs text-slate-300">ATR</p>
                        <p className="text-lg font-medium text-amber-400">
                          ${selectedData.indicators.atr.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <TrendStrengthMeter confidence={selectedData.signal.confidence} trend={selectedData.indicators.trend} signalType={selectedData.signal.signalType} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="news">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select Contract" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="GC" className="text-white hover:bg-slate-700">🥇 Gold (GC)</SelectItem>
                      <SelectItem value="SI" className="text-white hover:bg-slate-700">🥈 Silver (SI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => refetchNews()}
                  disabled={isLoadingNews}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  data-testid="btn-refresh-news"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? 'animate-spin' : ''}`} />
                  Refresh News
                </Button>
              </div>

              {sentimentAnalysis && (
                <Card className={`border-2 ${
                  sentimentAnalysis.overall === 'bullish' 
                    ? 'bg-green-900/20 border-green-500/50' 
                    : sentimentAnalysis.overall === 'bearish' 
                      ? 'bg-red-900/20 border-red-500/50' 
                      : 'bg-slate-800/50 border-slate-600'
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-400" />
                      AI Sentiment Analysis
                      <Badge className={`ml-auto ${
                        sentimentAnalysis.overall === 'bullish' 
                          ? 'bg-green-600' 
                          : sentimentAnalysis.overall === 'bearish' 
                            ? 'bg-red-600' 
                            : 'bg-amber-500'
                      } text-white`}>
                        {sentimentAnalysis.overall.toUpperCase()} ({sentimentAnalysis.score > 0 ? '+' : ''}{sentimentAnalysis.score})
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{sentimentAnalysis.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-200 mb-2">Key Factors</p>
                        <div className="space-y-1">
                          {sentimentAnalysis.keyFactors.map((factor, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              {factor}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-200 mb-2">Trading Implication</p>
                        <p className="text-sm text-slate-300">{sentimentAnalysis.tradingImplication}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-slate-300">Confidence:</span>
                          <Progress value={sentimentAnalysis.confidence} className="flex-1 h-2" />
                          <span className="text-xs text-amber-400">{sentimentAnalysis.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingNews ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
                    <p className="text-slate-200">Analyzing news sentiment...</p>
                  </div>
                </div>
              ) : isNewsError ? (
                <Card className="bg-red-900/20 border-red-500/50">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 font-medium mb-2">Failed to Load News</p>
                    <p className="text-sm text-slate-200 mb-4">{newsErrorMessage}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => refetchNews()}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : newsItems.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <Newspaper className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-200">No recent news for {selectedSymbol === 'GC' ? 'Gold' : 'Silver'}</p>
                    <p className="text-sm text-slate-300">Check back later for market updates</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all ${
                        item.impact === 'high' ? 'ring-1 ring-amber-500/30' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge className={`${
                            item.sentiment === 'bullish' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : item.sentiment === 'bearish' 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                          }`}>
                            {item.sentiment === 'bullish' ? '▲' : item.sentiment === 'bearish' ? '▼' : '◆'} {item.sentiment}
                          </Badge>
                          <Badge variant="outline" className={`${
                            item.impact === 'high' 
                              ? 'border-amber-500 text-amber-400' 
                              : item.impact === 'medium' 
                                ? 'border-blue-500 text-blue-400' 
                                : 'border-slate-500 text-slate-200'
                          }`}>
                            {item.impact} impact
                          </Badge>
                        </div>
                        
                        <h3 className="text-white font-medium mb-2 line-clamp-2">{item.title}</h3>
                        
                        {item.description && (
                          <p className="text-sm text-slate-200 mb-3 line-clamp-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>{item.source}</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {item.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.keywords.slice(0, 3).map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-200">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {item.url && item.url !== '#' && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                          >
                            Read full article <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
