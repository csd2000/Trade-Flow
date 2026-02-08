import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Settings,
  Users,
  Rocket,
  CheckCircle,
  Play,
  ArrowRight,
  Award,
  Activity,
  DollarSign,
  Clock,
  Shield,
  Star,
  Globe,
  Laptop,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StrategyModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  keyPoints: string[];
  practicalSteps: string[];
}

export default function FCIntelligentDecision() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const { toast } = useToast();

  const strategyModules: StrategyModule[] = [
    {
      id: 'market-trend-insights',
      title: 'Market Trend Insights & Intelligence',
      description: 'Master advanced market trend analysis using AI-enhanced data processing and intelligent decision frameworks.',
      duration: '90 minutes',
      difficulty: 'Advanced',
      completed: false,
      keyPoints: [
        'AI-enhanced trend identification algorithms',
        'Data-driven market intelligence gathering',
        'Forward-thinking trend analysis methodologies',
        'Intelligent decision optimization frameworks'
      ],
      practicalSteps: [
        'Set up multi-timeframe market scanning systems',
        'Implement AI-driven trend validation protocols',
        'Deploy intelligent signal filtering mechanisms',
        'Establish real-time market intelligence feeds',
        'Configure automated trend strength assessments'
      ]
    },
    {
      id: 'quantitative-strategy-optimization',
      title: 'Quantitative Strategy Optimization',
      description: 'Deploy cutting-edge quantitative models for superior strategy execution and performance optimization.',
      duration: '120 minutes',
      difficulty: 'Advanced',
      completed: false,
      keyPoints: [
        'Quantitative strategy expertise application',
        'Data-driven strategy refinement protocols',
        'AI-enhanced performance optimization',
        'Institutional-grade execution systems'
      ],
      practicalSteps: [
        'Build quantitative model frameworks',
        'Implement backtesting validation systems',
        'Deploy real-time strategy optimization',
        'Establish performance monitoring protocols',
        'Configure risk-adjusted return calculations'
      ]
    },
    {
      id: 'ai-enhanced-execution',
      title: 'AI-Enhanced Strategy Execution',
      description: 'Leverage artificial intelligence for superior trade execution, timing, and market opportunity identification.',
      duration: '100 minutes',
      difficulty: 'Advanced',
      completed: false,
      keyPoints: [
        'AI-powered execution timing optimization',
        'Deep thinking algorithmic decision making',
        'Efficient execution pathway selection',
        'Knowledge expansion through machine learning'
      ],
      practicalSteps: [
        'Deploy AI execution algorithms',
        'Implement smart order routing systems',
        'Configure adaptive timing mechanisms',
        'Establish learning feedback loops',
        'Optimize execution cost reduction'
      ]
    },
    {
      id: 'future-economic-positioning',
      title: 'Future Economic Landscape Positioning',
      description: 'Position for future economic opportunities using forward-thinking analysis and next-wave trend identification.',
      duration: '110 minutes',
      difficulty: 'Advanced',
      completed: false,
      keyPoints: [
        'Future economic landscape analysis',
        'Next wave trend identification',
        'Forward-thinking positioning strategies',
        'Opportunity seizure methodologies'
      ],
      practicalSteps: [
        'Analyze emerging economic trends',
        'Identify next-wave opportunities',
        'Position for structural changes',
        'Monitor policy and regulatory shifts',
        'Anticipate market evolution patterns'
      ]
    }
  ];

  const handleStartModule = (moduleId: string) => {
    setActiveModule(moduleId);
    toast({
      title: "Module Started!",
      description: "Beginning advanced F&C Intelligent Decision training",
    });
  };

  const handleCompleteModule = (moduleId: string) => {
    setCompletedModules([...completedModules, moduleId]);
    setActiveModule(null);
    toast({
      title: "Module Completed!",
      description: "Advanced strategy module mastered successfully",
    });
  };

  const completionPercentage = (completedModules.length / strategyModules.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">F&C Intelligent Decision Strategy</h1>
            </div>
            <p className="text-xl mb-8 max-w-4xl mx-auto opacity-90">
              Elite quantitative strategy optimization powered by cutting-edge technology, data-driven analysis, 
              and AI-enhanced decision making for institutional-level market performance
            </p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">85-92%</div>
                <div className="text-sm opacity-80">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">AI-Enhanced</div>
                <div className="text-sm opacity-80">Decision Making</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">Elite</div>
                <div className="text-sm opacity-80">Quantitative Focus</div>
              </div>
            </div>
            <Alert className="bg-green-100 border-green-200 text-green-800 max-w-3xl mx-auto">
              <Rocket className="h-4 w-4" />
              <AlertDescription className="font-medium">
                🚀 Elite Strategy: Advanced institutional-grade quantitative system with AI optimization
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="h-5 w-5" />
              Strategy Mastery Progress
            </CardTitle>
            <CardDescription className="text-slate-300">
              Complete all modules to master the F&C Intelligent Decision Strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Overall Progress</span>
                  <span className="text-gray-900">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{strategyModules.length}</div>
                  <div className="text-sm text-slate-200">Total Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{completedModules.length}</div>
                  <div className="text-sm text-slate-200">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{strategyModules.length - completedModules.length}</div>
                  <div className="text-sm text-slate-200">Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">Elite</div>
                  <div className="text-sm text-slate-200">Difficulty</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategyModules.map((module, index) => {
            const isCompleted = completedModules.includes(module.id);
            const isActive = activeModule === module.id;
            
            return (
              <Card key={module.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isActive ? (
                        <Play className="h-5 w-5 text-blue-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-600" />
                      )}
                      <Badge variant="outline" className="bg-red-900 text-red-200 border-red-700">
                        {module.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-slate-200">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{module.duration}</span>
                    </div>
                  </div>
                  <CardTitle className="text-gray-900">{module.title}</CardTitle>
                  <CardDescription className="text-slate-300">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Learning Points:</h4>
                      <ul className="space-y-1">
                        {module.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <ArrowRight className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isActive && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Practical Implementation:</h4>
                        <ul className="space-y-2">
                          {module.practicalSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                              <Target className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => handleCompleteModule(module.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Module
                        </Button>
                      </div>
                    )}

                    {!isCompleted && !isActive && (
                      <Button 
                        onClick={() => handleStartModule(module.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Advanced Module
                      </Button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-2 text-green-400 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Module Mastered
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Strategy Overview */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Award className="h-5 w-5" />
              F&C Business Academy Strategy Overview
            </CardTitle>
            <CardDescription className="text-slate-300">
              Elite quantitative strategy for institutional-level market optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  Core Philosophy
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Cutting-edge technology exploration</li>
                  <li>• Data-driven investment methodology</li>
                  <li>• Quantitative strategy expertise</li>
                  <li>• AI-enhanced strategy refinement</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  Strategic Focus
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Market trend insights</li>
                  <li>• Intelligent decision optimization</li>
                  <li>• Deep thinking methodologies</li>
                  <li>• Efficient execution systems</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-purple-400" />
                  Future Positioning
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Future economic landscape analysis</li>
                  <li>• Next wave trend identification</li>
                  <li>• Forward-thinking leadership</li>
                  <li>• Opportunity seizure optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {completionPercentage === 100 && (
          <Alert className="mt-8 bg-green-900 border-green-700 text-green-200">
            <Award className="h-4 w-4" />
            <AlertDescription className="font-medium">
              🎉 Congratulations! You have mastered the F&C Intelligent Decision Strategy. You now have access to elite quantitative methodologies for institutional-level market optimization.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}