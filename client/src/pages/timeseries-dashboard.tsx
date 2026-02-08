import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Brain, 
  Clock, 
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Coins,
  Globe,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';

interface Prediction {
  date: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
  predicted_high: number;
  predicted_low: number;
}

interface LivePriceData {
  symbol: string;
  assetType: 'stock' | 'crypto' | 'forex';
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string;
}

interface ForecastData {
  id: number;
  symbol: string;
  currentPrice: number;
  assetType: 'stock' | 'crypto' | 'forex';
  timeframe?: string;
  timeframeLabel?: string;
  lastUpdated?: string;
  historicalData: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  predictions: Prediction[];
  trend: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  confidence: number;
  summary: string;
  methodology: string;
  sentiment?: {
    bullishPercent: number;
    bearishPercent: number;
    neutralPercent: number;
    score: number;
    label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  };
  technicals?: {
    rsi: number;
    rsiSignal: 'oversold' | 'neutral' | 'overbought';
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    sma20: number;
    ema12: number;
    volatility: number;
    priceVsSma: 'above' | 'below' | 'at';
  };
}

interface MultiTimeframeData {
  symbol: string;
  assetType: string;
  currentPrice: number;
  timeframes: Array<{
    timeframe: string;
    label: string;
    trend: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    change: number;
    changePercent: number;
    dataPoints: number;
    hasValidData: boolean;
  }>;
  overallTrend: 'bullish' | 'bearish' | 'neutral';
  overallConfidence: number;
  lastUpdated: string;
}

const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM', 'V', 'MA'];
const popularCrypto = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT', 'MATIC'];
const popularForex = ['EURUSD', 'GBPUSD', 'JPYUSD', 'AUDUSD', 'CADUSD', 'CHFUSD', 'NZDUSD', 'MXNUSD'];

const timeframes = [
  { value: '1Y', label: '1 Year', refreshMs: 3600000 },
  { value: '1Mo', label: '1 Month', refreshMs: 300000 },
  { value: '1W', label: '1 Week', refreshMs: 120000 },
  { value: '1D', label: '1 Day', refreshMs: 60000 },
  { value: '4H', label: '4 Hour', refreshMs: 30000 },
  { value: '1H', label: '1 Hour', refreshMs: 20000 },
  { value: '30M', label: '30 Min', refreshMs: 15000 },
  { value: '15M', label: '15 Min', refreshMs: 10000 },
  { value: '5M', label: '5 Min', refreshMs: 5000 },
  { value: '1M', label: '1 Min', refreshMs: 3000 },
  { value: '30S', label: '30 Sec', refreshMs: 2000 }
];

export default function TimeSeriesDashboard() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'forex'>('stocks');
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [horizon, setHorizon] = useState('30');
  const [useAI, setUseAI] = useState(true);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Default ON for live data
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [livePrice, setLivePrice] = useState<LivePriceData | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [multiTimeframeData, setMultiTimeframeData] = useState<MultiTimeframeData | null>(null);
  const [showMultiTimeframe, setShowMultiTimeframe] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const livePriceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch LIVE price
  const fetchLivePrice = async () => {
    try {
      const assetType = activeTab === 'stocks' ? 'stock' : activeTab;
      const response = await fetch(`/api/timeseries/live/${symbol}?type=${assetType}`);
      const data = await response.json();
      if (data.success) {
        const newPrice = data.data;
        if (livePrice && newPrice.price !== livePrice.price) {
          setPreviousPrice(livePrice.price);
          setPriceFlash(newPrice.price > livePrice.price ? 'up' : 'down');
          setTimeout(() => setPriceFlash(null), 500);
        }
        setLivePrice(newPrice);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Live price fetch error:', error);
    }
  };

  // Auto-fetch live price every 5 seconds (crypto) or 15 seconds (stocks/forex)
  useEffect(() => {
    if (autoRefresh && symbol) {
      const intervalMs = activeTab === 'crypto' ? 5000 : 15000;
      
      // Fetch immediately
      fetchLivePrice();
      
      livePriceIntervalRef.current = setInterval(() => {
        fetchLivePrice();
      }, intervalMs);
    }
    
    return () => {
      if (livePriceIntervalRef.current) {
        clearInterval(livePriceIntervalRef.current);
      }
    };
  }, [autoRefresh, symbol, activeTab]);

  const forecastMutation = useMutation({
    mutationFn: async () => {
      const assetType = activeTab === 'stocks' ? 'stock' : activeTab;
      const response = await fetch(`/api/timeseries/predict/${symbol}?horizon=${horizon}&ai=${useAI}&type=${assetType}&timeframe=${timeframe}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: (data) => {
      setForecastData(data);
      setLastRefresh(new Date());
    }
  });

  const multiTimeframeMutation = useMutation({
    mutationFn: async () => {
      const assetType = activeTab === 'stocks' ? 'stock' : activeTab;
      const response = await fetch(`/api/timeseries/multi-timeframe/${symbol}?type=${assetType}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data as MultiTimeframeData;
    },
    onSuccess: (data) => {
      setMultiTimeframeData(data);
      setShowMultiTimeframe(true);
      setLastRefresh(new Date());
    }
  });

  // Auto-refresh for forecast data
  useEffect(() => {
    if (autoRefresh && forecastData) {
      const currentTimeframe = timeframes.find(t => t.value === timeframe);
      const refreshMs = currentTimeframe?.refreshMs || 30000;
      
      refreshIntervalRef.current = setInterval(() => {
        forecastMutation.mutate();
      }, refreshMs);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, timeframe, forecastData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'stocks' | 'crypto' | 'forex');
    setForecastData(null);
    setLivePrice(null);
    setPreviousPrice(null);
    if (tab === 'stocks') setSymbol('AAPL');
    else if (tab === 'crypto') setSymbol('BTC');
    else setSymbol('EURUSD');
  };

  // Format large numbers
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'bearish': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'volatile': return <Activity className="h-5 w-5 text-orange-500" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-300" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'bearish': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'volatile': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const prepareChartData = () => {
    if (!forecastData) return [];
    
    const historical = forecastData.historicalData.slice(-30).map(d => ({
      date: d.date,
      actual: d.close,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null
    }));
    
    const predicted = forecastData.predictions.map(p => ({
      date: p.date,
      actual: null as number | null,
      predicted: p.value,
      lower: p.lower_bound,
      upper: p.upper_bound
    }));
    
    return [...historical, ...predicted];
  };

  const formatPrice = (price: number) => {
    if (activeTab === 'forex') return price.toFixed(4);
    if (activeTab === 'crypto' && price > 1000) return price.toFixed(2);
    if (activeTab === 'crypto' && price < 1) return price.toFixed(6);
    return price.toFixed(2);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'stocks': return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'crypto': return <Coins className="h-4 w-4 mr-2" />;
      case 'forex': return <Globe className="h-4 w-4 mr-2" />;
      default: return null;
    }
  };

  const getPopularSymbols = () => {
    switch (activeTab) {
      case 'stocks': return popularStocks;
      case 'crypto': return popularCrypto;
      case 'forex': return popularForex;
      default: return [];
    }
  };

  const getAssetLabel = () => {
    switch (activeTab) {
      case 'stocks': return 'Stock Symbol';
      case 'crypto': return 'Crypto Symbol';
      case 'forex': return 'Forex Pair';
      default: return 'Symbol';
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'stocks': return 'AAPL';
      case 'crypto': return 'BTC';
      case 'forex': return 'EURUSD';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-400" />
              Time Series AI Predictions
            </h1>
            <p className="text-gray-200 mt-1">
              AI-powered forecasting for stocks, crypto, and forex markets
            </p>
          </div>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
            <Zap className="h-3 w-3 mr-1" />
            Powered by Claude AI
          </Badge>
        </div>

        {/* LIVE PRICE DISPLAY - Real-time updates */}
        {livePrice && (
          <Card className={`bg-gradient-to-r ${
            livePrice.changePercent >= 0 
              ? 'from-green-900/40 to-emerald-900/30 border-green-500/40' 
              : 'from-red-900/40 to-rose-900/30 border-red-500/40'
          } border-2 transition-all duration-300 ${
            priceFlash === 'up' ? 'ring-2 ring-green-400' : 
            priceFlash === 'down' ? 'ring-2 ring-red-400' : ''
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-slate-800/50">
                    {livePrice.assetType === 'crypto' && <Coins className="h-8 w-8 text-orange-400" />}
                    {livePrice.assetType === 'stock' && <BarChart3 className="h-8 w-8 text-blue-400" />}
                    {livePrice.assetType === 'forex' && <Globe className="h-8 w-8 text-green-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{livePrice.symbol}</h2>
                      <Badge className={`${autoRefresh ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-200'}`}>
                        <RefreshCw className={`h-3 w-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'LIVE' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="text-gray-200 text-sm">
                      Last updated: {new Date(livePrice.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  {/* LIVE PRICE */}
                  <div className="text-right">
                    <p className="text-sm text-gray-200 mb-1">Live Price</p>
                    <p className={`text-4xl font-bold transition-all duration-200 ${
                      priceFlash === 'up' ? 'text-green-400 scale-105' : 
                      priceFlash === 'down' ? 'text-red-400 scale-105' : 'text-white'
                    }`} data-testid="live-price">
                      ${formatPrice(livePrice.price)}
                    </p>
                  </div>
                  
                  {/* 24H CHANGE */}
                  <div className="text-right">
                    <p className="text-sm text-gray-200 mb-1">24h Change</p>
                    <div className="flex items-center justify-end gap-2">
                      {livePrice.changePercent >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-400" />
                      )}
                      <span className={`text-2xl font-bold ${
                        livePrice.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`} data-testid="live-change">
                        {livePrice.changePercent >= 0 ? '+' : ''}{livePrice.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* VOLUME */}
                  {livePrice.volume > 0 && (
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-gray-200 mb-1">24h Volume</p>
                      <p className="text-xl font-semibold text-white" data-testid="live-volume">
                        {formatVolume(livePrice.volume)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state for live price */}
        {!livePrice && autoRefresh && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <p className="text-gray-200">Fetching live price for {symbol}...</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="stocks" className="data-[state=active]:bg-blue-600" data-testid="tab-stocks">
              {getTabIcon('stocks')} Stocks
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-orange-600" data-testid="tab-crypto">
              {getTabIcon('crypto')} Crypto
            </TabsTrigger>
            <TabsTrigger value="forex" className="data-[state=active]:bg-green-600" data-testid="tab-forex">
              {getTabIcon('forex')} Forex
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  {activeTab === 'stocks' && 'Stock Price Prediction'}
                  {activeTab === 'crypto' && 'Cryptocurrency Price Prediction'}
                  {activeTab === 'forex' && 'Forex Exchange Rate Prediction'}
                </CardTitle>
                <CardDescription className="text-gray-200">
                  {activeTab === 'stocks' && 'Enter a stock symbol to generate AI-powered price forecasts'}
                  {activeTab === 'crypto' && 'Enter a cryptocurrency symbol for AI-powered predictions'}
                  {activeTab === 'forex' && 'Enter a forex pair to predict exchange rate movements'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-gray-200">Popular:</span>
                  {getPopularSymbols().slice(0, 8).map(sym => (
                    <Badge 
                      key={sym}
                      variant="outline" 
                      className="cursor-pointer hover:bg-slate-700 border-slate-600 text-gray-300"
                      onClick={() => setSymbol(sym)}
                      data-testid={`quick-select-${sym}`}
                    >
                      {sym}
                    </Badge>
                  ))}
                </div>

                <div className="mb-4">
                  <Label className="text-gray-300 mb-2 block">Timeframe</Label>
                  <div className="flex flex-wrap gap-2">
                    {timeframes.map(tf => (
                      <Button
                        key={tf.value}
                        variant={timeframe === tf.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeframe(tf.value)}
                        className={timeframe === tf.value 
                          ? "bg-purple-600 hover:bg-purple-700" 
                          : "border-slate-600 text-gray-300 hover:bg-slate-700"}
                        data-testid={`timeframe-${tf.value}`}
                      >
                        {tf.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">{getAssetLabel()}</Label>
                    <Input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      placeholder={getPlaceholder()}
                      className="bg-slate-700 border-slate-600 text-white"
                      data-testid="input-symbol"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Forecast Horizon</Label>
                    <Select value={horizon} onValueChange={setHorizon}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-horizon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Analysis Type</Label>
                    <Select value={useAI ? 'ai' : 'statistical'} onValueChange={(v) => setUseAI(v === 'ai')}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-analysis">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">AI-Enhanced</SelectItem>
                        <SelectItem value="statistical">Statistical Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button 
                      onClick={() => forecastMutation.mutate()}
                      disabled={forecastMutation.isPending || !symbol}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      data-testid="button-predict"
                    >
                      {forecastMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Prediction
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => multiTimeframeMutation.mutate()}
                      disabled={multiTimeframeMutation.isPending || !symbol}
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-multi-timeframe"
                      title="Analyze all timeframes at once"
                    >
                      {multiTimeframeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant={autoRefresh ? "default" : "outline"}
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "border-slate-600"}
                      data-testid="button-auto-refresh"
                      title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                    >
                      <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {lastRefresh && (
                  <div className="text-xs text-gray-300 text-right">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                    {autoRefresh && <span className="ml-2 text-green-400">(Auto-refresh ON)</span>}
                  </div>
                )}

                {forecastMutation.isError && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{(forecastMutation.error as Error).message}</span>
                  </div>
                )}

                {multiTimeframeMutation.isError && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{(multiTimeframeMutation.error as Error).message}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multi-Timeframe Analysis Display */}
            {showMultiTimeframe && multiTimeframeData && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      Multi-Timeframe Analysis - {multiTimeframeData.symbol}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowMultiTimeframe(false)}
                      className="text-gray-200 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                  <CardDescription className="text-gray-200">
                    Trend analysis across all timeframes • Overall: 
                    <span className={`ml-2 font-bold ${
                      multiTimeframeData.overallTrend === 'bullish' ? 'text-green-400' :
                      multiTimeframeData.overallTrend === 'bearish' ? 'text-red-400' : 'text-gray-200'
                    }`}>
                      {multiTimeframeData.overallTrend.toUpperCase()} ({multiTimeframeData.overallConfidence}% confidence)
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {multiTimeframeData.timeframes.map((tf) => (
                      <div 
                        key={tf.timeframe}
                        className={`p-4 rounded-lg border ${
                          !tf.hasValidData ? 'bg-slate-800/30 border-slate-700/30 opacity-50' :
                          tf.trend === 'bullish' ? 'bg-green-900/20 border-green-700/50' :
                          tf.trend === 'bearish' ? 'bg-red-900/20 border-red-700/50' :
                          'bg-slate-700/30 border-slate-600/50'
                        }`}
                        data-testid={`timeframe-card-${tf.timeframe}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{tf.label}</span>
                          {tf.hasValidData ? (
                            <Badge className={`text-xs ${
                              tf.trend === 'bullish' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              tf.trend === 'bearish' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-gray-500/20 text-gray-200 border-gray-500/30'
                            }`}>
                              {tf.trend === 'bullish' ? '↑' : tf.trend === 'bearish' ? '↓' : '→'} {tf.trend}
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-gray-700/30 text-gray-300 border-gray-700/30">
                              — No data
                            </Badge>
                          )}
                        </div>
                        {tf.hasValidData ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-200">Confidence</span>
                              <span className="font-bold text-white">{tf.confidence}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-gray-200">Change</span>
                              <span className={`font-medium ${
                                tf.changePercent > 0 ? 'text-green-400' :
                                tf.changePercent < 0 ? 'text-red-400' : 'text-gray-200'
                              }`}>
                                {tf.changePercent > 0 ? '+' : ''}{tf.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-gray-300 mt-2">Insufficient data for this timeframe</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 mt-4 text-right">
                    Last updated: {new Date(multiTimeframeData.lastUpdated).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            )}

            {forecastData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-200 text-sm">Current Price</p>
                          <p className="text-2xl font-bold text-white" data-testid="text-current-price">
                            ${formatPrice(forecastData.currentPrice)}
                          </p>
                        </div>
                        {activeTab === 'stocks' && <BarChart3 className="h-8 w-8 text-blue-400" />}
                        {activeTab === 'crypto' && <Coins className="h-8 w-8 text-orange-400" />}
                        {activeTab === 'forex' && <DollarSign className="h-8 w-8 text-green-400" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-200 text-sm">Trend</p>
                          <Badge className={`mt-1 ${getTrendColor(forecastData.trend)}`} data-testid="badge-trend">
                            {forecastData.trend.charAt(0).toUpperCase() + forecastData.trend.slice(1)}
                          </Badge>
                        </div>
                        {getTrendIcon(forecastData.trend)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-200 text-sm">Confidence</p>
                          <p className="text-2xl font-bold text-white" data-testid="text-confidence">
                            {forecastData.confidence}%
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-200 text-sm">Horizon</p>
                          <p className="text-2xl font-bold text-white">
                            {horizon} Days
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Predicted High/Low Cards */}
                {forecastData.predictions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-300 text-sm flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              Predicted High ({horizon} Day)
                            </p>
                            <p className="text-3xl font-bold text-green-400 mt-1" data-testid="text-predicted-high">
                              ${formatPrice(Math.max(...forecastData.predictions.map(p => p.predicted_high || p.upper_bound)))}
                            </p>
                            <p className="text-sm text-green-300/70 mt-1">
                              +{((Math.max(...forecastData.predictions.map(p => p.predicted_high || p.upper_bound)) - forecastData.currentPrice) / forecastData.currentPrice * 100).toFixed(2)}% from current
                            </p>
                          </div>
                          <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-green-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-700/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-300 text-sm flex items-center gap-1">
                              <TrendingDown className="h-4 w-4" />
                              Predicted Low ({horizon} Day)
                            </p>
                            <p className="text-3xl font-bold text-red-400 mt-1" data-testid="text-predicted-low">
                              ${formatPrice(Math.min(...forecastData.predictions.map(p => p.predicted_low || p.lower_bound)))}
                            </p>
                            <p className="text-sm text-red-300/70 mt-1">
                              {((Math.min(...forecastData.predictions.map(p => p.predicted_low || p.lower_bound)) - forecastData.currentPrice) / forecastData.currentPrice * 100).toFixed(2)}% from current
                            </p>
                          </div>
                          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                            <TrendingDown className="h-8 w-8 text-red-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Sentiment and Technical Indicators */}
                {forecastData.sentiment && forecastData.technicals && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Sentiment Card */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-400" />
                          Market Sentiment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Sentiment Score */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">Sentiment Score</span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white" data-testid="text-sentiment-score">
                                {forecastData.sentiment.score}
                              </span>
                              <Badge 
                                className={
                                  forecastData.sentiment.score <= 20 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                  forecastData.sentiment.score <= 40 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                  forecastData.sentiment.score <= 60 ? 'bg-gray-500/20 text-gray-200 border-gray-500/30' :
                                  forecastData.sentiment.score <= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }
                                data-testid="badge-sentiment-label"
                              >
                                {forecastData.sentiment.label}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Sentiment Bar */}
                          <div className="w-full bg-slate-700 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                              style={{ width: `${forecastData.sentiment.score}%` }}
                            />
                          </div>
                          
                          {/* Bull/Bear Percentages */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-green-500/10 rounded-lg p-2">
                              <p className="text-xs text-gray-200">Bullish</p>
                              <p className="text-lg font-bold text-green-400" data-testid="text-bullish-percent">
                                {forecastData.sentiment.bullishPercent}%
                              </p>
                            </div>
                            <div className="bg-gray-500/10 rounded-lg p-2">
                              <p className="text-xs text-gray-200">Neutral</p>
                              <p className="text-lg font-bold text-gray-200" data-testid="text-neutral-percent">
                                {forecastData.sentiment.neutralPercent}%
                              </p>
                            </div>
                            <div className="bg-red-500/10 rounded-lg p-2">
                              <p className="text-xs text-gray-200">Bearish</p>
                              <p className="text-lg font-bold text-red-400" data-testid="text-bearish-percent">
                                {forecastData.sentiment.bearishPercent}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Technical Indicators Card */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-400" />
                          Technical Indicators
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* RSI */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">RSI (14)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold" data-testid="text-rsi">
                                {forecastData.technicals.rsi}
                              </span>
                              <Badge 
                                className={
                                  forecastData.technicals.rsiSignal === 'oversold' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  forecastData.technicals.rsiSignal === 'overbought' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                  'bg-gray-500/20 text-gray-200 border-gray-500/30'
                                }
                                data-testid="badge-rsi-signal"
                              >
                                {forecastData.technicals.rsiSignal}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* MACD */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">MACD Signal</span>
                            <Badge 
                              className={
                                forecastData.technicals.macdSignal === 'bullish' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                forecastData.technicals.macdSignal === 'bearish' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-gray-500/20 text-gray-200 border-gray-500/30'
                              }
                              data-testid="badge-macd-signal"
                            >
                              {forecastData.technicals.macdSignal.toUpperCase()}
                            </Badge>
                          </div>
                          
                          {/* SMA20 */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">SMA (20)</span>
                            <span className="text-white font-semibold" data-testid="text-sma20">
                              ${formatPrice(forecastData.technicals.sma20)}
                            </span>
                          </div>
                          
                          {/* EMA12 */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">EMA (12)</span>
                            <span className="text-white font-semibold" data-testid="text-ema12">
                              ${formatPrice(forecastData.technicals.ema12)}
                            </span>
                          </div>
                          
                          {/* Volatility */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">Volatility</span>
                            <span className="text-white font-semibold" data-testid="text-volatility">
                              {forecastData.technicals.volatility}%
                            </span>
                          </div>
                          
                          {/* Price vs SMA */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-200">Price vs SMA</span>
                            <Badge 
                              className={
                                forecastData.technicals.priceVsSma === 'above' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                forecastData.technicals.priceVsSma === 'below' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-gray-500/20 text-gray-200 border-gray-500/30'
                              }
                              data-testid="badge-price-vs-sma"
                            >
                              {forecastData.technicals.priceVsSma.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Price Forecast Chart</CardTitle>
                    <CardDescription className="text-gray-200">
                      Historical prices (blue) and predicted prices (purple) with confidence bands
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${activeTab === 'forex' ? value.toFixed(2) : value.toFixed(0)}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#9CA3AF' }}
                            formatter={(value: number, name: string) => {
                              if (value === null) return ['-', name];
                              return [`$${formatPrice(value)}`, name];
                            }}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="upper" 
                            stroke="transparent"
                            fill="#A855F7"
                            fillOpacity={0.1}
                            name="Upper Bound"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="lower" 
                            stroke="transparent"
                            fill="#A855F7"
                            fillOpacity={0.1}
                            name="Lower Bound"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={false}
                            name="Actual Price"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#A855F7" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Predicted Price"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed" data-testid="text-summary">
                      {forecastData.summary}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">Methodology:</span> {forecastData.methodology}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
