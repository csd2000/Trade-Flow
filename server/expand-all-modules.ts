import { db } from "./db";
import { enhancedTrainingModules, enhancedTrainingStrategies } from "@shared/schema";
import { eq } from "drizzle-orm";

// Comprehensive content generator for all training modules
export async function expandAllModules() {
  console.log("🚀 Starting comprehensive module content expansion...");
  
  // Get all strategies
  const strategies = await db
    .select()
    .from(enhancedTrainingStrategies)
    .where(eq(enhancedTrainingStrategies.isActive, true));
  
  console.log(`📊 Found ${strategies.length} active strategies`);
  
  let totalExpanded = 0;
  
  for (const strategy of strategies) {
    console.log(`\n📘 Expanding ${strategy.title} (${strategy.slug})...`);
    
    // Get all modules for this strategy
    const modules = await db
      .select()
      .from(enhancedTrainingModules)
      .where(eq(enhancedTrainingModules.strategyId, strategy.id))
      .orderBy(enhancedTrainingModules.moduleNumber);
    
    for (const module of modules) {
      const expandedContent = generateComprehensiveContent(
        strategy,
        module.moduleNumber,
        module.title
      );
      
      await db
        .update(enhancedTrainingModules)
        .set({ content: expandedContent })
        .where(eq(enhancedTrainingModules.id, module.id));
      
      totalExpanded++;
      console.log(`  ✅ Module ${module.moduleNumber}: ${module.title}`);
    }
  }
  
  console.log(`\n🎉 Expansion complete! Updated ${totalExpanded} modules across ${strategies.length} strategies`);
  return { totalExpanded, strategiesCount: strategies.length };
}

function generateComprehensiveContent(
  strategy: any,
  moduleNumber: number,
  title: string
) {
  const moduleTitles = [
    "Strategy Overview & Fundamentals",
    "Market Analysis & Setup",
    "Entry Signals & Timing",
    "Risk Management Protocol",
    "Exit Strategies & Profit Taking",
    "Live Trading Practice",
    "Learning Psychology & Habit Formation",
    "Performance Tracking & Improvement"
  ];
  
  const baseContent = {
    sections: [] as any[]
  };
  
  // Module-specific content generation
  switch (moduleNumber) {
    case 1: // Overview & Fundamentals
      baseContent.sections = [
        {
          type: "text",
          title: "Introduction to " + strategy.title,
          content: `Welcome to ${strategy.title}, a comprehensive trading education program designed to transform your approach to the markets. This module establishes the foundational knowledge you'll need to successfully implement this strategy in live market conditions.

Throughout this course, you'll learn systematic approaches to identifying opportunities, managing risk, and executing trades with confidence. Whether you're completely new to ${strategy.category} or have some experience, this step-by-step framework will guide you from concept to consistent execution.

This strategy focuses on ${strategy.summary} By the end of this training, you'll have a complete, battle-tested system that you can apply immediately to generate returns while managing risk appropriately.`
        },
        {
          type: "text",
          title: "What You'll Learn",
          content: `This module covers the essential foundations of ${strategy.title}:

• Core concepts and terminology specific to this trading approach
• The psychological mindset required for successful implementation
• Account setup requirements and capital allocation strategies  
• How this strategy fits within your overall trading plan
• Common mistakes to avoid when starting out
• Realistic expectations for timeframes and returns

You'll understand exactly how this strategy works, when to use it, and how to integrate it with your existing trading activities or investment portfolio.`
        },
        {
          type: "list",
          title: "Prerequisites & Requirements",
          content: [
            `Basic understanding of ${strategy.category} markets and instruments`,
            "Trading account with appropriate funding based on your risk tolerance",
            "Access to charting software or trading platform with technical analysis tools",
            "Minimum 5-10 hours per week dedicated to learning and practice",
            "Journal or spreadsheet for tracking trades and progress",
            "Understanding of basic risk management principles"
          ]
        },
        {
          type: "text",
          title: "Strategy Philosophy",
          content: `The ${strategy.title} is built on fundamental principles that have proven effective across different market conditions:

**Risk-First Approach**: We always consider potential losses before potential gains. Every trade begins with identifying your maximum acceptable loss and position sizing accordingly.

**Systematic Execution**: This isn't about gut feelings or predictions. You'll follow specific, repeatable criteria for every decision - entry, exit, and position management.

**Continuous Improvement**: Trading is a skill that develops over time. This program includes built-in review and optimization processes to ensure you're constantly refining your approach.

Expected ROI range for this strategy: ${strategy.roiRange || "10-30% annually"} (varies based on market conditions and implementation quality).`
        },
        {
          type: "text",
          title: "Getting Started Checklist",
          content: `Before proceeding to the next module, ensure you have completed these essential setup steps:

□ Review your risk tolerance and determine appropriate position sizing
□ Set up your trading account with necessary permissions and funding
□ Install and configure required charting/analysis tools
□ Create a trading journal template for tracking all activities
□ Block dedicated time in your schedule for daily market analysis
□ Join the community forum to connect with other traders
□ Download the strategy workbook and supplementary materials

Take time to properly complete each item. Rushing through setup leads to costly mistakes later. The traders who succeed are those who build strong foundations before taking their first trade.`
        }
      ];
      break;
      
    case 2: // Market Analysis & Setup
      baseContent.sections = [
        {
          type: "text",
          title: "Market Analysis Framework",
          content: `Successful implementation of ${strategy.title} requires understanding current market conditions and identifying high-probability setups. This module teaches you a systematic approach to market analysis that works consistently.

You'll learn to scan markets efficiently, identify the best opportunities, and filter out low-probability setups that waste time and capital. The analysis framework covered here forms the foundation for every trading decision you'll make.

Professional traders don't analyze every stock, currency pair, or cryptocurrency. They use specific criteria to quickly identify the handful of opportunities worth their attention. You'll learn this same filtering process.`
        },
        {
          type: "list",
          title: "Step-by-Step Analysis Process",
          content: [
            "Identify overall market trend using major indices and sentiment indicators",
            "Screen for candidates meeting specific technical or fundamental criteria",
            "Analyze volume patterns and confirm institutional participation",
            "Identify key support and resistance levels using multiple timeframes",
            "Check for upcoming events or catalysts that could impact the trade",
            "Assess relative strength compared to broader market or sector",
            "Calculate potential reward-to-risk ratio before considering entry",
            "Document your analysis in your trading journal for future review"
          ]
        },
        {
          type: "text",
          title: "Tools & Resources",
          content: `To effectively implement this market analysis framework, you'll need access to specific tools:

**Charting Platform**: Use TradingView, Thinkorswim, or your broker's platform. Ensure you can view multiple timeframes simultaneously and add custom indicators.

**Screening Tools**: Set up screeners based on the specific criteria for this strategy. Save these screens to run daily before market open.

**Economic Calendar**: Track important economic releases, earnings announcements, and other events that could create volatility.

**Volume Analysis**: Confirm institutional participation using volume analysis tools and techniques taught in this module.

The right tools amplify your edge. Free alternatives exist for most capabilities - you don't need expensive subscriptions to get started.`
        },
        {
          type: "text",
          title: "Practice Exercise",
          content: `This week, complete the following practice exercise without risking real capital:

1. Run your screening criteria daily and identify 3-5 potential setups
2. Document why each setup meets the criteria (screenshots helpful)
3. Forecast where you would enter, set your stop loss, and take profit
4. Track how these setups perform over the next 5 trading days
5. Review what worked and what didn't in your journal

This simulation builds pattern recognition skills and helps you internalize the setup criteria. Most successful traders paper trade for at least 2-4 weeks before risking real money on a new strategy.`
        }
      ];
      break;
      
    case 3: // Entry Signals & Timing
      baseContent.sections = [
        {
          type: "text",
          title: "Mastering Entry Timing",
          content: `The difference between a winning trade and a losing trade often comes down to entry timing. This module reveals the specific signals that indicate the optimal entry point for ${strategy.title}.

You'll learn to identify the exact moment when probability shifts in your favor, how to avoid entering too early or too late, and techniques for improving your entry precision over time.

Great entry timing accomplishes three critical objectives: minimizes initial risk, maximizes potential reward, and provides clear invalidation points if the setup fails.`
        },
        {
          type: "list",
          title: "Entry Signal Checklist",
          content: [
            "Price action confirmation - specific candle patterns or price movements",
            "Volume surge confirming institutional participation at entry level",
            "Momentum indicators aligned with trade direction",
            "Break and retest of key technical levels completed",
            "Timeframe alignment - all relevant timeframes confirm the setup",
            "Risk-reward ratio meets minimum threshold (typically 2:1 or better)",
            "No conflicting signals or red flags present",
            "Entry can be executed at planned price within acceptable slippage"
          ]
        },
        {
          type: "text",
          title: "Entry Techniques",
          content: `Different market conditions require different entry approaches:

**Breakout Entries**: Enter as price breaks above resistance or below support with expanding volume. Set entry orders slightly above/below the level to ensure execution.

**Pullback Entries**: Wait for price to test support after an uptrend (or resistance after downtrend). Enter when rejection is confirmed. Offers better risk-reward but requires patience.

**Scale-In Entries**: Take partial position at first signal, add to position as setup confirms. Reduces impact of poor timing on individual entry.

For ${strategy.title}, the recommended primary approach is [breakout/pullback/scale-in depending on strategy type]. Most traders achieve best results using this method combined with the specific criteria outlined in your strategy workbook.`
        },
        {
          type: "text",
          title: "Common Entry Mistakes",
          content: `Avoid these frequent errors that turn good setups into losing trades:

× **FOMO Entries**: Chasing price after it's already moved. If you missed the entry, let it go. Another opportunity will come.

× **Premature Entries**: Entering before all criteria are met "just in case" it works. Stick to your rules.

× **Oversized Positions**: Taking larger position than your risk management allows because you're "sure" about this one. Size according to stop distance, not conviction.

× **Ignoring Context**: Taking technically valid setups when broader market or fundamentals are clearly against you.

× **Revenge Trading**: Taking marginal setups to make back losses quickly. This compounds problems.

Success comes from taking only the highest-probability setups and executing them perfectly, not from trading more frequently.`
        }
      ];
      break;
      
    case 4: // Risk Management Protocol
      baseContent.sections = [
        {
          type: "text",
          title: "The Foundation of Trading Success",
          content: `Risk management isn't just important - it's the difference between traders who build wealth over time and those who blow up their accounts. This module covers the specific risk protocols for ${strategy.title}.

You'll learn exact position sizing formulas, stop loss placement techniques, and portfolio-level risk controls that protect your capital while allowing enough exposure to profit from good setups.

Professional traders can have win rates below 50% and still be consistently profitable. The secret? Exceptional risk management that keeps losses small while letting winners run.`
        },
        {
          type: "list",
          title: "Risk Management Rules",
          content: [
            "Never risk more than 1-2% of total account on any single trade",
            "Position size based on stop loss distance, not conviction or opportunity size",
            "Set maximum daily loss limit (typically 3-6% of account)",
            "Define maximum number of concurrent positions to prevent overexposure",
            "Use stop losses on every trade - no exceptions",
            "Adjust position sizes based on recent performance (scale down after losses)",
            "Keep emergency cash reserve for account recovery if needed",
            "Review and adjust risk parameters quarterly based on account growth"
          ]
        },
        {
          type: "text",
          title: "Position Sizing Formula",
          content: `Use this exact formula for every trade to ensure consistent risk management:

**Position Size = (Account Risk) / (Entry Price - Stop Loss Price)**

Example: $10,000 account, risking 2% per trade ($200)
Entry: $50, Stop Loss: $48
Position Size = $200 / ($50 - $48) = 100 shares

If stop loss distance requires position size smaller than your broker's minimum, skip the trade. Never compromise risk management to force a trade.

For ${strategy.title}, typical stop loss distances range from [X%] to [Y%] depending on volatility and timeframe. Adjust accordingly while maintaining your maximum per-trade risk percentage.`
        },
        {
          type: "text",
          title: "Stop Loss Placement",
          content: `Stop loss placement is both science and art. Here are the specific techniques for this strategy:

**Technical Level Stops**: Place stops beyond key support/resistance levels where your trade thesis would be invalidated. Add buffer for volatility.

**ATR-Based Stops**: Use Average True Range to set stops at 1.5-2x ATR below entry (for longs). Automatically adjusts to market volatility.

**Time-Based Stops**: If trade hasn't moved in your direction within [X] time periods, exit. Prevents capital being tied up in dead positions.

**Trailing Stops**: Once trade moves [X%] in your favor, move stop to breakeven. Continue trailing stop as trade develops.

Never move stops further away from entry to "give the trade more room." This is how small losses become large ones. If price hits your stop, the setup failed. Accept it and move on.`
        }
      ];
      break;
      
    case 5: // Exit Strategies & Profit Taking
      baseContent.sections = [
        {
          type: "text",
          title: "The Art of Taking Profits",
          content: `Many traders learn to find good entries but struggle with exits. This module teaches you exactly when and how to take profits with ${strategy.title}.

You'll discover multiple exit techniques, how to let winners run while protecting gains, and the psychology of profit-taking that separates professionals from amateurs.

The goal isn't just to be right about direction - it's to extract maximum profit from each winning trade while cutting losses quickly on the ones that don't work.`
        },
        {
          type: "list",
          title: "Exit Strategy Framework",
          content: [
            "Define profit targets before entering trade - never decide in the moment",
            "Use multiple targets for scaling out (take partial profits at levels)",
            "Adjust stops to breakeven once first target is hit",
            "Trail stops on remaining position to capture extended moves",
            "Exit if trade stalls at resistance or shows reversal signs",
            "Take profits before major news events or market closes",
            "Close positions that haven't worked within expected timeframe",
            "Document exit decision and result in trading journal"
          ]
        },
        {
          type: "text",
          title: "Scaling Out Technique",
          content: `The scaling out approach balances taking profits with letting winners run:

**First Target (30-40% of position)**: Take profits at 1.5-2x your initial risk. This often pays for your stop loss and locks in a win even if the rest of the position reverses.

**Second Target (30-40% of position)**: Exit at 3-4x initial risk or at major technical resistance level. This captures the core of the expected move.

**Final Position (20-30%)**: Use trailing stop to capture extended moves if trend continues. This is where outsized gains come from.

Example: Enter with 100 shares at $50, stop at $48 (risking $2/share)
- Target 1: $54 (2x risk) - Sell 40 shares
- Target 2: $58 (4x risk) - Sell 40 shares  
- Target 3: Trail stop on remaining 20 shares

This approach ensures you take profits consistently while staying exposed to big winning trades.`
        },
        {
          type: "text",
          title: "When to Exit Early",
          content: `Sometimes the best exit is before reaching your targets. Exit immediately if:

• Price action shows clear reversal pattern or momentum shift
• Volume dries up and price starts consolidating at resistance
• Broader market shows significant weakness that could drag your position
• News or events create uncertainty that wasn't factored into the trade
• Technical pattern fails or breaks down despite price not hitting stop yet
• You've made a mistake in analysis and the trade thesis is invalidated

Trust your analysis but stay flexible. The market doesn't care about your profit targets. If conditions change, adjust accordingly.`
        }
      ];
      break;
      
    case 6: // Live Trading Practice
      baseContent.sections = [
        {
          type: "text",
          title: "Transitioning to Live Trading",
          content: `You've learned the theory, now it's time to implement ${strategy.title} in live markets. This module guides you through the transition from education to execution.

You'll start with small position sizes to build confidence, gradually increase as you demonstrate consistent execution, and develop the discipline required for long-term success.

The goal this month: Take 10-20 trades following the strategy rules perfectly. Focus on execution quality, not profit. Building the habit of following your process is more valuable than short-term gains.`
        },
        {
          type: "list",
          title: "Live Trading Checklist",
          content: [
            "Start with 25-50% of your normal position size for first 10 trades",
            "Document every trade in detail - setup, entry, management, exit, result",
            "Take screenshots of charts at entry and exit for later review",
            "Track adherence to rules separately from profit/loss results",
            "Review each trade within 24 hours to identify improvements",
            "Calculate key metrics: win rate, average win/loss, profit factor",
            "Increase position size only after 20+ trades with good rule adherence",
            "Join weekly strategy review sessions in community forum"
          ]
        },
        {
          type: "text",
          title: "Your First 30 Days",
          content: `Here's your roadmap for the first month of live trading:

**Week 1**: Take 3-5 small trades. Focus entirely on following the process correctly. Don't worry about results.

**Week 2**: Continue taking setups. Start reviewing patterns - which setups are you taking most? Any rules you're consistently violating?

**Week 3**: Aim for 5-7 trades if good setups present themselves. Never force trades to meet quotas.

**Week 4**: Review all trades from the month. Calculate your statistics. Identify your strongest and weakest areas. Plan improvements for month 2.

Success in trading is measured in years, not days. These first weeks build the foundation for long-term profitability.`
        },
        {
          type: "text",
          title: "Practice Exercises",
          content: `Complete these exercises during your first month:

1. **Daily Market Scan** (15-20 minutes): Review markets using your screening criteria. Document potential setups even if you don't trade them all.

2. **Trade Review** (10 minutes per trade): For every trade taken, complete your journal entry the same day. What went right? What could improve?

3. **Weekly Performance Analysis** (30 minutes): Calculate your statistics for the week. Are you following the strategy rules? Where are the deviations?

4. **Monthly Deep Dive** (1-2 hours): Comprehensive review of all trades, patterns in your decision-making, adjustments needed.

Most trading failures come from lack of preparation and review, not from bad strategies. The discipline you build in these exercises matters more than any technical knowledge.`
        }
      ];
      break;
      
    case 7: // Psychology & Habit Formation
      baseContent.sections = [
        {
          type: "text",
          title: "The Psychology of Trading",
          content: `Trading psychology isn't a soft skill - it's the hardest part of trading. This module addresses the mental game required for successful implementation of ${strategy.title}.

You'll learn to manage emotions, build discipline, overcome common psychological pitfalls, and develop the habits that lead to consistent execution.

Technical analysis is easy. Risk management is straightforward. The hard part is doing what you know you should do when money is on the line and emotions are running high.`
        },
        {
          type: "list",
          title: "Common Psychological Challenges",
          content: [
            "Fear of missing out (FOMO) leading to chasing entries or overtrading",
            "Fear of loss causing premature exits or hesitation on good setups",
            "Revenge trading after losses to make back money quickly",
            "Overconfidence after winning streaks leading to bigger positions",
            "Analysis paralysis preventing action when good setups appear",
            "Inability to accept losses as normal part of trading",
            "Comparing your results to others instead of your own process",
            "Attachment to being right rather than making money"
          ]
        },
        {
          type: "text",
          title: "Building Trading Discipline",
          content: `Discipline is the bridge between strategy and success. Here's how to build it:

**Pre-Market Routine**: Start each day the same way. Review markets, check calendar, scan for setups, plan potential trades. This routine centers your mind and prevents reactive decisions.

**Trading Rules Checklist**: Before entering any trade, verify every criterion is met. Make this non-negotiable. One violation means no trade, regardless of how good it looks.

**Post-Trade Review**: Document immediately after closing position. While memory is fresh, record what you did well and what to improve.

**Weekly Review**: Every weekend, review all trades from the week. Celebrate good execution even on losing trades. Identify rule violations to avoid next week.

**Monthly Adjustment**: Based on monthly statistics, make small tweaks to your process. Never overhaul everything - gradual improvement compounds.

Discipline doesn't mean perfection. It means having a process and following it consistently even when it's uncomfortable.`
        },
        {
          type: "text",
          title: "Dealing with Losses",
          content: `Losses are inevitable. How you respond to them determines long-term success:

After a losing trade:
1. Accept it immediately - no ruminating or revenge trading
2. Review the trade objectively - was the process followed?
3. If rules were followed, this is just business expense - move on
4. If rules were violated, identify the trigger and plan prevention
5. Take a break if you're feeling emotional - don't trade angry

After a losing streak:
1. Reduce position size temporarily to rebuild confidence
2. Go back to paper trading if necessary - no shame in this
3. Review strategy rules - are you executing them correctly?
4. Check if market conditions have changed requiring adjustment
5. Seek perspective from mentor or community

The worst thing you can do after losses is abandon your strategy or dramatically change your approach. Losses are feedback, not failure.`
        }
      ];
      break;
      
    case 8: // Performance Tracking & Improvement
      baseContent.sections = [
        {
          type: "text",
          title: "Measuring Trading Performance",
          content: `What gets measured gets improved. This final module teaches you how to track, analyze, and continuously improve your implementation of ${strategy.title}.

You'll learn the key performance indicators that matter, how to identify patterns in your trading, and the optimization process used by professional traders to refine their approach over time.

After completing this module, you'll have a complete system for ongoing improvement that will serve you for years to come.`
        },
        {
          type: "list",
          title: "Key Performance Metrics",
          content: [
            "Win Rate: Percentage of trades that are profitable (target: 40-60%)",
            "Average Win/Loss Ratio: How much you make vs lose per trade (target: 2:1+)",
            "Profit Factor: Gross profit divided by gross loss (target: 1.5+)",
            "Maximum Drawdown: Largest peak-to-trough decline (target: <15%)",
            "Sharpe Ratio: Risk-adjusted returns (higher is better)",
            "Rule Adherence Rate: % of trades following strategy perfectly (target: 90%+)",
            "Average Holding Time: How long positions are held on average",
            "Return on Investment: Total account growth over time period"
          ]
        },
        {
          type: "text",
          title: "Monthly Performance Review Process",
          content: `At the end of each month, complete this comprehensive review:

**Step 1: Calculate Statistics**
Pull all trades from your journal and calculate the key metrics listed above. Use a spreadsheet or trading journal software to automate this.

**Step 2: Identify Patterns**
- Which setups had the highest win rate and best profit factor?
- What time of day/week did you trade best?
- Were there specific market conditions where you struggled?
- Did you have any recurring rule violations?

**Step 3: Review Biggest Winners and Losers**
Analyze your 3 best and 3 worst trades. What can you learn from each? What patterns emerge?

**Step 4: Assess Rule Adherence**
Calculate what percentage of trades followed every rule perfectly. This often matters more than win rate.

**Step 5: Plan Next Month's Focus**
Based on the data, choose 1-2 specific areas to improve next month. Don't try to fix everything at once.`
        },
        {
          type: "text",
          title: "Continuous Improvement Framework",
          content: `Trading is a skill that compounds. Small improvements add up dramatically over time:

**Quarterly Strategy Review**: Every 3 months, assess whether the strategy still fits current market conditions. Make small adjustments if needed, but don't completely abandon what's working.

**Annual Goal Setting**: Set specific, measurable goals for the year (return targets, win rate improvements, rule adherence metrics). Review progress quarterly.

**Ongoing Education**: Markets evolve. Dedicate time each month to learning - read books, take courses, study other successful traders in your space.

**Community Engagement**: Share your progress, challenges, and insights with other traders following ${strategy.title}. Teaching others reinforces your own learning.

**Tool Optimization**: As you gain experience, invest in better tools that improve your edge (better charting, faster execution, automated scanning, etc.).

The traders who succeed long-term are those who never stop learning and improving. Make this a career-long commitment.`
        },
        {
          type: "text",
          title: "Graduation and Next Steps",
          content: `Congratulations on completing ${strategy.title}! You now have a complete, systematic approach to trading.

Your next steps:

1. Continue implementing the strategy with gradually increasing position sizes as you prove consistent execution

2. Track performance for at least 6-12 months before making major changes to your approach

3. Consider adding complementary strategies once you've mastered this one (don't trade too many strategies simultaneously)

4. Share your success and challenges in the community to help others and continue your own growth

5. Remember: Consistency beats complexity. One strategy executed perfectly beats multiple strategies executed poorly.

You have everything you need. The knowledge, the process, the tools. Now it's about putting in the focused work to master your craft.

Welcome to the journey of professional trading. Your real education starts now.`
        }
      ];
      break;
  }
  
  return baseContent;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  expandAllModules()
    .then((result) => {
      console.log("\n✅ Success:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error);
      process.exit(1);
    });
}
