import { Router, Request, Response } from 'express';
import yahooFinance from 'yahoo-finance2';
import { darkPoolAIService } from './dark-pool-ai-service';
import { newsMonitoringService } from './news-monitoring-service';

const router = Router();

interface GateResult {
  gate: number;
  name: string;
  status: 'pass' | 'fail' | 'pending';
  value?: string | number;
  details: string;
}

async function getStockData(ticker: string): Promise<any> {
  try {
    const quote = await yahooFinance.quote(ticker);
    return quote;
  } catch (err) {
    console.error(`Failed to fetch stock data for ${ticker}:`, err);
    return null;
  }
}

async function getOptionsChain(ticker: string) {
  try {
    const options = await yahooFinance.options(ticker);
    return options;
  } catch (err) {
    console.error(`Failed to fetch options for ${ticker}:`, err);
    return null;
  }
}

function calculatePCR(options: any): number {
  if (!options || !options.options || !options.options[0]) return 0.5;
  
  const chain = options.options[0];
  const putVolume = chain.puts?.reduce((sum: number, p: any) => sum + (p.volume || 0), 0) || 0;
  const callVolume = chain.calls?.reduce((sum: number, c: any) => sum + (c.volume || 0), 0) || 0;
  
  if (callVolume === 0) return 1.0;
  return putVolume / callVolume;
}

function findMaxPain(options: any, currentPrice: number): number {
  if (!options || !options.options || !options.options[0]) return currentPrice;
  
  const chain = options.options[0];
  const strikesSet = new Set<number>();
  
  chain.calls?.forEach((c: any) => strikesSet.add(c.strike));
  chain.puts?.forEach((p: any) => strikesSet.add(p.strike));
  
  const strikes = Array.from(strikesSet);
  
  let maxPain = currentPrice;
  let minPain = Infinity;
  
  for (const strike of strikes) {
    let totalPain = 0;
    
    chain.calls?.forEach((c: any) => {
      if (strike > c.strike) {
        totalPain += (strike - c.strike) * (c.openInterest || 0);
      }
    });
    
    chain.puts?.forEach((p: any) => {
      if (strike < p.strike) {
        totalPain += (p.strike - strike) * (p.openInterest || 0);
      }
    });
    
    if (totalPain < minPain) {
      minPain = totalPain;
      maxPain = strike;
    }
  }
  
  return maxPain;
}

function getAverageIV(options: any): number {
  if (!options || !options.options || !options.options[0]) return 0.3;
  
  const chain = options.options[0];
  const allIVs: number[] = [];
  
  chain.calls?.forEach((c: any) => {
    if (c.impliedVolatility) allIVs.push(c.impliedVolatility);
  });
  chain.puts?.forEach((p: any) => {
    if (p.impliedVolatility) allIVs.push(p.impliedVolatility);
  });
  
  if (allIVs.length === 0) return 0.3;
  return allIVs.reduce((a, b) => a + b, 0) / allIVs.length;
}

function getATMGreeks(options: any, currentPrice: number): { delta: number; gamma: number } {
  if (!options || !options.options || !options.options[0]) {
    return { delta: 0.5, gamma: 0.05 };
  }
  
  const chain = options.options[0];
  let closestCall = null;
  let closestDiff = Infinity;
  
  chain.calls?.forEach((c: any) => {
    const diff = Math.abs(c.strike - currentPrice);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestCall = c;
    }
  });
  
  if (!closestCall) return { delta: 0.5, gamma: 0.05 };
  
  return {
    delta: (closestCall as any).delta || 0.5,
    gamma: (closestCall as any).gamma || 0.05
  };
}

function detectLiquiditySweep(quote: any): { detected: boolean; level: number } {
  if (!quote) return { detected: false, level: 0 };
  
  const dayLow = quote.regularMarketDayLow || 0;
  const prevClose = quote.regularMarketPreviousClose || 0;
  const currentPrice = quote.regularMarketPrice || 0;
  
  const lowWick = (prevClose - dayLow) / prevClose;
  const recovery = (currentPrice - dayLow) / dayLow;
  
  const detected = lowWick > 0.01 && recovery > 0.005;
  
  return {
    detected,
    level: dayLow
  };
}

router.get('/gates', async (req: Request, res: Response) => {
  try {
    const ticker = (req.query.ticker as string || '').toUpperCase();
    
    if (!ticker) {
      return res.status(400).json({ error: 'Ticker is required' });
    }
    
    console.log(`🎯 Running 7-Gate analysis for ${ticker}`);
    
    const [quote, options] = await Promise.all([
      getStockData(ticker),
      getOptionsChain(ticker)
    ]);
    
    if (!quote) {
      return res.status(404).json({ error: `Could not fetch data for ${ticker}` });
    }
    
    const currentPrice = quote.regularMarketPrice || 0;
    const pcr = calculatePCR(options);
    const maxPain = findMaxPain(options, currentPrice);
    const avgIV = getAverageIV(options);
    const sweep = detectLiquiditySweep(quote);
    
    const gates: GateResult[] = [];
    const alerts: { type: 'sweep' | 'sec' | 'whale'; message: string }[] = [];
    
    const gate1Pass = sweep.detected;
    gates.push({
      gate: 1,
      name: 'Liquidity Sweep',
      status: gate1Pass ? 'pass' : 'fail',
      value: gate1Pass ? `$${sweep.level.toFixed(2)}` : 'None',
      details: gate1Pass 
        ? `Sweep detected at $${sweep.level.toFixed(2)} with recovery` 
        : 'No liquidity sweep detected today'
    });
    
    if (gate1Pass) {
      alerts.push({ type: 'sweep', message: `SWEEP DETECTED at $${sweep.level.toFixed(2)}` });
      
      try {
        const sweepDirection = sweep.level < currentPrice ? 'bullish' : 'bearish';
        newsMonitoringService.triggerSweepAlert({
          eventName: `${ticker} Liquidity Sweep`,
          headline: `Liquidity sweep detected at $${sweep.level.toFixed(2)} - validating 7-Gate entry`,
          impact: 'HIGH',
          category: 'BREAKING',
          ticker,
          priceLevel: sweep.level,
          sweepDirection
        });
      } catch (err) {
        console.error('Failed to trigger sweep alert:', err);
      }
    }
    
    gates.push({
      gate: 2,
      name: 'SEC Risk Filter',
      status: 'pending',
      value: 'Manual Check',
      details: 'SEC EDGAR integration pending - verify 10-K/8-K filings manually before entry'
    });
    
    const gate3Pass = pcr > 1.0;
    gates.push({
      gate: 3,
      name: 'Whale Shield (PCR)',
      status: gate3Pass ? 'pass' : 'fail',
      value: pcr.toFixed(2),
      details: gate3Pass 
        ? `High PCR (${pcr.toFixed(2)} > 1.0) - retail panic confirmed, buy zone active` 
        : `PCR (${pcr.toFixed(2)}) below 1.0 threshold - no panic selling`
    });
    
    if (gate3Pass) {
      alerts.push({ type: 'whale', message: `PCR ${pcr.toFixed(2)} > 1.0 - Institutional accumulation zone confirmed` });
    }
    
    const maxPainDiff = Math.abs(currentPrice - maxPain) / currentPrice;
    const gate4Pass = maxPainDiff < 0.05;
    gates.push({
      gate: 4,
      name: 'Max Pain Alignment',
      status: gate4Pass ? 'pass' : 'fail',
      value: `$${maxPain.toFixed(2)}`,
      details: gate4Pass 
        ? `Price within 5% of Max Pain ($${maxPain.toFixed(2)})` 
        : `Price ${(maxPainDiff * 100).toFixed(1)}% from Max Pain ($${maxPain.toFixed(2)})`
    });
    
    const greeks = getATMGreeks(options, currentPrice);
    const gate5Pass = greeks.delta > 0.3 && greeks.delta < 0.7;
    gates.push({
      gate: 5,
      name: 'Delta-Gamma Drift',
      status: gate5Pass ? 'pass' : 'fail',
      value: `Δ${greeks.delta.toFixed(2)} Γ${greeks.gamma.toFixed(3)}`,
      details: gate5Pass 
        ? 'ATM delta in optimal range for stink bid calculation' 
        : 'Delta outside optimal range'
    });
    
    const ivElevated = avgIV > 0.30;
    const gate6Pass = ivElevated && sweep.detected;
    gates.push({
      gate: 6,
      name: 'Volatility Spike (Vega)',
      status: gate6Pass ? 'pass' : ivElevated ? 'pending' : 'fail',
      value: `${(avgIV * 100).toFixed(1)}%`,
      details: gate6Pass 
        ? `IV spike (${(avgIV * 100).toFixed(1)}%) during sweep - bounce value maximized` 
        : ivElevated
        ? `IV elevated (${(avgIV * 100).toFixed(1)}%) - awaiting sweep trigger`
        : `Low IV (${(avgIV * 100).toFixed(1)}%) - limited bounce potential`
    });
    
    let gate7Pass = false;
    let gate7Value = 'Checking...';
    let gate7Details = 'Analyzing dark pool activity...';
    
    try {
      const darkPoolData = await darkPoolAIService.getDarkPoolSummary(ticker);
      const hasBlockTrades = darkPoolData.blockTradeCount > 0;
      const highDarkPoolPercent = darkPoolData.darkPoolPercent > 40;
      gate7Pass = hasBlockTrades || highDarkPoolPercent;
      gate7Value = `${darkPoolData.blockTradeCount} blocks, ${darkPoolData.darkPoolPercent.toFixed(0)}% DP`;
      gate7Details = gate7Pass 
        ? `Dark pool activity detected: ${darkPoolData.blockTradeCount} block trades, ${darkPoolData.darkPoolPercent.toFixed(1)}% dark pool volume`
        : `Low dark pool activity: ${darkPoolData.blockTradeCount} blocks, ${darkPoolData.darkPoolPercent.toFixed(1)}% DP volume`;
    } catch (dpError) {
      gate7Value = 'Data Unavailable';
      gate7Details = 'Dark pool data source temporarily unavailable';
    }
    
    gates.push({
      gate: 7,
      name: 'Dark Pool Tracking',
      status: gate7Pass ? 'pass' : 'pending',
      value: gate7Value,
      details: gate7Details
    });
    
    const totalPassed = gates.filter(g => g.status === 'pass').length;
    
    let overallStatus: 'ENTRY' | 'WAIT' | 'BLOCKED' = 'BLOCKED';
    let recommendation = '';
    
    if (totalPassed === 7) {
      overallStatus = 'ENTRY';
      recommendation = `All 7 gates passed for ${ticker}. High-conviction entry signal confirmed. Use Stink Bid Calculator for exact limit order price.`;
    } else if (totalPassed >= 5) {
      overallStatus = 'WAIT';
      recommendation = `${totalPassed}/7 gates passed. Wait for remaining conditions or use smaller position size.`;
    } else {
      overallStatus = 'BLOCKED';
      recommendation = `Only ${totalPassed}/7 gates passed. Entry not recommended until more gates confirm.`;
    }
    
    return res.json({
      ticker,
      currentPrice,
      gates,
      totalPassed,
      overallStatus,
      recommendation,
      alerts,
      timestamp: Date.now()
    });
    
  } catch (err: any) {
    console.error('Gate analysis failed:', err);
    return res.status(500).json({ error: err.message || 'Gate analysis failed' });
  }
});

router.post('/stink-bid', async (req: Request, res: Response) => {
  try {
    const { ticker, targetPrice, currentPremium, currentPrice, delta, gamma, optionType = 'call' } = req.body;
    
    if (!ticker || targetPrice === undefined || currentPremium === undefined || 
        currentPrice === undefined || delta === undefined || gamma === undefined) {
      return res.status(400).json({ 
        error: 'All fields required: ticker, targetPrice, currentPremium, currentPrice, delta, gamma' 
      });
    }
    
    console.log(`💰 Calculating Stink Bid for ${ticker} ${optionType.toUpperCase()} (manual input)`);
    
    const numCurrentPrice = Number(currentPrice);
    const numTargetPrice = Number(targetPrice);
    const numPremium = Number(currentPremium);
    const numDelta = Math.abs(Number(delta)); // Use absolute delta value
    const numGamma = Number(gamma);
    
    // Calculate price movement
    const priceDiff = Math.abs(numCurrentPrice - numTargetPrice);
    
    let rawLimit: number;
    let formula: string;
    
    if (optionType === 'call') {
      // CALL: When underlying drops, call loses value
      // Stink bid targets a lower price during the dip
      // Formula: Premium - (Drop × Delta) + Gamma curve adjustment
      const deltaImpact = priceDiff * numDelta;
      const gammaAdjustment = 0.5 * numGamma * Math.pow(priceDiff, 2);
      rawLimit = numPremium - deltaImpact + gammaAdjustment;
      formula = 'CALL: Limit = Premium - (Drop × Delta) + (0.5 × Gamma × Drop²), then -8%';
    } else {
      // PUT: When underlying drops, put GAINS value
      // For stink bid on puts, we calculate the discounted entry if price spikes UP first
      // OR if target > current, put loses value (bullish move before reversal)
      if (numTargetPrice > numCurrentPrice) {
        // Target above current = bullish spike, put loses value temporarily
        const deltaImpact = priceDiff * numDelta;
        const gammaAdjustment = 0.5 * numGamma * Math.pow(priceDiff, 2);
        rawLimit = numPremium - deltaImpact + gammaAdjustment;
        formula = 'PUT (spike up): Limit = Premium - (Rise × Delta) + (0.5 × Gamma × Rise²), then -8%';
      } else {
        // Target below current = bearish, put gains value
        // Calculate the inflated put price, then stink bid below that
        const deltaImpact = priceDiff * numDelta;
        const gammaAdjustment = 0.5 * numGamma * Math.pow(priceDiff, 2);
        // Put becomes more valuable, so we add delta impact
        const inflatedPremium = numPremium + deltaImpact + gammaAdjustment;
        // Stink bid below the inflated price
        rawLimit = inflatedPremium;
        formula = 'PUT (drop): Limit = Premium + (Drop × Delta) + (0.5 × Gamma × Drop²), then -8%';
      }
    }
    
    // Ensure rawLimit is positive
    rawLimit = Math.max(0.01, rawLimit);
    
    const panicDiscount = rawLimit * 0.08;
    const finalLimit = Math.max(0.01, rawLimit - panicDiscount);
    const potentialProfit = numPremium > finalLimit ? numPremium - finalLimit : finalLimit - numPremium;
    const riskReward = finalLimit > 0 ? `${(potentialProfit / finalLimit * 100).toFixed(0)}%` : '0%';
    
    return res.json({
      ticker: ticker.toUpperCase(),
      optionType: optionType as 'call' | 'put',
      currentPrice: numCurrentPrice,
      targetPrice: numTargetPrice,
      currentPremium: numPremium,
      delta: numDelta,
      gamma: numGamma,
      priceDiff,
      rawLimit,
      panicDiscount,
      finalLimit,
      potentialProfit,
      riskReward,
      formula,
      timestamp: Date.now()
    });
    
  } catch (err: any) {
    console.error('Stink Bid calculation failed:', err);
    return res.status(500).json({ error: err.message || 'Calculation failed' });
  }
});

export default router;
