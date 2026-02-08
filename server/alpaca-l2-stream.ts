import { Router } from 'express';
import WebSocket from 'ws';
import { orderBookManager, OrderBookSnapshot, calculateOBI, getOBIPressureLabel, getOBIColor } from './strategy/orderbook';

const router = Router();

const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

interface AlpacaL2Quote {
  T: string;
  S: string;
  bx: string;
  bp: number;
  bs: number;
  ax: string;
  ap: number;
  as: number;
  t: string;
}

interface AlpacaOrderBook {
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
}

class AlpacaL2Stream {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;
  private simulationMode = true;

  constructor() {
    if (ALPACA_API_KEY && ALPACA_SECRET_KEY) {
      this.simulationMode = false;
    }
  }

  async connect(): Promise<void> {
    if (this.simulationMode) {
      console.log('🔴 Alpaca L2 Stream: Running in simulation mode (no API keys)');
      this.startSimulation();
      return;
    }

    try {
      const wsUrl = 'wss://stream.data.alpaca.markets/v2/sip';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Alpaca L2 WebSocket connected');
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data.toString()));
      };

      this.ws.onerror = (error) => {
        console.error('Alpaca L2 WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('Alpaca L2 WebSocket closed');
        this.isConnected = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to Alpaca L2:', error);
      this.startSimulation();
    }
  }

  private authenticate(): void {
    if (!this.ws) return;
    
    this.ws.send(JSON.stringify({
      action: 'auth',
      key: ALPACA_API_KEY,
      secret: ALPACA_SECRET_KEY
    }));
  }

  private handleMessage(data: any): void {
    if (Array.isArray(data)) {
      for (const msg of data) {
        this.processMessage(msg);
      }
    } else {
      this.processMessage(data);
    }
  }

  private processMessage(msg: any): void {
    if (msg.T === 'success' && msg.msg === 'authenticated') {
      console.log('✅ Alpaca L2 authenticated');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.resubscribeAll();
    } else if (msg.T === 'q') {
      this.updateOrderBook(msg);
    }
  }

  private updateOrderBook(quote: AlpacaL2Quote): void {
    const symbol = quote.S;
    const existingSnapshot = orderBookManager.getSnapshot(symbol);
    
    const bids = existingSnapshot?.bids || [];
    const asks = existingSnapshot?.asks || [];
    
    if (quote.bp > 0 && quote.bs > 0) {
      const existingBidIdx = bids.findIndex(b => b.price === quote.bp);
      if (existingBidIdx >= 0) {
        bids[existingBidIdx].size = quote.bs;
      } else {
        bids.push({ price: quote.bp, size: quote.bs });
        bids.sort((a, b) => b.price - a.price);
        if (bids.length > 10) bids.length = 10;
      }
    }
    
    if (quote.ap > 0 && quote.as > 0) {
      const existingAskIdx = asks.findIndex(a => a.price === quote.ap);
      if (existingAskIdx >= 0) {
        asks[existingAskIdx].size = quote.as;
      } else {
        asks.push({ price: quote.ap, size: quote.as });
        asks.sort((a, b) => a.price - b.price);
        if (asks.length > 10) asks.length = 10;
      }
    }
    
    const snapshot: OrderBookSnapshot = {
      symbol,
      timestamp: Date.now(),
      bids,
      asks
    };
    
    orderBookManager.updateSnapshot(symbol, snapshot);
  }

  subscribe(symbols: string[]): void {
    symbols.forEach(s => this.subscriptions.add(s.toUpperCase()));
    
    if (this.simulationMode) {
      return;
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        quotes: symbols
      }));
    }
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach(s => this.subscriptions.delete(s.toUpperCase()));
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        quotes: symbols
      }));
    }
  }

  private resubscribeAll(): void {
    if (this.subscriptions.size > 0 && this.ws) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        quotes: Array.from(this.subscriptions)
      }));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.log('Max reconnect attempts reached, switching to simulation mode');
      this.startSimulation();
    }
  }

  private simulationInterval: NodeJS.Timeout | null = null;
  
  private startSimulation(): void {
    this.simulationMode = true;
    this.isConnected = true;
    
    const defaultSymbols = ['AAPL', 'MSFT', 'NVDA', 'AMD', 'TSLA', 'SPY', 'QQQ', 'META', 'GOOGL', 'AMZN'];
    defaultSymbols.forEach(s => this.subscriptions.add(s));
    
    this.simulationInterval = setInterval(() => {
      Array.from(this.subscriptions).forEach(symbol => {
        const basePrice = this.getSimulatedBasePrice(symbol);
        const snapshot = this.generateSimulatedOrderBook(symbol, basePrice);
        orderBookManager.updateSnapshot(symbol, snapshot);
      });
    }, 500);
  }

  private getSimulatedBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'AAPL': 260, 'MSFT': 420, 'NVDA': 140, 'AMD': 125, 'TSLA': 400,
      'SPY': 600, 'QQQ': 530, 'META': 620, 'GOOGL': 195, 'AMZN': 230,
      'BITF': 3.5, 'NIO': 4.2
    };
    return prices[symbol] || 100;
  }

  private generateSimulatedOrderBook(symbol: string, basePrice: number): OrderBookSnapshot {
    const spread = basePrice * 0.0005;
    const bids: Array<{ price: number; size: number }> = [];
    const asks: Array<{ price: number; size: number }> = [];
    
    const bidBias = Math.random();
    const askBias = 1 - bidBias;
    
    for (let i = 0; i < 5; i++) {
      const bidPrice = basePrice - spread * (i + 1) - (Math.random() * 0.01);
      const askPrice = basePrice + spread * (i + 1) + (Math.random() * 0.01);
      
      const bidSize = Math.floor(100 + Math.random() * 500 * (1 + bidBias));
      const askSize = Math.floor(100 + Math.random() * 500 * (1 + askBias));
      
      bids.push({ price: Math.round(bidPrice * 100) / 100, size: bidSize });
      asks.push({ price: Math.round(askPrice * 100) / 100, size: askSize });
    }
    
    return {
      symbol,
      timestamp: Date.now(),
      bids,
      asks
    };
  }

  disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getStatus(): { connected: boolean; mode: string; symbols: string[] } {
    return {
      connected: this.isConnected,
      mode: this.simulationMode ? 'simulation' : 'live',
      symbols: Array.from(this.subscriptions)
    };
  }
}

export const alpacaL2Stream = new AlpacaL2Stream();

alpacaL2Stream.connect().catch(console.error);

router.get('/status', (req, res) => {
  res.json({
    service: 'Alpaca L2 Order Book Stream',
    ...alpacaL2Stream.getStatus(),
    message: alpacaL2Stream.getStatus().mode === 'simulation' 
      ? 'Running simulated L2 data - Add ALPACA_API_KEY and ALPACA_SECRET_KEY for live data'
      : 'Connected to Alpaca L2 WebSocket'
  });
});

router.post('/subscribe', (req, res) => {
  const { symbols } = req.body;
  if (!symbols || !Array.isArray(symbols)) {
    return res.status(400).json({ error: 'symbols array required' });
  }
  
  alpacaL2Stream.subscribe(symbols);
  res.json({ success: true, subscribed: symbols });
});

router.post('/unsubscribe', (req, res) => {
  const { symbols } = req.body;
  if (!symbols || !Array.isArray(symbols)) {
    return res.status(400).json({ error: 'symbols array required' });
  }
  
  alpacaL2Stream.unsubscribe(symbols);
  res.json({ success: true, unsubscribed: symbols });
});

router.get('/obi/:symbol', (req, res) => {
  const { symbol } = req.params;
  const levels = parseInt(req.query.levels as string) || 5;
  
  const obi = orderBookManager.getOBI(symbol, levels);
  
  if (!obi) {
    alpacaL2Stream.subscribe([symbol]);
    return res.status(404).json({ 
      error: 'Order book not available yet',
      message: `Subscribed to ${symbol}, try again in 1 second`
    });
  }
  
  res.json({
    success: true,
    symbol: symbol.toUpperCase(),
    obi: obi.obi,
    pressure: obi.pressure,
    strength: obi.strength,
    label: getOBIPressureLabel(obi.obi),
    color: getOBIColor(obi.obi),
    passedGate8: obi.passedGate,
    threshold: obi.threshold,
    details: {
      totalBidQty: obi.totalBidQty,
      totalAskQty: obi.totalAskQty,
      bidLevels: obi.bidLevels,
      askLevels: obi.askLevels
    }
  });
});

router.get('/orderbook/:symbol', (req, res) => {
  const { symbol } = req.params;
  const snapshot = orderBookManager.getSnapshot(symbol);
  
  if (!snapshot) {
    alpacaL2Stream.subscribe([symbol]);
    return res.status(404).json({ 
      error: 'Order book not available yet',
      message: `Subscribed to ${symbol}, try again in 1 second`
    });
  }
  
  const obi = calculateOBI(snapshot);
  
  res.json({
    success: true,
    symbol: symbol.toUpperCase(),
    timestamp: snapshot.timestamp,
    bids: snapshot.bids.slice(0, 5),
    asks: snapshot.asks.slice(0, 5),
    obi: {
      value: obi.obi,
      pressure: obi.pressure,
      label: getOBIPressureLabel(obi.obi),
      passedGate8: obi.passedGate
    }
  });
});

router.get('/pressure/:symbol', (req, res) => {
  const { symbol } = req.params;
  const obi = orderBookManager.getOBI(symbol);
  
  if (!obi) {
    return res.json({
      symbol: symbol.toUpperCase(),
      obi: 0,
      pressure: 'unknown',
      message: 'No L2 data available',
      color: 'yellow',
      passedGate8: false
    });
  }
  
  res.json({
    symbol: symbol.toUpperCase(),
    obi: obi.obi,
    pressure: obi.pressure,
    strength: obi.strength,
    label: getOBIPressureLabel(obi.obi),
    color: getOBIColor(obi.obi),
    passedGate8: obi.passedGate,
    threshold: '>0.60 for LONG, <-0.60 for SHORT'
  });
});

export default router;
