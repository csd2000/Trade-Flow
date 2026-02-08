import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, Search, RefreshCw, Target, 
  Minus, Brain, Zap, Radio, BarChart3, Landmark, Gauge, AlertTriangle, Sparkles, Volume2, VolumeX, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTTS } from '@/hooks/use-tts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

interface LiveQuote {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
  isLive: boolean;
  age: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MacroContext {
  fedRate: string;
  fedStance: string;
  inflation: number;
  fearGreed: { value: number; label: string };
  overallBias: string;
  adjustment: string;
}

interface AIForecast {
  symbol: string;
  currentPrice: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  targets: {
    '1h': { price: number; confidence: number };
    '4h': { price: number; confidence: number };
    '24h': { price: number; confidence: number };
    '7d': { price: number; confidence: number };
  };
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  keyLevels: { support: number[]; resistance: number[] };
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  macroContext?: MacroContext;
  generatedAt: string;
}

interface MacroSnapshot {
  timestamp: string;
  fedPolicy: {
    currentRate: { low: number; high: number };
    policyStance: string;
    rateDirection: string;
  };
  inflation: {
    cpi: { value: number; trend: string };
    level: string;
  };
  employment: {
    laborMarket: string;
    unemploymentRate: number;
  };
  fearGreedIndex: { value: number; label: string };
  overallBias: string;
  keyRisks: string[];
  opportunities: string[];
}

const CRYPTO_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
const STOCK_TIMEFRAMES = ['5m', '15m', '1h', '1d'];

const POPULAR = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { symbol: 'AAPL', name: 'Apple', type: 'stock' },
  { symbol: 'NVDA', name: 'Nvidia', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock' }
];

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(6);
}

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const getColor = (v: number) => {
    if (v <= 25) return 'text-red-500';
    if (v <= 45) return 'text-orange-500';
    if (v <= 55) return 'text-yellow-500';
    if (v <= 75) return 'text-lime-500';
    return 'text-green-500';
  };

  return (
    <div className="flex items-center gap-2">
      <Gauge className={`w-4 h-4 ${getColor(value)}`} />
      <span className={`font-bold ${getColor(value)}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function MacroPanel({ macro }: { macro: MacroSnapshot }) {
  const biasColor = macro.overallBias === 'bullish' ? 'text-emerald-500' : macro.overallBias === 'bearish' ? 'text-red-500' : 'text-yellow-500';
  
  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Landmark className="w-4 h-4 text-blue-400" />
          Fed Policy & Macro Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Fed Funds Rate</div>
            <div className="font-bold">{macro.fedPolicy.currentRate.low}% - {macro.fedPolicy.currentRate.high}%</div>
            <Badge variant="outline" className="mt-1 text-xs capitalize">{macro.fedPolicy.rateDirection}</Badge>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">CPI Inflation</div>
            <div className="font-bold">{macro.inflation.cpi.value}%</div>
            <span className="text-xs text-muted-foreground capitalize">{macro.inflation.cpi.trend}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <div>
            <div className="text-xs text-muted-foreground">Fear & Greed</div>
            <FearGreedGauge value={macro.fearGreedIndex.value} label={macro.fearGreedIndex.label} />
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Macro Bias</div>
            <span className={`font-bold uppercase ${biasColor}`}>{macro.overallBias}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Key Risks
          </div>
          <div className="text-xs space-y-0.5">
            {macro.keyRisks.slice(0, 2).map((risk, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-red-400">•</span>
                <span className="text-muted-foreground">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Opportunities
          </div>
          <div className="text-xs space-y-0.5">
            {macro.opportunities.slice(0, 2).map((opp, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-emerald-400">•</span>
                <span className="text-muted-foreground">{opp}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceChart({ candles, forecast }: { candles: CandleData[]; forecast: AIForecast | null }) {
  if (!candles.length) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Select a symbol to view chart</p>
      </div>
    );
  }

  const data = candles.map(c => ({
    time: new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    price: c.close
  }));

  const prices = candles.map(c => c.close);
  const min = Math.min(...prices) * 0.998;
  const max = Math.max(...prices) * 1.002;
  const isUp = candles[candles.length - 1].close >= candles[0].close;

  return (
    <div className="h-64" data-testid="chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[min, max]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} orientation="right" tickFormatter={v => `$${formatPrice(v)}`} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} formatter={(v: number) => [`$${formatPrice(v)}`, 'Price']} />
          <Area type="monotone" dataKey="price" stroke={isUp ? '#10b981' : '#ef4444'} fill="url(#grad)" strokeWidth={2} />
          {forecast && (
            <>
              <ReferenceLine y={forecast.stopLoss} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={forecast.takeProfit} stroke="#10b981" strokeDasharray="4 4" />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AITrader() {
  const [input, setInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('5m');
  const [assetType, setAssetType] = useState<'crypto' | 'stock'>('crypto');
  const { toast } = useToast();
  const { speak, stop, isPlaying, isLoading: ttsLoading } = useTTS();

  const timeframes = assetType === 'crypto' ? CRYPTO_TIMEFRAMES : STOCK_TIMEFRAMES;

  const macroQuery = useQuery({
    queryKey: ['/api/live/macro'],
    queryFn: async () => {
      const res = await fetch('/api/live/macro');
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data as MacroSnapshot;
    },
    refetchInterval: 30000,
    staleTime: 15000
  });

  const quoteQuery = useQuery({
    queryKey: ['/api/live/quote', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/live/quote/${symbol}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data as LiveQuote;
    },
    enabled: !!symbol,
    refetchInterval: 2000,
    staleTime: 1000
  });

  const candlesQuery = useQuery({
    queryKey: ['/api/live/candles', symbol, timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/live/candles/${symbol}?interval=${timeframe}&limit=100`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data.candles as CandleData[];
    },
    enabled: !!symbol,
    refetchInterval: 5000,
    staleTime: 2000
  });

  const forecastMutation = useMutation({
    mutationFn: async (sym: string) => {
      const res = await fetch(`/api/live/forecast/${sym}?interval=${timeframe}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data as AIForecast;
    },
    onSuccess: (data) => {
      toast({ title: 'AI Analysis Complete', description: `${data.direction.toUpperCase()} signal detected` });
    },
    onError: (err: any) => {
      toast({ title: 'Analysis Failed', description: err.message, variant: 'destructive' });
    }
  });

  const analyze = useCallback((sym?: string) => {
    const target = (sym || input).trim().toUpperCase();
    if (!target) return;
    
    const isCrypto = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'MATIC', 'DOT', 'UNI', 'ATOM', 'LTC', 'BNB', 'PEPE', 'SHIB'].includes(target);
    setAssetType(isCrypto ? 'crypto' : 'stock');
    
    if (!isCrypto && !STOCK_TIMEFRAMES.includes(timeframe)) {
      setTimeframe('5m');
    }
    
    setSymbol(target);
    setInput(target);
    forecastMutation.mutate(target);
  }, [input, timeframe, forecastMutation]);

  const quote = quoteQuery.data;
  const candles = candlesQuery.data || [];
  const forecast = forecastMutation.data;
  const macro = macroQuery.data;
  const isLoading = quoteQuery.isLoading || candlesQuery.isLoading || forecastMutation.isPending;

  const dirColors = { bullish: 'text-emerald-500', bearish: 'text-red-500', neutral: 'text-gray-200' };
  const DirIcon = forecast?.direction === 'bullish' ? TrendingUp : forecast?.direction === 'bearish' ? TrendingDown : Minus;

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <IntermarketBanner />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold" data-testid="title">Live AI Trader</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Real-time data + Fed policy + AI predictions</p>
          </div>
        </div>
        <WalkthroughGuide steps={MODULE_GUIDES['ai-trader']} title="Guide" accentColor="orange" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                placeholder="BTC, AAPL..."
                className="pl-9"
                data-testid="input-symbol"
              />
            </div>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24" data-testid="select-tf">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map(tf => (
                  <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => analyze()} disabled={isLoading || !input.trim()} data-testid="btn-analyze">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              Analyze
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {POPULAR.map(p => (
              <Button
                key={p.symbol}
                variant={symbol === p.symbol ? 'default' : 'outline'}
                size="sm"
                onClick={() => analyze(p.symbol)}
                data-testid={`btn-${p.symbol.toLowerCase()}`}
              >
                {p.symbol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          {macro && <MacroPanel macro={macro} />}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {symbol ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{symbol}</CardTitle>
                      {quote && (
                        <span className="text-2xl font-bold">${formatPrice(quote.price)}</span>
                      )}
                      {quoteQuery.isFetching && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </div>
                    {quote && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${quote.isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{quote.age}</span>
                        <span>via {quote.source}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <PriceChart candles={candles} forecast={forecast ?? null} />
                </CardContent>
              </Card>

              {forecast && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Price Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(forecast.targets).map(([period, data]) => (
                        <div key={period} className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-xs text-muted-foreground uppercase mb-1">{period}</div>
                          <div className="text-lg font-bold">${formatPrice(data.price)}</div>
                          <div className="text-xs text-muted-foreground">{data.confidence}% conf</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-dashed h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">Select a symbol above to start analyzing</p>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          {forecastMutation.isPending ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto mb-3 text-primary animate-pulse" />
                <p className="text-muted-foreground">Analyzing {symbol}...</p>
                <p className="text-xs text-muted-foreground mt-2">Factoring in Fed policy & macro data</p>
              </CardContent>
            </Card>
          ) : forecast ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Signal
                  </CardTitle>
                  <Badge className={`${dirColors[forecast.direction]} bg-opacity-20`}>
                    <DirIcon className="w-3 h-3 mr-1" />
                    {forecast.direction.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-blue-500/10">
                    <div className="text-xs text-muted-foreground">Entry</div>
                    <div className="font-bold text-blue-500">${formatPrice(forecast.entryPrice)}</div>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10">
                    <div className="text-xs text-muted-foreground">Target</div>
                    <div className="font-bold text-emerald-500">${formatPrice(forecast.takeProfit)}</div>
                  </div>
                  <div className="p-2 rounded bg-red-500/10">
                    <div className="text-xs text-muted-foreground">Stop</div>
                    <div className="font-bold text-red-500">${formatPrice(forecast.stopLoss)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Signal Strength</span>
                    <span className="font-bold">{forecast.strength}%</span>
                  </div>
                  <Progress value={forecast.strength} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge variant={forecast.riskLevel === 'low' ? 'outline' : forecast.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                    {forecast.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                {forecast.macroContext && (
                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1">
                      <Landmark className="w-3 h-3" />
                      Macro-Adjusted
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Fed Rate:</span>
                        <span className="font-medium">{forecast.macroContext.fedRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stance:</span>
                        <span className="font-medium capitalize">{forecast.macroContext.fedStance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fear/Greed:</span>
                        <span className="font-medium">{forecast.macroContext.fearGreed.value} ({forecast.macroContext.fearGreed.label})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Macro Bias:</span>
                        <span className={`font-medium capitalize ${
                          forecast.macroContext.overallBias === 'bullish' ? 'text-emerald-500' : 
                          forecast.macroContext.overallBias === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                        }`}>{forecast.macroContext.overallBias}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Key Levels</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Support</div>
                      {forecast.keyLevels.support.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          ${formatPrice(s)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Resistance</div>
                      {forecast.keyLevels.resistance.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          ${formatPrice(r)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground pt-2 border-t">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1">{forecast.reasoning}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => isPlaying ? stop() : speak(forecast.reasoning)}
                      disabled={ttsLoading}
                      className="flex-shrink-0 h-8 w-8 p-0"
                      title={isPlaying ? "Stop reading" : "AI Read Analysis"}
                    >
                      {ttsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  Updated {new Date(forecast.generatedAt).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ) : symbol ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">Click Analyze to get AI predictions</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
