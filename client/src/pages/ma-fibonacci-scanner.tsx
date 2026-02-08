import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, RefreshCw, Target, AlertTriangle,
  ArrowUp, ArrowDown, DollarSign, BarChart3, Layers
} from 'lucide-react';

interface MAFibSetup {
  symbol: string;
  type: 'BULLISH' | 'BEARISH';
  currentPrice: number;
  ema50: number;
  sma100: number;
  trendDirection: 'UP' | 'DOWN';
  swingHigh: number;
  swingLow: number;
  fib50: number;
  fib618: number;
  fib786: number;
  inGoldenZone: boolean;
  maAlignment: boolean;
  confluenceScore: number;
  entryZone: { low: number; high: number };
  stopLoss: number;
  target1: number;
  target2: number;
  priceChangePercent: number;
  volumeRatio: number;
}

interface ScanResult {
  bullishSetups: MAFibSetup[];
  bearishSetups: MAFibSetup[];
  timestamp: string;
  totalScanned: number;
}

function SetupCard({ setup }: { setup: MAFibSetup }) {
  const isBullish = setup.type === 'BULLISH';
  
  return (
    <Card className={`${isBullish 
      ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-500/40' 
      : 'bg-gradient-to-br from-red-900/40 to-rose-900/20 border-red-500/40'
    } hover:scale-[1.02] transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isBullish ? (
              <TrendingUp className="h-6 w-6 text-green-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-400" />
            )}
            <span className="text-xl font-bold text-white">{setup.symbol}</span>
            <Badge className={`${isBullish ? 'bg-green-600' : 'bg-red-600'} text-white`}>
              {setup.type}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">${setup.currentPrice.toFixed(2)}</div>
            <div className={`text-sm ${setup.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {setup.priceChangePercent >= 0 ? '+' : ''}{setup.priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-slate-800/50 rounded text-center">
            <div className="text-xs text-slate-200">Confluence</div>
            <div className={`text-lg font-bold ${setup.confluenceScore >= 70 ? 'text-green-400' : setup.confluenceScore >= 50 ? 'text-amber-400' : 'text-slate-200'}`}>
              {setup.confluenceScore}%
            </div>
          </div>
          <div className="p-2 bg-slate-800/50 rounded text-center">
            <div className="text-xs text-slate-200">50 EMA</div>
            <div className="text-lg font-bold text-cyan-400">${setup.ema50.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-200">Entry Zone:</span>
            <span className="text-amber-400 font-semibold">
              ${setup.entryZone.low.toFixed(2)} - ${setup.entryZone.high.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-200">Stop Loss:</span>
            <span className="text-red-400 font-semibold">${setup.stopLoss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-200">Target 1:</span>
            <span className="text-green-400 font-semibold">${setup.target1.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-200">Target 2:</span>
            <span className="text-green-400 font-semibold">${setup.target2.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {setup.inGoldenZone && (
            <Badge className="bg-amber-600 text-white text-xs">In Golden Zone</Badge>
          )}
          {setup.maAlignment && (
            <Badge className="bg-purple-600 text-white text-xs">MA Confluence</Badge>
          )}
          {setup.volumeRatio > 1.2 && (
            <Badge className="bg-blue-600 text-white text-xs">High Volume</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MAFibonacciScanner() {
  const [activeTab, setActiveTab] = useState('bullish');

  const { data, isLoading, refetch, error } = useQuery<{ success: boolean; data: ScanResult }>({
    queryKey: ['/api/ma-fibonacci/scan'],
    refetchInterval: 300000
  });

  const scanResult = data?.data;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Layers className="h-8 w-8 text-amber-400" />
              <h1 className="text-3xl font-bold text-white">MA + Fibonacci Scanner</h1>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                Best Trend Strategy
              </Badge>
            </div>
            <p className="text-slate-200">
              Scanning for high-probability pullback entries using 50 EMA + Fibonacci 50%-61.8% confluence
            </p>
          </div>
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Scanning...' : 'Refresh Scan'}
          </Button>
        </div>

        {scanResult && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{scanResult.totalScanned}</div>
                <div className="text-xs text-slate-200">Assets Scanned</div>
              </CardContent>
            </Card>
            <Card className="bg-green-900/30 border-green-500/30">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{scanResult.bullishSetups.length}</div>
                <div className="text-xs text-slate-200">Bullish Setups</div>
              </CardContent>
            </Card>
            <Card className="bg-red-900/30 border-red-500/30">
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">{scanResult.bearishSetups.length}</div>
                <div className="text-xs text-slate-200">Bearish Setups</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-400">
                  {scanResult.bullishSetups.length + scanResult.bearishSetups.length}
                </div>
                <div className="text-xs text-slate-200">Total Setups</div>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-amber-400 mx-auto animate-spin mb-4" />
            <p className="text-slate-200">Scanning markets for MA + Fibonacci setups...</p>
            <p className="text-slate-300 text-sm mt-2">Analyzing price action, EMAs, and Fibonacci retracements</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">Failed to scan markets</p>
            <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
          </div>
        )}

        {scanResult && !isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger 
                value="bullish" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Bullish ({scanResult.bullishSetups.length})
              </TabsTrigger>
              <TabsTrigger 
                value="bearish"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Bearish ({scanResult.bearishSetups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bullish" className="mt-4">
              {scanResult.bullishSetups.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-200">No bullish setups found matching the criteria</p>
                    <p className="text-slate-300 text-sm mt-2">
                      Looking for price above 50 EMA pulling back to the 50%-61.8% Fibonacci zone
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanResult.bullishSetups.map((setup, idx) => (
                    <SetupCard key={`${setup.symbol}-${idx}`} setup={setup} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bearish" className="mt-4">
              {scanResult.bearishSetups.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <TrendingDown className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-200">No bearish setups found matching the criteria</p>
                    <p className="text-slate-300 text-sm mt-2">
                      Looking for price below 50 EMA retracing to the 50%-61.8% Fibonacci zone
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanResult.bearishSetups.map((setup, idx) => (
                    <SetupCard key={`${setup.symbol}-${idx}`} setup={setup} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Strategy Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <ArrowUp className="h-4 w-4" /> Bullish Entry
              </h4>
              <ul className="text-sm space-y-1 text-slate-200">
                <li>• Price above 50 EMA (uptrend)</li>
                <li>• Pullback to 50%-61.8% Fib zone</li>
                <li>• Fib zone aligns with 50 EMA</li>
                <li>• Stop below 78.6% Fib level</li>
              </ul>
            </div>
            <div>
              <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <ArrowDown className="h-4 w-4" /> Bearish Entry
              </h4>
              <ul className="text-sm space-y-1 text-slate-200">
                <li>• Price below 50 EMA (downtrend)</li>
                <li>• Retrace to 50%-61.8% Fib zone</li>
                <li>• Fib zone aligns with 50 EMA</li>
                <li>• Stop above 78.6% Fib level</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
