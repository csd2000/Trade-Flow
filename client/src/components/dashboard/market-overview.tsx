import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { MarketData } from "@/types";

interface MarketOverviewProps {
  marketData: MarketData[];
  fearGreedIndex?: string;
}

export function MarketOverview({ marketData, fearGreedIndex = "72 - Greed" }: MarketOverviewProps) {
  const [indexValue, sentiment] = fearGreedIndex.split(' - ');
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Extreme Fear': return 'text-crypto-error';
      case 'Fear': return 'text-crypto-warning';
      case 'Neutral': return 'text-crypto-muted';
      case 'Greed': return 'text-crypto-tertiary';
      case 'Extreme Greed': return 'text-crypto-primary';
      default: return 'text-crypto-muted';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Extreme Fear': return 'badge-error';
      case 'Fear': return 'badge-warning';
      case 'Neutral': return 'badge-secondary';
      case 'Greed': return 'badge-success';
      case 'Extreme Greed': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
              <div className="p-2 bg-crypto-tertiary rounded-xl bg-opacity-15">
                <BarChart3 className="w-5 h-5 text-crypto-tertiary" />
              </div>
              Market Overview
            </CardTitle>
            <p className="text-crypto-muted mt-1">
              Real-time cryptocurrency prices and market sentiment
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="badge-primary animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <RefreshCw className="w-4 h-4 text-crypto-muted cursor-pointer hover:text-crypto-primary transition-colors" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fear & Greed Index */}
        <div className="p-4 rounded-xl bg-crypto-surface border border-crypto-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-crypto-text font-semibold">Fear & Greed Index</h3>
            <Badge className={getSentimentBadge(sentiment)}>
              {sentiment}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-crypto-text">
              {indexValue}
            </div>
            <div className="flex-1">
              <div className="w-full bg-crypto-card rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${indexValue}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-crypto-muted mt-1">
                <span>Extreme Fear</span>
                <span>Extreme Greed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Data */}
        <div className="space-y-3">
          {marketData.map((coin, index) => {
            const isPositive = !coin.change.startsWith('-');
            
            return (
              <div
                key={index}
                className="p-4 rounded-xl bg-crypto-surface border border-crypto-border hover:border-crypto-primary transition-all duration-300 hover:bg-crypto-card group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: coin.color + '20' }}
                    >
                      {coin.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-crypto-text">
                        {coin.symbol}
                      </div>
                      <div className="text-sm text-crypto-muted">
                        {coin.name}
                      </div>
                      <div className="text-xs text-crypto-muted">
                        Live Price
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-crypto-text">
                      {coin.price}
                    </div>
                    <div className="flex items-center text-sm">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1 text-crypto-tertiary" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1 text-crypto-error" />
                      )}
                      <span className={`font-semibold ${isPositive ? 'text-crypto-tertiary' : 'text-crypto-error'}`}>
                        {coin.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action */}
        <div className="pt-4 border-t border-crypto-border">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-primary bg-opacity-10 border border-crypto-primary border-opacity-30">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-crypto-primary" />
              <div>
                <div className="font-semibold text-crypto-text text-sm">
                  View Full Market Analysis
                </div>
                <div className="text-xs text-crypto-muted">
                  Advanced charts and insights
                </div>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-crypto-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}