import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  Search,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  Play,
  ArrowRight,
  Award,
  BarChart3,
  Coins,
  Globe,
  Brain,
  Shield,
  Zap,
  Users,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  keyPoints: string[];
  successRate?: string;
  type: string;
  practicalSteps?: string[];
  riskLevel?: string;
  roi?: string;
  platform?: string;
  chain?: string;
}

const categoryConfig = {
  stocks: {
    title: "Stock Trading Strategies",
    icon: TrendingUp,
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    description: "Complete stock market strategies from beginner to advanced"
  },
  crypto: {
    title: "Cryptocurrency Strategies", 
    icon: Coins,
    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
    description: "DeFi, crypto trading, and digital asset strategies"
  },
  forex: {
    title: "Forex Trading Strategies",
    icon: Globe,
    color: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
    description: "Currency trading and forex market strategies"
  },
  passive: {
    title: "Passive Income Strategies",
    icon: DollarSign,
    color: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
    description: "Build sustainable passive income streams"
  },
  psychology: {
    title: "Trading Psychology & Community",
    icon: Brain,
    color: "bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800",
    description: "Mental discipline, emotional control, and community support"
  },
  advanced: {
    title: "Advanced Strategies",
    icon: Award,
    color: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800", 
    description: "Elite and institutional-level strategies"
  }
};

const difficultyColors = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function UnifiedTradingStrategies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Fetch all data
  const { data: trainingStrategies = [], isLoading: loadingTraining } = useQuery({
    queryKey: ["/api/training-strategies"],
  });

  const { data: passiveStrategies = [], isLoading: loadingPassive } = useQuery({
    queryKey: ["/api/passive-income-strategies"],
  });

  const { data: oliverTechniques = [], isLoading: loadingOliver } = useQuery({
    queryKey: ["/api/oliver-velez-techniques"],
  });

  const { data: forexLessons = [], isLoading: loadingForex } = useQuery({
    queryKey: ["/api/forex-trading-lessons"],
  });

  // Organize strategies by category
  const organizedStrategies = {
    stocks: [
      ...(trainingStrategies as any[])
        .filter((s: any) => s.category === 'stocks' || s.strategyId?.includes('stock'))
        .map((s: any) => ({ ...s, type: 'training', category: 'stocks' })),
      ...(oliverTechniques as any[])
        .filter((s: any) => s.category?.includes('Stock') || s.category?.includes('Strategy'))
        .map((s: any) => ({ 
          ...s, 
          type: 'oliver', 
          category: 'stocks',
          title: s.technique,
          duration: s.timeFrame,
          keyPoints: s.examples?.slice(0, 3) || [],
          successRate: s.successRate
        }))
    ],
    crypto: [
      ...(trainingStrategies as any[])
        .filter((s: any) => s.category === 'defi' || s.category === 'crypto')
        .map((s: any) => ({ ...s, type: 'training', category: 'crypto' })),
      ...(passiveStrategies as any[])
        .filter((s: any) => s.chain && s.platform)
        .map((s: any) => ({ 
          ...s, 
          type: 'passive', 
          category: 'crypto',
          difficulty: 'Beginner',
          duration: s.timeCommitment,
          keyPoints: s.steps?.slice(0, 3) || [],
          successRate: `${s.minROI}% - ${s.maxROI}%`
        }))
    ],
    forex: [
      ...(forexLessons as any[]).map((s: any) => ({
        ...s,
        type: 'forex',
        category: 'forex',
        keyPoints: s.learningObjectives?.slice(0, 3) || [],
        successRate: 'Educational'
      })),
      ...(trainingStrategies as any[])
        .filter((s: any) => s.category === 'forex')
        .map((s: any) => ({ ...s, type: 'training', category: 'forex' }))
    ],
    passive: [
      ...(passiveStrategies as any[]).map((s: any) => ({ 
        ...s, 
        type: 'passive', 
        category: 'passive',
        difficulty: 'Beginner',
        duration: s.timeCommitment,
        keyPoints: s.steps?.slice(0, 3) || [],
        successRate: `${s.minROI}% - ${s.maxROI}%`
      })),
      ...(trainingStrategies as any[])
        .filter((s: any) => s.category === 'passive' || s.title?.toLowerCase().includes('passive'))
        .map((s: any) => ({ ...s, type: 'training', category: 'passive' }))
    ],
    psychology: [
      ...(trainingStrategies as any[])
        .filter((s: any) => s.category === 'psychology' || s.title?.toLowerCase().includes('psychology') || s.title?.toLowerCase().includes('freedom') || s.title?.toLowerCase().includes('community'))
        .map((s: any) => ({ ...s, type: 'training', category: 'psychology' })),
      ...(oliverTechniques as any[])
        .filter((s: any) => s.category?.includes('Psychology') || s.technique?.includes('Mental'))
        .map((s: any) => ({ 
          ...s, 
          type: 'oliver', 
          category: 'psychology',
          title: s.technique,
          duration: s.timeFrame,
          keyPoints: s.examples?.slice(0, 3) || [],
          successRate: s.successRate
        }))
    ],
    advanced: [
      ...(oliverTechniques as any[])
        .filter((s: any) => s.difficulty === 'Advanced' || s.techniqueId?.includes('fc-'))
        .map((s: any) => ({ 
          ...s, 
          type: 'oliver', 
          category: 'advanced',
          title: s.technique,
          duration: s.timeFrame,
          keyPoints: s.examples?.slice(0, 3) || [],
          successRate: s.successRate
        })),
      ...(trainingStrategies as any[])
        .filter((s: any) => s.difficulty === 'Advanced' || s.strategyId?.includes('fc-'))
        .map((s: any) => ({ ...s, type: 'training', category: 'advanced' }))
    ]
  };

  // Filter strategies
  const getFilteredStrategies = (category: string) => {
    const strategies = organizedStrategies[category as keyof typeof organizedStrategies] || [];
    return strategies.filter((strategy: Strategy) => 
      strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleStartStrategy = (strategy: Strategy) => {
    // Check if this is the Trading Freedom Group strategy
    if (strategy.title?.includes('Freedom') || strategy.title?.includes('NextGen Community')) {
      // Redirect to the signup page
      window.location.href = '/trading-freedom-group';
      return;
    }
    
    toast({
      title: "Strategy Started!",
      description: `Beginning "${strategy.title}" - Complete step-by-step guidance provided`,
    });
  };

  const isLoading = loadingTraining || loadingPassive || loadingOliver || loadingForex;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600 dark:text-slate-200">Loading Trading Strategies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Unified Trading Strategies</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Complete step-by-step strategies organized by subject matter - Stocks, Crypto, Forex, and Passive Income
            </p>
            <Alert className="bg-green-100 border-green-200 text-green-800 max-w-2xl mx-auto">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                All strategies include detailed step-by-step implementation with zero flaws
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-200" />
            <Input
              placeholder="Search all strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Strategy Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="passive">Passive</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-8">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const strategies = getFilteredStrategies(key);
                if (strategies.length === 0) return null;
                
                const IconComponent = config.icon;
                
                return (
                  <div key={`category-${key}`}>
                    <div className={`p-6 rounded-lg mb-6 ${config.color}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">{config.title}</h2>
                        <Badge variant="outline">{strategies.length} Strategies</Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-200">{config.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {strategies.map((strategy, index) => (
                        <StrategyCard 
                          key={`${key}-${strategy.id}-${index}`} 
                          strategy={strategy} 
                          onStart={handleStartStrategy}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {Object.keys(categoryConfig).map(category => (
            <TabsContent key={category} value={category}>
              <div className={`p-6 rounded-lg mb-6 ${categoryConfig[category as keyof typeof categoryConfig].color}`}>
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(categoryConfig[category as keyof typeof categoryConfig].icon, { className: "h-6 w-6" })}
                  <h2 className="text-2xl font-bold">{categoryConfig[category as keyof typeof categoryConfig].title}</h2>
                  <Badge variant="outline">{getFilteredStrategies(category).length} Strategies</Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-200">{categoryConfig[category as keyof typeof categoryConfig].description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredStrategies(category).map((strategy, index) => (
                  <StrategyCard 
                    key={`${category}-${strategy.id}-${index}`} 
                    strategy={strategy} 
                    onStart={handleStartStrategy}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function StrategyCard({ strategy, onStart }: { strategy: Strategy; onStart: (strategy: Strategy) => void }) {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={difficultyColors[strategy.difficulty as keyof typeof difficultyColors]}>
            {strategy.difficulty}
          </Badge>
          {strategy.successRate && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {strategy.successRate}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{strategy.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {strategy.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{strategy.duration}</span>
            </div>
            {strategy.platform && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{strategy.platform}</span>
              </div>
            )}
          </div>

          {strategy.keyPoints && strategy.keyPoints.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Key Steps:</div>
              <ul className="text-sm space-y-1">
                {strategy.keyPoints.slice(0, 2).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                    <span className="line-clamp-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button 
            onClick={() => onStart(strategy)}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {strategy.title?.includes('Freedom') || strategy.title?.includes('NextGen Community') ? 'Join Group' : 'Start Step-by-Step Guide'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}