#!/usr/bin/env python3
"""
Autonomous Liquidity Sweep Agent
7-Gate Trading System - Gate 1: Liquidity Sweep Detection

This agent runs autonomous observation cycles every 5 minutes to detect
liquidity sweeps across multiple trading pairs. It uses volume verification
to confirm sweeps aren't low-volume anomalies.
"""

import ccxt
import time
import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import os

class LiquiditySweepAgent:
    def __init__(self, symbols: List[str] = None, timeframe: str = '5m'):
        self.exchange = ccxt.kraken({
            'enableRateLimit': True,
            'options': {'defaultType': 'spot'}
        })
        
        self.symbols = symbols or [
            'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 
            'DOGE/USD', 'ADA/USD', 'AVAX/USD', 'LINK/USD'
        ]
        self.timeframe = timeframe
        self.sweep_history: List[Dict] = []
        self.verified_sweeps: List[Dict] = []
        self.observation_count = 0
        self.cycle_interval = 300
        
        self.min_volume_multiplier = 1.5
        self.sweep_threshold_percent = 0.1
        self.lookback_periods = 50

    def fetch_market_data(self, symbol: str) -> Optional[pd.DataFrame]:
        try:
            bars = self.exchange.fetch_ohlcv(
                symbol, 
                timeframe=self.timeframe, 
                limit=self.lookback_periods
            )
            
            if not bars or len(bars) < 10:
                return None
                
            df = pd.DataFrame(bars, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
            
        except Exception as e:
            print(f"Error fetching {symbol}: {e}", file=sys.stderr)
            return None

    def identify_liquidity_pools(self, df: pd.DataFrame) -> Dict:
        recent_data = df.iloc[:-1]
        
        swing_highs = []
        swing_lows = []
        
        for i in range(2, len(recent_data) - 2):
            if (recent_data['high'].iloc[i] > recent_data['high'].iloc[i-1] and 
                recent_data['high'].iloc[i] > recent_data['high'].iloc[i-2] and
                recent_data['high'].iloc[i] > recent_data['high'].iloc[i+1] and 
                recent_data['high'].iloc[i] > recent_data['high'].iloc[i+2]):
                swing_highs.append({
                    'price': recent_data['high'].iloc[i],
                    'volume': recent_data['volume'].iloc[i],
                    'index': i
                })
            
            if (recent_data['low'].iloc[i] < recent_data['low'].iloc[i-1] and 
                recent_data['low'].iloc[i] < recent_data['low'].iloc[i-2] and
                recent_data['low'].iloc[i] < recent_data['low'].iloc[i+1] and 
                recent_data['low'].iloc[i] < recent_data['low'].iloc[i+2]):
                swing_lows.append({
                    'price': recent_data['low'].iloc[i],
                    'volume': recent_data['volume'].iloc[i],
                    'index': i
                })
        
        resistance_high = recent_data['high'].max()
        support_low = recent_data['low'].min()
        
        session_high = df.iloc[-12:]['high'].max() if len(df) >= 12 else resistance_high
        session_low = df.iloc[-12:]['low'].min() if len(df) >= 12 else support_low
        
        prev_day_high = df.iloc[-48:-12]['high'].max() if len(df) >= 48 else resistance_high
        prev_day_low = df.iloc[-48:-12]['low'].min() if len(df) >= 48 else support_low
        
        avg_volume = recent_data['volume'].mean()
        
        return {
            'swing_highs': swing_highs,
            'swing_lows': swing_lows,
            'resistance': resistance_high,
            'support': support_low,
            'session_high': session_high,
            'session_low': session_low,
            'prev_day_high': prev_day_high,
            'prev_day_low': prev_day_low,
            'avg_volume': avg_volume
        }

    def detect_sweep(self, symbol: str, df: pd.DataFrame, pools: Dict) -> Optional[Dict]:
        current = df.iloc[-1]
        previous = df.iloc[-2]
        
        current_high = current['high']
        current_low = current['low']
        current_close = current['close']
        current_volume = current['volume']
        
        sweep_detected = None
        
        external_lows = [
            ('session_low', pools.get('session_low', pools['support'])),
            ('prev_day_low', pools.get('prev_day_low', pools['support'])),
            ('support', pools['support'])
        ]
        
        external_highs = [
            ('session_high', pools.get('session_high', pools['resistance'])),
            ('prev_day_high', pools.get('prev_day_high', pools['resistance'])),
            ('resistance', pools['resistance'])
        ]
        
        for level_name, level_price in external_highs:
            if current_high > level_price and current_close < level_price:
                sweep_detected = {
                    'type': 'BEARISH_SWEEP',
                    'trap_type': 'bull_trap',
                    'direction': 'SHORT',
                    'level_type': level_name,
                    'sweep_level': level_price,
                    'sweep_high': current_high,
                    'close_price': current_close,
                    'penetration': ((current_high - level_price) / level_price) * 100
                }
                break
        
        for level_name, level_price in external_lows:
            if current_low < level_price and current_close > level_price:
                sweep_detected = {
                    'type': 'BULLISH_SWEEP',
                    'trap_type': 'bear_trap',
                    'direction': 'LONG',
                    'level_type': level_name,
                    'sweep_level': level_price,
                    'sweep_low': current_low,
                    'close_price': current_close,
                    'penetration': ((level_price - current_low) / level_price) * 100
                }
                break
        
        if sweep_detected:
            sweep_detected.update({
                'symbol': symbol,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'current_volume': current_volume,
                'avg_volume': pools['avg_volume'],
                'volume_ratio': current_volume / pools['avg_volume'] if pools['avg_volume'] > 0 else 0,
                'timeframe': self.timeframe
            })
            
        return sweep_detected

    def verify_sweep(self, sweep: Dict) -> Tuple[bool, Dict]:
        verification = {
            'volume_confirmed': False,
            'not_anomaly': False,
            'structural_validity': False,
            'confidence_score': 0.0,
            'reasons': []
        }
        
        if sweep['volume_ratio'] >= self.min_volume_multiplier:
            verification['volume_confirmed'] = True
            verification['reasons'].append(f"Volume {sweep['volume_ratio']:.1f}x above average")
            verification['confidence_score'] += 35
        else:
            verification['reasons'].append(f"Low volume: only {sweep['volume_ratio']:.1f}x average")
        
        if sweep['penetration'] >= self.sweep_threshold_percent:
            verification['not_anomaly'] = True
            verification['reasons'].append(f"Significant penetration: {sweep['penetration']:.2f}%")
            verification['confidence_score'] += 25
        else:
            verification['reasons'].append(f"Weak penetration: {sweep['penetration']:.2f}%")
        
        if sweep['penetration'] < 5.0:
            verification['structural_validity'] = True
            verification['reasons'].append("Clean sweep structure (not a breakout)")
            verification['confidence_score'] += 25
        else:
            verification['reasons'].append("May be a breakout, not a sweep")
        
        if sweep['volume_ratio'] >= 2.0:
            verification['confidence_score'] += 15
            verification['reasons'].append("High volume confirmation (+15)")
        
        is_verified = (
            verification['volume_confirmed'] and 
            verification['not_anomaly'] and 
            verification['confidence_score'] >= 60
        )
        
        verification['gate_passed'] = is_verified
        verification['grade'] = self._calculate_grade(verification['confidence_score'])
        
        return is_verified, verification

    def _calculate_grade(self, score: float) -> str:
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        else:
            return 'F'

    def log(self, message: str):
        print(message, file=sys.stderr)

    def observation_cycle(self, silent: bool = False) -> Dict:
        self.observation_count += 1
        cycle_start = datetime.now(timezone.utc)
        
        results = {
            'cycle_number': self.observation_count,
            'timestamp': cycle_start.isoformat(),
            'symbols_scanned': [],
            'sweeps_detected': [],
            'verified_sweeps': [],
            'gate_1_status': 'SCANNING'
        }
        
        if not silent:
            self.log(f"\n{'='*60}")
            self.log(f"OBSERVATION CYCLE #{self.observation_count}")
            self.log(f"Time: {cycle_start.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            self.log(f"{'='*60}")
        
        for symbol in self.symbols:
            if not silent:
                self.log(f"\nScanning {symbol}...")
            
            df = self.fetch_market_data(symbol)
            if df is None:
                if not silent:
                    self.log("Failed to fetch data")
                continue
                
            results['symbols_scanned'].append(symbol)
            
            pools = self.identify_liquidity_pools(df)
            
            sweep = self.detect_sweep(symbol, df, pools)
            
            if sweep:
                if not silent:
                    self.log(f"⚠️  SWEEP DETECTED: {sweep['type']}")
                results['sweeps_detected'].append(sweep)
                self.sweep_history.append(sweep)
                
                if not silent:
                    self.log("Running verification loop...")
                is_verified, verification = self.verify_sweep(sweep)
                
                sweep['verification'] = verification
                
                if is_verified:
                    if not silent:
                        self.log(f"✅ VERIFIED - Grade: {verification['grade']}")
                        self.log(f"   Confidence: {verification['confidence_score']}%")
                    results['verified_sweeps'].append(sweep)
                    self.verified_sweeps.append(sweep)
                else:
                    if not silent:
                        self.log(f"❌ NOT VERIFIED - Grade: {verification['grade']}")
                        self.log(f"   Reasons: {', '.join(verification['reasons'])}")
            else:
                if not silent:
                    self.log("No sweep detected")
        
        if results['verified_sweeps']:
            results['gate_1_status'] = 'PASSED'
            if not silent:
                self.log(f"\n🎯 GATE 1 PASSED - {len(results['verified_sweeps'])} verified sweep(s)")
        else:
            results['gate_1_status'] = 'MONITORING'
            if not silent:
                self.log("\n📊 GATE 1 MONITORING - No verified sweeps this cycle")
        
        results['cycle_duration'] = (datetime.now(timezone.utc) - cycle_start).total_seconds()
        
        return results

    def get_status(self) -> Dict:
        return {
            'agent_status': 'ACTIVE',
            'observation_count': self.observation_count,
            'total_sweeps_detected': len(self.sweep_history),
            'total_verified_sweeps': len(self.verified_sweeps),
            'symbols_monitoring': self.symbols,
            'timeframe': self.timeframe,
            'cycle_interval_seconds': self.cycle_interval,
            'last_verified_sweeps': self.verified_sweeps[-5:] if self.verified_sweeps else [],
            'verification_criteria': {
                'min_volume_multiplier': self.min_volume_multiplier,
                'sweep_threshold_percent': self.sweep_threshold_percent,
                'required_confidence': 60
            }
        }

    def run_autonomous(self):
        self.log("\n" + "="*60)
        self.log("AUTONOMOUS LIQUIDITY SWEEP AGENT INITIALIZED")
        self.log("7-Gate Trading System - Gate 1: Liquidity Sweep Detection")
        self.log("="*60)
        self.log(f"Monitoring: {', '.join(self.symbols)}")
        self.log(f"Timeframe: {self.timeframe}")
        self.log(f"Cycle Interval: {self.cycle_interval} seconds (5 minutes)")
        self.log("="*60 + "\n")
        
        while True:
            try:
                results = self.observation_cycle()
                
                self.log(f"\nNext cycle in {self.cycle_interval} seconds...")
                self.log(f"Press Ctrl+C to stop the agent.\n")
                
                time.sleep(self.cycle_interval)
                
            except KeyboardInterrupt:
                self.log("\n\nAgent stopped by user.")
                break
            except Exception as e:
                self.log(f"\nError in observation cycle: {e}")
                self.log("Retrying in 60 seconds...")
                time.sleep(60)


def run_single_scan(symbols: List[str] = None) -> Dict:
    agent = LiquiditySweepAgent(symbols=symbols)
    return agent.observation_cycle()


def get_agent_status() -> Dict:
    agent = LiquiditySweepAgent()
    return agent.get_status()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--scan":
            try:
                symbols = None
                if len(sys.argv) > 2:
                    symbols = [s if '/' in s else f"{s}/USD" for s in sys.argv[2:]]
                
                agent = LiquiditySweepAgent(symbols=symbols)
                result = agent.observation_cycle(silent=True)
                
                print(json.dumps(result, default=str))
            except Exception as e:
                error_result = {
                    'error': str(e),
                    'cycle_number': 0,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'symbols_scanned': [],
                    'sweeps_detected': [],
                    'verified_sweeps': [],
                    'gate_1_status': 'ERROR'
                }
                print(json.dumps(error_result, default=str))
        elif sys.argv[1] == "--status":
            status = get_agent_status()
            print(json.dumps(status, default=str))
        else:
            print("Usage: python liquidity_sweep_agent.py [--scan [symbols...]] [--status]", file=sys.stderr)
    else:
        agent = LiquiditySweepAgent()
        agent.run_autonomous()
