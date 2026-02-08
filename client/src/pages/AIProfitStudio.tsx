import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PredictiveIndicator, PredictiveChip, type PredictiveData } from '@/components/shared/predictive-indicator';
import { Loader2, TrendingUp, Search, ChevronRight, Activity, Target, AlertTriangle, DollarSign, Bitcoin, Globe, ShoppingCart, Link2 } from 'lucide-react';
import { Link } from 'wouter';
import { http, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

type AssetType = 'stock' | 'crypto' | 'forex';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface Prediction {
  symbol: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  predictedReturn: number;
  direction: 'up' | 'down';
  confidence: number;
  profitPotential: number;
  riskLevel: number;
  profitRiskRatio: number;
  timeframeDays: number;
  meetsCriteria: boolean;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  reasoning: string;
  indicators: any;
  predictive?: PredictiveData;
}

interface ScanResult {
  totalScanned: number;
  meetingCriteria: number;
  topSignals: Prediction[];
  scanDurationMs: number;
  criteria: {
    highProbability: string;
    maxTimeframe: string;
    minProfitRiskRatio: string;
  };
}

export default function AIProfitStudio() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [activeTab, setActiveTab] = useState('scanner');
  const { toast } = useToast();

  // Fetch stats
  const { data: stats } = useQuery<{
    lastScanDate: string | null;
    totalStocksScanned: number;
    activeSignals: number;
    topSignalsToday: number;
    scanDuration: number;
  }>({
    queryKey: ['/api/ai-profit/stats'],
  });

  // Scan mutation
  const scanMutation = useMutation<ScanResult, Error, { useFullMarket: boolean }>({
    mutationFn: async (vars) => {
      return http.post<ScanResult>('/api/ai-profit/scan', vars);
    },
    onSuccess: (data: ScanResult) => {
      toast({
        title: 'Scan Complete!',
        description: `Found ${data.meetingCriteria} stocks meeting all 3 criteria from ${data.totalScanned} scanned`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-profit/signals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-profit/stats'] });
    },
    onError: () => {
      toast({
        title: 'Scan Failed',
        description: 'Unable to complete stock scan. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Predict mutation
  const predictMutation = useMutation<Prediction, Error, { symbol: string; assetType: AssetType }>({
    mutationFn: async ({ symbol, assetType }) => {
      return http.post<Prediction>('/api/ai-profit/predict', { symbol, assetType });
    },
    onSuccess: (data: Prediction) => {
      toast({
        title: `Analysis Complete: ${data.symbol}`,
        description: data.meetsCriteria 
          ? `${data.confidence}% confidence, ${data.profitRiskRatio.toFixed(1)}:1 profit/risk` 
          : 'Does not meet strict criteria',
      });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Unable to analyze this asset. Please check the symbol.',
        variant: 'destructive',
      });
    },
  });

  // Fetch active signals
  const { data: signals, isLoading: signalsLoading } = useQuery<Prediction[]>({
    queryKey: ['/api/ai-profit/signals'],
  });

  const handlePredict = () => {
    if (searchSymbol.trim()) {
      predictMutation.mutate({ symbol: searchSymbol.toUpperCase(), assetType });
    }
  };

  const getPlaceholder = () => {
    switch (assetType) {
      case 'crypto': return 'Enter crypto symbol (e.g., BTC, ETH, SOL)';
      case 'forex': return 'Enter forex pair (e.g., EURUSD, GBPUSD)';
      default: return 'Enter stock symbol (e.g., AAPL, TSLA, NVDA)';
    }
  };

  const getAssetIcon = () => {
    switch (assetType) {
      case 'crypto': return <Bitcoin className="h-4 w-4" />;
      case 'forex': return <Globe className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900" data-testid="page-title">
                  AI Profit Indicator Studio
                </h1>
                <WalkthroughGuide steps={MODULE_GUIDES['ai-profit-studio']} title="Guide" accentColor="emerald" />
                <Link href="/trading-connections">
                  <Button variant="outline" size="sm" className="border-green-500/50 text-green-600 hover:bg-green-50">
                    <Link2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Trading</span>
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm" data-testid="page-subtitle">
                Analyzing 8,639+ stocks daily with 3 strict criteria
              </p>
            </div>
            <Button 
              onClick={() => scanMutation.mutate({ useFullMarket: true })} 
              disabled={scanMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
              data-testid="button-run-scan"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Run Full Scan
                </>
              )}
            </Button>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <Card className="p-4">
                <div className="text-sm text-gray-600">Stocks Scanned</div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-stocks-scanned">
                  {stats.totalStocksScanned.toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Active Signals</div>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-active-signals">
                  {stats.activeSignals}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Top Signals Today</div>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-top-signals">
                  {stats.topSignalsToday}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Scan Duration</div>
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-scan-duration">
                  {(stats.scanDuration / 1000).toFixed(1)}s
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="scanner" data-testid="tab-scanner">
              <Activity className="mr-2 h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="predict" data-testid="tab-predict">
              <Target className="mr-2 h-4 w-4" />
              Analyze Stock
            </TabsTrigger>
            <TabsTrigger value="signals" data-testid="tab-signals">
              <TrendingUp className="mr-2 h-4 w-4" />
              Active Signals
            </TabsTrigger>
          </TabsList>

          {/* Scanner Tab */}
          <TabsContent value="scanner">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">AI Stock Scanner</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">3 Strict Criteria</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    High Probability: Minimum 70% confidence score
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Short Timeframe: Less than 60 days to target
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Profit/Risk Ratio: Minimum 1.5:1 reward-to-risk
                  </li>
                </ul>
              </div>

              {scanMutation.data && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Top {scanMutation.data.topSignals.length} Signals
                    </h3>
                    <Badge variant="default">{scanMutation.data.meetingCriteria} stocks qualify</Badge>
                  </div>

                  <div className="space-y-3">
                    {scanMutation.data.topSignals.map((signal: Prediction, idx: number) => (
                      <Card key={idx} className="p-4 hover:shadow-md transition-shadow" data-testid={`signal-card-${idx}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg" data-testid={`signal-symbol-${idx}`}>{signal.symbol}</h4>
                              <Badge variant="default" className="bg-green-100 text-green-800" data-testid={`signal-direction-${idx}`}>
                                {signal.direction.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" data-testid={`signal-confidence-${idx}`}>
                                {signal.confidence}% confident
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Entry</div>
                                <div className="font-semibold" data-testid={`signal-entry-${idx}`}>${signal.entryPrice.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Target</div>
                                <div className="font-semibold text-green-600" data-testid={`signal-target-${idx}`}>
                                  ${signal.targetPrice.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Stop Loss</div>
                                <div className="font-semibold text-red-600" data-testid={`signal-stop-${idx}`}>
                                  ${signal.stopLoss.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Profit/Risk</div>
                                <div className="font-semibold text-blue-600" data-testid={`signal-ratio-${idx}`}>
                                  {signal.profitRiskRatio.toFixed(1)}:1
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              Timeframe: {signal.timeframeDays} days • Return: {signal.predictedReturn.toFixed(1)}%
                            </div>
                            {signal.predictive && (
                              <div className="mt-3">
                                <PredictiveIndicator data={signal.predictive} compact={true} />
                              </div>
                            )}
                            <div className="mt-3">
                              <Link href={`/trading-connections?execute=${signal.symbol}&side=${signal.direction === 'up' ? 'buy' : 'sell'}&entry=${signal.entryPrice}&target=${signal.targetPrice}&stop=${signal.stopLoss}`}>
                                <Button 
                                  size="sm" 
                                  className={`${signal.direction === 'up' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                  {signal.direction === 'up' ? 'Buy' : 'Sell'} {signal.symbol}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!scanMutation.data && (
                <div className="text-center py-12 text-gray-300">
                  <Search className="mx-auto h-12 w-12 mb-4 text-gray-200" />
                  <p>Click "Run Full Scan" to analyze 8,639+ stocks</p>
                  <p className="text-sm mt-2">Only the top signals meeting all 3 criteria will be shown</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Predict Tab */}
          <TabsContent value="predict">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Analyze Any Asset</h2>
              <p className="text-gray-600 mb-4">Analyze stocks, cryptocurrencies, or forex pairs with AI-powered predictions</p>
              
              {/* Asset Type Selector */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={assetType === 'stock' ? 'default' : 'outline'}
                  onClick={() => setAssetType('stock')}
                  className="flex-1"
                  data-testid="button-asset-stock"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Stocks
                </Button>
                <Button
                  variant={assetType === 'crypto' ? 'default' : 'outline'}
                  onClick={() => setAssetType('crypto')}
                  className="flex-1"
                  data-testid="button-asset-crypto"
                >
                  <Bitcoin className="mr-2 h-4 w-4" />
                  Crypto
                </Button>
                <Button
                  variant={assetType === 'forex' ? 'default' : 'outline'}
                  onClick={() => setAssetType('forex')}
                  className="flex-1"
                  data-testid="button-asset-forex"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Forex
                </Button>
              </div>

              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200">
                    {getAssetIcon()}
                  </span>
                  <Input
                    placeholder={getPlaceholder()}
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                    className="pl-10"
                    data-testid="input-asset-symbol"
                  />
                </div>
                <Button 
                  onClick={handlePredict}
                  disabled={predictMutation.isPending || !searchSymbol.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="button-analyze-asset"
                >
                  {predictMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Examples */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <span className="text-sm text-gray-300">Quick:</span>
                {assetType === 'stock' && ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN'].map(s => (
                  <Button key={s} variant="ghost" size="sm" onClick={() => setSearchSymbol(s)} data-testid={`quick-${s}`}>{s}</Button>
                ))}
                {assetType === 'crypto' && ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'].map(s => (
                  <Button key={s} variant="ghost" size="sm" onClick={() => setSearchSymbol(s)} data-testid={`quick-${s}`}>{s}</Button>
                ))}
                {assetType === 'forex' && ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'].map(s => (
                  <Button key={s} variant="ghost" size="sm" onClick={() => setSearchSymbol(s)} data-testid={`quick-${s}`}>{s}</Button>
                ))}
              </div>

              {predictMutation.data && (
                <div className="space-y-4">
                  <Card className="p-6 border-2" style={{
                    borderColor: predictMutation.data.meetsCriteria ? '#10b981' : '#ef4444'
                  }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold" data-testid="prediction-symbol">
                          {predictMutation.data.symbol}
                        </h3>
                        <p className="text-gray-600">AI Analysis Results</p>
                      </div>
                      {predictMutation.data.meetsCriteria ? (
                        <Badge className="bg-green-100 text-green-800" data-testid="prediction-status">
                          ✓ Meets All 3 Criteria
                        </Badge>
                      ) : (
                        <Badge variant="destructive" data-testid="prediction-status">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Does Not Qualify
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Confidence Score</div>
                        <div className="text-2xl font-bold" data-testid="prediction-confidence">
                          {predictMutation.data.confidence}%
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Timeframe</div>
                        <div className="text-2xl font-bold" data-testid="prediction-timeframe">
                          {predictMutation.data.timeframeDays} days
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Profit/Risk Ratio</div>
                        <div className="text-2xl font-bold" data-testid="prediction-profit-risk">
                          {predictMutation.data.profitRiskRatio.toFixed(1)}:1
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Entry Price</span>
                        <span className="font-semibold" data-testid="prediction-entry">
                          ${predictMutation.data.entryPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Target Price</span>
                        <span className="font-semibold text-green-600" data-testid="prediction-target">
                          ${predictMutation.data.targetPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Stop Loss</span>
                        <span className="font-semibold text-red-600" data-testid="prediction-stop">
                          ${predictMutation.data.stopLoss.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Predicted Return</span>
                        <span className="font-semibold text-blue-600" data-testid="prediction-return">
                          {predictMutation.data.predictedReturn.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {predictMutation.data.reasoning && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">AI Reasoning</h4>
                        <p className="text-sm text-gray-700" data-testid="prediction-reasoning">
                          {predictMutation.data.reasoning}
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {!predictMutation.data && (
                <div className="text-center py-12 text-gray-300">
                  <Target className="mx-auto h-12 w-12 mb-4 text-gray-200" />
                  <p>Enter any {assetType === 'stock' ? 'stock' : assetType === 'crypto' ? 'cryptocurrency' : 'forex pair'} symbol to get AI-powered analysis</p>
                  <p className="text-sm mt-2">Instant evaluation against all 3 strict criteria</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Active Trading Signals</h2>
              
              {signalsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-200" />
                  <p className="text-gray-300 mt-4">Loading signals...</p>
                </div>
              ) : signals && signals.length > 0 ? (
                <div className="space-y-3">
                  {signals.map((signal: any, idx: number) => (
                    <Card key={idx} className="p-4 hover:shadow-md transition-shadow" data-testid={`active-signal-${idx}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg">{signal.symbol}</h4>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {signal.signalType.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {parseFloat(signal.confidence)}% confident
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Entry</div>
                              <div className="font-semibold">${parseFloat(signal.entryPrice).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Target</div>
                              <div className="font-semibold text-green-600">
                                ${parseFloat(signal.targetPrice).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Stop Loss</div>
                              <div className="font-semibold text-red-600">
                                ${parseFloat(signal.stopLoss).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Composite Score</div>
                              <div className="font-semibold text-blue-600">
                                {parseFloat(signal.compositeScore).toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-300">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4 text-gray-200" />
                  <p>No active signals yet</p>
                  <p className="text-sm mt-2">Run a scan to generate new trading signals</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
