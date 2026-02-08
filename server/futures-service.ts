interface FuturesQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  volume: number;
  timestamp: number;
}

interface FuturesIndicators {
  rsi: number;
  macd: { line: number; signal: number; histogram: number };
  ema9: number;
  ema20: number;
  ema50: number;
  atr: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: 'low' | 'medium' | 'high';
}

interface FuturesSignal {
  symbol: string;
  signalType: 'long' | 'short' | 'hold';
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskRewardRatio: number;
  confidence: number;
  reasoning: string;
}

interface ContractSpec {
  symbol: string;
  yahooSymbol: string;
  name: string;
  exchange: string;
  contractSize: number;
  tickSize: number;
  tickValue: number;
  marginRequirement: number;
  tradingHours: string;
}

const FUTURES_CONTRACTS: ContractSpec[] = [
  {
    symbol: 'GC',
    yahooSymbol: 'GC=F',
    name: 'Gold Futures',
    exchange: 'COMEX',
    contractSize: 100,
    tickSize: 0.10,
    tickValue: 10,
    marginRequirement: 11000,
    tradingHours: 'Sun-Fri 6:00pm-5:00pm ET'
  },
  {
    symbol: 'SI',
    yahooSymbol: 'SI=F',
    name: 'Silver Futures',
    exchange: 'COMEX',
    contractSize: 5000,
    tickSize: 0.005,
    tickValue: 25,
    marginRequirement: 14300,
    tradingHours: 'Sun-Fri 6:00pm-5:00pm ET'
  }
];

class FuturesService {
  private quoteCache: Map<string, { data: FuturesQuote; timestamp: number }> = new Map();
  private candleCache: Map<string, { candles: number[][]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5000; // Reduced to 5 seconds for real-time data

  getContractSpecs(): ContractSpec[] {
    return FUTURES_CONTRACTS;
  }

  getContractSpec(symbol: string): ContractSpec | undefined {
    return FUTURES_CONTRACTS.find(c => 
      c.symbol === symbol.toUpperCase() || 
      c.yahooSymbol === symbol.toUpperCase()
    );
  }

  async fetchQuote(symbol: string): Promise<FuturesQuote | null> {
    const contract = this.getContractSpec(symbol);
    if (!contract) return null;

    const cached = this.quoteCache.get(contract.yahooSymbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${contract.yahooSymbol}?interval=1m&range=1d`
      );

      if (!response.ok) throw new Error('Yahoo Finance API error');

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result || !result.meta) {
        throw new Error('No data from Yahoo');
      }

      const meta = result.meta;
      const quote: FuturesQuote = {
        symbol: contract.symbol,
        name: contract.name,
        price: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
        dayOpen: meta.regularMarketOpen || meta.previousClose || 0,
        dayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice || 0,
        dayLow: meta.regularMarketDayLow || meta.regularMarketPrice || 0,
        prevClose: meta.previousClose || 0,
        volume: meta.regularMarketVolume || 0,
        timestamp: Date.now()
      };

      this.quoteCache.set(contract.yahooSymbol, { data: quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      console.error(`Failed to fetch ${symbol} quote:`, error);
      const cached = this.quoteCache.get(contract.yahooSymbol);
      return cached?.data || null;
    }
  }

  async fetchCandles(symbol: string, interval: string = '15m', range: string = '5d'): Promise<number[][]> {
    const contract = this.getContractSpec(symbol);
    if (!contract) return [];

    const cacheKey = `${contract.yahooSymbol}_${interval}_${range}`;
    const cached = this.candleCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL * 2) {
      return cached.candles;
    }

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${contract.yahooSymbol}?interval=${interval}&range=${range}`
      );

      if (!response.ok) throw new Error('Yahoo Finance API error');

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
        return cached?.candles || [];
      }

      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];
      
      const candles: number[][] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] != null && quote.close[i] != null) {
          candles.push([
            timestamps[i] * 1000,
            quote.open[i],
            quote.high[i],
            quote.low[i],
            quote.close[i],
            quote.volume[i] || 0
          ]);
        }
      }

      this.candleCache.set(cacheKey, { candles, timestamp: Date.now() });
      return candles;
    } catch (error) {
      console.error(`Failed to fetch ${symbol} candles:`, error);
      return cached?.candles || [];
    }
  }

  calculateIndicators(candles: number[][]): FuturesIndicators {
    if (candles.length < 50) {
      return {
        rsi: 50,
        macd: { line: 0, signal: 0, histogram: 0 },
        ema9: candles[candles.length - 1]?.[4] || 0,
        ema20: candles[candles.length - 1]?.[4] || 0,
        ema50: candles[candles.length - 1]?.[4] || 0,
        atr: 0,
        trend: 'neutral',
        volatility: 'medium'
      };
    }

    const closes = candles.map(c => c[4]);
    const highs = candles.map(c => c[2]);
    const lows = candles.map(c => c[3]);

    const rsi = this.calculateRSI(closes, 14);
    const ema9 = this.calculateEMA(closes, 9);
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);
    const macd = this.calculateMACD(closes);
    const atr = this.calculateATR(highs, lows, closes, 14);

    const currentPrice = closes[closes.length - 1];
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (currentPrice > ema20 && ema9 > ema20 && macd.histogram > 0) {
      trend = 'bullish';
    } else if (currentPrice < ema20 && ema9 < ema20 && macd.histogram < 0) {
      trend = 'bearish';
    }

    const avgATR = atr / currentPrice * 100;
    let volatility: 'low' | 'medium' | 'high' = 'medium';
    if (avgATR < 0.5) volatility = 'low';
    else if (avgATR > 1.5) volatility = 'high';

    return { rsi, macd, ema9, ema20, ema50, atr, trend, volatility };
  }

  generateSignal(quote: FuturesQuote, indicators: FuturesIndicators, contract: ContractSpec): FuturesSignal {
    const { rsi, macd, trend, atr } = indicators;
    
    let signalType: 'long' | 'short' | 'hold' = 'hold';
    let confidence = 50;
    let reasoning = '';

    if (trend === 'bullish' && rsi < 70 && macd.histogram > 0) {
      signalType = 'long';
      confidence = Math.min(85, 60 + (70 - rsi) / 2 + macd.histogram * 10);
      reasoning = `Bullish trend confirmed. RSI at ${rsi.toFixed(1)} with positive MACD momentum.`;
    } else if (trend === 'bearish' && rsi > 30 && macd.histogram < 0) {
      signalType = 'short';
      confidence = Math.min(85, 60 + (rsi - 30) / 2 + Math.abs(macd.histogram) * 10);
      reasoning = `Bearish trend confirmed. RSI at ${rsi.toFixed(1)} with negative MACD momentum.`;
    } else if (rsi < 25) {
      signalType = 'long';
      confidence = 65;
      reasoning = `Oversold conditions detected. RSI at ${rsi.toFixed(1)} suggests potential reversal.`;
    } else if (rsi > 75) {
      signalType = 'short';
      confidence = 65;
      reasoning = `Overbought conditions detected. RSI at ${rsi.toFixed(1)} suggests potential reversal.`;
    } else {
      reasoning = `No clear signal. Market in consolidation with RSI at ${rsi.toFixed(1)}.`;
    }

    const stopDistance = atr * 2;
    const targetDistance = atr * 4;
    
    let stopLoss: number, targetPrice: number;
    if (signalType === 'long') {
      stopLoss = quote.price - stopDistance;
      targetPrice = quote.price + targetDistance;
    } else if (signalType === 'short') {
      stopLoss = quote.price + stopDistance;
      targetPrice = quote.price - targetDistance;
    } else {
      stopLoss = quote.price - stopDistance;
      targetPrice = quote.price + targetDistance;
    }

    const risk = Math.abs(quote.price - stopLoss);
    const reward = Math.abs(targetPrice - quote.price);
    const riskRewardRatio = reward / risk;

    return {
      symbol: contract.symbol,
      signalType,
      entryPrice: quote.price,
      stopLoss,
      targetPrice,
      riskRewardRatio,
      confidence,
      reasoning
    };
  }

  calculatePositionSize(
    accountBalance: number,
    riskPercent: number,
    entryPrice: number,
    stopLoss: number,
    contract: ContractSpec
  ): {
    contracts: number;
    riskAmount: number;
    marginRequired: number;
    positionValue: number;
    ticksAtRisk: number;
    dollarRisk: number;
  } {
    const riskAmount = accountBalance * (riskPercent / 100);
    const priceMove = Math.abs(entryPrice - stopLoss);
    const ticksAtRisk = priceMove / contract.tickSize;
    const dollarRiskPerContract = ticksAtRisk * contract.tickValue;
    
    const contracts = Math.floor(riskAmount / dollarRiskPerContract);
    const marginRequired = contracts * contract.marginRequirement;
    const positionValue = contracts * entryPrice * contract.contractSize;

    return {
      contracts: Math.max(0, contracts),
      riskAmount,
      marginRequired,
      positionValue,
      ticksAtRisk,
      dollarRisk: contracts * dollarRiskPerContract
    };
  }

  private calculateRSI(closes: number[], period: number): number {
    if (closes.length < period + 1) return 50;

    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1] || 0;
    
    const k = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private calculateMACD(closes: number[]): { line: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const line = ema12 - ema26;
    
    const macdValues: number[] = [];
    for (let i = 26; i < closes.length; i++) {
      const e12 = this.calculateEMA(closes.slice(0, i + 1), 12);
      const e26 = this.calculateEMA(closes.slice(0, i + 1), 26);
      macdValues.push(e12 - e26);
    }
    
    const signal = macdValues.length >= 9 ? this.calculateEMA(macdValues, 9) : line;
    return { line, signal, histogram: line - signal };
  }

  private calculateATR(highs: number[], lows: number[], closes: number[], period: number): number {
    if (highs.length < period + 1) return 0;

    const trueRanges: number[] = [];
    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }

    const recentTRs = trueRanges.slice(-period);
    return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
  }
}

export const futuresService = new FuturesService();
