import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Target } from "lucide-react";

export function TradingCalculators() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Trading Calculators & Tools</h2>
      </div>
      
      <Tabs defaultValue="position" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="position">Position Sizing</TabsTrigger>
          <TabsTrigger value="risk">Risk/Reward</TabsTrigger>
          <TabsTrigger value="profit">Profit Target</TabsTrigger>
          <TabsTrigger value="compound">Compound Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="position">
          <PositionSizeCalculator />
        </TabsContent>
        
        <TabsContent value="risk">
          <RiskRewardCalculator />
        </TabsContent>
        
        <TabsContent value="profit">
          <ProfitTargetCalculator />
        </TabsContent>
        
        <TabsContent value="compound">
          <CompoundGrowthCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState<string>("");
  const [riskPercent, setRiskPercent] = useState<string>("2");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const account = parseFloat(accountSize);
    const risk = parseFloat(riskPercent);
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);

    if (!account || !risk || !entry || !stop) {
      return;
    }

    const riskAmount = account * (risk / 100);
    const stopDistance = Math.abs(entry - stop);
    const positionSize = Math.floor(riskAmount / stopDistance);
    const totalCost = positionSize * entry;
    const maxLoss = positionSize * stopDistance;

    setResult({
      positionSize,
      riskAmount: riskAmount.toFixed(2),
      stopDistance: stopDistance.toFixed(2),
      totalCost: totalCost.toFixed(2),
      maxLoss: maxLoss.toFixed(2),
      percentOfAccount: ((totalCost / account) * 100).toFixed(2)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Position Size Calculator
        </CardTitle>
        <CardDescription>
          Calculate the optimal number of shares/contracts based on your risk management rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountSize">Account Size ($)</Label>
            <Input
              id="accountSize"
              type="number"
              placeholder="10000"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              data-testid="input-account-size"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="riskPercent">Risk Per Trade (%)</Label>
            <Input
              id="riskPercent"
              type="number"
              placeholder="2"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              data-testid="input-risk-percent"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry Price ($)</Label>
            <Input
              id="entryPrice"
              type="number"
              placeholder="50.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              data-testid="input-entry-price"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stopLoss">Stop Loss ($)</Label>
            <Input
              id="stopLoss"
              type="number"
              placeholder="48.00"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              data-testid="input-stop-loss"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate-position">
          Calculate Position Size
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg mb-3">Results:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Position Size:</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-position-size">
                  {result.positionSize} shares
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total Cost:</p>
                <p className="text-xl font-bold">${result.totalCost}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Risk Amount:</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${result.riskAmount}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Stop Distance:</p>
                <p className="text-lg">${result.stopDistance}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Max Loss:</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${result.maxLoss}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">% of Account:</p>
                <p className="text-lg">{result.percentOfAccount}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RiskRewardCalculator() {
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const target = parseFloat(targetPrice);

    if (!entry || !stop || !target) {
      return;
    }

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const ratio = reward / risk;

    setResult({
      risk: risk.toFixed(2),
      reward: reward.toFixed(2),
      ratio: ratio.toFixed(2),
      quality: ratio >= 3 ? "Excellent" : ratio >= 2 ? "Good" : ratio >= 1.5 ? "Acceptable" : "Poor"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Risk/Reward Ratio Calculator
        </CardTitle>
        <CardDescription>
          Determine if a trade setup has favorable risk/reward ratio (minimum 1.5:1, ideal 2:1 or better)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rr-entry">Entry Price ($)</Label>
            <Input
              id="rr-entry"
              type="number"
              placeholder="50.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              data-testid="input-rr-entry"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rr-stop">Stop Loss ($)</Label>
            <Input
              id="rr-stop"
              type="number"
              placeholder="48.00"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              data-testid="input-rr-stop"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rr-target">Target Price ($)</Label>
            <Input
              id="rr-target"
              type="number"
              placeholder="56.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              data-testid="input-rr-target"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate-rr">
          Calculate Risk/Reward
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Results:</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Risk:</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  ${result.risk}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Reward:</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  ${result.reward}
                </p>
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk/Reward Ratio:</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-rr-ratio">
                {result.ratio}:1
              </p>
              <p className={`mt-2 font-semibold ${
                result.quality === "Excellent" ? "text-green-600" :
                result.quality === "Good" ? "text-blue-600" :
                result.quality === "Acceptable" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {result.quality} Setup
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfitTargetCalculator() {
  const [positionSize, setPositionSize] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const size = parseFloat(positionSize);
    const entry = parseFloat(entryPrice);
    const target = parseFloat(targetPrice);

    if (!size || !entry || !target) {
      return;
    }

    const priceMove = target - entry;
    const profit = size * priceMove;
    const percentGain = (priceMove / entry) * 100;

    setResult({
      profit: profit.toFixed(2),
      percentGain: percentGain.toFixed(2),
      priceMove: priceMove.toFixed(2)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Profit Target Calculator
        </CardTitle>
        <CardDescription>
          Calculate potential profit based on your target price
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pt-size">Position Size</Label>
            <Input
              id="pt-size"
              type="number"
              placeholder="100"
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              data-testid="input-pt-size"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pt-entry">Entry Price ($)</Label>
            <Input
              id="pt-entry"
              type="number"
              placeholder="50.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              data-testid="input-pt-entry"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pt-target">Target Price ($)</Label>
            <Input
              id="pt-target"
              type="number"
              placeholder="56.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              data-testid="input-pt-target"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate-profit">
          Calculate Profit
        </Button>

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">Potential Profit:</h3>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2" data-testid="text-profit-amount">
                ${result.profit}
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                +{result.percentGain}% gain
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                ${result.priceMove} per share move
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompoundGrowthCalculator() {
  const [initialBalance, setInitialBalance] = useState<string>("");
  const [monthlyReturn, setMonthlyReturn] = useState<string>("");
  const [months, setMonths] = useState<string>("12");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const initial = parseFloat(initialBalance);
    const returnRate = parseFloat(monthlyReturn) / 100;
    const periods = parseInt(months);

    if (!initial || !returnRate || !periods) {
      return;
    }

    const finalBalance = initial * Math.pow(1 + returnRate, periods);
    const totalProfit = finalBalance - initial;
    const percentGain = (totalProfit / initial) * 100;

    setResult({
      finalBalance: finalBalance.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      percentGain: percentGain.toFixed(2),
      annualizedReturn: (percentGain / (periods / 12)).toFixed(2)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Compound Growth Calculator
        </CardTitle>
        <CardDescription>
          Project your account growth with consistent returns over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cg-initial">Initial Balance ($)</Label>
            <Input
              id="cg-initial"
              type="number"
              placeholder="10000"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              data-testid="input-cg-initial"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cg-return">Monthly Return (%)</Label>
            <Input
              id="cg-return"
              type="number"
              placeholder="3"
              value={monthlyReturn}
              onChange={(e) => setMonthlyReturn(e.target.value)}
              data-testid="input-cg-return"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cg-months">Time Period (months)</Label>
            <Input
              id="cg-months"
              type="number"
              placeholder="12"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              data-testid="input-cg-months"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate-compound">
          Calculate Growth
        </Button>

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Projected Results:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Final Balance:</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-final-balance">
                  ${result.finalBalance}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Profit:</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${result.totalProfit}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Gain:</p>
                <p className="text-xl font-semibold">+{result.percentGain}%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Annualized Return:</p>
                <p className="text-xl font-semibold">{result.annualizedReturn}%/year</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
