import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen,
  GraduationCap, 
  Calendar,
  Users,
  Clock,
  Star,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Zap,
  Shield,
  DollarSign,
  Globe,
  Video,
  FileText,
  Bookmark
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  students: number;
  description: string;
  lessons: number;
  completed: boolean;
}

interface LiveCall {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  expert: string;
  topic: string;
  attendees: number;
  recording: boolean;
}

export default function CryptoEducationHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const { data: liveCalls = [], isLoading: callsLoading } = useQuery<LiveCall[]>({
    queryKey: ['/api/live-calls'],
  });

  const categories = [
    { id: 'all', name: 'All Categories', count: courses.length },
    { id: 'DeFi Basics', name: 'DeFi Basics', count: courses.filter(c => c.category === 'DeFi Basics').length },
    { id: 'Yield Strategies', name: 'Yield Strategies', count: courses.filter(c => c.category === 'Yield Strategies').length },
    { id: 'Portfolio Management', name: 'Portfolio Management', count: courses.filter(c => c.category === 'Portfolio Management').length },
    { id: 'Tax Planning', name: 'Tax Planning', count: courses.filter(c => c.category === 'Tax Planning').length },
    { id: 'Trading', name: 'Trading', count: courses.filter(c => c.category === 'Trading').length },
    { id: 'Airdrops', name: 'Airdrops', count: courses.filter(c => c.category === 'Airdrops').length }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return 'badge-success';
      case 'intermediate': return 'badge-warning';
      case 'advanced': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-crypto-tertiary';
      case 'intermediate': return 'text-crypto-quaternary';
      case 'advanced': return 'text-red-400';
      default: return 'text-crypto-text';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (coursesLoading || callsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          title="Education Hub"
          subtitle="Master DeFi with 100+ expert-curated classes"
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="crypto-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-crypto-surface rounded mb-4"></div>
                  <div className="h-4 bg-crypto-surface rounded mb-2"></div>
                  <div className="h-4 bg-crypto-surface rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Education Hub"
        subtitle="Master DeFi with 100+ expert-curated classes and live weekly calls"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gradient mb-2">100+</div>
              <div className="text-crypto-text font-semibold mb-1">Expert Classes</div>
              <div className="text-crypto-muted text-sm">Professional content</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-tertiary mb-2">Weekly</div>
              <div className="text-crypto-text font-semibold mb-1">Live Calls</div>
              <div className="text-crypto-muted text-sm">Interactive sessions</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-primary mb-2">24/7</div>
              <div className="text-crypto-text font-semibold mb-1">Community</div>
              <div className="text-crypto-muted text-sm">Global support</div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-crypto-quaternary mb-2">20%</div>
              <div className="text-crypto-text font-semibold mb-1">Partner Program</div>
              <div className="text-crypto-muted text-sm">Earn commissions</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="live-calls">Live Calls</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="bonuses">Member Bonuses</TabsTrigger>
            <TabsTrigger value="partner">Partner Program</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Filters */}
            <Card className="crypto-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Filter by Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className={`${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                          {category.name} ({category.count})
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-crypto-text">Difficulty Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {levels.map((level) => (
                        <Button
                          key={level.id}
                          onClick={() => setSelectedLevel(level.id)}
                          variant={selectedLevel === level.id ? "default" : "ghost"}
                          className={`${selectedLevel === level.id ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                          {level.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="crypto-card-premium hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getLevelBadge(course.level)}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-crypto-quaternary fill-current" />
                        <span className="text-crypto-text font-semibold">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-crypto-text mb-2">
                      {course.title}
                    </CardTitle>
                    <div className="text-crypto-muted text-sm mb-2">
                      by {course.instructor}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-crypto-muted text-sm">{course.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-crypto-muted text-sm">Duration</div>
                        <div className="font-semibold text-crypto-text">{course.duration}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Lessons</div>
                        <div className="font-semibold text-crypto-text">{course.lessons}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Students</div>
                        <div className="font-semibold text-crypto-text">{course.students.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-crypto-muted text-sm">Category</div>
                        <div className="font-semibold text-crypto-text">{course.category}</div>
                      </div>
                    </div>

                    {course.completed ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                          <span className="text-crypto-tertiary font-semibold text-sm">Completed</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-crypto-muted">Progress</span>
                          <span className="text-crypto-text">0% Complete</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button className="btn-primary flex-1">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {course.completed ? 'Review' : 'Start Course'}
                      </Button>
                      <Button className="btn-secondary">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live-calls" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Weekly Live Calls & Expert Sessions
                </CardTitle>
                <p className="text-crypto-muted">
                  Join live interactive sessions with industry experts and get your questions answered
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {liveCalls.map((call) => (
                  <Card key={call.id} className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-crypto-text mb-2">{call.title}</h3>
                          <div className="flex items-center space-x-4 text-crypto-muted text-sm mb-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(call.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{call.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{call.attendees} attending</span>
                            </div>
                          </div>
                          <p className="text-crypto-muted text-sm mb-3">{call.topic}</p>
                          <div className="text-crypto-text font-semibold">
                            Expert: {call.expert}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge className="badge-primary">Live Call</Badge>
                          {call.recording && (
                            <Badge className="badge-secondary">Recorded</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button className="btn-primary">
                          <Video className="w-4 h-4 mr-2" />
                          Join Call
                        </Button>
                        <Button className="btn-secondary">
                          <Calendar className="w-4 h-4 mr-2" />
                          Add to Calendar
                        </Button>
                        {call.recording && (
                          <Button className="btn-secondary">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Watch Recording
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Global DeFi Community
                </CardTitle>
                <p className="text-crypto-muted">
                  Connect with thousands of DeFi investors and traders worldwide
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="crypto-card-premium">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-primary/15 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-crypto-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Discord Community</h3>
                      <div className="text-2xl font-bold text-crypto-primary mb-2">15,000+</div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Active members sharing strategies and insights
                      </p>
                      <Button className="btn-primary w-full">
                        Join Discord
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-tertiary/15 rounded-full flex items-center justify-center">
                        <Globe className="w-8 h-8 text-crypto-tertiary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Telegram Group</h3>
                      <div className="text-2xl font-bold text-crypto-tertiary mb-2">24/7</div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Real-time market updates and quick discussions
                      </p>
                      <Button className="btn-secondary w-full">
                        Join Telegram
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-quaternary/15 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-crypto-quaternary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Daily Updates</h3>
                      <div className="text-2xl font-bold text-crypto-quaternary mb-2">Daily</div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Market analysis and strategy recommendations
                      </p>
                      <Button className="btn-secondary w-full">
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-crypto-card rounded-lg">
                  <h3 className="text-lg font-bold text-crypto-text mb-4">
                    Community Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Strategy sharing & discussion</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Weekly AMA sessions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Expert Q&A channels</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Risk management discussions</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">New project alerts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Yield farming opportunities</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Market sentiment tracking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Portfolio reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bonuses" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  Exclusive Annual Member Bonuses
                </CardTitle>
                <p className="text-crypto-muted">
                  Premium content and benefits for committed members
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="crypto-card-premium border-2 border-crypto-primary border-opacity-30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-primary/15 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-crypto-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Portfolio Coin by Coin</h3>
                          <p className="text-crypto-muted text-sm">Professional training</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Complete guide to building successful crypto portfolios with detailed asset analysis and allocation strategies.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Value</span>
                          <span className="text-crypto-primary font-semibold">$497</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Status</span>
                          <span className="text-crypto-tertiary font-semibold">Included</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-tertiary/15 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-crypto-tertiary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Crypto Tax Course</h3>
                          <p className="text-crypto-muted text-sm">CPA-certified training</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        13 comprehensive videos from certified tax professionals covering crypto taxation, reporting, and optimization strategies.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Value</span>
                          <span className="text-crypto-primary font-semibold">$397</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Status</span>
                          <span className="text-crypto-tertiary font-semibold">Included</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-crypto-quaternary/15 rounded-lg flex items-center justify-center">
                          <Video className="w-6 h-6 text-crypto-quaternary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">Live Call Recordings</h3>
                          <p className="text-crypto-muted text-sm">Complete archive access</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Access to complete archive of all live call recordings, including exclusive member-only sessions and Q&A.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Value</span>
                          <span className="text-crypto-primary font-semibold">$597</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Status</span>
                          <span className="text-crypto-tertiary font-semibold">Included</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-red-500/15 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-crypto-text">DeFi Safety Mastery</h3>
                          <p className="text-crypto-muted text-sm">Risk management course</p>
                        </div>
                      </div>
                      <p className="text-crypto-muted text-sm mb-4">
                        Complete safety framework including the 11-point checklist that predicted FTX, Celsius, and BlockFi failures.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Value</span>
                          <span className="text-crypto-primary font-semibold">$297</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-crypto-muted text-sm">Status</span>
                          <span className="text-crypto-tertiary font-semibold">Included</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-gradient-to-r from-crypto-primary/10 to-crypto-tertiary/10 rounded-lg border border-crypto-primary/20">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-crypto-text mb-2">
                      Total Bonus Value: $1,788
                    </h3>
                    <p className="text-crypto-muted mb-4">
                      All included with annual membership - no additional costs
                    </p>
                    <Button className="btn-primary text-lg px-8">
                      <Award className="w-5 h-5 mr-2" />
                      Claim Your Bonuses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partner" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-crypto-text">
                  20% Partner Program
                </CardTitle>
                <p className="text-crypto-muted">
                  Earn substantial commissions by sharing our proven DeFi education platform
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="crypto-card-premium text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-primary/15 rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-crypto-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">20% Commission</h3>
                      <div className="text-2xl font-bold text-crypto-primary mb-2">Recurring</div>
                      <p className="text-crypto-muted text-sm">
                        Earn 20% on all sales including renewals and upsells
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-tertiary/15 rounded-full flex items-center justify-center">
                        <Target className="w-8 h-8 text-crypto-tertiary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">High Conversion</h3>
                      <div className="text-2xl font-bold text-crypto-tertiary mb-2">12%+</div>
                      <p className="text-crypto-muted text-sm">
                        Industry-leading conversion rates with proven track record
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="crypto-card-premium text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-crypto-quaternary/15 rounded-full flex items-center justify-center">
                        <Zap className="w-8 h-8 text-crypto-quaternary" />
                      </div>
                      <h3 className="text-lg font-bold text-crypto-text mb-2">Fast Payouts</h3>
                      <div className="text-2xl font-bold text-crypto-quaternary mb-2">Weekly</div>
                      <p className="text-crypto-muted text-sm">
                        Reliable weekly payments with detailed tracking
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-crypto-text">Partner Benefits</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Professional marketing materials</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Dedicated affiliate manager support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Real-time analytics dashboard</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Email templates and campaigns</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Social media content library</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                        <span className="text-crypto-muted text-sm">Partner-only training sessions</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-crypto-text">Earning Potential</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">5 referrals/month</span>
                        <span className="text-crypto-primary font-semibold">$500-1,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">20 referrals/month</span>
                        <span className="text-crypto-primary font-semibold">$2,000-4,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">50 referrals/month</span>
                        <span className="text-crypto-primary font-semibold">$5,000-10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crypto-muted text-sm">100+ referrals/month</span>
                        <span className="text-crypto-primary font-semibold">$10,000+</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-crypto-primary/10 rounded-lg">
                      <p className="text-crypto-primary text-sm font-semibold">
                        Top partners earn $25,000+ monthly with our proven system
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button className="btn-primary text-lg px-8">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Apply for Partner Program
                  </Button>
                  <p className="text-crypto-muted text-sm mt-2">
                    Application review within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}