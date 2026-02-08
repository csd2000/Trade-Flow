import { Header } from "@/components/layout/header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { AdvancedPortfolioAnalytics } from "@/components/portfolio/advanced-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, MoreVertical, PieChart, BarChart3, Target, Shield, Zap, DollarSign } from "lucide-react";
import { mockActiveStrategies, mockPortfolioData } from "@/lib/mock-data";

export default function PortfolioTracker() {
  const calculateTotalValue = () => {
    return mockActiveStrategies.reduce((total, strategy) => {
      return total + parseFloat(strategy.amount.replace(/[$,]/g, ''));
    }, 0);
  };

  const calculateDailyEarnings = () => {
    return mockActiveStrategies.reduce((total, strategy) => {
      return total + parseFloat(strategy.dailyEarnings.replace(/[$,]/g, ''));
    }, 0);
  };

  const calculateMonthlyProjection = () => {
    return calculateDailyEarnings() * 30;
  };

  const calculateAverageAPR = () => {
    const totalWeight = mockActiveStrategies.reduce((sum, strategy) => 
      sum + parseFloat(strategy.amount.replace(/[$,]/g, '')), 0);
    
    const weightedAPR = mockActiveStrategies.reduce((sum, strategy) => {
      const amount = parseFloat(strategy.amount.replace(/[$,]/g, ''));
      const apr = parseFloat(strategy.apr.replace('%', ''));
      return sum + (amount * apr);
    }, 0);
    
    return totalWeight > 0 ? (weightedAPR / totalWeight).toFixed(1) : '0';
  };

  const getRiskDistribution = () => {
    const total = mockActiveStrategies.length;
    const riskCount = mockActiveStrategies.reduce((acc, strategy) => {
      acc[strategy.riskLevel] = (acc[strategy.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(riskCount).map(([risk, count]) => ({
      risk,
      percentage: ((count / total) * 100).toFixed(0)
    }));
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-400 border-green-500/20",
      Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      High: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500/10 text-gray-300";
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      pink: "bg-pink-500",
      green: "bg-green-500"
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div>
      <Header
        title="Portfolio Tracker"
        subtitle="Monitor your DeFi investments and performance"
      />

      <div className="p-6 space-y-6">
        {/* Enhanced Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-crypto-surface border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${calculateTotalValue().toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-crypto-green/10 rounded-lg flex items-center justify-center">
                <PieChart className="text-crypto-green h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+2.47% (24h)</span>
            </div>
          </Card>

          <Card className="bg-crypto-surface border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Daily Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${calculateDailyEarnings().toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Zap className="text-blue-400 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+8.4% income change</span>
            </div>
          </Card>

          <Card className="bg-crypto-surface border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Avg APR</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {calculateAverageAPR()}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Target className="text-purple-400 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-gray-300 text-sm">Weighted average</span>
            </div>
          </Card>

          <Card className="bg-crypto-surface border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Monthly Projection</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${calculateMonthlyProjection().toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-orange-400 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-gray-300 text-sm">Based on current rate</span>
            </div>
          </Card>
        </div>

        {/* Risk Analysis */}
        <Card className="bg-crypto-surface border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Risk Distribution & Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getRiskDistribution().map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                  item.risk === 'Low' ? 'bg-green-500/10' :
                  item.risk === 'Medium' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                }`}>
                  <span className={`text-2xl font-bold ${
                    item.risk === 'Low' ? 'text-green-400' :
                    item.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {item.percentage}%
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{item.risk} Risk</p>
                <p className="text-gray-300 text-sm">of total strategies</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-crypto-green/10 border border-crypto-green/20 rounded-lg">
            <p className="text-crypto-green text-sm">
              <strong>Portfolio Health:</strong> Your risk distribution shows a balanced approach with {
                getRiskDistribution().find(r => r.risk === 'Low')?.percentage || '0'
              }% in low-risk protocols. Consider diversifying across more protocols for better risk management.
            </p>
          </div>
        </Card>

        {/* Detailed Portfolio View */}
        <Card className="bg-crypto-surface border-gray-700">
          <Tabs defaultValue="strategies" className="w-full">
            <div className="border-b border-gray-700 px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="strategies" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                  Active Strategies
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                  Transaction History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="strategies" className="p-6 space-y-4">
              {mockActiveStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-gray-800/50 border border-gray-600 rounded-lg p-6 hover:border-crypto-green/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${getIconColor(strategy.color)} rounded-lg flex items-center justify-center`}>
                        <span className="text-gray-900 font-bold">
                          {strategy.protocol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                        <p className="text-sm text-gray-300">{strategy.protocol} • {strategy.chain}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRiskColor(strategy.riskLevel)}>
                        {strategy.riskLevel} Risk
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-900">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-300 text-sm">Invested Amount</p>
                      <p className="text-gray-900 font-semibold">{strategy.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Current APR</p>
                      <p className="text-green-400 font-semibold">+{strategy.apr}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Daily Earnings</p>
                      <p className="text-green-400 font-semibold">+{strategy.dailyEarnings}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">30d Earnings</p>
                      <p className="text-green-400 font-semibold">+{strategy.monthlyEarnings}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-600">
                      Adjust
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-600">
                      Exit
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="performance" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-600 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Portfolio Allocation</h4>
                  <div className="space-y-3">
                    {mockActiveStrategies.map((strategy, index) => {
                      const percentage = ((parseFloat(strategy.amount.replace(/[$,]/g, '')) / calculateTotalValue()) * 100).toFixed(1);
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 ${getIconColor(strategy.color)} rounded-full`}></div>
                            <span className="text-gray-600 text-sm">{strategy.name}</span>
                          </div>
                          <span className="text-gray-900 font-medium">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Risk Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Low Risk</span>
                      <span className="text-green-400 font-medium">67%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Medium Risk</span>
                      <span className="text-yellow-400 font-medium">0%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">High Risk</span>
                      <span className="text-red-400 font-medium">33%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Strategy Deposit</p>
                      <p className="text-sm text-gray-300">Dec 10, 2024 • Curve stETH/ETH LP</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">$42,150.00</p>
                      <p className="text-sm text-green-400">Success</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Strategy Deposit</p>
                      <p className="text-sm text-gray-300">Dec 8, 2024 • Aave USDC Lending</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">$25,000.00</p>
                      <p className="text-sm text-green-400">Success</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Strategy Deposit</p>
                      <p className="text-sm text-gray-300">Dec 5, 2024 • GMX GLP Staking</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">$18,500.00</p>
                      <p className="text-sm text-green-400">Success</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
