import { useQuery } from '@tanstack/react-query';
import { ProfessionalTrainingLayout, TrainingModule } from '@/components/professional-training-layout';
import { DollarSign } from 'lucide-react';

interface StrategyVariant {
  slug: string;
  title: string;
  variantKey: string;
  summary: string;
  isPrimary: boolean;
  category: string;
  risk: string;
}

interface GroupResponse {
  groupId: string;
  primaryStrategy: any;
  variants: StrategyVariant[];
}

const overnightIncomeModules: TrainingModule[] = [
  {
    id: 1,
    title: "The 2-Minute Overnight Setup System",
    description: "Learn the exact process to identify and execute overnight income trades in under 2 minutes.",
    duration: "20 min",
    content: {
      intro: "The Overnight Income Strategy generates consistent returns by exploiting the overnight theta decay in options. This system takes just 2 minutes to execute at market close and captures premium while you sleep. Professional traders have used this edge for decades - now you'll learn the exact methodology.",
      objectives: [
        "Understand why overnight options decay faster than daytime decay",
        "Master the 2-minute scanning and execution workflow",
        "Learn which stocks and ETFs work best for overnight income",
        "Calculate expected returns based on implied volatility levels"
      ],
      steps: [
        { step: 1, title: "Market Close Preparation (30 seconds)", detail: "At 3:55 PM EST, open your options chain for SPY, QQQ, or IWM. Look for options expiring tomorrow (0DTE next day). Check that IV is above 15% for adequate premium. Verify no major earnings or Fed announcements overnight." },
        { step: 2, title: "Strike Selection (45 seconds)", detail: "Identify the current price and select strikes 0.5-1% out of the money. For SPY at $450, sell the $447.50 put or $452.50 call. Check that you receive at least $0.30-0.50 in premium. The delta should be between 0.15-0.25 for optimal risk/reward." },
        { step: 3, title: "Order Execution (45 seconds)", detail: "Place a limit order at the mid-price or slightly below. If not filled in 30 seconds, adjust to natural price. Confirm your maximum loss (strike minus premium received times 100). Set a GTC order to buy back at $0.05 to capture 80%+ of premium." }
      ]
    }
  },
  {
    id: 2,
    title: "Optimal Underlying Selection",
    description: "Discover which stocks and ETFs provide the best overnight income opportunities.",
    duration: "25 min",
    content: {
      intro: "Not all underlyings work equally well for overnight income. The key is finding highly liquid options with tight spreads, adequate premium, and predictable overnight behavior. We focus on major ETFs and blue-chip stocks that move smoothly overnight.",
      objectives: [
        "Identify the top 10 underlyings for overnight income",
        "Understand liquidity requirements and spread analysis",
        "Learn to avoid earnings and event risk",
        "Build a watchlist optimized for overnight trades"
      ],
      steps: [
        { step: 1, title: "Tier 1 ETFs: SPY, QQQ, IWM", detail: "These are your bread and butter. SPY has the tightest spreads (often $0.01-0.02), highest liquidity (millions of contracts daily), and overnight moves are typically contained. QQQ works similarly but with slightly higher volatility. Trade these 80% of the time." },
        { step: 2, title: "Tier 2: Sector ETFs and Mega-Caps", detail: "XLF, XLE, XLK offer sector exposure with good liquidity. For stocks, focus on AAPL, MSFT, AMZN, GOOGL, META - all have weekly options with tight spreads. Avoid stocks under $50 (wider spreads) or with upcoming earnings." },
        { step: 3, title: "Building Your Overnight Watchlist", detail: "Create a list of 15-20 names sorted by IV rank. Higher IV = more premium. Check the earnings calendar weekly and remove any names with announcements. Rotate between ETFs and stocks based on which offers best risk-adjusted premium." }
      ]
    }
  },
  {
    id: 3,
    title: "Strike Price Mathematics",
    description: "Calculate the optimal strike prices for maximum profit probability.",
    duration: "30 min",
    content: {
      intro: "Strike selection is where most traders get it wrong. Too close to the money = too much risk. Too far out = not enough premium. This module teaches you the mathematical framework for finding the sweet spot that maximizes your long-term returns.",
      objectives: [
        "Calculate expected move using implied volatility",
        "Determine optimal strike distance for your risk tolerance",
        "Use delta as a probability indicator",
        "Adjust strikes based on market conditions"
      ],
      steps: [
        { step: 1, title: "Expected Move Calculation", detail: "Overnight expected move = Current Price × IV × √(1/252). For SPY at $450 with 20% IV: $450 × 0.20 × 0.063 = $5.67 expected overnight range. This means 1 standard deviation move is about $5.67, so selling the $444 put is roughly 1 SD away." },
        { step: 2, title: "Delta-Based Strike Selection", detail: "Delta approximates probability of expiring ITM. A 0.16 delta put has ~84% probability of expiring worthless (profit). For conservative traders, use 0.10-0.15 delta. For aggressive income, use 0.20-0.25 delta. Never exceed 0.30 delta overnight." },
        { step: 3, title: "Premium-to-Risk Ratio", detail: "Calculate: Premium Received ÷ Maximum Loss. Example: Sell $447 put for $0.50, max loss is $447 × 100 - $50 = $44,650 (but you'll stop out way before). Realistically, with a $2 stop, you're risking $200 to make $50 = 25% return on risk. This is your true ratio." }
      ]
    }
  },
  {
    id: 4,
    title: "Risk Management & Position Sizing",
    description: "Protect your capital with proper position sizing and defined risk limits.",
    duration: "25 min",
    content: {
      intro: "Overnight income sounds easy until you experience a gap against you. Proper position sizing ensures no single trade can significantly damage your account. This module establishes the risk framework that keeps you in the game long-term.",
      objectives: [
        "Calculate appropriate position sizes based on account size",
        "Set maximum overnight exposure limits",
        "Implement stop-loss protocols for gap protection",
        "Diversify across multiple underlyings"
      ],
      steps: [
        { step: 1, title: "The 1% Rule for Overnight Trades", detail: "Never risk more than 1% of your account on any single overnight position. For a $50,000 account, max risk = $500. If your stop-loss is $2 per contract, you can sell 2-3 contracts maximum. This protects you from the rare but inevitable gap moves." },
        { step: 2, title: "Maximum Overnight Exposure", detail: "Limit total overnight exposure to 5% of portfolio. With $50K, that's $2,500 max risk across all positions. This means spreading across 3-5 different underlyings, each with 1% risk. Never put all eggs in one basket overnight." },
        { step: 3, title: "Gap Protection Strategies", detail: "Always have a pre-planned response to gaps. If futures gap against you by more than 0.5%, close at market open regardless of loss. Use alerts on futures (/ES, /NQ) to wake you if overnight move exceeds expectations. Consider protective long options on large positions." }
      ]
    }
  },
  {
    id: 5,
    title: "Execution & Order Management",
    description: "Master the mechanics of entering, managing, and exiting overnight trades.",
    duration: "20 min",
    content: {
      intro: "Perfect execution can add 10-20% to your annual returns. Learning to get better fills, manage orders efficiently, and exit at optimal times separates profitable traders from break-even ones. These execution tactics are what professionals use.",
      objectives: [
        "Get better fills on entry and exit orders",
        "Set up automated profit-taking orders",
        "Manage positions through the overnight session",
        "Handle morning gap scenarios efficiently"
      ],
      steps: [
        { step: 1, title: "Entry Order Tactics", detail: "Never use market orders for options. Start with a limit order at the mid-price. Wait 15-30 seconds. If not filled, move $0.01-0.02 toward the natural (for selling, that means lowering your price). Most fills happen within $0.02-0.03 of mid." },
        { step: 2, title: "GTC Profit Orders", detail: "Immediately after fill, place a GTC (Good Till Cancelled) order to buy back at $0.05 or 80% of premium received. This automates your exit and captures maximum theta decay. If you sold for $0.50, set buy order at $0.10." },
        { step: 3, title: "Morning Management Protocol", detail: "Check futures at 9:00 AM EST. If within expected range, hold for expiration or GTC order fill. If gapped against your position, evaluate at market open (9:30 AM). Close immediately if loss exceeds 2x premium received. Let winners ride to expiration." }
      ]
    }
  },
  {
    id: 6,
    title: "Weekly Income Scheduling",
    description: "Structure your trading week for consistent overnight income generation.",
    duration: "20 min",
    content: {
      intro: "Consistency comes from routine. This module shows you how to structure your trading week to maximize overnight income opportunities while avoiding dangerous periods. Professional traders follow strict schedules - you should too.",
      objectives: [
        "Build a weekly overnight trading schedule",
        "Identify the best and worst days for overnight income",
        "Avoid major risk events and Fed days",
        "Track and analyze your weekly performance"
      ],
      steps: [
        { step: 1, title: "Optimal Trading Days", detail: "Monday-Thursday nights are prime overnight income time. Avoid Friday night (weekend theta already priced in). Best nights: Tuesday and Wednesday (mid-week stability). Avoid: Sunday night into Monday (weekend gap risk), nights before Fed announcements or CPI." },
        { step: 2, title: "Economic Calendar Awareness", detail: "Check the economic calendar every Sunday. Mark Fed meetings, CPI, PPI, employment reports. Do NOT trade overnight before these events - gap risk is 3-5x normal. Even non-farm payroll can gap SPY $3-5 at open." },
        { step: 3, title: "Weekly Performance Tracking", detail: "Log every trade: date, underlying, strike, premium received, outcome. Calculate weekly win rate (target: 80%+) and weekly return on capital (target: 1-2%). Review losing trades to identify patterns. Adjust your strikes if win rate drops below 75%." }
      ]
    }
  },
  {
    id: 7,
    title: "Advanced Overnight Strategies",
    description: "Take your overnight income to the next level with spread strategies.",
    duration: "30 min",
    content: {
      intro: "Once you master basic overnight puts and calls, you can enhance returns and reduce risk with spread strategies. Iron condors, strangles, and defined-risk spreads offer different risk/reward profiles for various market conditions.",
      objectives: [
        "Execute overnight iron condors for range-bound markets",
        "Use put spreads to define maximum risk",
        "Implement strangle strategies for higher income",
        "Adjust strategies based on VIX levels"
      ],
      steps: [
        { step: 1, title: "Overnight Iron Condors", detail: "Sell both an OTM put and OTM call, buy further OTM options for protection. Example: SPY at $450 - sell $447P and $453C, buy $445P and $455C. Collect premium on both sides with defined risk. Best when VIX is elevated (>20) and you expect rangebound action." },
        { step: 2, title: "Put Credit Spreads for Defined Risk", detail: "Instead of naked puts, sell a put spread: sell the $447P, buy the $445P. You collect less premium but max loss is capped at $200 minus premium. This allows larger position sizes with known max risk. Use when you're bullish overnight." },
        { step: 3, title: "VIX-Based Strategy Selection", detail: "VIX < 15: Avoid overnight trades (insufficient premium). VIX 15-20: Standard single leg puts/calls. VIX 20-25: Iron condors and spreads (elevated premium). VIX > 25: Be cautious, use wider strikes and smaller size. Adjust your approach based on fear levels." }
      ]
    }
  },
  {
    id: 8,
    title: "Building Your Overnight Income Business",
    description: "Scale your overnight strategy into a consistent income stream.",
    duration: "25 min",
    content: {
      intro: "Overnight income trading can become a reliable business generating 3-8% monthly returns when executed systematically. This module shows you how to scale up properly, compound your gains, and build this into a sustainable income stream.",
      objectives: [
        "Calculate realistic monthly income projections",
        "Scale position sizes as account grows",
        "Compound returns for accelerated growth",
        "Maintain discipline during drawdowns"
      ],
      steps: [
        { step: 1, title: "Realistic Return Expectations", detail: "With an 80% win rate and 20-30% return on risk per trade, expect 15-25% average monthly return on capital at risk (not total account). If you're risking 5% of a $50K account nightly, that's $2,500 at risk. At 20% return = $500/month = 1% total account return. Scale up as you prove consistency." },
        { step: 2, title: "Scaling Your Position Size", detail: "Only increase size after 30+ consecutive profitable weeks. Increase by 25% maximum per step. If you hit a losing streak (3+ losses in a row), reduce size by 50% until you're profitable for 2 weeks. Never let ego drive position sizing." },
        { step: 3, title: "The Compounding Machine", detail: "Reinvest 50% of profits, withdraw 50%. This balances growth with income realization. A $50K account growing at 1% monthly (compounded) = $56,500 after year one. Combined with withdrawals, you've made $3,250 in income plus $6,500 in growth. That's 19.5% total return with moderate risk." }
      ]
    }
  }
];

const creditSpreadModules: TrainingModule[] = [
  {
    id: 1,
    title: "Credit Spread Fundamentals",
    description: "Master the core mechanics of bull put spreads and bear call spreads.",
    duration: "25 min",
    content: {
      intro: "Credit spreads are the foundation of professional options income trading. By selling one option and buying another further out-of-the-money, you create defined-risk positions that generate consistent income with 60-80% win rates. This strategy is used by hedge funds and market makers worldwide.",
      objectives: [
        "Understand how credit spreads work mechanically",
        "Differentiate between bull put spreads and bear call spreads",
        "Calculate maximum profit, maximum loss, and breakeven",
        "Identify optimal market conditions for each spread type"
      ],
      steps: [
        { step: 1, title: "Bull Put Spread Mechanics", detail: "A bull put spread is BULLISH: sell a put, buy a lower strike put. Example: Stock at $100 - sell $95 put for $2.00, buy $90 put for $0.80. Net credit = $1.20. Max profit = $1.20 if stock stays above $95. Max loss = $5.00 - $1.20 = $3.80 if stock falls below $90." },
        { step: 2, title: "Bear Call Spread Mechanics", detail: "A bear call spread is BEARISH: sell a call, buy a higher strike call. Example: Stock at $100 - sell $105 call for $1.80, buy $110 call for $0.60. Net credit = $1.20. Max profit = $1.20 if stock stays below $105. Max loss = $5.00 - $1.20 = $3.80 if stock rises above $110." },
        { step: 3, title: "Breakeven Calculation", detail: "Bull put breakeven = short strike - credit received ($95 - $1.20 = $93.80). Bear call breakeven = short strike + credit received ($105 + $1.20 = $106.20). You win if the stock stays above/below the breakeven at expiration." }
      ]
    }
  },
  {
    id: 2,
    title: "Strike Selection & Probability",
    description: "Learn to select strikes that maximize your probability of profit.",
    duration: "30 min",
    content: {
      intro: "The difference between profitable and losing credit spread traders is strike selection. We use probability-based analysis and delta to select strikes that give us the highest chance of keeping our premium while still collecting meaningful income.",
      objectives: [
        "Use delta as probability of profit indicator",
        "Calculate expected value of different strike combinations",
        "Adjust strike width for risk/reward optimization",
        "Identify the probability sweet spot (60-75%)"
      ],
      steps: [
        { step: 1, title: "Delta and Probability", detail: "The short strike's delta approximates your probability of that strike being breached. A 0.30 delta means ~30% chance of being ITM at expiration = 70% probability of profit. Target delta between 0.25-0.35 for optimal income vs. risk balance. Lower delta = higher win rate but less premium." },
        { step: 2, title: "Spread Width Decision", detail: "Narrow spreads ($2.50-$5) = less capital required, lower absolute profit, higher percentage return. Wide spreads ($10-$20) = more capital, higher absolute profit, lower percentage return. For most traders, $5 wide spreads offer the best balance. Use $2.50 on stocks under $50." },
        { step: 3, title: "The 1/3 Rule for Credit", detail: "Aim to collect at least 1/3 of the spread width in credit. For a $5 wide spread, collect at least $1.67. This gives you 2:1 risk/reward. If you can only collect $1.00 on a $5 spread, the setup isn't worth it - you're risking $4 to make $1 with only 60-70% win rate." }
      ]
    }
  },
  {
    id: 3,
    title: "Entry Timing & Market Analysis",
    description: "Identify optimal entry points for credit spread trades.",
    duration: "25 min",
    content: {
      intro: "Entry timing can improve your win rate by 10-15%. This module teaches you to read market conditions and enter credit spreads when the odds are most in your favor. We use technical levels, volatility analysis, and trend assessment for optimal timing.",
      objectives: [
        "Identify support and resistance levels for spread placement",
        "Use implied volatility rank for entry timing",
        "Assess trend direction for spread type selection",
        "Avoid entering before major events"
      ],
      steps: [
        { step: 1, title: "Support/Resistance Placement", detail: "Place your short strike behind strong support (for bull puts) or resistance (for bear calls). Check the daily chart for previous pivot highs/lows, moving averages (50, 200 day), and round numbers. Your short strike should be at a level you believe won't be breached." },
        { step: 2, title: "IV Rank Analysis", detail: "IV Rank compares current IV to the past year. Above 50% = elevated IV = more premium = good for credit spreads. Below 30% = IV is low = less premium = consider waiting. Best entries: IV Rank 40-70% with neutral to favorable trend. Use tools like Barchart or TradingView for IV data." },
        { step: 3, title: "Trend Alignment", detail: "Trade with the trend. In uptrends, favor bull put spreads (selling puts below price). In downtrends, favor bear call spreads (selling calls above price). In sideways markets, iron condors (both). Never fight the trend - it's the biggest predictor of spread success." }
      ]
    }
  },
  {
    id: 4,
    title: "Position Sizing for Credit Spreads",
    description: "Calculate optimal position sizes to protect capital and maximize returns.",
    duration: "20 min",
    content: {
      intro: "Position sizing is the most important factor in long-term credit spread profitability. Too small and you won't make meaningful income. Too large and one losing streak wipes out months of gains. This module establishes your sizing framework.",
      objectives: [
        "Apply the 2-5% rule for credit spread sizing",
        "Calculate number of contracts based on account size",
        "Manage portfolio delta and sector exposure",
        "Scale positions based on conviction level"
      ],
      steps: [
        { step: 1, title: "Max Risk Per Trade", detail: "Risk 2-5% of your account per credit spread position. For a $50,000 account with $200 max loss per spread: 2% risk = $1,000 = 5 spreads maximum. 5% risk = $2,500 = 12 spreads maximum. Start at 2% until you have 50+ trades of experience." },
        { step: 2, title: "Portfolio Concentration Limits", detail: "Never have more than 20% of your account at risk across all positions. With $50K and 5 positions at 2% each = 10% at risk = good. Limit single sector exposure to 10% (don't have 5 tech credit spreads open). Diversify across sectors and market cap." },
        { step: 3, title: "Conviction-Based Sizing", detail: "High conviction setups (strong support, favorable IV, with trend): size at 4-5% risk. Medium conviction: 2-3% risk. Low conviction or experimental: 1-2% risk. Never exceed 5% on a single spread regardless of conviction." }
      ]
    }
  },
  {
    id: 5,
    title: "Managing Winning Trades",
    description: "Learn when and how to take profits on successful credit spreads.",
    duration: "20 min",
    content: {
      intro: "Most traders know how to enter but struggle with when to exit winners. Taking profits too early leaves money on the table; holding too long exposes you to gamma risk near expiration. This module teaches professional profit-taking techniques.",
      objectives: [
        "Set profit targets at 50%, 75%, and max profit",
        "Understand time decay acceleration near expiration",
        "Use rolling strategies to extend winners",
        "Calculate annualized returns for early exit decisions"
      ],
      steps: [
        { step: 1, title: "The 50% Profit Rule", detail: "Close credit spreads when you've captured 50% of max profit. If you collected $1.50, buy back the spread for $0.75. This captures the 'easy' part of the profit while avoiding gamma risk. 50% in 10 days is better than 80% in 30 days from a return-on-time perspective." },
        { step: 2, title: "Time Decay Curve", detail: "Theta decay accelerates exponentially in the final 2 weeks. A spread decaying $0.02/day in week 3 might decay $0.10/day in the final week. If you're at 50% profit with 7+ days left, seriously consider closing. If at 80% profit with 2 days left, hold for max profit." },
        { step: 3, title: "Rolling Winners for More Credit", detail: "If you've hit 50% profit quickly (under 5 days), consider rolling to the next expiration for additional credit. Buy back current spread for $0.75, sell new spread 30 days out for $1.40. You've locked in $0.75 profit and have potential for $1.40 more. Only do this if the setup still looks good." }
      ]
    }
  },
  {
    id: 6,
    title: "Managing Losing Trades",
    description: "Protect capital with proper loss management and adjustment strategies.",
    duration: "30 min",
    content: {
      intro: "Losses are inevitable in credit spread trading. The key is limiting their size and learning from each one. This module covers stop-losses, adjustment strategies, and the psychology of taking losses gracefully.",
      objectives: [
        "Set and honor stop-loss levels at 2x credit received",
        "Execute rolling adjustments to manage threatened positions",
        "Know when to take the loss vs. when to adjust",
        "Perform post-trade analysis on losing trades"
      ],
      steps: [
        { step: 1, title: "The 2x Stop Rule", detail: "Close any credit spread when the loss equals 2x the credit received. If you collected $1.50, close when the spread costs $4.50 to buy back (losing $3.00). This caps your loss at 2x credit, keeping your overall expectancy positive even with 30-35% loss rate." },
        { step: 2, title: "Rolling for Defense", detail: "If your short strike is being tested but hasn't breached: roll down (puts) or up (calls) to a further OTM strike. You'll pay a debit to close and receive a smaller credit to open. Only roll if net debit is less than max loss, and you still believe in the trade direction." },
        { step: 3, title: "When to Just Take the Loss", detail: "Take the loss immediately if: (1) Stock gaps through your spread with momentum, (2) Fundamental news changes your thesis, (3) You're already at 2x loss and adjustment would increase risk. It's okay to lose - it's not okay to let a small loss become catastrophic." }
      ]
    }
  },
  {
    id: 7,
    title: "Weekly Credit Spread System",
    description: "Build a systematic weekly income process with credit spreads.",
    duration: "25 min",
    content: {
      intro: "Consistency comes from process. This module establishes your weekly credit spread routine - when to scan, when to enter, when to manage, and how to track performance. Follow this system and credit spreads become a reliable income stream.",
      objectives: [
        "Build your weekly trading schedule",
        "Create a systematic scanning process",
        "Establish review and journaling habits",
        "Track key performance metrics"
      ],
      steps: [
        { step: 1, title: "Weekly Schedule", detail: "Sunday: Review economic calendar, plan the week. Monday: Scan for setups, enter 1-2 positions. Tuesday-Wednesday: Additional entries if premium is attractive. Thursday: Management day - take profits on positions at 50%+. Friday: Close any positions at 80%+ profit, avoid new entries (weekend decay already priced in)." },
        { step: 2, title: "Daily 15-Minute Routine", detail: "Morning (9:30 AM): Check any positions near your strikes. Midday: No action needed unless stop triggered. 3:30 PM: Scan for new setups, check profit targets. Execute any closes or new entries. Total time: 15-20 minutes per day maximum." },
        { step: 3, title: "Performance Metrics to Track", detail: "Win rate (target: 65-80%). Average winner vs average loser (target: 1:1.5 or better). Monthly return on capital (target: 3-8%). Max drawdown (should never exceed 15%). Track these weekly and monthly. If metrics slip, reduce size and review trades." }
      ]
    }
  },
  {
    id: 8,
    title: "Scaling to Consistent Monthly Income",
    description: "Grow your credit spread income to a meaningful monthly cash flow.",
    duration: "25 min",
    content: {
      intro: "Credit spreads can generate 3-10% monthly returns on capital at risk, translating to consistent income. This module shows you how to scale up responsibly and build credit spread trading into a reliable income stream.",
      objectives: [
        "Calculate realistic monthly income projections",
        "Scale position sizes as account and experience grow",
        "Manage multiple positions across different underlyings",
        "Build toward full-time income potential"
      ],
      steps: [
        { step: 1, title: "Income Projections", detail: "Conservative: 3% monthly on capital at risk = $150/month per $5,000 at risk. Moderate: 5% monthly = $250/month per $5K. Aggressive: 8% monthly = $400/month per $5K. With $50K account risking 20% ($10K) = $300-800/month. Scale requires more capital or more risk (not recommended to exceed 25% at risk)." },
        { step: 2, title: "Scaling Milestones", detail: "Phase 1 (0-50 trades): Max 2% risk per trade, 10% total. Phase 2 (50-200 trades): Max 3% risk per trade, 15% total. Phase 3 (200+ trades): Max 5% risk per trade, 20% total. Never skip phases. Consistency at lower levels earns the right to scale." },
        { step: 3, title: "Full-Time Income Math", detail: "To replace a $60K salary, you need $5K/month. At 5% return on 20% capital at risk, you need: $5K ÷ 5% ÷ 20% = $500K account. More realistically, a $200K account at 5% on 25% at risk = $2.5K/month = solid supplemental income. Build gradually; don't quit your job until you have 2 years of consistent results." }
      ]
    }
  }
];

export default function OptionsIncomeTraining() {
  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/options-income'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading Options Income Training...</div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">No training data found</div>
      </div>
    );
  }

  const customModules = {
    'overnight-income': overnightIncomeModules,
    'credit-spread': creditSpreadModules
  };

  return (
    <ProfessionalTrainingLayout
      groupId="options-income"
      groupTitle="Options Income & Overnight Trading"
      groupDescription="Master consistent income generation through systematic options trading strategies including credit spreads and overnight setups"
      groupIcon={<DollarSign className="w-8 h-8 text-green-400" />}
      accentColor="green"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
      customModules={customModules}
    />
  );
}
