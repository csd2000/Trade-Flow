import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyCardSwipeable } from "@/components/mobile/strategy-card-swipeable";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Target,
  DollarSign,
  Clock,
  AlertTriangle,
  BookOpen,
  Play,
  Heart,
  Share,
  Eye
} from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  category: string;
  apy: string;
  risk: 'Low' | 'Medium' | 'High';
  protocols: string[];
  description: string;
  tvl: string;
  timeCommitment: string;
}

interface StrategyStep {
  id: number;
  title: string;
  description: string;
  action: string;
  completed: boolean;
  proTip?: string;
}

export default function StrategyBuilderMobile() {
  const [selectedStrategyType, setSelectedStrategyType] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [favoriteStrategies, setFavoriteStrategies] = useState<string[]>([]);

  const strategyTypes = [
    {
      id: 'conservative',
      name: 'Conservative Income',
      subtitle: 'Stable Returns, Low Risk',
      apy: '3-8% APY',
      risk: 'Low',
      icon: <Shield className="w-8 h-8 text-green-400" />,
      description: 'Focus on stable lending protocols with proven track records',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'balanced',
      name: 'Balanced Growth',
      subtitle: 'Moderate Risk, Higher Returns',
      apy: '8-15% APY',
      risk: 'Medium',
      icon: <Target className="w-8 h-8 text-blue-400" />,
      description: 'Balanced approach with yield farming and liquidity provision',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'aggressive',
      name: 'Aggressive High-Yield',
      subtitle: 'High Risk, Maximum Returns',
      apy: '15-50%+ APY',
      risk: 'High',
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      description: 'Advanced strategies for experienced DeFi users',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30'
    }
  ];

  const conservativeSteps: StrategyStep[] = [
    {
      id: 1,
      title: 'Choose Stable Lending Platform',
      description: 'Start with established protocols like Aave or Compound for USDC/USDT lending',
      action: 'Connect to Aave and deposit 70% of capital in USDC',
      completed: false,
      proTip: 'Start with blue-chip stablecoins for the lowest risk exposure'
    },
    {
      id: 2,
      title: 'Diversify Across Protocols',
      description: 'Split remaining funds between 2-3 proven lending protocols',
      action: 'Allocate 20% to lending protocol, 10% to stable protocol',
      completed: false,
      proTip: 'Never put all funds in one protocol, even the safest ones'
    },
    {
      id: 3,
      title: 'Set Up Yield Monitoring',
      description: 'Track APY changes and protocol health metrics',
      action: 'Enable notifications for APY drops below 3%',
      completed: false,
      proTip: 'Rates change frequently - stay informed to maximize returns'
    },
    {
      id: 4,
      title: 'Plan Exit Strategy',
      description: 'Define conditions for withdrawing or reallocating funds',
      action: 'Set profit-taking rules and risk limits',
      completed: false,
      proTip: 'Always have an exit plan before you need it'
    }
  ];

  const balancedSteps: StrategyStep[] = [
    {
      id: 1,
      title: 'Core Stable Foundation',
      description: 'Allocate 50% to stable lending (USDC/USDT on major platforms)',
      action: 'Deposit 50% in stable lending for 4-6% stable yield',
      completed: false,
      proTip: 'This foundation provides steady income while you optimize the rest'
    },
    {
      id: 2,
      title: 'Add Yield Farming',
      description: 'Use 30% for liquidity pools on major DEX platforms',
      action: 'Provide USDC-USDT LP on stable pools for 8-12% APY',
      completed: false,
      proTip: 'Curve pools with similar assets have lower impermanent loss risk'
    },
    {
      id: 3,
      title: 'Growth Opportunities',
      description: 'Allocate remaining 20% to higher-yield opportunities',
      action: 'Stake in proven yield optimization strategies',
      completed: false,
      proTip: 'Research vault strategies and only use protocols with strong track records'
    },
    {
      id: 4,
      title: 'Active Management',
      description: 'Monitor and rebalance monthly based on performance',
      action: 'Set up monthly review and rebalancing schedule',
      completed: false,
      proTip: 'Successful DeFi requires active monitoring and occasional rebalancing'
    }
  ];

  const aggressiveSteps: StrategyStep[] = [
    {
      id: 1,
      title: 'Advanced Yield Farming',
      description: 'Target high-APY farms on emerging protocols (30-50% allocation)',
      action: 'Research and enter 2-3 high-yield farms with proper due diligence',
      completed: false,
      proTip: 'High yields often come with high risks - never invest more than you can lose'
    },
    {
      id: 2,
      title: 'Leveraged Positions',
      description: 'Use borrowing to amplify returns on stable positions',
      action: 'Borrow against ETH to farm additional yield (max 2x leverage)',
      completed: false,
      proTip: 'Leverage amplifies both gains and losses - start small and learn'
    },
    {
      id: 3,
      title: 'New Protocol Opportunities',
      description: 'Allocate 20% to brand new protocols with incentive programs',
      action: 'Participate in new protocol launches with proper risk management',
      completed: false,
      proTip: 'New protocols carry smart contract risks - diversify and size positions carefully'
    },
    {
      id: 4,
      title: 'Advanced Exit Planning',
      description: 'Set up automated profit-taking and stop-losses',
      action: 'Configure automated rebalancing and risk management tools',
      completed: false,
      proTip: 'Automation helps remove emotion from decision-making in volatile markets'
    }
  ];

  const featuredStrategies: Strategy[] = [
    {
      id: '1',
      name: 'Stable Yield Maximizer',
      category: 'Conservative',
      apy: '5.2%',
      risk: 'Low',
      protocols: ['Aave', 'Compound', 'MakerDAO'],
      description: 'Conservative strategy focusing on stable lending protocols with proven track records.',
      tvl: '$2.1B',
      timeCommitment: '5 min/week'
    },
    {
      id: '2',
      name: 'Curve LP Optimizer',
      category: 'Balanced',
      apy: '12.8%',
      risk: 'Medium',
      protocols: ['Curve', 'Convex', 'Yearn'],
      description: 'Balanced approach using Curve pools and yield optimization strategies.',
      tvl: '$890M',
      timeCommitment: '15 min/week'
    },
    {
      id: '3',
      name: 'DeFi Alpha Hunter',
      category: 'Aggressive',
      apy: '34.5%',
      risk: 'High',
      protocols: ['GMX', 'Trader Joe', 'Pendle'],
      description: 'High-yield strategy targeting emerging protocols and yield farming opportunities.',
      tvl: '$125M',
      timeCommitment: '1 hour/day'
    }
  ];

  const getSteps = (strategyType: string) => {
    switch (strategyType) {
      case 'conservative':
        return conservativeSteps;
      case 'balanced':
        return balancedSteps;
      case 'aggressive':
        return aggressiveSteps;
      default:
        return [];
    }
  };

  const getSelectedStrategy = () => {
    return strategyTypes.find(s => s.id === selectedStrategyType);
  };

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < 4) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleStrategyAction = (action: string, strategyId: string) => {
    switch (action) {
      case 'view':
        console.log('View strategy:', strategyId);
        break;
      case 'favorite':
        setFavoriteStrategies(prev => 
          prev.includes(strategyId) 
            ? prev.filter(id => id !== strategyId)
            : [...prev, strategyId]
        );
        break;
      case 'share':
        console.log('Share strategy:', strategyId);
        break;
    }
  };

  const progress = (completedSteps.length / 4) * 100;

  if (selectedStrategyType) {
    const strategy = getSelectedStrategy();
    const steps = getSteps(selectedStrategyType);
    const currentStepData = steps[currentStep - 1];

    return (
      <div className="min-h-screen bg-white p-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedStrategyType(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Strategies
          </Button>
          
          <div className={`p-4 rounded-lg bg-gradient-to-r ${strategy?.color} border ${strategy?.borderColor}`}>
            <div className="flex items-center gap-3 mb-2">
              {strategy?.icon}
              <div>
                <h1 className="text-xl font-bold text-crypto-text">{strategy?.name}</h1>
                <p className="text-crypto-muted text-sm">{strategy?.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-crypto-primary">
                {strategy?.apy}
              </Badge>
              <Badge variant="outline" className={`
                ${strategy?.risk === 'Low' ? 'text-green-400 border-green-400' : 
                  strategy?.risk === 'Medium' ? 'text-yellow-400 border-yellow-400' : 
                  'text-red-400 border-red-400'}
              `}>
                {strategy?.risk} Risk
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-crypto-surface border-crypto-border mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-crypto-text font-medium">Setup Progress</span>
              <span className="text-crypto-primary font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-3" />
            <div className="flex justify-between text-xs text-crypto-muted">
              <span>Step {currentStep} of 4</span>
              <span>{completedSteps.length} completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className="bg-crypto-surface border-crypto-primary/30 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-crypto-primary rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                {currentStep}
              </div>
              <CardTitle className="text-crypto-text">{currentStepData?.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-crypto-muted">{currentStepData?.description}</p>
            
            <div className="p-3 bg-crypto-card rounded-lg border border-crypto-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-crypto-primary" />
                <span className="text-crypto-text font-medium text-sm">Action Required:</span>
              </div>
              <p className="text-crypto-text text-sm">{currentStepData?.action}</p>
            </div>

            {currentStepData?.proTip && (
              <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium text-sm">Pro Tip:</span>
                </div>
                <p className="text-crypto-muted text-sm">{currentStepData.proTip}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => handleStepComplete(currentStep)}
                className="flex-1 bg-crypto-primary hover:bg-crypto-primary/90"
                disabled={completedSteps.includes(currentStep)}
              >
                {completedSteps.includes(currentStep) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    Complete Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                currentStep === step.id
                  ? 'bg-crypto-primary text-gray-900'
                  : completedSteps.includes(step.id)
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-crypto-card text-crypto-muted border border-crypto-border'
              }`}
            >
              <div className="text-xs font-medium mb-1">Step {step.id}</div>
              <div className="text-xs">{step.title.split(' ')[0]}</div>
            </button>
          ))}
        </div>

        {/* Completion */}
        {completedSteps.length === 4 && (
          <Card className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-crypto-text mb-2">Strategy Complete!</h3>
              <p className="text-crypto-muted mb-4">
                Your {strategy?.name} strategy is now ready to deploy.
              </p>
              <Button className="bg-green-500 hover:bg-green-600 w-full">
                Deploy Strategy
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-crypto-text mb-2">Build Your DeFi Strategy</h1>
        <p className="text-crypto-muted">Choose a strategy type and follow our step-by-step guide</p>
      </div>

      <Tabs defaultValue="guided" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="guided" className="py-2">
            Guided Setup
          </TabsTrigger>
          <TabsTrigger value="browse" className="py-2">
            Browse Strategies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guided" className="space-y-4">
          {/* Strategy Type Selection */}
          <div className="space-y-4">
            {strategyTypes.map((strategyType) => (
              <SwipeableCard
                key={strategyType.id}
                rightAction={{
                  icon: <Play className="w-5 h-5" />,
                  label: "Start",
                  action: () => setSelectedStrategyType(strategyType.id),
                  color: "#00e0ff"
                }}
              >
                <div className={`p-4 rounded-lg bg-gradient-to-r ${strategyType.color} border ${strategyType.borderColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {strategyType.icon}
                      <div>
                        <h3 className="text-lg font-bold text-crypto-text">{strategyType.name}</h3>
                        <p className="text-crypto-muted text-sm">{strategyType.subtitle}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-crypto-primary">
                      {strategyType.apy}
                    </Badge>
                  </div>
                  
                  <p className="text-crypto-muted text-sm mb-4">{strategyType.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`
                      ${strategyType.risk === 'Low' ? 'text-green-400 border-green-400' : 
                        strategyType.risk === 'Medium' ? 'text-yellow-400 border-yellow-400' : 
                        'text-red-400 border-red-400'}
                    `}>
                      {strategyType.risk} Risk
                    </Badge>
                    
                    <Button 
                      size="sm"
                      onClick={() => setSelectedStrategyType(strategyType.id)}
                      className="bg-crypto-primary hover:bg-crypto-primary/90"
                    >
                      Start Setup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  
                  {/* Swipe instruction */}
                  <div className="text-center mt-3">
                    <p className="text-xs text-crypto-muted opacity-60">← Swipe to start →</p>
                  </div>
                </div>
              </SwipeableCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          {/* Featured Strategies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-crypto-text">Featured Strategies</h3>
            {featuredStrategies.map((strategy) => (
              <StrategyCardSwipeable
                key={strategy.id}
                strategy={strategy}
                onView={(id) => handleStrategyAction('view', id)}
                onFavorite={(id) => handleStrategyAction('favorite', id)}
                onShare={(id) => handleStrategyAction('share', id)}
                isFavorited={favoriteStrategies.includes(strategy.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}