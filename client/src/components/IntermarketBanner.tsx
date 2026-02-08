import { useIntermarketContext } from '@/hooks/useIntermarketContext';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface IntermarketBannerProps {
  compact?: boolean;
  showGuidance?: boolean;
}

export function IntermarketBanner({ compact = false, showGuidance = true }: IntermarketBannerProps) {
  const { data, isLoading, marketBias, riskAppetite, tradingGuidance, keyCorrelations } = useIntermarketContext();

  if (isLoading) {
    return (
      <div className="bg-muted/30 border border-border rounded-lg p-3" data-testid="intermarket-banner-loading">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const BiasIcon = marketBias === 'bullish' ? TrendingUp : marketBias === 'bearish' ? TrendingDown : Minus;
  const biasColor = marketBias === 'bullish' ? 'text-green-500' : marketBias === 'bearish' ? 'text-red-500' : 'text-yellow-500';
  const regimeColor = data.marketRegime === 'risk_on' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      data.marketRegime === 'risk_off' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';

  if (compact) {
    return (
      <Link href="/intermarket">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
          data-testid="intermarket-banner-compact"
        >
          <Network className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Intermarket:</span>
          <Badge variant="outline" className={`text-xs ${regimeColor}`}>
            {data.marketRegime.replace('_', ' ').toUpperCase()}
          </Badge>
          <BiasIcon className={`w-4 h-4 ${biasColor}`} />
          <span className={`text-xs font-semibold ${biasColor}`}>
            {marketBias.toUpperCase()}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div 
      className="bg-gradient-to-r from-muted/50 to-muted/30 border border-border rounded-xl p-4"
      data-testid="intermarket-banner-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Intermarket Context</span>
          <Link href="/intermarket">
            <span className="text-xs text-primary hover:underline cursor-pointer">View Details →</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={regimeColor}>
            {data.marketRegime.replace('_', ' ').toUpperCase()}
          </Badge>
          <div className="flex items-center gap-1">
            <BiasIcon className={`w-5 h-5 ${biasColor}`} />
            <span className={`text-sm font-bold ${biasColor}`}>
              {marketBias.toUpperCase()} BIAS
            </span>
          </div>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-background/50 border border-border/50 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-foreground">{tradingGuidance}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {data.assets.slice(0, 4).map(asset => (
          <div key={asset.symbol} className="flex items-center justify-between bg-background/30 rounded-lg px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">{asset.symbol}</span>
            <span className={`text-xs font-bold ${asset.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {keyCorrelations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keyCorrelations.map((corr, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <span>{corr}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function IntermarketMini() {
  const { data, isLoading, marketBias } = useIntermarketContext();

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded text-xs">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-12" />
      </div>
    );
  }

  const BiasIcon = marketBias === 'bullish' ? TrendingUp : marketBias === 'bearish' ? TrendingDown : Minus;
  const biasColor = marketBias === 'bullish' ? 'text-green-500' : marketBias === 'bearish' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded text-xs" data-testid="intermarket-mini">
      <BiasIcon className={`w-3 h-3 ${biasColor}`} />
      <span className={`font-semibold ${biasColor}`}>{marketBias.toUpperCase()}</span>
    </div>
  );
}
