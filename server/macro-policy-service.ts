// Federal Reserve & Macro Policy Analysis Service
// Incorporates Fed decisions, inflation, employment, and market correlations

export interface FedPolicyData {
  currentRate: { low: number; high: number };
  lastChange: { date: string; action: string; amount: number };
  nextMeeting: string;
  policyStance: 'hawkish' | 'neutral' | 'dovish';
  rateDirection: 'cutting' | 'holding' | 'hiking';
}

export interface InflationData {
  cpi: { value: number; trend: 'rising' | 'falling' | 'sticky'; target: number };
  pce: { value: number; trend: 'rising' | 'falling' | 'sticky' };
  level: 'low' | 'target' | 'elevated' | 'high';
}

export interface EmploymentData {
  nfp: { lastValue: number; trend: 'strong' | 'moderate' | 'soft' };
  unemploymentRate: number;
  laborMarket: 'tight' | 'balanced' | 'soft';
}

export interface MarketCorrelation {
  btcSp500: number;
  btcInflation: number;
  riskAppetite: 'risk-on' | 'neutral' | 'risk-off';
}

export interface GeopoliticalFactors {
  tariffRisk: 'low' | 'medium' | 'high';
  tradePolicy: string;
  governmentStatus: 'normal' | 'shutdown' | 'uncertainty';
}

export interface SectorDrivers {
  aiSpending: 'accelerating' | 'stable' | 'decelerating';
  magSevenValuation: 'undervalued' | 'fair' | 'stretched' | 'extreme';
  cryptoRegulation: 'favorable' | 'neutral' | 'hostile';
  institutionalAdoption: 'increasing' | 'stable' | 'decreasing';
}

export interface MacroSnapshot {
  timestamp: Date;
  fedPolicy: FedPolicyData;
  inflation: InflationData;
  employment: EmploymentData;
  correlation: MarketCorrelation;
  geopolitical: GeopoliticalFactors;
  sectorDrivers: SectorDrivers;
  fearGreedIndex: { value: number; label: string };
  overallBias: 'bullish' | 'neutral' | 'bearish';
  marketEnvironment: string;
  keyRisks: string[];
  opportunities: string[];
}

class MacroPolicyService {
  private cachedSnapshot: MacroSnapshot | null = null;
  private lastFetch: number = 0;
  private CACHE_TTL = 300000; // 5 minutes

  // Current macro conditions based on December 2025 data
  getCurrentMacroData(): MacroSnapshot {
    const now = new Date();
    
    // Fed Policy - December 2025 conditions
    const fedPolicy: FedPolicyData = {
      currentRate: { low: 3.50, high: 3.75 },
      lastChange: { date: '2025-12-10', action: 'cut', amount: 0.25 },
      nextMeeting: '2026-01-29',
      policyStance: 'dovish',
      rateDirection: 'cutting'
    };

    // Inflation - sticky in upper 2%
    const inflation: InflationData = {
      cpi: { value: 2.7, trend: 'sticky', target: 2.0 },
      pce: { value: 2.5, trend: 'sticky' },
      level: 'elevated'
    };

    // Employment - moderate but Fed watching for softness
    const employment: EmploymentData = {
      nfp: { lastValue: 150000, trend: 'moderate' },
      unemploymentRate: 4.1,
      laborMarket: 'balanced'
    };

    // Market correlations - BTC highly correlated with S&P500
    const correlation: MarketCorrelation = {
      btcSp500: 0.5,
      btcInflation: 0.8,
      riskAppetite: 'risk-off'
    };

    // Geopolitical factors
    const geopolitical: GeopoliticalFactors = {
      tariffRisk: 'high',
      tradePolicy: 'Liberation Day tariffs affecting markets',
      governmentStatus: 'uncertainty'
    };

    // Sector drivers
    const sectorDrivers: SectorDrivers = {
      aiSpending: 'accelerating',
      magSevenValuation: 'extreme',
      cryptoRegulation: 'favorable',
      institutionalAdoption: 'increasing'
    };

    // Fear & Greed at 24 (Extreme Fear)
    const fearGreedIndex = { value: 24, label: 'Extreme Fear' };

    // Calculate overall bias
    let biasScore = 0;
    
    // Fed cutting = bullish (+20)
    if (fedPolicy.rateDirection === 'cutting') biasScore += 20;
    
    // High inflation = bearish for risk (-15)
    if (inflation.level === 'elevated' || inflation.level === 'high') biasScore -= 15;
    
    // Extreme fear = contrarian bullish (+10 for future)
    if (fearGreedIndex.value < 25) biasScore += 10;
    
    // High tariff risk = bearish (-15)
    if (geopolitical.tariffRisk === 'high') biasScore -= 15;
    
    // Favorable crypto regulation = bullish (+10)
    if (sectorDrivers.cryptoRegulation === 'favorable') biasScore += 10;
    
    // Extreme mag7 valuations = risky (-10)
    if (sectorDrivers.magSevenValuation === 'extreme') biasScore -= 10;

    const overallBias = biasScore > 10 ? 'bullish' : biasScore < -10 ? 'bearish' : 'neutral';

    return {
      timestamp: now,
      fedPolicy,
      inflation,
      employment,
      correlation,
      geopolitical,
      sectorDrivers,
      fearGreedIndex,
      overallBias,
      marketEnvironment: this.describeEnvironment(fedPolicy, inflation, fearGreedIndex),
      keyRisks: this.identifyRisks(geopolitical, sectorDrivers, inflation),
      opportunities: this.identifyOpportunities(fedPolicy, fearGreedIndex, sectorDrivers)
    };
  }

  private describeEnvironment(fed: FedPolicyData, inflation: InflationData, fgi: { value: number; label: string }): string {
    return `Fed in easing cycle (${fed.currentRate.low}%-${fed.currentRate.high}%), inflation sticky at ${inflation.cpi.value}%, market sentiment at ${fgi.label} (${fgi.value}). Transitional period with rate cuts but persistent price pressures.`;
  }

  private identifyRisks(geo: GeopoliticalFactors, sectors: SectorDrivers, inflation: InflationData): string[] {
    const risks: string[] = [];
    
    if (geo.tariffRisk === 'high') {
      risks.push('Trade war escalation risk from Liberation Day tariffs');
    }
    if (sectors.magSevenValuation === 'extreme') {
      risks.push('Magnificent Seven overvaluation - vulnerable to earnings misses');
    }
    if (inflation.level === 'elevated') {
      risks.push('Sticky inflation may limit Fed rate cuts');
    }
    if (geo.governmentStatus !== 'normal') {
      risks.push('Government uncertainty creating data gaps');
    }
    
    risks.push('Crypto liquidity vacuum risk - $1.2T erased in late 2025');
    
    return risks;
  }

  private identifyOpportunities(fed: FedPolicyData, fgi: { value: number; label: string }, sectors: SectorDrivers): string[] {
    const opps: string[] = [];
    
    if (fed.rateDirection === 'cutting') {
      opps.push('Fed easing cycle supports risk assets');
    }
    if (fgi.value < 30) {
      opps.push('Extreme fear = contrarian buying opportunity');
    }
    if (sectors.cryptoRegulation === 'favorable') {
      opps.push('CLARITY Act & GENIUS Act favorable for crypto exposure');
    }
    if (sectors.institutionalAdoption === 'increasing') {
      opps.push('Spot ETFs & Strategic Bitcoin Reserve driving institutional flows');
    }
    if (sectors.aiSpending === 'accelerating') {
      opps.push('AI infrastructure spending remains GDP growth engine');
    }
    
    return opps;
  }

  async getMacroSnapshot(): Promise<MacroSnapshot> {
    const now = Date.now();
    
    if (this.cachedSnapshot && (now - this.lastFetch < this.CACHE_TTL)) {
      return this.cachedSnapshot;
    }

    // Fetch live Fear & Greed if possible
    let fearGreed = { value: 24, label: 'Extreme Fear' };
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      if (data.data?.[0]) {
        fearGreed = {
          value: parseInt(data.data[0].value),
          label: data.data[0].value_classification
        };
      }
    } catch (e) {
      // Use default
    }

    const snapshot = this.getCurrentMacroData();
    snapshot.fearGreedIndex = fearGreed;
    
    // Recalculate bias with live fear/greed
    let biasScore = 0;
    if (snapshot.fedPolicy.rateDirection === 'cutting') biasScore += 20;
    if (snapshot.inflation.level === 'elevated') biasScore -= 15;
    if (fearGreed.value < 25) biasScore += 10;
    else if (fearGreed.value > 75) biasScore -= 10;
    if (snapshot.geopolitical.tariffRisk === 'high') biasScore -= 15;
    if (snapshot.sectorDrivers.cryptoRegulation === 'favorable') biasScore += 10;
    
    snapshot.overallBias = biasScore > 10 ? 'bullish' : biasScore < -10 ? 'bearish' : 'neutral';
    
    this.cachedSnapshot = snapshot;
    this.lastFetch = now;
    
    return snapshot;
  }

  // Calculate macro adjustment factor for signals
  calculateMacroAdjustment(assetType: 'stock' | 'crypto' | 'forex', macro: MacroSnapshot): {
    biasAdjustment: number;  // -30 to +30
    confidenceMultiplier: number;  // 0.7 to 1.3
    riskMultiplier: number;  // 0.8 to 1.5
    reasoning: string;
  } {
    let biasAdj = 0;
    let confMult = 1.0;
    let riskMult = 1.0;
    const reasons: string[] = [];

    // Fed policy impact
    if (macro.fedPolicy.rateDirection === 'cutting') {
      biasAdj += 10;
      reasons.push('Fed easing supports risk assets');
    } else if (macro.fedPolicy.rateDirection === 'hiking') {
      biasAdj -= 15;
      riskMult *= 1.2;
      reasons.push('Fed tightening pressures valuations');
    }

    // Fear & Greed contrarian signals
    if (macro.fearGreedIndex.value < 25) {
      biasAdj += 8; // Extreme fear = contrarian bullish
      confMult *= 0.9; // Lower confidence in extreme conditions
      reasons.push('Extreme fear may signal capitulation');
    } else if (macro.fearGreedIndex.value > 75) {
      biasAdj -= 8; // Extreme greed = contrarian bearish
      confMult *= 0.9;
      reasons.push('Extreme greed suggests caution');
    }

    // Asset-specific adjustments
    if (assetType === 'crypto') {
      // BTC correlation with S&P means it trades like risk asset now
      if (macro.correlation.btcSp500 > 0.4) {
        reasons.push(`BTC-S&P correlation at ${macro.correlation.btcSp500} - trades with risk sentiment`);
      }
      
      // Institutional adoption is supportive
      if (macro.sectorDrivers.institutionalAdoption === 'increasing') {
        biasAdj += 5;
        reasons.push('Institutional crypto adoption increasing');
      }
      
      // High inflation correlation
      if (macro.correlation.btcInflation > 0.5) {
        biasAdj += 3;
        reasons.push('BTC responding to inflation hedging flows');
      }
    }

    if (assetType === 'stock') {
      // AI spending impact
      if (macro.sectorDrivers.aiSpending === 'accelerating') {
        biasAdj += 5;
        reasons.push('AI capex driving growth');
      }
      
      // Mag7 valuation risk
      if (macro.sectorDrivers.magSevenValuation === 'extreme') {
        riskMult *= 1.3;
        confMult *= 0.85;
        reasons.push('Extreme tech valuations increase downside risk');
      }
    }

    // Geopolitical risk
    if (macro.geopolitical.tariffRisk === 'high') {
      riskMult *= 1.15;
      biasAdj -= 5;
      reasons.push('Trade policy uncertainty elevated');
    }

    // Inflation impact
    if (macro.inflation.level === 'elevated' || macro.inflation.level === 'high') {
      confMult *= 0.95;
      reasons.push(`Inflation at ${macro.inflation.cpi.value}% limiting Fed flexibility`);
    }

    return {
      biasAdjustment: Math.max(-30, Math.min(30, biasAdj)),
      confidenceMultiplier: Math.max(0.7, Math.min(1.3, confMult)),
      riskMultiplier: Math.max(0.8, Math.min(1.5, riskMult)),
      reasoning: reasons.join('. ')
    };
  }

  // Generate macro-enhanced prompt section for AI
  generateMacroPromptSection(macro: MacroSnapshot, assetType: 'stock' | 'crypto' | 'forex'): string {
    const adjustment = this.calculateMacroAdjustment(assetType, macro);
    
    return `
FEDERAL RESERVE & MACRO ENVIRONMENT (December 2025):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fed Funds Rate: ${macro.fedPolicy.currentRate.low}%-${macro.fedPolicy.currentRate.high}%
Last Action: ${macro.fedPolicy.lastChange.amount}% ${macro.fedPolicy.lastChange.action} on ${macro.fedPolicy.lastChange.date}
Policy Stance: ${macro.fedPolicy.policyStance.toUpperCase()} (${macro.fedPolicy.rateDirection} cycle)

INFLATION:
CPI: ${macro.inflation.cpi.value}% (${macro.inflation.cpi.trend}, target: ${macro.inflation.cpi.target}%)
PCE: ${macro.inflation.pce.value}% (${macro.inflation.pce.trend})
Assessment: ${macro.inflation.level.toUpperCase()}

EMPLOYMENT:
NFP Trend: ${macro.employment.nfp.trend}
Unemployment: ${macro.employment.unemploymentRate}%
Labor Market: ${macro.employment.laborMarket}

MARKET SENTIMENT:
Fear & Greed Index: ${macro.fearGreedIndex.value} (${macro.fearGreedIndex.label})
BTC-S&P500 Correlation: ${macro.correlation.btcSp500}
Risk Appetite: ${macro.correlation.riskAppetite.toUpperCase()}

KEY DRIVERS:
${assetType === 'crypto' ? `- Strategic Bitcoin Reserve (200,000+ BTC held by US government)
- Spot ETF institutional flows
- CLARITY Act & GENIUS Act regulatory clarity` : ''}
${assetType === 'stock' ? `- AI infrastructure spending: ${macro.sectorDrivers.aiSpending}
- Mag-7 valuations: ${macro.sectorDrivers.magSevenValuation}` : ''}
- Trade policy: ${macro.geopolitical.tradePolicy}
- Government status: ${macro.geopolitical.governmentStatus}

MACRO SIGNAL ADJUSTMENT:
Bias: ${adjustment.biasAdjustment > 0 ? '+' : ''}${adjustment.biasAdjustment} (${adjustment.biasAdjustment > 5 ? 'bullish' : adjustment.biasAdjustment < -5 ? 'bearish' : 'neutral'})
Confidence Modifier: ${(adjustment.confidenceMultiplier * 100 - 100).toFixed(0)}%
Risk Modifier: ${((adjustment.riskMultiplier - 1) * 100).toFixed(0)}%
Reasoning: ${adjustment.reasoning}

KEY RISKS: ${macro.keyRisks.slice(0, 3).join(' | ')}
OPPORTUNITIES: ${macro.opportunities.slice(0, 3).join(' | ')}

FACTOR THIS MACRO ENVIRONMENT INTO YOUR PRICE TARGETS AND RISK ASSESSMENT.`;
  }
}

export const macroPolicyService = new MacroPolicyService();
