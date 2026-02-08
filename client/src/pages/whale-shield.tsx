import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, AlertTriangle, TrendingUp, TrendingDown, Target,
  Activity, RefreshCcw, Search, Zap, Eye, DollarSign,
  BarChart3, PieChart, AlertCircle
} from 'lucide-react';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

interface MaxPainResult {
  maxPainStrike: number;
  currentPrice: number;
  distanceToMaxPain: number;
  distancePercent: number;
  magnetZone: boolean;
  direction: 'above' | 'below' | 'at';
  strikeLosses: Array<{ strike: number; totalLoss: number; callLoss: number; putLoss: number }>;
}

interface PCRResult {
  pcr: number;
  totalPutOI: number;
  totalCallOI: number;
  totalPutVolume: number;
  totalCallVolume: number;
  sentiment: 'bullish_overcrowding' | 'bearish_overcrowding' | 'neutral';
  alert: string | null;
  color: 'red' | 'green' | 'yellow';
}

interface SweepVerification {
  sweepDetected: boolean;
  sweepType: 'bullish' | 'bearish' | null;
  sweepPrice: number | null;
  volumeSpike: boolean;
  isFakeout: boolean;
  details: string;
  timestamp: number | null;
}

interface WhaleShieldSnapshot {
  symbol: string;
  timestamp: number;
  maxPain: MaxPainResult;
  pcr: PCRResult;
  sweepVerification: SweepVerification;
  overallAlert: string | null;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

interface ScanResult {
  timestamp: number;
  scanned: number;
  alerts: number;
  magnetZoneCount: number;
  highRiskCount: number;
  results: WhaleShieldSnapshot[];
  summary: {
    magnetZone: string[];
    bullishOvercrowding: string[];
    bearishOvercrowding: string[];
  };
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    extreme: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  return (
    <Badge className={`${colors[level] || colors.low} border`}>
      {level.toUpperCase()} RISK
    </Badge>
  );
}

function MaxPainCard({ maxPain }: { maxPain: MaxPainResult }) {
  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Max Pain Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">${maxPain.maxPainStrike.toFixed(2)}</div>
            <div className="text-sm text-slate-200">Max Pain Strike</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <div className="text-2xl font-bold text-white">${maxPain.currentPrice.toFixed(2)}</div>
            <div className="text-sm text-slate-200">Current Price</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-slate-900/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-200">Distance to Max Pain</span>
            <span className={`font-bold ${maxPain.magnetZone ? 'text-yellow-400' : 'text-white'}`}>
              {maxPain.distancePercent.toFixed(2)}%
            </span>
          </div>
          <Progress value={Math.min(100, (1.5 / maxPain.distancePercent) * 100)} className="h-2" />
        </div>

        {maxPain.magnetZone && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-400">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">MAGNET ZONE ACTIVE</span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Price is within 1.5% of Max Pain. Expect gravitational pull toward ${maxPain.maxPainStrike.toFixed(2)}.
            </p>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-200">
          Price is <span className={maxPain.direction === 'above' ? 'text-green-400' : maxPain.direction === 'below' ? 'text-red-400' : 'text-yellow-400'}>
            {maxPain.direction}
          </span> Max Pain
        </div>

        <div className="mt-4 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
          <div className="text-sm font-semibold text-purple-300 mb-2">What This Means:</div>
          <p className="text-xs text-slate-300 mb-2">
            Max Pain is the strike price where option holders (both puts and calls) would lose the most money. Market makers often push prices toward this level by options expiration to minimize their payout.
          </p>
          <div className="text-sm font-semibold text-purple-300 mb-1">What To Do:</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {maxPain.magnetZone ? (
              <>
                <li>• <strong className="text-yellow-400">Avoid directional bets</strong> - price may be pinned near this level</li>
                <li>• Consider selling premium (iron condors, credit spreads) around Max Pain</li>
                <li>• Wait for expiration to pass before taking large positions</li>
              </>
            ) : maxPain.direction === 'above' ? (
              <>
                <li>• <strong className="text-red-400">Bearish bias</strong> - price may drift down toward Max Pain</li>
                <li>• Consider put spreads or reducing long exposure</li>
                <li>• Watch for resistance at current levels</li>
              </>
            ) : (
              <>
                <li>• <strong className="text-green-400">Bullish bias</strong> - price may drift up toward Max Pain</li>
                <li>• Consider call spreads or adding long exposure</li>
                <li>• Watch for support at current levels</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function PCRCard({ pcr }: { pcr: PCRResult }) {
  const pcrColor = pcr.pcr < 0.6 ? 'text-red-400' : pcr.pcr > 1.2 ? 'text-green-400' : 'text-yellow-400';
  
  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-400" />
          PCR Sentiment Gauge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg mb-4">
          <div className={`text-4xl font-bold ${pcrColor}`}>{pcr.pcr.toFixed(2)}</div>
          <div className="text-sm text-slate-200 mt-1">Put/Call Ratio</div>
        </div>

        {pcr.alert && (
          <div className={`p-3 rounded-lg mb-4 ${pcr.color === 'red' ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${pcr.color === 'red' ? 'text-red-400' : 'text-green-400'}`} />
              <span className={`font-semibold ${pcr.color === 'red' ? 'text-red-400' : 'text-green-400'}`}>
                {pcr.alert}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-slate-900/50 rounded">
            <div className="text-slate-200">Put OI</div>
            <div className="font-semibold text-red-400">{(pcr.totalPutOI / 1000).toFixed(1)}K</div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded">
            <div className="text-slate-200">Call OI</div>
            <div className="font-semibold text-green-400">{(pcr.totalCallOI / 1000).toFixed(1)}K</div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded">
            <div className="text-slate-200">Put Volume</div>
            <div className="font-semibold text-red-400">{(pcr.totalPutVolume / 1000).toFixed(1)}K</div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded">
            <div className="text-slate-200">Call Volume</div>
            <div className="font-semibold text-green-400">{(pcr.totalCallVolume / 1000).toFixed(1)}K</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
          <div className="text-sm font-semibold text-blue-300 mb-2">What This Means:</div>
          <p className="text-xs text-slate-300 mb-2">
            Put/Call Ratio (PCR) measures market sentiment. A PCR below 0.6 means too many calls (bullish overcrowding), while above 1.2 means too many puts (bearish overcrowding). Extremes often signal reversals.
          </p>
          <div className="text-sm font-semibold text-blue-300 mb-1">What To Do:</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {pcr.pcr < 0.6 ? (
              <>
                <li>• <strong className="text-red-400">Caution!</strong> Too many traders are bullish</li>
                <li>• Consider taking profits on long positions</li>
                <li>• Market may reverse downward - look for put opportunities</li>
                <li>• Avoid chasing calls at these levels</li>
              </>
            ) : pcr.pcr > 1.2 ? (
              <>
                <li>• <strong className="text-green-400">Opportunity!</strong> Too many traders are bearish</li>
                <li>• Contrarian signal - bounce may be imminent</li>
                <li>• Consider buying calls or selling puts</li>
                <li>• Cover short positions before potential squeeze</li>
              </>
            ) : (
              <>
                <li>• <strong className="text-yellow-400">Neutral zone</strong> - balanced sentiment</li>
                <li>• Follow your technical analysis for direction</li>
                <li>• No extreme crowd positioning detected</li>
                <li>• Normal trading conditions apply</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function SweepCard({ sweep }: { sweep: SweepVerification }) {
  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5 text-orange-400" />
          Liquidity Sweep Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sweep.sweepDetected ? (
          <>
            <div className={`p-4 rounded-lg mb-4 ${sweep.isFakeout ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {sweep.isFakeout ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <Shield className="h-5 w-5 text-green-400" />
                )}
                <span className={`font-bold ${sweep.isFakeout ? 'text-red-400' : 'text-green-400'}`}>
                  {sweep.isFakeout ? 'FAKE-OUT DETECTED' : 'VALID SWEEP'}
                </span>
              </div>
              <p className="text-sm text-slate-300">{sweep.details}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-2 bg-slate-900/50 rounded text-center">
                <div className="text-slate-200">Type</div>
                <div className={`font-semibold ${sweep.sweepType === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                  {sweep.sweepType?.toUpperCase()}
                </div>
              </div>
              <div className="p-2 bg-slate-900/50 rounded text-center">
                <div className="text-slate-200">Price</div>
                <div className="font-semibold text-white">${sweep.sweepPrice?.toFixed(2)}</div>
              </div>
              <div className="p-2 bg-slate-900/50 rounded text-center">
                <div className="text-slate-200">Volume</div>
                <div className={`font-semibold ${sweep.volumeSpike ? 'text-green-400' : 'text-yellow-400'}`}>
                  {sweep.volumeSpike ? 'SPIKE' : 'NORMAL'}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-orange-900/20 border border-orange-500/20">
              <div className="text-sm font-semibold text-orange-300 mb-2">What This Means:</div>
              <p className="text-xs text-slate-300 mb-2">
                A liquidity sweep occurs when price briefly breaks a key level to trigger stop losses, then reverses. 
                {sweep.isFakeout ? ' This sweep lacks volume confirmation - likely a trap!' : ' This sweep has volume confirmation - likely a genuine move.'}
              </p>
              <div className="text-sm font-semibold text-orange-300 mb-1">What To Do:</div>
              <ul className="text-xs text-slate-300 space-y-1">
                {sweep.isFakeout ? (
                  <>
                    <li>• <strong className="text-red-400">Avoid entering</strong> in the sweep direction</li>
                    <li>• Wait for price to return inside the range</li>
                    <li>• Consider fading the move (trade opposite direction)</li>
                    <li>• This is likely institutional manipulation</li>
                  </>
                ) : sweep.sweepType === 'bullish' ? (
                  <>
                    <li>• <strong className="text-green-400">Valid bullish sweep</strong> - look for long entries</li>
                    <li>• Stop losses have been cleared below support</li>
                    <li>• Consider buying with stops below the sweep low</li>
                    <li>• Target the next resistance level above</li>
                  </>
                ) : (
                  <>
                    <li>• <strong className="text-red-400">Valid bearish sweep</strong> - look for short entries</li>
                    <li>• Stop losses have been cleared above resistance</li>
                    <li>• Consider shorting with stops above the sweep high</li>
                    <li>• Target the next support level below</li>
                  </>
                )}
              </ul>
            </div>
          </>
        ) : (
          <div className="p-4 bg-slate-900/50 rounded-lg text-center">
            <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-200">{sweep.details}</p>
            <div className="mt-4 p-3 rounded-lg bg-orange-900/20 border border-orange-500/20 text-left">
              <div className="text-sm font-semibold text-orange-300 mb-2">What This Means:</div>
              <p className="text-xs text-slate-300 mb-2">
                No liquidity sweep has been detected. The market is trading normally within established ranges without triggering major stop-loss clusters.
              </p>
              <div className="text-sm font-semibold text-orange-300 mb-1">What To Do:</div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Trade normally using your regular strategy</li>
                <li>• Watch key support/resistance levels for potential sweeps</li>
                <li>• Be alert for sudden price spikes that could signal a sweep</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SnapshotCard({ snapshot }: { snapshot: WhaleShieldSnapshot }) {
  return (
    <Card className="bg-slate-800/80 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold">
              {snapshot.symbol}
            </div>
            <RiskBadge level={snapshot.riskLevel} />
          </div>
          <div className="text-sm text-slate-200">
            {new Date(snapshot.timestamp).toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
          <div className="p-2 bg-slate-900/50 rounded text-center">
            <div className="text-slate-200 text-xs">Max Pain</div>
            <div className="font-bold text-purple-400">${snapshot.maxPain.maxPainStrike.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded text-center">
            <div className="text-slate-200 text-xs">PCR</div>
            <div className={`font-bold ${snapshot.pcr.pcr < 0.6 ? 'text-red-400' : snapshot.pcr.pcr > 1.2 ? 'text-green-400' : 'text-yellow-400'}`}>
              {snapshot.pcr.pcr.toFixed(2)}
            </div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded text-center">
            <div className="text-slate-200 text-xs">Distance</div>
            <div className={`font-bold ${snapshot.maxPain.magnetZone ? 'text-yellow-400' : 'text-white'}`}>
              {snapshot.maxPain.distancePercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {snapshot.overallAlert && (
          <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {snapshot.overallAlert}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WhaleShield() {
  const [symbol, setSymbol] = useState('SPY');
  const [activeTab, setActiveTab] = useState('analyze');

  const snapshotQuery = useQuery<{ success: boolean; data: WhaleShieldSnapshot }>({
    queryKey: ['/api/whale-shield/snapshot', symbol],
    enabled: false
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/whale-shield/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'META', 'GOOGL', 'AMZN', 'MSFT'] })
      });
      return res.json();
    }
  });

  const handleAnalyze = () => {
    snapshotQuery.refetch();
  };

  const handleScan = () => {
    scanMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Whale Shield</h1>
            <p className="text-slate-200">Detect Institutional Manipulation & Market Maker Magnets</p>
          </div>
          <WalkthroughGuide steps={MODULE_GUIDES['whale-shield']} title="Guide" accentColor="violet" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="analyze" className="data-[state=active]:bg-purple-600">
              <Search className="h-4 w-4 mr-2" />
              Analyze Symbol
            </TabsTrigger>
            <TabsTrigger value="scan" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Market Scan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter symbol (e.g., SPY)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  <Button 
                    onClick={handleAnalyze}
                    disabled={snapshotQuery.isFetching}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {snapshotQuery.isFetching ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">Analyze</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {snapshotQuery.data?.data && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{snapshotQuery.data.data.symbol}</h2>
                    <RiskBadge level={snapshotQuery.data.data.riskLevel} />
                  </div>
                  <div className="text-sm text-slate-200">
                    Updated: {new Date(snapshotQuery.data.data.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {snapshotQuery.data.data.overallAlert && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-bold">WHALE ALERT</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">{snapshotQuery.data.data.overallAlert}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MaxPainCard maxPain={snapshotQuery.data.data.maxPain} />
                  <PCRCard pcr={snapshotQuery.data.data.pcr} />
                  <SweepCard sweep={snapshotQuery.data.data.sweepVerification} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Market-Wide Whale Detection</h3>
                    <p className="text-sm text-slate-200">Scan top symbols for institutional manipulation signals</p>
                  </div>
                  <Button 
                    onClick={handleScan}
                    disabled={scanMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {scanMutation.isPending ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}
                    <span className="ml-2">Run Scan</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {scanMutation.data?.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-white">{scanMutation.data.data.scanned}</div>
                      <div className="text-xs text-slate-200">Symbols Scanned</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">{scanMutation.data.data.alerts}</div>
                      <div className="text-xs text-slate-200">Active Alerts</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{scanMutation.data.data.magnetZoneCount}</div>
                      <div className="text-xs text-slate-200">In Magnet Zone</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">{scanMutation.data.data.highRiskCount}</div>
                      <div className="text-xs text-slate-200">High Risk</div>
                    </CardContent>
                  </Card>
                </div>

                {scanMutation.data.data.summary && (
                  <div className="grid md:grid-cols-3 gap-3">
                    {scanMutation.data.data.summary.magnetZone.length > 0 && (
                      <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardContent className="p-3">
                          <div className="text-sm font-semibold text-yellow-400 mb-2">Magnet Zone</div>
                          <div className="flex flex-wrap gap-1">
                            {scanMutation.data.data.summary.magnetZone.map((s: string) => (
                              <Badge key={s} className="bg-yellow-500/20 text-yellow-300">{s}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {scanMutation.data.data.summary.bullishOvercrowding.length > 0 && (
                      <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="p-3">
                          <div className="text-sm font-semibold text-red-400 mb-2">Bullish Overcrowding</div>
                          <div className="flex flex-wrap gap-1">
                            {scanMutation.data.data.summary.bullishOvercrowding.map((s: string) => (
                              <Badge key={s} className="bg-red-500/20 text-red-300">{s}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {scanMutation.data.data.summary.bearishOvercrowding.length > 0 && (
                      <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-3">
                          <div className="text-sm font-semibold text-green-400 mb-2">Bearish Overcrowding</div>
                          <div className="flex flex-wrap gap-1">
                            {scanMutation.data.data.summary.bearishOvercrowding.map((s: string) => (
                              <Badge key={s} className="bg-green-500/20 text-green-300">{s}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanMutation.data.data.results.map((snapshot: WhaleShieldSnapshot) => (
                    <SnapshotCard key={snapshot.symbol} snapshot={snapshot} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
