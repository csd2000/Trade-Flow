import Anthropic from '@anthropic-ai/sdk';
import { predictiveSignalEngine, Candle } from './predictive-signal-engine';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  beta: number | null;
}

interface TechnicalIndicators {
  rsi14: number;
  macd: { value: number; signal: number; histogram: number };
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  atr14: number;
  volumeRatio: number;
}

interface LiquiditySweepData {
  status: string;
  gate1Passed: boolean;
  gate2Passed: boolean;
  gate3Passed: boolean;
  swingLow: number;
  volumeMultiplier: number;
  isConsolidating: boolean;
  isWeakSweep: boolean;
  targetFVG: { top: number; bottom: number; midpoint: number } | null;
  reasons: string[];
}

interface PredictiveData {
  neuralIndex: string;
  neuralConfidence: number;
  completeAgreement: boolean;
  doubleConfirmed: boolean;
  doubleConfirmationScore: number;
  predictedHigh: number;
  predictedLow: number;
  maCrossover: string;
  trendStrength: number;
  overallSignal: string;
  liquiditySweep: LiquiditySweepData;
}

interface StockResearchResult {
  quote: StockQuote;
  technicals: TechnicalIndicators;
  aiAnalysis: {
    summary: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    keyPoints: string[];
    risks: string[];
    opportunities: string[];
    priceTargets: { support: number; resistance: number };
    recommendation: string;
  };
  predictive?: PredictiveData;
  timestamp: Date;
}

const researchCache = new Map<string, { data: StockResearchResult; expiry: number }>();
const CACHE_TTL = 2 * 60 * 1000;

async function fetchYahooQuote(symbol: string): Promise<StockQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y&includePrePost=false`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${symbol}: ${response.status}`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];
  
  if (!result) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  const meta = result.meta;
  const quotes = result.indicators?.quote?.[0];
  const closes = quotes?.close?.filter((c: number | null) => c !== null) || [];
  const volumes = quotes?.volume?.filter((v: number | null) => v !== null) || [];
  
  const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
  const previousClose = meta.previousClose || closes[closes.length - 2];
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  const highs = quotes?.high?.filter((h: number | null) => h !== null) || [];
  const lows = quotes?.low?.filter((l: number | null) => l !== null) || [];
  
  return {
    symbol: symbol.toUpperCase(),
    name: meta.longName || meta.shortName || symbol,
    price: currentPrice,
    change,
    changePercent,
    open: quotes?.open?.[quotes.open.length - 1] || currentPrice,
    high: highs[highs.length - 1] || currentPrice,
    low: lows[lows.length - 1] || currentPrice,
    previousClose,
    volume: volumes[volumes.length - 1] || 0,
    avgVolume: volumes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20,
    marketCap: meta.marketCap || 0,
    peRatio: null,
    dividendYield: null,
    fiftyTwoWeekHigh: Math.max(...highs.slice(-252)),
    fiftyTwoWeekLow: Math.min(...lows.slice(-252)),
    beta: null
  };
}

function calculateTechnicals(symbol: string, closes: number[], highs: number[], lows: number[], volumes: number[]): TechnicalIndicators {
  const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateSMA = (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1];
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  };

  const calculateEMASeries = (prices: number[], period: number): number[] => {
    if (prices.length < period) return prices;
    const multiplier = 2 / (period + 1);
    const emaValues: number[] = [];
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    emaValues.push(ema);
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
      emaValues.push(ema);
    }
    return emaValues;
  };

  const calculateMACD = (prices: number[]): { value: number; signal: number; histogram: number } => {
    if (prices.length < 26) {
      return { value: 0, signal: 0, histogram: 0 };
    }
    
    const ema12Series = calculateEMASeries(prices, 12);
    const ema26Series = calculateEMASeries(prices, 26);
    
    const macdSeries: number[] = [];
    const offset = ema12Series.length - ema26Series.length;
    for (let i = 0; i < ema26Series.length; i++) {
      macdSeries.push(ema12Series[i + offset] - ema26Series[i]);
    }
    
    const signalSeries = calculateEMASeries(macdSeries, 9);
    const macdValue = macdSeries[macdSeries.length - 1];
    const signalValue = signalSeries[signalSeries.length - 1];
    
    return { 
      value: macdValue, 
      signal: signalValue, 
      histogram: macdValue - signalValue 
    };
  };

  const calculateATR = (h: number[], l: number[], c: number[], period: number = 14): number => {
    const len = Math.min(h.length, l.length, c.length);
    if (len < period + 1) return 0;
    
    let atr = 0;
    for (let i = len - period; i < len; i++) {
      const tr = Math.max(
        h[i] - l[i],
        Math.abs(h[i] - c[i - 1]),
        Math.abs(l[i] - c[i - 1])
      );
      atr += tr;
    }
    return atr / period;
  };

  const sma20 = calculateSMA(closes, 20);
  const recentCloses = closes.slice(-20);
  const stdDev = recentCloses.length > 0 ? Math.sqrt(
    recentCloses.reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / recentCloses.length
  ) : 0;

  const avgVolume = volumes.length >= 20 
    ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20 
    : volumes.reduce((a, b) => a + b, 0) / Math.max(volumes.length, 1);
  const currentVolume = volumes[volumes.length - 1] || avgVolume;

  return {
    rsi14: calculateRSI(closes, 14),
    macd: calculateMACD(closes),
    sma20,
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, 200),
    bollingerBands: {
      upper: sma20 + (2 * stdDev),
      middle: sma20,
      lower: sma20 - (2 * stdDev)
    },
    atr14: calculateATR(highs, lows, closes, 14),
    volumeRatio: avgVolume > 0 ? currentVolume / avgVolume : 1
  };
}

async function generateAIAnalysis(
  quote: StockQuote,
  technicals: TechnicalIndicators
): Promise<StockResearchResult['aiAnalysis']> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return getDefaultAnalysis(quote, technicals);
  }

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `You are a professional stock analyst. Analyze this stock and provide actionable insights:

STOCK: ${quote.symbol} (${quote.name})
Price: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
52-Week Range: $${quote.fiftyTwoWeekLow.toFixed(2)} - $${quote.fiftyTwoWeekHigh.toFixed(2)}
Volume: ${(quote.volume / 1000000).toFixed(2)}M (${(technicals.volumeRatio * 100).toFixed(0)}% of avg)

TECHNICALS:
- RSI(14): ${technicals.rsi14.toFixed(1)} ${technicals.rsi14 > 70 ? '(Overbought)' : technicals.rsi14 < 30 ? '(Oversold)' : '(Neutral)'}
- MACD: ${technicals.macd.value.toFixed(3)} / Signal: ${technicals.macd.signal.toFixed(3)}
- SMA20: $${technicals.sma20.toFixed(2)} | SMA50: $${technicals.sma50.toFixed(2)} | SMA200: $${technicals.sma200.toFixed(2)}
- Bollinger Bands: $${technicals.bollingerBands.lower.toFixed(2)} - $${technicals.bollingerBands.upper.toFixed(2)}
- ATR(14): $${technicals.atr14.toFixed(2)}

Respond in this exact JSON format:
{
  "summary": "2-3 sentence analysis of current setup",
  "sentiment": "bullish" or "bearish" or "neutral",
  "keyPoints": ["point1", "point2", "point3"],
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "support": <nearest support price>,
  "resistance": <nearest resistance price>,
  "recommendation": "Specific actionable advice for traders"
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary,
          sentiment: parsed.sentiment,
          keyPoints: parsed.keyPoints || [],
          risks: parsed.risks || [],
          opportunities: parsed.opportunities || [],
          priceTargets: {
            support: parsed.support || quote.fiftyTwoWeekLow,
            resistance: parsed.resistance || quote.fiftyTwoWeekHigh
          },
          recommendation: parsed.recommendation
        };
      }
    }
  } catch (error) {
    console.error('AI analysis error:', error);
  }

  return getDefaultAnalysis(quote, technicals);
}

function getDefaultAnalysis(quote: StockQuote, technicals: TechnicalIndicators): StockResearchResult['aiAnalysis'] {
  const sentiment = technicals.rsi14 > 60 && quote.price > technicals.sma50 ? 'bullish' :
                   technicals.rsi14 < 40 && quote.price < technicals.sma50 ? 'bearish' : 'neutral';
  
  const atrBuffer = technicals.atr14 * 2;
  
  return {
    summary: `${quote.symbol} is trading at $${quote.price.toFixed(2)}, ${quote.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(quote.changePercent).toFixed(2)}%. RSI at ${technicals.rsi14.toFixed(1)} suggests ${technicals.rsi14 > 70 ? 'overbought' : technicals.rsi14 < 30 ? 'oversold' : 'neutral'} conditions.`,
    sentiment,
    keyPoints: [
      `Price ${quote.price > technicals.sma200 ? 'above' : 'below'} 200-day SMA (long-term ${quote.price > technicals.sma200 ? 'uptrend' : 'downtrend'})`,
      `RSI(14) at ${technicals.rsi14.toFixed(1)} indicates ${technicals.rsi14 > 70 ? 'overbought - potential pullback' : technicals.rsi14 < 30 ? 'oversold - potential bounce' : 'neutral momentum'}`,
      `MACD ${technicals.macd.histogram > 0 ? 'bullish' : 'bearish'} with histogram at ${technicals.macd.histogram.toFixed(3)}`
    ],
    risks: [
      technicals.rsi14 > 70 ? 'Overbought conditions may lead to profit-taking' : 'Breaking below key support could accelerate selling',
      technicals.volumeRatio < 0.5 ? 'Low volume may indicate lack of conviction' : 'High volatility increases risk'
    ],
    opportunities: [
      quote.price < technicals.bollingerBands.lower ? 'Price near lower Bollinger Band - potential mean reversion' : 'Monitor for breakout above resistance',
      technicals.macd.histogram > 0 && technicals.rsi14 < 60 ? 'Bullish momentum building without overbought conditions' : 'Watch for trend confirmation'
    ],
    priceTargets: {
      support: Math.max(quote.price - atrBuffer, quote.fiftyTwoWeekLow),
      resistance: Math.min(quote.price + atrBuffer, quote.fiftyTwoWeekHigh)
    },
    recommendation: sentiment === 'bullish' 
      ? `Consider entries above $${technicals.sma20.toFixed(2)} with stop at $${(quote.price - technicals.atr14 * 1.5).toFixed(2)}`
      : sentiment === 'bearish'
      ? `Wait for stabilization. Potential support at $${technicals.bollingerBands.lower.toFixed(2)}`
      : `Range-bound trading. Buy near $${technicals.bollingerBands.lower.toFixed(2)}, sell near $${technicals.bollingerBands.upper.toFixed(2)}`
  };
}

export async function researchStock(symbol: string): Promise<StockResearchResult> {
  const upperSymbol = symbol.toUpperCase().trim();
  
  const cached = researchCache.get(upperSymbol);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upperSymbol)}?interval=1d&range=1y&includePrePost=false`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${upperSymbol}. Please check the symbol and try again.`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];
  
  if (!result) {
    throw new Error(`Symbol "${upperSymbol}" not found. Please enter a valid stock ticker.`);
  }

  const meta = result.meta;
  const quotes = result.indicators?.quote?.[0];
  const rawClose = quotes?.close || [];
  const rawHigh = quotes?.high || [];
  const rawLow = quotes?.low || [];
  const rawVolume = quotes?.volume || [];
  
  const closes: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const volumes: number[] = [];
  
  const len = Math.min(rawClose.length, rawHigh.length, rawLow.length, rawVolume.length);
  for (let i = 0; i < len; i++) {
    if (rawClose[i] != null && rawHigh[i] != null && rawLow[i] != null && rawVolume[i] != null) {
      closes.push(rawClose[i]);
      highs.push(rawHigh[i]);
      lows.push(rawLow[i]);
      volumes.push(rawVolume[i]);
    }
  }

  if (closes.length < 20) {
    throw new Error(`Insufficient data for ${upperSymbol}. Need at least 20 trading days.`);
  }

  const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
  const previousClose = meta.previousClose || closes[closes.length - 2];
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  const quote: StockQuote = {
    symbol: upperSymbol,
    name: meta.longName || meta.shortName || upperSymbol,
    price: currentPrice,
    change,
    changePercent,
    open: quotes?.open?.[quotes.open.length - 1] || currentPrice,
    high: highs[highs.length - 1] || currentPrice,
    low: lows[lows.length - 1] || currentPrice,
    previousClose,
    volume: volumes[volumes.length - 1] || 0,
    avgVolume: volumes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20,
    marketCap: meta.marketCap || 0,
    peRatio: null,
    dividendYield: null,
    fiftyTwoWeekHigh: Math.max(...highs.slice(-252)),
    fiftyTwoWeekLow: Math.min(...lows.slice(-252).filter((l: number) => l > 0)),
    beta: null
  };

  const technicals = calculateTechnicals(upperSymbol, closes, highs, lows, volumes);
  const aiAnalysis = await generateAIAnalysis(quote, technicals);

  let predictive: PredictiveData | undefined;
  const timestamps = result.timestamp || [];
  if (closes.length >= 20 && timestamps.length >= 20) {
    try {
      const candles: Candle[] = [];
      for (let i = 0; i < Math.min(closes.length, timestamps.length); i++) {
        candles.push({
          time: timestamps[i] * 1000,
          open: quotes?.open?.[i] || closes[i],
          high: highs[i],
          low: lows[i],
          close: closes[i],
          volume: volumes[i]
        });
      }
      
      const snapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
        upperSymbol,
        candles
      );
      
      predictive = {
        neuralIndex: snapshot.neuralIndex.direction,
        neuralConfidence: snapshot.neuralIndex.confidence,
        completeAgreement: snapshot.neuralIndex.completeAgreement,
        doubleConfirmed: snapshot.doubleConfirmation.confirmed,
        doubleConfirmationScore: snapshot.doubleConfirmation.score,
        predictedHigh: snapshot.predictedRange.predictedHigh,
        predictedLow: snapshot.predictedRange.predictedLow,
        maCrossover: snapshot.predictedMAs.crossovers.shortMediumCross,
        trendStrength: snapshot.trendStrength.overallStrength,
        overallSignal: snapshot.overallSignal,
        liquiditySweep: {
          status: snapshot.liquiditySweep.status,
          gate1Passed: snapshot.liquiditySweep.gate1Passed,
          gate2Passed: snapshot.liquiditySweep.gate2Passed,
          gate3Passed: snapshot.liquiditySweep.gate3Passed,
          swingLow: snapshot.liquiditySweep.swingLow,
          volumeMultiplier: snapshot.liquiditySweep.volumeMultiplier,
          isConsolidating: snapshot.liquiditySweep.isConsolidating,
          isWeakSweep: snapshot.liquiditySweep.isWeakSweep,
          targetFVG: snapshot.liquiditySweep.targetFVG,
          reasons: snapshot.liquiditySweep.reasons
        }
      };
    } catch (e) {
      console.error('Predictive snapshot error:', e);
    }
  }

  const researchResult: StockResearchResult = {
    quote,
    technicals,
    aiAnalysis,
    predictive,
    timestamp: new Date()
  };

  researchCache.set(upperSymbol, { data: researchResult, expiry: Date.now() + CACHE_TTL });

  return researchResult;
}

export async function getQuickQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number }> {
  const quote = await fetchYahooQuote(symbol);
  return {
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent
  };
}
