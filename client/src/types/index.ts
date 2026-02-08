export interface PortfolioData {
  totalValue: string;
  dailyIncome: string;
  dailyChange: string;
  incomeChange: string;
  avgAPR: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ActiveStrategy {
  id: string;
  name: string;
  protocol: string;
  chain: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  amount: string;
  apr: string;
  dailyEarnings: string;
  monthlyEarnings: string;
  status: 'Active' | 'Paused' | 'Exited';
  icon: string;
  color: string;
}

export interface ProtocolData {
  id: string;
  name: string;
  chain: string;
  category: string;
  minAPR: string;
  maxAPR: string;
  tvl: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  icon: string;
  color: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  icon: string;
  color: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
}

export interface ExitStrategyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actions: Array<{
    label: string;
    action: string;
  }>;
}
