import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Brain, 
  BookOpen, 
  Trophy, 
  Users,
  ArrowRight,
  Star,
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  GraduationCap
} from "lucide-react";

export function MindfulStudyQuickAction() {
  const featuredCourses = [
    {
      title: "Trading Psychology Mastery",
      duration: "8 weeks",
      rating: 4.8,
      students: 15420,
      category: "Psychology"
    },
    {
      title: "Advanced Technical Analysis", 
      duration: "10 weeks",
      rating: 4.9,
      students: 12300,
      category: "Technical"
    },
    {
      title: "Risk Management Pro",
      duration: "6 weeks", 
      rating: 4.7,
      students: 18650,
      category: "Risk"
    }
  ];

  const achievements = {
    totalStudents: "50,000+",
    successRate: "87%",
    coursesAvailable: "25+",
    avgRating: "4.8"
  };

  const upcomingSession = {
    title: "Live Market Analysis",
    time: "Today 2:00 PM EST",
    instructor: "Dr. Sarah Chen",
    topic: "Psychology of Support & Resistance"
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 hover-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-crypto-text">Mindful Study Education</CardTitle>
              <p className="text-crypto-muted text-sm">Professional Trading Psychology</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-crypto-text text-sm font-medium">{achievements.avgRating}</span>
            </div>
            <p className="text-crypto-muted text-xs">Student Rating</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-crypto-surface rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-crypto-muted text-xs">Students</span>
            </div>
            <div className="text-crypto-text font-semibold">{achievements.totalStudents}</div>
          </div>
          <div className="p-3 bg-crypto-surface rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-crypto-muted text-xs">Success Rate</span>
            </div>
            <div className="text-crypto-text font-semibold">{achievements.successRate}</div>
          </div>
        </div>

        {/* Upcoming Live Session */}
        <div className="p-3 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-crypto-text font-medium text-sm">Live Session Today</span>
          </div>
          <div className="space-y-1">
            <div className="text-crypto-text font-semibold text-sm">{upcomingSession.title}</div>
            <div className="flex items-center gap-2 text-xs text-crypto-muted">
              <Clock className="w-3 h-3" />
              <span>{upcomingSession.time}</span>
            </div>
            <div className="text-xs text-crypto-muted">{upcomingSession.topic}</div>
          </div>
        </div>

        {/* Featured Courses */}
        <div>
          <h4 className="text-crypto-text font-medium mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Featured Courses
          </h4>
          <div className="space-y-2">
            {featuredCourses.slice(0, 2).map((course, index) => (
              <div key={index} className="p-3 bg-crypto-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-crypto-text font-semibold text-sm">{course.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                    {course.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-crypto-muted">
                    <span>{course.duration}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <span className="text-crypto-muted">{(course.students / 1000).toFixed(1)}k students</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Philosophy */}
        <div className="p-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-lg border border-indigo-500/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-indigo-400 font-medium text-sm">Mindful Learning Approach</div>
              <p className="text-crypto-muted text-xs mt-1">
                Master trading psychology through proven mindfulness techniques and professional strategies
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link href="/mindful-study">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white group">
              <Brain className="w-4 h-4 mr-2" />
              Access Education Platform
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              Browse Courses
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Join Live Session
            </Button>
          </div>
        </div>

        {/* Market Psychology Insight */}
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-yellow-400 font-medium text-sm">Market Psychology Insight</div>
              <p className="text-crypto-muted text-xs mt-1">
                "95% of trading success comes from proper psychology and risk management" - Professional traders study
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}