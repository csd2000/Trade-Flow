import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  Infinity, 
  Crown,
  CheckCircle,
  ArrowRight,
  Zap,
  Star
} from "lucide-react";
import { Link } from "wouter";

interface ExperienceLevel {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  buttonText: string;
  buttonColor: string;
  isPremium?: boolean;
  route: string;
}

const experienceLevels: ExperienceLevel[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    badge: 'Getting Started',
    badgeColor: 'bg-green-500',
    description: 'New to trading? Start here!',
    features: ['Guided learning paths', 'Simplified interface', 'Safe strategies'],
    icon: <GraduationCap className="w-8 h-8 text-green-400" />,
    buttonText: 'Start Here',
    buttonColor: 'bg-green-500 hover:bg-green-600',
    route: '/free-training'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    badge: '1-2 Years',
    badgeColor: 'bg-blue-500',
    description: 'Know the basics, ready for more',
    features: ['Technical analysis tools', 'Market scanners', 'Risk management'],
    icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
    buttonText: 'Continue',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    route: '/power-scanner'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    badge: '3+ Years',
    badgeColor: 'bg-orange-500',
    description: 'Profitable trader, seeking edge',
    features: ['AI-powered signals', 'Options strategies', 'Multi-timeframe analysis'],
    icon: <Infinity className="w-8 h-8 text-orange-400" />,
    buttonText: "Let's Go",
    buttonColor: 'bg-orange-500 hover:bg-orange-600',
    route: '/secret-sauce-strategy'
  },
  {
    id: 'elite',
    name: 'Elite',
    badge: 'Professional',
    badgeColor: 'bg-purple-500',
    description: 'Full-time or institutional trader',
    features: ['Institutional data', 'Dark pool tracking', 'Automated execution'],
    icon: <Crown className="w-8 h-8 text-purple-400" />,
    buttonText: 'Access All',
    buttonColor: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    isPremium: true,
    route: '/hfc-apex-scanner'
  }
];

export function ExperienceLevelSelector() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [hasSelectedBefore, setHasSelectedBefore] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userExperienceLevel');
    if (saved) {
      setSelectedLevel(saved);
      setHasSelectedBefore(true);
    }
  }, []);

  const handleSelectLevel = (levelId: string) => {
    setSelectedLevel(levelId);
    localStorage.setItem('userExperienceLevel', levelId);
    setHasSelectedBefore(true);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30 mb-4">
          <Brain className="w-6 h-6 text-amber-400" />
          <span className="text-lg font-semibold text-white">AI Trading Assistant</span>
        </div>
        
        <p className="text-slate-400 text-sm mb-4">
          Get personalized trading strategy recommendations based on your unique risk profile, experience, and goals.
        </p>
        
        <Badge className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 px-4 py-1.5 mb-6">
          <Zap className="w-4 h-4 mr-1" />
          Welcome to Power Scanner Pro
        </Badge>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          What's your trading experience level?
        </h2>
        <p className="text-slate-400 text-sm">
          Select your level to get personalized tools, strategies, and a tailored experience designed just for you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {experienceLevels.map((level) => (
          <Card 
            key={level.id}
            className={`relative bg-slate-800/80 border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
              selectedLevel === level.id 
                ? 'border-cyan-500 shadow-cyan-500/20 shadow-lg' 
                : 'border-slate-700 hover:border-slate-600'
            }`}
            onClick={() => handleSelectLevel(level.id)}
          >
            {level.isPremium && (
              <div className="absolute -top-2 -right-2 z-10">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
            )}
            <CardContent className="p-4 sm:p-5">
              <div className="text-center mb-4">
                <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                  level.id === 'beginner' ? 'bg-green-500/20' :
                  level.id === 'intermediate' ? 'bg-blue-500/20' :
                  level.id === 'advanced' ? 'bg-orange-500/20' :
                  'bg-purple-500/20'
                }`}>
                  {level.icon}
                </div>
                
                <Badge className={`${level.badgeColor} text-white text-[10px] mb-2`}>
                  {level.badge}
                </Badge>
                
                <h3 className="text-lg font-bold text-white mb-1">{level.name}</h3>
                <p className="text-slate-400 text-xs">{level.description}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                {level.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${
                      level.id === 'beginner' ? 'text-green-400' :
                      level.id === 'intermediate' ? 'text-blue-400' :
                      level.id === 'advanced' ? 'text-orange-400' :
                      'text-purple-400'
                    }`} />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link href={level.route}>
                <Button 
                  className={`w-full ${level.buttonColor} text-white font-semibold text-sm`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {level.buttonText}
                  <ArrowRight className="w-4 h-4 ml-1" />
                  {level.isPremium && <Crown className="w-4 h-4 ml-1" />}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-slate-500 text-xs space-y-1">
        <p className="flex items-center justify-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Your selection customizes the experience. You can change it anytime in settings.
        </p>
        <p>All levels have access to learning resources. Higher levels unlock advanced professional tools.</p>
      </div>
    </div>
  );
}
