import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Play, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { trainingApi, type BacktestResult } from '@/services/training-api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BacktestStrategy() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Backtest form state
  const [timeframe, setTimeframe] = useState('1M');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // 3 months ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch strategy
  const { data: strategy } = useQuery({
    queryKey: ['/api/strategies', slug],
    queryFn: () => slug ? trainingApi.getStrategy(slug) : null,
    enabled: !!slug
  });

  // Fetch existing backtest results
  const { data: backtestResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['/api/backtests', slug],
    queryFn: () => slug ? trainingApi.getBacktestResults(slug) : [],
    enabled: !!slug
  });

  // Run backtest mutation
  const runBacktestMutation = useMutation({
    mutationFn: () => trainingApi.runBacktest({
      strategySlug: slug!,
      timeframe,
      startDate,
      endDate,
      initialCapital: parseFloat(initialCapital)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backtests', slug] });
      toast({
        title: "Backtest Complete!",
        description: "Your backtest has been successfully executed.",
      });
    },
    onError: () => {
      toast({
        title: "Backtest Failed",
        description: "Unable to run backtest. Please check your parameters and try again.",
        variant: "destructive",
      });
    }
  });

  const latestResult = backtestResults[0]; // Most recent result

  if (!strategy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Strategy Not Found</AlertTitle>
          <AlertDescription>
            The requested strategy could not be found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation(`/training/${slug}`)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Training
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Strategy Backtest</h1>
            <p className="text-gray-300">{strategy.title}</p>
          </div>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Backtest Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Backtest Parameters
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure your backtest settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">1 Day</SelectItem>
                      <SelectItem value="1W">1 Week</SelectItem>
                      <SelectItem value="1M">1 Month</SelectItem>
                      <SelectItem value="3M">3 Months</SelectItem>
                      <SelectItem value="6M">6 Months</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                  <Input
                    id="initialCapital"
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    placeholder="10000"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Button
                  onClick={() => runBacktestMutation.mutate()}
                  disabled={runBacktestMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {runBacktestMutation.isPending ? 'Running...' : 'Run Backtest'}
                </Button>
              </CardContent>
            </Card>

            {/* Strategy Info */}
            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Strategy Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Category:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {strategy.category}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Risk Level:</span>
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                    {strategy.risk}
                  </Badge>
                </div>
                {strategy.roiRange && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Expected ROI:</span>
                    <span>{strategy.roiRange}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="latest" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20 mb-6">
                <TabsTrigger value="latest" className="text-white data-[state=active]:bg-white/20">
                  Latest Results
                </TabsTrigger>
                <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/20">
                  Backtest History
                </TabsTrigger>
              </TabsList>

              {/* Latest Results Tab */}
              <TabsContent value="latest" className="space-y-6">
                {latestResult ? (
                  <>
                    {/* Performance Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm text-gray-300">Total Return</span>
                          </div>
                          <p className={`text-lg font-bold ${latestResult.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercentage(latestResult.totalReturn)}
                          </p>
                          <p className="text-xs text-gray-200">
                            {formatCurrency(parseFloat(latestResult.finalCapital) - parseFloat(latestResult.initialCapital))}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4" />
                            <span className="text-sm text-gray-300">Win Rate</span>
                          </div>
                          <p className="text-lg font-bold text-blue-400">
                            {formatPercentage(latestResult.winRate)}
                          </p>
                          <p className="text-xs text-gray-200">
                            {latestResult.winningTrades}/{latestResult.totalTrades} trades
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm text-gray-300">Max Drawdown</span>
                          </div>
                          <p className="text-lg font-bold text-red-400">
                            -{formatPercentage(Math.abs(latestResult.maxDrawdown))}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm text-gray-300">Sharpe Ratio</span>
                          </div>
                          <p className="text-lg font-bold text-purple-400">
                            {latestResult.sharpeRatio?.toFixed(3) || 'N/A'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Chart */}
                    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Equity Curve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {latestResult.performanceChart && (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={latestResult.performanceChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#9CA3AF"
                                  fontSize={12}
                                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                />
                                <YAxis 
                                  stroke="#9CA3AF"
                                  fontSize={12}
                                  tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F3F4F6'
                                  }}
                                  formatter={(value: any) => [formatCurrency(value), 'Equity']}
                                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="equity" 
                                  stroke="#3B82F6" 
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Trade Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Total Trades:</span>
                            <span>{latestResult.totalTrades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Winning Trades:</span>
                            <span className="text-green-400">{latestResult.winningTrades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Losing Trades:</span>
                            <span className="text-red-400">{latestResult.losingTrades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Profit Factor:</span>
                            <span>{latestResult.profitFactor?.toFixed(2) || 'N/A'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">P&L Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Average Win:</span>
                            <span className="text-green-400">
                              {latestResult.avgWin ? formatPercentage(latestResult.avgWin) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Average Loss:</span>
                            <span className="text-red-400">
                              {latestResult.avgLoss ? formatPercentage(-latestResult.avgLoss) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Best Trade:</span>
                            <span className="text-green-400">
                              {latestResult.maxWin ? formatPercentage(latestResult.maxWin) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Worst Trade:</span>
                            <span className="text-red-400">
                              {latestResult.maxLoss ? formatPercentage(-latestResult.maxLoss) : 'N/A'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-200 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Backtest Results</h3>
                      <p className="text-gray-300 text-center mb-6">
                        Run your first backtest to see how this strategy would have performed historically.
                      </p>
                      <Button
                        onClick={() => runBacktestMutation.mutate()}
                        disabled={runBacktestMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run Your First Backtest
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Backtest History Tab */}
              <TabsContent value="history" className="space-y-6">
                {resultsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white/10 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : backtestResults.length > 0 ? (
                  <div className="space-y-4">
                    {backtestResults.map((result) => (
                      <Card key={result.id} className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">
                                {result.timeframe} Backtest
                              </h4>
                              <p className="text-sm text-gray-300">
                                {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={result.totalReturn >= 0 ? 'default' : 'destructive'}>
                              {formatPercentage(result.totalReturn)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-300 block">Win Rate</span>
                              <span>{formatPercentage(result.winRate)}</span>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Trades</span>
                              <span>{result.totalTrades}</span>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Max DD</span>
                              <span className="text-red-400">
                                -{formatPercentage(Math.abs(result.maxDrawdown))}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Sharpe</span>
                              <span>{result.sharpeRatio?.toFixed(3) || 'N/A'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="w-16 h-16 text-gray-200 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No History</h3>
                      <p className="text-gray-300 text-center">
                        Your backtest history will appear here once you run some tests.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}