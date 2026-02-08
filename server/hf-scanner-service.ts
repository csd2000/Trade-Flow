import { db } from './db';
import { scannerJobs, scannerCandidates, scannerAlerts } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { predictiveSignalEngine, Candle } from './predictive-signal-engine';

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
  swingHigh: number;
  swingLow: number;
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

interface ScanResult {
  symbol: string;
  name: string;
  currentPrice: number;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  compositeScore: number;
  trendScore: number;
  momentumScore: number;
  volumeScore: number;
  volatilityScore: number;
  rsi: number;
  atr: number;
  volume: number;
  avgVolume: number;
  pattern: string;
  sector: string;
  reasoning: string;
  liquiditySweep?: LiquiditySweepData;
}

const STOCK_UNIVERSE = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
  'XOM', 'V', 'JPM', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV', 'LLY',
  'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'WMT', 'ACN', 'CSCO', 'ABT',
  'DHR', 'VZ', 'ADBE', 'CRM', 'NEE', 'CMCSA', 'TXN', 'PM', 'NKE', 'INTC',
  'BMY', 'RTX', 'QCOM', 'UPS', 'T', 'HON', 'ORCL', 'LOW', 'MS', 'CAT',
  'GS', 'DE', 'AMD', 'IBM', 'SPGI', 'INTU', 'ISRG', 'BA', 'GE', 'AMAT',
  'MDT', 'LMT', 'PLD', 'BKNG', 'SYK', 'ADP', 'MDLZ', 'AXP', 'GILD', 'CVS',
  'SCHW', 'BLK', 'TJX', 'ADI', 'ETN', 'REGN', 'CI', 'MO', 'CB', 'SBUX',
  'PYPL', 'DUK', 'SO', 'CL', 'MMC', 'ZTS', 'AON', 'EOG', 'NOC', 'ITW',
  'PNC', 'USB', 'NFLX', 'D', 'HUM', 'WM', 'FISV', 'NSC', 'APD', 'CCI',
  'SHW', 'EMR', 'ORLY', 'FCX', 'FDX', 'MU', 'PSA', 'SLB', 'KMB', 'GD',
  'CME', 'GM', 'AEP', 'TGT', 'F', 'KLAC', 'SRE', 'OXY', 'PSX', 'PH',
  'MRNA', 'AZO', 'HCA', 'MPC', 'LRCX', 'WBA', 'NEM', 'MCHP', 'CTSH', 'EXC',
  'SNPS', 'CDNS', 'MAR', 'ROP', 'DXCM', 'KMI', 'MCO', 'MSCI', 'CTAS', 'FTNT',
  'VLO', 'COF', 'HSY', 'JCI', 'TRV', 'TEL', 'PXD', 'IQV', 'EL', 'AFL',
  'A', 'CMG', 'AIG', 'STZ', 'CARR', 'APH', 'WELL', 'DVN', 'HAL', 'WMB',
  'GIS', 'PAYX', 'IDXX', 'HES', 'RSG', 'PRU', 'DG', 'KDP', 'PPG', 'FAST',
  'YUM', 'O', 'MTD', 'RMD', 'BKR', 'OKE', 'KEYS', 'DHI', 'LEN', 'DOW',
  'ALL', 'KHC', 'CTVA', 'DD', 'BAX', 'CPRT', 'OTIS', 'AMP', 'ALB', 'EQR',
  'BIIB', 'SYY', 'VRTX', 'APTV', 'MLM', 'AME', 'ZBRA', 'CDW', 'CBRE', 'MTB',
  'LYB', 'GLW', 'GPN', 'EBAY', 'TSCO', 'IP', 'STT', 'URI', 'AJG', 'CE',
  'EIX', 'ES', 'FTV', 'ETR', 'EXPD', 'HBAN', 'WDC', 'FE', 'BF.B', 'LUV',
  'EW', 'RF', 'AKAM', 'TROW', 'MKC', 'NTRS', 'IFF', 'XYL', 'VICI', 'IT',
  'MOH', 'DTE', 'CAH', 'CHD', 'PFG', 'NTAP', 'FITB', 'NUE', 'ROL', 'STE',
  'BBY', 'WRK', 'HRL', 'PEAK', 'CF', 'VMC', 'LNT', 'K', 'J', 'TER',
  'SBAC', 'CINF', 'NVR', 'DRI', 'HPQ', 'WAB', 'WAT', 'PPL', 'CAG', 'NI',
  'EMN', 'POOL', 'ALGN', 'MAS', 'JBHT', 'IRM', 'AVB', 'BRO', 'KEY', 'SNA',
  'ULTA', 'TYL', 'QRVO', 'NDAQ', 'HII', 'TXT', 'AES', 'WYNN', 'FMC', 'FFIV',
  'CRL', 'BWA', 'HST', 'ATO', 'PKG', 'CPB', 'REG', 'AIZ', 'L', 'WHR',
  'HAS', 'BIO', 'SEE', 'LEG', 'NRG', 'TPR', 'FLT', 'NWS', 'NWSA', 'RL'
];

class HighFrequencyScanner {
  private priceCache: Map<string, StockQuote> = new Map();
  private technicalCache: Map<string, TechnicalData> = new Map();
  private isScanning = false;
  private lastScanTime = 0;

  async fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`
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
        sector: meta.sector || 'Unknown'
      };
    } catch (error) {
      return null;
    }
  }

  calculateTechnicals(prices: number[], highs: number[], lows: number[]): TechnicalData {
    const closes = prices.filter(p => p !== null && p !== undefined);
    if (closes.length < 20) {
      return { rsi: 50, atr: 0, sma20: closes[closes.length - 1] || 0, sma50: closes[closes.length - 1] || 0, ema9: closes[closes.length - 1] || 0, bbUpper: 0, bbLower: 0, swingHigh: Math.max(...closes), swingLow: Math.min(...closes) };
    }

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

    const lookback = Math.min(10, closes.length);
    const swingHigh = Math.max(...closes.slice(-lookback));
    const swingLow = Math.min(...closes.slice(-lookback));

    return { rsi, atr, sma20, sma50, ema9, bbUpper, bbLower, swingHigh, swingLow };
  }

  calculateRiskReward(quote: StockQuote, tech: TechnicalData): { entry: number; stop: number; target: number; ratio: number; pattern: string } | null {
    const price = quote.price;
    const atr = tech.atr;
    
    if (atr === 0 || price === 0) return null;

    let entry = price;
    let stop: number;
    let target: number;
    let pattern: string;

    const trendUp = price > tech.sma20 && tech.sma20 > tech.sma50;
    const trendDown = price < tech.sma20 && tech.sma20 < tech.sma50;
    const momentum = tech.rsi;
    const nearSupport = price <= tech.swingLow * 1.02;
    const nearResistance = price >= tech.swingHigh * 0.98;
    const oversold = momentum < 35;
    const overbought = momentum > 65;

    if (trendUp && oversold) {
      pattern = 'Uptrend Pullback';
      entry = price;
      stop = price - (atr * 1.5);
      target = price + (atr * 7.5);
    } else if (trendUp && nearSupport) {
      pattern = 'Support Bounce';
      entry = price;
      stop = tech.swingLow - (atr * 0.5);
      target = price + ((price - stop) * 5);
    } else if (trendDown && overbought) {
      pattern = 'Downtrend Rally (Short)';
      entry = price;
      stop = price + (atr * 1.5);
      target = price - (atr * 7.5);
      return { entry, stop, target: Math.abs(target), ratio: (price - target) / (stop - price), pattern };
    } else if (price < tech.bbLower && oversold) {
      pattern = 'Oversold Reversal';
      entry = price;
      stop = price - (atr * 1.2);
      target = tech.sma20;
      if ((target - entry) / (entry - stop) >= 5) {
        return { entry, stop, target, ratio: (target - entry) / (entry - stop), pattern };
      }
      target = entry + ((entry - stop) * 5);
    } else if (price > tech.ema9 && price < tech.sma20) {
      pattern = 'EMA Crossover Setup';
      entry = price;
      stop = price - (atr * 1.3);
      target = price + ((price - stop) * 5);
    } else {
      pattern = 'ATR-Based Setup';
      entry = price;
      stop = price - (atr * 1.5);
      target = price + (atr * 7.5);
    }

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    
    if (risk <= 0) return null;
    
    const ratio = reward / risk;
    
    if (ratio >= 4.5) {
      return { entry, stop, target, ratio, pattern };
    }
    
    return null;
  }

  calculateScores(quote: StockQuote, tech: TechnicalData, rrRatio: number): { composite: number; trend: number; momentum: number; volume: number; volatility: number } {
    const trendScore = quote.price > tech.sma20 && tech.sma20 > tech.sma50 ? 90 :
                       quote.price > tech.sma20 ? 70 :
                       quote.price > tech.sma50 ? 50 : 30;

    const momentumScore = tech.rsi < 30 ? 95 :
                          tech.rsi < 40 ? 80 :
                          tech.rsi < 50 ? 65 :
                          tech.rsi < 60 ? 50 :
                          tech.rsi < 70 ? 35 : 20;

    const volumeRatio = quote.volume / (quote.avgVolume || 1);
    const volumeScore = volumeRatio > 2 ? 95 :
                        volumeRatio > 1.5 ? 80 :
                        volumeRatio > 1 ? 60 :
                        volumeRatio > 0.7 ? 40 : 20;

    const volatilityPct = (tech.atr / quote.price) * 100;
    const volatilityScore = volatilityPct > 3 && volatilityPct < 8 ? 90 :
                            volatilityPct > 2 && volatilityPct < 10 ? 70 :
                            volatilityPct > 1 ? 50 : 30;

    const rrScore = Math.min(100, rrRatio * 15);

    const composite = (trendScore * 0.25) + (momentumScore * 0.25) + (volumeScore * 0.20) + (volatilityScore * 0.15) + (rrScore * 0.15);

    return { composite, trend: trendScore, momentum: momentumScore, volume: volumeScore, volatility: volatilityScore };
  }

  async scanStock(symbol: string): Promise<ScanResult | null> {
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
      
      const stockQuote: StockQuote = {
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
        sector: 'Equity'
      };

      const tech = this.calculateTechnicals(
        quote.close.filter((c: any) => c !== null),
        quote.high.filter((h: any) => h !== null),
        quote.low.filter((l: any) => l !== null)
      );

      const rrSetup = this.calculateRiskReward(stockQuote, tech);
      if (!rrSetup || rrSetup.ratio < 4.5) return null;

      const scores = this.calculateScores(stockQuote, tech, rrSetup.ratio);
      
      if (scores.composite < 55) return null;

      let liquiditySweep: LiquiditySweepData | undefined;
      try {
        const candles: Candle[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          if (quote.close[i] != null && quote.high[i] != null && quote.low[i] != null) {
            candles.push({
              time: timestamps[i] * 1000,
              open: quote.open[i] || quote.close[i],
              high: quote.high[i],
              low: quote.low[i],
              close: quote.close[i],
              volume: quote.volume[i] || 0
            });
          }
        }
        
        if (candles.length >= 20) {
          const snapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
            symbol.toUpperCase(),
            candles
          );
          
          liquiditySweep = {
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
          };
        }
      } catch (e) {
        // Skip predictive if error
      }

      return {
        symbol: stockQuote.symbol,
        name: stockQuote.name,
        currentPrice: stockQuote.price,
        entryPrice: rrSetup.entry,
        stopLoss: rrSetup.stop,
        targetPrice: rrSetup.target,
        riskAmount: Math.abs(rrSetup.entry - rrSetup.stop),
        rewardAmount: Math.abs(rrSetup.target - rrSetup.entry),
        riskRewardRatio: rrSetup.ratio,
        compositeScore: scores.composite,
        trendScore: scores.trend,
        momentumScore: scores.momentum,
        volumeScore: scores.volume,
        volatilityScore: scores.volatility,
        rsi: tech.rsi,
        atr: tech.atr,
        volume: stockQuote.volume,
        avgVolume: stockQuote.avgVolume,
        pattern: rrSetup.pattern,
        sector: stockQuote.sector || 'Unknown',
        reasoning: `${rrSetup.pattern} with ${rrSetup.ratio.toFixed(1)}:1 R/R. RSI at ${tech.rsi.toFixed(0)}, price ${stockQuote.price > tech.sma20 ? 'above' : 'below'} SMA20.`,
        liquiditySweep
      };
    } catch (error) {
      return null;
    }
  }

  async runFullScan(): Promise<{ job: any; candidates: ScanResult[]; topAlert: ScanResult | null }> {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    this.isScanning = true;
    const startTime = Date.now();
    
    const [job] = await db.insert(scannerJobs).values({
      status: 'running',
      totalStocksScanned: 0,
      qualifiedCount: 0
    }).returning();

    const candidates: ScanResult[] = [];
    let processed = 0;
    let errors = 0;

    const batchSize = 10;
    for (let i = 0; i < STOCK_UNIVERSE.length; i += batchSize) {
      const batch = STOCK_UNIVERSE.slice(i, i + batchSize);
      
      const results = await Promise.all(
        batch.map(async (symbol) => {
          try {
            const result = await this.scanStock(symbol);
            processed++;
            return result;
          } catch (e) {
            errors++;
            return null;
          }
        })
      );
      
      results.forEach(r => {
        if (r) candidates.push(r);
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    candidates.sort((a, b) => b.compositeScore - a.compositeScore);

    const top15 = candidates.slice(0, 15);
    const topAlert = top15[0] || null;

    for (const candidate of top15) {
      await db.insert(scannerCandidates).values({
        jobId: job.id,
        symbol: candidate.symbol,
        name: candidate.name,
        currentPrice: candidate.currentPrice.toFixed(2),
        entryPrice: candidate.entryPrice.toFixed(2),
        stopLoss: candidate.stopLoss.toFixed(2),
        targetPrice: candidate.targetPrice.toFixed(2),
        riskAmount: candidate.riskAmount.toFixed(4),
        rewardAmount: candidate.rewardAmount.toFixed(4),
        riskRewardRatio: candidate.riskRewardRatio.toFixed(2),
        compositeScore: candidate.compositeScore.toFixed(4),
        trendScore: candidate.trendScore.toFixed(2),
        momentumScore: candidate.momentumScore.toFixed(2),
        volumeScore: candidate.volumeScore.toFixed(2),
        volatilityScore: candidate.volatilityScore.toFixed(2),
        rsi: candidate.rsi.toFixed(2),
        atr: candidate.atr.toFixed(4),
        volume: candidate.volume,
        avgVolume: candidate.avgVolume,
        pattern: candidate.pattern,
        sector: candidate.sector,
        reasoning: candidate.reasoning,
        isTopAlert: candidate === topAlert
      });
    }

    if (topAlert) {
      await db.insert(scannerAlerts).values({
        jobId: job.id,
        symbol: topAlert.symbol,
        alertType: 'top_pick',
        entryPrice: topAlert.entryPrice.toFixed(2),
        stopLoss: topAlert.stopLoss.toFixed(2),
        targetPrice: topAlert.targetPrice.toFixed(2),
        riskRewardRatio: topAlert.riskRewardRatio.toFixed(2),
        compositeScore: topAlert.compositeScore.toFixed(4),
        alertMessage: `TOP PICK: ${topAlert.symbol} - ${topAlert.pattern}. Entry: $${topAlert.entryPrice.toFixed(2)}, Stop: $${topAlert.stopLoss.toFixed(2)}, Target: $${topAlert.targetPrice.toFixed(2)} (${topAlert.riskRewardRatio.toFixed(1)}:1 R/R)`,
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    const endTime = Date.now();

    await db.update(scannerJobs)
      .set({
        status: 'completed',
        totalStocksScanned: processed,
        qualifiedCount: candidates.length,
        topAlertSymbol: topAlert?.symbol || null,
        scanDurationMs: endTime - startTime,
        batchesProcessed: Math.ceil(STOCK_UNIVERSE.length / batchSize),
        errorCount: errors,
        completedAt: new Date()
      })
      .where(eq(scannerJobs.id, job.id));

    this.isScanning = false;
    this.lastScanTime = endTime;

    return { job, candidates: top15, topAlert };
  }

  async getLatestScan() {
    const [latestJob] = await db.select()
      .from(scannerJobs)
      .where(eq(scannerJobs.status, 'completed'))
      .orderBy(desc(scannerJobs.createdAt))
      .limit(1);

    if (!latestJob) return null;

    const candidates = await db.select()
      .from(scannerCandidates)
      .where(eq(scannerCandidates.jobId, latestJob.id))
      .orderBy(desc(scannerCandidates.compositeScore));

    const [activeAlert] = await db.select()
      .from(scannerAlerts)
      .where(eq(scannerAlerts.jobId, latestJob.id))
      .orderBy(desc(scannerAlerts.createdAt))
      .limit(1);

    return { job: latestJob, candidates, activeAlert };
  }

  async getActiveAlert() {
    const [alert] = await db.select()
      .from(scannerAlerts)
      .where(eq(scannerAlerts.isActive, true))
      .orderBy(desc(scannerAlerts.createdAt))
      .limit(1);
    return alert;
  }

  getStatus() {
    return {
      isScanning: this.isScanning,
      lastScanTime: this.lastScanTime,
      universeSize: STOCK_UNIVERSE.length,
      cacheSize: this.priceCache.size
    };
  }
}

export const hfScanner = new HighFrequencyScanner();
