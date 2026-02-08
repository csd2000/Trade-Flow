import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  CheckCircle, 
  Play,
  Lock,
  Clock,
  Users,
  Star,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Heart,
  Shield
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  duration: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  keyTakeaways: string[];
  practiceExercises: string[];
}

export function TradingPsychologyModule() {
  const [activeModule, setActiveModule] = useState<string>("module-1");
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const modules: Module[] = [
    {
      id: "module-1",
      title: "Understanding Trading Psychology",
      duration: "45 min",
      description: "Learn the fundamental psychological principles that drive market behavior and trader decision-making",
      isCompleted: false,
      isLocked: false,
      keyTakeaways: [
        "Identify emotional triggers in trading",
        "Understand fear and greed cycles",
        "Recognize cognitive biases",
        "Build emotional awareness"
      ],
      practiceExercises: [
        "Daily emotion tracking journal",
        "Bias identification exercises",
        "Mindfulness meditation (10 min)",
        "Trade review reflection"
      ]
    },
    {
      id: "module-2", 
      title: "Mastering Fear & Greed",
      duration: "60 min",
      description: "Deep dive into the two primary emotions that destroy trading accounts and how to overcome them",
      isCompleted: false,
      isLocked: true,
      keyTakeaways: [
        "Transform fear into calculated caution",
        "Channel greed into disciplined profit-taking",
        "Develop emotional regulation techniques",
        "Create systematic decision frameworks"
      ],
      practiceExercises: [
        "Fear assessment questionnaire",
        "Greed trigger identification",
        "Breathing exercises for stress",
        "Position sizing calculator practice"
      ]
    },
    {
      id: "module-3",
      title: "Developing Trading Discipline",
      duration: "50 min", 
      description: "Build unshakeable discipline through proven psychological techniques and habit formation",
      isCompleted: false,
      isLocked: true,
      keyTakeaways: [
        "Create automated trading routines",
        "Build consistent habits",
        "Overcome impulsive decisions",
        "Strengthen mental resilience"
      ],
      practiceExercises: [
        "Daily routine checklist",
        "Habit stacking exercises",
        "Impulse control challenges",
        "Mental rehearsal techniques"
      ]
    },
    {
      id: "module-4",
      title: "Risk Psychology & Money Management",
      duration: "55 min",
      description: "Understand the psychological aspects of risk and develop a healthy relationship with money",
      isCompleted: false,
      isLocked: true,
      keyTakeaways: [
        "Reframe relationship with losses",
        "Understand risk perception biases",
        "Develop money management psychology",
        "Build long-term wealth mindset"
      ],
      practiceExercises: [
        "Risk tolerance assessment",
        "Loss acceptance exercises",
        "Wealth visualization techniques",
        "Goal setting workshops"
      ]
    }
  ];

  const handleCompleteModule = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
      
      // Unlock next module
      const currentIndex = modules.findIndex(m => m.id === moduleId);
      if (currentIndex < modules.length - 1) {
        const nextModule = modules[currentIndex + 1];
        modules[currentIndex + 1].isLocked = false;
      }
    }
  };

  const getCurrentModule = () => {
    return modules.find(m => m.id === activeModule) || modules[0];
  };

  const overallProgress = (completedModules.length / modules.length) * 100;

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-crypto-text">Trading Psychology Mastery</CardTitle>
                <p className="text-crypto-muted">Master the mental game of successful trading</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-crypto-primary">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-crypto-muted">Complete</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-crypto-text">Course Progress</span>
              <span className="text-crypto-muted">{completedModules.length}/{modules.length} modules</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-crypto-text">Course Modules</h3>
          {modules.map((module, index) => (
            <Card 
              key={module.id} 
              className={`cursor-pointer transition-all ${
                activeModule === module.id 
                  ? 'bg-crypto-primary/10 border-crypto-primary/30' 
                  : 'bg-crypto-surface border-crypto-border hover:border-crypto-primary/20'
              }`}
              onClick={() => !module.isLocked && setActiveModule(module.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    completedModules.includes(module.id)
                      ? 'bg-green-500 text-white'
                      : module.isLocked
                      ? 'bg-gray-500 text-gray-300'
                      : 'bg-crypto-primary text-white'
                  }`}>
                    {completedModules.includes(module.id) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : module.isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${module.isLocked ? 'text-crypto-muted' : 'text-crypto-text'}`}>
                      {module.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-crypto-muted" />
                      <span className="text-xs text-crypto-muted">{module.duration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Content */}
        <div className="lg:col-span-2 space-y-6">
          {(() => {
            const currentModule = getCurrentModule();
            
            return (
              <>
                {/* Module Header */}
                <Card className="bg-crypto-surface border-crypto-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-crypto-text">{currentModule.title}</CardTitle>
                        <p className="text-crypto-muted mt-2">{currentModule.description}</p>
                      </div>
                      <Badge variant="outline" className="text-crypto-primary">
                        {currentModule.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {!currentModule.isLocked ? (
                      <Button 
                        onClick={() => handleCompleteModule(currentModule.id)}
                        className="bg-crypto-primary hover:bg-crypto-primary/90"
                        disabled={completedModules.includes(currentModule.id)}
                      >
                        {completedModules.includes(currentModule.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Module
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm">Complete previous modules to unlock</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Takeaways */}
                <Card className="bg-crypto-surface border-crypto-border">
                  <CardHeader>
                    <CardTitle className="text-crypto-text flex items-center gap-2">
                      <Target className="w-5 h-5 text-crypto-primary" />
                      Key Learning Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentModule.keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-crypto-text text-sm">{takeaway}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Practice Exercises */}
                <Card className="bg-crypto-surface border-crypto-border">
                  <CardHeader>
                    <CardTitle className="text-crypto-text flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-crypto-accent" />
                      Practice Exercises
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentModule.practiceExercises.map((exercise, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-crypto-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-crypto-text text-sm">{exercise}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Psychology Tips */}
                <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-crypto-text flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-400" />
                      Mindful Trading Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-green-400 font-medium text-sm">Emotional Protection</div>
                        <p className="text-crypto-muted text-sm">
                          Use pre-defined rules to protect yourself from emotional decisions during volatile markets
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-blue-400 font-medium text-sm">Consistent Growth</div>
                        <p className="text-crypto-muted text-sm">
                          Small, consistent improvements in psychology lead to exponential trading results
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}