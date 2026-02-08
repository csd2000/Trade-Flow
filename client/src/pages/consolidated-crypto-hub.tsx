import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  BookOpen,
  BarChart3,
  Wallet,
  TrendingUp,
  Shield,
  Target,
  DollarSign,
  Calendar,
  Users,
  ArrowRight,
  Star,
  CheckCircle,
  Activity,
  Zap,
  Globe,
  Eye,
  Filter,
  SortDesc,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Section {
  id: string;
  title: string;
  description: string;
  features: string[];
  dataSource: string;
}

interface CryptoProject {
  id: number;
  name: string;
  symbol: string;
  description: string;
  category: string;
  chain: string;
  apyRange: string;
  tvl: number;
  status: string;
  airdropEligible: boolean;
  realYield: boolean;
  aiNarrative: boolean;
  websiteUrl?: string;
  twitterUrl?: string;
}

interface YieldPool {
  id: string;
  protocol: string;
  network: string;
  apy: number;
  tvl: number;
  riskLevel: 'low' | 'medium' | 'high';
  trending: boolean;
}

interface PortfolioStrategy {
  id: string;
  name: string;
  amount: number;
  dailyEarnings: number;
  roi: number;
  apr: number;
  status: 'active' | 'paused';
}

export default function ConsolidatedCryptoHub() {
  const [activeSection, setActiveSection] = useState('project-discovery');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('apy');
  const { toast } = useToast();

  const sections: Section[] = [
    {
      id: 'project-discovery',
      title: '🔍 Project Discovery',
      description: 'Explore new DeFi projects, airdrops, trending protocols, and yield opportunities.',
      features: [
        'Filter by chain, APY, sector, launch status',
        'Tag: Airdrop Eligible, Real Yield, Trending',
        'Connect to Passive Income strategies'
      ],
      dataSource: 'projects'
    },
    {
      id: 'passive-income-training',
      title: '📘 Passive Income Training', 
      description: 'Learn how to earn crypto daily using beginner to pro-level DeFi strategies.',
      features: [
        'Step-by-step guides',
        'Filter by ROI, Risk, Chain',
        'Link to projects in discovery'
      ],
      dataSource: 'strategies'
    },
    {
      id: 'yield-pools',
      title: '📊 Yield Pools',
      description: 'View the best yield opportunities by TVL, platform, and risk level.',
      features: [
        'Real-time APY data',
        'Grouped by network and protocol',
        'Sort: Highest Yield, Safest'
      ],
      dataSource: 'vaults'
    },
    {
      id: 'portfolio-tracker',
      title: '📁 Portfolio Tracker',
      description: 'Connect your wallet to track your DeFi strategies, daily yield, and ROI.',
      features: [
        'Wallet sync',
        'Active strategy breakdown',
        'Exit Now button integration'
      ],
      dataSource: 'portfolio'
    },
    {
      id: 'exit-strategy',
      title: '💡 Exit Strategy Wizard',
      description: 'Plan when and how to safely exit the market with custom alerts and DCA tools.',
      features: [
        'Auto alert setup (Email, Telegram)',
        'Custom DCA plan',
        'Historical top signal analysis'
      ],
      dataSource: 'alerts'
    },
    {
      id: 'education-safety',
      title: '🧠 Education + Safety',
      description: 'Master DeFi safely with videos, PDF guides, rug check tools, and smart contract audits.',
      features: [
        'Wallet hygiene lessons',
        'Rug check integrations',
        'Beginner to advanced education'
      ],
      dataSource: 'education'
    }
  ];

  // Mock data - will be replaced with API calls
  const cryptoProjects: CryptoProject[] = [
    {
      id: 1,
      name: 'Arbitrum Ecosystem Fund',
      symbol: 'ARB',
      description: 'Layer 2 scaling solution with growing DeFi ecosystem and airdrop potential',
      category: 'Layer 2',
      chain: 'Arbitrum',
      apyRange: '8-15%',
      tvl: 2500000000,
      status: 'active',
      airdropEligible: true,
      realYield: true,
      aiNarrative: false
    },
    {
      id: 2,
      name: 'Optimism Superchain',
      symbol: 'OP',
      description: 'Ethereum Layer 2 with retroactive funding and governance opportunities',
      category: 'Layer 2',
      chain: 'Optimism',
      apyRange: '6-12%',
      tvl: 1800000000,
      status: 'active',
      airdropEligible: true,
      realYield: true,
      aiNarrative: false
    }
  ];

  const yieldPools: YieldPool[] = [
    {
      id: 'curve-eth',
      protocol: 'Curve Finance',
      network: 'Ethereum',
      apy: 12.5,
      tvl: 450000000,
      riskLevel: 'low',
      trending: true
    },
    {
      id: 'gmx-arb',
      protocol: 'GMX',
      network: 'Arbitrum',
      apy: 18.2,
      tvl: 320000000,
      riskLevel: 'medium',
      trending: true
    }
  ];

  const portfolioStrategies: PortfolioStrategy[] = [
    {
      id: 'steth-curve',
      name: 'stETH-ETH Curve LP',
      amount: 12.5,
      dailyEarnings: 0.045,
      roi: 23.8,
      apr: 8.7,
      status: 'active'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-white dark:text-gray-700';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-900 dark:via-purple-900 dark:to-green-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              🧩 Crypto Strategy Hub
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Explore, earn, and exit DeFi confidently with everything in one place
            </p>
            
            {/* Navigation Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {sections.map(section => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "outline"}
                  onClick={() => setActiveSection(section.id)}
                  className="text-sm"
                >
                  {section.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Active Section Display */}
        {activeSection === 'project-discovery' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Project Discovery
                </CardTitle>
                <CardDescription>
                  Discover new DeFi projects with airdrop potential and yield opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="cursor-pointer hover:bg-blue-100">
                    Airdrop Eligible
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-green-100">
                    Real Yield
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">
                    Beta Launch
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-yellow-100">
                    AI Narrative
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {cryptoProjects.map(project => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{project.name}</h3>
                              <Badge variant="outline">{project.symbol}</Badge>
                              {project.airdropEligible && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Airdrop Eligible
                                </Badge>
                              )}
                              {project.realYield && (
                                <Badge className="bg-green-100 text-green-800">
                                  Real Yield
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-200 mb-3">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Activity className="h-4 w-4" />
                                {project.chain}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                APY: {project.apyRange}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                TVL: {formatNumber(project.tvl)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Explore
                            </Button>
                            <Button size="sm" variant="outline">
                              Add to Portfolio
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'yield-pools' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Yield Pools
                </CardTitle>
                <CardDescription>
                  Best yield opportunities sorted by APY, TVL, and risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <SortDesc className="h-4 w-4 mr-2" />
                      Sort by APY
                    </Button>
                  </div>
                  <Badge variant="secondary">
                    {yieldPools.length} Pools Available
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {yieldPools.map(pool => (
                    <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{pool.protocol}</h3>
                              <Badge variant="outline">{pool.network}</Badge>
                              <Badge className={getRiskColor(pool.riskLevel)}>
                                {pool.riskLevel} risk
                              </Badge>
                              {pool.trending && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-600">
                              <span className="text-2xl font-bold text-green-600">
                                {pool.apy}% APY
                              </span>
                              <span>TVL: {formatNumber(pool.tvl)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Button>
                              Deposit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'portfolio-tracker' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Portfolio Tracker
                </CardTitle>
                <CardDescription>
                  Connect your wallet to track DeFi strategies and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Connect your MetaMask wallet to view your active strategies and earnings.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">$2,847.50</div>
                        <div className="text-sm text-slate-600">Total Value</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">$12.45</div>
                        <div className="text-sm text-slate-600">Daily Earnings</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">15.8%</div>
                        <div className="text-sm text-slate-600">Average APR</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {portfolioStrategies.map(strategy => (
                    <Card key={strategy.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold mb-1">{strategy.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>{strategy.amount} ETH</span>
                              <span className="text-green-600">+${strategy.dailyEarnings}/day</span>
                              <span>{strategy.apr}% APR</span>
                              <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                                {strategy.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Manage
                            </Button>
                            <Button size="sm" variant="destructive">
                              Exit Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-gray-900 border-0 mt-12">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                Want to automate your income, discover new projects, and never miss a market top?
              </h3>
              <p className="mb-6 opacity-90">
                Start with a training or connect your wallet to view your strategy map.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary">
                  Explore New Strategies
                </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-blue-600">
                  Connect Wallet
                </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-purple-600">
                  Plan My Exit
                </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-green-600">
                  DeFi Safety Check
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}