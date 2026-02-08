import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign,
  BarChart3,
  Eye,
  AlertTriangle,
  CheckCircle,
  Play,
  ArrowRight,
  Search,
  Filter,
  Volume2,
  Activity,
  Zap
} from "lucide-react";

interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  successRate: number;
  avgReturn: string;
  timeframe: string;
  criteria: string[];
  steps: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  exampleStocks: string[];
}

export default function WarriorTradingStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("strategies");

  const strategies: TradingStrategy[] = [
    {
      id: "momentum-breakout",
      name: "Momentum Breakout Trading",
      description: "Trade stocks breaking out of key resistance levels with strong volume",
      difficulty: "Intermediate",
      successRate: 68,
      avgReturn: "2-5%",
      timeframe: "15-30 minutes",
      riskLevel: "Medium",
      criteria: [
        "Stock gapping up 2-10% pre-market",
        "Volume 3x higher than average",
        "Clear resistance level to break",
        "Market cap $300M - $10B",
        "Price above $5"
      ],
      steps: [
        "Scan for stocks gapping up 2-10% with high volume",
        "Identify key resistance levels from previous trading sessions",
        "Wait for breakout above resistance with volume confirmation",
        "Enter position on first 5-minute candle close above resistance",
        "Set stop loss below breakout level",
        "Take profits at 2:1 or 3:1 risk/reward ratio"
      ],
      exampleStocks: ["AAPL", "TSLA", "NVDA", "AMD", "MSFT"]
    },
    {
      id: "flag-pattern",
      name: "Bull Flag Pattern",
      description: "Trade continuation patterns after strong momentum moves",
      difficulty: "Beginner",
      successRate: 72,
      avgReturn: "1-3%",
      timeframe: "10-20 minutes",
      riskLevel: "Low",
      criteria: [
        "Strong upward move (pole) of 3%+",
        "Consolidation phase (flag) lasting 5-15 minutes",
        "Volume decreasing during consolidation",
        "Clear support level forming",
        "RSI cooling off from overbought"
      ],
      steps: [
        "Identify stocks with strong morning momentum",
        "Wait for consolidation after initial move",
        "Draw support and resistance lines during flag formation",
        "Enter on breakout above flag resistance",
        "Set stop loss below flag support",
        "Target measured move equal to pole height"
      ],
      exampleStocks: ["AMZN", "GOOGL", "META", "NFLX", "CRM"]
    },
    {
      id: "vwap-bounce",
      name: "VWAP Bounce Strategy",
      description: "Trade reversals at the Volume Weighted Average Price",
      difficulty: "Intermediate",
      successRate: 65,
      avgReturn: "1-4%",
      timeframe: "5-15 minutes",
      riskLevel: "Medium",
      criteria: [
        "Stock trending above VWAP",
        "Price pulls back to VWAP level",
        "Volume spike on VWAP test",
        "Bullish reversal candle pattern",
        "Strong sector or market conditions"
      ],
      steps: [
        "Find stocks in strong uptrend above VWAP",
        "Wait for pullback to VWAP level",
        "Look for volume increase and reversal signals",
        "Enter on bounce confirmation above VWAP",
        "Set stop loss below VWAP",
        "Target previous highs or key resistance"
      ],
      exampleStocks: ["SHOP", "ROKU", "SQ", "PYPL", "SNAP"]
    },
    {
      id: "opening-range-breakout",
      name: "Opening Range Breakout (ORB)",
      description: "Trade breakouts from the first 15-30 minutes of trading",
      difficulty: "Advanced",
      successRate: 58,
      avgReturn: "3-8%",
      timeframe: "30-60 minutes",
      riskLevel: "High",
      criteria: [
        "High relative volume in first 30 minutes",
        "Clear opening range established",
        "News catalyst or earnings reaction",
        "Market trending in same direction",
        "Tight opening range (1-3%)"
      ],
      steps: [
        "Identify opening range high and low (first 15-30 min)",
        "Wait for volume to decrease during range formation",
        "Prepare for breakout in either direction",
        "Enter on first 5-minute close outside range",
        "Set stop loss on opposite side of range",
        "Target 2-3x the opening range height"
      ],
      exampleStocks: ["GME", "AMC", "PLTR", "LCID", "RIVN"]
    }
  ];

  const scanningCriteria = [
    {
      category: "Gap Scanners",
      filters: [
        "Gap up 2-15%",
        "Volume > 500K shares",
        "Price > $1",
        "Market cap > $100M"
      ]
    },
    {
      category: "Volume Leaders",
      filters: [
        "Volume > 3x average",
        "Price change > 5%",
        "Relative volume > 2.0",
        "Float < 50M shares"
      ]
    },
    {
      category: "Technical Patterns",
      filters: [
        "Breaking key resistance",
        "Bull flag formation",
        "VWAP reclaim",
        "52-week high break"
      ]
    }
  ];

  const riskManagement = [
    {
      rule: "Position Size",
      description: "Never risk more than 1-2% of account per trade",
      icon: <DollarSign className="w-5 h-5 text-green-400" />
    },
    {
      rule: "Stop Loss",
      description: "Always set stop loss before entering position",
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />
    },
    {
      rule: "Risk/Reward",
      description: "Target minimum 2:1 risk to reward ratio",
      icon: <Target className="w-5 h-5 text-blue-400" />
    },
    {
      rule: "Daily Loss Limit",
      description: "Stop trading after 3 consecutive losses",
      icon: <Activity className="w-5 h-5 text-purple-400" />
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Intermediate':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Advanced':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-300 bg-gray-500/10';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'High':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-300 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-crypto-text mb-2">
            Warrior Trading Strategies
          </h1>
          <p className="text-crypto-muted">
            Professional day trading strategies for finding and trading profitable stock setups
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="strategies" className="py-2 text-sm">
              Strategies
            </TabsTrigger>
            <TabsTrigger value="scanning" className="py-2 text-sm">
              Stock Scanning
            </TabsTrigger>
            <TabsTrigger value="risk" className="py-2 text-sm">
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="tools" className="py-2 text-sm">
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-6">
            {selectedStrategy ? (
              // Strategy Detail View
              <div className="space-y-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedStrategy(null)}
                  className="mb-4"
                >
                  ← Back to Strategies
                </Button>
                
                {(() => {
                  const strategy = strategies.find(s => s.id === selectedStrategy);
                  if (!strategy) return null;
                  
                  return (
                    <div className="space-y-6">
                      {/* Strategy Header */}
                      <Card className="bg-gradient-to-r from-crypto-primary/10 to-crypto-secondary/10 border-crypto-primary/20">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-2xl text-crypto-text">{strategy.name}</CardTitle>
                              <p className="text-crypto-muted mt-2">{strategy.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-crypto-primary">{strategy.successRate}%</div>
                              <div className="text-sm text-crypto-muted">Success Rate</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4">
                            <Badge variant="outline" className={getDifficultyColor(strategy.difficulty)}>
                              {strategy.difficulty}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor(strategy.riskLevel)}>
                              {strategy.riskLevel} Risk
                            </Badge>
                            <Badge variant="outline" className="text-crypto-primary">
                              {strategy.avgReturn} Return
                            </Badge>
                            <Badge variant="outline" className="text-crypto-accent">
                              {strategy.timeframe}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Strategy Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Entry Criteria */}
                        <Card className="bg-crypto-surface border-crypto-border">
                          <CardHeader>
                            <CardTitle className="text-crypto-text flex items-center gap-2">
                              <Search className="w-5 h-5 text-crypto-primary" />
                              Entry Criteria
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {strategy.criteria.map((criterion, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-crypto-text text-sm">{criterion}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Trading Steps */}
                        <Card className="bg-crypto-surface border-crypto-border">
                          <CardHeader>
                            <CardTitle className="text-crypto-text flex items-center gap-2">
                              <Play className="w-5 h-5 text-crypto-accent" />
                              Execution Steps
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {strategy.steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-crypto-primary rounded-full flex items-center justify-center text-gray-900 text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </div>
                                <span className="text-crypto-text text-sm">{step}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Example Stocks */}
                      <Card className="bg-crypto-surface border-crypto-border">
                        <CardHeader>
                          <CardTitle className="text-crypto-text flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-crypto-tertiary" />
                            Example Stocks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {strategy.exampleStocks.map((stock, index) => (
                              <Badge key={index} variant="secondary" className="text-sm">
                                ${stock}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-crypto-muted text-sm mt-3">
                            These are examples of stocks that commonly fit this strategy's criteria
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </div>
            ) : (
              // Strategy Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strategies.map((strategy) => (
                  <Card key={strategy.id} className="bg-crypto-surface border-crypto-border hover:border-crypto-primary/30 transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-crypto-text mb-2">{strategy.name}</CardTitle>
                          <p className="text-crypto-muted text-sm">{strategy.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-crypto-primary">{strategy.successRate}%</div>
                          <div className="text-xs text-crypto-muted">Success</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(strategy.difficulty)}>
                          {strategy.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(strategy.riskLevel)}>
                          {strategy.riskLevel} Risk
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-crypto-card rounded">
                          <div className="text-crypto-text font-semibold">{strategy.avgReturn}</div>
                          <div className="text-crypto-muted text-xs">Avg Return</div>
                        </div>
                        <div className="p-2 bg-crypto-card rounded">
                          <div className="text-crypto-text font-semibold">{strategy.timeframe}</div>
                          <div className="text-crypto-muted text-xs">Timeframe</div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedStrategy(strategy.id)}
                        className="w-full bg-crypto-primary hover:bg-crypto-primary/90"
                      >
                        View Strategy
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scanning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scanningCriteria.map((category, index) => (
                <Card key={index} className="bg-crypto-surface border-crypto-border">
                  <CardHeader>
                    <CardTitle className="text-crypto-text flex items-center gap-2">
                      <Filter className="w-5 h-5 text-crypto-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.filters.map((filter, filterIndex) => (
                      <div key={filterIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-crypto-primary flex-shrink-0" />
                        <span className="text-crypto-text text-sm">{filter}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-crypto-text">Daily Scanning Routine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-crypto-text">Pre-Market (8:00-9:30 AM)</h4>
                    <ul className="text-crypto-muted text-sm space-y-1">
                      <li>• Scan for gap up/down stocks</li>
                      <li>• Check earnings announcements</li>
                      <li>• Review overnight news</li>
                      <li>• Identify key levels</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-crypto-text">Market Open (9:30-10:30 AM)</h4>
                    <ul className="text-crypto-muted text-sm space-y-1">
                      <li>• Monitor volume leaders</li>
                      <li>• Watch for breakout setups</li>
                      <li>• Track VWAP bounces</li>
                      <li>• Execute planned trades</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskManagement.map((rule, index) => (
                <Card key={index} className="bg-crypto-surface border-crypto-border">
                  <CardHeader>
                    <CardTitle className="text-crypto-text flex items-center gap-2">
                      {rule.icon}
                      {rule.rule}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-crypto-muted">{rule.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-crypto-text flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Risk Management Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-crypto-text">Position Sizing</h4>
                    <ul className="text-crypto-muted text-sm space-y-1">
                      <li>• Account size: $25,000 → Max risk: $250-500 per trade</li>
                      <li>• Account size: $50,000 → Max risk: $500-1,000 per trade</li>
                      <li>• Never risk more than 2% on a single trade</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-crypto-text">Daily Limits</h4>
                    <ul className="text-crypto-muted text-sm space-y-1">
                      <li>• Maximum 5 trades per day</li>
                      <li>• Stop after 3 consecutive losses</li>
                      <li>• Take a break after 6% daily loss</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-crypto-surface border-crypto-border">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-crypto-primary" />
                    Trading Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-crypto-muted text-sm mb-3">
                    Use professional trading platforms with Level 2 data and hotkeys
                  </p>
                  <Button className="w-full bg-crypto-primary hover:bg-crypto-primary/90">
                    View Platforms
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-crypto-surface border-crypto-border">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <Search className="w-5 h-5 text-crypto-accent" />
                    Stock Scanners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-crypto-muted text-sm mb-3">
                    Real-time scanning tools for finding trading opportunities
                  </p>
                  <Button className="w-full bg-crypto-accent hover:bg-crypto-accent/90">
                    Setup Scanners
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-crypto-surface border-crypto-border">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-crypto-tertiary" />
                    Chat Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-crypto-muted text-sm mb-3">
                    Join trading communities for real-time alerts and education
                  </p>
                  <Button className="w-full bg-crypto-tertiary hover:bg-crypto-tertiary/90">
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}