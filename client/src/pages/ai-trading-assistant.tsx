import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, Shield, Clock, DollarSign, ChevronRight, Sparkles, RefreshCw, BookOpen, GraduationCap, Zap, CheckCircle2, ArrowRight, Crown, Rocket, Star } from 'lucide-react';
import { Link } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useSkillLevel } from '@/contexts/SkillLevelContext';

function generateSessionId(): string {
  const stored = localStorage.getItem('ai_assistant_session_id');
  if (stored) return stored;
  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('ai_assistant_session_id', newId);
  return newId;
}

export default function AITradingAssistant() {
  const { skillLevel, setSkillLevel, setOnboardingComplete, hasSeenOnboarding } = useSkillLevel();
  const [step, setStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<'beginner' | 'intermediate' | 'advanced' | 'elite' | null>(null);
  const [profile, setProfile] = useState({
    experienceLevel: '',
    riskTolerance: '',
    investmentHorizon: '',
    capitalAmount: '',
    timeCommitment: '',
    primaryGoal: '',
    preferredMarkets: [] as string[],
    maxDrawdownTolerance: 20,
    monthlyReturnTarget: 10
  });
  const [sessionId] = useState(generateSessionId);
  
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/ai-assistant/profile', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/ai-assistant/profile/${sessionId}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });
  
  useEffect(() => {
    if (existingProfile) {
      setProfile({
        experienceLevel: existingProfile.experienceLevel || '',
        riskTolerance: existingProfile.riskTolerance || '',
        investmentHorizon: existingProfile.investmentHorizon || '',
        capitalAmount: existingProfile.capitalAmount || '',
        timeCommitment: existingProfile.timeCommitment || '',
        primaryGoal: existingProfile.primaryGoal || '',
        preferredMarkets: existingProfile.preferredMarkets || [],
        maxDrawdownTolerance: existingProfile.maxDrawdownTolerance || 20,
        monthlyReturnTarget: existingProfile.monthlyReturnTarget || 10
      });
      if (existingProfile.aiRecommendations) {
        setStep(4);
      } else if (existingProfile.experienceLevel) {
        const expLevel = existingProfile.experienceLevel;
        if (expLevel === 'beginner') {
          setSelectedSkill('beginner');
        } else if (expLevel === 'intermediate') {
          setSelectedSkill('intermediate');
        } else if (expLevel === 'advanced') {
          setSelectedSkill('advanced');
        } else {
          setSelectedSkill('elite');
        }
        if (!existingProfile.capitalAmount) {
          setStep(expLevel === 'beginner' ? 2 : 1);
        } else {
          setStep(3);
        }
      }
    }
  }, [existingProfile]);

  const handleSkillSelection = (skill: 'beginner' | 'intermediate' | 'advanced' | 'elite') => {
    setSelectedSkill(skill);
    setSkillLevel(skill === 'beginner' ? 'beginner' : 'experienced');
    setOnboardingComplete();
    
    if (skill === 'beginner') {
      setProfile(prev => ({
        ...prev,
        experienceLevel: 'beginner',
        riskTolerance: 'conservative',
        investmentHorizon: 'swing_trading',
        capitalAmount: 'under_1k',
        timeCommitment: 'minutes_per_day',
        primaryGoal: 'growth',
        maxDrawdownTolerance: 10,
        monthlyReturnTarget: 5
      }));
      setStep(2);
    } else if (skill === 'intermediate') {
      setProfile(prev => ({
        ...prev,
        experienceLevel: 'intermediate',
        riskTolerance: 'moderate',
        investmentHorizon: 'swing_trading'
      }));
      setStep(1);
    } else if (skill === 'advanced') {
      setProfile(prev => ({
        ...prev,
        experienceLevel: 'advanced',
        riskTolerance: 'aggressive',
        investmentHorizon: 'day_trading'
      }));
      setStep(1);
    } else {
      setProfile(prev => ({
        ...prev,
        experienceLevel: 'professional',
        riskTolerance: 'very_aggressive',
        investmentHorizon: 'day_trading'
      }));
      setStep(1);
    }
  };
  
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai-assistant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...profile })
      });
      if (!res.ok) throw new Error('Failed to save profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-assistant/profile', sessionId] });
      setStep(4);
    }
  });
  
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/ai-assistant/refresh-recommendations/${sessionId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to refresh');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-assistant/profile', sessionId] });
    }
  });
  
  const totalSteps = 3;
  const progress = step === 0 ? 0 : step >= 4 ? 100 : (step / totalSteps) * 100;
  
  const canProceed = () => {
    if (step === 1) return profile.experienceLevel && profile.riskTolerance && profile.investmentHorizon;
    if (step === 2) return profile.capitalAmount && profile.timeCommitment && profile.primaryGoal;
    if (step === 3) return true;
    return false;
  };
  
  const handleMarketToggle = (market: string) => {
    setProfile(prev => ({
      ...prev,
      preferredMarkets: prev.preferredMarkets.includes(market)
        ? prev.preferredMarkets.filter(m => m !== market)
        : [...prev.preferredMarkets, market]
    }));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-violet-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-200">Loading your AI Trading Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Trading Assistant</h1>
          </div>
          <p className="text-slate-200 max-w-2xl mx-auto">
            Get personalized trading strategy recommendations based on your unique risk profile, experience, and goals.
          </p>
        </div>
        
        {step > 0 && step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-200">Step {step} of {totalSteps}</span>
              <span className="text-sm font-medium text-white">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>
        )}

        {step === 0 && (
          <div className="max-w-6xl w-full mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full text-violet-300 text-sm mb-6 animate-pulse">
                <Zap className="w-4 h-4" />
                Welcome to Power Scanner Pro
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                What's your trading experience level?
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Select your level to get personalized tools, strategies, and a tailored experience designed just for you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card
                className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 text-white backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-emerald-400 hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/20 group relative overflow-hidden"
                onClick={() => handleSkillSelection('beginner')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="text-center pb-2 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-2">Getting Started</Badge>
                  <CardTitle className="text-xl">Beginner</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    New to trading? Start here!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-200">Guided learning paths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-200">Simplified interface</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-200">Safe strategies</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    onClick={(e) => { e.stopPropagation(); handleSkillSelection('beginner'); }}
                  >
                    Start Here <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30 text-white backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-blue-400 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/20 group relative overflow-hidden"
                onClick={() => handleSkillSelection('intermediate')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="text-center pb-2 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-2">1-2 Years</Badge>
                  <CardTitle className="text-xl">Intermediate</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Know the basics, ready for more
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-200">Technical analysis tools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-200">Market scanners</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-200">Risk management</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    onClick={(e) => { e.stopPropagation(); handleSkillSelection('intermediate'); }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border-violet-500/30 text-white backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-violet-400 hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/20 group relative overflow-hidden"
                onClick={() => handleSkillSelection('advanced')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="text-center pb-2 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-2">3+ Years</Badge>
                  <CardTitle className="text-xl">Advanced</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Profitable trader, seeking edge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span className="text-gray-200">AI-powered signals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span className="text-gray-200">Options strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span className="text-gray-200">Multi-timeframe analysis</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-violet-600 hover:bg-violet-500 text-white font-medium"
                    onClick={(e) => { e.stopPropagation(); handleSkillSelection('advanced'); }}
                  >
                    Let's Go <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-amber-900/40 to-orange-800/20 border-amber-500/30 text-white backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-amber-400 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/20 group relative overflow-hidden"
                onClick={() => handleSkillSelection('elite')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute top-2 right-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <CardHeader className="text-center pb-2 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-2">Professional</Badge>
                  <CardTitle className="text-xl">Elite</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Full-time or institutional trader
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-200">Institutional data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-200">Dark pool tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-200">Automated execution</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium"
                    onClick={(e) => { e.stopPropagation(); handleSkillSelection('elite'); }}
                  >
                    Access All <Crown className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-3">
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Your selection customizes the experience. You can change it anytime in settings.
              </p>
              <p className="text-gray-500 text-xs">
                All levels have access to learning resources. Higher levels unlock advanced professional tools.
              </p>
            </div>
          </div>
        )}
        
        {step === 1 && (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-violet-400" />
                Trading Experience & Risk Profile
              </CardTitle>
              <CardDescription className="text-slate-200">Help us understand your trading background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block text-white">What is your trading experience level?</Label>
                <RadioGroup value={profile.experienceLevel} onValueChange={(v) => setProfile(p => ({ ...p, experienceLevel: v }))}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'beginner', label: 'Beginner', desc: 'New to trading, still learning basics' },
                      { value: 'intermediate', label: 'Intermediate', desc: '1-3 years experience, understand fundamentals' },
                      { value: 'advanced', label: 'Advanced', desc: '3+ years, profitable track record' },
                      { value: 'professional', label: 'Professional', desc: 'Full-time trader or finance professional' }
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${profile.experienceLevel === opt.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                        <RadioGroupItem value={opt.value} className="mt-1" />
                        <div>
                          <div className="font-medium text-white">{opt.label}</div>
                          <div className="text-sm text-slate-200">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block text-white">What is your risk tolerance?</Label>
                <RadioGroup value={profile.riskTolerance} onValueChange={(v) => setProfile(p => ({ ...p, riskTolerance: v }))}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'conservative', label: 'Conservative', desc: 'Preserve capital, steady gains', color: 'text-green-400' },
                      { value: 'moderate', label: 'Moderate', desc: 'Balanced risk and reward', color: 'text-blue-400' },
                      { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk for higher returns', color: 'text-orange-400' },
                      { value: 'very_aggressive', label: 'Very Aggressive', desc: 'Maximum growth potential', color: 'text-red-400' }
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${profile.riskTolerance === opt.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                        <RadioGroupItem value={opt.value} className="mt-1" />
                        <div>
                          <div className={`font-medium ${opt.color}`}>{opt.label}</div>
                          <div className="text-sm text-slate-200">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block text-white">What is your preferred trading style?</Label>
                <RadioGroup value={profile.investmentHorizon} onValueChange={(v) => setProfile(p => ({ ...p, investmentHorizon: v }))}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'day_trading', label: 'Day Trading', desc: 'Multiple trades daily, close all positions by market close' },
                      { value: 'swing_trading', label: 'Swing Trading', desc: 'Hold positions for days to weeks' },
                      { value: 'position_trading', label: 'Position Trading', desc: 'Hold positions for weeks to months' },
                      { value: 'long_term', label: 'Long-Term Investing', desc: 'Buy and hold for months to years' }
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${profile.investmentHorizon === opt.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                        <RadioGroupItem value={opt.value} className="mt-1" />
                        <div>
                          <div className="font-medium text-white">{opt.label}</div>
                          <div className="text-sm text-slate-200">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Back</Button>
                <Button onClick={() => setStep(2)} disabled={!canProceed()} size="lg" className="bg-violet-600 hover:bg-violet-700">
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {step === 2 && (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="w-5 h-5 text-violet-400" />
                Capital & Commitment
              </CardTitle>
              <CardDescription className="text-slate-200">Tell us about your resources and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block text-white">What is your available trading capital?</Label>
                <RadioGroup value={profile.capitalAmount} onValueChange={(v) => setProfile(p => ({ ...p, capitalAmount: v }))}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'under_1k', label: 'Under $1,000' },
                      { value: '1k_10k', label: '$1,000 - $10,000' },
                      { value: '10k_50k', label: '$10,000 - $50,000' },
                      { value: '50k_100k', label: '$50,000 - $100,000' },
                      { value: 'over_100k', label: 'Over $100,000' }
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${profile.capitalAmount === opt.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                        <RadioGroupItem value={opt.value} />
                        <span className="font-medium text-white">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block text-white">How much time can you dedicate to trading?</Label>
                <RadioGroup value={profile.timeCommitment} onValueChange={(v) => setProfile(p => ({ ...p, timeCommitment: v }))}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'minutes_per_day', label: '15-30 Minutes/Day', desc: 'Quick daily check-ins' },
                      { value: 'hour_per_day', label: '1-2 Hours/Day', desc: 'Regular monitoring and analysis' },
                      { value: 'several_hours', label: '3-6 Hours/Day', desc: 'Active trading sessions' },
                      { value: 'full_time', label: 'Full-Time', desc: 'Trading as primary focus' }
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${profile.timeCommitment === opt.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                        <RadioGroupItem value={opt.value} className="mt-1" />
                        <div>
                          <div className="font-medium text-white">{opt.label}</div>
                          <div className="text-sm text-slate-200">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block text-white">What is your primary trading goal?</Label>
                <RadioGroup value={profile.primaryGoal} onValueChange={(v) => setProfile(p => ({ ...p, primaryGoal: v }))}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'income', label: 'Generate Income', desc: 'Consistent monthly returns' },
                      { value: 'growth', label: 'Capital Growth', desc: 'Grow wealth over time' },
                      { value: 'preservation', label: 'Wealth Preservation', desc: 'Protect existing capital' },
                      { value: 'speculation', label: 'High-Risk Speculation', desc: 'Maximum growth potential' }
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${profile.primaryGoal === opt.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                        <RadioGroupItem value={opt.value} className="mt-1" />
                        <div>
                          <div className="font-medium text-white">{opt.label}</div>
                          <div className="text-sm text-slate-200">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(selectedSkill === 'beginner' ? 0 : 1)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceed()} size="lg" className="bg-violet-600 hover:bg-violet-700">
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {step === 3 && (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Preferences & Targets
              </CardTitle>
              <CardDescription className="text-slate-200">Final details to personalize your recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block text-white">Which markets interest you? (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'stocks', label: 'Stocks' },
                    { value: 'crypto', label: 'Crypto' },
                    { value: 'forex', label: 'Forex' },
                    { value: 'options', label: 'Options' },
                    { value: 'defi', label: 'DeFi' }
                  ].map(market => (
                    <label key={market.value} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${profile.preferredMarkets.includes(market.value) ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:bg-slate-800'}`}>
                      <Checkbox 
                        checked={profile.preferredMarkets.includes(market.value)}
                        onCheckedChange={() => handleMarketToggle(market.value)}
                      />
                      <span className="font-medium text-white">{market.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block text-white">
                  Maximum Drawdown Tolerance: <span className="text-violet-400">{profile.maxDrawdownTolerance}%</span>
                </Label>
                <p className="text-sm text-slate-200 mb-4">How much of your portfolio could you tolerate losing before stopping?</p>
                <Slider
                  value={[profile.maxDrawdownTolerance]}
                  onValueChange={([v]) => setProfile(p => ({ ...p, maxDrawdownTolerance: v }))}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-2">
                  <span>5% (Conservative)</span>
                  <span>50% (Aggressive)</span>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block text-white">
                  Monthly Return Target: <span className="text-violet-400">{profile.monthlyReturnTarget}%</span>
                </Label>
                <p className="text-sm text-slate-200 mb-4">What monthly return are you aiming for?</p>
                <Slider
                  value={[profile.monthlyReturnTarget]}
                  onValueChange={([v]) => setProfile(p => ({ ...p, monthlyReturnTarget: v }))}
                  min={2}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-2">
                  <span>2% (Modest)</span>
                  <span>30% (Ambitious)</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Back</Button>
                <Button 
                  onClick={() => submitMutation.mutate()} 
                  disabled={submitMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Your Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {step === 4 && existingProfile?.aiRecommendations && (
          <div className="space-y-6">
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-900/40 to-purple-900/40">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                      Your Personalized Recommendations
                    </CardTitle>
                    <CardDescription className="mt-1 text-slate-200">
                      Based on your risk score of <span className="font-bold text-violet-400">{existingProfile.riskScore}/100</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStep(0)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      Change Level
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshMutation.mutate()}
                      disabled={refreshMutation.isPending}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                  <h4 className="font-medium mb-2 text-white">AI Analysis</h4>
                  <p className="text-sm text-slate-300">{existingProfile.aiRecommendations.overallAdvice}</p>
                  {existingProfile.aiRecommendations.riskAssessment && (
                    <p className="text-sm text-slate-200 mt-2 pt-2 border-t border-slate-700">
                      <Shield className="w-4 h-4 inline mr-1 text-violet-400" />
                      {existingProfile.aiRecommendations.riskAssessment}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4">
              {existingProfile.aiRecommendations.recommendations?.map((rec: any, idx: number) => (
                <Card key={rec.slug || idx} className="bg-slate-900 border-slate-700 hover:border-violet-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[250px]">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                            #{idx + 1} Match
                          </Badge>
                          <Badge className="bg-slate-700 text-slate-300">{rec.matchScore}% Match</Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{rec.slug?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</h3>
                        <p className="text-slate-200 mb-4">{rec.reason}</p>
                        
                        {rec.keyBenefits && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2 text-slate-300">Key Benefits:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.keyBenefits.map((benefit: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {rec.warnings && rec.warnings.length > 0 && (
                          <div className="text-sm text-amber-400 mb-4">
                            <Shield className="w-4 h-4 inline mr-1" />
                            {rec.warnings[0]}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                          {rec.estimatedTimeToLearn && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {rec.estimatedTimeToLearn}
                            </span>
                          )}
                          {rec.suggestedStartingCapital && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {rec.suggestedStartingCapital}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link href={`/training/${rec.slug}`}>
                        <Button className="shrink-0 bg-violet-600 hover:bg-violet-700">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Start Learning
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Risk Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-300">Experience</div>
                    <div className="font-medium capitalize text-white">{existingProfile.experienceLevel?.replace('_', ' ')}</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-300">Risk Tolerance</div>
                    <div className="font-medium capitalize text-white">{existingProfile.riskTolerance?.replace('_', ' ')}</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-300">Trading Style</div>
                    <div className="font-medium capitalize text-white">{existingProfile.investmentHorizon?.replace('_', ' ')}</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-300">Risk Score</div>
                    <div className="font-bold text-violet-400 text-xl">{existingProfile.riskScore}/100</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
