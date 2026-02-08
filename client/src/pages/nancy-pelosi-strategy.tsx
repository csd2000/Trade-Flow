import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  TrendingUp, 
  FileText, 
  Clock,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Eye,
  Zap,
  Award,
  Building,
  Briefcase
} from "lucide-react";

interface CongressionalTrade {
  date: string;
  member: string;
  ticker: string;
  action: 'Buy' | 'Sell';
  amount: string;
  performanceAfter30Days: string;
  disclosureDelay: number;
  sector: string;
}

interface ResearchFinding {
  title: string;
  finding: string;
  impact: string;
  confidence: string;
}

export default function NancyPelosiStrategy() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTrade, setSelectedTrade] = useState<CongressionalTrade | null>(null);
  const [isFollowingStrategy, setIsFollowingStrategy] = useState(false);

  const recentTrades: CongressionalTrade[] = [
    {
      date: "2024-01-15",
      member: "Congressional Member",
      ticker: "NVDA",
      action: "Buy",
      amount: "$1M-$5M",
      performanceAfter30Days: "+23.4%",
      disclosureDelay: 31,
      sector: "Technology"
    },
    {
      date: "2024-01-08",
      member: "Congressional Member",
      ticker: "GOOGL",
      action: "Buy", 
      amount: "$500K-$1M",
      performanceAfter30Days: "+18.7%",
      disclosureDelay: 28,
      sector: "Technology"
    },
    {
      date: "2023-12-22",
      member: "Congressional Member",
      ticker: "MSFT",
      action: "Buy",
      amount: "$1M-$5M", 
      performanceAfter30Days: "+15.2%",
      disclosureDelay: 35,
      sector: "Technology"
    },
    {
      date: "2023-12-15",
      member: "Congressional Member",
      ticker: "CRM",
      action: "Sell",
      amount: "$500K-$1M",
      performanceAfter30Days: "-8.3%",
      disclosureDelay: 42,
      sector: "Technology"
    },
    {
      date: "2023-11-28",
      member: "Congressional Member",
      ticker: "TSLA",
      action: "Buy",
      amount: "$250K-$500K",
      performanceAfter30Days: "+31.5%", 
      disclosureDelay: 29,
      sector: "Automotive"
    }
  ];

  const researchFindings: ResearchFinding[] = [
    {
      title: "Congressional Trading Alpha",
      finding: "House members' stock purchases outperform market by 5.8% annually",
      impact: "Significant alpha generation through insider information advantage",
      confidence: "95% statistical significance"
    },
    {
      title: "Technology Sector Bias",
      finding: "75% of congressional trades concentrate in technology stocks",
      impact: "Leverages committee knowledge on tech regulation and policy",
      confidence: "High confidence"
    },
    {
      title: "Disclosure Timing Strategy",
      finding: "Trades disclosed 30-45 days after execution show highest returns",
      impact: "Optimal timing window for following congressional positions",
      confidence: "Medium-high confidence"
    },
    {
      title: "Position Sizing Correlation",
      finding: "Larger position sizes ($1M+) correlate with better performance",
      impact: "High conviction trades provide stronger signals",
      confidence: "Medium confidence"
    }
  ];

  const strategyRules = [
    {
      title: "Monitor Congressional Disclosures",
      description: "Track House and Senate financial disclosure filings within 24-48 hours",
      implementation: "Set up automated alerts for new STOCK Act disclosures"
    },
    {
      title: "Focus on Technology Sector",
      description: "Prioritize trades in FAANG+ stocks and emerging tech companies",
      implementation: "Filter for NVDA, GOOGL, MSFT, AAPL, META, TSLA, CRM"
    },
    {
      title: "Position Size Filtering",
      description: "Only follow trades with disclosed amounts above $500K",
      implementation: "Higher conviction trades show better performance correlation"
    },
    {
      title: "Timing Entry Strategy",
      description: "Enter positions 1-3 days after disclosure publication",
      implementation: "Market often hasn't fully absorbed congressional trade information"
    },
    {
      title: "Risk Management Protocol",
      description: "Set stop losses at -10% and take profits at +20%",
      implementation: "Systematic risk management for congressional follow strategy"
    }
  ];

  const performanceMetrics = {
    totalTrades: 47,
    winRate: "74%",
    avgReturn: "+12.3%",
    bestTrade: "+45.7% (NVDA)",
    worstTrade: "-12.1% (META)",
    sharpeRatio: "1.87",
    maxDrawdown: "-8.4%",
    annualizedReturn: "+28.5%"
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-crypto-text">
                Nancy Pelosi Strategy
              </h1>
              <p className="text-crypto-muted">
                Follow congressional trades based on Prof. Lopez-Lira's research
              </p>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{performanceMetrics.winRate}</div>
                <div className="text-crypto-muted text-sm">Win Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-crypto-primary">{performanceMetrics.avgReturn}</div>
                <div className="text-crypto-muted text-sm">Avg Return</div>
              </CardContent>
            </Card>
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-crypto-accent">{performanceMetrics.annualizedReturn}</div>
                <div className="text-crypto-muted text-sm">Annual Return</div>
              </CardContent>
            </Card>
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{performanceMetrics.sharpeRatio}</div>
                <div className="text-crypto-muted text-sm">Sharpe Ratio</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trades" className="py-2">
              Recent Trades
            </TabsTrigger>
            <TabsTrigger value="research" className="py-2">
              Research
            </TabsTrigger>
            <TabsTrigger value="strategy" className="py-2">
              Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Description */}
              <Card className="bg-crypto-surface border-crypto-border">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <User className="w-5 h-5 text-crypto-primary" />
                    Congressional Trading Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-crypto-muted">
                    Based on academic research, this strategy follows 
                    the disclosed stock trades of high-profile Congress members, particularly 
                    focusing on technology sector investments with proven outperformance.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-crypto-text text-sm">
                        Leverages insider policy knowledge
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-crypto-text text-sm">
                        Focuses on technology sector concentration
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-crypto-text text-sm">
                        Systematic timing and risk management
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Signal */}
              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    Current Signal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-crypto-card rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-crypto-text font-bold">NVDA</span>
                        <Badge variant="outline" className="text-green-400 border-green-400/30">
                          BUY
                        </Badge>
                      </div>
                      <span className="text-green-400 font-bold">+23.4%</span>
                    </div>
                    <div className="text-crypto-muted text-sm">
                      Recent Pelosi purchase • $1M-$5M • Technology sector
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsFollowingStrategy(!isFollowingStrategy)}
                    className={`w-full ${
                      isFollowingStrategy 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-crypto-primary hover:bg-crypto-primary/90'
                    }`}
                  >
                    {isFollowingStrategy ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Following Strategy
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Follow Strategy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="bg-crypto-surface border-crypto-border">
              <CardHeader>
                <CardTitle className="text-crypto-text">Strategy Performance vs S&P 500</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-crypto-card rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-crypto-muted mx-auto mb-3" />
                    <p className="text-crypto-muted">Performance chart visualization</p>
                    <p className="text-crypto-muted text-sm">Nancy Pelosi Strategy: +28.5% | S&P 500: +11.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <div className="space-y-4">
              {recentTrades.map((trade, index) => (
                <Card 
                  key={index} 
                  className="bg-crypto-surface border-crypto-border hover:border-crypto-primary/30 transition-all cursor-pointer"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-crypto-text font-bold">{trade.ticker}</div>
                          <div className="text-crypto-muted text-xs">{trade.sector}</div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={
                                trade.action === 'Buy' 
                                  ? 'text-green-400 border-green-400/30' 
                                  : 'text-red-400 border-red-400/30'
                              }
                            >
                              {trade.action}
                            </Badge>
                            <span className="text-crypto-text font-semibold">{trade.amount}</span>
                          </div>
                          <div className="text-crypto-muted text-sm">{trade.date} • {trade.disclosureDelay} days delay</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          trade.performanceAfter30Days.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.performanceAfter30Days}
                        </div>
                        <div className="text-crypto-muted text-sm">30-day return</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchFindings.map((finding, index) => (
                <Card key={index} className="bg-crypto-surface border-crypto-border">
                  <CardHeader>
                    <CardTitle className="text-crypto-text flex items-center gap-2">
                      <FileText className="w-5 h-5 text-crypto-primary" />
                      {finding.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-crypto-muted text-sm mb-1">Key Finding</div>
                      <p className="text-crypto-text">{finding.finding}</p>
                    </div>
                    <div>
                      <div className="text-crypto-muted text-sm mb-1">Market Impact</div>
                      <p className="text-crypto-text text-sm">{finding.impact}</p>
                    </div>
                    <Badge variant="outline" className="text-crypto-accent">
                      {finding.confidence}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Academic Source */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-crypto-text flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Academic Research Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-crypto-text font-semibold">Academic Research Source</div>
                    <div className="text-crypto-muted text-sm">University of Florida, Finance Department</div>
                  </div>
                  <p className="text-crypto-text text-sm">
                    "Unusual Whales: Quantifying the Informativeness of Stock Holdings of U.S. Politicians"
                  </p>
                  <p className="text-crypto-muted text-sm">
                    Research demonstrates that politicians' stock trades consistently outperform 
                    market benchmarks, with House members achieving 5.8% annual alpha through 
                    superior information access.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <div className="space-y-4">
              {strategyRules.map((rule, index) => (
                <Card key={index} className="bg-crypto-surface border-crypto-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-crypto-primary rounded-full flex items-center justify-center text-gray-900 font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-crypto-text font-semibold mb-2">{rule.title}</h4>
                        <p className="text-crypto-muted text-sm mb-3">{rule.description}</p>
                        <div className="p-3 bg-crypto-card rounded-lg">
                          <div className="text-crypto-accent text-sm font-medium mb-1">Implementation</div>
                          <p className="text-crypto-text text-sm">{rule.implementation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Warning */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-red-500/10 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-crypto-text flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Important Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-crypto-text text-sm space-y-2">
                  <p>• Congressional trades are disclosed with significant delays (30-45 days)</p>
                  <p>• Past performance does not guarantee future results</p>
                  <p>• Strategy involves concentrated technology sector exposure</p>
                  <p>• Market conditions may have changed since original trade execution</p>
                  <p>• Consider position sizing and diversification in your portfolio</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}