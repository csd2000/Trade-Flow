import WebSocket from 'ws';

interface RealTimeQuote {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

interface TradeData {
  s: string;
  p: number;
  v: number;
  t: number;
  c?: string[];
}

class RealTimeDataService {
  private ws: WebSocket | null = null;
  private quotes: Map<string, RealTimeQuote> = new Map();
  private subscribers: Set<string> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private readonly apiKey = process.env.FINNHUB_API_KEY;

  constructor() {
    if (this.apiKey) {
      this.connect();
    } else {
      console.log('⚠️ FINNHUB_API_KEY not set - real-time data unavailable');
    }
  }

  private connect() {
    if (!this.apiKey) return;

    try {
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

      this.ws.on('open', () => {
        console.log('✅ Finnhub real-time WebSocket connected');
        this.isConnected = true;
        this.subscribers.forEach(symbol => this.subscribeSymbol(symbol));
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'trade' && message.data) {
            message.data.forEach((trade: TradeData) => {
              const existing = this.quotes.get(trade.s);
              const prevPrice = existing?.price || trade.p;
              const change = trade.p - prevPrice;
              const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
              
              this.quotes.set(trade.s, {
                symbol: trade.s,
                price: trade.p,
                timestamp: trade.t,
                volume: trade.v,
                change: change,
                changePercent: changePercent
              });
            });
          }
        } catch (e) {
          console.error('Finnhub WS parse error:', e);
        }
      });

      this.ws.on('close', () => {
        console.log('⚠️ Finnhub WebSocket disconnected, reconnecting...');
        this.isConnected = false;
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('Finnhub WebSocket error:', err.message);
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Failed to connect Finnhub WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private subscribeSymbol(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  subscribe(symbols: string[]) {
    symbols.forEach(symbol => {
      const formatted = this.formatSymbol(symbol);
      this.subscribers.add(formatted);
      if (this.isConnected) {
        this.subscribeSymbol(formatted);
      }
    });
  }

  private formatSymbol(symbol: string): string {
    if (symbol.includes('-USD')) {
      return `BINANCE:${symbol.replace('-USD', 'USDT')}`;
    }
    if (symbol.includes('=F')) {
      return symbol.replace('=F', '');
    }
    if (symbol.startsWith('^')) {
      return symbol;
    }
    return symbol;
  }

  getQuote(symbol: string): RealTimeQuote | null {
    const formatted = this.formatSymbol(symbol);
    return this.quotes.get(formatted) || null;
  }

  async fetchLiveQuote(symbol: string): Promise<RealTimeQuote | null> {
    if (!this.apiKey) return null;

    try {
      const formatted = symbol.replace('-USD', '').replace('=F', '').replace('^', '');
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${formatted}&token=${this.apiKey}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.c > 0) {
        return {
          symbol,
          price: data.c,
          timestamp: Date.now(),
          change: data.d,
          changePercent: data.dp
        };
      }
    } catch (error) {
      console.error(`Finnhub quote error for ${symbol}:`, error);
    }
    return null;
  }

  async fetchMultipleQuotes(symbols: string[]): Promise<Map<string, RealTimeQuote>> {
    const results = new Map<string, RealTimeQuote>();
    
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(async symbol => {
        const cached = this.quotes.get(this.formatSymbol(symbol));
        if (cached && Date.now() - cached.timestamp < 2000) {
          return { symbol, quote: cached };
        }
        const quote = await this.fetchLiveQuote(symbol);
        return { symbol, quote };
      });
      
      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ symbol, quote }) => {
        if (quote) results.set(symbol, quote);
      });
    }
    
    return results;
  }

  getStatus(): { connected: boolean; subscribedCount: number; quotesCount: number } {
    return {
      connected: this.isConnected,
      subscribedCount: this.subscribers.size,
      quotesCount: this.quotes.size
    };
  }

  getAllCachedQuotes(): Map<string, RealTimeQuote> {
    return new Map(this.quotes);
  }
}

export const realTimeDataService = new RealTimeDataService();
