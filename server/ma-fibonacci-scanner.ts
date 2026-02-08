import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

interface MAFibSetup {
  symbol: string;
  type: 'BULLISH' | 'BEARISH';
  currentPrice: number;
  ema50: number;
  sma100: number;
  trendDirection: 'UP' | 'DOWN';
  swingHigh: number;
  swingLow: number;
  fib382: number;
  fib50: number;
  fib618: number;
  fib786: number;
  inGoldenZone: boolean;
  maAlignment: boolean;
  confluenceScore: number;
  entryZone: { low: number; high: number };
  stopLoss: number;
  target1: number;
  target2: number;
  priceChangePercent: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  timestamp: string;
}

interface ScanResult {
  bullishSetups: MAFibSetup[];
  bearishSetups: MAFibSetup[];
  timestamp: string;
  totalScanned: number;
}

const SCAN_SYMBOLS = [
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD',
  'COIN', 'MARA', 'RIOT', 'PLTR', 'SOFI', 'NIO', 'RIVN', 'LCID', 'F', 'GM',
  'BA', 'CAT', 'JPM', 'GS', 'MS', 'V', 'MA', 'PYPL', 'SQ', 'SHOP',
  'DIS', 'NFLX', 'ROKU', 'SPOT', 'UBER', 'LYFT', 'ABNB', 'DASH', 'DKNG', 'PENN',
  'XOM', 'CVX', 'OXY', 'SLB', 'HAL', 'GLD', 'SLV', 'USO', 'UNG', 'GOLD',
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'AVAX-USD', 'DOT-USD'
];

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function findSwingPoints(prices: number[], lookback: number = 20): { swingHigh: number; swingLow: number } {
  const recentPrices = prices.slice(-lookback);
  return {
    swingHigh: Math.max(...recentPrices),
    swingLow: Math.min(...recentPrices)
  };
}

function calculateFibonacciLevels(swingLow: number, swingHigh: number, isUptrend: boolean) {
  const range = swingHigh - swingLow;
  
  if (isUptrend) {
    return {
      fib0: swingHigh,
      fib236: swingHigh - range * 0.236,
      fib382: swingHigh - range * 0.382,
      fib50: swingHigh - range * 0.5,
      fib618: swingHigh - range * 0.618,
      fib786: swingHigh - range * 0.786,
      fib100: swingLow,
      fib1272: swingHigh + range * 0.272,
      fib1618: swingHigh + range * 0.618
    };
  } else {
    return {
      fib0: swingLow,
      fib236: swingLow + range * 0.236,
      fib382: swingLow + range * 0.382,
      fib50: swingLow + range * 0.5,
      fib618: swingLow + range * 0.618,
      fib786: swingLow + range * 0.786,
      fib100: swingHigh,
      fib1272: swingLow - range * 0.272,
      fib1618: swingLow - range * 0.618
    };
  }
}

async function analyzeSymbol(symbol: string): Promise<MAFibSetup | null> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 120);

    const [quote, historical] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.chart(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      })
    ]);

    if (!quote || !historical?.quotes || historical.quotes.length < 50) {
      return null;
    }

    const closes = historical.quotes
      .filter((q: any) => q.close !== null && q.close !== undefined)
      .map((q: any) => q.close as number);

    if (closes.length < 50) return null;

    const currentPrice = quote.regularMarketPrice || closes[closes.length - 1];
    const ema50 = calculateEMA(closes, 50);
    const sma100 = closes.length >= 100 ? calculateSMA(closes, 100) : ema50;
    
    const trendDirection: 'UP' | 'DOWN' = currentPrice > ema50 ? 'UP' : 'DOWN';
    const isUptrend = trendDirection === 'UP';
    
    const { swingHigh, swingLow } = findSwingPoints(closes, 20);
    const fibLevels = calculateFibonacciLevels(swingLow, swingHigh, isUptrend);
    
    const inGoldenZone = isUptrend
      ? currentPrice <= fibLevels.fib50 && currentPrice >= fibLevels.fib618
      : currentPrice >= fibLevels.fib50 && currentPrice <= fibLevels.fib618;
    
    const emaInGoldenZone = isUptrend
      ? ema50 <= fibLevels.fib50 && ema50 >= fibLevels.fib618
      : ema50 >= fibLevels.fib50 && ema50 <= fibLevels.fib618;
    
    const maAlignment = emaInGoldenZone;
    
    const isPullback = isUptrend
      ? currentPrice < swingHigh && currentPrice > swingLow
      : currentPrice > swingLow && currentPrice < swingHigh;

    let confluenceScore = 0;
    if (inGoldenZone) confluenceScore += 35;
    if (maAlignment) confluenceScore += 35;
    if (isPullback) confluenceScore += 10;
    if (isUptrend && currentPrice > sma100) confluenceScore += 10;
    if (!isUptrend && currentPrice < sma100) confluenceScore += 10;
    
    const volume = quote.regularMarketVolume || 0;
    const avgVolume = quote.averageDailyVolume10Day || quote.averageDailyVolume3Month || volume;
    const volumeRatio = avgVolume > 0 ? volume / avgVolume : 1;
    if (volumeRatio > 1.2) confluenceScore += 15;

    if (confluenceScore < 40) return null;

    const priceChangePercent = quote.regularMarketChangePercent || 0;

    const setup: MAFibSetup = {
      symbol,
      type: isUptrend ? 'BULLISH' : 'BEARISH',
      currentPrice,
      ema50,
      sma100,
      trendDirection,
      swingHigh,
      swingLow,
      fib382: fibLevels.fib382,
      fib50: fibLevels.fib50,
      fib618: fibLevels.fib618,
      fib786: fibLevels.fib786,
      inGoldenZone,
      maAlignment,
      confluenceScore,
      entryZone: isUptrend 
        ? { low: fibLevels.fib618, high: fibLevels.fib50 }
        : { low: fibLevels.fib50, high: fibLevels.fib618 },
      stopLoss: isUptrend ? fibLevels.fib786 : fibLevels.fib786,
      target1: isUptrend ? swingHigh : swingLow,
      target2: isUptrend ? fibLevels.fib1272 : fibLevels.fib1272,
      priceChangePercent,
      volume,
      avgVolume,
      volumeRatio,
      timestamp: new Date().toISOString()
    };

    return setup;
  } catch (error) {
    console.error(`Error analyzing ${symbol}:`, error);
    return null;
  }
}

export async function scanMAFibonacci(symbols?: string[]): Promise<ScanResult> {
  const symbolsToScan = symbols || SCAN_SYMBOLS;
  const results: (MAFibSetup | null)[] = [];
  
  const batchSize = 5;
  for (let i = 0; i < symbolsToScan.length; i += batchSize) {
    const batch = symbolsToScan.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(s => analyzeSymbol(s)));
    results.push(...batchResults);
    
    if (i + batchSize < symbolsToScan.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  const validSetups = results.filter((r): r is MAFibSetup => r !== null);
  
  const bullishSetups = validSetups
    .filter(s => s.type === 'BULLISH')
    .sort((a, b) => b.confluenceScore - a.confluenceScore);
  
  const bearishSetups = validSetups
    .filter(s => s.type === 'BEARISH')
    .sort((a, b) => b.confluenceScore - a.confluenceScore);

  return {
    bullishSetups,
    bearishSetups,
    timestamp: new Date().toISOString(),
    totalScanned: symbolsToScan.length
  };
}

export async function analyzeSymbolMAFib(symbol: string): Promise<MAFibSetup | null> {
  return analyzeSymbol(symbol);
}
