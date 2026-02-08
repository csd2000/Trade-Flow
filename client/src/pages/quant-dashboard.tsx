import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PredictiveIndicator, PredictiveChip, type PredictiveData } from '@/components/shared/predictive-indicator';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Search, 
  RefreshCw,
  Target,
  AlertTriangle,
  Zap,
  Brain,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTTS } from '@/hooks/use-tts';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

interface QuantAsset {
  id: number;
  symbol: string;
  name: string;
  assetType: string;
  lastPrice: string;
  lastUpdated: string;
  latestSignal?: any;
  latestIndicator?: any;
}

interface QuantSignal {
  id: number;
  assetId: number;
  signalType: string;
  direction: string;
  strength: string;
  confidence: string;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  riskRewardRatio: string;
  reasoning: string;
  keyFactors: string[];
  generatedAt: string;
  predictive?: PredictiveData;
}

interface DashboardData {
  assets: QuantAsset[];
  signals: QuantSignal[];
  signalStats: {
    total: number;
    bullish: number;
    bearish: number;
    neutral: number;
  };
  fearGreed: {
    value: number;
    label: string;
  };
  lastUpdated: string;
}

function SignalBadge({ type }: { type: string }) {
  const variants: Record<string, { color: string; icon: any }> = {
    strong_buy: { color: 'bg-green-600 text-white', icon: ArrowUpRight },
    buy: { color: 'bg-green-500 text-white', icon: TrendingUp },
    hold: { color: 'bg-gray-500 text-white', icon: Minus },
    sell: { color: 'bg-red-500 text-white', icon: TrendingDown },
    strong_sell: { color: 'bg-red-600 text-white', icon: ArrowDownRight }
  };
  
  const config = variants[type] || variants.hold;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {type.replace('_', ' ').toUpperCase()}
    </Badge>
  );
}

function DirectionBadge({ direction }: { direction: string }) {
  const colors: Record<string, string> = {
    bullish: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    bearish: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  };
  
  return (
    <Badge className={colors[direction] || colors.neutral}>
      {direction.charAt(0).toUpperCase() + direction.slice(1)}
    </Badge>
  );
}

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const getColor = (val: number) => {
    if (val <= 25) return 'text-red-600';
    if (val <= 45) return 'text-orange-500';
    if (val <= 55) return 'text-yellow-500';
    if (val <= 75) return 'text-lime-500';
    return 'text-green-600';
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center">
          <div 
            className="w-28 h-14 rounded-t-full border-8 border-b-0"
            style={{
              borderColor: value <= 25 ? '#dc2626' : value <= 45 ? '#f97316' : value <= 55 ? '#eab308' : value <= 75 ? '#84cc16' : '#16a34a',
              transform: `rotate(${(value / 100) * 180 - 90}deg)`,
              transformOrigin: 'bottom center'
            }}
          />
        </div>
      </div>
      <div className={`text-3xl font-bold ${getColor(value)}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function IndicatorCard({ label, value, type }: { label: string; value: string | number; type?: 'bullish' | 'bearish' | 'neutral' }) {
  const colors = {
    bullish: 'text-green-600 dark:text-green-400',
    bearish: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-200'
  };
  
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${type ? colors[type] : ''}`}>
        {typeof value === 'number' ? value.toFixed(2) : value}
      </div>
    </div>
  );
}

export default function QuantDashboard() {
  const [symbol, setSymbol] = useState('');
  const { toast } = useToast();
  const { speak, stop, isPlaying, isLoading: ttsLoading } = useTTS();
  
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery<DashboardData>({
    queryKey: ['/api/quant/dashboard']
  });
  
  const analyzeMutation = useMutation({
    mutationFn: async (sym: string) => {
      const response = await fetch(`/api/quant/analyze/${sym}`);
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Analysis Complete',
        description: `${data.symbol}: ${data.signal.signalType.replace('_', ' ').toUpperCase()} signal generated`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quant/dashboard'] });
      setSymbol('');
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze asset',
        variant: 'destructive'
      });
    }
  });
  
  const handleAnalyze = () => {
    if (symbol.trim()) {
      analyzeMutation.mutate(symbol.trim().toUpperCase());
    }
  };
  
  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Quantitative AI Trading
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1">
              Advanced multi-factor analysis with real-time signals
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <WalkthroughGuide steps={MODULE_GUIDES['quant']} title="Guide" accentColor="blue" />
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Symbol (AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="pl-8 sm:pl-9 w-full sm:w-36 md:w-48 h-9 text-sm"
                data-testid="input-symbol"
              />
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={!symbol.trim() || analyzeMutation.isPending}
              data-testid="button-analyze"
              className="h-9 text-xs sm:text-sm px-2 sm:px-4"
            >
              {analyzeMutation.isPending ? (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin sm:mr-2" />
              ) : (
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Analyze</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refetchDashboard()}
              data-testid="button-refresh"
              className="h-9 px-2 sm:px-3"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Signals</p>
                  <p className="text-lg sm:text-2xl font-bold" data-testid="text-total-signals">
                    {dashboard?.signalStats.total || 0}
                  </p>
                </div>
                <Activity className="h-5 w-5 sm:h-8 sm:w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Bullish</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600" data-testid="text-bullish-signals">
                    {dashboard?.signalStats.bullish || 0}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Bearish</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600" data-testid="text-bearish-signals">
                    {dashboard?.signalStats.bearish || 0}
                  </p>
                </div>
                <TrendingDown className="h-5 w-5 sm:h-8 sm:w-8 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">F&G</p>
                  <p className="text-lg sm:text-2xl font-bold" data-testid="text-fear-greed">
                    {dashboard?.fearGreed.value || 50}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {dashboard?.fearGreed.label || 'Neutral'}
                  </p>
                </div>
                <Gauge className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs - Responsive */}
        <Tabs defaultValue="signals" className="space-y-3 sm:space-y-4">
          <TabsList className="w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="signals" data-testid="tab-signals" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Active </span>Signals
            </TabsTrigger>
            <TabsTrigger value="assets" data-testid="tab-assets" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="indicators" data-testid="tab-indicators" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Technical
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signals" className="space-y-4">
            {dashboardLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading signals...</p>
                </CardContent>
              </Card>
            ) : dashboard?.signals && dashboard.signals.length > 0 ? (
              <div className="grid gap-4">
                {dashboard.signals.map((signal: any) => {
                  const asset = dashboard.assets.find(a => a.id === signal.assetId);
                  return (
                    <Card key={signal.id} data-testid={`card-signal-${signal.id}`}>
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{asset?.symbol || 'N/A'}</span>
                                <SignalBadge type={signal.signalType} />
                                <DirectionBadge direction={signal.direction} />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDate(signal.generatedAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Entry</span>
                              <div className="font-semibold">{formatPrice(signal.entryPrice)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Target</span>
                              <div className="font-semibold text-green-600">{formatPrice(signal.targetPrice)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stop Loss</span>
                              <div className="font-semibold text-red-600">{formatPrice(signal.stopLoss)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">R:R Ratio</span>
                              <div className="font-semibold">{parseFloat(signal.riskRewardRatio).toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Confidence</div>
                              <div className="font-bold text-lg">{parseFloat(signal.confidence).toFixed(0)}%</div>
                            </div>
                            <Progress 
                              value={parseFloat(signal.confidence)} 
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                        
                        {signal.keyFactors && signal.keyFactors.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {signal.keyFactors.map((factor: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {signal.predictive && (
                          <div className="mt-3">
                            <PredictiveIndicator data={signal.predictive} compact={true} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Signals Yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Enter a stock symbol above to generate your first quantitative analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-4">
            {dashboard?.assets && dashboard.assets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.assets.map((asset: any) => (
                  <Card key={asset.id} data-testid={`card-asset-${asset.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{asset.symbol}</CardTitle>
                        <Badge variant="outline">{asset.assetType}</Badge>
                      </div>
                      <CardDescription>{asset.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Price</span>
                          <span className="font-semibold">{formatPrice(asset.lastPrice)}</span>
                        </div>
                        
                        {asset.latestSignal && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Signal</span>
                            <SignalBadge type={asset.latestSignal.signalType} />
                          </div>
                        )}
                        
                        {asset.latestIndicator && (
                          <div className="pt-2 border-t">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-xs text-muted-foreground">RSI</div>
                                <div className={`font-semibold ${
                                  parseFloat(asset.latestIndicator.rsi14) > 70 ? 'text-red-600' :
                                  parseFloat(asset.latestIndicator.rsi14) < 30 ? 'text-green-600' : ''
                                }`}>
                                  {parseFloat(asset.latestIndicator.rsi14).toFixed(1)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">MACD</div>
                                <div className={`font-semibold ${
                                  parseFloat(asset.latestIndicator.macdHistogram) > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {parseFloat(asset.latestIndicator.macdHistogram) > 0 ? '+' : ''}
                                  {parseFloat(asset.latestIndicator.macdHistogram).toFixed(3)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">ATR</div>
                                <div className="font-semibold">
                                  {parseFloat(asset.latestIndicator.atr14).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground text-right">
                          Updated: {asset.lastUpdated ? formatDate(asset.lastUpdated) : 'Never'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Assets Analyzed</h3>
                  <p className="text-muted-foreground mt-2">
                    Start by analyzing a stock symbol to see detailed asset information
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="indicators" className="space-y-4">
            {dashboard?.assets && dashboard.assets.length > 0 ? (
              dashboard.assets.filter((a: any) => a.latestIndicator).map((asset: any) => (
                <Card key={asset.id} data-testid={`card-indicators-${asset.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {asset.symbol}
                      <span className="text-muted-foreground font-normal text-base">
                        {formatPrice(asset.lastPrice)}
                      </span>
                    </CardTitle>
                    <CardDescription>Technical Indicators Overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      <IndicatorCard 
                        label="RSI (14)" 
                        value={parseFloat(asset.latestIndicator.rsi14)}
                        type={parseFloat(asset.latestIndicator.rsi14) > 70 ? 'bearish' : 
                              parseFloat(asset.latestIndicator.rsi14) < 30 ? 'bullish' : 'neutral'}
                      />
                      <IndicatorCard 
                        label="MACD Line" 
                        value={parseFloat(asset.latestIndicator.macdLine)}
                        type={parseFloat(asset.latestIndicator.macdLine) > 0 ? 'bullish' : 'bearish'}
                      />
                      <IndicatorCard 
                        label="MACD Signal" 
                        value={parseFloat(asset.latestIndicator.macdSignal)}
                      />
                      <IndicatorCard 
                        label="Stoch %K" 
                        value={parseFloat(asset.latestIndicator.stochK)}
                        type={parseFloat(asset.latestIndicator.stochK) > 80 ? 'bearish' :
                              parseFloat(asset.latestIndicator.stochK) < 20 ? 'bullish' : 'neutral'}
                      />
                      <IndicatorCard 
                        label="EMA 9" 
                        value={parseFloat(asset.latestIndicator.ema9)}
                      />
                      <IndicatorCard 
                        label="EMA 20" 
                        value={parseFloat(asset.latestIndicator.ema20)}
                      />
                      <IndicatorCard 
                        label="EMA 50" 
                        value={parseFloat(asset.latestIndicator.ema50)}
                      />
                      <IndicatorCard 
                        label="EMA 200" 
                        value={parseFloat(asset.latestIndicator.ema200)}
                      />
                      <IndicatorCard 
                        label="BB Upper" 
                        value={parseFloat(asset.latestIndicator.bollingerUpper)}
                      />
                      <IndicatorCard 
                        label="BB Middle" 
                        value={parseFloat(asset.latestIndicator.bollingerMiddle)}
                      />
                      <IndicatorCard 
                        label="BB Lower" 
                        value={parseFloat(asset.latestIndicator.bollingerLower)}
                      />
                      <IndicatorCard 
                        label="ATR (14)" 
                        value={parseFloat(asset.latestIndicator.atr14)}
                      />
                      <IndicatorCard 
                        label="Volatility %" 
                        value={parseFloat(asset.latestIndicator.volatilityPercent)}
                        type={parseFloat(asset.latestIndicator.volatilityPercent) > 5 ? 'bearish' : 'neutral'}
                      />
                      <IndicatorCard 
                        label="Volume Ratio" 
                        value={parseFloat(asset.latestIndicator.volumeRatio)}
                        type={parseFloat(asset.latestIndicator.volumeRatio) > 1.5 ? 'bullish' : 'neutral'}
                      />
                      <IndicatorCard 
                        label="OBV" 
                        value={parseFloat(asset.latestIndicator.obv).toLocaleString()}
                      />
                      <IndicatorCard 
                        label="VPT" 
                        value={parseFloat(asset.latestIndicator.vpt).toLocaleString()}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Technical Data</h3>
                  <p className="text-muted-foreground mt-2">
                    Analyze an asset to view comprehensive technical indicators
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {dashboard?.lastUpdated && (
          <div className="text-center text-sm text-muted-foreground">
            Dashboard last updated: {formatDate(dashboard.lastUpdated)}
          </div>
        )}
      </div>
    </div>
  );
}
