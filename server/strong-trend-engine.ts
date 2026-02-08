import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface StrongTrendSignal {
  symbol: string;
  trend: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  trendStrength: number;
  confidence: number;
  direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  priceAction: {
    currentPrice: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    high24h: number;
    low24h: number;
    sessionHigh: number;
    sessionLow: number;
    distanceFromHigh: number;
    distanceFromLow: number;
    breakoutDetected: boolean;
    breakdownDetected: boolean;
  };
  volumeAnalysis: {
    currentVolume: number;
    avgVolume: number;
    volumeRatio: number;
    volumeConfirming: boolean;
    volumeSurge: boolean;
  };
  marketStructure: {
    higherHighs: boolean;
    higherLows: boolean;
    lowerHighs: boolean;
    lowerLows: boolean;
    structureType: 'UPTREND' | 'DOWNTREND' | 'RANGE' | 'CONSOLIDATION';
    consecutiveBullishCandles: number;
    consecutiveBearishCandles: number;
  };
  momentum: {
    shortTermMomentum: number;
    priceVelocity: number;
    accelerating: boolean;
    decelerating: boolean;
  };
  globalContext: {
    marketRegime: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL';
    sectorStrength: number;
    correlatedAssets: { symbol: string; correlation: number; trend: string }[];
  };
  alertLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reasoning: string[];
  timestamp: string;
}

export interface TrendEngineConfig {
  minTrendStrength: number;
  volumeThreshold: number;
  momentumThreshold: number;
  lookbackPeriod: number;
}

const DEFAULT_CONFIG: TrendEngineConfig = {
  minTrendStrength: 60,
  volumeThreshold: 1.5,
  momentumThreshold: 2.0,
  lookbackPeriod: 20
};

async function getYahooData(symbol: string): Promise<any> {
  try {
    const yahooSymbol = symbol.includes('/') ? symbol.replace('/', '-') : symbol;
    
    const quote = await yahooFinance.quote(yahooSymbol);
    if (!quote) return null;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    
    const historical = await yahooFinance.chart(yahooSymbol, {
      period1: startDate,
      period2: endDate,
      interval: '5m'
    });

    return { quote, historical };
  } catch (error) {
    console.error(`Failed to fetch Yahoo data for ${symbol}:`, error);
    return null;
  }
}

function analyzePriceAction(quote: any, historical: any): StrongTrendSignal['priceAction'] {
  const currentPrice = quote.regularMarketPrice || 0;
  const prevClose = quote.regularMarketPreviousClose || currentPrice;
  const priceChange24h = currentPrice - prevClose;
  const priceChangePercent24h = prevClose > 0 ? (priceChange24h / prevClose) * 100 : 0;
  
  const high24h = quote.regularMarketDayHigh || currentPrice;
  const low24h = quote.regularMarketDayLow || currentPrice;
  
  const quotes = historical?.quotes || [];
  let sessionHigh = high24h;
  let sessionLow = low24h;
  for (const q of quotes) {
    if (q?.high && q.high > sessionHigh) sessionHigh = q.high;
    if (q?.low && q.low > 0 && q.low < sessionLow) sessionLow = q.low;
  }
  
  const distanceFromHigh = sessionHigh > 0 ? ((sessionHigh - currentPrice) / sessionHigh) * 100 : 0;
  const distanceFromLow = sessionLow > 0 ? ((currentPrice - sessionLow) / sessionLow) * 100 : 0;
  
  const breakoutDetected = distanceFromHigh < 1.5 && priceChangePercent24h > 1.5;
  const breakdownDetected = distanceFromLow < 1.5 && priceChangePercent24h < -1.5;
  
  return {
    currentPrice,
    priceChange24h,
    priceChangePercent24h,
    high24h,
    low24h,
    sessionHigh: sessionHigh,
    sessionLow: sessionLow,
    distanceFromHigh,
    distanceFromLow,
    breakoutDetected,
    breakdownDetected
  };
}

function analyzeVolume(quote: any): StrongTrendSignal['volumeAnalysis'] {
  const currentVolume = quote.regularMarketVolume || 0;
  const avgVolume = quote.averageDailyVolume10Day || quote.averageVolume || 1;
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;
  
  return {
    currentVolume,
    avgVolume,
    volumeRatio,
    volumeConfirming: volumeRatio > 1.2,
    volumeSurge: volumeRatio > 2.0
  };
}

function analyzeMarketStructure(historical: any): StrongTrendSignal['marketStructure'] {
  const quotes = historical?.quotes || [];
  if (quotes.length < 5) {
    return {
      higherHighs: false,
      higherLows: false,
      lowerHighs: false,
      lowerLows: false,
      structureType: 'CONSOLIDATION',
      consecutiveBullishCandles: 0,
      consecutiveBearishCandles: 0
    };
  }
  
  const recentCandles = quotes.slice(-10);
  let higherHighs = 0;
  let higherLows = 0;
  let lowerHighs = 0;
  let lowerLows = 0;
  let consecutiveBullish = 0;
  let consecutiveBearish = 0;
  let maxConsecutiveBullish = 0;
  let maxConsecutiveBearish = 0;
  
  for (let i = 1; i < recentCandles.length; i++) {
    const curr = recentCandles[i];
    const prev = recentCandles[i - 1];
    
    if (!curr || !prev) continue;
    
    if (curr.high > prev.high) higherHighs++;
    if (curr.low > prev.low) higherLows++;
    if (curr.high < prev.high) lowerHighs++;
    if (curr.low < prev.low) lowerLows++;
    
    const isBullish = curr.close > curr.open;
    const isBearish = curr.close < curr.open;
    
    if (isBullish) {
      consecutiveBullish++;
      consecutiveBearish = 0;
      maxConsecutiveBullish = Math.max(maxConsecutiveBullish, consecutiveBullish);
    } else if (isBearish) {
      consecutiveBearish++;
      consecutiveBullish = 0;
      maxConsecutiveBearish = Math.max(maxConsecutiveBearish, consecutiveBearish);
    }
  }
  
  const isUptrend = higherHighs >= 6 && higherLows >= 6;
  const isDowntrend = lowerHighs >= 6 && lowerLows >= 6;
  
  let structureType: 'UPTREND' | 'DOWNTREND' | 'RANGE' | 'CONSOLIDATION' = 'CONSOLIDATION';
  if (isUptrend) structureType = 'UPTREND';
  else if (isDowntrend) structureType = 'DOWNTREND';
  else if (Math.abs(higherHighs - lowerHighs) <= 2) structureType = 'RANGE';
  
  return {
    higherHighs: higherHighs >= 6,
    higherLows: higherLows >= 6,
    lowerHighs: lowerHighs >= 6,
    lowerLows: lowerLows >= 6,
    structureType,
    consecutiveBullishCandles: maxConsecutiveBullish,
    consecutiveBearishCandles: maxConsecutiveBearish
  };
}

function analyzeMomentum(quote: any, historical: any): StrongTrendSignal['momentum'] {
  const quotes = historical?.quotes || [];
  if (quotes.length < 5) {
    return {
      shortTermMomentum: 0,
      priceVelocity: 0,
      accelerating: false,
      decelerating: false
    };
  }
  
  const recent5 = quotes.slice(-5);
  const previous5 = quotes.slice(-10, -5);
  
  const recentChange = recent5.length >= 2 
    ? ((recent5[recent5.length - 1]?.close || 0) - (recent5[0]?.close || 0)) / (recent5[0]?.close || 1) * 100 
    : 0;
  
  const previousChange = previous5.length >= 2 
    ? ((previous5[previous5.length - 1]?.close || 0) - (previous5[0]?.close || 0)) / (previous5[0]?.close || 1) * 100 
    : 0;
  
  const priceVelocity = recentChange - previousChange;
  const accelerating = recentChange > previousChange && recentChange > 0;
  const decelerating = Math.abs(recentChange) < Math.abs(previousChange);
  
  return {
    shortTermMomentum: recentChange,
    priceVelocity,
    accelerating,
    decelerating
  };
}

async function getGlobalContext(symbol: string, quote: any): Promise<StrongTrendSignal['globalContext']> {
  let marketRegime: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' = 'NEUTRAL';
  
  try {
    const spyQuote = await yahooFinance.quote('SPY');
    const vixQuote = await yahooFinance.quote('^VIX');
    
    const spyChange = spyQuote?.regularMarketChangePercent || 0;
    const vixLevel = vixQuote?.regularMarketPrice || 20;
    
    if (spyChange > 0.5 && vixLevel < 20) {
      marketRegime = 'RISK_ON';
    } else if (spyChange < -0.5 || vixLevel > 25) {
      marketRegime = 'RISK_OFF';
    }
  } catch (error) {
    console.error('Failed to get market regime:', error);
  }
  
  return {
    marketRegime,
    sectorStrength: 50,
    correlatedAssets: []
  };
}

function calculateTrendStrength(
  priceAction: StrongTrendSignal['priceAction'],
  volumeAnalysis: StrongTrendSignal['volumeAnalysis'],
  marketStructure: StrongTrendSignal['marketStructure'],
  momentum: StrongTrendSignal['momentum']
): { trend: StrongTrendSignal['trend']; strength: number; direction: StrongTrendSignal['direction'] } {
  let bullishScore = 0;
  let bearishScore = 0;
  
  if (priceAction.priceChangePercent24h > 2) bullishScore += 20;
  else if (priceAction.priceChangePercent24h > 1) bullishScore += 10;
  else if (priceAction.priceChangePercent24h < -2) bearishScore += 20;
  else if (priceAction.priceChangePercent24h < -1) bearishScore += 10;
  
  if (priceAction.breakoutDetected) bullishScore += 25;
  if (priceAction.breakdownDetected) bearishScore += 25;
  
  if (marketStructure.structureType === 'UPTREND') bullishScore += 25;
  else if (marketStructure.structureType === 'DOWNTREND') bearishScore += 25;
  
  if (marketStructure.higherHighs && marketStructure.higherLows) bullishScore += 15;
  if (marketStructure.lowerHighs && marketStructure.lowerLows) bearishScore += 15;
  
  if (marketStructure.consecutiveBullishCandles >= 3) bullishScore += 10;
  if (marketStructure.consecutiveBearishCandles >= 3) bearishScore += 10;
  
  if (momentum.shortTermMomentum > 3) bullishScore += 15;
  else if (momentum.shortTermMomentum > 1.5) bullishScore += 10;
  else if (momentum.shortTermMomentum < -3) bearishScore += 15;
  else if (momentum.shortTermMomentum < -1.5) bearishScore += 10;
  
  if (momentum.accelerating && momentum.shortTermMomentum > 0) bullishScore += 10;
  if (momentum.accelerating && momentum.shortTermMomentum < 0) bearishScore += 10;
  
  if (volumeAnalysis.volumeConfirming) {
    if (bullishScore > bearishScore) bullishScore += 10;
    else if (bearishScore > bullishScore) bearishScore += 10;
  }
  if (volumeAnalysis.volumeSurge) {
    if (bullishScore > bearishScore) bullishScore += 15;
    else if (bearishScore > bullishScore) bearishScore += 15;
  }
  
  const netScore = bullishScore - bearishScore;
  const totalStrength = Math.abs(netScore);
  
  let trend: StrongTrendSignal['trend'];
  let direction: StrongTrendSignal['direction'];
  
  if (netScore >= 60) {
    trend = 'STRONG_BULLISH';
    direction = 'UP';
  } else if (netScore >= 30) {
    trend = 'BULLISH';
    direction = 'UP';
  } else if (netScore <= -60) {
    trend = 'STRONG_BEARISH';
    direction = 'DOWN';
  } else if (netScore <= -30) {
    trend = 'BEARISH';
    direction = 'DOWN';
  } else {
    trend = 'NEUTRAL';
    direction = 'SIDEWAYS';
  }
  
  return { trend, strength: Math.min(100, totalStrength), direction };
}

function generateReasoning(
  trend: StrongTrendSignal['trend'],
  priceAction: StrongTrendSignal['priceAction'],
  volumeAnalysis: StrongTrendSignal['volumeAnalysis'],
  marketStructure: StrongTrendSignal['marketStructure'],
  momentum: StrongTrendSignal['momentum']
): string[] {
  const reasons: string[] = [];
  
  if (trend === 'STRONG_BULLISH' || trend === 'STRONG_BEARISH') {
    reasons.push(`STRONG TREND DETECTED: ${trend.replace('_', ' ')}`);
  }
  
  if (priceAction.priceChangePercent24h > 2) {
    reasons.push(`Price surging +${priceAction.priceChangePercent24h.toFixed(2)}% in 24h`);
  } else if (priceAction.priceChangePercent24h < -2) {
    reasons.push(`Price dropping ${priceAction.priceChangePercent24h.toFixed(2)}% in 24h`);
  }
  
  if (priceAction.breakoutDetected) {
    reasons.push('Near session highs - BREAKOUT ZONE');
  }
  if (priceAction.breakdownDetected) {
    reasons.push('Near session lows - BREAKDOWN ZONE');
  }
  
  if (marketStructure.structureType === 'UPTREND') {
    reasons.push('Market structure: Clear UPTREND with higher highs and higher lows');
  } else if (marketStructure.structureType === 'DOWNTREND') {
    reasons.push('Market structure: Clear DOWNTREND with lower highs and lower lows');
  }
  
  if (marketStructure.consecutiveBullishCandles >= 3) {
    reasons.push(`${marketStructure.consecutiveBullishCandles} consecutive bullish candles - strong buying pressure`);
  }
  if (marketStructure.consecutiveBearishCandles >= 3) {
    reasons.push(`${marketStructure.consecutiveBearishCandles} consecutive bearish candles - strong selling pressure`);
  }
  
  if (volumeAnalysis.volumeSurge) {
    reasons.push(`Volume surge: ${volumeAnalysis.volumeRatio.toFixed(1)}x average - institutional interest`);
  } else if (volumeAnalysis.volumeConfirming) {
    reasons.push(`Above-average volume confirming trend: ${volumeAnalysis.volumeRatio.toFixed(1)}x`);
  }
  
  if (momentum.accelerating) {
    reasons.push('Momentum ACCELERATING - trend strengthening');
  }
  
  if (momentum.shortTermMomentum > 3) {
    reasons.push(`Strong upward momentum: +${momentum.shortTermMomentum.toFixed(2)}% short-term`);
  } else if (momentum.shortTermMomentum < -3) {
    reasons.push(`Strong downward momentum: ${momentum.shortTermMomentum.toFixed(2)}% short-term`);
  }
  
  return reasons;
}

function determineAlertLevel(
  trend: StrongTrendSignal['trend'],
  strength: number,
  volumeAnalysis: StrongTrendSignal['volumeAnalysis'],
  priceAction: StrongTrendSignal['priceAction']
): StrongTrendSignal['alertLevel'] {
  if ((trend === 'STRONG_BULLISH' || trend === 'STRONG_BEARISH') && strength >= 70) {
    if (volumeAnalysis.volumeSurge || priceAction.breakoutDetected || priceAction.breakdownDetected) {
      return 'CRITICAL';
    }
    return 'HIGH';
  }
  
  if ((trend === 'BULLISH' || trend === 'BEARISH') && strength >= 50) {
    return 'MEDIUM';
  }
  
  if (trend !== 'NEUTRAL') {
    return 'LOW';
  }
  
  return 'NONE';
}

export async function analyzeStrongTrend(
  symbol: string,
  config: Partial<TrendEngineConfig> = {}
): Promise<StrongTrendSignal | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const data = await getYahooData(symbol);
    if (!data || !data.quote) {
      console.error(`No data available for ${symbol}`);
      return null;
    }
    
    const { quote, historical } = data;
    
    const priceAction = analyzePriceAction(quote, historical);
    const volumeAnalysis = analyzeVolume(quote);
    const marketStructure = analyzeMarketStructure(historical);
    const momentum = analyzeMomentum(quote, historical);
    const globalContext = await getGlobalContext(symbol, quote);
    
    const { trend, strength, direction } = calculateTrendStrength(
      priceAction, volumeAnalysis, marketStructure, momentum
    );
    
    const reasoning = generateReasoning(trend, priceAction, volumeAnalysis, marketStructure, momentum);
    const alertLevel = determineAlertLevel(trend, strength, volumeAnalysis, priceAction);
    
    const confidence = Math.min(95, 40 + strength * 0.5 + 
      (volumeAnalysis.volumeConfirming ? 10 : 0) +
      (marketStructure.structureType !== 'CONSOLIDATION' ? 10 : 0) +
      (momentum.accelerating ? 5 : 0));
    
    return {
      symbol,
      trend,
      trendStrength: strength,
      confidence,
      direction,
      priceAction,
      volumeAnalysis,
      marketStructure,
      momentum,
      globalContext,
      alertLevel,
      reasoning,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error analyzing trend for ${symbol}:`, error);
    return null;
  }
}

export async function scanForStrongTrends(
  symbols: string[],
  minStrength: number = 50,
  config: Partial<TrendEngineConfig> = {}
): Promise<StrongTrendSignal[]> {
  const results: StrongTrendSignal[] = [];
  
  for (const symbol of symbols) {
    try {
      const signal = await analyzeStrongTrend(symbol, config);
      if (signal && signal.trendStrength >= minStrength && signal.trend !== 'NEUTRAL') {
        results.push(signal);
      }
    } catch (error) {
      console.error(`Failed to analyze ${symbol}:`, error);
    }
  }
  
  results.sort((a, b) => b.trendStrength - a.trendStrength);
  
  return results;
}

export async function getStrongestTrends(
  symbols: string[],
  topN: number = 10,
  config: Partial<TrendEngineConfig> = {}
): Promise<{ bullish: StrongTrendSignal[]; bearish: StrongTrendSignal[] }> {
  const allSignals = await scanForStrongTrends(symbols, 30, config);
  
  const bullish = allSignals
    .filter(s => s.trend === 'STRONG_BULLISH' || s.trend === 'BULLISH')
    .slice(0, topN);
  
  const bearish = allSignals
    .filter(s => s.trend === 'STRONG_BEARISH' || s.trend === 'BEARISH')
    .slice(0, topN);
  
  return { bullish, bearish };
}
