// @ts-ignore - No type definitions available for this package
import TradingView from '@mathieuc/tradingview';

interface RealtimeQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class TradingViewRealtimeService {
  private client: any = null;
  private activeCharts: Map<string, any> = new Map();
  private priceCache: Map<string, RealtimeQuote> = new Map();
  private subscribers: Map<string, Set<(quote: RealtimeQuote) => void>> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.initClient();
  }

  private async initClient() {
    try {
      this.client = new TradingView.Client();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ TradingView WebSocket client initialized');
    } catch (error) {
      console.error('Failed to initialize TradingView client:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting to TradingView in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.initClient(), delay);
    }
  }

  private formatSymbol(symbol: string, assetClass: string = 'stocks'): string {
    const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    switch (assetClass.toLowerCase()) {
      case 'forex':
        return `FX:${cleanSymbol}`;
      case 'crypto':
        if (cleanSymbol.endsWith('USD') || cleanSymbol.endsWith('USDT')) {
          return `BINANCE:${cleanSymbol}`;
        }
        return `BINANCE:${cleanSymbol}USDT`;
      case 'futures':
        return `CME:${cleanSymbol}`;
      case 'stocks':
      default:
        return `NASDAQ:${cleanSymbol}`;
    }
  }

  async getRealtimeQuote(symbol: string, assetClass: string = 'stocks'): Promise<RealtimeQuote | null> {
    const cacheKey = `${symbol}-${assetClass}`;
    
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 1000) {
      return cached;
    }

    if (!this.client || !this.isConnected) {
      console.log('TradingView client not connected, using fallback');
      return null;
    }

    try {
      const tvSymbol = this.formatSymbol(symbol, assetClass);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Quote timeout'));
        }, 5000);

        const chart = new this.client.Session.Chart();
        chart.setMarket(tvSymbol, { timeframe: '1' });

        chart.onUpdate(() => {
          clearTimeout(timeout);
          
          const periods = chart.periods;
          if (periods && periods.length > 0) {
            const latest = periods[0];
            const prev = periods.length > 1 ? periods[1] : latest;
            
            const quote: RealtimeQuote = {
              symbol: symbol,
              price: latest.close,
              change: latest.close - prev.close,
              changePercent: ((latest.close - prev.close) / prev.close) * 100,
              volume: latest.volume || 0,
              high: latest.max,
              low: latest.min,
              open: latest.open,
              timestamp: Date.now()
            };
            
            this.priceCache.set(cacheKey, quote);
            chart.delete();
            resolve(quote);
          }
        });

        chart.onError((err: any) => {
          clearTimeout(timeout);
          chart.delete();
          reject(err);
        });
      });
    } catch (error) {
      console.error(`TradingView quote error for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalData(
    symbol: string, 
    assetClass: string = 'stocks',
    timeframe: string = '15',
    count: number = 100
  ): Promise<CandleData[]> {
    if (!this.client || !this.isConnected) {
      console.log('TradingView client not connected');
      return [];
    }

    try {
      const tvSymbol = this.formatSymbol(symbol, assetClass);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Historical data timeout'));
        }, 10000);

        const chart = new this.client.Session.Chart();
        chart.setMarket(tvSymbol, { 
          timeframe: timeframe,
          range: count
        });

        let resolved = false;
        chart.onUpdate(() => {
          if (resolved) return;
          
          const periods = chart.periods;
          if (periods && periods.length > 0) {
            clearTimeout(timeout);
            resolved = true;
            
            const candles: CandleData[] = periods.map((p: any) => ({
              time: p.time * 1000,
              open: p.open,
              high: p.max,
              low: p.min,
              close: p.close,
              volume: p.volume || 0
            })).reverse();
            
            chart.delete();
            resolve(candles);
          }
        });

        chart.onError((err: any) => {
          clearTimeout(timeout);
          chart.delete();
          reject(err);
        });
      });
    } catch (error) {
      console.error(`TradingView historical data error for ${symbol}:`, error);
      return [];
    }
  }

  subscribeToSymbol(
    symbol: string, 
    assetClass: string,
    callback: (quote: RealtimeQuote) => void
  ): () => void {
    const cacheKey = `${symbol}-${assetClass}`;
    
    if (!this.subscribers.has(cacheKey)) {
      this.subscribers.set(cacheKey, new Set());
    }
    this.subscribers.get(cacheKey)!.add(callback);

    if (!this.activeCharts.has(cacheKey) && this.client && this.isConnected) {
      try {
        const tvSymbol = this.formatSymbol(symbol, assetClass);
        const chart = new this.client.Session.Chart();
        chart.setMarket(tvSymbol, { timeframe: '1' });

        chart.onUpdate(() => {
          const periods = chart.periods;
          if (periods && periods.length > 0) {
            const latest = periods[0];
            const prev = periods.length > 1 ? periods[1] : latest;
            
            const quote: RealtimeQuote = {
              symbol: symbol,
              price: latest.close,
              change: latest.close - prev.close,
              changePercent: ((latest.close - prev.close) / prev.close) * 100,
              volume: latest.volume || 0,
              high: latest.max,
              low: latest.min,
              open: latest.open,
              timestamp: Date.now()
            };
            
            this.priceCache.set(cacheKey, quote);
            
            const subs = this.subscribers.get(cacheKey);
            if (subs) {
              subs.forEach(cb => cb(quote));
            }
          }
        });

        this.activeCharts.set(cacheKey, chart);
      } catch (error) {
        console.error(`Failed to subscribe to ${symbol}:`, error);
      }
    }

    return () => {
      const subs = this.subscribers.get(cacheKey);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          const chart = this.activeCharts.get(cacheKey);
          if (chart) {
            chart.delete();
            this.activeCharts.delete(cacheKey);
          }
          this.subscribers.delete(cacheKey);
        }
      }
    };
  }

  getCachedQuote(symbol: string, assetClass: string = 'stocks'): RealtimeQuote | null {
    return this.priceCache.get(`${symbol}-${assetClass}`) || null;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  async disconnect() {
    Array.from(this.activeCharts.entries()).forEach(([key, chart]) => {
      try {
        chart.delete();
      } catch (e) {}
    });
    this.activeCharts.clear();
    this.subscribers.clear();
    
    if (this.client) {
      try {
        this.client.end();
      } catch (e) {}
    }
    this.isConnected = false;
    console.log('TradingView WebSocket disconnected');
  }
}

export const tradingViewService = new TradingViewRealtimeService();
export type { RealtimeQuote, CandleData };
