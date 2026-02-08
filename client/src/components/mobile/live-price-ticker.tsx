import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

export function LivePriceTicker() {
  const { prices, loading, lastUpdate, refresh } = useCryptoPrices();

  if (loading && prices.length === 0) {
    return (
      <Card className="bg-crypto-surface border-crypto-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 animate-pulse">
            <div className="w-8 h-8 bg-crypto-border rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-crypto-border rounded w-24 mb-1"></div>
              <div className="h-3 bg-crypto-border rounded w-16"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-crypto-surface border-crypto-border overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-crypto-border">
          <div>
            <h3 className="text-crypto-text font-semibold">Live Prices</h3>
            <p className="text-crypto-muted text-xs">
              Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
            </p>
          </div>
          <button 
            onClick={refresh}
            className="p-2 hover:bg-crypto-card rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-crypto-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Scrolling Ticker */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-x">
            {prices.concat(prices).map((price, index) => (
              <div key={`${price.id}-${index}`} className="flex-shrink-0 p-4 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-crypto-primary/20 flex items-center justify-center">
                    <span className="text-crypto-primary font-bold text-sm">
                      {price.symbol.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-crypto-text font-semibold text-sm">
                        ${price.current_price.toLocaleString()}
                      </span>
                      <Badge 
                        variant={price.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                        className="text-xs px-1 py-0"
                      >
                        {price.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(price.price_change_percentage_24h).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-crypto-muted text-xs">
                      {price.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 bg-crypto-card/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-crypto-muted text-xs">Market Cap</p>
              <p className="text-crypto-text font-semibold text-sm">
                $1.67T
              </p>
            </div>
            <div>
              <p className="text-crypto-muted text-xs">24h Volume</p>
              <p className="text-crypto-text font-semibold text-sm">
                $47.2B
              </p>
            </div>
            <div>
              <p className="text-crypto-muted text-xs">Dominance</p>
              <p className="text-crypto-text font-semibold text-sm">
                BTC 51.2%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}