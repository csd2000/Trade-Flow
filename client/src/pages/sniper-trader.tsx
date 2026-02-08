import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Crosshair,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Zap,
  Eye,
  Lock,
  DollarSign,
  BarChart3,
  Building2,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface GateResult {
  gate: number;
  name: string;
  status: 'pass' | 'fail' | 'pending';
  value?: string | number;
  details: string;
}

interface StinkBidResult {
  ticker: string;
  optionType: 'call' | 'put';
  currentPrice: number;
  targetPrice: number;
  currentPremium: number;
  delta: number;
  gamma: number;
  rawLimit: number;
  panicDiscount: number;
  finalLimit: number;
  potentialProfit: number;
  riskReward: string;
}

interface GateAnalysis {
  ticker: string;
  gates: GateResult[];
  totalPassed: number;
  overallStatus: 'ENTRY' | 'WAIT' | 'BLOCKED';
  recommendation: string;
  alerts: { type: 'sweep' | 'sec' | 'whale'; message: string }[];
}

export default function SniperTrader() {
  const [ticker, setTicker] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPremium, setCurrentPremium] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [delta, setDelta] = useState('');
  const [gamma, setGamma] = useState('');
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: gateAnalysis, refetch: refetchGates, isLoading: gatesLoading } = useQuery<GateAnalysis>({
    queryKey: ['/api/sniper/gates', ticker],
    queryFn: async () => {
      if (!ticker) return null;
      const res = await fetch(`/api/sniper/gates?ticker=${ticker.toUpperCase()}`);
      if (!res.ok) throw new Error('Gate analysis failed');
      return res.json();
    },
    enabled: false
  });

  const stinkBidMutation = useMutation({
    mutationFn: async (params: { 
      ticker: string; 
      targetPrice: number; 
      currentPremium: number;
      currentPrice: number;
      delta: number;
      gamma: number;
      optionType: 'call' | 'put';
    }) => {
      const res = await fetch('/api/sniper/stink-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('Calculation failed');
      return res.json();
    }
  });

  const handleAnalyze = async () => {
    if (!ticker) return;
    setIsAnalyzing(true);
    await refetchGates();
    setIsAnalyzing(false);
  };

  const handleCalculateStinkBid = async () => {
    if (!ticker || !targetPrice || !currentPremium || !currentPrice || !delta || !gamma) return;
    await stinkBidMutation.mutateAsync({
      ticker: ticker.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      currentPremium: parseFloat(currentPremium),
      currentPrice: parseFloat(currentPrice),
      delta: parseFloat(delta),
      gamma: parseFloat(gamma),
      optionType
    });
  };

  const getGateIcon = (status: string) => {
    if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-red-400" />;
    return <Lock className="w-5 h-5 text-slate-400" />;
  };

  const getGateColor = (status: string) => {
    if (status === 'pass') return 'border-green-500/50 bg-green-900/20';
    if (status === 'fail') return 'border-red-500/50 bg-red-900/20';
    return 'border-slate-600 bg-slate-800/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
              <Crosshair className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Stink Bid Calculator</h1>
              <p className="text-slate-400 text-sm">7-Gate System & Options Stink Bid</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/whale-shield">
              <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-900/30">
                <Shield className="w-4 h-4 mr-1" /> Whale Shield
              </Button>
            </Link>
            <Link href="/dark-pool-dashboard">
              <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/30">
                <Building2 className="w-4 h-4 mr-1" /> Dark Pool
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-red-900/30 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">High-Conviction "Stink Bid" Entry System</h3>
                <p className="text-slate-300 text-sm">
                  Enter a ticker to run the 7-Gate validation system. All gates must pass for a confirmed entry signal. 
                  Use the Stink Bid Calculator to get your exact limit order price with an 8% panic discount.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                7-Gate Analysis
              </CardTitle>
              <CardDescription>Enter ticker to validate all entry gates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ticker (e.g., AAPL)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="bg-slate-900 border-slate-600 text-white"
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={!ticker || isAnalyzing || gatesLoading}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isAnalyzing || gatesLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1" /> Analyze
                    </>
                  )}
                </Button>
              </div>

              {gateAnalysis && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        gateAnalysis.overallStatus === 'ENTRY' ? 'bg-green-600' :
                        gateAnalysis.overallStatus === 'WAIT' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {gateAnalysis.overallStatus}
                      </Badge>
                      <span className="text-white font-semibold">{gateAnalysis.ticker}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Gates Passed</div>
                      <div className="text-xl font-bold text-white">{gateAnalysis.totalPassed}/7</div>
                    </div>
                  </div>

                  <Progress 
                    value={(gateAnalysis.totalPassed / 7) * 100} 
                    className="h-2"
                  />

                  {gateAnalysis.alerts && gateAnalysis.alerts.length > 0 && (
                    <div className="space-y-2">
                      {gateAnalysis.alerts.map((alert, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg flex items-center gap-2 ${
                            alert.type === 'sweep' ? 'bg-green-900/30 border border-green-500/30' :
                            alert.type === 'sec' ? 'bg-red-900/30 border border-red-500/30' :
                            'bg-purple-900/30 border border-purple-500/30'
                          }`}
                        >
                          {alert.type === 'sweep' ? (
                            <Zap className="w-5 h-5 text-green-400" />
                          ) : alert.type === 'sec' ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Shield className="w-5 h-5 text-purple-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            alert.type === 'sweep' ? 'text-green-400' :
                            alert.type === 'sec' ? 'text-red-400' :
                            'text-purple-400'
                          }`}>
                            {alert.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {gateAnalysis.gates.map((gate) => (
                      <div 
                        key={gate.gate}
                        className={`p-3 rounded-lg border ${getGateColor(gate.status)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getGateIcon(gate.status)}
                            <span className="text-white font-medium text-sm">
                              Gate {gate.gate}: {gate.name}
                            </span>
                          </div>
                          {gate.value !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {gate.value}
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1 ml-7">{gate.details}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                    <p className="text-slate-300 text-sm">{gateAnalysis.recommendation}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Options Stink Bid Calculator
              </CardTitle>
              <CardDescription>Calculate exact option limit order with 8% panic discount using Delta + Gamma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-2 rounded-lg bg-blue-900/20 border border-blue-500/30 mb-2">
                <p className="text-blue-400 text-xs text-center">This calculator is for OPTIONS contracts only - Enter all data from your option chain</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Option Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={optionType === 'call' ? 'default' : 'outline'}
                      onClick={() => setOptionType('call')}
                      className={optionType === 'call' 
                        ? 'flex-1 bg-green-600 hover:bg-green-700 text-white font-bold' 
                        : 'flex-1 border-slate-600 text-slate-300 hover:bg-slate-700'}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      CALL
                    </Button>
                    <Button
                      type="button"
                      variant={optionType === 'put' ? 'default' : 'outline'}
                      onClick={() => setOptionType('put')}
                      className={optionType === 'put' 
                        ? 'flex-1 bg-red-600 hover:bg-red-700 text-white font-bold' 
                        : 'flex-1 border-slate-600 text-slate-300 hover:bg-slate-700'}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      PUT
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Underlying Ticker</Label>
                  <Input
                    placeholder="AAPL"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Current Stock Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="227.25"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Stock Target Price (Sweep Level)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="225.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Current Option Premium ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="4.50"
                    value={currentPremium}
                    onChange={(e) => setCurrentPremium(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300 text-sm">Option Delta</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.55"
                      value={delta}
                      onChange={(e) => setDelta(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Option Gamma</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.05"
                      value={gamma}
                      onChange={(e) => setGamma(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCalculateStinkBid}
                disabled={!ticker || !targetPrice || !currentPremium || !currentPrice || !delta || !gamma || stinkBidMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
              >
                {stinkBidMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Crosshair className="w-5 h-5 mr-2" />
                    SNIPER CALCULATE
                  </>
                )}
              </Button>

              {stinkBidMutation.data && (
                <div className="space-y-4 mt-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50">
                    <div className="text-center">
                      <Badge className={`mb-2 ${stinkBidMutation.data.optionType === 'call' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {stinkBidMutation.data.optionType === 'call' ? (
                          <><TrendingUp className="w-3 h-3 mr-1 inline" /> CALL OPTION</>
                        ) : (
                          <><TrendingDown className="w-3 h-3 mr-1 inline" /> PUT OPTION</>
                        )}
                      </Badge>
                      <p className="text-slate-400 text-sm mb-1">Your Limit Order Price</p>
                      <p className="text-4xl font-black text-green-400">
                        ${Number(stinkBidMutation.data.finalLimit).toFixed(2)}
                      </p>
                      <Badge className="bg-green-600 mt-2">8% PANIC DISCOUNT APPLIED</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                      <p className="text-slate-400 text-xs">Current Price</p>
                      <p className="text-lg font-bold text-white">${Number(stinkBidMutation.data.currentPrice).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                      <p className="text-slate-400 text-xs">Target Price</p>
                      <p className="text-lg font-bold text-white">${Number(stinkBidMutation.data.targetPrice).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                      <p className="text-slate-400 text-xs">Delta</p>
                      <p className="text-lg font-bold text-cyan-400">{Number(stinkBidMutation.data.delta).toFixed(3)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
                      <p className="text-slate-400 text-xs">Gamma</p>
                      <p className="text-lg font-bold text-purple-400">{Number(stinkBidMutation.data.gamma).toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-500/30 text-center">
                      <p className="text-blue-400 text-xs">Raw Limit</p>
                      <p className="text-lg font-bold text-white">${Number(stinkBidMutation.data.rawLimit).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-900/30 border border-orange-500/30 text-center">
                      <p className="text-orange-400 text-xs">Panic Discount</p>
                      <p className="text-lg font-bold text-white">-${Number(stinkBidMutation.data.panicDiscount).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Potential Profit on Bounce</span>
                      <span className="text-green-400 font-bold">
                        +${Number(stinkBidMutation.data.potentialProfit).toFixed(2)} ({stinkBidMutation.data.riskReward})
                      </span>
                    </div>
                  </div>

                  <Card className="bg-slate-900/50 border-slate-700">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-slate-300 text-sm font-semibold mb-3">Step-by-Step Calculation:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-700">
                          <span className="text-slate-400">1. Option Type</span>
                          <span className={`font-mono font-bold ${stinkBidMutation.data.optionType === 'call' ? 'text-green-400' : 'text-red-400'}`}>
                            {stinkBidMutation.data.optionType.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-700">
                          <span className="text-slate-400">2. Target (Sweep Level)</span>
                          <span className="text-white font-mono">${Number(stinkBidMutation.data.targetPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-700">
                          <span className="text-slate-400">3. Price Movement</span>
                          <span className="text-cyan-400 font-mono">
                            |${Number(stinkBidMutation.data.currentPrice).toFixed(2)} - ${Number(stinkBidMutation.data.targetPrice).toFixed(2)}| = ${Number(stinkBidMutation.data.priceDiff).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-700">
                          <span className="text-slate-400">4. Delta Impact</span>
                          <span className="text-purple-400 font-mono">
                            {Number(stinkBidMutation.data.delta).toFixed(3)} × ${Number(stinkBidMutation.data.priceDiff).toFixed(2)} = ${(Number(stinkBidMutation.data.priceDiff) * Number(stinkBidMutation.data.delta)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-700">
                          <span className="text-slate-400">5. Gamma Curve</span>
                          <span className="text-yellow-400 font-mono">
                            +${(0.5 * Number(stinkBidMutation.data.gamma) * Math.pow(Number(stinkBidMutation.data.priceDiff), 2)).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-700">
                          <span className="text-slate-400">6. Raw Stink Bid</span>
                          <span className="text-white font-mono">${Number(stinkBidMutation.data.rawLimit).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1 bg-green-900/30 rounded px-2">
                          <span className="text-green-400 font-medium">7. Final (8% Discount)</span>
                          <span className="text-green-400 font-bold font-mono">${Number(stinkBidMutation.data.finalLimit).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-900/20 border-amber-500/30">
                    <CardContent className="p-3">
                      <p className="text-amber-400 text-xs">
                        <strong>Formula:</strong> {stinkBidMutation.data.formula || 'Calculating...'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              7-Gate System Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-red-600">Gate 1</Badge>
                  <span className="text-white text-sm font-medium">Liquidity Sweep</span>
                </div>
                <p className="text-slate-400 text-xs">Primary trigger - price wicks below key level and recovers</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-600">Gate 2</Badge>
                  <span className="text-white text-sm font-medium">SEC Risk Filter</span>
                </div>
                <p className="text-slate-400 text-xs">Screen for 10-K/8-K litigation or impairments</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-600">Gate 3</Badge>
                  <span className="text-white text-sm font-medium">Whale Shield PCR</span>
                </div>
                <p className="text-slate-400 text-xs">High PCR (&gt;1.0) during dip confirms retail panic buy zone</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600">Gate 4</Badge>
                  <span className="text-white text-sm font-medium">Max Pain Alignment</span>
                </div>
                <p className="text-slate-400 text-xs">Entry near Max Pain price for institutional stability</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-cyan-600">Gate 5</Badge>
                  <span className="text-white text-sm font-medium">Delta-Gamma Drift</span>
                </div>
                <p className="text-slate-400 text-xs">Calculate entry using Stink Bid formula</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">Gate 6</Badge>
                  <span className="text-white text-sm font-medium">Volatility Spike</span>
                </div>
                <p className="text-slate-400 text-xs">IV increasing during drop maximizes bounce value</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-pink-600">Gate 7</Badge>
                  <span className="text-white text-sm font-medium">Dark Pool Tracking</span>
                </div>
                <p className="text-slate-400 text-xs">Check for block trades at target support level</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">Panic Discount</span>
                </div>
                <p className="text-slate-400 text-xs">8% additional discount for liquidity sweep overshoot</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-slate-500 text-xs">
          Data Source: Yahoo Finance + Options Chain Analysis | Real-time Gate Validation
        </div>
      </div>
    </div>
  );
}
