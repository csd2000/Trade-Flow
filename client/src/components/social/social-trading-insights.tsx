import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Copy,
  Star,
  Award,
  BarChart3,
  Target,
  Zap,
  Shield,
  DollarSign
} from "lucide-react";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: number;
  totalReturn: number;
  winRate: number;
  copiers: number;
  riskScore: number;
  strategies: string[];
  recentTrades: Trade[];
}

interface Trade {
  id: string;
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  profit: number;
  timestamp: Date;
}

interface MarketInsight {
  id: string;
  type: 'sentiment' | 'volume' | 'whale' | 'protocol';
  title: string;
  description: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  shares: number;
  likes: number;
}

const topTraders: Trader[] = [
  {
    id: '1',
    name: 'DeFiWhale92',
    avatar: '🐋',
    verified: true,
    followers: 12500,
    totalReturn: 347.6,
    winRate: 87,
    copiers: 1250,
    riskScore: 35,
    strategies: ['Yield Farming', 'Arbitrage', 'LP Tokens'],
    recentTrades: [
      { id: '1', asset: 'ETH', action: 'buy', amount: 15.5, price: 2850, profit: 2340, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: '2', asset: 'AAVE', action: 'sell', amount: 45, price: 89, profit: 567, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) }
    ]
  },
  {
    id: '2',
    name: 'YieldHunter',
    avatar: '🎯',
    verified: true,
    followers: 8900,
    totalReturn: 234.1,
    winRate: 79,
    copiers: 890,
    riskScore: 42,
    strategies: ['Stablecoin Farming', 'Cross-chain', 'Lending'],
    recentTrades: [
      { id: '3', asset: 'USDC', action: 'buy', amount: 50000, price: 1, profit: 1250, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) }
    ]
  },
  {
    id: '3',
    name: 'SmartYield',
    avatar: '🧠',
    verified: false,
    followers: 5600,
    totalReturn: 189.3,
    winRate: 75,
    copiers: 456,
    riskScore: 28,
    strategies: ['Conservative Yield', 'Blue Chip', 'DCA'],
    recentTrades: [
      { id: '4', asset: 'BTC', action: 'buy', amount: 0.5, price: 47200, profit: 890, timestamp: new Date(Date.now() - 30 * 60 * 1000) }
    ]
  }
];

const marketInsights: MarketInsight[] = [
  {
    id: '1',
    type: 'whale',
    title: 'Large ETH Movement Detected',
    description: '15,000 ETH moved from exchanges to DeFi protocols, suggesting institutional accumulation',
    impact: 'bullish',
    confidence: 85,
    shares: 234,
    likes: 567
  },
  {
    id: '2',
    type: 'protocol',
    title: 'Aave TVL Surge',
    description: 'Aave total value locked increased by 18% in 24h due to competitive yield rates',
    impact: 'bullish',
    confidence: 92,
    shares: 156,
    likes: 423
  },
  {
    id: '3',
    type: 'sentiment',
    title: 'Fear & Greed Shift',
    description: 'Market sentiment shifted from Fear (25) to Neutral (45) as DeFi yields stabilize',
    impact: 'neutral',
    confidence: 78,
    shares: 89,
    likes: 234
  }
];

export function SocialTradingInsights() {
  const [followedTraders, setFollowedTraders] = useState<string[]>(['1']);
  const [activeTab, setActiveTab] = useState('top-traders');

  const followTrader = (traderId: string) => {
    setFollowedTraders(prev => 
      prev.includes(traderId) 
        ? prev.filter(id => id !== traderId)
        : [...prev, traderId]
    );
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-crypto-tertiary';
    if (score <= 60) return 'text-crypto-quaternary';
    return 'text-red-400';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'text-crypto-tertiary';
      case 'bearish': return 'text-red-400';
      default: return 'text-crypto-muted';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'bullish': return TrendingUp;
      case 'bearish': return TrendingUp; // Could be TrendingDown if available
      default: return BarChart3;
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
          <Users className="w-6 h-6 text-crypto-primary" />
          Social Trading Insights
          <Badge className="badge-success">Community</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="top-traders">Top Traders</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="top-traders" className="space-y-4">
            {topTraders.map((trader) => (
              <div key={trader.id} className="p-4 bg-crypto-surface rounded-lg border border-crypto-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-crypto-card rounded-full flex items-center justify-center text-2xl">
                      {trader.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-crypto-text">{trader.name}</h4>
                        {trader.verified && (
                          <Badge className="badge-primary text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-crypto-muted text-sm">
                        {trader.followers.toLocaleString()} followers • {trader.copiers} copiers
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => followTrader(trader.id)}
                    className={followedTraders.includes(trader.id) ? "btn-secondary" : "btn-primary"}
                  >
                    {followedTraders.includes(trader.id) ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-crypto-card rounded-lg">
                    <div className="text-lg font-bold text-crypto-tertiary">+{trader.totalReturn}%</div>
                    <div className="text-crypto-muted text-xs">Total Return</div>
                  </div>
                  <div className="text-center p-3 bg-crypto-card rounded-lg">
                    <div className="text-lg font-bold text-crypto-primary">{trader.winRate}%</div>
                    <div className="text-crypto-muted text-xs">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-crypto-card rounded-lg">
                    <div className={`text-lg font-bold ${getRiskColor(trader.riskScore)}`}>{trader.riskScore}</div>
                    <div className="text-crypto-muted text-xs">Risk Score</div>
                  </div>
                  <div className="text-center p-3 bg-crypto-card rounded-lg">
                    <div className="text-lg font-bold text-crypto-quaternary">{trader.strategies.length}</div>
                    <div className="text-crypto-muted text-xs">Strategies</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-crypto-text text-sm">Recent Strategies</h5>
                  <div className="flex flex-wrap gap-2">
                    {trader.strategies.map((strategy, index) => (
                      <Badge key={index} className="badge-secondary text-xs">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>

                {trader.recentTrades.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="font-semibold text-crypto-text text-sm">Recent Trades</h5>
                    {trader.recentTrades.slice(0, 2).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-2 bg-crypto-card rounded">
                        <div className="flex items-center space-x-2">
                          <Badge className={trade.action === 'buy' ? 'badge-success' : 'badge-warning'}>
                            {trade.action.toUpperCase()}
                          </Badge>
                          <span className="text-crypto-text text-sm">{trade.asset}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-crypto-tertiary text-sm font-semibold">
                            +${trade.profit}
                          </div>
                          <div className="text-crypto-muted text-xs">
                            {Math.round((Date.now() - trade.timestamp.getTime()) / (60 * 60 * 1000))}h ago
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {marketInsights.map((insight) => {
              const ImpactIcon = getImpactIcon(insight.impact);
              return (
                <div key={insight.id} className="p-4 bg-crypto-surface rounded-lg border border-crypto-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-crypto-primary/15 rounded-lg">
                        <ImpactIcon className={`w-4 h-4 ${getImpactColor(insight.impact)}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-crypto-text mb-1">{insight.title}</h4>
                        <p className="text-crypto-muted text-sm mb-3">{insight.description}</p>
                        
                        <div className="flex items-center space-x-4">
                          <Badge className={`${getImpactColor(insight.impact)} bg-crypto-card border border-current`}>
                            {insight.impact}
                          </Badge>
                          <span className="text-crypto-muted text-xs">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-crypto-muted text-sm">
                      <span>{insight.likes} likes</span>
                      <span>{insight.shares} shares</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="text-crypto-muted hover:text-crypto-text">
                        <Star className="w-3 h-3 mr-1" />
                        Like
                      </Button>
                      <Button size="sm" variant="ghost" className="text-crypto-muted hover:text-crypto-text">
                        <Copy className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {followedTraders.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-crypto-muted mx-auto mb-3" />
                <p className="text-crypto-muted">You're not following any traders yet</p>
                <p className="text-crypto-muted text-sm">Start following top performers to see their strategies</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topTraders
                  .filter(trader => followedTraders.includes(trader.id))
                  .map((trader) => (
                    <div key={trader.id} className="p-4 bg-crypto-surface rounded-lg border border-crypto-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-crypto-card rounded-full flex items-center justify-center text-lg">
                            {trader.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-crypto-text">{trader.name}</h4>
                            <div className="text-crypto-muted text-sm">
                              +{trader.totalReturn}% • {trader.winRate}% win rate
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="btn-primary">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Trade
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => followTrader(trader.id)}
                            className="btn-secondary"
                          >
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}