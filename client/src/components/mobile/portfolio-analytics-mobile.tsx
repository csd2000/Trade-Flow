import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Shield, 
  AlertTriangle,
  BarChart3,
  Zap,
  Activity,
  RefreshCw
} from "lucide-react";

interface PortfolioMetrics {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  monthlyChange: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  riskScore: number;
}

export function PortfolioAnalyticsMobile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Mock portfolio data
  const metrics: PortfolioMetrics = {
    totalValue: 45672.84,
    dailyChange: 1234.56,
    dailyChangePercent: 2.78,
    weeklyChange: 5432.10,
    monthlyChange: 8765.43,
    sharpeRatio: 1.84,
    volatility: 24.6,
    maxDrawdown: -8.2,
    riskScore: 6.5
  };

  const positions = [
    {
      protocol: "Aave",
      token: "USDC",
      amount: 12500,
      apy: 4.25,
      earned: 156.78,
      risk: "Low"
    },
    {
      protocol: "Curve",
      token: "USDT-USDC",
      amount: 8900,
      apy: 6.75,
      earned: 234.51,
      risk: "Low"
    },
    {
      protocol: "Yearn",
      token: "WETH",
      amount: 15600,
      apy: 12.45,
      earned: 567.89,
      risk: "Medium"
    },
    {
      protocol: "GMX",
      token: "GLP",
      amount: 8672,
      apy: 22.4,
      earned: 432.10,
      risk: "High"
    }
  ];

  const performanceData = [
    { period: "Today", value: 2.78, trend: "up" },
    { period: "7 Days", value: 12.45, trend: "up" },
    { period: "30 Days", value: 18.67, trend: "up" },
    { period: "90 Days", value: 24.32, trend: "up" }
  ];

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "text-green-400 bg-green-500/10",
      Medium: "text-yellow-400 bg-yellow-500/10",
      High: "text-red-400 bg-red-500/10"
    };
    return colors[risk as keyof typeof colors] || "text-gray-400 bg-gray-500/10";
  };

  const getRiskScore = (score: number) => {
    if (score <= 3) return { label: "Conservative", color: "text-green-400" };
    if (score <= 7) return { label: "Moderate", color: "text-yellow-400" };
    return { label: "Aggressive", color: "text-red-400" };
  };

  return (
    <div className="space-y-4">
      {/* Portfolio Value Card */}
      <Card className="bg-gradient-to-br from-crypto-primary/10 to-crypto-secondary/10 border-crypto-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-crypto-text">Portfolio Value</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-crypto-text">
              ${metrics.totalValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {metrics.dailyChangePercent >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`font-semibold ${
                metrics.dailyChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${Math.abs(metrics.dailyChange).toLocaleString()} ({Math.abs(metrics.dailyChangePercent)}%)
              </span>
              <span className="text-crypto-muted text-sm">today</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-crypto-surface rounded-lg">
              <div className="text-crypto-muted text-xs">7-Day Return</div>
              <div className="text-crypto-text font-semibold">
                +${metrics.weeklyChange.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-crypto-surface rounded-lg">
              <div className="text-crypto-muted text-xs">30-Day Return</div>
              <div className="text-crypto-text font-semibold">
                +${metrics.monthlyChange.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs px-2 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="positions" className="text-xs px-2 py-2">
            Positions
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-xs px-2 py-2">
            Risk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Performance Chart */}
          <Card className="bg-crypto-surface border-crypto-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-crypto-text text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-crypto-primary" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {performanceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-crypto-card rounded-lg">
                  <span className="text-crypto-muted text-sm">{item.period}</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">+{item.value}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Metrics */}
          <Card className="bg-crypto-surface border-crypto-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-crypto-text text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-crypto-accent" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-crypto-card rounded-lg text-center">
                  <div className="text-crypto-muted text-xs mb-1">Sharpe Ratio</div>
                  <div className="text-crypto-text font-bold text-lg">{metrics.sharpeRatio}</div>
                </div>
                <div className="p-3 bg-crypto-card rounded-lg text-center">
                  <div className="text-crypto-muted text-xs mb-1">Volatility</div>
                  <div className="text-crypto-text font-bold text-lg">{metrics.volatility}%</div>
                </div>
              </div>
              <div className="p-3 bg-crypto-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-crypto-muted text-sm">Max Drawdown</span>
                  <span className="text-red-400 font-semibold">{metrics.maxDrawdown}%</span>
                </div>
                <Progress value={Math.abs(metrics.maxDrawdown) * 5} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-3 mt-4">
          {positions.map((position, index) => (
            <Card key={index} className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-crypto-text">{position.protocol}</div>
                    <div className="text-crypto-muted text-sm">{position.token}</div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getRiskColor(position.risk)}`}>
                    {position.risk}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-crypto-muted text-xs">Value</div>
                    <div className="text-crypto-text font-semibold">
                      ${position.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-crypto-muted text-xs">APY</div>
                    <div className="text-crypto-primary font-semibold">{position.apy}%</div>
                  </div>
                  <div>
                    <div className="text-crypto-muted text-xs">Earned</div>
                    <div className="text-green-400 font-semibold">
                      +${position.earned}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="risk" className="space-y-4 mt-4">
          {/* Overall Risk Score */}
          <Card className="bg-crypto-surface border-crypto-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-crypto-text text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-crypto-tertiary" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-crypto-text mb-2">
                  {metrics.riskScore}/10
                </div>
                <Badge variant="outline" className={`text-sm ${getRiskScore(metrics.riskScore).color}`}>
                  {getRiskScore(metrics.riskScore).label}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-crypto-muted text-sm">Portfolio Risk</span>
                    <span className="text-crypto-text">{metrics.riskScore}/10</span>
                  </div>
                  <Progress value={metrics.riskScore * 10} className="h-2" />
                </div>
              </div>

              {/* Risk Breakdown */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-crypto-card rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-crypto-muted text-sm">Low Risk</span>
                  </div>
                  <span className="text-crypto-text font-semibold">65%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-crypto-card rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-crypto-muted text-sm">Medium Risk</span>
                  </div>
                  <span className="text-crypto-text font-semibold">25%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-crypto-card rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-crypto-muted text-sm">High Risk</span>
                  </div>
                  <span className="text-crypto-text font-semibold">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}