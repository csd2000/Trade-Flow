import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase, TrendingUp, TrendingDown, Plus, RefreshCcw, Target,
  DollarSign, AlertTriangle, Clock, BarChart3, Wallet, LineChart,
  ArrowUpRight, ArrowDownRight, Search, Brain, Shield, Activity,
  XCircle, CheckCircle, MinusCircle, Zap, Scale, Minus
} from 'lucide-react';

interface Position {
  id: number;
  symbol: string;
  assetType: string;
  side: string;
  quantity: string;
  entryPrice: string;
  currentPrice: string | null;
  strikePrice: string | null;
  expirationDate: string | null;
  optionType: string | null;
  contractSize: number;
  stopLoss: string | null;
  takeProfit: string | null;
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
  aiAdvice: string | null;
  aiReasoning: string | null;
  aiConfidence: string | null;
  gatesPassed: number;
  status: string;
  notes: string | null;
  marketData?: {
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
  };
}

interface PortfolioSummary {
  totalPositions: number;
  totalValue: number;
  totalPnl: number;
  pnlPercent: number;
  byAssetType: Record<string, { count: number; value: number; pnl: number }>;
}

// Enhanced Strategy Interfaces
interface ConfluenceFactor {
  name: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  score: number;
  description: string;
}

interface TradingSignal {
  score: number;
  direction: 'long' | 'short' | 'neutral';
  confidence: number;
  factors: ConfluenceFactor[];
  recommendation: string;
  reasoning: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  positionSizePercent: number;
  maxRiskPercent: number;
}

interface MarketRegime {
  type: string;
  direction: string;
  strength: number;
  confidence: number;
}

interface AnalysisResult {
  symbol: string;
  currentPrice: number;
  signal: TradingSignal;
  regime: MarketRegime;
  tradingRules: string[];
  expectedWinRate: string;
  disclaimer: string;
}

const assetTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  stock: { icon: BarChart3, color: 'text-blue-400', label: 'Stock' },
  options: { icon: Target, color: 'text-purple-400', label: 'Options' },
  crypto: { icon: Wallet, color: 'text-orange-400', label: 'Crypto' },
  forex: { icon: DollarSign, color: 'text-green-400', label: 'Forex' },
  futures: { icon: LineChart, color: 'text-cyan-400', label: 'Futures' }
};

const adviceConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  HOLD: { icon: MinusCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' },
  EXIT: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-900/30' },
  SCALE_IN: { icon: Plus, color: 'text-green-400', bgColor: 'bg-green-900/30' },
  TAKE_PROFIT: { icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-900/30' },
  BUY: { icon: ArrowUpRight, color: 'text-green-400', bgColor: 'bg-green-900/30' },
  SELL: { icon: ArrowDownRight, color: 'text-red-400', bgColor: 'bg-red-900/30' },
  WAIT: { icon: Clock, color: 'text-slate-200', bgColor: 'bg-slate-900/30' },
  WATCH: { icon: Search, color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
  SHORT: { icon: TrendingDown, color: 'text-red-400', bgColor: 'bg-red-900/30' }
};

const recommendationConfig: Record<string, { color: string; icon: any; bgColor: string }> = {
  strong_buy: { color: 'text-green-400', icon: ArrowUpRight, bgColor: 'bg-green-900/30' },
  buy: { color: 'text-emerald-400', icon: TrendingUp, bgColor: 'bg-emerald-900/30' },
  hold: { color: 'text-yellow-400', icon: Minus, bgColor: 'bg-yellow-900/30' },
  sell: { color: 'text-orange-400', icon: TrendingDown, bgColor: 'bg-orange-900/30' },
  strong_sell: { color: 'text-red-400', icon: ArrowDownRight, bgColor: 'bg-red-900/30' },
  no_trade: { color: 'text-slate-400', icon: XCircle, bgColor: 'bg-slate-900/30' }
};

// Enhanced Strategy Tab Component
function EnhancedStrategyTab() {
  const [symbol, setSymbol] = useState('SPY');
  const [assetType, setAssetType] = useState('stock');
  const [searchTrigger, setSearchTrigger] = useState(0);

  const { data: analysis, isLoading } = useQuery<{ success: boolean; data: AnalysisResult }>({
    queryKey: ['/api/enhanced-strategy/analyze', symbol, assetType, searchTrigger],
    queryFn: async () => {
      const res = await fetch(`/api/enhanced-strategy/analyze/${symbol}?assetType=${assetType}`);
      if (!res.ok) throw new Error('Failed to analyze');
      return res.json();
    },
    enabled: searchTrigger > 0
  });

  const { data: scanData, isLoading: scanLoading } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enhanced-strategy/quick-scan'],
    queryFn: async () => {
      const res = await fetch('/api/enhanced-strategy/quick-scan');
      return res.json();
    },
    refetchInterval: 300000
  });

  const handleAnalyze = () => {
    setSearchTrigger(prev => prev + 1);
  };

  const quickScan = scanData?.data;
  const result = analysis?.data;

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <Card className="bg-amber-900/20 border-amber-700/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-200/80">
              <strong>Realistic Target: 60-70% win rate</strong> with 2:1+ risk/reward. A 95% win rate is NOT achievable.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (SPY, AAPL, BTC)"
              className="bg-slate-900 border-slate-600 text-white flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm"
            >
              <option value="stock">Stock</option>
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
            </select>
            <Button onClick={handleAnalyze} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Analyze</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['SPY', 'QQQ', 'AAPL', 'NVDA', 'TSLA', 'BTC', 'ETH'].map((sym) => (
              <Button
                key={sym}
                size="sm"
                variant="outline"
                className="text-xs bg-slate-900 border-slate-600 hover:bg-slate-700"
                onClick={() => {
                  setSymbol(sym);
                  setAssetType(['BTC', 'ETH'].includes(sym) ? 'crypto' : 'stock');
                }}
              >
                {sym}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Analysis Result */}
        {result ? (
          <>
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">{result.symbol}</CardTitle>
                    <CardDescription>${result.currentPrice.toFixed(2)}</CardDescription>
                  </div>
                  {(() => {
                    const config = recommendationConfig[result.signal.recommendation] || recommendationConfig.hold;
                    const RecIcon = config.icon;
                    return (
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <RecIcon className={`h-6 w-6 ${config.color}`} />
                      </div>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Recommendation */}
                {(() => {
                  const config = recommendationConfig[result.signal.recommendation] || recommendationConfig.hold;
                  return (
                    <div className={`p-3 rounded-lg ${config.bgColor} border border-slate-600`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">AI Recommendation</span>
                        <Badge className={`ml-auto ${config.color}`}>
                          {result.signal.recommendation.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">{result.signal.reasoning}</p>
                    </div>
                  );
                })()}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-2 rounded">
                    <div className="text-xs text-slate-400">Confidence</div>
                    <div className="flex items-center gap-2">
                      <Progress value={result.signal.confidence} className="h-1.5 flex-1" />
                      <span className="text-sm font-bold text-white">{result.signal.confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded">
                    <div className="text-xs text-slate-400">Score</div>
                    <div className={`text-lg font-bold ${result.signal.score > 0 ? 'text-green-400' : result.signal.score < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {result.signal.score > 0 ? '+' : ''}{result.signal.score.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Market Regime */}
                <div className="bg-slate-900/50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-cyan-400" />
                    <span className="text-xs text-slate-400">Market Regime:</span>
                    <Badge variant="outline" className="text-cyan-400 text-xs">
                      {result.regime.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={result.regime.direction === 'bullish' ? 'default' : result.regime.direction === 'bearish' ? 'destructive' : 'secondary'} className="text-xs">
                      {result.regime.direction}
                    </Badge>
                  </div>
                </div>

                {/* Trade Levels */}
                {result.signal.recommendation !== 'no_trade' && result.signal.recommendation !== 'hold' && (
                  <div className="bg-slate-900/50 p-3 rounded space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">Trade Setup</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Entry:</span> <span className="text-white">${result.signal.entryPrice.toFixed(2)}</span></div>
                      <div><span className="text-red-400">Stop:</span> <span className="text-white">${result.signal.stopLoss.toFixed(2)}</span></div>
                      <div><span className="text-green-400">TP1:</span> <span className="text-white">${result.signal.takeProfit1.toFixed(2)}</span></div>
                      <div><span className="text-green-400">TP2:</span> <span className="text-white">${result.signal.takeProfit2.toFixed(2)}</span></div>
                      <div><span className="text-purple-400">R:R:</span> <span className="text-white">{result.signal.riskRewardRatio.toFixed(1)}:1</span></div>
                      <div><span className="text-blue-400">Risk:</span> <span className="text-white">{result.signal.maxRiskPercent}%</span></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confluence Factors */}
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-400" />
                  Confluence Factors ({result.signal.factors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {result.signal.factors.map((factor, idx) => {
                  const signalColor = factor.signal === 'bullish' ? 'text-green-400' : factor.signal === 'bearish' ? 'text-red-400' : 'text-yellow-400';
                  const bgColor = factor.signal === 'bullish' ? 'bg-green-900/20' : factor.signal === 'bearish' ? 'bg-red-900/20' : 'bg-yellow-900/20';
                  return (
                    <div key={idx} className={`p-2 rounded ${bgColor} border border-slate-700`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{factor.name}</span>
                        <Badge variant="outline" className={`${signalColor} text-xs`}>
                          {factor.signal.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{factor.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-slate-500">Weight: {factor.weight}%</span>
                        <span className={factor.score > 0 ? 'text-green-400' : factor.score < 0 ? 'text-red-400' : 'text-yellow-400'}>
                          Score: {factor.score > 0 ? '+' : ''}{factor.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Quick Scan Results */
          <Card className="bg-slate-800/80 border-slate-700 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />
                Quick Market Scan
                {quickScan && <Badge variant="secondary" className="ml-2 text-xs">Fear & Greed: {quickScan.fearGreedIndex}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanLoading ? (
                <div className="text-center py-6">
                  <RefreshCcw className="h-6 w-6 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Scanning markets...</p>
                </div>
              ) : quickScan?.topSetups?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quickScan.topSetups.slice(0, 6).map((setup: any, idx: number) => {
                    const config = recommendationConfig[setup.recommendation] || recommendationConfig.hold;
                    return (
                      <div key={idx} className={`p-3 rounded-lg ${config.bgColor} border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors`}
                        onClick={() => {
                          setSymbol(setup.symbol);
                          setAssetType(setup.assetType);
                          handleAnalyze();
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white">{setup.symbol}</span>
                          <Badge className={`${config.color} text-xs`}>
                            {setup.recommendation.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Price:</span>
                            <span className="text-white">${setup.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Confidence:</span>
                            <span className="text-white">{setup.confidence.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">R:R:</span>
                            <span className="text-white">{setup.riskRewardRatio.toFixed(1)}:1</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Enter a symbol above to get detailed confluence analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PositionCard({ position, onClose, onAutomate, onExecuteAI }: { 
  position: Position; 
  onClose: (id: number) => void;
  onAutomate?: (id: number) => void;
  onExecuteAI?: (id: number) => void;
}) {
  const config = assetTypeConfig[position.assetType] || assetTypeConfig.stock;
  const Icon = config.icon;
  const pnl = position.unrealizedPnl ? parseFloat(position.unrealizedPnl) : 0;
  const pnlPercent = position.unrealizedPnlPercent ? parseFloat(position.unrealizedPnlPercent) : 0;
  const adviceConf = adviceConfig[position.aiAdvice || 'HOLD'] || adviceConfig.HOLD;
  const AdviceIcon = adviceConf.icon;
  
  return (
    <Card className="bg-slate-800/80 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <div>
              <div className="font-bold text-white text-lg">{position.symbol}</div>
              <div className="text-xs text-slate-200 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                <Badge variant={position.side === 'long' ? 'default' : 'destructive'} className="text-xs">
                  {position.side.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-200">Current</div>
            <div className="text-lg font-semibold text-white">
              ${position.currentPrice ? parseFloat(position.currentPrice).toFixed(2) : '--'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          <div>
            <div className="text-slate-200">Entry</div>
            <div className="text-white">${parseFloat(position.entryPrice).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-slate-200">Qty</div>
            <div className="text-white">{parseFloat(position.quantity).toFixed(position.assetType === 'crypto' ? 6 : 2)}</div>
          </div>
          <div>
            <div className="text-slate-200">P/L</div>
            <div className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
            </div>
          </div>
        </div>

        {position.assetType === 'options' && (
          <div className="grid grid-cols-3 gap-2 mb-3 text-sm border-t border-slate-700 pt-2">
            <div>
              <div className="text-slate-200">Strike</div>
              <div className="text-white">${position.strikePrice || '--'}</div>
            </div>
            <div>
              <div className="text-slate-200">Type</div>
              <div className="text-white capitalize">{position.optionType || '--'}</div>
            </div>
            <div>
              <div className="text-slate-200">Expiry</div>
              <div className="text-white">{position.expirationDate || '--'}</div>
            </div>
          </div>
        )}

        {(position.stopLoss || position.takeProfit) && (
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm border-t border-slate-700 pt-2">
            {position.stopLoss && (
              <div>
                <div className="text-red-400 text-xs">Stop Loss</div>
                <div className="text-white">${parseFloat(position.stopLoss).toFixed(2)}</div>
              </div>
            )}
            {position.takeProfit && (
              <div>
                <div className="text-green-400 text-xs">Take Profit</div>
                <div className="text-white">${parseFloat(position.takeProfit).toFixed(2)}</div>
              </div>
            )}
          </div>
        )}

        <div className={`rounded-lg p-3 ${adviceConf.bgColor} border border-slate-600`}>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-300">AI Recommendation</span>
            <Badge className={`ml-auto ${adviceConf.bgColor} ${adviceConf.color} border-0`}>
              <AdviceIcon className="h-3 w-3 mr-1" />
              {position.aiAdvice || 'ANALYZING'}
            </Badge>
          </div>
          <p className="text-xs text-slate-200">{position.aiReasoning || 'Analyzing position...'}</p>
          {position.aiConfidence && (
            <div className="mt-2 flex items-center gap-2">
              <div className="text-xs text-slate-300">Confidence:</div>
              <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${parseFloat(position.aiConfidence)}%` }}
                />
              </div>
              <div className="text-xs text-purple-400">{parseFloat(position.aiConfidence).toFixed(0)}%</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {onAutomate && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-cyan-400 border-cyan-700 hover:bg-cyan-900/30"
              onClick={() => onAutomate(position.id)}
            >
              <Activity className="h-3 w-3 mr-1" />
              Automate
            </Button>
          )}
          {onExecuteAI && (position.aiAdvice === 'EXIT' || position.aiAdvice === 'TAKE_PROFIT') && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-purple-400 border-purple-700 hover:bg-purple-900/30"
              onClick={() => onExecuteAI(position.id)}
            >
              <Brain className="h-3 w-3 mr-1" />
              Execute AI
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-red-400 border-red-700 hover:bg-red-900/30"
            onClick={() => onClose(position.id)}
          >
            Close Position
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddPositionDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState('stock');
  const [side, setSide] = useState('long');
  const [optionType, setOptionType] = useState('call');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addPosition = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/trading-plan/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/portfolio-summary'] });
      toast({ title: 'Position added successfully' });
      setOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add position', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      symbol: formData.get('symbol'),
      assetType: assetType,
      side: side,
      quantity: parseFloat(formData.get('quantity') as string),
      entryPrice: parseFloat(formData.get('entryPrice') as string),
      stopLoss: formData.get('stopLoss') ? parseFloat(formData.get('stopLoss') as string) : null,
      takeProfit: formData.get('takeProfit') ? parseFloat(formData.get('takeProfit') as string) : null,
      notes: formData.get('notes') || null
    };
    
    if (assetType === 'options') {
      data.strikePrice = parseFloat(formData.get('strikePrice') as string);
      data.expirationDate = formData.get('expirationDate');
      data.optionType = optionType;
      data.contractSize = parseInt(formData.get('contractSize') as string) || 100;
    }
    
    addPosition.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-400" />
            Add New Position
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Asset Type</Label>
              <select 
                value={assetType} 
                onChange={(e) => setAssetType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="stock">Stock</option>
                <option value="options">Options</option>
                <option value="crypto">Crypto</option>
                <option value="forex">Forex</option>
                <option value="futures">Futures</option>
              </select>
            </div>
            <div>
              <Label className="text-slate-300">Side</Label>
              <select 
                value={side} 
                onChange={(e) => setSide(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Symbol</Label>
            <Input 
              name="symbol" 
              placeholder={assetType === 'crypto' ? 'BTC, ETH, SOL' : assetType === 'forex' ? 'EURUSD, GBPUSD' : 'AAPL, TSLA, SPY'}
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Quantity</Label>
              <Input 
                name="quantity" 
                type="number" 
                step="any"
                placeholder="100"
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Entry Price</Label>
              <Input 
                name="entryPrice" 
                type="number" 
                step="any"
                placeholder="150.00"
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          {assetType === 'options' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Strike Price</Label>
                  <Input 
                    name="strikePrice" 
                    type="number" 
                    step="any"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Option Type</Label>
                  <select 
                    value={optionType} 
                    onChange={(e) => setOptionType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="call">Call</option>
                    <option value="put">Put</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Expiration Date</Label>
                  <Input 
                    name="expirationDate" 
                    type="date"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Contract Size</Label>
                  <Input 
                    name="contractSize" 
                    type="number"
                    defaultValue="100"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Stop Loss (Optional)</Label>
              <Input 
                name="stopLoss" 
                type="number" 
                step="any"
                placeholder="140.00"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Take Profit (Optional)</Label>
              <Input 
                name="takeProfit" 
                type="number" 
                step="any"
                placeholder="170.00"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Notes (Optional)</Label>
            <Input 
              name="notes" 
              placeholder="Trade thesis or notes..."
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            disabled={addPosition.isPending}
          >
            {addPosition.isPending ? 'Adding...' : 'Add Position'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnalyzeSymbolPanel() {
  const [symbol, setSymbol] = useState('');
  const [assetType, setAssetType] = useState('stock');
  const { toast } = useToast();

  const analyze = useQuery({
    queryKey: ['/api/trading-plan/analyze', symbol, assetType],
    queryFn: async () => {
      if (!symbol) return null;
      const response = await fetch(`/api/trading-plan/analyze/${symbol}?assetType=${assetType}`);
      if (!response.ok) throw new Error('Failed to analyze');
      return response.json();
    },
    enabled: false
  });

  const handleAnalyze = () => {
    if (!symbol) {
      toast({ title: 'Please enter a symbol', variant: 'destructive' });
      return;
    }
    analyze.refetch();
  };

  const result = analyze.data?.data;
  const adviceConf = result ? (adviceConfig[result.recommendation] || adviceConfig.WAIT) : null;

  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-400" />
          Quick Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol..."
            className="bg-slate-900 border-slate-600 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger className="w-28 bg-slate-900 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAnalyze} disabled={analyze.isFetching}>
            {analyze.isFetching ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {result && adviceConf && (
          <div className={`rounded-lg p-4 ${adviceConf.bgColor} border border-slate-600`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{result.symbol}</span>
                <Badge className={`${adviceConf.color}`}>
                  {result.recommendation}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${result.price?.toFixed(2)}</div>
                <div className={result.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {result.changePercent >= 0 ? '+' : ''}{result.changePercent?.toFixed(2)}%
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-300">{result.reasoning}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-200">Trend:</span>
                <span className={`ml-1 ${result.trend === 'bullish' ? 'text-green-400' : result.trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {result.trend}
                </span>
              </div>
              <div>
                <span className="text-slate-200">Vol:</span>
                <span className="ml-1 text-white">{result.volumeStrength}</span>
              </div>
              <div>
                <span className="text-slate-200">High/Low:</span>
                <span className="ml-1 text-white">${result.high?.toFixed(2)}/${result.low?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {['AAPL', 'TSLA', 'NVDA', 'SPY', 'BTC', 'ETH'].map((sym) => (
            <Button
              key={sym}
              size="sm"
              variant="outline"
              className="text-xs bg-slate-900 border-slate-600 hover:bg-slate-700"
              onClick={() => {
                setSymbol(sym);
                setAssetType(sym === 'BTC' || sym === 'ETH' ? 'crypto' : 'stock');
              }}
            >
              {sym}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AITradingPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: positionsData, isLoading: positionsLoading, refetch: refetchPositions } = useQuery<{ success: boolean; data: Position[] }>({
    queryKey: ['/api/trading-plan/positions'],
    refetchInterval: 60000
  });

  const { data: summaryData } = useQuery<{ success: boolean; data: PortfolioSummary }>({
    queryKey: ['/api/trading-plan/portfolio-summary'],
    refetchInterval: 60000
  });

  const closePosition = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/trading-plan/positions/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/portfolio-summary'] });
      toast({ title: 'Position closed' });
    }
  });

  const automatePosition = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/trading-plan/positions/${id}/automate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoExecuteAI: true, exitOnlyMode: true })
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
      toast({ 
        title: 'Position automated', 
        description: data.data?.message || 'Position is now managed by automation engine'
      });
    },
    onError: () => {
      toast({ title: 'Failed to automate position', variant: 'destructive' });
    }
  });

  const executeAIAdvice = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/trading-plan/positions/${id}/execute-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/portfolio-summary'] });
      const action = data.data?.action;
      if (action === 'closed') {
        toast({ title: 'AI executed: Position closed', description: data.data?.result?.reason });
      } else if (action === 'alert_created') {
        toast({ title: 'AI recommendation noted', description: 'Alert created for scale-in opportunity' });
      } else {
        toast({ title: 'AI advice: No action needed', description: data.data?.result?.reason });
      }
    },
    onError: () => {
      toast({ title: 'Failed to execute AI advice', variant: 'destructive' });
    }
  });

  const positions: Position[] = positionsData?.data || [];
  const summary: PortfolioSummary = summaryData?.data || { totalPositions: 0, totalValue: 0, totalPnl: 0, pnlPercent: 0, byAssetType: {} };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-400" />
              AI Trading Plan
            </h1>
            <p className="text-slate-200 mt-1">Real-time portfolio tracking with AI-powered recommendations</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => refetchPositions()}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <AddPositionDialog onSuccess={() => {}} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="p-4 text-center">
              <Briefcase className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{summary.totalPositions}</div>
              <div className="text-sm text-blue-300/80">Active Positions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-purple-300/80">Total Value</div>
            </CardContent>
          </Card>
          <Card className={`bg-gradient-to-br ${summary.totalPnl >= 0 ? 'from-green-900/50 to-green-800/30 border-green-700/50' : 'from-red-900/50 to-red-800/30 border-red-700/50'}`}>
            <CardContent className="p-4 text-center">
              {summary.totalPnl >= 0 ? <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" /> : <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />}
              <div className={`text-2xl font-bold ${summary.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.totalPnl >= 0 ? '+' : ''}${summary.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-slate-300/80">Unrealized P/L</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-700/50">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${summary.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.pnlPercent >= 0 ? '+' : ''}{summary.pnlPercent.toFixed(2)}%
              </div>
              <div className="text-sm text-cyan-300/80">Return</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="positions">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="positions" className="data-[state=active]:bg-purple-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  My Positions ({positions.length})
                </TabsTrigger>
                <TabsTrigger value="strategy" className="data-[state=active]:bg-blue-600">
                  <Brain className="h-4 w-4 mr-2" />
                  Enhanced Strategy
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:bg-yellow-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alerts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="mt-4">
                {positionsLoading ? (
                  <div className="text-center py-12">
                    <RefreshCcw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-slate-200">Loading positions...</p>
                  </div>
                ) : positions.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <Briefcase className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Active Positions</h3>
                      <p className="text-slate-200 mb-4">Add your first investment to start tracking with AI recommendations</p>
                      <AddPositionDialog onSuccess={() => {}} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positions.map((position) => (
                      <PositionCard 
                        key={position.id} 
                        position={position}
                        onClose={(id) => closePosition.mutate(id)}
                        onAutomate={(id) => automatePosition.mutate(id)}
                        onExecuteAI={(id) => executeAIAdvice.mutate(id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="strategy" className="mt-4">
                <EnhancedStrategyTab />
              </TabsContent>

              <TabsContent value="alerts" className="mt-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-200">No active alerts</p>
                    <p className="text-xs text-slate-300 mt-2">Alerts will appear when volatility spikes or price targets are hit</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <AnalyzeSymbolPanel />

            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  Asset Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(summary.byAssetType).length === 0 ? (
                  <p className="text-sm text-slate-200 text-center py-4">No positions to display</p>
                ) : (
                  Object.entries(summary.byAssetType).map(([type, data]) => {
                    const config = assetTypeConfig[type] || assetTypeConfig.stock;
                    const Icon = config.icon;
                    return (
                      <div key={type} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span className="text-sm text-white">{config.label}</span>
                          <Badge variant="secondary" className="text-xs">{data.count}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">${data.value.toFixed(0)}</div>
                          <div className={`text-xs ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
