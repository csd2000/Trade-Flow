import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Target, Calendar, Bell } from "lucide-react";
import { mockActiveStrategies } from "@/lib/mock-data";

export default function ExitStrategy() {
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [exitType, setExitType] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [percentageToExit, setPercentageToExit] = useState("");

  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-400 border-green-500/20",
      Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      High: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500/10 text-gray-300";
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      pink: "bg-pink-500",
      green: "bg-green-500"
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div>
      <Header
        title="Exit Strategy"
        subtitle="Plan and execute your DeFi exit strategies"
      />

      <div className="p-6 space-y-6">
        {/* Market Conditions Alert */}
        <Card className="bg-gradient-to-r from-crypto-amber/10 to-red-500/10 border border-crypto-amber/30 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-crypto-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-crypto-amber h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Alert</h3>
              <p className="text-gray-600 mb-4">
                Bitcoin is approaching historical resistance at $70,000. Your GMX position has gained 28% since entry.
                Consider taking some profits or setting up automated exit conditions.
              </p>
              <div className="flex items-center space-x-4">
                <Button className="bg-crypto-amber text-black hover:bg-amber-400">
                  Set Exit Rules
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-600 hover:text-gray-900">
                  View Analysis
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exit Strategy Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-crypto-surface border-gray-700">
              <Tabs defaultValue="manual" className="w-full">
                <div className="border-b border-gray-700 px-6">
                  <TabsList className="bg-transparent h-12">
                    <TabsTrigger value="manual" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                      Manual Exit
                    </TabsTrigger>
                    <TabsTrigger value="automated" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                      Automated Rules
                    </TabsTrigger>
                    <TabsTrigger value="dca" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                      DCA Out
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="manual" className="p-6 space-y-6">
                  <div>
                    <Label className="text-gray-900 mb-3 block">Select Strategy to Exit</Label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-900">
                        <SelectValue placeholder="Choose a strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockActiveStrategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name} - {strategy.amount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-3 block">Exit Percentage</Label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {["25%", "50%", "75%", "100%"].map((percent) => (
                        <Button
                          key={percent}
                          variant={percentageToExit === percent ? "default" : "outline"}
                          onClick={() => setPercentageToExit(percent)}
                          className={percentageToExit === percent ? "bg-crypto-green text-black" : "border-gray-600 text-gray-600"}
                        >
                          {percent}
                        </Button>
                      ))}
                    </div>
                    <Input
                      placeholder="Custom percentage"
                      value={percentageToExit}
                      onChange={(e) => setPercentageToExit(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-gray-900"
                    />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Exit Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Strategy:</span>
                        <span className="text-gray-900">Curve stETH/ETH LP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Current Value:</span>
                        <span className="text-gray-900">$42,150.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exit Amount:</span>
                        <span className="text-crypto-green">$10,537.50 (25%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Estimated Gas:</span>
                        <span className="text-gray-900">~$15.00</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-crypto-amber text-black hover:bg-amber-400">
                    Execute Exit
                  </Button>
                </TabsContent>

                <TabsContent value="automated" className="p-6 space-y-6">
                  <div>
                    <Label className="text-gray-900 mb-3 block">Profit Target</Label>
                    <div className="flex items-center space-x-3">
                      <Switch />
                      <span className="text-gray-600">Exit when profit reaches</span>
                      <Input
                        placeholder="25"
                        className="w-20 bg-gray-700 border-gray-600 text-gray-900"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-3 block">Stop Loss</Label>
                    <div className="flex items-center space-x-3">
                      <Switch />
                      <span className="text-gray-600">Exit when loss reaches</span>
                      <Input
                        placeholder="10"
                        className="w-20 bg-gray-700 border-gray-600 text-gray-900"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-3 block">APR Threshold</Label>
                    <div className="flex items-center space-x-3">
                      <Switch />
                      <span className="text-gray-600">Exit when APR drops below</span>
                      <Input
                        placeholder="3"
                        className="w-20 bg-gray-700 border-gray-600 text-gray-900"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-3 block">Market Conditions</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Switch />
                        <span className="text-gray-600">Exit on major market downturn ({'>'}15% BTC drop)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch />
                        <span className="text-gray-600">Exit when Fear & Greed Index {'<'} 20</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-crypto-green text-black hover:bg-green-400">
                    Save Automation Rules
                  </Button>
                </TabsContent>

                <TabsContent value="dca" className="p-6 space-y-6">
                  <div>
                    <Label className="text-gray-900 mb-3 block">DCA Schedule</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-900">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-3 block">Exit Amount per Period</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        placeholder="5"
                        className="bg-gray-700 border-gray-600 text-gray-900"
                      />
                      <span className="text-gray-600">% of position</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-3 block">Duration</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        placeholder="20"
                        className="bg-gray-700 border-gray-600 text-gray-900"
                      />
                      <span className="text-gray-600">weeks</span>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">DCA Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Weekly Exit:</span>
                        <span className="text-gray-900">5% ($2,107.50)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Duration:</span>
                        <span className="text-gray-900">20 weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Complete Exit:</span>
                        <span className="text-gray-900">100% in 20 weeks</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-crypto-blue text-gray-900 hover:bg-blue-600">
                    Setup DCA Exit
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Market Indicators */}
            <Card className="bg-crypto-surface border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Market Indicators
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Fear & Greed Index</span>
                  <span className="text-crypto-green font-medium">72 - Greed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">BTC Dominance</span>
                  <span className="text-gray-900 font-medium">58.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Market Cap</span>
                  <span className="text-gray-900 font-medium">$2.8T</span>
                </div>
              </div>
            </Card>

            {/* Active Alerts */}
            <Card className="bg-crypto-surface border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Active Alerts
              </h4>
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 font-medium text-sm">BTC Target Hit</p>
                  <p className="text-gray-600 text-sm">Bitcoin reached $67,000</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-400 font-medium text-sm">APR Warning</p>
                  <p className="text-gray-600 text-sm">Curve APR dropped to 3.2%</p>
                </div>
              </div>
            </Card>

            {/* Exit Tips */}
            <Card className="bg-crypto-surface border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Exit Tips
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">Take Profits Gradually</p>
                  <p>Consider exiting in stages rather than all at once to reduce timing risk.</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">Monitor Gas Fees</p>
                  <p>Exit during low gas periods to maximize your returns.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
