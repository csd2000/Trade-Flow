import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  Pause,
  LogOut,
  TrendingUp,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Activity,
  Target
} from "lucide-react";
import { ActiveStrategy } from "@/types";

interface ActiveStrategiesProps {
  strategies: ActiveStrategy[];
}

export function ActiveStrategies({ strategies }: ActiveStrategiesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'badge-success';
      case 'Paused': return 'badge-warning';
      case 'Exited': return 'badge-error';
      default: return 'badge-primary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-crypto-tertiary';
      case 'Medium': return 'text-crypto-quaternary';
      case 'High': return 'text-crypto-error';
      default: return 'text-crypto-primary';
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
              <div className="p-2 bg-crypto-primary rounded-xl bg-opacity-15">
                <Activity className="w-5 h-5 text-crypto-primary" />
              </div>
              Active Strategies
            </CardTitle>
            <p className="text-crypto-muted mt-1">
              Your current DeFi positions and earnings
            </p>
          </div>
          <Button className="btn-secondary text-sm">
            <Target className="w-4 h-4 mr-1" />
            New Strategy
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="p-6 rounded-xl bg-crypto-surface border border-crypto-border hover:border-crypto-primary transition-all duration-300 hover:bg-crypto-card group"
          >
            {/* Strategy Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: strategy.color + '20' }}
                >
                  {strategy.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-crypto-text mb-1">
                    {strategy.name}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-crypto-muted">
                    <span>{strategy.protocol}</span>
                    <span>•</span>
                    <span>{strategy.chain}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(strategy.status)}>
                      {strategy.status}
                    </Badge>
                    <Badge className="badge-secondary">
                      <span className={getRiskColor(strategy.riskLevel)}>
                        {strategy.riskLevel} Risk
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Strategy Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-crypto-muted mb-1">Amount</div>
                <div className="text-lg font-semibold text-crypto-text">
                  {strategy.amount}
                </div>
              </div>
              <div>
                <div className="text-sm text-crypto-muted mb-1">APR</div>
                <div className="text-lg font-semibold text-crypto-tertiary">
                  {strategy.apr}
                </div>
              </div>
              <div>
                <div className="text-sm text-crypto-muted mb-1">Daily Earnings</div>
                <div className="text-lg font-semibold text-crypto-primary">
                  {strategy.dailyEarnings}
                </div>
              </div>
              <div>
                <div className="text-sm text-crypto-muted mb-1">Monthly Est.</div>
                <div className="text-lg font-semibold text-crypto-quaternary">
                  {strategy.monthlyEarnings}
                </div>
              </div>
            </div>

            {/* Strategy Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t border-crypto-border">
              {strategy.status === 'Active' ? (
                <Button size="sm" className="btn-secondary">
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button size="sm" className="btn-primary">
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              )}
              
              <Button size="sm" className="btn-secondary">
                <DollarSign className="w-4 h-4 mr-1" />
                View Details
              </Button>
              
              <Button size="sm" className="btn-secondary">
                <LogOut className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>
        ))}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-crypto-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-crypto-primary mb-1">
              {strategies.length}
            </div>
            <div className="text-crypto-muted text-sm">Active Strategies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-crypto-tertiary mb-1">
              $1,247
            </div>
            <div className="text-crypto-muted text-sm">Total Daily Income</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-crypto-quaternary mb-1">
              15.4%
            </div>
            <div className="text-crypto-muted text-sm">Avg APR</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}