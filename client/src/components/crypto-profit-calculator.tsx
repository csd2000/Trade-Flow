import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, AlertTriangle, Target, BarChart3, DollarSign, Calculator } from "lucide-react";

interface ProfitTarget {
  percentage: number;
  sellAmount: number;
  priceLevel: number;
  buyPrice?: number;
  sellPrice?: number;
  dollarProfit?: number;
  remainingPosition?: number;
}

interface RiskProfile {
  portfolioSize: number;
  investmentHorizon: string;
  riskTolerance: string;
  cryptoType: string;
}

interface BuySellCalculation {
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
  investmentAmount: number;
  profitAmount: number;
  totalReturn: number;
  fees: number;
  netProfit: number;
}

export default function CryptoProfitCalculator() {
  const [riskProfile, setRiskProfile] = useState<RiskProfile>({
    portfolioSize: 10000,
    investmentHorizon: "long-term",
    riskTolerance: "moderate",
    cryptoType: "large-cap"
  });
  
  const [buyPrice, setBuyPrice] = useState<number>(50000);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [profitPercentage, setProfitPercentage] = useState<number>(20);
  const [exchangeFee, setExchangeFee] = useState<number>(0.1);
  const [targets, setTargets] = useState<ProfitTarget[]>([
    { percentage: 20, sellAmount: 25, priceLevel: 60000 },
    { percentage: 50, sellAmount: 25, priceLevel: 75000 },
    { percentage: 100, sellAmount: 25, priceLevel: 100000 },
    { percentage: 200, sellAmount: 25, priceLevel: 150000 }
  ]);

  const calculateBuySellPrices = (): BuySellCalculation => {
    const sellPrice = buyPrice * (1 + profitPercentage / 100);
    const totalFees = (investmentAmount * exchangeFee / 100) * 2; // Buy + Sell fees
    const grossProfit = (sellPrice - buyPrice) * (investmentAmount / buyPrice);
    const netProfit = grossProfit - totalFees;
    
    return {
      buyPrice,
      sellPrice,
      profitPercentage,
      investmentAmount,
      profitAmount: grossProfit,
      totalReturn: investmentAmount + netProfit,
      fees: totalFees,
      netProfit
    };
  };

  const calculateProfitTargets = () => {
    return targets.map(target => {
      const targetSellPrice = buyPrice * (1 + target.percentage / 100);
      const sellAmount = investmentAmount * (target.sellAmount / 100);
      const coinsOwned = investmentAmount / buyPrice;
      const coinsSold = coinsOwned * (target.sellAmount / 100);
      const grossProfit = (targetSellPrice - buyPrice) * coinsSold;
      const fees = (sellAmount * exchangeFee / 100);
      const netProfit = grossProfit - fees;
      
      return {
        ...target,
        buyPrice,
        sellPrice: targetSellPrice,
        priceLevel: targetSellPrice,
        dollarProfit: netProfit,
        remainingPosition: investmentAmount - sellAmount
      };
    });
  };

  const calculateCustomTarget = (customPercentage: number) => {
    const sellPrice = buyPrice * (1 + customPercentage / 100);
    const coinsOwned = investmentAmount / buyPrice;
    const grossProfit = (sellPrice - buyPrice) * coinsOwned;
    const fees = (investmentAmount * exchangeFee / 100) * 2;
    const netProfit = grossProfit - fees;
    
    return {
      buyPrice,
      sellPrice,
      profitPercentage: customPercentage,
      investmentAmount,
      grossProfit,
      netProfit,
      fees,
      totalReturn: investmentAmount + netProfit
    };
  };

  const getRiskRecommendations = () => {
    const baseRecommendations = {
      conservative: {
        maxSellPerTarget: 15,
        stopLoss: 10,
        rebalanceFreq: "Monthly",
        stablecoinAllocation: 40
      },
      moderate: {
        maxSellPerTarget: 25,
        stopLoss: 15,
        rebalanceFreq: "Bi-weekly", 
        stablecoinAllocation: 30
      },
      aggressive: {
        maxSellPerTarget: 40,
        stopLoss: 20,
        rebalanceFreq: "Weekly",
        stablecoinAllocation: 20
      }
    };
    
    return baseRecommendations[riskProfile.riskTolerance as keyof typeof baseRecommendations];
  };

  const calculateRSISignals = (price: number) => {
    // Simplified RSI calculation for demo
    const rsi = 50 + (Math.random() - 0.5) * 60; // Mock RSI between 20-80
    return {
      rsi: rsi.toFixed(1),
      signal: rsi > 70 ? "SELL" : rsi < 30 ? "BUY" : "HOLD",
      strength: rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"
    };
  };

  const buySellCalculation = calculateBuySellPrices();
  const updatedTargets = calculateProfitTargets();
  const recommendations = getRiskRecommendations();
  const rsiData = calculateRSISignals(buyPrice);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-gray-900">Master Crypto Profit-Taking Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Complete systematic framework using ABN methodology, technical triggers, and automated order planning
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">📊 Profile</TabsTrigger>
          <TabsTrigger value="calculator">🧮 Calculator</TabsTrigger>
          <TabsTrigger value="technical">📈 Technical</TabsTrigger>
          <TabsTrigger value="automation">🤖 Automation</TabsTrigger>
        </TabsList>

        {/* User Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Risk Profile & Portfolio Setup
              </CardTitle>
              <CardDescription>Define your investment parameters for personalized profit-taking strategies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portfolio-size">Total Portfolio Size ($)</Label>
                  <Input
                    id="portfolio-size"
                    type="number"
                    value={riskProfile.portfolioSize}
                    onChange={(e) => setRiskProfile({...riskProfile, portfolioSize: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="investment-horizon">Investment Horizon</Label>
                  <Select value={riskProfile.investmentHorizon} onValueChange={(value) => setRiskProfile({...riskProfile, investmentHorizon: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-term">Short-term (1-6 months)</SelectItem>
                      <SelectItem value="medium-term">Medium-term (6-18 months)</SelectItem>
                      <SelectItem value="long-term">Long-term (18+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                  <Select value={riskProfile.riskTolerance} onValueChange={(value) => setRiskProfile({...riskProfile, riskTolerance: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="crypto-type">Preferred Crypto Type</Label>
                  <Select value={riskProfile.cryptoType} onValueChange={(value) => setRiskProfile({...riskProfile, cryptoType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large-cap">Large-cap (BTC/ETH)</SelectItem>
                      <SelectItem value="defi">DeFi Tokens</SelectItem>
                      <SelectItem value="altcoins">Altcoins</SelectItem>
                      <SelectItem value="mixed">Mixed Portfolio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation for {riskProfile.riskTolerance} risk:</strong> Max {recommendations?.maxSellPerTarget}% sell per target, 
                  {recommendations?.stopLoss}% stop-loss, rebalance {recommendations?.rebalanceFreq.toLowerCase()}, 
                  {recommendations?.stablecoinAllocation}% stablecoin allocation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Profit Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          {/* Buy/Sell Price Calculator Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <DollarSign className="h-5 w-5" />
                  Buy/Sell Price Calculator
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Calculate exact buy and sell prices for any profit percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buy-price" className="text-blue-800 font-semibold">Buy Price ($)</Label>
                    <Input
                      id="buy-price"
                      type="number"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(Number(e.target.value))}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="investment-amount" className="text-blue-800 font-semibold">Investment Amount ($)</Label>
                    <Input
                      id="investment-amount"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profit-percentage" className="text-blue-800 font-semibold">Target Profit (%)</Label>
                    <Input
                      id="profit-percentage"
                      type="number"
                      value={profitPercentage}
                      onChange={(e) => setProfitPercentage(Number(e.target.value))}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exchange-fee" className="text-blue-800 font-semibold">Exchange Fee (%)</Label>
                    <Input
                      id="exchange-fee"
                      type="number"
                      step="0.01"
                      value={exchangeFee}
                      onChange={(e) => setExchangeFee(Number(e.target.value))}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Quick Profit Percentage Presets */}
                <div className="border-t pt-4">
                  <Label className="text-blue-800 font-semibold mb-3 block">Quick Profit Presets</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map((percentage) => (
                      <Button
                        key={percentage}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 hover:bg-blue-100"
                        onClick={() => setProfitPercentage(percentage)}
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Target className="h-5 w-5" />
                  Profit Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                    <span className="font-semibold text-green-800">Buy Price:</span>
                    <span className="font-bold text-green-900">${buySellCalculation.buyPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                    <span className="font-semibold text-blue-800">Sell Price:</span>
                    <span className="font-bold text-blue-900">${buySellCalculation.sellPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg">
                    <span className="font-semibold text-yellow-800">Profit Percentage:</span>
                    <span className="font-bold text-yellow-900">{buySellCalculation.profitPercentage}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
                    <span className="font-semibold text-purple-800">Net Profit:</span>
                    <span className="font-bold text-purple-900">${buySellCalculation.netProfit.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                    <span className="font-semibold text-gray-800">Total Return:</span>
                    <span className="font-bold text-gray-900">${buySellCalculation.totalReturn.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                    <span className="font-semibold text-red-800">Total Fees:</span>
                    <span className="font-bold text-red-900">${buySellCalculation.fees.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="border-t pt-4 space-y-2">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    Set Buy Order at ${buySellCalculation.buyPrice.toLocaleString()}
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    Set Sell Order at ${buySellCalculation.sellPrice.toLocaleString()}
                  </Button>
                </div>
              </CardContent>
            </Card>
          
          {/* Comprehensive Trade Execution Plan */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Target className="h-5 w-5" />
                Complete Trading Plan Summary
              </CardTitle>
              <CardDescription className="text-purple-700">
                Your step-by-step crypto profit-taking execution plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-100 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Entry Strategy</h4>
                  <div className="space-y-2 text-sm">
                    <div>💰 Buy at: <span className="font-bold">${buySellCalculation.buyPrice.toLocaleString()}</span></div>
                    <div>📊 Investment: <span className="font-bold">${buySellCalculation.investmentAmount.toLocaleString()}</span></div>
                    <div>🎯 Target: <span className="font-bold">{buySellCalculation.profitPercentage}% profit</span></div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-100 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Exit Strategy</h4>
                  <div className="space-y-2 text-sm">
                    <div>💸 Sell at: <span className="font-bold">${buySellCalculation.sellPrice.toLocaleString()}</span></div>
                    <div>💎 Net Profit: <span className="font-bold">${buySellCalculation.netProfit.toFixed(2)}</span></div>
                    <div>💰 Total Return: <span className="font-bold">${buySellCalculation.totalReturn.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-100 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Automated Order Instructions</h4>
                <div className="space-y-2 text-sm">
                  <div>1. Set buy limit order at ${buySellCalculation.buyPrice.toLocaleString()}</div>
                  <div>2. Immediately set sell limit order at ${buySellCalculation.sellPrice.toLocaleString()}</div>
                  <div>3. Total fees estimated: ${buySellCalculation.fees.toFixed(2)} ({exchangeFee}% buy + {exchangeFee}% sell)</div>
                  <div>4. Expected profit after fees: ${buySellCalculation.netProfit.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Multiple Targets Overview */}
          <Card>
              <CardHeader>
                <CardTitle>ABN Profit-Taking Framework</CardTitle>
                <CardDescription>Systematic targets based on your risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updatedTargets.map((target, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="bg-green-500">+{target.percentage}%</Badge>
                        <span className="font-bold">${target.priceLevel.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Sell: {target.sellAmount}% of position</div>
                        <div>Profit: ${target.dollarProfit?.toLocaleString()}</div>
                        <div>Remaining: ${target.remainingPosition?.toLocaleString()}</div>
                      </div>
                      <Progress value={target.sellAmount} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Analysis Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  RSI Technical Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2 text-blue-600">{rsiData.rsi}</div>
                    <div className="text-sm text-gray-600">Current RSI</div>
                  </div>
                  <div className="flex justify-center">
                    <Badge className={`${
                      rsiData.signal === 'BUY' ? 'bg-green-500' : 
                      rsiData.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                    } text-white text-lg px-4 py-2`}>
                      {rsiData.signal}
                    </Badge>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Market Status: {rsiData.strength}
                  </div>
                  <Progress value={Number(rsiData.rsi)} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Oversold (30)</span>
                    <span>Neutral (50)</span>
                    <span>Overbought (70)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fibonacci Retracement Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { level: "78.6%", price: buyPrice * 0.786, type: "Strong Support" },
                    { level: "61.8%", price: buyPrice * 0.618, type: "Key Support" },
                    { level: "50%", price: buyPrice * 0.5, type: "Psychological" },
                    { level: "38.2%", price: buyPrice * 0.382, type: "Light Support" },
                    { level: "23.6%", price: buyPrice * 0.236, type: "Minor Support" }
                  ].map((fib, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-semibold">{fib.level}</span>
                        <span className="text-sm text-gray-500 ml-2">{fib.type}</span>
                      </div>
                      <span className="font-mono">${fib.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Automated Order Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Take-Profit Orders:</strong> Set at ${updatedTargets[0]?.priceLevel.toLocaleString()}, 
                    ${updatedTargets[1]?.priceLevel.toLocaleString()}, ${updatedTargets[2]?.priceLevel.toLocaleString()}
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Trailing Stop-Loss:</strong> Set at {recommendations?.stopLoss}% below buy price 
                    (${(buyPrice * (1 - (recommendations?.stopLoss || 15) / 100)).toLocaleString()})
                  </AlertDescription>
                </Alert>
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Grid Bot Settings:</strong> Range: ${(buyPrice * 0.9).toLocaleString()} - 
                    ${(buyPrice * 1.1).toLocaleString()}, 10 levels, 2% spacing
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rebalancing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Stablecoins</span>
                    <span className="font-bold">{recommendations?.stablecoinAllocation}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>DeFi Staking</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>New Opportunities</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Hold Original Position</span>
                    <span className="font-bold">{100 - (recommendations?.stablecoinAllocation || 30) - 45}%</span>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Setup Automated Rebalancing
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}