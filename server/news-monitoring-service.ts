import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

const HIGH_IMPACT_KEYWORDS = [
  'FOMC', 'Federal Reserve', 'Fed rate', 'interest rate decision',
  'CPI', 'inflation', 'consumer price',
  'NFP', 'nonfarm payroll', 'jobs report', 'employment',
  'SEC', 'securities exchange', 'regulation',
  'earnings', 'quarterly report', 'beat', 'miss',
  'GDP', 'recession', 'economic growth',
  'Powell', 'Yellen', 'Treasury'
];

const MEGA_CAP_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'JPM', 'V'];

interface NewsAlert {
  id: string;
  eventName: string;
  headline: string;
  impact: 'HIGH' | 'CRITICAL';
  category: 'FOMC' | 'CPI' | 'NFP' | 'EARNINGS' | 'SEC' | 'RATE_DECISION' | 'BREAKING';
  priceLevel?: number;
  ticker?: string;
  countdown?: number;
  timestamp: number;
  sweepDetected: boolean;
  sweepDirection?: 'bullish' | 'bearish';
}

interface ConnectedClient {
  ws: WebSocket;
  subscribedTickers: string[];
}

class NewsMonitoringService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private lastNewsCheck: number = 0;
  private processedNewsIds: Set<string> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private finnhubWs: WebSocket | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/news-alerts'
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      console.log(`📡 News alert client connected: ${clientId}`);

      this.clients.set(clientId, { ws, subscribedTickers: [] });

      ws.send(JSON.stringify({
        type: 'CONNECTION_STATUS',
        status: 'connected',
        message: 'Connected to News Alert System'
      }));

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'SUBSCRIBE_TICKER') {
            const client = this.clients.get(clientId);
            if (client && msg.ticker) {
              client.subscribedTickers.push(msg.ticker.toUpperCase());
            }
          }
        } catch (err) {
          console.error('Failed to parse client message:', err);
        }
      });

      ws.on('close', () => {
        console.log(`📡 News alert client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('error', (err) => {
        console.error(`WebSocket error for ${clientId}:`, err);
        this.clients.delete(clientId);
      });
    });

    this.startMonitoring();
    this.connectToFinnhubNews();
    console.log('✅ News Monitoring Service initialized with WebSocket at /ws/news-alerts');
  }

  private connectToFinnhubNews() {
    if (!FINNHUB_API_KEY) {
      console.log('⚠️ Finnhub API key not found, using polling mode only');
      return;
    }

    try {
      this.finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

      this.finnhubWs.on('open', () => {
        console.log('🔗 Connected to Finnhub WebSocket for real-time news');
        MEGA_CAP_TICKERS.forEach(ticker => {
          this.finnhubWs?.send(JSON.stringify({ type: 'subscribe', symbol: ticker }));
        });
      });

      this.finnhubWs.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'news') {
            this.processNewsItem(msg.data);
          }
        } catch (err) {
          console.error('Finnhub message parse error:', err);
        }
      });

      this.finnhubWs.on('close', () => {
        console.log('Finnhub WebSocket closed, reconnecting in 5s...');
        setTimeout(() => this.connectToFinnhubNews(), 5000);
      });

      this.finnhubWs.on('error', (err) => {
        console.error('Finnhub WebSocket error:', err);
      });
    } catch (err) {
      console.error('Failed to connect to Finnhub:', err);
    }
  }

  private startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkForHighImpactNews();
    }, 30000);

    this.checkForHighImpactNews();
  }

  private async checkForHighImpactNews() {
    try {
      const news = await this.fetchMarketNews();
      for (const item of news) {
        if (!this.processedNewsIds.has(item.id)) {
          this.processedNewsIds.add(item.id);
          const alert = this.evaluateNewsImpact(item);
          if (alert) {
            this.broadcastAlert(alert);
          }
        }
      }

      if (this.processedNewsIds.size > 1000) {
        const idsArray = Array.from(this.processedNewsIds);
        this.processedNewsIds = new Set(idsArray.slice(-500));
      }
    } catch (err) {
      console.error('News check failed:', err);
    }
  }

  private async fetchMarketNews(): Promise<any[]> {
    const results: any[] = [];

    if (FINNHUB_API_KEY) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
        );
        if (response.ok) {
          const data = await response.json();
          results.push(...data.map((item: any) => ({
            id: `finnhub_${item.id}`,
            headline: item.headline,
            summary: item.summary,
            source: item.source,
            url: item.url,
            datetime: item.datetime * 1000,
            related: item.related
          })));
        }
      } catch (err) {
        console.error('Finnhub news fetch error:', err);
      }
    }

    if (NEWSDATA_API_KEY) {
      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&category=business&language=en&q=stock%20market%20OR%20federal%20reserve%20OR%20inflation`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.results) {
            results.push(...data.results.map((item: any) => ({
              id: `newsdata_${item.article_id || item.link}`,
              headline: item.title,
              summary: item.description,
              source: item.source_id,
              url: item.link,
              datetime: new Date(item.pubDate).getTime(),
              related: ''
            })));
          }
        }
      } catch (err) {
        console.error('NewsData fetch error:', err);
      }
    }

    return results.sort((a, b) => b.datetime - a.datetime).slice(0, 50);
  }

  private processNewsItem(item: any) {
    const alert = this.evaluateNewsImpact(item);
    if (alert) {
      this.broadcastAlert(alert);
    }
  }

  private evaluateNewsImpact(item: any): NewsAlert | null {
    const text = `${item.headline || ''} ${item.summary || ''}`.toUpperCase();
    
    let impactScore = 0;
    let category: NewsAlert['category'] = 'BREAKING';
    let eventName = 'Market News';

    if (text.includes('FOMC') || text.includes('FEDERAL RESERVE') || text.includes('FED RATE')) {
      impactScore += 10;
      category = 'FOMC';
      eventName = 'FOMC / Federal Reserve';
    }

    if (text.includes('CPI') || text.includes('CONSUMER PRICE') || text.includes('INFLATION')) {
      impactScore += 9;
      category = 'CPI';
      eventName = 'CPI / Inflation Data';
    }

    if (text.includes('NFP') || text.includes('NONFARM') || text.includes('JOBS REPORT') || text.includes('EMPLOYMENT')) {
      impactScore += 9;
      category = 'NFP';
      eventName = 'NFP / Jobs Report';
    }

    if (text.includes('RATE DECISION') || text.includes('INTEREST RATE') || text.includes('BASIS POINTS')) {
      impactScore += 10;
      category = 'RATE_DECISION';
      eventName = 'Rate Decision';
    }

    if (text.includes('SEC ') || text.includes('SECURITIES EXCHANGE') || text.includes('REGULATION')) {
      impactScore += 7;
      category = 'SEC';
      eventName = 'SEC / Regulatory';
    }

    for (const ticker of MEGA_CAP_TICKERS) {
      if (text.includes(ticker) && (text.includes('EARNINGS') || text.includes('BEAT') || text.includes('MISS') || text.includes('QUARTERLY'))) {
        impactScore += 8;
        category = 'EARNINGS';
        eventName = `${ticker} Earnings`;
        break;
      }
    }

    HIGH_IMPACT_KEYWORDS.forEach(keyword => {
      if (text.includes(keyword.toUpperCase())) {
        impactScore += 1;
      }
    });

    if (impactScore >= 7) {
      const alert: NewsAlert = {
        id: `alert_${item.id || Date.now()}`,
        eventName,
        headline: item.headline || 'Breaking Market News',
        impact: impactScore >= 9 ? 'CRITICAL' : 'HIGH',
        category,
        timestamp: item.datetime || Date.now(),
        sweepDetected: false,
        ticker: item.related?.split(',')[0]
      };

      console.log(`🚨 HIGH IMPACT NEWS DETECTED: ${alert.eventName} - Score: ${impactScore}`);
      return alert;
    }

    return null;
  }

  private broadcastAlert(alert: NewsAlert) {
    const message = JSON.stringify({
      type: 'NEWS_ALERT',
      alert
    });

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(message);
        } catch (err) {
          console.error(`Failed to send alert to ${clientId}:`, err);
        }
      }
    });

    console.log(`📢 Broadcasted alert to ${this.clients.size} clients: ${alert.eventName}`);
  }

  updateSweepStatus(alertId: string, priceLevel: number, direction: 'bullish' | 'bearish') {
    const message = JSON.stringify({
      type: 'SWEEP_UPDATE',
      alertId,
      priceLevel,
      direction
    });

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  triggerManualAlert(alert: Omit<NewsAlert, 'id' | 'timestamp' | 'sweepDetected'>) {
    const fullAlert: NewsAlert = {
      ...alert,
      id: `manual_${Date.now()}`,
      timestamp: Date.now(),
      sweepDetected: false
    };
    this.broadcastAlert(fullAlert);
    return fullAlert;
  }

  triggerSweepAlert(alert: Omit<NewsAlert, 'id' | 'timestamp' | 'sweepDetected'> & { sweepDirection: 'bullish' | 'bearish' }) {
    const fullAlert: NewsAlert = {
      ...alert,
      id: `sweep_${Date.now()}`,
      timestamp: Date.now(),
      sweepDetected: true,
      sweepDirection: alert.sweepDirection
    };
    this.broadcastAlert(fullAlert);
    
    if (alert.ticker) {
      this.updateLatestTickerSweep(alert.ticker, fullAlert.id, alert.priceLevel || 0, alert.sweepDirection);
    }
    
    return fullAlert;
  }

  private updateLatestTickerSweep(ticker: string, alertId: string, priceLevel: number, direction: 'bullish' | 'bearish') {
    const message = JSON.stringify({
      type: 'SWEEP_CONFIRMED',
      ticker,
      alertId,
      priceLevel,
      direction,
      gateValidation: '7-Gate entry validation in progress'
    });

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    console.log(`✅ SWEEP_CONFIRMED broadcasted for ${ticker} at $${priceLevel} (${direction})`);
  }

  linkMacroNewsToSweep(ticker: string, priceLevel: number, direction: 'bullish' | 'bearish') {
    const message = JSON.stringify({
      type: 'SWEEP_UPDATE',
      ticker,
      priceLevel,
      direction
    });

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.finnhubWs) {
      this.finnhubWs.close();
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const newsMonitoringService = new NewsMonitoringService();
