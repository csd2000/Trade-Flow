import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, TrendingUp, TrendingDown, Zap, Activity, BarChart3, 
  ArrowUp, ArrowDown, Code, Loader2, DollarSign, StopCircle, 
  Flag, Play, FileText, Youtube, Cpu, AlertTriangle, CheckCircle,
  Clock, Percent, Calculator
} from 'lucide-react';
import { http } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

interface StrategyAnalysisResult {
  symbol: string;
  strategy: {
    name: string;
    description: string;
    sourceType: string;
    entryRules: Array<{
      id: string;
      name: string;
      type: string;
      condition: string;
      indicator?: string;
      params?: Record<string, any>;
      description?: string;
    }>;
    exitRules: Array<{
      id: string;
      name: string;
      type: string;
      condition: string;
      indicator?: string;
      params?: Record<string, any>;
      description?: string;
    }>;
    stopLossRules: Array<{
      id: string;
      name: string;
      type: string;
      condition: string;
      params?: Record<string, any>;
      description?: string;
    }>;
    takeProfitRules: Array<{
      id: string;
      name: string;
      type: string;
      condition: string;
      params?: Record<string, any>;
      description?: string;
    }>;
    riskManagement?: {
      maxRiskPercent?: number;
      positionSizeMethod?: string;
    };
  };
  ohlcv: {
    time: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  };
  signals: Array<{
    type: string;
    direction: string;
    price: number;
    timestamp: string;
    barIndex: number;
    reason?: string;
  }>;
  currentPrice: number;
  suggestedEntry?: { price: number; reason: string };
  suggestedStopLoss?: { price: number; reason: string };
  suggestedTakeProfit?: { price: number; reason: string };
  analysis: string;
  indicators?: {
    rsi?: number[];
    macd?: { macd: number[]; signal: number[]; histogram: number[] };
    ema20?: number[];
    ema50?: number[];
    atr?: number[];
  };
}

const sourceTypeIcons: Record<string, any> = {
  text: FileText,
  youtube: Youtube,
  pine_script: Code,
  mt4: Cpu
};

const sourceTypeLabels: Record<string, string> = {
  text: 'Text / YouTube Rules',
  youtube: 'YouTube Description',
  pine_script: 'Pine Script',
  mt4: 'MetaTrader 4 (MQL4)'
};

export default function CentralScanner() {
  const { toast } = useToast();
  
  const [symbol, setSymbol] = useState('AAPL');
  const [sourceType, setSourceType] = useState<'text' | 'youtube' | 'pine_script' | 'mt4'>('text');
  const [rules, setRules] = useState('');
  const [period, setPeriod] = useState('1D');
  const [analysis, setAnalysis] = useState<StrategyAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [isOptionsMode, setIsOptionsMode] = useState(false);
  const [strikePrice, setStrikePrice] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post('/api/central-scanner/strategy/quick-analyze', {
        symbol,
        rules,
        sourceType,
        period
      }) as { data: StrategyAnalysisResult };
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: 'Analysis Complete',
        description: `Found ${data.signals.length} signals for ${data.symbol}`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze strategy',
        variant: 'destructive'
      });
    }
  });

  const handleAnalyze = () => {
    if (!symbol.trim()) {
      toast({ title: 'Enter a symbol', variant: 'destructive' });
      return;
    }
    if (!rules.trim()) {
      toast({ title: 'Enter your trading rules', variant: 'destructive' });
      return;
    }
    analyzeMutation.mutate();
  };

  const riskRewardMetrics = useMemo(() => {
    if (!analysis?.suggestedEntry || !analysis?.suggestedStopLoss || !analysis?.suggestedTakeProfit) {
      return null;
    }
    const entry = analysis.suggestedEntry.price;
    const stop = analysis.suggestedStopLoss.price;
    const target = analysis.suggestedTakeProfit.price;
    
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const riskPercent = (risk / entry) * 100;
    const rewardPercent = (reward / entry) * 100;
    const rrRatio = reward / risk;
    
    return { risk, reward, riskPercent, rewardPercent, rrRatio, entry, stop, target };
  }, [analysis]);

  const SourceIcon = sourceTypeIcons[sourceType] || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Rule Based Scanner
          </h1>
          <p className="text-slate-200 mt-2">
            Analyze any asset with your custom trading rules from YouTube, Pine Script, or MetaTrader 4
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Rule Input */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-900/80 border-slate-700 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <SourceIcon className="h-5 w-5 text-cyan-400" />
                  Strategy Rules
                </CardTitle>
                <CardDescription>
                  Enter your trading strategy to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Symbol Input */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Symbol</Label>
                  <Input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL, TSLA, BTC-USD..."
                    className="bg-slate-800 border-slate-700 text-white font-mono"
                  />
                </div>

                {/* Source Type */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Rule Source</Label>
                  <Select value={sourceType} onValueChange={(v) => setSourceType(v as any)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Text / YouTube Rules
                        </div>
                      </SelectItem>
                      <SelectItem value="pine_script">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Pine Script
                        </div>
                      </SelectItem>
                      <SelectItem value="mt4">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          MetaTrader 4 (MQL4)
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          YouTube Description
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timeframe */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Timeframe</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="2m">2 Minutes</SelectItem>
                      <SelectItem value="3m">3 Minutes</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="10m">10 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="30m">30 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="2h">2 Hours</SelectItem>
                      <SelectItem value="3h">3 Hours</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1D">1 Day</SelectItem>
                      <SelectItem value="1W">1 Week</SelectItem>
                      <SelectItem value="1M">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Options Trading Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Options Trading</Label>
                    <button
                      type="button"
                      onClick={() => setIsOptionsMode(!isOptionsMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isOptionsMode ? 'bg-cyan-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isOptionsMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Options Strike Price & Expiration */}
                {isOptionsMode && (
                  <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-600/30">
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
                      <DollarSign className="h-4 w-4" />
                      Options Contract Details
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-sm">Strike Price ($)</Label>
                      <Input
                        type="number"
                        step="0.50"
                        placeholder="e.g., 150.00"
                        value={strikePrice}
                        onChange={(e) => setStrikePrice(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-sm">Expiration Date</Label>
                      <Input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Rules Input */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Trading Rules</Label>
                  <Textarea
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder={sourceType === 'pine_script' 
                      ? `//@version=5
strategy("My Strategy")
// Paste your Pine Script code...`
                      : sourceType === 'mt4'
                      ? `// Paste your MQL4 code...
void OnTick() {
  // Entry/Exit logic
}`
                      : `Enter your trading rules:

Example:
- Buy when RSI crosses below 30
- Sell when RSI crosses above 70
- Stop loss: 2% below entry
- Take profit: 3:1 risk/reward`}
                    className="bg-slate-800 border-slate-700 text-white min-h-[200px] font-mono text-sm"
                  />
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12"
                >
                  {analyzeMutation.isPending ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing Strategy...</>
                  ) : (
                    <><Play className="h-5 w-5 mr-2" /> Analyze Chart</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {analysis && (
              <Card className="bg-slate-900/80 border-slate-700 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Current Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-sm">Symbol</span>
                    <Badge className="bg-cyan-600 font-mono">{analysis.symbol}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-sm">Price</span>
                    <span className="text-white font-bold">${analysis.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-sm">Signals</span>
                    <Badge className="bg-purple-600">{analysis.signals.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-sm">Data Points</span>
                    <span className="text-slate-300">{analysis.ohlcv.close.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Signal Fusion AI Analysis */}
            <SignalFusionAnalysis symbol={symbol} assetType="stock" compact />
          </div>

          {/* Right Panel - Chart and Analysis */}
          <div className="lg:col-span-3 space-y-4">
            {analysis ? (
              <>
                {/* Trade Levels Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">
                        ${analysis.currentPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-200">Current Price</div>
                    </CardContent>
                  </Card>
                  
                  {analysis.suggestedEntry && (
                    <Card className="bg-blue-900/30 border-blue-500/50">
                      <CardContent className="p-4 text-center">
                        <Flag className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-blue-400">
                          ${analysis.suggestedEntry.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-200">Entry Point</div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {analysis.suggestedStopLoss && (
                    <Card className="bg-red-900/30 border-red-500/50">
                      <CardContent className="p-4 text-center">
                        <StopCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-red-400">
                          ${analysis.suggestedStopLoss.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-200">Stop Loss</div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {analysis.suggestedTakeProfit && (
                    <Card className="bg-green-900/30 border-green-500/50">
                      <CardContent className="p-4 text-center">
                        <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-green-400">
                          ${analysis.suggestedTakeProfit.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-200">Take Profit</div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Risk/Reward Panel */}
                {riskRewardMetrics && (
                  <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/30">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-red-400">
                              <TrendingDown className="h-4 w-4" />
                              <span className="text-xs">RISK</span>
                            </div>
                            <div className="text-lg font-bold text-red-400">
                              ${riskRewardMetrics.risk.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-300">
                              {riskRewardMetrics.riskPercent.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-xs">REWARD</span>
                            </div>
                            <div className="text-lg font-bold text-green-400">
                              ${riskRewardMetrics.reward.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-300">
                              {riskRewardMetrics.rewardPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-px bg-slate-700" />
                          <div className="text-center px-6 py-2 bg-purple-600/30 rounded-lg">
                            <div className="text-xs text-slate-200 mb-1">RISK : REWARD</div>
                            <div className="text-3xl font-bold text-purple-400">
                              1 : {riskRewardMetrics.rrRatio.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Chart and Analysis Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-800 border-slate-700">
                    <TabsTrigger value="chart" className="data-[state=active]:bg-cyan-600">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Chart
                    </TabsTrigger>
                    <TabsTrigger value="breakdown" className="data-[state=active]:bg-cyan-600">
                      <Activity className="h-4 w-4 mr-2" />
                      Rule Breakdown
                    </TabsTrigger>
                    <TabsTrigger value="signals" className="data-[state=active]:bg-cyan-600">
                      <Zap className="h-4 w-4 mr-2" />
                      Signals ({analysis.signals.length})
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="data-[state=active]:bg-cyan-600">
                      <FileText className="h-4 w-4 mr-2" />
                      AI Analysis
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chart" className="mt-4">
                    <Card className="bg-slate-900/80 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-cyan-400" />
                          {analysis.symbol} - TradingView Style Chart
                        </CardTitle>
                        <CardDescription>
                          Candlestick chart with entry, exit, and stop-loss levels
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TradingViewChart analysis={analysis} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="breakdown" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Entry Rules */}
                      <Card className="bg-slate-900/80 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-blue-400 flex items-center gap-2 text-lg">
                            <Flag className="h-5 w-5" />
                            Entry Rules
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analysis.strategy.entryRules.length > 0 ? (
                            <div className="space-y-3">
                              {analysis.strategy.entryRules.map((rule, idx) => (
                                <div key={idx} className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-blue-400" />
                                    <span className="text-white font-medium">{rule.name}</span>
                                  </div>
                                  <p className="text-sm text-slate-200">{rule.condition}</p>
                                  {rule.indicator && (
                                    <Badge className="mt-2 bg-blue-600/50">{rule.indicator}</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-300">No specific entry rules detected</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Exit Rules */}
                      <Card className="bg-slate-900/80 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-amber-400 flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5" />
                            Exit Rules
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analysis.strategy.exitRules.length > 0 ? (
                            <div className="space-y-3">
                              {analysis.strategy.exitRules.map((rule, idx) => (
                                <div key={idx} className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-amber-400" />
                                    <span className="text-white font-medium">{rule.name}</span>
                                  </div>
                                  <p className="text-sm text-slate-200">{rule.condition}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-300">No specific exit rules detected</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Stop Loss Rules */}
                      <Card className="bg-slate-900/80 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
                            <StopCircle className="h-5 w-5" />
                            Stop Loss Rules
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analysis.strategy.stopLossRules.length > 0 ? (
                            <div className="space-y-3">
                              {analysis.strategy.stopLossRules.map((rule, idx) => (
                                <div key={idx} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="text-white font-medium">{rule.name}</span>
                                  </div>
                                  <p className="text-sm text-slate-200">{rule.condition}</p>
                                  {rule.params?.percentage && (
                                    <Badge className="mt-2 bg-red-600/50">{rule.params.percentage}% below entry</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-300">No stop loss rules detected</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Take Profit Rules */}
                      <Card className="bg-slate-900/80 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-green-400 flex items-center gap-2 text-lg">
                            <DollarSign className="h-5 w-5" />
                            Take Profit Rules
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analysis.strategy.takeProfitRules.length > 0 ? (
                            <div className="space-y-3">
                              {analysis.strategy.takeProfitRules.map((rule, idx) => (
                                <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <span className="text-white font-medium">{rule.name}</span>
                                  </div>
                                  <p className="text-sm text-slate-200">{rule.condition}</p>
                                  {rule.params?.rr_ratio && (
                                    <Badge className="mt-2 bg-green-600/50">{rule.params.rr_ratio}:1 R/R</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-300">No take profit rules detected</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="signals" className="mt-4">
                    <Card className="bg-slate-900/80 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Historical Signals</CardTitle>
                        <CardDescription>
                          Entry and exit points detected based on your rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analysis.signals.length > 0 ? (
                          <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {analysis.signals.map((signal, idx) => (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  signal.direction === 'LONG' 
                                    ? 'bg-green-900/20 border border-green-500/30' 
                                    : 'bg-red-900/20 border border-red-500/30'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${
                                    signal.direction === 'LONG' ? 'bg-green-600/30' : 'bg-red-600/30'
                                  }`}>
                                    {signal.direction === 'LONG' ? (
                                      <ArrowUp className="h-5 w-5 text-green-400" />
                                    ) : (
                                      <ArrowDown className="h-5 w-5 text-red-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${
                                        signal.direction === 'LONG' ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        {signal.direction}
                                      </span>
                                      <Badge className="bg-slate-700">
                                        ${signal.price.toFixed(2)}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-200 mt-1">{signal.reason || signal.type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-slate-200 text-sm">
                                    <Clock className="h-3 w-3" />
                                    {new Date(signal.timestamp).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-slate-300">
                                    Bar #{signal.barIndex}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-200">No signals detected with these rules</p>
                            <p className="text-slate-300 text-sm mt-2">
                              Try adjusting your entry conditions or time period
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-4">
                    <Card className="bg-slate-900/80 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">AI Strategy Analysis</CardTitle>
                        <CardDescription>
                          Detailed breakdown of your trading rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-slate-300 text-sm font-mono bg-slate-800 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                            {analysis.analysis}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              /* Empty State */
              <Card className="bg-slate-900/80 border-slate-700 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-600/20 to-blue-600/20 flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Analyze Your Trading Strategy
                  </h2>
                  <p className="text-slate-200 max-w-lg mx-auto mb-8">
                    Enter your trading rules from YouTube videos, Pine Script, or MetaTrader 4 scripts.
                    The AI will parse the logic and show you entry points, exit levels, and stop losses 
                    on a professional chart.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <Flag className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Entry Points</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <StopCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Stop Loss</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Take Profit</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <Calculator className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Risk/Reward</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700 max-w-xl mx-auto">
                    <h3 className="text-white font-medium mb-2">Example Rules:</h3>
                    <p className="text-sm text-slate-200 text-left">
                      "Buy when RSI crosses below 30 and price is above 50 EMA. 
                      Stop loss 2% below entry. Take profit at 2:1 risk/reward ratio."
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// TradingView-style Candlestick Chart Component
function TradingViewChart({ analysis }: { analysis: StrategyAnalysisResult }) {
  const chartHeight = 400;
  const chartPadding = { top: 20, right: 80, bottom: 40, left: 60 };
  const barsToShow = Math.min(80, analysis.ohlcv.close.length);
  const startIdx = analysis.ohlcv.close.length - barsToShow;
  
  const ohlcData = useMemo(() => {
    return {
      time: analysis.ohlcv.time.slice(startIdx),
      open: analysis.ohlcv.open.slice(startIdx),
      high: analysis.ohlcv.high.slice(startIdx),
      low: analysis.ohlcv.low.slice(startIdx),
      close: analysis.ohlcv.close.slice(startIdx),
      volume: analysis.ohlcv.volume.slice(startIdx)
    };
  }, [analysis, startIdx]);

  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    const allPrices = [
      ...ohlcData.high,
      ...ohlcData.low,
      analysis.suggestedEntry?.price || 0,
      analysis.suggestedStopLoss?.price || 0,
      analysis.suggestedTakeProfit?.price || 0
    ].filter(p => p > 0);
    
    if (allPrices.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    }
    
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.05;
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: (max - min) + (padding * 2)
    };
  }, [ohlcData, analysis]);

  const priceToY = (price: number) => {
    return chartPadding.top + ((maxPrice - price) / priceRange) * (chartHeight - chartPadding.top - chartPadding.bottom);
  };

  const signalsInRange = useMemo(() => {
    return analysis.signals.filter(s => s.barIndex >= startIdx);
  }, [analysis.signals, startIdx]);

  const barWidth = (100 / barsToShow) * 0.7;
  const gapWidth = (100 / barsToShow) * 0.3;

  return (
    <div className="relative bg-slate-950 rounded-lg overflow-hidden" style={{ height: chartHeight }}>
      {/* Price Scale (Y-axis) */}
      <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col justify-between py-5 text-xs text-slate-300 bg-slate-900/50">
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const price = maxPrice - (pct * priceRange);
          return (
            <div key={idx} className="text-right pr-2">
              ${price.toFixed(2)}
            </div>
          );
        })}
      </div>

      {/* Chart Area */}
      <div 
        className="absolute top-0 bottom-10 overflow-hidden"
        style={{ left: chartPadding.left, right: chartPadding.right }}
      >
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
          <div
            key={idx}
            className="absolute left-0 right-0 border-t border-slate-800"
            style={{ top: `${pct * 100}%` }}
          />
        ))}

        {/* Take Profit Level */}
        {analysis.suggestedTakeProfit && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-green-500 z-10"
            style={{ top: priceToY(analysis.suggestedTakeProfit.price) }}
          >
            <div className="absolute right-0 -top-3 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
              TP: ${analysis.suggestedTakeProfit.price.toFixed(2)}
            </div>
          </div>
        )}

        {/* Entry Level */}
        {analysis.suggestedEntry && (
          <div
            className="absolute left-0 right-0 border-t-2 border-blue-500 z-10"
            style={{ top: priceToY(analysis.suggestedEntry.price) }}
          >
            <div className="absolute right-0 -top-3 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
              Entry: ${analysis.suggestedEntry.price.toFixed(2)}
            </div>
          </div>
        )}

        {/* Stop Loss Level */}
        {analysis.suggestedStopLoss && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-500 z-10"
            style={{ top: priceToY(analysis.suggestedStopLoss.price) }}
          >
            <div className="absolute right-0 -top-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
              SL: ${analysis.suggestedStopLoss.price.toFixed(2)}
            </div>
          </div>
        )}

        {/* Candlesticks */}
        <div className="absolute inset-0 flex items-stretch">
          {ohlcData.close.map((close, idx) => {
            const open = ohlcData.open[idx];
            const high = ohlcData.high[idx];
            const low = ohlcData.low[idx];
            const isGreen = close >= open;
            
            const bodyTop = priceToY(Math.max(open, close));
            const bodyBottom = priceToY(Math.min(open, close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            
            const wickTop = priceToY(high);
            const wickBottom = priceToY(low);
            
            const globalIdx = startIdx + idx;
            const signal = signalsInRange.find(s => s.barIndex === globalIdx);
            
            const leftPos = `${(idx / barsToShow) * 100 + gapWidth / 2}%`;
            
            return (
              <div
                key={idx}
                className="absolute"
                style={{ 
                  left: leftPos, 
                  width: `${barWidth}%`,
                  top: 0,
                  bottom: 0
                }}
              >
                {/* Wick */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-px ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{
                    top: wickTop,
                    height: wickBottom - wickTop
                  }}
                />
                
                {/* Body */}
                <div
                  className={`absolute left-0 right-0 ${isGreen ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                  style={{
                    top: bodyTop,
                    height: bodyHeight
                  }}
                  title={`O: ${open.toFixed(2)} H: ${high.toFixed(2)} L: ${low.toFixed(2)} C: ${close.toFixed(2)}`}
                />
                
                {/* Signal Marker */}
                {signal && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 z-20"
                    style={{ top: signal.direction === 'LONG' ? wickBottom + 5 : wickTop - 20 }}
                  >
                    <div className={`flex flex-col items-center ${
                      signal.direction === 'LONG' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {signal.direction === 'LONG' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Scale (X-axis) */}
      <div 
        className="absolute bottom-0 h-10 flex items-center justify-between text-xs text-slate-300 px-2"
        style={{ left: chartPadding.left, right: chartPadding.right }}
      >
        <span>{new Date(ohlcData.time[0]).toLocaleDateString()}</span>
        <span>{new Date(ohlcData.time[Math.floor(ohlcData.time.length / 2)]).toLocaleDateString()}</span>
        <span>{new Date(ohlcData.time[ohlcData.time.length - 1]).toLocaleDateString()}</span>
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur rounded p-2 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <span className="text-slate-200">Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span className="text-slate-200">Bearish</span>
        </div>
        {signalsInRange.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUp className="h-3 w-3 text-yellow-400" />
            <span className="text-slate-200">Signal</span>
          </div>
        )}
      </div>
    </div>
  );
}
