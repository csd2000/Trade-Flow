import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  DollarSign, 
  Shield, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Calculator,
  Zap
} from "lucide-react";

interface YieldStrategy {
  id: string;
  name: string;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  minAmount: number;
  protocol: string;
  description: string;
  safetyScore: number;
  features: string[];
}

interface StrategyCalculation {
  principal: number;
  selectedStrategies: string[];
  timeframe: '1month' | '3months' | '6months' | '1year';
  projectedReturn: number;
  monthlyIncome: number;
  riskScore: number;
}

export function YieldStrategyBuilder() {
  const [calculation, setCalculation] = useState<StrategyCalculation>({
    principal: 10000,
    selectedStrategies: [],
    timeframe: '1month',
    projectedReturn: 0,
    monthlyIncome: 0,
    riskScore: 0
  });

  const yieldStrategies: YieldStrategy[] = [
    {
      id: 'aave-usdc',
      name: 'Aave USDC Lending',
      apy: 6.8,
      riskLevel: 'low',
      minAmount: 100,
      protocol: 'Aave',
      description: 'Lend USDC on Aave for stable, low-risk returns',
      safetyScore: 95,
      features: ['Instant withdrawal', 'No impermanent loss', 'Battle tested']
    },
    {
      id: 'compound-eth',
      name: 'Compound ETH Supply',
      apy: 4.2,
      riskLevel: 'low',
      minAmount: 500,
      protocol: 'Compound',
      description: 'Supply ETH to Compound for steady yield',
      safetyScore: 92,
      features: ['ETH exposure', 'Proven protocol', 'Liquid']
    },
    {
      id: 'uniswap-eth-usdc',
      name: 'Uniswap V3 ETH/USDC',
      apy: 12.4,
      riskLevel: 'medium',
      minAmount: 1000,
      protocol: 'Uniswap',
      description: 'Provide liquidity to ETH/USDC pair on Uniswap V3',
      safetyScore: 78,
      features: ['Trading fees', 'Concentrated liquidity', 'IL risk']
    },
    {
      id: 'yearn-usdc',
      name: 'Yearn USDC Vault',
      apy: 8.9,
      riskLevel: 'medium',
      minAmount: 1000,
      protocol: 'Yearn',
      description: 'Automated yield farming with USDC',
      safetyScore: 85,
      features: ['Auto-compound', 'Strategy optimization', 'Gas efficient']
    },
    {
      id: 'curve-3pool',
      name: 'Curve 3Pool',
      apy: 7.3,
      riskLevel: 'low',
      minAmount: 500,
      protocol: 'Curve',
      description: 'Stable coin pool with CRV rewards',
      safetyScore: 88,
      features: ['Stable assets', 'CRV rewards', 'Low slippage']
    },
    {
      id: 'convex-crv',
      name: 'Convex CRV Boost',
      apy: 15.6,
      riskLevel: 'medium',
      minAmount: 2000,
      protocol: 'Convex',
      description: 'Boosted CRV yields through Convex',
      safetyScore: 72,
      features: ['Yield boost', 'CVX rewards', 'Auto-harvest']
    }
  ];

  const toggleStrategy = (strategyId: string) => {
    setCalculation(prev => ({
      ...prev,
      selectedStrategies: prev.selectedStrategies.includes(strategyId)
        ? prev.selectedStrategies.filter(id => id !== strategyId)
        : [...prev.selectedStrategies, strategyId]
    }));
  };

  const calculateReturns = () => {
    const selectedStrategiesData = yieldStrategies.filter(s => 
      calculation.selectedStrategies.includes(s.id)
    );
    
    if (selectedStrategiesData.length === 0) return;

    // Calculate weighted average APY
    const totalWeight = selectedStrategiesData.length;
    const averageAPY = selectedStrategiesData.reduce((sum, strategy) => 
      sum + strategy.apy, 0) / totalWeight;

    // Calculate risk score
    const riskScores = { low: 25, medium: 50, high: 75 };
    const averageRisk = selectedStrategiesData.reduce((sum, strategy) => 
      sum + riskScores[strategy.riskLevel], 0) / totalWeight;

    const monthlyRate = averageAPY / 100 / 12;
    const monthlyIncome = calculation.principal * monthlyRate;
    
    let projectedReturn;
    switch (calculation.timeframe) {
      case '1month':
        projectedReturn = monthlyIncome;
        break;
      case '3months':
        projectedReturn = monthlyIncome * 3;
        break;
      case '6months':
        projectedReturn = monthlyIncome * 6;
        break;
      case '1year':
        projectedReturn = calculation.principal * (averageAPY / 100);
        break;
    }

    setCalculation(prev => ({
      ...prev,
      projectedReturn,
      monthlyIncome,
      riskScore: averageRisk
    }));
  };

  const getRiskColor = (risk: string | number) => {
    if (typeof risk === 'string') {
      switch (risk) {
        case 'low': return 'text-crypto-tertiary';
        case 'medium': return 'text-crypto-quaternary';
        case 'high': return 'text-red-400';
      }
    } else {
      if (risk <= 30) return 'text-crypto-tertiary';
      if (risk <= 60) return 'text-crypto-quaternary';
      return 'text-red-400';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
          <Calculator className="w-6 h-6 text-crypto-primary" />
          Yield Strategy Builder
        </CardTitle>
        <p className="text-crypto-muted">
          Build your personalized yield portfolio with proven DeFi strategies
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Investment Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-crypto-text mb-2">
              Investment Amount ($)
            </label>
            <input
              type="number"
              value={calculation.principal}
              onChange={(e) => setCalculation(prev => ({ 
                ...prev, 
                principal: Number(e.target.value) 
              }))}
              className="w-full p-3 bg-crypto-surface border border-crypto-border rounded-lg text-crypto-text"
              min="100"
              max="1000000"
              step="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-crypto-text mb-2">
              Time Frame
            </label>
            <select
              value={calculation.timeframe}
              onChange={(e) => setCalculation(prev => ({ 
                ...prev, 
                timeframe: e.target.value as StrategyCalculation['timeframe']
              }))}
              className="w-full p-3 bg-crypto-surface border border-crypto-border rounded-lg text-crypto-text"
            >
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
            </select>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-crypto-text">Available Strategies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yieldStrategies.map((strategy) => (
              <Card 
                key={strategy.id}
                className={`crypto-card cursor-pointer transition-all ${
                  calculation.selectedStrategies.includes(strategy.id)
                    ? 'border-crypto-primary bg-crypto-primary/5'
                    : 'hover:border-crypto-primary/50'
                }`}
                onClick={() => toggleStrategy(strategy.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-crypto-text mb-1">
                        {strategy.name}
                      </h4>
                      <p className="text-crypto-muted text-sm">
                        {strategy.protocol}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-crypto-primary">
                        {strategy.apy}%
                      </div>
                      <div className="text-crypto-muted text-xs">APY</div>
                    </div>
                  </div>

                  <p className="text-crypto-muted text-sm mb-3">
                    {strategy.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getRiskBadge(strategy.riskLevel)}>
                      {strategy.riskLevel} risk
                    </Badge>
                    <div className="text-crypto-muted text-sm">
                      Min: ${strategy.minAmount}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-crypto-muted">Safety Score</span>
                      <span className="text-crypto-text font-semibold">
                        {strategy.safetyScore}/100
                      </span>
                    </div>
                    <Progress value={strategy.safetyScore} className="h-2" />
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {strategy.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} className="badge-secondary text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-center">
                    {calculation.selectedStrategies.includes(strategy.id) ? (
                      <CheckCircle className="w-5 h-5 text-crypto-tertiary" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-crypto-border rounded-full"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={calculateReturns}
          disabled={calculation.selectedStrategies.length === 0}
          className="btn-primary w-full"
        >
          <Zap className="w-4 h-4 mr-2" />
          Calculate Returns
        </Button>

        {/* Results */}
        {calculation.projectedReturn > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-crypto-text">Projected Returns</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="crypto-card text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-crypto-primary mb-1">
                    ${calculation.monthlyIncome.toFixed(0)}
                  </div>
                  <div className="text-crypto-muted text-sm">Monthly Income</div>
                </CardContent>
              </Card>
              
              <Card className="crypto-card text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-crypto-tertiary mb-1">
                    ${calculation.projectedReturn.toFixed(0)}
                  </div>
                  <div className="text-crypto-muted text-sm">
                    {calculation.timeframe === '1month' ? 'Monthly' :
                     calculation.timeframe === '3months' ? '3-Month' :
                     calculation.timeframe === '6months' ? '6-Month' : 'Annual'} Return
                  </div>
                </CardContent>
              </Card>
              
              <Card className="crypto-card text-center">
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold mb-1 ${getRiskColor(calculation.riskScore)}`}>
                    {calculation.riskScore.toFixed(0)}
                  </div>
                  <div className="text-crypto-muted text-sm">Risk Score</div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-crypto-surface rounded-lg">
              <h4 className="font-semibold text-crypto-text mb-2">Strategy Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-crypto-muted">Selected Strategies:</span>
                  <span className="text-crypto-text">{calculation.selectedStrategies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-crypto-muted">Risk Level:</span>
                  <span className={getRiskColor(calculation.riskScore)}>
                    {calculation.riskScore <= 30 ? 'Conservative' :
                     calculation.riskScore <= 60 ? 'Moderate' : 'Aggressive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-crypto-muted">Diversification:</span>
                  <span className="text-crypto-text">
                    {calculation.selectedStrategies.length >= 3 ? 'Well Diversified' :
                     calculation.selectedStrategies.length === 2 ? 'Moderately Diversified' : 'Concentrated'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}