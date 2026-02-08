// Comprehensive Training Modules Data
export const comprehensiveTrainingData = {
  "tracks": [
    {
      "track_id": "comprehensive-trading-master",
      "title": "Comprehensive Trading Master",
      "description": "Complete 8-module professional trading education system covering all aspects from fundamentals to live trading",
      "modules": [
        {
          "slug": "strategy-overview-fundamentals",
          "track": "comprehensive-trading-master", 
          "order": 1,
          "of": 8,
          "title": "Strategy Overview & Fundamentals",
          "duration": "15 minutes",
          "overview": "Master the core foundations of successful trading strategies, risk assessment, and market psychology. This module establishes the fundamental principles that underpin all profitable trading approaches.",
          "prerequisites": [
            "Basic understanding of financial markets",
            "Access to trading platform or demo account",
            "Notebook for strategy documentation",
            "2-3 hours available for complete module series"
          ],
          "steps": [
            "Review the 5 pillars of successful trading strategies: Edge, Risk Management, Psychology, Execution, and Review",
            "Identify your trading personality: Day trader, Swing trader, Position trader, or Scalper",
            "Define your risk tolerance: Conservative (1-2% per trade), Moderate (2-3%), Aggressive (3-5%)",
            "Set realistic profit expectations based on account size and time commitment",
            "Document your trading goals: Monthly targets, annual objectives, and milestone markers",
            "Choose your primary markets: Crypto, Forex, Stocks, or Commodities",
            "Establish your trading schedule: Market hours you'll be active and time zones",
            "Create your trading workspace: Charts, news feeds, and analysis tools setup"
          ],
          "notes_prompt": "Write down your trading personality type, risk tolerance level, and primary market focus. Note any questions about strategy fundamentals.",
          "resources": {
            "video": {
              "label": "Strategy Fundamentals Video",
              "url": "https://example.com/strategy-fundamentals-video"
            },
            "pdf": {
              "label": "Trading Psychology Guide",
              "url": "https://example.com/trading-psychology-guide.pdf"
            },
            "community": {
              "label": "Strategy Discussion Forum",
              "url": "https://example.com/strategy-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Risk Management Calculator",
              "url": "https://example.com/risk-calculator"
            },
            {
              "label": "Trading Plan Template",
              "url": "https://example.com/trading-plan-template"
            }
          ],
          "previous": null,
          "next": {
            "label": "Next: Market Analysis & Setup",
            "slug": "market-analysis-setup"
          }
        },
        {
          "slug": "market-analysis-setup",
          "track": "comprehensive-trading-master",
          "order": 2,
          "of": 8,
          "title": "Market Analysis & Setup", 
          "duration": "20 minutes",
          "overview": "Learn professional market analysis techniques, chart setup, and technical indicators. Master both technical and fundamental analysis for comprehensive market assessment.",
          "prerequisites": [
            "Completed Module 1: Strategy Overview & Fundamentals",
            "Trading platform with charting capability",
            "Understanding of basic chart patterns",
            "Market news feed access"
          ],
          "steps": [
            "Set up multi-timeframe analysis: Daily for trend, 4H for structure, 1H for entries",
            "Configure key technical indicators: Moving Averages (20, 50, 200), RSI (14), MACD",
            "Identify market structure: Support/Resistance levels, trend lines, key price zones",
            "Analyze volume patterns: High volume breakouts, low volume consolidations",
            "Review fundamental factors: Economic calendar, news events, market sentiment",
            "Create market bias checklist: Bull/Bear/Neutral assessment framework", 
            "Practice identifying market phases: Trending, Ranging, Volatile, Quiet",
            "Document your analysis process: Step-by-step market evaluation routine"
          ],
          "notes_prompt": "Record your preferred timeframes, key indicators, and market analysis checklist. Note any patterns you're learning to recognize.",
          "resources": {
            "video": {
              "label": "Technical Analysis Masterclass",
              "url": "https://example.com/technical-analysis-video"
            },
            "pdf": {
              "label": "Chart Pattern Guide",
              "url": "https://example.com/chart-patterns.pdf"
            },
            "community": {
              "label": "Analysis Discussion Group",
              "url": "https://example.com/analysis-forum"
            }
          },
          "additional_resources": [
            {
              "label": "TradingView Setup Guide",
              "url": "https://example.com/tradingview-setup"
            },
            {
              "label": "Economic Calendar",
              "url": "https://example.com/economic-calendar"
            }
          ],
          "previous": {
            "label": "Previous: Strategy Fundamentals",
            "slug": "strategy-overview-fundamentals"
          },
          "next": {
            "label": "Next: Entry Signals & Timing",
            "slug": "entry-signals-timing"
          }
        },
        {
          "slug": "entry-signals-timing",
          "track": "comprehensive-trading-master",
          "order": 3,
          "of": 8,
          "title": "Entry Signals & Timing",
          "duration": "25 minutes",
          "overview": "Master precise entry techniques, signal confirmation, and optimal timing strategies. Learn to identify high-probability setups and avoid false signals.",
          "prerequisites": [
            "Completed Modules 1-2",
            "Familiarity with technical indicators", 
            "Practice identifying chart patterns",
            "Demo trading account ready"
          ],
          "steps": [
            "Learn the 3-confirmation rule: Price action + Indicator + Volume agreement",
            "Practice breakout entries: Wait for close above/below key levels with volume",
            "Master pullback entries: Enter on retest of broken support/resistance",
            "Identify momentum entries: Early trend continuation signals with strong momentum",
            "Practice reversal entries: Oversold/overbought with divergence confirmation",
            "Set up entry alerts: Automated notifications for your setup criteria",
            "Practice entry timing: Market open, session overlaps, high-impact news times",
            "Document your setups: Screenshot and analyze both winning and losing entries"
          ],
          "notes_prompt": "List your top 3 entry setups with specific criteria. Note the confirmation signals you'll use for each setup type.",
          "resources": {
            "video": {
              "label": "Entry Techniques Workshop",
              "url": "https://example.com/entry-techniques-video"
            },
            "pdf": {
              "label": "Signal Confirmation Guide",
              "url": "https://example.com/signal-confirmation.pdf"
            },
            "community": {
              "label": "Entry Setup Sharing",
              "url": "https://example.com/entry-setups-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Alert Setup Tutorial",
              "url": "https://example.com/alert-setup"
            },
            {
              "label": "Market Session Times",
              "url": "https://example.com/session-times"
            }
          ],
          "previous": {
            "label": "Previous: Market Analysis",
            "slug": "market-analysis-setup"
          },
          "next": {
            "label": "Next: Risk Management Protocol",
            "slug": "risk-management-protocol"
          }
        },
        {
          "slug": "risk-management-protocol",
          "track": "comprehensive-trading-master",
          "order": 4,
          "of": 8,
          "title": "Risk Management Protocol",
          "duration": "20 minutes",
          "overview": "Implement professional risk management systems to protect capital and ensure long-term profitability. Learn position sizing, stop losses, and portfolio management.",
          "prerequisites": [
            "Completed Modules 1-3",
            "Basic understanding of position sizing",
            "Risk tolerance assessment completed",
            "Trading capital allocated"
          ],
          "steps": [
            "Calculate your risk per trade: Never risk more than 1-3% of account per trade",
            "Set position sizes using the 1% rule: (Account Size × Risk%) ÷ Stop Loss Distance",
            "Place stop losses immediately: Technical stops at key levels, not arbitrary percentages",
            "Implement risk-reward ratios: Minimum 1:2, target 1:3 or better risk-reward",
            "Practice portfolio correlation: Don't risk more than 6% total across correlated trades",
            "Set daily/weekly loss limits: Stop trading when limits hit to prevent revenge trading",
            "Create risk checklists: Pre-trade verification of risk parameters",
            "Review and adjust risk rules: Weekly assessment of risk management effectiveness"
          ],
          "notes_prompt": "Write your personal risk rules: max risk per trade, position sizing formula, and stop loss strategy. Include your risk-reward requirements.",
          "resources": {
            "video": {
              "label": "Risk Management Masterclass",
              "url": "https://example.com/risk-management-video"
            },
            "pdf": {
              "label": "Position Sizing Guide",
              "url": "https://example.com/position-sizing.pdf"
            },
            "community": {
              "label": "Risk Management Discussion",
              "url": "https://example.com/risk-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Position Size Calculator",
              "url": "https://example.com/position-calculator"
            },
            {
              "label": "Risk-Reward Calculator",
              "url": "https://example.com/risk-reward-calc"
            }
          ],
          "previous": {
            "label": "Previous: Entry Signals",
            "slug": "entry-signals-timing"
          },
          "next": {
            "label": "Next: Exit Strategies & Profit Taking",
            "slug": "exit-strategies-profit-taking"
          }
        },
        {
          "slug": "exit-strategies-profit-taking",
          "track": "comprehensive-trading-master",
          "order": 5,
          "of": 8,
          "title": "Exit Strategies & Profit Taking",
          "duration": "25 minutes", 
          "overview": "Master professional exit techniques to maximize profits and minimize losses. Learn scaling out, trailing stops, and target-based exits for optimal trade management.",
          "prerequisites": [
            "Completed Modules 1-4",
            "Understanding of support/resistance",
            "Experience with stop loss placement",
            "Active trades for practice"
          ],
          "steps": [
            "Learn scaling exit strategy: Take 1/3 profits at 1:1, 1/3 at 1:2, final 1/3 at 1:3 R:R",
            "Master trailing stops: Move stops to breakeven when 1:1 achieved, trail at key levels",
            "Identify target zones: Major resistance/support, previous highs/lows, Fibonacci levels",
            "Practice time-based exits: Avoid holding through major news or session changes",
            "Implement breakeven stops: Protect capital when trade moves favorably",
            "Learn partial profit taking: Scale out at predetermined levels to lock in gains",
            "Use technical exit signals: RSI overbought/oversold, MACD divergence, volume decline",
            "Document exit decisions: Track what worked and what didn't for continuous improvement"
          ],
          "notes_prompt": "Define your exit strategy rules: scaling percentages, trailing stop method, and target identification process. Note your preferred exit signals.",
          "resources": {
            "video": {
              "label": "Advanced Exit Strategies",
              "url": "https://example.com/exit-strategies-video"
            },
            "pdf": {
              "label": "Profit Taking Guide",
              "url": "https://example.com/profit-taking.pdf"
            },
            "community": {
              "label": "Exit Strategy Sharing",
              "url": "https://example.com/exit-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Trailing Stop Calculator",
              "url": "https://example.com/trailing-calculator"
            },
            {
              "label": "Target Zone Identification",
              "url": "https://example.com/target-zones"
            }
          ],
          "previous": {
            "label": "Previous: Risk Management",
            "slug": "risk-management-protocol"
          },
          "next": {
            "label": "Next: Live Trading Practice",
            "slug": "live-trading-practice"
          }
        },
        {
          "slug": "live-trading-practice",
          "track": "comprehensive-trading-master",
          "order": 6,
          "of": 8,
          "title": "Live Trading Practice",
          "duration": "30 minutes",
          "overview": "Apply your learned skills in live market conditions. Practice execution, manage emotions, and develop consistency through structured live trading sessions.",
          "prerequisites": [
            "Completed Modules 1-5",
            "Live trading account with risk capital",
            "Trading plan documented",
            "Risk management rules established"
          ],
          "steps": [
            "Start with micro positions: Use smallest position sizes while building confidence",
            "Follow your checklist: Pre-trade, during-trade, and post-trade procedures",
            "Practice order execution: Market orders vs limit orders, slippage management",
            "Monitor your emotions: Use trading journal to track psychological responses",
            "Implement your risk rules: Strict adherence to position sizing and stops",
            "Practice trade management: Adjusting stops, scaling out, monitoring progress",
            "Handle unexpected events: News impact, gap opens, technical failures",
            "End-of-day review: Analyze performance, note lessons learned, plan improvements"
          ],
          "notes_prompt": "Record your live trading experiences: emotional reactions, execution challenges, and areas for improvement. Note your best and worst trades.",
          "resources": {
            "video": {
              "label": "Live Trading Workshop",
              "url": "https://example.com/live-trading-video"
            },
            "pdf": {
              "label": "Trading Execution Guide",
              "url": "https://example.com/execution-guide.pdf"
            },
            "community": {
              "label": "Live Trading Community",
              "url": "https://example.com/live-trading-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Trading Journal Template",
              "url": "https://example.com/journal-template"
            },
            {
              "label": "Order Types Guide",
              "url": "https://example.com/order-types"
            }
          ],
          "previous": {
            "label": "Previous: Exit Strategies", 
            "slug": "exit-strategies-profit-taking"
          },
          "next": {
            "label": "Next: Trading Psychology",
            "slug": "trading-psychology-habits"
          }
        },
        {
          "slug": "trading-psychology-habits",
          "track": "comprehensive-trading-master",
          "order": 7,
          "of": 8,
          "title": "Learning Psychology & Habit Formation",
          "duration": "25 minutes",
          "overview": "Develop the mental framework and habits essential for long-term trading success. Master emotional control, discipline, and the psychological aspects of consistent profitability.",
          "prerequisites": [
            "Completed Modules 1-6",
            "Live trading experience",
            "Trading journal established",
            "Awareness of personal trading patterns"
          ],
          "steps": [
            "Identify your psychological triggers: Fear, greed, FOMO, revenge trading patterns",
            "Develop pre-market routine: Meditation, market review, mindset preparation",
            "Practice emotional regulation: Deep breathing, taking breaks, walking away when upset",
            "Create trading rules: Written guidelines for when to trade and when to step back",
            "Build winning habits: Consistent analysis, disciplined execution, regular review",
            "Handle losing streaks: Accept losses as part of business, focus on process not outcomes",
            "Manage winning streaks: Avoid overconfidence, maintain discipline during good runs",
            "Develop long-term mindset: Focus on monthly/quarterly results, not daily P&L swings"
          ],
          "notes_prompt": "Identify your main psychological challenges and create specific action plans to address them. Write your personal trading commandments.",
          "resources": {
            "video": {
              "label": "Trading Psychology Deep Dive",
              "url": "https://example.com/psychology-video"
            },
            "pdf": {
              "label": "Mental Game of Trading",
              "url": "https://example.com/mental-game.pdf"
            },
            "community": {
              "label": "Psychology Support Group",
              "url": "https://example.com/psychology-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Meditation for Traders",
              "url": "https://example.com/meditation-guide"
            },
            {
              "label": "Habit Tracking Template",
              "url": "https://example.com/habit-tracker"
            }
          ],
          "previous": {
            "label": "Previous: Live Trading",
            "slug": "live-trading-practice"
          },
          "next": {
            "label": "Next: Performance Tracking",
            "slug": "performance-tracking-improvement"
          }
        },
        {
          "slug": "performance-tracking-improvement",
          "track": "comprehensive-trading-master",
          "order": 8,
          "of": 8,
          "title": "Performance Tracking & Improvement",
          "duration": "30 minutes",
          "overview": "Implement comprehensive performance analysis and continuous improvement systems. Learn to track, analyze, and optimize your trading performance for long-term success.",
          "prerequisites": [
            "Completed Modules 1-7",
            "At least 20 completed trades",
            "Trading journal with detailed records",
            "Basic understanding of performance metrics"
          ],
          "steps": [
            "Set up performance metrics: Win rate, average winner/loser, profit factor, Sharpe ratio",
            "Create monthly review process: Analyze what worked, what didn't, market conditions impact",
            "Track key statistics: Best/worst trading times, most profitable setups, common mistakes",
            "Identify improvement areas: Specific skills needing development, recurring errors to fix",
            "Set performance goals: Realistic targets for next month, quarter, and year",
            "Optimize your strategy: Refine entry/exit rules based on data analysis",
            "Plan continuous education: Books, courses, mentorship to advance your skills",
            "Build accountability system: Regular check-ins, peer reviews, mentor feedback"
          ],
          "notes_prompt": "Calculate your current performance metrics and set specific improvement goals. Create your ongoing education plan and accountability structure.",
          "resources": {
            "video": {
              "label": "Performance Analysis Workshop",
              "url": "https://example.com/performance-video"
            },
            "pdf": {
              "label": "Trading Metrics Guide",
              "url": "https://example.com/metrics-guide.pdf"
            },
            "community": {
              "label": "Performance Review Group",
              "url": "https://example.com/performance-forum"
            }
          },
          "additional_resources": [
            {
              "label": "Performance Calculator",
              "url": "https://example.com/performance-calc"
            },
            {
              "label": "Advanced Trading Books List",
              "url": "https://example.com/reading-list"
            }
          ],
          "previous": {
            "label": "Previous: Trading Psychology", 
            "slug": "trading-psychology-habits"
          },
          "next": null
        }
      ]
    }
  ],
  "strategies": [
    {
      "id": 100,
      "slug": "comprehensive-trading-master",
      "title": "Comprehensive Trading Master",
      "category": "Education",
      "risk": "Medium",
      "roi_range": "Professional Development",
      "tags": ["comprehensive", "education", "trading", "master"],
      "summary": "Complete 8-module professional trading education covering strategy fundamentals, market analysis, entry/exit techniques, risk management, live trading practice, psychology, and performance tracking.",
      "track_id": "comprehensive-trading-master",
      "first_module_slug": "strategy-overview-fundamentals"
    }
  ]
};

export default comprehensiveTrainingData;