import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  Target,
  Shield,
  TrendingUp,
  Award,
  CheckCircle,
  Play,
  BookOpen,
  DollarSign,
  Zap,
  Star,
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";

interface ChallengeDay {
  day: number;
  date: string;
  title: string;
  subtitle: string;
  topics: string[];
  keyTakeaways: string[];
  completed: boolean;
  live: boolean;
}

export default function CryptoCashflowChallenge() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const [progress, setProgress] = useState(15); // Mock progress

  const challengeDays: ChallengeDay[] = [
    {
      day: 1,
      date: "July 20th - 8PM EST",
      title: "Crypto Cashflow Awakening",
      subtitle: "Stop your crypto from collecting dust and create consistent daily cashflow",
      topics: [
        "The 4 types of crypto yield that actually work",
        "How to protect your portfolio while earning",
        "What real passive income looks like",
        "Institutional-grade strategies for retail investors"
      ],
      keyTakeaways: [
        "Understand the difference between speculative gains and yield generation",
        "Learn which yield strategies are sustainable long-term",
        "Discover how to sleep soundly while your crypto works"
      ],
      completed: false,
      live: true
    },
    {
      day: 2,
      date: "July 21st - 8PM EST", 
      title: "Earning Your First Yield",
      subtitle: "Pick the right liquidity pools and set up autopilot income",
      topics: [
        "How to pick profitable liquidity pools",
        "Set-and-forget systems that require no babysitting",
        "3 foundational tools for predictable passive income",
        "Real examples of successful yield strategies"
      ],
      keyTakeaways: [
        "Set up your first yield-generating position",
        "Understand liquidity pool mechanics and rewards",
        "Master the tools that professionals use daily"
      ],
      completed: false,
      live: true
    },
    {
      day: 3,
      date: "July 22nd - 8PM EST",
      title: "The DeFi Danger Filter", 
      subtitle: "Protect your funds and avoid common DeFi traps",
      topics: [
        "11 laws to vet any DeFi opportunity safely",
        "How to avoid impermanent loss and rug pulls",
        "Top stable yield pools earning 6-10% with low risk",
        "Advanced risk management techniques"
      ],
      keyTakeaways: [
        "Never fall for scam projects again",
        "Build a bulletproof risk assessment system",
        "Access vetted, profitable yield opportunities"
      ],
      completed: false,
      live: true
    }
  ];

  const benefits = [
    {
      title: "Sleep Soundly",
      description: "No more checking charts at 2am or losing sleep over volatility",
      icon: Shield,
      color: "text-crypto-tertiary"
    },
    {
      title: "Consistent Returns",
      description: "Put idle coins to work with 6-15% monthly yields, not just hope",
      icon: DollarSign,
      color: "text-crypto-primary"
    },
    {
      title: "Clear Strategy",
      description: "Follow a proven system instead of Twitter hype and guesswork",
      icon: Target,
      color: "text-crypto-quaternary"
    },
    {
      title: "Risk Management",
      description: "Protect your portfolio while earning steady returns",
      icon: Shield,
      color: "text-crypto-secondary"
    }
  ];

  const results = [
    { metric: "6-15%", label: "Monthly Returns", sublabel: "Consistent yield generation" },
    { metric: "11", label: "Safety Laws", sublabel: "Risk protection system" },
    { metric: "4", label: "Yield Types", sublabel: "Diversified income streams" },
    { metric: "24/7", label: "Autopilot", sublabel: "Set and forget system" }
  ];

  const handleEnrollment = () => {
    setEnrollmentComplete(true);
    // In real app, this would integrate with backend
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Crypto Cashflow Challenge"
        subtitle="Turn your HODL portfolio into daily passive income"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold text-sm">LIVE EVENT - July 20th to 22nd</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gradient mb-6">
            Safely Turn Your HODL Portfolio into 
            <span className="text-crypto-primary"> Passive Daily Cashflow</span>
          </h1>
          
          <p className="text-xl text-crypto-muted mb-8 max-w-4xl mx-auto">
            Throughout 3 Live Sessions, we'll reveal the exact DeFi system we use to beat traditional market returns 
            <span className="text-crypto-text font-semibold"> without watching charts all day or losing sleep over volatility.</span>
          </p>

          {!enrollmentComplete ? (
            <Button 
              onClick={handleEnrollment}
              className="btn-primary text-lg px-8 py-4 mb-4"
            >
              <Play className="w-5 h-5 mr-2" />
              GET FREE ACCESS
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-crypto-tertiary/10 border border-crypto-tertiary rounded-lg inline-block">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-crypto-tertiary" />
                  <span className="text-crypto-tertiary font-semibold">You're registered for the challenge!</span>
                </div>
              </div>
              <p className="text-crypto-muted text-sm">Check your email for access details</p>
            </div>
          )}
          
          <p className="text-crypto-muted text-sm">*Access is first come, first served</p>
        </div>

        {/* Results Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {results.map((result, index) => (
            <Card key={index} className="crypto-card text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-black text-gradient mb-2">{result.metric}</div>
                <div className="font-semibold text-crypto-text mb-1">{result.label}</div>
                <div className="text-crypto-muted text-sm">{result.sublabel}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="schedule" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Event Schedule</TabsTrigger>
            <TabsTrigger value="benefits">Why Attend</TabsTrigger>
            <TabsTrigger value="system">The System</TabsTrigger>
            <TabsTrigger value="results">Expected Results</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-crypto-text flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-crypto-primary" />
                  3-Day Challenge Schedule
                </CardTitle>
                <p className="text-crypto-muted">
                  A comprehensive look at what you'll experience in each live session
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {challengeDays.map((day) => (
                    <Card 
                      key={day.day} 
                      className={`crypto-card-premium cursor-pointer transition-all ${
                        selectedDay === day.day ? 'border-crypto-primary bg-crypto-primary/5' : ''
                      }`}
                      onClick={() => setSelectedDay(day.day)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-crypto-primary/15 rounded-2xl flex items-center justify-center">
                              <span className="text-crypto-primary font-bold text-lg">{day.day}</span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="badge-primary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {day.date}
                                </Badge>
                                {day.live && (
                                  <Badge className="badge-danger animate-pulse">
                                    <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-xl font-bold text-crypto-text mb-2">
                                {day.title}
                              </CardTitle>
                              <p className="text-crypto-muted">{day.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-crypto-text mb-3">What You'll Learn:</h4>
                          <ul className="space-y-2">
                            {day.topics.map((topic, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-crypto-tertiary mt-0.5 flex-shrink-0" />
                                <span className="text-crypto-muted text-sm">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-crypto-text mb-3">Key Takeaways:</h4>
                          <ul className="space-y-2">
                            {day.keyTakeaways.map((takeaway, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Star className="w-4 h-4 text-crypto-quaternary mt-0.5 flex-shrink-0" />
                                <span className="text-crypto-muted text-sm">{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Without This Event */}
              <Card className="crypto-card border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Without This Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Still checking prices at 2am and losing sanity",
                    "Holding coins with no cashflow, just price swings",
                    "Guessing your next move and hoping it works",
                    "Chasing Twitter calls instead of following strategy",
                    "Losses increasing faster than profits"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-crypto-muted text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* With This Event */}
              <Card className="crypto-card border-crypto-tertiary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-crypto-tertiary flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    With This Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Sleeping soundly without checking charts every night",
                    "Putting idle coins to work with safe yields",
                    "Making confident moves with a clear plan",
                    "Following a proven system, not Twitter hype",
                    "Seeing steady growth instead of losses"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-crypto-tertiary mt-0.5 flex-shrink-0" />
                      <span className="text-crypto-muted text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="crypto-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-crypto-surface rounded-2xl">
                        <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-crypto-text mb-2">{benefit.title}</h3>
                        <p className="text-crypto-muted text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-crypto-text">
                  The Complete DeFi Yield System
                </CardTitle>
                <p className="text-crypto-muted">
                  Based on institutional-grade strategies, simplified for everyday investors
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-crypto-surface rounded-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-crypto-primary/15 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8 text-crypto-primary" />
                    </div>
                    <h3 className="font-bold text-crypto-text mb-2">Identify Opportunities</h3>
                    <p className="text-crypto-muted text-sm">Use our 11-point safety filter to find legitimate yield opportunities</p>
                  </div>
                  
                  <div className="text-center p-6 bg-crypto-surface rounded-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-crypto-tertiary/15 rounded-full flex items-center justify-center">
                      <Zap className="w-8 h-8 text-crypto-tertiary" />
                    </div>
                    <h3 className="font-bold text-crypto-text mb-2">Deploy Capital</h3>
                    <p className="text-crypto-muted text-sm">Set up automated yield strategies that work 24/7 without supervision</p>
                  </div>
                  
                  <div className="text-center p-6 bg-crypto-surface rounded-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-crypto-quaternary/15 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-crypto-quaternary" />
                    </div>
                    <h3 className="font-bold text-crypto-text mb-2">Earn & Compound</h3>
                    <p className="text-crypto-muted text-sm">Watch your portfolio generate consistent returns regardless of market conditions</p>
                  </div>
                </div>

                <div className="p-6 bg-crypto-card rounded-2xl">
                  <h4 className="font-bold text-crypto-text mb-4">The 4 Types of Crypto Yield:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge className="badge-success">Low Risk</Badge>
                      <h5 className="font-semibold text-crypto-text">Stablecoin Lending</h5>
                      <p className="text-crypto-muted text-sm">3-8% APY with minimal risk</p>
                    </div>
                    <div className="space-y-2">
                      <Badge className="badge-warning">Medium Risk</Badge>
                      <h5 className="font-semibold text-crypto-text">Liquidity Provision</h5>
                      <p className="text-crypto-muted text-sm">8-15% APY with manageable risk</p>
                    </div>
                    <div className="space-y-2">
                      <Badge className="badge-secondary">Medium Risk</Badge>
                      <h5 className="font-semibold text-crypto-text">Yield Farming</h5>
                      <p className="text-crypto-muted text-sm">10-25% APY with protocol tokens</p>
                    </div>
                    <div className="space-y-2">
                      <Badge className="badge-danger">High Risk</Badge>
                      <h5 className="font-semibold text-crypto-text">Advanced Strategies</h5>
                      <p className="text-crypto-muted text-sm">15-50% APY for experienced users</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-crypto-text">
                  What You'll Achieve After The Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-8 bg-crypto-surface rounded-2xl">
                  <div className="text-4xl font-black text-gradient mb-4">6-15% Monthly Returns</div>
                  <p className="text-crypto-muted mb-6">
                    Generate consistent passive income from your crypto portfolio, regardless of market conditions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-crypto-card rounded-lg">
                      <div className="text-2xl font-bold text-crypto-primary mb-1">$1,000</div>
                      <div className="text-crypto-muted text-sm">Monthly from $10K portfolio</div>
                    </div>
                    <div className="p-4 bg-crypto-card rounded-lg">
                      <div className="text-2xl font-bold text-crypto-tertiary mb-1">$5,000</div>
                      <div className="text-crypto-muted text-sm">Monthly from $50K portfolio</div>
                    </div>
                    <div className="p-4 bg-crypto-card rounded-lg">
                      <div className="text-2xl font-bold text-crypto-quaternary mb-1">$10,000</div>
                      <div className="text-crypto-muted text-sm">Monthly from $100K portfolio</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-crypto-text">Immediate Benefits:</h4>
                    {[
                      "Set up your first yield position by Day 2",
                      "Sleep better knowing your crypto is working",
                      "Stop constantly checking prices and charts",
                      "Have a clear plan instead of hoping and guessing"
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-crypto-tertiary mt-0.5 flex-shrink-0" />
                        <span className="text-crypto-muted">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-crypto-text">Long-term Results:</h4>
                    {[
                      "Build a diversified yield portfolio",
                      "Master risk management and safety protocols",
                      "Generate income in any market condition",
                      "Achieve true financial independence"
                    ].map((result, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Star className="w-5 h-5 text-crypto-quaternary mt-0.5 flex-shrink-0" />
                        <span className="text-crypto-muted">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-crypto-card rounded-2xl border border-crypto-primary/20">
          <h2 className="text-3xl font-bold text-crypto-text mb-4">
            Ready to Transform Your Crypto Portfolio?
          </h2>
          <p className="text-crypto-muted mb-6 max-w-2xl mx-auto">
            Join thousands of others who've already discovered how to generate consistent passive income 
            from their crypto holdings, regardless of market conditions.
          </p>
          
          {!enrollmentComplete ? (
            <Button 
              onClick={handleEnrollment}
              className="btn-primary text-lg px-8 py-4"
            >
              <Award className="w-5 h-5 mr-2" />
              JOIN THE CHALLENGE FREE
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-crypto-tertiary/10 border border-crypto-tertiary rounded-lg inline-block">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-crypto-tertiary" />
                  <span className="text-crypto-tertiary font-semibold">
                    Welcome to the Crypto Cashflow Challenge!
                  </span>
                </div>
              </div>
              <p className="text-crypto-muted">
                Check your email for access links and prepare for an incredible journey to financial freedom.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}