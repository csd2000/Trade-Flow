import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap,
  Target,
  Timer,
  X
} from "lucide-react";
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  type: 'price' | 'yield' | 'sentiment' | 'profit';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  dismissed: boolean;
  actionable: boolean;
}

interface AlertSettings {
  priceAlerts: boolean;
  yieldChanges: boolean;
  sentimentShifts: boolean;
  profitTargets: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
}

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'price',
      title: 'ETH Price Alert',
      message: 'Ethereum reached your target price of $2,850',
      priority: 'high',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      dismissed: false,
      actionable: true
    },
    {
      id: '2',
      type: 'yield',
      title: 'Yield Opportunity',
      message: 'Aave USDC APY increased to 6.8% (+0.5%)',
      priority: 'medium',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      dismissed: false,
      actionable: true
    },
    {
      id: '3',
      type: 'sentiment',
      title: 'Market Sentiment Change',
      message: 'Fear & Greed Index dropped to 23 (Extreme Fear)',
      priority: 'high',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      dismissed: false,
      actionable: true
    }
  ]);

  const [settings, setSettings] = useState<AlertSettings>({
    priceAlerts: true,
    yieldChanges: true,
    sentimentShifts: true,
    profitTargets: true,
    browserNotifications: false,
    emailNotifications: false
  });

  const [showSettings, setShowSettings] = useState(false);

  // Request notification permission
  useEffect(() => {
    if (settings.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.browserNotifications]);

  // Simulate real-time alerts
  useEffect(() => {
    if (!settings.priceAlerts && !settings.yieldChanges && !settings.sentimentShifts) return;

    const interval = setInterval(() => {
      const alertTypes = ['price', 'yield', 'sentiment', 'profit'];
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)] as Alert['type'];
      
      // Only add alert if that type is enabled
      const isEnabled = 
        (randomType === 'price' && settings.priceAlerts) ||
        (randomType === 'yield' && settings.yieldChanges) ||
        (randomType === 'sentiment' && settings.sentimentShifts) ||
        (randomType === 'profit' && settings.profitTargets);

      if (isEnabled && Math.random() > 0.7) { // 30% chance every interval
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: randomType,
          title: getRandomAlertTitle(randomType),
          message: getRandomAlertMessage(randomType),
          priority: Math.random() > 0.6 ? 'high' : 'medium',
          timestamp: new Date(),
          dismissed: false,
          actionable: true
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only 10 most recent
        
        // Show toast notification
        toast.success(newAlert.title, {
          duration: 4000,
          icon: getAlertIcon(randomType)
        });

        // Browser notification
        if (settings.browserNotifications && Notification.permission === 'granted') {
          new Notification(newAlert.title, {
            body: newAlert.message,
            icon: '/favicon.ico'
          });
        }
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, [settings]);

  const getRandomAlertTitle = (type: Alert['type']) => {
    const titles = {
      price: ['BTC Price Alert', 'ETH Target Reached', 'MATIC Breakout', 'LINK Price Movement'],
      yield: ['High Yield Detected', 'APY Increase Alert', 'New Farming Opportunity', 'Yield Drop Warning'],
      sentiment: ['Market Sentiment Shift', 'Fear Index Change', 'Bullish Signal Detected', 'Market Reversal Alert'],
      profit: ['Profit Target Hit', 'Take Profit Alert', 'Position Update', 'Profit Milestone']
    };
    return titles[type][Math.floor(Math.random() * titles[type].length)];
  };

  const getRandomAlertMessage = (type: Alert['type']) => {
    const messages = {
      price: ['Reached your price target', 'Significant price movement detected', 'Support level broken', 'Resistance level tested'],
      yield: ['APY increased significantly', 'New high-yield pool available', 'Yield rates have changed', 'Farming rewards updated'],
      sentiment: ['Major sentiment shift detected', 'Fear/Greed levels changed', 'Market psychology update', 'Sentiment analysis complete'],
      profit: ['Your position hit profit target', 'Consider taking profits', 'Milestone reached', 'Performance update available']
    };
    return messages[type][Math.floor(Math.random() * messages[type].length)];
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price': return '💰';
      case 'yield': return '🌾';
      case 'sentiment': return '📊';
      case 'profit': return '🎯';
      default: return '🔔';
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/5';
      case 'medium': return 'border-crypto-quaternary bg-crypto-quaternary/5';
      case 'low': return 'border-crypto-muted bg-crypto-muted/5';
    }
  };

  const getPriorityBadge = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-secondary';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price': return TrendingUp;
      case 'yield': return Target;
      case 'sentiment': return AlertTriangle;
      case 'profit': return CheckCircle;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
            <Bell className="w-6 h-6 text-crypto-primary" />
            Real-Time Alerts
            {activeAlerts.length > 0 && (
              <Badge className="badge-danger animate-pulse">
                {activeAlerts.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showSettings && (
          <div className="p-4 bg-crypto-surface rounded-lg border border-crypto-border space-y-4">
            <h4 className="font-semibold text-crypto-text">Alert Settings</h4>
            
            <div className="space-y-3">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-crypto-text text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-crypto-tertiary mx-auto mb-3" />
              <p className="text-crypto-muted">No active alerts</p>
              <p className="text-crypto-muted text-sm">You're all caught up!</p>
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const Icon = getTypeIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)} transition-all hover:border-opacity-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-crypto-primary/15 rounded-lg">
                        <Icon className="w-4 h-4 text-crypto-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-semibold text-crypto-text text-sm">
                            {alert.title}
                          </h5>
                          <Badge className={getPriorityBadge(alert.priority)}>
                            {alert.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-crypto-muted text-sm mb-2">
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center text-crypto-muted text-xs">
                          <Timer className="w-3 h-3 mr-1" />
                          {Math.round((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.actionable && (
                        <Button size="sm" className="btn-primary">
                          <Zap className="w-3 h-3 mr-1" />
                          Act
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-crypto-muted hover:text-crypto-text"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeAlerts.length > 0 && (
          <Button
            variant="outline"
            className="w-full btn-secondary"
            onClick={() => setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })))}
          >
            Dismiss All
          </Button>
        )}
      </CardContent>
    </Card>
  );
}