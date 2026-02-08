import { useGlobalNewsAlert, NewsAlert } from '@/contexts/GlobalNewsAlertContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Shield,
  Clock,
  Target,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

function AlertContent({ alert, onAcknowledge }: { alert: NewsAlert; onAcknowledge: () => void }) {
  const [countdown, setCountdown] = useState(alert.countdown || 0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOMC':
      case 'RATE_DECISION':
        return <Zap className="w-8 h-8 text-yellow-400" />;
      case 'CPI':
      case 'NFP':
        return <TrendingUp className="w-8 h-8 text-cyan-400" />;
      case 'EARNINGS':
        return <Target className="w-8 h-8 text-green-400" />;
      case 'SEC':
        return <Shield className="w-8 h-8 text-red-400" />;
      default:
        return <Bell className="w-8 h-8 text-orange-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FOMC':
      case 'RATE_DECISION':
        return 'from-yellow-600/90 to-orange-700/90';
      case 'CPI':
      case 'NFP':
        return 'from-cyan-600/90 to-blue-700/90';
      case 'EARNINGS':
        return 'from-green-600/90 to-emerald-700/90';
      case 'SEC':
        return 'from-red-600/90 to-rose-700/90';
      default:
        return 'from-purple-600/90 to-indigo-700/90';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-pulse" style={{ animationDuration: '2s' }} />
      
      <div className={`relative w-full max-w-2xl mx-4 rounded-2xl bg-gradient-to-br ${getCategoryColor(alert.category)} border-2 border-white/20 shadow-2xl overflow-hidden`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 animate-pulse" />
        
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAcknowledge}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-12 h-12 text-red-400 animate-bounce" />
            <div className="text-4xl font-black text-white tracking-tight">
              MAJOR NEWS ALERT
            </div>
            <AlertTriangle className="w-12 h-12 text-red-400 animate-bounce" />
          </div>

          <div className="flex items-center justify-center gap-4">
            {getCategoryIcon(alert.category)}
            <Badge className="bg-red-600 text-white text-lg px-4 py-2 animate-pulse">
              {alert.category} - {alert.impact} IMPACT
            </Badge>
          </div>

          <div className="bg-black/40 rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">{alert.eventName}</h2>
            <p className="text-xl text-white/90">{alert.headline}</p>
          </div>

          {alert.sweepDetected && (
            <div className="bg-red-900/60 rounded-xl p-4 border-2 border-red-500/50 animate-pulse">
              <div className="flex items-center justify-center gap-3">
                {alert.sweepDirection === 'bullish' ? (
                  <TrendingUp className="w-8 h-8 text-green-400" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-400" />
                )}
                <div>
                  <p className="text-lg font-bold text-white">LIQUIDITY SWEEP IN PROGRESS</p>
                  {alert.priceLevel && (
                    <p className="text-yellow-400 font-mono text-xl">@ ${alert.priceLevel.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <p className="text-white/80 mt-2">Validating 7-Gate entry...</p>
            </div>
          )}

          {!alert.sweepDetected && (
            <div className="bg-yellow-900/40 rounded-xl p-4 border border-yellow-500/30">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Target className="w-5 h-5" />
                <span className="font-semibold">LIQUIDITY SWEEP RISK</span>
              </div>
              <p className="text-white/70 text-sm mt-1">
                Monitor for price runs on Previous Day High/Low or Session High/Low
              </p>
            </div>
          )}

          {countdown > 0 && (
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-6 h-6 text-white/70" />
              <div className="text-3xl font-mono font-bold text-white">
                Data Release: {formatCountdown(countdown)}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={onAcknowledge}
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 py-6"
            >
              <Shield className="w-5 h-5 mr-2" />
              ACKNOWLEDGE & MONITOR
            </Button>
          </div>

          <p className="text-white/50 text-xs">
            This alert bypasses navigation to ensure you see critical market events
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GlobalNewsOverlay() {
  const { currentAlert, showOverlay, acknowledgeAlert } = useGlobalNewsAlert();

  if (!showOverlay || !currentAlert) return null;

  return (
    <AlertContent 
      alert={currentAlert} 
      onAcknowledge={() => acknowledgeAlert(currentAlert.id)} 
    />
  );
}
