import { db } from './db';
import { optionsScannerJobs, optionsOpportunities } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

interface StockQuote {
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
  high52Week?: number;
  low52Week?: number;
  sector?: string;
}

interface TechnicalData {
  rsi: number;
  atr: number;
  sma20: number;
  sma50: number;
  ema9: number;
  bbUpper: number;
  bbLower: number;
  historicalVolatility: number;
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

interface OptionsOpportunity {
  symbol: string;
  companyName: string;
  optionType: 'call' | 'put';
  currentPrice: number;
  strikePrice: number;
  estimatedPremium: number;
  impliedVolatility: number;
  daysToExpiry: number;
  expirationDate: string;
  annualizedReturn: number;
  maxProfit: number;
  maxLoss: number;
  breakeven: number;
  probabilityOfProfit: number;
  rsi: number;
  trend: string;
  support: number;
  resistance: number;
  volumeRatio: number;
  compositeScore: number;
  incomeScore: number;
  safetyScore: number;
  technicalScore: number;
  reasoning: string;
  sector: string;
}

const OPTIONS_UNIVERSE = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'UNH',
  'JNJ', 'XOM', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV', 'LLY', 'PEP',
  'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'WMT', 'ACN', 'CSCO', 'ABT', 'DHR',
  'VZ', 'ADBE', 'CRM', 'NEE', 'CMCSA', 'TXN', 'PM', 'NKE', 'INTC', 'BMY',
  'RTX', 'QCOM', 'UPS', 'T', 'HON', 'ORCL', 'LOW', 'MS', 'CAT', 'GS',
  'DE', 'AMD', 'IBM', 'SPGI', 'INTU', 'ISRG', 'BA', 'GE', 'AMAT', 'MDT',
  'LMT', 'PLD', 'BKNG', 'SYK', 'ADP', 'MDLZ', 'AXP', 'GILD', 'CVS', 'SCHW',
  'BLK', 'TJX', 'ADI', 'ETN', 'REGN', 'CI', 'MO', 'CB', 'SBUX', 'PYPL',
  'DUK', 'SO', 'CL', 'ZTS', 'EOG', 'NOC', 'ITW', 'PNC', 'USB', 'NFLX',
  'D', 'HUM', 'WM', 'FISV', 'NSC', 'APD', 'CCI', 'SHW', 'EMR', 'ORLY',
  'FCX', 'FDX', 'MU', 'PSA', 'SLB', 'KMB', 'GD', 'CME', 'GM', 'AEP',
  'TGT', 'F', 'KLAC', 'SRE', 'OXY', 'PSX', 'PH', 'AZO', 'HCA', 'MPC',
  'LRCX', 'NEM', 'MCHP', 'CTSH', 'EXC', 'SNPS', 'CDNS', 'MAR', 'ROP', 'KMI',
  'MCO', 'MSCI', 'CTAS', 'FTNT', 'VLO', 'COF', 'HSY', 'JCI', 'TRV', 'TEL',
  'IQV', 'EL', 'AFL', 'CMG', 'AIG', 'STZ', 'CARR', 'APH', 'WELL', 'DVN'
];

class IncomeMachineScanner {
  private priceCache: Map<string, StockQuote> = new Map();
  private technicalCache: Map<string, TechnicalData> = new Map();
  private isScanning = false;
  private lastScanTime = 0;

  async fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
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
      const prevIdx = Math.max(0, lastIdx - 1);
      
      const closes = quote.close.filter((c: number | null) => c !== null);
      const highs = quote.high.filter((h: number | null) => h !== null);
      const lows = quote.low.filter((l: number | null) => l !== null);
      
      return {
        symbol: symbol.toUpperCase(),
        name: meta.shortName || meta.longName || symbol,
        price: quote.close[lastIdx] || meta.regularMarketPrice,
        change: (quote.close[lastIdx] || 0) - (quote.close[prevIdx] || 0),
        changePercent: ((quote.close[lastIdx] - quote.close[prevIdx]) / quote.close[prevIdx]) * 100,
        volume: quote.volume[lastIdx] || 0,
        avgVolume: Math.round(quote.volume.slice(-20).reduce((a: number, b: number) => a + (b || 0), 0) / 20),
        high: quote.high[lastIdx] || 0,
        low: quote.low[lastIdx] || 0,
        open: quote.open[lastIdx] || 0,
        previousClose: quote.close[prevIdx] || 0,
        high52Week: Math.max(...highs),
        low52Week: Math.min(...lows.filter((l: number) => l > 0)),
        sector: meta.sector || 'Unknown'
      };
    } catch (error) {
      return null;
    }
  }

  async fetchTechnicalData(symbol: string): Promise<TechnicalData | null> {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      const quote = result?.indicators?.quote?.[0];
      
      if (!quote) return null;
      
      const closes = quote.close.filter((c: number | null) => c !== null);
      const highs = quote.high.filter((h: number | null) => h !== null);
      const lows = quote.low.filter((l: number | null) => l !== null);
      
      if (closes.length < 20) return null;
      
      return this.calculateTechnicals(closes, highs, lows);
    } catch (error) {
      return null;
    }
  }

  calculateTechnicals(prices: number[], highs: number[], lows: number[]): TechnicalData {
    const closes = prices.filter(p => p !== null && p !== undefined);
    
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma50 = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : sma20;
    
    let ema9 = closes[0];
    const mult = 2 / 10;
    for (let i = 1; i < closes.length; i++) {
      ema9 = (closes[i] - ema9) * mult + ema9;
    }

    let gains = 0, losses = 0;
    for (let i = 1; i <= Math.min(14, closes.length - 1); i++) {
      const change = closes[closes.length - i] - closes[closes.length - i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = 100 - (100 / (1 + rs));

    const stdDev = Math.sqrt(closes.slice(-20).reduce((sum, p) => sum + Math.pow(p - sma20, 2), 0) / 20);
    const bbUpper = sma20 + (2 * stdDev);
    const bbLower = sma20 - (2 * stdDev);

    let atrSum = 0;
    for (let i = 1; i <= Math.min(14, closes.length - 1); i++) {
      const h = highs[highs.length - i] || closes[closes.length - i];
      const l = lows[lows.length - i] || closes[closes.length - i];
      const pc = closes[closes.length - i - 1];
      atrSum += Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
    }
    const atr = atrSum / 14;

    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const historicalVolatility = Math.sqrt(variance * 252) * 100;

    const lookback = Math.min(20, closes.length);
    const recentLows = lows.slice(-lookback);
    const recentHighs = highs.slice(-lookback);
    const support = Math.min(...recentLows.filter(l => l > 0));
    const resistance = Math.max(...recentHighs);

    const currentPrice = closes[closes.length - 1];
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (currentPrice > sma20 && sma20 > sma50 && rsi > 50) {
      trend = 'bullish';
    } else if (currentPrice < sma20 && sma20 < sma50 && rsi < 50) {
      trend = 'bearish';
    }

    return { rsi, atr, sma20, sma50, ema9, bbUpper, bbLower, historicalVolatility, support, resistance, trend };
  }

  estimateImpliedVolatility(historicalVol: number, trend: string, rsi: number): number {
    let ivMultiplier = 1.0;
    if (trend === 'bullish' && rsi > 60) ivMultiplier = 0.9;
    else if (trend === 'bearish' && rsi < 40) ivMultiplier = 1.2;
    else if (rsi > 70 || rsi < 30) ivMultiplier = 1.15;
    
    return Math.max(15, Math.min(80, historicalVol * ivMultiplier));
  }

  calculateOptionMetrics(
    quote: StockQuote, 
    tech: TechnicalData, 
    optionType: 'call' | 'put',
    daysToExpiry: number = 30
  ): Omit<OptionsOpportunity, 'sector'> | null {
    const currentPrice = quote.price;
    const iv = this.estimateImpliedVolatility(tech.historicalVolatility, tech.trend, tech.rsi);
    
    let strikePrice: number;
    if (optionType === 'call') {
      strikePrice = Math.ceil(currentPrice * 1.02 / 5) * 5;
    } else {
      strikePrice = Math.floor(currentPrice * 0.98 / 5) * 5;
    }
    
    const timeToExpiry = daysToExpiry / 365;
    const ivDecimal = iv / 100;
    
    const intrinsicValue = optionType === 'call' 
      ? Math.max(0, currentPrice - strikePrice)
      : Math.max(0, strikePrice - currentPrice);
    
    const timeValue = currentPrice * ivDecimal * Math.sqrt(timeToExpiry) * 0.4;
    const estimatedPremium = intrinsicValue + timeValue;
    
    const maxProfit = estimatedPremium * 100;
    const maxLoss = optionType === 'call' 
      ? (currentPrice - estimatedPremium) * 100
      : (strikePrice - estimatedPremium) * 100;
    
    const breakeven = optionType === 'call'
      ? strikePrice + estimatedPremium
      : strikePrice - estimatedPremium;
    
    const annualizedReturn = (estimatedPremium / currentPrice) * (365 / daysToExpiry) * 100;
    
    let probabilityOfProfit = 50;
    const moneyness = optionType === 'call' 
      ? (strikePrice - currentPrice) / currentPrice
      : (currentPrice - strikePrice) / currentPrice;
    
    if (moneyness > 0) {
      probabilityOfProfit = 50 + (moneyness / (ivDecimal * Math.sqrt(timeToExpiry))) * 10;
    } else {
      probabilityOfProfit = 50 - (Math.abs(moneyness) / (ivDecimal * Math.sqrt(timeToExpiry))) * 10;
    }
    probabilityOfProfit = Math.max(20, Math.min(90, probabilityOfProfit));

    let incomeScore = 0;
    if (annualizedReturn >= 50) incomeScore = 100;
    else if (annualizedReturn >= 30) incomeScore = 80;
    else if (annualizedReturn >= 20) incomeScore = 60;
    else if (annualizedReturn >= 10) incomeScore = 40;
    else incomeScore = 20;

    let safetyScore = 0;
    if (probabilityOfProfit >= 75) safetyScore = 100;
    else if (probabilityOfProfit >= 60) safetyScore = 80;
    else if (probabilityOfProfit >= 50) safetyScore = 60;
    else safetyScore = 40;

    let technicalScore = 0;
    const trendMatch = (optionType === 'call' && tech.trend === 'bullish') || 
                       (optionType === 'put' && tech.trend === 'bearish');
    if (trendMatch) technicalScore += 40;
    if (tech.rsi >= 40 && tech.rsi <= 60) technicalScore += 30;
    if (quote.volume > quote.avgVolume) technicalScore += 20;
    if (tech.atr / currentPrice < 0.03) technicalScore += 10;

    const compositeScore = (incomeScore * 0.4) + (safetyScore * 0.35) + (technicalScore * 0.25);

    let reasoning = '';
    if (optionType === 'call') {
      reasoning = `Covered call on ${quote.symbol} at $${strikePrice} strike. `;
      if (tech.trend === 'bullish') reasoning += `Bullish trend supports call writing with upside protection. `;
      reasoning += `Estimated ${annualizedReturn.toFixed(1)}% annualized return with ${probabilityOfProfit.toFixed(0)}% profit probability. `;
    } else {
      reasoning = `Cash-secured put on ${quote.symbol} at $${strikePrice} strike. `;
      if (tech.trend === 'bearish') reasoning += `Bearish trend may provide entry opportunity. `;
      reasoning += `Premium income ${annualizedReturn.toFixed(1)}% annualized. Support at $${tech.support.toFixed(2)}. `;
    }
    
    if (iv > 40) reasoning += `High IV (${iv.toFixed(1)}%) enhances premium. `;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpiry);
    const expDateStr = expirationDate.toISOString().split('T')[0];

    return {
      symbol: quote.symbol,
      companyName: quote.name,
      optionType,
      currentPrice,
      strikePrice,
      estimatedPremium: Math.round(estimatedPremium * 100) / 100,
      impliedVolatility: Math.round(iv * 100) / 100,
      daysToExpiry,
      expirationDate: expDateStr,
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
      maxProfit: Math.round(maxProfit * 100) / 100,
      maxLoss: Math.round(Math.abs(maxLoss) * 100) / 100,
      breakeven: Math.round(breakeven * 100) / 100,
      probabilityOfProfit: Math.round(probabilityOfProfit * 100) / 100,
      rsi: Math.round(tech.rsi * 100) / 100,
      trend: tech.trend,
      support: Math.round(tech.support * 100) / 100,
      resistance: Math.round(tech.resistance * 100) / 100,
      volumeRatio: Math.round((quote.volume / quote.avgVolume) * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      incomeScore: Math.round(incomeScore * 100) / 100,
      safetyScore: Math.round(safetyScore * 100) / 100,
      technicalScore: Math.round(technicalScore * 100) / 100,
      reasoning
    };
  }

  async scanSymbol(symbol: string, scanType: 'calls' | 'puts' | 'both'): Promise<OptionsOpportunity[]> {
    const quote = await this.fetchYahooQuote(symbol);
    if (!quote || quote.price < 10) return [];

    const tech = await this.fetchTechnicalData(symbol);
    if (!tech) return [];

    const opportunities: OptionsOpportunity[] = [];
    const expiryDays = [30, 45, 60];

    for (const days of expiryDays) {
      if (scanType === 'calls' || scanType === 'both') {
        if (tech.trend !== 'bearish' || tech.rsi > 30) {
          const callOpp = this.calculateOptionMetrics(quote, tech, 'call', days);
          if (callOpp && callOpp.compositeScore >= 50) {
            opportunities.push({ ...callOpp, sector: quote.sector || 'Unknown' });
          }
        }
      }

      if (scanType === 'puts' || scanType === 'both') {
        if (tech.trend !== 'bullish' || tech.rsi < 70) {
          const putOpp = this.calculateOptionMetrics(quote, tech, 'put', days);
          if (putOpp && putOpp.compositeScore >= 50) {
            opportunities.push({ ...putOpp, sector: quote.sector || 'Unknown' });
          }
        }
      }
    }

    return opportunities;
  }

  async runFullScan(scanType: 'calls' | 'puts' | 'both' = 'both'): Promise<{
    job: any;
    opportunities: OptionsOpportunity[];
    topPicks: { call: OptionsOpportunity | null; put: OptionsOpportunity | null };
  }> {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    this.isScanning = true;
    const startTime = Date.now();

    const [job] = await db.insert(optionsScannerJobs).values({
      scanType,
      status: 'running',
      totalStocksScanned: 0,
      opportunitiesFound: 0
    }).returning();

    const allOpportunities: OptionsOpportunity[] = [];
    let processed = 0;

    const batchSize = 8;
    for (let i = 0; i < OPTIONS_UNIVERSE.length; i += batchSize) {
      const batch = OPTIONS_UNIVERSE.slice(i, i + batchSize);
      
      const results = await Promise.all(
        batch.map(async (symbol) => {
          try {
            const opps = await this.scanSymbol(symbol, scanType);
            processed++;
            return opps;
          } catch (e) {
            return [];
          }
        })
      );
      
      results.forEach(opps => {
        allOpportunities.push(...opps);
      });

      await new Promise(resolve => setTimeout(resolve, 250));
    }

    allOpportunities.sort((a, b) => b.compositeScore - a.compositeScore);

    const topCall = allOpportunities.find(o => o.optionType === 'call') || null;
    const topPut = allOpportunities.find(o => o.optionType === 'put') || null;

    const top20 = allOpportunities.slice(0, 20);
    for (const opp of top20) {
      const isTopPick = opp === topCall || opp === topPut;
      await db.insert(optionsOpportunities).values({
        jobId: job.id,
        symbol: opp.symbol,
        companyName: opp.companyName,
        optionType: opp.optionType,
        currentPrice: opp.currentPrice.toFixed(2),
        strikePrice: opp.strikePrice.toFixed(2),
        estimatedPremium: opp.estimatedPremium.toFixed(4),
        impliedVolatility: opp.impliedVolatility.toFixed(2),
        daysToExpiry: opp.daysToExpiry,
        expirationDate: opp.expirationDate,
        annualizedReturn: opp.annualizedReturn.toFixed(2),
        maxProfit: opp.maxProfit.toFixed(2),
        maxLoss: opp.maxLoss.toFixed(2),
        breakeven: opp.breakeven.toFixed(2),
        probabilityOfProfit: opp.probabilityOfProfit.toFixed(2),
        rsi: opp.rsi.toFixed(2),
        trend: opp.trend,
        support: opp.support.toFixed(2),
        resistance: opp.resistance.toFixed(2),
        volumeRatio: opp.volumeRatio.toFixed(2),
        compositeScore: opp.compositeScore.toFixed(4),
        incomeScore: opp.incomeScore.toFixed(4),
        safetyScore: opp.safetyScore.toFixed(4),
        technicalScore: opp.technicalScore.toFixed(4),
        reasoning: opp.reasoning,
        isTopPick,
        sector: opp.sector
      });
    }

    const scanDuration = Date.now() - startTime;
    
    await db.update(optionsScannerJobs)
      .set({
        status: 'completed',
        totalStocksScanned: processed,
        opportunitiesFound: allOpportunities.length,
        topPickSymbol: topCall?.symbol || topPut?.symbol,
        scanDuration
      })
      .where(eq(optionsScannerJobs.id, job.id));

    this.isScanning = false;
    this.lastScanTime = Date.now();

    return {
      job: { ...job, status: 'completed', totalStocksScanned: processed, opportunitiesFound: allOpportunities.length, scanDuration },
      opportunities: top20,
      topPicks: { call: topCall, put: topPut }
    };
  }

  async getLatestScan(): Promise<{
    job: any | null;
    opportunities: any[];
    topPicks: { call: any | null; put: any | null };
  }> {
    const [latestJob] = await db.select()
      .from(optionsScannerJobs)
      .where(eq(optionsScannerJobs.status, 'completed'))
      .orderBy(desc(optionsScannerJobs.createdAt))
      .limit(1);

    if (!latestJob) {
      return { job: null, opportunities: [], topPicks: { call: null, put: null } };
    }

    const opportunities = await db.select()
      .from(optionsOpportunities)
      .where(eq(optionsOpportunities.jobId, latestJob.id))
      .orderBy(desc(optionsOpportunities.compositeScore));

    const topCall = opportunities.find(o => o.isTopPick && o.optionType === 'call') || 
                    opportunities.find(o => o.optionType === 'call') || null;
    const topPut = opportunities.find(o => o.isTopPick && o.optionType === 'put') ||
                   opportunities.find(o => o.optionType === 'put') || null;

    return { job: latestJob, opportunities, topPicks: { call: topCall, put: topPut } };
  }

  async analyzeSymbol(symbol: string): Promise<{
    quote: StockQuote | null;
    technicals: TechnicalData | null;
    callOpportunity: OptionsOpportunity | null;
    putOpportunity: OptionsOpportunity | null;
  }> {
    const quote = await this.fetchYahooQuote(symbol);
    if (!quote) {
      return { quote: null, technicals: null, callOpportunity: null, putOpportunity: null };
    }

    const tech = await this.fetchTechnicalData(symbol);
    if (!tech) {
      return { quote, technicals: null, callOpportunity: null, putOpportunity: null };
    }

    const callOpp = this.calculateOptionMetrics(quote, tech, 'call', 30);
    const putOpp = this.calculateOptionMetrics(quote, tech, 'put', 30);

    return {
      quote,
      technicals: tech,
      callOpportunity: callOpp ? { ...callOpp, sector: quote.sector || 'Unknown' } : null,
      putOpportunity: putOpp ? { ...putOpp, sector: quote.sector || 'Unknown' } : null
    };
  }

  getStatus() {
    return {
      isScanning: this.isScanning,
      lastScanTime: this.lastScanTime,
      universeSize: OPTIONS_UNIVERSE.length,
      cacheSize: this.priceCache.size
    };
  }
}

export const incomeMachine = new IncomeMachineScanner();
