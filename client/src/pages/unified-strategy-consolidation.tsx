import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen,
  TrendingUp,
  DollarSign,
  Brain,
  Target,
  Users,
  Shield,
  Calendar,
  CheckCircle,
  Play,
  ArrowRight,
  Star,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";

interface ConsolidatedStrategy {
  id: string;
  title: string;
  category: 'DeFi' | 'Stocks' | 'Forex' | 'Psychology' | 'Advanced';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  completionTime: string;
  description: string;
  consolidatedFrom: string[];
  keyFeatures: string[];
  successRate: string;
  lessons: number;
  completedLessons: number;
  isUnlocked: boolean;
  featured: boolean;
}

export default function UnifiedStrategyConsolidation() {
  const [activeCategory, setActiveCategory] = useState<string>('DeFi');
  const [selectedStrategy, setSelectedStrategy] = useState<ConsolidatedStrategy | null>(null);

  // Consolidated Strategies - Combining Similar Approaches
  const consolidatedStrategies: ConsolidatedStrategy[] = [
    // DeFi Category - Combined all crypto/DeFi strategies
    {
      id: 'comprehensive-defi-mastery',
      title: 'Complete DeFi Mastery Suite',
      category: 'DeFi',
      difficulty: 'Beginner',
      completionTime: '4-6 weeks',
      description: 'Master DeFi from basics to advanced strategies including passive income, yield farming, project discovery, exit planning, and safety protocols.',
      consolidatedFrom: [
        'Passive Income Training',
        'DeFi Safety System', 
        'Project Discovery',
        'Yield Pools Explorer',
        'Exit Strategy Planning',
        'Crypto Cashflow Challenge'
      ],
      keyFeatures: [
        'Step-by-step DeFi fundamentals',
        'Passive income generation strategies',
        'Project discovery and airdrop farming',
        'Risk assessment and safety protocols',
        'Portfolio tracking and yield optimization',
        'Strategic exit planning with alerts'
      ],
      successRate: '92-96%',
      lessons: 45,
      completedLessons: 0,
      isUnlocked: true,
      featured: true
    },

    // Stocks Category - Combined all stock trading strategies  
    {
      id: 'professional-stock-trading',
      title: 'Professional Stock Trading System',
      category: 'Stocks',
      difficulty: 'Intermediate',
      completionTime: '6-8 weeks',
      description: 'Complete stock trading education combining day trading, swing trading, congressional following, and institutional methods.',
      consolidatedFrom: [
        'Warrior Trading Strategies',
        'Oliver Velez Techniques',
        'Nancy Pelosi Strategy', 
        '30SecondTrader Methods',
        'Robin Hood Trading'
      ],
      keyFeatures: [
        'Day trading fundamentals and setups',
        'Swing trading with technical analysis',
        'Congressional trade following',
        'Momentum and breakout strategies',
        'Risk management and position sizing',
        'Real-time market scanning tools'
      ],
      successRate: '85-89%',
      lessons: 38,
      completedLessons: 0,
      isUnlocked: true,
      featured: true
    },

    // Forex Category - Simplified and consolidated
    {
      id: 'forex-trading-mastery',
      title: 'Forex Trading Mastery',
      category: 'Forex',
      difficulty: 'Intermediate',
      completionTime: '3-4 weeks',
      description: 'Complete forex trading course covering fundamentals, technical analysis, risk management, and profitable trading strategies.',
      consolidatedFrom: [
        'Forex Trading Lessons',
        'Currency Analysis',
        'International Markets'
      ],
      keyFeatures: [
        'Currency pair analysis',
        'Technical and fundamental analysis',
        'Risk management for forex',
        'Trading sessions and timing',
        'Economic calendar integration',
        'Position sizing and leverage'
      ],
      successRate: '78-82%',
      lessons: 24,
      completedLessons: 0,
      isUnlocked: true,
      featured: false
    },

    // Psychology Category - Combined all mindset/psychology
    {
      id: 'trading-psychology-mastery',
      title: 'Trading Psychology & Discipline',
      category: 'Psychology',
      difficulty: 'Beginner',
      completionTime: '2-3 weeks',
      description: 'Master the mental game of trading with mindfulness, emotional control, and disciplined decision-making strategies.',
      consolidatedFrom: [
        'Mindful Study Education',
        'Trading Psychology',
        'Emotional Control',
        'Mental Discipline'
      ],
      keyFeatures: [
        'Emotional regulation techniques',
        'Mindfulness and meditation for traders',
        'Discipline and consistency building',
        'Stress management strategies',
        'Performance psychology',
        'Building winning habits'
      ],
      successRate: '94-97%',
      lessons: 16,
      completedLessons: 0,
      isUnlocked: true,
      featured: false
    },

    // Advanced Category - High-level strategies
    {
      id: 'advanced-market-intelligence',
      title: 'Advanced Market Intelligence',
      category: 'Advanced',
      difficulty: 'Expert',
      completionTime: '8-12 weeks',
      description: 'Advanced strategies combining AI signals, institutional methods, economic analysis, and multi-market approaches.',
      consolidatedFrom: [
        'F&C Intelligent Decision',
        'Economic Calendar',
        'Advanced Analytics',
        'Institutional Methods'
      ],
      keyFeatures: [
        'AI-powered market analysis',
        'Economic event trading',
        'Multi-market correlation analysis',
        'Institutional-grade tools',
        'Advanced risk modeling',
        'Algorithmic decision support'
      ],
      successRate: '88-92%',
      lessons: 52,
      completedLessons: 0,
      isUnlocked: false,
      featured: true
    }
  ];

  const categories = ['DeFi', 'Stocks', 'Forex', 'Psychology', 'Advanced'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DeFi': return <DollarSign className="h-5 w-5" />;
      case 'Stocks': return <TrendingUp className="h-5 w-5" />;
      case 'Forex': return <BarChart3 className="h-5 w-5" />;
      case 'Psychology': return <Brain className="h-5 w-5" />;
      case 'Advanced': return <Zap className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-white dark:text-gray-700';
    }
  };

  const filteredStrategies = consolidatedStrategies.filter(
    strategy => strategy.category === activeCategory
  );

  const featuredStrategies = consolidatedStrategies.filter(strategy => strategy.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-900 dark:via-purple-900 dark:to-green-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              🎯 Unified Trading Strategies
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Streamlined training combining similar strategies into comprehensive mastery programs
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-80">
              No more scattered approaches - each category provides complete, step-by-step mastery
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Strategies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-gray-900">
            🌟 Featured Comprehensive Programs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStrategies.map(strategy => (
              <Card 
                key={strategy.id}
                className="bg-gradient-to-br from-blue-800/10 to-purple-800/10 border-blue-400/30 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedStrategy(strategy)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(strategy.category)}
                    <Badge className="bg-yellow-500 text-black font-bold">FEATURED</Badge>
                    <Badge className={getDifficultyColor(strategy.difficulty)}>
                      {strategy.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {strategy.title}
                  </CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-200">
                      <strong>Consolidates:</strong> {strategy.consolidatedFrom.slice(0, 2).join(', ')}
                      {strategy.consolidatedFrom.length > 2 && ` +${strategy.consolidatedFrom.length - 2} more`}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{strategy.lessons} lessons</span>
                      <span className="text-green-600 font-semibold">{strategy.successRate}</span>
                    </div>
                    <Progress value={(strategy.completedLessons / strategy.lessons) * 100} className="h-2" />
                    <Button className="w-full" disabled={!strategy.isUnlocked}>
                      {strategy.isUnlocked ? 'Start Training' : 'Unlock Required'}
                      <Play className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category-based Training */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-8">
              <div className="grid gap-6">
                {filteredStrategies.map(strategy => (
                  <Card 
                    key={strategy.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(strategy.category)}
                          <div>
                            <CardTitle className="text-xl">{strategy.title}</CardTitle>
                            <CardDescription className="mt-1">{strategy.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getDifficultyColor(strategy.difficulty)}>
                            {strategy.difficulty}
                          </Badge>
                          <span className="text-sm text-slate-600">{strategy.completionTime}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Consolidated Strategies:</h4>
                          <div className="flex flex-wrap gap-1">
                            {strategy.consolidatedFrom.map(item => (
                              <Badge key={item} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Key Features:</h4>
                          <ul className="text-sm space-y-1">
                            {strategy.keyFeatures.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-4 text-sm">
                          <span><strong>{strategy.lessons}</strong> lessons</span>
                          <span className="text-green-600 font-semibold">
                            {strategy.successRate} success rate
                          </span>
                        </div>
                        <Button disabled={!strategy.isUnlocked}>
                          {strategy.isUnlocked ? 'Start Training' : 'Coming Soon'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <Progress 
                        value={(strategy.completedLessons / strategy.lessons) * 100} 
                        className="h-2 mt-3" 
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Strategy Details Modal */}
        {selectedStrategy && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(selectedStrategy.category)}
                    <div>
                      <CardTitle className="text-2xl">{selectedStrategy.title}</CardTitle>
                      <CardDescription className="mt-1 text-lg">
                        {selectedStrategy.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedStrategy(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedStrategy.lessons}</div>
                    <div className="text-sm text-slate-600">Total Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedStrategy.successRate}</div>
                    <div className="text-sm text-slate-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedStrategy.completionTime}</div>
                    <div className="text-sm text-slate-600">Completion Time</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Complete Feature Set:</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {selectedStrategy.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Consolidated From These Strategies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStrategy.consolidatedFrom.map(item => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    This comprehensive program eliminates the need to take multiple separate courses. 
                    Everything is integrated into one streamlined learning experience.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center gap-4">
                  <Button size="lg" disabled={!selectedStrategy.isUnlocked}>
                    {selectedStrategy.isUnlocked ? 'Start Complete Training' : 'Unlock Required'}
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-gray-900 border-0 mt-12">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                🎯 Streamlined Training - Maximum Results
              </h3>
              <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto">
                No more confusion from scattered strategies. Each program provides complete mastery in its domain.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary">
                  Start with DeFi Mastery
                </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-green-600">
                  Explore Stock Trading
                </Button>
                <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-blue-600">
                  Master Trading Psychology
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}