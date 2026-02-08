import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Star,
  DollarSign,
  Layers,
  Activity,
  Eye,
  Target,
  Zap,
  Clock,
  Users,
  BarChart3
} from "lucide-react";

interface YieldPool {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  tvl: number;
  riskLevel: 'low' | 'medium' | 'high';
  chain: string;
  tokens: string[];
  category: string;
  lockPeriod: string;
  verified: boolean;
  safetyScore: number;
  description: string;
  features: string[];
}

interface SafetyMetric {
  name: string;
  score: number;
  description: string;
  status: 'pass' | 'warning' | 'fail';
}

export default function YieldPoolsExplorer() {
  const [selectedChain, setSelectedChain] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [minAPY, setMinAPY] = useState(0);

  const yieldPools: YieldPool[] = [
    {
      id: 'pancakeswap-bnb-usdt',
      protocol: 'PancakeSwap',
      name: 'BNB-USDT LP',
      apy: 142.5,
      tvl: 89000000,
      riskLevel: 'medium',
      chain: 'BSC',
      tokens: ['BNB', 'USDT'],
      category: 'DEX Liquidity',
      lockPeriod: 'No lock',
      verified: true,
      safetyScore: 85,
      description: 'High-yield liquidity pool on PancakeSwap with proven track record',
      features: ['Auto-compounding', 'Instant withdrawal', 'Low fees']
    },
    {
      id: 'cetus-sui-usdc',
      protocol: 'Cetus Protocol',
      name: 'SUI-USDC Concentrated',
      apy: 156.8,
      tvl: 12000000,
      riskLevel: 'high',
      chain: 'Sui',
      tokens: ['SUI', 'USDC'],
      category: 'Concentrated Liquidity',
      lockPeriod: 'No lock',
      verified: true,
      safetyScore: 78,
      description: 'Concentrated liquidity position with exceptional returns on Sui network',
      features: ['Concentrated LP', 'Active management', 'High capital efficiency']
    },
    {
      id: 'aave-usdc-lending',
      protocol: 'Aave V3',
      name: 'USDC Lending',
      apy: 8.4,
      tvl: 2800000000,
      riskLevel: 'low',
      chain: 'Ethereum',
      tokens: ['USDC'],
      category: 'Lending',
      lockPeriod: 'No lock',
      verified: true,
      safetyScore: 95,
      description: 'Secure USDC lending on Aave with institutional-grade safety',
      features: ['Insurance fund', 'Instant liquidity', 'Battle-tested']
    },
    {
      id: 'compound-eth-supply',
      protocol: 'Compound V3',
      name: 'ETH Supply',
      apy: 4.2,
      tvl: 1900000000,
      riskLevel: 'low',
      chain: 'Ethereum',
      tokens: ['ETH'],
      category: 'Lending',
      lockPeriod: 'No lock',
      verified: true,
      safetyScore: 92,
      description: 'ETH lending market with proven security and consistent yields',
      features: ['Governance token rewards', 'Elastic interest rates', 'Collateral efficiency']
    },
    {
      id: 'yearn-yvusdc',
      protocol: 'Yearn Finance',
      name: 'yvUSDC Vault',
      apy: 12.6,
      tvl: 450000000,
      riskLevel: 'medium',
      chain: 'Ethereum',
      tokens: ['USDC'],
      category: 'Yield Aggregator',
      lockPeriod: 'No lock',
      verified: true,
      safetyScore: 88,
      description: 'Automated yield optimization across multiple DeFi protocols',
      features: ['Auto-optimization', 'Gas efficiency', 'Professional management']
    },
    {
      id: 'beefy-matic-stable',
      protocol: 'Beefy Finance',
      name: 'Polygon Stable Vault',
      apy: 18.9,
      tvl: 67000000,
      riskLevel: 'medium',
      chain: 'Polygon',
      tokens: ['USDC', 'USDT', 'DAI'],
      category: 'Yield Aggregator',
      lockPeriod: 'No lock',
      verified: true,
      safetyScore: 82,
      description: 'Multi-stablecoin strategy on Polygon with low fees',
      features: ['Multi-asset', 'Low gas costs', 'Automated compounding']
    }
  ];

  const safetyMetrics: SafetyMetric[] = [
    {
      name: 'Smart Contract Audits',
      score: 95,
      description: 'Multiple professional audits by top security firms',
      status: 'pass'
    },
    {
      name: 'TVL History',
      score: 88,
      description: 'Consistent TVL growth and stability over time',
      status: 'pass'
    },
    {
      name: 'Team Transparency',
      score: 85,
      description: 'Doxxed team with strong track record',
      status: 'pass'
    },
    {
      name: 'Insurance Coverage',
      score: 72,
      description: 'Partial coverage available through third parties',
      status: 'warning'
    },
    {
      name: 'Governance Model',
      score: 90,
      description: 'Decentralized governance with active community',
      status: 'pass'
    },
    {
      name: 'Emergency Controls',
      score: 78,
      description: 'Pause mechanisms and emergency procedures in place',
      status: 'warning'
    }
  ];

  const chains = [
    { id: 'all', name: 'All Chains', count: yieldPools.length },
    { id: 'Ethereum', name: 'Ethereum', count: yieldPools.filter(p => p.chain === 'Ethereum').length },
    { id: 'BSC', name: 'BSC', count: yieldPools.filter(p => p.chain === 'BSC').length },
    { id: 'Polygon', name: 'Polygon', count: yieldPools.filter(p => p.chain === 'Polygon').length },
    { id: 'Sui', name: 'Sui', count: yieldPools.filter(p => p.chain === 'Sui').length }
  ];

  const riskLevels = [
    { id: 'all', name: 'All Risk Levels' },
    { id: 'low', name: 'Low Risk' },
    { id: 'medium', name: 'Medium Risk' },
    { id: 'high', name: 'High Risk' }
  ];

  const filteredPools = yieldPools.filter(pool => {
    const chainMatch = selectedChain === 'all' || pool.chain === selectedChain;
    const riskMatch = selectedRisk === 'all' || pool.riskLevel === selectedRisk;
    const apyMatch = pool.apy >= minAPY;
    return chainMatch && riskMatch && apyMatch;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-crypto-tertiary';
      case 'medium': return 'text-crypto-quaternary';
      case 'high': return 'text-red-400';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
    }
  };

  const formatTVL = (tvl: number) => {
    if (tvl >= 1000000000) return `$${(tvl / 1000000000).toFixed(1)}B`;
    if (tvl >= 1000000) return `$${(tvl / 1000000).toFixed(0)}M`;
    return `$${tvl.toLocaleString()}`;
  };

  const getSafetyColor = (score: number) => {
    if (score >= 85) return 'text-crypto-tertiary';
    if (score >= 70) return 'text-crypto-quaternary';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Yield Pools Explorer"
        subtitle="Discover high-yield DeFi opportunities with comprehensive safety analysis"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gradient mb-2">156%</div>
              <div className="text-crypto-text font-semibold mb-1">Highest APY</div>
              <div className="text-crypto-muted text-sm">Cetus Protocol</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-tertiary mb-2">$8.2B</div>
              <div className="text-crypto-text font-semibold mb-1">Total TVL</div>
              <div className="text-crypto-muted text-sm">Across all pools</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-primary mb-2">95%</div>
              <div className="text-crypto-text font-semibold mb-1">Safety Score</div>
              <div className="text-crypto-muted text-sm">Highest rated</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-quaternary mb-2">5</div>
              <div className="text-crypto-text font-semibold mb-1">Blockchains</div>
              <div className="text-crypto-muted text-sm">Multi-chain access</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pools">Yield Pools</TabsTrigger>
            <TabsTrigger value="aggregators">Yield Aggregators</TabsTrigger>
            <TabsTrigger value="safety">Safety Analysis</TabsTrigger>
            <TabsTrigger value="strategy">Strategy Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="pools" className="space-y-6">
            {/* Filters */}
            <Card className="crypto-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Filter by Chain</h3>
                    <div className="flex flex-wrap gap-2">
                      {chains.map((chain) => (
                        <Button
                          key={chain.id}
                          onClick={() => setSelectedChain(chain.id)}
                          variant={selectedChain === chain.id ? "default" : "ghost"}
                          className={`${selectedChain === chain.id ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                          {chain.name} ({chain.count})
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Risk Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {riskLevels.map((risk) => (
                        <Button
                          key={risk.id}
                          onClick={() => setSelectedRisk(risk.id)}
                          variant={selectedRisk === risk.id ? "default" : "ghost"}
                          className={`${selectedRisk === risk.id ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                          {risk.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Minimum APY: {minAPY}%</h3>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={minAPY}
                      onChange={(e) => setMinAPY(Number(e.target.value))}
                      className="w-full h-2 bg-crypto-surface rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPools.map((pool) => (
                <Card key={pool.id} className="crypto-card-premium hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-crypto-text mb-2">
                          {pool.protocol} - {pool.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getRiskBadge(pool.riskLevel)}>
                            {pool.riskLevel} risk
                          </Badge>
                          <Badge className="badge-secondary">{pool.chain}</Badge>
                          <Badge className="badge-primary">{pool.category}</Badge>
                          {pool.verified && (
                            <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-crypto-primary mb-1">
                          {pool.apy.toFixed(1)}%
                        </div>
                        <div className="text-crypto-muted text-sm">APY</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-crypto-muted text-sm">{pool.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-crypto-muted text-sm">TVL</div>
                        <div className="font-semibold text-crypto-text">{formatTVL(pool.tvl)}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Lock Period</div>
                        <div className="font-semibold text-crypto-text">{pool.lockPeriod}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Safety Score</div>
                        <div className={`font-semibold ${getSafetyColor(pool.safetyScore)}`}>
                          {pool.safetyScore}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Assets</div>
                        <div className="font-semibold text-crypto-text">{pool.tokens.join(', ')}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-crypto-text text-sm">Key Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {pool.features.map((feature, i) => (
                          <Badge key={i} className="badge-secondary text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-crypto-muted">Safety Rating</span>
                        <span className={getSafetyColor(pool.safetyScore)}>
                          {pool.safetyScore >= 85 ? 'Excellent' : 
                           pool.safetyScore >= 70 ? 'Good' : 'Moderate'}
                        </span>
                      </div>
                      <Progress value={pool.safetyScore} className="h-2" />
                    </div>

                    <div className="flex space-x-2">
                      <Button className="btn-primary flex-1">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Invest Now
                      </Button>
                      <Button className="btn-secondary">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="aggregators" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Top Yield Aggregators
                </CardTitle>
                <p className="text-crypto-muted">
                  Professional yield optimization platforms with automated strategies
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="crypto-card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-crypto-primary/15 rounded-lg flex items-center justify-center">
                        <Layers className="w-6 h-6 text-crypto-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-crypto-text">Yearn Finance</h3>
                        <p className="text-crypto-muted text-sm">Automated vaults</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">Best APY</span>
                        <span className="text-crypto-primary font-semibold">18.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">TVL</span>
                        <span className="text-crypto-text font-semibold">$890M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">Active Vaults</span>
                        <span className="text-crypto-text font-semibold">47</span>
                      </div>
                      <Button className="btn-primary w-full mt-4">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Explore Vaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="crypto-card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-crypto-tertiary/15 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-crypto-tertiary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-crypto-text">Beefy Finance</h3>
                        <p className="text-crypto-muted text-sm">Multi-chain optimizer</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">Best APY</span>
                        <span className="text-crypto-primary font-semibold">45.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">TVL</span>
                        <span className="text-crypto-text font-semibold">$420M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">Supported Chains</span>
                        <span className="text-crypto-text font-semibold">15+</span>
                      </div>
                      <Button className="btn-primary w-full mt-4">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Strategies
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="crypto-card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-crypto-quaternary/15 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-crypto-quaternary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-crypto-text">Harvest Finance</h3>
                        <p className="text-crypto-muted text-sm">Yield farming automation</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">Best APY</span>
                        <span className="text-crypto-primary font-semibold">32.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">TVL</span>
                        <span className="text-crypto-text font-semibold">$185M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">Auto-harvest</span>
                        <span className="text-crypto-tertiary font-semibold">✓ Enabled</span>
                      </div>
                      <Button className="btn-primary w-full mt-4">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Start Farming
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  DeFi Safety Analysis Framework
                </CardTitle>
                <p className="text-crypto-muted">
                  Comprehensive evaluation metrics for yield farming protocols
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {safetyMetrics.map((metric, index) => (
                    <Card key={index} className="crypto-card-premium">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {metric.status === 'pass' && <CheckCircle className="w-6 h-6 text-crypto-tertiary" />}
                            {metric.status === 'warning' && <AlertTriangle className="w-6 h-6 text-crypto-quaternary" />}
                            {metric.status === 'fail' && <AlertTriangle className="w-6 h-6 text-red-400" />}
                            <h3 className="text-lg font-bold text-crypto-text">{metric.name}</h3>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getSafetyColor(metric.score)}`}>
                              {metric.score}
                            </div>
                            <div className="text-crypto-muted text-sm">/100</div>
                          </div>
                        </div>
                        
                        <p className="text-crypto-muted text-sm mb-4">{metric.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-crypto-muted">Risk Assessment</span>
                            <span className={getSafetyColor(metric.score)}>
                              {metric.score >= 85 ? 'Low Risk' : 
                               metric.score >= 70 ? 'Medium Risk' : 'High Risk'}
                            </span>
                          </div>
                          <Progress value={metric.score} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="p-6 bg-crypto-card rounded-lg border border-crypto-primary/20">
                  <h3 className="text-lg font-bold text-crypto-text mb-4">
                    11-Point DeFi Safety Checklist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Multi-sig wallet requirements</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Time-locked contract upgrades</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Professional security audits</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Bug bounty programs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Transparent team credentials</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Regular security updates</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Emergency pause mechanisms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Insurance fund coverage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Decentralized governance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Liquidity safeguards</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Regulatory compliance checks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Yield Strategy Builder
                </CardTitle>
                <p className="text-crypto-muted">
                  Build diversified yield portfolios with professional risk management
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="crypto-card-premium">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-tertiary/15 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-crypto-tertiary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Conservative</h3>
                      <div className="text-2xl font-bold text-crypto-tertiary mb-2">5-12%</div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Low-risk stablecoin strategies with consistent returns
                      </p>
                      <ul className="text-crypto-muted text-sm space-y-1 mb-4">
                        <li>• Aave/Compound lending</li>
                        <li>• Stablecoin LP pools</li>
                        <li>• Government bond protocols</li>
                        <li>• Insurance-backed vaults</li>
                      </ul>
                      <Button className="btn-secondary w-full">
                        Build Conservative
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium border-2 border-crypto-primary border-opacity-30">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-primary/15 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-crypto-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Balanced</h3>
                      <div className="text-2xl font-bold text-crypto-primary mb-2">15-35%</div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Optimal risk-reward balance with diversified exposure
                      </p>
                      <ul className="text-crypto-muted text-sm space-y-1 mb-4">
                        <li>• Blue-chip DEX LPs</li>
                        <li>• Yield aggregator vaults</li>
                        <li>• Lending + farming mix</li>
                        <li>• Cross-chain strategies</li>
                      </ul>
                      <Button className="btn-primary w-full">
                        Build Balanced
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-500/15 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-red-400" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Aggressive</h3>
                      <div className="text-2xl font-bold text-red-400 mb-2">50-150%</div>
                      <p className="text-crypto-muted text-sm mb-4">
                        High-risk, high-reward strategies for experienced users
                      </p>
                      <ul className="text-crypto-muted text-sm space-y-1 mb-4">
                        <li>• New protocol farms</li>
                        <li>• Leveraged positions</li>
                        <li>• Concentrated liquidity</li>
                        <li>• Altcoin strategies</li>
                      </ul>
                      <Button className="btn-danger w-full">
                        Build Aggressive
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-crypto-card rounded-lg">
                  <h3 className="text-lg font-bold text-crypto-text mb-4">
                    Portfolio Allocation Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-crypto-text mb-3">Beginner (&lt; $10K)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Stablecoin lending</span>
                          <span className="text-crypto-tertiary font-semibold">60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Blue-chip LP</span>
                          <span className="text-crypto-quaternary font-semibold">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Yield aggregators</span>
                          <span className="text-crypto-primary font-semibold">10%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-crypto-text mb-3">Intermediate ($10K-$100K)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Core protocols</span>
                          <span className="text-crypto-tertiary font-semibold">40%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">DEX farming</span>
                          <span className="text-crypto-quaternary font-semibold">35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">High-yield opportunities</span>
                          <span className="text-crypto-primary font-semibold">25%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-crypto-text mb-3">Advanced (&gt; $100K)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Stable base</span>
                          <span className="text-crypto-tertiary font-semibold">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Diversified farming</span>
                          <span className="text-crypto-quaternary font-semibold">40%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Alpha strategies</span>
                          <span className="text-crypto-primary font-semibold">30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}