import Anthropic from '@anthropic-ai/sdk';

interface AssetData {
  symbol: string;
  name: string;
  category: 'equity' | 'bond' | 'commodity' | 'currency' | 'volatility' | 'crypto';
  prices: number[];
  currentPrice: number;
  change24h: number;
  changePercent: number;
}

interface CorrelationPair {
  asset1: string;
  asset2: string;
  correlation: number;
  relationship: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
  tradingImplication: string;
}

interface IntermarketSignal {
  type: 'risk_on' | 'risk_off' | 'rotation' | 'divergence' | 'confirmation';
  strength: number;
  description: string;
  assets: string[];
  timestamp: string;
}

interface IntermarketAnalysis {
  assets: AssetData[];
  correlations: CorrelationPair[];
  signals: IntermarketSignal[];
  marketRegime: 'risk_on' | 'risk_off' | 'transitioning' | 'uncertain';
  aiInsight: string;
  timestamp: string;
}

class IntermarketServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'IntermarketServiceError';
  }
}

const INTERMARKET_ASSETS = [
  { symbol: 'SPY', name: 'S&P 500', category: 'equity' as const, yahoo: 'SPY' },
  { symbol: 'QQQ', name: 'Nasdaq 100', category: 'equity' as const, yahoo: 'QQQ' },
  { symbol: 'TLT', name: '20+ Year Treasury', category: 'bond' as const, yahoo: 'TLT' },
  { symbol: 'GLD', name: 'Gold', category: 'commodity' as const, yahoo: 'GLD' },
  { symbol: 'USO', name: 'Crude Oil', category: 'commodity' as const, yahoo: 'USO' },
  { symbol: 'UUP', name: 'US Dollar Index', category: 'currency' as const, yahoo: 'UUP' },
  { symbol: 'VIX', name: 'Volatility Index', category: 'volatility' as const, yahoo: '^VIX' },
  { symbol: 'BTC', name: 'Bitcoin', category: 'crypto' as const, yahoo: 'BTC-USD' },
];

let analysisCache: { data: IntermarketAnalysis; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchYahooData(symbol: string): Promise<{ prices: number[]; current: number; change: number }> {
  const yahooSymbol = INTERMARKET_ASSETS.find(a => a.symbol === symbol)?.yahoo || symbol;
  
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = endDate - (30 * 24 * 60 * 60);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  if (!response.ok) {
    throw new IntermarketServiceError(`Failed to fetch data for ${symbol}`, 'YAHOO_API_ERROR');
  }
  
  const data = await response.json();
  const result = data.chart?.result?.[0];
  
  if (!result?.indicators?.quote?.[0]?.close) {
    throw new IntermarketServiceError(`No data available for ${symbol}`, 'NO_DATA');
  }
  
  const closes = result.indicators.quote[0].close.filter((p: number | null) => p !== null);
  const current = closes[closes.length - 1];
  const previous = closes[closes.length - 2] || current;
  const change = ((current - previous) / previous) * 100;
  
  return { prices: closes, current, change };
}

function calculateCorrelation(prices1: number[], prices2: number[]): number {
  const minLength = Math.min(prices1.length, prices2.length);
  if (minLength < 5) return 0;
  
  const p1 = prices1.slice(-minLength);
  const p2 = prices2.slice(-minLength);
  
  const returns1 = [];
  const returns2 = [];
  for (let i = 1; i < p1.length; i++) {
    returns1.push((p1[i] - p1[i-1]) / p1[i-1]);
    returns2.push((p2[i] - p2[i-1]) / p2[i-1]);
  }
  
  const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
  const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;
  
  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;
  
  for (let i = 0; i < returns1.length; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(denom1 * denom2);
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

function getCorrelationRelationship(corr: number): 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative' {
  if (corr >= 0.7) return 'strong_positive';
  if (corr >= 0.3) return 'positive';
  if (corr <= -0.7) return 'strong_negative';
  if (corr <= -0.3) return 'negative';
  return 'neutral';
}

function getTradingImplication(asset1: string, asset2: string, relationship: string): string {
  const implications: Record<string, Record<string, string>> = {
    'SPY_TLT': {
      'strong_negative': 'Classic risk-on/risk-off relationship active - bonds providing hedge',
      'negative': 'Normal inverse correlation - diversification benefits intact',
      'neutral': 'Correlation breakdown - unusual market conditions',
      'positive': 'Warning: Both rising/falling together - Fed policy driving all assets',
      'strong_positive': 'Extreme correlation - liquidity-driven market, high risk'
    },
    'SPY_VIX': {
      'strong_negative': 'Normal fear gauge relationship - VIX spiking on selloffs',
      'negative': 'Standard inverse behavior',
      'neutral': 'VIX not responding normally - complacency or unusual conditions',
      'positive': 'Abnormal: stocks and fear rising together',
      'strong_positive': 'Warning: Major structural change in market behavior'
    },
    'GLD_UUP': {
      'strong_negative': 'Classic inverse - dollar weakness bullish for gold',
      'negative': 'Normal behavior - gold as dollar hedge',
      'neutral': 'Both driven by separate factors',
      'positive': 'Safe haven flows into both - extreme uncertainty',
      'strong_positive': 'Flight to safety across all safe havens'
    },
    'SPY_BTC': {
      'strong_positive': 'Risk assets moving together - BTC as tech/growth proxy',
      'positive': 'Correlated risk sentiment',
      'neutral': 'BTC decoupling from stocks',
      'negative': 'BTC showing independent behavior',
      'strong_negative': 'Strong divergence - potential rotation signal'
    }
  };
  
  const key = `${asset1}_${asset2}`;
  const reverseKey = `${asset2}_${asset1}`;
  const impl = implications[key] || implications[reverseKey];
  
  if (impl && impl[relationship]) {
    return impl[relationship];
  }
  
  return relationship.includes('positive') 
    ? `${asset1} and ${asset2} moving together` 
    : relationship.includes('negative')
      ? `${asset1} and ${asset2} moving inversely`
      : `No clear relationship between ${asset1} and ${asset2}`;
}

function detectMarketSignals(assets: AssetData[], correlations: CorrelationPair[]): IntermarketSignal[] {
  const signals: IntermarketSignal[] = [];
  const now = new Date().toISOString();
  
  const spy = assets.find(a => a.symbol === 'SPY');
  const tlt = assets.find(a => a.symbol === 'TLT');
  const vix = assets.find(a => a.symbol === 'VIX');
  const gld = assets.find(a => a.symbol === 'GLD');
  const btc = assets.find(a => a.symbol === 'BTC');
  
  if (spy && spy.changePercent > 0.5 && tlt && tlt.changePercent < -0.2) {
    signals.push({
      type: 'risk_on',
      strength: Math.min(90, 50 + Math.abs(spy.changePercent) * 10),
      description: 'Risk-on environment: Stocks rising, bonds falling - investors favoring growth',
      assets: ['SPY', 'TLT'],
      timestamp: now
    });
  }
  
  if (spy && spy.changePercent < -0.5 && tlt && tlt.changePercent > 0.2) {
    signals.push({
      type: 'risk_off',
      strength: Math.min(90, 50 + Math.abs(spy.changePercent) * 10),
      description: 'Risk-off environment: Flight to safety into bonds',
      assets: ['SPY', 'TLT'],
      timestamp: now
    });
  }
  
  if (vix && vix.currentPrice > 25) {
    signals.push({
      type: 'risk_off',
      strength: Math.min(95, 60 + vix.currentPrice),
      description: `Elevated VIX at ${vix.currentPrice.toFixed(1)} signals high fear and potential volatility`,
      assets: ['VIX'],
      timestamp: now
    });
  }
  
  if (gld && gld.changePercent > 1 && spy && spy.changePercent < 0) {
    signals.push({
      type: 'rotation',
      strength: 70,
      description: 'Gold outperforming stocks - defensive rotation in progress',
      assets: ['GLD', 'SPY'],
      timestamp: now
    });
  }
  
  const spyBtcCorr = correlations.find(c => 
    (c.asset1 === 'SPY' && c.asset2 === 'BTC') || 
    (c.asset1 === 'BTC' && c.asset2 === 'SPY')
  );
  
  if (spyBtcCorr && spyBtcCorr.correlation < 0.2 && btc && spy) {
    if ((btc.changePercent > 2 && spy.changePercent < 0) || (btc.changePercent < -2 && spy.changePercent > 0)) {
      signals.push({
        type: 'divergence',
        strength: 65,
        description: 'Bitcoin diverging from stocks - potential uncorrelated opportunity',
        assets: ['BTC', 'SPY'],
        timestamp: now
      });
    }
  }
  
  return signals;
}

function determineMarketRegime(assets: AssetData[], signals: IntermarketSignal[]): 'risk_on' | 'risk_off' | 'transitioning' | 'uncertain' {
  const riskOnSignals = signals.filter(s => s.type === 'risk_on').length;
  const riskOffSignals = signals.filter(s => s.type === 'risk_off').length;
  
  const spy = assets.find(a => a.symbol === 'SPY');
  const vix = assets.find(a => a.symbol === 'VIX');
  
  if (riskOffSignals > riskOnSignals || (vix && vix.currentPrice > 30)) {
    return 'risk_off';
  }
  
  if (riskOnSignals > riskOffSignals && spy && spy.changePercent > 0) {
    return 'risk_on';
  }
  
  if (signals.some(s => s.type === 'rotation' || s.type === 'divergence')) {
    return 'transitioning';
  }
  
  return 'uncertain';
}

async function generateAIInsight(assets: AssetData[], correlations: CorrelationPair[], regime: string): Promise<string> {
  const anthropic = new Anthropic();
  
  const assetSummary = assets.map(a => 
    `${a.name} (${a.symbol}): ${a.changePercent > 0 ? '+' : ''}${a.changePercent.toFixed(2)}%`
  ).join('\n');
  
  const keyCorrelations = correlations
    .filter(c => Math.abs(c.correlation) > 0.5)
    .map(c => `${c.asset1}/${c.asset2}: ${c.correlation.toFixed(2)} (${c.relationship})`)
    .join('\n');
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `As a professional intermarket analyst, provide a brief 2-3 sentence trading insight based on current intermarket relationships:

Market Regime: ${regime}

Today's Performance:
${assetSummary}

Key Correlations:
${keyCorrelations}

Focus on actionable implications for traders. Be specific about what these relationships suggest for near-term positioning.`
      }]
    });
    
    return (message.content[0] as any).text;
  } catch (error) {
    console.error('AI insight generation failed:', error);
    return `Market regime is ${regime}. Monitor cross-asset correlations for potential rotation signals.`;
  }
}

export async function getIntermarketAnalysis(): Promise<IntermarketAnalysis> {
  if (analysisCache && Date.now() - analysisCache.timestamp < CACHE_TTL) {
    return analysisCache.data;
  }
  
  const assets: AssetData[] = [];
  const errors: string[] = [];
  
  for (const asset of INTERMARKET_ASSETS) {
    try {
      const data = await fetchYahooData(asset.symbol);
      assets.push({
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        prices: data.prices,
        currentPrice: data.current,
        change24h: data.current - (data.prices[data.prices.length - 2] || data.current),
        changePercent: data.change
      });
    } catch (error) {
      console.error(`Failed to fetch ${asset.symbol}:`, error);
      errors.push(asset.symbol);
    }
  }
  
  if (assets.length < 4) {
    throw new IntermarketServiceError(
      `Unable to fetch sufficient market data. Failed assets: ${errors.join(', ')}`,
      'INSUFFICIENT_DATA'
    );
  }
  
  const correlations: CorrelationPair[] = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const corr = calculateCorrelation(assets[i].prices, assets[j].prices);
      const relationship = getCorrelationRelationship(corr);
      correlations.push({
        asset1: assets[i].symbol,
        asset2: assets[j].symbol,
        correlation: corr,
        relationship,
        tradingImplication: getTradingImplication(assets[i].symbol, assets[j].symbol, relationship)
      });
    }
  }
  
  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  
  const signals = detectMarketSignals(assets, correlations);
  const marketRegime = determineMarketRegime(assets, signals);
  const aiInsight = await generateAIInsight(assets, correlations, marketRegime);
  
  const analysis: IntermarketAnalysis = {
    assets,
    correlations,
    signals,
    marketRegime,
    aiInsight,
    timestamp: new Date().toISOString()
  };
  
  analysisCache = { data: analysis, timestamp: Date.now() };
  
  return analysis;
}

export async function getCorrelationMatrix(): Promise<{ matrix: number[][]; labels: string[] }> {
  const analysis = await getIntermarketAnalysis();
  
  const labels = analysis.assets.map(a => a.symbol);
  const n = labels.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
  }
  
  for (const corr of analysis.correlations) {
    const i = labels.indexOf(corr.asset1);
    const j = labels.indexOf(corr.asset2);
    if (i >= 0 && j >= 0) {
      matrix[i][j] = corr.correlation;
      matrix[j][i] = corr.correlation;
    }
  }
  
  return { matrix, labels };
}
