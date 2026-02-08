import { cn } from "@/lib/utils";

interface TrendStrengthData {
  value: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  sweepDetected: boolean;
  sweepType: 'bullish' | 'bearish' | null;
  adx: number;
  adxRising: boolean;
  rsi: number;
  emaCross: 'bullish' | 'bearish' | 'none';
  intensity: number;
}

interface TrendStrengthBarProps {
  data: TrendStrengthData;
  showDetails?: boolean;
  className?: string;
}

export function TrendStrengthBar({ data, showDetails = true, className }: TrendStrengthBarProps) {
  const { value, direction, sweepDetected, sweepType, adx, adxRising, rsi, intensity } = data;
  
  const normalizedValue = Math.max(-100, Math.min(100, value));
  const absValue = Math.abs(normalizedValue);
  const segmentLevel = Math.ceil(absValue / 20);
  const isBullish = normalizedValue > 0;
  const isBearish = normalizedValue < 0;
  const isSweepZone = absValue >= 80;

  const getSegmentColor = (index: number, side: 'left' | 'right') => {
    const segmentPosition = side === 'left' ? 5 - index : index + 1;
    const isActive = side === 'left' 
      ? (isBearish && segmentLevel >= segmentPosition)
      : (isBullish && segmentLevel >= segmentPosition);

    if (!isActive) {
      return 'bg-slate-800/50 border-slate-700';
    }

    if (side === 'left') {
      if (segmentPosition >= 5 && sweepDetected && sweepType === 'bearish') {
        return 'bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse';
      }
      if (segmentPosition >= 4) return 'bg-red-500 border-red-400';
      if (segmentPosition >= 3) return 'bg-red-600 border-red-500';
      return 'bg-red-800 border-red-700';
    } else {
      if (segmentPosition >= 5 && sweepDetected && sweepType === 'bullish') {
        return 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse';
      }
      if (segmentPosition >= 4) return 'bg-green-500 border-green-400';
      if (segmentPosition >= 3) return 'bg-green-600 border-green-500';
      return 'bg-green-800 border-green-700';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1">
        <div className="text-xs text-red-400 font-medium w-12 text-right">-100</div>
        
        <div className="flex-1 flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`left-${i}`}
              className={cn(
                "h-8 flex-1 rounded-sm border transition-all duration-300",
                getSegmentColor(i, 'left'),
                adxRising && isBearish && "animate-[pulse_1.5s_ease-in-out_infinite]"
              )}
            />
          ))}
          
          <div className="w-1 h-10 bg-white/80 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] mx-1" />
          
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`right-${i}`}
              className={cn(
                "h-8 flex-1 rounded-sm border transition-all duration-300",
                getSegmentColor(i, 'right'),
                adxRising && isBullish && "animate-[pulse_1.5s_ease-in-out_infinite]"
              )}
            />
          ))}
        </div>
        
        <div className="text-xs text-green-400 font-medium w-12">+100</div>
      </div>

      <div className="flex justify-center items-center">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-lg font-bold",
            isBullish ? "text-green-400" : isBearish ? "text-red-400" : "text-slate-400"
          )}>
            {isBullish ? 'BULLISH' : isBearish ? 'BEARISH' : 'NEUTRAL'} ({normalizedValue > 0 ? '+' : ''}{normalizedValue})
          </span>
          {sweepDetected && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium animate-pulse",
              sweepType === 'bullish' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            )}>
              SWEEP {sweepType?.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700">
          <div className="text-center">
            <div className="text-xs text-slate-500">ADX</div>
            <div className={cn(
              "text-sm font-semibold flex items-center justify-center gap-1",
              adx >= 40 ? "text-purple-400" : adx >= 25 ? "text-blue-400" : "text-slate-400"
            )}>
              {adx}
              {adxRising && <span className="text-xs text-green-400">↑</span>}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">RSI</div>
            <div className={cn(
              "text-sm font-semibold",
              rsi >= 70 ? "text-red-400" : rsi <= 30 ? "text-green-400" : "text-slate-400"
            )}>
              {rsi}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Intensity</div>
            <div className="text-sm font-semibold text-cyan-400">{intensity}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Direction</div>
            <div className={cn(
              "text-sm font-semibold capitalize",
              direction === 'bullish' ? "text-green-400" : direction === 'bearish' ? "text-red-400" : "text-slate-400"
            )}>
              {direction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
