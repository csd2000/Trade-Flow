import WebSocket from 'ws';
import type { Candle } from './zero-lag-indicators';

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  bidDepth: number;
  askDepth: number;
  imbalance: number;
  trueDelta: number;
}

export interface TradeData {
  symbol: string;
  price: number;
  quantity: number;
  isBuyerMaker: boolean;
  timestamp: number;
}

export interface AggregatedTrade {
  symbol: string;
  buyVolume: number;
  sellVolume: number;
  trueDelta: number;
  vwap: number;
  trades: number;
  lastUpdate: number;
}

interface StreamSubscription {
  ws: WebSocket | null;
  symbol: string;
  type: 'kline' | 'depth' | 'trade' | 'aggTrade';
  interval?: string;
  callbacks: Set<(data: any) => void>;
  lastData: any;
  reconnectAttempts: number;
  isConnecting: boolean;
}

class RealtimeStreamingService {
  private subscriptions: Map<string, StreamSubscription> = new Map();
  private orderBooks: Map<string, OrderBookSnapshot> = new Map();
  private aggregatedTrades: Map<string, AggregatedTrade> = new Map();
  private candleBuilders: Map<string, Candle[]> = new Map();
  private readonly MAX_CANDLES = 200;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

  private getStreamKey(symbol: string, type: string, interval?: string): string {
    return `${symbol.toLowerCase()}_${type}${interval ? `_${interval}` : ''}`;
  }

  subscribeToKline(
    symbol: string, 
    interval: string = '1m',
    callback: (candle: Candle) => void
  ): () => void {
    const streamKey = this.getStreamKey(symbol, 'kline', interval);
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    
    return this.subscribe(streamKey, streamName, 'kline', symbol, (data) => {
      if (data.k) {
        const candle: Candle = {
          time: data.k.t,
          open: parseFloat(data.k.o),
          high: parseFloat(data.k.h),
          low: parseFloat(data.k.l),
          close: parseFloat(data.k.c),
          volume: parseFloat(data.k.v)
        };
        
        this.updateCandleBuilder(streamKey, candle, data.k.x);
        callback(candle);
      }
    }, interval);
  }

  subscribeToOrderBook(
    symbol: string,
    depth: number = 20,
    callback: (orderBook: OrderBookSnapshot) => void
  ): () => void {
    const streamKey = this.getStreamKey(symbol, 'depth');
    const streamName = `${symbol.toLowerCase()}@depth${depth}@100ms`;
    
    return this.subscribe(streamKey, streamName, 'depth', symbol, (data) => {
      const orderBook = this.processOrderBook(symbol, data);
      this.orderBooks.set(symbol.toUpperCase(), orderBook);
      callback(orderBook);
    });
  }

  subscribeToTrades(
    symbol: string,
    callback: (trade: TradeData) => void
  ): () => void {
    const streamKey = this.getStreamKey(symbol, 'aggTrade');
    const streamName = `${symbol.toLowerCase()}@aggTrade`;
    
    return this.subscribe(streamKey, streamName, 'aggTrade', symbol, (data) => {
      const trade: TradeData = {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data.p),
        quantity: parseFloat(data.q),
        isBuyerMaker: data.m,
        timestamp: data.T
      };
      
      this.updateAggregatedTrades(symbol, trade);
      callback(trade);
    });
  }

  private subscribe(
    streamKey: string,
    streamName: string,
    type: 'kline' | 'depth' | 'trade' | 'aggTrade',
    symbol: string,
    callback: (data: any) => void,
    interval?: string
  ): () => void {
    let subscription = this.subscriptions.get(streamKey);
    
    if (!subscription) {
      subscription = {
        ws: null,
        symbol,
        type,
        interval,
        callbacks: new Set(),
        lastData: null,
        reconnectAttempts: 0,
        isConnecting: false
      };
      this.subscriptions.set(streamKey, subscription);
    }
    
    subscription.callbacks.add(callback);
    
    if (!subscription.ws && !subscription.isConnecting) {
      this.connect(streamKey, streamName);
    }
    
    return () => {
      subscription!.callbacks.delete(callback);
      if (subscription!.callbacks.size === 0) {
        this.unsubscribe(streamKey);
      }
    };
  }

  private connect(streamKey: string, streamName: string): void {
    const subscription = this.subscriptions.get(streamKey);
    if (!subscription || subscription.isConnecting) return;
    
    subscription.isConnecting = true;
    
    try {
      const ws = new WebSocket(`${this.BINANCE_WS_BASE}/${streamName}`);
      
      ws.on('open', () => {
        console.log(`[RealtimeStream] Connected: ${streamKey}`);
        subscription.reconnectAttempts = 0;
        subscription.isConnecting = false;
      });
      
      ws.on('message', (data: WebSocket.Data) => {
        try {
          const parsed = JSON.parse(data.toString());
          subscription.lastData = parsed;
          subscription.callbacks.forEach(cb => cb(parsed));
        } catch (e) {
          console.error(`[RealtimeStream] Parse error: ${streamKey}`, e);
        }
      });
      
      ws.on('error', (error) => {
        console.error(`[RealtimeStream] Error: ${streamKey}`, error.message);
      });
      
      ws.on('close', () => {
        console.log(`[RealtimeStream] Disconnected: ${streamKey}`);
        subscription.ws = null;
        subscription.isConnecting = false;
        
        if (subscription.callbacks.size > 0 && 
            subscription.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          subscription.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, subscription.reconnectAttempts), 30000);
          setTimeout(() => this.connect(streamKey, streamName), delay);
        }
      });
      
      subscription.ws = ws;
    } catch (e) {
      console.error(`[RealtimeStream] Connection failed: ${streamKey}`, e);
      subscription.isConnecting = false;
    }
  }

  private unsubscribe(streamKey: string): void {
    const subscription = this.subscriptions.get(streamKey);
    if (subscription) {
      if (subscription.ws) {
        subscription.ws.close();
      }
      this.subscriptions.delete(streamKey);
    }
  }

  private processOrderBook(symbol: string, data: any): OrderBookSnapshot {
    const bids: OrderBookLevel[] = (data.bids || data.b || []).map((b: string[]) => ({
      price: parseFloat(b[0]),
      quantity: parseFloat(b[1])
    }));
    
    const asks: OrderBookLevel[] = (data.asks || data.a || []).map((a: string[]) => ({
      price: parseFloat(a[0]),
      quantity: parseFloat(a[1])
    }));
    
    const bestBid = bids.length > 0 ? bids[0].price : 0;
    const bestAsk = asks.length > 0 ? asks[0].price : 0;
    const spread = bestAsk - bestBid;
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;
    
    const bidDepth = bids.reduce((sum, b) => sum + b.quantity * b.price, 0);
    const askDepth = asks.reduce((sum, a) => sum + a.quantity * a.price, 0);
    
    const totalDepth = bidDepth + askDepth;
    const imbalance = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0;
    
    const aggTrade = this.aggregatedTrades.get(symbol.toUpperCase());
    const trueDelta = aggTrade ? aggTrade.trueDelta : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      timestamp: Date.now(),
      bids,
      asks,
      bestBid,
      bestAsk,
      spread,
      spreadPercent,
      bidDepth,
      askDepth,
      imbalance,
      trueDelta
    };
  }

  private updateAggregatedTrades(symbol: string, trade: TradeData): void {
    const key = symbol.toUpperCase();
    let agg = this.aggregatedTrades.get(key);
    
    if (!agg) {
      agg = {
        symbol: key,
        buyVolume: 0,
        sellVolume: 0,
        trueDelta: 0,
        vwap: 0,
        trades: 0,
        lastUpdate: Date.now()
      };
      this.aggregatedTrades.set(key, agg);
    }
    
    const now = Date.now();
    if (now - agg.lastUpdate > 60000) {
      agg.buyVolume = 0;
      agg.sellVolume = 0;
      agg.trueDelta = 0;
      agg.vwap = 0;
      agg.trades = 0;
    }
    
    const tradeValue = trade.price * trade.quantity;
    
    if (trade.isBuyerMaker) {
      agg.sellVolume += tradeValue;
    } else {
      agg.buyVolume += tradeValue;
    }
    
    agg.trueDelta = agg.buyVolume - agg.sellVolume;
    agg.trades++;
    agg.lastUpdate = now;
    
    const totalVolume = agg.buyVolume + agg.sellVolume;
    if (totalVolume > 0 && agg.trades > 0) {
      agg.vwap = (agg.vwap * (agg.trades - 1) + trade.price) / agg.trades;
    }
  }

  private updateCandleBuilder(streamKey: string, candle: Candle, isClosed: boolean): void {
    let candles = this.candleBuilders.get(streamKey);
    
    if (!candles) {
      candles = [];
      this.candleBuilders.set(streamKey, candles);
    }
    
    if (isClosed) {
      candles.push(candle);
      if (candles.length > this.MAX_CANDLES) {
        candles.shift();
      }
    } else if (candles.length > 0) {
      candles[candles.length - 1] = candle;
    } else {
      candles.push(candle);
    }
  }

  getOrderBook(symbol: string): OrderBookSnapshot | null {
    return this.orderBooks.get(symbol.toUpperCase()) || null;
  }

  getAggregatedTrades(symbol: string): AggregatedTrade | null {
    return this.aggregatedTrades.get(symbol.toUpperCase()) || null;
  }

  getCandles(symbol: string, interval: string = '1m'): Candle[] {
    const streamKey = this.getStreamKey(symbol, 'kline', interval);
    return this.candleBuilders.get(streamKey) || [];
  }

  getActiveStreams(): string[] {
    return Array.from(this.subscriptions.keys()).filter(key => {
      const sub = this.subscriptions.get(key);
      return sub && sub.ws && sub.ws.readyState === WebSocket.OPEN;
    });
  }

  closeAll(): void {
    this.subscriptions.forEach((sub, key) => {
      if (sub.ws) {
        sub.ws.close();
      }
    });
    this.subscriptions.clear();
    this.orderBooks.clear();
    this.aggregatedTrades.clear();
    this.candleBuilders.clear();
  }
}

export const realtimeStreamingService = new RealtimeStreamingService();

export async function fetchBinanceOrderBook(symbol: string, limit: number = 20): Promise<OrderBookSnapshot | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=${limit}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const bids: OrderBookLevel[] = data.bids.map((b: string[]) => ({
      price: parseFloat(b[0]),
      quantity: parseFloat(b[1])
    }));
    
    const asks: OrderBookLevel[] = data.asks.map((a: string[]) => ({
      price: parseFloat(a[0]),
      quantity: parseFloat(a[1])
    }));
    
    const bestBid = bids.length > 0 ? bids[0].price : 0;
    const bestAsk = asks.length > 0 ? asks[0].price : 0;
    const spread = bestAsk - bestBid;
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;
    
    const bidDepth = bids.reduce((sum, b) => sum + b.quantity * b.price, 0);
    const askDepth = asks.reduce((sum, a) => sum + a.quantity * a.price, 0);
    
    const totalDepth = bidDepth + askDepth;
    const imbalance = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      timestamp: Date.now(),
      bids,
      asks,
      bestBid,
      bestAsk,
      spread,
      spreadPercent,
      bidDepth,
      askDepth,
      imbalance,
      trueDelta: 0
    };
  } catch (e) {
    console.error(`[OrderBook] Fetch failed for ${symbol}:`, e);
    return null;
  }
}

export async function fetchBinanceRecentTrades(symbol: string, limit: number = 100): Promise<AggregatedTrade | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol.toUpperCase()}&limit=${limit}`
    );
    
    if (!response.ok) return null;
    
    const trades = await response.json();
    
    let buyVolume = 0;
    let sellVolume = 0;
    let totalPrice = 0;
    
    for (const trade of trades) {
      const value = parseFloat(trade.price) * parseFloat(trade.qty);
      if (trade.isBuyerMaker) {
        sellVolume += value;
      } else {
        buyVolume += value;
      }
      totalPrice += parseFloat(trade.price);
    }
    
    return {
      symbol: symbol.toUpperCase(),
      buyVolume,
      sellVolume,
      trueDelta: buyVolume - sellVolume,
      vwap: trades.length > 0 ? totalPrice / trades.length : 0,
      trades: trades.length,
      lastUpdate: Date.now()
    };
  } catch (e) {
    console.error(`[Trades] Fetch failed for ${symbol}:`, e);
    return null;
  }
}
