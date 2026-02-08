import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  Target,
  Brain,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Award,
  BarChart3,
  Zap,
  Shield,
  CheckCircle
} from "lucide-react";

interface TradingTechnique {
  id: string;
  technique: string;
  category: string;
  difficulty: string;
  description: string;
  time_frame: string;
  success_rate: string;
  detailed_steps: {
    overview: string;
    preparation_phase?: string[];
    entry_criteria?: string[];
    step_by_step_execution?: Array<{
      step: number;
      action: string;
      details: string;
    }>;
    examples?: Array<{
      stock: string;
      setup: string;
      entry: string;
      stop: string;
      targets: string;
      outcome: string;
    }>;
  };
  risk_management?: {
    position_sizing: string;
    maximum_daily_loss: string;
    correlation_limits: string;
    leverage_rules: string;
  };
}

export default function OliverVelezTechniques() {
  const [techniques, setTechniques] = useState<any>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string>('velez-1');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/oliver_velez_trading_techniques.json")
      .then(res => res.json())
      .then((data) => {
        setTechniques(data.oliver_velez_trading_system);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load Oliver Velez techniques:", err);
        setIsLoading(false);
      });
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'foundation': return Target;
      case 'technical analysis': return BarChart3;
      case 'pattern recognition': return TrendingUp;
      case 'day trading': return Zap;
      case 'trading psychology': return Brain;
      default: return BookOpen;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-crypto-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-crypto-muted">Loading Oliver Velez Trading Techniques...</p>
        </div>
      </div>
    );
  }

  if (!techniques) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-crypto-text mb-2">Failed to load techniques</h3>
          <p className="text-crypto-muted">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const selectedTechniqueData = techniques.trading_techniques.find((t: TradingTechnique) => t.id === selectedTechnique);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-crypto-primary/15 rounded-xl">
              <Award className="w-8 h-8 text-crypto-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">Oliver Velez Trading Techniques</h1>
          </div>
          <p className="text-xl text-crypto-muted max-w-4xl mx-auto mb-6">
            Master the systematic trading approach from Oliver Velez and Pristine Trading. Complete methodologies with step-by-step execution.
          </p>

          {/* Trader Profile */}
          <Card className="crypto-card max-w-4xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-crypto-primary" />
                Trader Profile: Oliver Velez
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-crypto-primary">{techniques.trader_profile.years_experience}</div>
                  <div className="text-crypto-muted text-sm">Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-crypto-tertiary">{techniques.trader_profile.company}</div>
                  <div className="text-crypto-muted text-sm">Company</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-crypto-quaternary">Systematic</div>
                  <div className="text-crypto-muted text-sm">Approach</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-crypto-secondary">5</div>
                  <div className="text-crypto-muted text-sm">Core Techniques</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-crypto-text mb-3">Core Trading Principles:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techniques.core_principles.map((principle: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-crypto-muted">
                      <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Technique List */}
          <div className="lg:col-span-1">
            <Card className="crypto-card sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Trading Techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {techniques.trading_techniques.map((technique: TradingTechnique) => {
                  const IconComponent = getCategoryIcon(technique.category);
                  return (
                    <button
                      key={technique.id}
                      onClick={() => setSelectedTechnique(technique.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedTechnique === technique.id
                          ? 'bg-crypto-primary/10 border border-crypto-primary/20'
                          : 'hover:bg-crypto-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4 text-crypto-primary" />
                        <span className="font-medium text-crypto-text text-sm">{technique.technique}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(technique.difficulty)}>
                          {technique.difficulty}
                        </Badge>
                        <span className="text-crypto-muted text-xs">{technique.time_frame}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Technique Details */}
          <div className="lg:col-span-3">
            {selectedTechniqueData && (
              <Card className="crypto-card">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-2xl text-crypto-text mb-2">
                        {selectedTechniqueData.technique}
                      </CardTitle>
                      <p className="text-crypto-muted">{selectedTechniqueData.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getDifficultyColor(selectedTechniqueData.difficulty)}>
                        {selectedTechniqueData.difficulty}
                      </Badge>
                      <p className="text-crypto-muted text-sm mt-1">{selectedTechniqueData.success_rate} Success Rate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-crypto-surface rounded">
                      <div className="font-semibold text-crypto-text">{selectedTechniqueData.category}</div>
                      <div className="text-crypto-muted text-sm">Category</div>
                    </div>
                    <div className="text-center p-3 bg-crypto-surface rounded">
                      <div className="font-semibold text-crypto-text">{selectedTechniqueData.time_frame}</div>
                      <div className="text-crypto-muted text-sm">Time Frame</div>
                    </div>
                    <div className="text-center p-3 bg-crypto-surface rounded">
                      <div className="font-semibold text-crypto-text">{selectedTechniqueData.success_rate}</div>
                      <div className="text-crypto-muted text-sm">Success Rate</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Overview */}
                  <div>
                    <button
                      onClick={() => toggleSection('overview')}
                      className="flex items-center gap-2 text-crypto-primary font-semibold mb-3 hover:text-crypto-primary/80"
                    >
                      {expandedSections.has('overview') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Overview & Strategy
                    </button>
                    {expandedSections.has('overview') && (
                      <div className="ml-6 space-y-4">
                        <p className="text-crypto-text">{selectedTechniqueData.detailed_steps.overview}</p>
                        
                        {selectedTechniqueData.detailed_steps.preparation_phase && (
                          <div>
                            <h4 className="font-semibold text-crypto-text mb-2">Preparation Phase:</h4>
                            <ul className="space-y-2">
                              {selectedTechniqueData.detailed_steps.preparation_phase.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-crypto-muted">
                                  <div className="w-1.5 h-1.5 bg-crypto-tertiary rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedTechniqueData.detailed_steps.entry_criteria && (
                          <div>
                            <h4 className="font-semibold text-crypto-text mb-2">Entry Criteria:</h4>
                            <ul className="space-y-2">
                              {selectedTechniqueData.detailed_steps.entry_criteria.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-crypto-muted">
                                  <CheckCircle className="w-4 h-4 text-crypto-primary mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step-by-Step Execution */}
                  {selectedTechniqueData.detailed_steps.step_by_step_execution && (
                    <div>
                      <button
                        onClick={() => toggleSection('execution')}
                        className="flex items-center gap-2 text-crypto-primary font-semibold mb-3 hover:text-crypto-primary/80"
                      >
                        {expandedSections.has('execution') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        Step-by-Step Execution
                      </button>
                      {expandedSections.has('execution') && (
                        <div className="ml-6 space-y-4">
                          {selectedTechniqueData.detailed_steps.step_by_step_execution.map((step: any, idx: number) => (
                            <div key={idx} className="border border-crypto-border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-crypto-primary/20 rounded-full flex items-center justify-center">
                                  <span className="text-crypto-primary font-bold text-sm">{step.step}</span>
                                </div>
                                <h4 className="font-semibold text-crypto-text">{step.action}</h4>
                              </div>
                              <p className="text-crypto-muted text-sm ml-11">{step.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Examples */}
                  {selectedTechniqueData.detailed_steps.examples && (
                    <div>
                      <button
                        onClick={() => toggleSection('examples')}
                        className="flex items-center gap-2 text-crypto-primary font-semibold mb-3 hover:text-crypto-primary/80"
                      >
                        {expandedSections.has('examples') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        Real Trading Examples
                      </button>
                      {expandedSections.has('examples') && (
                        <div className="ml-6 space-y-4">
                          {selectedTechniqueData.detailed_steps.examples.map((example: any, idx: number) => (
                            <div key={idx} className="border border-crypto-border rounded-lg p-4 bg-crypto-surface/50">
                              <h4 className="font-semibold text-crypto-text mb-2">{example.stock} - {example.setup}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-crypto-muted">Entry: </span>
                                  <span className="text-crypto-text font-medium">{example.entry}</span>
                                </div>
                                <div>
                                  <span className="text-crypto-muted">Stop: </span>
                                  <span className="text-red-400 font-medium">{example.stop}</span>
                                </div>
                                <div>
                                  <span className="text-crypto-muted">Targets: </span>
                                  <span className="text-crypto-tertiary font-medium">{example.targets}</span>
                                </div>
                                <div>
                                  <span className="text-crypto-muted">Outcome: </span>
                                  <span className="text-crypto-text font-medium">{example.outcome}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Risk Management */}
                  {selectedTechniqueData.risk_management && (
                    <div>
                      <button
                        onClick={() => toggleSection('risk')}
                        className="flex items-center gap-2 text-crypto-primary font-semibold mb-3 hover:text-crypto-primary/80"
                      >
                        {expandedSections.has('risk') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        Risk Management Rules
                      </button>
                      {expandedSections.has('risk') && (
                        <div className="ml-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(selectedTechniqueData.risk_management).map(([key, value]) => (
                              <div key={key} className="p-3 border border-crypto-border rounded">
                                <h5 className="font-semibold text-crypto-text capitalize mb-1">
                                  {key.replace(/_/g, ' ')}
                                </h5>
                                <p className="text-crypto-muted text-sm">{value as string}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Implementation Program */}
        {techniques.implementation_program && (
          <Card className="crypto-card mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-crypto-primary" />
                12-Week Implementation Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(techniques.implementation_program).map(([period, data]: [string, any]) => (
                  <div key={period} className="p-4 border border-crypto-border rounded-lg">
                    <h4 className="font-semibold text-crypto-text mb-2 capitalize">
                      {period.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-crypto-tertiary text-sm font-medium mb-2">{data.focus}</p>
                    <ul className="space-y-1">
                      {data.activities.map((activity: string, idx: number) => (
                        <li key={idx} className="text-crypto-muted text-sm flex items-start gap-2">
                          <div className="w-1 h-1 bg-crypto-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12 py-16">
          <div className="crypto-card-premium max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-crypto-text mb-4">
              Master Professional Trading Techniques
            </h2>
            <p className="text-xl text-crypto-muted mb-8 max-w-2xl mx-auto">
              Follow Oliver Velez's proven systematic approach to trading success. Complete methodology with 25+ years of market experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-primary text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4" onClick={() => window.location.href = '/free-training'}>
                <BookOpen className="w-5 h-5 mr-2" />
                Full Training Academy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}