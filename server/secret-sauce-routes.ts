import { Router } from 'express';
import { secretSauceService } from './secret-sauce-service';
import { supplyDemandService } from './supply-demand-service';
import { orderFlowIntelligence, OrderFlowData, PressureMeterState } from './strategy/orderflow';
import { predictiveSignalEngine, PredictiveSnapshot } from './predictive-signal-engine';

const router = Router();

const ASSET_CATEGORIES = {
  hfc_watchlist: {
    name: 'HFC Liquidity Hunter',
    symbols: ['BITF', 'NIO', 'SOUN', 'PLTR', 'COIN', 'MARA', 'RIOT', 'SOFI', 'LCID', 'RIVN', 'HOOD', 'AMC']
  },
  stocks: {
    name: 'Stocks & ETFs',
    symbols: ['^GSPC', 'AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'GOOGL', 'META', 'NFLX', 'AMD', 'SPY', 'QQQ', 'COIN', 'PLTR', 'UBER', 'SHOP']
  },
  crypto: {
    name: 'Cryptocurrencies',
    symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'DOT-USD', 'MATIC-USD', 'LINK-USD', 'AVAX-USD', 'SHIB-USD', 'LTC-USD']
  },
  forex_major: {
    name: 'Major Forex Pairs',
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD']
  },
  forex_cross: {
    name: 'Cross Forex Pairs',
    symbols: ['EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURCHF', 'GBPCHF']
  },
  indices: {
    name: 'Major Indices',
    symbols: ['^GSPC', '^IXIC', '^DJI', 'ES=F', 'NQ=F', 'YM=F', 'RTY=F']
  },
  commodities: {
    name: 'Commodities & Futures',
    symbols: ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'PL=F', 'PA=F', 'BZ=F']
  }
};

const SYMBOL_DISPLAY_NAMES: Record<string, string> = {
  '^GSPC': 'SPX (S&P 500)', '^IXIC': 'NASDAQ Composite', '^DJI': 'Dow Jones',
  'ES=F': 'SPX500 Futures', 'NQ=F': 'NASDAQ Futures', 'YM=F': 'Dow Futures', 'RTY=F': 'Russell 2000',
  'AAPL': 'Apple', 'TSLA': 'Tesla', 'AMZN': 'Amazon', 'MSFT': 'Microsoft',
  'NVDA': 'NVIDIA', 'GOOGL': 'Google', 'META': 'Meta', 'NFLX': 'Netflix',
  'AMD': 'AMD', 'SPY': 'S&P ETF', 'QQQ': 'NASDAQ ETF', 'COIN': 'Coinbase',
  'PLTR': 'Palantir', 'UBER': 'Uber', 'SHOP': 'Shopify',
  'BITF': 'Bitfarms', 'NIO': 'NIO Inc', 'SOUN': 'SoundHound AI',
  'MARA': 'Marathon Digital', 'RIOT': 'Riot Platforms', 'SOFI': 'SoFi Technologies',
  'LCID': 'Lucid Group', 'RIVN': 'Rivian', 'HOOD': 'Robinhood', 'AMC': 'AMC Entertainment',
  'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'SOL-USD': 'Solana',
  'XRP-USD': 'XRP', 'ADA-USD': 'Cardano', 'DOGE-USD': 'Dogecoin',
  'DOT-USD': 'Polkadot', 'MATIC-USD': 'Polygon', 'LINK-USD': 'Chainlink',
  'AVAX-USD': 'Avalanche', 'SHIB-USD': 'Shiba Inu', 'LTC-USD': 'Litecoin',
  'EURUSD': 'EUR/USD', 'GBPUSD': 'GBP/USD', 'USDJPY': 'USD/JPY',
  'AUDUSD': 'AUD/USD', 'USDCAD': 'USD/CAD', 'USDCHF': 'USD/CHF', 'NZDUSD': 'NZD/USD',
  'EURGBP': 'EUR/GBP', 'EURJPY': 'EUR/JPY', 'GBPJPY': 'GBP/JPY',
  'AUDJPY': 'AUD/JPY', 'EURAUD': 'EUR/AUD', 'EURCHF': 'EUR/CHF', 'GBPCHF': 'GBP/CHF',
  'GC=F': 'Gold', 'SI=F': 'Silver', 'CL=F': 'Crude Oil',
  'NG=F': 'Natural Gas', 'PL=F': 'Platinum', 'PA=F': 'Palladium', 'BZ=F': 'Brent Oil'
};

const getAllSymbols = (): string[] => {
  return Object.values(ASSET_CATEGORIES).flatMap(cat => cat.symbols);
};

const getSymbolsByCategory = (category: string): string[] => {
  const cat = ASSET_CATEGORIES[category as keyof typeof ASSET_CATEGORIES];
  return cat ? cat.symbols : getAllSymbols();
};

router.get('/categories', (_req, res) => {
  const categories = Object.entries(ASSET_CATEGORIES).map(([key, value]) => ({
    id: key,
    name: value.name,
    symbolCount: value.symbols.length,
    symbols: value.symbols.map(s => ({
      symbol: s,
      displayName: SYMBOL_DISPLAY_NAMES[s] || s
    }))
  }));
  
  res.json({
    categories,
    totalAssets: getAllSymbols().length,
    displayNames: SYMBOL_DISPLAY_NAMES
  });
});

router.get('/scan', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '5m';
    const category = req.query.category as string;
    
    let symbols: string[];
    if (req.query.symbols) {
      symbols = (req.query.symbols as string).split(',');
    } else if (category && category !== 'all') {
      symbols = getSymbolsByCategory(category);
    } else {
      symbols = getAllSymbols();
    }
    
    console.log(`🔥 Secret Sauce scan: ${symbols.length} assets on ${timeframe} (category: ${category || 'all'})`);
    
    const signals = await secretSauceService.scanMultipleAssets(symbols, timeframe, category || 'all');
    
    const signalsWithDisplayNames = signals.map(s => ({
      ...s,
      displayName: SYMBOL_DISPLAY_NAMES[s.symbol] || s.symbol
    }));
    
    const activeSignals = signalsWithDisplayNames.filter(s => s.signalType !== 'NO_SIGNAL');
    const longSignals = signalsWithDisplayNames.filter(s => s.signalType.includes('LONG'));
    const shortSignals = signalsWithDisplayNames.filter(s => s.signalType.includes('SHORT'));
    const iccSignals = signalsWithDisplayNames.filter(s => s.signalType.includes('ICC'));
    const fvgFillSignals = signalsWithDisplayNames.filter(s => s.signalType.includes('WICK_FILL'));
    const orbSignals = signalsWithDisplayNames.filter(s => s.signalType.includes('ORB'));
    
    res.json({
      timestamp: new Date().toISOString(),
      timeframe,
      category: category || 'all',
      dataSource: 'Yahoo Finance Real-Time + 5-Gate Confluence',
      summary: {
        totalScanned: signalsWithDisplayNames.length,
        activeSignals: activeSignals.length,
        longSignals: longSignals.length,
        shortSignals: shortSignals.length,
        iccSignals: iccSignals.length,
        fvgFillSignals: fvgFillSignals.length,
        orbSignals: orbSignals.length
      },
      topSignals: activeSignals.slice(0, 5),
      allSignals: signalsWithDisplayNames
    });
  } catch (error) {
    console.error('Secret Sauce scan error:', error);
    res.status(500).json({ error: 'Secret Sauce scan failed' });
  }
});

// 7-Gate Liquidity & S/D Validation for Secret Sauce
router.get('/7-gate/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) || '5m';
    const assetClass = (req.query.assetClass as string) || 'stocks';

    const validation = await supplyDemandService.validate7GateSystem(symbol, timeframe, assetClass);
    res.json({ success: true, ...validation });
  } catch (error) {
    console.error('Secret Sauce 7-Gate validation error:', error);
    res.status(500).json({ success: false, error: 'Failed to validate 7-Gate system' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) || '5m';
    
    console.log(`🔥 Analyzing ${symbol} with Secret Sauce (${timeframe})`);
    
    const signal = await secretSauceService.analyzeAsset(symbol.toUpperCase(), timeframe);
    
    if (!signal) {
      return res.status(404).json({ error: `No data available for ${symbol}` });
    }
    
    let predictive: PredictiveSnapshot | null = null;
    try {
      const candles = await fetchYahooCandles(symbol.toUpperCase(), '15m', '5d');
      if (candles.length >= 10) {
        predictive = await predictiveSignalEngine.generatePredictiveSnapshot(symbol.toUpperCase(), candles);
      }
    } catch (e) {}
    
    res.json({
      ...signal,
      displayName: SYMBOL_DISPLAY_NAMES[symbol.toUpperCase()] || symbol.toUpperCase(),
      predictive: predictive ? {
        neuralIndex: predictive.neuralIndex.direction,
        neuralConfidence: predictive.neuralIndex.confidence,
        completeAgreement: predictive.neuralIndex.completeAgreement,
        doubleConfirmed: predictive.doubleConfirmation.confirmed,
        doubleConfirmationScore: predictive.doubleConfirmation.score,
        predictedHigh: predictive.predictedRange.predictedHigh,
        predictedLow: predictive.predictedRange.predictedLow,
        maCrossover: predictive.predictedMAs.crossovers.shortMediumCross,
        trendStrength: predictive.trendStrength.overallStrength,
        overallSignal: predictive.overallSignal,
        liquiditySweep: {
          status: predictive.liquiditySweep.status,
          gate1Passed: predictive.liquiditySweep.gate1Passed,
          gate2Passed: predictive.liquiditySweep.gate2Passed,
          gate3Passed: predictive.liquiditySweep.gate3Passed,
          swingLow: predictive.liquiditySweep.swingLow,
          volumeMultiplier: predictive.liquiditySweep.volumeMultiplier,
          isConsolidating: predictive.liquiditySweep.isConsolidating,
          isWeakSweep: predictive.liquiditySweep.isWeakSweep,
          targetFVG: predictive.liquiditySweep.targetFVG,
          reasons: predictive.liquiditySweep.reasons
        },
        zeroLag: predictive.zeroLag,
        orderFlow: predictive.orderFlow,
        regime: predictive.regime,
        advanced: predictive.advanced
      } : null
    });
  } catch (error) {
    console.error('Secret Sauce analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

async function fetchYahooCandles(symbol: string, interval: string, range: string): Promise<{ time: number; open: number; high: number; low: number; close: number; volume: number }[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result?.timestamp) return [];
    const { timestamp, indicators } = result;
    const quote = indicators?.quote?.[0];
    if (!quote) return [];
    return timestamp.map((time: number, i: number) => ({
      time: time * 1000,
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0
    })).filter((c: any) => c.open > 0 && c.close > 0);
  } catch (e) {
    return [];
  }
}

// Trend Strength Engine - Liquidity Sweep Priority
router.get('/trend-strength/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) || '5m';
    
    const candles = await secretSauceService.fetchCandleData(symbol, timeframe);
    if (!candles || candles.length < 50) {
      return res.json({ 
        success: false, 
        error: 'Insufficient data',
        trendStrength: { value: 0, direction: 'neutral', sweepDetected: false, sweepType: null, adx: 0, adxRising: false, rsi: 50, emaCross: 'none', intensity: 0 }
      });
    }
    
    const trendStrength = secretSauceService.calculateTrendStrength(candles);
    
    res.json({
      success: true,
      symbol,
      timeframe,
      trendStrength,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trend strength calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate trend strength',
      trendStrength: { value: 0, direction: 'neutral', sweepDetected: false, sweepType: null, adx: 0, adxRising: false, rsi: 50, emaCross: 'none', intensity: 0 }
    });
  }
});

// Smart algorithmic trend explanation engine for Secret Sauce Strategy
router.post('/explain', async (req, res) => {
  try {
    const { signal } = req.body;

    if (!signal || !signal.symbol) {
      return res.status(400).json({ success: false, error: 'Missing signal data' });
    }

    const analysis = generateSecretSauceAnalysis(signal);

    res.json({
      success: true,
      explanation: analysis.explanation,
      summary: analysis.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Secret Sauce analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate analysis' });
  }
});

interface SecretSauceSignalData {
  symbol: string;
  displayName: string;
  assetClass: string;
  signalType: string;
  signalStrength: number;
  confluenceScore: number;
  maxScore: number;
  fiveGates: {
    gate1_emaStack: boolean;
    gate2_adx: boolean;
    gate3_macdCrossover: boolean;
    gate4_price50EMA: boolean;
    gate5_rvol: boolean;
    gatesPassed: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    details: {
      ema8: number;
      ema18: number;
      ema50: number;
      adx: number;
      macdLine: number;
      macdSignal: number;
      macdCrossover: 'bullish' | 'bearish' | 'none';
      currentPrice: number;
      rvol: number;
    };
  };
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  reasoning: string[];
  indicators: {
    rsi: number;
    atr: number;
    ema8: number;
    ema18: number;
    ema50: number;
    adx: number;
    macdLine: number;
    macdSignal: number;
    macdHistogram: number;
    rvol: number;
  };
  timeframe: string;
  predictive?: any;
}

function generateSecretSauceAnalysis(signal: SecretSauceSignalData) {
  const { fiveGates, indicators, signalType, signalStrength, entryPrice, stopLoss, target1, target2, riskRewardRatio, reasoning } = signal;
  
  const isActive = signalType !== 'NO_SIGNAL';
  const isLong = signalType.includes('LONG');
  const isICC = signalType.includes('ICC');
  const isWickFill = signalType.includes('WICK_FILL');
  const isORB = signalType.includes('ORB');
  
  // Calculate institutional footprint metrics
  const gateScore = (fiveGates.gatesPassed / 5) * 100;
  const trendScore = calculateTrendScore(signal);
  const institutionalBias = determineInstitutionalBias(signal);
  
  // Build comprehensive explanation
  let explanation = '';
  
  // SECTION 1: TREND ASSESSMENT
  explanation += `## TREND ASSESSMENT\n\n`;
  explanation += `**${signal.displayName} (${signal.symbol})** - ${signal.timeframe} Analysis\n\n`;
  
  if (isActive) {
    const signalLabel = isLong ? 'BULLISH' : 'BEARISH';
    const setupType = isICC ? 'ICC (Indication-Correction-Continuation)' : isWickFill ? 'Wick Fill' : isORB ? 'Opening Range Breakout' : 'Confluence';
    explanation += `**Current Signal: ${signalLabel} via ${setupType}**\n\n`;
    explanation += `The market structure shows ${fiveGates.gatesPassed} of 5 confluence gates aligned in the ${fiveGates.direction} direction. `;
    
    if (fiveGates.gatesPassed >= 4) {
      explanation += `This represents a HIGH-PROBABILITY setup with strong institutional footprint. Smart money appears to be actively positioning ${isLong ? 'long' : 'short'}.\n\n`;
    } else if (fiveGates.gatesPassed >= 3) {
      explanation += `This is a MODERATE-PROBABILITY setup. Watch for additional confirmation before committing full size.\n\n`;
    } else {
      explanation += `Confluence is weak. Consider waiting for more gates to align before entry.\n\n`;
    }
  } else {
    explanation += `**No Active Signal Detected**\n\n`;
    explanation += `Current market structure shows ${fiveGates.direction} bias with ${fiveGates.gatesPassed}/5 gates aligned. `;
    explanation += `The Law of Supply and Demand requires clear institutional footprints - wait for displacement candles or zone retests before entering.\n\n`;
  }
  
  // SECTION 2: 5-GATE CONFLUENCE ANALYSIS
  explanation += `## 5-GATE CONFLUENCE BREAKDOWN\n\n`;
  explanation += `The 5-Gate system identifies institutional activity through multiple technical confirmations:\n\n`;
  
  // Gate 1: EMA Stack
  explanation += `**Gate 1 - EMA Stack (8/18/50): ${fiveGates.gate1_emaStack ? '✅ PASSED' : '❌ FAILED'}**\n`;
  if (fiveGates.gate1_emaStack) {
    const emaOrder = fiveGates.details.ema8 > fiveGates.details.ema18 && fiveGates.details.ema18 > fiveGates.details.ema50 ? 'bullish' : 'bearish';
    explanation += `EMAs are properly stacked in ${emaOrder} formation (${fiveGates.details.ema8.toFixed(2)} > ${fiveGates.details.ema18.toFixed(2)} > ${fiveGates.details.ema50.toFixed(2)}). `;
    explanation += `This indicates trending momentum with institutional participation.\n\n`;
  } else {
    explanation += `EMA stack is not aligned. Price action is choppy or transitioning between trends. `;
    explanation += `Current values: EMA8=${fiveGates.details.ema8.toFixed(2)}, EMA18=${fiveGates.details.ema18.toFixed(2)}, EMA50=${fiveGates.details.ema50.toFixed(2)}.\n\n`;
  }
  
  // Gate 2: ADX Trend Strength
  explanation += `**Gate 2 - ADX Trend Strength (>25): ${fiveGates.gate2_adx ? '✅ PASSED' : '❌ FAILED'}**\n`;
  explanation += `ADX currently at ${indicators.adx.toFixed(1)}. `;
  if (fiveGates.gate2_adx) {
    explanation += `Strong trending conditions detected. ADX above 25 confirms institutional momentum is present.\n\n`;
  } else {
    explanation += `ADX below 25 indicates weak trend or consolidation. Wait for trend strength to develop before entering momentum trades.\n\n`;
  }
  
  // Gate 3: MACD Crossover
  explanation += `**Gate 3 - MACD Crossover: ${fiveGates.gate3_macdCrossover ? '✅ PASSED' : '❌ FAILED'}**\n`;
  const macdStatus = fiveGates.details.macdCrossover;
  if (fiveGates.gate3_macdCrossover) {
    explanation += `MACD shows ${macdStatus} crossover (Line: ${fiveGates.details.macdLine.toFixed(4)}, Signal: ${fiveGates.details.macdSignal.toFixed(4)}). `;
    explanation += `Momentum is aligned with ${macdStatus === 'bullish' ? 'buyers' : 'sellers'}.\n\n`;
  } else {
    explanation += `No clear MACD crossover detected. Histogram: ${indicators.macdHistogram.toFixed(4)}. Wait for momentum confirmation.\n\n`;
  }
  
  // Gate 4: Price vs 50 EMA
  explanation += `**Gate 4 - Price Position vs 50 EMA: ${fiveGates.gate4_price50EMA ? '✅ PASSED' : '❌ FAILED'}**\n`;
  const priceVs50 = ((fiveGates.details.currentPrice - fiveGates.details.ema50) / fiveGates.details.ema50 * 100).toFixed(2);
  if (fiveGates.gate4_price50EMA) {
    const position = parseFloat(priceVs50) > 0 ? 'above' : 'below';
    explanation += `Price is ${priceVs50}% ${position} the 50 EMA, confirming ${parseFloat(priceVs50) > 0 ? 'bullish' : 'bearish'} structure. `;
    explanation += `The 50 EMA acts as a dynamic support/resistance level monitored by institutional traders.\n\n`;
  } else {
    explanation += `Price is near the 50 EMA (${priceVs50}%). This often precedes a breakout or breakdown. Watch for clear directional commitment.\n\n`;
  }
  
  // Gate 5: Relative Volume
  explanation += `**Gate 5 - RVOL (>1.5x): ${fiveGates.gate5_rvol ? '✅ PASSED' : '❌ FAILED'}**\n`;
  if (fiveGates.gate5_rvol) {
    explanation += `Relative volume at ${indicators.rvol.toFixed(2)}x average. HIGH VOLUME confirms institutional participation. `;
    explanation += `Smart money leaves volume footprints when accumulating or distributing positions.\n\n`;
  } else {
    explanation += `Volume at ${indicators.rvol.toFixed(2)}x is below threshold. Low volume moves may be retail-driven and prone to reversal.\n\n`;
  }
  
  // SECTION 3: IMPULSE VALIDATION
  explanation += `## IMPULSE VALIDATION\n\n`;
  explanation += `Supply and demand zones represent "footprints" of institutional players whose aggressive orders trigger reversals.\n\n`;
  
  if (isICC) {
    explanation += `**ICC Setup Detected:**\n`;
    explanation += `- Displacement candle identified (3x+ average body size)\n`;
    explanation += `- Fair Value Gap created during impulse move\n`;
    explanation += `- Slow correction retracing into the FVG zone\n`;
    explanation += `- This pattern indicates unfilled institutional orders waiting at the FVG level\n\n`;
  } else if (isWickFill) {
    explanation += `**Wick Fill Setup Detected:**\n`;
    explanation += `- Significant rejection wick (>=50% of candle range) identified\n`;
    explanation += `- Price returning to fill the wick zone\n`;
    explanation += `- Wicks represent aggressive rejection where smart money defended a level\n`;
    explanation += `- High probability of bounce when price retests the wick zone\n\n`;
  } else if (isORB) {
    explanation += `**Opening Range Breakout Detected:**\n`;
    explanation += `- First 15-minute range established\n`;
    explanation += `- Candle closed ${isLong ? 'above' : 'below'} the range boundary\n`;
    explanation += `- Breakout confirmed with ${fiveGates.gatesPassed}/5 gates aligned\n`;
    explanation += `- Opening range captures the battle between overnight orders and new participants\n\n`;
  } else {
    explanation += `No specific setup pattern detected. Watch for:\n`;
    explanation += `- Displacement candles (3x average body) for ICC entries\n`;
    explanation += `- Large rejection wicks (>50% of candle) for wick fill entries\n`;
    explanation += `- Range breakouts during first 15 minutes for ORB entries\n\n`;
  }
  
  // SECTION 4: CURRENT PRICE POSITION & TRADE SETUP
  explanation += `## CURRENT PRICE POSITION\n\n`;
  explanation += `**Current Price:** $${fiveGates.details.currentPrice.toFixed(2)}\n`;
  explanation += `**RSI:** ${indicators.rsi.toFixed(0)} (${indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral'})\n`;
  explanation += `**ATR:** $${indicators.atr.toFixed(2)} (Volatility measure)\n\n`;
  
  if (isActive) {
    explanation += `**Trade Setup:**\n`;
    explanation += `- Entry: $${entryPrice.toFixed(2)}\n`;
    explanation += `- Stop Loss: $${stopLoss.toFixed(2)} (${((Math.abs(entryPrice - stopLoss) / entryPrice) * 100).toFixed(2)}% risk)\n`;
    explanation += `- Target 1: $${target1.toFixed(2)} (${((Math.abs(target1 - entryPrice) / entryPrice) * 100).toFixed(2)}% gain)\n`;
    explanation += `- Target 2: $${target2.toFixed(2)} (${((Math.abs(target2 - entryPrice) / entryPrice) * 100).toFixed(2)}% gain)\n`;
    explanation += `- Risk/Reward: ${riskRewardRatio.toFixed(2)}:1\n\n`;
  }
  
  // SECTION 5: KEY LEVELS TO WATCH
  explanation += `## KEY LEVELS TO WATCH\n\n`;
  explanation += `**EMA Support/Resistance:**\n`;
  explanation += `- EMA 8 (Fast): $${fiveGates.details.ema8.toFixed(2)}\n`;
  explanation += `- EMA 18 (Medium): $${fiveGates.details.ema18.toFixed(2)}\n`;
  explanation += `- EMA 50 (Slow): $${fiveGates.details.ema50.toFixed(2)}\n\n`;
  
  if (isActive) {
    explanation += `**Critical Levels:**\n`;
    explanation += `- Invalidation: ${isLong ? 'Below' : 'Above'} $${stopLoss.toFixed(2)} - EXIT if breached\n`;
    explanation += `- Profit Zone: $${target1.toFixed(2)} to $${target2.toFixed(2)}\n\n`;
  }
  
  // SECTION 6: TRADE BIAS & REASONING
  explanation += `## TRADE BIAS & REASONING\n\n`;
  
  if (isActive) {
    const biasLabel = isLong ? 'BULLISH' : 'BEARISH';
    explanation += `**${biasLabel} BIAS** - Signal Strength: ${signalStrength.toFixed(1)}/10\n\n`;
    
    explanation += `**Why this trend exists (Law of Supply & Demand):**\n`;
    if (isLong) {
      explanation += `When demand exceeds supply, prices rally. The current setup shows institutional buying pressure with ${fiveGates.gatesPassed}/5 gates confirming bullish momentum. `;
      explanation += `Fresh demand zones below price provide support where unfilled buy orders remain.\n\n`;
    } else {
      explanation += `When supply exceeds demand, prices fall. The current setup shows institutional selling pressure with ${fiveGates.gatesPassed}/5 gates confirming bearish momentum. `;
      explanation += `Supply zones above act as "ceilings" where surplus sell orders are concentrated.\n\n`;
    }
    
    explanation += `**Signal Reasoning:**\n`;
    reasoning.forEach((r, i) => {
      explanation += `${i + 1}. ${r}\n`;
    });
    explanation += `\n`;
  } else {
    explanation += `**NEUTRAL BIAS** - No clear signal detected\n\n`;
    explanation += `The market is in a consolidation or transition phase. According to the Law of Supply and Demand:\n`;
    explanation += `- Wait for clear displacement (impulse) to form new zones\n`;
    explanation += `- Fresh zones have higher probability than retested zones\n`;
    explanation += `- Require 4+ gates aligned before considering entry\n\n`;
  }
  
  // Exit Rules
  explanation += `**Exit Rules:**\n`;
  explanation += `- 2+ Gates flip against position → EXIT immediately\n`;
  explanation += `- Opposing signal appears → EXIT\n`;
  explanation += `- 15 candles without Target 1 → EXIT (stale trade)\n`;
  explanation += `- Hard stop hit → EXIT (no exceptions)\n\n`;
  
  explanation += `*This analysis uses institutional supply/demand methodology. Always use proper risk management and confirm with price action.*`;

  return {
    explanation,
    summary: {
      trend: isActive ? (isLong ? 'Bullish' : 'Bearish') : 'Neutral',
      trendScore,
      signalType: signalType,
      gatesPassed: fiveGates.gatesPassed,
      direction: fiveGates.direction,
      signalStrength: signalStrength.toFixed(1),
      institutionalBias,
      gateDetails: {
        emaStack: fiveGates.gate1_emaStack,
        adxStrong: fiveGates.gate2_adx,
        macdConfirmed: fiveGates.gate3_macdCrossover,
        priceAbove50EMA: fiveGates.gate4_price50EMA,
        highVolume: fiveGates.gate5_rvol
      },
      keyMetrics: {
        rsi: indicators.rsi.toFixed(0),
        adx: indicators.adx.toFixed(1),
        rvol: indicators.rvol.toFixed(2),
        riskReward: riskRewardRatio.toFixed(2)
      }
    }
  };
}

function calculateTrendScore(signal: SecretSauceSignalData): number {
  let score = 50; // Neutral baseline
  
  const { fiveGates, indicators, signalType } = signal;
  
  // Factor 1: Gates passed (up to ±25 points)
  const gateImpact = (fiveGates.gatesPassed - 2.5) * 10;
  score += gateImpact;
  
  // Factor 2: Signal type (±15 points)
  if (signalType.includes('LONG')) score += 15;
  else if (signalType.includes('SHORT')) score -= 15;
  
  // Factor 3: RSI extremes (±10 points)
  if (indicators.rsi < 30) score += 10;
  else if (indicators.rsi > 70) score -= 10;
  
  // Factor 4: ADX strength (±5 points)
  if (indicators.adx > 30) score += 5;
  else if (indicators.adx < 20) score -= 5;
  
  // Factor 5: Volume confirmation (±5 points)
  if (indicators.rvol > 2) score += 5;
  else if (indicators.rvol < 1) score -= 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function determineInstitutionalBias(signal: SecretSauceSignalData): 'bullish' | 'bearish' | 'neutral' {
  const { fiveGates, signalType, signalStrength } = signal;
  
  if (signalType.includes('LONG') && fiveGates.gatesPassed >= 3) return 'bullish';
  if (signalType.includes('SHORT') && fiveGates.gatesPassed >= 3) return 'bearish';
  if (fiveGates.direction !== 'neutral' && fiveGates.gatesPassed >= 3) return fiveGates.direction;
  
  return 'neutral';
}

router.get('/examples', (_req, res) => {
  res.json({
    examples: [
      {
        name: 'ICC Long Setup Example',
        description: 'Bullish displacement with FVG and slow correction',
        criteria: [
          'Displacement candle: 3x+ average body size (bullish)',
          'FVG created between candle 1 high and candle 3 low',
          'Slow correction: 3+ candles retracing into FVG',
          'Current price in FVG zone',
          '4+ Gates confirmed (bullish)'
        ],
        entry: 'At FVG zone rejection',
        stop: 'Below FVG low - 0.5 ATR',
        target1: 'Entry + 1.5 ATR',
        target2: 'Entry + 2.5 ATR'
      },
      {
        name: 'Wick Fill Long Setup',
        description: 'Price returning to 50%+ wick rejection zone',
        criteria: [
          'Candle with lower wick >= 50% of total range',
          'Price returns to wick zone (above wick low, below body)',
          'Rejection candle forming',
          '3+ Gates confirmed'
        ],
        entry: 'At wick zone with rejection',
        stop: 'Below wick extreme - 0.3 ATR',
        target1: 'Entry + 1.5 ATR',
        target2: 'Entry + 2 ATR'
      },
      {
        name: 'ORB Breakout Example',
        description: 'Opening Range Breakout with confluence',
        criteria: [
          '15-min range established (9:30-9:45 or last 15 candles)',
          'Candle closes above range high (bullish) or below range low (bearish)',
          '3+ Gates confirmed in breakout direction'
        ],
        entry: 'On breakout candle close',
        stop: 'Opposite side of range - 0.3 ATR',
        target1: 'Entry + 1x range size',
        target2: 'Entry + 2x range size'
      }
    ],
    exitRules: [
      '2+ Gates flip against position → EXIT',
      'Opposing Secret Sauce signal appears → EXIT',
      '15 candles without Target 1 → EXIT (stale trade)',
      'Hard stop hit → EXIT (no exceptions)',
      '3 consecutive losses → STOP trading session'
    ]
  });
});

export default router;
