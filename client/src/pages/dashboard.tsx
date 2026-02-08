import { Header } from "@/components/layout/header";
import { PortfolioCards } from "@/components/dashboard/portfolio-cards";
import { ActiveStrategies } from "@/components/dashboard/active-strategies";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { LearningCenter } from "@/components/dashboard/learning-center";
import { DeFiResources } from "@/components/dashboard/defi-resources";
import { RobinHoodQuickAction } from "@/components/dashboard/robin-hood-quick-action";
import { PassiveIncomeQuickAction } from "@/components/dashboard/passive-income-quick-action";
import { MarketSentimentDashboard } from "@/components/dashboard/market-sentiment-dashboard";
import { FearGreedIndex } from "@/components/dashboard/fear-greed-index";
import { RealTimeAlerts } from "@/components/alerts/real-time-alerts";
import { CryptoQuiz } from "@/components/gamification/crypto-quiz";
import { SocialTradingInsights } from "@/components/social/social-trading-insights";
import { AltcoinProIntegration } from "@/components/dashboard/altcoin-pro-integration";
import { WarriorTradingQuickAction } from "@/components/dashboard/warrior-trading-quick-action";
import { MindfulStudyQuickAction } from "@/components/dashboard/mindful-study-quick-action";
import { NancyPelosiQuickAction } from "@/components/dashboard/nancy-pelosi-quick-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  Target, 
  BookOpen,
  ArrowRight,
  Sparkles,
  Shield,
  DollarSign,
  BarChart3,
  Users,
  GraduationCap
} from "lucide-react";
import {
  mockPortfolioData,
  mockActiveStrategies,
  mockMarketData,
  mockExitAlert
} from "@/lib/mock-data";
import { useState } from "react";
import { WalletConnectMobile } from "@/components/mobile/wallet-connect-mobile";
import { LivePriceTicker } from "@/components/mobile/live-price-ticker";
import { NotificationCenterMobile } from "@/components/mobile/notification-center-mobile";
import { PortfolioAnalyticsMobile } from "@/components/mobile/portfolio-analytics-mobile";
import { MobileOnboarding } from "@/components/mobile/mobile-onboarding";
import { MasterAcademyQuickAction } from "@/components/dashboard/master-academy-quick-action";
import { ExperienceLevelSelector } from "@/components/dashboard/experience-level-selector";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {showOnboarding && (
        <MobileOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12 relative">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-black text-gradient mb-6 animate-fade-in-up">
              Master Trading
              <br />
              <span className="text-glow">Academy Platform</span>
            </h1>
            <p className="text-xl text-crypto-muted max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              ALL trading strategies in one place: DeFi protocols, yield farming, stock trading, forex, crypto analysis, congressional strategies, passive income, psychology training - completely FREE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Button className="btn-primary group" onClick={() => window.location.href = '/free-training'}>
                <BookOpen className="w-5 h-5 mr-2" />
                <span>Access ALL Free Training</span>
                <Zap className="w-5 h-5 ml-2 group-hover:animate-pulse" />
              </Button>
              <Button className="btn-secondary" onClick={() => window.location.href = '/strategies'}>
                <Target className="w-5 h-5 mr-2" />
                Build Strategy
              </Button>
            </div>
          </div>
        </div>

        {/* Experience Level Selector - Onboarding */}
        <section className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <ExperienceLevelSelector />
        </section>

        {/* Live Fear & Greed Index - Prominent Section */}
        <section className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="max-w-md mx-auto">
            <FearGreedIndex />
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-crypto-text flex items-center gap-3">
                <div className="p-3 bg-crypto-primary/15 rounded-xl animate-pulse-glow">
                  <BarChart3 className="w-6 h-6 text-crypto-primary" />
                </div>
                Portfolio Overview
              </h2>
              <p className="text-crypto-muted mt-1">Real-time performance metrics across all protocols</p>
            </div>
            <Badge className="badge-success animate-float">
              <Sparkles className="w-4 h-4 mr-1" />
              Live
            </Badge>
          </div>
          <PortfolioCards data={mockPortfolioData} />
        </section>

        {/* Mobile Features Section */}
        <section className="lg:hidden animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          <div className="grid grid-cols-1 gap-4">
            <WalletConnectMobile />
            <LivePriceTicker />
            <NotificationCenterMobile />
          </div>
        </section>

        {/* Master Academy - Featured prominently */}
        <section className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <MasterAcademyQuickAction />
            </div>
            <div className="space-y-4">
              <Card className="crypto-card hover-lift group cursor-pointer" onClick={() => window.location.href = '/strategies'}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-crypto-text mb-2">Strategy Builder</h3>
                  <p className="text-crypto-muted mb-4">Create optimized strategies</p>
                  <Button className="btn-secondary w-full group-hover:border-crypto-primary">
                    Build Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="crypto-card hover-lift group cursor-pointer" onClick={() => window.location.href = '/portfolio'}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-success rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-crypto-text mb-2">Portfolio</h3>
                  <p className="text-crypto-muted mb-4">Track performance</p>
                  <Button className="btn-secondary w-full group-hover:border-crypto-tertiary">
                    View Portfolio
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Strategies & Learning */}
          <div className="xl:col-span-2 space-y-8">
            <div className="animate-fade-in-up" style={{animationDelay: '1s'}}>
              <ActiveStrategies strategies={mockActiveStrategies} />
            </div>
            
            <div className="animate-fade-in-up" style={{animationDelay: '1.2s'}}>
              <LearningCenter />
            </div>
            
            <div className="animate-fade-in-up" style={{animationDelay: '1.4s'}}>
              <SocialTradingInsights />
            </div>
          </div>

          {/* Right Column - Quick Actions, Market & Resources */}
          <div className="space-y-8">
            <div className="animate-slide-in-right" style={{animationDelay: '0.5s'}}>
              <AltcoinProIntegration />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '0.6s'}}>
              <PassiveIncomeQuickAction />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '0.8s'}}>
              <RobinHoodQuickAction />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '0.9s'}}>
              <WarriorTradingQuickAction />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1.0s'}}>
              <MindfulStudyQuickAction />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1.1s'}}>
              <NancyPelosiQuickAction />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1s'}}>
              <MarketSentimentDashboard />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1.1s'}}>
              <RealTimeAlerts />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1.2s'}}>
              <CryptoQuiz />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1.3s'}}>
              <MarketOverview marketData={mockMarketData} />
            </div>
            
            <div className="animate-slide-in-right" style={{animationDelay: '1.4s'}}>
              <DeFiResources />
            </div>

            {/* Community Stats */}
            <Card className="crypto-card animate-slide-in-right" style={{animationDelay: '1.4s'}}>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-crypto-text flex items-center gap-2">
                  <div className="p-2 bg-crypto-secondary/15 rounded-lg">
                    <Users className="w-5 h-5 text-crypto-secondary" />
                  </div>
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-crypto-muted">Active Users</span>
                  <span className="text-crypto-text font-bold">12,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-crypto-muted">Total TVL Managed</span>
                  <span className="text-crypto-primary font-bold">$45.2M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-crypto-muted">Avg Monthly Returns</span>
                  <span className="text-crypto-tertiary font-bold">+18.4%</span>
                </div>
                <div className="pt-4 border-t border-crypto-border/50">
                  <Badge className="badge-primary w-full justify-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Top 1% Performance
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <section className="text-center py-16 animate-fade-in-up" style={{animationDelay: '1.6s'}}>
          <div className="crypto-card-premium max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-crypto-text mb-4">
              Ready to 10x Your DeFi Returns?
            </h2>
            <p className="text-xl text-crypto-muted mb-8 max-w-2xl mx-auto">
              Join thousands of successful DeFi investors using our professional-grade platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-primary text-lg px-8 py-4">
                <span>Start Free Trial</span>
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4">
                View Pricing
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}