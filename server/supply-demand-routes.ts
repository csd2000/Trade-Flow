import { Router } from 'express';
import { supplyDemandService } from './supply-demand-service';
import { institutionalDataService } from './institutional-data-service';
import { darkPoolAIService } from './dark-pool-ai-service';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

router.get('/scan', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'AAPL';
    const timeframe = (req.query.timeframe as string) || '15m';
    const assetClass = (req.query.assetClass as string) || 'stocks';
    const includeCandles = req.query.includeCandles === 'true';

    const result = await supplyDemandService.scanAssetWithCandles(symbol, timeframe, assetClass, includeCandles);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Supply/Demand scan error:', error);
    res.status(500).json({ success: false, error: 'Failed to scan asset' });
  }
});

router.get('/multi-timeframe', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'AAPL';
    const timeframesParam = (req.query.timeframes as string) || '5m,15m,1h';
    const assetClass = (req.query.assetClass as string) || 'stocks';
    
    const timeframes = timeframesParam.split(',').map(tf => tf.trim());

    const result = await supplyDemandService.scanMultiTimeframe(symbol, timeframes, assetClass);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Multi-timeframe scan error:', error);
    res.status(500).json({ success: false, error: 'Failed to scan multiple timeframes' });
  }
});

router.post('/scan-multiple', async (req, res) => {
  try {
    const { symbols, timeframe = '15m', assetClass = 'stocks' } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ success: false, error: 'Symbols array required' });
    }

    const results = await supplyDemandService.scanMultipleAssets(symbols, timeframe, assetClass);
    res.json({ 
      success: true, 
      results,
      scannedCount: results.length,
      withActiveZones: results.filter(r => r.zones.filter(z => !z.broken).length > 0).length,
      inZone: results.filter(r => r.inZone).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Multi-asset scan error:', error);
    res.status(500).json({ success: false, error: 'Failed to scan multiple assets' });
  }
});

// 7-Gate Liquidity & S/D Validation System
router.get('/7-gate/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) || '15m';
    const assetClass = (req.query.assetClass as string) || 'stocks';

    const validation = await supplyDemandService.validate7GateSystem(symbol, timeframe, assetClass);
    res.json({ success: true, ...validation });
  } catch (error) {
    console.error('7-Gate validation error:', error);
    res.status(500).json({ success: false, error: 'Failed to validate 7-Gate system' });
  }
});

// Scan multiple assets with 7-Gate validation
router.get('/7-gate-scan', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '15m';
    const assetClass = (req.query.assetClass as string) || 'stocks';
    
    const assetLists: { [key: string]: string[] } = {
      stocks: ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMD', 'META', 'GOOGL', 'AMZN'],
      crypto: ['BTC', 'ETH', 'SOL'],
      forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
      all: ['SPY', 'QQQ', 'AAPL', 'NVDA', 'TSLA', 'BTC', 'ETH']
    };

    const symbols = assetLists[assetClass] || assetLists.stocks;
    
    const validations = await Promise.allSettled(
      symbols.map(symbol => supplyDemandService.validate7GateSystem(symbol, timeframe, assetClass))
    );

    const results = validations
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value)
      .sort((a, b) => b.gatesPassed - a.gatesPassed);

    const summary = {
      totalScanned: results.length,
      fullSignals: results.filter(r => r.allGatesPassed).length,
      activeSignals: results.filter(r => r.signalActive).length,
      bullish: results.filter(r => r.direction === 'bullish').length,
      bearish: results.filter(r => r.direction === 'bearish').length
    };

    res.json({ 
      success: true, 
      results,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('7-Gate scan error:', error);
    res.status(500).json({ success: false, error: 'Failed to run 7-Gate scan' });
  }
});

router.get('/test-assets', (_req, res) => {
  const testAssets = {
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'SPY', 'QQQ', 'IWM'],
    crypto: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC'],
    forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURGBP'],
    indices: ['SPX', 'NDX', 'DJI', 'RUT', 'VIX']
  };
  
  res.json({ success: true, assets: testAssets, totalAssets: Object.values(testAssets).flat().length });
});

router.get('/scan-all', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '15m';
    const assetClass = (req.query.assetClass as string) || 'stocks';
    
    const assetLists: { [key: string]: string[] } = {
      stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'SPY'],
      crypto: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'],
      forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
      all: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'BTC', 'ETH', 'SPY', 'QQQ']
    };

    const symbols = assetLists[assetClass] || assetLists.stocks;
    const results = await supplyDemandService.scanMultipleAssets(symbols, timeframe, assetClass);

    const summary = {
      totalScanned: results.length,
      withSupplyZones: results.filter(r => r.zones.some(z => z.type === 'supply' && !z.broken)).length,
      withDemandZones: results.filter(r => r.zones.some(z => z.type === 'demand' && !z.broken)).length,
      inZone: results.filter(r => r.inZone).length,
      nearZone: results.filter(r => r.nearestSupply || r.nearestDemand).length
    };

    res.json({ 
      success: true, 
      results,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scan all error:', error);
    res.status(500).json({ success: false, error: 'Failed to scan all assets' });
  }
});

// Comprehensive Institutional Breakdown - aggregates all institutional data for a symbol
router.get('/institutional-breakdown/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    // Fetch all institutional data in parallel
    const [quote, flows, darkPoolSummary, darkPoolAnalysis] = await Promise.all([
      institutionalDataService.getInstitutionalQuote(upperSymbol).catch(() => null),
      institutionalDataService.getInstitutionalFlows(upperSymbol).catch(() => null),
      darkPoolAIService.getDarkPoolSummary(upperSymbol).catch(() => null),
      darkPoolAIService.analyzeInstitutionalActivity(upperSymbol).catch(() => null)
    ]);

    // Calculate institutional metrics
    const institutionalScore = calculateInstitutionalScore(flows, darkPoolSummary, darkPoolAnalysis);
    
    // Generate AI-powered comprehensive breakdown
    let aiBreakdown = null;
    if (anthropic) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `You are an elite institutional trading analyst. Provide a comprehensive breakdown of institutional activity for ${upperSymbol}.

DATA:
- Quote: Price $${quote?.price || 'N/A'}, Change ${quote?.changePercent?.toFixed(2) || 'N/A'}%
- Volume: ${quote?.volume?.toLocaleString() || 'N/A'} (Avg: ${quote?.avgVolume?.toLocaleString() || 'N/A'})
- Institutional Ownership: ${flows?.institutionalOwnership || 'N/A'}%
- Insider Ownership: ${flows?.insiderOwnership || 'N/A'}%
- Short Interest: ${flows?.shortInterest || 'N/A'}% (Days to Cover: ${flows?.shortRatio || 'N/A'})
- Dark Pool Volume: ${darkPoolSummary?.totalDarkPoolVolume?.toLocaleString() || 'N/A'} (${darkPoolSummary?.darkPoolPercent?.toFixed(1) || 'N/A'}% of total)
- Block Trades: ${darkPoolSummary?.blockTradeCount || 'N/A'}
- Options Flow: ${flows?.optionsFlow || 'N/A'}
- AI Signal: ${darkPoolAnalysis?.signalType || 'N/A'} (${darkPoolAnalysis?.confidence || 'N/A'}% confidence)

Provide:
1. **INSTITUTIONAL VERDICT**: One-line summary (ACCUMULATION/DISTRIBUTION/NEUTRAL)
2. **KEY FINDINGS**: 3-4 bullet points on what institutions are doing
3. **DARK POOL ANALYSIS**: What the off-exchange activity reveals
4. **OPTIONS FLOW INTERPRETATION**: What smart money is betting on
5. **SHORT INTEREST CONTEXT**: Is there squeeze potential or distribution?
6. **ACTIONABLE INSIGHT**: What this means for traders

Be direct, data-driven, and specific. Use trading terminology.`
          }]
        });
        // Validate AI response has content before using
        if (response.content && response.content.length > 0 && response.content[0].type === 'text') {
          aiBreakdown = (response.content[0] as any).text;
        }
      } catch (aiError) {
        console.error('AI breakdown error:', aiError);
      }
    }

    // Fallback breakdown if AI unavailable or returned empty
    const breakdown = (aiBreakdown && aiBreakdown.trim().length > 0) 
      ? aiBreakdown 
      : generateAlgorithmicBreakdown(upperSymbol, quote, flows, darkPoolSummary, darkPoolAnalysis);

    res.json({
      success: true,
      symbol: upperSymbol,
      timestamp: new Date().toISOString(),
      quote,
      institutionalFlows: flows,
      darkPool: {
        summary: darkPoolSummary,
        analysis: darkPoolAnalysis
      },
      metrics: {
        institutionalScore,
        signalStrength: darkPoolAnalysis?.confidence || 0,
        bias: darkPoolAnalysis?.institutionalBias || 'neutral',
        activity: (darkPoolSummary?.darkPoolPercent ?? 0) > 40 ? 'high' : (darkPoolSummary?.darkPoolPercent ?? 0) > 20 ? 'medium' : 'low'
      },
      breakdown
    });
  } catch (error) {
    console.error('Institutional breakdown error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate institutional breakdown' });
  }
});

function calculateInstitutionalScore(flows: any, darkPool: any, analysis: any): number {
  let score = 50;
  
  if (flows) {
    if (flows.institutionalOwnership > 70) score += 15;
    else if (flows.institutionalOwnership > 50) score += 10;
    if (flows.shortInterest > 20) score -= 15;
    else if (flows.shortInterest < 5) score += 10;
    if (flows.optionsFlow === 'bullish') score += 10;
    else if (flows.optionsFlow === 'bearish') score -= 10;
  }
  
  if (darkPool) {
    if (darkPool.darkPoolPercent > 50) score += 10;
    if (darkPool.blockTradeCount > 10) score += 5;
    if (darkPool.priceImpact > 0) score += 5;
    else if (darkPool.priceImpact < 0) score -= 5;
  }
  
  if (analysis) {
    if (analysis.signalType === 'accumulation') score += 15;
    else if (analysis.signalType === 'distribution') score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

function generateAlgorithmicBreakdown(symbol: string, quote: any, flows: any, darkPool: any, analysis: any): string {
  const sections = [];
  
  // Institutional Verdict
  const signal = analysis?.signalType || 'neutral';
  const verdict = signal === 'accumulation' ? 'INSTITUTIONAL ACCUMULATION DETECTED' :
                  signal === 'distribution' ? 'INSTITUTIONAL DISTRIBUTION DETECTED' :
                  'NEUTRAL INSTITUTIONAL ACTIVITY';
  sections.push(`## INSTITUTIONAL VERDICT\n${verdict}`);
  
  // Key Findings
  const findings = [];
  if (flows?.institutionalOwnership > 60) findings.push(`High institutional ownership (${flows.institutionalOwnership}%) indicates strong professional interest`);
  if (darkPool?.darkPoolPercent > 40) findings.push(`Elevated dark pool activity (${darkPool.darkPoolPercent?.toFixed(1)}%) suggests large block positioning`);
  if (flows?.shortInterest > 15) findings.push(`Elevated short interest (${flows.shortInterest}%) - watch for squeeze or further decline`);
  if (flows?.optionsFlow) findings.push(`Options flow is ${flows.optionsFlow} - smart money positioning accordingly`);
  if (findings.length === 0) findings.push('Normal institutional activity levels observed');
  sections.push(`## KEY FINDINGS\n${findings.map(f => `- ${f}`).join('\n')}`);
  
  // Dark Pool Analysis
  if (darkPool) {
    sections.push(`## DARK POOL ANALYSIS\n- Total Dark Pool Volume: ${darkPool.totalDarkPoolVolume?.toLocaleString() || 'N/A'}\n- Dark Pool %: ${darkPool.darkPoolPercent?.toFixed(1) || 'N/A'}%\n- Block Trades: ${darkPool.blockTradeCount || 0}\n- Average Trade Size: ${darkPool.averageTradeSize?.toLocaleString() || 'N/A'} shares`);
  }
  
  // Options Flow
  if (flows?.optionsFlow) {
    const optionsInterpretation = flows.optionsFlow === 'bullish' ? 
      'Smart money is positioning for upside via call buying or put selling' :
      flows.optionsFlow === 'bearish' ? 
      'Smart money is hedging or positioning for downside via puts or call selling' :
      'Options flow shows no clear directional bias';
    sections.push(`## OPTIONS FLOW INTERPRETATION\n${optionsInterpretation}`);
  }
  
  // Actionable Insight
  const action = signal === 'accumulation' ? 
    `Consider LONG positions on pullbacks to support. Institutions are building positions in ${symbol}.` :
    signal === 'distribution' ?
    `Exercise CAUTION on longs. Institutions appear to be distributing ${symbol}. Watch for breakdown.` :
    `Monitor for clearer signals. No strong institutional bias detected in ${symbol}.`;
  sections.push(`## ACTIONABLE INSIGHT\n${action}`);
  
  return sections.join('\n\n');
}

// Smart algorithmic trend explanation engine - no external API needed
router.post('/explain', async (req, res) => {
  try {
    const { symbol, currentPrice, zones, inZone, zoneType, nearestSupply, nearestDemand, timeframe, assetClass, gateDirection, candles } = req.body;

    if (!symbol || !currentPrice || !zones) {
      return res.status(400).json({ success: false, error: 'Missing required scan data' });
    }

    const activeSupplyZones = zones.filter((z: any) => z.type === 'supply' && !z.broken);
    const activeDemandZones = zones.filter((z: any) => z.type === 'demand' && !z.broken);
    
    // Calculate zone metrics
    const priceVsSupply = nearestSupply ? ((nearestSupply.bottomPrice - currentPrice) / currentPrice * 100) : null;
    const priceVsDemand = nearestDemand ? ((currentPrice - nearestDemand.topPrice) / currentPrice * 100) : null;
    
    // Calculate real price momentum from candle data
    let priceMomentum: number | null = null;
    let shortTermTrend: 'bullish' | 'bearish' | 'neutral' | null = null;
    let mediumTermTrend: 'bullish' | 'bearish' | 'neutral' | null = null;
    
    if (candles && candles.length >= 20) {
      const recentCandles = candles.slice(-20);
      const oldest = recentCandles[0];
      const latest = recentCandles[recentCandles.length - 1];
      
      // Calculate percentage change over last 20 candles
      priceMomentum = ((latest.close - oldest.close) / oldest.close) * 100;
      
      // Calculate short-term trend (5-period vs 10-period SMA)
      const last5 = recentCandles.slice(-5);
      const last10 = recentCandles.slice(-10);
      const sma5 = last5.reduce((sum: number, c: any) => sum + c.close, 0) / 5;
      const sma10 = last10.reduce((sum: number, c: any) => sum + c.close, 0) / 10;
      shortTermTrend = sma5 > sma10 ? 'bullish' : sma5 < sma10 ? 'bearish' : 'neutral';
      
      // Calculate medium-term trend (10-period vs 20-period SMA)
      const sma20 = recentCandles.reduce((sum: number, c: any) => sum + c.close, 0) / 20;
      mediumTermTrend = sma10 > sma20 ? 'bullish' : sma10 < sma20 ? 'bearish' : 'neutral';
    }
    
    // Generate comprehensive algorithmic analysis
    const analysis = generateSmartAnalysis({
      symbol,
      currentPrice,
      assetClass,
      timeframe,
      activeSupplyZones,
      activeDemandZones,
      inZone,
      zoneType,
      nearestSupply,
      nearestDemand,
      priceVsSupply,
      priceVsDemand,
      gateDirection,
      priceMomentum,
      shortTermTrend,
      mediumTermTrend
    });

    res.json({
      success: true,
      explanation: analysis.explanation,
      summary: analysis.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate analysis' });
  }
});

interface AnalysisInput {
  symbol: string;
  currentPrice: number;
  assetClass: string;
  timeframe: string;
  activeSupplyZones: any[];
  activeDemandZones: any[];
  inZone: boolean;
  zoneType: string | null;
  nearestSupply: any;
  nearestDemand: any;
  gateDirection?: 'bullish' | 'bearish' | null;
  priceVsSupply: number | null;
  priceVsDemand: number | null;
  priceMomentum?: number | null;
  shortTermTrend?: 'bullish' | 'bearish' | 'neutral' | null;
  mediumTermTrend?: 'bullish' | 'bearish' | 'neutral' | null;
}

function generateSmartAnalysis(input: AnalysisInput) {
  const {
    symbol, currentPrice, assetClass, timeframe,
    activeSupplyZones, activeDemandZones,
    inZone, zoneType, nearestSupply, nearestDemand,
    priceVsSupply, priceVsDemand
  } = input;

  // Calculate institutional footprint scores
  const supplyStrengthAvg = activeSupplyZones.length > 0 
    ? activeSupplyZones.reduce((sum, z) => sum + z.strength, 0) / activeSupplyZones.length 
    : 0;
  const demandStrengthAvg = activeDemandZones.length > 0 
    ? activeDemandZones.reduce((sum, z) => sum + z.strength, 0) / activeDemandZones.length 
    : 0;
  
  // Fresh vs retested zones (fresh = higher probability per document)
  const freshSupplyZones = activeSupplyZones.filter(z => z.retestCount === 0);
  const freshDemandZones = activeDemandZones.filter(z => z.retestCount === 0);
  const restedSupplyZones = activeSupplyZones.filter(z => z.retestCount > 0);
  const restedDemandZones = activeDemandZones.filter(z => z.retestCount > 0);
  
  // Zone momentum analysis
  const highMomentumSupply = activeSupplyZones.filter(z => z.momentumCandles >= 4);
  const highMomentumDemand = activeDemandZones.filter(z => z.momentumCandles >= 4);

  // Determine primary trend
  const trend = determineTrendAdvanced(input, supplyStrengthAvg, demandStrengthAvg);
  
  // Build comprehensive explanation
  let explanation = '';
  
  // SECTION 1: TREND ASSESSMENT
  explanation += `## TREND ASSESSMENT\n\n`;
  explanation += `**Current Trend: ${trend.label}**\n\n`;
  explanation += trend.reasoning + '\n\n';
  
  // SECTION 2: ZONE LOGIC EXPLAINED (from document concepts)
  explanation += `## ZONE LOGIC EXPLAINED\n\n`;
  explanation += `Supply and demand zones represent the "footprints" of large institutional players—often called "smart money"—whose aggressive orders trigger strong price reversals.\n\n`;
  
  if (activeSupplyZones.length > 0) {
    explanation += `**Supply Zones Detected (${activeSupplyZones.length}):**\n`;
    explanation += `These zones formed during sharp downward price drops, indicating concentrated institutional selling pressure. `;
    if (freshSupplyZones.length > 0) {
      explanation += `${freshSupplyZones.length} zone(s) are FRESH (untested) - these have the highest probability as liquidity has not yet been absorbed. `;
    }
    if (restedSupplyZones.length > 0) {
      explanation += `${restedSupplyZones.length} zone(s) have been retested - each retest reduces the remaining liquidity. `;
    }
    explanation += `Average strength: ${supplyStrengthAvg.toFixed(0)}%.\n\n`;
  }
  
  if (activeDemandZones.length > 0) {
    explanation += `**Demand Zones Detected (${activeDemandZones.length}):**\n`;
    explanation += `These zones formed during strong upward rallies, leaving behind unfilled institutional buy orders. `;
    if (freshDemandZones.length > 0) {
      explanation += `${freshDemandZones.length} zone(s) are FRESH - higher probability for bounce. `;
    }
    if (restedDemandZones.length > 0) {
      explanation += `${restedDemandZones.length} zone(s) retested - some liquidity may be absorbed. `;
    }
    explanation += `Average strength: ${demandStrengthAvg.toFixed(0)}%.\n\n`;
  }
  
  // SECTION 3: IMPULSE VALIDATION
  explanation += `## IMPULSE VALIDATION\n\n`;
  if (highMomentumSupply.length > 0 || highMomentumDemand.length > 0) {
    explanation += `Strong impulse moves (4+ momentum candles) confirm institutional participation:\n`;
    if (highMomentumSupply.length > 0) {
      explanation += `- ${highMomentumSupply.length} supply zone(s) formed with strong bearish impulse\n`;
    }
    if (highMomentumDemand.length > 0) {
      explanation += `- ${highMomentumDemand.length} demand zone(s) formed with strong bullish impulse\n`;
    }
    explanation += `\nZones with stronger impulse moves indicate more aggressive institutional activity.\n\n`;
  } else {
    explanation += `Current zones show moderate impulse strength. Watch for zones with higher momentum candle counts for stronger reversal probability.\n\n`;
  }
  
  // SECTION 4: CURRENT PRICE POSITION
  explanation += `## CURRENT PRICE POSITION\n\n`;
  explanation += `**${symbol}** is currently trading at **$${currentPrice.toFixed(2)}**.\n\n`;
  
  if (inZone && zoneType) {
    if (zoneType === 'supply') {
      explanation += `⚠️ **CRITICAL: Price is INSIDE a Supply Zone** - This is institutional selling territory. `;
      explanation += `According to supply/demand theory, when price enters a supply zone, sellers have the advantage. `;
      explanation += `Watch for rejection patterns and potential reversal to the downside.\n\n`;
    } else {
      explanation += `✅ **OPPORTUNITY: Price is INSIDE a Demand Zone** - This is institutional buying territory. `;
      explanation += `When demand exceeds supply, prices rally. This zone represents unfilled buy orders where smart money previously accumulated. `;
      explanation += `Watch for confirmation of support and potential reversal to the upside.\n\n`;
    }
  } else {
    explanation += `Price is currently in "no man's land" between zones:\n`;
    if (nearestSupply && priceVsSupply !== null) {
      explanation += `- **${priceVsSupply.toFixed(2)}%** below nearest Supply (Resistance) at $${nearestSupply.bottomPrice.toFixed(2)}\n`;
    }
    if (nearestDemand && priceVsDemand !== null) {
      explanation += `- **${priceVsDemand.toFixed(2)}%** above nearest Demand (Support) at $${nearestDemand.topPrice.toFixed(2)}\n`;
    }
    explanation += `\nPrice has room to move in either direction before hitting key institutional levels.\n\n`;
  }
  
  // SECTION 5: KEY LEVELS TO WATCH
  explanation += `## KEY LEVELS TO WATCH\n\n`;
  
  if (nearestSupply) {
    const zoneWidth = nearestSupply.topPrice - nearestSupply.bottomPrice;
    explanation += `**Supply Zone (Resistance):** $${nearestSupply.bottomPrice.toFixed(2)} - $${nearestSupply.topPrice.toFixed(2)}\n`;
    explanation += `- Strength: ${nearestSupply.strength}% | Retests: ${nearestSupply.retestCount}\n`;
    explanation += `- Zone width: $${zoneWidth.toFixed(2)} (${(zoneWidth/currentPrice*100).toFixed(2)}%)\n`;
    explanation += `- If price reaches this zone: Expect selling pressure. ${nearestSupply.retestCount === 0 ? 'FRESH zone - high rejection probability.' : 'Previously tested - reduced but present resistance.'}\n\n`;
  }
  
  if (nearestDemand) {
    const zoneWidth = nearestDemand.topPrice - nearestDemand.bottomPrice;
    explanation += `**Demand Zone (Support):** $${nearestDemand.bottomPrice.toFixed(2)} - $${nearestDemand.topPrice.toFixed(2)}\n`;
    explanation += `- Strength: ${nearestDemand.strength}% | Retests: ${nearestDemand.retestCount}\n`;
    explanation += `- Zone width: $${zoneWidth.toFixed(2)} (${(zoneWidth/currentPrice*100).toFixed(2)}%)\n`;
    explanation += `- If price reaches this zone: Expect buying support. ${nearestDemand.retestCount === 0 ? 'FRESH zone - high bounce probability.' : 'Previously tested - support may be weakening.'}\n\n`;
  }
  
  // SECTION 6: TRADE BIAS & REASONING
  explanation += `## TRADE BIAS & REASONING\n\n`;
  explanation += trend.tradeBias + '\n\n';
  
  // Market structure summary
  explanation += `**Market Structure Summary:**\n`;
  explanation += `- Supply/Demand Balance: ${activeSupplyZones.length} supply vs ${activeDemandZones.length} demand zones\n`;
  explanation += `- Fresh Zone Quality: ${freshSupplyZones.length + freshDemandZones.length} untested high-probability zones\n`;
  explanation += `- Institutional Footprint: ${supplyStrengthAvg > demandStrengthAvg ? 'Sellers' : demandStrengthAvg > supplyStrengthAvg ? 'Buyers' : 'Balanced'} appear more aggressive (avg strength comparison)\n`;
  explanation += `- Timeframe: ${timeframe} analysis for ${assetClass}\n\n`;
  
  explanation += `*This analysis is based on supply/demand zone methodology used by institutional traders. Always use proper risk management and confirm with price action before entering trades.*`;

  return {
    explanation,
    summary: {
      trend: trend.label,
      trendScore: trend.score,
      activeSupplyZones: activeSupplyZones.length,
      activeDemandZones: activeDemandZones.length,
      freshZones: freshSupplyZones.length + freshDemandZones.length,
      avgSupplyStrength: Math.round(supplyStrengthAvg),
      avgDemandStrength: Math.round(demandStrengthAvg),
      inZone,
      zoneType,
      distanceToSupply: priceVsSupply?.toFixed(2) || null,
      distanceToDemand: priceVsDemand?.toFixed(2) || null,
      // 7-Gate direction takes priority when active (liquidity sweep detected)
      institutionalBias: input.gateDirection 
        ? input.gateDirection 
        : (supplyStrengthAvg > demandStrengthAvg ? 'bearish' : demandStrengthAvg > supplyStrengthAvg ? 'bullish' : 'neutral'),
      gateActive: !!input.gateDirection
    }
  };
}

function determineTrendAdvanced(
  input: AnalysisInput,
  supplyStrengthAvg: number,
  demandStrengthAvg: number
): { label: string; score: number; reasoning: string; tradeBias: string } {
  const { currentPrice, activeSupplyZones, activeDemandZones, inZone, zoneType, nearestSupply, nearestDemand, priceVsSupply, priceVsDemand, gateDirection, priceMomentum, shortTermTrend, mediumTermTrend } = input;
  
  let score = 50; // Neutral baseline
  let reasons: string[] = [];
  
  // PRIORITY: 7-Gate Liquidity Sweep Direction (when active, override zone-based analysis)
  if (gateDirection) {
    if (gateDirection === 'bullish') {
      score = 75;
      reasons.push(`🎯 7-GATE SWEEP DETECTED: Bullish liquidity sweep confirmed - institutions accumulated below key level`);
    } else {
      score = 25;
      reasons.push(`🎯 7-GATE SWEEP DETECTED: Bearish liquidity sweep confirmed - institutions distributed above key level`);
    }
  }
  
  // NEW: Real price momentum analysis (highest weight - actual market movement)
  if (priceMomentum !== null && priceMomentum !== undefined) {
    if (priceMomentum > 3) {
      score += 20;
      reasons.push(`📈 Strong bullish momentum: Price up ${priceMomentum.toFixed(2)}% over recent period - buyers in control`);
    } else if (priceMomentum > 1) {
      score += 12;
      reasons.push(`📈 Moderate bullish momentum: Price up ${priceMomentum.toFixed(2)}% - positive buying pressure`);
    } else if (priceMomentum > 0.3) {
      score += 5;
      reasons.push(`📊 Slight upward drift: Price up ${priceMomentum.toFixed(2)}% - mild bullish bias`);
    } else if (priceMomentum < -3) {
      score -= 20;
      reasons.push(`📉 Strong bearish momentum: Price down ${Math.abs(priceMomentum).toFixed(2)}% - sellers in control`);
    } else if (priceMomentum < -1) {
      score -= 12;
      reasons.push(`📉 Moderate bearish momentum: Price down ${Math.abs(priceMomentum).toFixed(2)}% - negative selling pressure`);
    } else if (priceMomentum < -0.3) {
      score -= 5;
      reasons.push(`📊 Slight downward drift: Price down ${Math.abs(priceMomentum).toFixed(2)}% - mild bearish bias`);
    }
  }
  
  // NEW: Short-term trend (5 vs 10 SMA crossover)
  if (shortTermTrend) {
    if (shortTermTrend === 'bullish') {
      score += 8;
      reasons.push(`🔼 Short-term trend bullish: 5-period SMA above 10-period SMA indicates near-term strength`);
    } else if (shortTermTrend === 'bearish') {
      score -= 8;
      reasons.push(`🔽 Short-term trend bearish: 5-period SMA below 10-period SMA indicates near-term weakness`);
    }
  }
  
  // NEW: Medium-term trend (10 vs 20 SMA)
  if (mediumTermTrend) {
    if (mediumTermTrend === 'bullish') {
      score += 10;
      reasons.push(`📈 Medium-term uptrend: 10-period SMA above 20-period SMA confirms sustained buying`);
    } else if (mediumTermTrend === 'bearish') {
      score -= 10;
      reasons.push(`📉 Medium-term downtrend: 10-period SMA below 20-period SMA confirms sustained selling`);
    }
  }
  
  // Factor 1: Zone count imbalance
  const zoneImbalance = activeDemandZones.length - activeSupplyZones.length;
  if (zoneImbalance > 1) {
    score += 10;
    reasons.push(`More demand zones (${activeDemandZones.length}) than supply (${activeSupplyZones.length}) indicates bullish market structure`);
  } else if (zoneImbalance < -1) {
    score -= 10;
    reasons.push(`More supply zones (${activeSupplyZones.length}) than demand (${activeDemandZones.length}) indicates bearish market structure`);
  }
  
  // Factor 2: Current zone position
  if (inZone) {
    if (zoneType === 'supply') {
      score -= 15;
      reasons.push(`Price is currently testing a SUPPLY zone - institutional selling pressure is active`);
    } else if (zoneType === 'demand') {
      score += 15;
      reasons.push(`Price is currently testing a DEMAND zone - institutional buying support is present`);
    }
  }
  
  // Factor 3: Proximity to zones
  if (priceVsSupply !== null && priceVsSupply < 2) {
    score -= 8;
    reasons.push(`Price is very close to supply resistance (${priceVsSupply.toFixed(2)}% away) - expect selling pressure`);
  }
  if (priceVsDemand !== null && priceVsDemand < 2) {
    score += 8;
    reasons.push(`Price is close to demand support (${priceVsDemand.toFixed(2)}% above) - buyers may step in`);
  }
  
  // Factor 4: Average zone strength comparison
  const strengthDiff = demandStrengthAvg - supplyStrengthAvg;
  if (strengthDiff > 10) {
    score += 5;
    reasons.push(`Demand zones have higher average strength (${demandStrengthAvg.toFixed(0)}% vs ${supplyStrengthAvg.toFixed(0)}%)`);
  } else if (strengthDiff < -10) {
    score -= 5;
    reasons.push(`Supply zones have higher average strength (${supplyStrengthAvg.toFixed(0)}% vs ${demandStrengthAvg.toFixed(0)}%)`);
  }
  
  // Clamp score to 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  // Determine label and trade bias
  let label: string;
  let tradeBias: string;
  
  if (score >= 70) {
    label = 'Strong Bullish';
    tradeBias = `**BULLISH BIAS** - Real-time momentum and zone structure strongly favor buyers. Look for LONG opportunities on pullbacks to demand zones. The Law of Supply and Demand indicates that when demand exceeds supply, prices rally.`;
  } else if (score >= 58) {
    label = 'Bullish';
    tradeBias = `**MODERATELY BULLISH** - Price momentum and zone analysis show buyers have an edge. Consider long positions on demand zone tests, but remain cautious of nearby supply levels.`;
  } else if (score <= 30) {
    label = 'Strong Bearish';
    tradeBias = `**BEARISH BIAS** - Real-time momentum and zone structure strongly favor sellers. Look for SHORT opportunities on rallies into supply zones. Multiple supply zones overhead act as resistance ceilings.`;
  } else if (score <= 42) {
    label = 'Bearish';
    tradeBias = `**MODERATELY BEARISH** - Price momentum and zone analysis show sellers have an edge. Consider short positions on supply zone tests, but watch for demand zones that could provide support.`;
  } else {
    label = 'Neutral/Ranging';
    tradeBias = `**NEUTRAL BIAS** - The market shows balanced momentum with no clear directional edge. This often precedes a breakout. Watch for a decisive move above supply or below demand to confirm the next trend direction.`;
  }
  
  return {
    label,
    score,
    reasoning: reasons.join('. ') + '.',
    tradeBias
  };
}

export default router;
