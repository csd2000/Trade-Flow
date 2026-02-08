import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Building, 
  TrendingUp, 
  Eye, 
  Clock,
  ArrowRight,
  DollarSign,
  User,
  Zap,
  AlertTriangle,
  Target,
  BarChart3
} from "lucide-react";

export function NancyPelosiQuickAction() {
  const recentTrades = [
    {
      ticker: "NVDA",
      action: "Buy",
      amount: "$1M-$5M",
      performance: "+23.4%",
      date: "Jan 15",
      sector: "Tech"
    },
    {
      ticker: "GOOGL", 
      action: "Buy",
      amount: "$500K-$1M",
      performance: "+18.7%",
      date: "Jan 8",
      sector: "Tech"
    },
    {
      ticker: "TSLA",
      action: "Buy", 
      amount: "$250K-$500K",
      performance: "+31.5%",
      date: "Nov 28",
      sector: "Auto"
    }
  ];

  const strategyMetrics = {
    winRate: "74%",
    avgReturn: "+12.3%",
    bestTrade: "+45.7%",
    trackingDelay: "30-45 days"
  };

  const currentSignal = {
    ticker: "NVDA",
    direction: "Strong Buy",
    confidence: "High",
    reasoning: "Recent $1M+ purchase, tech committee insight"
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-crypto-text">Nancy Pelosi Strategy</CardTitle>
              <p className="text-crypto-muted text-sm">Congressional Trade Following</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-crypto-text text-sm font-medium">{strategyMetrics.avgReturn}</span>
            </div>
            <p className="text-crypto-muted text-xs">Avg Return</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Signal */}
        <div className="p-3 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-crypto-text font-medium text-sm">Active Signal</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-crypto-text font-bold">${currentSignal.ticker}</span>
              <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                {currentSignal.direction}
              </Badge>
            </div>
            <p className="text-crypto-muted text-xs">{currentSignal.reasoning}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-crypto-surface rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-crypto-muted text-xs">Win Rate</span>
            </div>
            <div className="text-crypto-text font-semibold">{strategyMetrics.winRate}</div>
          </div>
          <div className="p-3 bg-crypto-surface rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-crypto-muted text-xs">Best Trade</span>
            </div>
            <div className="text-crypto-text font-semibold">{strategyMetrics.bestTrade}</div>
          </div>
        </div>

        {/* Recent High-Impact Trades */}
        <div>
          <h4 className="text-crypto-text font-medium mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Recent Congressional Trades
          </h4>
          <div className="space-y-2">
            {recentTrades.slice(0, 2).map((trade, index) => (
              <div key={index} className="p-3 bg-crypto-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-crypto-text font-semibold">${trade.ticker}</span>
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                      {trade.action}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                    {trade.performance}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-crypto-muted">
                  <span>{trade.amount}</span>
                  <span>{trade.date} • {trade.sector}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Rules Summary */}
        <div className="p-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg border border-purple-500/20">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-crypto-text font-bold text-sm">Tech Focus</div>
              <div className="text-crypto-muted text-xs">75% concentration</div>
            </div>
            <div>
              <div className="text-crypto-text font-bold text-sm">$500K+ Only</div>
              <div className="text-crypto-muted text-xs">High conviction</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link href="/nancy-pelosi-strategy">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white group">
              <Building className="w-4 h-4 mr-2" />
              View Full Strategy
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Track Trades
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Disclosures
            </Button>
          </div>
        </div>

        {/* Research Insight */}
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-yellow-400 font-medium text-sm">Research Insight</div>
              <p className="text-crypto-muted text-xs mt-1">
                Congressional trades historically outperform market by 5.8% annually due to policy insights
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-xs">
              Trades disclosed 30-45 days after execution. Past performance doesn't guarantee future results.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}