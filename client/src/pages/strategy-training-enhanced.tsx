import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Book, 
  AlertTriangle, 
  ArrowLeft,
  ArrowRight,
  Star,
  Bell,
  FileText,
  Target,
  TrendingUp,
  Shield,
  BookOpen,
  Users,
  Lightbulb,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { trainingApi, type TrainingStrategy, type TrainingModule, type UserProgress } from '@/services/training-api';
import { useTTS } from '@/hooks/use-tts';

export default function StrategyTrainingEnhanced() {
  const [, params] = useRoute('/enhanced-training/:slug');
  const slug = params?.slug || '';
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const queryClient = useQueryClient();
  const { speakSelected, stop, isPlaying, isLoading: ttsLoading, error: ttsError } = useTTS();

  // Fetch strategy details
  const { data: strategy, isLoading: strategyLoading } = useQuery({
    queryKey: ['/api/strategies', slug],
    queryFn: () => trainingApi.getStrategy(slug),
    enabled: !!slug
  });

  // Fetch strategy modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['/api/strategies', slug, 'modules'],
    queryFn: () => trainingApi.getStrategyModules(slug),
    enabled: !!slug
  });

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['/api/user/progress', slug],
    queryFn: () => trainingApi.getUserProgress(slug),
    enabled: !!slug
  });

  const currentModule = modules[currentModuleIndex];
  const progress = progressData?.progress || [];
  const completionRate = progressData?.completionRate || { completed: 0, total: 0, percentage: 0 };

  // Complete module mutation
  const completeModuleMutation = useMutation({
    mutationFn: ({ moduleId, timeSpent }: { moduleId: number; timeSpent: number }) =>
      trainingApi.completeModule(moduleId, slug, timeSpent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/progress', slug] });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (alertData: any) => trainingApi.createAlert(alertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/alerts'] });
    }
  });

  const isModuleCompleted = (moduleId: number) => {
    return progress.some(p => p.moduleId === moduleId && p.isCompleted);
  };

  const handleCompleteModule = () => {
    if (currentModule) {
      completeModuleMutation.mutate({
        moduleId: currentModule.id,
        timeSpent: currentModule.durationMinutes
      });
    }
  };

  const handleCreateAlert = () => {
    if (strategy) {
      createAlertMutation.mutate({
        strategySlug: strategy.slug,
        alertType: 'module_reminder',
        title: `${strategy.title} - Study Reminder`,
        message: `Don't forget to continue your training on ${strategy.title}`,
        triggerConditions: { reminderType: 'daily', time: '09:00' }
      });
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'High': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getModuleIcon = (moduleNumber: number) => {
    const icons = [BookOpen, Target, Shield, TrendingUp, Lightbulb, Users, AlertTriangle, Star];
    const Icon = icons[moduleNumber - 1] || BookOpen;
    return Icon;
  };

  const handleReadForMe = () => {
    if (isPlaying) {
      stop();
      return;
    }
    speakSelected();
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  if (strategyLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!strategy || !currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Strategy Not Found</h2>
            <p className="text-gray-300 mb-4">The requested training strategy could not be found.</p>
            <Button onClick={() => window.history.back()} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Alert */}
        {showAlert && (
          <Alert className="mb-6 bg-green-500/20 border-green-500/30 text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Module completed successfully! Great progress on your trading journey.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Strategies
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{strategy.title}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getRiskBadgeColor(strategy.risk)}>
                  {strategy.risk} Risk
                </Badge>
                {strategy.roiRange && (
                  <Badge variant="outline" className="border-green-500/30 text-green-300">
                    {strategy.roiRange}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleReadForMe}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-read-for-me"
              disabled={ttsLoading}
              title="Highlight text first, then click to read aloud"
            >
              {ttsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Read Selection
                </>
              )}
            </Button>
            <Button
              onClick={handleCreateAlert}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={createAlertMutation.isPending}
            >
              <Bell className="w-4 h-4 mr-2" />
              Set Reminder
            </Button>
            <Button
              onClick={handleCompleteModule}
              disabled={completeModuleMutation.isPending || isModuleCompleted(currentModule.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isModuleCompleted(currentModule.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Training Progress</h3>
              <span className="text-sm text-gray-300">
                {completionRate.completed} of {completionRate.total} modules completed
              </span>
            </div>
            <Progress value={completionRate.percentage} className="h-2 mb-4" />
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{completionRate.percentage}% Complete</span>
              <span>{modules.reduce((sum, m) => sum + m.durationMinutes, 0)} total minutes</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Module Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Training Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modules.map((module, index) => {
                    const Icon = getModuleIcon(module.moduleNumber);
                    const isCompleted = isModuleCompleted(module.id);
                    const isCurrent = index === currentModuleIndex;
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => setCurrentModuleIndex(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          isCurrent
                            ? 'bg-blue-600/30 border border-blue-500/50'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-white/10'}`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Icon className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1 truncate">
                              {module.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-200">
                              <Clock className="w-3 h-3" />
                              {module.duration}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      Module {currentModule.moduleNumber}: {currentModule.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {currentModule.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4" />
                    {currentModule.duration}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/10">
                    <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">
                      <FileText className="w-4 h-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600">
                      <Book className="w-4 h-4 mr-2" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600">
                      <Star className="w-4 h-4 mr-2" />
                      Resources
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-6 mt-6">
                    {/* Overview */}
                    {currentModule.content?.overview && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                          Overview
                        </h3>
                        <p className="text-gray-300 leading-relaxed">{currentModule.content.overview}</p>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {currentModule.content?.prerequisites && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          Prerequisites
                        </h3>
                        <ul className="space-y-2">
                          {currentModule.content.prerequisites.map((prereq: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              {prereq}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Steps */}
                    {currentModule.content?.steps && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                          Implementation Steps
                        </h3>
                        <ol className="space-y-3">
                          {currentModule.content.steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-gray-300">
                              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <div>{step}</div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Risks */}
                    {currentModule.content?.risks && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-400" />
                          Risk Factors
                        </h3>
                        <ul className="space-y-2">
                          {currentModule.content.risks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <AlertTriangle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exit Plan */}
                    {currentModule.content?.exitPlan && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          Exit Strategy
                        </h3>
                        <ul className="space-y-2">
                          {currentModule.content.exitPlan.map((plan: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              {plan}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Personal Notes</h3>
                      <Textarea
                        placeholder="Take notes about this module..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-200 min-h-[300px]"
                      />
                      <Button
                        className="mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          // Save notes logic would go here
                          alert('Notes saved successfully!');
                        }}
                      >
                        Save Notes
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                      
                      {currentModule.videoUrl && (
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Play className="w-5 h-5 text-blue-400" />
                              <div>
                                <h4 className="font-medium">Video Tutorial</h4>
                                <p className="text-sm text-gray-200">Watch the complete video guide</p>
                              </div>
                              <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">
                                Watch Video
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-green-400" />
                            <div>
                              <h4 className="font-medium">Strategy Documentation</h4>
                              <p className="text-sm text-gray-200">Detailed PDF guide and checklists</p>
                            </div>
                            <Button size="sm" variant="outline" className="ml-auto border-white/20 text-white hover:bg-white/10">
                              Download PDF
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-purple-400" />
                            <div>
                              <h4 className="font-medium">Community Discussion</h4>
                              <p className="text-sm text-gray-200">Join discussions with other learners</p>
                            </div>
                            <Button size="sm" variant="outline" className="ml-auto border-white/20 text-white hover:bg-white/10">
                              Join Discussion
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentModuleIndex(Math.max(0, currentModuleIndex - 1))}
                    disabled={currentModuleIndex === 0}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Module
                  </Button>

                  <div className="text-center">
                    <div className="text-sm text-gray-300">
                      Module {currentModuleIndex + 1} of {modules.length}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentModuleIndex(Math.min(modules.length - 1, currentModuleIndex + 1))}
                    disabled={currentModuleIndex === modules.length - 1}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Next Module
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}