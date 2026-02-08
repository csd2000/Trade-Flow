import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  BarChart3,
  ArrowRight,
  Zap,
  Activity
} from "lucide-react";

export function WarriorTradingQuickAction() {
  const todaysOpportunities = [
    {
      symbol: "AAPL",
      pattern: "Bull Flag",
      setup: "Breakout above $180",
      probability: "72%"
    },
    {
      symbol: "TSLA", 
      pattern: "VWAP Bounce",
      setup: "Support at $210",
      probability: "65%"
    },
    {
      symbol: "NVDA",
      pattern: "Opening Range",
      setup: "Volume breakout",
      probability: "58%"
    }
  ];

  const marketStatus = {
    isOpen: true,
    timeToOpen: "Market Open",
    topMover: "AAPL +4.2%",
    volumeLeader: "TSLA"
  };

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-crypto-text">Warrior Trading</CardTitle>
              <p className="text-crypto-muted text-sm">Day Trading Strategies</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-crypto-text text-sm font-medium">{marketStatus.timeToOpen}</span>
            </div>
            <p className="text-crypto-muted text-xs">Market Status</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Market Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-crypto-surface rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-crypto-muted text-xs">Top Mover</span>
            </div>
            <div className="text-crypto-text font-semibold">{marketStatus.topMover}</div>
          </div>
          <div className="p-3 bg-crypto-surface rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-crypto-muted text-xs">Volume Leader</span>
            </div>
            <div className="text-crypto-text font-semibold">{marketStatus.volumeLeader}</div>
          </div>
        </div>

        {/* Today's Setups */}
        <div>
          <h4 className="text-crypto-text font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Today's High-Probability Setups
          </h4>
          <div className="space-y-2">
            {todaysOpportunities.slice(0, 2).map((opportunity, index) => (
              <div key={index} className="p-3 bg-crypto-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-crypto-text font-semibold">${opportunity.symbol}</span>
                    <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30">
                      {opportunity.pattern}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                    {opportunity.probability} Success
                  </Badge>
                </div>
                <p className="text-crypto-muted text-sm">{opportunity.setup}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-3 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-lg border border-orange-500/20">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-crypto-text font-bold">68%</div>
              <div className="text-crypto-muted text-xs">Avg Success</div>
            </div>
            <div>
              <div className="text-crypto-text font-bold">2.4:1</div>
              <div className="text-crypto-muted text-xs">Risk/Reward</div>
            </div>
            <div>
              <div className="text-crypto-text font-bold">15m</div>
              <div className="text-crypto-muted text-xs">Avg Hold</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link href="/warrior-trading">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white group">
              <Target className="w-4 h-4 mr-2" />
              Open Warrior Trading
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              View Setups
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Scan Stocks
            </Button>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-yellow-400 font-medium text-sm">Trading Tip</div>
              <p className="text-crypto-muted text-xs mt-1">
                Focus on stocks with 3x+ volume and clear technical patterns for best results
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}