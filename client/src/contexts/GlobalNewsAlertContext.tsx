import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface NewsAlert {
  id: string;
  eventName: string;
  headline: string;
  impact: 'HIGH' | 'CRITICAL';
  category: 'FOMC' | 'CPI' | 'NFP' | 'EARNINGS' | 'SEC' | 'RATE_DECISION' | 'BREAKING';
  priceLevel?: number;
  ticker?: string;
  countdown?: number;
  timestamp: number;
  acknowledged: boolean;
  sweepDetected: boolean;
  sweepDirection?: 'bullish' | 'bearish';
}

interface GlobalNewsAlertContextValue {
  activeAlerts: NewsAlert[];
  currentAlert: NewsAlert | null;
  showOverlay: boolean;
  acknowledgeAlert: (alertId: string) => void;
  dismissAllAlerts: () => void;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const GlobalNewsAlertContext = createContext<GlobalNewsAlertContextValue | undefined>(undefined);

const HIGH_IMPACT_KEYWORDS = ['FOMC', 'CPI', 'NFP', 'SEC', 'EARNINGS', 'RATE', 'FED', 'POWELL', 'INFLATION', 'JOBS'];

export function GlobalNewsAlertProvider({ children }: { children: ReactNode }) {
  const [activeAlerts, setActiveAlerts] = useState<NewsAlert[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const currentAlert = activeAlerts.find(a => !a.acknowledged) || null;

  useEffect(() => {
    if (currentAlert && !currentAlert.acknowledged) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [currentAlert]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/news-alerts`;
    
    let reconnectTimeout: NodeJS.Timeout;
    let socket: WebSocket;

    const connect = () => {
      setConnectionStatus('connecting');
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('News Alert WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'NEWS_ALERT' && data.alert) {
            const alert: NewsAlert = {
              id: data.alert.id || `alert_${Date.now()}`,
              eventName: data.alert.eventName,
              headline: data.alert.headline,
              impact: data.alert.impact,
              category: data.alert.category,
              priceLevel: data.alert.priceLevel,
              ticker: data.alert.ticker,
              countdown: data.alert.countdown,
              timestamp: data.alert.timestamp || Date.now(),
              acknowledged: false,
              sweepDetected: data.alert.sweepDetected || false,
              sweepDirection: data.alert.sweepDirection
            };

            setActiveAlerts(prev => {
              if (prev.some(a => a.id === alert.id)) return prev;
              return [alert, ...prev].slice(0, 10);
            });
          }

          if (data.type === 'SWEEP_UPDATE' && data.alertId) {
            setActiveAlerts(prev => prev.map(a => 
              a.id === data.alertId 
                ? { ...a, sweepDetected: true, sweepDirection: data.direction, priceLevel: data.priceLevel }
                : a
            ));
          }

          if (data.type === 'SWEEP_CONFIRMED' && data.ticker) {
            setActiveAlerts(prev => {
              const tickerAlerts = prev.filter(a => a.ticker === data.ticker && !a.acknowledged);
              if (tickerAlerts.length > 0) {
                return prev.map(a => 
                  a.ticker === data.ticker && !a.acknowledged
                    ? { ...a, sweepDetected: true, sweepDirection: data.direction, priceLevel: data.priceLevel }
                    : a
                );
              }
              return prev;
            });
          }

          if (data.type === 'CONNECTION_STATUS') {
            setConnectionStatus(data.status);
          }
        } catch (err) {
          console.error('Failed to parse news alert:', err);
        }
      };

      socket.onclose = () => {
        console.log('News Alert WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = () => {
        setConnectionStatus('error');
      };

      setWs(socket);
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setActiveAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  const dismissAllAlerts = useCallback(() => {
    setActiveAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    setShowOverlay(false);
  }, []);

  return (
    <GlobalNewsAlertContext.Provider value={{
      activeAlerts,
      currentAlert,
      showOverlay,
      acknowledgeAlert,
      dismissAllAlerts,
      isConnected,
      connectionStatus
    }}>
      {children}
    </GlobalNewsAlertContext.Provider>
  );
}

export function useGlobalNewsAlert() {
  const context = useContext(GlobalNewsAlertContext);
  if (!context) {
    throw new Error('useGlobalNewsAlert must be used within GlobalNewsAlertProvider');
  }
  return context;
}
