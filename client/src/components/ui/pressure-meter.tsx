import { cn } from "@/lib/utils";

interface PressureMeterProps {
  pressure: 'buy' | 'sell' | 'neutral' | 'absorption';
  score: number;
  label?: string;
  cvd?: number;
  delta?: number;
  absorptionActive?: boolean;
  momentumSurge?: boolean;
  compact?: boolean;
  className?: string;
}

export function PressureMeter({
  pressure,
  score,
  label,
  cvd,
  delta,
  absorptionActive,
  momentumSurge,
  compact = false,
  className
}: PressureMeterProps) {
  const getColor = () => {
    switch (pressure) {
      case 'buy': return 'bg-green-500';
      case 'sell': return 'bg-red-500';
      case 'absorption': return 'bg-yellow-500';
      default: return 'bg-yellow-500';
    }
  };

  const getTextColor = () => {
    switch (pressure) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      case 'absorption': return 'text-yellow-400';
      default: return 'text-yellow-400';
    }
  };

  const getBorderColor = () => {
    switch (pressure) {
      case 'buy': return 'border-green-500/50';
      case 'sell': return 'border-red-500/50';
      case 'absorption': return 'border-yellow-500/50';
      default: return 'border-yellow-500/50';
    }
  };

  const getGlowColor = () => {
    switch (pressure) {
      case 'buy': return 'shadow-green-500/30';
      case 'sell': return 'shadow-red-500/30';
      case 'absorption': return 'shadow-yellow-500/30';
      default: return 'shadow-yellow-500/30';
    }
  };

  const getPressureLabel = () => {
    switch (pressure) {
      case 'buy': return 'HIGH BUY PRESSURE';
      case 'sell': return 'HIGH SELL PRESSURE';
      case 'absorption': return 'ABSORPTION';
      default: return 'NEUTRAL';
    }
  };

  const normalizedScore = Math.max(0, Math.min(100, score));
  const needlePosition = (normalizedScore / 100) * 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("w-3 h-3 rounded-full animate-pulse", getColor())} />
        <span className={cn("text-xs font-medium", getTextColor())}>
          {getPressureLabel()}
        </span>
        <span className="text-xs text-slate-400">({normalizedScore.toFixed(0)})</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border p-4 bg-slate-900/50 backdrop-blur-sm",
      getBorderColor(),
      "shadow-lg",
      getGlowColor(),
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">Order Flow Pressure</h3>
        <div className={cn("flex items-center gap-2", getTextColor())}>
          <div className={cn("w-2 h-2 rounded-full animate-pulse", getColor())} />
          <span className="text-xs font-bold">{getPressureLabel()}</span>
        </div>
      </div>

      <div className="relative h-8 bg-gradient-to-r from-red-900/50 via-yellow-900/50 to-green-900/50 rounded-full overflow-hidden mb-3">
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-slate-700/50" />
          <div className="flex-1 border-r border-slate-700/50" />
          <div className="flex-1" />
        </div>
        
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-500"
          style={{ left: `calc(${needlePosition}% - 2px)` }}
        />
        
        <div 
          className={cn("absolute top-1 bottom-1 rounded-full transition-all duration-500", getColor())}
          style={{ 
            left: score >= 50 ? '50%' : `${needlePosition}%`,
            width: score >= 50 ? `${needlePosition - 50}%` : `${50 - needlePosition}%`
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500 mb-4">
        <span>SELL</span>
        <span>NEUTRAL</span>
        <span>BUY</span>
      </div>

      {label && (
        <div className={cn("text-center text-sm font-medium mb-3", getTextColor())}>
          {label}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        {cvd !== undefined && (
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-slate-500">CVD</div>
            <div className={cn("font-mono font-bold", cvd >= 0 ? 'text-green-400' : 'text-red-400')}>
              {cvd >= 0 ? '+' : ''}{(cvd / 1000).toFixed(1)}K
            </div>
          </div>
        )}
        {delta !== undefined && (
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-slate-500">Delta</div>
            <div className={cn("font-mono font-bold", delta >= 0 ? 'text-green-400' : 'text-red-400')}>
              {delta >= 0 ? '+' : ''}{(delta / 1000).toFixed(1)}K
            </div>
          </div>
        )}
      </div>

      {(absorptionActive || momentumSurge) && (
        <div className="flex gap-2 mt-3">
          {absorptionActive && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
              Absorption Active
            </span>
          )}
          {momentumSurge && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
              Momentum Surge
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function PressureMeterMini({ pressure, score }: { pressure: 'buy' | 'sell' | 'neutral' | 'absorption'; score: number }) {
  return <PressureMeter pressure={pressure} score={score} compact />;
}
