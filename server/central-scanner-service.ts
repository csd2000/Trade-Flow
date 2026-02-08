/**
 * Central Scanner Service
 * Multi-source rule-based scanner with configurable gate sets
 * Handles rule execution, gate set management, and market data analysis
 * Note: Gate sets are stored in-memory and reset on server restart
 */

import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

interface OHLCVData {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface GateResult {
  gate: number;
  rule: string;
  result: {
    triggered: boolean;
    direction?: string;
    message?: string;
    value?: number;
    [key: string]: any;
  };
  passed: boolean;
  is_master: boolean;
}

interface ScanResult {
  symbol: string;
  gate_set: string;
  gates: GateResult[];
  passed_gates: number;
  total_gates: number;
  score: number;
  direction: 'BULLISH' | 'BEARISH' | null;
  passed: boolean;
  message?: string;
  error?: string;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  category: string;
  gate: number;
  params: Record<string, any>;
}

interface GateSetConfig {
  id: string;
  name: string;
  gates: Array<{
    gate: number;
    rule_id: string;
    required: boolean;
    weight: number;
    params?: Record<string, any>;
  }>;
  master_gate?: {
    gate: number;
    rule_id: string;
    required: boolean;
    weight: number;
  };
}

// Built-in rules (mirroring Python implementation)
const BUILT_IN_RULES: Rule[] = [
  {
    id: "liquidity_sweep",
    name: "Liquidity Sweep",
    description: "Detects when price sweeps above/below a swing point then reverses",
    category: "structure",
    gate: 1,
    params: { lookback: 20, threshold: 0.001 }
  },
  {
    id: "sweep_and_reclaim",
    name: "Sweep & Reclaim",
    description: "Trap + Reclaim: Price spikes below swing low then closes back above within 1-3 bars",
    category: "structure",
    gate: 1,
    params: { lookback: 20, reclaim_bars: 3 }
  },
  {
    id: "equal_highs_bait",
    name: "Equal Highs (EQH) Bait",
    description: "Detects equal highs that attract retail stops - pre-sweep alert",
    category: "bait",
    gate: 1,
    params: { tolerance: 0.002, min_touches: 2 }
  },
  {
    id: "equal_lows_bait",
    name: "Equal Lows (EQL) Bait",
    description: "Detects equal lows that attract retail stops - pre-sweep alert",
    category: "bait",
    gate: 1,
    params: { tolerance: 0.002, min_touches: 2 }
  },
  {
    id: "sweep_speed_analysis",
    name: "Sweep Speed Analysis",
    description: "AI Sentiment: Slow sweep = trend change risk, Fast V-shape = institutional hunt",
    category: "ai_sentiment",
    gate: 2,
    params: { fast_threshold: 3, slow_threshold: 8 }
  },
  {
    id: "rsi_oversold",
    name: "RSI Oversold",
    description: "RSI below threshold indicating oversold conditions",
    category: "momentum",
    gate: 2,
    params: { period: 14, threshold: 30 }
  },
  {
    id: "rsi_overbought",
    name: "RSI Overbought",
    description: "RSI above threshold indicating overbought conditions",
    category: "momentum",
    gate: 2,
    params: { period: 14, threshold: 70 }
  },
  {
    id: "rsi_divergence",
    name: "RSI Divergence",
    description: "Price makes new high/low but RSI doesn't confirm",
    category: "divergence",
    gate: 3,
    params: { period: 14, lookback: 10 }
  },
  {
    id: "volume_spike",
    name: "Volume Spike",
    description: "Volume exceeds average by multiplier",
    category: "volume",
    gate: 4,
    params: { period: 20, multiplier: 2.0 }
  },
  {
    id: "ema_crossover",
    name: "EMA Crossover",
    description: "Fast EMA crosses above slow EMA",
    category: "trend",
    gate: 5,
    params: { fast: 9, slow: 21 }
  },
  {
    id: "macd_signal",
    name: "MACD Signal Cross",
    description: "MACD line crosses signal line",
    category: "momentum",
    gate: 5,
    params: { fast: 12, slow: 26, signal: 9 }
  },
  {
    id: "bollinger_squeeze",
    name: "Bollinger Squeeze",
    description: "Bollinger Bands contracting indicating breakout potential",
    category: "volatility",
    gate: 6,
    params: { period: 20, std_dev: 2.0, squeeze_threshold: 0.1 }
  },
  {
    id: "price_action_bullish",
    name: "Bullish Price Action",
    description: "Bullish engulfing or hammer pattern",
    category: "candlestick",
    gate: 7,
    params: {}
  },
  {
    id: "price_action_bearish",
    name: "Bearish Price Action",
    description: "Bearish engulfing or shooting star pattern",
    category: "candlestick",
    gate: 7,
    params: {}
  }
];

// Default gate sets
const DEFAULT_GATE_SETS: GateSetConfig[] = [
  {
    id: "quick_scan",
    name: "Quick Scan (Any Signal)",
    gates: [
      { gate: 1, rule_id: "liquidity_sweep", required: false, weight: 25 },
      { gate: 2, rule_id: "sweep_and_reclaim", required: false, weight: 25 },
      { gate: 3, rule_id: "volume_spike", required: false, weight: 25 },
      { gate: 4, rule_id: "ema_crossover", required: false, weight: 25 }
    ]
  },
  {
    id: "momentum_scanner",
    name: "Momentum Scanner (Volume + Trend)",
    gates: [
      { gate: 1, rule_id: "volume_spike", required: false, weight: 40 },
      { gate: 2, rule_id: "ema_crossover", required: false, weight: 35 },
      { gate: 3, rule_id: "rsi_oversold", required: false, weight: 25 }
    ]
  },
  {
    id: "institutional_sniper",
    name: "Institutional Sniper (Sweep & Reclaim + AI)",
    gates: [
      { gate: 1, rule_id: "sweep_and_reclaim", required: false, weight: 35 },
      { gate: 2, rule_id: "sweep_speed_analysis", required: false, weight: 25 },
      { gate: 3, rule_id: "volume_spike", required: false, weight: 20 },
      { gate: 4, rule_id: "ema_crossover", required: false, weight: 20 }
    ]
  },
  {
    id: "7gate_liquidity",
    name: "7-Gate (Liquidity Sweep Focus)",
    gates: [
      { gate: 1, rule_id: "liquidity_sweep", required: false, weight: 30 },
      { gate: 2, rule_id: "rsi_oversold", required: false, weight: 15 },
      { gate: 3, rule_id: "volume_spike", required: false, weight: 15 },
      { gate: 4, rule_id: "ema_crossover", required: false, weight: 20 },
      { gate: 5, rule_id: "macd_signal", required: false, weight: 20 }
    ]
  },
  {
    id: "bait_detector",
    name: "Bait Detection (EQH/EQL Pre-Sweep Alerts)",
    gates: [
      { gate: 1, rule_id: "equal_highs_bait", required: false, weight: 35 },
      { gate: 2, rule_id: "equal_lows_bait", required: false, weight: 35 },
      { gate: 3, rule_id: "volume_spike", required: false, weight: 30 }
    ]
  },
  {
    id: "rsi_divergence",
    name: "RSI Divergence Scan",
    gates: [
      { gate: 1, rule_id: "rsi_oversold", required: true, weight: 40 },
      { gate: 2, rule_id: "volume_spike", required: false, weight: 30 },
      { gate: 3, rule_id: "ema_crossover", required: false, weight: 30 }
    ]
  },
  {
    id: "volume_breakout",
    name: "Volume Spike Breakout",
    gates: [
      { gate: 1, rule_id: "volume_spike", required: true, weight: 35 },
      { gate: 2, rule_id: "ema_crossover", required: false, weight: 35 },
      { gate: 3, rule_id: "macd_signal", required: false, weight: 30 }
    ]
  }
];

// Practical watchlist - most commonly traded assets
const SCAN_SYMBOLS = [
  // Top Crypto (most liquid)
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD',
  // Top Stocks (mega caps - most traded)
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META',
  // Major ETFs (indices)
  'SPY', 'QQQ'
];

class CentralScannerService {
  private customGateSets: Map<string, GateSetConfig> = new Map();

  constructor() {
    // Initialize with default gate sets
    DEFAULT_GATE_SETS.forEach(gs => this.customGateSets.set(gs.id, gs));
  }

  /**
   * Get all available rules
   */
  listRules(): Rule[] {
    return BUILT_IN_RULES;
  }

  /**
   * Get all gate sets (default + custom)
   */
  listGateSets(): GateSetConfig[] {
    return Array.from(this.customGateSets.values());
  }

  /**
   * Add a custom gate set
   */
  addGateSet(config: GateSetConfig): void {
    this.customGateSets.set(config.id, config);
  }

  /**
   * Delete a gate set
   */
  deleteGateSet(setId: string): boolean {
    return this.customGateSets.delete(setId);
  }

  /**
   * Fetch OHLCV data for a symbol
   */
  async fetchOHLCV(symbol: string, days: number = 100): Promise<OHLCVData | null> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result: any = await yahooFinance.chart(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });

      if (!result?.quotes || result.quotes.length < 20) {
        return null;
      }

      const quotes = result.quotes.filter((q: any) => 
        q.open !== null && q.high !== null && q.low !== null && q.close !== null
      );

      return {
        open: quotes.map((q: any) => q.open),
        high: quotes.map((q: any) => q.high),
        low: quotes.map((q: any) => q.low),
        close: quotes.map((q: any) => q.close),
        volume: quotes.map((q: any) => q.volume || 0)
      };
    } catch (error) {
      console.error(`Failed to fetch OHLCV for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Calculate technical indicators (TypeScript implementation)
   */
  private calculateIndicators(ohlcv: OHLCVData) {
    const closes = ohlcv.close;
    const highs = ohlcv.high;
    const lows = ohlcv.low;
    const volumes = ohlcv.volume;
    const len = closes.length;

    // EMA calculation
    const ema = (data: number[], period: number): number[] => {
      const result: number[] = new Array(data.length).fill(NaN);
      if (data.length < period) return result;
      
      const multiplier = 2 / (period + 1);
      let sum = 0;
      for (let i = 0; i < period; i++) sum += data[i];
      result[period - 1] = sum / period;
      
      for (let i = period; i < data.length; i++) {
        result[i] = (data[i] - result[i - 1]) * multiplier + result[i - 1];
      }
      return result;
    };

    // RSI calculation
    const rsi = (data: number[], period: number = 14): number[] => {
      const result: number[] = new Array(data.length).fill(NaN);
      if (data.length < period + 1) return result;

      const gains: number[] = [];
      const losses: number[] = [];

      for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? -change : 0);
      }

      let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

      for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        
        if (avgLoss === 0) {
          result[i + 1] = 100;
        } else {
          const rs = avgGain / avgLoss;
          result[i + 1] = 100 - (100 / (1 + rs));
        }
      }
      return result;
    };

    // Swing points
    const findSwingPoints = (lookback: number = 20) => {
      let swingHigh = NaN;
      let swingLow = NaN;
      
      if (len >= lookback) {
        const recentHighs = highs.slice(-lookback - 1, -1);
        const recentLows = lows.slice(-lookback - 1, -1);
        swingHigh = Math.max(...recentHighs);
        swingLow = Math.min(...recentLows);
      }
      
      return { swingHigh, swingLow };
    };

    return {
      ema9: ema(closes, 9),
      ema21: ema(closes, 21),
      ema50: ema(closes, 50),
      rsi14: rsi(closes, 14),
      swingPoints: findSwingPoints(20),
      currentClose: closes[len - 1],
      currentHigh: highs[len - 1],
      currentLow: lows[len - 1],
      currentVolume: volumes[len - 1],
      avgVolume: volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20
    };
  }

  /**
   * Check liquidity sweep condition
   */
  private checkLiquiditySweep(ohlcv: OHLCVData, params: Record<string, any> = {}): GateResult['result'] {
    const lookback = params.lookback || 20;
    const highs = ohlcv.high;
    const lows = ohlcv.low;
    const closes = ohlcv.close;
    const len = closes.length;

    if (len < lookback + 1) {
      return { triggered: false, message: "Insufficient data" };
    }

    const prevHigh = Math.max(...highs.slice(-lookback - 1, -1));
    const prevLow = Math.min(...lows.slice(-lookback - 1, -1));

    const bullishSweep = highs[len - 1] > prevHigh && closes[len - 1] < prevHigh;
    const bearishSweep = lows[len - 1] < prevLow && closes[len - 1] > prevLow;

    if (bullishSweep) {
      return {
        triggered: true,
        direction: "BEARISH",
        message: `Liquidity sweep above ${prevHigh.toFixed(2)}, closed below`,
        swing_level: prevHigh,
        current_price: closes[len - 1]
      };
    } else if (bearishSweep) {
      return {
        triggered: true,
        direction: "BULLISH",
        message: `Liquidity sweep below ${prevLow.toFixed(2)}, closed above`,
        swing_level: prevLow,
        current_price: closes[len - 1]
      };
    }

    return { triggered: false, direction: undefined, message: "No liquidity sweep detected" };
  }

  /**
   * Sweep & Reclaim Detection
   * The Trap: Price spikes below a known Swing Low (Retail stops triggered)
   * The Reclaim: The candle closes back above that Swing Low within 1-3 bars
   */
  private checkSweepAndReclaim(ohlcv: OHLCVData, params: Record<string, any> = {}): GateResult['result'] {
    const lookback = params.lookback || 20;
    const reclaimBars = params.reclaim_bars || 3;
    const highs = ohlcv.high;
    const lows = ohlcv.low;
    const closes = ohlcv.close;
    const len = closes.length;

    if (len < lookback + reclaimBars + 1) {
      return { triggered: false, message: "Insufficient data for Sweep & Reclaim" };
    }

    // Find swing points from lookback period (excluding last few bars where sweep might occur)
    const swingHigh = Math.max(...highs.slice(-lookback - reclaimBars - 1, -reclaimBars - 1));
    const swingLow = Math.min(...lows.slice(-lookback - reclaimBars - 1, -reclaimBars - 1));

    // Check for bullish Sweep & Reclaim (sweep below swing low, reclaim above)
    for (let i = 1; i <= reclaimBars; i++) {
      const sweepIdx = len - i - 1;
      const reclaimIdx = len - 1;
      
      // THE TRAP: Price swept below swing low
      if (lows[sweepIdx] < swingLow) {
        // THE RECLAIM: Current candle closes back above swing low
        if (closes[reclaimIdx] > swingLow) {
          const sweepDepth = ((swingLow - lows[sweepIdx]) / swingLow) * 100;
          return {
            triggered: true,
            direction: "BULLISH",
            message: `Sweep & Reclaim: Trapped below ${swingLow.toFixed(2)}, reclaimed in ${i} bar(s)`,
            swing_level: swingLow,
            sweep_depth_pct: parseFloat(sweepDepth.toFixed(3)),
            reclaim_bars: i,
            pattern: "bullish_trap"
          };
        }
      }
    }

    // Check for bearish Sweep & Reclaim (sweep above swing high, reclaim below)
    for (let i = 1; i <= reclaimBars; i++) {
      const sweepIdx = len - i - 1;
      const reclaimIdx = len - 1;
      
      // THE TRAP: Price swept above swing high
      if (highs[sweepIdx] > swingHigh) {
        // THE RECLAIM: Current candle closes back below swing high
        if (closes[reclaimIdx] < swingHigh) {
          const sweepDepth = ((highs[sweepIdx] - swingHigh) / swingHigh) * 100;
          return {
            triggered: true,
            direction: "BEARISH",
            message: `Sweep & Reclaim: Trapped above ${swingHigh.toFixed(2)}, reclaimed in ${i} bar(s)`,
            swing_level: swingHigh,
            sweep_depth_pct: parseFloat(sweepDepth.toFixed(3)),
            reclaim_bars: i,
            pattern: "bearish_trap"
          };
        }
      }
    }

    return { triggered: false, direction: undefined, message: "No Sweep & Reclaim pattern detected" };
  }

  /**
   * Equal Highs (EQH) Bait Detection
   * Identifies equal highs that attract retail stops for pre-sweep alerts
   */
  private checkEqualHighsBait(ohlcv: OHLCVData, params: Record<string, any> = {}): GateResult['result'] {
    const tolerance = params.tolerance || 0.002; // 0.2% tolerance for "equal"
    const minTouches = params.min_touches || 2;
    const lookback = 50;
    const highs = ohlcv.high;
    const len = highs.length;

    if (len < lookback) {
      return { triggered: false, message: "Insufficient data" };
    }

    const recentHighs = highs.slice(-lookback);
    const maxHigh = Math.max(...recentHighs);
    
    // Find all highs within tolerance of the max high
    let touchCount = 0;
    const touchLevels: number[] = [];
    
    for (let i = 0; i < recentHighs.length; i++) {
      const pctDiff = Math.abs(recentHighs[i] - maxHigh) / maxHigh;
      if (pctDiff <= tolerance) {
        touchCount++;
        touchLevels.push(recentHighs[i]);
      }
    }

    if (touchCount >= minTouches) {
      const avgLevel = touchLevels.reduce((a, b) => a + b, 0) / touchLevels.length;
      const currentPrice = ohlcv.close[len - 1];
      const distancePct = ((maxHigh - currentPrice) / currentPrice) * 100;

      return {
        triggered: true,
        direction: "BEARISH", // EQH is potential short setup after sweep
        message: `Equal Highs Bait: ${touchCount} touches near ${avgLevel.toFixed(2)} (${distancePct.toFixed(1)}% away)`,
        eqh_level: parseFloat(avgLevel.toFixed(2)),
        touch_count: touchCount,
        distance_pct: parseFloat(distancePct.toFixed(2)),
        alert_type: "pre_sweep"
      };
    }

    return { triggered: false, direction: undefined, message: "No Equal Highs pattern" };
  }

  /**
   * Equal Lows (EQL) Bait Detection
   * Identifies equal lows that attract retail stops for pre-sweep alerts
   */
  private checkEqualLowsBait(ohlcv: OHLCVData, params: Record<string, any> = {}): GateResult['result'] {
    const tolerance = params.tolerance || 0.002;
    const minTouches = params.min_touches || 2;
    const lookback = 50;
    const lows = ohlcv.low;
    const len = lows.length;

    if (len < lookback) {
      return { triggered: false, message: "Insufficient data" };
    }

    const recentLows = lows.slice(-lookback);
    const minLow = Math.min(...recentLows);
    
    let touchCount = 0;
    const touchLevels: number[] = [];
    
    for (let i = 0; i < recentLows.length; i++) {
      const pctDiff = Math.abs(recentLows[i] - minLow) / minLow;
      if (pctDiff <= tolerance) {
        touchCount++;
        touchLevels.push(recentLows[i]);
      }
    }

    if (touchCount >= minTouches) {
      const avgLevel = touchLevels.reduce((a, b) => a + b, 0) / touchLevels.length;
      const currentPrice = ohlcv.close[len - 1];
      const distancePct = ((currentPrice - minLow) / currentPrice) * 100;

      return {
        triggered: true,
        direction: "BULLISH", // EQL is potential long setup after sweep
        message: `Equal Lows Bait: ${touchCount} touches near ${avgLevel.toFixed(2)} (${distancePct.toFixed(1)}% away)`,
        eql_level: parseFloat(avgLevel.toFixed(2)),
        touch_count: touchCount,
        distance_pct: parseFloat(distancePct.toFixed(2)),
        alert_type: "pre_sweep"
      };
    }

    return { triggered: false, direction: undefined, message: "No Equal Lows pattern" };
  }

  /**
   * Sweep Speed Analysis (AI Sentiment Overlay)
   * Slow Sweep: Often a genuine trend change (High risk)
   * Fast "V-Shape" Sweep: High-probability institutional hunt (Low risk)
   */
  private checkSweepSpeed(ohlcv: OHLCVData, params: Record<string, any> = {}): GateResult['result'] {
    const fastThreshold = params.fast_threshold || 3; // bars for fast sweep
    const slowThreshold = params.slow_threshold || 8; // bars for slow sweep
    const scanWindow = 15; // Scan last 15 bars for sweeps (allows slow sweeps to be detected)
    const lookback = 20;
    const highs = ohlcv.high;
    const lows = ohlcv.low;
    const closes = ohlcv.close;
    const len = closes.length;

    if (len < lookback + scanWindow) {
      return { triggered: false, message: "Insufficient data for speed analysis" };
    }

    // Find swing points from historical data (before the scan window)
    const swingHigh = Math.max(...highs.slice(-lookback - scanWindow, -scanWindow));
    const swingLow = Math.min(...lows.slice(-lookback - scanWindow, -scanWindow));

    // Look for sweeps in the scan window and measure reclaim time
    let sweepType: 'bullish' | 'bearish' | null = null;
    let sweepIdx = -1;

    // Search from oldest to newest in scan window to find first sweep
    for (let i = scanWindow; i >= 1; i--) {
      const idx = len - i;
      if (lows[idx] < swingLow) {
        sweepType = 'bullish';
        sweepIdx = idx;
        break;
      }
      if (highs[idx] > swingHigh) {
        sweepType = 'bearish';
        sweepIdx = idx;
        break;
      }
    }

    if (!sweepType || sweepIdx === -1) {
      return { triggered: false, message: "No recent sweep for speed analysis" };
    }

    // Calculate bars from sweep to reclaim (current bar)
    const sweepBars = len - 1 - sweepIdx;
    const currentPrice = closes[len - 1];
    const sweepReclaimed = sweepType === 'bullish' 
      ? currentPrice > swingLow 
      : currentPrice < swingHigh;

    if (!sweepReclaimed) {
      return { triggered: false, message: "Sweep not yet reclaimed" };
    }

    // Determine sweep speed category
    let speedCategory: 'fast_v_shape' | 'medium' | 'slow';
    let riskLevel: 'low' | 'medium' | 'high';
    let confidence: number;

    if (sweepBars <= fastThreshold) {
      speedCategory = 'fast_v_shape';
      riskLevel = 'low';
      confidence = 85;
    } else if (sweepBars <= slowThreshold) {
      speedCategory = 'medium';
      riskLevel = 'medium';
      confidence = 65;
    } else {
      speedCategory = 'slow';
      riskLevel = 'high';
      confidence = 45;
    }

    return {
      triggered: true,
      direction: sweepType === 'bullish' ? 'BULLISH' : 'BEARISH',
      message: `${speedCategory.replace('_', ' ').toUpperCase()} sweep: ${sweepBars} bars to reclaim (${riskLevel} risk)`,
      sweep_bars: sweepBars,
      speed_category: speedCategory,
      risk_level: riskLevel,
      ai_confidence: confidence,
      institutional_probability: speedCategory === 'fast_v_shape' ? 'HIGH' : speedCategory === 'medium' ? 'MEDIUM' : 'LOW'
    };
  }

  /**
   * Check RSI condition
   */
  private checkRSI(ohlcv: OHLCVData, params: Record<string, any>, mode: 'oversold' | 'overbought'): GateResult['result'] {
    const period = params.period || 14;
    const threshold = params.threshold || (mode === 'oversold' ? 30 : 70);
    const indicators = this.calculateIndicators(ohlcv);
    const currentRSI = indicators.rsi14[indicators.rsi14.length - 1];

    if (isNaN(currentRSI)) {
      return { triggered: false, message: "Insufficient data" };
    }

    const triggered = mode === 'oversold' ? currentRSI < threshold : currentRSI > threshold;
    const direction = mode === 'oversold' ? 'BULLISH' : 'BEARISH';

    return {
      triggered,
      direction: triggered ? direction : undefined,
      value: parseFloat(currentRSI.toFixed(2)),
      threshold,
      message: `RSI at ${currentRSI.toFixed(2)}, threshold ${threshold}`
    };
  }

  /**
   * Check volume spike
   */
  private checkVolumeSpike(ohlcv: OHLCVData, params: Record<string, any>): GateResult['result'] {
    const multiplier = params.multiplier || 2.0;
    const indicators = this.calculateIndicators(ohlcv);
    const ratio = indicators.currentVolume / indicators.avgVolume;
    const triggered = ratio >= multiplier;
    
    const priceChange = (indicators.currentClose - ohlcv.close[ohlcv.close.length - 2]) / 
                        ohlcv.close[ohlcv.close.length - 2] * 100;
    const direction = priceChange > 0 ? 'BULLISH' : 'BEARISH';

    return {
      triggered,
      direction: triggered ? direction : undefined,
      ratio: parseFloat(ratio.toFixed(2)),
      multiplier,
      message: `Volume ratio ${ratio.toFixed(2)}x average`
    };
  }

  /**
   * Check EMA crossover
   */
  private checkEMACrossover(ohlcv: OHLCVData, params: Record<string, any>): GateResult['result'] {
    const indicators = this.calculateIndicators(ohlcv);
    const ema9 = indicators.ema9;
    const ema21 = indicators.ema21;
    const len = ema9.length;

    if (isNaN(ema9[len - 1]) || isNaN(ema21[len - 1])) {
      return { triggered: false, message: "Insufficient data" };
    }

    const bullishCross = ema9[len - 2] < ema21[len - 2] && ema9[len - 1] > ema21[len - 1];
    const bearishCross = ema9[len - 2] > ema21[len - 2] && ema9[len - 1] < ema21[len - 1];

    if (bullishCross) {
      return { triggered: true, direction: "BULLISH", message: "EMA 9 crossed above EMA 21" };
    } else if (bearishCross) {
      return { triggered: true, direction: "BEARISH", message: "EMA 9 crossed below EMA 21" };
    }

    return { triggered: false, direction: undefined, message: "No crossover" };
  }

  /**
   * Execute a single rule
   */
  private executeRule(ruleId: string, ohlcv: OHLCVData, params: Record<string, any> = {}): GateResult['result'] {
    switch (ruleId) {
      case 'liquidity_sweep':
        return this.checkLiquiditySweep(ohlcv, params);
      case 'sweep_and_reclaim':
        return this.checkSweepAndReclaim(ohlcv, params);
      case 'equal_highs_bait':
        return this.checkEqualHighsBait(ohlcv, params);
      case 'equal_lows_bait':
        return this.checkEqualLowsBait(ohlcv, params);
      case 'sweep_speed_analysis':
        return this.checkSweepSpeed(ohlcv, params);
      case 'rsi_oversold':
        return this.checkRSI(ohlcv, params, 'oversold');
      case 'rsi_overbought':
        return this.checkRSI(ohlcv, params, 'overbought');
      case 'volume_spike':
        return this.checkVolumeSpike(ohlcv, params);
      case 'ema_crossover':
        return this.checkEMACrossover(ohlcv, params);
      default:
        return { triggered: false, message: `Rule ${ruleId} not implemented` };
    }
  }

  /**
   * Scan a single symbol against a gate set
   */
  async scanSymbol(symbol: string, gateSetId: string): Promise<ScanResult> {
    const gateSet = this.customGateSets.get(gateSetId);
    if (!gateSet) {
      return {
        symbol,
        gate_set: 'unknown',
        gates: [],
        passed_gates: 0,
        total_gates: 0,
        score: 0,
        direction: null,
        passed: false,
        error: `Gate set ${gateSetId} not found`
      };
    }

    const ohlcv = await this.fetchOHLCV(symbol);
    if (!ohlcv) {
      return {
        symbol,
        gate_set: gateSet.name,
        gates: [],
        passed_gates: 0,
        total_gates: gateSet.gates.length,
        score: 0,
        direction: null,
        passed: false,
        error: 'Failed to fetch market data'
      };
    }

    const results: ScanResult = {
      symbol,
      gate_set: gateSet.name,
      gates: [],
      passed_gates: 0,
      total_gates: gateSet.gates.length,
      score: 0,
      direction: null,
      passed: false
    };

    // Check master gate first
    const masterGate = gateSet.gates[0];
    const masterResult = this.executeRule(masterGate.rule_id, ohlcv, masterGate.params);

    results.gates.push({
      gate: masterGate.gate,
      rule: masterGate.rule_id,
      result: masterResult,
      passed: masterResult.triggered || false,
      is_master: true
    });

    if (masterGate.required && !masterResult.triggered) {
      results.message = `Failed master gate: ${masterGate.rule_id}`;
      return results;
    }

    if (masterResult.triggered) {
      results.direction = masterResult.direction as 'BULLISH' | 'BEARISH' | null;
      results.passed_gates++;
      results.score += masterGate.weight;
    }

    // Check remaining gates
    for (const gate of gateSet.gates.slice(1)) {
      const gateResult = this.executeRule(gate.rule_id, ohlcv, gate.params);
      const passed = gateResult.triggered || false;

      if (passed) {
        results.passed_gates++;
        results.score += gate.weight;
      }

      results.gates.push({
        gate: gate.gate,
        rule: gate.rule_id,
        result: gateResult,
        passed,
        is_master: false
      });

      if (gate.required && !passed) {
        results.passed = false;
        results.message = `Failed required gate: ${gate.rule_id}`;
        return results;
      }
    }

    // Signal passes if ANY gate triggers (easier signal detection)
    results.passed = results.passed_gates >= 1;
    results.message = `Passed ${results.passed_gates}/${results.total_gates} gates (Score: ${results.score}%)`;

    return results;
  }

  /**
   * Scan multiple symbols against a gate set
   */
  async scanWatchlist(gateSetId: string, symbols?: string[]): Promise<{
    results: ScanResult[];
    passed: ScanResult[];
    failed: ScanResult[];
    timestamp: string;
    gateSet: string;
  }> {
    const watchlist = symbols || SCAN_SYMBOLS;
    const gateSet = this.customGateSets.get(gateSetId);
    
    const results: ScanResult[] = [];
    
    // Process sequentially to avoid Yahoo Finance rate limiting
    for (const symbol of watchlist) {
      try {
        const result = await this.scanSymbol(symbol, gateSetId);
        results.push(result);
        // Small delay between requests
        await new Promise(r => setTimeout(r, 300));
      } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
      }
    }

    const passed = results.filter(r => r.passed);
    const failed = results.filter(r => !r.passed);

    return {
      results,
      passed,
      failed,
      timestamp: new Date().toISOString(),
      gateSet: gateSet?.name || 'Unknown'
    };
  }
}

export const centralScannerService = new CentralScannerService();
export type { OHLCVData, GateResult, ScanResult, Rule, GateSetConfig };
