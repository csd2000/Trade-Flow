import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  X,
  Target,
  Search,
  TrendingUp,
  Users,
  Lock,
  Globe,
  Code,
  DollarSign,
  Clock
} from "lucide-react";

interface SafetyRule {
  id: number;
  title: string;
  description: string;
  importance: 'critical' | 'high' | 'medium';
  category: 'technical' | 'economic' | 'social' | 'security';
  checkPoints: string[];
  redFlags: string[];
}

interface ProtocolAnalysis {
  name: string;
  safetyScore: number;
  passedRules: number;
  totalRules: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export default function DeFiSafetySystem() {
  const [selectedRule, setSelectedRule] = useState<number>(1);
  const [analysisResults, setAnalysisResults] = useState<ProtocolAnalysis[]>([]);

  const safetyRules: SafetyRule[] = [
    {
      id: 1,
      title: "Protocol Audit Verification",
      description: "Ensure the protocol has been audited by reputable security firms",
      importance: 'critical',
      category: 'security',
      checkPoints: [
        "Multiple audits from different firms (Certik, ConsenSys, Trail of Bits)",
        "Recent audits (within last 6 months)",
        "Public audit reports available",
        "No critical vulnerabilities found"
      ],
      redFlags: [
        "No audits or only self-audits",
        "Audits older than 12 months",
        "Critical vulnerabilities not addressed",
        "Anonymous audit firms"
      ]
    },
    {
      id: 2,
      title: "Team Transparency & Doxxing",
      description: "Verify the team is public and has relevant experience",
      importance: 'critical',
      category: 'social',
      checkPoints: [
        "Team members publicly known (doxxed)",
        "LinkedIn profiles with crypto/DeFi experience",
        "Previous successful projects",
        "Active communication with community"
      ],
      redFlags: [
        "Anonymous team members",
        "No prior DeFi experience",
        "Recently created social profiles",
        "Evasive about team details"
      ]
    },
    {
      id: 3,
      title: "Total Value Locked (TVL) Analysis",
      description: "Assess the protocol's TVL trends and sustainability",
      importance: 'high',
      category: 'economic',
      checkPoints: [
        "TVL above $10M for stability",
        "Steady or growing TVL over 3+ months",
        "Diverse asset composition",
        "Reasonable TVL to market cap ratio"
      ],
      redFlags: [
        "TVL under $1M (too small)",
        "Rapidly declining TVL",
        "Single asset dominance (>80%)",
        "Artificial TVL inflation"
      ]
    },
    {
      id: 4,
      title: "Smart Contract Immutability",
      description: "Check if contracts can be upgraded and who controls them",
      importance: 'critical',
      category: 'technical',
      checkPoints: [
        "Contracts are immutable or have timelock",
        "Multi-sig control (3+ signatures required)",
        "Transparent governance process",
        "Emergency pause mechanisms clearly defined"
      ],
      redFlags: [
        "Single person can upgrade contracts",
        "No timelock on upgrades",
        "Unclear governance structure",
        "Unlimited admin privileges"
      ]
    },
    {
      id: 5,
      title: "Yield Sustainability Analysis",
      description: "Verify that yield rates are economically sustainable",
      importance: 'high',
      category: 'economic',
      checkPoints: [
        "Yield rates under 50% APY for established assets",
        "Clear revenue model (fees, trading, etc)",
        "Yield decreases as TVL increases (natural economics)",
        "No reliance on token inflation for yields"
      ],
      redFlags: [
        "Yields over 100% APY consistently",
        "No clear revenue source",
        "Yields increase with TVL (Ponzi-like)",
        "Heavy token emission dependence"
      ]
    },
    {
      id: 6,
      title: "Liquidity Assessment",
      description: "Ensure sufficient liquidity for your position size",
      importance: 'high',
      category: 'economic',
      checkPoints: [
        "Daily volume > 10x your position size",
        "Multiple liquidity sources (DEXs, CEXs)",
        "Stable bid-ask spreads (<1%)",
        "Deep order book on major pairs"
      ],
      redFlags: [
        "Low daily volume",
        "Single liquidity source",
        "Wide bid-ask spreads (>5%)",
        "Illiquid token pairs"
      ]
    },
    {
      id: 7,
      title: "Token Economics (Tokenomics)",
      description: "Analyze the token distribution and inflation schedule",
      importance: 'medium',
      category: 'economic',
      checkPoints: [
        "Fair token distribution (no single holder >10%)",
        "Locked team tokens with vesting",
        "Reasonable inflation rate (<20% annually)",
        "Clear utility for the token"
      ],
      redFlags: [
        "Team holds majority of tokens",
        "No vesting schedule",
        "Excessive inflation (>50% annually)",
        "No clear token utility"
      ]
    },
    {
      id: 8,
      title: "Oracle Price Feed Security",
      description: "Verify reliable and manipulation-resistant price feeds",
      importance: 'high',
      category: 'technical',
      checkPoints: [
        "Multiple oracle providers (Chainlink, Band, etc)",
        "Price aggregation from multiple sources",
        "Time-weighted average prices (TWAP)",
        "Circuit breakers for extreme price moves"
      ],
      redFlags: [
        "Single oracle dependency",
        "Easily manipulated price feeds",
        "No price deviation protections",
        "Custom oracle without track record"
      ]
    },
    {
      id: 9,
      title: "Governance Token Distribution",
      description: "Assess centralization risks in protocol governance",
      importance: 'medium',
      category: 'social',
      checkPoints: [
        "Governance tokens widely distributed",
        "Active community participation in votes",
        "Proposal threshold requirements",
        "Timelock on governance execution"
      ],
      redFlags: [
        "Few holders control majority of votes",
        "Low community participation",
        "No proposal requirements",
        "Instant governance execution"
      ]
    },
    {
      id: 10,
      title: "Protocol Track Record",
      description: "Evaluate the protocol's operational history and incidents",
      importance: 'high',
      category: 'social',
      checkPoints: [
        "Operating for 6+ months without major issues",
        "No history of exploits or hacks",
        "Transparent incident response",
        "Regular security updates"
      ],
      redFlags: [
        "Recently launched (<3 months)",
        "History of exploits or hacks",
        "Poor incident communication",
        "Infrequent security updates"
      ]
    },
    {
      id: 11,
      title: "Exit Strategy Planning",
      description: "Ensure you can exit your position quickly if needed",
      importance: 'high',
      category: 'economic',
      checkPoints: [
        "No lock-up periods or reasonable duration",
        "Instant or quick withdrawal process",
        "Multiple exit routes available",
        "Emergency withdrawal mechanisms"
      ],
      redFlags: [
        "Long lock-up periods (>30 days)",
        "Complex exit procedures",
        "Single exit route",
        "No emergency exit options"
      ]
    }
  ];

  const mockProtocols: ProtocolAnalysis[] = [
    {
      name: "Aave",
      safetyScore: 95,
      passedRules: 10,
      totalRules: 11,
      riskLevel: 'low',
      recommendations: ["Excellent for beginners", "Strong track record", "Well audited"]
    },
    {
      name: "Compound",
      safetyScore: 92,
      passedRules: 10,
      totalRules: 11,
      riskLevel: 'low',
      recommendations: ["Proven lending protocol", "Good liquidity", "Transparent governance"]
    },
    {
      name: "Uniswap V3",
      safetyScore: 88,
      passedRules: 9,
      totalRules: 11,
      riskLevel: 'medium',
      recommendations: ["Good for LP strategies", "Watch impermanent loss", "High volume pairs only"]
    },
    {
      name: "SushiSwap",
      safetyScore: 78,
      passedRules: 8,
      totalRules: 11,
      riskLevel: 'medium',
      recommendations: ["Moderate risk", "Check pool TVL", "Monitor governance closely"]
    }
  ];

  const getImportanceColor = (importance: SafetyRule['importance']) => {
    switch (importance) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-crypto-quaternary';
      case 'medium': return 'text-crypto-muted';
    }
  };

  const getImportanceBadge = (importance: SafetyRule['importance']) => {
    switch (importance) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-secondary';
    }
  };

  const getCategoryIcon = (category: SafetyRule['category']) => {
    switch (category) {
      case 'technical': return Code;
      case 'economic': return DollarSign;
      case 'social': return Users;
      case 'security': return Shield;
    }
  };

  const getRiskColor = (risk: ProtocolAnalysis['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-crypto-tertiary';
      case 'medium': return 'text-crypto-quaternary';
      case 'high': return 'text-red-400';
    }
  };

  const selectedRuleData = safetyRules.find(rule => rule.id === selectedRule);

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="DeFi Safety System"
        subtitle="The 11 Laws to Protect Your Funds in Any Market"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gradient mb-2">11</div>
              <div className="text-crypto-text font-semibold mb-1">Safety Laws</div>
              <div className="text-crypto-muted text-sm">Comprehensive protection</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-tertiary mb-2">95%</div>
              <div className="text-crypto-text font-semibold mb-1">Success Rate</div>
              <div className="text-crypto-muted text-sm">Avoid protocol failures</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-primary mb-2">6-10%</div>
              <div className="text-crypto-text font-semibold mb-1">Safe APY</div>
              <div className="text-crypto-muted text-sm">Sustainable returns</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-quaternary mb-2">24/7</div>
              <div className="text-crypto-text font-semibold mb-1">Protection</div>
              <div className="text-crypto-muted text-sm">Automated monitoring</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Safety Rules List */}
          <div className="lg:col-span-1">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
                  <Shield className="w-6 h-6 text-crypto-primary" />
                  Safety Laws
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safetyRules.map((rule) => {
                    const Icon = getCategoryIcon(rule.category);
                    return (
                      <button
                        key={rule.id}
                        onClick={() => setSelectedRule(rule.id)}
                        className={`w-full p-4 text-left rounded-lg border transition-all ${
                          selectedRule === rule.id
                            ? 'border-crypto-primary bg-crypto-primary/10'
                            : 'border-crypto-border bg-crypto-surface hover:border-crypto-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-crypto-secondary" />
                            <span className="font-semibold text-crypto-text text-sm">
                              Law #{rule.id}
                            </span>
                          </div>
                          <Badge className={getImportanceBadge(rule.importance)}>
                            {rule.importance}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-crypto-text text-sm mb-1">
                          {rule.title}
                        </h4>
                        <p className="text-crypto-muted text-xs">
                          {rule.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Rule Details */}
          <div className="lg:col-span-2">
            {selectedRuleData && (
              <Card className="crypto-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          selectedRuleData.importance === 'critical' ? 'bg-red-500/15' :
                          selectedRuleData.importance === 'high' ? 'bg-crypto-quaternary/15' :
                          'bg-crypto-muted/15'
                        }`}>
                          {(() => {
                            const Icon = getCategoryIcon(selectedRuleData.category);
                            return <Icon className={`w-5 h-5 ${getImportanceColor(selectedRuleData.importance)}`} />;
                          })()}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-crypto-text">
                            Law #{selectedRuleData.id}: {selectedRuleData.title}
                          </CardTitle>
                          <p className="text-crypto-muted">{selectedRuleData.description}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={getImportanceBadge(selectedRuleData.importance)}>
                      {selectedRuleData.importance} Priority
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Check Points */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-crypto-text flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-crypto-tertiary" />
                      What to Look For
                    </h4>
                    <div className="space-y-3">
                      {selectedRuleData.checkPoints.map((point, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary mt-0.5 flex-shrink-0" />
                          <span className="text-crypto-muted text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red Flags */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-crypto-text flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Red Flags to Avoid
                    </h4>
                    <div className="space-y-3">
                      {selectedRuleData.redFlags.map((flag, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-crypto-muted text-sm">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Protocol Analysis Results */}
        <Card className="crypto-card mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
              <Search className="w-6 h-6 text-crypto-primary" />
              Protocol Safety Analysis
            </CardTitle>
            <p className="text-crypto-muted">
              Pre-analyzed protocols using our 11-point safety system
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProtocols.map((protocol, index) => (
                <Card key={index} className="crypto-card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-crypto-text mb-1">
                          {protocol.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-crypto-muted text-sm">
                            {protocol.passedRules}/{protocol.totalRules} rules passed
                          </span>
                          <Badge className={
                            protocol.riskLevel === 'low' ? 'badge-success' :
                            protocol.riskLevel === 'medium' ? 'badge-warning' : 'badge-danger'
                          }>
                            {protocol.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          protocol.safetyScore >= 90 ? 'text-crypto-tertiary' :
                          protocol.safetyScore >= 80 ? 'text-crypto-quaternary' : 'text-red-400'
                        }`}>
                          {protocol.safetyScore}%
                        </div>
                        <div className="text-crypto-muted text-sm">Safety Score</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Progress value={protocol.safetyScore} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-crypto-text text-sm">Recommendations:</h4>
                      {protocol.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-crypto-muted text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        <div className="text-center mt-12 p-8 bg-crypto-card rounded-2xl border border-crypto-primary/20">
          <h2 className="text-3xl font-bold text-crypto-text mb-4">
            Never Fall for Scam Projects Again
          </h2>
          <p className="text-crypto-muted mb-6 max-w-2xl mx-auto">
            Use our proven 11-point safety system to protect your funds and identify legitimate 
            yield opportunities with confidence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-crypto-tertiary mb-2">$0</div>
              <div className="text-crypto-muted text-sm">Lost to scams using our system</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crypto-primary mb-2">95%</div>
              <div className="text-crypto-muted text-sm">Success rate in identifying safe protocols</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crypto-quaternary mb-2">6-10%</div>
              <div className="text-crypto-muted text-sm">Average APY from vetted protocols</div>
            </div>
          </div>

          <Button className="btn-primary text-lg px-8 py-4">
            <Shield className="w-5 h-5 mr-2" />
            Start Using the Safety System
          </Button>
        </div>
      </div>
    </div>
  );
}