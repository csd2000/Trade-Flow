import { polygonOptionsService } from './polygon-options-service';
import { detectLiquiditySweeps, buildLiquidityLevels } from './strategy/liquidity';
import { detectSwingPoints } from './strategy/structure';
import { Candle, LiquiditySweep } from './strategy/types';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

interface OptionsContract {
  strike: number;
  contractType: 'call' | 'put';
  openInterest: number;
  volume: number;
  bid: number;
  ask: number;
  lastPrice: number;
  impliedVolatility: number;
}

interface MaxPainResult {
  maxPainStrike: number;
  currentPrice: number;
  distanceToMaxPain: number;
  distancePercent: number;
  magnetZone: boolean;
  direction: 'above' | 'below' | 'at';
  strikeLosses: Array<{ strike: number; totalLoss: number; callLoss: number; putLoss: number }>;
}

interface PCRResult {
  pcr: number;
  totalPutOI: number;
  totalCallOI: number;
  totalPutVolume: number;
  totalCallVolume: number;
  sentiment: 'bullish_overcrowding' | 'bearish_overcrowding' | 'neutral';
  alert: string | null;
  color: 'red' | 'green' | 'yellow';
}

interface SweepVerification {
  sweepDetected: boolean;
  sweepType: 'bullish' | 'bearish' | null;
  sweepPrice: number | null;
  volumeSpike: boolean;
  isFakeout: boolean;
  details: string;
  timestamp: number | null;
}

interface WhaleShieldSnapshot {
  symbol: string;
  timestamp: number;
  maxPain: MaxPainResult;
  pcr: PCRResult;
  sweepVerification: SweepVerification;
  overallAlert: string | null;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

class WhaleShieldService {
  private optionsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000;

  async fetchOptionsChain(symbol: string): Promise<OptionsContract[] | null> {
    const cacheKey = `chain-${symbol}`;
    const cached = this.optionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const chainData = await polygonOptionsService.fetchRealOptionsChain(symbol);
      if (!chainData) return null;

      const contracts: OptionsContract[] = [];

      for (const call of chainData.calls) {
        contracts.push({
          strike: call.strike,
          contractType: 'call',
          openInterest: call.openInterest || 0,
          volume: call.volume || 0,
          bid: call.bid || 0,
          ask: call.ask || 0,
          lastPrice: call.lastPrice || 0,
          impliedVolatility: call.impliedVolatility || 0
        });
      }

      for (const put of chainData.puts) {
        contracts.push({
          strike: put.strike,
          contractType: 'put',
          openInterest: put.openInterest || 0,
          volume: put.volume || 0,
          bid: put.bid || 0,
          ask: put.ask || 0,
          lastPrice: put.lastPrice || 0,
          impliedVolatility: put.impliedVolatility || 0
        });
      }

      this.optionsCache.set(cacheKey, { data: contracts, timestamp: Date.now() });
      return contracts;
    } catch (error) {
      console.error(`Failed to fetch options chain for ${symbol}:`, error);
      return null;
    }
  }

  calculateMaxPain(contracts: OptionsContract[], currentPrice: number): MaxPainResult {
    const strikes = Array.from(new Set(contracts.map(c => c.strike))).sort((a, b) => a - b);
    
    const strikeLosses: Array<{ strike: number; totalLoss: number; callLoss: number; putLoss: number }> = [];
    
    for (const testStrike of strikes) {
      let callLoss = 0;
      let putLoss = 0;
      
      for (const contract of contracts) {
        if (contract.contractType === 'call') {
          if (testStrike > contract.strike) {
            callLoss += (testStrike - contract.strike) * contract.openInterest * 100;
          }
        } else {
          if (testStrike < contract.strike) {
            putLoss += (contract.strike - testStrike) * contract.openInterest * 100;
          }
        }
      }
      
      strikeLosses.push({
        strike: testStrike,
        totalLoss: callLoss + putLoss,
        callLoss,
        putLoss
      });
    }
    
    const minLoss = strikeLosses.reduce((min, curr) => 
      curr.totalLoss < min.totalLoss ? curr : min
    , strikeLosses[0]);
    
    const maxPainStrike = minLoss?.strike || currentPrice;
    const distanceToMaxPain = Math.abs(currentPrice - maxPainStrike);
    const distancePercent = (distanceToMaxPain / currentPrice) * 100;
    const magnetZone = distancePercent <= 1.5;
    
    let direction: 'above' | 'below' | 'at' = 'at';
    if (currentPrice > maxPainStrike * 1.001) direction = 'above';
    else if (currentPrice < maxPainStrike * 0.999) direction = 'below';
    
    return {
      maxPainStrike,
      currentPrice,
      distanceToMaxPain,
      distancePercent,
      magnetZone,
      direction,
      strikeLosses: strikeLosses.slice(0, 20)
    };
  }

  calculatePCR(contracts: OptionsContract[]): PCRResult {
    let totalPutOI = 0;
    let totalCallOI = 0;
    let totalPutVolume = 0;
    let totalCallVolume = 0;
    
    for (const contract of contracts) {
      if (contract.contractType === 'put') {
        totalPutOI += contract.openInterest;
        totalPutVolume += contract.volume;
      } else {
        totalCallOI += contract.openInterest;
        totalCallVolume += contract.volume;
      }
    }
    
    const pcr = totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
    
    let sentiment: 'bullish_overcrowding' | 'bearish_overcrowding' | 'neutral' = 'neutral';
    let alert: string | null = null;
    let color: 'red' | 'green' | 'yellow' = 'yellow';
    
    if (pcr < 0.6) {
      sentiment = 'bullish_overcrowding';
      alert = '🚨 BULLISH OVERCROWDING - REVERSAL RISK';
      color = 'red';
    } else if (pcr > 1.2) {
      sentiment = 'bearish_overcrowding';
      alert = '🚨 BEARISH OVERCROWDING - BOUNCE IMMINENT';
      color = 'green';
    }
    
    return {
      pcr,
      totalPutOI,
      totalCallOI,
      totalPutVolume,
      totalCallVolume,
      sentiment,
      alert,
      color
    };
  }

  verifySweep(candles: Candle[], volumeSMA: number): SweepVerification {
    if (candles.length < 20) {
      return {
        sweepDetected: false,
        sweepType: null,
        sweepPrice: null,
        volumeSpike: false,
        isFakeout: false,
        details: 'Insufficient candle data',
        timestamp: null
      };
    }

    const { highs: swingHighs, lows: swingLows } = detectSwingPoints(candles, 5);
    const levels = buildLiquidityLevels(candles, swingHighs, swingLows);
    const sweeps = detectLiquiditySweeps(candles, levels, 20);
    
    if (sweeps.length === 0) {
      return {
        sweepDetected: false,
        sweepType: null,
        sweepPrice: null,
        volumeSpike: false,
        isFakeout: false,
        details: 'No liquidity sweep detected',
        timestamp: null
      };
    }
    
    const latestSweep = sweeps[sweeps.length - 1];
    const sweepCandle = candles.find(c => c.time === latestSweep.time);
    const avgVolume = volumeSMA || candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
    const volumeSpike = sweepCandle ? sweepCandle.volume > avgVolume * 1.5 : false;
    const wasReclaimed = latestSweep.reclaimPrice > 0;
    const isFakeout = wasReclaimed && !volumeSpike;
    
    return {
      sweepDetected: true,
      sweepType: latestSweep.direction === 'bullish' ? 'bullish' : 'bearish',
      sweepPrice: latestSweep.sweepPrice,
      volumeSpike,
      isFakeout,
      details: isFakeout 
        ? `⚠️ FAKE-OUT DETECTED: Sweep at $${latestSweep.sweepPrice.toFixed(2)} without volume confirmation`
        : `✅ VALID SWEEP: ${latestSweep.direction} sweep at $${latestSweep.sweepPrice.toFixed(2)} with ${volumeSpike ? 'strong' : 'moderate'} volume`,
      timestamp: latestSweep.time
    };
  }

  async getSnapshot(symbol: string, candles?: Candle[]): Promise<WhaleShieldSnapshot | null> {
    try {
      const contracts = await this.fetchOptionsChain(symbol);
      if (!contracts || contracts.length === 0) {
        return null;
      }

      const chainData = await polygonOptionsService.fetchRealOptionsChain(symbol);
      const currentPrice = chainData?.underlyingPrice || 0;
      
      if (currentPrice === 0) return null;

      const maxPain = this.calculateMaxPain(contracts, currentPrice);
      const pcr = this.calculatePCR(contracts);
      
      const avgVolume = candles && candles.length > 0 
        ? candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20 
        : 0;
      const sweepVerification = candles 
        ? this.verifySweep(candles, avgVolume)
        : {
            sweepDetected: false,
            sweepType: null,
            sweepPrice: null,
            volumeSpike: false,
            isFakeout: false,
            details: 'No candle data provided for sweep analysis',
            timestamp: null
          };

      const alerts: string[] = [];
      if (pcr.alert) alerts.push(pcr.alert);
      if (maxPain.magnetZone) alerts.push(`🧲 MAX PAIN MAGNET ZONE: Price within 1.5% of $${maxPain.maxPainStrike.toFixed(2)}`);
      if (sweepVerification.isFakeout) alerts.push(sweepVerification.details);

      let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
      if (alerts.length >= 3) riskLevel = 'extreme';
      else if (alerts.length === 2) riskLevel = 'high';
      else if (alerts.length === 1) riskLevel = 'medium';

      return {
        symbol,
        timestamp: Date.now(),
        maxPain,
        pcr,
        sweepVerification,
        overallAlert: alerts.length > 0 ? alerts.join(' | ') : null,
        riskLevel
      };
    } catch (error) {
      console.error(`Whale Shield snapshot error for ${symbol}:`, error);
      return null;
    }
  }

  async checkMagnetZone(symbol: string): Promise<{ inZone: boolean; message: string } | null> {
    const snapshot = await this.getSnapshot(symbol);
    if (!snapshot) return null;

    if (snapshot.maxPain.magnetZone) {
      const direction = snapshot.maxPain.direction === 'above' 
        ? 'above' 
        : snapshot.maxPain.direction === 'below' 
          ? 'below' 
          : 'at';
      
      return {
        inZone: true,
        message: `${symbol} has entered the Max Pain Magnet Zone! Price $${snapshot.maxPain.currentPrice.toFixed(2)} is ${snapshot.maxPain.distancePercent.toFixed(2)}% ${direction} Max Pain at $${snapshot.maxPain.maxPainStrike.toFixed(2)}. Expect gravitational pull toward Max Pain.`
      };
    }

    return {
      inZone: false,
      message: `${symbol} is ${snapshot.maxPain.distancePercent.toFixed(2)}% away from Max Pain at $${snapshot.maxPain.maxPainStrike.toFixed(2)}`
    };
  }
}

export const whaleShieldService = new WhaleShieldService();
export type { WhaleShieldSnapshot, MaxPainResult, PCRResult, SweepVerification };
