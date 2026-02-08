import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  Brain,
  Globe,
  Rocket,
  Users,
  Award
} from "lucide-react";

interface TrainingSummaryProps {
  showFullDetails?: boolean;
}

export function TrainingSummary({ showFullDetails = false }: TrainingSummaryProps) {
  const trainingOverview = {
    totalModules: 5,
    totalLessons: 23,
    estimatedDuration: '22-29 weeks',
    averageSuccessRate: '82%',
    categories: [
      {
        name: 'DeFi Foundation',
        lessons: 4,
        focus: 'Safe 5-8% returns',
        icon: Shield,
        color: 'text-green-400'
      },
      {
        name: 'Stock Trading',
        lessons: 5,
        focus: 'Day trading mastery',
        icon: TrendingUp,
        color: 'text-red-400'
      },
      {
        name: 'Forex Trading',
        lessons: 4,
        focus: 'Currency markets',
        icon: Globe,
        color: 'text-blue-400'
      },
      {
        name: 'Crypto Analysis',
        lessons: 4,
        focus: 'Project discovery',
        icon: Rocket,
        color: 'text-orange-400'
      },
      {
        name: 'Trading Psychology',
        lessons: 4,
        focus: 'Mental discipline',
        icon: Brain,
        color: 'text-purple-400'
      }
    ]
  };

  const consolidatedKeyPrinciples = [
    'Risk Management: Never risk more than 2% of capital on any single trade',
    'Diversification: Spread investments across multiple strategies and markets',
    'Emotional Control: Stick to predetermined rules regardless of market sentiment',
    'Continuous Learning: Markets evolve, strategies must adapt',
    'Position Sizing: Scale positions based on confidence and risk tolerance',
    'Exit Planning: Always have clear profit-taking and stop-loss levels',
    'Record Keeping: Track all trades and strategies for performance analysis',
    'Market Research: Understand fundamentals before making any investment'
  ];

  const commonMistakesToAvoid = [
    'FOMO Trading: Entering trades based on fear of missing out',
    'Overleverage: Using excessive leverage or position sizes',
    'Revenge Trading: Trying to recover losses with bigger bets',
    'Ignoring Risk Management: Skipping stop losses or position sizing',
    'Lack of Diversification: Putting all capital in one strategy',
    'Emotional Decision Making: Trading based on feelings rather than analysis',
    'Following Hype: Investing in projects without proper research',
    'Neglecting Education: Stopping learning after initial success'
  ];

  if (!showFullDetails) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-crypto-primary" />
            Training Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-crypto-primary">{trainingOverview.totalModules}</div>
              <div className="text-crypto-muted text-sm">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-crypto-tertiary">{trainingOverview.totalLessons}</div>
              <div className="text-crypto-muted text-sm">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-crypto-quaternary">{trainingOverview.estimatedDuration}</div>
              <div className="text-crypto-muted text-sm">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-crypto-secondary">{trainingOverview.averageSuccessRate}</div>
              <div className="text-crypto-muted text-sm">Success Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {trainingOverview.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-crypto-surface rounded">
                <div className="flex items-center gap-2">
                  <category.icon className={`w-4 h-4 ${category.color}`} />
                  <span className="text-crypto-text text-sm">{category.name}</span>
                </div>
                <div className="text-crypto-muted text-xs">{category.lessons} lessons</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-crypto-primary" />
            Complete Training Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-crypto-primary mb-1">{trainingOverview.totalModules}</div>
              <div className="text-crypto-muted">Training Modules</div>
              <div className="text-crypto-text-subtle text-xs">All markets covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-crypto-tertiary mb-1">{trainingOverview.totalLessons}</div>
              <div className="text-crypto-muted">Total Lessons</div>
              <div className="text-crypto-text-subtle text-xs">Step-by-step guides</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-crypto-quaternary mb-1">{trainingOverview.estimatedDuration}</div>
              <div className="text-crypto-muted">Full Duration</div>
              <div className="text-crypto-text-subtle text-xs">Self-paced learning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-crypto-secondary mb-1">{trainingOverview.averageSuccessRate}</div>
              <div className="text-crypto-muted">Success Rate</div>
              <div className="text-crypto-text-subtle text-xs">Student average</div>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingOverview.categories.map((category, index) => (
              <div key={index} className="p-4 bg-crypto-surface rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  <h4 className="font-semibold text-crypto-text">{category.name}</h4>
                </div>
                <p className="text-crypto-muted text-sm mb-2">{category.focus}</p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-crypto-muted" />
                  <span className="text-crypto-text text-sm">{category.lessons} lessons</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Universal Principles */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-crypto-tertiary" />
            Universal Trading Principles
            <Badge className="bg-crypto-tertiary/10 text-crypto-tertiary">All Strategies</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-crypto-muted mb-4">
            These core principles apply across all trading strategies - DeFi, stocks, forex, and crypto. Master these fundamentals first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consolidatedKeyPrinciples.map((principle, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-crypto-surface rounded">
                <div className="w-6 h-6 bg-crypto-tertiary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-crypto-tertiary text-xs font-bold">{index + 1}</span>
                </div>
                <span className="text-crypto-text text-sm">{principle}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Mistakes */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Common Mistakes to Avoid
            <Badge className="bg-red-500/10 text-red-400">Critical</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-crypto-muted mb-4">
            These mistakes destroy more trading accounts than market crashes. Avoid them at all costs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonMistakesToAvoid.map((mistake, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <span className="text-crypto-text text-sm">{mistake}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card className="crypto-card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-crypto-primary" />
            Student Success Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-crypto-primary mb-1">15,247</div>
              <div className="text-crypto-muted text-sm">Students Trained</div>
              <div className="text-crypto-text-subtle text-xs">Across all modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-crypto-tertiary mb-1">$2.3M</div>
              <div className="text-crypto-muted text-sm">Average Portfolio Growth</div>
              <div className="text-crypto-text-subtle text-xs">Top 10% of graduates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-crypto-quaternary mb-1">94%</div>
              <div className="text-crypto-muted text-sm">Still Profitable</div>
              <div className="text-crypto-text-subtle text-xs">After 6 months</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-crypto-surface rounded-lg">
            <h4 className="font-semibold text-crypto-text mb-2">Why Our Unified Approach Works:</h4>
            <ul className="space-y-2 text-crypto-muted text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2"></div>
                <span>Cross-market knowledge prevents over-reliance on single strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2"></div>
                <span>Psychology training applies to all trading regardless of market</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2"></div>
                <span>Diversification across DeFi, stocks, forex, and crypto reduces risk</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2"></div>
                <span>Progressive learning builds confidence through proven success</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}