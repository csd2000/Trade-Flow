import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Search, 
  Bell, 
  BarChart3,
  Activity,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { apiJson } from '@/lib/queryClient';

interface Forecast {
  symbol: string;
  assetClass: string;
  currentPrice: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  entryZone: { low: number; high: number };
  targets: { price: number; probability: number }[];
  stopLoss: number;
  riskRewardRatio: number;
  timeframe: string;
  setupStatus: 'WAIT' | 'EXECUTE' | 'PAUSED';
  technicalScore: number;
  sentimentScore: number;
  reasoning: string;
  indicators: any;
  alertTriggered: boolean;
  generatedAt: string;
}

interface AccuracyMetrics {
  totalPredictions: number;
  correctPredictions: number;
  winRate: number;
  averageReturn: number;
  byAssetClass: Record<string, { total: number; correct: number; winRate: number }>;
  last7Days: { winRate: number; predictions: number };
  last30Days: { winRate: number; predictions: number };
}

export default function UniversalForecaster() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');

  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useQuery<{ success: boolean; data: Forecast }>({
    queryKey: ['/api/forecaster/forecast', searchSymbol],
    enabled: searchSymbol.length > 0,
  });

  const { data: alertsData } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/forecaster/alerts'],
  });

  const { data: accuracyData } = useQuery<{ success: boolean; data: AccuracyMetrics }>({
    queryKey: ['/api/forecaster/accuracy'],
  });

  const scanMutation = useMutation({
    mutationFn: async (assetClass?: string) => {
      return apiJson<{ success: boolean; data: any }>('/api/forecaster/scan/market', 'POST', { assetClass });
    }
  });

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      refetchForecast();
    }
  };

  const handleScan = (assetClass?: string) => {
    scanMutation.mutate(assetClass);
  };

  const forecast = forecastData?.data as Forecast | undefined;
  const alerts = alertsData?.data || [];
  const accuracy = accuracyData?.data;
  const scanResults = scanMutation.data?.data;

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BULLISH': return 'text-green-500';
      case 'BEARISH': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSetupBadge = (status: string) => {
    switch (status) {
      case 'EXECUTE': return <Badge className="bg-green-500">EXECUTE NOW</Badge>;
      case 'WAIT': return <Badge className="bg-yellow-500">WAIT FOR SETUP</Badge>;
      default: return <Badge className="bg-gray-500">PAUSED</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              Universal AI Forecaster
            </h1>
            <p className="text-slate-200 mt-1">Multi-asset predictions with real-time alerts</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
              <Input
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol (SPY, BTC, EURUSD)"
                className="bg-transparent border-none w-64 text-white placeholder:text-slate-300"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {accuracy && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm">Total Predictions</p>
                    <p className="text-2xl font-bold text-white">{accuracy.totalPredictions}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm">Win Rate (30d)</p>
                    <p className="text-2xl font-bold text-green-400">{accuracy.last30Days.winRate.toFixed(1)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm">Avg Return</p>
                    <p className="text-2xl font-bold text-purple-400">{accuracy.averageReturn.toFixed(2)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm">Active Alerts</p>
                    <p className="text-2xl font-bold text-yellow-400">{alerts.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Market Scanner
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
              <Search className="w-4 h-4 mr-2" />
              Single Analysis
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
              <Bell className="w-4 h-4 mr-2" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="data-[state=active]:bg-blue-600">
              <Target className="w-4 h-4 mr-2" />
              Accuracy Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Market Scanner</span>
                  <div className="flex gap-2">
                    <Button onClick={() => handleScan('stock')} size="sm" variant="outline" className="border-slate-600">
                      Stocks
                    </Button>
                    <Button onClick={() => handleScan('crypto')} size="sm" variant="outline" className="border-slate-600">
                      Crypto
                    </Button>
                    <Button onClick={() => handleScan('forex')} size="sm" variant="outline" className="border-slate-600">
                      Forex
                    </Button>
                    <Button onClick={() => handleScan()} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      {scanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Scan All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scanMutation.isPending && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="ml-3 text-slate-200">Scanning markets...</span>
                  </div>
                )}

                {scanResults && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-200">
                      <span>Scanned: {scanResults.scannedCount} assets</span>
                      <span>•</span>
                      <span className="text-green-400">Execute: {scanResults.topSignals?.length || 0}</span>
                    </div>

                    {scanResults.topSignals?.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-green-400 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Top Signals (Ready to Execute)
                        </h3>
                        <div className="grid gap-3">
                          {scanResults.topSignals.map((sig: Forecast) => (
                            <div key={sig.symbol} className="bg-slate-700/50 rounded-lg p-4 border border-green-500/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-lg">{sig.symbol}</span>
                                  <Badge className="bg-slate-600">{sig.assetClass}</Badge>
                                  <span className={`font-semibold ${getDirectionColor(sig.direction)}`}>
                                    {sig.direction === 'BULLISH' ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                                    {sig.direction}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-200">Confidence:</span>
                                  <span className="font-bold text-green-400">{sig.confidence}%</span>
                                  <span className="text-slate-200">R:R</span>
                                  <span className="font-bold text-blue-400">{sig.riskRewardRatio}:1</span>
                                </div>
                              </div>
                              <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-200">Price:</span> ${sig.currentPrice.toFixed(2)}
                                </div>
                                <div>
                                  <span className="text-slate-200">Entry:</span> ${sig.entryZone.low.toFixed(2)} - ${sig.entryZone.high.toFixed(2)}
                                </div>
                                <div>
                                  <span className="text-slate-200">Target 1:</span> ${sig.targets[0]?.price.toFixed(2)}
                                </div>
                                <div>
                                  <span className="text-slate-200">Stop:</span> <span className="text-red-400">${sig.stopLoss.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {scanResults.allForecasts?.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h3 className="font-semibold text-slate-300">All Scanned Assets</h3>
                        <div className="grid gap-2 max-h-96 overflow-y-auto">
                          {scanResults.allForecasts.map((f: Forecast) => (
                            <div key={f.symbol} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-medium w-16">{f.symbol}</span>
                                <Badge variant="outline" className="border-slate-600 text-xs">{f.assetClass}</Badge>
                                <span className={`text-sm ${getDirectionColor(f.direction)}`}>{f.direction}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {getSetupBadge(f.setupStatus)}
                                <span className="text-sm text-slate-200">{f.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!scanMutation.isPending && !scanResults && (
                  <div className="text-center py-12 text-slate-200">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click a button above to scan markets for trading opportunities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            {forecastLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <span className="ml-3 text-slate-200">Analyzing {searchSymbol}...</span>
              </div>
            )}

            {forecast && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{forecast.symbol}</span>
                        <Badge className="bg-slate-600">{forecast.assetClass}</Badge>
                      </div>
                      {getSetupBadge(forecast.setupStatus)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">Direction</span>
                      <span className={`font-bold text-xl flex items-center gap-2 ${getDirectionColor(forecast.direction)}`}>
                        {forecast.direction === 'BULLISH' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {forecast.direction}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">Confidence</span>
                      <div className="flex items-center gap-2">
                        <Progress value={forecast.confidence} className="w-32" />
                        <span className="font-bold text-green-400">{forecast.confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">Current Price</span>
                      <span className="font-bold text-xl">${forecast.currentPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">Risk/Reward</span>
                      <span className="font-bold text-blue-400">{forecast.riskRewardRatio}:1</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">Timeframe</span>
                      <span>{forecast.timeframe}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      Trade Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                      <p className="text-sm text-slate-200">Entry Zone</p>
                      <p className="font-bold text-green-400">
                        ${forecast.entryZone.low.toFixed(2)} - ${forecast.entryZone.high.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {forecast.targets.map((target, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-2">
                          <span className="text-slate-200">Target {i + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-400">${target.price.toFixed(2)}</span>
                            <Badge variant="outline" className="border-slate-600">{target.probability}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm text-slate-200">Stop Loss</p>
                      <p className="font-bold text-red-400">${forecast.stopLoss.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{forecast.reasoning}</p>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-sm text-slate-200">Technical Score</p>
                        <p className="text-xl font-bold text-blue-400">{forecast.technicalScore}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-sm text-slate-200">Sentiment Score</p>
                        <p className="text-xl font-bold text-purple-400">{forecast.sentimentScore}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-sm text-slate-200">RSI</p>
                        <p className="text-xl font-bold">{forecast.indicators?.rsi?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-sm text-slate-200">Trend</p>
                        <p className="text-xl font-bold capitalize">{forecast.indicators?.trend || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!forecastLoading && !forecast && searchSymbol && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <p className="text-slate-200">No forecast data available for {searchSymbol}</p>
                  <p className="text-sm text-slate-300 mt-2">Try another symbol or check the spelling</p>
                </CardContent>
              </Card>
            )}

            {!searchSymbol && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-200">Enter a symbol above to get AI-powered forecast</p>
                  <p className="text-sm text-slate-300 mt-2">Supports stocks, crypto, forex, and futures</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className="bg-slate-700/30 rounded-lg p-4 border-l-4 border-yellow-500">
                        <p className="text-slate-200">{alert.message}</p>
                        <p className="text-sm text-slate-300 mt-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-200">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts yet. Alerts are triggered when high-confidence setups are detected.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accuracy" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accuracy ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200">Total Predictions</span>
                        <span className="font-bold">{accuracy.totalPredictions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200">Correct Predictions</span>
                        <span className="font-bold text-green-400">{accuracy.correctPredictions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200">Overall Win Rate</span>
                        <span className="font-bold text-green-400">{accuracy.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200">Average Return</span>
                        <span className="font-bold text-purple-400">{accuracy.averageReturn.toFixed(2)}%</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-200">Loading metrics...</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Win Rate by Asset Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {accuracy?.byAssetClass && Object.keys(accuracy.byAssetClass).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(accuracy.byAssetClass).map(([assetClass, data]) => (
                        <div key={assetClass} className="flex items-center justify-between">
                          <span className="capitalize text-slate-300">{assetClass}</span>
                          <div className="flex items-center gap-3">
                            <Progress value={data.winRate} className="w-24" />
                            <span className="font-bold text-green-400 w-12">{data.winRate.toFixed(1)}%</span>
                            <span className="text-slate-300 text-sm">({data.total})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-200">No data by asset class yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
