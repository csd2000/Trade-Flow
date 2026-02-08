import { useGlobalNewsAlert } from '@/contexts/GlobalNewsAlertContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Bell, 
  AlertTriangle,
  Zap 
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function NewsAlertStatusIndicator() {
  const { connectionStatus, activeAlerts, isConnected } = useGlobalNewsAlert();
  const [testingAlert, setTestingAlert] = useState(false);
  const { toast } = useToast();

  const handleTestAlert = async () => {
    setTestingAlert(true);
    try {
      const response = await fetch('/api/news-alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Test Alert',
          headline: 'This is a test alert to verify the notification system is working correctly.',
          impact: 'HIGH',
          category: 'BREAKING'
        })
      });
      if (response.ok) {
        toast({ title: 'Test alert triggered' });
      }
    } catch (err) {
      toast({ title: 'Failed to trigger test alert', variant: 'destructive' });
    }
    setTestingAlert(false);
  };

  const unacknowledgedCount = activeAlerts.filter(a => !a.acknowledged).length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700">
        {isConnected ? (
          <Wifi className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className="text-xs text-slate-400">
          {connectionStatus === 'connected' ? 'Live' : connectionStatus}
        </span>
      </div>

      {unacknowledgedCount > 0 && (
        <Badge className="bg-red-600 animate-pulse flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {unacknowledgedCount}
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleTestAlert}
        disabled={testingAlert}
        className="text-xs text-slate-400 hover:text-white"
      >
        <Zap className="w-3 h-3 mr-1" />
        Test
      </Button>
    </div>
  );
}
