import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  GitCompare,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  Globe
} from 'lucide-react';

interface AssetData {
  symbol: string;
  name: string;
  category: 'equity' | 'bond' | 'commodity' | 'currency' | 'volatility' | 'crypto';
  prices: number[];
  currentPrice: number;
  change24h: number;
  changePercent: number;
}

interface CorrelationPair {
  asset1: string;
  asset2: string;
  correlation: number;
  relationship: string;
  tradingImplication: string;
}

interface IntermarketSignal {
  type: 'risk_on' | 'risk_off' | 'rotation' | 'divergence' | 'confirmation';
  strength: number;
  description: string;
  assets: string[];
  timestamp: string;
}

interface IntermarketAnalysis {
  assets: AssetData[];
  correlations: CorrelationPair[];
  signals: IntermarketSignal[];
  marketRegime: 'risk_on' | 'risk_off' | 'transitioning' | 'uncertain';
  aiInsight: string;
  timestamp: string;
}

interface AnalysisResponse {
  success: boolean;
  data: IntermarketAnalysis;
  error?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  equity: 'bg-blue-500',
  bond: 'bg-green-500',
  commodity: 'bg-amber-500',
  currency: 'bg-purple-500',
  volatility: 'bg-red-500',
  crypto: 'bg-orange-500'
};

const REGIME_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  risk_on: { color: 'bg-green-500', icon: TrendingUp, label: 'Risk-On' },
  risk_off: { color: 'bg-red-500', icon: TrendingDown, label: 'Risk-Off' },
  transitioning: { color: 'bg-amber-500', icon: Activity, label: 'Transitioning' },
  uncertain: { color: 'bg-slate-500', icon: AlertTriangle, label: 'Uncertain' }
};

function CorrelationCell({ value }: { value: number }) {
  const intensity = Math.abs(value);
  let bgColor = 'bg-slate-700';
  
  if (value >= 0.7) bgColor = 'bg-green-600';
  else if (value >= 0.3) bgColor = 'bg-green-500/50';
  else if (value <= -0.7) bgColor = 'bg-red-600';
  else if (value <= -0.3) bgColor = 'bg-red-500/50';
  else if (Math.abs(value) < 0.3) bgColor = 'bg-slate-600';
  
  return (
    <div 
      className={`w-12 h-12 flex items-center justify-center text-xs font-mono text-white rounded ${bgColor}`}
      title={`Correlation: ${value.toFixed(2)}`}
    >
      {value.toFixed(2)}
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetData }) {
  const isPositive = asset.changePercent >= 0;
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={`${CATEGORY_COLORS[asset.category]} text-white text-xs`}>
              {asset.category}
            </Badge>
            <span className="font-bold text-white">{asset.symbol}</span>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span className="font-mono text-sm">{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
          </div>
        </div>
        <p className="text-slate-200 text-sm mb-2">{asset.name}</p>
        <p className="text-lg font-bold text-white">
          ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </CardContent>
    </Card>
  );
}

function SignalCard({ signal }: { signal: IntermarketSignal }) {
  const typeConfig: Record<string, { color: string; icon: any }> = {
    risk_on: { color: 'border-green-500 bg-green-500/10', icon: TrendingUp },
    risk_off: { color: 'border-red-500 bg-red-500/10', icon: TrendingDown },
    rotation: { color: 'border-amber-500 bg-amber-500/10', icon: Activity },
    divergence: { color: 'border-purple-500 bg-purple-500/10', icon: GitCompare },
    confirmation: { color: 'border-blue-500 bg-blue-500/10', icon: Target }
  };
  
  const config = typeConfig[signal.type] || typeConfig.confirmation;
  const Icon = config.icon;
  
  return (
    <Card className={`border ${config.color}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-white border-slate-500">
                {signal.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-200">Strength:</span>
                <Progress value={signal.strength} className="w-16 h-2" />
                <span className="text-xs text-amber-400">{signal.strength}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-2">{signal.description}</p>
            <div className="flex gap-1">
              {signal.assets.map(asset => (
                <Badge key={asset} variant="outline" className="text-xs border-slate-600 text-slate-200">
                  {asset}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CorrelationMatrix({ correlations, assets }: { correlations: CorrelationPair[]; assets: AssetData[] }) {
  const symbols = assets.map(a => a.symbol);
  
  const getCorrelation = (s1: string, s2: string): number => {
    if (s1 === s2) return 1;
    const pair = correlations.find(c => 
      (c.asset1 === s1 && c.asset2 === s2) || 
      (c.asset1 === s2 && c.asset2 === s1)
    );
    return pair?.correlation || 0;
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-2 text-slate-200 text-sm"></th>
            {symbols.map(s => (
              <th key={s} className="p-2 text-slate-300 text-sm font-medium">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map(row => (
            <tr key={row}>
              <td className="p-2 text-slate-300 text-sm font-medium">{row}</td>
              {symbols.map(col => (
                <td key={`${row}-${col}`} className="p-1">
                  <CorrelationCell value={getCorrelation(row, col)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded" />
          <span>Strong Positive (≥0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/50 rounded" />
          <span>Positive (0.3-0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-600 rounded" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/50 rounded" />
          <span>Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          <span>Strong Negative (≤-0.7)</span>
        </div>
      </div>
    </div>
  );
}

export default function IntermarketAnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, isLoading, isError, error, refetch } = useQuery<AnalysisResponse>({
    queryKey: ['/api/intermarket/analysis'],
    queryFn: async () => {
      const res = await fetch('/api/intermarket/analysis');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch analysis' }));
        throw new Error(errorData.error || 'Failed to fetch analysis');
      }
      return res.json();
    },
    refetchInterval: 60000,
    retry: 1
  });
  
  const analysis = data?.data;
  const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
  
  const regimeConfig = analysis ? REGIME_CONFIG[analysis.marketRegime] : null;
  const RegimeIcon = regimeConfig?.icon || AlertTriangle;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" data-testid="page-title-intermarket">
                Intermarket Analysis
              </h1>
              <p className="text-sm text-slate-200">Cross-Asset Correlations • Market Regime Detection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {analysis && regimeConfig && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${regimeConfig.color}/20 border border-${regimeConfig.color.replace('bg-', '')}/50`}>
                <RegimeIcon className="h-5 w-5 text-white" />
                <span className="text-white font-medium">{regimeConfig.label} Environment</span>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              data-testid="button-refresh-intermarket"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {isError && (
          <Card className="bg-red-900/20 border-red-500/50 mb-6">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-2">Failed to Load Intermarket Data</p>
              <p className="text-sm text-slate-200 mb-4">{errorMessage}</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-200">Analyzing intermarket relationships...</p>
            </div>
          </div>
        )}
        
        {analysis && !isLoading && (
          <>
            {analysis.aiInsight && (
              <Card className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Globe className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-indigo-300 font-medium mb-1">AI Market Insight</p>
                      <p className="text-slate-300">{analysis.aiInsight}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-slate-200 text-sm">Assets Tracked</p>
                  <p className="text-2xl font-bold text-white">{analysis.assets.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-slate-200 text-sm">Active Signals</p>
                  <p className="text-2xl font-bold text-amber-400">{analysis.signals.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-slate-200 text-sm">Strong Correlations</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    {analysis.correlations.filter(c => Math.abs(c.correlation) >= 0.7).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-slate-200 text-sm">Market Regime</p>
                  <p className={`text-xl font-bold ${
                    analysis.marketRegime === 'risk_on' ? 'text-green-400' : 
                    analysis.marketRegime === 'risk_off' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {analysis.marketRegime.replace('_', ' ').toUpperCase()}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 mb-4">
                <TabsTrigger value="overview" data-testid="tab-overview">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Asset Overview
                </TabsTrigger>
                <TabsTrigger value="correlations" data-testid="tab-correlations">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Correlation Matrix
                </TabsTrigger>
                <TabsTrigger value="signals" data-testid="tab-signals">
                  <Zap className="h-4 w-4 mr-2" />
                  Market Signals
                </TabsTrigger>
                <TabsTrigger value="relationships" data-testid="tab-relationships">
                  <Target className="h-4 w-4 mr-2" />
                  Key Relationships
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysis.assets.map(asset => (
                    <AssetCard key={asset.symbol} asset={asset} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="correlations">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-indigo-400" />
                      30-Day Return Correlation Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CorrelationMatrix correlations={analysis.correlations} assets={analysis.assets} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="signals">
                {analysis.signals.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-8 text-center">
                      <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-200">No active intermarket signals detected</p>
                      <p className="text-sm text-slate-300">Markets are in a neutral state</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {analysis.signals.map((signal, i) => (
                      <SignalCard key={i} signal={signal} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="relationships">
                <div className="space-y-3">
                  {analysis.correlations.slice(0, 10).map((corr, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-white border-slate-500">
                              {corr.asset1}
                            </Badge>
                            {corr.correlation >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <Badge variant="outline" className="text-white border-slate-500">
                              {corr.asset2}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${
                              corr.correlation >= 0.5 ? 'text-green-400' : 
                              corr.correlation <= -0.5 ? 'text-red-400' : 'text-slate-200'
                            }`}>
                              {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                            </span>
                            <Badge className={`${
                              corr.relationship.includes('positive') ? 'bg-green-500/20 text-green-400' :
                              corr.relationship.includes('negative') ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-200'
                            }`}>
                              {corr.relationship.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-200">{corr.tradingImplication}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
