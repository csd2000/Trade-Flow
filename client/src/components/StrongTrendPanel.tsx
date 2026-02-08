import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle } from 'lucide-react';

interface StrongTrendSignal {
  symbol: string;
  trend: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  trendStrength: number;
  confidence: number;
  direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  priceAction: {
    currentPrice: number;
    priceChangePercent24h: number;
  };
  volumeAnalysis: {
    volumeRatio: number;
    volumeSurge: boolean;
  };
  reasoning: string[];
  timestamp: string;
}

interface StrongTrendPanelProps {
  symbol: string;
  compact?: boolean;
  showReasons?: boolean;
  onTrendChange?: (trend: StrongTrendSignal | null) => void;
}

export function StrongTrendPanel({ symbol, onTrendChange }: StrongTrendPanelProps) {
  const { data: trendData, isLoading, refetch, error } = useQuery<StrongTrendSignal>({
    queryKey: ['/api/strong-trend/analyze', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/strong-trend/analyze/${symbol}`);
      if (!res.ok) throw new Error('Failed to analyze trend');
      const data = await res.json();
      if (onTrendChange) onTrendChange(data);
      return data;
    },
    enabled: !!symbol && symbol.length > 0,
    refetchInterval: 60000
  });

  if (!symbol) return null;

  const isBullish = trendData?.trend.includes('BULLISH');
  const isBearish = trendData?.trend.includes('BEARISH');
  const isStrong = trendData?.trend.includes('STRONG');
  const isNeutral = trendData?.trend === 'NEUTRAL';

  const getTrendLabel = () => {
    if (!trendData) return 'Analyzing...';
    if (trendData.trend === 'STRONG_BULLISH') return 'STRONG BUY SIGNAL';
    if (trendData.trend === 'BULLISH') return 'BULLISH TREND';
    if (trendData.trend === 'STRONG_BEARISH') return 'STRONG SELL SIGNAL';
    if (trendData.trend === 'BEARISH') return 'BEARISH TREND';
    return 'NO CLEAR TREND';
  };

  const getBackgroundColor = () => {
    if (!trendData || isNeutral) return 'bg-slate-800 border-slate-600';
    if (isBullish && isStrong) return 'bg-gradient-to-r from-green-900 to-emerald-800 border-green-500';
    if (isBullish) return 'bg-green-900/50 border-green-600/50';
    if (isBearish && isStrong) return 'bg-gradient-to-r from-red-900 to-rose-800 border-red-500';
    if (isBearish) return 'bg-red-900/50 border-red-600/50';
    return 'bg-slate-800 border-slate-600';
  };

  const getIcon = () => {
    if (!trendData || isNeutral) return <Minus className="h-8 w-8 text-slate-400" />;
    if (isBullish) return <TrendingUp className={`h-8 w-8 ${isStrong ? 'text-green-300 animate-pulse' : 'text-green-400'}`} />;
    if (isBearish) return <TrendingDown className={`h-8 w-8 ${isStrong ? 'text-red-300 animate-pulse' : 'text-red-400'}`} />;
    return <Minus className="h-8 w-8 text-slate-400" />;
  };

  return (
    <Card className={`${getBackgroundColor()} border-2 transition-all duration-300`}>
      <CardContent className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-2">
            <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />
            <span className="text-slate-400">Analyzing trend...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-3 py-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Unable to analyze</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {trendData && !isLoading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getIcon()}
              <div>
                <div className="text-xl font-bold text-white mb-1">
                  {symbol}
                </div>
                <div className={`text-lg font-bold ${
                  isBullish ? 'text-green-300' : 
                  isBearish ? 'text-red-300' : 
                  'text-slate-300'
                }`}>
                  {getTrendLabel()}
                </div>
                <div className="text-sm text-slate-400">
                  Strength: {trendData.trendStrength}% • Confidence: {trendData.confidence.toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                ${trendData.priceAction.currentPrice.toFixed(2)}
              </div>
              <div className={`text-sm ${trendData.priceAction.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trendData.priceAction.priceChangePercent24h >= 0 ? '+' : ''}{trendData.priceAction.priceChangePercent24h.toFixed(2)}%
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-slate-400 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StrongTrendBadge({ symbol }: { symbol: string }) {
  const { data: trendData } = useQuery<StrongTrendSignal>({
    queryKey: ['/api/strong-trend/analyze', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/strong-trend/analyze/${symbol}`);
      if (!res.ok) throw new Error('Failed to analyze trend');
      return res.json();
    },
    enabled: !!symbol && symbol.length > 0,
    refetchInterval: 120000
  });

  if (!trendData || trendData.trend === 'NEUTRAL') return null;

  const isStrong = trendData.trend === 'STRONG_BULLISH' || trendData.trend === 'STRONG_BEARISH';
  const isBullish = trendData.trend.includes('BULLISH');

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
      isBullish ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    } ${isStrong ? 'animate-pulse' : ''}`}>
      {isBullish ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isStrong ? 'STRONG ' : ''}{isBullish ? 'BUY' : 'SELL'}
    </span>
  );
}

export default StrongTrendPanel;
