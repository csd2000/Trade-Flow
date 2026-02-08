import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, X, CheckCircle2, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { http, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';

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

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: stats } = useQuery<AlertStats>({
    queryKey: ['/api/custom-alerts/stats'],
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery<AlertNotification[]>({
    queryKey: ['/api/custom-alerts/notifications'],
    enabled: isOpen,
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
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-alerts/stats'] });
      setIsOpen(false);
    },
  });

  const unreadCount = stats?.notifications || 0;
  const recentNotifications = notifications?.slice(0, 5) || [];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-300 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-violet-500 text-white text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden bg-slate-900 border-slate-700 z-50 shadow-xl">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No new notifications</p>
                </div>
              ) : (
                <div>
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-slate-800/30' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.alertType === 'price' ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                        }`}>
                          {notification.alertType === 'price' ? (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Activity className="h-4 w-4 text-violet-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </span>
                            <Badge variant="outline" className="text-xs text-violet-400 border-violet-500">
                              {notification.symbol}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-700">
              <Link href="/alert-center">
                <Button
                  variant="ghost"
                  className="w-full text-violet-400 hover:text-violet-300 hover:bg-slate-800"
                  onClick={() => setIsOpen(false)}
                >
                  View Alert Center
                </Button>
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
