/**
 * AI Prediction Service
 * Analyzes stocks and generates predictions based on 3 strict criteria:
 * 1. Extremely high probability of turning a profit (>70%)
 * 2. Short timeframe of less than 60 days
 * 3. Profit potential is at least 50% bigger than downside risk (1.5:1 ratio minimum)
 */

import type { HistoricalBar } from './stock-data.service';
import { calculateIndicators, type TechnicalIndicators } from './technical-indicators.service';

export interface AIPrediction {
  symbol: string;
  predictedReturn: number; // Percentage return expected
  direction: 'up' | 'down';
  confidence: number; // 0-100%
  profitPotential: number; // % upside
  riskLevel: number; // % downside
  profitRiskRatio: number; // Profit/Risk ratio
  timeframeDays: number; // Expected days to target
  meetsCriteria: boolean; // Passes all 3 strict criteria
  technicalScore: number; // 0-100
  fundamentalScore: number; // 0-100
  sentimentScore: number; // 0-100
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  indicators: TechnicalIndicators;
}

/**
 * Calculate technical score based on multiple indicators
 */
function calculateTechnicalScore(indicators: TechnicalIndicators, currentPrice: number): number {
  let score = 0;
  let signals = 0;
  
  // RSI signals (30 points)
  if (indicators.rsi < 30) {
    score += 30; // Oversold - bullish
  } else if (indicators.rsi > 70) {
    score += 0; // Overbought - bearish
  } else {
    score += 15; // Neutral
  }
  signals++;
  
  // MACD signals (25 points)
  if (indicators.macdHist > 0 && indicators.macd > indicators.macdSignal) {
    score += 25; // Bullish crossover
  } else if (indicators.macdHist < 0 && indicators.macd < indicators.macdSignal) {
    score += 5; // Bearish crossover
  } else {
    score += 15; // Neutral
  }
  signals++;
  
  // Moving Average signals (25 points)
  if (currentPrice > indicators.ma20 && indicators.ma20 > indicators.ma50) {
    score += 25; // Strong uptrend
  } else if (currentPrice < indicators.ma20 && indicators.ma20 < indicators.ma50) {
    score += 5; // Strong downtrend
  } else {
    score += 15; // Mixed
  }
  signals++;
  
  // Bollinger Bands signals (20 points)
  const bbPosition = (currentPrice - indicators.bollingerLower) / 
                     (indicators.bollingerUpper - indicators.bollingerLower);
  if (bbPosition < 0.2) {
    score += 20; // Near lower band - oversold
  } else if (bbPosition > 0.8) {
    score += 5; // Near upper band - overbought
  } else {
    score += 12; // Mid-range
  }
  
  // Normalize to 0-100
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate fundamental score (simplified for demo)
 */
function calculateFundamentalScore(): number {
  // In production, this would analyze:
  // - P/E ratio
  // - Revenue growth
  // - Earnings growth
  // - Debt levels
  // - Cash flow
  
  // For now, return a randomized score biased towards quality
  return 60 + Math.random() * 30;
}

/**
 * Calculate sentiment score (simplified for demo)
 */
function calculateSentimentScore(): number {
  // In production, this would analyze:
  // - News sentiment
  // - Social media sentiment
  // - Analyst ratings
  // - Insider trading
  // - Institutional ownership
  
  // For now, return a randomized score
  return 50 + Math.random() * 40;
}

/**
 * Calculate confidence level based on all scores
 */
function calculateConfidence(technical: number, fundamental: number, sentiment: number): number {
  // Weighted average: technical 50%, fundamental 30%, sentiment 20%
  return (technical * 0.5) + (fundamental * 0.3) + (sentiment * 0.2);
}

/**
 * Calculate price targets and risk levels
 */
function calculateTargets(
  currentPrice: number,
  indicators: TechnicalIndicators,
  technicalScore: number
): {
  targetPrice: number;
  stopLoss: number;
  profitPotential: number;
  riskLevel: number;
  profitRiskRatio: number;
} {
  const atrMultiplier = 2.5; // ATR-based targets
  const confidenceMultiplier = technicalScore / 100;
  
  // Calculate upside target based on ATR and technical strength
  const upside = indicators.atr * atrMultiplier * (1 + confidenceMultiplier);
  const targetPrice = currentPrice + upside;
  const profitPotential = (upside / currentPrice) * 100;
  
  // Calculate downside stop loss (tighter than upside)
  const downside = indicators.atr * 1.5;
  const stopLoss = currentPrice - downside;
  const riskLevel = (downside / currentPrice) * 100;
  
  // Profit/Risk ratio
  const profitRiskRatio = profitPotential / riskLevel;
  
  return {
    targetPrice: Number(targetPrice.toFixed(2)),
    stopLoss: Number(stopLoss.toFixed(2)),
    profitPotential: Number(profitPotential.toFixed(2)),
    riskLevel: Number(riskLevel.toFixed(2)),
    profitRiskRatio: Number(profitRiskRatio.toFixed(2)),
  };
}

/**
 * Estimate timeframe to target (days)
 */
function estimateTimeframe(atr: number, targetDistance: number): number {
  // Estimate based on average daily movement (ATR)
  if (atr === 0) return 30;
  const daysToTarget = Math.ceil(targetDistance / atr);
  // Cap between 5 and 60 days
  return Math.min(60, Math.max(5, daysToTarget));
}

/**
 * Generate reasoning text for the prediction
 */
function generateReasoning(
  indicators: TechnicalIndicators,
  currentPrice: number,
  targets: ReturnType<typeof calculateTargets>,
  technicalScore: number
): string {
  const reasons: string[] = [];
  
  // RSI reasoning
  if (indicators.rsi < 30) {
    reasons.push(`Oversold conditions (RSI: ${indicators.rsi.toFixed(1)})`);
  } else if (indicators.rsi > 70) {
    reasons.push(`Overbought conditions (RSI: ${indicators.rsi.toFixed(1)})`);
  }
  
  // MACD reasoning
  if (indicators.macdHist > 0) {
    reasons.push('Bullish MACD crossover');
  }
  
  // MA reasoning
  if (currentPrice > indicators.ma20 && indicators.ma20 > indicators.ma50) {
    reasons.push('Price above key moving averages (uptrend)');
  }
  
  // Risk/Reward reasoning
  reasons.push(`Favorable ${targets.profitRiskRatio.toFixed(1)}:1 profit/risk ratio`);
  
  // Technical strength
  if (technicalScore >= 70) {
    reasons.push('Strong technical setup');
  } else if (technicalScore >= 50) {
    reasons.push('Moderate technical setup');
  }
  
  return reasons.join('. ') + '.';
}

/**
 * Check if prediction meets all 3 strict criteria
 */
function meetsStrictCriteria(
  confidence: number,
  timeframeDays: number,
  profitRiskRatio: number
): boolean {
  // Criterion 1: High probability (confidence > 70%)
  const highProbability = confidence >= 70;
  
  // Criterion 2: Short timeframe (< 60 days)
  const shortTimeframe = timeframeDays < 60;
  
  // Criterion 3: Profit potential at least 50% bigger than risk (1.5:1 ratio)
  const goodRiskReward = profitRiskRatio >= 1.5;
  
  return highProbability && shortTimeframe && goodRiskReward;
}

/**
 * Generate AI prediction for a stock
 */
export function generatePrediction(
  symbol: string,
  currentPrice: number,
  historicalBars: HistoricalBar[]
): AIPrediction {
  // Calculate technical indicators
  const indicators = calculateIndicators(historicalBars);
  
  // Calculate scores
  const technicalScore = calculateTechnicalScore(indicators, currentPrice);
  const fundamentalScore = calculateFundamentalScore();
  const sentimentScore = calculateSentimentScore();
  const confidence = calculateConfidence(technicalScore, fundamentalScore, sentimentScore);
  
  // Calculate targets and risk
  const targets = calculateTargets(currentPrice, indicators, technicalScore);
  
  // Estimate timeframe
  const timeframeDays = estimateTimeframe(
    indicators.atr,
    Math.abs(targets.targetPrice - currentPrice)
  );
  
  // Determine direction (only up or down, no sideways for database compatibility)
  const direction: 'up' | 'down' = targets.profitPotential >= 0 ? 'up' : 'down';
  
  // Check if meets all criteria
  const meetsCriteria = meetsStrictCriteria(confidence, timeframeDays, targets.profitRiskRatio);
  
  // Generate reasoning
  const reasoning = generateReasoning(indicators, currentPrice, targets, technicalScore);
  
  return {
    symbol,
    predictedReturn: targets.profitPotential,
    direction,
    confidence: Number(confidence.toFixed(2)),
    profitPotential: targets.profitPotential,
    riskLevel: targets.riskLevel,
    profitRiskRatio: targets.profitRiskRatio,
    timeframeDays,
    meetsCriteria,
    technicalScore: Number(technicalScore.toFixed(2)),
    fundamentalScore: Number(fundamentalScore.toFixed(2)),
    sentimentScore: Number(sentimentScore.toFixed(2)),
    entryPrice: currentPrice,
    targetPrice: targets.targetPrice,
    stopLoss: targets.stopLoss,
    reasoning,
    indicators,
  };
}

/**
 * Scan multiple stocks and return only those meeting the 3 strict criteria
 */
export async function scanStocks(
  symbols: string[],
  getHistoricalData: (symbol: string) => Promise<HistoricalBar[]>,
  getCurrentPrice: (symbol: string) => Promise<number>
): Promise<AIPrediction[]> {
  const predictions: AIPrediction[] = [];
  
  for (const symbol of symbols) {
    try {
      const price = await getCurrentPrice(symbol);
      const bars = await getHistoricalData(symbol);
      const prediction = generatePrediction(symbol, price, bars);
      
      // Only include predictions that meet all 3 criteria
      if (prediction.meetsCriteria) {
        predictions.push(prediction);
      }
    } catch (error) {
      console.error(`Error scanning ${symbol}:`, error);
      // Continue with next symbol
    }
  }
  
  // Sort by composite score (combination of confidence and profit/risk)
  predictions.sort((a, b) => {
    const scoreA = a.confidence * a.profitRiskRatio;
    const scoreB = b.confidence * b.profitRiskRatio;
    return scoreB - scoreA;
  });
  
  // Return top 5-10 trades
  return predictions.slice(0, 10);
}
