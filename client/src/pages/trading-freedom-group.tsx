import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users,
  TrendingUp,
  Target,
  Shield,
  CheckCircle,
  Play,
  ArrowRight,
  Award,
  Clock,
  DollarSign,
  Brain,
  Star,
  Globe,
  Zap,
  BookOpen,
  Activity,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  placeholder: string;
  required: boolean;
}

export default function TradingFreedomGroup() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const questions: Question[] = [
    {
      id: 1,
      question: "What is your current trading experience level?",
      placeholder: "e.g., Complete beginner, Some experience, Experienced but inconsistent...",
      required: true
    },
    {
      id: 2,
      question: "What is your primary goal with trading?",
      placeholder: "e.g., Supplement income, Replace job income, Build wealth for retirement...",
      required: true
    },
    {
      id: 3,
      question: "How much time can you dedicate to learning and trading daily?",
      placeholder: "e.g., 30 minutes, 1-2 hours, 3+ hours, Part-time, Full-time...",
      required: true
    }
  ];

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion].trim() === '') {
      toast({
        title: "Answer Required",
        description: "Please answer the current question to continue",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleJoinGroup();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleJoinGroup = () => {
    setIsCompleted(true);
    toast({
      title: "Welcome to the Trading Freedom Group!",
      description: "You'll receive access details and next steps shortly",
    });
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-green-700 dark:text-green-300 mb-4">
                Welcome to Trading Freedom!
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                You've successfully joined our community of real traders with real results
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Group Access</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-200">
                        You'll receive private group access within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Welcome Package</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-200">
                        Complete starter guide and resource package
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Live Sessions</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-200">
                        Access to regular live training and Q&A sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Community Support</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-200">
                        Connect with other traders on the same journey
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="max-w-2xl mx-auto mt-8 bg-blue-50 border-blue-200 text-blue-800">
              <Award className="h-4 w-4" />
              <AlertDescription>
                Remember: Trading carries risks. Always invest with caution and never risk more than you can afford to lose.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <img 
              src="https://pageresources.nextgenlearnhub.app/100/49/5/StaticTradingLanding.webp" 
              alt="Trading Freedom" 
              className="mx-auto mb-8 rounded-lg shadow-lg max-w-md"
            />
            <h1 className="text-4xl font-bold mb-4">
              Start Trading Your Way to Freedom
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Real traders, real results. Join our group today and learn from proven successful traders!
            </p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">Real</div>
                <div className="text-sm opacity-80">Traders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">Real</div>
                <div className="text-sm opacity-80">Results</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">Free</div>
                <div className="text-sm opacity-80">Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">3 Questions to Join Free Group</h2>
            <span className="text-sm text-slate-600 dark:text-slate-200">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestion + 1}
            </CardTitle>
            <CardDescription className="text-lg">
              {questions[currentQuestion].question}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={questions[currentQuestion].placeholder}
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentQuestion === questions.length - 1 ? 'Join Group' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold mb-2">Real Community</h3>
              <p className="text-sm text-slate-600 dark:text-slate-200">
                Connect with actual traders sharing real experiences and results
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold mb-2">Proven Methods</h3>
              <p className="text-sm text-slate-600 dark:text-slate-200">
                Learn strategies that have generated real profits for members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-4 text-purple-600" />
              <h3 className="font-bold mb-2">Risk Management</h3>
              <p className="text-sm text-slate-600 dark:text-slate-200">
                Understand proper risk management and capital preservation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Alert className="mt-8 bg-amber-50 border-amber-200 text-amber-800">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Entering the market carries risks, invest with caution. 
            By proceeding, you agree with Terms and Conditions, Privacy Policy, and Subscription Terms.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}