import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  BookOpen, CheckCircle2, Play, ArrowRight, ArrowLeft, Target, 
  Zap, Shield, Brain, Clock, TrendingUp, Star, Volume2, VolumeX, Loader2
} from 'lucide-react';
import { useTTS } from '@/hooks/use-tts';

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  content: {
    intro: string;
    objectives: string[];
    steps: { step: number; title: string; detail: string }[];
  };
}

interface StrategyVariant {
  slug: string;
  title: string;
  variantKey: string;
  summary: string;
  isPrimary: boolean;
}

interface ProfessionalTrainingLayoutProps {
  groupId: string;
  groupTitle: string;
  groupDescription: string;
  groupIcon?: React.ReactNode;
  accentColor?: string;
  variants: StrategyVariant[];
  defaultVariant?: string;
  onVariantChange?: (variantKey: string) => void;
  customModules?: Record<string, TrainingModule[]>;
}

const defaultModules: TrainingModule[] = [
  {
    id: 1,
    title: "Introduction & Core Concepts",
    description: "Understand the fundamental principles and philosophy behind this strategy.",
    duration: "15 min",
    content: {
      intro: "Welcome to this professional training module. Here you'll learn the core concepts that form the foundation of successful implementation.",
      objectives: [
        "Understand the core philosophy and approach",
        "Learn key terminology and concepts",
        "Identify when to apply this strategy",
        "Recognize optimal market conditions"
      ],
      steps: [
        { step: 1, title: "Philosophy Overview", detail: "This strategy is built on principles of systematic analysis and disciplined execution. We focus on repeatable processes rather than gut feelings." },
        { step: 2, title: "Key Terminology", detail: "Master the essential vocabulary used in this strategy including entry signals, exit criteria, and risk management terms." },
        { step: 3, title: "Strategy Foundation", detail: "Learn the historical context and development of this approach, understanding why it works and when it's most effective." }
      ]
    }
  },
  {
    id: 2,
    title: "Setup & Configuration",
    description: "Configure your trading environment and tools for optimal execution.",
    duration: "20 min",
    content: {
      intro: "Proper setup is crucial for consistent results. This module covers all the technical requirements and configurations needed.",
      objectives: [
        "Set up your trading platform correctly",
        "Configure essential indicators",
        "Establish alert systems",
        "Prepare your trading workspace"
      ],
      steps: [
        { step: 1, title: "Platform Setup", detail: "Configure your trading platform with the correct chart settings, timeframes, and display preferences for this strategy." },
        { step: 2, title: "Indicator Configuration", detail: "Add and configure the specific indicators used in this strategy with the correct parameters and visual settings." },
        { step: 3, title: "Alert System", detail: "Set up automated alerts to notify you when potential setups form, ensuring you never miss an opportunity." }
      ]
    }
  },
  {
    id: 3,
    title: "Entry Rules & Triggers",
    description: "Master the specific conditions required for valid entry signals.",
    duration: "25 min",
    content: {
      intro: "Entry precision is what separates profitable traders from the crowd. Learn exactly when and how to enter positions.",
      objectives: [
        "Identify valid entry triggers",
        "Confirm signals with multiple factors",
        "Time entries for optimal risk/reward",
        "Avoid false signals and traps"
      ],
      steps: [
        { step: 1, title: "Primary Signal", detail: "Learn to identify the main entry trigger that initiates the trade setup process." },
        { step: 2, title: "Confirmation Factors", detail: "Understand the secondary confirmations required to validate the primary signal before entry." },
        { step: 3, title: "Entry Execution", detail: "Master the mechanics of order placement, including order types and timing considerations." }
      ]
    }
  },
  {
    id: 4,
    title: "Risk Management",
    description: "Protect your capital with proper position sizing and stop-loss strategies.",
    duration: "20 min",
    content: {
      intro: "Risk management is the cornerstone of long-term trading success. This module ensures you protect your capital while maximizing opportunities.",
      objectives: [
        "Calculate proper position sizes",
        "Set appropriate stop-loss levels",
        "Manage overall portfolio risk",
        "Understand risk/reward ratios"
      ],
      steps: [
        { step: 1, title: "Position Sizing", detail: "Learn to calculate the correct position size based on your account size and risk tolerance per trade." },
        { step: 2, title: "Stop-Loss Placement", detail: "Determine optimal stop-loss levels using technical levels and volatility-based calculations." },
        { step: 3, title: "Portfolio Risk", detail: "Manage overall exposure across multiple positions to prevent catastrophic drawdowns." }
      ]
    }
  },
  {
    id: 5,
    title: "Exit Strategies",
    description: "Learn when and how to take profits and cut losses effectively.",
    duration: "20 min",
    content: {
      intro: "Knowing when to exit is just as important as knowing when to enter. Master the art of profit-taking and loss-cutting.",
      objectives: [
        "Set profit targets using multiple methods",
        "Implement trailing stop techniques",
        "Recognize exit signals",
        "Manage partial position exits"
      ],
      steps: [
        { step: 1, title: "Profit Targets", detail: "Calculate and set profit targets using technical levels, risk multiples, and market structure." },
        { step: 2, title: "Trailing Stops", detail: "Implement dynamic stop-loss strategies that protect profits as the trade moves in your favor." },
        { step: 3, title: "Exit Signals", detail: "Recognize technical and fundamental signals that indicate it's time to close the position." }
      ]
    }
  },
  {
    id: 6,
    title: "Live Examples & Case Studies",
    description: "Analyze real-world trade examples to reinforce your learning.",
    duration: "30 min",
    content: {
      intro: "Study actual trade examples to see how the strategy performs in real market conditions across different scenarios.",
      objectives: [
        "Analyze winning trade setups",
        "Learn from losing trades",
        "Identify common patterns",
        "Apply lessons to live trading"
      ],
      steps: [
        { step: 1, title: "Winning Examples", detail: "Walk through successful trades step by step, identifying the key factors that led to profits." },
        { step: 2, title: "Learning from Losses", detail: "Analyze trades that didn't work out to understand what went wrong and how to avoid similar situations." },
        { step: 3, title: "Pattern Recognition", detail: "Develop your eye for identifying high-probability setups by reviewing multiple examples." }
      ]
    }
  },
  {
    id: 7,
    title: "Advanced Techniques",
    description: "Take your trading to the next level with advanced optimization methods.",
    duration: "25 min",
    content: {
      intro: "Once you've mastered the basics, these advanced techniques will help you refine your approach and improve your results.",
      objectives: [
        "Optimize entry timing",
        "Scale in and out of positions",
        "Combine with other strategies",
        "Adapt to changing market conditions"
      ],
      steps: [
        { step: 1, title: "Advanced Entry", detail: "Fine-tune your entry timing using multiple timeframe analysis and order flow concepts." },
        { step: 2, title: "Position Scaling", detail: "Learn to build into positions gradually and scale out to optimize your average entry and exit prices." },
        { step: 3, title: "Strategy Combination", detail: "Combine this strategy with complementary approaches for enhanced performance." }
      ]
    }
  },
  {
    id: 8,
    title: "Trading Psychology & Discipline",
    description: "Develop the mental framework for consistent execution.",
    duration: "15 min",
    content: {
      intro: "The best strategy in the world is useless without the discipline to execute it consistently. Master your trading psychology.",
      objectives: [
        "Build emotional discipline",
        "Create a trading routine",
        "Handle winning and losing streaks",
        "Maintain consistency over time"
      ],
      steps: [
        { step: 1, title: "Emotional Control", detail: "Learn techniques to manage fear, greed, and other emotions that can derail your trading performance." },
        { step: 2, title: "Trading Routine", detail: "Establish a daily and weekly routine that sets you up for consistent execution and continuous improvement." },
        { step: 3, title: "Long-term Mindset", detail: "Develop the patience and perspective needed to succeed over the long term in trading." }
      ]
    }
  }
];

export function ProfessionalTrainingLayout({
  groupId,
  groupTitle,
  groupDescription,
  groupIcon,
  accentColor = 'orange',
  variants,
  defaultVariant,
  onVariantChange,
  customModules
}: ProfessionalTrainingLayoutProps) {
  const [activeVariant, setActiveVariant] = useState(defaultVariant || variants[0]?.variantKey || '');
  const [activeModule, setActiveModule] = useState(1);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const { speak, stop, isPlaying, isLoading } = useTTS();

  const currentVariant = variants.find(v => v.variantKey === activeVariant) || variants[0];
  const trainingModules = customModules?.[activeVariant] || defaultModules;
  const currentModule = trainingModules.find(m => m.id === activeModule);

  useEffect(() => {
    const saved = localStorage.getItem(`training-progress-${groupId}-${activeVariant}`);
    if (saved) {
      setCompletedModules(JSON.parse(saved));
    } else {
      setCompletedModules([]);
    }
  }, [groupId, activeVariant]);

  const toggleComplete = (moduleId: number) => {
    const newCompleted = completedModules.includes(moduleId)
      ? completedModules.filter(id => id !== moduleId)
      : [...completedModules, moduleId];
    setCompletedModules(newCompleted);
    localStorage.setItem(`training-progress-${groupId}-${activeVariant}`, JSON.stringify(newCompleted));
  };

  const handleVariantChange = (value: string) => {
    if (value) {
      stop();
      setActiveVariant(value);
      setActiveModule(1);
      onVariantChange?.(value);
    }
  };

  const speakContent = () => {
    if (!currentModule) return;
    
    if (isPlaying) {
      stop();
      return;
    }

    const text = `${currentModule.title}. ${currentModule.content.intro}. ${currentModule.content.steps.map(s => s.title + '. ' + s.detail).join('. ')}`;
    speak(text);
  };

  const accentClasses = {
    orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', border: 'border-orange-500', text: 'text-orange-400', light: 'bg-orange-600/20' },
    blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', border: 'border-blue-500', text: 'text-blue-400', light: 'bg-blue-600/20' },
    green: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', border: 'border-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-600/20' },
    purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', border: 'border-purple-500', text: 'text-purple-400', light: 'bg-purple-600/20' },
    yellow: { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', border: 'border-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-600/20' }
  };

  const accent = accentClasses[accentColor as keyof typeof accentClasses] || accentClasses.orange;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${accent.light} ${accent.border} border`}>
              {groupIcon || <Zap className={`w-8 h-8 ${accent.text}`} />}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{groupTitle}</h1>
              <p className="text-slate-400 text-sm lg:text-base">{groupDescription}</p>
            </div>
          </div>

          {variants.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Strategy Variant</span>
              <ToggleGroup type="single" value={activeVariant} onValueChange={handleVariantChange} className="bg-slate-800/50 rounded-lg p-1 border border-slate-700">
                {variants.map(variant => (
                  <ToggleGroupItem 
                    key={variant.variantKey} 
                    value={variant.variantKey}
                    className={`px-4 py-2 text-sm data-[state=on]:${accent.bg} data-[state=on]:text-white`}
                  >
                    {variant.title}
                    {variant.isPrimary && <Star className="w-3 h-3 ml-1 inline" />}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        </div>

        {currentVariant && (
          <Card className={`bg-slate-900/50 ${accent.border}/30 border`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Badge className={`${accent.light} ${accent.text} ${accent.border}/30 border`}>
                  {currentVariant.variantKey.toUpperCase()}
                </Badge>
                <p className="text-slate-300 text-sm flex-1">{currentVariant.summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Training Progress</span>
            <span className={`${accent.text} font-bold`}>{completedModules.length}/{trainingModules.length} modules</span>
          </div>
          <Progress value={(completedModules.length / trainingModules.length) * 100} className="h-3 bg-slate-800" />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-700 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BookOpen className={`h-5 w-5 ${accent.text}`} /> Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                {trainingModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeModule === module.id 
                        ? `${accent.light} border ${accent.border}/50` 
                        : 'bg-slate-800/50 border border-transparent hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 ${completedModules.includes(module.id) ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {completedModules.includes(module.id) ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${activeModule === module.id ? accent.text.replace('text-', 'text-') + '-300' : 'text-white'}`}>
                          {module.id}. {module.title}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {module.duration}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            {currentModule && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Module {currentModule.id}: {currentModule.title}</CardTitle>
                      <CardDescription className="mt-1">{currentModule.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={speakContent}
                      disabled={isLoading}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span className="ml-2">{isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'AI Read'}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300">{currentModule.content.intro}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className={`h-5 w-5 ${accent.text}`} /> Learning Objectives
                    </h3>
                    <ul className="space-y-1">
                      {currentModule.content.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-2">
                    {currentModule.content.steps.map((step) => (
                      <AccordionItem key={step.step} value={`step-${step.step}`} className="border border-slate-700 rounded-lg bg-slate-800/30 px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full ${accent.light} border ${accent.border}/50 flex items-center justify-center ${accent.text} font-bold text-sm`}>
                              {step.step}
                            </div>
                            <span className="text-white font-medium text-sm">{step.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 text-slate-300 text-sm pl-10">
                          {step.detail}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <Button
                      variant="outline"
                      onClick={() => setActiveModule(Math.max(1, activeModule - 1))}
                      disabled={activeModule === 1}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    <Button
                      onClick={() => toggleComplete(currentModule.id)}
                      className={completedModules.includes(currentModule.id) ? 'bg-emerald-600 hover:bg-emerald-700' : `${accent.bg} ${accent.hover}`}
                    >
                      {completedModules.includes(currentModule.id) ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Completed</> : <><Play className="h-4 w-4 mr-2" /> Mark Complete</>}
                    </Button>
                    <Button
                      onClick={() => setActiveModule(Math.min(trainingModules.length, activeModule + 1))}
                      disabled={activeModule === trainingModules.length}
                      className="bg-slate-700 hover:bg-slate-600"
                    >
                      Next <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalTrainingLayout;
