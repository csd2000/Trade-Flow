export interface OrderBookLevel {
  price: number;
  size: number;
  orders?: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface OBIResult {
  obi: number;
  pressure: 'bullish' | 'bearish' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
  totalBidQty: number;
  totalAskQty: number;
  bidLevels: number;
  askLevels: number;
  isValid: boolean;
  threshold: number;
  passedGate: boolean;
}

export function calculateOBI(snapshot: OrderBookSnapshot, topLevels: number = 5): OBIResult {
  const bids = snapshot.bids.slice(0, topLevels);
  const asks = snapshot.asks.slice(0, topLevels);
  
  const totalBidQty = bids.reduce((sum, b) => sum + b.size, 0);
  const totalAskQty = asks.reduce((sum, a) => sum + a.size, 0);
  
  const totalQty = totalBidQty + totalAskQty;
  
  if (totalQty === 0) {
    return {
      obi: 0,
      pressure: 'neutral',
      strength: 'weak',
      totalBidQty: 0,
      totalAskQty: 0,
      bidLevels: 0,
      askLevels: 0,
      isValid: false,
      threshold: 0.60,
      passedGate: false
    };
  }
  
  const obi = (totalBidQty - totalAskQty) / totalQty;
  
  let pressure: 'bullish' | 'bearish' | 'neutral';
  let strength: 'strong' | 'moderate' | 'weak';
  let passedGate = false;
  
  if (obi > 0.60) {
    pressure = 'bullish';
    strength = 'strong';
    passedGate = true;
  } else if (obi > 0.30) {
    pressure = 'bullish';
    strength = 'moderate';
  } else if (obi < -0.60) {
    pressure = 'bearish';
    strength = 'strong';
    passedGate = true;
  } else if (obi < -0.30) {
    pressure = 'bearish';
    strength = 'moderate';
  } else {
    pressure = 'neutral';
    strength = 'weak';
  }
  
  return {
    obi: Math.round(obi * 1000) / 1000,
    pressure,
    strength,
    totalBidQty,
    totalAskQty,
    bidLevels: bids.length,
    askLevels: asks.length,
    isValid: true,
    threshold: 0.60,
    passedGate
  };
}

export function getOBIPressureLabel(obi: number): string {
  if (obi > 0.80) return 'EXTREME BUY PRESSURE - Whales stacking bids';
  if (obi > 0.60) return 'STRONG BUY PRESSURE - Green light for longs';
  if (obi > 0.30) return 'MODERATE BUY PRESSURE - Accumulation zone';
  if (obi > 0.10) return 'SLIGHT BUY PRESSURE - Minor bid advantage';
  if (obi < -0.80) return 'EXTREME SELL PRESSURE - Whales stacking asks';
  if (obi < -0.60) return 'STRONG SELL PRESSURE - Green light for shorts';
  if (obi < -0.30) return 'MODERATE SELL PRESSURE - Distribution zone';
  if (obi < -0.10) return 'SLIGHT SELL PRESSURE - Minor ask advantage';
  return 'NEUTRAL - Balanced order book';
}

export function getOBIColor(obi: number): 'green' | 'red' | 'yellow' {
  if (obi > 0.60) return 'green';
  if (obi < -0.60) return 'red';
  return 'yellow';
}

export class OrderBookManager {
  private snapshots: Map<string, OrderBookSnapshot> = new Map();
  private obiCache: Map<string, { result: OBIResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000;
  
  updateSnapshot(symbol: string, snapshot: OrderBookSnapshot): void {
    this.snapshots.set(symbol.toUpperCase(), snapshot);
    this.obiCache.delete(symbol.toUpperCase());
  }
  
  getSnapshot(symbol: string): OrderBookSnapshot | null {
    return this.snapshots.get(symbol.toUpperCase()) || null;
  }
  
  getOBI(symbol: string, topLevels: number = 5): OBIResult | null {
    const upper = symbol.toUpperCase();
    
    const cached = this.obiCache.get(upper);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    
    const snapshot = this.snapshots.get(upper);
    if (!snapshot) {
      return null;
    }
    
    const result = calculateOBI(snapshot, topLevels);
    this.obiCache.set(upper, { result, timestamp: Date.now() });
    
    return result;
  }
  
  hasValidData(symbol: string, maxAge: number = 5000): boolean {
    const snapshot = this.snapshots.get(symbol.toUpperCase());
    if (!snapshot) return false;
    return Date.now() - snapshot.timestamp < maxAge;
  }
  
  getSymbols(): string[] {
    return Array.from(this.snapshots.keys());
  }
  
  clear(): void {
    this.snapshots.clear();
    this.obiCache.clear();
  }
}

export const orderBookManager = new OrderBookManager();
