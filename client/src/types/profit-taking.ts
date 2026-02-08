export interface ProfitTakingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'ladder' | 'target' | 'trailing';
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  parameters: {
    [key: string]: any;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfitTakingPlan {
  id: string;
  strategyId: string;
  coinSymbol: string;
  coinName: string;
  entryPrice: number;
  currentPrice: number;
  targetPrices: number[];
  sellPercentages: number[];
  executedSales: {
    price: number;
    percentage: number;
    amount: number;
    date: string;
  }[];
  totalProfitTaken: number;
  remainingAmount: number;
  status: 'Active' | 'Completed' | 'Paused';
  createdAt: string;
}

export interface ProfitTakingTemplate {
  id: string;
  name: string;
  description: string;
  strategy: string;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  targets: {
    percentage: number;
    sellAmount: number;
    description: string;
  }[];
  isPopular: boolean;
}

export interface MarketCondition {
  condition: 'Bull Market' | 'Bear Market' | 'Sideways' | 'Volatile';
  recommendedStrategy: string;
  description: string;
  color: string;
}