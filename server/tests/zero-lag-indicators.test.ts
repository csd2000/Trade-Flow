import { describe, test, expect } from 'vitest';
import { zeroLagIndicatorEngine } from '../zero-lag-indicators';
import type { Candle } from '../zero-lag-indicators';

const UPTREND_CANDLES: Candle[] = [
  { time: 1, open: 100, high: 101, low: 99, close: 100.5, volume: 1000000 },
  { time: 2, open: 100.5, high: 102, low: 100, close: 101.5, volume: 1100000 },
  { time: 3, open: 101.5, high: 103, low: 101, close: 102.5, volume: 1200000 },
  { time: 4, open: 102.5, high: 104, low: 102, close: 103.5, volume: 1150000 },
  { time: 5, open: 103.5, high: 105, low: 103, close: 104.5, volume: 1300000 },
  { time: 6, open: 104.5, high: 106, low: 104, close: 105.5, volume: 1250000 },
  { time: 7, open: 105.5, high: 107, low: 105, close: 106.5, volume: 1400000 },
  { time: 8, open: 106.5, high: 108, low: 106, close: 107.5, volume: 1350000 },
  { time: 9, open: 107.5, high: 109, low: 107, close: 108.5, volume: 1500000 },
  { time: 10, open: 108.5, high: 110, low: 108, close: 109.5, volume: 1450000 },
  { time: 11, open: 109.5, high: 111, low: 109, close: 110.5, volume: 1550000 },
  { time: 12, open: 110.5, high: 112, low: 110, close: 111.5, volume: 1600000 },
  { time: 13, open: 111.5, high: 113, low: 111, close: 112.5, volume: 1650000 },
  { time: 14, open: 112.5, high: 114, low: 112, close: 113.5, volume: 1700000 },
  { time: 15, open: 113.5, high: 115, low: 113, close: 114.5, volume: 1750000 },
  { time: 16, open: 114.5, high: 116, low: 114, close: 115.5, volume: 1800000 },
  { time: 17, open: 115.5, high: 117, low: 115, close: 116.5, volume: 1850000 },
  { time: 18, open: 116.5, high: 118, low: 116, close: 117.5, volume: 1900000 },
  { time: 19, open: 117.5, high: 119, low: 117, close: 118.5, volume: 1950000 },
  { time: 20, open: 118.5, high: 120, low: 118, close: 119.5, volume: 2000000 },
  { time: 21, open: 119.5, high: 121, low: 119, close: 120.5, volume: 2050000 },
  { time: 22, open: 120.5, high: 122, low: 120, close: 121.5, volume: 2100000 },
  { time: 23, open: 121.5, high: 123, low: 121, close: 122.5, volume: 2150000 },
  { time: 24, open: 122.5, high: 124, low: 122, close: 123.5, volume: 2200000 },
  { time: 25, open: 123.5, high: 125, low: 123, close: 124.5, volume: 2250000 },
  { time: 26, open: 124.5, high: 126, low: 124, close: 125.5, volume: 2300000 },
  { time: 27, open: 125.5, high: 127, low: 125, close: 126.5, volume: 2350000 },
  { time: 28, open: 126.5, high: 128, low: 126, close: 127.5, volume: 2400000 },
  { time: 29, open: 127.5, high: 129, low: 127, close: 128.5, volume: 2450000 },
  { time: 30, open: 128.5, high: 130, low: 128, close: 129.5, volume: 2500000 },
];

const DOWNTREND_CANDLES: Candle[] = [
  { time: 1, open: 130, high: 131, low: 129, close: 129.5, volume: 1000000 },
  { time: 2, open: 129.5, high: 130, low: 128, close: 128.5, volume: 1100000 },
  { time: 3, open: 128.5, high: 129, low: 127, close: 127.5, volume: 1200000 },
  { time: 4, open: 127.5, high: 128, low: 126, close: 126.5, volume: 1150000 },
  { time: 5, open: 126.5, high: 127, low: 125, close: 125.5, volume: 1300000 },
  { time: 6, open: 125.5, high: 126, low: 124, close: 124.5, volume: 1250000 },
  { time: 7, open: 124.5, high: 125, low: 123, close: 123.5, volume: 1400000 },
  { time: 8, open: 123.5, high: 124, low: 122, close: 122.5, volume: 1350000 },
  { time: 9, open: 122.5, high: 123, low: 121, close: 121.5, volume: 1500000 },
  { time: 10, open: 121.5, high: 122, low: 120, close: 120.5, volume: 1450000 },
  { time: 11, open: 120.5, high: 121, low: 119, close: 119.5, volume: 1550000 },
  { time: 12, open: 119.5, high: 120, low: 118, close: 118.5, volume: 1600000 },
  { time: 13, open: 118.5, high: 119, low: 117, close: 117.5, volume: 1650000 },
  { time: 14, open: 117.5, high: 118, low: 116, close: 116.5, volume: 1700000 },
  { time: 15, open: 116.5, high: 117, low: 115, close: 115.5, volume: 1750000 },
  { time: 16, open: 115.5, high: 116, low: 114, close: 114.5, volume: 1800000 },
  { time: 17, open: 114.5, high: 115, low: 113, close: 113.5, volume: 1850000 },
  { time: 18, open: 113.5, high: 114, low: 112, close: 112.5, volume: 1900000 },
  { time: 19, open: 112.5, high: 113, low: 111, close: 111.5, volume: 1950000 },
  { time: 20, open: 111.5, high: 112, low: 110, close: 110.5, volume: 2000000 },
  { time: 21, open: 110.5, high: 111, low: 109, close: 109.5, volume: 2050000 },
  { time: 22, open: 109.5, high: 110, low: 108, close: 108.5, volume: 2100000 },
  { time: 23, open: 108.5, high: 109, low: 107, close: 107.5, volume: 2150000 },
  { time: 24, open: 107.5, high: 108, low: 106, close: 106.5, volume: 2200000 },
  { time: 25, open: 106.5, high: 107, low: 105, close: 105.5, volume: 2250000 },
  { time: 26, open: 105.5, high: 106, low: 104, close: 104.5, volume: 2300000 },
  { time: 27, open: 104.5, high: 105, low: 103, close: 103.5, volume: 2350000 },
  { time: 28, open: 103.5, high: 104, low: 102, close: 102.5, volume: 2400000 },
  { time: 29, open: 102.5, high: 103, low: 101, close: 101.5, volume: 2450000 },
  { time: 30, open: 101.5, high: 102, low: 100, close: 100.5, volume: 2500000 },
];

const FLAT_CANDLES: Candle[] = [
  { time: 1, open: 100, high: 100.2, low: 99.8, close: 100, volume: 500000 },
  { time: 2, open: 100, high: 100.1, low: 99.9, close: 100.05, volume: 510000 },
  { time: 3, open: 100.05, high: 100.15, low: 99.95, close: 99.98, volume: 505000 },
  { time: 4, open: 99.98, high: 100.08, low: 99.88, close: 100.02, volume: 520000 },
  { time: 5, open: 100.02, high: 100.12, low: 99.92, close: 99.97, volume: 515000 },
  { time: 6, open: 99.97, high: 100.07, low: 99.87, close: 100.01, volume: 500000 },
  { time: 7, open: 100.01, high: 100.11, low: 99.91, close: 100.03, volume: 530000 },
  { time: 8, open: 100.03, high: 100.13, low: 99.93, close: 99.99, volume: 525000 },
  { time: 9, open: 99.99, high: 100.09, low: 99.89, close: 100.04, volume: 510000 },
  { time: 10, open: 100.04, high: 100.14, low: 99.94, close: 99.96, volume: 520000 },
  { time: 11, open: 99.96, high: 100.06, low: 99.86, close: 100.02, volume: 515000 },
  { time: 12, open: 100.02, high: 100.12, low: 99.92, close: 99.98, volume: 500000 },
  { time: 13, open: 99.98, high: 100.08, low: 99.88, close: 100.01, volume: 530000 },
  { time: 14, open: 100.01, high: 100.11, low: 99.91, close: 100, volume: 525000 },
  { time: 15, open: 100, high: 100.1, low: 99.9, close: 100.03, volume: 510000 },
  { time: 16, open: 100.03, high: 100.13, low: 99.93, close: 99.97, volume: 520000 },
  { time: 17, open: 99.97, high: 100.07, low: 99.87, close: 100.02, volume: 515000 },
  { time: 18, open: 100.02, high: 100.12, low: 99.92, close: 99.99, volume: 500000 },
  { time: 19, open: 99.99, high: 100.09, low: 99.89, close: 100.01, volume: 530000 },
  { time: 20, open: 100.01, high: 100.11, low: 99.91, close: 100, volume: 525000 },
  { time: 21, open: 100, high: 100.1, low: 99.9, close: 100.02, volume: 510000 },
  { time: 22, open: 100.02, high: 100.12, low: 99.92, close: 99.98, volume: 520000 },
  { time: 23, open: 99.98, high: 100.08, low: 99.88, close: 100.01, volume: 515000 },
  { time: 24, open: 100.01, high: 100.11, low: 99.91, close: 99.99, volume: 500000 },
  { time: 25, open: 99.99, high: 100.09, low: 99.89, close: 100.03, volume: 530000 },
  { time: 26, open: 100.03, high: 100.13, low: 99.93, close: 99.97, volume: 525000 },
  { time: 27, open: 99.97, high: 100.07, low: 99.87, close: 100.02, volume: 510000 },
  { time: 28, open: 100.02, high: 100.12, low: 99.92, close: 99.98, volume: 520000 },
  { time: 29, open: 99.98, high: 100.08, low: 99.88, close: 100.01, volume: 515000 },
  { time: 30, open: 100.01, high: 100.11, low: 99.91, close: 100, volume: 500000 },
];

describe('ZeroLagIndicators - Deterministic Tests', () => {
  describe('Zero-Lag Moving Averages', () => {
    test('ZLEMA tracks price in uptrend (below current price)', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      const lastPrice = UPTREND_CANDLES[UPTREND_CANDLES.length - 1].close;
      
      expect(result.zlema20).toBeGreaterThan(100);
      expect(result.zlema20).toBeLessThan(lastPrice);
      expect(result.zlema20).toBeGreaterThan(120);
    });

    test('HMA tracks price in uptrend (below current price)', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      const lastPrice = UPTREND_CANDLES[UPTREND_CANDLES.length - 1].close;
      
      expect(result.hma20).toBeGreaterThan(100);
      expect(result.hma20).toBeLessThan(lastPrice);
    });

    test('TEMA tracks price in uptrend (below current price)', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      const lastPrice = UPTREND_CANDLES[UPTREND_CANDLES.length - 1].close;
      
      expect(result.tema20).toBeGreaterThan(100);
      expect(result.tema20).toBeLessThan(lastPrice);
    });

    test('DEMA tracks price in uptrend (below current price)', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      const lastPrice = UPTREND_CANDLES[UPTREND_CANDLES.length - 1].close;
      
      expect(result.dema20).toBeGreaterThan(100);
      expect(result.dema20).toBeLessThan(lastPrice);
    });

    test('KAMA tracks price in uptrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.kama10).toBeGreaterThan(100);
      expect(result.kama10).toBeLessThan(130);
    });

    test('ROC is positive in consistent uptrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.roc10).toBeGreaterThan(0);
      expect(result.roc10).toBeLessThan(50);
    });

    test('ROC is negative in consistent downtrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(DOWNTREND_CANDLES);
      
      expect(result.roc10).toBeLessThan(0);
      expect(result.roc10).toBeGreaterThan(-50);
    });

    test('Indicators cluster near price in flat market', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(FLAT_CANDLES);
      const lastPrice = FLAT_CANDLES[FLAT_CANDLES.length - 1].close;
      
      expect(Math.abs(result.zlema20 - lastPrice)).toBeLessThan(1);
      expect(Math.abs(result.hma20 - lastPrice)).toBeLessThan(1);
      expect(Math.abs(result.tema20 - lastPrice)).toBeLessThan(1);
      expect(Math.abs(result.dema20 - lastPrice)).toBeLessThan(1);
    });
  });

  describe('ADX Calculation with Wilder Smoothing', () => {
    test('ADX is bounded 0-100 for uptrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.regime.adx).toBeGreaterThanOrEqual(0);
      expect(result.regime.adx).toBeLessThanOrEqual(100);
    });

    test('ADX is bounded 0-100 for downtrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(DOWNTREND_CANDLES);
      
      expect(result.regime.adx).toBeGreaterThanOrEqual(0);
      expect(result.regime.adx).toBeLessThanOrEqual(100);
    });

    test('ADX is bounded 0-100 for flat market', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(FLAT_CANDLES);
      
      expect(result.regime.adx).toBeGreaterThanOrEqual(0);
      expect(result.regime.adx).toBeLessThanOrEqual(100);
    });

    test('ADX is higher for trending than flat market', () => {
      const uptrendResult = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      const flatResult = zeroLagIndicatorEngine.getLatestValues(FLAT_CANDLES);
      
      expect(uptrendResult.regime.adx).toBeGreaterThan(flatResult.regime.adx);
    });

    test('Strong uptrend has ADX > 25', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.regime.adx).toBeGreaterThan(25);
    });

    test('Flat market has ADX < 25', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(FLAT_CANDLES);
      
      expect(result.regime.adx).toBeLessThan(25);
    });
  });

  describe('Regime Detection', () => {
    test('Uptrend has high ADX indicating directional movement', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.regime.adx).toBeGreaterThan(25);
      expect(['trending_up', 'trending_down', 'volatile']).toContain(result.regime.regime);
    });

    test('Flat market classified as ranging/consolidating', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(FLAT_CANDLES);
      
      expect(['ranging', 'consolidating']).toContain(result.regime.regime);
    });

    test('ATR percentile is bounded 0-100', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.regime.atrPercentile).toBeGreaterThanOrEqual(0);
      expect(result.regime.atrPercentile).toBeLessThanOrEqual(100);
    });

    test('Regime includes reason string', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(typeof result.regime.reason).toBe('string');
      expect(result.regime.reason.length).toBeGreaterThan(0);
    });
  });

  describe('Order Flow Analysis', () => {
    test('Cumulative delta positive in uptrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.orderFlow.cumulativeDelta).toBeGreaterThan(0);
    });

    test('Cumulative delta negative in downtrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(DOWNTREND_CANDLES);
      
      expect(result.orderFlow.cumulativeDelta).toBeLessThan(0);
    });

    test('VWAP bands are properly ordered', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.orderFlow.vwapLower).toBeLessThan(result.orderFlow.vwap);
      expect(result.orderFlow.vwap).toBeLessThan(result.orderFlow.vwapUpper);
    });

    test('VWAP is within price range', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.orderFlow.vwap).toBeGreaterThan(100);
      expect(result.orderFlow.vwap).toBeLessThan(130);
    });

    test('Volume clusters are generated', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(Array.isArray(result.orderFlow.volumeClusters)).toBe(true);
      expect(result.orderFlow.volumeClusters.length).toBeGreaterThan(0);
    });
  });

  describe('MACD Variations', () => {
    test('ZLEMA MACD has valid structure', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(typeof result.zlemaMACD.macd).toBe('number');
      expect(typeof result.zlemaMACD.signal).toBe('number');
      expect(typeof result.zlemaMACD.histogram).toBe('number');
      expect(isNaN(result.zlemaMACD.macd)).toBe(false);
    });

    test('TEMA MACD has valid structure', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(typeof result.temaMACD.macd).toBe('number');
      expect(typeof result.temaMACD.signal).toBe('number');
      expect(typeof result.temaMACD.histogram).toBe('number');
      expect(isNaN(result.temaMACD.macd)).toBe(false);
    });

    test('Histogram equals MACD minus signal', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      const expectedHistogram = result.zlemaMACD.macd - result.zlemaMACD.signal;
      expect(Math.abs(result.zlemaMACD.histogram - expectedHistogram)).toBeLessThan(0.0001);
    });

    test('MACD is positive in strong uptrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(UPTREND_CANDLES);
      
      expect(result.zlemaMACD.macd).toBeGreaterThan(0);
    });

    test('MACD is negative in strong downtrend', () => {
      const result = zeroLagIndicatorEngine.getLatestValues(DOWNTREND_CANDLES);
      
      expect(result.zlemaMACD.macd).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('Handles minimum data gracefully', () => {
      const minCandles = UPTREND_CANDLES.slice(0, 5);
      const result = zeroLagIndicatorEngine.getLatestValues(minCandles);
      
      expect(result).toBeDefined();
      expect(result.regime).toBeDefined();
      expect(result.orderFlow).toBeDefined();
    });
  });
});
