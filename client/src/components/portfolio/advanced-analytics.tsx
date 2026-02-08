import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCryptoPrices, usePortfolioValue } from "@/hooks/use-crypto-prices";
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent
} from "lucide-react";

interface PortfolioHolding {
  symbol: string;
  amount: number;
  value: number;
  allocation: number;
}

export function AdvancedPortfolioAnalytics() {
  // Mock portfolio data - in real app this would come from user's connected wallet
  const mockHoldings: PortfolioHolding[] = [
    { symbol: 'ETH', amount: 5.2, value: 14820, allocation: 45 },
    { symbol: 'BTC', amount: 0.31, value: 14632, allocation: 44 },
    { symbol: 'MATIC', amount: 1200, value: 1080, allocation: 3 },
    { symbol: 'LINK', amount: 150, value: 2100, allocation: 6 },
    { symbol: 'USDC', amount: 650, value: 650, allocation: 2 }
  ];

  const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const { data: prices } = useCryptoPrices(['ethereum', 'bitcoin', 'polygon-matic', 'chainlink']);

  const calculateRiskScore = () => {
    // Risk score based on allocation diversification and volatility
    const concentrationRisk = Math.max(...mockHoldings.map(h => h.allocation));
    const stablecoinAllocation = mockHoldings.find(h => h.symbol === 'USDC')?.allocation || 0;
    
    let riskScore = 0;
    if (concentrationRisk > 50) riskScore += 30;
    if (concentrationRisk > 70) riskScore += 20;
    if (stablecoinAllocation < 5) riskScore += 15;
    if (mockHoldings.length < 3) riskScore += 25;
    
    return Math.min(riskScore, 100);
  };

  const riskScore = calculateRiskScore();
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'text-crypto-tertiary', bg: 'bg-crypto-tertiary/15' };
    if (score <= 60) return { level: 'Medium', color: 'text-crypto-quaternary', bg: 'bg-crypto-quaternary/15' };
    return { level: 'High', color: 'text-red-400', bg: 'bg-red-400/15' };
  };

  const risk = getRiskLevel(riskScore);

  const performanceMetrics = {
    dailyChange: 2.34,
    weeklyChange: -1.67,
    monthlyChange: 12.45,
    sharpeRatio: 1.85,
    maxDrawdown: -8.23,
    volatility: 15.6
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-crypto-primary" />
            Advanced Portfolio Analytics
            <Badge className="badge-success">Live</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Total Value & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-crypto-surface rounded-lg">
              <div className="text-2xl font-bold text-crypto-text mb-1">
                ${totalValue.toLocaleString()}
              </div>
              <div className="text-crypto-muted text-sm">Total Value</div>
            </div>
            
            <div className="text-center p-4 bg-crypto-surface rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                performanceMetrics.dailyChange > 0 ? 'text-crypto-tertiary' : 'text-red-400'
              }`}>
                {performanceMetrics.dailyChange > 0 ? '+' : ''}{performanceMetrics.dailyChange}%
              </div>
              <div className="text-crypto-muted text-sm">24h Change</div>
            </div>
            
            <div className="text-center p-4 bg-crypto-surface rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                performanceMetrics.monthlyChange > 0 ? 'text-crypto-tertiary' : 'text-red-400'
              }`}>
                {performanceMetrics.monthlyChange > 0 ? '+' : ''}{performanceMetrics.monthlyChange}%
              </div>
              <div className="text-crypto-muted text-sm">30d Change</div>
            </div>
            
            <div className="text-center p-4 bg-crypto-surface rounded-lg">
              <div className="text-2xl font-bold text-crypto-primary mb-1">
                {performanceMetrics.sharpeRatio}
              </div>
              <div className="text-crypto-muted text-sm">Sharpe Ratio</div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="p-6 bg-crypto-card rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-crypto-text flex items-center gap-2">
                <Shield className="w-5 h-5 text-crypto-secondary" />
                Risk Analysis
              </h3>
              <Badge className={`${risk.color} ${risk.bg} border border-current`}>
                {risk.level} Risk
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-crypto-muted">Risk Score</span>
                  <span className="text-crypto-text font-semibold">{riskScore}/100</span>
                </div>
                <Progress value={riskScore} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-crypto-surface rounded-lg">
                  <div className="text-lg font-bold text-red-400 mb-1">
                    {performanceMetrics.maxDrawdown}%
                  </div>
                  <div className="text-crypto-muted text-xs">Max Drawdown</div>
                </div>
                
                <div className="text-center p-3 bg-crypto-surface rounded-lg">
                  <div className="text-lg font-bold text-crypto-quaternary mb-1">
                    {performanceMetrics.volatility}%
                  </div>
                  <div className="text-crypto-muted text-xs">Volatility</div>
                </div>
                
                <div className="text-center p-3 bg-crypto-surface rounded-lg">
                  <div className="text-lg font-bold text-crypto-primary mb-1">
                    {mockHoldings.length}
                  </div>
                  <div className="text-crypto-muted text-xs">Assets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-crypto-text flex items-center gap-2">
              <Target className="w-5 h-5 text-crypto-tertiary" />
              Asset Allocation
            </h3>
            
            <div className="space-y-3">
              {mockHoldings.map((holding, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-crypto-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-crypto-card rounded-full flex items-center justify-center">
                      <span className="font-bold text-crypto-text text-sm">
                        {holding.symbol}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-crypto-text">
                        {holding.amount} {holding.symbol}
                      </div>
                      <div className="text-crypto-muted text-sm">
                        ${holding.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-crypto-text">
                      {holding.allocation}%
                    </div>
                    <div className="w-16 bg-crypto-card rounded-full h-2 mt-1">
                      <div 
                        className="bg-crypto-primary h-2 rounded-full"
                        style={{ width: `${(holding.allocation / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-crypto-surface/50 rounded-lg">
            <h4 className="font-semibold text-crypto-text mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
              Portfolio Recommendations
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-crypto-quaternary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-crypto-muted">
                  Consider increasing stablecoin allocation to 5-10% for better risk management
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-crypto-tertiary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-crypto-muted">
                  Good diversification across major assets
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <DollarSign className="w-4 h-4 text-crypto-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-crypto-muted">
                  Consider DeFi yield strategies for USDC holdings
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}