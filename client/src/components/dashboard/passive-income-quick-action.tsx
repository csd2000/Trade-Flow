import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  Play,
  ArrowRight,
  Target,
  Clock,
  Star
} from "lucide-react";

export function PassiveIncomeQuickAction() {
  const trainingProgress = 20; // This would come from user's actual progress
  const potentialEarnings = 1250; // Based on completed steps

  return (
    <Card className="crypto-card-premium border-2 border-crypto-tertiary border-opacity-30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-crypto-tertiary rounded-2xl bg-opacity-15">
              <GraduationCap className="w-6 h-6 text-crypto-tertiary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-crypto-text">
                Passive Income Training
              </CardTitle>
              <p className="text-crypto-muted text-sm">
                Learn to earn consistent crypto returns
              </p>
            </div>
          </div>
          <Badge className="badge-warning animate-pulse">
            <Star className="w-3 h-3 mr-1" />
            New
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="text-center p-6 rounded-2xl bg-crypto-surface border border-crypto-border">
          <div className="text-3xl font-black text-gradient mb-2">
            Step 1/5
          </div>
          <div className="text-crypto-muted text-sm mb-4">
            {trainingProgress}% Complete
          </div>
          <div className="w-full bg-crypto-card rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-crypto-tertiary to-crypto-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${trainingProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
            <span className="text-crypto-tertiary font-medium text-sm">Ready to Continue</span>
          </div>
        </div>

        {/* Earnings Potential */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-crypto-primary mb-1">
              ${potentialEarnings}
            </div>
            <div className="text-crypto-muted text-xs">Monthly Potential</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-crypto-tertiary mb-1">
              6-25%
            </div>
            <div className="text-crypto-muted text-xs">APY Range</div>
          </div>
        </div>

        {/* Current Step Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-crypto-text flex items-center gap-2">
            <Target className="w-4 h-4 text-crypto-secondary" />
            Next Training Step
          </h4>
          
          <div className="p-4 rounded-xl bg-crypto-surface border border-crypto-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-semibold text-crypto-text text-sm mb-1">
                  Stablecoin Yield Farming Basics
                </h5>
                <p className="text-crypto-muted text-xs">
                  Learn safe 3-8% APY strategies with USDC/USDT lending
                </p>
              </div>
              <Badge className="badge-success text-xs">Low Risk</Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-crypto-muted">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>30 min</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>$300-800/month on $10K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Link href="/passive-income-training">
            <Button className="btn-primary w-full">
              <Play className="w-4 h-4 mr-2" />
              Continue Training
            </Button>
          </Link>
          <Button className="btn-secondary w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Live Yields
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="p-3 bg-crypto-card/50 rounded-lg">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm font-bold text-crypto-text">5</div>
              <div className="text-xs text-crypto-muted">Training Steps</div>
            </div>
            <div>
              <div className="text-sm font-bold text-crypto-text">15+</div>
              <div className="text-xs text-crypto-muted">DeFi Protocols</div>
            </div>
            <div>
              <div className="text-sm font-bold text-crypto-text">24/7</div>
              <div className="text-xs text-crypto-muted">Earning Potential</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}