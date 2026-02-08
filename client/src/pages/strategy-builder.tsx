import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ChevronLeft, CheckCircle, AlertTriangle } from "lucide-react";

export default function StrategyBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChain, setSelectedChain] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [amount, setAmount] = useState("");

  const steps = [
    { id: 1, title: "Select Network", completed: currentStep > 1 },
    { id: 2, title: "Choose Protocol", completed: currentStep > 2 },
    { id: 3, title: "Configure Strategy", completed: currentStep > 3 },
    { id: 4, title: "Review & Deploy", completed: false }
  ];

  const chains = [
    { id: "ethereum", name: "Ethereum", gasLevel: "High", color: "bg-blue-500" },
    { id: "arbitrum", name: "Arbitrum", gasLevel: "Low", color: "bg-blue-400" },
    { id: "polygon", name: "Polygon", gasLevel: "Very Low", color: "bg-purple-500" },
    { id: "solana", name: "Solana", gasLevel: "Very Low", color: "bg-purple-600" }
  ];

  const protocols = [
    {
      id: "curve",
      name: "Stable DEX Platform",
      category: "DEX/AMM",
      apr: "5.2%",
      risk: "Low",
      minDeposit: "$100",
      description: "Stable coin optimized AMM with low slippage",
      steps: "1. Connect wallet → 2. Add liquidity → 3. Earn fees",
      benefits: "Low impermanent loss, stable returns"
    },
    {
      id: "aave",
      name: "Lending Platform",
      category: "Lending",
      apr: "3.8%",
      risk: "Low",
      minDeposit: "$50",
      description: "Decentralized lending and borrowing protocol",
      steps: "1. Deposit collateral → 2. Earn interest → 3. Optional borrowing",
      benefits: "Passive income, flash loans available"
    },
    {
      id: "gmx",
      name: "Derivatives Platform",
      category: "Derivatives",
      apr: "22.4%",
      risk: "High",
      minDeposit: "$1000",
      description: "Decentralized perpetual exchange",
      steps: "1. Stake tokens → 2. Earn fees + rewards → 3. Compound returns",
      benefits: "High APR, real yield from trading fees"
    },
    {
      id: "yearn",
      name: "Yield Optimizer",
      category: "Yield Optimizer",
      apr: "8.9%",
      risk: "Medium",
      minDeposit: "$200",
      description: "Automated yield farming strategies",
      steps: "1. Deposit tokens → 2. Auto-optimization → 3. Harvest rewards",
      benefits: "Set and forget, professional strategies"
    },
    {
      id: "convex",
      name: "Yield Booster",
      category: "Yield Boosting",
      apr: "12.5%",
      risk: "Medium",
      minDeposit: "$500",
      description: "Boost stable DEX yields with additional rewards",
      steps: "1. Deposit LP tokens → 2. Get boosted rewards → 3. Claim tokens",
      benefits: "Higher DEX yields, additional token rewards"
    }
  ];

  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-400",
      Medium: "bg-yellow-500/10 text-yellow-400",
      High: "bg-red-500/10 text-red-400"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500/10 text-gray-300";
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div>
      <Header
        title="Strategy Builder"
        subtitle="Create step-by-step DeFi strategies with guided setup"
      />

      <div className="p-6 space-y-6">
        {/* Progress Steps */}
        <Card className="bg-crypto-surface border-gray-700 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.completed
                      ? "bg-crypto-green border-crypto-green"
                      : currentStep === step.id
                      ? "border-crypto-green text-crypto-green"
                      : "border-gray-600 text-gray-300"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-gray-900" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${currentStep === step.id ? "text-gray-900" : "text-gray-300"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="mx-4 text-gray-600 w-4 h-4" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1: Network Selection */}
            {currentStep === 1 && (
              <Card className="bg-crypto-surface border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Network</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chains.map((chain) => (
                    <div
                      key={chain.id}
                      onClick={() => setSelectedChain(chain.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedChain === chain.id
                          ? "border-crypto-green bg-crypto-green/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${chain.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-gray-900 font-bold">{chain.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{chain.name}</h4>
                          <p className="text-sm text-gray-300">Gas: {chain.gasLevel}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 2: Protocol Selection */}
            {currentStep === 2 && (
              <Card className="bg-crypto-surface border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Protocol</h3>
                <div className="space-y-4">
                  {protocols.map((protocol) => (
                    <div
                      key={protocol.id}
                      onClick={() => setSelectedProtocol(protocol.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProtocol === protocol.id
                          ? "border-crypto-green bg-crypto-green/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{protocol.name}</h4>
                            <Badge className={getRiskColor(protocol.risk)}>
                              {protocol.risk} Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{protocol.description}</p>
                          <p className="text-sm text-crypto-green mb-2">{protocol.steps}</p>
                          <p className="text-sm text-blue-400 mb-3">{protocol.benefits}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-300">APR: <span className="text-green-400 font-medium">{protocol.apr}</span></span>
                            <span className="text-gray-300">Min: <span className="text-gray-900">{protocol.minDeposit}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 3: Strategy Configuration */}
            {currentStep === 3 && (
              <Card className="bg-crypto-surface border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Configure Strategy</h3>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-900 mb-2 block">Investment Amount</Label>
                    <Input
                      placeholder="Enter amount (USD)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-900 mb-2 block">Strategy Type</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-900">
                        <SelectValue placeholder="Select strategy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple Deposit</SelectItem>
                        <SelectItem value="auto-compound">Auto-Compound</SelectItem>
                        <SelectItem value="yield-farming">Yield Farming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-900 mb-2 block">Auto-Exit Conditions</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-600">Exit when profit reaches 25%</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-600">Exit when APR drops below 3%</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-600">Emergency exit on major market downturn</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Review & Deploy */}
            {currentStep === 4 && (
              <Card className="bg-crypto-surface border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Review & Deploy</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Strategy Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Network:</span>
                        <span className="text-gray-900">Ethereum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Protocol:</span>
                        <span className="text-gray-900">Curve Finance</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Amount:</span>
                        <span className="text-gray-900">${amount || "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Expected APR:</span>
                        <span className="text-green-400">5.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="text-amber-400 w-5 h-5 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-amber-400 mb-1">Important Notes</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• This strategy carries low risk but no guarantees</li>
                          <li>• Gas fees will be required for transactions</li>
                          <li>• You can exit the strategy at any time</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Strategy Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-crypto-surface border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Strategy Guide</h4>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-3 mt-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">This strategy will:</p>
                    <ul className="space-y-1">
                      <li>• Provide stable yield with low risk</li>
                      <li>• Auto-compound earnings</li>
                      <li>• Allow easy exit anytime</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="risks" className="space-y-3 mt-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Consider these risks:</p>
                    <ul className="space-y-1">
                      <li>• Smart contract risk</li>
                      <li>• Impermanent loss (for LP tokens)</li>
                      <li>• Gas fee costs</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Estimated Returns */}
            <Card className="bg-crypto-surface border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Estimated Returns</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Daily:</span>
                  <span className="text-green-400 font-medium">+$2.85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Monthly:</span>
                  <span className="text-green-400 font-medium">+$85.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Yearly:</span>
                  <span className="text-green-400 font-medium">+$1,026</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !selectedChain) ||
              (currentStep === 2 && !selectedProtocol) ||
              (currentStep === 3 && !amount)
            }
            className="bg-crypto-green text-black hover:bg-green-400"
          >
            {currentStep === 4 ? "Deploy Strategy" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
