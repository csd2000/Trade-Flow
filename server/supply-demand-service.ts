import { tradingViewService } from './tradingview-realtime-service';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SupplyDemandZone {
  id: string;
  type: 'supply' | 'demand';
  timeframe: string;
  topPrice: number;
  bottomPrice: number;
  startTime: number;
  endTime: number | null;
  strength: number;
  retested: boolean;
  retestCount: number;
  broken: boolean;
  brokenTime: number | null;
  momentumCandles: number;
  isHistoric: boolean;
  combinedFrom?: string[];
}

interface ZoneScanResult {
  symbol: string;
  assetClass: string;
  timeframe: string;
  zones: SupplyDemandZone[];
  currentPrice: number;
  nearestSupply: SupplyDemandZone | null;
  nearestDemand: SupplyDemandZone | null;
  inZone: boolean;
  zoneType: 'supply' | 'demand' | null;
  timestamp: string;
}

interface MultiTimeframeScan {
  symbol: string;
  assetClass: string;
  timeframes: { [tf: string]: SupplyDemandZone[] };
  combinedZones: SupplyDemandZone[];
  currentPrice: number;
  signals: ZoneSignal[];
  timestamp: string;
}

interface ZoneSignal {
  type: 'retest' | 'breakout' | 'approaching';
  zoneType: 'supply' | 'demand';
  zone: SupplyDemandZone;
  distance: number;
  percentDistance: number;
}

class SupplyDemandService {
  private readonly MIN_MOMENTUM_CANDLES = 4;
  private readonly BODY_MULTIPLIER = 1.5;
  private readonly ZONE_EXTENSION_BARS = 2;

  private formatSymbol(symbol: string): string {
    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const forexPairs: Record<string, string> = {
      'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'USDJPY': 'USDJPY=X',
      'AUDUSD': 'AUDUSD=X', 'USDCAD': 'USDCAD=X', 'NZDUSD': 'NZDUSD=X',
      'USDCHF': 'USDCHF=X', 'EURGBP': 'EURGBP=X'
    };
    const cryptoMap: Record<string, string> = {
      'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'SOL': 'SOL-USD', 'BNB': 'BNB-USD',
      'XRP': 'XRP-USD', 'ADA': 'ADA-USD', 'DOGE': 'DOGE-USD', 'AVAX': 'AVAX-USD',
      'DOT': 'DOT-USD', 'MATIC': 'MATIC-USD'
    };
    
    if (forexPairs[cleanSymbol]) return forexPairs[cleanSymbol];
    if (cryptoMap[cleanSymbol]) return cryptoMap[cleanSymbol];
    return cleanSymbol;
  }

  async fetchCandleData(symbol: string, timeframe: string, assetClass: string = 'stocks'): Promise<CandleData[]> {
    // Try TradingView first for real-time data (same as TradingView app)
    try {
      if (tradingViewService.isReady()) {
        console.log(`📡 Fetching TradingView real-time data for ${symbol} (${timeframe})`);
        
        let tvTimeframe = timeframe;
        let count = 200;
        switch (timeframe) {
          case '1m': tvTimeframe = '1'; count = 300; break;
          case '5m': tvTimeframe = '5'; count = 200; break;
          case '15m': tvTimeframe = '15'; count = 200; break;
          case '30m': tvTimeframe = '30'; count = 150; break;
          case '1h': tvTimeframe = '60'; count = 150; break;
          case '4h': tvTimeframe = '240'; count = 100; break;
          case '1d': tvTimeframe = 'D'; count = 100; break;
        }
        
        const tvData = await tradingViewService.getHistoricalData(symbol, assetClass, tvTimeframe, count);
        
        if (tvData.length > 0) {
          const candles: CandleData[] = tvData.map(c => ({
            timestamp: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume
          }));
          console.log(`✅ TradingView: ${candles.length} real-time candles for ${symbol}`);
          return candles;
        }
      }
    } catch (tvError) {
      console.log(`TradingView fetch failed, falling back to Yahoo: ${tvError}`);
    }

    // Fallback to Yahoo Finance
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      
      let interval = '5m';
      let lookback = 432000;
      
      switch (timeframe) {
        case '1m': interval = '1m'; lookback = 86400; break;
        case '5m': interval = '5m'; lookback = 432000; break;
        case '15m': interval = '15m'; lookback = 604800; break;
        case '30m': interval = '30m'; lookback = 604800; break;
        case '1h': interval = '1h'; lookback = 2592000; break;
        case '4h': interval = '1h'; lookback = 2592000 * 4; break;
        case '1d': interval = '1d'; lookback = 31536000; break;
      }
      
      const period1 = now - lookback;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=${interval}`;
      
      console.log(`📊 Fetching Yahoo Finance data for ${formattedSymbol} (${interval})`);
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result?.timestamp) {
        console.error(`No live data available for ${symbol}`);
        return [];
      }
      
      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      
      if (!quotes) return [];
      
      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.open?.[i] && quotes.high?.[i] && quotes.low?.[i] && quotes.close?.[i]) {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume?.[i] || 0
          });
        }
      }
      
      console.log(`✅ Yahoo Finance: ${candles.length} candles for ${symbol}`);
      return candles;
    } catch (error) {
      console.error('Error fetching candle data:', error);
      return [];
    }
  }

  calculateAverageBodySize(candles: CandleData[]): number {
    if (candles.length === 0) return 0;
    const bodies = candles.map(c => Math.abs(c.close - c.open));
    return bodies.reduce((a, b) => a + b, 0) / bodies.length;
  }

  isMomentumCandle(candle: CandleData, avgBodySize: number): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    return bodySize > avgBodySize * this.BODY_MULTIPLIER;
  }

  getMomentumDirection(candle: CandleData): 'bullish' | 'bearish' {
    return candle.close > candle.open ? 'bullish' : 'bearish';
  }

  detectZones(candles: CandleData[], timeframe: string): SupplyDemandZone[] {
    if (candles.length < 10) return [];

    const zones: SupplyDemandZone[] = [];
    const avgBodySize = this.calculateAverageBodySize(candles);
    
    let consecutiveMomentum = 0;
    let momentumDirection: 'bullish' | 'bearish' | null = null;
    let momentumStartIndex = -1;

    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i];
      const isMomentum = this.isMomentumCandle(candle, avgBodySize);
      const direction = this.getMomentumDirection(candle);

      if (isMomentum) {
        if (momentumDirection === null || momentumDirection === direction) {
          if (consecutiveMomentum === 0) {
            momentumStartIndex = i;
          }
          consecutiveMomentum++;
          momentumDirection = direction;
        } else {
          if (consecutiveMomentum >= this.MIN_MOMENTUM_CANDLES) {
            const zone = this.createZone(candles, momentumStartIndex, consecutiveMomentum, momentumDirection, timeframe);
            if (zone) zones.push(zone);
          }
          consecutiveMomentum = 1;
          momentumStartIndex = i;
          momentumDirection = direction;
        }
      } else {
        if (consecutiveMomentum >= this.MIN_MOMENTUM_CANDLES) {
          const zone = this.createZone(candles, momentumStartIndex, consecutiveMomentum, momentumDirection!, timeframe);
          if (zone) zones.push(zone);
        }
        consecutiveMomentum = 0;
        momentumDirection = null;
        momentumStartIndex = -1;
      }
    }

    if (consecutiveMomentum >= this.MIN_MOMENTUM_CANDLES && momentumDirection) {
      const zone = this.createZone(candles, momentumStartIndex, consecutiveMomentum, momentumDirection, timeframe);
      if (zone) zones.push(zone);
    }

    const currentPrice = candles[candles.length - 1]?.close || 0;
    return this.updateZoneStatus(zones, candles, currentPrice);
  }

  private createZone(
    candles: CandleData[], 
    momentumStartIndex: number, 
    momentumCount: number,
    direction: 'bullish' | 'bearish',
    timeframe: string
  ): SupplyDemandZone | null {
    const zoneStartIndex = Math.max(0, momentumStartIndex - this.ZONE_EXTENSION_BARS);
    
    if (zoneStartIndex >= candles.length) return null;

    const zoneCandle1 = candles[zoneStartIndex];
    const zoneCandle2 = candles[Math.min(zoneStartIndex + 1, candles.length - 1)];

    const topPrice = Math.max(zoneCandle1.high, zoneCandle2.high);
    const bottomPrice = Math.min(zoneCandle1.low, zoneCandle2.low);

    const zoneType: 'supply' | 'demand' = direction === 'bearish' ? 'supply' : 'demand';

    const strength = Math.min(100, 50 + momentumCount * 10);

    return {
      id: `${zoneType}-${timeframe}-${zoneCandle1.timestamp}`,
      type: zoneType,
      timeframe,
      topPrice,
      bottomPrice,
      startTime: zoneCandle1.timestamp,
      endTime: null,
      strength,
      retested: false,
      retestCount: 0,
      broken: false,
      brokenTime: null,
      momentumCandles: momentumCount,
      isHistoric: false
    };
  }

  private updateZoneStatus(zones: SupplyDemandZone[], candles: CandleData[], currentPrice: number): SupplyDemandZone[] {
    return zones.map(zone => {
      const zoneStartIdx = candles.findIndex(c => c.timestamp >= zone.startTime);
      if (zoneStartIdx === -1) return zone;

      let retestCount = 0;
      let broken = false;
      let brokenTime: number | null = null;

      for (let i = zoneStartIdx + 5; i < candles.length; i++) {
        const candle = candles[i];
        const inZone = candle.low <= zone.topPrice && candle.high >= zone.bottomPrice;

        if (inZone && !broken) {
          retestCount++;
        }

        if (zone.type === 'supply' && candle.close > zone.topPrice) {
          broken = true;
          brokenTime = candle.timestamp;
        } else if (zone.type === 'demand' && candle.close < zone.bottomPrice) {
          broken = true;
          brokenTime = candle.timestamp;
        }
      }

      const distanceFromCurrent = zone.type === 'supply' 
        ? zone.bottomPrice - currentPrice 
        : currentPrice - zone.topPrice;
      const isHistoric = broken || distanceFromCurrent > currentPrice * 0.1;

      return {
        ...zone,
        retested: retestCount > 0,
        retestCount,
        broken,
        brokenTime,
        isHistoric
      };
    });
  }

  combineOverlappingZones(zones: SupplyDemandZone[]): SupplyDemandZone[] {
    if (zones.length <= 1) return zones;

    const sortedZones = [...zones].sort((a, b) => b.topPrice - a.topPrice);
    const combined: SupplyDemandZone[] = [];
    const used = new Set<string>();

    for (const zone of sortedZones) {
      if (used.has(zone.id)) continue;

      const overlapping = sortedZones.filter(z => 
        !used.has(z.id) && 
        z.type === zone.type &&
        z.id !== zone.id &&
        this.zonesOverlap(zone, z)
      );

      if (overlapping.length > 0) {
        const allZones = [zone, ...overlapping];
        const combinedZone: SupplyDemandZone = {
          id: `combined-${zone.id}`,
          type: zone.type,
          timeframe: 'combined',
          topPrice: Math.max(...allZones.map(z => z.topPrice)),
          bottomPrice: Math.min(...allZones.map(z => z.bottomPrice)),
          startTime: Math.min(...allZones.map(z => z.startTime)),
          endTime: null,
          strength: Math.min(100, Math.max(...allZones.map(z => z.strength)) + allZones.length * 5),
          retested: allZones.some(z => z.retested),
          retestCount: Math.max(...allZones.map(z => z.retestCount)),
          broken: allZones.every(z => z.broken),
          brokenTime: allZones.find(z => z.broken)?.brokenTime || null,
          momentumCandles: Math.max(...allZones.map(z => z.momentumCandles)),
          isHistoric: allZones.every(z => z.isHistoric),
          combinedFrom: allZones.map(z => z.timeframe)
        };
        combined.push(combinedZone);
        allZones.forEach(z => used.add(z.id));
      } else {
        combined.push(zone);
        used.add(zone.id);
      }
    }

    return combined;
  }

  private zonesOverlap(zone1: SupplyDemandZone, zone2: SupplyDemandZone): boolean {
    return !(zone1.bottomPrice > zone2.topPrice || zone2.bottomPrice > zone1.topPrice);
  }

  generateSignals(zones: SupplyDemandZone[], currentPrice: number): ZoneSignal[] {
    const signals: ZoneSignal[] = [];
    const threshold = 0.02;

    for (const zone of zones) {
      const distanceToTop = Math.abs(currentPrice - zone.topPrice);
      const distanceToBottom = Math.abs(currentPrice - zone.bottomPrice);

      const inZone = currentPrice >= zone.bottomPrice && currentPrice <= zone.topPrice;
      const nearZone = distanceToTop < currentPrice * threshold || distanceToBottom < currentPrice * threshold;

      if (zone.broken) {
        if (zone.brokenTime && Date.now() - zone.brokenTime < 3600000) {
          signals.push({
            type: 'breakout',
            zoneType: zone.type,
            zone,
            distance: zone.type === 'supply' 
              ? currentPrice - zone.topPrice 
              : zone.bottomPrice - currentPrice,
            percentDistance: ((zone.type === 'supply' 
              ? currentPrice - zone.topPrice 
              : zone.bottomPrice - currentPrice) / currentPrice) * 100
          });
        }
        continue;
      }

      if (zone.isHistoric) continue;

      if (inZone) {
        signals.push({
          type: 'retest',
          zoneType: zone.type,
          zone,
          distance: 0,
          percentDistance: 0
        });
      } else if (nearZone) {
        const distance = zone.type === 'supply' ? zone.bottomPrice - currentPrice : currentPrice - zone.topPrice;
        signals.push({
          type: 'approaching',
          zoneType: zone.type,
          zone,
          distance: Math.abs(distance),
          percentDistance: (Math.abs(distance) / currentPrice) * 100
        });
      }
    }

    return signals.sort((a, b) => {
      const typeOrder = { breakout: 0, retest: 1, approaching: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.percentDistance - b.percentDistance;
    });
  }

  convertToHeikinAshi(candles: CandleData[]): CandleData[] {
    if (candles.length === 0) return [];
    
    const heikinAshi: CandleData[] = [];
    
    for (let i = 0; i < candles.length; i++) {
      const current = candles[i];
      
      if (i === 0) {
        heikinAshi.push({
          timestamp: current.timestamp,
          open: (current.open + current.close) / 2,
          close: (current.open + current.high + current.low + current.close) / 4,
          high: current.high,
          low: current.low,
          volume: current.volume
        });
      } else {
        const prevHA = heikinAshi[i - 1];
        const haClose = (current.open + current.high + current.low + current.close) / 4;
        const haOpen = (prevHA.open + prevHA.close) / 2;
        
        heikinAshi.push({
          timestamp: current.timestamp,
          open: haOpen,
          close: haClose,
          high: Math.max(current.high, haOpen, haClose),
          low: Math.min(current.low, haOpen, haClose),
          volume: current.volume
        });
      }
    }
    
    return heikinAshi;
  }

  async scanAsset(symbol: string, timeframe: string, assetClass: string = 'stocks'): Promise<ZoneScanResult> {
    const candles = await this.fetchCandleData(symbol, timeframe, assetClass);
    const zones = this.detectZones(candles, timeframe);
    const currentPrice = candles[candles.length - 1]?.close || 0;

    const activeZones = zones.filter(z => !z.broken && !z.isHistoric);
    const supplyZones = activeZones.filter(z => z.type === 'supply').sort((a, b) => a.bottomPrice - b.bottomPrice);
    const demandZones = activeZones.filter(z => z.type === 'demand').sort((a, b) => b.topPrice - a.topPrice);

    const nearestSupply = supplyZones.find(z => z.bottomPrice > currentPrice) || null;
    const nearestDemand = demandZones.find(z => z.topPrice < currentPrice) || null;

    const inZone = activeZones.some(z => currentPrice >= z.bottomPrice && currentPrice <= z.topPrice);
    const currentZone = activeZones.find(z => currentPrice >= z.bottomPrice && currentPrice <= z.topPrice);

    return {
      symbol,
      assetClass,
      timeframe,
      zones,
      currentPrice,
      nearestSupply,
      nearestDemand,
      inZone,
      zoneType: currentZone?.type || null,
      timestamp: new Date().toISOString()
    };
  }

  async scanAssetWithCandles(symbol: string, timeframe: string, assetClass: string = 'stocks', includeCandles: boolean = false) {
    const candles = await this.fetchCandleData(symbol, timeframe, assetClass);
    const zones = this.detectZones(candles, timeframe);
    const currentPrice = candles[candles.length - 1]?.close || 0;

    const activeZones = zones.filter(z => !z.broken && !z.isHistoric);
    const supplyZones = activeZones.filter(z => z.type === 'supply').sort((a, b) => a.bottomPrice - b.bottomPrice);
    const demandZones = activeZones.filter(z => z.type === 'demand').sort((a, b) => b.topPrice - a.topPrice);

    const nearestSupply = supplyZones.find(z => z.bottomPrice > currentPrice) || null;
    const nearestDemand = demandZones.find(z => z.topPrice < currentPrice) || null;

    const inZone = activeZones.some(z => currentPrice >= z.bottomPrice && currentPrice <= z.topPrice);
    const currentZone = activeZones.find(z => currentPrice >= z.bottomPrice && currentPrice <= z.topPrice);

    const heikinAshiCandles = this.convertToHeikinAshi(candles);

    return {
      symbol,
      assetClass,
      timeframe,
      zones,
      currentPrice,
      nearestSupply,
      nearestDemand,
      inZone,
      zoneType: currentZone?.type || null,
      candles: includeCandles ? candles.slice(-100) : undefined,
      heikinAshi: includeCandles ? heikinAshiCandles.slice(-100) : undefined,
      timestamp: new Date().toISOString()
    };
  }

  async scanMultiTimeframe(symbol: string, timeframes: string[], assetClass: string = 'stocks'): Promise<MultiTimeframeScan> {
    const timeframeResults: { [tf: string]: SupplyDemandZone[] } = {};
    let currentPrice = 0;

    for (const tf of timeframes) {
      const result = await this.scanAsset(symbol, tf, assetClass);
      timeframeResults[tf] = result.zones;
      if (result.currentPrice > 0) currentPrice = result.currentPrice;
    }

    const allZones = Object.values(timeframeResults).flat();
    const combinedZones = this.combineOverlappingZones(allZones);
    const signals = this.generateSignals(combinedZones, currentPrice);

    return {
      symbol,
      assetClass,
      timeframes: timeframeResults,
      combinedZones,
      currentPrice,
      signals,
      timestamp: new Date().toISOString()
    };
  }

  async scanMultipleAssets(symbols: string[], timeframe: string, assetClass: string = 'stocks'): Promise<ZoneScanResult[]> {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.scanAsset(symbol, timeframe, assetClass))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<ZoneScanResult> => r.status === 'fulfilled')
      .map(r => r.value)
      .sort((a, b) => {
        if (a.inZone && !b.inZone) return -1;
        if (!a.inZone && b.inZone) return 1;
        return b.zones.filter(z => !z.broken).length - a.zones.filter(z => !z.broken).length;
      });
  }
  // 7-Gate Liquidity & S/D Validation System (2026 Master Prompt)
  // Primary Directive: Never execute unless ALL 7 Gates verified in sequence
  // Core Philosophy: Momentum-Scalping Engine exploiting "Rubber Band Effect" after Liquidity Sweeps
  async validate7GateSystem(symbol: string, timeframe: string, assetClass: string = 'stocks'): Promise<SevenGateValidation> {
    const candles = await this.fetchCandleData(symbol, timeframe, assetClass);
    if (candles.length < 50) {
      return this.getEmptyGateValidation(symbol, timeframe);
    }

    const currentPrice = candles[candles.length - 1].close;
    const scanResult = await this.scanAsset(symbol, timeframe, assetClass);
    
    // Gate 1: LIQUIDITY SWEEP (Primary Trigger - No sweep = No trade)
    // Detect "Sweep and Reclaim" - Price must pierce Daily/Session High/Low and snap back
    const liquiditySweep = this.detectLiquiditySweep(candles);
    
    // Gate 2: S/D ZONE TAP (Institutional Confluence)
    // Sweep must occur within or at edge of HTF Supply/Demand zone
    const zoneAlignment = this.checkZoneAlignment(scanResult.zones, currentPrice, liquiditySweep);
    
    // Gate 3: VELOCITY DISPLACEMENT (The Engine)
    // Candle body > 150% of 20-period average + must leave FVG
    const displacement = this.detectVelocityDisplacement(candles);
    
    // Gate 4: MARKET STRUCTURE SHIFT (MSS - The Seal of Approval)
    // Full candle body close above/below pivot that created sweep (wicks don't count)
    const mss = this.detectMarketStructureShift(candles, liquiditySweep);
    
    // Gate 5: RETURN TO FAIR VALUE (The Entry)
    // Calculate 50% Equilibrium (0.5 Fib) of displacement leg - Limit Order entry
    // Invalidate if price hits 0.786 Fib before filling (momentum lost)
    const fairValue = this.calculateFairValueEntry(candles, displacement);
    
    // Gate 6: RISK/REWARD CALIBRATION (Exit Strategy)
    // Stop: 2 ticks below sweep low | Target: Next major liquidity pool | Min 2:1 R/R
    const riskReward = this.calculateRiskRewardV2(currentPrice, scanResult.zones, liquiditySweep, fairValue);
    
    // Gate 7: THE KILL-SWITCH (Environment Check)
    // Windows: 9:30-11:30 AM EST & 1:30-4:00 PM EST | News filter | Bid-Ask spread < 2%
    const killSwitch = this.checkKillSwitchV2();
    
    // Option Contract: 0.60-0.65 Delta, 1-3 DTE, First ITM Strike
    const optionContract = this.calculateOptimalOptionV2(symbol, currentPrice, liquiditySweep);

    const gates = [
      { gate: 1, name: 'Liquidity Sweep', passed: liquiditySweep.detected, details: liquiditySweep },
      { gate: 2, name: 'S/D Zone Tap', passed: zoneAlignment.aligned, details: zoneAlignment },
      { gate: 3, name: 'Velocity Displacement', passed: displacement.confirmed && displacement.hasFVG, details: displacement },
      { gate: 4, name: 'Structure Shift (MSS)', passed: mss.confirmed, details: mss },
      { gate: 5, name: 'Fair Value Entry', passed: fairValue.valid && !fairValue.invalidated, details: fairValue },
      { gate: 6, name: 'R/R ≥2:1', passed: riskReward.ratio >= 2, details: riskReward },
      { gate: 7, name: 'Kill-Switch', passed: killSwitch.active && !killSwitch.newsBlocked, details: killSwitch }
    ];

    const gatesPassed = gates.filter(g => g.passed).length;
    const allGatesPassed = gatesPassed === 7;

    // Determine direction consistently across all gates
    // Priority: 1) Zone type (institutional), 2) Liquidity sweep, 3) Displacement
    const zoneDirection = scanResult?.zoneType === 'demand' ? 'bullish' as const :
                          scanResult?.zoneType === 'supply' ? 'bearish' as const : null;
    const sevenGateDirection = liquiditySweep.type || (displacement.direction as 'bullish' | 'bearish' | null);
    
    // Use zone direction if clear, otherwise use 7-gate indicators
    const finalDirection = zoneDirection || sevenGateDirection;
    
    return {
      symbol,
      timeframe,
      currentPrice,
      gates,
      gatesPassed,
      allGatesPassed,
      signalActive: gatesPassed >= 5,
      direction: finalDirection,
      optionContract: allGatesPassed ? optionContract : null,
      alertMessage: allGatesPassed ? this.generateAlertMessageV2(symbol, liquiditySweep, optionContract, riskReward, fairValue) : null,
      entryDetails: fairValue,
      timestamp: new Date().toISOString()
    };
  }

  private detectLiquiditySweep(candles: CandleData[]): LiquiditySweepResult {
    if (candles.length < 20) {
      return { detected: false, type: null, level: null, levelName: null, sweepCandle: null };
    }

    // Find PDH/PDL (Previous Day High/Low)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const previousDayCandles = candles.filter(c => c.timestamp < todayStart);
    const todayCandles = candles.filter(c => c.timestamp >= todayStart);
    
    if (previousDayCandles.length < 5) {
      // Use recent swing points instead
      const swingPoints = this.findSwingPoints(candles.slice(-50));
      return this.checkSwingSweep(candles, swingPoints);
    }

    const pdh = Math.max(...previousDayCandles.slice(-50).map(c => c.high));
    const pdl = Math.min(...previousDayCandles.slice(-50).map(c => c.low));
    const threshold = pdh * 0.001; // 0.1% pierce threshold

    // Check for bullish sweep (price dips below PDL then recovers)
    for (let i = candles.length - 5; i < candles.length; i++) {
      const candle = candles[i];
      if (candle.low < pdl - threshold && candle.close > pdl) {
        return {
          detected: true,
          type: 'bullish',
          level: pdl,
          levelName: 'Previous Day Low',
          sweepCandle: candle
        };
      }
      // Check for bearish sweep (price spikes above PDH then rejects)
      if (candle.high > pdh + threshold && candle.close < pdh) {
        return {
          detected: true,
          type: 'bearish',
          level: pdh,
          levelName: 'Previous Day High',
          sweepCandle: candle
        };
      }
    }

    // Check weekly swing points
    const weeklySwings = this.findWeeklySwingPoints(candles);
    return this.checkSwingSweep(candles, weeklySwings);
  }

  private findSwingPoints(candles: CandleData[]): { highs: number[]; lows: number[] } {
    const highs: number[] = [];
    const lows: number[] = [];
    
    for (let i = 2; i < candles.length - 2; i++) {
      const isSwingHigh = candles[i].high > candles[i-1].high && 
                          candles[i].high > candles[i-2].high &&
                          candles[i].high > candles[i+1].high && 
                          candles[i].high > candles[i+2].high;
      const isSwingLow = candles[i].low < candles[i-1].low && 
                         candles[i].low < candles[i-2].low &&
                         candles[i].low < candles[i+1].low && 
                         candles[i].low < candles[i+2].low;
      
      if (isSwingHigh) highs.push(candles[i].high);
      if (isSwingLow) lows.push(candles[i].low);
    }
    
    return { highs, lows };
  }

  private findWeeklySwingPoints(candles: CandleData[]): { highs: number[]; lows: number[] } {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekCandles = candles.filter(c => c.timestamp >= weekAgo);
    return this.findSwingPoints(weekCandles.length > 10 ? weekCandles : candles.slice(-100));
  }

  private checkSwingSweep(candles: CandleData[], swings: { highs: number[]; lows: number[] }): LiquiditySweepResult {
    const recent = candles.slice(-5);
    const threshold = 0.001;

    for (const low of swings.lows) {
      for (const candle of recent) {
        if (candle.low < low * (1 - threshold) && candle.close > low) {
          return { detected: true, type: 'bullish', level: low, levelName: 'Weekly Swing Low', sweepCandle: candle };
        }
      }
    }

    for (const high of swings.highs) {
      for (const candle of recent) {
        if (candle.high > high * (1 + threshold) && candle.close < high) {
          return { detected: true, type: 'bearish', level: high, levelName: 'Weekly Swing High', sweepCandle: candle };
        }
      }
    }

    return { detected: false, type: null, level: null, levelName: null, sweepCandle: null };
  }

  private detectReclaim(candles: CandleData[], sweep: LiquiditySweepResult): ReclaimResult {
    if (!sweep.detected || !sweep.level) {
      return { confirmed: false, reclaimCandle: null };
    }

    const recent = candles.slice(-3);
    for (const candle of recent) {
      if (sweep.type === 'bullish' && candle.close > sweep.level) {
        return { confirmed: true, reclaimCandle: candle };
      }
      if (sweep.type === 'bearish' && candle.close < sweep.level) {
        return { confirmed: true, reclaimCandle: candle };
      }
    }

    return { confirmed: false, reclaimCandle: null };
  }

  private detectDisplacement(candles: CandleData[]): DisplacementResult {
    if (candles.length < 10) {
      return { confirmed: false, direction: null, msbCandle: null, momentumScore: 0 };
    }

    const recent = candles.slice(-10);
    const avgBody = recent.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / recent.length;
    
    for (let i = recent.length - 3; i < recent.length; i++) {
      const candle = recent[i];
      const body = Math.abs(candle.close - candle.open);
      const isBullish = candle.close > candle.open;
      
      if (body > avgBody * 2) { // Large displacement candle
        // Check for market structure break
        const prevSwingHigh = Math.max(...recent.slice(0, i).map(c => c.high));
        const prevSwingLow = Math.min(...recent.slice(0, i).map(c => c.low));
        
        if (isBullish && candle.close > prevSwingHigh) {
          return { confirmed: true, direction: 'bullish', msbCandle: candle, momentumScore: body / avgBody };
        }
        if (!isBullish && candle.close < prevSwingLow) {
          return { confirmed: true, direction: 'bearish', msbCandle: candle, momentumScore: body / avgBody };
        }
      }
    }

    return { confirmed: false, direction: null, msbCandle: null, momentumScore: 0 };
  }

  // Gate 3: VELOCITY DISPLACEMENT with FVG Detection (150% body requirement)
  private detectVelocityDisplacement(candles: CandleData[]): VelocityDisplacementResult {
    if (candles.length < 25) {
      return { confirmed: false, direction: null, displacementCandle: null, velocityMultiple: 0, hasFVG: false, fvgRange: null };
    }

    // Calculate 20-period average body size (per Master Prompt spec)
    const lookback = candles.slice(-25, -5);
    const avgBody = lookback.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / lookback.length;
    const velocityThreshold = 1.5; // 150% of average (VELOCITY_MULTIPLIER constant)
    
    const recent = candles.slice(-5);
    
    for (let i = 0; i < recent.length; i++) {
      const candle = recent[i];
      const body = Math.abs(candle.close - candle.open);
      const velocityMultiple = body / avgBody;
      const isBullish = candle.close > candle.open;
      
      if (velocityMultiple >= velocityThreshold) {
        // Check for Fair Value Gap (FVG) - proves move is supported by 0.60 Delta-worthy momentum
        const fvg = this.detectFVG(candles, candles.length - (recent.length - i));
        
        return {
          confirmed: true,
          direction: isBullish ? 'bullish' : 'bearish',
          displacementCandle: candle,
          velocityMultiple: Math.round(velocityMultiple * 100) / 100,
          hasFVG: fvg.detected,
          fvgRange: fvg.detected ? fvg : null,
          displacementLow: Math.min(candle.low, recent[Math.max(0, i-1)]?.low || candle.low),
          displacementHigh: Math.max(candle.high, recent[Math.max(0, i-1)]?.high || candle.high)
        };
      }
    }

    return { confirmed: false, direction: null, displacementCandle: null, velocityMultiple: 0, hasFVG: false, fvgRange: null };
  }

  // Detect Fair Value Gap (imbalance)
  private detectFVG(candles: CandleData[], idx: number): { detected: boolean; high: number; low: number; type: string } {
    if (idx < 2 || idx >= candles.length) {
      return { detected: false, high: 0, low: 0, type: 'none' };
    }

    const prev = candles[idx - 2];
    const current = candles[idx];
    
    // Bullish FVG: Gap between candle 1 high and candle 3 low
    if (current.low > prev.high) {
      return { detected: true, high: current.low, low: prev.high, type: 'bullish' };
    }
    
    // Bearish FVG: Gap between candle 3 high and candle 1 low
    if (current.high < prev.low) {
      return { detected: true, high: prev.low, low: current.high, type: 'bearish' };
    }

    return { detected: false, high: 0, low: 0, type: 'none' };
  }

  // Gate 4: Market Structure Shift (Full body close above/below pivot)
  private detectMarketStructureShift(candles: CandleData[], sweep: LiquiditySweepResult): MSSResult {
    if (!sweep.detected || candles.length < 10) {
      return { confirmed: false, pivotLevel: null, breakCandle: null };
    }

    const recent = candles.slice(-10);
    
    // Find the pivot that created the sweep
    let pivotLevel: number | null = null;
    if (sweep.type === 'bullish') {
      // For bullish sweep, we need to break above the high that preceded the sweep
      const preSweepCandles = recent.slice(0, -3);
      pivotLevel = Math.max(...preSweepCandles.map(c => c.high));
    } else {
      // For bearish sweep, we need to break below the low that preceded the sweep
      const preSweepCandles = recent.slice(0, -3);
      pivotLevel = Math.min(...preSweepCandles.map(c => c.low));
    }

    // Check for full candle body close (wicks don't count)
    for (const candle of recent.slice(-3)) {
      const bodyHigh = Math.max(candle.open, candle.close);
      const bodyLow = Math.min(candle.open, candle.close);
      
      if (sweep.type === 'bullish' && bodyLow > pivotLevel) {
        return { confirmed: true, pivotLevel, breakCandle: candle };
      }
      if (sweep.type === 'bearish' && bodyHigh < pivotLevel) {
        return { confirmed: true, pivotLevel, breakCandle: candle };
      }
    }

    return { confirmed: false, pivotLevel, breakCandle: null };
  }

  // Gate 5: Return to Fair Value (50% Fib Entry with 0.786 invalidation)
  private calculateFairValueEntry(candles: CandleData[], displacement: VelocityDisplacementResult): FairValueEntryResult {
    if (!displacement.confirmed || !displacement.displacementCandle) {
      return { valid: false, entryPrice: null, fibLevel: null, invalidationLevel: null, invalidated: false };
    }

    const dispHigh = displacement.displacementHigh || displacement.displacementCandle.high;
    const dispLow = displacement.displacementLow || displacement.displacementCandle.low;
    const range = dispHigh - dispLow;
    
    // Calculate Fibonacci levels
    const fib50 = displacement.direction === 'bullish' 
      ? dispHigh - (range * 0.5)  // 50% retracement for bullish (discount)
      : dispLow + (range * 0.5);  // 50% retracement for bearish (premium)
    
    const fib786 = displacement.direction === 'bullish'
      ? dispHigh - (range * 0.786)  // Invalidation level for bullish
      : dispLow + (range * 0.786);  // Invalidation level for bearish
    
    // Check if current price has hit 0.786 (momentum lost - invalidate)
    const currentPrice = candles[candles.length - 1].close;
    const invalidated = displacement.direction === 'bullish'
      ? currentPrice < fib786
      : currentPrice > fib786;
    
    // Entry is valid if price is near 50% Fib and FVG confluence
    const nearFib50 = Math.abs(currentPrice - fib50) / currentPrice < 0.02;
    const inFvgRange = displacement.fvgRange ? (currentPrice >= displacement.fvgRange.low && currentPrice <= displacement.fvgRange.high) : false;
    const valid = !invalidated && (nearFib50 || inFvgRange);

    return {
      valid,
      entryPrice: Math.round(fib50 * 100) / 100,
      fibLevel: 0.5,
      invalidationLevel: Math.round(fib786 * 100) / 100,
      invalidated,
      fvgConfluence: displacement.fvgRange ? { high: displacement.fvgRange.high, low: displacement.fvgRange.low } : null
    };
  }

  // Gate 6: Risk/Reward V2 (Min 2:1 R/R, Stop 2 ticks below sweep)
  private calculateRiskRewardV2(currentPrice: number, zones: SupplyDemandZone[], sweep: LiquiditySweepResult, fairValue: FairValueEntryResult): RiskRewardResult {
    if (!sweep.detected || !sweep.level) {
      return { ratio: 0, entry: currentPrice, stop: currentPrice, target: currentPrice, valid: false };
    }

    // Entry at Fair Value (50% Fib) or current price
    const entry = fairValue.entryPrice || currentPrice;
    
    // Stop: 2 ticks below sweep low (long) or above sweep high (short)
    // 1 tick = 0.01 for most stocks, so 2 ticks = 0.02
    const tickSize = currentPrice > 100 ? 0.10 : 0.02;
    const stop = sweep.type === 'bullish' 
      ? sweep.level - (tickSize * 2)  // 2 ticks below sweep low
      : sweep.level + (tickSize * 2); // 2 ticks above sweep high

    // Target: Next major liquidity pool (opposite side unswept)
    let target = currentPrice;
    if (sweep.type === 'bullish') {
      // Target unswept highs (opposite liquidity)
      const supplyZones = zones.filter(z => z.type === 'supply' && !z.broken && z.bottomPrice > currentPrice);
      target = supplyZones.length > 0 
        ? Math.min(...supplyZones.map(z => z.bottomPrice))
        : entry + (entry - stop) * 2.5; // Default 2.5:1 R/R target
    } else {
      // Target unswept lows (opposite liquidity)
      const demandZones = zones.filter(z => z.type === 'demand' && !z.broken && z.topPrice < currentPrice);
      target = demandZones.length > 0
        ? Math.max(...demandZones.map(z => z.topPrice))
        : entry - (stop - entry) * 2.5;
    }

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const ratio = risk > 0 ? reward / risk : 0;

    return { 
      ratio: Math.round(ratio * 100) / 100, 
      entry: Math.round(entry * 100) / 100, 
      stop: Math.round(stop * 100) / 100, 
      target: Math.round(target * 100) / 100, 
      valid: ratio >= 2 // Min 2:1 R/R (MIN_RR constant)
    };
  }

  // Gate 7: Kill-Switch V2 (EST Windows + News Filter)
  private checkKillSwitchV2(): KillSwitchResult {
    const now = new Date();
    
    // Convert to EST (UTC-5, or UTC-4 during DST)
    const estOffset = -5; // Standard EST
    const estHour = (now.getUTCHours() + estOffset + 24) % 24;
    const estMinutes = now.getUTCMinutes();
    const totalMinutesEST = estHour * 60 + estMinutes;

    // Trading Windows per Master Prompt:
    // Morning: 9:30 AM - 11:30 AM EST (570-690 minutes)
    // Afternoon: 1:30 PM - 4:00 PM EST (810-960 minutes)
    const morningOpen = 9 * 60 + 30;  // 9:30 AM
    const morningClose = 11 * 60 + 30; // 11:30 AM
    const afternoonOpen = 13 * 60 + 30; // 1:30 PM
    const afternoonClose = 16 * 60;     // 4:00 PM

    const inMorningWindow = totalMinutesEST >= morningOpen && totalMinutesEST <= morningClose;
    const inAfternoonWindow = totalMinutesEST >= afternoonOpen && totalMinutesEST <= afternoonClose;
    const active = inMorningWindow || inAfternoonWindow;

    let window = 'Market Closed';
    if (inMorningWindow) window = 'Morning Session (9:30-11:30 AM EST)';
    else if (inAfternoonWindow) window = 'Afternoon Session (1:30-4:00 PM EST)';
    else if (totalMinutesEST >= 9 * 60 + 30 && totalMinutesEST < 16 * 60) window = 'Mid-Day (Avoid)';

    // News filter: Check if within 10 mins of high-impact news
    // In production, this would integrate with economic calendar API
    const newsBlocked = false; // Placeholder - integrate with news API
    
    // Bid-Ask spread check (< 2% of premium requirement)
    const spreadOk = true; // Placeholder - integrate with options data

    return {
      active,
      window,
      estTime: `${estHour}:${estMinutes.toString().padStart(2, '0')} EST`,
      newsBlocked,
      newsWarning: newsBlocked ? 'High-impact news within 10 minutes' : null,
      spreadOk
    };
  }

  // Option Contract V2: 0.60-0.65 Delta, 1-3 DTE, First ITM Strike
  private calculateOptimalOptionV2(symbol: string, currentPrice: number, sweep: LiquiditySweepResult): OptionContractResult {
    if (!sweep.detected) {
      return { valid: false, type: null, strike: null, delta: null, dte: null, expiry: null };
    }

    const optionType = sweep.type === 'bullish' ? 'CALL' : 'PUT';
    
    // First ITM Strike for 0.60-0.65 Delta
    // For calls: first strike below current price
    // For puts: first strike above current price
    const strikeInterval = currentPrice > 200 ? 5 : currentPrice > 50 ? 1 : 0.50;
    let strike: number;
    
    if (optionType === 'CALL') {
      strike = Math.floor(currentPrice / strikeInterval) * strikeInterval; // First ITM call
    } else {
      strike = Math.ceil(currentPrice / strikeInterval) * strikeInterval; // First ITM put
    }

    // 1-3 DTE (Target 2 DTE for Gamma explosion without 0DTE extreme risk)
    const dte = 2; // MIN_DTE=1, MAX_DTE=3, target middle
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + dte);
    const expiry = expiryDate.toISOString().split('T')[0];

    // Target Delta: 0.60-0.65
    const delta = 0.62; // Middle of target range

    return {
      valid: true,
      type: optionType,
      strike,
      delta,
      dte,
      expiry,
      rationale: `${dte}DTE ${optionType} @ $${strike} (0.${Math.round(delta * 100)} Delta) for Gamma exposure`
    };
  }

  // Generate alert message V2 with entry details
  private generateAlertMessageV2(symbol: string, sweep: LiquiditySweepResult, option: OptionContractResult, rr: RiskRewardResult, fairValue: FairValueEntryResult): string {
    return `🚨 7-GATE SIGNAL DETECTED
━━━━━━━━━━━━━━━━━━━━━
Ticker: ${symbol} | Direction: ${sweep.type?.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━
TRIGGER: Liquidity Sweep @ ${sweep.levelName}
Level: $${sweep.level?.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━
CONTRACT: ${option.type} ${option.strike} ${option.expiry}
Delta: ${option.delta} | DTE: ${option.dte}
━━━━━━━━━━━━━━━━━━━━━
ENTRY: $${fairValue.entryPrice?.toFixed(2)} (0.5 Fib)
STOP: $${rr.stop.toFixed(2)} (2 ticks below sweep)
TARGET: $${rr.target.toFixed(2)} (Opposite Liquidity)
R:R = 1:${rr.ratio.toFixed(1)}
━━━━━━━━━━━━━━━━━━━━━
⚠️ LIMIT ORDER ONLY at ${fairValue.entryPrice?.toFixed(2)}`;
  }

  private checkZoneAlignment(zones: SupplyDemandZone[], currentPrice: number, sweep: LiquiditySweepResult): ZoneAlignmentResult {
    const activeZones = zones.filter(z => !z.broken);
    
    for (const zone of activeZones) {
      const inZone = currentPrice >= zone.bottomPrice && currentPrice <= zone.topPrice;
      const nearZone = Math.abs(currentPrice - (zone.type === 'supply' ? zone.bottomPrice : zone.topPrice)) / currentPrice < 0.02;
      
      if ((inZone || nearZone) && !zone.retested) {
        // Fresh zone alignment
        const alignedWithSweep = sweep.detected && 
          ((sweep.type === 'bullish' && zone.type === 'demand') || 
           (sweep.type === 'bearish' && zone.type === 'supply'));
        
        return { aligned: true, zone, isFresh: !zone.retested, alignedWithSweep };
      }
    }

    return { aligned: false, zone: null, isFresh: false, alignedWithSweep: false };
  }

  private checkKillzoneTiming(): KillzoneResult {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const totalMinutes = utcHour * 60 + utcMinutes;

    // London Session: 7:00 - 11:00 UTC (Silver Bullet: 10:00-11:00)
    const londonSession = utcHour >= 7 && utcHour < 11;
    const londonSilverBullet = utcHour === 10;
    
    // New York Session: 13:00 - 17:00 UTC (Silver Bullet: 14:00-15:00)
    const nySession = utcHour >= 13 && utcHour < 17;
    const nySilverBullet = utcHour === 14;

    const active = londonSession || nySession;
    const silverBullet = londonSilverBullet || nySilverBullet;

    let session = 'Off Hours';
    if (londonSilverBullet) session = 'London Silver Bullet';
    else if (nySilverBullet) session = 'NY Silver Bullet';
    else if (londonSession) session = 'London Session';
    else if (nySession) session = 'New York Session';

    return { active, silverBullet, session, utcTime: `${utcHour}:${utcMinutes.toString().padStart(2, '0')} UTC` };
  }

  private calculateRiskReward(currentPrice: number, zones: SupplyDemandZone[], sweep: LiquiditySweepResult): RiskRewardResult {
    if (!sweep.detected || !sweep.level) {
      return { ratio: 0, entry: currentPrice, stop: currentPrice, target: currentPrice, valid: false };
    }

    const entry = currentPrice;
    let stop = sweep.level;
    let target = currentPrice;

    if (sweep.type === 'bullish') {
      stop = sweep.level * 0.995; // Stop below sweep level
      // Target: Next supply zone or 3x risk
      const supplyZones = zones.filter(z => z.type === 'supply' && !z.broken && z.bottomPrice > currentPrice);
      if (supplyZones.length > 0) {
        target = Math.min(...supplyZones.map(z => z.bottomPrice));
      } else {
        target = entry + (entry - stop) * 3;
      }
    } else {
      stop = sweep.level * 1.005; // Stop above sweep level
      // Target: Next demand zone or 3x risk
      const demandZones = zones.filter(z => z.type === 'demand' && !z.broken && z.topPrice < currentPrice);
      if (demandZones.length > 0) {
        target = Math.max(...demandZones.map(z => z.topPrice));
      } else {
        target = entry - (stop - entry) * 3;
      }
    }

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const ratio = risk > 0 ? reward / risk : 0;

    return { ratio: Math.round(ratio * 100) / 100, entry, stop, target, valid: ratio >= 3 };
  }

  private calculateOptimalOption(symbol: string, currentPrice: number, sweep: LiquiditySweepResult): OptionContractResult {
    if (!sweep.detected) {
      return { valid: false, type: null, strike: null, delta: null, dte: null, expiry: null };
    }

    const optionType = sweep.type === 'bullish' ? 'CALL' : 'PUT';
    
    // 0.60 Delta = Slightly ITM
    // For calls: strike slightly below current price
    // For puts: strike slightly above current price
    const strikeOffset = currentPrice * 0.02; // ~2% ITM for 0.60 delta approximation
    const strike = optionType === 'CALL' 
      ? Math.round((currentPrice - strikeOffset) * 100) / 100
      : Math.round((currentPrice + strikeOffset) * 100) / 100;

    // 30-45 DTE
    const dte = 35; // Target middle of range
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + dte);
    const expiry = expiryDate.toISOString().split('T')[0];

    return {
      valid: true,
      type: optionType,
      strike,
      delta: 0.60,
      dte,
      expiry
    };
  }

  private generateAlertMessage(symbol: string, sweep: LiquiditySweepResult, option: OptionContractResult, rr: RiskRewardResult): string {
    return `🚨 7-GATE SIGNAL DETECTED
Ticker: ${symbol} | Type: ${option.type}
Trigger: Liquidity Sweep at ${sweep.levelName} (${sweep.level?.toFixed(2)})
Contract: ${option.strike} ${option.expiry} (Delta: ${option.delta})
Entry: ${rr.entry.toFixed(2)} | Stop: ${rr.stop.toFixed(2)} | Target: ${rr.target.toFixed(2)}
Risk/Reward: 1:${rr.ratio.toFixed(1)}`;
  }

  private getEmptyGateValidation(symbol: string, timeframe: string): SevenGateValidation {
    return {
      symbol,
      timeframe,
      currentPrice: 0,
      gates: [],
      gatesPassed: 0,
      allGatesPassed: false,
      signalActive: false,
      direction: null,
      optionContract: null,
      alertMessage: null,
      timestamp: new Date().toISOString()
    };
  }
}

// Type definitions for 7-Gate System
interface LiquiditySweepResult {
  detected: boolean;
  type: 'bullish' | 'bearish' | null;
  level: number | null;
  levelName: string | null;
  sweepCandle: CandleData | null;
}

interface ReclaimResult {
  confirmed: boolean;
  reclaimCandle: CandleData | null;
}

interface DisplacementResult {
  confirmed: boolean;
  direction: 'bullish' | 'bearish' | null;
  msbCandle: CandleData | null;
  momentumScore: number;
}

interface VelocityDisplacementResult {
  confirmed: boolean;
  direction: 'bullish' | 'bearish' | null;
  displacementCandle: CandleData | null;
  velocityMultiple: number;
  hasFVG: boolean;
  fvgRange: { detected: boolean; high: number; low: number; type: string } | null;
  displacementLow?: number;
  displacementHigh?: number;
}

interface MSSResult {
  confirmed: boolean;
  pivotLevel: number | null;
  breakCandle: CandleData | null;
}

interface FairValueEntryResult {
  valid: boolean;
  entryPrice: number | null;
  fibLevel: number | null;
  invalidationLevel: number | null;
  invalidated: boolean;
  fvgConfluence?: { high: number; low: number } | null;
}

interface KillSwitchResult {
  active: boolean;
  window: string;
  estTime: string;
  newsBlocked: boolean;
  newsWarning: string | null;
  spreadOk: boolean;
}

interface ZoneAlignmentResult {
  aligned: boolean;
  zone: SupplyDemandZone | null;
  isFresh: boolean;
  alignedWithSweep: boolean;
}

interface KillzoneResult {
  active: boolean;
  silverBullet: boolean;
  session: string;
  utcTime: string;
}

interface RiskRewardResult {
  ratio: number;
  entry: number;
  stop: number;
  target: number;
  valid: boolean;
}

interface OptionContractResult {
  valid: boolean;
  type: 'CALL' | 'PUT' | null;
  strike: number | null;
  delta: number | null;
  dte: number | null;
  expiry: string | null;
  rationale?: string;
}

interface GateStatus {
  gate: number;
  name: string;
  passed: boolean;
  details: any;
}

interface SevenGateValidation {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  gates: GateStatus[];
  gatesPassed: number;
  allGatesPassed: boolean;
  signalActive: boolean;
  direction: 'bullish' | 'bearish' | null;
  optionContract: OptionContractResult | null;
  alertMessage: string | null;
  entryDetails?: FairValueEntryResult;
  timestamp: string;
}

export const supplyDemandService = new SupplyDemandService();
