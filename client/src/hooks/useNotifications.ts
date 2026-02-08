import { useState, useEffect, useCallback } from 'react';

interface NotificationSettings {
  priceAlerts: boolean;
  yieldAlerts: boolean;
  portfolioAlerts: boolean;
  newsAlerts: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  active: boolean;
  created: Date;
}

interface Notification {
  id: string;
  type: 'price' | 'yield' | 'portfolio' | 'news' | 'trade';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    priceAlerts: true,
    yieldAlerts: true,
    portfolioAlerts: true,
    newsAlerts: false,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      symbol: 'BTC',
      condition: 'above',
      price: 45000,
      active: true,
      created: new Date()
    },
    {
      id: '2',
      symbol: 'ETH',
      condition: 'below',
      price: 2500,
      active: true,
      created: new Date()
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'price',
      title: 'Price Alert Triggered',
      message: 'Bitcoin has reached $43,250 (+2.34%)',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      urgent: false
    },
    {
      id: '2',
      type: 'yield',
      title: 'High Yield Opportunity',
      message: 'New yield farm offering 45% APY on Polygon',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      urgent: true
    },
    {
      id: '3',
      type: 'portfolio',
      title: 'Portfolio Update',
      message: 'Your portfolio is up 12.3% this week',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      urgent: false
    }
  ]);

  const [permission, setPermission] = useState<NotificationPermission>('default');

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  const sendBrowserNotification = useCallback((title: string, message: string, urgent = false) => {
    if (permission === 'granted' && settings.pushNotifications) {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: urgent ? 'urgent' : 'normal',
        requireInteraction: urgent
      });

      // Auto-close after 5 seconds for non-urgent notifications
      if (!urgent) {
        setTimeout(() => notification.close(), 5000);
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [permission, settings.pushNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications

    // Send browser notification
    sendBrowserNotification(notification.title, notification.message, notification.urgent);

    return newNotification.id;
  }, [sendBrowserNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addPriceAlert = useCallback((symbol: string, condition: 'above' | 'below', price: number) => {
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      condition,
      price,
      active: true,
      created: new Date()
    };

    setAlerts(prev => [...prev, newAlert]);
    return newAlert.id;
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getUrgentCount = useCallback(() => {
    return notifications.filter(n => !n.read && n.urgent).length;
  }, [notifications]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const notificationTypes = [
          {
            type: 'price' as const,
            title: 'Price Movement',
            message: `${['BTC', 'ETH', 'SOL', 'ADA'][Math.floor(Math.random() * 4)]} price changed significantly`,
            urgent: false
          },
          {
            type: 'yield' as const,
            title: 'Yield Alert',
            message: 'New high-yield opportunity detected',
            urgent: true
          },
          {
            type: 'trade' as const,
            title: 'Trading Signal',
            message: 'New buy signal for AVAX',
            urgent: false
          }
        ];

        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        addNotification(randomNotification);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return {
    settings,
    alerts,
    notifications,
    permission,
    unreadCount: getUnreadCount(),
    urgentCount: getUrgentCount(),
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addPriceAlert,
    toggleAlert,
    deleteAlert,
    updateSettings,
  };
}