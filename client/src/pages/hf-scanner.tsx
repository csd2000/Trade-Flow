import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Zap, Target, TrendingUp, TrendingDown, AlertTriangle, Play,
  RefreshCw, Clock, BarChart3, Activity, DollarSign, Shield,
  ArrowUpRight, ArrowDownRight, Bell, CheckCircle2, Loader2
} from 'lucide-react';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';
import StrongTrendPanel from '@/components/StrongTrendPanel';

interface ScannerCandidate {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  entryPrice: string;
  stopLoss: string;
  targetPrice: string;
  riskAmount: string;
  rewardAmount: string;
  riskRewardRatio: string;
  compositeScore: string;
  trendScore: string;
  momentumScore: string;
  volumeScore: string;
  volatilityScore: string;
  rsi: string;
  atr: string;
  volume: number;
  avgVolume: number;
  pattern: string;
  sector: string;
  reasoning: string;
  isTopAlert: boolean;
}

interface ScannerJob {
  id: number;
  status: string;
  totalStocksScanned: number;
  qualifiedCount: number;
  topAlertSymbol: string | null;
  scanDurationMs: number;
  completedAt: string;
}

interface ScannerAlert {
  id: number;
  symbol: string;
  alertType: string;
  entryPrice: string;
  stopLoss: string;
  targetPrice: string;
  riskRewardRatio: string;
  compositeScore: string;
  alertMessage: string;
  isActive: boolean;
}

export default function HFScanner() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pollingEnabled, setPollingEnabled] = useState(false);

  const { data: statusData, refetch: refetchStatus } = useQuery<{ success: boolean; data: { isScanning: boolean; lastScanTime: number; universeSize: number; cacheSize: number } }>({
    queryKey: ['/api/scanner/status'],
    refetchInterval: pollingEnabled ? 2000 : false
  });

  const { data: latestData, refetch: refetchLatest, isLoading } = useQuery<{ success: boolean; data: { job: ScannerJob; candidates: ScannerCandidate[]; activeAlert: ScannerAlert } | null }>({
    queryKey: ['/api/scanner/latest'],
    refetchInterval: pollingEnabled ? 3000 : false
  });

  const { data: alertData } = useQuery<{ success: boolean; data: ScannerAlert | null }>({
    queryKey: ['/api/scanner/alert']
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/scanner/scan', 'POST');
    },
    onSuccess: () => {
      setPollingEnabled(true);
      queryClient.invalidateQueries({ queryKey: ['/api/scanner'] });
    }
  });

  useEffect(() => {
    if (statusData?.data?.isScanning === false && pollingEnabled) {
      setPollingEnabled(false);
      refetchLatest();
    }
  }, [statusData?.data?.isScanning, pollingEnabled, refetchLatest]);

  const status = statusData?.data;
  const job = latestData?.data?.job;
  const candidates = latestData?.data?.candidates || [];
  const activeAlert = alertData?.data || latestData?.data?.activeAlert;

  const isScanning = status?.isScanning || scanMutation.isPending;

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRRBadgeColor = (rr: number) => {
    if (rr >= 5) return 'bg-green-500/20 text-green-500 border-green-500/30';
    if (rr >= 4) return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <IntermarketBanner />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              High-Frequency Scanner
            </h1>
            <p className="text-slate-200 mt-1 text-xs sm:text-sm">
              Scanning {status?.universeSize || 300}+ stocks for 5:1 risk/reward setups
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <WalkthroughGuide steps={MODULE_GUIDES['scanner']} title="Guide" accentColor="amber" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchStatus(); refetchLatest(); }}
              disabled={isScanning}
              className="border-slate-600 text-slate-300"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => scanMutation.mutate()}
              disabled={isScanning}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              data-testid="button-scan"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Scan
                </>
              )}
            </Button>
          </div>
        </div>

        {isScanning && (
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />
                <div className="flex-1">
                  <p className="text-yellow-400 font-medium">Scanning in Progress</p>
                  <p className="text-sm text-slate-200">
                    Analyzing {status?.universeSize || 300}+ stocks for 5:1 risk/reward opportunities...
                  </p>
                </div>
                <Progress value={45} className="w-48" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeAlert && (
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-400 animate-pulse" />
                  <CardTitle className="text-green-400">TODAY'S TOP ALERT</CardTitle>
                </div>
                <Badge className="bg-green-500 text-black">
                  {parseFloat(activeAlert.riskRewardRatio).toFixed(1)}:1 R/R
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-2xl font-bold text-white">{activeAlert.symbol}</h3>
                  <p className="text-slate-300 text-sm mt-1">{activeAlert.alertMessage}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-200">Entry Price</p>
                  <p className="text-xl font-bold text-white">${parseFloat(activeAlert.entryPrice).toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-200">Stop Loss</p>
                    <p className="text-lg font-bold text-red-400">${parseFloat(activeAlert.stopLoss).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-200">Target</p>
                    <p className="text-lg font-bold text-green-400">${parseFloat(activeAlert.targetPrice).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-200">Stocks Scanned</p>
                  <p className="text-2xl font-bold text-white">{job?.totalStocksScanned || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-200">Qualified Setups</p>
                  <p className="text-2xl font-bold text-white">{job?.qualifiedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Shield className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-200">Min R/R Ratio</p>
                  <p className="text-2xl font-bold text-white">5:1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-200">Scan Duration</p>
                  <p className="text-2xl font-bold text-white">
                    {job?.scanDurationMs ? `${(job.scanDurationMs / 1000).toFixed(1)}s` : '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <StrongTrendPanel symbol="SPY" showReasons={true} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              Top 15 Candidates
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-slate-700">
              Detailed Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Today's Top Trading Opportunities
                </CardTitle>
                <CardDescription>
                  Stocks with 5:1 or better risk/reward ratio, sorted by composite score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-200">No scan results yet. Run a scan to find opportunities.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-200">#</TableHead>
                          <TableHead className="text-slate-200">Symbol</TableHead>
                          <TableHead className="text-slate-200">Pattern</TableHead>
                          <TableHead className="text-slate-200 text-right">Entry</TableHead>
                          <TableHead className="text-slate-200 text-right">Stop</TableHead>
                          <TableHead className="text-slate-200 text-right">Target</TableHead>
                          <TableHead className="text-slate-200 text-center">R/R</TableHead>
                          <TableHead className="text-slate-200 text-center">Score</TableHead>
                          <TableHead className="text-slate-200 text-right">RSI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates.map((candidate, idx) => (
                          <TableRow 
                            key={candidate.id} 
                            className={`border-slate-700 ${candidate.isTopAlert ? 'bg-green-500/10' : ''}`}
                            data-testid={`row-candidate-${candidate.id}`}
                          >
                            <TableCell className="font-medium text-slate-300">
                              {candidate.isTopAlert ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              ) : (
                                idx + 1
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-bold text-white">{candidate.symbol}</p>
                                <p className="text-xs text-slate-200 truncate max-w-[120px]">{candidate.name}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                                {candidate.pattern}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-white font-medium">
                              ${parseFloat(candidate.entryPrice).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-red-400">
                              ${parseFloat(candidate.stopLoss).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-green-400">
                              ${parseFloat(candidate.targetPrice).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={getRRBadgeColor(parseFloat(candidate.riskRewardRatio))}>
                                {parseFloat(candidate.riskRewardRatio).toFixed(1)}:1
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-bold ${getScoreColor(parseFloat(candidate.compositeScore))}`}>
                                {parseFloat(candidate.compositeScore).toFixed(0)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-slate-300">
                              {parseFloat(candidate.rsi).toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.slice(0, 9).map((candidate) => (
                <Card 
                  key={candidate.id} 
                  className={`bg-slate-800/50 border-slate-700 ${candidate.isTopAlert ? 'ring-2 ring-green-500/50' : ''}`}
                  data-testid={`card-candidate-${candidate.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{candidate.symbol}</CardTitle>
                        <CardDescription className="text-xs">{candidate.name}</CardDescription>
                      </div>
                      <Badge className={getRRBadgeColor(parseFloat(candidate.riskRewardRatio))}>
                        {parseFloat(candidate.riskRewardRatio).toFixed(1)}:1
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-700/50 rounded p-2">
                        <p className="text-xs text-slate-200">Entry</p>
                        <p className="text-sm font-bold text-white">${parseFloat(candidate.entryPrice).toFixed(2)}</p>
                      </div>
                      <div className="bg-red-500/10 rounded p-2">
                        <p className="text-xs text-red-400">Stop</p>
                        <p className="text-sm font-bold text-red-400">${parseFloat(candidate.stopLoss).toFixed(2)}</p>
                      </div>
                      <div className="bg-green-500/10 rounded p-2">
                        <p className="text-xs text-green-400">Target</p>
                        <p className="text-sm font-bold text-green-400">${parseFloat(candidate.targetPrice).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-1 text-center text-xs">
                      <div>
                        <p className="text-slate-300">Trend</p>
                        <p className={getScoreColor(parseFloat(candidate.trendScore))}>{parseFloat(candidate.trendScore).toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-slate-300">Momentum</p>
                        <p className={getScoreColor(parseFloat(candidate.momentumScore))}>{parseFloat(candidate.momentumScore).toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-slate-300">Volume</p>
                        <p className={getScoreColor(parseFloat(candidate.volumeScore))}>{parseFloat(candidate.volumeScore).toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-slate-300">RSI</p>
                        <p className="text-slate-300">{parseFloat(candidate.rsi).toFixed(0)}</p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center border-slate-600 text-slate-300">
                      {candidate.pattern}
                    </Badge>
                    
                    <p className="text-xs text-slate-200">{candidate.reasoning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-white mb-1">Scan Universe</h3>
                <p className="text-xs text-slate-200">
                  Analyze 300+ stocks across all major sectors and industries
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-white mb-1">5:1 Risk/Reward</h3>
                <p className="text-xs text-slate-200">
                  Filter for setups with $1 risk to make $5 profit potential
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white mb-1">Score & Rank</h3>
                <p className="text-xs text-slate-200">
                  Composite scoring based on trend, momentum, volume, and volatility
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-bold text-white mb-1">Top Alert</h3>
                <p className="text-xs text-slate-200">
                  ~15 opportunities daily, with one highlighted as the best pick
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
