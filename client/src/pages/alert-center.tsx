import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Bell, Plus, Trash2, Edit2, Power, RefreshCw, TrendingUp, TrendingDown, Activity, Volume2, AlertTriangle, CheckCircle2, Clock, Target, Play, Square, Zap, Radio } from 'lucide-react';
import { http, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

interface CustomAlert {
  id: number;
  name: string;
  symbol: string;
  assetType: string;
  alertType: string;
  condition: string;
  targetValue: string;
  secondaryValue: string | null;
  indicatorPeriod: number | null;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyInApp: boolean;
  isActive: boolean;
  isTriggered: boolean;
  triggerCount: number;
  repeatAlert: boolean;
  cooldownMinutes: number;
  lastTriggeredAt: string | null;
  lastCheckedAt: string | null;
  lastValue: string | null;
  createdAt: string;
}

interface AlertNotification {
  id: number;
  alertId: number;
  title: string;
  message: string;
  symbol: string;
  alertType: string;
  triggeredValue: string;
  targetValue: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertStats {
  total: number;
  active: number;
  triggered: number;
  notifications: number;
}

interface MonitorStatus {
  isRunning: boolean;
  message: string;
}

interface ConditionsData {
  alertTypes: Record<string, string[]>;
  alertConditions: Record<string, { label: string; description: string }>;
  defaultValues: Record<string, number>;
}

const conditionIcons: Record<string, any> = {
  price_above: TrendingUp,
  price_below: TrendingDown,
  price_change_percent: Activity,
  rsi_overbought: TrendingUp,
  rsi_oversold: TrendingDown,
  macd_crossover: TrendingUp,
  macd_crossunder: TrendingDown,
  ema_cross: Activity,
  bollinger_upper: TrendingUp,
  bollinger_lower: TrendingDown,
  volume_spike: Volume2,
};

export default function AlertCenter() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<CustomAlert | null>(null);
  const [newAlert, setNewAlert] = useState({
    name: '',
    symbol: '',
    assetType: 'stock',
    alertType: 'price',
    condition: 'price_above',
    targetValue: '',
    secondaryValue: '',
    indicatorPeriod: 14,
    notifyEmail: true,
    notifyPush: true,
    notifyInApp: true,
    repeatAlert: false,
    cooldownMinutes: 60,
  });
  const { toast } = useToast();

  const { data: alerts, isLoading: alertsLoading } = useQuery<CustomAlert[]>({
    queryKey: ['/api/custom-alerts'],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<AlertNotification[]>({
    queryKey: ['/api/custom-alerts/notifications'],
  });

  const { data: stats } = useQuery<AlertStats>({
    queryKey: ['/api/custom-alerts/stats'],
  });

  const { data: conditionsData } = useQuery<ConditionsData>({
    queryKey: ['/api/custom-alerts/conditions'],
  });

  const { data: monitorStatus, refetch: refetchMonitorStatus } = useQuery<MonitorStatus>({
    queryKey: ['/api/custom-alerts/monitor/status'],
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newAlert) => http.post('/api/custom-alerts', data),
    onSuccess: () => {
      toast({ title: 'Alert Created', description: 'Your custom alert has been created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create alert.', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof newAlert> }) => 
      http.patch(`/api/custom-alerts/${id}`, data),
    onSuccess: () => {
      toast({ title: 'Alert Updated', description: 'Your alert has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
      setEditingAlert(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update alert.', variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => http.patch(`/api/custom-alerts/${id}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: number) => http.patch(`/api/custom-alerts/${id}/reset`, {}),
    onSuccess: () => {
      toast({ title: 'Alert Reset', description: 'Alert has been reset and will trigger again.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => http.del(`/api/custom-alerts/${id}`),
    onSuccess: () => {
      toast({ title: 'Alert Deleted', description: 'The alert has been removed.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => http.patch(`/api/custom-alerts/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => http.post('/api/custom-alerts/notifications/mark-all-read', { userId: 1 }),
    onSuccess: () => {
      toast({ title: 'All Read', description: 'All notifications marked as read.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
    },
  });

  const startMonitorMutation = useMutation({
    mutationFn: () => http.post('/api/custom-alerts/monitor/start', { intervalMs: 60000 }),
    onSuccess: () => {
      toast({ title: 'Monitor Started', description: 'Alert monitoring is now active.' });
      refetchMonitorStatus();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to start monitor.', variant: 'destructive' });
    },
  });

  const stopMonitorMutation = useMutation({
    mutationFn: () => http.post('/api/custom-alerts/monitor/stop', {}),
    onSuccess: () => {
      toast({ title: 'Monitor Stopped', description: 'Alert monitoring has been paused.' });
      refetchMonitorStatus();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to stop monitor.', variant: 'destructive' });
    },
  });

  const checkNowMutation = useMutation({
    mutationFn: () => http.post('/api/custom-alerts/monitor/check-now', {}),
    onSuccess: (data: any) => {
      toast({ 
        title: 'Alerts Checked', 
        description: `Checked ${data.checked} alerts. ${data.triggered} triggered.` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to check alerts.', variant: 'destructive' });
    },
  });

  const testAlertMutation = useMutation({
    mutationFn: (id: number) => http.post(`/api/custom-alerts/${id}/test`, {}),
    onSuccess: (data: any) => {
      if (data.triggered) {
        toast({ title: 'Alert Triggered!', description: 'The alert conditions were met.' });
      } else {
        toast({ title: 'Not Triggered', description: 'Alert conditions not currently met.' });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/notifications'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to test alert.', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setNewAlert({
      name: '',
      symbol: '',
      assetType: 'stock',
      alertType: 'price',
      condition: 'price_above',
      targetValue: '',
      secondaryValue: '',
      indicatorPeriod: 14,
      notifyEmail: true,
      notifyPush: true,
      notifyInApp: true,
      repeatAlert: false,
      cooldownMinutes: 60,
    });
  };

  const getConditionLabel = (condition: string) => {
    return conditionsData?.alertConditions?.[condition]?.label || condition;
  };

  const getConditionDescription = (condition: string) => {
    return conditionsData?.alertConditions?.[condition]?.description || '';
  };

  const ConditionIcon = ({ condition }: { condition: string }) => {
    const Icon = conditionIcons[condition] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-violet-400" />
              Alert Center
            </h1>
            <p className="text-slate-200 mt-1 text-xs sm:text-sm">Create custom alerts for price levels and technical indicators</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <Radio className={`w-4 h-4 ${monitorStatus?.isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`} />
              <span className="text-sm text-slate-300 hidden sm:inline">
                {monitorStatus?.isRunning ? 'Monitoring Active' : 'Monitor Off'}
              </span>
            </div>
            {monitorStatus?.isRunning ? (
              <Button
                onClick={() => stopMonitorMutation.mutate()}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                disabled={stopMonitorMutation.isPending}
              >
                <Square className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Stop</span>
              </Button>
            ) : (
              <Button
                onClick={() => startMonitorMutation.mutate()}
                variant="outline"
                size="sm"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                disabled={startMonitorMutation.isPending}
              >
                <Play className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Start</span>
              </Button>
            )}
            <Button
              onClick={() => checkNowMutation.mutate()}
              variant="outline"
              size="sm"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              disabled={checkNowMutation.isPending}
            >
              {checkNowMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin sm:mr-2" />
              ) : (
                <Zap className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Check Now</span>
            </Button>
            <WalkthroughGuide steps={MODULE_GUIDES['alert-center']} title="Guide" accentColor="violet" />
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Alert</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 text-xs sm:text-sm">Total Alerts</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats?.total || 0}</p>
                </div>
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 text-xs sm:text-sm">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">{stats?.active || 0}</p>
                </div>
                <Power className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 text-xs sm:text-sm">Triggered</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats?.triggered || 0}</p>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 text-xs sm:text-sm">Unread</p>
                  <p className="text-xl sm:text-2xl font-bold text-violet-400">{stats?.notifications || 0}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-violet-600">
              My Alerts
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-violet-600">
              Notifications {stats?.notifications ? <Badge className="ml-2 bg-violet-500">{stats.notifications}</Badge> : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-6">
            {alertsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : alerts?.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-200">No alerts created yet</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4 bg-violet-600 hover:bg-violet-700"
                  >
                    Create Your First Alert
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {alerts?.map((alert) => (
                  <Card key={alert.id} className={`bg-slate-900 border-slate-800 ${!alert.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            alert.isTriggered ? 'bg-amber-500/20' : alert.isActive ? 'bg-emerald-500/20' : 'bg-slate-700'
                          }`}>
                            <ConditionIcon condition={alert.condition} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{alert.name}</span>
                              <Badge variant="outline" className="text-violet-400 border-violet-400">
                                {alert.symbol}
                              </Badge>
                              {alert.isTriggered && (
                                <Badge className="bg-amber-500/20 text-amber-400">Triggered</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-200">
                              {getConditionLabel(alert.condition)}: {alert.targetValue}
                              {alert.triggerCount > 0 && ` • Triggered ${alert.triggerCount}x`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testAlertMutation.mutate(alert.id)}
                            disabled={testAlertMutation.isPending}
                            className="text-cyan-400 hover:text-cyan-300"
                            title="Test alert now"
                          >
                            {testAlertMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                          </Button>
                          {alert.isTriggered && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetMutation.mutate(alert.id)}
                              className="text-amber-400 hover:text-amber-300"
                              title="Reset alert"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => toggleMutation.mutate(alert.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAlert(alert)}
                            className="text-slate-200 hover:text-white"
                            title="Edit alert"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(alert.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                className="text-slate-200 border-slate-700"
              >
                Mark All Read
              </Button>
            </div>
            {notificationsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : notifications?.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-200">No notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {notifications?.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-violet-600 transition-colors ${
                      !notification.isRead ? 'border-l-4 border-l-violet-500' : ''
                    }`}
                    onClick={() => !notification.isRead && markReadMutation.mutate(notification.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{notification.title}</span>
                            <Badge variant="outline" className="text-violet-400 border-violet-400">
                              {notification.symbol}
                            </Badge>
                          </div>
                          <p className="text-slate-200">{notification.message}</p>
                          <p className="text-xs text-slate-300 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-violet-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription className="text-slate-200">
                Set up a custom alert for price levels or technical indicators
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Alert Name</Label>
                  <Input
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    placeholder="e.g., AAPL Price Target"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Symbol</Label>
                  <Input
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Alert Type</Label>
                  <Select
                    value={newAlert.alertType}
                    onValueChange={(value) => {
                      const conditions = conditionsData?.alertTypes?.[value] || [];
                      setNewAlert({ 
                        ...newAlert, 
                        alertType: value,
                        condition: conditions[0] || 'price_above'
                      });
                    }}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="indicator">Technical Indicator</SelectItem>
                      <SelectItem value="momentum">Momentum</SelectItem>
                      <SelectItem value="volatility">Volatility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Condition</Label>
                  <Select
                    value={newAlert.condition}
                    onValueChange={(value) => {
                      const defaultVal = conditionsData?.defaultValues?.[value];
                      setNewAlert({ 
                        ...newAlert, 
                        condition: value,
                        targetValue: defaultVal ? String(defaultVal) : newAlert.targetValue
                      });
                    }}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {conditionsData?.alertTypes?.[newAlert.alertType]?.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {getConditionLabel(cond)}
                        </SelectItem>
                      )) || (
                        <>
                          <SelectItem value="price_above">Price Above</SelectItem>
                          <SelectItem value="price_below">Price Below</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Target Value</Label>
                <Input
                  type="number"
                  value={newAlert.targetValue}
                  onChange={(e) => setNewAlert({ ...newAlert, targetValue: e.target.value })}
                  placeholder={newAlert.condition.includes('rsi') ? '70' : '150.00'}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-300">{getConditionDescription(newAlert.condition)}</p>
              </div>

              {(newAlert.condition.includes('rsi') || newAlert.condition.includes('ema')) && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Indicator Period</Label>
                  <Input
                    type="number"
                    value={newAlert.indicatorPeriod}
                    onChange={(e) => setNewAlert({ ...newAlert, indicatorPeriod: parseInt(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <Label className="text-slate-300">Notification Settings</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">In-App Notifications</span>
                  <Switch
                    checked={newAlert.notifyInApp}
                    onCheckedChange={(checked) => setNewAlert({ ...newAlert, notifyInApp: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">Email Notifications</span>
                  <Switch
                    checked={newAlert.notifyEmail}
                    onCheckedChange={(checked) => setNewAlert({ ...newAlert, notifyEmail: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">Push Notifications</span>
                  <Switch
                    checked={newAlert.notifyPush}
                    onCheckedChange={(checked) => setNewAlert({ ...newAlert, notifyPush: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">Repeat Alert</span>
                  <Switch
                    checked={newAlert.repeatAlert}
                    onCheckedChange={(checked) => setNewAlert({ ...newAlert, repeatAlert: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-700">
                Cancel
              </Button>
              <Button 
                onClick={() => createMutation.mutate(newAlert)}
                disabled={!newAlert.name || !newAlert.symbol || !newAlert.targetValue || createMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingAlert} onOpenChange={(open) => !open && setEditingAlert(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Alert</DialogTitle>
              <DialogDescription className="text-slate-200">
                Update your alert settings
              </DialogDescription>
            </DialogHeader>
            {editingAlert && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Alert Name</Label>
                  <Input
                    value={editingAlert.name}
                    onChange={(e) => setEditingAlert({ ...editingAlert, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Target Value</Label>
                  <Input
                    type="number"
                    value={editingAlert.targetValue}
                    onChange={(e) => setEditingAlert({ ...editingAlert, targetValue: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Cooldown (minutes)</Label>
                  <Input
                    type="number"
                    value={editingAlert.cooldownMinutes}
                    onChange={(e) => setEditingAlert({ ...editingAlert, cooldownMinutes: parseInt(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">Repeat Alert</span>
                  <Switch
                    checked={editingAlert.repeatAlert}
                    onCheckedChange={(checked) => setEditingAlert({ ...editingAlert, repeatAlert: checked })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingAlert(null)} className="border-slate-700">
                Cancel
              </Button>
              <Button 
                onClick={() => editingAlert && updateMutation.mutate({ 
                  id: editingAlert.id, 
                  data: { 
                    name: editingAlert.name,
                    targetValue: editingAlert.targetValue,
                    cooldownMinutes: editingAlert.cooldownMinutes,
                    repeatAlert: editingAlert.repeatAlert,
                  }
                })}
                disabled={updateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
