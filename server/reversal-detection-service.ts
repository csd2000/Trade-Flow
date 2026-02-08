import Anthropic from '@anthropic-ai/sdk';

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface NormalizedMarketEvent {
  symbol: string;
  mappedSymbol: string;
  timestamp: number;
  type: 'trade' | 'quote' | 'candle' | 'darkpool_trade' | 'options_trade' | 'news' | 'sentiment' | 'whale_tx';
  source: string;
  latencyMs: number;
  qualityFlags: {
    isDelayed: boolean;
    isStale: boolean;
    hasGaps: boolean;
    rateLimitHit: boolean;
    confidence: number;
  };
  data: any;
}

interface DarkPoolPrint {
  timestamp: number;
  price: number;
  size: number;
  value: number;
  exchange: string;
  nearestLitPrice: number;
  relativeSize: number;
  levelProximity: {
    nearVWAP: boolean;
    nearPDH: boolean;
    nearPDL: boolean;
    nearSwingLevel: boolean;
    distancePercent: number;
  };
}

interface DarkPoolCluster {
  startTime: number;
  endTime: number;
  prints: DarkPoolPrint[];
  totalValue: number;
  avgPrice: number;
  pattern: 'cluster' | 'absorption' | 'markup' | 'support_reinforcement';
  significance: number;
}

interface StopHuntSignal {
  type: 'equal_highs_sweep' | 'equal_lows_sweep' | 'pdh_raid' | 'pdl_raid' | 'session_sweep' | 'swing_sweep';
  level: number;
  sweepPrice: number;
  reclaimPrice: number;
  reclaimConfirmed: boolean;
  direction: 'bullish' | 'bearish';
  wickSignature: number;
  volumeSpike: boolean;
  confirmations: string[];
}

interface TrapSignal {
  type: 'breakout_failure' | 'false_breakout' | 'liquidity_grab';
  level: number;
  breakoutPrice: number;
  failurePrice: number;
  barsToFailure: number;
  coincidingFactors: string[];
  probability: number;
}

interface AlertEpisode {
  id: string;
  symbol: string;
  startTime: number;
  alerts: ReversalSignal[];
  clusteredReason: string;
}

interface SentimentRiskModifier {
  newsAlignment: number;
  fearGreedModifier: number;
  whaleActivityModifier: number;
  totalModifier: number;
  reasoning: string;
}

export interface ScanReport {
  totals: {
    attempted: number;
    analyzed: number;
    signaled: number;
    emitted: number;
    throttled: number;
    errors: number;
  };
  signals: ReversalSignal[];
  errors: { symbol: string; message: string }[];
}

interface TechnicalIndicators {
  rsi14: number;
  rsiPrev: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  macdPrev: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema9: number;
  ema21: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  atr14: number;
  stochK: number;
  stochD: number;
  obv: number;
  vwap: number;
  volumeRatio?: number;
}

interface DivergenceSignal {
  type: 'bullish' | 'bearish' | 'hidden_bullish' | 'hidden_bearish' | 'none';
  indicator: string;
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  confidence: number;
}

interface SentimentData {
  overallScore: number;
  newsScore: number;
  socialScore: number;
  institutionalFlow: 'accumulating' | 'distributing' | 'neutral';
  fearGreedIndex: number;
  sources: string[];
}

interface InstitutionalSignals {
  liquiditySweep: {
    detected: boolean;
    direction: 'bullish' | 'bearish' | 'none';
    sweepLevel: number;
    rejectionStrength: number;
  };
  fairValueGap: {
    detected: boolean;
    direction: 'bullish' | 'bearish' | 'none';
    gapSize: number;
    gapZone: { high: number; low: number };
  };
  orderBlock: {
    detected: boolean;
    type: 'accumulation' | 'distribution' | 'none';
    zone: { high: number; low: number };
    volumeConfirmation: boolean;
  };
  volumeDelta: {
    cvd: number;
    deltaZScore: number;
    absorption: boolean;
    exhaustion: boolean;
  };
  rvol: number;
}

interface SevenGateValidation {
  gate1_rsiExtreme: boolean;
  gate2_divergencePresent: boolean;
  gate3_macdCrossover: boolean;
  gate4_stochOversoldOverbought: boolean;
  gate5_volumeSpike: boolean;
  gate6_priceAtSupRes: boolean;
  gate7_sentimentExtreme: boolean;
  gate8_liquiditySweep: boolean;
  gate9_fvgPresent: boolean;
  gate10_orderBlockConfirm: boolean;
  gatesPassed: number;
  institutionalGatesPassed: number;
  isConfirmed: boolean;
  confidencePercent: number;
}

interface ReversalSignal {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent: number;
  reversalType: 'bullish_reversal' | 'bearish_reversal' | 'continuation' | 'neutral';
  reversalProbability: number;
  aiScore: number;
  technicalScore: number;
  sentimentScore: number;
  divergences: DivergenceSignal[];
  sevenGates: SevenGateValidation;
  institutionalSignals: InstitutionalSignals;
  audioTrigger: 'reversal' | 'alert' | null;
  indicators: TechnicalIndicators;
  sentiment: SentimentData;
  aiAnalysis: string;
  hedgeFundInsight: string;
  keyLevels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    pivotPoint: number;
  };
  tradeSetup: {
    direction: 'long' | 'short' | 'wait';
    entryZone: { low: number; high: number };
    stopLoss: number;
    target1: number;
    target2: number;
    riskRewardRatio: number;
  };
  timestamp: string;
  timeframe?: string;
}

export class ReversalDetectionService {
  private anthropic: Anthropic | null = null;
  private priceCache: Map<string, { data: PriceData[]; cached: number }> = new Map();
  private alphaVantageKey: string;
  private polygonKey: string;
  private alertEpisodes: Map<string, AlertEpisode> = new Map();
  private readonly ALERT_EPISODE_WINDOW = 300000;
  private readonly SYMBOL_MAP: Record<string, Record<string, string>> = {
    binance: { 'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'SPY': 'SPY' },
    yahoo: { 'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'SPY': 'SPY' },
    polygon: { 'BTC': 'X:BTCUSD', 'ETH': 'X:ETHUSD', 'SPY': 'SPY' }
  };
  private dataQualityMetrics: Map<string, { lastUpdate: number; latencyMs: number; gaps: number }> = new Map();

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.polygonKey = process.env.POLYGON_API_KEY || '';
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  mapSymbol(symbol: string, venue: string): string {
    const normalized = symbol.toUpperCase().replace('-USD', '').replace('USDT', '');
    return this.SYMBOL_MAP[venue]?.[normalized] || symbol;
  }

  createNormalizedEvent(
    symbol: string,
    type: NormalizedMarketEvent['type'],
    source: string,
    data: any,
    fetchStart: number
  ): NormalizedMarketEvent {
    const now = Date.now();
    const latencyMs = now - fetchStart;
    const quality = this.dataQualityMetrics.get(symbol);
    const isStale = quality ? (now - quality.lastUpdate) > 60000 : false;
    
    return {
      symbol,
      mappedSymbol: this.mapSymbol(symbol, source),
      timestamp: now,
      type,
      source,
      latencyMs,
      qualityFlags: {
        isDelayed: latencyMs > 5000,
        isStale,
        hasGaps: quality ? quality.gaps > 0 : false,
        rateLimitHit: latencyMs > 10000,
        confidence: Math.max(0, 100 - (latencyMs / 100) - (quality?.gaps || 0) * 10)
      },
      data
    };
  }

  updateDataQuality(symbol: string, latencyMs: number, hasGap: boolean): void {
    const existing = this.dataQualityMetrics.get(symbol) || { lastUpdate: 0, latencyMs: 0, gaps: 0 };
    this.dataQualityMetrics.set(symbol, {
      lastUpdate: Date.now(),
      latencyMs,
      gaps: hasGap ? existing.gaps + 1 : Math.max(0, existing.gaps - 1)
    });
  }

  private async fetchAlpacaData(symbol: string): Promise<PriceData[]> {
    const alpacaKey = process.env.ALPACA_API_KEY;
    const alpacaSecret = process.env.ALPACA_SECRET_KEY;
    
    if (!alpacaKey || !alpacaSecret) return [];
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?start=${startDate}&end=${endDate}&timeframe=1Day&limit=365`;
      const response = await fetch(url, {
        headers: {
          'APCA-API-KEY-ID': alpacaKey,
          'APCA-API-SECRET-KEY': alpacaSecret
        }
      });
      
      if (!response.ok) {
        console.log(`⚠️ Alpaca returned ${response.status} for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data.bars || data.bars.length === 0) return [];
      
      const priceData: PriceData[] = data.bars.map((bar: any) => ({
        date: bar.t.split('T')[0],
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));
      
      console.log(`✅ Alpaca: ${priceData.length} bars for ${symbol}`);
      return priceData;
    } catch (error: any) {
      console.log(`⚠️ Alpaca error for ${symbol}: ${error.message}`);
      return [];
    }
  }

  private async fetchYahooData(symbol: string): Promise<PriceData[]> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result) return [];

      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      
      const priceData: PriceData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.close?.[i] != null) {
          priceData.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: quotes.open?.[i] || quotes.close[i],
            high: quotes.high?.[i] || quotes.close[i],
            low: quotes.low?.[i] || quotes.close[i],
            close: quotes.close[i],
            volume: quotes.volume?.[i] || 0
          });
        }
      }

      console.log(`✅ Yahoo: ${priceData.length} bars for ${symbol}`);
      return priceData;
    } catch (error: any) {
      console.log(`⚠️ Yahoo error for ${symbol}: ${error.message}`);
      return [];
    }
  }

  async fetchHistoricalData(symbol: string): Promise<PriceData[]> {
    const cacheKey = symbol;
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.cached < 300000) {
      return cached.data;
    }

    const fetchStart = Date.now();
    let priceData: PriceData[] = [];
    let source = '';

    // 1. Try Alpaca first (best for real-time, high-frequency)
    priceData = await this.fetchAlpacaData(symbol);
    if (priceData.length > 0) {
      source = 'Alpaca';
    }

    // 2. Fallback to Yahoo Finance (unlimited, no key needed)
    if (priceData.length === 0) {
      console.log(`📊 Alpaca unavailable for ${symbol}, trying Yahoo...`);
      priceData = await this.fetchYahooData(symbol);
      if (priceData.length > 0) {
        source = 'Yahoo';
      }
    }

    // 3. Last resort: Alpha Vantage (25 req/day limit)
    if (priceData.length === 0) {
      console.log(`📊 Yahoo unavailable for ${symbol}, trying Alpha Vantage...`);
      priceData = await this.fetchAlphaVantageData(symbol);
      if (priceData.length > 0) {
        source = 'AlphaVantage';
      }
    }

    const latencyMs = Date.now() - fetchStart;
    const hasGaps = priceData.length > 1 && 
      priceData.some((d, i) => i > 0 && 
        new Date(d.date).getTime() - new Date(priceData[i-1].date).getTime() > 86400000 * 4);
    
    this.updateDataQuality(symbol, latencyMs, hasGaps);
    
    if (priceData.length > 0) {
      this.priceCache.set(cacheKey, { data: priceData, cached: Date.now() });
    }
    
    return priceData;
  }

  private async fetchAlphaVantageData(symbol: string): Promise<PriceData[]> {
    if (!this.alphaVantageKey) return [];
    
    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${this.alphaVantageKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) return [];
      
      const priceData: PriceData[] = [];
      for (const [date, values] of Object.entries(timeSeries)) {
        const v = values as any;
        priceData.push({
          date,
          open: parseFloat(v['1. open']),
          high: parseFloat(v['2. high']),
          low: parseFloat(v['3. low']),
          close: parseFloat(v['4. close']),
          volume: parseInt(v['5. volume'])
        });
      }
      
      return priceData.reverse();
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
      return [];
    }
  }

  calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    const macd: number[] = [];
    const startIdx = 26 - 1;
    
    for (let i = startIdx; i < prices.length; i++) {
      macd.push(ema12[i - (12 - 1)] - ema26[i - startIdx]);
    }
    
    const signal = this.calculateEMA(macd, 9);
    const histogram: number[] = [];
    
    for (let i = 8; i < macd.length; i++) {
      histogram.push(macd[i] - signal[i - 8]);
    }
    
    return { macd, signal, histogram };
  }

  calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema.push(sum / period);
    
    for (let i = period; i < prices.length; i++) {
      ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
    }
    
    return ema;
  }

  calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number[]; middle: number[]; lower: number[] } {
    const sma = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
    
    return { upper, middle: sma, lower };
  }

  calculateATR(priceData: PriceData[], period: number = 14): number[] {
    const tr: number[] = [];
    
    for (let i = 1; i < priceData.length; i++) {
      const high = priceData[i].high;
      const low = priceData[i].low;
      const prevClose = priceData[i - 1].close;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      tr.push(Math.max(tr1, tr2, tr3));
    }
    
    const atr: number[] = [];
    let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    atr.push(sum / period);
    
    for (let i = period; i < tr.length; i++) {
      atr.push((atr[atr.length - 1] * (period - 1) + tr[i]) / period);
    }
    
    return atr;
  }

  calculateStochastic(priceData: PriceData[], kPeriod: number = 14, dPeriod: number = 3): { k: number[]; d: number[] } {
    const kValues: number[] = [];
    
    for (let i = kPeriod - 1; i < priceData.length; i++) {
      const slice = priceData.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(d => d.high));
      const lowestLow = Math.min(...slice.map(d => d.low));
      const close = priceData[i].close;
      
      const k = ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }
    
    const dValues = this.calculateSMA(kValues, dPeriod);
    
    return { k: kValues, d: dValues };
  }

  calculateOBV(priceData: PriceData[]): number[] {
    const obv: number[] = [0];
    
    for (let i = 1; i < priceData.length; i++) {
      if (priceData[i].close > priceData[i - 1].close) {
        obv.push(obv[obv.length - 1] + priceData[i].volume);
      } else if (priceData[i].close < priceData[i - 1].close) {
        obv.push(obv[obv.length - 1] - priceData[i].volume);
      } else {
        obv.push(obv[obv.length - 1]);
      }
    }
    
    return obv;
  }

  detectDivergence(prices: number[], indicator: number[], lookback: number = 20): DivergenceSignal {
    if (prices.length < lookback || indicator.length < lookback) {
      return { type: 'none', indicator: 'N/A', strength: 'weak', description: 'Insufficient data', confidence: 0 };
    }

    const recentPrices = prices.slice(-lookback);
    const recentIndicator = indicator.slice(-lookback);
    
    const findSwingHighs = (arr: number[]): number[] => {
      const highs: number[] = [];
      for (let i = 2; i < arr.length - 2; i++) {
        if (arr[i] > arr[i-1] && arr[i] > arr[i-2] && arr[i] > arr[i+1] && arr[i] > arr[i+2]) {
          highs.push(i);
        }
      }
      return highs;
    };
    
    const findSwingLows = (arr: number[]): number[] => {
      const lows: number[] = [];
      for (let i = 2; i < arr.length - 2; i++) {
        if (arr[i] < arr[i-1] && arr[i] < arr[i-2] && arr[i] < arr[i+1] && arr[i] < arr[i+2]) {
          lows.push(i);
        }
      }
      return lows;
    };
    
    const priceHighs = findSwingHighs(recentPrices);
    const priceLows = findSwingLows(recentPrices);
    const indicatorHighs = findSwingHighs(recentIndicator);
    const indicatorLows = findSwingLows(recentIndicator);
    
    if (priceHighs.length >= 2 && indicatorHighs.length >= 2) {
      const lastPriceHigh = priceHighs[priceHighs.length - 1];
      const prevPriceHigh = priceHighs[priceHighs.length - 2];
      const lastIndHigh = indicatorHighs[indicatorHighs.length - 1];
      const prevIndHigh = indicatorHighs[indicatorHighs.length - 2];
      
      if (recentPrices[lastPriceHigh] > recentPrices[prevPriceHigh] && 
          recentIndicator[lastIndHigh] < recentIndicator[prevIndHigh]) {
        const priceDiff = (recentPrices[lastPriceHigh] - recentPrices[prevPriceHigh]) / recentPrices[prevPriceHigh];
        const indDiff = (recentIndicator[prevIndHigh] - recentIndicator[lastIndHigh]) / recentIndicator[prevIndHigh];
        const divergenceStrength = priceDiff + indDiff;
        
        const strength = divergenceStrength > 0.15 ? 'strong' : divergenceStrength > 0.08 ? 'moderate' : 'weak';
        return {
          type: 'bearish',
          indicator: 'RSI',
          strength,
          description: `Price made higher high ($${recentPrices[lastPriceHigh].toFixed(2)} vs $${recentPrices[prevPriceHigh].toFixed(2)}) while RSI made lower high (${recentIndicator[lastIndHigh].toFixed(1)} vs ${recentIndicator[prevIndHigh].toFixed(1)}) - bearish divergence`,
          confidence: strength === 'strong' ? 85 : strength === 'moderate' ? 72 : 58
        };
      }
    }
    
    if (priceLows.length >= 2 && indicatorLows.length >= 2) {
      const lastPriceLow = priceLows[priceLows.length - 1];
      const prevPriceLow = priceLows[priceLows.length - 2];
      const lastIndLow = indicatorLows[indicatorLows.length - 1];
      const prevIndLow = indicatorLows[indicatorLows.length - 2];
      
      if (recentPrices[lastPriceLow] < recentPrices[prevPriceLow] && 
          recentIndicator[lastIndLow] > recentIndicator[prevIndLow]) {
        const priceDiff = (recentPrices[prevPriceLow] - recentPrices[lastPriceLow]) / recentPrices[prevPriceLow];
        const indDiff = (recentIndicator[lastIndLow] - recentIndicator[prevIndLow]) / recentIndicator[prevIndLow];
        const divergenceStrength = priceDiff + Math.abs(indDiff);
        
        const strength = divergenceStrength > 0.15 ? 'strong' : divergenceStrength > 0.08 ? 'moderate' : 'weak';
        return {
          type: 'bullish',
          indicator: 'RSI',
          strength,
          description: `Price made lower low ($${recentPrices[lastPriceLow].toFixed(2)} vs $${recentPrices[prevPriceLow].toFixed(2)}) while RSI made higher low (${recentIndicator[lastIndLow].toFixed(1)} vs ${recentIndicator[prevIndLow].toFixed(1)}) - bullish divergence`,
          confidence: strength === 'strong' ? 85 : strength === 'moderate' ? 72 : 58
        };
      }
    }
    
    const currentRSI = recentIndicator[recentIndicator.length - 1];
    const priceChange5d = (recentPrices[recentPrices.length - 1] - recentPrices[recentPrices.length - 6]) / recentPrices[recentPrices.length - 6];
    const rsiChange5d = recentIndicator[recentIndicator.length - 1] - recentIndicator[recentIndicator.length - 6];
    
    if (priceChange5d > 0.03 && rsiChange5d < -5 && currentRSI > 60) {
      return {
        type: 'hidden_bearish',
        indicator: 'RSI',
        strength: 'moderate',
        description: `Price up ${(priceChange5d * 100).toFixed(1)}% but RSI falling (${rsiChange5d.toFixed(1)} pts) at overbought ${currentRSI.toFixed(1)} - potential exhaustion`,
        confidence: 62
      };
    }
    
    if (priceChange5d < -0.03 && rsiChange5d > 5 && currentRSI < 40) {
      return {
        type: 'hidden_bullish',
        indicator: 'RSI',
        strength: 'moderate',
        description: `Price down ${(Math.abs(priceChange5d) * 100).toFixed(1)}% but RSI rising (${rsiChange5d.toFixed(1)} pts) at oversold ${currentRSI.toFixed(1)} - potential bounce setup`,
        confidence: 62
      };
    }
    
    return { type: 'none', indicator: 'N/A', strength: 'weak', description: 'No significant divergence detected', confidence: 30 };
  }

  async fetchSentiment(symbol: string): Promise<SentimentData> {
    try {
      const fearGreedResponse = await fetch('https://api.alternative.me/fng/');
      let fearGreedIndex = 50;
      
      if (fearGreedResponse.ok) {
        const fgData = await fearGreedResponse.json();
        fearGreedIndex = parseInt(fgData.data?.[0]?.value || '50');
      }

      let newsScore = 50;
      let socialScore = 50;
      
      if (this.anthropic) {
        const sentimentPrompt = `Analyze the current market sentiment for ${symbol} stock. Consider:
1. Recent news headlines and market conditions
2. Sector performance and economic factors
3. Technical momentum and institutional activity

Provide a JSON response with:
{
  "newsScore": 0-100 (bearish to bullish),
  "socialScore": 0-100 (negative to positive sentiment),
  "institutionalFlow": "accumulating" | "distributing" | "neutral",
  "reasoning": "brief explanation"
}`;

        try {
          const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{ role: 'user', content: sentimentPrompt }]
          });

          const content = response.content[0];
          if (content.type === 'text') {
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              newsScore = parsed.newsScore || 50;
              socialScore = parsed.socialScore || 50;
            }
          }
        } catch (aiError) {
          console.log('AI sentiment analysis unavailable, using defaults');
        }
      }

      const overallScore = (newsScore * 0.4 + socialScore * 0.3 + fearGreedIndex * 0.3);
      
      return {
        overallScore,
        newsScore,
        socialScore,
        institutionalFlow: overallScore > 60 ? 'accumulating' : overallScore < 40 ? 'distributing' : 'neutral',
        fearGreedIndex,
        sources: ['Alternative.me Fear & Greed', 'AI Market Analysis']
      };
    } catch (error) {
      console.error('Sentiment fetch error:', error);
      return {
        overallScore: 50,
        newsScore: 50,
        socialScore: 50,
        institutionalFlow: 'neutral',
        fearGreedIndex: 50,
        sources: ['Default values']
      };
    }
  }

  async generateAIAnalysis(
    symbol: string,
    indicators: TechnicalIndicators,
    divergences: DivergenceSignal[],
    sentiment: SentimentData,
    currentPrice: number
  ): Promise<{ analysis: string; reversalProbability: number; aiScore: number; reversalType: string }> {
    const bias = this.calculateTechnicalBias(indicators, divergences);
    
    if (!this.anthropic) {
      const defaultProbability = bias.score > 60 ? 65 : bias.score < 40 ? 35 : 50;
      return {
        analysis: `Technical analysis shows ${bias.direction} bias. RSI at ${indicators.rsi14.toFixed(1)} with MACD ${indicators.macd > indicators.macdSignal ? 'bullish' : 'bearish'}. ${divergences.length > 0 ? `Detected ${divergences[0].type} divergence with ${divergences[0].strength} strength.` : 'No significant divergences detected.'} Fear & Greed Index at ${sentiment.fearGreedIndex} indicates ${sentiment.fearGreedIndex < 30 ? 'extreme fear' : sentiment.fearGreedIndex > 70 ? 'extreme greed' : 'neutral'} sentiment.`,
        reversalProbability: defaultProbability,
        aiScore: bias.score,
        reversalType: bias.direction === 'bullish' && divergences.some(d => d.type === 'bullish') ? 'bullish_reversal' :
                      bias.direction === 'bearish' && divergences.some(d => d.type === 'bearish') ? 'bearish_reversal' : 'neutral'
      };
    }

    const prompt = `You are an expert quantitative analyst. Analyze the following data for ${symbol} and provide a reversal probability assessment:

TECHNICAL INDICATORS:
- RSI(14): ${indicators.rsi14.toFixed(2)} (Previous: ${indicators.rsiPrev.toFixed(2)})
- MACD: ${indicators.macd.toFixed(4)} (Signal: ${indicators.macdSignal.toFixed(4)})
- Price vs SMA20: ${((indicators.sma20 / indicators.sma20 - 1) * 100).toFixed(2)}%
- Price vs SMA200: ${((indicators.sma200 / indicators.sma200 - 1) * 100).toFixed(2)}%
- Stochastic: K=${indicators.stochK.toFixed(2)}, D=${indicators.stochD.toFixed(2)}
- ATR(14): ${indicators.atr14.toFixed(2)}

DIVERGENCE SIGNALS:
${divergences.map(d => `- ${d.type.toUpperCase()}: ${d.description} (Confidence: ${d.confidence}%)`).join('\n')}

SENTIMENT DATA:
- Overall Score: ${sentiment.overallScore.toFixed(0)}/100
- Fear & Greed Index: ${sentiment.fearGreedIndex}
- Institutional Flow: ${sentiment.institutionalFlow}

Provide your analysis as JSON:
{
  "reversalProbability": 0-100,
  "aiScore": 0-100,
  "reversalType": "bullish_reversal" | "bearish_reversal" | "continuation" | "neutral",
  "analysis": "Your detailed 2-3 sentence analysis",
  "confidence": "high" | "medium" | "low"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            analysis: parsed.analysis || 'Analysis complete.',
            reversalProbability: parsed.reversalProbability || 50,
            aiScore: parsed.aiScore || 50,
            reversalType: parsed.reversalType || 'neutral'
          };
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }

    const fallbackBias = this.calculateTechnicalBias(indicators, divergences);
    return {
      analysis: `Technical analysis shows ${fallbackBias.direction} bias. RSI at ${indicators.rsi14.toFixed(1)}. ${divergences.length > 0 ? divergences[0].description : 'No divergences detected.'}`,
      reversalProbability: fallbackBias.score > 60 ? 65 : fallbackBias.score < 40 ? 35 : 50,
      aiScore: fallbackBias.score,
      reversalType: fallbackBias.direction === 'bullish' && divergences.some(d => d.type === 'bullish') ? 'bullish_reversal' : 
                    fallbackBias.direction === 'bearish' && divergences.some(d => d.type === 'bearish') ? 'bearish_reversal' : 'neutral'
    };
  }

  private calculateTechnicalBias(indicators: TechnicalIndicators, divergences: DivergenceSignal[]): { direction: string; score: number } {
    let score = 50;
    
    if (indicators.rsi14 < 30) score += 20;
    else if (indicators.rsi14 > 70) score -= 20;
    else if (indicators.rsi14 < 40) score += 10;
    else if (indicators.rsi14 > 60) score -= 10;
    
    if (indicators.macd > indicators.macdSignal) score += 15;
    else score -= 15;
    
    if (indicators.stochK < 20) score += 10;
    else if (indicators.stochK > 80) score -= 10;
    
    for (const div of divergences) {
      if (div.type === 'bullish' || div.type === 'hidden_bullish') score += div.strength === 'strong' ? 20 : 10;
      if (div.type === 'bearish' || div.type === 'hidden_bearish') score -= div.strength === 'strong' ? 20 : 10;
    }
    
    score = Math.max(0, Math.min(100, score));
    const direction = score > 55 ? 'bullish' : score < 45 ? 'bearish' : 'neutral';
    
    return { direction, score };
  }

  calculateKeyLevels(priceData: PriceData[]): { support1: number; support2: number; resistance1: number; resistance2: number; pivotPoint: number } {
    const recent = priceData.slice(-20);
    const latest = recent[recent.length - 1];
    
    const high = Math.max(...recent.map(d => d.high));
    const low = Math.min(...recent.map(d => d.low));
    const close = latest.close;
    
    const pivotPoint = (high + low + close) / 3;
    const resistance1 = 2 * pivotPoint - low;
    const support1 = 2 * pivotPoint - high;
    const resistance2 = pivotPoint + (high - low);
    const support2 = pivotPoint - (high - low);
    
    return { support1, support2, resistance1, resistance2, pivotPoint };
  }

  detectLiquiditySweep(priceData: PriceData[]): InstitutionalSignals['liquiditySweep'] {
    if (priceData.length < 21) {
      return { detected: false, direction: 'none', sweepLevel: 0, rejectionStrength: 0 };
    }
    
    const recent = priceData.slice(-21);
    const latest = recent[recent.length - 1];
    const high20 = Math.max(...recent.slice(0, -1).map(d => d.high));
    const low20 = Math.min(...recent.slice(0, -1).map(d => d.low));
    
    const sweptHigh = latest.high > high20 * 1.001;
    const rejectedFromHigh = sweptHigh && latest.close < high20;
    
    const sweptLow = latest.low < low20 * 0.999;
    const rejectedFromLow = sweptLow && latest.close > low20;
    
    if (rejectedFromHigh) {
      const wick = latest.high - Math.max(latest.open, latest.close);
      const body = Math.abs(latest.close - latest.open);
      const rejectionStrength = body > 0 ? Math.min(wick / body, 3) : 1;
      return { detected: true, direction: 'bearish', sweepLevel: high20, rejectionStrength };
    }
    
    if (rejectedFromLow) {
      const wick = Math.min(latest.open, latest.close) - latest.low;
      const body = Math.abs(latest.close - latest.open);
      const rejectionStrength = body > 0 ? Math.min(wick / body, 3) : 1;
      return { detected: true, direction: 'bullish', sweepLevel: low20, rejectionStrength };
    }
    
    return { detected: false, direction: 'none', sweepLevel: 0, rejectionStrength: 0 };
  }

  detectFairValueGap(priceData: PriceData[]): InstitutionalSignals['fairValueGap'] {
    if (priceData.length < 3) {
      return { detected: false, direction: 'none', gapSize: 0, gapZone: { high: 0, low: 0 } };
    }
    
    const bar0 = priceData[priceData.length - 1];
    const bar2 = priceData[priceData.length - 3];
    
    const bullishFVG = bar0.low > bar2.high;
    const bearishFVG = bar0.high < bar2.low;
    const currentPrice = bar0.close;
    const minGapPercent = 0.001;
    
    if (bullishFVG) {
      const gapSize = (bar0.low - bar2.high) / currentPrice;
      if (gapSize >= minGapPercent) {
        return { detected: true, direction: 'bullish', gapSize, gapZone: { high: bar0.low, low: bar2.high } };
      }
    }
    
    if (bearishFVG) {
      const gapSize = (bar2.low - bar0.high) / currentPrice;
      if (gapSize >= minGapPercent) {
        return { detected: true, direction: 'bearish', gapSize, gapZone: { high: bar2.low, low: bar0.high } };
      }
    }
    
    return { detected: false, direction: 'none', gapSize: 0, gapZone: { high: 0, low: 0 } };
  }

  detectOrderBlock(priceData: PriceData[]): InstitutionalSignals['orderBlock'] {
    if (priceData.length < 10) {
      return { detected: false, type: 'none', zone: { high: 0, low: 0 }, volumeConfirmation: false };
    }
    
    const recent = priceData.slice(-10);
    const avgVolume = recent.slice(0, -1).reduce((sum, d) => sum + d.volume, 0) / (recent.length - 1);
    
    for (let i = recent.length - 2; i >= 1; i--) {
      const bar = recent[i];
      const nextBar = recent[i + 1];
      const prevBars = recent.slice(0, i);
      
      const isBearishBar = bar.close < bar.open;
      const nextIsBullish = nextBar.close > nextBar.open;
      const strongExpansion = nextBar.close > bar.high;
      const volumeConfirmation = bar.volume > avgVolume * 1.5;
      
      if (isBearishBar && nextIsBullish && strongExpansion) {
        return { 
          detected: true, 
          type: 'accumulation', 
          zone: { high: bar.high, low: bar.low }, 
          volumeConfirmation 
        };
      }
      
      const isBullishBar = bar.close > bar.open;
      const nextIsBearish = nextBar.close < nextBar.open;
      const strongDropExpansion = nextBar.close < bar.low;
      
      if (isBullishBar && nextIsBearish && strongDropExpansion) {
        return { 
          detected: true, 
          type: 'distribution', 
          zone: { high: bar.high, low: bar.low }, 
          volumeConfirmation 
        };
      }
    }
    
    return { detected: false, type: 'none', zone: { high: 0, low: 0 }, volumeConfirmation: false };
  }

  calculateVolumeDelta(priceData: PriceData[]): InstitutionalSignals['volumeDelta'] {
    if (priceData.length < 20) {
      return { cvd: 0, deltaZScore: 0, absorption: false, exhaustion: false };
    }
    
    const recent = priceData.slice(-20);
    let cvd = 0;
    const deltas: number[] = [];
    
    for (const bar of recent) {
      const delta = bar.close >= bar.open ? bar.volume : -bar.volume;
      cvd += delta;
      deltas.push(delta);
    }
    
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const stdDelta = Math.sqrt(deltas.reduce((sum, d) => sum + Math.pow(d - avgDelta, 2), 0) / deltas.length);
    const latestDelta = deltas[deltas.length - 1];
    const deltaZScore = stdDelta > 0 ? (latestDelta - avgDelta) / stdDelta : 0;
    
    const latest = recent[recent.length - 1];
    const priceChange = Math.abs(latest.close - latest.open) / latest.open;
    const volumeRatio = latest.volume / (recent.slice(0, -1).reduce((sum, d) => sum + d.volume, 0) / (recent.length - 1));
    
    const absorption = volumeRatio > 1.5 && priceChange < 0.005;
    const exhaustion = volumeRatio > 2.0 && priceChange > 0.02;
    
    return { cvd, deltaZScore, absorption, exhaustion };
  }

  calculateInstitutionalSignals(priceData: PriceData[]): InstitutionalSignals {
    const liquiditySweep = this.detectLiquiditySweep(priceData);
    const fairValueGap = this.detectFairValueGap(priceData);
    const orderBlock = this.detectOrderBlock(priceData);
    const volumeDelta = this.calculateVolumeDelta(priceData);
    
    const recent = priceData.slice(-20);
    const avgVolume = recent.slice(0, -1).reduce((sum, d) => sum + d.volume, 0) / (recent.length - 1);
    const rvol = avgVolume > 0 ? priceData[priceData.length - 1].volume / avgVolume : 1;
    
    return { liquiditySweep, fairValueGap, orderBlock, volumeDelta, rvol };
  }

  detectStopHunting(priceData: PriceData[], atr: number): StopHuntSignal | null {
    if (priceData.length < 30) return null;
    
    const recent = priceData.slice(-30);
    const latest = recent[recent.length - 1];
    const prev = recent[recent.length - 2];
    const avgVolume = recent.slice(0, -1).reduce((s, d) => s + d.volume, 0) / (recent.length - 1);
    
    const findEqualLevels = (data: PriceData[], type: 'high' | 'low', tolerance: number): number[] => {
      const levels: number[] = [];
      const prices = data.map(d => type === 'high' ? d.high : d.low);
      for (let i = 0; i < prices.length - 5; i++) {
        const level = prices[i];
        const matches = prices.filter(p => Math.abs(p - level) / level < tolerance);
        if (matches.length >= 2) levels.push(level);
      }
      return Array.from(new Set(levels));
    };
    
    const pdh = Math.max(...recent.slice(0, -1).map(d => d.high));
    const pdl = Math.min(...recent.slice(0, -1).map(d => d.low));
    const equalHighs = findEqualLevels(recent.slice(0, -5), 'high', 0.002);
    const equalLows = findEqualLevels(recent.slice(0, -5), 'low', 0.002);
    
    const wickUp = latest.high - Math.max(latest.open, latest.close);
    const wickDown = Math.min(latest.open, latest.close) - latest.low;
    const body = Math.abs(latest.close - latest.open);
    const volumeSpike = latest.volume > avgVolume * 1.5;
    
    for (const level of equalHighs) {
      if (latest.high > level * 1.001 && latest.close < level) {
        const wickSig = body > 0 ? wickUp / body : 1;
        return {
          type: 'equal_highs_sweep',
          level,
          sweepPrice: latest.high,
          reclaimPrice: latest.close,
          reclaimConfirmed: latest.close < level,
          direction: 'bearish',
          wickSignature: wickSig,
          volumeSpike,
          confirmations: [
            wickSig > 1.5 ? 'Strong wick rejection' : '',
            volumeSpike ? 'Volume confirmation' : '',
            latest.close < prev.close ? 'Bearish close' : ''
          ].filter(Boolean)
        };
      }
    }
    
    for (const level of equalLows) {
      if (latest.low < level * 0.999 && latest.close > level) {
        const wickSig = body > 0 ? wickDown / body : 1;
        return {
          type: 'equal_lows_sweep',
          level,
          sweepPrice: latest.low,
          reclaimPrice: latest.close,
          reclaimConfirmed: latest.close > level,
          direction: 'bullish',
          wickSignature: wickSig,
          volumeSpike,
          confirmations: [
            wickSig > 1.5 ? 'Strong wick rejection' : '',
            volumeSpike ? 'Volume confirmation' : '',
            latest.close > prev.close ? 'Bullish close' : ''
          ].filter(Boolean)
        };
      }
    }
    
    if (latest.low < pdl * 0.998 && latest.close > pdl) {
      return {
        type: 'pdl_raid',
        level: pdl,
        sweepPrice: latest.low,
        reclaimPrice: latest.close,
        reclaimConfirmed: true,
        direction: 'bullish',
        wickSignature: body > 0 ? wickDown / body : 1,
        volumeSpike,
        confirmations: ['PDL swept', 'Price reclaimed', volumeSpike ? 'Volume spike' : ''].filter(Boolean)
      };
    }
    
    if (latest.high > pdh * 1.002 && latest.close < pdh) {
      return {
        type: 'pdh_raid',
        level: pdh,
        sweepPrice: latest.high,
        reclaimPrice: latest.close,
        reclaimConfirmed: true,
        direction: 'bearish',
        wickSignature: body > 0 ? wickUp / body : 1,
        volumeSpike,
        confirmations: ['PDH swept', 'Price rejected', volumeSpike ? 'Volume spike' : ''].filter(Boolean)
      };
    }
    
    return null;
  }

  detectTrapSignal(priceData: PriceData[], keyLevels: { resistance1: number; support1: number }): TrapSignal | null {
    if (priceData.length < 10) return null;
    
    const recent = priceData.slice(-10);
    const latest = recent[recent.length - 1];
    
    for (let i = recent.length - 5; i < recent.length - 1; i++) {
      const bar = recent[i];
      if (bar.high > keyLevels.resistance1 && bar.close > keyLevels.resistance1) {
        const barsAfter = recent.slice(i + 1);
        const failedBack = barsAfter.some(b => b.close < keyLevels.resistance1);
        
        if (failedBack) {
          const barsToFailure = barsAfter.findIndex(b => b.close < keyLevels.resistance1) + 1;
          return {
            type: 'breakout_failure',
            level: keyLevels.resistance1,
            breakoutPrice: bar.high,
            failurePrice: latest.close,
            barsToFailure,
            coincidingFactors: [
              'Resistance breakout failed',
              barsToFailure <= 2 ? 'Quick rejection' : 'Gradual failure',
              latest.close < bar.open ? 'Closed below breakout bar' : ''
            ].filter(Boolean),
            probability: Math.min(85, 50 + (3 - barsToFailure) * 10)
          };
        }
      }
      
      if (bar.low < keyLevels.support1 && bar.close < keyLevels.support1) {
        const barsAfter = recent.slice(i + 1);
        const failedBack = barsAfter.some(b => b.close > keyLevels.support1);
        
        if (failedBack) {
          const barsToFailure = barsAfter.findIndex(b => b.close > keyLevels.support1) + 1;
          return {
            type: 'breakout_failure',
            level: keyLevels.support1,
            breakoutPrice: bar.low,
            failurePrice: latest.close,
            barsToFailure,
            coincidingFactors: [
              'Support breakdown failed',
              barsToFailure <= 2 ? 'Quick rejection' : 'Gradual failure',
              latest.close > bar.open ? 'Closed above breakdown bar' : ''
            ].filter(Boolean),
            probability: Math.min(85, 50 + (3 - barsToFailure) * 10)
          };
        }
      }
    }
    
    return null;
  }

  calculateSentimentRiskModifier(
    sentiment: SentimentData,
    technicalDirection: 'bullish' | 'bearish' | 'neutral'
  ): SentimentRiskModifier {
    let newsAlignment = 0;
    let fearGreedModifier = 0;
    let whaleActivityModifier = 0;
    const reasons: string[] = [];
    
    if (technicalDirection === 'bullish') {
      if (sentiment.newsScore > 60) {
        newsAlignment = 10;
        reasons.push('News supports bullish setup');
      } else if (sentiment.newsScore < 40) {
        newsAlignment = -10;
        reasons.push('News contradicts bullish setup');
      }
      
      if (sentiment.fearGreedIndex < 25) {
        fearGreedModifier = 10;
        reasons.push('Extreme fear = contrarian buy signal');
      } else if (sentiment.fearGreedIndex > 75) {
        fearGreedModifier = -5;
        reasons.push('Extreme greed caution');
      }
    } else if (technicalDirection === 'bearish') {
      if (sentiment.newsScore < 40) {
        newsAlignment = 10;
        reasons.push('News supports bearish setup');
      } else if (sentiment.newsScore > 60) {
        newsAlignment = -10;
        reasons.push('News contradicts bearish setup');
      }
      
      if (sentiment.fearGreedIndex > 75) {
        fearGreedModifier = 10;
        reasons.push('Extreme greed = contrarian sell signal');
      } else if (sentiment.fearGreedIndex < 25) {
        fearGreedModifier = -5;
        reasons.push('Extreme fear caution for shorts');
      }
    }
    
    if (sentiment.institutionalFlow === 'accumulating' && technicalDirection === 'bullish') {
      whaleActivityModifier = 5;
      reasons.push('Whale accumulation aligns');
    } else if (sentiment.institutionalFlow === 'distributing' && technicalDirection === 'bearish') {
      whaleActivityModifier = 5;
      reasons.push('Whale distribution aligns');
    }
    
    return {
      newsAlignment,
      fearGreedModifier,
      whaleActivityModifier,
      totalModifier: newsAlignment + fearGreedModifier + whaleActivityModifier,
      reasoning: reasons.length > 0 ? reasons.join('; ') : 'No significant sentiment alignment'
    };
  }

  shouldThrottleAlert(symbol: string, newSignal: ReversalSignal): { throttle: boolean; episodeId?: string } {
    const now = Date.now();
    const episodeKey = `${symbol}-${newSignal.reversalType}`;
    const existing = this.alertEpisodes.get(episodeKey);
    
    if (existing && (now - existing.startTime) < this.ALERT_EPISODE_WINDOW) {
      existing.alerts.push(newSignal);
      return { throttle: true, episodeId: existing.id };
    }
    
    const episode: AlertEpisode = {
      id: `${episodeKey}-${now}`,
      symbol,
      startTime: now,
      alerts: [newSignal],
      clusteredReason: `${newSignal.reversalType} signal cluster`
    };
    this.alertEpisodes.set(episodeKey, episode);
    
    Array.from(this.alertEpisodes.entries()).forEach(([key, ep]) => {
      if (now - ep.startTime > this.ALERT_EPISODE_WINDOW * 2) {
        this.alertEpisodes.delete(key);
      }
    });
    
    return { throttle: false, episodeId: episode.id };
  }

  calculateSevenGateValidation(
    indicators: TechnicalIndicators,
    divergences: DivergenceSignal[],
    sentiment: SentimentData,
    currentPrice: number,
    keyLevels: { support1: number; support2: number; resistance1: number; resistance2: number; pivotPoint: number },
    volumeRatio: number,
    institutionalSignals: InstitutionalSignals
  ): SevenGateValidation {
    const gate1_rsiExtreme = indicators.rsi14 <= 30 || indicators.rsi14 >= 70;
    
    const gate2_divergencePresent = divergences.length > 0 && 
      divergences.some(d => d.type !== 'none' && (d.strength === 'strong' || d.strength === 'moderate'));
    
    const macdPrev = indicators.macdPrev || 0;
    const macdCurr = indicators.macd;
    const macdSignalCurr = indicators.macdSignal;
    const gate3_macdCrossover = (macdCurr > macdSignalCurr && macdPrev <= macdSignalCurr) ||
                                 (macdCurr < macdSignalCurr && macdPrev >= macdSignalCurr) ||
                                 Math.abs(macdCurr - macdSignalCurr) < Math.abs(macdCurr * 0.1);
    
    const gate4_stochOversoldOverbought = indicators.stochK <= 20 || indicators.stochK >= 80;
    
    const gate5_volumeSpike = volumeRatio >= 1.5;
    
    const priceToSupport1 = Math.abs(currentPrice - keyLevels.support1) / currentPrice;
    const priceToResist1 = Math.abs(currentPrice - keyLevels.resistance1) / currentPrice;
    const gate6_priceAtSupRes = priceToSupport1 <= 0.02 || priceToResist1 <= 0.02;
    
    const gate7_sentimentExtreme = sentiment.fearGreedIndex <= 25 || sentiment.fearGreedIndex >= 75;
    
    const gate8_liquiditySweep = institutionalSignals.liquiditySweep.detected && 
                                  institutionalSignals.liquiditySweep.rejectionStrength >= 1.0;
    
    const gate9_fvgPresent = institutionalSignals.fairValueGap.detected;
    
    const gate10_orderBlockConfirm = institutionalSignals.orderBlock.detected && 
                                      institutionalSignals.orderBlock.volumeConfirmation;
    
    const technicalGates = [
      gate1_rsiExtreme,
      gate2_divergencePresent,
      gate3_macdCrossover,
      gate4_stochOversoldOverbought,
      gate5_volumeSpike,
      gate6_priceAtSupRes,
      gate7_sentimentExtreme
    ].filter(Boolean).length;
    
    const institutionalGates = [
      gate8_liquiditySweep,
      gate9_fvgPresent,
      gate10_orderBlockConfirm
    ].filter(Boolean).length;
    
    const gatesPassed = technicalGates + institutionalGates;
    const totalGates = 10;
    const confidencePercent = Math.round((gatesPassed / totalGates) * 100);
    
    const isConfirmed = confidencePercent >= 90;
    
    return {
      gate1_rsiExtreme,
      gate2_divergencePresent,
      gate3_macdCrossover,
      gate4_stochOversoldOverbought,
      gate5_volumeSpike,
      gate6_priceAtSupRes,
      gate7_sentimentExtreme,
      gate8_liquiditySweep,
      gate9_fvgPresent,
      gate10_orderBlockConfirm,
      gatesPassed,
      institutionalGatesPassed: institutionalGates,
      isConfirmed,
      confidencePercent
    };
  }

  generateHedgeFundInsight(
    institutionalSignals: InstitutionalSignals,
    sevenGates: SevenGateValidation,
    reversalType: string
  ): string {
    const insights: string[] = [];
    
    if (institutionalSignals.liquiditySweep.detected) {
      const dir = institutionalSignals.liquiditySweep.direction;
      insights.push(`LIQUIDITY SWEEP: ${dir.toUpperCase()} - Stop hunt detected at ${institutionalSignals.liquiditySweep.sweepLevel.toFixed(2)} with ${institutionalSignals.liquiditySweep.rejectionStrength.toFixed(1)}x rejection`);
    }
    
    if (institutionalSignals.fairValueGap.detected) {
      const dir = institutionalSignals.fairValueGap.direction;
      insights.push(`FAIR VALUE GAP: ${dir.toUpperCase()} imbalance zone ${institutionalSignals.fairValueGap.gapZone.low.toFixed(2)} - ${institutionalSignals.fairValueGap.gapZone.high.toFixed(2)}`);
    }
    
    if (institutionalSignals.orderBlock.detected) {
      const type = institutionalSignals.orderBlock.type.toUpperCase();
      insights.push(`ORDER BLOCK: ${type} zone ${institutionalSignals.orderBlock.zone.low.toFixed(2)} - ${institutionalSignals.orderBlock.zone.high.toFixed(2)}${institutionalSignals.orderBlock.volumeConfirmation ? ' (VOLUME CONFIRMED)' : ''}`);
    }
    
    if (institutionalSignals.volumeDelta.absorption) {
      insights.push(`ABSORPTION: Large orders absorbed at current level - potential reversal zone`);
    }
    
    if (institutionalSignals.volumeDelta.exhaustion) {
      insights.push(`EXHAUSTION: Volume spike with minimal price movement - trend exhaustion detected`);
    }
    
    if (Math.abs(institutionalSignals.volumeDelta.deltaZScore) >= 1.2) {
      const side = institutionalSignals.volumeDelta.deltaZScore > 0 ? 'BUY' : 'SELL';
      insights.push(`DELTA Z-SCORE: Unusual ${side} aggression detected (Z=${institutionalSignals.volumeDelta.deltaZScore.toFixed(2)})`);
    }
    
    if (institutionalSignals.rvol >= 1.5) {
      insights.push(`RVOL: ${institutionalSignals.rvol.toFixed(1)}x average volume - institutional activity elevated`);
    }
    
    if (sevenGates.isConfirmed) {
      insights.unshift(`🎯 HEDGE FUND SIGNAL: ${sevenGates.confidencePercent}% CONFIRMED ${reversalType.toUpperCase()} - All institutional criteria met`);
    } else if (sevenGates.confidencePercent >= 70) {
      insights.unshift(`⚠️ HIGH PROBABILITY: ${sevenGates.confidencePercent}% - ${sevenGates.gatesPassed}/10 gates passed (${sevenGates.institutionalGatesPassed} institutional)`);
    }
    
    return insights.length > 0 ? insights.join(' | ') : 'No significant institutional activity detected';
  }

  async analyzeStock(symbol: string): Promise<ReversalSignal | null> {
    console.log(`🔍 Analyzing ${symbol} for reversal signals...`);
    
    const priceData = await this.fetchHistoricalData(symbol);
    if (priceData.length < 50) {
      console.log(`⚠️ Insufficient data for ${symbol}`);
      return null;
    }

    const closes = priceData.map(d => d.close);
    const latest = priceData[priceData.length - 1];
    const previous = priceData[priceData.length - 2];
    
    const rsiValues = this.calculateRSI(closes);
    const macdData = this.calculateMACD(closes);
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const sma200 = this.calculateSMA(closes, 200);
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    const bollinger = this.calculateBollingerBands(closes);
    const atr = this.calculateATR(priceData);
    const stoch = this.calculateStochastic(priceData);
    const obv = this.calculateOBV(priceData);

    const indicators: TechnicalIndicators = {
      rsi14: rsiValues[rsiValues.length - 1] || 50,
      rsiPrev: rsiValues[rsiValues.length - 6] || 50,
      macd: macdData.macd[macdData.macd.length - 1] || 0,
      macdSignal: macdData.signal[macdData.signal.length - 1] || 0,
      macdHist: macdData.histogram[macdData.histogram.length - 1] || 0,
      macdPrev: macdData.macd[macdData.macd.length - 6] || 0,
      sma20: sma20[sma20.length - 1] || latest.close,
      sma50: sma50[sma50.length - 1] || latest.close,
      sma200: sma200[sma200.length - 1] || latest.close,
      ema9: ema9[ema9.length - 1] || latest.close,
      ema21: ema21[ema21.length - 1] || latest.close,
      bollingerUpper: bollinger.upper[bollinger.upper.length - 1] || latest.close * 1.02,
      bollingerMiddle: bollinger.middle[bollinger.middle.length - 1] || latest.close,
      bollingerLower: bollinger.lower[bollinger.lower.length - 1] || latest.close * 0.98,
      atr14: atr[atr.length - 1] || latest.close * 0.02,
      stochK: stoch.k[stoch.k.length - 1] || 50,
      stochD: stoch.d[stoch.d.length - 1] || 50,
      obv: obv[obv.length - 1] || 0,
      vwap: latest.close
    };

    const rsiDivergence = this.detectDivergence(closes.slice(-20), rsiValues.slice(-20), 14);
    const macdDivergence = this.detectDivergence(closes.slice(-20), macdData.macd.slice(-20), 14);
    
    const divergences = [rsiDivergence, macdDivergence].filter(d => d.type !== 'none');

    const sentiment = await this.fetchSentiment(symbol);
    const aiResult = await this.generateAIAnalysis(symbol, indicators, divergences, sentiment, latest.close);
    const keyLevels = this.calculateKeyLevels(priceData);
    const institutionalSignals = this.calculateInstitutionalSignals(priceData);

    const technicalScore = this.calculateTechnicalScore(indicators, divergences);
    const sentimentScore = sentiment.overallScore;
    
    const recentVolumes = priceData.slice(-20).map(d => d.volume);
    const avgVolume = recentVolumes.slice(0, -1).reduce((a, b) => a + b, 0) / (recentVolumes.length - 1);
    const currentVolume = recentVolumes[recentVolumes.length - 1];
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;
    
    const atrValue = atr[atr.length - 1] || latest.close * 0.02;
    const stopHunt = this.detectStopHunting(priceData, atrValue);
    const trapSignal = this.detectTrapSignal(priceData, keyLevels);
    
    const prelimDirection = divergences.some(d => d.type === 'bullish') ? 'bullish' : 
                            divergences.some(d => d.type === 'bearish') ? 'bearish' : 'neutral';
    const sentimentModifier = this.calculateSentimentRiskModifier(sentiment, prelimDirection);
    
    const sevenGates = this.calculateSevenGateValidation(
      indicators,
      divergences,
      sentiment,
      latest.close,
      keyLevels,
      volumeRatio,
      institutionalSignals
    );
    
    let baseScore = technicalScore * 0.5 + sentimentScore * 0.25 + aiResult.aiScore * 0.25;
    baseScore += sentimentModifier.totalModifier;
    if (stopHunt?.reclaimConfirmed) baseScore += stopHunt.direction === 'bullish' ? 10 : -10;
    if (trapSignal) baseScore += trapSignal.type === 'breakout_failure' ? (trapSignal.probability / 10) : 0;
    const combinedScore = Math.max(0, Math.min(100, baseScore));

    let reversalType: 'bullish_reversal' | 'bearish_reversal' | 'continuation' | 'neutral' = 'neutral';
    
    if (sevenGates.isConfirmed || sevenGates.gatesPassed >= 6) {
      if (divergences.some(d => d.type === 'bullish' || d.type === 'hidden_bullish') && indicators.rsi14 < 40) {
        reversalType = 'bullish_reversal';
      } else if (divergences.some(d => d.type === 'bearish' || d.type === 'hidden_bearish') && indicators.rsi14 > 60) {
        reversalType = 'bearish_reversal';
      }
    }
    
    if (reversalType === 'neutral') {
      if (divergences.some(d => d.type === 'bullish') && combinedScore > 60) {
        reversalType = 'bullish_reversal';
      } else if (divergences.some(d => d.type === 'bearish') && combinedScore < 40) {
        reversalType = 'bearish_reversal';
      } else if (combinedScore > 55 || combinedScore < 45) {
        reversalType = 'continuation';
      }
    }
    
    const audioTrigger = sevenGates.isConfirmed && reversalType.includes('reversal') ? 'reversal' as const : 
                         sevenGates.confidencePercent >= 70 && reversalType.includes('reversal') ? 'alert' as const : null;

    const direction = reversalType === 'bullish_reversal' ? 'long' : 
                      reversalType === 'bearish_reversal' ? 'short' : 'wait';
    
    const entryLow = direction === 'long' ? keyLevels.support1 : latest.close;
    const entryHigh = direction === 'long' ? latest.close : keyLevels.resistance1;
    const stopLoss = direction === 'long' ? keyLevels.support2 : keyLevels.resistance2;
    const target1 = direction === 'long' ? keyLevels.resistance1 : keyLevels.support1;
    const target2 = direction === 'long' ? keyLevels.resistance2 : keyLevels.support2;
    
    const risk = Math.abs(latest.close - stopLoss);
    const reward = Math.abs(target1 - latest.close);
    const riskRewardRatio = risk > 0 ? reward / risk : 0;

    const priceChange24h = latest.close - previous.close;
    const priceChangePercent = (priceChange24h / previous.close) * 100;
    
    let hedgeFundInsight = this.generateHedgeFundInsight(institutionalSignals, sevenGates, reversalType);
    
    if (stopHunt) {
      hedgeFundInsight += ` | STOP HUNT: ${stopHunt.type.replace(/_/g, ' ').toUpperCase()} at ${stopHunt.level.toFixed(2)} - ${stopHunt.confirmations.join(', ')}`;
    }
    if (trapSignal) {
      hedgeFundInsight += ` | TRAP: ${trapSignal.type.replace(/_/g, ' ').toUpperCase()} at ${trapSignal.level.toFixed(2)} (${trapSignal.probability}% probability)`;
    }
    if (sentimentModifier.totalModifier !== 0) {
      hedgeFundInsight += ` | SENTIMENT: ${sentimentModifier.totalModifier > 0 ? '+' : ''}${sentimentModifier.totalModifier} (${sentimentModifier.reasoning})`;
    }

    console.log(`✅ ${symbol}: ${reversalType} (Confidence: ${sevenGates.confidencePercent}%, Gates: ${sevenGates.gatesPassed}/10, Inst: ${sevenGates.institutionalGatesPassed}/3)`);

    return {
      symbol,
      companyName: symbol,
      currentPrice: latest.close,
      priceChange24h,
      priceChangePercent,
      reversalType,
      reversalProbability: sevenGates.confidencePercent,
      aiScore: aiResult.aiScore,
      technicalScore,
      sentimentScore,
      divergences,
      sevenGates,
      institutionalSignals,
      audioTrigger,
      indicators: {
        ...indicators,
        volumeRatio
      },
      sentiment,
      aiAnalysis: aiResult.analysis,
      hedgeFundInsight,
      keyLevels,
      tradeSetup: {
        direction,
        entryZone: { low: entryLow, high: entryHigh },
        stopLoss,
        target1,
        target2,
        riskRewardRatio
      },
      timestamp: new Date().toISOString()
    };
  }

  private calculateTechnicalScore(indicators: TechnicalIndicators, divergences: DivergenceSignal[]): number {
    let score = 50;
    
    if (indicators.rsi14 < 30) score += 15;
    else if (indicators.rsi14 > 70) score -= 15;
    else if (indicators.rsi14 < 40) score += 5;
    else if (indicators.rsi14 > 60) score -= 5;
    
    if (indicators.macd > indicators.macdSignal) score += 10;
    else score -= 10;
    
    if (indicators.stochK < 20 && indicators.stochK > indicators.stochD) score += 10;
    if (indicators.stochK > 80 && indicators.stochK < indicators.stochD) score -= 10;
    
    for (const div of divergences) {
      if (div.type === 'bullish') score += div.strength === 'strong' ? 20 : 10;
      if (div.type === 'bearish') score -= div.strength === 'strong' ? 20 : 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      promise
        .then(v => { clearTimeout(timer); resolve(v); })
        .catch(e => { clearTimeout(timer); reject(e); });
    });
  }

  async scanMultipleStocks(symbols: string[]): Promise<ScanReport> {
    console.log(`🎯 REVERSAL SCANNER: Analyzing ${symbols.length} symbols...`);
    
    const signals: ReversalSignal[] = [];
    const errors: { symbol: string; message: string }[] = [];
    
    const totals = {
      attempted: symbols.length,
      analyzed: 0,
      signaled: 0,
      emitted: 0,
      throttled: 0,
      errors: 0
    };
    
    for (const symbol of symbols) {
      try {
        console.log(`🔍 Analyzing ${symbol}...`);
        
        const signal = await this.withTimeout(
          this.analyzeStock(symbol),
          15000,
          `analyzeStock(${symbol})`
        );
        totals.analyzed++;
        
        if (signal) {
          totals.signaled++;
          
          const throttleCheck = this.shouldThrottleAlert(symbol, signal);
          if (!throttleCheck.throttle) {
            signals.push(signal);
            totals.emitted++;
            console.log(`✅ Signal emitted for ${symbol}`);
          } else {
            totals.throttled++;
            console.log(`🔇 Throttled ${symbol} (episode: ${throttleCheck.episodeId})`);
          }
        } else {
          console.log(`➖ No signal for ${symbol}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err: any) {
        totals.errors++;
        const msg = err?.message ?? String(err);
        errors.push({ symbol, message: msg });
        console.error(`❌ Error analyzing ${symbol}:`, msg);
      }
    }
    
    signals.sort((a, b) => {
      if (a.reversalType.includes('reversal') && !b.reversalType.includes('reversal')) return -1;
      if (!a.reversalType.includes('reversal') && b.reversalType.includes('reversal')) return 1;
      return b.reversalProbability - a.reversalProbability;
    });
    
    console.log(`📊 Scan totals:`, totals);
    
    return { totals, signals, errors };
  }
}

export const reversalDetectionService = new ReversalDetectionService();
