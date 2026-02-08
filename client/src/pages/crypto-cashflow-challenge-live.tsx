import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  DollarSign,
  Shield,
  Target,
  TrendingUp,
  Users,
  Play,
  CheckCircle,
  AlertTriangle,
  Zap,
  Award,
  BookOpen,
  BarChart3,
  Eye,
  Star,
  Globe,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChallengeDay {
  day: number;
  date: string;
  time: string;
  title: string;
  subtitle: string;
  topics: string[];
  status: 'upcoming' | 'live' | 'completed';
  attendees?: number;
}

interface BeforeAfter {
  before: string[];
  after: string[];
}

export default function CryptoCashflowChallengeLive() {
  const [timeUntilEvent, setTimeUntilEvent] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  // Event dates (July 20-22, 2025)
  const challengeDays: ChallengeDay[] = [
    {
      day: 1,
      date: "July 20th, 2025",
      time: "8:00 PM EST",
      title: "Crypto Cashflow Awakening",
      subtitle: "How to stop your crypto portfolio from collecting dust and create consistent daily cash flow",
      topics: [
        "The 4 types of crypto yield and which ones actually work without risking your entire portfolio",
        "What real passive income looks like and how smart money uses institutional-grade strategies", 
        "How to transform idle holdings into productive cash-generating assets",
        "The biggest mistakes crypto investors make with yield strategies"
      ],
      status: 'upcoming',
      attendees: 2847
    },
    {
      day: 2,
      date: "July 21st, 2025", 
      time: "8:00 PM EST",
      title: "Earning Your First Yield",
      subtitle: "How to pick the right liquidity pools so your portfolio earns yield instead of sitting idle",
      topics: [
        "Our 'set it and forget it' system that runs on autopilot with no constant babysitting",
        "The 3 foundational tools we use to produce predictable passive income",
        "Step-by-step walkthrough of setting up your first yield position",
        "Risk management strategies for sustainable long-term growth"
      ],
      status: 'upcoming',
      attendees: 2654
    },
    {
      day: 3,
      date: "July 22nd, 2025",
      time: "8:00 PM EST", 
      title: "The DeFi Danger Filter",
      subtitle: "The 11 laws to vet any DeFi play and protect your funds in any market",
      topics: [
        "How to avoid DeFi risks and impermanent loss so you can profit while others panic and sell",
        "The top stable yield pools currently earning 6–10% with low risk and zero technical headaches",
        "Advanced portfolio protection strategies used by institutional investors",
        "Building your permanent passive income system that works in any market"
      ],
      status: 'upcoming',
      attendees: 3021
    }
  ];

  const beforeAfter: BeforeAfter = {
    before: [
      "Still checking prices at 2am and losing sanity",
      "Holding coins with no cashflow, just price swings and regret", 
      "Still guessing your next move and hoping it doesn't backfire",
      "Stuck chasing Twitter calls instead of following a real strategy",
      "Losses increasing faster than your profit"
    ],
    after: [
      "Sleeping soundly without checking charts every night",
      "Putting idle coins to work with safe yields, not just hope",
      "Making confident moves with a clear plan", 
      "Following a system, not Twitter hype",
      "Seeing steady growth instead of compounding losses"
    ]
  };

  // Countdown timer effect
  useEffect(() => {
    const eventDate = new Date('2025-07-20T20:00:00-05:00'); // July 20th 8 PM EST
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;
      
      if (distance > 0) {
        setTimeUntilEvent({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRegistration = () => {
    setIsRegistered(true);
    toast({
      title: "Registration Successful!",
      description: "You'll receive event access details via email shortly.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'; 
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Zap className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <Badge className="mb-4 bg-yellow-500 text-black font-bold px-4 py-2">
              LIVE EVENT - July 20th to 22nd
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Crypto Cashflow Challenge
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
              Safely Turn Your HODL Portfolio into Passive Daily Cashflow
              <br />
              <span className="text-lg">No Matter The Market Conditions</span>
            </p>
            
            {/* Countdown Timer */}
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-8">
              <div className="text-center bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">{timeUntilEvent.days}</div>
                <div className="text-sm opacity-80">Days</div>
              </div>
              <div className="text-center bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">{timeUntilEvent.hours}</div>
                <div className="text-sm opacity-80">Hours</div>
              </div>
              <div className="text-center bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">{timeUntilEvent.minutes}</div>
                <div className="text-sm opacity-80">Minutes</div>
              </div>
              <div className="text-center bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">{timeUntilEvent.seconds}</div>
                <div className="text-sm opacity-80">Seconds</div>
              </div>
            </div>

            {isRegistered ? (
              <Alert className="max-w-md mx-auto bg-green-100 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  You're registered! Check your email for event access details.
                </AlertDescription>
              </Alert>
            ) : (
              <Button 
                onClick={handleRegistration}
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-4"
              >
                GET FREE TICKET
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            
            <p className="text-sm opacity-80 mt-2">*Access Is First Come First Served</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Event Schedule</TabsTrigger>
            <TabsTrigger value="transformation">Before/After</TabsTrigger>
            <TabsTrigger value="instructors">Instructors</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">3-Day Challenge Schedule</h2>
              <p className="text-xl text-slate-600 dark:text-slate-200">
                A comprehensive look at what you'll experience in the live event
              </p>
            </div>

            <div className="grid gap-6">
              {challengeDays.map((day, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="text-2xl font-bold px-4 py-2">
                            DAY {day.day}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(day.status)}>
                            {getStatusIcon(day.status)}
                            <span className="ml-1 capitalize">{day.status}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">{day.title}</CardTitle>
                        <CardDescription className="text-lg mt-2">
                          {day.subtitle}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{day.date}</div>
                        <div className="text-sm text-slate-600">{day.time}</div>
                        {day.attendees && (
                          <div className="flex items-center gap-1 mt-2 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{day.attendees.toLocaleString()} registered</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3">What You'll Learn:</h4>
                    <div className="grid gap-2">
                      {day.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <Button className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Set Reminder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transformation" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Your Crypto Life Transformation</h2>
              <p className="text-xl text-slate-600 dark:text-slate-200">
                What your crypto life will look like after this challenge
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    Without This Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {beforeAfter.before.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-red-700 dark:text-red-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    With This Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {beforeAfter.after.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-green-700 dark:text-green-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="instructors" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">We Speak From Experience</h2>
              <p className="text-xl text-slate-600 dark:text-slate-200">
                Learn from experts who've navigated every market cycle
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">Proven Track Record</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <p className="font-medium">Early Warning System</p>
                        <p className="text-sm text-slate-600">We called the FTX collapse early and got 1,000+ clients out of Celsius and BlockFi before they crashed.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium">Market Predictions</p>
                        <p className="text-sm text-slate-600">We called Solana and XRP before they pumped - helping regular people become millionaires.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-purple-500 mt-1" />
                      <div>
                        <p className="font-medium">International Recognition</p>
                        <p className="text-sm text-slate-600">Ryan's consulted Dubai royalty on million-dollar crypto deals. Nick built a 365k-subscriber crypto channel. Featured on Fox News and Forbes.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  <strong>But we started like most - down 95% in 2018.</strong> The difference? We stayed, learned, and found DeFi strategies that built our portfolios regardless of market conditions. During The Crypto Cashflow Challenge, we're going to show you how to do the same.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Event Details & Resources</h2>
              <p className="text-xl text-slate-600 dark:text-slate-200">
                Everything you need to know about the challenge
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Get</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <h4 className="font-semibold mb-2">3-Day Live Event</h4>
                      <p className="text-sm text-slate-600">Interactive sessions with Q&A</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <h4 className="font-semibold mb-2">Step-by-Step System</h4>
                      <p className="text-sm text-slate-600">Clear implementation guides</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                      <h4 className="font-semibold mb-2">Community Access</h4>
                      <p className="text-sm text-slate-600">Connect with other participants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      WHAT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">A 100% free, 3-day virtual challenge to get your first crypto yield position earning by Day 2 - without charts, hype, or complex setups.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      WHEN
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>📅 3 Day Event</div>
                      <div>• July 20th, 2025 @ 8PM EST</div>
                      <div>• July 21st, 2025 @ 8PM EST</div>
                      <div>• July 22nd, 2025 @ 8PM EST</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      WHY
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Because holding isn't the only strategy, and the smart money has been earning 5-15% per month through any market condition, while others wait and hope.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        {!isRegistered && (
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg text-gray-900">
            <h3 className="text-2xl font-bold mb-4">Don't Miss Out - Limited Seats Available</h3>
            <p className="mb-6">Join thousands of crypto investors transforming their portfolios into cash-generating machines</p>
            <Button 
              onClick={handleRegistration}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-4"
            >
              GET FREE TICKET NOW
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm opacity-80 mt-2">*Access Is First Come First Served</p>
          </div>
        )}
      </div>
    </div>
  );
}