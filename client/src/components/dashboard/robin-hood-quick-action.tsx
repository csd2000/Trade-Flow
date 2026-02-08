import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Clock, 
  Activity, 
  TrendingUp, 
  Timer,
  Settings,
  Play,
  ArrowRight,
  Target,
  Zap
} from "lucide-react";

export function RobinHoodQuickAction() {
  return (
    <Card className="crypto-card-premium border-2 border-crypto-primary border-opacity-30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-crypto-primary rounded-2xl bg-opacity-15">
              <Timer className="w-6 h-6 text-crypto-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-crypto-text">
                Robin Hood 4PM System
              </CardTitle>
              <p className="text-crypto-muted text-sm">
                Automated trading at market close
              </p>
            </div>
          </div>
          <Badge className="badge-primary animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Countdown Timer */}
        <div className="text-center p-6 rounded-2xl bg-crypto-surface border border-crypto-border">
          <div className="text-3xl font-black text-gradient mb-2">
            16:00 UTC
          </div>
          <div className="text-crypto-muted text-sm mb-4">
            Next execution in 3 hours 42 minutes
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-crypto-primary rounded-full animate-pulse"></div>
            <span className="text-crypto-primary font-medium text-sm">System Ready</span>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-crypto-tertiary mb-1">
              +2.4%
            </div>
            <div className="text-crypto-muted text-xs">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-crypto-quaternary mb-1">
              85%
            </div>
            <div className="text-crypto-muted text-xs">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-crypto-primary mb-1">
              12
            </div>
            <div className="text-crypto-muted text-xs">Signals</div>
          </div>
        </div>

        {/* Quick Signals */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-crypto-text flex items-center gap-2">
            <Target className="w-4 h-4 text-crypto-secondary" />
            Live Signals
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-crypto-surface border border-crypto-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-crypto-card rounded-full flex items-center justify-center text-xs font-bold text-crypto-text">
                  BTC
                </div>
                <div>
                  <Badge className="badge-success text-xs">BUY</Badge>
                  <div className="text-crypto-muted text-xs">92% confidence</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-crypto-text text-sm font-semibold">$47,200</div>
                <div className="text-crypto-tertiary text-xs">+2.8%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-crypto-surface border border-crypto-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-crypto-card rounded-full flex items-center justify-center text-xs font-bold text-crypto-text">
                  ETH
                </div>
                <div>
                  <Badge className="badge-warning text-xs">HOLD</Badge>
                  <div className="text-crypto-muted text-xs">75% confidence</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-crypto-text text-sm font-semibold">$2,850</div>
                <div className="text-crypto-muted text-xs">-0.2%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/robin-hood-trading">
            <Button className="btn-primary w-full">
              <Zap className="w-4 h-4 mr-2" />
              View System
            </Button>
          </Link>
          <Button className="btn-secondary w-full">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}