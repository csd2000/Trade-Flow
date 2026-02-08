import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, DollarSign } from "lucide-react";

export function RealTimeMarket() {
  const topMovers = [
    { symbol: "XLM", name: "Stellar", price: "$0.37", change: "+22.50%", volume: "$2.1B" },
    { symbol: "XRP", name: "Ripple", price: "$2.77", change: "+7.18%", volume: "$8.4B" },
    { symbol: "HYPE", name: "Hyperliquid", price: "$46.88", change: "+2.89%", volume: "$890M" },
    { symbol: "TRX", name: "TRON", price: "$0.30", change: "+2.97%", volume: "$1.2B" }
  ];

  const marketStats = [
    { label: "Total Market Cap", value: "$3.8T", change: "+0.85%" },
    { label: "DeFi TVL", value: "$180.4B", change: "+2.1%" },
    { label: "24h Volume", value: "$425.8B", change: "-1.2%" },
    { label: "BTC Dominance", value: "58.2%", change: "-0.3%" }
  ];

  const fearGreedData = {
    index: 72,
    label: "Greed",
    color: "text-crypto-green",
    bgColor: "bg-crypto-green/10"
  };

  return (
    <div className="space-y-6">
      {/* Market Statistics */}
      <Card className="bg-crypto-surface border-gray-700 p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Market Overview
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {marketStats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-gray-400 text-xs">{stat.label}</p>
              <p className="text-white font-semibold">{stat.value}</p>
              <div className={`text-xs flex items-center ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change.startsWith('+') ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fear & Greed Index */}
      <Card className="bg-crypto-surface border-gray-700 p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Fear & Greed Index
        </h4>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto ${fearGreedData.bgColor} rounded-full flex items-center justify-center mb-3`}>
            <span className={`text-2xl font-bold ${fearGreedData.color}`}>
              {fearGreedData.index}
            </span>
          </div>
          <p className={`font-medium ${fearGreedData.color}`}>{fearGreedData.label}</p>
          <p className="text-gray-400 text-sm mt-1">Indicating strong market sentiment</p>
        </div>
      </Card>

      {/* Top Movers */}
      <Card className="bg-crypto-surface border-gray-700 p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Top Movers (24h)
        </h4>
        <div className="space-y-3">
          {topMovers.map((coin, index) => {
            const isPositive = coin.change.startsWith("+");
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">{coin.symbol}</span>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      #{index + 1}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{coin.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{coin.price}</p>
                  <div className={`text-sm flex items-center justify-end ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {coin.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}