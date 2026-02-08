import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  GraduationCap,
  Search,
  RefreshCw,
  Download,
  Upload,
  Settings,
  CheckCircle2,
  AlertCircle,
  Play,
  Database,
  Eye,
  Edit3,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  id: string;
  slug: string;
  title: string;
  category: string;
  moduleCount: number;
  modules: Module[];
  track?: {
    difficulty: string;
    estimatedDuration: string;
  };
}

interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: string;
  orderIndex: number;
  content: any;
}

export default function AdminTraining() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch training strategies from the enhanced_training_strategies table
  // Using default queryFn which automatically fetches and parses JSON
  const { data: strategies = [], isLoading: strategiesLoading, refetch: refetchStrategies } = useQuery({
    queryKey: ['/api/strategies'],
  });

  // Seed all content mutation
  const seedMutation = useMutation({
    mutationFn: () => apiRequest('/api/training/seed-all', 'POST'),
    onSuccess: () => {
      toast({
        title: "Content seeded successfully",
        description: "All 24 training strategies and modules have been seeded.",
      });
      refetchStrategies();
    },
    onError: (error: any) => {
      toast({
        title: "Seeding failed",
        description: error.message || "Failed to seed training content",
        variant: "destructive",
      });
    },
  });

  // Export content mutation
  const exportMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/export/training', 'GET'),
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-content-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Training content has been exported to JSON file.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export training content",
        variant: "destructive",
      });
    },
  });

  // Filter strategies
  const filteredStrategies = (strategies as Strategy[]).filter((strategy) => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || strategy.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set((strategies as Strategy[]).map(s => s.category)))];

  const handleViewStrategy = (slug: string) => {
    window.open(`/training-system-test`, '_blank');
  };

  const handleEditStrategy = (slug: string) => {
    window.location.href = `/admin/content?path=/academy/strategy/${slug}`;
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Training Management</h1>
              <p className="text-gray-300">
                Manage all 24 trading strategies and their training modules
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

          {/* Actions Bar */}
          <Card className="bg-white/10 border-white/20 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
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
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => refetchStrategies()}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  
                  <Button
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {exportMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                  </Button>
                  
                  <Button
                    onClick={() => seedMutation.mutate()}
                    disabled={seedMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {seedMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4 mr-2" />
                    )}
                    Seed All Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">Total Strategies</p>
                    <p className="text-2xl font-bold">{(strategies as Strategy[]).length}</p>
                    <p className="text-xs text-gray-200">Target: 24</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">Total Modules</p>
                    <p className="text-2xl font-bold">
                      {(strategies as Strategy[]).reduce((sum, s) => sum + s.moduleCount, 0)}
                    </p>
                    <p className="text-xs text-gray-200">Target: 192</p>
                  </div>
                  <Settings className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">Complete Sets</p>
                    <p className="text-2xl font-bold">
                      {(strategies as Strategy[]).filter(s => s.moduleCount === 8).length}
                    </p>
                    <p className="text-xs text-gray-200">8 modules each</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">System Status</p>
                    <p className="text-lg font-bold">
                      {(strategies as Strategy[]).length === 24 && 
                       (strategies as Strategy[]).reduce((sum, s) => sum + s.moduleCount, 0) === 192 ? (
                        <span className="text-green-400">✓ Complete</span>
                      ) : (
                        <span className="text-orange-400">⚠ Incomplete</span>
                      )}
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategies List */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Training Strategies ({filteredStrategies.length})
              </CardTitle>
              <CardDescription className="text-gray-200">
                All trading strategies with their training modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {strategiesLoading ? (
                <div className="flex items-center justify-center p-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="ml-3 text-gray-200">Loading strategies...</span>
                </div>
              ) : filteredStrategies.length === 0 ? (
                <Alert className="bg-orange-500/20 border-orange-500/30 text-orange-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchTerm || selectedCategory !== "all" 
                      ? "No strategies match your search criteria." 
                      : "No training strategies found. Click 'Seed All Content' to populate the database."
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {filteredStrategies.map((strategy) => (
                    <Card key={strategy.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{strategy.title}</h3>
                              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                {strategy.category}
                              </Badge>
                              <Badge variant="outline" className={`border-${strategy.moduleCount === 8 ? 'green' : 'orange'}-500/30 text-${strategy.moduleCount === 8 ? 'green' : 'orange'}-400`}>
                                {strategy.moduleCount}/8 modules
                              </Badge>
                              {strategy.track?.difficulty && (
                                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                                  {strategy.track.difficulty}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-200">
                              <span>ID: {strategy.slug}</span>
                              {strategy.track?.estimatedDuration && (
                                <span>Duration: {strategy.track.estimatedDuration}</span>
                              )}
                              <span>
                                {strategy.moduleCount === 8 ? (
                                  <span className="text-green-400">✓ Complete</span>
                                ) : (
                                  <span className="text-orange-400">⚠ Incomplete</span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
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
                        
                        {/* Module Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-gray-200 mb-1">
                            <span>Modules Progress</span>
                            <span>{strategy.moduleCount}/8</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${strategy.moduleCount === 8 ? 'bg-green-500' : 'bg-blue-500'}`}
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
        </div>
      </div>
    </AdminGuard>
  );
}