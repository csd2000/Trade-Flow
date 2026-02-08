import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Filter,
  ExternalLink,
  PlayCircle,
  FileText,
  Shield,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download
} from "lucide-react";

interface PassiveIncomeStrategy {
  id: string;
  name: string;
  slug: string;
  chain: string;
  risk: "Low" | "Medium" | "High";
  roi_range: string;
  platform: string;
  network: string;
  tools: string[];
  steps: string[];
  exit_plan: string[];
  risks: string[];
  video_url?: string;
  guide_url?: string;
  audit_url?: string;
  tags: string[];
  created_at: string;
}

export default function PassiveIncomeTraining() {
  const [strategies, setStrategies] = useState<PassiveIncomeStrategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<PassiveIncomeStrategy[]>([]);
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterROI, setFilterROI] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/passive_income_strategies.json")
      .then(res => res.json())
      .then((data: PassiveIncomeStrategy[]) => {
        setStrategies(data);
        setFilteredStrategies(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load strategies:", err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = strategies.filter((strategy) => {
      const matchesSearch = strategy.name.toLowerCase().includes(search.toLowerCase()) ||
                           strategy.platform.toLowerCase().includes(search.toLowerCase()) ||
                           strategy.chain.toLowerCase().includes(search.toLowerCase());
      
      const matchesRisk = filterRisk ? strategy.risk === filterRisk : true;
      const matchesTag = filterTag ? strategy.tags.includes(filterTag) : true;
      const matchesROI = filterROI ? strategy.roi_range.includes(filterROI) : true;
      
      return matchesSearch && matchesRisk && matchesTag && matchesROI;
    });
    
    setFilteredStrategies(filtered);
  }, [search, filterRisk, filterTag, filterROI, strategies]);

  const uniqueTags = Array.from(new Set(strategies.flatMap(s => s.tags)));
  const riskLevels = ["Low", "Medium", "High"];
  const roiOptions = ["3", "5", "10", "15", "20", "30"];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'High': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(strategies, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'passive_income_strategies.json';
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-crypto-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-crypto-muted">Loading passive income strategies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-crypto-primary/15 rounded-xl">
              <DollarSign className="w-8 h-8 text-crypto-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">Passive Income Training</h1>
          </div>
          <p className="text-xl text-crypto-muted max-w-4xl mx-auto mb-6">
            Learn step-by-step how to earn yield with proven DeFi strategies. Complete guides with risks, exit plans, and tools - completely FREE.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-primary mb-1">{strategies.length}</div>
                <div className="text-crypto-muted text-sm">Strategies</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-tertiary mb-1">7</div>
                <div className="text-crypto-muted text-sm">Networks</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-quaternary mb-1">3-120%</div>
                <div className="text-crypto-muted text-sm">APY Range</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-secondary mb-1">100%</div>
                <div className="text-crypto-muted text-sm">Free Access</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-crypto-primary" />
              Search & Filter Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crypto-muted" />
                  <Input
                    type="text"
                    placeholder="Search strategies, platforms, chains..."
                    className="pl-10 bg-crypto-surface border-crypto-border text-crypto-text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <select 
                className="bg-crypto-surface border border-crypto-border rounded-md px-3 py-2 text-crypto-text" 
                value={filterRisk} 
                onChange={e => setFilterRisk(e.target.value)}
              >
                <option value="">All Risk Levels</option>
                {riskLevels.map(r => <option key={r} value={r}>{r} Risk</option>)}
              </select>

              <select 
                className="bg-crypto-surface border border-crypto-border rounded-md px-3 py-2 text-crypto-text" 
                value={filterTag} 
                onChange={e => setFilterTag(e.target.value)}
              >
                <option value="">All Types</option>
                {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select 
                className="bg-crypto-surface border border-crypto-border rounded-md px-3 py-2 text-crypto-text" 
                value={filterROI} 
                onChange={e => setFilterROI(e.target.value)}
              >
                <option value="">All ROI</option>
                {roiOptions.map(r => <option key={r} value={r}>{`≥ ${r}%`}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-crypto-muted text-sm">
                Showing {filteredStrategies.length} of {strategies.length} strategies
              </p>
              <Button 
                onClick={downloadJSON}
                className="btn-secondary text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStrategies.map((strategy) => (
            <Card key={strategy.id} className="crypto-card hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <CardTitle className="text-xl text-crypto-text mb-2">{strategy.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getRiskColor(strategy.risk)}>
                        {strategy.risk} Risk
                      </Badge>
                      <Badge className="bg-crypto-primary/10 text-crypto-primary">
                        {strategy.roi_range}
                      </Badge>
                      <Badge className="bg-crypto-surface text-crypto-text-subtle">
                        {strategy.chain}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-crypto-text font-semibold">{strategy.platform}</p>
                    <p className="text-crypto-muted text-sm">{strategy.network}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Tools Required */}
                <div>
                  <h4 className="font-semibold text-crypto-text mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Tools Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.tools.map((tool, idx) => (
                      <span key={idx} className="px-2 py-1 bg-crypto-surface rounded text-crypto-text text-sm">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Guide */}
                <details className="group">
                  <summary className="cursor-pointer text-crypto-primary font-medium flex items-center gap-2 hover:text-crypto-primary/80">
                    <CheckCircle className="w-4 h-4" />
                    Step-by-Step Guide
                    <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 ml-6">
                    <ol className="list-decimal space-y-2">
                      {strategy.steps.map((step, idx) => (
                        <li key={idx} className="text-crypto-text text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </details>

                {/* Exit Strategy */}
                <details className="group">
                  <summary className="cursor-pointer text-crypto-tertiary font-medium flex items-center gap-2 hover:text-crypto-tertiary/80">
                    <TrendingUp className="w-4 h-4" />
                    Exit Strategy
                    <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 ml-6">
                    <ol className="list-decimal space-y-2">
                      {strategy.exit_plan.map((step, idx) => (
                        <li key={idx} className="text-crypto-text text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </details>

                {/* Risk Analysis */}
                <details className="group">
                  <summary className="cursor-pointer text-red-400 font-medium flex items-center gap-2 hover:text-red-400/80">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Analysis
                    <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 ml-6">
                    <ul className="list-disc space-y-2">
                      {strategy.risks.map((risk, idx) => (
                        <li key={idx} className="text-crypto-text text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                </details>

                {/* Resource Links */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-crypto-border">
                  {strategy.video_url && (
                    <a 
                      href={strategy.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-crypto-primary hover:text-crypto-primary/80 text-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Video Tutorial
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {strategy.guide_url && (
                    <a 
                      href={strategy.guide_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-crypto-tertiary hover:text-crypto-tertiary/80 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Documentation
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {strategy.audit_url && (
                    <a 
                      href={strategy.audit_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-crypto-quaternary hover:text-crypto-quaternary/80 text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Security Audit
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {strategy.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-crypto-primary/10 text-crypto-primary rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStrategies.length === 0 && (
          <Card className="crypto-card text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-crypto-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-crypto-text mb-2">No strategies found</h3>
              <p className="text-crypto-muted">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12 py-16">
          <div className="crypto-card-premium max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-crypto-text mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-crypto-muted mb-8 max-w-2xl mx-auto">
              Choose a strategy that matches your risk tolerance and start earning passive income today. All guides are completely free and include step-by-step instructions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-primary text-lg px-8 py-4" onClick={() => window.scrollTo(0, 0)}>
                <TrendingUp className="w-5 h-5 mr-2" />
                Browse Strategies
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4" onClick={() => window.location.href = '/free-training'}>
                <Clock className="w-5 h-5 mr-2" />
                Full Training Academy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}