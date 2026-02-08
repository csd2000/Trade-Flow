import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Shield, 
  DollarSign, 
  Activity,
  Settings,
  Play,
  Pause,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Zap,
  Timer,
  PieChart,
  Smartphone,
  Globe
} from "lucide-react";

export default function RobinHoodTrading() {
  const [activeSystem, setActiveSystem] = useState("robinhood_4pm");
  
  const tradingSystems = [
    {
      id: "robinhood_4pm",
      name: "4PM Market Close System",
      description: "Automated trading execution at 4:00 PM market close",
      type: "Time-Based Strategy",
      status: "Active",
      dailyReturn: "+2.4%",
      weeklyReturn: "+12.8%",
      monthlyReturn: "+34.2%",
      winRate: "78%",
      totalTrades: 156,
      icon: Clock,
      color: "var(--crypto-primary)"
    },
    {
      id: "lance_system",
      name: "Advanced Momentum System",
      description: "Advanced momentum and trend-following strategy",
      type: "Technical Analysis",
      status: "Active", 
      dailyReturn: "+1.8%",
      weeklyReturn: "+9.6%",
      monthlyReturn: "+28.7%",
      winRate: "82%",
      totalTrades: 134,
      icon: Target,
      color: "var(--crypto-secondary)"
    },
    {
      id: "hybrid_system",
      name: "Hybrid DeFi System",
      description: "Combined 4PM + Momentum strategy for DeFi protocols",
      type: "Multi-Strategy",
      status: "Active",
      dailyReturn: "+3.1%",
      weeklyReturn: "+15.2%",
      monthlyReturn: "+42.5%",
      winRate: "85%",
      totalTrades: 189,
      icon: Zap,
      color: "var(--crypto-tertiary)"
    }
  ];

  const currentSignals = [
    {
      symbol: "BTC",
      action: "BUY",
      confidence: 92,
      targetPrice: 48500,
      currentPrice: 47200,
      reasoning: "4PM momentum breakout + Advanced momentum confirmation",
      protocol: "Uniswap",
      executionTime: "16:00 UTC"
    },
    {
      symbol: "ETH",
      action: "HOLD",
      confidence: 75,
      targetPrice: 2950,
      currentPrice: 2850,
      reasoning: "Consolidation phase, waiting for 4PM signal",
      protocol: "Aave",
      executionTime: "16:00 UTC"
    },
    {
      symbol: "AVAX",
      action: "SELL",
      confidence: 88,
      targetPrice: 35.2,
      currentPrice: 37.8,
      reasoning: "Advanced momentum system profit-taking signal",
      protocol: "Trader Joe",
      executionTime: "16:00 UTC"
    }
  ];

  const activePositions = [
    {
      symbol: "SOL",
      side: "LONG",
      entryPrice: 163.40,
      currentPrice: 178.20,
      quantity: 15.5,
      unrealizedPnL: "+$229.40",
      pnlPercentage: "+9.0%",
      protocol: "Raydium",
      openedAt: "15:58 UTC"
    },
    {
      symbol: "MATIC",
      side: "LONG",
      entryPrice: 0.95,
      currentPrice: 1.02,
      quantity: 2850,
      unrealizedPnL: "+$199.50",
      pnlPercentage: "+7.4%",
      protocol: "QuickSwap",
      openedAt: "16:02 UTC"
    }
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'badge-success';
      case 'SELL': return 'badge-error';
      case 'HOLD': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-crypto-tertiary';
      case 'Paused': return 'text-crypto-warning';
      case 'Stopped': return 'text-crypto-error';
      default: return 'text-crypto-muted';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-crypto-text mb-4">
          Robin Hood 4PM Trading System
        </h1>
        <p className="text-crypto-muted text-lg max-w-2xl mx-auto">
          Automated DeFi trading using Robin Hood methodology with 4:00 PM execution and Lance momentum system
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tradingSystems.map((system) => {
          const Icon = system.icon;
          const isActive = system.id === activeSystem;
          
          return (
            <Card 
              key={system.id}
              className={`crypto-card hover-lift cursor-pointer transition-all duration-300 ${
                isActive ? 'border-crypto-primary bg-crypto-primary bg-opacity-5' : ''
              }`}
              onClick={() => setActiveSystem(system.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div 
                    className="p-3 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: system.color + '20' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: system.color }} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(system.status)} animate-pulse`}></div>
                    <span className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                      {system.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg font-bold text-crypto-text">
                    {system.name}
                  </CardTitle>
                  <p className="text-crypto-muted text-sm mt-1">
                    {system.description}
                  </p>
                  <Badge className="mt-2 badge-secondary">
                    {system.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-crypto-muted text-xs">Daily Return</div>
                      <div className="text-crypto-tertiary font-bold">{system.dailyReturn}</div>
                    </div>
                    <div>
                      <div className="text-crypto-muted text-xs">Win Rate</div>
                      <div className="text-crypto-primary font-bold">{system.winRate}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-crypto-muted text-xs">Monthly Return</div>
                      <div className="text-crypto-quaternary font-bold">{system.monthlyReturn}</div>
                    </div>
                    <div>
                      <div className="text-crypto-muted text-xs">Total Trades</div>
                      <div className="text-crypto-text font-bold">{system.totalTrades}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 4PM Countdown Timer */}
      <Card className="crypto-card-premium text-center">
        <CardContent className="py-8">
          <div className="flex items-center justify-center mb-4">
            <Timer className="w-8 h-8 text-crypto-primary mr-3" />
            <h2 className="text-2xl font-bold text-crypto-text">Next Execution</h2>
          </div>
          <div className="text-5xl font-black text-gradient mb-2">
            16:00 UTC
          </div>
          <div className="text-crypto-muted mb-6">
            All systems execute trades at market close
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button className="btn-primary">
              <Play className="w-4 h-4 mr-2" />
              Start All Systems
            </Button>
            <Button className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trading Signals */}
      <Card className="crypto-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
                <div className="p-2 bg-crypto-primary rounded-xl bg-opacity-15">
                  <Activity className="w-5 h-5 text-crypto-primary" />
                </div>
                Live Trading Signals
              </CardTitle>
              <p className="text-crypto-muted mt-1">
                Real-time signals from Robin Hood 4PM and Lance systems
              </p>
            </div>
            <Badge className="badge-primary animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentSignals.map((signal, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-crypto-surface border border-crypto-border hover:border-crypto-primary transition-all duration-300 hover:bg-crypto-card group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-crypto-card rounded-2xl flex items-center justify-center font-bold text-crypto-text">
                    {signal.symbol}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getActionColor(signal.action)}>
                        {signal.action}
                      </Badge>
                      <span className="text-crypto-muted text-sm">
                        {signal.confidence}% confidence
                      </span>
                    </div>
                    <div className="text-crypto-muted text-sm mt-1">
                      {signal.protocol} • {signal.executionTime}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-crypto-text font-semibold">
                    ${signal.currentPrice.toLocaleString()}
                  </div>
                  <div className="text-crypto-muted text-sm">
                    Target: ${signal.targetPrice.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="text-crypto-muted text-sm">
                <strong>Reasoning:</strong> {signal.reasoning}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
            <div className="p-2 bg-crypto-tertiary rounded-xl bg-opacity-15">
              <PieChart className="w-5 h-5 text-crypto-tertiary" />
            </div>
            Active Positions
          </CardTitle>
          <p className="text-crypto-muted mt-1">
            Current open positions managed by the trading systems
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activePositions.map((position, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-crypto-surface border border-crypto-border hover:border-crypto-tertiary transition-all duration-300 hover:bg-crypto-card group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-crypto-card rounded-2xl flex items-center justify-center font-bold text-crypto-text">
                    {position.symbol}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="badge-success">
                        {position.side}
                      </Badge>
                      <span className="text-crypto-muted text-sm">
                        {position.quantity} tokens
                      </span>
                    </div>
                    <div className="text-crypto-muted text-sm">
                      Entry: ${position.entryPrice} • {position.protocol} • {position.openedAt}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-crypto-text font-semibold">
                    ${position.currentPrice}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-crypto-tertiary font-bold">
                      {position.unrealizedPnL}
                    </span>
                    <span className="text-crypto-tertiary text-sm">
                      ({position.pnlPercentage})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-crypto-text flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-crypto-primary" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-crypto-muted">Total Return</span>
                <span className="text-crypto-primary font-bold">+147.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crypto-muted">Max Drawdown</span>
                <span className="text-crypto-error font-bold">-3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crypto-muted">Sharpe Ratio</span>
                <span className="text-crypto-tertiary font-bold">2.84</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crypto-muted">Best Trade</span>
                <span className="text-crypto-quaternary font-bold">+$2,847</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-crypto-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-crypto-secondary" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-crypto-muted">Position Size Limit</span>
                <span className="text-crypto-text font-bold">5% per trade</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crypto-muted">Stop Loss</span>
                <span className="text-crypto-error font-bold">-2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crypto-muted">Take Profit</span>
                <span className="text-crypto-tertiary font-bold">+8.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crypto-muted">Risk Level</span>
                <span className="text-crypto-quaternary font-bold">Moderate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-crypto-text flex items-center gap-2">
              <Globe className="w-5 h-5 text-crypto-tertiary" />
              DeFi Protocols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-crypto-muted">Uniswap V3</span>
                <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crypto-muted">Aave V3</span>
                <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crypto-muted">Compound</span>
                <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crypto-muted">Trader Joe</span>
                <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}