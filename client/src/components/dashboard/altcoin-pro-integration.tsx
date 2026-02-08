import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Target,
  Zap,
  CheckCircle,
  Clock,
  Users,
  Award
} from "lucide-react";

export function AltcoinProIntegration() {
  const challengeFeatures = [
    {
      title: "3-Day Live Challenge",
      description: "Transform your HODL portfolio into daily cashflow",
      icon: Calendar,
      color: "text-crypto-primary"
    },
    {
      title: "6-15% Monthly Returns",
      description: "Proven strategies for consistent passive income",
      icon: DollarSign,
      color: "text-crypto-tertiary"
    },
    {
      title: "11-Point Safety System",
      description: "Never fall for scam projects again",
      icon: Shield,
      color: "text-crypto-secondary"
    },
    {
      title: "Set & Forget System",
      description: "Automated yield without constant monitoring",
      icon: Zap,
      color: "text-crypto-quaternary"
    }
  ];

  const dailySchedule = [
    {
      day: 1,
      date: "July 20th",
      title: "Crypto Cashflow Awakening",
      topics: ["4 types of crypto yield", "Institutional strategies", "Real passive income"]
    },
    {
      day: 2,
      date: "July 21st", 
      title: "Earning Your First Yield",
      topics: ["Liquidity pool selection", "Autopilot systems", "3 foundational tools"]
    },
    {
      day: 3,
      date: "July 22nd",
      title: "The DeFi Danger Filter", 
      topics: ["11 safety laws", "Risk management", "6-10% stable yields"]
    }
  ];

  return (
    <Card className="crypto-card-premium border-2 border-crypto-primary border-opacity-30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-crypto-primary rounded-2xl bg-opacity-15">
              <Calendar className="w-6 h-6 text-crypto-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-crypto-text">
                Crypto Cashflow Challenge
              </CardTitle>
              <p className="text-crypto-muted text-sm">
                3-Day LIVE event - Turn HODL into passive income
              </p>
            </div>
          </div>
          <div className="text-center">
            <Badge className="badge-danger animate-pulse mb-1">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              LIVE
            </Badge>
            <div className="text-crypto-muted text-xs">July 20-22</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Value Proposition */}
        <div className="text-center p-6 rounded-2xl bg-crypto-surface border border-crypto-border">
          <div className="text-2xl font-black text-gradient mb-2">
            6-15% Monthly Returns
          </div>
          <div className="text-crypto-muted text-sm mb-4">
            Stop watching charts and start earning consistent yield
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-crypto-tertiary">$1,000</div>
              <div className="text-crypto-muted text-xs">Monthly from $10K</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-crypto-primary">24/7</div>
              <div className="text-crypto-muted text-xs">Automated earning</div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-2 gap-3">
          {challengeFeatures.map((feature, index) => (
            <div key={index} className="p-3 bg-crypto-card rounded-lg">
              <div className="flex items-start space-x-2">
                <feature.icon className={`w-4 h-4 ${feature.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <h5 className="font-semibold text-crypto-text text-sm">{feature.title}</h5>
                  <p className="text-crypto-muted text-xs">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-crypto-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-crypto-secondary" />
            3-Day Schedule
          </h4>
          
          {dailySchedule.map((day) => (
            <div key={day.day} className="p-3 bg-crypto-surface rounded-lg border border-crypto-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className="badge-primary text-xs">Day {day.day}</Badge>
                    <span className="text-crypto-muted text-xs">{day.date} - 8PM EST</span>
                  </div>
                  <h5 className="font-semibold text-crypto-text text-sm">{day.title}</h5>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {day.topics.slice(0, 2).map((topic, i) => (
                  <Badge key={i} className="badge-secondary text-xs">
                    {topic}
                  </Badge>
                ))}
                {day.topics.length > 2 && (
                  <Badge className="badge-secondary text-xs">
                    +{day.topics.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits vs Problems */}
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <h5 className="font-semibold text-red-400 text-sm mb-2">Without This System:</h5>
            <div className="space-y-1">
              {[
                "Checking prices at 2am, losing sleep",
                "Holding coins with no cashflow",
                "Chasing Twitter calls and hype"
              ].map((problem, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-crypto-muted text-xs">{problem}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-crypto-tertiary/5 border border-crypto-tertiary/20 rounded-lg">
            <h5 className="font-semibold text-crypto-tertiary text-sm mb-2">With Our System:</h5>
            <div className="space-y-1">
              {[
                "Sleep soundly while crypto works",
                "Consistent daily cashflow",
                "Clear strategy, not guesswork"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 text-crypto-tertiary mt-0.5 flex-shrink-0" />
                  <span className="text-crypto-muted text-xs">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Link href="/crypto-cashflow-challenge">
            <Button className="btn-primary w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Join Free Challenge
            </Button>
          </Link>
          <Link href="/defi-safety-system">
            <Button className="btn-secondary w-full">
              <Shield className="w-4 h-4 mr-2" />
              View Safety System
            </Button>
          </Link>
        </div>

        {/* Credibility */}
        <div className="p-3 bg-crypto-card/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-crypto-secondary" />
            <span className="text-crypto-text text-sm font-semibold">Proven Track Record</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm font-bold text-crypto-text">Called FTX</div>
              <div className="text-xs text-crypto-muted">Collapse early</div>
            </div>
            <div>
              <div className="text-sm font-bold text-crypto-text">1000+</div>
              <div className="text-xs text-crypto-muted">Clients saved</div>
            </div>
            <div>
              <div className="text-sm font-bold text-crypto-text">95%</div>
              <div className="text-xs text-crypto-muted">Success rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}