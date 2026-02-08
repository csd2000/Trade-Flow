import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Target, 
  Shield, 
  TrendingUp, 
  Wallet, 
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Play,
  DollarSign
} from "lucide-react";

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: string;
}

export function MobileOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "Welcome to CryptoFlow Pro",
      subtitle: "Your mobile DeFi command center",
      icon: <Smartphone className="w-8 h-8 text-crypto-primary" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-crypto-primary to-crypto-secondary rounded-full flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <p className="text-crypto-muted">
              Built specifically for mobile DeFi traders and investors. 
              Access professional-grade tools on the go.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-crypto-card rounded-lg text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-crypto-muted">Live Tracking</p>
            </div>
            <div className="p-3 bg-crypto-card rounded-lg text-center">
              <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-crypto-muted">Secure</p>
            </div>
          </div>
        </div>
      ),
      action: "Get Started"
    },
    {
      id: 1,
      title: "Connect Your Wallet",
      subtitle: "Secure access to your funds",
      icon: <Wallet className="w-8 h-8 text-green-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-6 h-6 text-green-400" />
              <span className="text-crypto-text font-semibold">MetaMask Integration</span>
            </div>
            <p className="text-crypto-muted text-sm mb-3">
              Connect your MetaMask wallet to access DeFi protocols and track your portfolio in real-time.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-crypto-muted">One-click connection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-crypto-muted">Multi-chain support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-crypto-muted">Secure transactions</span>
              </div>
            </div>
          </div>
        </div>
      ),
      action: "Connect Wallet"
    },
    {
      id: 2,
      title: "Choose Your Strategy",
      subtitle: "Pick your DeFi approach",
      icon: <Target className="w-8 h-8 text-blue-400" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-crypto-card rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-crypto-text font-medium">Conservative</span>
              <Badge variant="outline" className="text-xs">3-8% APY</Badge>
            </div>
            <p className="text-crypto-muted text-xs">Low-risk lending with stable returns</p>
          </div>
          <div className="p-3 bg-crypto-card rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-crypto-text font-medium">Balanced</span>
              <Badge variant="outline" className="text-xs">8-15% APY</Badge>
            </div>
            <p className="text-crypto-muted text-xs">Yield farming with managed risk</p>
          </div>
          <div className="p-3 bg-crypto-card rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-crypto-text font-medium">Aggressive</span>
              <Badge variant="outline" className="text-xs">15-50%+ APY</Badge>
            </div>
            <p className="text-crypto-muted text-xs">High-yield opportunities</p>
          </div>
        </div>
      ),
      action: "Build Strategy"
    },
    {
      id: 3,
      title: "Mobile Features",
      subtitle: "Optimized for your phone",
      icon: <Play className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-crypto-card rounded-lg">
              <div className="w-10 h-10 bg-crypto-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-crypto-primary" />
              </div>
              <div className="flex-1">
                <p className="text-crypto-text font-medium text-sm">Swipe Actions</p>
                <p className="text-crypto-muted text-xs">Swipe cards for quick actions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-crypto-card rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-crypto-text font-medium text-sm">Live Prices</p>
                <p className="text-crypto-muted text-xs">Real-time price updates</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-crypto-card rounded-lg">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-crypto-text font-medium text-sm">Step-by-Step</p>
                <p className="text-crypto-muted text-xs">Guided strategy setup</p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: "Start Trading"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps([...completedSteps, currentStep]);
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-crypto-dark z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-crypto-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-crypto-text">Setup Walkthrough</h1>
            <p className="text-crypto-muted text-sm">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {Math.round(progress)}%
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <Card className="bg-crypto-surface border-crypto-border max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-crypto-card rounded-full flex items-center justify-center">
              {currentStepData.icon}
            </div>
            <CardTitle className="text-crypto-text text-xl">
              {currentStepData.title}
            </CardTitle>
            <p className="text-crypto-muted text-sm">
              {currentStepData.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            {currentStepData.content}
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-crypto-primary'
                  : completedSteps.includes(index)
                  ? 'bg-green-400'
                  : 'bg-crypto-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-crypto-border">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={nextStep}
            className="flex-1 bg-crypto-primary hover:bg-crypto-primary/90"
          >
            {currentStepData.action}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="text-center mt-3">
          <button 
            onClick={onComplete}
            className="text-crypto-muted text-sm hover:text-crypto-text transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}