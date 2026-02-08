import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Shield, Zap, 
  Search, Play, Clock, BarChart3, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle2, Loader2, RefreshCw, Bell, X,
  Timer, StopCircle, Crosshair, AlertCircle, Volume2, VolumeX
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { IntermarketBanner } from '@/components/IntermarketBanner';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';
import { useTTS } from '@/hooks/use-tts';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

interface HighProbabilitySetup {
  symbol: string;
  companyName: string;
  optionType: 'call' | 'put';
  contractSymbol: string;
  currentStockPrice: number;
  strikePrice: number;
  expirationDate: string;
  daysToExpiry: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  impliedVolatility: number;
  bid: number;
  ask: number;
  midpoint: number;
  openInterest: number;
  volume: number;
  bidAskSpreadPercent: number;
  sma20: number;
  sma200: number;
  rsi14: number;
  atr14: number;
  stopLossPrice: number;
  profitTarget25: number;
  profitTarget30: number;
  profitTarget35: number;
  profitTarget40: number;
  stopLoss40: number;
  hasEarningsWithin14Days: boolean;
  passesIVFilter: boolean;
  passesDeltaFilter: boolean;
  passesDTEFilter: boolean;
  passesEarningsFilter: boolean;
  passesTrendFilter: boolean;
  passesRSIFilter: boolean;
  passesATRFilter: boolean;
  passesLiquidityFilter: boolean;
  masterSignal: string;
  isQualified: boolean;
  qualificationScore: number;
  reasoning: string;
  singlesTarget: number;
  doublesTarget: number;
  tradeType: 'single' | 'double';
  exitTimeRule: string;
}

interface Position {
  id: number;
  symbol: string;
  optionType: string;
  strikePrice: string;
  expirationDate: string;
  entryPrice: string;
  entryDate: string;
  entryDelta: string;
  currentPrice: string;
  stopLossPrice: string;
  profitTarget: string;
  quantity: number;
  status: string;
  daysHeld: number;
  timeExitDate: string;
  currentPnl: string;
  currentPnlPercent: string;
}

interface PositionWithAlert {
  position: Position;
  daysUntilTimeExit: number;
  currentPnlPercent: number;
  zoneStatus: 'green' | 'yellow' | 'red';
  alerts: { type: string; message: string }[];
}

interface Alert {
  id: number;
  symbol: string;
  alertType: string;
  message: string;
  isRead: boolean;
  triggeredAt: string;
}

interface TodaysTopPicks {
  timestamp: string;
  dataSource: string;
  topCalls: HighProbabilitySetup[];
  topPuts: HighProbabilitySetup[];
  allQualified: HighProbabilitySetup[];
  criteria: {
    dteRange: string;
    deltaRange: string;
    maxIV: string;
    minOI: number;
    maxSpread: string;
    trendAlignment: string;
    rsiFilter: string;
    atrRule: string;
    profitTarget: string;
    stopLoss: string;
  };
  stats: {
    symbolsScanned: number;
    contractsAnalyzed: number;
    qualifiedSetups: number;
    averageScore: number;
  };
}

interface Under5Setup {
  symbol: string;
  companyName: string;
  currentStockPrice: number;
  optionType: 'call';
  contractSymbol: string;
  strikePrice: number;
  expirationDate: string;
  daysToExpiry: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  impliedVolatility: number;
  bid: number;
  ask: number;
  midpoint: number;
  openInterest: number;
  volume: number;
  bidAskSpreadPercent: number;
  bidAskSpreadDollar: number;
  intrinsicValue: number;
  timeValue: number;
  passesSpreadFilter: boolean;
  passesDeltaFilter: boolean;
  passesOIFilter: boolean;
  passesDeepITMFilter: boolean;
  isQualified: boolean;
  qualificationScore: number;
  reasoning: string;
  profitTarget25: number;
  stopLoss20: number;
}

function ZoneBadge({ zone }: { zone: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-black',
    red: 'bg-red-500 text-white'
  };
  const labels = {
    green: 'Safe Zone',
    yellow: 'Past 7 Days',
    red: 'Exit Now'
  };
  return (
    <Badge className={colors[zone]}>{labels[zone]}</Badge>
  );
}

function QualificationBadge({ setup }: { setup: HighProbabilitySetup }) {
  if (setup.isQualified) {
    return (
      <Badge className="bg-green-600 text-white">
        <CheckCircle2 className="w-3 h-3 mr-1" /> QUALIFIED
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-gray-500 text-white">
      <X className="w-3 h-3 mr-1" /> Not Qualified
    </Badge>
  );
}

function HighProbabilityCard({ 
  setup, 
  onOpenPosition 
}: { 
  setup: HighProbabilitySetup; 
  onOpenPosition: (setup: HighProbabilitySetup) => void;
}) {
  const isCall = setup.optionType === 'call';
  
  return (
    <Card className={`relative overflow-hidden ${setup.isQualified ? 'ring-2 ring-green-500' : 'opacity-75'}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${setup.isQualified ? 'bg-green-500' : 'bg-gray-400'}`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              className={isCall ? 'bg-green-600' : 'bg-red-600'}
            >
              {isCall ? (
                <><ArrowUpRight className="w-3 h-3 mr-1" /> CALL</>
              ) : (
                <><ArrowDownRight className="w-3 h-3 mr-1" /> PUT</>
              )}
            </Badge>
            <span className="text-2xl font-bold">{setup.symbol}</span>
          </div>
          <QualificationBadge setup={setup} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <div className="text-xs text-gray-300">Delta</div>
            <div className={`text-lg font-bold ${setup.delta >= 0.70 && setup.delta <= 0.85 ? 'text-green-600' : 'text-red-600'}`}>
              {setup.delta.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
            <div className="text-xs text-gray-300">DTE</div>
            <div className={`text-lg font-bold ${setup.daysToExpiry >= 10 && setup.daysToExpiry <= 21 ? 'text-green-600' : 'text-yellow-600'}`}>
              {setup.daysToExpiry} days
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            <div className="text-xs text-gray-300">IV</div>
            <div className={`text-lg font-bold ${setup.impliedVolatility < 40 ? 'text-green-600' : 'text-red-600'}`}>
              {setup.impliedVolatility.toFixed(1)}%
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
            <div className="text-xs text-gray-300">Score</div>
            <div className="text-lg font-bold text-emerald-600">
              {setup.qualificationScore}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-300">Stock:</span> ${setup.currentStockPrice.toFixed(2)}
          </div>
          <div>
            <span className="text-gray-300">Strike:</span> ${setup.strikePrice.toFixed(2)}
          </div>
          <div>
            <span className="text-gray-300">Bid/Ask:</span> ${setup.bid.toFixed(2)}/${setup.ask.toFixed(2)}
          </div>
          <div>
            <span className="text-gray-300">Mid:</span> 
            <span className="font-semibold text-green-600"> ${setup.midpoint.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-200 mb-1">Profit Targets (Singles & Doubles)</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-300">25%</div>
              <div className="font-semibold text-green-600">${setup.profitTarget25.toFixed(2)}</div>
            </div>
            <div className="bg-green-100 dark:bg-green-800/30 rounded">
              <div className="text-xs text-gray-300">30%</div>
              <div className="font-bold text-green-600">${setup.profitTarget30.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-300">40%</div>
              <div className="font-semibold text-green-600">${setup.profitTarget40.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-300">Stop Loss (20-day MA)</div>
              <div className="font-semibold text-red-600">${setup.stopLossPrice.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-300">7-Day Exit Rule</div>
              <div className="font-semibold text-amber-600">Close after 7 days</div>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            {setup.passesDeltaFilter ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-red-500" />
            )}
            <span>Delta 0.70-0.85</span>
          </div>
          <div className="flex items-center gap-2">
            {setup.passesDTEFilter ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-red-500" />
            )}
            <span>30-45 DTE Target</span>
          </div>
          <div className="flex items-center gap-2">
            {setup.passesIVFilter ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-red-500" />
            )}
            <span>IV Below 40%</span>
          </div>
          <div className="flex items-center gap-2">
            {setup.passesEarningsFilter ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-red-500" />
            )}
            <span>No Earnings within 14 days</span>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded p-2">
          {setup.reasoning}
        </div>

        {setup.isQualified && (
          <Button 
            onClick={() => onOpenPosition(setup)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            data-testid={`button-open-position-${setup.symbol}`}
          >
            <DollarSign className="w-4 h-4 mr-2" /> Open Position
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PositionCard({ 
  posData, 
  onClose 
}: { 
  posData: PositionWithAlert; 
  onClose: (id: number, reason: string) => void;
}) {
  const { position, daysUntilTimeExit, currentPnlPercent, zoneStatus, alerts } = posData;
  const isCall = position.optionType === 'call';
  
  const borderColor = zoneStatus === 'green' ? 'border-green-500' : 
                      zoneStatus === 'yellow' ? 'border-yellow-500' : 'border-red-500';
  
  return (
    <Card className={`relative overflow-hidden border-2 ${borderColor}`}>
      <div className={`absolute top-0 left-0 right-0 h-2 ${
        zoneStatus === 'green' ? 'bg-green-500' : 
        zoneStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={isCall ? 'bg-green-600' : 'bg-red-600'}>
              {isCall ? 'CALL' : 'PUT'}
            </Badge>
            <span className="text-2xl font-bold">{position.symbol}</span>
          </div>
          <ZoneBadge zone={zoneStatus} />
        </div>
        <CardDescription>
          ${position.strikePrice} | Exp: {position.expirationDate}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-300">Days Until 7-Day Exit</div>
            <div className={`text-2xl font-bold ${daysUntilTimeExit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.max(0, daysUntilTimeExit)}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-300">Current P&L</div>
            <div className={`text-2xl font-bold ${currentPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentPnlPercent >= 0 ? '+' : ''}{currentPnlPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-300">Entry:</span> ${parseFloat(position.entryPrice).toFixed(2)}
          </div>
          <div>
            <span className="text-gray-300">Current:</span> ${parseFloat(position.currentPrice || position.entryPrice).toFixed(2)}
          </div>
          <div>
            <span className="text-gray-300">Entry Delta:</span> {parseFloat(position.entryDelta || '0').toFixed(2)}
          </div>
          <div>
            <span className="text-gray-300">Days Held:</span> {position.daysHeld}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2 text-sm">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Timer className="w-4 h-4" />
            <span>Stop Loss: ${parseFloat(position.stopLossPrice || '0').toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mt-1">
            <Target className="w-4 h-4" />
            <span>Profit Target (30%): ${parseFloat(position.profitTarget || '0').toFixed(2)}</span>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-1">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                {alert.message}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onClose(position.id, 'profit_target')}
            className="text-green-600 border-green-600"
            data-testid={`button-close-profit-${position.id}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Take Profit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onClose(position.id, 'manual')}
            className="text-gray-600"
            data-testid={`button-close-manual-${position.id}`}
          >
            <StopCircle className="w-4 h-4 mr-1" /> Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function generateExpirationDates(): { value: string; label: string; dte: number }[] {
  const dates: { value: string; label: string; dte: number }[] = [];
  const today = new Date();
  
  for (let i = 28; i <= 60; i += 7) {
    const expDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = expDate.getDay();
    if (dayOfWeek !== 5) {
      const daysToFriday = (5 - dayOfWeek + 7) % 7;
      expDate.setDate(expDate.getDate() + daysToFriday);
    }
    const dateStr = expDate.toISOString().split('T')[0];
    const dte = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    dates.push({
      value: dateStr,
      label: `${expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${dte} DTE)`,
      dte
    });
  }
  return dates;
}

function ResultsTable({ setups }: { setups: HighProbabilitySetup[] }) {
  if (setups.length === 0) return null;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            <th className="border p-2 text-left">Ticker</th>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-right">Strike</th>
            <th className="border p-2 text-left">Expiry</th>
            <th className="border p-2 text-right">Delta</th>
            <th className="border p-2 text-right">Entry</th>
            <th className="border p-2 text-right">Target (35%)</th>
            <th className="border p-2 text-right">Stop (40%)</th>
            <th className="border p-2 text-center">Trade Type</th>
            <th className="border p-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {setups.map((setup, idx) => (
            <tr key={idx} className={setup.isQualified ? 'bg-green-50 dark:bg-green-900/20' : ''}>
              <td className="border p-2 font-semibold">{setup.symbol}</td>
              <td className="border p-2">
                <Badge className={setup.optionType === 'call' ? 'bg-green-600' : 'bg-red-600'}>
                  {setup.optionType.toUpperCase()}
                </Badge>
              </td>
              <td className="border p-2 text-right">${setup.strikePrice.toFixed(2)}</td>
              <td className="border p-2">{setup.expirationDate} ({setup.daysToExpiry} DTE)</td>
              <td className="border p-2 text-right">{setup.delta.toFixed(2)}</td>
              <td className="border p-2 text-right">${setup.midpoint.toFixed(2)}</td>
              <td className="border p-2 text-right text-green-600">${setup.profitTarget35?.toFixed(2) || 'N/A'}</td>
              <td className="border p-2 text-right text-red-600">${setup.stopLoss40?.toFixed(2) || 'N/A'}</td>
              <td className="border p-2 text-center">
                <Badge variant={setup.tradeType === 'single' ? 'secondary' : 'default'}>
                  {setup.tradeType === 'single' ? 'Singles (25%)' : 'Doubles (40%)'}
                </Badge>
              </td>
              <td className="border p-2 text-center">
                {setup.isQualified ? (
                  <Badge className="bg-green-600">QUALIFIED</Badge>
                ) : (
                  <Badge variant="secondary">FAILED</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Under5Scanner() {
  const [under5Results, setUnder5Results] = useState<{ qualified: Under5Setup[]; all: Under5Setup[]; stats: any } | null>(null);
  const [under5Symbol, setUnder5Symbol] = useState('');
  
  const scanUnder5Mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/income-machine/under5/scan', 'POST');
      return res.json();
    },
    onSuccess: (data) => {
      setUnder5Results(data);
    }
  });

  const analyzeUnder5Mutation = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await apiRequest(`/api/income-machine/under5/analyze/${symbol}`, 'GET');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.allSetups?.length > 0) {
        setUnder5Results({ qualified: data.allSetups.filter((s: Under5Setup) => s.isQualified), all: data.allSetups, stats: null });
      }
    }
  });

  return (
    <TabsContent value="under5" className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" /> Under $5 High-Delta Scanner
          </CardTitle>
          <CardDescription>
            Scan for 0.80-0.90 Delta deep ITM calls on stocks under $5. Tight spreads (&lt;10%), 45 DTE, OI &gt;500.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <Button 
              onClick={() => scanUnder5Mutation.mutate()}
              disabled={scanUnder5Mutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
              data-testid="button-scan-under5"
            >
              {scanUnder5Mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Scan Under $5 Stocks</>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Symbol (e.g., SNDL)" 
                value={under5Symbol}
                onChange={(e) => setUnder5Symbol(e.target.value.toUpperCase())}
                className="w-32"
                data-testid="input-under5-symbol"
              />
              <Button 
                variant="outline"
                onClick={() => under5Symbol && analyzeUnder5Mutation.mutate(under5Symbol)}
                disabled={!under5Symbol || analyzeUnder5Mutation.isPending}
                data-testid="button-analyze-under5"
              >
                {analyzeUnder5Mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Under $5 Stock Rules</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li><strong>Delta:</strong> 0.80-0.90 (mimics stock movement)</li>
                  <li><strong>Strike:</strong> Deep ITM (2-3 levels below price)</li>
                  <li><strong>DTE:</strong> 45 days target</li>
                </ul>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li><strong>Spread:</strong> Under 10% (or $0.05)</li>
                  <li><strong>Open Interest:</strong> Minimum 500</li>
                  <li><strong>Strategy:</strong> Deep ITM calls mimic stock at lower cost</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {under5Results?.stats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold">{under5Results.stats.scanned}</div>
                <div className="text-xs text-gray-300">Stocks Scanned</div>
              </div>
              <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{under5Results.stats.qualified}</div>
                <div className="text-xs text-gray-300">Qualified Setups</div>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{(under5Results.stats.avgDelta * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-300">Avg Delta</div>
              </div>
              <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{under5Results.stats.avgSpread?.toFixed(1)}%</div>
                <div className="text-xs text-gray-300">Avg Spread</div>
              </div>
            </div>
          )}

          {under5Results?.qualified && under5Results.qualified.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-purple-100 dark:bg-purple-900/30">
                  <tr>
                    <th className="border p-2 text-left">Symbol</th>
                    <th className="border p-2 text-right">Stock Price</th>
                    <th className="border p-2 text-right">Strike</th>
                    <th className="border p-2">Expiration</th>
                    <th className="border p-2 text-right">Delta</th>
                    <th className="border p-2 text-right">Premium</th>
                    <th className="border p-2 text-right">Spread %</th>
                    <th className="border p-2 text-right">OI</th>
                    <th className="border p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {under5Results.qualified.map((setup, idx) => (
                    <tr key={idx} className="hover:bg-purple-50 dark:hover:bg-purple-900/10">
                      <td className="border p-2 font-medium">{setup.symbol}</td>
                      <td className="border p-2 text-right">${setup.currentStockPrice.toFixed(2)}</td>
                      <td className="border p-2 text-right">${setup.strikePrice.toFixed(2)}</td>
                      <td className="border p-2">{setup.expirationDate} ({setup.daysToExpiry} DTE)</td>
                      <td className="border p-2 text-right font-semibold text-blue-600">{(setup.delta * 100).toFixed(0)}%</td>
                      <td className="border p-2 text-right">${setup.midpoint.toFixed(2)}</td>
                      <td className="border p-2 text-right">
                        <Badge variant={setup.bidAskSpreadPercent <= 10 ? 'default' : 'destructive'}>
                          {setup.bidAskSpreadPercent.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="border p-2 text-right">{setup.openInterest}</td>
                      <td className="border p-2 text-center">
                        <Badge className="bg-green-600">QUALIFIED</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!under5Results && !scanUnder5Mutation.isPending && (
            <Card className="p-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Scan Under $5 Stocks</h3>
              <p className="text-gray-600 dark:text-gray-200 max-w-lg mx-auto">
                Find high-delta deep ITM calls on stocks under $5. These options mimic stock movement with less capital - 
                a $0.80 Delta means $1 stock move = $0.80 option gain.
              </p>
            </Card>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function SinglesDoublesRules() {
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-600" />
          Singles & Doubles Rulebook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-700 dark:text-amber-400">The "Single" (25% Profit)</h4>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>Use in high IV environments or volatile markets</li>
              <li>Set Limit Order immediately after entry for 1.25x cost</li>
              <li>If 50% of DTE passed without 10% profit, exit</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700 dark:text-blue-400">The "Double" (40% Profit)</h4>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>Use in trending markets with low volatility</li>
              <li>Set Trailing Stop once you hit 20% profit</li>
              <li>If target hit in &lt;48 hours, take it and run</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IncomeMachine() {
  const [activeTab, setActiveTab] = useState('algorithm');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedExpiration, setSelectedExpiration] = useState('');
  const expirationDates = generateExpirationDates();

  const { data: scannerStatus } = useQuery<{ isScanning: boolean; apiConfigured: boolean }>({
    queryKey: ['/api/income-machine/70-delta/status'],
    refetchInterval: 5000
  });

  const { data: positions, refetch: refetchPositions } = useQuery<Position[]>({
    queryKey: ['/api/income-machine/positions'],
    refetchInterval: 30000
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['/api/income-machine/alerts'],
    refetchInterval: 10000
  });

  const { data: todaysTopPicks, isLoading: loadingTopPicks, refetch: refetchTopPicks } = useQuery<TodaysTopPicks>({
    queryKey: ['/api/income-machine/todays-picks'],
    staleTime: 300000,
    refetchOnWindowFocus: false
  });

  const { data: symbolAnalysis, isLoading: analyzingSymbol } = useQuery<{
    symbol: string;
    totalSetups: number;
    qualifiedSetups: number;
    bestCall: HighProbabilitySetup | null;
    bestPut: HighProbabilitySetup | null;
    allSetups: HighProbabilitySetup[];
  }>({
    queryKey: ['/api/income-machine/70-delta/analyze', searchSymbol, selectedExpiration],
    queryFn: async () => {
      const url = selectedExpiration && selectedExpiration !== 'auto'
        ? `/api/income-machine/70-delta/analyze/${searchSymbol}?expirationDate=${selectedExpiration}`
        : `/api/income-machine/70-delta/analyze/${searchSymbol}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to analyze');
      return res.json();
    },
    enabled: searchSymbol.length >= 1
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/income-machine/70-delta/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/income-machine/scan-results'], data);
    }
  });

  const openPositionMutation = useMutation({
    mutationFn: async (setup: HighProbabilitySetup) => {
      const response = await fetch('/api/income-machine/positions/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup, quantity: 1 })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-machine/positions'] });
    }
  });

  const closePositionMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const response = await fetch(`/api/income-machine/positions/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-machine/positions'] });
    }
  });

  const updatePositionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/income-machine/positions/update', {
        method: 'POST'
      });
      return response.json();
    }
  });

  const scanResults = scanMutation.data;
  const qualifiedSetups = scanResults?.qualified || [];
  const allSetups = scanResults?.all || [];
  const unreadAlerts = alerts?.filter(a => !a.isRead) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <IntermarketBanner />
        <div className="text-center space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Income Machine - 70 Delta Scanner
            </h1>
            <WalkthroughGuide steps={MODULE_GUIDES['income-machine']} title="Guide" accentColor="emerald" />
          </div>
          <p className="text-gray-600 dark:text-gray-200 max-w-3xl mx-auto text-xs sm:text-sm">
            High-probability options scanner with 70% win rate framework. Trend alignment (200 SMA), RSI filter (30-70), 
            2-ATR rule, liquidity checks (OI &gt; 500), and 30-45 DTE targeting.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <div className="text-sm opacity-80">Delta Target</div>
                  <div className="text-2xl font-bold">0.70-0.85</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8" />
                <div>
                  <div className="text-sm opacity-80">DTE Target</div>
                  <div className="text-2xl font-bold">30-45 Days</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Timer className="w-8 h-8" />
                <div>
                  <div className="text-sm opacity-80">Exit Rule</div>
                  <div className="text-2xl font-bold">7 Days</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8" />
                <div>
                  <div className="text-sm opacity-80">Profit Target</div>
                  <div className="text-2xl font-bold">25-40%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8" />
                <div>
                  <div className="text-sm opacity-80">Alerts</div>
                  <div className="text-2xl font-bold">{unreadAlerts.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="algorithm" data-testid="tab-algorithm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" /> Algorithm
            </TabsTrigger>
            <TabsTrigger value="scanner" data-testid="tab-scanner">
              <Crosshair className="w-4 h-4 mr-2" /> 70-Delta
            </TabsTrigger>
            <TabsTrigger value="under5" data-testid="tab-under5">
              <DollarSign className="w-4 h-4 mr-2" /> Under $5
            </TabsTrigger>
            <TabsTrigger value="positions" data-testid="tab-positions">
              <BarChart3 className="w-4 h-4 mr-2" /> Positions ({positions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">
              <Bell className="w-4 h-4 mr-2" /> Alerts ({unreadAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="analyze" data-testid="tab-analyze">
              <Search className="w-4 h-4 mr-2" /> Analyze
            </TabsTrigger>
          </TabsList>

          <TabsContent value="algorithm" className="mt-6 space-y-6" data-testid="algorithm-content">
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Zap className="w-6 h-6 text-purple-500" />
                      Options Algorithm - Today's Top Opportunities
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Automatically analyzes top 20 stocks and pulls the best options setups with exact trade criteria
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => refetchTopPicks()}
                    disabled={loadingTopPicks}
                    variant="outline"
                    className="border-purple-500"
                    data-testid="button-refresh-algorithm"
                  >
                    {loadingTopPicks ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                    ) : (
                      <><RefreshCw className="w-4 h-4 mr-2" /> Refresh</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTopPicks ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                    <div className="text-lg font-medium">Scanning 20 symbols for today's top picks...</div>
                    <div className="text-sm text-gray-300 mt-2">Applying 9 strict filters to find qualified setups</div>
                  </div>
                ) : todaysTopPicks ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm">
                      <Badge className="bg-purple-600 text-white">{todaysTopPicks.dataSource}</Badge>
                      <span className="text-gray-300">Last Updated: {new Date(todaysTopPicks.timestamp).toLocaleString()}</span>
                    </div>

                    <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-amber-500" /> Exact Trade Criteria
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div className="bg-blue-900/30 p-2 rounded">
                            <div className="text-xs text-gray-200">DTE Range</div>
                            <div className="font-medium text-blue-300">{todaysTopPicks.criteria.dteRange}</div>
                          </div>
                          <div className="bg-green-900/30 p-2 rounded">
                            <div className="text-xs text-gray-200">Delta Range</div>
                            <div className="font-medium text-green-300">{todaysTopPicks.criteria.deltaRange}</div>
                          </div>
                          <div className="bg-purple-900/30 p-2 rounded">
                            <div className="text-xs text-gray-200">Max IV</div>
                            <div className="font-medium text-purple-300">{todaysTopPicks.criteria.maxIV}</div>
                          </div>
                          <div className="bg-amber-900/30 p-2 rounded">
                            <div className="text-xs text-gray-200">Profit Target</div>
                            <div className="font-medium text-amber-300">{todaysTopPicks.criteria.profitTarget}</div>
                          </div>
                          <div className="bg-red-900/30 p-2 rounded">
                            <div className="text-xs text-gray-200">Stop Loss</div>
                            <div className="font-medium text-red-300">{todaysTopPicks.criteria.stopLoss}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                          <div className="bg-slate-800/50 p-2 rounded">
                            <div className="text-xs text-gray-200">Trend</div>
                            <div className="font-medium text-gray-300">{todaysTopPicks.criteria.trendAlignment}</div>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded">
                            <div className="text-xs text-gray-200">RSI Filter</div>
                            <div className="font-medium text-gray-300">{todaysTopPicks.criteria.rsiFilter}</div>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded">
                            <div className="text-xs text-gray-200">ATR Rule</div>
                            <div className="font-medium text-gray-300">{todaysTopPicks.criteria.atrRule}</div>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded">
                            <div className="text-xs text-gray-200">Min Open Interest</div>
                            <div className="font-medium text-gray-300">{todaysTopPicks.criteria.minOI}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <Card className="bg-blue-900/20 border-blue-500/30">
                        <CardContent className="p-4">
                          <div className="text-3xl font-bold text-blue-400">{todaysTopPicks.stats.symbolsScanned}</div>
                          <div className="text-xs text-gray-200">Symbols Scanned</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-900/20 border-purple-500/30">
                        <CardContent className="p-4">
                          <div className="text-3xl font-bold text-purple-400">{todaysTopPicks.stats.contractsAnalyzed}</div>
                          <div className="text-xs text-gray-200">Contracts Analyzed</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-900/20 border-green-500/30">
                        <CardContent className="p-4">
                          <div className="text-3xl font-bold text-green-400">{todaysTopPicks.stats.qualifiedSetups}</div>
                          <div className="text-xs text-gray-200">Qualified Setups</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-amber-900/20 border-amber-500/30">
                        <CardContent className="p-4">
                          <div className="text-3xl font-bold text-amber-400">{todaysTopPicks.stats.averageScore}</div>
                          <div className="text-xs text-gray-200">Avg Score</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="border-green-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-green-500">
                            <ArrowUpRight className="w-5 h-5" /> Top CALL Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {todaysTopPicks.topCalls.length > 0 ? (
                            todaysTopPicks.topCalls.map((setup, idx) => (
                              <div key={idx} className="bg-green-900/10 border border-green-500/20 rounded-lg p-4" data-testid={`algorithm-call-${idx}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-green-400">{setup.symbol}</span>
                                    <Badge className="bg-green-600">CALL</Badge>
                                    <Badge variant="outline" className="border-green-500 text-green-400">Score: {setup.qualificationScore}</Badge>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => openPositionMutation.mutate(setup)}
                                    data-testid={`button-open-call-${setup.symbol}`}
                                  >
                                    Open Position
                                  </Button>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                  <div><span className="text-gray-200">Strike:</span> ${setup.strikePrice}</div>
                                  <div><span className="text-gray-200">Entry:</span> <span className="text-green-400 font-medium">${setup.midpoint.toFixed(2)}</span></div>
                                  <div><span className="text-gray-200">Target:</span> <span className="text-emerald-400">${setup.profitTarget35.toFixed(2)}</span></div>
                                  <div><span className="text-gray-200">Stop:</span> <span className="text-red-400">${setup.stopLoss40.toFixed(2)}</span></div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-sm mt-2">
                                  <div><span className="text-gray-200">Delta:</span> {setup.delta.toFixed(2)}</div>
                                  <div><span className="text-gray-200">DTE:</span> {setup.daysToExpiry}</div>
                                  <div><span className="text-gray-200">IV:</span> {setup.impliedVolatility.toFixed(1)}%</div>
                                  <div><span className="text-gray-200">RSI:</span> {setup.rsi14.toFixed(0)}</div>
                                </div>
                                <div className="text-xs text-gray-200 mt-2">Exp: {setup.expirationDate}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-300">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              No qualified CALL setups found. Market conditions may not favor calls today.
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-red-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-red-500">
                            <ArrowDownRight className="w-5 h-5" /> Top PUT Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {todaysTopPicks.topPuts.length > 0 ? (
                            todaysTopPicks.topPuts.map((setup, idx) => (
                              <div key={idx} className="bg-red-900/10 border border-red-500/20 rounded-lg p-4" data-testid={`algorithm-put-${idx}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-red-400">{setup.symbol}</span>
                                    <Badge className="bg-red-600">PUT</Badge>
                                    <Badge variant="outline" className="border-red-500 text-red-400">Score: {setup.qualificationScore}</Badge>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => openPositionMutation.mutate(setup)}
                                    data-testid={`button-open-put-${setup.symbol}`}
                                  >
                                    Open Position
                                  </Button>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                  <div><span className="text-gray-200">Strike:</span> ${setup.strikePrice}</div>
                                  <div><span className="text-gray-200">Entry:</span> <span className="text-red-400 font-medium">${setup.midpoint.toFixed(2)}</span></div>
                                  <div><span className="text-gray-200">Target:</span> <span className="text-emerald-400">${setup.profitTarget35.toFixed(2)}</span></div>
                                  <div><span className="text-gray-200">Stop:</span> <span className="text-red-400">${setup.stopLoss40.toFixed(2)}</span></div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-sm mt-2">
                                  <div><span className="text-gray-200">Delta:</span> {setup.delta.toFixed(2)}</div>
                                  <div><span className="text-gray-200">DTE:</span> {setup.daysToExpiry}</div>
                                  <div><span className="text-gray-200">IV:</span> {setup.impliedVolatility.toFixed(1)}%</div>
                                  <div><span className="text-gray-200">RSI:</span> {setup.rsi14.toFixed(0)}</div>
                                </div>
                                <div className="text-xs text-gray-200 mt-2">Exp: {setup.expirationDate}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-300">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              No qualified PUT setups found. Market conditions may not favor puts today.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {todaysTopPicks.allQualified.length > 0 && (
                      <Card className="border-purple-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-purple-500" /> All Qualified Setups ({todaysTopPicks.allQualified.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-800/50">
                                <tr>
                                  <th className="p-2 text-left">Symbol</th>
                                  <th className="p-2 text-left">Type</th>
                                  <th className="p-2 text-right">Strike</th>
                                  <th className="p-2 text-right">Entry</th>
                                  <th className="p-2 text-right">Target (35%)</th>
                                  <th className="p-2 text-right">Stop (40%)</th>
                                  <th className="p-2 text-right">Delta</th>
                                  <th className="p-2 text-right">DTE</th>
                                  <th className="p-2 text-right">Score</th>
                                  <th className="p-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {todaysTopPicks.allQualified.map((setup, idx) => (
                                  <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800/30">
                                    <td className="p-2 font-medium">{setup.symbol}</td>
                                    <td className="p-2">
                                      <Badge className={setup.optionType === 'call' ? 'bg-green-600' : 'bg-red-600'}>
                                        {setup.optionType.toUpperCase()}
                                      </Badge>
                                    </td>
                                    <td className="p-2 text-right">${setup.strikePrice}</td>
                                    <td className="p-2 text-right font-medium">${setup.midpoint.toFixed(2)}</td>
                                    <td className="p-2 text-right text-green-400">${setup.profitTarget35.toFixed(2)}</td>
                                    <td className="p-2 text-right text-red-400">${setup.stopLoss40.toFixed(2)}</td>
                                    <td className="p-2 text-right">{setup.delta.toFixed(2)}</td>
                                    <td className="p-2 text-right">{setup.daysToExpiry}</td>
                                    <td className="p-2 text-right">{setup.qualificationScore}</td>
                                    <td className="p-2 text-center">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => openPositionMutation.mutate(setup)}
                                      >
                                        Trade
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-300">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No data available. Click Refresh to scan for opportunities.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crosshair className="w-5 h-5" /> High-Probability Options Scanner
                </CardTitle>
                <CardDescription>
                  Scans for 70-85 Delta options with ~14 DTE, IV &lt;40%, and no upcoming earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <Button 
                    onClick={() => scanMutation.mutate()}
                    disabled={scanMutation.isPending || scannerStatus?.isScanning}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                    data-testid="button-start-70delta-scan"
                  >
                    {scanMutation.isPending || scannerStatus?.isScanning ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> Run 70-Delta Scan</>
                    )}
                  </Button>
                  
                  {!scannerStatus?.apiConfigured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Using estimated data (Polygon API not configured)
                    </Badge>
                  )}
                </div>

                {scanMutation.isPending && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <div>
                        <div className="font-medium">Scanning for 70-Delta setups...</div>
                        <div className="text-sm text-gray-600 dark:text-gray-200">
                          Filtering for Delta 0.70-0.85, ~14 DTE, IV &lt;40%, no earnings
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {scanResults?.stats && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold">{scanResults.stats.scanned}</div>
                      <div className="text-xs text-gray-300">Stocks Scanned</div>
                    </div>
                    <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{scanResults.stats.qualified}</div>
                      <div className="text-xs text-gray-300">Qualified Setups</div>
                    </div>
                    <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{scanResults.stats.avgDelta?.toFixed(2) || '--'}</div>
                      <div className="text-xs text-gray-300">Avg Delta</div>
                    </div>
                    <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{scanResults.stats.avgIV?.toFixed(1) || '--'}%</div>
                      <div className="text-xs text-gray-300">Avg IV</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {qualifiedSetups.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" /> Qualified 70-Delta Setups
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qualifiedSetups.map((setup: HighProbabilitySetup, idx: number) => (
                    <HighProbabilityCard 
                      key={`${setup.symbol}-${setup.optionType}-${idx}`} 
                      setup={setup}
                      onOpenPosition={(s) => openPositionMutation.mutate(s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {allSetups.length > 0 && qualifiedSetups.length === 0 && (
              <Card className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Qualified Setups Found</h3>
                <p className="text-gray-600 dark:text-gray-200">
                  {allSetups.length} setups found but none passed all filters (Delta 0.70-0.85, DTE ~14, IV &lt;40%, no earnings).
                </p>
              </Card>
            )}

            {!scanResults && !scanMutation.isPending && (
              <Card className="p-12 text-center">
                <Crosshair className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Run a 70-Delta Scan</h3>
                <p className="text-gray-600 dark:text-gray-200 mb-6 max-w-lg mx-auto">
                  Scan for high-probability options with 70%+ chance of expiring in-the-money. 
                  Target "singles and doubles" with 25-40% profit targets.
                </p>
                <Button 
                  onClick={() => scanMutation.mutate()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                  data-testid="button-start-scan-empty"
                >
                  <Play className="w-4 h-4 mr-2" /> Start Scanning
                </Button>
              </Card>
            )}
          </TabsContent>

          <Under5Scanner />

          <TabsContent value="positions" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Open Positions</h2>
              <Button 
                variant="outline" 
                onClick={() => updatePositionsMutation.mutate()}
                disabled={updatePositionsMutation.isPending}
                data-testid="button-refresh-positions"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${updatePositionsMutation.isPending ? 'animate-spin' : ''}`} />
                Update Positions
              </Button>
            </div>

            {updatePositionsMutation.data && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {updatePositionsMutation.data.map((posData: PositionWithAlert) => (
                  <PositionCard 
                    key={posData.position.id}
                    posData={posData}
                    onClose={(id, reason) => closePositionMutation.mutate({ id, reason })}
                  />
                ))}
              </div>
            )}

            {(!updatePositionsMutation.data || updatePositionsMutation.data.length === 0) && (
              <Card className="p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Open positions from qualified 70-Delta setups to start tracking.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Trading Alerts</h2>
            
            {unreadAlerts.length > 0 ? (
              <div className="space-y-3">
                {unreadAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Bell className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <div className="font-semibold">{alert.symbol}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-200">{alert.message}</div>
                            <div className="text-xs text-gray-300 mt-1">
                              {new Date(alert.triggeredAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{alert.alertType.replace('_', ' ')}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Alerts</h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Alerts will appear when positions hit profit targets, time exits, or stop losses.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" /> Analyze Single Symbol
                </CardTitle>
                <CardDescription>
                  Search for 70-Delta setups on any stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Input
                    placeholder="Enter symbol (e.g. AAPL)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                    className="max-w-xs"
                    data-testid="input-analyze-symbol"
                  />
                  <Select value={selectedExpiration} onValueChange={setSelectedExpiration}>
                    <SelectTrigger className="w-48" data-testid="select-expiration">
                      <SelectValue placeholder="Select Expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (10-21 DTE)</SelectItem>
                      {expirationDates.map((date) => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {analyzingSymbol && <Loader2 className="w-5 h-5 animate-spin self-center" />}
                </div>
              </CardContent>
            </Card>

            {searchSymbol && <SignalFusionAnalysis symbol={searchSymbol} assetType="stock" compact />}
            
            {symbolAnalysis && searchSymbol && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{symbolAnalysis.symbol} Analysis</h2>
                  <Badge variant="secondary">
                    {symbolAnalysis.qualifiedSetups} of {symbolAnalysis.totalSetups} qualified
                  </Badge>
                </div>

                {symbolAnalysis.allSetups.length > 0 ? (
                  <div className="space-y-6">
                    <SinglesDoublesRules />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Results Table</CardTitle>
                        <CardDescription>All qualified and analyzed setups with entry/exit prices</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResultsTable setups={symbolAnalysis.allSetups} />
                      </CardContent>
                    </Card>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {symbolAnalysis.allSetups.map((setup, idx) => (
                        <HighProbabilityCard 
                          key={`${setup.symbol}-${setup.optionType}-${idx}`}
                          setup={setup}
                          onOpenPosition={(s) => openPositionMutation.mutate(s)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Search className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-semibold">No 70-Delta setups found for {searchSymbol}</h3>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-slate-800 to-gray-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">70-Delta Strategy Rules</h3>
                <div className="grid md:grid-cols-5 gap-4 text-sm text-gray-300">
                  <div>
                    <div className="font-medium text-white mb-1">Delta: 0.70-0.85</div>
                    <p>70%+ probability of expiring ITM; moves almost 1:1 with stock</p>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-1">DTE: 30-45 Days</div>
                    <p>2 weeks for trade to breathe while avoiding theta cliff</p>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-1">Exit: 7 Days</div>
                    <p>Close with 1 week left to avoid fastest theta decay</p>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-1">IV: Below 40%</div>
                    <p>Don't buy expensive options (before earnings, etc.)</p>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-1">Target: 25-40%</div>
                    <p>Consistent singles & doubles, not home runs</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
