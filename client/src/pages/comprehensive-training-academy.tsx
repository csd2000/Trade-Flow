import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter,
  BookOpen,
  Target,
  Clock,
  Users,
  CheckCircle,
  Star,
  Play,
  Download,
  Bookmark,
  Coins,
  LineChart,
  Brain,
  Laptop,
  Shield,
  Award,
  ArrowRight,
  BarChart3,
  TrendingDown,
  AlertTriangle,
  Settings,
  Zap,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrainingStrategy {
  id: number;
  strategyId: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  keyPoints: string[];
  successRate?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  orderIndex: number;
}

interface PassiveIncomeStrategy {
  id: number;
  title: string;
  platform: string;
  chain: string;
  riskLevel: string;
  minROI: string;
  maxROI: string;
  timeCommitment: string;
  description: string;
  steps: string[];
  toolsRequired: string[];
  exitPlan?: string;
  riskAnalysis?: string;
  resources: string[];
}

interface OliverVelezTechnique {
  id: number;
  techniqueId: string;
  technique: string;
  category: string;
  difficulty: string;
  description: string;
  timeFrame: string;
  successRate: string;
  detailedSteps?: string;
  riskManagement?: string;
  examples: string[];
}

interface ForexLesson {
  id: number;
  lessonId: string;
  title: string;
  duration: string;
  difficulty: string;
  description: string;
  learningObjectives: string[];
  detailedContent?: string;
  resources?: string;
  practicalExercises: string[];
  assessmentQuestions: string[];
}

const categoryIcons = {
  defi: Coins,
  stocks: TrendingUp,
  forex: Globe,
  crypto: BarChart3,
  psychology: Brain,
  passive: DollarSign,
  oliver: Target,
  advanced: Award
};

const difficultyColors = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const riskColors = {
  'Low': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
  'High': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200'
};

export default function ComprehensiveTrainingAcademy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Fetch all training data
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

  // Combine all strategies into unified format
  const allStrategies = [
    ...(trainingStrategies as TrainingStrategy[]).map((s: TrainingStrategy) => ({
      ...s,
      type: 'training',
      category: s.category,
      riskLevel: 'Medium',
      roi: s.successRate || 'N/A'
    })),
    ...(passiveStrategies as PassiveIncomeStrategy[]).map((s: PassiveIncomeStrategy) => ({
      ...s,
      type: 'passive',
      category: 'passive',
      difficulty: 'Beginner',
      duration: s.timeCommitment,
      keyPoints: s.steps?.slice(0, 3) || [],
      roi: `${s.minROI}% - ${s.maxROI}%`
    })),
    ...(oliverTechniques as OliverVelezTechnique[]).map((s: OliverVelezTechnique) => ({
      ...s,
      type: 'oliver',
      category: 'oliver',
      title: s.technique,
      duration: s.timeFrame,
      keyPoints: s.examples?.slice(0, 3) || [],
      riskLevel: 'Medium',
      roi: s.successRate
    })),
    ...(forexLessons as ForexLesson[]).map((s: ForexLesson) => ({
      ...s,
      type: 'forex',
      category: 'forex',
      keyPoints: s.learningObjectives?.slice(0, 3) || [],
      riskLevel: 'Medium',
      roi: 'Educational'
    }))
  ];

  // Filter strategies
  const filteredStrategies = allStrategies.filter(strategy => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || strategy.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || strategy.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get category counts
  const categoryStats = {
    all: allStrategies.length,
    defi: allStrategies.filter(s => s.category === 'defi').length,
    stocks: allStrategies.filter(s => s.category === 'stocks').length,
    forex: allStrategies.filter(s => s.category === 'forex').length,
    crypto: allStrategies.filter(s => s.category === 'crypto').length,
    psychology: allStrategies.filter(s => s.category === 'psychology').length,
    passive: allStrategies.filter(s => s.category === 'passive').length,
    oliver: allStrategies.filter(s => s.category === 'oliver').length
  };

  const isLoading = loadingTraining || loadingPassive || loadingOliver || loadingForex;

  const handleStartTraining = (strategy: any) => {
    toast({
      title: "Training Started!",
      description: `Beginning "${strategy.title}" - All content is completely FREE forever!`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600 dark:text-slate-200">Loading Free Training Academy...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">Free Training Academy</h1>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Complete access to all professional trading strategies - DeFi, Stocks, Forex, Crypto, and Psychology
            </p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{allStrategies.length}+</div>
                <div className="text-sm opacity-80">Training Modules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm opacity-80">Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm opacity-80">No Paywalls</div>
              </div>
            </div>
            <Alert className="bg-green-100 border-green-200 text-green-800 max-w-2xl mx-auto">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                🎉 ALL TRAINING CONTENT IS COMPLETELY FREE - No hidden charges, no subscriptions, no paywalls EVER!
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-200" />
              <Input
                placeholder="Search training strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Categories ({categoryStats.all})</option>
                  <option value="defi">DeFi ({categoryStats.defi})</option>
                  <option value="stocks">Stocks ({categoryStats.stocks})</option>
                  <option value="forex">Forex ({categoryStats.forex})</option>
                  <option value="crypto">Crypto ({categoryStats.crypto})</option>
                  <option value="psychology">Psychology ({categoryStats.psychology})</option>
                  <option value="passive">Passive Income ({categoryStats.passive})</option>
                  <option value="oliver">Oliver Velez ({categoryStats.oliver})</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{categoryStats.defi}</div>
              <div className="text-sm text-slate-600 dark:text-slate-200">DeFi Strategies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{categoryStats.stocks}</div>
              <div className="text-sm text-slate-600 dark:text-slate-200">Stock Trading</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{categoryStats.passive}</div>
              <div className="text-sm text-slate-600 dark:text-slate-200">Passive Income</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{categoryStats.psychology}</div>
              <div className="text-sm text-slate-600 dark:text-slate-200">Psychology</div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {filteredStrategies.length} Training Strategies Found
          </h2>
          <p className="text-slate-600 dark:text-slate-200">
            All content is completely free with step-by-step guidance
          </p>
        </div>

        {/* Training Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy, index) => {
            const IconComponent = categoryIcons[strategy.category as keyof typeof categoryIcons] || BookOpen;
            
            return (
              <Card key={`${strategy.type}-${strategy.id}-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <Badge variant="outline" className={difficultyColors[strategy.difficulty as keyof typeof difficultyColors]}>
                        {strategy.difficulty}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={riskColors[strategy.riskLevel as keyof typeof riskColors] || 'bg-gray-100'}>
                      {strategy.riskLevel}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{strategy.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {strategy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-slate-200" />
                        <span>{strategy.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-slate-200" />
                        <span>{strategy.roi}</span>
                      </div>
                    </div>

                    {strategy.keyPoints && strategy.keyPoints.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Key Points:</div>
                        <ul className="text-sm space-y-1">
                          {strategy.keyPoints.slice(0, 3).map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                              <span className="line-clamp-1">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleStartTraining(strategy)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Training (FREE)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStrategies.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-200" />
            <h3 className="text-xl font-semibold mb-2">No strategies found</h3>
            <p className="text-slate-600 dark:text-slate-200">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}