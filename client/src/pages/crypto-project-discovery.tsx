import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Target,
  Zap,
  Rocket,
  Eye,
  DollarSign,
  Calendar,
  Users,
  Globe,
  Search,
  Filter,
  BarChart3,
  LineChart,
  Layers
} from "lucide-react";

interface CryptoProject {
  id: number;
  name: string;
  symbol: string;
  category: string;
  stage: 'presale' | 'ido' | 'launching' | 'live';
  marketCap: number;
  priceChange: number;
  useCase: string;
  description: string;
  fundamentalScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  launchDate: string;
  exchanges: string[];
  features: string[];
}

interface Launchpad {
  id: number;
  name: string;
  avgROI: string;
  projects: number;
  successRate: number;
  tvl: string;
  network: string;
  requirements: string[];
  description: string;
  rating: number;
}

export default function CryptoProjectDiscovery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [minScore, setMinScore] = useState(0);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<CryptoProject[]>({
    queryKey: ['/api/crypto-projects'],
  });

  const { data: launchpads = [], isLoading: launchpadsLoading } = useQuery<Launchpad[]>({
    queryKey: ['/api/launchpads'],
  });

  const categories = [
    { id: 'all', name: 'All Categories', count: projects.length },
    { id: 'AI & DePIN', name: 'AI & DePIN', count: projects.filter(p => p.category === 'AI & DePIN').length },
    { id: 'AI Infrastructure', name: 'AI Infrastructure', count: projects.filter(p => p.category === 'AI Infrastructure').length },
    { id: 'DePIN Storage', name: 'DePIN Storage', count: projects.filter(p => p.category === 'DePIN Storage').length },
    { id: 'DeFi', name: 'DeFi', count: projects.filter(p => p.category === 'DeFi').length },
    { id: 'Gaming', name: 'Gaming', count: projects.filter(p => p.category === 'Gaming').length },
    { id: 'Infrastructure', name: 'Infrastructure', count: projects.filter(p => p.category === 'Infrastructure').length }
  ];

  const stages = [
    { id: 'all', name: 'All Stages' },
    { id: 'presale', name: 'Presale' },
    { id: 'ido', name: 'IDO' },
    { id: 'launching', name: 'Launching' },
    { id: 'live', name: 'Live' }
  ];

  const filteredProjects = projects.filter(project => {
    const categoryMatch = selectedCategory === 'all' || project.category === selectedCategory;
    const stageMatch = selectedStage === 'all' || project.stage === selectedStage;
    const scoreMatch = project.fundamentalScore >= minScore;
    return categoryMatch && stageMatch && scoreMatch;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-crypto-tertiary';
      case 'medium': return 'text-crypto-quaternary';
      case 'high': return 'text-red-400';
      default: return 'text-crypto-text';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'presale': return 'badge-primary';
      case 'ido': return 'badge-warning';
      case 'launching': return 'badge-success';
      case 'live': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-crypto-tertiary';
    if (score >= 75) return 'text-crypto-quaternary';
    if (score >= 60) return 'text-crypto-primary';
    return 'text-red-400';
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(1)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(0)}M`;
    if (marketCap > 0) return `$${marketCap.toLocaleString()}`;
    return 'TBA';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (projectsLoading || launchpadsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          title="Project Discovery"
          subtitle="Find strong crypto projects before major exchange listings"
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="crypto-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-crypto-surface rounded mb-4"></div>
                  <div className="h-4 bg-crypto-surface rounded mb-2"></div>
                  <div className="h-4 bg-crypto-surface rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Crypto Project Discovery"
        subtitle="Find strong crypto projects before major exchange listings with advanced fundamental analysis"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gradient mb-2">95%</div>
              <div className="text-crypto-text font-semibold mb-1">Success Rate</div>
              <div className="text-crypto-muted text-sm">Top-rated projects</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-tertiary mb-2">Early</div>
              <div className="text-crypto-text font-semibold mb-1">Discovery</div>
              <div className="text-crypto-muted text-sm">Before listings</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-primary mb-2">24/7</div>
              <div className="text-crypto-text font-semibold mb-1">Monitoring</div>
              <div className="text-crypto-muted text-sm">Real-time updates</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-quaternary mb-2">AI</div>
              <div className="text-crypto-text font-semibold mb-1">Powered</div>
              <div className="text-crypto-muted text-sm">Analysis tools</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">New Projects</TabsTrigger>
            <TabsTrigger value="launchpads">Launchpads</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Tools</TabsTrigger>
            <TabsTrigger value="alerts">Project Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* Filters */}
            <Card className="crypto-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Filter by Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className={`${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                          {category.name} ({category.count})
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Project Stage</h3>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage) => (
                        <Button
                          key={stage.id}
                          onClick={() => setSelectedStage(stage.id)}
                          variant={selectedStage === stage.id ? "default" : "ghost"}
                          className={`${selectedStage === stage.id ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                          {stage.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Min Score: {minScore}</h3>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full h-2 bg-crypto-surface rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="crypto-card-premium hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-crypto-text mb-2">
                          {project.name} ({project.symbol})
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStageBadge(project.stage)}>
                            {project.stage}
                          </Badge>
                          <Badge className={getRiskBadge(project.riskLevel)}>
                            {project.riskLevel} risk
                          </Badge>
                          <Badge className="badge-secondary">{project.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(project.fundamentalScore)} mb-1`}>
                          {project.fundamentalScore}
                        </div>
                        <div className="text-crypto-muted text-sm">Score</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-crypto-muted text-sm">{project.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-crypto-muted text-sm">Market Cap</div>
                        <div className="font-semibold text-crypto-text">{formatMarketCap(project.marketCap)}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Launch Date</div>
                        <div className="font-semibold text-crypto-text">{formatDate(project.launchDate)}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Price Change</div>
                        <div className={`font-semibold ${project.priceChange >= 0 ? 'text-crypto-tertiary' : 'text-red-400'}`}>
                          {project.priceChange > 0 ? '+' : ''}{project.priceChange}%
                        </div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Use Case</div>
                        <div className="font-semibold text-crypto-text">{project.useCase}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-crypto-text text-sm">Key Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.features.map((feature, i) => (
                          <Badge key={i} className="badge-secondary text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-crypto-text text-sm">Exchanges</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.exchanges.map((exchange, i) => (
                          <Badge key={i} className="badge-primary text-xs">
                            {exchange}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-crypto-muted">Fundamental Score</span>
                        <span className={getScoreColor(project.fundamentalScore)}>
                          {project.fundamentalScore >= 90 ? 'Excellent' : 
                           project.fundamentalScore >= 75 ? 'Very Good' : 
                           project.fundamentalScore >= 60 ? 'Good' : 'Moderate'}
                        </span>
                      </div>
                      <Progress value={project.fundamentalScore} className="h-2" />
                    </div>

                    <div className="flex space-x-2">
                      <Button className="btn-primary flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button className="btn-secondary">
                        <Star className="w-4 h-4 mr-2" />
                        Watchlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="launchpads" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Top Crypto Launchpads
                </CardTitle>
                <p className="text-crypto-muted">
                  Access the best IDO platforms with highest success rates and ROI
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {launchpads.map((launchpad) => (
                  <Card key={launchpad.id} className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-crypto-text">{launchpad.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-crypto-quaternary fill-current" />
                          <span className="text-crypto-text font-semibold">{launchpad.rating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Avg ROI</span>
                          <span className="text-crypto-primary font-semibold">{launchpad.avgROI}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Projects</span>
                          <span className="text-crypto-text font-semibold">{launchpad.projects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Success Rate</span>
                          <span className="text-crypto-tertiary font-semibold">{launchpad.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">TVL</span>
                          <span className="text-crypto-text font-semibold">{launchpad.tvl}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Network</span>
                          <span className="text-crypto-text font-semibold">{launchpad.network}</span>
                        </div>
                      </div>

                      <p className="text-crypto-muted text-sm mb-4">{launchpad.description}</p>

                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-crypto-text text-sm">Requirements</h4>
                        <div className="space-y-1">
                          {launchpad.requirements.map((req, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-crypto-tertiary" />
                              <span className="text-crypto-muted text-xs">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-crypto-muted">Performance Rating</span>
                          <span className={getScoreColor(launchpad.rating * 10)}>
                            {launchpad.rating >= 9 ? 'Excellent' : 
                             launchpad.rating >= 8 ? 'Very Good' : 'Good'}
                          </span>
                        </div>
                        <Progress value={launchpad.rating * 10} className="h-2" />
                      </div>

                      <Button className="btn-primary w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Launchpad
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Advanced Analysis Tools
                </CardTitle>
                <p className="text-crypto-muted">
                  Professional-grade tools for comprehensive project evaluation
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-primary/15 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-crypto-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Fundamental Scanner</h3>
                          <p className="text-crypto-muted text-sm">AI-powered analysis</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Comprehensive fundamental analysis including team, technology, tokenomics, and market positioning.
                      </p>
                      <Button className="btn-primary w-full">
                        <Search className="w-4 h-4 mr-2" />
                        Run Scanner
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-tertiary/15 rounded-lg flex items-center justify-center">
                          <LineChart className="w-6 h-6 text-crypto-tertiary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Technical Analysis</h3>
                          <p className="text-crypto-muted text-sm">Chart patterns & trends</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Advanced technical analysis with support/resistance levels, trend identification, and momentum indicators.
                      </p>
                      <Button className="btn-secondary w-full">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Analyze Charts
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-quaternary/15 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-crypto-quaternary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Risk Assessment</h3>
                          <p className="text-crypto-muted text-sm">Safety evaluation</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Comprehensive risk evaluation using our 11-point safety framework that predicted major failures.
                      </p>
                      <Button className="btn-secondary w-full">
                        <Shield className="w-4 h-4 mr-2" />
                        Assess Risk
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-crypto-card rounded-lg">
                  <h3 className="text-lg font-bold text-crypto-text mb-4">
                    Analysis Framework
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-crypto-text">Fundamental Factors</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Team background & experience</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Technology innovation & scalability</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Tokenomics & distribution</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Market size & competition</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Partnerships & backing</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-crypto-text">Technical Indicators</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Price action & volume analysis</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Support & resistance levels</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Trend identification</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Momentum oscillators</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-muted text-sm">Risk/reward ratios</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Project Alert System
                </CardTitle>
                <p className="text-crypto-muted">
                  Stay ahead with real-time notifications for new opportunities
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-primary/15 rounded-lg flex items-center justify-center">
                          <Rocket className="w-6 h-6 text-crypto-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">New Project Alerts</h3>
                          <p className="text-crypto-muted text-sm">Real-time discovery</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Get instant notifications when new high-potential projects are discovered and analyzed.
                      </p>
                      <div className="space-y-2 mb-4">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-crypto-text text-sm">AI & DePIN projects</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-crypto-text text-sm">Score above 85</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-crypto-text text-sm">Presale stage only</span>
                        </label>
                      </div>
                      <Button className="btn-primary w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Enable Alerts
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-tertiary/15 rounded-lg flex items-center justify-center">
                          <Globe className="w-6 h-6 text-crypto-tertiary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Exchange Listings</h3>
                          <p className="text-crypto-muted text-sm">Early announcements</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Receive alerts for upcoming exchange listings and trading announcements.
                      </p>
                      <div className="space-y-2 mb-4">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-crypto-text text-sm">Binance listings</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-crypto-text text-sm">Coinbase listings</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-crypto-text text-sm">All tier-1 exchanges</span>
                        </label>
                      </div>
                      <Button className="btn-secondary w-full">
                        <Globe className="w-4 h-4 mr-2" />
                        Configure Alerts
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-gradient-to-r from-crypto-primary/10 to-crypto-tertiary/10 rounded-lg border border-crypto-primary/20">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-crypto-text mb-2">
                      Never Miss an Opportunity
                    </h3>
                    <p className="text-crypto-muted mb-4">
                      Our AI-powered system monitors thousands of projects 24/7 to find the next big opportunities
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crypto-primary">1000+</div>
                        <div className="text-crypto-muted text-sm">Projects Tracked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crypto-tertiary">24/7</div>
                        <div className="text-crypto-muted text-sm">Monitoring</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crypto-quaternary">&lt;5min</div>
                        <div className="text-crypto-muted text-sm">Alert Speed</div>
                      </div>
                    </div>
                    <Button className="btn-primary text-lg px-8">
                      <Target className="w-5 h-5 mr-2" />
                      Start Tracking
                    </Button>
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