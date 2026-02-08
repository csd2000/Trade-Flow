import { Router } from 'express';
import { orderFlowIntelligence, OrderFlowData, PressureMeterState } from './strategy/orderflow';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicators {
  ema8: number;
  ema9: number;
  ema18: number;
  ema21: number;
  ema50: number;
  ema200: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  prevMacdHistogram: number;
  prevMacd: number;
  prevMacdSignal: number;
  macdCrossover: 'bullish' | 'bearish' | 'none';
  adx: number;
  rsi: number;
  atr: number;
  rvol: number;
  candleColor: 'green' | 'red';
  goldenCross: boolean;
  priceAbove200EMA: boolean;
  priceAbove50EMA: boolean;
  hullMA: number;
  hullMAPrev: number;
  zlema: number;
  zlemaPrev: number;
  liquiditySweeps: LiquiditySweep[];
  multiTimeframeTrend: 'bullish' | 'bearish' | 'mixed';
}

interface LiquiditySweep {
  type: 'bullish' | 'bearish';
  levelType: string;
  sweepPrice: number;
  quality: number;
}

interface MacroContext {
  dxyTrend: 'bullish' | 'bearish' | 'neutral';
  dxyValue: number;
  rvol: number;
  newsSentiment: number;
  orderFlow: 'positive' | 'negative' | 'neutral';
  fearGreedIndex: number;
}

interface ConfluenceSignal {
  symbol: string;
  displayName: string;
  assetClass: string;
  timeframe: string;
  signalType: 'ENTRY' | 'EXIT' | 'HOLD';
  confluenceScore: number;
  maxScore: number;
  indicators: TechnicalIndicators;
  macro: MacroContext;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: number;
  reasoning: string[];
  timestamp: string;
  audioTrigger: 'entry' | 'exit' | null;
  orderFlow?: OrderFlowData;
  pressureMeter?: PressureMeterState;
}

interface PositionState {
  symbol: string;
  entryTime: number;
  entryPrice: number;
  isOpen: boolean;
}

interface AssetClass {
  name: string;
  symbols: string[];
  displayNames: Record<string, string>;
  macroDependency: string;
}

const ASSET_CLASSES: Record<string, AssetClass> = {
  all: {
    name: 'All Markets',
    symbols: [
      '^GSPC', '^IXIC', '^DJI', 'SPY', 'QQQ',
      'AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN', 'NFLX',
      'BITF', 'NIO', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'COIN', 'MARA', 'RIOT', 'HOOD',
      'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'ADA-USD', 'AVAX-USD',
      'EURUSD=X', 'GBPUSD=X', 'USDJPY=X',
      'GC=F', 'CL=F', 'ES=F', 'NQ=F'
    ],
    displayNames: {
      '^GSPC': 'SPX (S&P 500)', '^IXIC': 'NASDAQ Composite', '^DJI': 'Dow Jones',
      'SPY': 'S&P 500 ETF', 'QQQ': 'Nasdaq ETF',
      'AAPL': 'Apple', 'TSLA': 'Tesla', 'NVDA': 'NVIDIA', 'AMD': 'AMD', 'MSFT': 'Microsoft',
      'GOOGL': 'Google', 'META': 'Meta', 'AMZN': 'Amazon', 'NFLX': 'Netflix',
      'BITF': 'Bitfarms', 'NIO': 'NIO Inc', 'PLTR': 'Palantir', 'SOFI': 'SoFi', 'RIVN': 'Rivian',
      'LCID': 'Lucid', 'COIN': 'Coinbase', 'MARA': 'Marathon', 'RIOT': 'Riot Platforms', 'HOOD': 'Robinhood',
      'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'SOL-USD': 'Solana', 'XRP-USD': 'XRP',
      'DOGE-USD': 'Dogecoin', 'ADA-USD': 'Cardano', 'AVAX-USD': 'Avalanche',
      'EURUSD=X': 'EUR/USD', 'GBPUSD=X': 'GBP/USD', 'USDJPY=X': 'USD/JPY',
      'GC=F': 'Gold', 'CL=F': 'Crude Oil', 'ES=F': 'S&P 500 Fut', 'NQ=F': 'Nasdaq Fut'
    },
    macroDependency: 'rvol'
  },
  hfscalp: {
    name: 'HF Scalp',
    symbols: ['BITF', 'NIO', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'COIN', 'MARA', 'RIOT', 'HOOD', 'BBAI', 'SOUN', 'CLYM', 'IONQ', 'RGTI'],
    displayNames: {
      'BITF': 'Bitfarms', 'NIO': 'NIO Inc', 'PLTR': 'Palantir', 'SOFI': 'SoFi', 'RIVN': 'Rivian',
      'LCID': 'Lucid', 'COIN': 'Coinbase', 'MARA': 'Marathon', 'RIOT': 'Riot Platforms', 'HOOD': 'Robinhood',
      'BBAI': 'BigBear.ai', 'SOUN': 'SoundHound AI', 'CLYM': 'Climb Global', 'IONQ': 'IonQ', 'RGTI': 'Rigetti'
    },
    macroDependency: 'rvol'
  },
  forex: {
    name: 'Forex',
    symbols: ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'USDCAD=X', 'USDCHF=X', 'NZDUSD=X', 'EURGBP=X', 'EURJPY=X', 'GBPJPY=X'],
    displayNames: {
      'EURUSD=X': 'EUR/USD', 'GBPUSD=X': 'GBP/USD', 'USDJPY=X': 'USD/JPY',
      'AUDUSD=X': 'AUD/USD', 'USDCAD=X': 'USD/CAD', 'USDCHF=X': 'USD/CHF', 'NZDUSD=X': 'NZD/USD',
      'EURGBP=X': 'EUR/GBP', 'EURJPY=X': 'EUR/JPY', 'GBPJPY=X': 'GBP/JPY'
    },
    macroDependency: 'dxy'
  },
  crypto: {
    name: 'Crypto',
    symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD', 'AVAX-USD', 'MATIC-USD', 'LINK-USD', 'DOGE-USD', 'DOT-USD', 'SHIB-USD', 'LTC-USD'],
    displayNames: {
      'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'SOL-USD': 'Solana', 'XRP-USD': 'XRP',
      'ADA-USD': 'Cardano', 'AVAX-USD': 'Avalanche', 'MATIC-USD': 'Polygon', 'LINK-USD': 'Chainlink',
      'DOGE-USD': 'Dogecoin', 'DOT-USD': 'Polkadot', 'SHIB-USD': 'Shiba Inu', 'LTC-USD': 'Litecoin'
    },
    macroDependency: 'orderFlow'
  },
  stocks: {
    name: 'Stocks',
    symbols: ['^GSPC', '^IXIC', '^DJI', 'SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN', 'NFLX', 'DIS', 'BA', 'V', 'JPM', 'WMT'],
    displayNames: {
      '^GSPC': 'SPX (S&P 500)', '^IXIC': 'NASDAQ Composite', '^DJI': 'Dow Jones',
      'SPY': 'S&P 500 ETF', 'QQQ': 'Nasdaq ETF',
      'AAPL': 'Apple', 'TSLA': 'Tesla', 'NVDA': 'NVIDIA', 'AMD': 'AMD',
      'MSFT': 'Microsoft', 'GOOGL': 'Google', 'META': 'Meta', 'AMZN': 'Amazon', 'NFLX': 'Netflix',
      'DIS': 'Disney', 'BA': 'Boeing', 'V': 'Visa', 'JPM': 'JPMorgan', 'WMT': 'Walmart'
    },
    macroDependency: 'rvol'
  },
  futures: {
    name: 'Futures',
    symbols: ['GC=F', 'SI=F', 'CL=F', 'ES=F', 'NQ=F', 'YM=F', 'RTY=F', 'ZB=F', 'ZN=F', 'NG=F'],
    displayNames: {
      'GC=F': 'Gold', 'SI=F': 'Silver', 'CL=F': 'Crude Oil',
      'ES=F': 'S&P 500', 'NQ=F': 'Nasdaq 100', 'YM=F': 'Dow Jones', 'RTY=F': 'Russell 2000',
      'ZB=F': '30Y Bond', 'ZN=F': '10Y Note', 'NG=F': 'Natural Gas'
    },
    macroDependency: 'yieldCurve'
  }
};

const TIMEFRAMES = ['1m', '5m', '15m', '1h'] as const;

class HFConfluenceScanner {
  private positions: Map<string, PositionState> = new Map();
  private priceCache: Map<string, CandleData[]> = new Map();
  private macroCache: MacroContext | null = null;
  private lastMacroFetch = 0;
  private htfCache: Map<string, { data: CandleData[]; timestamp: number }> = new Map();
  private readonly HTF_CACHE_TTL = 30000;
  
  private getHigherTimeframe(tf: string): string {
    const mapping: Record<string, string> = {
      '1m': '5m',
      '5m': '15m',
      '15m': '1h',
      '1h': '1h'
    };
    return mapping[tf] || tf;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private calculateMACD(prices: number[], fast: number = 8, slow: number = 21, signalPeriod: number = 5): { 
    macd: number; signal: number; histogram: number; prevHistogram: number; 
    prevMacd: number; prevSignal: number; crossover: 'bullish' | 'bearish' | 'none' 
  } {
    if (prices.length < slow + signalPeriod) {
      return { macd: 0, signal: 0, histogram: 0, prevHistogram: 0, prevMacd: 0, prevSignal: 0, crossover: 'none' };
    }
    
    const macdLine: number[] = [];
    for (let i = slow; i <= prices.length; i++) {
      const slice = prices.slice(0, i);
      const emaFast = this.calculateEMA(slice, fast);
      const emaSlow = this.calculateEMA(slice, slow);
      macdLine.push(emaFast - emaSlow);
    }
    
    const signalLine: number[] = [];
    for (let i = signalPeriod; i <= macdLine.length; i++) {
      signalLine.push(this.calculateEMA(macdLine.slice(0, i), signalPeriod));
    }
    
    const macd = macdLine[macdLine.length - 1] || 0;
    const signal = signalLine[signalLine.length - 1] || 0;
    const histogram = macd - signal;
    
    const prevMacd = macdLine.length >= 2 ? macdLine[macdLine.length - 2] : macd;
    const prevSignal = signalLine.length >= 2 ? signalLine[signalLine.length - 2] : signal;
    const prevHistogram = prevMacd - prevSignal;
    
    let crossover: 'bullish' | 'bearish' | 'none' = 'none';
    if (prevMacd <= prevSignal && macd > signal) {
      crossover = 'bullish';
    } else if (prevMacd >= prevSignal && macd < signal) {
      crossover = 'bearish';
    }
    
    return { macd, signal, histogram, prevHistogram, prevMacd, prevSignal, crossover };
  }

  private calculateADX(candles: CandleData[], period: number = 14): number {
    if (candles.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    const plusDM: number[] = [];
    const minusDM: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevHigh = candles[i - 1].high;
      const prevLow = candles[i - 1].low;
      const prevClose = candles[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
      
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }
    
    if (trueRanges.length < period) return 0;
    
    let smoothedTR = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothedPlusDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothedMinusDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);
    
    const dxValues: number[] = [];
    
    for (let i = period; i < trueRanges.length; i++) {
      smoothedTR = smoothedTR - (smoothedTR / period) + trueRanges[i];
      smoothedPlusDM = smoothedPlusDM - (smoothedPlusDM / period) + plusDM[i];
      smoothedMinusDM = smoothedMinusDM - (smoothedMinusDM / period) + minusDM[i];
      
      const plusDI = smoothedTR > 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0;
      const minusDI = smoothedTR > 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0;
      
      const diSum = plusDI + minusDI;
      const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;
      dxValues.push(dx);
    }
    
    if (dxValues.length < period) {
      return dxValues.length > 0 ? dxValues[dxValues.length - 1] : 0;
    }
    
    let adx = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < dxValues.length; i++) {
      adx = ((adx * (period - 1)) + dxValues[i]) / period;
    }
    
    return adx;
  }

  private calculateRVOL(candles: CandleData[], lookback: number = 20): number {
    if (candles.length < lookback + 1) return 1.0;
    
    const currentVolume = candles[candles.length - 1].volume;
    const avgVolume = candles.slice(-lookback - 1, -1).reduce((sum, c) => sum + c.volume, 0) / lookback;
    
    return avgVolume > 0 ? currentVolume / avgVolume : 1.0;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateATR(candles: CandleData[], period: number = 14): number {
    if (candles.length < period) return 0;
    
    let atr = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const tr = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i - 1]?.close || candles[i].open),
        Math.abs(candles[i].low - candles[i - 1]?.close || candles[i].open)
      );
      atr += tr;
    }
    return atr / period;
  }

  private calculateWMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1] || 0;
    
    const slice = data.slice(-period);
    const divisor = (period * (period + 1)) / 2;
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += slice[i] * (i + 1);
    }
    return sum / divisor;
  }

  private calculateHullMA(prices: number[], period: number = 9): { current: number; prev: number } {
    if (prices.length < period + 5) {
      return { current: prices[prices.length - 1] || 0, prev: prices[prices.length - 2] || 0 };
    }
    
    const halfPeriod = Math.floor(period / 2);
    const sqrtPeriod = Math.floor(Math.sqrt(period));
    
    const rawHull: number[] = [];
    for (let i = period; i <= prices.length; i++) {
      const slice = prices.slice(0, i);
      const wmaHalf = this.calculateWMA(slice, halfPeriod);
      const wmaFull = this.calculateWMA(slice, period);
      rawHull.push(2 * wmaHalf - wmaFull);
    }
    
    const hullValues: number[] = [];
    for (let i = sqrtPeriod; i <= rawHull.length; i++) {
      hullValues.push(this.calculateWMA(rawHull.slice(0, i), sqrtPeriod));
    }
    
    return {
      current: hullValues[hullValues.length - 1] || prices[prices.length - 1],
      prev: hullValues[hullValues.length - 2] || prices[prices.length - 2]
    };
  }

  private calculateZLEMA(prices: number[], period: number = 9): { current: number; prev: number } {
    if (prices.length < period + 5) {
      return { current: prices[prices.length - 1] || 0, prev: prices[prices.length - 2] || 0 };
    }
    
    const lag = Math.floor((period - 1) / 2);
    const adjustedData: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i >= lag) {
        adjustedData.push(2 * prices[i] - prices[i - lag]);
      } else {
        adjustedData.push(prices[i]);
      }
    }
    
    const zlemaValues: number[] = [];
    const multiplier = 2 / (period + 1);
    let ema = adjustedData.slice(0, period).reduce((a, b) => a + b, 0) / period;
    zlemaValues.push(ema);
    
    for (let i = period; i < adjustedData.length; i++) {
      ema = (adjustedData[i] - ema) * multiplier + ema;
      zlemaValues.push(ema);
    }
    
    return {
      current: zlemaValues[zlemaValues.length - 1] || prices[prices.length - 1],
      prev: zlemaValues[zlemaValues.length - 2] || prices[prices.length - 2]
    };
  }

  private detectLiquiditySweeps(candles: CandleData[]): LiquiditySweep[] {
    const sweeps: LiquiditySweep[] = [];
    if (candles.length < 20) return sweeps;
    
    const recent = candles.slice(-15);
    const periodHigh = Math.max(...candles.slice(-20).map(c => c.high));
    const periodLow = Math.min(...candles.slice(-20).map(c => c.low));
    
    const levels = [
      { type: 'period_high', price: periodHigh },
      { type: 'period_low', price: periodLow }
    ];
    
    for (let i = 5; i < candles.length - 5; i++) {
      const c = candles[i];
      let isSwingHigh = true, isSwingLow = true;
      for (let j = 1; j <= 3; j++) {
        if (candles[i - j].high >= c.high || candles[i + j].high >= c.high) isSwingHigh = false;
        if (candles[i - j].low <= c.low || candles[i + j].low <= c.low) isSwingLow = false;
      }
      if (isSwingHigh) levels.push({ type: 'swing_high', price: c.high });
      if (isSwingLow) levels.push({ type: 'swing_low', price: c.low });
    }
    
    for (let i = 1; i < recent.length; i++) {
      const candle = recent[i - 1];
      const nextCandle = recent[i];
      
      for (const level of levels) {
        const isHighLevel = level.type.includes('high');
        const isLowLevel = level.type.includes('low');
        
        if (isHighLevel) {
          const wickedAbove = candle.high > level.price && candle.close < level.price;
          const reclaimed = nextCandle.close < level.price && nextCandle.close > candle.low;
          
          if (wickedAbove && reclaimed) {
            const wickSize = candle.high - Math.max(candle.open, candle.close);
            const bodySize = Math.abs(candle.close - candle.open) || 1;
            const quality = Math.min(wickSize / bodySize, 3);
            sweeps.push({ type: 'bearish', levelType: level.type, sweepPrice: candle.high, quality });
          }
        }
        
        if (isLowLevel) {
          const wickedBelow = candle.low < level.price && candle.close > level.price;
          const reclaimed = nextCandle.close > level.price && nextCandle.close < candle.high;
          
          if (wickedBelow && reclaimed) {
            const wickSize = Math.min(candle.open, candle.close) - candle.low;
            const bodySize = Math.abs(candle.close - candle.open) || 1;
            const quality = Math.min(wickSize / bodySize, 3);
            sweeps.push({ type: 'bullish', levelType: level.type, sweepPrice: candle.low, quality });
          }
        }
      }
    }
    
    return sweeps.slice(0, 5);
  }

  async fetchCandleData(symbol: string, timeframe: string): Promise<CandleData[]> {
    try {
      const intervalMap: Record<string, string> = {
        '1m': '1m', '5m': '5m', '15m': '15m', '1h': '60m'
      };
      const rangeMap: Record<string, string> = {
        '1m': '7d', '5m': '1mo', '15m': '1mo', '1h': '2y'
      };
      
      const interval = intervalMap[timeframe] || '5m';
      const range = rangeMap[timeframe] || '5d';
      
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result?.timestamp) return [];
      
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];
      
      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] && quote.high[i] && quote.low[i] && quote.close[i]) {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: quote.open[i],
            high: quote.high[i],
            low: quote.low[i],
            close: quote.close[i],
            volume: quote.volume[i] || 0
          });
        }
      }
      
      return candles;
    } catch (error) {
      console.error(`Error fetching candle data for ${symbol}:`, error);
      return [];
    }
  }

  async fetchMacroContext(): Promise<MacroContext> {
    const now = Date.now();
    if (this.macroCache && now - this.lastMacroFetch < 60000) {
      return this.macroCache;
    }

    try {
      const [dxyResponse, fearGreedResponse, spyResponse] = await Promise.all([
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?interval=1d&range=5d'),
        fetch('https://api.alternative.me/fng/?limit=1'),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=1mo')
      ]);

      let dxyValue = 103.5;
      let dxyTrend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      
      if (dxyResponse.ok) {
        const dxyData = await dxyResponse.json();
        const quotes = dxyData.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
        if (quotes?.length >= 2) {
          dxyValue = quotes[quotes.length - 1];
          const prevDxy = quotes[quotes.length - 2];
          dxyTrend = dxyValue > prevDxy ? 'bullish' : dxyValue < prevDxy ? 'bearish' : 'neutral';
        }
      }

      let fearGreedIndex = 50;
      if (fearGreedResponse.ok) {
        const fgData = await fearGreedResponse.json();
        fearGreedIndex = parseInt(fgData.data?.[0]?.value) || 50;
      }

      let rvol = 1.0;
      if (spyResponse.ok) {
        const spyData = await spyResponse.json();
        const volumes = spyData.chart?.result?.[0]?.indicators?.quote?.[0]?.volume;
        if (volumes?.length >= 10) {
          const currentVolume = volumes[volumes.length - 1] || 0;
          const avgVolume = volumes.slice(-20, -1).reduce((a: number, b: number) => a + (b || 0), 0) / 19;
          rvol = avgVolume > 0 ? currentVolume / avgVolume : 1.0;
        }
      }

      const orderFlow: 'positive' | 'negative' | 'neutral' = 
        fearGreedIndex > 55 ? 'positive' : fearGreedIndex < 45 ? 'negative' : 'neutral';
      
      const newsSentiment = fearGreedIndex / 100;

      this.macroCache = {
        dxyTrend,
        dxyValue,
        rvol: Math.round(rvol * 100) / 100,
        newsSentiment: Math.round(newsSentiment * 100) / 100,
        orderFlow,
        fearGreedIndex
      };
      this.lastMacroFetch = now;
      
      return this.macroCache;
    } catch (error) {
      console.error('Error fetching macro context:', error);
      return {
        dxyTrend: 'neutral',
        dxyValue: 103.5,
        rvol: 1.0,
        newsSentiment: 0.5,
        orderFlow: 'neutral',
        fearGreedIndex: 50
      };
    }
  }

  calculateIndicators(candles: CandleData[]): TechnicalIndicators | null {
    if (candles.length < 50) return null;
    
    const closes = candles.map(c => c.close);
    const currentCandle = candles[candles.length - 1];
    
    const ema8 = this.calculateEMA(closes, 8);
    const ema9 = this.calculateEMA(closes, 9);
    const ema18 = this.calculateEMA(closes, 18);
    const ema21 = this.calculateEMA(closes, 21);
    const ema50 = this.calculateEMA(closes, Math.min(50, candles.length - 1));
    const ema200Period = Math.min(200, candles.length - 1);
    const ema200 = this.calculateEMA(closes, ema200Period);
    
    const prevCloses = closes.slice(0, -1);
    const prevEma8 = this.calculateEMA(prevCloses, 8);
    const prevEma18 = this.calculateEMA(prevCloses, 18);
    
    const { macd, signal, histogram, prevHistogram, prevMacd, prevSignal, crossover } = this.calculateMACD(closes, 8, 21, 5);
    
    const goldenCross = ema8 > ema18 && prevEma8 <= prevEma18;
    const candleColor = currentCandle.close > currentCandle.open ? 'green' : 'red';
    
    const adx = this.calculateADX(candles, 14);
    const rvol = this.calculateRVOL(candles, 20);
    
    const hullData = this.calculateHullMA(closes, 9);
    const zlemaData = this.calculateZLEMA(closes, 9);
    const liquiditySweeps = this.detectLiquiditySweeps(candles);
    
    const hullTrending = hullData.current > hullData.prev ? 'bullish' : 'bearish';
    const zlemaTrending = zlemaData.current > zlemaData.prev ? 'bullish' : 'bearish';
    const emaTrending = ema8 > ema18 ? 'bullish' : 'bearish';
    const multiTimeframeTrend: 'bullish' | 'bearish' | 'mixed' = 
      (hullTrending === zlemaTrending && hullTrending === emaTrending) ? hullTrending : 'mixed';
    
    return {
      ema8,
      ema9,
      ema18,
      ema21,
      ema50,
      ema200,
      macd,
      macdSignal: signal,
      macdHistogram: histogram,
      prevMacdHistogram: prevHistogram,
      prevMacd,
      prevMacdSignal: prevSignal,
      macdCrossover: crossover,
      adx,
      rsi: this.calculateRSI(closes),
      atr: this.calculateATR(candles),
      rvol,
      candleColor,
      goldenCross,
      priceAbove200EMA: currentCandle.close > ema200,
      priceAbove50EMA: currentCandle.close > ema50,
      hullMA: hullData.current,
      hullMAPrev: hullData.prev,
      zlema: zlemaData.current,
      zlemaPrev: zlemaData.prev,
      liquiditySweeps,
      multiTimeframeTrend
    };
  }

  evaluateConfluence(
    symbol: string,
    displayName: string,
    assetClass: string,
    timeframe: string,
    indicators: TechnicalIndicators,
    macro: MacroContext,
    currentPrice: number
  ): ConfluenceSignal {
    const reasoning: string[] = [];
    let confluenceScore = 0;
    const maxScore = 5;
    
    const position = this.positions.get(symbol);
    const isInPosition = position?.isOpen || false;
    
    const isHFScalp = assetClass === 'hfscalp' || assetClass === 'stocks';

    if (isHFScalp) {
      if (indicators.priceAbove50EMA) {
        confluenceScore++;
        reasoning.push('✅ GATE 1: Price > 50 EMA (Floor Trend)');
      } else {
        reasoning.push('❌ GATE 1: Price < 50 EMA');
      }

      if (indicators.ema8 > indicators.ema18) {
        confluenceScore++;
        reasoning.push('✅ GATE 2: 8 EMA > 18 EMA (Fast Cross)');
        if (indicators.goldenCross) {
          reasoning.push('🌟 FRESH CROSS detected!');
        }
      } else {
        reasoning.push('❌ GATE 2: 8 EMA < 18 EMA');
      }

      if (indicators.adx > 25) {
        confluenceScore++;
        reasoning.push(`✅ GATE 3: ADX ${indicators.adx.toFixed(1)} > 25 (Trend Strength)`);
      } else {
        reasoning.push(`❌ GATE 3: ADX ${indicators.adx.toFixed(1)} < 25`);
      }

      const histogramRising = indicators.macdHistogram > indicators.prevMacdHistogram;
      if (indicators.macdHistogram > 0 && histogramRising) {
        confluenceScore++;
        reasoning.push(`✅ GATE 4: MACD(8,21,5) Hist > 0 & Rising`);
      } else {
        reasoning.push(`❌ GATE 4: MACD Hist ${indicators.macdHistogram > 0 ? 'positive but falling' : 'negative'}`);
      }

      if (indicators.rvol > 2.0) {
        confluenceScore++;
        reasoning.push(`✅ GATE 5: RVOL ${indicators.rvol.toFixed(2)} > 2.0 (Volume Participation)`);
      } else {
        reasoning.push(`❌ GATE 5: RVOL ${indicators.rvol.toFixed(2)} < 2.0`);
      }

    } else {
      if (indicators.priceAbove200EMA) {
        confluenceScore++;
        reasoning.push('✅ GATE 1: Price > 200 EMA (Long-term trend)');
      } else {
        reasoning.push('❌ GATE 1: Price < 200 EMA');
      }

      if (indicators.ema9 > indicators.ema21) {
        confluenceScore++;
        reasoning.push('✅ GATE 2: 9 EMA > 21 EMA (Momentum)');
      } else {
        reasoning.push('❌ GATE 2: 9 EMA < 21 EMA');
      }

      if (indicators.macdCrossover === 'bullish') {
        confluenceScore++;
        reasoning.push('✅ GATE 3: MACD BULLISH CROSSOVER (Buy Signal!)');
      } else if (indicators.macd > indicators.macdSignal) {
        confluenceScore++;
        reasoning.push('✅ GATE 3: MACD > Signal (Bullish)');
      } else if (indicators.macdCrossover === 'bearish') {
        reasoning.push('🔴 GATE 3: MACD BEARISH CROSSOVER (Sell Signal!)');
      } else {
        reasoning.push('❌ GATE 3: MACD < Signal');
      }

      let macroPass = false;
      if (assetClass === 'forex') {
        if (macro.dxyTrend === 'bearish') {
          macroPass = true;
          reasoning.push(`✅ GATE 4: DXY bearish (${macro.dxyValue.toFixed(2)})`);
        } else {
          reasoning.push(`❌ GATE 4: DXY ${macro.dxyTrend}`);
        }
      } else if (assetClass === 'crypto') {
        if (macro.orderFlow === 'positive') {
          macroPass = true;
          reasoning.push(`✅ GATE 4: Order flow positive (F&G: ${macro.fearGreedIndex})`);
        } else {
          reasoning.push(`❌ GATE 4: Order flow ${macro.orderFlow}`);
        }
      } else if (assetClass === 'futures') {
        if (indicators.adx > 20) {
          macroPass = true;
          reasoning.push(`✅ GATE 4: ADX ${indicators.adx.toFixed(1)} > 20 (Trend confirmed)`);
        } else {
          reasoning.push(`❌ GATE 4: ADX ${indicators.adx.toFixed(1)} weak trend`);
        }
      }
      
      if (macroPass) confluenceScore++;

      if (indicators.rsi > 30 && indicators.rsi < 70) {
        confluenceScore++;
        reasoning.push(`✅ GATE 5: RSI ${indicators.rsi.toFixed(1)} optimal`);
      } else {
        reasoning.push(`⚠️ GATE 5: RSI ${indicators.rsi.toFixed(1)} ${indicators.rsi > 70 ? 'overbought' : 'oversold'}`);
      }
    }

    if (indicators.liquiditySweeps.length > 0) {
      const sweep = indicators.liquiditySweeps[0];
      reasoning.push(`🌊 Liquidity sweep detected: ${sweep.type} at ${sweep.levelType} (quality: ${sweep.quality.toFixed(2)})`);
      if (sweep.type === 'bullish' && indicators.macdCrossover === 'bullish') {
        confluenceScore = Math.min(confluenceScore + 1, maxScore);
        reasoning.push('✅ BONUS: Bullish sweep + MACD cross alignment');
      }
    }
    
    if (indicators.multiTimeframeTrend !== 'mixed') {
      reasoning.push(`📊 Multi-TF trend aligned: ${indicators.multiTimeframeTrend} (Hull + ZLEMA + EMA)`);
    }
    
    const hullBullish = indicators.hullMA > indicators.hullMAPrev;
    const zlemaBullish = indicators.zlema > indicators.zlemaPrev;
    if (hullBullish && zlemaBullish) {
      reasoning.push(`⚡ Zero-lag indicators confirm bullish momentum`);
    } else if (!hullBullish && !zlemaBullish) {
      reasoning.push(`⚡ Zero-lag indicators confirm bearish momentum`);
    }

    let signalType: 'ENTRY' | 'EXIT' | 'HOLD' = 'HOLD';
    let audioTrigger: 'entry' | 'exit' | null = null;

    const isRedCandle = indicators.candleColor === 'red';
    const isMomentumFading = indicators.macdHistogram < indicators.prevMacdHistogram;
    const isStructuralBreach = currentPrice < indicators.ema8;
    const isBearishMacdCross = indicators.macdCrossover === 'bearish';
    const isBullishMacdCross = indicators.macdCrossover === 'bullish';
    
    const mismatchDetected = isRedCandle || isMomentumFading || isStructuralBreach || isBearishMacdCross;

    if (isInPosition && mismatchDetected) {
      signalType = 'EXIT';
      audioTrigger = 'exit';
      const exitReasons: string[] = [];
      if (isBearishMacdCross) exitReasons.push('MACD Bearish Cross');
      if (isRedCandle) exitReasons.push('Red Candle');
      if (isMomentumFading) exitReasons.push('Momentum Fade');
      if (isStructuralBreach) exitReasons.push('Structural Breach');
      reasoning.push(`🔴 SELL SIGNAL: ${exitReasons.join(' + ')}`);
      this.positions.delete(symbol);
    } else if (!isInPosition && confluenceScore === 5) {
      signalType = 'ENTRY';
      audioTrigger = 'entry';
      reasoning.push('🎯 PERFECT SCENARIO: All 5 gates OPEN!');
      this.positions.set(symbol, {
        symbol,
        entryTime: Date.now(),
        entryPrice: currentPrice,
        isOpen: true
      });
    } else if (!isInPosition && confluenceScore >= 4 && isBullishMacdCross) {
      signalType = 'ENTRY';
      audioTrigger = 'entry';
      reasoning.push('🟢 BUY SIGNAL: MACD Bullish Crossover + Strong Confluence!');
      this.positions.set(symbol, {
        symbol,
        entryTime: Date.now(),
        entryPrice: currentPrice,
        isOpen: true
      });
    } else if (!isInPosition && confluenceScore >= 4) {
      reasoning.push(`📊 ${confluenceScore}/5 gates open - awaiting MACD crossover...`);
    } else if (isBullishMacdCross) {
      reasoning.push('📈 MACD Bullish Cross detected - waiting for more gates');
    } else if (isBearishMacdCross) {
      reasoning.push('📉 MACD Bearish Cross - avoid entry');
    }

    const atr = indicators.atr;
    const stopLoss = currentPrice - (atr * 1.5);
    const targetPrice = currentPrice + (atr * 3);
    const riskRewardRatio = (targetPrice - currentPrice) / (currentPrice - stopLoss);

    return {
      symbol,
      displayName,
      assetClass,
      timeframe,
      signalType,
      confluenceScore,
      maxScore,
      indicators,
      macro,
      entryPrice: currentPrice,
      stopLoss,
      targetPrice,
      riskRewardRatio,
      reasoning,
      timestamp: new Date().toISOString(),
      audioTrigger
    };
  }

  private async fetchHigherTimeframeData(symbol: string, currentTf: string): Promise<CandleData[]> {
    const htf = this.getHigherTimeframe(currentTf);
    if (htf === currentTf) return [];
    
    const cacheKey = `${symbol}_${htf}`;
    const now = Date.now();
    const cached = this.htfCache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < this.HTF_CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const candles = await this.fetchCandleData(symbol, htf);
      this.htfCache.set(cacheKey, { data: candles, timestamp: now });
      return candles;
    } catch (error) {
      console.error(`Error fetching HTF data for ${symbol}:`, error);
      return [];
    }
  }
  
  private determineMultiTimeframeTrend(
    currentTfIndicators: TechnicalIndicators,
    htfCandles: CandleData[]
  ): 'bullish' | 'bearish' | 'mixed' {
    const currentBullish = currentTfIndicators.hullMA > currentTfIndicators.hullMAPrev &&
                          currentTfIndicators.zlema > currentTfIndicators.zlemaPrev &&
                          currentTfIndicators.ema8 > currentTfIndicators.ema18;
    const currentBearish = currentTfIndicators.hullMA < currentTfIndicators.hullMAPrev &&
                          currentTfIndicators.zlema < currentTfIndicators.zlemaPrev &&
                          currentTfIndicators.ema8 < currentTfIndicators.ema18;
    
    if (htfCandles.length < 20) {
      return currentBullish ? 'bullish' : currentBearish ? 'bearish' : 'mixed';
    }
    
    const htfCloses = htfCandles.map(c => c.close);
    const htfEma8 = this.calculateEMA(htfCloses, 8);
    const htfEma18 = this.calculateEMA(htfCloses, 18);
    const htfHull = this.calculateHullMA(htfCloses, 9);
    
    const htfBullish = htfHull.current > htfHull.prev && htfEma8 > htfEma18;
    const htfBearish = htfHull.current < htfHull.prev && htfEma8 < htfEma18;
    
    if (currentBullish && htfBullish) return 'bullish';
    if (currentBearish && htfBearish) return 'bearish';
    return 'mixed';
  }

  async scanSymbol(symbol: string, displayName: string, assetClass: string, timeframe: string): Promise<ConfluenceSignal | null> {
    try {
      const [candles, htfCandles] = await Promise.all([
        this.fetchCandleData(symbol, timeframe),
        this.fetchHigherTimeframeData(symbol, timeframe)
      ]);
      
      if (candles.length < 30) {
        console.log(`Insufficient data for ${symbol}: ${candles.length} candles (need 30+)`);
        return null;
      }

      const indicators = this.calculateIndicators(candles);
      if (!indicators) return null;
      
      indicators.multiTimeframeTrend = this.determineMultiTimeframeTrend(indicators, htfCandles);

      const orderFlow = orderFlowIntelligence.analyzeOrderFlow(candles as any);
      const pressureMeter = orderFlowIntelligence.calculatePressure(candles as any);

      const macro = await this.fetchMacroContext();
      const currentPrice = candles[candles.length - 1].close;

      const signal = this.evaluateConfluence(
        symbol,
        displayName,
        assetClass,
        timeframe,
        indicators,
        macro,
        currentPrice
      );

      return {
        ...signal,
        orderFlow,
        pressureMeter
      };
    } catch (error) {
      console.error(`Error scanning ${symbol}:`, error);
      return null;
    }
  }

  async scanAssetClass(assetClass: keyof typeof ASSET_CLASSES, timeframe: string): Promise<ConfluenceSignal[]> {
    const assetConfig = ASSET_CLASSES[assetClass];
    const signals: ConfluenceSignal[] = [];

    const scanPromises = assetConfig.symbols.map(symbol => 
      this.scanSymbol(
        symbol, 
        assetConfig.displayNames[symbol] || symbol,
        assetClass,
        timeframe
      )
    );

    const results = await Promise.allSettled(scanPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        signals.push(result.value);
      }
    }

    return signals.sort((a, b) => b.confluenceScore - a.confluenceScore);
  }

  getActivePositions(): PositionState[] {
    return Array.from(this.positions.values()).filter(p => p.isOpen);
  }
}

const scanner = new HFConfluenceScanner();
const router = Router();

router.get('/asset-classes', (_req, res) => {
  const classes = Object.entries(ASSET_CLASSES).map(([key, value]) => ({
    id: key,
    name: value.name,
    symbolCount: value.symbols.length,
    symbols: value.symbols.map(s => ({
      symbol: s,
      displayName: value.displayNames[s] || s
    }))
  }));
  
  res.json({
    assetClasses: classes,
    timeframes: TIMEFRAMES
  });
});

router.get('/scan', async (req, res) => {
  try {
    const assetClass = (req.query.assetClass as string) || 'crypto';
    const timeframe = (req.query.timeframe as string) || '5m';
    
    if (!ASSET_CLASSES[assetClass as keyof typeof ASSET_CLASSES]) {
      return res.status(400).json({ error: 'Invalid asset class' });
    }
    
    if (!TIMEFRAMES.includes(timeframe as any)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }
    
    const signals = await scanner.scanAssetClass(
      assetClass as keyof typeof ASSET_CLASSES,
      timeframe
    );
    
    const entrySignals = signals.filter(s => s.signalType === 'ENTRY');
    const exitSignals = signals.filter(s => s.signalType === 'EXIT');
    
    res.json({
      assetClass,
      timeframe,
      timestamp: new Date().toISOString(),
      totalScanned: ASSET_CLASSES[assetClass as keyof typeof ASSET_CLASSES].symbols.length,
      signals,
      entrySignals,
      exitSignals,
      activePositions: scanner.getActivePositions(),
      macro: await scanner.fetchMacroContext()
    });
  } catch (error) {
    console.error('Confluence scan error:', error);
    res.status(500).json({ error: 'Failed to perform confluence scan' });
  }
});

router.get('/scan/:assetClass/:timeframe', async (req, res) => {
  try {
    const { assetClass, timeframe } = req.params;
    
    if (!ASSET_CLASSES[assetClass as keyof typeof ASSET_CLASSES]) {
      return res.status(400).json({ error: 'Invalid asset class' });
    }
    
    if (!TIMEFRAMES.includes(timeframe as any)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }
    
    console.log(`🔍 Confluence scanning ${assetClass} on ${timeframe} timeframe...`);
    
    const signals = await scanner.scanAssetClass(
      assetClass as keyof typeof ASSET_CLASSES,
      timeframe
    );
    
    const entrySignals = signals.filter(s => s.signalType === 'ENTRY');
    const exitSignals = signals.filter(s => s.signalType === 'EXIT');
    
    console.log(`✅ Found ${signals.length} signals (${entrySignals.length} entries, ${exitSignals.length} exits)`);
    
    res.json({
      assetClass,
      timeframe,
      timestamp: new Date().toISOString(),
      totalScanned: ASSET_CLASSES[assetClass as keyof typeof ASSET_CLASSES].symbols.length,
      signals,
      entrySignals,
      exitSignals,
      activePositions: scanner.getActivePositions(),
      macro: await scanner.fetchMacroContext()
    });
  } catch (error) {
    console.error('Confluence scan error:', error);
    res.status(500).json({ error: 'Failed to perform confluence scan' });
  }
});

router.get('/scan-single', async (req, res) => {
  try {
    const symbol = req.query.symbol as string;
    const timeframe = (req.query.timeframe as string) || '5m';
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol required' });
    }

    let assetClass = 'stocks';
    let displayName = symbol;
    
    for (const [key, config] of Object.entries(ASSET_CLASSES)) {
      if (config.symbols.includes(symbol)) {
        assetClass = key;
        displayName = config.displayNames[symbol] || symbol;
        break;
      }
    }
    
    const signal = await scanner.scanSymbol(symbol, displayName, assetClass, timeframe);
    
    if (!signal) {
      return res.status(400).json({ error: 'Could not analyze symbol - insufficient data' });
    }
    
    res.json({
      signal,
      macro: await scanner.fetchMacroContext()
    });
  } catch (error) {
    console.error('Single scan error:', error);
    res.status(500).json({ error: 'Failed to scan symbol' });
  }
});

router.get('/macro', async (_req, res) => {
  try {
    const macro = await scanner.fetchMacroContext();
    res.json(macro);
  } catch (error) {
    console.error('Macro fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch macro context' });
  }
});

router.get('/positions', (_req, res) => {
  res.json({
    positions: scanner.getActivePositions()
  });
});

export default router;
