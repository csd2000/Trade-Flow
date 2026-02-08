import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketSentiment, useCryptoPrices } from "@/hooks/use-crypto-prices";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Timer
} from "lucide-react";

export function MarketSentimentDashboard() {
  const { data: sentiment } = useMarketSentiment();
  const { data: prices } = useCryptoPrices(['bitcoin', 'ethereum', 'binancecoin', 'cardano']);

  const getSentimentEmoji = (value: number) => {
    if (value <= 20) return '😱'; // Extreme Fear
    if (value <= 40) return '😰'; // Fear
    if (value <= 60) return '😐'; // Neutral
    if (value <= 80) return '😊'; // Greed
    return '🤑'; // Extreme Greed
  };

  const getSentimentColor = (value: number) => {
    if (value <= 20) return 'text-red-500';
    if (value <= 40) return 'text-orange-500';
    if (value <= 60) return 'text-yellow-500';
    if (value <= 80) return 'text-crypto-tertiary';
    return 'text-crypto-primary';
  };

  const getSentimentStrategy = (value: number) => {
    if (value <= 25) return {
      action: "Excellent Buy Opportunity",
      description: "Extreme fear creates buying opportunities",
      icon: Target,
      color: "text-crypto-tertiary"
    };
    if (value <= 50) return {
      action: "Consider DCA Strategy", 
      description: "Fear levels suggest gradual accumulation",
      icon: TrendingDown,
      color: "text-crypto-quaternary"
    };
    if (value <= 75) return {
      action: "Monitor Positions",
      description: "Neutral sentiment, maintain current strategy",
      icon: Activity,
      color: "text-crypto-muted"
    };
    return {
      action: "Consider Taking Profits",
      description: "Extreme greed suggests caution and profit-taking",
      icon: AlertTriangle,
      color: "text-crypto-quaternary"
    };
  };

  const marketMomentum = prices ? (prices.reduce((acc, price) => {
    return acc + (price.price_change_percentage_24h || 0);
  }, 0) / prices.length) : 0;

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
          <div className="p-2 bg-crypto-primary/15 rounded-lg">
            <Activity className="w-5 h-5 text-crypto-primary" />
          </div>
          Market Sentiment
          <Badge className="badge-success animate-pulse">Live</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {sentiment ? (
          <>
            {/* Fear & Greed Index */}
            <div className="text-center p-6 bg-crypto-surface rounded-2xl border border-crypto-border">
              <div className="text-6xl mb-3">
                {getSentimentEmoji(sentiment.value)}
              </div>
              <div className={`text-3xl font-black mb-2 ${getSentimentColor(sentiment.value)}`}>
                {sentiment.value}/100
              </div>
              <div className="text-crypto-text font-semibold mb-1">
                {sentiment.classification}
              </div>
              <div className="text-crypto-muted text-sm">
                Fear & Greed Index
              </div>
            </div>

            {/* Strategy Recommendation */}
            <div className="p-4 bg-crypto-card rounded-xl">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-crypto-surface ${getSentimentStrategy(sentiment.value).color}`}>
                  {(() => {
                    const Icon = getSentimentStrategy(sentiment.value).icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h4 className="font-semibold text-crypto-text mb-1">
                    {getSentimentStrategy(sentiment.value).action}
                  </h4>
                  <p className="text-crypto-muted text-sm">
                    {getSentimentStrategy(sentiment.value).description}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Momentum */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-crypto-surface rounded-lg">
                <div className={`text-lg font-bold mb-1 ${
                  marketMomentum > 0 ? 'text-crypto-tertiary' : 'text-red-400'
                }`}>
                  {marketMomentum > 0 ? '+' : ''}{marketMomentum?.toFixed(2)}%
                </div>
                <div className="text-crypto-muted text-xs">24h Momentum</div>
              </div>
              
              <div className="text-center p-4 bg-crypto-surface rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {sentiment.value > 50 ? (
                    <TrendingUp className="w-4 h-4 text-crypto-tertiary" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-lg font-bold ${
                    sentiment.value > 50 ? 'text-crypto-tertiary' : 'text-red-400'
                  }`}>
                    {sentiment.value > 50 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <div className="text-crypto-muted text-xs">Market Bias</div>
              </div>
            </div>

            {/* Top Movers */}
            {prices && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-crypto-text">Top Movers (24h)</h4>
                <div className="space-y-2">
                  {prices
                    .sort((a, b) => Math.abs(b.price_change_percentage_24h || 0) - Math.abs(a.price_change_percentage_24h || 0))
                    .slice(0, 3)
                    .map((price, index) => (
                    <div key={price.id} className="flex items-center justify-between p-3 bg-crypto-surface rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={price.image} 
                          alt={price.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-crypto-text text-sm">
                            {price.symbol.toUpperCase()}
                          </div>
                          <div className="text-crypto-muted text-xs">
                            ${price.current_price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right ${
                        (price.price_change_percentage_24h || 0) > 0 ? 'text-crypto-tertiary' : 'text-red-400'
                      }`}>
                        <div className="font-semibold text-sm">
                          {(price.price_change_percentage_24h || 0) > 0 ? '+' : ''}
                          {price.price_change_percentage_24h?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-crypto-surface hover:bg-crypto-card rounded-lg transition-colors text-left">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-crypto-primary" />
                  <span className="text-crypto-text text-sm font-semibold">Auto Strategy</span>
                </div>
                <div className="text-crypto-muted text-xs">
                  Activate sentiment-based trading
                </div>
              </button>
              
              <button className="p-3 bg-crypto-surface hover:bg-crypto-card rounded-lg transition-colors text-left">
                <div className="flex items-center space-x-2 mb-1">
                  <Timer className="w-4 h-4 text-crypto-secondary" />
                  <span className="text-crypto-text text-sm font-semibold">Set Alerts</span>
                </div>
                <div className="text-crypto-muted text-xs">
                  Notify on sentiment shifts
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-crypto-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-crypto-muted">Loading market sentiment...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}