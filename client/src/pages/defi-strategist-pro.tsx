import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  DollarSign,
  Globe,
  Search,
  Shield,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  Brain,
  Rocket,
  Eye
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  featured?: boolean;
}

export default function DeFiStrategistPro() {
  const [, setLocation] = useLocation();

  const sections: Section[] = [
    // Elite Control Center
    {
      id: 'dashboard',
      title: '🧠 DeFi Strategist Elite Dashboard',
      description: 'All-in-one overview with unified trading strategy launcher and daily PnL tracking',
      href: '/defi-strategist',
      icon: Activity,
      category: 'Elite Control Center',
      featured: true
    },
    {
      id: 'unified-strategies',
      title: '🎯 Unified Trading Strategy Launcher',
      description: 'Access all trading strategies from one central command center',
      href: '/unified-strategies',
      icon: Target,
      category: 'Elite Control Center',
      featured: true
    },
    {
      id: 'portfolio',
      title: '💼 Portfolio + Daily PnL Tracker',
      description: 'Live wallet sync with real-time positions and earnings tracking',
      href: '/portfolio',
      icon: BarChart3,
      category: 'Elite Control Center'
    },
    {
      id: 'crypto-hub',
      title: '🧩 Consolidated Crypto Hub',
      description: 'Quick access to all tools, project discovery, and yield opportunities',
      href: '/crypto-hub',
      icon: Globe,
      category: 'Elite Control Center'
    },

    // Strategy Universe
    {
      id: 'passive-income',
      title: '💰 Passive Income Training',
      description: 'Auto-compound strategies with stable yields and step-by-step guidance',
      href: '/passive-income-training',
      icon: DollarSign,
      category: 'Strategy Universe'
    },
    {
      id: 'fc-intelligent',
      title: '🧠 F&C Intelligent Decision Strategy',
      description: 'AI-powered tactical moves with market sentiment analysis',
      href: '/fc-intelligent-decision',
      icon: Brain,
      category: 'Strategy Universe'
    },
    {
      id: 'oliver-velez',
      title: '⭐ Oliver Velez Techniques',
      description: 'Legacy day and swing trading techniques from proven masters',
      href: '/oliver-velez-techniques',
      icon: Star,
      category: 'Strategy Universe'
    },
    {
      id: 'trading-freedom',
      title: '🚀 Trading Freedom Group',
      description: 'Community-based signals with live chat and collaborative trading',
      href: '/trading-freedom-group',
      icon: Users,
      category: 'Strategy Universe'
    },
    {
      id: 'cashflow-challenge',
      title: '🔥 LIVE Crypto Cashflow Challenge',
      description: '3-day live event for transforming HODL into passive income',
      href: '/cashflow-challenge-live',
      icon: Zap,
      category: 'Strategy Universe',
      featured: true
    },

    // Core Trading Engine
    {
      id: 'protocols',
      title: '📈 Protocols Explorer',
      description: 'Top DeFi platforms sorted by chain, risk level, and TVL',
      href: '/protocols',
      icon: Search,
      category: 'Core Trading Engine'
    },
    {
      id: 'strategies',
      title: '🧠 Strategy Builder',
      description: 'Step-by-step yield and leverage strategy construction tool',
      href: '/strategies',
      icon: Target,
      category: 'Core Trading Engine'
    },
    {
      id: 'profit-taking',
      title: '💸 Profit Taking Planner',
      description: 'Withdraw logic with gas estimates and portfolio rebalancing',
      href: '/profit-taking',
      icon: TrendingUp,
      category: 'Core Trading Engine'
    },
    {
      id: 'exit-strategy',
      title: '💡 Exit Strategy Planner',
      description: 'DCA plans, percentage unlocks, alerts, and stablecoin rotation',
      href: '/exit-strategy',
      icon: Shield,
      category: 'Core Trading Engine'
    },

    // Investor Intelligence Hub
    {
      id: 'learn-defi',
      title: '📖 Learn DeFi',
      description: 'Beginner to professional learning tracks with structured curriculum',
      href: '/learn',
      icon: BookOpen,
      category: 'Investor Intelligence Hub'
    },
    {
      id: 'project-discovery',
      title: '🧪 Project Discovery',
      description: 'New protocols, token launches, airdrops, and trending narratives',
      href: '/crypto-project-discovery',
      icon: Rocket,
      category: 'Investor Intelligence Hub'
    },
    {
      id: 'yield-pools',
      title: '📊 Yield Pools Explorer',
      description: 'Live APY comparison sorted by chain, token, and risk level',
      href: '/yield-pools-explorer',
      icon: BarChart3,
      category: 'Investor Intelligence Hub'
    },

    // Tactical Tools & Trading Edge
    {
      id: 'economic-calendar',
      title: '📅 Economic Calendar',
      description: 'CPI, FOMC, ETF deadlines, token unlocks, and market events',
      href: '/economic-calendar',
      icon: Calendar,
      category: 'Tactical Tools'
    },
    {
      id: 'mindful-study',
      title: '🧠 Mindful Study Platform',
      description: 'Mental clarity and trading discipline building programs',
      href: '/mindful-study',
      icon: Brain,
      category: 'Tactical Tools'
    }
  ];

  const categories = [
    'Elite Control Center',
    'Strategy Universe', 
    'Core Trading Engine',
    'Investor Intelligence Hub',
    'Tactical Tools'
  ];

  const featuredSections = sections.filter(section => section.featured);

  const handleSectionClick = (href: string) => {
    setLocation(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              💼 DeFi Strategist Pro
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
              Unified. Profitable. Intelligent. A full-suite dashboard for crypto mastery.
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto opacity-80">
              Professional DeFi platform combining daily income strategies, portfolio tracking, strategic exits, and real-time project discovery.
            </p>
            
            {/* Featured Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4"
                onClick={() => handleSectionClick('/defi-strategist')}
              >
                Launch Elite Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-gray-900 border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
                onClick={() => handleSectionClick('/cashflow-challenge-live')}
              >
                Join Live Challenge
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Featured Sections */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            🎯 Elite Launchpad - Start Here
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredSections.map(section => (
              <Card 
                key={section.id}
                className="bg-gradient-to-br from-blue-800/20 to-purple-800/20 border-blue-400/30 hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => handleSectionClick(section.href)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <section.icon className="h-8 w-8 text-blue-400 group-hover:text-blue-300" />
                    <Badge className="bg-yellow-500 text-black font-bold">FEATURED</Badge>
                  </div>
                  <CardTitle className="text-gray-900 group-hover:text-blue-200 transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full group-hover:bg-blue-500">
                    Launch Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Sections by Category */}
        <div className="space-y-12">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                🔹 {category}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections
                  .filter(section => section.category === category)
                  .map(section => (
                    <Card 
                      key={section.id}
                      className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-all cursor-pointer group hover:shadow-lg"
                      onClick={() => handleSectionClick(section.href)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <section.icon className="h-6 w-6 text-blue-400" />
                          {section.featured && (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-gray-900 group-hover:text-blue-200">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-slate-200">
                          {section.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-blue-400 group-hover:text-blue-300 text-sm font-medium">
                          Explore
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-gray-900 border-0 mt-16">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-6">
                🚀 DeFi Strategist Pro: Unlock the Full Power of Crypto Mastery
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                Join thousands of traders using professional-grade tools to generate consistent income, discover opportunities, and execute perfect exits.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-4"
                  onClick={() => handleSectionClick('/unified-strategies')}
                >
                  Explore Strategies
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-gray-900 border-white hover:bg-white hover:text-green-600 text-lg px-8 py-4"
                  onClick={() => handleSectionClick('/exit-strategy')}
                >
                  Plan Exit Strategy
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-gray-900 border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
                  onClick={() => handleSectionClick('/cashflow-challenge-live')}
                >
                  Start Cashflow Challenge
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-gray-900 border-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4"
                  onClick={() => handleSectionClick('/defi-strategist')}
                >
                  Live Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <Card className="bg-slate-800/30 border-slate-600 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-400 mb-2">20+</div>
              <div className="text-sm text-slate-200">Trading Strategies</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-600 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-sm text-slate-200">DeFi Protocols</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-600 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-sm text-slate-200">Market Monitoring</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-600 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-sm text-slate-200">Free Training</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="text-center py-8 text-slate-200 text-sm border-t border-slate-700 mt-16">
        Built for serious traders. Powered by DeFi. Professional-grade crypto mastery platform.
      </footer>
    </div>
  );
}