import Anthropic from '@anthropic-ai/sdk';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ScalpingIndicators {
  rsi9: number;
  rsi9Prev: number;
  macdHist: number;
  macdHistPrev: number;
  ema9: number;
  ema20: number;
  ema21: number;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;
  bollingerStdDev: number;
  atr: number;
  atrPrev: number;
  atrTrending: boolean;
  stochK: number;
  stochKPrev: number;
  stochD: number;
  stochDPrev: number;
  volumeDelta: number;
  currentVolume: number;
  avgVolume20: number;
  hullMA: number;
  hullMAPrev: number;
  zlema: number;
  zlemaPrev: number;
}

interface LiquiditySweep {
  type: 'bullish' | 'bearish';
  levelType: string;
  sweepPrice: number;
  reclaimPrice: number;
  quality: number;
  time: number;
}

interface SwingPoint {
  price: number;
  time: number;
  type: 'high' | 'low';
}

interface FairValueGap {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  midpoint: number;
  strength: number;
  filled: boolean;
}

interface StructuralLevel {
  type: 'support' | 'resistance';
  price: number;
  strength: number;
  touches: number;
}

interface SentimentData {
  score: number;
  classification: 'euphoric' | 'bullish' | 'neutral' | 'bearish' | 'panic';
  fearGreedIndex: number;
  newsImpact: string | null;
}

interface PivotPoints {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

interface GSRData {
  currentRatio: number;
  fiveDayMean: number;
  deviation: number;
  deviationPercent: number;
  signal: 'BUY_SILVER' | 'BUY_GOLD' | 'NEUTRAL';
  reasoning: string;
}

export interface ScalpingSignal {
  asset: string;
  signal: 'STRONG BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG SELL';
  uiCommand: 'ACTION_FLASH_BUY' | 'ACTION_FLASH_SELL' | 'ACTION_WAIT' | 'ACTION_CLOSE_NOW';
  signalStrength: number;
  confidence: number;
  timing: string;
  entryPrice: number;
  exitTarget: number;
  exitTarget2: number;
  stopLoss: number;
  reasoning: string[];
  indicators: ScalpingIndicators;
  fvgs: FairValueGap[];
  structuralLevels: StructuralLevel[];
  sentiment: SentimentData;
  conditionsMet: {
    momentum: boolean;
    structure: boolean;
    volatility: boolean;
    sentiment: boolean;
    total: number;
  };
  tripleThrust: {
    emaCross: boolean;
    stochastic: boolean;
    atrTrending: boolean;
    passed: boolean;
  };
  liquiditySweeps: LiquiditySweep[];
  multiTimeframeTrend: {
    aligned: boolean;
    direction: 'bullish' | 'bearish' | 'mixed';
    strength: number;
  };
  pivotPoints?: PivotPoints;
  gsrData?: GSRData;
  isPreciousMetal?: boolean;
  stochRsi?: number;
  trendStrength: {
    score: number;
    isBullish: boolean;
    slope: number;
    expanding: boolean;
    bars: number;
    dominantFactor: string;
    components: { direction: number; momentum: number; volatility: number; confirmation: number };
  };
  timeframe: '1m' | '5m' | '15m' | '30m';
  timestamp: string;
  expiresAt: string;
  lifespan: number;
}

export class ScalpingService {
  private anthropic: Anthropic | null = null;
  private gsrHistory: number[] = [];
  private lastGoldPrice: number = 0;
  private lastSilverPrice: number = 0;
  private mtfCache: Map<string, { data: { aligned: boolean; direction: 'bullish' | 'bearish' | 'mixed'; strength: number }; timestamp: number }> = new Map();
  private readonly MTF_CACHE_TTL = 5000;
  private candleCache: Map<string, { candles: CandleData[]; timestamp: number }> = new Map();
  private readonly CANDLE_CACHE_TTL = 5000;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  calculatePivotPoints(candles: CandleData[]): PivotPoints {
    const lastCandle = candles[candles.length - 1];
    const high = Math.max(...candles.slice(-24).map(c => c.high));
    const low = Math.min(...candles.slice(-24).map(c => c.low));
    const close = lastCandle.close;
    
    const pivot = (high + low + close) / 3;
    const r1 = (2 * pivot) - low;
    const s1 = (2 * pivot) - high;
    const r2 = pivot + (high - low);
    const s2 = pivot - (high - low);
    const r3 = high + 2 * (pivot - low);
    const s3 = low - 2 * (high - pivot);
    
    return { pivot, r1, r2, r3, s1, s2, s3 };
  }

  calculateStochRSI(closes: number[], rsiPeriod: number = 14, stochPeriod: number = 14): number {
    const rsi = this.calculateRSI(closes, rsiPeriod);
    if (rsi.length < stochPeriod) return 50;
    
    const recentRsi = rsi.slice(-stochPeriod);
    const minRsi = Math.min(...recentRsi);
    const maxRsi = Math.max(...recentRsi);
    const currentRsi = rsi[rsi.length - 1];
    
    if (maxRsi - minRsi === 0) return 50;
    return ((currentRsi - minRsi) / (maxRsi - minRsi)) * 100;
  }

  async fetchGSRData(): Promise<GSRData> {
    try {
      const [goldData, silverData] = await Promise.all([
        this.fetch5MinuteData('GC=F'),
        this.fetch5MinuteData('SI=F')
      ]);
      
      if (goldData.length === 0 || silverData.length === 0) {
        return {
          currentRatio: 80,
          fiveDayMean: 80,
          deviation: 0,
          deviationPercent: 0,
          signal: 'NEUTRAL',
          reasoning: 'Insufficient data for GSR calculation'
        };
      }
      
      this.lastGoldPrice = goldData[goldData.length - 1].close;
      this.lastSilverPrice = silverData[silverData.length - 1].close;
      const currentRatio = this.lastGoldPrice / this.lastSilverPrice;
      
      this.gsrHistory.push(currentRatio);
      if (this.gsrHistory.length > 1440) {
        this.gsrHistory = this.gsrHistory.slice(-1440);
      }
      
      const fiveDayMean = this.gsrHistory.length >= 5 
        ? this.gsrHistory.slice(-Math.min(1440, this.gsrHistory.length)).reduce((a, b) => a + b, 0) / Math.min(1440, this.gsrHistory.length)
        : currentRatio;
      
      const deviation = currentRatio - fiveDayMean;
      const deviationPercent = (deviation / fiveDayMean) * 100;
      
      let signal: GSRData['signal'] = 'NEUTRAL';
      let reasoning = '';
      
      if (deviationPercent > 2) {
        signal = 'BUY_SILVER';
        reasoning = `GSR ${deviationPercent.toFixed(2)}% above 5-day mean → Silver lagging, HIGH PROBABILITY catch-up BUY`;
      } else if (deviationPercent < -2) {
        signal = 'BUY_GOLD';
        reasoning = `GSR ${Math.abs(deviationPercent).toFixed(2)}% below 5-day mean → Gold lagging, HIGH PROBABILITY catch-up BUY`;
      } else {
        reasoning = `GSR within normal range (${deviationPercent.toFixed(2)}% deviation)`;
      }
      
      return {
        currentRatio,
        fiveDayMean,
        deviation,
        deviationPercent,
        signal,
        reasoning
      };
    } catch (error) {
      console.error('GSR calculation error:', error);
      return {
        currentRatio: 80,
        fiveDayMean: 80,
        deviation: 0,
        deviationPercent: 0,
        signal: 'NEUTRAL',
        reasoning: 'GSR calculation failed'
      };
    }
  }

  isPreciousMetalSymbol(symbol: string): boolean {
    const precious = ['GC=F', 'SI=F', 'XAUUSD', 'XAGUSD', 'GOLD', 'SILVER'];
    return precious.some(p => symbol.toUpperCase().includes(p.replace('=F', '')));
  }

  async fetch1MinuteData(symbol: string): Promise<CandleData[]> {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      const period1 = now - 86400;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=1m&includePrePost=true`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result?.timestamp) return [];
      
      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      if (!quotes) return [];
      
      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i] || 0
          });
        }
      }
      
      return candles;
    } catch (error) {
      console.error(`Error fetching 1m data for ${symbol}:`, error);
      return [];
    }
  }

  private formatSymbol(symbol: string): string {
    const forexPairs = [
      // Major Pairs
      'EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD',
      // EUR Cross Pairs
      'EURGBP', 'EURJPY', 'EURCHF', 'EURCAD', 'EURNZD',
      // GBP Cross Pairs
      'GBPAUD', 'GBPJPY',
      // Exotic Pairs
      'USDMXN', 'USDTHB', 'USDCNH'
    ];
    if (forexPairs.includes(symbol.toUpperCase())) {
      return `${symbol.toUpperCase()}=X`;
    }
    return symbol.toUpperCase();
  }

  async fetch5MinuteData(symbol: string): Promise<CandleData[]> {
    return this.fetchIntradayData(symbol, '5m', 432000);
  }

  async fetch15MinuteData(symbol: string): Promise<CandleData[]> {
    return this.fetchIntradayData(symbol, '15m', 604800); // 7 days
  }

  async fetch30MinuteData(symbol: string): Promise<CandleData[]> {
    return this.fetchIntradayData(symbol, '30m', 604800); // 7 days
  }

  private async fetchIntradayData(symbol: string, interval: string, lookbackSeconds: number): Promise<CandleData[]> {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      const period1 = now - lookbackSeconds;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result?.timestamp) return [];
      
      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      if (!quotes) return [];
      
      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i] || 0
          });
        }
      }
      
      return candles;
    } catch (error) {
      console.error(`Error fetching ${interval} data for ${symbol}:`, error);
      return [];
    }
  }

  calculateRSI(closes: number[], period: number = 9): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)));

    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)));
    }

    return rsi;
  }

  calculateEMA(closes: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += closes[i];
    }
    ema.push(sum / period);
    
    for (let i = period; i < closes.length; i++) {
      ema.push((closes[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
    }
    
    return ema;
  }

  calculateHullMA(closes: number[], period: number = 9): number[] {
    if (closes.length < period) return [closes[closes.length - 1] || 0];
    
    const halfPeriod = Math.floor(period / 2);
    const sqrtPeriod = Math.floor(Math.sqrt(period));
    
    const wmaHalf = this.calculateWMA(closes, halfPeriod);
    const wmaFull = this.calculateWMA(closes, period);
    
    const rawHull: number[] = [];
    const minLen = Math.min(wmaHalf.length, wmaFull.length);
    const offset = wmaFull.length - minLen;
    
    for (let i = 0; i < minLen; i++) {
      rawHull.push(2 * wmaHalf[wmaHalf.length - minLen + i] - wmaFull[offset + i]);
    }
    
    return this.calculateWMA(rawHull, sqrtPeriod);
  }

  calculateWMA(data: number[], period: number): number[] {
    if (data.length < period) return [data[data.length - 1] || 0];
    
    const wma: number[] = [];
    const divisor = (period * (period + 1)) / 2;
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - period + 1 + j] * (j + 1);
      }
      wma.push(sum / divisor);
    }
    
    return wma;
  }

  calculateZLEMA(closes: number[], period: number = 9): number[] {
    if (closes.length < period) return [closes[closes.length - 1] || 0];
    
    const lag = Math.floor((period - 1) / 2);
    const zlema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    const adjustedData: number[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i >= lag) {
        adjustedData.push(2 * closes[i] - closes[i - lag]);
      } else {
        adjustedData.push(closes[i]);
      }
    }
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += adjustedData[i];
    }
    zlema.push(sum / period);
    
    for (let i = period; i < adjustedData.length; i++) {
      zlema.push((adjustedData[i] - zlema[zlema.length - 1]) * multiplier + zlema[zlema.length - 1]);
    }
    
    return zlema;
  }

  detectSwingPoints(candles: CandleData[], lookback: number = 5): { highs: SwingPoint[]; lows: SwingPoint[] } {
    const highs: SwingPoint[] = [];
    const lows: SwingPoint[] = [];
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      const curr = candles[i];
      let isSwingHigh = true;
      let isSwingLow = true;
      
      for (let j = 1; j <= lookback; j++) {
        if (candles[i - j].high >= curr.high || candles[i + j].high >= curr.high) {
          isSwingHigh = false;
        }
        if (candles[i - j].low <= curr.low || candles[i + j].low <= curr.low) {
          isSwingLow = false;
        }
      }
      
      if (isSwingHigh) {
        highs.push({ price: curr.high, time: curr.timestamp, type: 'high' });
      }
      if (isSwingLow) {
        lows.push({ price: curr.low, time: curr.timestamp, type: 'low' });
      }
    }
    
    return { highs: highs.slice(-10), lows: lows.slice(-10) };
  }

  detectLiquiditySweeps(candles: CandleData[]): LiquiditySweep[] {
    const sweeps: LiquiditySweep[] = [];
    if (candles.length < 20) return sweeps;
    
    const { highs: swingHighs, lows: swingLows } = this.detectSwingPoints(candles, 3);
    const recent = candles.slice(-15);
    const currentPrice = recent[recent.length - 1].close;
    
    const periodHigh = Math.max(...candles.slice(-20).map(c => c.high));
    const periodLow = Math.min(...candles.slice(-20).map(c => c.low));
    
    const liquidityLevels = [
      { type: 'period_high', price: periodHigh },
      { type: 'period_low', price: periodLow },
      ...swingHighs.map(s => ({ type: 'swing_high', price: s.price })),
      ...swingLows.map(s => ({ type: 'swing_low', price: s.price }))
    ];
    
    for (let i = 1; i < recent.length; i++) {
      const candle = recent[i - 1];
      const nextCandle = recent[i];
      
      for (const level of liquidityLevels) {
        const isHighLevel = level.type.includes('high');
        const isLowLevel = level.type.includes('low');
        
        if (isHighLevel) {
          const wickedAbove = candle.high > level.price && candle.close < level.price;
          const reclaimed = nextCandle.close < level.price && nextCandle.close > candle.low;
          
          if (wickedAbove && reclaimed) {
            const wickSize = candle.high - Math.max(candle.open, candle.close);
            const bodySize = Math.abs(candle.close - candle.open);
            const quality = bodySize > 0 ? Math.min(wickSize / bodySize, 3) : 1;
            
            sweeps.push({
              type: 'bearish',
              levelType: level.type,
              sweepPrice: candle.high,
              reclaimPrice: nextCandle.close,
              quality: quality * (1 + (candle.high - level.price) / level.price * 100),
              time: candle.timestamp
            });
          }
        }
        
        if (isLowLevel) {
          const wickedBelow = candle.low < level.price && candle.close > level.price;
          const reclaimed = nextCandle.close > level.price && nextCandle.close < candle.high;
          
          if (wickedBelow && reclaimed) {
            const wickSize = Math.min(candle.open, candle.close) - candle.low;
            const bodySize = Math.abs(candle.close - candle.open);
            const quality = bodySize > 0 ? Math.min(wickSize / bodySize, 3) : 1;
            
            sweeps.push({
              type: 'bullish',
              levelType: level.type,
              sweepPrice: candle.low,
              reclaimPrice: nextCandle.close,
              quality: quality * (1 + (level.price - candle.low) / level.price * 100),
              time: candle.timestamp
            });
          }
        }
      }
    }
    
    return sweeps.sort((a, b) => b.time - a.time).slice(0, 5);
  }

  async checkMultiTimeframeTrend(symbol: string): Promise<{ aligned: boolean; direction: 'bullish' | 'bearish' | 'mixed'; strength: number }> {
    const cacheKey = symbol;
    const now = Date.now();
    const cached = this.mtfCache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < this.MTF_CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const [candles5m, candles15m] = await Promise.all([
        this.fetch5MinuteData(symbol),
        this.fetch15MinuteData(symbol)
      ]);
      
      if (candles5m.length < 20 || candles15m.length < 20) {
        const result = { aligned: false, direction: 'mixed' as const, strength: 50 };
        this.mtfCache.set(cacheKey, { data: result, timestamp: now });
        return result;
      }
      
      const closes5m = candles5m.map(c => c.close);
      const closes15m = candles15m.map(c => c.close);
      
      const ema9_5m = this.calculateEMA(closes5m, 9);
      const ema21_5m = this.calculateEMA(closes5m, 21);
      const ema9_15m = this.calculateEMA(closes15m, 9);
      const ema21_15m = this.calculateEMA(closes15m, 21);
      
      const trend5m = ema9_5m[ema9_5m.length - 1] > ema21_5m[ema21_5m.length - 1] ? 'bullish' : 'bearish';
      const trend15m = ema9_15m[ema9_15m.length - 1] > ema21_15m[ema21_15m.length - 1] ? 'bullish' : 'bearish';
      
      const hma5m = this.calculateHullMA(closes5m, 9);
      const hmaTrend5m = hma5m.length >= 2 && hma5m[hma5m.length - 1] > hma5m[hma5m.length - 2] ? 'bullish' : 'bearish';
      
      const aligned = trend5m === trend15m && trend5m === hmaTrend5m;
      const direction = aligned ? trend5m : 'mixed';
      
      let strength = 50;
      if (trend5m === trend15m) strength += 25;
      if (trend5m === hmaTrend5m) strength += 15;
      if (trend15m === hmaTrend5m) strength += 10;
      
      const result = { aligned, direction, strength: Math.min(strength, 100) };
      this.mtfCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    } catch (error) {
      console.error(`Multi-timeframe check failed for ${symbol}:`, error);
      const result = { aligned: false, direction: 'mixed' as const, strength: 50 };
      return result;
    }
  }

  calculateMACD(closes: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    
    const macd: number[] = [];
    const startIdx = 26 - 12;
    
    for (let i = 0; i < ema12.length; i++) {
      if (i >= startIdx && (i - startIdx) < ema26.length) {
        macd.push(ema12[i] - ema26[i - startIdx]);
      }
    }
    
    const signal = this.calculateEMA(macd, 9);
    const histogram: number[] = [];
    
    const signalStartIdx = macd.length - signal.length;
    for (let i = signalStartIdx; i < macd.length; i++) {
      histogram.push(macd[i] - signal[i - signalStartIdx]);
    }
    
    return { macd, signal, histogram };
  }

  calculateBollingerBands(closes: number[], period: number = 20, stdDevMultiplier: number = 2.5): {
    upper: number[];
    middle: number[];
    lower: number[];
    stdDev: number[];
  } {
    const upper: number[] = [];
    const middle: number[] = [];
    const lower: number[] = [];
    const stdDev: number[] = [];

    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period;
      const sd = Math.sqrt(variance);
      
      middle.push(avg);
      upper.push(avg + stdDevMultiplier * sd);
      lower.push(avg - stdDevMultiplier * sd);
      stdDev.push(sd);
    }

    return { upper, middle, lower, stdDev };
  }

  calculateATR(candles: CandleData[], period: number = 14): { current: number; prev: number; trending: boolean } {
    if (candles.length < period + 1) return { current: 0, prev: 0, trending: false };
    
    const trueRanges: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }
    
    const recent = trueRanges.slice(-period);
    const prev = trueRanges.slice(-period - 1, -1);
    const current = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prevAtr = prev.length >= period ? prev.reduce((a, b) => a + b, 0) / prev.length : current;
    const trending = current > prevAtr;
    
    return { current, prev: prevAtr, trending };
  }

  calculateADX(candles: CandleData[], period: number = 14): { adx: number; plusDI: number; minusDI: number; trending: boolean } {
    if (candles.length < period + 2) return { adx: 25, plusDI: 25, minusDI: 25, trending: false };
    
    const plusDM: number[] = [];
    const minusDM: number[] = [];
    const trueRanges: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevHigh = candles[i - 1].high;
      const prevLow = candles[i - 1].low;
      const prevClose = candles[i - 1].close;
      
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
      
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trueRanges.push(tr);
    }
    
    const smoothPlusDM = this.calculateEMA(plusDM, period);
    const smoothMinusDM = this.calculateEMA(minusDM, period);
    const smoothTR = this.calculateEMA(trueRanges, period);
    
    const plusDI: number[] = [];
    const minusDI: number[] = [];
    const dx: number[] = [];
    
    for (let i = 0; i < smoothTR.length; i++) {
      const pdi = smoothTR[i] > 0 ? (smoothPlusDM[i] / smoothTR[i]) * 100 : 0;
      const mdi = smoothTR[i] > 0 ? (smoothMinusDM[i] / smoothTR[i]) * 100 : 0;
      plusDI.push(pdi);
      minusDI.push(mdi);
      
      const diSum = pdi + mdi;
      dx.push(diSum > 0 ? (Math.abs(pdi - mdi) / diSum) * 100 : 0);
    }
    
    const adxValues = this.calculateEMA(dx.slice(-period * 2), period);
    const currentADX = adxValues.length > 0 ? adxValues[adxValues.length - 1] : 25;
    const currentPlusDI = plusDI.length > 0 ? plusDI[plusDI.length - 1] : 25;
    const currentMinusDI = minusDI.length > 0 ? minusDI[minusDI.length - 1] : 25;
    
    return {
      adx: Math.min(currentADX, 100),
      plusDI: currentPlusDI,
      minusDI: currentMinusDI,
      trending: currentADX > 25
    };
  }

  calculateTrendStrength(candles: CandleData[], ema9Values: number[], indicators?: ScalpingIndicators): {
    score: number;
    isBullish: boolean;
    slope: number;
    expanding: boolean;
    bars: number;
    dominantFactor: string;
    components: { direction: number; momentum: number; volatility: number; confirmation: number };
  } {
    if (candles.length < 20 || ema9Values.length < 4) {
      return { 
        score: 50, isBullish: true, slope: 0, expanding: false, bars: 5,
        dominantFactor: 'insufficient_data',
        components: { direction: 50, momentum: 50, volatility: 50, confirmation: 50 }
      };
    }
    
    const currentPrice = candles[candles.length - 1].close;
    const adxData = this.calculateADX(candles);
    
    // Calculate EMA values if not provided
    const closes = candles.map(c => c.close);
    const ema21Values = this.calculateEMA(closes, 21);
    const ema9 = ema9Values[ema9Values.length - 1];
    const ema21 = ema21Values[ema21Values.length - 1] || ema9;
    
    // ========== DIRECTION SCORE (35%) ==========
    // EMA stack alignment: price > EMA9 > EMA21 (bullish) or inverse (bearish)
    const bullishStack = currentPrice > ema9 && ema9 > ema21;
    const bearishStack = currentPrice < ema9 && ema9 < ema21;
    const stackScore = (bullishStack || bearishStack) ? 80 : 40;
    
    // DI dominance: +DI vs -DI spread indicates trend direction strength
    const diSpread = Math.abs(adxData.plusDI - adxData.minusDI);
    const diScore = Math.min(diSpread * 2.5, 100); // Normalize spread to 0-100
    
    // ADX strength (trend intensity)
    const adxScore = Math.min(adxData.adx * 2, 100);
    
    // EMA slope consistency
    const emaSlope = (ema9Values[ema9Values.length - 1] - ema9Values[ema9Values.length - 4]) / 3;
    const prevSlope = ema9Values.length >= 7 
      ? (ema9Values[ema9Values.length - 4] - ema9Values[ema9Values.length - 7]) / 3 
      : emaSlope;
    const slopeConsistent = (emaSlope > 0 && prevSlope > 0) || (emaSlope < 0 && prevSlope < 0);
    const slopeScore = slopeConsistent ? 70 : 30;
    
    const directionScore = (stackScore * 0.3 + diScore * 0.3 + adxScore * 0.25 + slopeScore * 0.15);
    
    // ========== MOMENTUM SCORE (30%) ==========
    let momentumScore = 50;
    if (indicators) {
      // RSI trend: 40-60 = neutral, outside = directional strength
      const rsiDeviation = Math.abs(indicators.rsi9 - 50);
      const rsiScore = Math.min(rsiDeviation * 2, 100);
      
      // MACD histogram growth (accelerating momentum)
      const macdGrowth = Math.abs(indicators.macdHist) > Math.abs(indicators.macdHistPrev);
      const macdDirection = (indicators.macdHist > 0 && emaSlope > 0) || (indicators.macdHist < 0 && emaSlope < 0);
      const macdScore = macdGrowth && macdDirection ? 85 : macdDirection ? 65 : 35;
      
      // Stochastic alignment (K above/below D matching trend)
      const stochBullish = indicators.stochK > indicators.stochD && emaSlope > 0;
      const stochBearish = indicators.stochK < indicators.stochD && emaSlope < 0;
      const stochScore = (stochBullish || stochBearish) ? 80 : 40;
      
      // Penalize overbought/oversold conditions (exhaustion risk)
      let exhaustionPenalty = 0;
      if (emaSlope > 0 && (indicators.rsi9 > 80 || indicators.stochK > 85)) exhaustionPenalty = 20;
      if (emaSlope < 0 && (indicators.rsi9 < 20 || indicators.stochK < 15)) exhaustionPenalty = 20;
      
      momentumScore = Math.max((rsiScore * 0.35 + macdScore * 0.4 + stochScore * 0.25) - exhaustionPenalty, 10);
    } else {
      // Fallback: use just ADX and slope
      momentumScore = adxData.adx > 25 ? 65 : 45;
    }
    
    // ========== VOLATILITY SCORE (20%) ==========
    let volatilityScore = 50;
    if (indicators) {
      // ATR expansion = strengthening trend, contraction = weakening
      const atrChange = indicators.atrPrev > 0 ? (indicators.atr - indicators.atrPrev) / indicators.atrPrev : 0;
      const atrExpanding = atrChange > 0.05; // 5% ATR increase
      const atrScore = atrExpanding ? 75 : atrChange < -0.05 ? 35 : 55;
      
      // Bollinger bandwidth (wide = volatile/trending, narrow = consolidation)
      const bandwidth = indicators.bollingerStdDev / indicators.bollingerMiddle * 100;
      const bandwidthScore = bandwidth > 3 ? 80 : bandwidth > 1.5 ? 60 : 40;
      
      // Price position in Bollinger bands (extremes = potential exhaustion)
      const bbRange = indicators.bollingerUpper - indicators.bollingerLower;
      const pricePosition = bbRange > 0 ? (currentPrice - indicators.bollingerLower) / bbRange : 0.5;
      // Trending in direction = good, against = bad
      const positionAligned = (emaSlope > 0 && pricePosition > 0.6) || (emaSlope < 0 && pricePosition < 0.4);
      const positionScore = positionAligned ? 70 : 50;
      
      volatilityScore = atrScore * 0.4 + bandwidthScore * 0.35 + positionScore * 0.25;
    }
    
    // ========== CONFIRMATION SCORE (15%) ==========
    let confirmationScore = 50;
    if (indicators) {
      // Volume confirmation: above average volume = conviction
      const volumeScore = indicators.volumeDelta > 1.5 ? 85 : 
                          indicators.volumeDelta > 1.0 ? 65 : 
                          indicators.volumeDelta > 0.7 ? 45 : 30;
      
      // Price relative to Bollinger midline (above = bullish bias, below = bearish)
      const aboveMidline = currentPrice > indicators.bollingerMiddle;
      const midlineAligned = (aboveMidline && emaSlope > 0) || (!aboveMidline && emaSlope < 0);
      const midlineScore = midlineAligned ? 75 : 40;
      
      confirmationScore = volumeScore * 0.6 + midlineScore * 0.4;
    }
    
    // ========== WEIGHTED COMPOSITE SCORE ==========
    const weightedScore = (
      directionScore * 0.35 +
      momentumScore * 0.30 +
      volatilityScore * 0.20 +
      confirmationScore * 0.15
    );
    
    const finalScore = Math.round(Math.max(0, Math.min(100, weightedScore)));
    const isBullish = emaSlope > 0 || adxData.plusDI > adxData.minusDI;
    const expanding = Math.abs(emaSlope) > Math.abs(prevSlope);
    
    // Determine dominant factor
    const components = { direction: directionScore, momentum: momentumScore, volatility: volatilityScore, confirmation: confirmationScore };
    const maxComponent = Math.max(directionScore, momentumScore, volatilityScore, confirmationScore);
    let dominantFactor = 'balanced';
    if (maxComponent === directionScore && directionScore > 60) dominantFactor = 'strong_direction';
    else if (maxComponent === momentumScore && momentumScore > 60) dominantFactor = 'momentum_driven';
    else if (maxComponent === volatilityScore && volatilityScore > 60) dominantFactor = 'volatility_expansion';
    else if (maxComponent === confirmationScore && confirmationScore > 60) dominantFactor = 'volume_confirmed';
    
    return {
      score: finalScore,
      isBullish,
      slope: emaSlope,
      expanding,
      bars: Math.round(finalScore / 10),
      dominantFactor,
      components
    };
  }

  calculateStochastic(candles: CandleData[], kPeriod: number = 5, dPeriod: number = 3, smooth: number = 3): {
    k: number[];
    d: number[];
  } {
    const k: number[] = [];
    const d: number[] = [];
    
    for (let i = kPeriod - 1; i < candles.length; i++) {
      const slice = candles.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(c => c.high));
      const lowestLow = Math.min(...slice.map(c => c.low));
      const currentClose = candles[i].close;
      
      const rawK = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(rawK);
    }
    
    const smoothedK: number[] = [];
    for (let i = smooth - 1; i < k.length; i++) {
      const avg = k.slice(i - smooth + 1, i + 1).reduce((a, b) => a + b, 0) / smooth;
      smoothedK.push(avg);
    }
    
    for (let i = dPeriod - 1; i < smoothedK.length; i++) {
      const avg = smoothedK.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / dPeriod;
      d.push(avg);
    }
    
    return { k: smoothedK, d };
  }

  detectFairValueGaps(candles: CandleData[]): FairValueGap[] {
    const fvgs: FairValueGap[] = [];
    const recent = candles.slice(-50);
    const currentPrice = recent[recent.length - 1].close;
    
    for (let i = 2; i < recent.length; i++) {
      const prev = recent[i - 2];
      const current = recent[i];
      
      if (current.low > prev.high) {
        const gap: FairValueGap = {
          type: 'bullish',
          low: prev.high,
          high: current.low,
          midpoint: (prev.high + current.low) / 2,
          strength: (current.low - prev.high) / prev.high * 100,
          filled: currentPrice <= current.low
        };
        if (!gap.filled && gap.strength > 0.1) {
          fvgs.push(gap);
        }
      }
      
      if (current.high < prev.low) {
        const gap: FairValueGap = {
          type: 'bearish',
          high: prev.low,
          low: current.high,
          midpoint: (prev.low + current.high) / 2,
          strength: (prev.low - current.high) / prev.low * 100,
          filled: currentPrice >= current.high
        };
        if (!gap.filled && gap.strength > 0.1) {
          fvgs.push(gap);
        }
      }
    }
    
    return fvgs.slice(-5);
  }

  detectStructuralLevels(candles: CandleData[]): StructuralLevel[] {
    const levels: StructuralLevel[] = [];
    const recent = candles.slice(-100);
    const priceRange = Math.max(...recent.map(c => c.high)) - Math.min(...recent.map(c => c.low));
    const threshold = priceRange * 0.005;
    
    const pivotHighs: number[] = [];
    const pivotLows: number[] = [];
    
    for (let i = 2; i < recent.length - 2; i++) {
      const curr = recent[i];
      if (curr.high > recent[i-1].high && curr.high > recent[i-2].high &&
          curr.high > recent[i+1].high && curr.high > recent[i+2].high) {
        pivotHighs.push(curr.high);
      }
      if (curr.low < recent[i-1].low && curr.low < recent[i-2].low &&
          curr.low < recent[i+1].low && curr.low < recent[i+2].low) {
        pivotLows.push(curr.low);
      }
    }
    
    const groupLevels = (prices: number[], type: 'support' | 'resistance') => {
      const grouped: { price: number; count: number }[] = [];
      for (const price of prices) {
        let found = false;
        for (const g of grouped) {
          if (Math.abs(g.price - price) < threshold) {
            g.count += 1;
            found = true;
            break;
          }
        }
        if (!found) grouped.push({ price, count: 1 });
      }
      
      for (const g of grouped) {
        if (g.count >= 2) {
          levels.push({
            type,
            price: g.price,
            strength: Math.min(g.count / 5, 1),
            touches: g.count
          });
        }
      }
    };
    
    groupLevels(pivotHighs, 'resistance');
    groupLevels(pivotLows, 'support');
    
    return levels.sort((a, b) => b.strength - a.strength).slice(0, 6);
  }

  async fetchSentiment(symbol: string): Promise<SentimentData> {
    try {
      const fgResponse = await fetch('https://api.alternative.me/fng/?limit=1');
      const fgData = await fgResponse.json();
      const fearGreedIndex = parseInt(fgData.data?.[0]?.value) || 50;
      
      let score = fearGreedIndex / 100;
      let classification: SentimentData['classification'] = 'neutral';
      
      if (score >= 0.8) classification = 'euphoric';
      else if (score >= 0.6) classification = 'bullish';
      else if (score <= 0.2) classification = 'panic';
      else if (score <= 0.4) classification = 'bearish';
      
      return {
        score,
        classification,
        fearGreedIndex,
        newsImpact: null
      };
    } catch (error) {
      return {
        score: 0.5,
        classification: 'neutral',
        fearGreedIndex: 50,
        newsImpact: null
      };
    }
  }

  calculateIndicators(candles: CandleData[]): ScalpingIndicators {
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);
    
    const rsi = this.calculateRSI(closes, 9);
    const macdData = this.calculateMACD(closes);
    const ema9 = this.calculateEMA(closes, 9);
    const ema20 = this.calculateEMA(closes, 20);
    const ema21 = this.calculateEMA(closes, 21);
    const bollinger = this.calculateBollingerBands(closes, 20, 2.5);
    const atrData = this.calculateATR(candles, 14);
    const stoch = this.calculateStochastic(candles, 5, 3, 3);
    
    const currentVolume = volumes[volumes.length - 1] || 0;
    const avgVolume20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeDelta = avgVolume20 > 0 ? currentVolume / avgVolume20 : 1;
    
    const hullMA = this.calculateHullMA(closes, 9);
    const zlema = this.calculateZLEMA(closes, 9);
    
    return {
      rsi9: rsi[rsi.length - 1] || 50,
      rsi9Prev: rsi[rsi.length - 2] || 50,
      macdHist: macdData.histogram[macdData.histogram.length - 1] || 0,
      macdHistPrev: macdData.histogram[macdData.histogram.length - 2] || 0,
      ema9: ema9[ema9.length - 1] || closes[closes.length - 1],
      ema20: ema20[ema20.length - 1] || closes[closes.length - 1],
      ema21: ema21[ema21.length - 1] || closes[closes.length - 1],
      bollingerUpper: bollinger.upper[bollinger.upper.length - 1] || closes[closes.length - 1] * 1.02,
      bollingerLower: bollinger.lower[bollinger.lower.length - 1] || closes[closes.length - 1] * 0.98,
      bollingerMiddle: bollinger.middle[bollinger.middle.length - 1] || closes[closes.length - 1],
      bollingerStdDev: bollinger.stdDev[bollinger.stdDev.length - 1] || 0,
      atr: atrData.current,
      atrPrev: atrData.prev,
      atrTrending: atrData.trending,
      stochK: stoch.k[stoch.k.length - 1] || 50,
      stochKPrev: stoch.k[stoch.k.length - 2] || 50,
      stochD: stoch.d[stoch.d.length - 1] || 50,
      stochDPrev: stoch.d[stoch.d.length - 2] || 50,
      volumeDelta,
      currentVolume,
      avgVolume20,
      hullMA: hullMA[hullMA.length - 1] || closes[closes.length - 1],
      hullMAPrev: hullMA[hullMA.length - 2] || closes[closes.length - 1],
      zlema: zlema[zlema.length - 1] || closes[closes.length - 1],
      zlemaPrev: zlema[zlema.length - 2] || closes[closes.length - 1]
    };
  }

  evaluateConditions(
    candles: CandleData[],
    indicators: ScalpingIndicators,
    fvgs: FairValueGap[],
    levels: StructuralLevel[],
    sentiment: SentimentData
  ): { momentum: boolean; structure: boolean; volatility: boolean; sentiment: boolean; direction: 'long' | 'short' | 'neutral' } {
    const currentPrice = candles[candles.length - 1].close;
    const prevCandle = candles[candles.length - 2];
    
    let momentumLong = false;
    let momentumShort = false;
    
    const rsiCrossingUp = indicators.rsi9Prev < 30 && indicators.rsi9 >= 30;
    const rsiCrossingDown = indicators.rsi9Prev > 70 && indicators.rsi9 <= 70;
    const macdAccelerating = Math.abs(indicators.macdHist) > Math.abs(indicators.macdHistPrev);
    const macdBullish = indicators.macdHist > 0 && macdAccelerating;
    const macdBearish = indicators.macdHist < 0 && macdAccelerating;
    
    if (rsiCrossingUp || macdBullish) momentumLong = true;
    if (rsiCrossingDown || macdBearish) momentumShort = true;
    
    let structureLong = false;
    let structureShort = false;
    
    const bullishFvgRetest = fvgs.some(fvg => 
      fvg.type === 'bullish' && 
      currentPrice >= fvg.low && 
      currentPrice <= fvg.high
    );
    const bearishFvgRetest = fvgs.some(fvg => 
      fvg.type === 'bearish' && 
      currentPrice >= fvg.low && 
      currentPrice <= fvg.high
    );
    
    const nearSupport = levels.some(l => 
      l.type === 'support' && 
      Math.abs(currentPrice - l.price) / l.price < 0.003
    );
    const nearResistance = levels.some(l => 
      l.type === 'resistance' && 
      Math.abs(currentPrice - l.price) / l.price < 0.003
    );
    
    if (bullishFvgRetest || nearSupport) structureLong = true;
    if (bearishFvgRetest || nearResistance) structureShort = true;
    
    let volatilityLong = false;
    let volatilityShort = false;
    
    const touchingLowerBand = currentPrice <= indicators.bollingerLower * 1.002;
    const touchingUpperBand = currentPrice >= indicators.bollingerUpper * 0.998;
    
    if (touchingLowerBand) volatilityLong = true;
    if (touchingUpperBand) volatilityShort = true;
    
    let sentimentLong = false;
    let sentimentShort = false;
    
    if (sentiment.score <= 0.2) sentimentLong = true;
    if (sentiment.score >= 0.8) sentimentShort = true;
    
    const longConditions = [momentumLong, structureLong, volatilityLong, sentimentLong].filter(Boolean).length;
    const shortConditions = [momentumShort, structureShort, volatilityShort, sentimentShort].filter(Boolean).length;
    
    let direction: 'long' | 'short' | 'neutral' = 'neutral';
    if (longConditions >= 3) direction = 'long';
    else if (shortConditions >= 3) direction = 'short';
    
    return {
      momentum: direction === 'long' ? momentumLong : momentumShort,
      structure: direction === 'long' ? structureLong : structureShort,
      volatility: direction === 'long' ? volatilityLong : volatilityShort,
      sentiment: direction === 'long' ? sentimentLong : sentimentShort,
      direction
    };
  }

  async analyzeAsset(symbol: string, timeframe: '1m' | '5m' | '15m' | '30m' = '5m'): Promise<ScalpingSignal | null> {
    console.log(`⚡ Scalping analysis for ${symbol} (${timeframe})...`);
    
    let candles: CandleData[];
    switch (timeframe) {
      case '1m':
        candles = await this.fetch1MinuteData(symbol);
        break;
      case '15m':
        candles = await this.fetch15MinuteData(symbol);
        break;
      case '30m':
        candles = await this.fetch30MinuteData(symbol);
        break;
      default:
        candles = await this.fetch5MinuteData(symbol);
    }
    
    if (candles.length < 50) {
      console.log(`⚠️ Insufficient data for ${symbol}`);
      return null;
    }
    
    const currentCandle = candles[candles.length - 1];
    const currentPrice = currentCandle.close;
    
    const indicators = this.calculateIndicators(candles);
    const fvgs = this.detectFairValueGaps(candles);
    const levels = this.detectStructuralLevels(candles);
    const sentiment = await this.fetchSentiment(symbol);
    
    const closes = candles.map(c => c.close);
    const ema9Values = this.calculateEMA(closes, 9);
    let trendStrength = this.calculateTrendStrength(candles, ema9Values, indicators);
    
    const isPreciousMetal = this.isPreciousMetalSymbol(symbol);
    let pivotPoints: PivotPoints | undefined;
    let gsrData: GSRData | undefined;
    let stochRsi: number | undefined;
    
    if (isPreciousMetal) {
      pivotPoints = this.calculatePivotPoints(candles);
      gsrData = await this.fetchGSRData();
      const closes = candles.map(c => c.close);
      stochRsi = this.calculateStochRSI(closes);
      console.log(`🥇 Precious Metal ${symbol}: Pivot P=${pivotPoints.pivot.toFixed(2)}, StochRSI=${stochRsi.toFixed(1)}, GSR=${gsrData.currentRatio.toFixed(2)}`);
    }
    
    const conditions = this.evaluateConditions(candles, indicators, fvgs, levels, sentiment);
    let conditionCount = [conditions.momentum, conditions.structure, conditions.volatility, conditions.sentiment].filter(Boolean).length;
    
    const liquiditySweeps = this.detectLiquiditySweeps(candles);
    const multiTimeframeTrend = await this.checkMultiTimeframeTrend(symbol);
    
    if (liquiditySweeps.length > 0) {
      const recentSweep = liquiditySweeps[0];
      console.log(`🌊 Liquidity sweep detected: ${recentSweep.type} at ${recentSweep.levelType} (quality: ${recentSweep.quality.toFixed(2)})`);
    }
    
    if (multiTimeframeTrend.aligned) {
      conditionCount = Math.min(conditionCount + 1, 4);
      console.log(`📊 Multi-TF trend aligned: ${multiTimeframeTrend.direction} (strength: ${multiTimeframeTrend.strength}%)`);
    }
    
    const emaCrossLong = indicators.ema9 > indicators.ema20;
    const emaCrossShort = indicators.ema9 < indicators.ema20;
    
    const stochCrossingUp = indicators.stochKPrev < 20 && indicators.stochK >= 20 && indicators.stochK > indicators.stochD;
    const stochCrossingDown = indicators.stochKPrev > 80 && indicators.stochK <= 80 && indicators.stochK < indicators.stochD;
    
    const tripleThrust = {
      emaCross: conditions.direction === 'long' ? emaCrossLong : emaCrossShort,
      stochastic: conditions.direction === 'long' ? stochCrossingUp : stochCrossingDown,
      atrTrending: indicators.atrTrending,
      passed: false
    };
    
    const thrustConditionsMet = [tripleThrust.emaCross, tripleThrust.stochastic, tripleThrust.atrTrending].filter(Boolean).length;
    tripleThrust.passed = thrustConditionsMet >= 2;
    
    let signal: ScalpingSignal['signal'] = 'WAIT';
    let uiCommand: ScalpingSignal['uiCommand'] = 'ACTION_WAIT';
    let signalStrength = 5.0;
    let confidence = 5;
    let entryPrice = currentPrice;
    let exitTarget = currentPrice;
    let exitTarget2 = currentPrice;
    let stopLoss = currentPrice;
    let timing = 'WAIT for better setup';
    const reasoning: string[] = [];
    
    const isForex = [
      'EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD',
      'EURGBP', 'EURJPY', 'EURCHF', 'EURCAD', 'EURNZD',
      'GBPAUD', 'GBPJPY', 'USDMXN', 'USDTHB', 'USDCNH'
    ].includes(symbol.toUpperCase());
    const pipSize = symbol.includes('JPY') ? 0.01 : 0.0001;
    const pipValue = isForex ? (5 * pipSize) : (currentPrice * 0.005);
    
    if (isPreciousMetal && pivotPoints && gsrData && stochRsi !== undefined) {
      const isGold = symbol.includes('GC') || symbol.includes('XAU') || symbol.includes('GOLD');
      const isSilver = symbol.includes('SI') || symbol.includes('XAG') || symbol.includes('SILVER');
      const abovePivot = currentPrice > pivotPoints.pivot;
      const stochRsiExhaustion = stochRsi >= 95;
      const stopMultiplier = 1.5;
      
      if (isGold && abovePivot && gsrData.signal === 'BUY_GOLD') {
        signalStrength = Math.min(10, 7.5 + conditionCount * 0.5);
        signal = signalStrength >= 8.5 ? 'STRONG BUY' : 'BUY';
        uiCommand = signalStrength >= 8.5 ? 'ACTION_FLASH_BUY' : 'ACTION_WAIT';
        confidence = Math.round(signalStrength);
        
        entryPrice = currentPrice;
        stopLoss = currentPrice - (indicators.atr * stopMultiplier);
        const riskAmount = Math.abs(entryPrice - stopLoss);
        exitTarget = currentPrice + (riskAmount * 1.5);
        exitTarget2 = currentPrice + (riskAmount * 2.5);
        
        timing = `🥇 GOLD FLASH ENTRY at $${currentPrice.toFixed(2)}`;
        reasoning.push(`✓ Price ABOVE Central Pivot ($${pivotPoints.pivot.toFixed(2)})`);
        reasoning.push(`✓ ${gsrData.reasoning}`);
        reasoning.push(`✓ Stop Loss at 1.5x ATR ($${stopLoss.toFixed(2)})`);
        
      } else if (isSilver && stochRsiExhaustion) {
        signalStrength = Math.min(10, 8 + conditionCount * 0.3);
        signal = 'STRONG SELL';
        uiCommand = 'ACTION_FLASH_SELL';
        confidence = Math.round(signalStrength);
        
        entryPrice = currentPrice;
        stopLoss = currentPrice + (indicators.atr * stopMultiplier);
        const riskAmount = Math.abs(stopLoss - entryPrice);
        exitTarget = currentPrice - (riskAmount * 1.5);
        exitTarget2 = currentPrice - (riskAmount * 2);
        
        timing = `🥈 SILVER PARABOLIC EXHAUSTION at $${currentPrice.toFixed(2)}`;
        reasoning.push(`⚠️ StochRSI at ${stochRsi.toFixed(1)} - PARABOLIC EXHAUSTION!`);
        reasoning.push(`✓ Mean-reversion SELL signal triggered`);
        reasoning.push(`✓ Stop Loss at 1.5x ATR ($${stopLoss.toFixed(2)})`);
        
      } else if (isSilver && gsrData.signal === 'BUY_SILVER' && abovePivot) {
        signalStrength = Math.min(10, 7.5 + conditionCount * 0.5);
        signal = signalStrength >= 8.5 ? 'STRONG BUY' : 'BUY';
        uiCommand = signalStrength >= 8.5 ? 'ACTION_FLASH_BUY' : 'ACTION_WAIT';
        confidence = Math.round(signalStrength);
        
        entryPrice = currentPrice;
        stopLoss = currentPrice - (indicators.atr * stopMultiplier);
        const riskAmount = Math.abs(entryPrice - stopLoss);
        exitTarget = currentPrice + (riskAmount * 1.5);
        exitTarget2 = currentPrice + (riskAmount * 2.5);
        
        timing = `🥈 SILVER CATCH-UP BUY at $${currentPrice.toFixed(2)}`;
        reasoning.push(`✓ Price ABOVE Central Pivot ($${pivotPoints.pivot.toFixed(2)})`);
        reasoning.push(`✓ ${gsrData.reasoning}`);
        reasoning.push(`✓ Stop Loss at 1.5x ATR ($${stopLoss.toFixed(2)})`);
        
      } else if (isGold && !abovePivot) {
        reasoning.push(`✗ Gold BELOW Central Pivot ($${pivotPoints.pivot.toFixed(2)}) - No BUY signal`);
        reasoning.push(`ℹ️ GSR: ${gsrData.currentRatio.toFixed(2)} (${gsrData.deviationPercent.toFixed(2)}% from mean)`);
      } else if (isSilver && stochRsi < 95) {
        reasoning.push(`ℹ️ Silver StochRSI: ${stochRsi.toFixed(1)} (needs 95+ for exhaustion signal)`);
        reasoning.push(`ℹ️ GSR: ${gsrData.currentRatio.toFixed(2)} (${gsrData.deviationPercent.toFixed(2)}% from mean)`);
      }
    } else if (conditions.direction === 'long' && conditionCount >= 3 && tripleThrust.passed) {
      signalStrength = Math.min(10, 6 + conditionCount + thrustConditionsMet * 0.5);
      signal = signalStrength >= 8.5 ? 'STRONG BUY' : 'BUY';
      uiCommand = signalStrength >= 8.5 ? 'ACTION_FLASH_BUY' : 'ACTION_WAIT';
      confidence = Math.round(signalStrength);
      
      entryPrice = currentPrice;
      stopLoss = isForex ? currentPrice - pipValue : currentPrice - (currentPrice * 0.005);
      const riskAmount = Math.abs(entryPrice - stopLoss);
      exitTarget = currentPrice + (riskAmount * 1.5);
      exitTarget2 = currentPrice + (riskAmount * 2);
      
      timing = `⚡ FLASH ENTRY at $${currentPrice.toFixed(isForex ? 5 : 2)}`;
      
      if (tripleThrust.emaCross) reasoning.push(`✓ EMA(9) above EMA(20) - Momentum Confirmed`);
      if (tripleThrust.stochastic) reasoning.push(`✓ Stochastic(5,3,3) crossing UP from <20`);
      if (tripleThrust.atrTrending) reasoning.push(`✓ ATR trending higher - Volatility expanding`);
      if (conditions.structure) reasoning.push(`Price at support/FVG retest zone`);
      reasoning.push(`Signal Strength: ${signalStrength.toFixed(1)}/10`);
      
    } else if (conditions.direction === 'short' && conditionCount >= 3 && tripleThrust.passed) {
      signalStrength = Math.min(10, 6 + conditionCount + thrustConditionsMet * 0.5);
      signal = signalStrength >= 8.5 ? 'STRONG SELL' : 'SELL';
      uiCommand = signalStrength >= 8.5 ? 'ACTION_FLASH_SELL' : 'ACTION_WAIT';
      confidence = Math.round(signalStrength);
      
      entryPrice = currentPrice;
      stopLoss = isForex ? currentPrice + pipValue : currentPrice + (currentPrice * 0.005);
      const riskAmount = Math.abs(stopLoss - entryPrice);
      exitTarget = currentPrice - (riskAmount * 1.5);
      exitTarget2 = currentPrice - (riskAmount * 2);
      
      timing = `⚡ FLASH ENTRY at $${currentPrice.toFixed(isForex ? 5 : 2)}`;
      
      if (tripleThrust.emaCross) reasoning.push(`✓ EMA(9) below EMA(20) - Momentum Confirmed`);
      if (tripleThrust.stochastic) reasoning.push(`✓ Stochastic(5,3,3) crossing DOWN from >80`);
      if (tripleThrust.atrTrending) reasoning.push(`✓ ATR trending higher - Volatility expanding`);
      if (conditions.structure) reasoning.push(`Price at resistance/FVG retest zone`);
      reasoning.push(`Signal Strength: ${signalStrength.toFixed(1)}/10`);
      
    } else {
      signalStrength = Math.min(6, 3 + conditionCount * 0.5 + thrustConditionsMet * 0.5);
      reasoning.push(`Only ${conditionCount}/4 conditions + ${thrustConditionsMet}/3 Triple-Thrust met`);
      if (!tripleThrust.emaCross) reasoning.push(`✗ EMA(9) not crossed EMA(20)`);
      if (!tripleThrust.stochastic) reasoning.push(`✗ Stochastic not at extreme (K: ${indicators.stochK.toFixed(1)})`);
      if (!tripleThrust.atrTrending) reasoning.push(`✗ ATR not trending higher`);
      
      // Calculate potential entry/exit levels even for WAIT signals
      entryPrice = currentPrice;
      const potentialDirection = conditions.direction || (emaCrossLong ? 'long' : 'short');
      if (potentialDirection === 'long') {
        stopLoss = isForex ? currentPrice - pipValue : currentPrice - (currentPrice * 0.005);
        const riskAmount = Math.abs(entryPrice - stopLoss);
        exitTarget = currentPrice + (riskAmount * 1.5);
        exitTarget2 = currentPrice + (riskAmount * 2);
      } else {
        stopLoss = isForex ? currentPrice + pipValue : currentPrice + (currentPrice * 0.005);
        const riskAmount = Math.abs(stopLoss - entryPrice);
        exitTarget = currentPrice - (riskAmount * 1.5);
        exitTarget2 = currentPrice - (riskAmount * 2);
      }
    }
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 180000);
    
    // Align trend strength direction with the actual signal and conditions
    const isBuySignal = signal.includes('BUY');
    const isSellSignal = signal.includes('SELL');
    // Determine trend alignment from signal or conditions
    let alignedBullish = trendStrength.isBullish;
    if (isBuySignal) {
      alignedBullish = true;
    } else if (isSellSignal) {
      alignedBullish = false;
    } else if (conditions.direction === 'long') {
      alignedBullish = true;
    } else if (conditions.direction === 'short') {
      alignedBullish = false;
    }
    // Also check if stop loss is above entry (indicating short trade)
    if (stopLoss > entryPrice) {
      alignedBullish = false;
    } else if (stopLoss < entryPrice) {
      alignedBullish = true;
    }
    trendStrength = {
      ...trendStrength,
      isBullish: alignedBullish
    };
    
    if (liquiditySweeps.length > 0) {
      const sweep = liquiditySweeps[0];
      if (sweep.type === 'bullish' && conditions.direction !== 'short') {
        reasoning.push(`🌊 Bullish liquidity sweep at ${sweep.levelType} - institutional accumulation`);
      } else if (sweep.type === 'bearish' && conditions.direction !== 'long') {
        reasoning.push(`🌊 Bearish liquidity sweep at ${sweep.levelType} - institutional distribution`);
      }
    }
    
    if (multiTimeframeTrend.aligned) {
      reasoning.push(`📊 Multi-TF trend aligned ${multiTimeframeTrend.direction} (${multiTimeframeTrend.strength}% strength)`);
    }
    
    const hullMATrending = indicators.hullMA > indicators.hullMAPrev;
    const zlemaTrending = indicators.zlema > indicators.zlemaPrev;
    if (hullMATrending === zlemaTrending) {
      reasoning.push(`⚡ Zero-lag indicators confirm ${hullMATrending ? 'bullish' : 'bearish'} momentum`);
    }
    
    return {
      asset: symbol,
      signal,
      uiCommand,
      signalStrength,
      confidence,
      timing,
      entryPrice,
      exitTarget,
      exitTarget2,
      stopLoss,
      reasoning,
      indicators,
      fvgs,
      structuralLevels: levels,
      sentiment,
      conditionsMet: {
        momentum: conditions.momentum,
        structure: conditions.structure,
        volatility: conditions.volatility,
        sentiment: conditions.sentiment,
        total: conditionCount
      },
      tripleThrust,
      liquiditySweeps,
      multiTimeframeTrend,
      pivotPoints,
      gsrData,
      isPreciousMetal,
      stochRsi,
      trendStrength,
      timeframe,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lifespan: 180
    };
  }

  async scanMultipleAssets(symbols: string[], timeframe: '1m' | '5m' | '15m' | '30m' = '5m'): Promise<ScalpingSignal[]> {
    const results: ScalpingSignal[] = [];
    
    for (const symbol of symbols) {
      try {
        const signal = await this.analyzeAsset(symbol, timeframe);
        if (signal) results.push(signal);
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  async getCachedCandles(symbol: string): Promise<{ time: number; open: number; high: number; low: number; close: number; volume: number }[] | null> {
    const cached = this.candleCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CANDLE_CACHE_TTL) {
      return cached.candles.map(c => ({
        time: c.timestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume
      }));
    }
    
    try {
      const candles = await this.fetch5MinuteData(symbol);
      if (candles.length > 0) {
        this.candleCache.set(symbol, { candles, timestamp: Date.now() });
        return candles.map(c => ({
          time: c.timestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume
        }));
      }
    } catch (e) {}
    
    return null;
  }
}

export const scalpingService = new ScalpingService();
