import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Layers } from 'lucide-react';

export default function MAFibonacciStrategy() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white mb-4">
            Best Trend Strategy
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">Moving Averages + Fibonacci</h1>
          <p className="text-slate-200 text-lg">
            High-probability pullback entries using MA confluence with Fibonacci retracement zones
          </p>
        </div>

        <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-300 flex items-center gap-2">
              <Target className="h-6 w-6" />
              Strategy Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p className="text-lg">
              This strategy combines <span className="text-amber-400 font-semibold">Moving Averages</span> with{' '}
              <span className="text-amber-400 font-semibold">Fibonacci retracement</span> to identify high-probability 
              pullback entries in trending markets.
            </p>
            <p>
              Use a <span className="text-green-400 font-bold">50 EMA</span> (faster) or{' '}
              <span className="text-blue-400 font-bold">100 SMA</span> (slower) to confirm the trend direction, 
              then trade pullbacks into the <span className="text-amber-400 font-bold">50% - 61.8%</span> Fibonacci 
              retracement zone when it aligns with the moving average for strong confluence.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trend Filter (MA)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Use a <span className="text-green-400">50 EMA</span> (faster) or <span className="text-blue-400">100 SMA</span> (slower) to confirm the trend direction.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-400 text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Fibonacci Retracement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Draw from swing low to high (uptrend) or high to low (downtrend) of a significant move.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Confluence Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Look for <span className="text-amber-400">50% - 61.8%</span> Fibonacci level to align with the 50 EMA or 100 SMA.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Step-by-Step Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                  <span className="text-white font-semibold">Identify Trend</span>
                </div>
                <p className="text-slate-200 text-sm">
                  Price must be <span className="text-green-400">above</span> the 50/100 MA for uptrends and{' '}
                  <span className="text-red-400">below</span> for downtrends.
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                  <span className="text-white font-semibold">Draw Fibonacci</span>
                </div>
                <p className="text-slate-200 text-sm">
                  After a clear impulse move, connect the swing low to swing high (uptrend) or swing high to swing low (downtrend).
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                  <span className="text-white font-semibold">Wait for Pullback</span>
                </div>
                <p className="text-slate-200 text-sm">
                  Wait for price to retrace into the <span className="text-amber-400">50% - 61.8%</span> zone (the "Golden Zone").
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
                  <span className="text-white font-semibold">Enter Trade</span>
                </div>
                <p className="text-slate-200 text-sm">
                  Enter when a candle closes with momentum in trend direction within the confluence zone.
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">5</span>
                  <span className="text-white font-semibold">Stop-Loss</span>
                </div>
                <p className="text-slate-200 text-sm">
                  Place stop-loss below the <span className="text-red-400">78.6%</span> Fibonacci level or below the previous swing structure.
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">6</span>
                  <span className="text-white font-semibold">Take-Profit</span>
                </div>
                <p className="text-slate-200 text-sm">
                  Target the previous swing high/low (0% level) for first target, and <span className="text-green-400">127.2%</span> or{' '}
                  <span className="text-green-400">161.8%</span> extension for final target.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <ArrowUp className="h-5 w-5" />
                Bullish Setup Example
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-2">
              <p><span className="text-green-400">✓</span> Price is above 50 EMA (uptrend confirmed)</p>
              <p><span className="text-green-400">✓</span> Strong impulse move creates new swing high</p>
              <p><span className="text-green-400">✓</span> Price pulls back to 50-61.8% Fib zone</p>
              <p><span className="text-green-400">✓</span> Fib zone aligns with 50 EMA (confluence)</p>
              <p><span className="text-green-400">✓</span> Bullish engulfing candle at zone = ENTRY</p>
              <p><span className="text-green-400">✓</span> Stop below 78.6% Fib, target swing high</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <ArrowDown className="h-5 w-5" />
                Bearish Setup Example
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-2">
              <p><span className="text-red-400">✓</span> Price is below 50 EMA (downtrend confirmed)</p>
              <p><span className="text-red-400">✓</span> Strong impulse move creates new swing low</p>
              <p><span className="text-red-400">✓</span> Price retraces to 50-61.8% Fib zone</p>
              <p><span className="text-red-400">✓</span> Fib zone aligns with 50 EMA (confluence)</p>
              <p><span className="text-red-400">✓</span> Bearish engulfing candle at zone = ENTRY</p>
              <p><span className="text-red-400">✓</span> Stop above 78.6% Fib, target swing low</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Pro Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <p className="text-red-400 font-semibold mb-2">Avoid Choppy Markets</p>
                <p className="text-sm">Do NOT use this strategy in sideways, consolidating markets. Wait for clear trend.</p>
              </div>
              <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-400 font-semibold mb-2">Best Timeframes</p>
                <p className="text-sm">More effective on higher timeframes: <span className="text-white">1-hour, 4-hour, or Daily</span> charts.</p>
              </div>
              <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-purple-400 font-semibold mb-2">Alternative: FMA Strategy</p>
                <p className="text-sm">Use <span className="text-white">5, 8, and 13 EMAs</span> to identify trend strength and entry points.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-600">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-slate-200 mb-2">Key Fibonacci Levels to Watch</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Badge className="bg-slate-700 text-slate-300 text-lg py-2 px-4">38.2%</Badge>
                <Badge className="bg-amber-600 text-white text-lg py-2 px-4">50.0% ⭐</Badge>
                <Badge className="bg-amber-600 text-white text-lg py-2 px-4">61.8% ⭐</Badge>
                <Badge className="bg-red-600 text-white text-lg py-2 px-4">78.6%</Badge>
                <Badge className="bg-green-600 text-white text-lg py-2 px-4">127.2%</Badge>
                <Badge className="bg-green-600 text-white text-lg py-2 px-4">161.8%</Badge>
              </div>
              <p className="text-amber-400 mt-3 text-sm">The 50% - 61.8% zone is called the "Golden Zone" - highest probability reversal area</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
