import { Candle } from './types';

export interface OrderFlowData {
  cvd: number;
  cvdTrend: 'rising' | 'falling' | 'flat';
  cvdMomentum: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  deltaPercent: number;
  imbalanceRatio: number;
  consecutiveImbalances: number;
  hasMomentumSurge: boolean;
  absorptionDetected: boolean;
  deltaFlip: boolean;
  deltaFlipDirection: 'positive' | 'negative' | 'none';
  pressure: 'buy' | 'sell' | 'neutral' | 'absorption';
  pressureScore: number;
}

export interface PressureMeterState {
  pressure: 'buy' | 'sell' | 'neutral' | 'absorption';
  score: number;
  label: string;
  color: 'green' | 'red' | 'yellow';
  cvd: number;
  delta: number;
  absorptionActive: boolean;
  momentumSurge: boolean;
}

interface VolumeLevel {
  price: number;
  buyVolume: number;
  sellVolume: number;
  ratio: number;
}

class OrderFlowIntelligence {
  private cvdCache: Map<string, { cvd: number; timestamp: number }> = new Map();

  estimateBuySellVolume(candle: Candle): { buyVolume: number; sellVolume: number } {
    const totalVolume = candle.volume;
    const range = candle.high - candle.low;
    
    if (range === 0 || totalVolume === 0) {
      return { buyVolume: totalVolume / 2, sellVolume: totalVolume / 2 };
    }

    const closePosition = (candle.close - candle.low) / range;
    const buyVolume = totalVolume * closePosition;
    const sellVolume = totalVolume * (1 - closePosition);
    
    return { buyVolume, sellVolume };
  }

  calculateCVD(candles: Candle[]): number[] {
    const cvdValues: number[] = [];
    let runningCVD = 0;

    for (const candle of candles) {
      const { buyVolume, sellVolume } = this.estimateBuySellVolume(candle);
      const delta = buyVolume - sellVolume;
      runningCVD += delta;
      cvdValues.push(runningCVD);
    }

    return cvdValues;
  }

  detectCVDTrend(cvdValues: number[], lookback: number = 10): { trend: 'rising' | 'falling' | 'flat'; momentum: number } {
    if (cvdValues.length < lookback) {
      return { trend: 'flat', momentum: 0 };
    }

    const recentCVD = cvdValues.slice(-lookback);
    const startCVD = recentCVD[0];
    const endCVD = recentCVD[recentCVD.length - 1];
    const change = endCVD - startCVD;
    const avgCVD = recentCVD.reduce((a, b) => a + b, 0) / recentCVD.length;
    const normalizedChange = avgCVD !== 0 ? (change / Math.abs(avgCVD)) * 100 : 0;

    if (normalizedChange > 15) {
      return { trend: 'rising', momentum: normalizedChange };
    } else if (normalizedChange < -15) {
      return { trend: 'falling', momentum: normalizedChange };
    }
    return { trend: 'flat', momentum: normalizedChange };
  }

  isPriceFlat(candles: Candle[], lookback: number = 10, threshold: number = 0.5): boolean {
    if (candles.length < lookback) return false;
    
    const recent = candles.slice(-lookback);
    const prices = recent.map(c => c.close);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceChange = Math.abs(prices[prices.length - 1] - prices[0]) / avgPrice * 100;
    
    return priceChange < threshold;
  }

  detectAccumulationDistribution(candles: Candle[]): { signal: 'accumulation' | 'distribution' | 'none'; strength: number } {
    const cvdValues = this.calculateCVD(candles);
    const { trend, momentum } = this.detectCVDTrend(cvdValues);
    const priceFlat = this.isPriceFlat(candles);

    if (priceFlat && trend === 'rising' && momentum > 20) {
      return { signal: 'accumulation', strength: Math.min(momentum / 50, 1) };
    } else if (priceFlat && trend === 'falling' && momentum < -20) {
      return { signal: 'distribution', strength: Math.min(Math.abs(momentum) / 50, 1) };
    }
    return { signal: 'none', strength: 0 };
  }

  calculateVolumeLevels(candles: Candle[], priceBuckets: number = 20): VolumeLevel[] {
    if (candles.length === 0) return [];

    const prices = candles.map(c => c.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const bucketSize = range / priceBuckets || 1;

    const levels: Map<number, { buyVol: number; sellVol: number }> = new Map();

    for (const candle of candles) {
      const bucketIndex = Math.floor((candle.close - minPrice) / bucketSize);
      const price = minPrice + (bucketIndex * bucketSize) + (bucketSize / 2);
      const { buyVolume, sellVolume } = this.estimateBuySellVolume(candle);
      
      if (!levels.has(price)) {
        levels.set(price, { buyVol: 0, sellVol: 0 });
      }
      const level = levels.get(price)!;
      level.buyVol += buyVolume;
      level.sellVol += sellVolume;
    }

    return Array.from(levels.entries()).map(([price, vol]) => ({
      price,
      buyVolume: vol.buyVol,
      sellVolume: vol.sellVol,
      ratio: vol.sellVol > 0 ? vol.buyVol / vol.sellVol : vol.buyVol > 0 ? 10 : 1
    })).sort((a, b) => b.price - a.price);
  }

  detectImbalance(candles: Candle[], threshold: number = 3.0): { hasMomentumSurge: boolean; consecutiveImbalances: number; direction: 'buy' | 'sell' | 'none' } {
    const levels = this.calculateVolumeLevels(candles.slice(-30), 15);
    
    let consecutiveBuyImbalances = 0;
    let consecutiveSellImbalances = 0;
    let maxConsecutiveBuy = 0;
    let maxConsecutiveSell = 0;

    for (const level of levels) {
      if (level.ratio >= threshold) {
        consecutiveBuyImbalances++;
        consecutiveSellImbalances = 0;
        maxConsecutiveBuy = Math.max(maxConsecutiveBuy, consecutiveBuyImbalances);
      } else if (level.ratio <= 1 / threshold) {
        consecutiveSellImbalances++;
        consecutiveBuyImbalances = 0;
        maxConsecutiveSell = Math.max(maxConsecutiveSell, consecutiveSellImbalances);
      } else {
        consecutiveBuyImbalances = 0;
        consecutiveSellImbalances = 0;
      }
    }

    const hasBuySurge = maxConsecutiveBuy >= 3;
    const hasSellSurge = maxConsecutiveSell >= 3;

    return {
      hasMomentumSurge: hasBuySurge || hasSellSurge,
      consecutiveImbalances: Math.max(maxConsecutiveBuy, maxConsecutiveSell),
      direction: hasBuySurge ? 'buy' : hasSellSurge ? 'sell' : 'none'
    };
  }

  detectAbsorption(candles: Candle[], liquiditySweepOccurred: boolean, sweepLevel?: number): boolean {
    if (!liquiditySweepOccurred || candles.length < 5) return false;

    const recent = candles.slice(-5);
    const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
    const recentVolume = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;
    const highVolume = recentVolume > avgVolume * 1.5;

    const prices = recent.map(c => c.close);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const lowVolatility = (priceRange / avgPrice) * 100 < 0.3;

    return highVolume && lowVolatility;
  }

  detectDeltaFlip(candles: Candle[], lookback: number = 5): { occurred: boolean; direction: 'positive' | 'negative' | 'none'; strength: number } {
    if (candles.length < lookback + 2) {
      return { occurred: false, direction: 'none', strength: 0 };
    }

    const deltas: number[] = [];
    for (const candle of candles.slice(-lookback - 2)) {
      const { buyVolume, sellVolume } = this.estimateBuySellVolume(candle);
      deltas.push(buyVolume - sellVolume);
    }

    const previousDelta = deltas.slice(0, -2).reduce((a, b) => a + b, 0);
    const currentDelta = deltas.slice(-2).reduce((a, b) => a + b, 0);

    if (previousDelta < 0 && currentDelta > 0) {
      const strength = Math.min(currentDelta / Math.abs(previousDelta), 2);
      return { occurred: true, direction: 'positive', strength };
    } else if (previousDelta > 0 && currentDelta < 0) {
      const strength = Math.min(Math.abs(currentDelta) / previousDelta, 2);
      return { occurred: true, direction: 'negative', strength };
    }

    return { occurred: false, direction: 'none', strength: 0 };
  }

  calculatePressure(candles: Candle[], liquiditySweepOccurred: boolean = false): PressureMeterState {
    if (candles.length < 10) {
      return {
        pressure: 'neutral',
        score: 50,
        label: 'Insufficient Data',
        color: 'yellow',
        cvd: 0,
        delta: 0,
        absorptionActive: false,
        momentumSurge: false
      };
    }

    const cvdValues = this.calculateCVD(candles);
    const currentCVD = cvdValues[cvdValues.length - 1] || 0;
    const { trend: cvdTrend, momentum } = this.detectCVDTrend(cvdValues);
    
    const recent = candles.slice(-5);
    let totalBuy = 0, totalSell = 0;
    for (const c of recent) {
      const { buyVolume, sellVolume } = this.estimateBuySellVolume(c);
      totalBuy += buyVolume;
      totalSell += sellVolume;
    }
    const delta = totalBuy - totalSell;
    
    const imbalance = this.detectImbalance(candles);
    const absorption = this.detectAbsorption(candles, liquiditySweepOccurred);
    const accDist = this.detectAccumulationDistribution(candles);

    let pressure: 'buy' | 'sell' | 'neutral' | 'absorption' = 'neutral';
    let score = 50;
    let label = 'Neutral';

    if (absorption) {
      pressure = 'absorption';
      score = 50;
      label = 'Institutional Absorption';
    } else if (accDist.signal === 'accumulation') {
      pressure = 'buy';
      score = 70 + (accDist.strength * 30);
      label = 'Accumulation Detected';
    } else if (accDist.signal === 'distribution') {
      pressure = 'sell';
      score = 30 - (accDist.strength * 30);
      label = 'Distribution Detected';
    } else if (imbalance.hasMomentumSurge) {
      if (imbalance.direction === 'buy') {
        pressure = 'buy';
        score = 75 + (imbalance.consecutiveImbalances * 5);
        label = 'Momentum Surge (Buy)';
      } else {
        pressure = 'sell';
        score = 25 - (imbalance.consecutiveImbalances * 5);
        label = 'Momentum Surge (Sell)';
      }
    } else if (cvdTrend === 'rising' && momentum > 10) {
      pressure = 'buy';
      score = 60 + Math.min(momentum / 2, 20);
      label = 'Buy Pressure Rising';
    } else if (cvdTrend === 'falling' && momentum < -10) {
      pressure = 'sell';
      score = 40 - Math.min(Math.abs(momentum) / 2, 20);
      label = 'Sell Pressure Rising';
    }

    score = Math.max(0, Math.min(100, score));

    let color: 'green' | 'red' | 'yellow' = 'yellow';
    if (pressure === 'buy') color = 'green';
    else if (pressure === 'sell') color = 'red';

    return {
      pressure,
      score,
      label,
      color,
      cvd: currentCVD,
      delta,
      absorptionActive: absorption,
      momentumSurge: imbalance.hasMomentumSurge
    };
  }

  analyzeOrderFlow(candles: Candle[], liquiditySweepOccurred: boolean = false): OrderFlowData {
    const cvdValues = this.calculateCVD(candles);
    const currentCVD = cvdValues[cvdValues.length - 1] || 0;
    const { trend: cvdTrend, momentum: cvdMomentum } = this.detectCVDTrend(cvdValues);

    const recent = candles.slice(-5);
    let totalBuy = 0, totalSell = 0;
    for (const c of recent) {
      const { buyVolume, sellVolume } = this.estimateBuySellVolume(c);
      totalBuy += buyVolume;
      totalSell += sellVolume;
    }

    const delta = totalBuy - totalSell;
    const totalVol = totalBuy + totalSell;
    const deltaPercent = totalVol > 0 ? (delta / totalVol) * 100 : 0;
    const imbalanceRatio = totalSell > 0 ? totalBuy / totalSell : totalBuy > 0 ? 10 : 1;

    const imbalance = this.detectImbalance(candles);
    const absorption = this.detectAbsorption(candles, liquiditySweepOccurred);
    const deltaFlip = this.detectDeltaFlip(candles);
    const pressureState = this.calculatePressure(candles, liquiditySweepOccurred);

    return {
      cvd: currentCVD,
      cvdTrend,
      cvdMomentum,
      buyVolume: totalBuy,
      sellVolume: totalSell,
      delta,
      deltaPercent,
      imbalanceRatio,
      consecutiveImbalances: imbalance.consecutiveImbalances,
      hasMomentumSurge: imbalance.hasMomentumSurge,
      absorptionDetected: absorption,
      deltaFlip: deltaFlip.occurred,
      deltaFlipDirection: deltaFlip.direction,
      pressure: pressureState.pressure,
      pressureScore: pressureState.score
    };
  }

  shouldEnterOnFib382(candles: Candle[], direction: 'LONG' | 'SHORT'): { canEnter: boolean; reason: string } {
    const deltaFlip = this.detectDeltaFlip(candles);
    
    if (direction === 'LONG') {
      if (deltaFlip.occurred && deltaFlip.direction === 'positive') {
        return { canEnter: true, reason: 'Positive Delta Flip confirmed - buyers winning' };
      }
      return { canEnter: false, reason: 'Waiting for Positive Delta Flip at 0.382 Fib' };
    } else {
      if (deltaFlip.occurred && deltaFlip.direction === 'negative') {
        return { canEnter: true, reason: 'Negative Delta Flip confirmed - sellers winning' };
      }
      return { canEnter: false, reason: 'Waiting for Negative Delta Flip at 0.382 Fib' };
    }
  }
}

export const orderFlowIntelligence = new OrderFlowIntelligence();
export { OrderFlowIntelligence };
