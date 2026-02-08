import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle, Clock, TrendingUp, Shield, Target } from 'lucide-react';

export function PreTrainingBasics() {
  const [, setLocation] = useLocation();
  const [completedRules, setCompletedRules] = useState<number[]>([]);

  const tradingRules = [
    {
      id: 1,
      title: "Rule #1: Trade with the Trend",
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      description: "Always trade in the direction of the market trend. Never fight the market.",
      details: [
        "Look for higher highs and higher lows in an uptrend",
        "Look for lower highs and lower lows in a downtrend",
        "Use moving averages to identify trend direction",
        "Wait for pullbacks in trending markets for better entries"
      ],
      example: "If the stock is making new highs, only look for BUY opportunities. If it's making new lows, only look for SELL opportunities.",
      keyPoint: "The trend is your friend - don't fight it!"
    },
    {
      id: 2, 
      title: "Rule #2: Manage Your Risk",
      icon: <Shield className="h-8 w-8 text-green-600" />,
      description: "Never risk more than 1-2% of your account on any single trade.",
      details: [
        "Set a stop loss on every trade before you enter",
        "Calculate position size based on your stop loss distance",
        "Risk only what you can afford to lose completely", 
        "Cut losses quickly and let winners run"
      ],
      example: "If you have $10,000 account, never risk more than $100-200 per trade. If your stop is $1 away, buy only 100-200 shares.",
      keyPoint: "Protect your capital first - profits come second!"
    },
    {
      id: 3,
      title: "Rule #3: Wait for High-Probability Setups", 
      icon: <Target className="h-8 w-8 text-purple-600" />,
      description: "Be patient and only trade when all conditions align in your favor.",
      details: [
        "Wait for clear patterns and setups to develop",
        "Don't chase trades or force opportunities",
        "Look for confluence of multiple indicators",
        "Quality over quantity - fewer, better trades"
      ],
      example: "Wait for a stock to pull back to a key support level in an uptrend with volume confirmation before buying.",
      keyPoint: "Patience pays - wait for the best opportunities!"
    }
  ];

  const handleRuleComplete = (ruleId: number) => {
    if (!completedRules.includes(ruleId)) {
      setCompletedRules([...completedRules, ruleId]);
    }
  };

  const progressPercentage = (completedRules.length / tradingRules.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Academy
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trading Pre-Training: 3 Essential Rules
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Master these fundamental rules before starting any advanced trading strategy
            </p>
            
            {/* Progress */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-300">{completedRules.length}/3 Rules Completed</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>

            {/* Video Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Original Training Video
                </CardTitle>
                <CardDescription>
                  Watch the source video that inspired these three fundamental trading rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-600">Video: Three Essential Day Trading Rules</p>
                    <p className="text-sm text-gray-300">Source: YouTube - Professional Trading Education</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => window.open('https://youtu.be/Esp6wINwtzw?si=NVSa-yrEd0RX95n-', '_blank')}>
                  Watch Original Video
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trading Rules */}
          <div className="grid gap-8">
            {tradingRules.map((rule) => {
              const isCompleted = completedRules.includes(rule.id);
              
              return (
                <Card key={rule.id} className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {rule.icon}
                        <div>
                          <CardTitle className="text-2xl text-gray-900">{rule.title}</CardTitle>
                          <CardDescription className="text-lg">{rule.description}</CardDescription>
                        </div>
                      </div>
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Key Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Points:</h4>
                      <ul className="space-y-2">
                        {rule.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Example */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Example:</h4>
                      <p className="text-blue-800">{rule.example}</p>
                    </div>

                    {/* Key Point */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="font-semibold text-yellow-800">{rule.keyPoint}</p>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                      {!isCompleted ? (
                        <Button 
                          onClick={() => handleRuleComplete(rule.id)}
                          className="w-full max-w-md"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Understood
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full max-w-md" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Rule Mastered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Completion Section */}
          {completedRules.length === 3 && (
            <Card className="mt-8 border-green-200 bg-green-50">
              <CardContent className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Congratulations! 🎉
                </h3>
                <p className="text-green-800 mb-6">
                  You've mastered the 3 fundamental trading rules. You're now ready to explore advanced strategies!
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setLocation('/')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue to Advanced Strategies
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                After mastering these basics, explore our advanced trading strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Day Trading</h4>
                  <p className="text-blue-700 text-sm">Oliver Velez, Warrior Trading</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900">Crypto Trading</h4>
                  <p className="text-green-700 text-sm">YieldSchool Primary Markets</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900">Options Trading</h4>
                  <p className="text-purple-700 text-sm">Income Signals Pro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}