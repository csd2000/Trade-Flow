import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  BookOpen,
  Users,
  Clock,
  Star,
  Award,
  Target,
  CheckCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Building,
  GraduationCap,
  Heart,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  courseId: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  learningObjectives: string[];
  courseModules: Array<{
    module: string;
    lessons: number;
  }>;
  instructor: string;
  rating: number;
  studentCount: number;
  prerequisites: string[];
  completionRate: number;
}

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  totalStudyHours: number;
  averageRating: number;
  certificates: number;
}

export default function MindfulStudyEducation() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const { toast } = useToast();

  const learningStats: LearningStats = {
    totalCourses: 25,
    completedCourses: 8,
    totalStudyHours: 342,
    averageRating: 4.8,
    certificates: 3
  };

  // Mock data for now - will be replaced with API call
  const courses: Course[] = [
    {
      id: 1,
      courseId: 'trading-psychology-mastery',
      title: 'Trading Psychology Mastery',
      category: 'Psychology',
      level: 'Intermediate',
      duration: '8 weeks',
      description: 'Master the mental game of trading with proven psychological techniques used by professional traders worldwide.',
      learningObjectives: [
        'Develop emotional control under pressure',
        'Master fear and greed psychology',
        'Build consistent trading discipline',
        'Implement proper risk management mindset',
        'Create winning trading routines'
      ],
      courseModules: [
        { module: 'Foundation of Trading Psychology', lessons: 6 },
        { module: 'Emotional Control Techniques', lessons: 8 },
        { module: 'Risk Psychology', lessons: 5 },
        { module: 'Building Discipline', lessons: 7 }
      ],
      instructor: 'Dr. Sarah Chen',
      rating: 4.8,
      studentCount: 12847,
      prerequisites: ['Basic trading knowledge', '6+ months trading experience'],
      completionRate: 0
    },
    {
      id: 2,
      courseId: 'institutional-trading-methods',
      title: 'Institutional Trading Methods',
      category: 'Advanced Strategy',
      level: 'Advanced',
      duration: '12 weeks',
      description: 'Learn how institutional traders approach markets with systematic methodologies and professional-grade analysis.',
      learningObjectives: [
        'Understand institutional order flow',
        'Master market microstructure',
        'Implement systematic trading approaches',
        'Use professional risk management',
        'Develop institutional mindset'
      ],
      courseModules: [
        { module: 'Market Structure Analysis', lessons: 10 },
        { module: 'Order Flow Dynamics', lessons: 8 },
        { module: 'Systematic Approach', lessons: 12 },
        { module: 'Professional Risk Management', lessons: 6 }
      ],
      instructor: 'Michael Torres, CFA',
      rating: 4.9,
      studentCount: 8934,
      prerequisites: ['2+ years trading experience', 'Advanced market knowledge', 'Understanding of derivatives'],
      completionRate: 0
    },
    {
      id: 3,
      courseId: 'mindful-trading-approach',
      title: 'Mindful Trading Approach',
      category: 'Mindfulness',
      level: 'Beginner',
      duration: '6 weeks',
      description: 'Combine mindfulness techniques with trading for better decision-making and emotional regulation in volatile markets.',
      learningObjectives: [
        'Practice mindful trading techniques',
        'Reduce trading anxiety and stress',
        'Improve decision-making clarity',
        'Develop present-moment awareness',
        'Create balanced trading lifestyle'
      ],
      courseModules: [
        { module: 'Mindfulness Basics for Traders', lessons: 5 },
        { module: 'Stress Reduction Techniques', lessons: 6 },
        { module: 'Mindful Decision Making', lessons: 7 },
        { module: 'Work-Life Balance', lessons: 4 }
      ],
      instructor: 'Jennifer Walsh, Ph.D.',
      rating: 4.7,
      studentCount: 15632,
      prerequisites: ['Open mind', 'Commitment to practice', 'Basic meditation experience helpful'],
      completionRate: 0
    },
    {
      id: 4,
      courseId: 'professional-trader-certification',
      title: 'Professional Trader Certification',
      category: 'Certification',
      level: 'Expert',
      duration: '16 weeks',
      description: 'Comprehensive certification program covering all aspects of professional trading from technical analysis to portfolio management.',
      learningObjectives: [
        'Master all major trading strategies',
        'Complete professional risk management',
        'Understand regulatory requirements',
        'Develop trading business plan',
        'Pass certification examination'
      ],
      courseModules: [
        { module: 'Technical Analysis Mastery', lessons: 15 },
        { module: 'Fundamental Analysis', lessons: 12 },
        { module: 'Portfolio Management', lessons: 10 },
        { module: 'Regulatory Compliance', lessons: 8 },
        { module: 'Business Development', lessons: 6 }
      ],
      instructor: 'Robert Kim, CPA',
      rating: 4.9,
      studentCount: 3421,
      prerequisites: ['5+ years trading experience', 'Proven track record', 'Professional references', 'Portfolio review required'],
      completionRate: 0
    }
  ];

  const categories = ['all', 'Psychology', 'Advanced Strategy', 'Mindfulness', 'Certification'];

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-white dark:text-gray-700';
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    toast({
      title: "Enrolled Successfully!",
      description: "You've been enrolled in the course. Start learning immediately.",
    });
  };

  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Mindful Study Education</h1>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Professional trading psychology and education platform with structured learning paths from beginner to institutional level
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">{learningStats.totalCourses}</div>
                <div className="text-sm opacity-80">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{learningStats.completedCourses}</div>
                <div className="text-sm opacity-80">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{learningStats.totalStudyHours}h</div>
                <div className="text-sm opacity-80">Study Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{learningStats.averageRating}</div>
                <div className="text-sm opacity-80">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{learningStats.certificates}</div>
                <div className="text-sm opacity-80">Certificates</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">All Courses</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map(course => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          by {course.instructor}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-200 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.studentCount.toLocaleString()} students</span>
                      </div>
                    </div>

                    {/* Course Modules Preview */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Course Modules:</div>
                      <div className="space-y-1">
                        {course.courseModules.slice(0, 2).map((module, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="truncate">{module.module}</span>
                            <Badge variant="outline" className="text-xs">
                              {module.lessons} lessons
                            </Badge>
                          </div>
                        ))}
                        {course.courseModules.length > 2 && (
                          <div className="text-xs text-slate-300">
                            +{course.courseModules.length - 2} more modules
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {course.prerequisites.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Prerequisites:</div>
                        <div className="flex flex-wrap gap-1">
                          {course.prerequisites.slice(0, 2).map((prereq, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {isEnrolled(course.courseId) ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} />
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleEnrollCourse(course.courseId)}
                        className="w-full"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now - Free
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Overall Progress</span>
                      <span className="font-bold">32%</span>
                    </div>
                    <Progress value={32} className="mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">8</div>
                        <div className="text-sm text-slate-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">3</div>
                        <div className="text-sm text-slate-600">In Progress</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">3</div>
                        <div className="text-sm text-slate-600">Certificates</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">342h</div>
                        <div className="text-sm text-slate-600">Study Time</div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Award className="h-4 w-4" />
                    <AlertDescription>
                      Great progress! Complete 2 more courses to unlock the Advanced Trader certification pathway.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Study Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Trading Psychology Study Group</h4>
                      <p className="text-sm text-slate-600 mb-2">Weekly discussions on emotional control and mindset development</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">47 members</Badge>
                        <Button size="sm">Join Group</Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Professional Traders Network</h4>
                      <p className="text-sm text-slate-600 mb-2">Connect with certified professional traders for mentorship</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">123 members</Badge>
                        <Button size="sm">Join Group</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Weekly Q&A with Dr. Sarah Chen</h4>
                      <p className="text-sm text-slate-600 mb-2">Every Wednesday 7 PM EST</p>
                      <Button size="sm" className="w-full">
                        Join Next Session
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Monthly Trading Challenge</h4>
                      <p className="text-sm text-slate-600 mb-2">Practice strategies in simulated environment</p>
                      <Button size="sm" className="w-full">
                        Participate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}