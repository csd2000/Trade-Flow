import { ProfitTakingTemplate, MarketCondition } from '../types/profit-taking';

export const profitTakingTemplates: ProfitTakingTemplate[] = [
  {
    id: 'conservative-ladder',
    name: 'Conservative Ladder',
    description: 'Safe, steady profit-taking with small increments',
    strategy: 'Ladder Selling',
    riskLevel: 'Conservative',
    isPopular: true,
    targets: [
      { percentage: 25, sellAmount: 10, description: 'First profit at 25% gain' },
      { percentage: 50, sellAmount: 20, description: 'Second profit at 50% gain' },
      { percentage: 75, sellAmount: 30, description: 'Major profit at 75% gain' },
      { percentage: 100, sellAmount: 25, description: 'Final profit at 100% gain' },
      { percentage: 150, sellAmount: 15, description: 'Bonus profit if continues' }
    ]
  },
  {
    id: 'aggressive-targets',
    name: 'Aggressive Targets',
    description: 'High-risk, high-reward strategy for bull markets',
    strategy: 'Target Selling',
    riskLevel: 'Aggressive',
    isPopular: true,
    targets: [
      { percentage: 50, sellAmount: 15, description: 'Early profit securing' },
      { percentage: 100, sellAmount: 25, description: 'Double your money' },
      { percentage: 200, sellAmount: 30, description: 'Triple your investment' },
      { percentage: 300, sellAmount: 20, description: 'Quadruple profits' },
      { percentage: 500, sellAmount: 10, description: 'Moon shot profits' }
    ]
  },
  {
    id: 'moderate-balanced',
    name: 'Balanced Strategy',
    description: 'Perfect balance of risk and reward',
    strategy: 'Balanced Selling',
    riskLevel: 'Moderate',
    isPopular: true,
    targets: [
      { percentage: 30, sellAmount: 20, description: 'Secure initial profits' },
      { percentage: 60, sellAmount: 25, description: 'Take substantial gains' },
      { percentage: 100, sellAmount: 30, description: 'Major profit milestone' },
      { percentage: 150, sellAmount: 15, description: 'Extended bull run' },
      { percentage: 200, sellAmount: 10, description: 'Exceptional performance' }
    ]
  },
  {
    id: 'fibonacci-retracement',
    name: 'Fibonacci Levels',
    description: 'Technical analysis based profit-taking',
    strategy: 'Fibonacci Selling',
    riskLevel: 'Moderate',
    isPopular: false,
    targets: [
      { percentage: 38.2, sellAmount: 15, description: 'Fibonacci 38.2% level' },
      { percentage: 61.8, sellAmount: 25, description: 'Fibonacci 61.8% level' },
      { percentage: 100, sellAmount: 30, description: 'Fibonacci 100% level' },
      { percentage: 161.8, sellAmount: 20, description: 'Fibonacci 161.8% level' },
      { percentage: 261.8, sellAmount: 10, description: 'Fibonacci 261.8% level' }
    ]
  },
  {
    id: 'trailing-stop',
    name: 'Trailing Stop Strategy',
    description: 'Dynamic profit-taking that adjusts with price',
    strategy: 'Trailing Stop',
    riskLevel: 'Moderate',
    isPopular: false,
    targets: [
      { percentage: 20, sellAmount: 25, description: 'Initial trailing stop at 20%' },
      { percentage: 40, sellAmount: 25, description: 'Adjust stop to 40%' },
      { percentage: 60, sellAmount: 25, description: 'Adjust stop to 60%' },
      { percentage: 80, sellAmount: 25, description: 'Final trailing adjustment' }
    ]
  }
];

export const marketConditions: MarketCondition[] = [
  {
    condition: 'Bull Market',
    recommendedStrategy: 'Aggressive Targets',
    description: 'Markets trending strongly upward - maximize gains',
    color: 'text-crypto-primary'
  },
  {
    condition: 'Bear Market', 
    recommendedStrategy: 'Conservative Ladder',
    description: 'Markets declining - secure profits quickly',
    color: 'text-crypto-red'
  },
  {
    condition: 'Sideways',
    recommendedStrategy: 'Balanced Strategy',
    description: 'Markets consolidating - balanced approach',
    color: 'text-crypto-amber'
  },
  {
    condition: 'Volatile',
    recommendedStrategy: 'Trailing Stop Strategy',
    description: 'High volatility - dynamic profit-taking',
    color: 'text-crypto-purple'
  }
];

export const profitTakingTips = [
  {
    title: 'Never Sell Everything at Once',
    description: 'Always keep some position for potential further gains',
    icon: '🎯'
  },
  {
    title: 'Set Targets Before You Buy',
    description: 'Plan your exit strategy before entering any position',
    icon: '📋'
  },
  {
    title: 'Use Dollar-Cost Averaging Out',
    description: 'Just like DCA in, DCA out by selling in increments',
    icon: '⚖️'
  },
  {
    title: 'Consider Market Conditions',
    description: 'Adjust your strategy based on overall market sentiment',
    icon: '📊'
  },
  {
    title: 'Keep Emotions in Check',
    description: 'Stick to your plan regardless of FOMO or fear',
    icon: '🧠'
  },
  {
    title: 'Track and Analyze',
    description: 'Review your profit-taking performance regularly',
    icon: '📈'
  }
];