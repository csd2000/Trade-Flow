import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  TrendingUp,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  Plus,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  BookOpen,
  DollarSign,
  Shield
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  risk: string;
  roiRange: string;
  tags: string[];
  moduleCount: number;
  isActive: boolean;
  createdAt: string;
  track?: {
    difficulty: string;
    estimatedDuration: string;
    description: string;
  };
  modules?: Module[];
}

interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: string;
  durationMinutes: number;
  orderIndex: number;
  isRequired: boolean;
  createdAt: string;
}

export default function AdminStrategies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch from enhanced_training_strategies table which has the data
  // Using default queryFn which automatically fetches and parses JSON
  const { data: strategies = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/strategies'],
  });

  // Build master content mutation
  const buildMasterMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/build-master-content', 'POST'),
    onSuccess: (data) => {
      toast({
        title: "Master content built",
        description: `Built ${data.data?.totalModulesBuilt || 0} modules across ${data.data?.strategiesBuilt || 0} strategies`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Build failed",
        description: error.message || "Failed to build master content",
        variant: "destructive",
      });
    },
  });

  // Filter strategies
  const filteredStrategies = (strategies as Strategy[]).filter((strategy) => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || strategy.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRisk = selectedRisk === "all" || strategy.risk?.toLowerCase() === selectedRisk.toLowerCase();
    return matchesSearch && matchesCategory && matchesRisk;
  });

  // Get unique values for filters
  const categories = ["all", ...Array.from(new Set((strategies as Strategy[]).map(s => s.category)))];
  const riskLevels = ["all", ...Array.from(new Set((strategies as Strategy[]).map(s => s.risk).filter(Boolean)))];

  // Statistics
  const stats = {
    total: (strategies as Strategy[]).length,
    active: (strategies as Strategy[]).filter(s => s.isActive).length,
    complete: (strategies as Strategy[]).filter(s => s.moduleCount === 8).length,
    totalModules: (strategies as Strategy[]).reduce((sum, s) => sum + s.moduleCount, 0),
    avgModules: Math.round(((strategies as Strategy[]).reduce((sum, s) => sum + s.moduleCount, 0)) / Math.max((strategies as Strategy[]).length, 1)),
    categories: categories.length - 1, // Exclude 'all'
    riskLevels: riskLevels.length - 1, // Exclude 'all'
  };

  const handleViewStrategy = (slug: string) => {
    window.open(`/academy/strategy/${slug}`, '_blank');
  };

  const handleEditStrategy = (slug: string) => {
    window.location.href = `/admin/content?path=/academy/strategy/${slug}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-400 border-green-500/30';
      case 'medium': return 'text-orange-400 border-orange-500/30';
      case 'high': return 'text-red-400 border-red-500/30';
      default: return 'text-gray-200 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'defi': 'text-blue-400 border-blue-500/30',
      'trading': 'text-purple-400 border-purple-500/30',
      'education': 'text-green-400 border-green-500/30',
      'security': 'text-orange-400 border-orange-500/30',
      'general': 'text-gray-200 border-gray-500/30'
    };
    return colors[category?.toLowerCase() as keyof typeof colors] || 'text-gray-200 border-gray-500/30';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Strategy Management</h1>
              <p className="text-gray-300">
                Comprehensive view and management of all trading strategies
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/admin'}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600/50">
                Overview
              </TabsTrigger>
              <TabsTrigger value="strategies" className="data-[state=active]:bg-blue-600/50">
                All Strategies
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600/50">
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Total Strategies</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-gray-200">Target: 24</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Complete Sets</p>
                        <p className="text-2xl font-bold">{stats.complete}</p>
                        <p className="text-xs text-gray-200">8 modules each</p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Total Modules</p>
                        <p className="text-2xl font-bold">{stats.totalModules}</p>
                        <p className="text-xs text-gray-200">Target: 192</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Active Strategies</p>
                        <p className="text-2xl font-bold">{stats.active}</p>
                        <p className="text-xs text-gray-200">Public</p>
                      </div>
                      <Target className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Content Management
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    Build and manage strategy content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="font-medium">Build Master Content</h4>
                      <p className="text-sm text-gray-200">Generate all 24 strategies with complete modules</p>
                    </div>
                    <Button
                      onClick={() => buildMasterMutation.mutate()}
                      disabled={buildMasterMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {buildMasterMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4 mr-2" />
                      )}
                      Build All
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="font-medium">Training System Test</h4>
                      <p className="text-sm text-gray-200">View comprehensive system status report</p>
                    </div>
                    <Button
                      onClick={() => window.open('/training-system-test', '_blank')}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Strategy Completion</span>
                      <Badge variant="outline" className={stats.total === 24 ? 'border-green-500/30 text-green-400' : 'border-orange-500/30 text-orange-400'}>
                        {stats.total}/24 {stats.total === 24 ? '✓' : '⚠'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Module Completion</span>
                      <Badge variant="outline" className={stats.totalModules === 192 ? 'border-green-500/30 text-green-400' : 'border-orange-500/30 text-orange-400'}>
                        {stats.totalModules}/192 {stats.totalModules === 192 ? '✓' : '⚠'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Complete Strategy Sets</span>
                      <Badge variant="outline" className={stats.complete === 24 ? 'border-green-500/30 text-green-400' : 'border-orange-500/30 text-orange-400'}>
                        {stats.complete}/24 {stats.complete === 24 ? '✓' : '⚠'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Strategies Tab */}
            <TabsContent value="strategies" className="space-y-6">
              {/* Filters */}
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search strategies..."
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-200 min-w-64"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category} className="bg-slate-800">
                          {category === "all" ? "All Categories" : category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedRisk}
                      onChange={(e) => setSelectedRisk(e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white"
                    >
                      {riskLevels.map((risk) => (
                        <option key={risk} value={risk} className="bg-slate-800">
                          {risk === "all" ? "All Risk Levels" : `${risk} Risk`}
                        </option>
                      ))}
                    </select>

                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Strategies List */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Strategies ({filteredStrategies.length})
                    </span>
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Strategy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                      <span className="ml-3 text-gray-200">Loading strategies...</span>
                    </div>
                  ) : filteredStrategies.length === 0 ? (
                    <Alert className="bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {searchTerm || selectedCategory !== "all" || selectedRisk !== "all"
                          ? "No strategies match your search criteria."
                          : "No strategies found. Build master content to populate the database."
                        }
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {filteredStrategies.map((strategy) => (
                        <Card key={strategy.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{strategy.title}</h3>
                                  <Badge variant="outline" className={getCategoryColor(strategy.category)}>
                                    {strategy.category}
                                  </Badge>
                                  {strategy.risk && (
                                    <Badge variant="outline" className={getRiskColor(strategy.risk)}>
                                      {strategy.risk} Risk
                                    </Badge>
                                  )}
                                  {strategy.isActive && (
                                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                  {strategy.summary}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-gray-200">
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{strategy.moduleCount}/8 modules</span>
                                  </div>
                                  {strategy.roiRange && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span>{strategy.roiRange} ROI</span>
                                    </div>
                                  )}
                                  {strategy.track?.estimatedDuration && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{strategy.track.estimatedDuration}</span>
                                    </div>
                                  )}
                                  {strategy.track?.difficulty && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                                      {strategy.track.difficulty}
                                    </Badge>
                                  )}
                                </div>

                                {/* Tags */}
                                {strategy.tags && strategy.tags.length > 0 && (
                                  <div className="flex items-center gap-1 mt-3">
                                    {strategy.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="border-gray-500/30 text-gray-200 text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  onClick={() => handleViewStrategy(strategy.slug)}
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                
                                <Button
                                  onClick={() => handleEditStrategy(strategy.slug)}
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm text-gray-200 mb-1">
                                <span>Module Progress</span>
                                <span className={strategy.moduleCount === 8 ? 'text-green-400' : 'text-orange-400'}>
                                  {strategy.moduleCount === 8 ? 'Complete' : 'Incomplete'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${strategy.moduleCount === 8 ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${(strategy.moduleCount / 8) * 100}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.slice(1).map((category) => {
                        const count = (strategies as Strategy[]).filter(s => s.category === category).length;
                        const percentage = Math.round((count / Math.max((strategies as Strategy[]).length, 1)) * 100);
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm">{category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="h-2 bg-blue-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-200 w-12 text-right">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Level Distribution */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle>Risk Level Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskLevels.slice(1).map((risk) => {
                        const count = (strategies as Strategy[]).filter(s => s.risk === risk).length;
                        const percentage = Math.round((count / Math.max((strategies as Strategy[]).length, 1)) * 100);
                        const color = risk === 'Low' ? 'bg-green-500' : risk === 'Medium' ? 'bg-orange-500' : 'bg-red-500';
                        return (
                          <div key={risk} className="flex items-center justify-between">
                            <span className="text-sm">{risk} Risk</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 ${color} rounded-full transition-all`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-200 w-12 text-right">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}