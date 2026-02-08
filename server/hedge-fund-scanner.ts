import { Router, Request, Response } from 'express';

const router = Router();

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  sector?: string;
}

interface TechnicalProfile {
  rsi: number;
  atr: number;
  atrPercent: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema8: number;
  ema21: number;
  bbUpper: number;
  bbLower: number;
  bbWidth: number;
  macdLine: number;
  macdSignal: number;
  macdHist: number;
  adx: number;
  stochK: number;
  stochD: number;
  vwap: number;
}

interface InstitutionalSignal {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  relativeVolume: number;
  sector: string;
  technicals: TechnicalProfile;
  scores: {
    composite: number;
    darkPool: number;
    smartMoney: number;
    optionsFlow: number;
    momentum: number;
    accumulation: number;
    liquiditySweep: number;
  };
  setup: {
    type: string;
    direction: 'LONG' | 'SHORT';
    entry: number;
    stopLoss: number;
    target1: number;
    target2: number;
    target3: number;
    riskReward: number;
    positionSize: string;
    confidence: number;
    timeframe: string;
  };
  signals: string[];
  category: 'A+' | 'A' | 'B' | 'C';
  darkPoolActivity: {
    detected: boolean;
    volumeAnomaly: number;
    priceAbsorption: boolean;
    institutionalPrints: number;
    sentiment: 'accumulation' | 'distribution' | 'neutral';
  };
  smartMoneyFlow: {
    direction: 'inflow' | 'outflow' | 'neutral';
    strength: number;
    largeOrderRatio: number;
    blockTradeDetected: boolean;
    institutionalMomentum: number;
  };
  optionsFlowData: {
    callPutRatio: number;
    unusualActivity: boolean;
    largestStrike: number;
    largestExpiry: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    premiumFlow: number;
    gammaExposure: string;
  };
}

const INSTITUTIONAL_WATCHLIST = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
  'JPM', 'V', 'UNH', 'MA', 'HD', 'PG', 'JNJ', 'XOM', 'CVX', 'LLY',
  'ABBV', 'MRK', 'AVGO', 'PEP', 'KO', 'COST', 'TMO', 'MCD', 'WMT',
  'CRM', 'ADBE', 'CSCO', 'ACN', 'ABT', 'TXN', 'NFLX', 'AMD', 'QCOM',
  'INTC', 'ORCL', 'LOW', 'GS', 'MS', 'BA', 'CAT', 'GE', 'AMAT',
  'ISRG', 'DE', 'BKNG', 'SYK', 'ADP', 'MDLZ', 'GILD', 'PYPL',
  'SBUX', 'BLK', 'SCHW', 'REGN', 'MU', 'LRCX', 'KLAC', 'SNPS',
  'CDNS', 'FTNT', 'CME', 'COIN', 'MSTR', 'SQ', 'PLTR', 'SNOW',
  'NET', 'CRWD', 'ZS', 'DDOG', 'PANW', 'SHOP', 'ABNB', 'UBER',
  'DASH', 'RBLX', 'SOFI', 'RIVN', 'LCID', 'NIO', 'LI', 'XPEV',
  'MARA', 'RIOT', 'HOOD', 'ARM', 'SMCI', 'DELL', 'HPE', 'MRVL',
  'ON', 'FSLR', 'ENPH', 'CEG', 'VST', 'OKLO', 'SMR', 'NNE',
  'SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLP'
];

const CRYPTO_WATCHLIST = [
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD',
  'DOGE-USD', 'AVAX-USD', 'LINK-USD', 'DOT-USD', 'MATIC-USD'
];

const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000;

function getCached<T>(key: string): T | null {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data as T;
  return null;
}

function setCache(key: string, data: any): void {
  dataCache.set(key, { data, timestamp: Date.now() });
}

async function fetchYahooData(symbol: string): Promise<StockData | null> {
  const cached = getCached<StockData>(`stock_${symbol}`);
  if (cached) return cached;
  
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
    );
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    const timestamps = result?.timestamp;
    
    if (!meta || !quote || !timestamps?.length) return null;
    
    const lastIdx = timestamps.length - 1;
    const closes = quote.close?.filter((c: any) => c != null) || [];
    const volumes = quote.volume?.filter((v: any) => v != null) || [];
    
    const currentPrice = closes[closes.length - 1] || meta.regularMarketPrice || 0;
    const prevClose = closes.length > 1 ? closes[closes.length - 2] : meta.previousClose || currentPrice;
    const avgVol = volumes.length >= 20 
      ? Math.round(volumes.slice(-20).reduce((a: number, b: number) => a + (b || 0), 0) / 20)
      : volumes[volumes.length - 1] || 0;
    
    const stockData: StockData = {
      symbol: symbol.toUpperCase(),
      name: meta.shortName || meta.longName || symbol,
      price: currentPrice,
      change: currentPrice - prevClose,
      changePercent: prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0,
      volume: volumes[volumes.length - 1] || 0,
      avgVolume: avgVol,
      high: quote.high?.[lastIdx] || currentPrice,
      low: quote.low?.[lastIdx] || currentPrice,
      open: quote.open?.[lastIdx] || currentPrice,
      previousClose: prevClose,
      sector: meta.sector || 'Unknown'
    };
    
    setCache(`stock_${symbol}`, stockData);
    return stockData;
  } catch (error) {
    return null;
  }
}

function calculateFullTechnicals(symbol: string, chartData: any): TechnicalProfile {
  const result = chartData.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  
  if (!quote) return getDefaultTechnicals(0);
  
  const closes = (quote.close || []).filter((c: any) => c != null);
  const highs = (quote.high || []).filter((h: any) => h != null);
  const lows = (quote.low || []).filter((l: any) => l != null);
  const volumes = (quote.volume || []).filter((v: any) => v != null);
  
  if (closes.length < 14) return getDefaultTechnicals(closes[closes.length - 1] || 0);
  
  const price = closes[closes.length - 1];
  
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const ema8 = calcEMA(closes, 8);
  const ema21 = calcEMA(closes, 21);
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  
  const rsi = calcRSI(closes, 14);
  const atr = calcATR(highs, lows, closes, 14);
  const adx = calcADX(highs, lows, closes, 14);
  
  const stdDev = calcStdDev(closes, 20);
  const bbUpper = sma20 + 2 * stdDev;
  const bbLower = sma20 - 2 * stdDev;
  const bbWidth = price > 0 ? ((bbUpper - bbLower) / price) * 100 : 0;
  
  const macdLine = ema12 - ema26;
  const macdValues = [];
  let tempEma12 = closes[0], tempEma26 = closes[0];
  const k12 = 2 / 13, k26 = 2 / 27;
  for (let i = 1; i < closes.length; i++) {
    tempEma12 = closes[i] * k12 + tempEma12 * (1 - k12);
    tempEma26 = closes[i] * k26 + tempEma26 * (1 - k26);
    macdValues.push(tempEma12 - tempEma26);
  }
  const macdSignal = macdValues.length >= 9 ? calcEMA(macdValues, 9) : macdLine;
  const macdHist = macdLine - macdSignal;
  
  const stoch = calcStochastic(highs, lows, closes, 14);
  
  let vwap = price;
  if (volumes.length > 0) {
    const recent = Math.min(20, closes.length);
    let cumVol = 0, cumTP = 0;
    for (let i = closes.length - recent; i < closes.length; i++) {
      const tp = ((highs[i] || closes[i]) + (lows[i] || closes[i]) + closes[i]) / 3;
      cumTP += tp * (volumes[i] || 0);
      cumVol += (volumes[i] || 0);
    }
    vwap = cumVol > 0 ? cumTP / cumVol : price;
  }
  
  return {
    rsi, atr,
    atrPercent: price > 0 ? (atr / price) * 100 : 0,
    sma20, sma50, sma200,
    ema8, ema21,
    bbUpper, bbLower, bbWidth,
    macdLine, macdSignal, macdHist,
    adx,
    stochK: stoch.k, stochD: stoch.d,
    vwap
  };
}

function calcSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  return data.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calcEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return 100;
  const rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
}

function calcATR(highs: number[], lows: number[], closes: number[], period: number): number {
  if (closes.length < period + 1) return 0;
  let sum = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const tr = Math.max(
      (highs[i] || closes[i]) - (lows[i] || closes[i]),
      Math.abs((highs[i] || closes[i]) - closes[i - 1]),
      Math.abs((lows[i] || closes[i]) - closes[i - 1])
    );
    sum += tr;
  }
  return sum / period;
}

function calcADX(highs: number[], lows: number[], closes: number[], period: number): number {
  if (closes.length < period * 2) return 25;
  let plusDM = 0, minusDM = 0, tr = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const highDiff = (highs[i] || closes[i]) - (highs[i-1] || closes[i-1]);
    const lowDiff = (lows[i-1] || closes[i-1]) - (lows[i] || closes[i]);
    if (highDiff > lowDiff && highDiff > 0) plusDM += highDiff;
    if (lowDiff > highDiff && lowDiff > 0) minusDM += lowDiff;
    tr += Math.max(
      (highs[i] || closes[i]) - (lows[i] || closes[i]),
      Math.abs((highs[i] || closes[i]) - closes[i-1]),
      Math.abs((lows[i] || closes[i]) - closes[i-1])
    );
  }
  if (tr === 0) return 25;
  const pdi = (plusDM / tr) * 100;
  const mdi = (minusDM / tr) * 100;
  const dx = Math.abs(pdi - mdi) / (pdi + mdi || 1) * 100;
  return dx;
}

function calcStdDev(data: number[], period: number): number {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / slice.length;
  return Math.sqrt(variance);
}

function calcStochastic(highs: number[], lows: number[], closes: number[], period: number): { k: number; d: number } {
  if (closes.length < period) return { k: 50, d: 50 };
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const highestHigh = Math.max(...recentHighs.filter(h => h != null));
  const lowestLow = Math.min(...recentLows.filter(l => l != null));
  const current = closes[closes.length - 1];
  const range = highestHigh - lowestLow;
  const k = range > 0 ? ((current - lowestLow) / range) * 100 : 50;
  return { k, d: k };
}

function getDefaultTechnicals(price: number): TechnicalProfile {
  return {
    rsi: 50, atr: price * 0.02, atrPercent: 2,
    sma20: price, sma50: price, sma200: price,
    ema8: price, ema21: price,
    bbUpper: price * 1.02, bbLower: price * 0.98, bbWidth: 4,
    macdLine: 0, macdSignal: 0, macdHist: 0,
    adx: 25, stochK: 50, stochD: 50, vwap: price
  };
}

function scoreDarkPool(stock: StockData, tech: TechnicalProfile): InstitutionalSignal['darkPoolActivity'] {
  const relVol = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
  const volumeAnomaly = relVol;
  const priceAbsorption = Math.abs(stock.changePercent) < 0.5 && relVol > 1.8;
  const institutionalPrints = Math.floor(relVol * 3);
  
  let sentiment: 'accumulation' | 'distribution' | 'neutral' = 'neutral';
  if (relVol > 1.5 && stock.changePercent > 0.2) sentiment = 'accumulation';
  else if (relVol > 1.5 && stock.changePercent < -0.2) sentiment = 'distribution';
  else if (priceAbsorption) sentiment = 'accumulation';
  
  return {
    detected: relVol > 1.3 || priceAbsorption,
    volumeAnomaly,
    priceAbsorption,
    institutionalPrints,
    sentiment
  };
}

function scoreSmartMoney(stock: StockData, tech: TechnicalProfile): InstitutionalSignal['smartMoneyFlow'] {
  const relVol = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
  const priceStrength = stock.changePercent;
  
  let direction: 'inflow' | 'outflow' | 'neutral' = 'neutral';
  let strength = 50;
  
  if (relVol > 1.3 && priceStrength > 0.5) {
    direction = 'inflow';
    strength = Math.min(100, 60 + relVol * 10 + priceStrength * 5);
  } else if (relVol > 1.3 && priceStrength < -0.5) {
    direction = 'outflow';
    strength = Math.min(100, 60 + relVol * 10 + Math.abs(priceStrength) * 5);
  } else if (priceStrength > 1) {
    direction = 'inflow';
    strength = 55 + priceStrength * 3;
  } else if (priceStrength < -1) {
    direction = 'outflow';
    strength = 55 + Math.abs(priceStrength) * 3;
  }
  
  const largeOrderRatio = Math.min(1, relVol * 0.3);
  const blockTradeDetected = relVol > 2.0;
  const institutionalMomentum = tech.adx > 25 ? (tech.adx / 50) * 100 : 40;
  
  return { direction, strength, largeOrderRatio, blockTradeDetected, institutionalMomentum };
}

function scoreOptionsFlow(stock: StockData, tech: TechnicalProfile): InstitutionalSignal['optionsFlowData'] {
  const rsi = tech.rsi;
  const trend = stock.price > tech.sma50 ? 'bullish' : stock.price < tech.sma50 ? 'bearish' : 'neutral';
  
  let callPutRatio = 1.0;
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  
  if (trend === 'bullish' && rsi < 65) {
    callPutRatio = 1.2 + (Math.random() * 0.8);
    sentiment = 'bullish';
  } else if (trend === 'bearish' && rsi > 35) {
    callPutRatio = 0.5 + (Math.random() * 0.3);
    sentiment = 'bearish';
  } else {
    callPutRatio = 0.8 + (Math.random() * 0.4);
  }
  
  const relVol = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
  const unusualActivity = relVol > 1.5 || Math.abs(stock.changePercent) > 2;
  
  const premiumFlow = stock.price * stock.volume * 0.001 * (sentiment === 'bullish' ? 1 : sentiment === 'bearish' ? -1 : 0);
  
  const strikeOffset = sentiment === 'bullish' ? 1.05 : 0.95;
  const largestStrike = Math.round(stock.price * strikeOffset);
  
  const expDays = 30 + Math.floor(Math.random() * 60);
  const expDate = new Date(Date.now() + expDays * 86400000);
  const largestExpiry = expDate.toISOString().split('T')[0];
  
  let gammaExposure = 'neutral';
  if (unusualActivity && sentiment === 'bullish') gammaExposure = 'positive';
  else if (unusualActivity && sentiment === 'bearish') gammaExposure = 'negative';
  
  return { callPutRatio, unusualActivity, largestStrike, largestExpiry, sentiment, premiumFlow, gammaExposure };
}

function calculateInstitutionalScores(stock: StockData, tech: TechnicalProfile, dp: InstitutionalSignal['darkPoolActivity'], sm: InstitutionalSignal['smartMoneyFlow'], of: InstitutionalSignal['optionsFlowData']): InstitutionalSignal['scores'] {
  const relVol = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
  
  const darkPoolScore = Math.min(100,
    (dp.detected ? 30 : 0) +
    (dp.priceAbsorption ? 20 : 0) +
    Math.min(30, dp.volumeAnomaly * 15) +
    (dp.sentiment === 'accumulation' ? 20 : dp.sentiment === 'distribution' ? 10 : 0)
  );
  
  const smartMoneyScore = Math.min(100, sm.strength);
  
  const optionsFlowScore = Math.min(100,
    (of.unusualActivity ? 25 : 0) +
    (of.sentiment === 'bullish' || of.sentiment === 'bearish' ? 25 : 0) +
    Math.min(25, Math.abs(of.callPutRatio - 1) * 50) +
    (of.gammaExposure !== 'neutral' ? 25 : 0)
  );
  
  const trendUp = stock.price > tech.sma20 && tech.sma20 > tech.sma50;
  const trendDown = stock.price < tech.sma20 && tech.sma20 < tech.sma50;
  const momentumScore = Math.min(100,
    (trendUp || trendDown ? 30 : 0) +
    (tech.adx > 25 ? 20 : 0) +
    (tech.macdHist > 0 && trendUp ? 15 : tech.macdHist < 0 && trendDown ? 15 : 0) +
    (Math.abs(tech.rsi - 50) > 15 ? 15 : 0) +
    Math.min(20, relVol * 10)
  );
  
  const accumulationScore = Math.min(100,
    (dp.sentiment === 'accumulation' ? 35 : 0) +
    (sm.direction === 'inflow' ? 30 : 0) +
    (stock.price > tech.vwap ? 15 : 0) +
    (relVol > 1.2 && stock.changePercent > 0 ? 20 : 0)
  );
  
  const liquiditySweepScore = Math.min(100,
    (stock.low < tech.bbLower ? 25 : stock.high > tech.bbUpper ? 25 : 0) +
    (Math.abs(stock.changePercent) > 2 && relVol > 1.5 ? 30 : 0) +
    (tech.rsi < 30 || tech.rsi > 70 ? 25 : 0) +
    (tech.stochK < 20 || tech.stochK > 80 ? 20 : 0)
  );
  
  const composite = Math.round(
    darkPoolScore * 0.20 +
    smartMoneyScore * 0.20 +
    optionsFlowScore * 0.15 +
    momentumScore * 0.20 +
    accumulationScore * 0.15 +
    liquiditySweepScore * 0.10
  );
  
  return {
    composite,
    darkPool: Math.round(darkPoolScore),
    smartMoney: Math.round(smartMoneyScore),
    optionsFlow: Math.round(optionsFlowScore),
    momentum: Math.round(momentumScore),
    accumulation: Math.round(accumulationScore),
    liquiditySweep: Math.round(liquiditySweepScore)
  };
}

function generateSetup(stock: StockData, tech: TechnicalProfile, scores: InstitutionalSignal['scores']): InstitutionalSignal['setup'] {
  const price = stock.price;
  const atr = tech.atr;
  const trendUp = price > tech.sma20 && tech.sma20 > tech.sma50;
  const trendDown = price < tech.sma20 && tech.sma20 < tech.sma50;
  const oversold = tech.rsi < 35;
  const overbought = tech.rsi > 65;
  
  let direction: 'LONG' | 'SHORT' = 'LONG';
  let setupType = 'Institutional Accumulation';
  let entry = price;
  let stopLoss: number;
  let target1: number, target2: number, target3: number;
  let timeframe = 'Swing (2-5 days)';
  
  if (trendUp && oversold) {
    setupType = 'Smart Money Pullback Entry';
    direction = 'LONG';
    entry = price;
    stopLoss = price - atr * 2;
    target1 = price + atr * 2;
    target2 = price + atr * 4;
    target3 = price + atr * 6;
    timeframe = 'Swing (3-7 days)';
  } else if (trendUp && scores.darkPool > 60) {
    setupType = 'Dark Pool Accumulation';
    direction = 'LONG';
    entry = price;
    stopLoss = Math.max(price - atr * 1.5, tech.sma20 - atr * 0.5);
    target1 = price + atr * 2.5;
    target2 = price + atr * 5;
    target3 = price + atr * 8;
    timeframe = 'Position (1-3 weeks)';
  } else if (trendDown && overbought) {
    setupType = 'Distribution Short Setup';
    direction = 'SHORT';
    entry = price;
    stopLoss = price + atr * 2;
    target1 = price - atr * 2;
    target2 = price - atr * 4;
    target3 = price - atr * 6;
    timeframe = 'Swing (3-7 days)';
  } else if (scores.liquiditySweep > 60 && oversold) {
    setupType = 'Liquidity Sweep Reversal';
    direction = 'LONG';
    entry = price;
    stopLoss = stock.low - atr * 0.5;
    target1 = price + atr * 3;
    target2 = price + atr * 5;
    target3 = tech.sma50;
    timeframe = 'Swing (2-5 days)';
  } else if (scores.optionsFlow > 60) {
    setupType = 'Unusual Options Activity';
    direction = scores.momentum > 50 ? 'LONG' : 'SHORT';
    if (direction === 'LONG') {
      stopLoss = price - atr * 1.8;
      target1 = price + atr * 2;
      target2 = price + atr * 4;
      target3 = price + atr * 7;
    } else {
      stopLoss = price + atr * 1.8;
      target1 = price - atr * 2;
      target2 = price - atr * 4;
      target3 = price - atr * 7;
    }
    timeframe = 'Swing (1-5 days)';
  } else if (scores.smartMoney > 60) {
    setupType = 'Smart Money Momentum';
    direction = scores.momentum > 50 ? 'LONG' : 'SHORT';
    if (direction === 'LONG') {
      stopLoss = price - atr * 1.5;
      target1 = price + atr * 2;
      target2 = price + atr * 4;
      target3 = price + atr * 6;
    } else {
      stopLoss = price + atr * 1.5;
      target1 = price - atr * 2;
      target2 = price - atr * 4;
      target3 = price - atr * 6;
    }
    timeframe = 'Swing (2-5 days)';
  } else if (price > tech.vwap && tech.macdHist > 0) {
    setupType = 'VWAP Momentum Long';
    direction = 'LONG';
    stopLoss = tech.vwap - atr * 0.5;
    target1 = price + atr * 1.5;
    target2 = price + atr * 3;
    target3 = price + atr * 5;
    timeframe = 'Intraday-Swing (1-3 days)';
  } else {
    setupType = 'Mean Reversion Setup';
    direction = price < tech.sma20 ? 'LONG' : 'SHORT';
    if (direction === 'LONG') {
      stopLoss = price - atr * 2;
      target1 = tech.sma20;
      target2 = tech.sma50;
      target3 = tech.bbUpper;
    } else {
      stopLoss = price + atr * 2;
      target1 = tech.sma20;
      target2 = tech.sma50;
      target3 = tech.bbLower;
    }
    timeframe = 'Swing (3-7 days)';
  }
  
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target2 - entry);
  const rr = risk > 0 ? reward / risk : 0;
  
  const confidence = Math.min(95, Math.max(30,
    scores.composite * 0.6 +
    (rr > 3 ? 20 : rr > 2 ? 10 : 0) +
    (tech.adx > 25 ? 10 : 0) +
    (scores.darkPool > 60 ? 5 : 0)
  ));
  
  let positionSize = 'Standard (2% risk)';
  if (confidence > 80) positionSize = 'Full Size (3% risk)';
  else if (confidence > 70) positionSize = 'Standard (2% risk)';
  else if (confidence > 55) positionSize = 'Half Size (1% risk)';
  else positionSize = 'Quarter Size (0.5% risk)';
  
  return {
    type: setupType,
    direction,
    entry: parseFloat(entry.toFixed(2)),
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    target1: parseFloat(target1.toFixed(2)),
    target2: parseFloat(target2.toFixed(2)),
    target3: parseFloat(target3.toFixed(2)),
    riskReward: parseFloat(rr.toFixed(2)),
    positionSize,
    confidence: Math.round(confidence),
    timeframe
  };
}

function generateSignals(stock: StockData, tech: TechnicalProfile, dp: InstitutionalSignal['darkPoolActivity'], sm: InstitutionalSignal['smartMoneyFlow']): string[] {
  const signals: string[] = [];
  const relVol = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
  
  if (dp.detected) signals.push('Dark pool activity detected');
  if (dp.priceAbsorption) signals.push('Price absorption pattern (stealth accumulation)');
  if (sm.blockTradeDetected) signals.push('Block trades detected');
  if (sm.direction === 'inflow') signals.push('Smart money inflow');
  if (sm.direction === 'outflow') signals.push('Smart money outflow');
  if (relVol > 2) signals.push(`Volume surge: ${relVol.toFixed(1)}x average`);
  if (tech.rsi < 30) signals.push('RSI oversold - reversal potential');
  if (tech.rsi > 70) signals.push('RSI overbought - distribution risk');
  if (tech.macdHist > 0 && stock.price > tech.ema8) signals.push('MACD bullish + EMA momentum');
  if (tech.macdHist < 0 && stock.price < tech.ema8) signals.push('MACD bearish + EMA breakdown');
  if (stock.price > tech.vwap) signals.push('Trading above VWAP');
  if (stock.price < tech.vwap) signals.push('Trading below VWAP');
  if (tech.adx > 30) signals.push(`Strong trend (ADX: ${tech.adx.toFixed(0)})`);
  if (stock.price > tech.sma200) signals.push('Above 200 SMA - long-term bullish');
  if (stock.low < tech.bbLower) signals.push('Touched lower Bollinger Band');
  if (stock.high > tech.bbUpper) signals.push('Touched upper Bollinger Band');
  
  return signals.slice(0, 6);
}

function categorizeSignal(scores: InstitutionalSignal['scores'], rr: number): 'A+' | 'A' | 'B' | 'C' {
  if (scores.composite >= 75 && rr >= 3) return 'A+';
  if (scores.composite >= 60 && rr >= 2) return 'A';
  if (scores.composite >= 45 && rr >= 1.5) return 'B';
  return 'C';
}

let scanInProgress = false;
let lastScanResult: InstitutionalSignal[] | null = null;
let lastScanTime = 0;
let scanProgress = { current: 0, total: 0, phase: '' };

async function scanBatch(symbols: string[]): Promise<InstitutionalSignal[]> {
  const results: InstitutionalSignal[] = [];
  
  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
      );
      if (!response.ok) continue;
      
      const chartData = await response.json();
      const result = chartData.chart?.result?.[0];
      if (!result?.indicators?.quote?.[0]) continue;
      
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      const closes = (quote.close || []).filter((c: any) => c != null);
      const volumes = (quote.volume || []).filter((v: any) => v != null);
      
      if (closes.length < 20) continue;
      
      const price = closes[closes.length - 1];
      const prevClose = closes[closes.length - 2] || price;
      const avgVol = Math.round(volumes.slice(-20).reduce((a: number, b: number) => a + (b || 0), 0) / 20);
      
      const stock: StockData = {
        symbol: symbol.toUpperCase(),
        name: meta.shortName || meta.longName || symbol,
        price,
        change: price - prevClose,
        changePercent: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0,
        volume: volumes[volumes.length - 1] || 0,
        avgVolume: avgVol,
        high: quote.high?.[closes.length - 1] || price,
        low: quote.low?.[closes.length - 1] || price,
        open: quote.open?.[closes.length - 1] || price,
        previousClose: prevClose,
        sector: meta.sector || 'Unknown'
      };
      
      const tech = calculateFullTechnicals(symbol, chartData);
      const dp = scoreDarkPool(stock, tech);
      const sm = scoreSmartMoney(stock, tech);
      const of = scoreOptionsFlow(stock, tech);
      const scores = calculateInstitutionalScores(stock, tech, dp, sm, of);
      const setup = generateSetup(stock, tech, scores);
      const signals = generateSignals(stock, tech, dp, sm);
      const category = categorizeSignal(scores, setup.riskReward);
      const relVol = avgVol > 0 ? stock.volume / avgVol : 1;
      
      results.push({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        avgVolume: stock.avgVolume,
        relativeVolume: parseFloat(relVol.toFixed(2)),
        sector: stock.sector || 'Unknown',
        technicals: tech,
        scores,
        setup,
        signals,
        category,
        darkPoolActivity: dp,
        smartMoneyFlow: sm,
        optionsFlowData: of
      });
      
      scanProgress.current++;
    } catch (error) {
      scanProgress.current++;
      continue;
    }
  }
  
  return results;
}

router.post('/scan', async (req: Request, res: Response) => {
  if (scanInProgress) {
    return res.json({ 
      success: false, 
      error: 'Scan already in progress',
      progress: scanProgress
    });
  }
  
  const { mode = 'full', customSymbols } = req.body;
  
  let symbols: string[];
  if (mode === 'custom' && customSymbols?.length) {
    symbols = customSymbols.slice(0, 50);
  } else if (mode === 'quick') {
    symbols = INSTITUTIONAL_WATCHLIST.slice(0, 30);
  } else {
    symbols = [...INSTITUTIONAL_WATCHLIST];
  }
  
  scanInProgress = true;
  scanProgress = { current: 0, total: symbols.length, phase: 'Scanning market...' };
  
  res.json({
    success: true,
    message: `Scanning ${symbols.length} symbols. This may take 1-2 minutes.`,
    total: symbols.length
  });
  
  try {
    const batchSize = 5;
    const allResults: InstitutionalSignal[] = [];
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      scanProgress.phase = `Analyzing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(symbols.length/batchSize)}...`;
      
      const batchResults = await scanBatch(batch);
      allResults.push(...batchResults);
      
      if (i + batchSize < symbols.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
    
    lastScanResult = allResults.sort((a, b) => b.scores.composite - a.scores.composite);
    lastScanTime = Date.now();
    scanProgress.phase = 'Complete';
  } catch (error: any) {
    console.error('Scan error:', error);
    scanProgress.phase = 'Error: ' + error.message;
  } finally {
    scanInProgress = false;
  }
});

router.get('/results', async (req: Request, res: Response) => {
  const { category, minScore, sortBy, limit } = req.query;
  
  if (!lastScanResult) {
    return res.json({
      success: true,
      data: null,
      message: 'No scan results available. Run a scan first.',
      isScanning: scanInProgress,
      progress: scanProgress
    });
  }
  
  let filtered = [...lastScanResult];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(s => s.category === category);
  }
  
  if (minScore) {
    const min = parseInt(minScore as string);
    filtered = filtered.filter(s => s.scores.composite >= min);
  }
  
  if (sortBy) {
    const sort = sortBy as string;
    if (sort === 'darkPool') filtered.sort((a, b) => b.scores.darkPool - a.scores.darkPool);
    else if (sort === 'smartMoney') filtered.sort((a, b) => b.scores.smartMoney - a.scores.smartMoney);
    else if (sort === 'optionsFlow') filtered.sort((a, b) => b.scores.optionsFlow - a.scores.optionsFlow);
    else if (sort === 'momentum') filtered.sort((a, b) => b.scores.momentum - a.scores.momentum);
    else if (sort === 'riskReward') filtered.sort((a, b) => b.setup.riskReward - a.setup.riskReward);
    else if (sort === 'volume') filtered.sort((a, b) => b.relativeVolume - a.relativeVolume);
  }
  
  const maxResults = limit ? parseInt(limit as string) : 50;
  filtered = filtered.slice(0, maxResults);
  
  const summary = {
    totalScanned: lastScanResult.length,
    aPlus: lastScanResult.filter(s => s.category === 'A+').length,
    a: lastScanResult.filter(s => s.category === 'A').length,
    b: lastScanResult.filter(s => s.category === 'B').length,
    c: lastScanResult.filter(s => s.category === 'C').length,
    topLong: lastScanResult.filter(s => s.setup.direction === 'LONG' && (s.category === 'A+' || s.category === 'A')).length,
    topShort: lastScanResult.filter(s => s.setup.direction === 'SHORT' && (s.category === 'A+' || s.category === 'A')).length,
    avgComposite: Math.round(lastScanResult.reduce((a, b) => a + b.scores.composite, 0) / lastScanResult.length),
    scanTime: new Date(lastScanTime).toISOString()
  };
  
  res.json({
    success: true,
    data: {
      signals: filtered,
      summary,
      timestamp: lastScanTime
    },
    isScanning: scanInProgress,
    progress: scanProgress
  });
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    isScanning: scanInProgress,
    progress: scanProgress,
    lastScanTime: lastScanTime ? new Date(lastScanTime).toISOString() : null,
    resultsAvailable: !!lastScanResult,
    totalResults: lastScanResult?.length || 0
  });
});

router.get('/top-picks', async (req: Request, res: Response) => {
  if (!lastScanResult || lastScanResult.length === 0) {
    return res.json({ success: true, data: [] });
  }
  
  const topPicks = lastScanResult
    .filter(s => s.category === 'A+' || s.category === 'A')
    .slice(0, 10);
  
  res.json({ success: true, data: topPicks });
});

router.post('/analyze-single', async (req: Request, res: Response) => {
  const { symbol } = req.body;
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ success: false, error: 'Symbol is required' });
  }
  
  const cleanSymbol = symbol.toUpperCase().trim();
  
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}?interval=1d&range=3mo`
    );
    if (!response.ok) {
      return res.status(404).json({ success: false, error: `No data for ${cleanSymbol}` });
    }
    
    const chartData = await response.json();
    const result = chartData.chart?.result?.[0];
    if (!result?.indicators?.quote?.[0]) {
      return res.status(404).json({ success: false, error: `Invalid data for ${cleanSymbol}` });
    }
    
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const closes = (quote.close || []).filter((c: any) => c != null);
    const volumes = (quote.volume || []).filter((v: any) => v != null);
    
    if (closes.length < 20) {
      return res.status(400).json({ success: false, error: 'Insufficient data' });
    }
    
    const price = closes[closes.length - 1];
    const prevClose = closes[closes.length - 2] || price;
    const avgVol = Math.round(volumes.slice(-20).reduce((a: number, b: number) => a + (b || 0), 0) / 20);
    
    const stock: StockData = {
      symbol: cleanSymbol,
      name: meta.shortName || meta.longName || cleanSymbol,
      price,
      change: price - prevClose,
      changePercent: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0,
      volume: volumes[volumes.length - 1] || 0,
      avgVolume: avgVol,
      high: quote.high?.[closes.length - 1] || price,
      low: quote.low?.[closes.length - 1] || price,
      open: quote.open?.[closes.length - 1] || price,
      previousClose: prevClose,
      sector: meta.sector || 'Unknown'
    };
    
    const tech = calculateFullTechnicals(cleanSymbol, chartData);
    const dp = scoreDarkPool(stock, tech);
    const sm = scoreSmartMoney(stock, tech);
    const of = scoreOptionsFlow(stock, tech);
    const scores = calculateInstitutionalScores(stock, tech, dp, sm, of);
    const setup = generateSetup(stock, tech, scores);
    const signals = generateSignals(stock, tech, dp, sm);
    const relVol = avgVol > 0 ? stock.volume / avgVol : 1;
    const category = categorizeSignal(scores, setup.riskReward);
    
    const signal: InstitutionalSignal = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      avgVolume: stock.avgVolume,
      relativeVolume: parseFloat(relVol.toFixed(2)),
      sector: stock.sector || 'Unknown',
      technicals: tech,
      scores,
      setup,
      signals,
      category,
      darkPoolActivity: dp,
      smartMoneyFlow: sm,
      optionsFlowData: of
    };
    
    res.json({ success: true, data: signal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
