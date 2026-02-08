import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Users, 
  ArrowRight,
  Target,
  TrendingUp,
  Shield
} from "lucide-react";

export function LearningCenter() {
  const tutorials = [
    {
      id: "1",
      title: "DeFi Fundamentals",
      description: "Learn the basics of decentralized finance and how to get started safely",
      difficulty: "Beginner",
      duration: "15 min",
      category: "Basics",
      icon: BookOpen,
      color: "var(--crypto-primary)"
    },
    {
      id: "2", 
      title: "Yield Farming Strategies",
      description: "Master advanced yield farming techniques for maximum returns",
      difficulty: "Advanced",
      duration: "25 min",
      category: "Strategy",
      icon: Target,
      color: "var(--crypto-secondary)"
    },
    {
      id: "3",
      title: "Risk Management",
      description: "Protect your portfolio with professional risk management tools",
      difficulty: "Intermediate",
      duration: "20 min", 
      category: "Risk",
      icon: Shield,
      color: "var(--crypto-tertiary)"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'badge-success';
      case 'Intermediate': return 'badge-warning';
      case 'Advanced': return 'badge-error';
      default: return 'badge-primary';
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
              <div className="p-2 bg-crypto-secondary rounded-xl bg-opacity-15">
                <BookOpen className="w-5 h-5 text-crypto-secondary" />
              </div>
              Learning Center
            </CardTitle>
            <p className="text-crypto-muted mt-1">
              Master DeFi with step-by-step tutorials and guides
            </p>
          </div>
          <Button className="btn-secondary text-sm">
            <Play className="w-4 h-4 mr-1" />
            All Courses
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon;
          
          return (
            <div
              key={tutorial.id}
              className="p-4 rounded-xl bg-crypto-surface border border-crypto-border hover:border-crypto-primary transition-all duration-300 hover:bg-crypto-card group cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: tutorial.color + '20' }}
                >
                  <Icon className="w-6 h-6" style={{ color: tutorial.color }} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-crypto-text group-hover:text-crypto-primary transition-colors">
                      {tutorial.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-crypto-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <p className="text-crypto-muted text-sm mb-3 line-clamp-2">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <div className="flex items-center text-crypto-muted text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {tutorial.duration}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-crypto-muted text-xs">
                      <Star className="w-3 h-3 mr-1 text-crypto-quaternary" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Learning Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-crypto-border">
          <div className="text-center">
            <div className="text-xl font-bold text-crypto-secondary mb-1">
              12
            </div>
            <div className="text-crypto-muted text-xs">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-crypto-tertiary mb-1">
              3.2k
            </div>
            <div className="text-crypto-muted text-xs">Students</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-crypto-quaternary mb-1">
              4.9
            </div>
            <div className="text-crypto-muted text-xs">Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}