import { 
  TrendingUp, TrendingDown, Activity, Brain, BarChart2, 
  CheckCircle, XCircle, Zap, Target, Droplets, Volume2, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface FVGData {
  type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  midpoint: number;
}

export interface LiquiditySweepData {
  status: 'sweep_confirmed' | 'sweep_rejected' | 'liquidity_building';
  gate1Passed: boolean;
  gate2Passed: boolean;
  gate3Passed: boolean;
  swingLow: number;
  volumeMultiplier: number;
  isConsolidating: boolean;
  isWeakSweep: boolean;
  targetFVG: FVGData | null;
  reasons: string[];
}

export interface PredictiveData {
  neuralIndex: 'up' | 'down' | 'neutral';
  neuralConfidence: number;
  completeAgreement: boolean;
  doubleConfirmed: boolean;
  doubleConfirmationScore?: number;
  predictedHigh: number;
  predictedLow: number;
  maCrossover: 'bullish' | 'bearish' | 'none';
  trendStrength: number;
  overallSignal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  liquiditySweep?: LiquiditySweepData;
}

interface PredictiveIndicatorProps {
  data: PredictiveData | null | undefined;
  compact?: boolean;
  showDetails?: boolean;
}

export function PredictiveIndicator({ data, compact = false, showDetails = true }: PredictiveIndicatorProps) {
  if (!data) return null;

  const getNeuralColor = () => {
    if (data.neuralIndex === 'up') return 'text-green-400';
    if (data.neuralIndex === 'down') return 'text-red-400';
    return 'text-slate-400';
  };

  const getNeuralIcon = () => {
    if (data.neuralIndex === 'up') return <TrendingUp className="h-4 w-4" />;
    if (data.neuralIndex === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSignalBadge = () => {
    const colors: Record<string, string> = {
      strong_buy: 'bg-green-600 text-white',
      buy: 'bg-green-500/80 text-white',
      hold: 'bg-slate-500 text-white',
      sell: 'bg-red-500/80 text-white',
      strong_sell: 'bg-red-600 text-white'
    };
    const labels: Record<string, string> = {
      strong_buy: 'STRONG BUY',
      buy: 'BUY',
      hold: 'HOLD',
      sell: 'SELL',
      strong_sell: 'STRONG SELL'
    };
    return (
      <Badge className={colors[data.overallSignal] || 'bg-slate-500'}>
        {labels[data.overallSignal] || data.overallSignal.toUpperCase()}
      </Badge>
    );
  };

  const getMaCrossoverBadge = () => {
    if (data.maCrossover === 'bullish') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">MA Cross ↑</Badge>;
    }
    if (data.maCrossover === 'bearish') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">MA Cross ↓</Badge>;
    }
    return null;
  };

  const getLiquidityBadge = () => {
    if (!data.liquiditySweep) return null;
    
    const { status, gate1Passed, gate2Passed, gate3Passed, isWeakSweep } = data.liquiditySweep;
    
    if (status === 'liquidity_building') {
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse">
          <Clock className="h-3 w-3 mr-1" />
          Liquidity Building
        </Badge>
      );
    }
    
    if (status === 'sweep_confirmed' && gate3Passed) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Droplets className="h-3 w-3 mr-1" />
          Full Sweep ✓
        </Badge>
      );
    }
    
    if (isWeakSweep) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Droplets className="h-3 w-3 mr-1" />
          Weak Sweep
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
        <XCircle className="h-3 w-3 mr-1" />
        {!gate1Passed ? 'No Sweep' : !gate2Passed ? 'Low Volume' : 'No FVG'}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs flex-wrap">
        {data.liquiditySweep && (
          <div className="flex items-center gap-1">
            {getLiquidityBadge()}
          </div>
        )}
        <div className={`flex items-center gap-1 ${getNeuralColor()}`}>
          <Brain className="h-3 w-3" />
          <span>{data.neuralConfidence}%</span>
        </div>
        {data.doubleConfirmed && (
          <CheckCircle className="h-3 w-3 text-green-400" />
        )}
        {getSignalBadge()}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-slate-300">AI Predictive</span>
        </div>
        {getSignalBadge()}
      </div>

      {data.liquiditySweep && (
        <div className={`rounded-lg p-2.5 border ${
          data.liquiditySweep.status === 'sweep_confirmed' 
            ? 'bg-green-900/20 border-green-700/50' 
            : data.liquiditySweep.status === 'liquidity_building'
            ? 'bg-amber-900/20 border-amber-700/50'
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className={`h-4 w-4 ${
                data.liquiditySweep.status === 'sweep_confirmed' ? 'text-green-400' :
                data.liquiditySweep.status === 'liquidity_building' ? 'text-amber-400' : 'text-slate-400'
              }`} />
              <span className="text-sm font-medium text-slate-300">Liquidity Sweep</span>
            </div>
            {getLiquidityBadge()}
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${data.liquiditySweep.gate1Passed ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-slate-400">G1</span>
              <span className={data.liquiditySweep.gate1Passed ? 'text-green-400' : 'text-red-400'}>
                {data.liquiditySweep.gate1Passed ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${data.liquiditySweep.gate2Passed ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-slate-400">G2</span>
              <span className={data.liquiditySweep.gate2Passed ? 'text-green-400' : 'text-red-400'}>
                {data.liquiditySweep.volumeMultiplier.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${data.liquiditySweep.gate3Passed ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-slate-400">G3</span>
              <span className={data.liquiditySweep.gate3Passed ? 'text-green-400' : 'text-red-400'}>
                {data.liquiditySweep.gate3Passed ? 'FVG' : 'NO FVG'}
              </span>
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {data.liquiditySweep.swingLow > 0 && (
              <span className="text-slate-500">
                Swing Low: <span className="text-slate-300">${data.liquiditySweep.swingLow.toFixed(2)}</span>
              </span>
            )}
            {data.liquiditySweep.targetFVG && (
              <span className="text-slate-500">
                Target: <span className="text-cyan-400">${data.liquiditySweep.targetFVG.bottom.toFixed(2)}-${data.liquiditySweep.targetFVG.top.toFixed(2)}</span>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="text-slate-500 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Neural Index
          </div>
          <div className={`flex items-center gap-1 font-medium ${getNeuralColor()}`}>
            {getNeuralIcon()}
            <span className="capitalize">{data.neuralIndex}</span>
            <span className="text-slate-400">({data.neuralConfidence}%)</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-slate-500 flex items-center gap-1">
            <BarChart2 className="h-3 w-3" /> Trend Strength
          </div>
          <div className="flex items-center gap-2">
            <Progress value={data.trendStrength} className="h-1.5 flex-1" />
            <span className="text-slate-300 font-medium">{Math.round(data.trendStrength)}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-slate-500 flex items-center gap-1">
            <Target className="h-3 w-3" /> Predicted Range
          </div>
          <div className="text-slate-300">
            <span className="text-green-400">${data.predictedHigh.toFixed(2)}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-red-400">${data.predictedLow.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-slate-500">Confirmation</div>
          <div className="flex items-center gap-2">
            {data.doubleConfirmed ? (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Double Confirmed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-400">
                <XCircle className="h-3.5 w-3.5" />
                <span>Not Confirmed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-700/50">
          {data.completeAgreement && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              Complete Agreement
            </Badge>
          )}
          {getMaCrossoverBadge()}
          {data.doubleConfirmationScore && data.doubleConfirmationScore >= 70 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              Score: {data.doubleConfirmationScore}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function PredictiveChip({ data }: { data: PredictiveData | null | undefined }) {
  if (!data) return null;

  const getColor = () => {
    if (data.liquiditySweep?.status === 'liquidity_building') return 'bg-amber-500/20 text-amber-400';
    if (data.overallSignal === 'strong_buy' || data.overallSignal === 'buy') return 'bg-green-500/20 text-green-400';
    if (data.overallSignal === 'strong_sell' || data.overallSignal === 'sell') return 'bg-red-500/20 text-red-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  const getIcon = () => {
    if (data.liquiditySweep?.status === 'liquidity_building') {
      return <Clock className="h-3 w-3 animate-pulse" />;
    }
    if (data.liquiditySweep?.status === 'sweep_confirmed') {
      return <Droplets className="h-3 w-3" />;
    }
    return <Brain className="h-3 w-3" />;
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${getColor()}`}>
      {getIcon()}
      {data.liquiditySweep?.status === 'liquidity_building' ? (
        <span>Building</span>
      ) : (
        <>
          <span>{data.neuralIndex === 'up' ? '↑' : data.neuralIndex === 'down' ? '↓' : '→'}</span>
          <span>{data.neuralConfidence}%</span>
        </>
      )}
      {data.doubleConfirmed && data.liquiditySweep?.status !== 'liquidity_building' && (
        <CheckCircle className="h-3 w-3" />
      )}
    </div>
  );
}
