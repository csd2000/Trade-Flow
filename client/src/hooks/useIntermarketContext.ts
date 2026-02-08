import { useQuery } from '@tanstack/react-query';

export interface IntermarketAsset {
  symbol: string;
  name: string;
  category: 'equity' | 'bond' | 'commodity' | 'currency' | 'volatility' | 'crypto';
  currentPrice: number;
  changePercent: number;
}

export interface IntermarketSignal {
  type: 'risk_on' | 'risk_off' | 'rotation' | 'divergence' | 'confirmation';
  strength: number;
  description: string;
  assets: string[];
}

export interface IntermarketData {
  assets: IntermarketAsset[];
  signals: IntermarketSignal[];
  marketRegime: 'risk_on' | 'risk_off' | 'transitioning' | 'uncertain';
  aiInsight: string;
  timestamp: string;
}

export interface IntermarketContext {
  data: IntermarketData | null;
  isLoading: boolean;
  error: Error | null;
  marketBias: 'bullish' | 'bearish' | 'neutral';
  riskAppetite: 'high' | 'low' | 'mixed';
  keyCorrelations: string[];
  tradingGuidance: string;
}

function deriveMarketBias(data: IntermarketData): 'bullish' | 'bearish' | 'neutral' {
  if (!data.assets || !Array.isArray(data.assets)) return 'neutral';
  
  const spy = data.assets.find(a => a.symbol === 'SPY');
  const qqq = data.assets.find(a => a.symbol === 'QQQ');
  const vix = data.assets.find(a => a.symbol === 'VIX');
  
  const equityBullish = (spy?.changePercent ?? 0) > 0.3 && (qqq?.changePercent ?? 0) > 0.3;
  const equityBearish = (spy?.changePercent ?? 0) < -0.3 && (qqq?.changePercent ?? 0) < -0.3;
  const vixRising = (vix?.changePercent ?? 0) > 5;
  
  if (data.marketRegime === 'risk_on' && equityBullish && !vixRising) return 'bullish';
  if (data.marketRegime === 'risk_off' || equityBearish || vixRising) return 'bearish';
  return 'neutral';
}

function deriveRiskAppetite(data: IntermarketData): 'high' | 'low' | 'mixed' {
  if (!data.assets || !Array.isArray(data.assets)) return 'mixed';
  
  const vix = data.assets.find(a => a.symbol === 'VIX');
  const tlt = data.assets.find(a => a.symbol === 'TLT');
  const gld = data.assets.find(a => a.symbol === 'GLD');
  
  const vixLow = (vix?.currentPrice ?? 20) < 18;
  const bondsSelling = (tlt?.changePercent ?? 0) < -0.5;
  const goldSelling = (gld?.changePercent ?? 0) < -0.3;
  
  if (data.marketRegime === 'risk_on' && vixLow && bondsSelling) return 'high';
  if (data.marketRegime === 'risk_off' || (vix?.currentPrice ?? 20) > 25) return 'low';
  return 'mixed';
}

function deriveKeyCorrelations(data: IntermarketData): string[] {
  if (!data.assets || !Array.isArray(data.assets)) return [];
  
  const correlations: string[] = [];
  
  const spy = data.assets.find(a => a.symbol === 'SPY');
  const tlt = data.assets.find(a => a.symbol === 'TLT');
  const gld = data.assets.find(a => a.symbol === 'GLD');
  const uup = data.assets.find(a => a.symbol === 'UUP');
  const vix = data.assets.find(a => a.symbol === 'VIX');
  
  if (spy && tlt) {
    const bothUp = spy.changePercent > 0 && tlt.changePercent > 0;
    const bothDown = spy.changePercent < 0 && tlt.changePercent < 0;
    if (bothUp) correlations.push('Stocks & bonds rising together (unusual)');
    if (bothDown) correlations.push('Stocks & bonds falling (risk-off)');
  }
  
  if (gld && uup) {
    if (gld.changePercent > 0.5 && uup.changePercent < -0.3) {
      correlations.push('Gold up, dollar down (inflation hedge active)');
    }
    if (gld.changePercent < -0.5 && uup.changePercent > 0.3) {
      correlations.push('Dollar strength pressuring gold');
    }
  }
  
  if (vix && spy) {
    if (vix.changePercent > 10 && spy.changePercent < -0.5) {
      correlations.push('VIX spiking - increased fear in markets');
    }
  }
  
  return correlations.slice(0, 3);
}

function deriveTradingGuidance(data: IntermarketData, bias: string, risk: string): string {
  if (data.marketRegime === 'risk_on' && bias === 'bullish' && risk === 'high') {
    return 'BULLISH BIAS: Favor long positions in equities. Look for pullback entries. Avoid shorting.';
  }
  if (data.marketRegime === 'risk_off' || bias === 'bearish') {
    return 'BEARISH BIAS: Favor short positions or defensive sectors. Consider gold/bonds. Avoid aggressive longs.';
  }
  if (data.marketRegime === 'transitioning') {
    return 'TRANSITIONING: Reduce position sizes. Wait for regime confirmation. Trade smaller.';
  }
  return 'NEUTRAL: Range-bound conditions. Trade both sides with tight stops. Focus on mean reversion.';
}

export function useIntermarketContext(): IntermarketContext {
  const { data, isLoading, error } = useQuery<IntermarketData>({
    queryKey: ['/api/intermarket/analysis'],
    staleTime: 60000,
    refetchInterval: 120000,
  });

  if (!data || !data.assets || !Array.isArray(data.assets)) {
    return {
      data: null,
      isLoading,
      error: error as Error | null,
      marketBias: 'neutral',
      riskAppetite: 'mixed',
      keyCorrelations: [],
      tradingGuidance: isLoading ? 'Loading market context...' : 'Market data unavailable'
    };
  }

  const marketBias = deriveMarketBias(data);
  const riskAppetite = deriveRiskAppetite(data);
  const keyCorrelations = deriveKeyCorrelations(data);
  const tradingGuidance = deriveTradingGuidance(data, marketBias, riskAppetite);

  return {
    data,
    isLoading,
    error: error as Error | null,
    marketBias,
    riskAppetite,
    keyCorrelations,
    tradingGuidance
  };
}
