import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Settings,
  Bell,
  Zap
} from "lucide-react";

interface ProfitRule {
  id: string;
  trigger: string;
  value: number;
  sellPct: number;
  status: 'pending' | 'triggered' | 'completed';
}

interface ExitMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: ProfitRule[];
}

export default function BullRunProfitTaking() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [currentPrice, setCurrentPrice] = useState(67500);
  const [entryPrice, setEntryPrice] = useState(45000);
  const [positionSize] = useState(10000);
  
  const pctGain = ((currentPrice - entryPrice) / entryPrice) * 100;

  const exitMethods: ExitMethod[] = [
    {
      id: 'ladder',
      name: 'Laddered Price Targets',
      description: 'Sell in predetermined percentage chunks as price rises',
      enabled: true,
      rules: [
        { id: 'l1', trigger: 'pct_gain', value: 50, sellPct: 10, status: pctGain >= 50 ? 'completed' : 'pending' },
        { id: 'l2', trigger: 'pct_gain', value: 100, sellPct: 15, status: pctGain >= 100 ? 'completed' : 'pending' },
        { id: 'l3', trigger: 'pct_gain', value: 200, sellPct: 20, status: pctGain >= 200 ? 'triggered' : 'pending' },
        { id: 'l4', trigger: 'pct_gain', value: 300, sellPct: 25, status: pctGain >= 300 ? 'triggered' : 'pending' }
      ]
    },
    {
      id: 'time_dca',
      name: 'Time-Based DCA Out',
      description: 'Regular weekly sells with momentum pause protection',
      enabled: true,
      rules: [
        { id: 't1', trigger: 'weekly', value: 7, sellPct: 5, status: 'pending' }
      ]
    },
    {
      id: 'indicator',
      name: 'Technical Indicator Exits',
      description: 'MA crossdowns, RSI overheat, and ATR trailing stops',
      enabled: true,
      rules: [
        { id: 'i1', trigger: 'ma_cross_20', value: 20, sellPct: 25, status: 'pending' },
        { id: 'i2', trigger: 'ma_cross_50', value: 50, sellPct: 25, status: 'pending' },
        { id: 'i3', trigger: 'rsi_overheat', value: 80, sellPct: 10, status: 'pending' }
      ]
    },
    {
      id: 'behavioral',
      name: 'Market Structure & Liquidity',
      description: 'Funding extremes and dominance spike protection',
      enabled: true,
      rules: [
        { id: 'b1', trigger: 'funding_extreme', value: 0.1, sellPct: 15, status: 'pending' },
        { id: 'b2', trigger: 'btc_dominance_spike', value: 3, sellPct: 10, status: 'pending' }
      ]
    }
  ];

  const allocationTemplate = [
    { label: 'Principal Recovery', pct: 40, description: 'Sold by +100-150%', color: 'bg-green-500' },
    { label: 'Strategic Sales', pct: 30, description: 'Ladder/indicator rules', color: 'bg-blue-500' },
    { label: 'Moonbag', pct: 20, description: 'Trail stop protection', color: 'bg-purple-500' },
    { label: 'Tax & Fees Buffer', pct: 10, description: 'Auto-stable transfer', color: 'bg-yellow-500' }
  ];

  const calculateSoldAmount = () => {
    let totalSold = 0;
    exitMethods.forEach(method => {
      if (method.enabled) {
        method.rules.forEach(rule => {
          if (rule.status === 'completed') {
            totalSold += (rule.sellPct / 100) * positionSize;
          }
        });
      }
    });
    return totalSold;
  };

  const soldAmount = calculateSoldAmount();
  const remainingAmount = positionSize - soldAmount;

  return (
    <div className="min-h-screen bg-crypto-background text-crypto-text">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-crypto-text mb-2">
            Bull Run Profit Taking System
          </h1>
          <p className="text-crypto-muted">
            Professional exit strategies to maximize gains and protect capital during bull markets
          </p>
        </div>

        {/* Position Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-crypto-surface border-crypto-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-crypto-muted text-sm">Position Value</p>
                  <p className="text-2xl font-bold text-crypto-text">
                    ${(remainingAmount * currentPrice / entryPrice).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-crypto-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-crypto-surface border-crypto-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-crypto-muted text-sm">Unrealized Gain</p>
                  <p className="text-2xl font-bold text-green-400">
                    +{pctGain.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-crypto-surface border-crypto-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-crypto-muted text-sm">Realized Profits</p>
                  <p className="text-2xl font-bold text-crypto-primary">
                    ${soldAmount.toLocaleString()}
                  </p>
                </div>
                <Target className="w-8 h-8 text-crypto-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-crypto-surface border-crypto-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-crypto-muted text-sm">Remaining Position</p>
                  <p className="text-2xl font-bold text-crypto-text">
                    {((remainingAmount / positionSize) * 100).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-crypto-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Principles */}
        <Card className="bg-crypto-surface border-crypto-border mb-8">
          <CardHeader>
            <CardTitle className="text-crypto-text flex items-center gap-2">
              <Zap className="w-5 h-5 text-crypto-primary" />
              Core Bull Run Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-crypto-card rounded-lg">
                <h4 className="font-semibold text-crypto-text mb-2">Pay Yourself</h4>
                <p className="text-crypto-muted text-sm">Sell in ladders, not all at once</p>
              </div>
              <div className="p-4 bg-crypto-card rounded-lg">
                <h4 className="font-semibold text-crypto-text mb-2">Protect Principal</h4>
                <p className="text-crypto-muted text-sm">First target = recover initial capital</p>
              </div>
              <div className="p-4 bg-crypto-card rounded-lg">
                <h4 className="font-semibold text-crypto-text mb-2">Keep Moonbag</h4>
                <p className="text-crypto-muted text-sm">Hold chunk for blow-off tops</p>
              </div>
              <div className="p-4 bg-crypto-card rounded-lg">
                <h4 className="font-semibold text-crypto-text mb-2">Rules &gt; Vibes</h4>
                <p className="text-crypto-muted text-sm">Predefine moves and indicators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Template */}
        <Card className="bg-crypto-surface border-crypto-border mb-8">
          <CardHeader>
            <CardTitle className="text-crypto-text">Position Allocation Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allocationTemplate.map((allocation, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded ${allocation.color}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-crypto-text">{allocation.label}</span>
                      <span className="text-crypto-text font-bold">{allocation.pct}%</span>
                    </div>
                    <p className="text-crypto-muted text-sm">{allocation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exit Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {exitMethods.map((method) => (
            <Card key={method.id} className="bg-crypto-surface border-crypto-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-crypto-text">{method.name}</CardTitle>
                  <Switch checked={method.enabled} />
                </div>
                <CardDescription className="text-crypto-muted">
                  {method.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {method.rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-crypto-card rounded-lg">
                      <div className="flex items-center gap-3">
                        {rule.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : rule.status === 'triggered' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-crypto-muted" />
                        )}
                        <div>
                          <p className="text-crypto-text text-sm font-medium">
                            {rule.trigger.replace('_', ' ').replace('pct gain', `+${rule.value}%`)}
                          </p>
                          <p className="text-crypto-muted text-xs">Sell {rule.sellPct}%</p>
                        </div>
                      </div>
                      <Badge variant={rule.status === 'completed' ? 'default' : 'outline'}>
                        {rule.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Example Walkthrough */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-crypto-text flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Example: $10,000 ALT-X Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-crypto-card rounded-lg">
                  <span className="text-crypto-text">$1.50 (+50%)</span>
                  <span className="text-green-400">Sell 10% &rarr; $1,500</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-crypto-card rounded-lg">
                  <span className="text-crypto-text">$2.00 (+100%)</span>
                  <span className="text-green-400">Sell 15% &rarr; $3,000 total</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-crypto-card rounded-lg">
                  <span className="text-crypto-text">$3.00 (+200%)</span>
                  <span className="text-green-400">Sell 20% &rarr; $6,000 total</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-crypto-card rounded-lg">
                  <span className="text-crypto-text">$4.00 (+300%)</span>
                  <span className="text-green-400">Sell 25% &rarr; $11,500 realized</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-crypto-text text-lg font-semibold mb-2">Final Result</p>
                  <p className="text-green-400 text-2xl font-bold">$11,500 Realized</p>
                  <p className="text-crypto-muted">+ 30% moonbag remaining</p>
                  <p className="text-crypto-muted text-sm mt-2">Trail with 3&times;ATR or 50-DMA</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button className="bg-crypto-primary text-gray-900 hover:bg-crypto-primary/90">
            <Settings className="w-4 h-4 mr-2" />
            Configure Rules
          </Button>
          <Button variant="outline" className="border-crypto-border text-crypto-text">
            <Bell className="w-4 h-4 mr-2" />
            Set Alerts
          </Button>
          <Button variant="outline" className="border-crypto-border text-crypto-text">
            <ArrowRight className="w-4 h-4 mr-2" />
            Backtest Strategy
          </Button>
        </div>
      </div>
    </div>
  );
}