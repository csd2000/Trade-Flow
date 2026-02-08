import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  BarChart3, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  Settings,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';
import { profitTakingTemplates, marketConditions, profitTakingTips } from '@/lib/profit-taking-data';

export default function ProfitTaking() {
  const [selectedTemplate, setSelectedTemplate] = useState(profitTakingTemplates[0]);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedMarket, setSelectedMarket] = useState(marketConditions[0]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Conservative': return 'text-crypto-primary bg-crypto-primary/10 border-crypto-primary/20';
      case 'Moderate': return 'text-crypto-amber bg-crypto-amber/10 border-crypto-amber/20';
      case 'Aggressive': return 'text-crypto-red bg-crypto-red/10 border-crypto-red/20';
      default: return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'Ladder Selling': return <Target className="w-5 h-5" />;
      case 'Target Selling': return <TrendingUp className="w-5 h-5" />;
      case 'Balanced Selling': return <BarChart3 className="w-5 h-5" />;
      case 'Fibonacci Selling': return <Calculator className="w-5 h-5" />;
      case 'Trailing Stop': return <Settings className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-crypto-primary to-crypto-secondary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-gray-900" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient">
              Profit Taking Strategies
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Master the art of taking profits with proven strategies used by professional traders
          </p>
        </div>

        {/* Market Condition Alert */}
        <Alert className="bg-crypto-surface border-crypto-border">
          <AlertTriangle className="h-4 w-4 text-crypto-amber" />
          <AlertDescription className="text-gray-900">
            <strong>Current Market:</strong> {selectedMarket.condition} - {selectedMarket.description}
            <br />
            <strong>Recommended Strategy:</strong> {selectedMarket.recommendedStrategy}
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-crypto-surface border border-crypto-border">
            <TabsTrigger value="templates" className="data-[state=active]:bg-crypto-primary data-[state=active]:text-gray-900">
              Templates
            </TabsTrigger>
            <TabsTrigger value="calculator" className="data-[state=active]:bg-crypto-primary data-[state=active]:text-gray-900">
              Calculator
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-crypto-primary data-[state=active]:text-gray-900">
              Active Plans
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-crypto-primary data-[state=active]:text-gray-900">
              Education
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {profitTakingTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`crypto-card cursor-pointer transition-all duration-300 hover:border-crypto-primary/50 ${
                    selectedTemplate.id === template.id ? 'border-crypto-primary/50 bg-crypto-primary/5' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-crypto-primary to-crypto-secondary rounded-lg flex items-center justify-center">
                          {getStrategyIcon(template.strategy)}
                        </div>
                        <div>
                          <CardTitle className="text-gray-900 text-lg">{template.name}</CardTitle>
                          {template.isPopular && (
                            <Badge className="bg-crypto-amber/10 text-crypto-amber border-crypto-amber/20 mt-1">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={getRiskColor(template.riskLevel)}>
                        {template.riskLevel}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-300 font-medium">Target Breakdown:</div>
                      {template.targets.slice(0, 3).map((target, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{target.percentage}% gain</span>
                          <span className="text-crypto-primary font-medium">Sell {target.sellAmount}%</span>
                        </div>
                      ))}
                      {template.targets.length > 3 && (
                        <div className="text-xs text-gray-300">
                          +{template.targets.length - 3} more targets
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Template Details */}
            {selectedTemplate && (
              <Card className="crypto-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 text-xl flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-crypto-primary to-crypto-secondary rounded-xl flex items-center justify-center">
                        {getStrategyIcon(selectedTemplate.strategy)}
                      </div>
                      <span>{selectedTemplate.name} Details</span>
                    </CardTitle>
                    <Button className="bg-crypto-primary hover:bg-crypto-primary/80">
                      <Play className="w-4 h-4 mr-2" />
                      Use This Strategy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Profit Taking Schedule</h3>
                      {selectedTemplate.targets.map((target, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-crypto-surface rounded-lg border border-crypto-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-crypto-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-crypto-primary font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-gray-900 font-medium">+{target.percentage}% Gain</div>
                              <div className="text-xs text-gray-300">{target.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-crypto-primary font-semibold">Sell {target.sellAmount}%</div>
                            <div className="text-xs text-gray-300">of position</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Strategy Visualization</h3>
                      <div className="space-y-3">
                        {selectedTemplate.targets.map((target, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Target {index + 1}: {target.percentage}%</span>
                              <span className="text-crypto-primary">{target.sellAmount}% position</span>
                            </div>
                            <Progress 
                              value={target.sellAmount} 
                              className="h-2 bg-crypto-border"
                              style={{
                                background: `linear-gradient(to right, hsl(var(--crypto-primary)) ${target.sellAmount}%, hsl(var(--crypto-border)) ${target.sellAmount}%)`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center space-x-3">
                  <Calculator className="w-6 h-6 text-crypto-primary" />
                  <span>Profit Taking Calculator</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Calculate your profit-taking targets based on your investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="investment" className="text-gray-900">Initial Investment ($)</Label>
                      <Input 
                        id="investment"
                        type="number"
                        placeholder="1000"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coin" className="text-gray-900">Cryptocurrency</Label>
                      <Select>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select coin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                          <SelectItem value="sol">Solana (SOL)</SelectItem>
                          <SelectItem value="ada">Cardano (ADA)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strategy" className="text-gray-900">Strategy Template</Label>
                      <Select>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          {profitTakingTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-crypto-primary hover:bg-crypto-primary/80">
                      Calculate Targets
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calculation Results</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-crypto-surface rounded-lg border border-crypto-border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-crypto-primary">$2,450</div>
                          <div className="text-sm text-gray-300">Total Profit Potential</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-crypto-surface rounded-lg border border-crypto-border text-center">
                          <div className="text-lg font-semibold text-gray-900">145%</div>
                          <div className="text-xs text-gray-300">Max Gain</div>
                        </div>
                        <div className="p-3 bg-crypto-surface rounded-lg border border-crypto-border text-center">
                          <div className="text-lg font-semibold text-crypto-primary">5</div>
                          <div className="text-xs text-gray-300">Targets</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Plans Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="crypto-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">BTC Aggressive Strategy</CardTitle>
                    <Badge className="bg-crypto-primary/10 text-crypto-primary border-crypto-primary/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-300">Entry Price</div>
                        <div className="text-gray-900 font-semibold">$42,500</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-300">Current Price</div>
                        <div className="text-crypto-primary font-semibold">$63,750</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Progress</span>
                        <span className="text-sm text-crypto-primary">+50% (Target 1 Hit)</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="border-crypto-border">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button size="sm" className="bg-crypto-primary hover:bg-crypto-primary/80">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">ETH Conservative Ladder</CardTitle>
                    <Badge className="bg-crypto-amber/10 text-crypto-amber border-crypto-amber/20">
                      <Clock className="w-3 h-3 mr-1" />
                      Waiting
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-300">Entry Price</div>
                        <div className="text-gray-900 font-semibold">$2,250</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-300">Current Price</div>
                        <div className="text-crypto-red font-semibold">$2,485</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Progress</span>
                        <span className="text-sm text-crypto-amber">+10% (Not Yet)</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="border-crypto-border">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button size="sm" className="bg-crypto-primary hover:bg-crypto-primary/80">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center space-x-3">
                    <Lightbulb className="w-6 h-6 text-crypto-amber" />
                    <span>Pro Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profitTakingTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-crypto-surface rounded-lg border border-crypto-border">
                        <div className="text-2xl">{tip.icon}</div>
                        <div>
                          <div className="text-gray-900 font-medium">{tip.title}</div>
                          <div className="text-sm text-gray-300">{tip.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-gray-900">Market Conditions Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketConditions.map((condition, index) => (
                      <div key={index} className="p-4 bg-crypto-surface rounded-lg border border-crypto-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`font-semibold ${condition.color}`}>{condition.condition}</div>
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="text-sm text-gray-300 mb-2">{condition.description}</div>
                        <div className="text-sm text-crypto-primary">
                          Best Strategy: {condition.recommendedStrategy}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}