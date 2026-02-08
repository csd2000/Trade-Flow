import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check, 
  X, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Clock,
  Share,
  MessageSquare
} from "lucide-react";

export function NotificationCenterMobile() {
  const { 
    notifications, 
    settings, 
    unreadCount, 
    urgentCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    updateSettings,
    requestPermission,
    permission
  } = useNotifications();
  
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'yield':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'portfolio':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'news':
        return <MessageSquare className="w-4 h-4 text-orange-400" />;
      case 'trade':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-crypto-muted" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({ pushNotifications: true });
    }
  };

  if (showSettings) {
    return (
      <Card className="bg-crypto-surface border-crypto-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-crypto-text flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Permission */}
          {permission !== 'granted' && (
            <div className="p-3 bg-crypto-card rounded-lg border border-crypto-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-crypto-text text-sm font-medium">Browser Notifications</span>
                <Button 
                  size="sm" 
                  onClick={handlePermissionRequest}
                  className="bg-crypto-primary hover:bg-crypto-primary/90"
                >
                  Enable
                </Button>
              </div>
              <p className="text-crypto-muted text-xs">
                Allow browser notifications for real-time alerts
              </p>
            </div>
          )}

          {/* Alert Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-crypto-text text-sm">Price Alerts</span>
              </div>
              <Switch 
                checked={settings.priceAlerts}
                onCheckedChange={(checked) => updateSettings({ priceAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-crypto-text text-sm">Yield Alerts</span>
              </div>
              <Switch 
                checked={settings.yieldAlerts}
                onCheckedChange={(checked) => updateSettings({ yieldAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-crypto-text text-sm">Portfolio Alerts</span>
              </div>
              <Switch 
                checked={settings.portfolioAlerts}
                onCheckedChange={(checked) => updateSettings({ portfolioAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <span className="text-crypto-text text-sm">News Alerts</span>
              </div>
              <Switch 
                checked={settings.newsAlerts}
                onCheckedChange={(checked) => updateSettings({ newsAlerts: checked })}
              />
            </div>
          </div>

          {/* Delivery Methods */}
          <div className="pt-4 border-t border-crypto-border">
            <h4 className="text-crypto-text font-medium mb-3">Delivery Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-crypto-text text-sm">Push Notifications</span>
                <Switch 
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                  disabled={permission !== 'granted'}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crypto-text text-sm">Email Notifications</span>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crypto-text text-sm">SMS Notifications</span>
                <Switch 
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSettings({ smsNotifications: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-crypto-surface border-crypto-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-crypto-text flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
            {urgentCount > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {urgentCount} urgent
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-crypto-muted hover:text-crypto-text"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 text-crypto-muted mx-auto mb-3" />
            <p className="text-crypto-muted">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-all ${
                notification.read 
                  ? 'bg-crypto-card border-crypto-border opacity-60' 
                  : notification.urgent
                  ? 'bg-red-500/10 border-red-500/30 animate-pulse'
                  : 'bg-crypto-primary/5 border-crypto-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-crypto-text font-medium text-sm truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-crypto-muted" />
                      <span className="text-crypto-muted text-xs">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-crypto-muted text-xs mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 px-2 text-xs hover:bg-crypto-primary/10"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-6 px-2 text-xs hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}