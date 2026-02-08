// Enhanced Strategy Techniques - Detailed Trading Content for All 29 Strategies
// This file contains specific trading techniques, real strategies, and actionable content

export const ENHANCED_STRATEGY_MODULES = {
  // OLIVER VELEZ TECHNIQUES - Professional Price Action Trading
  "oliver-velez-techniques": {
    track_id: "oliver-velez-techniques",
    title: "Oliver Velez Professional Trading Techniques",
    description: "Master the legendary Oliver Velez price action trading methodology including MOH/MOL setups, 180° reversals, and professional entry/exit techniques",
    modules: [
      {
        slug: "oliver-velez-techniques-module-1",
        track: "oliver-velez-techniques",
        order: 1,
        of: 8,
        title: "Core Price Action Philosophy & Candle Anatomy",
        duration: "25 minutes",
        overview: "Master Oliver Velez's foundational price action philosophy. Learn to read market psychology through individual candlesticks - understanding why price moves, not just how. The Velez approach focuses on the battle between buyers and sellers visible in every candle. You'll learn to identify power candles (wide range bodies), doji confusion, and the critical relationship between the body and wicks that reveals true market sentiment.",
        prerequisites: [
          "Basic understanding of candlestick charts",
          "Access to charting platform with candlestick display",
          "Familiarity with timeframes (1min to daily)",
          "Trading journal ready for pattern documentation"
        ],
        steps: [
          "Study the Candle Body Rule: A candle closing in upper 25% = bullish control, lower 25% = bearish control, middle 50% = indecision",
          "Identify Power Candles: Wide range bars (2-3x average candle size) that close on or near highs/lows signal institutional participation",
          "Master Wick Analysis: Long lower wicks = rejection of lower prices (bullish), long upper wicks = rejection of higher prices (bearish)",
          "Practice Candle Pair Reading: Current candle vs previous candle relationship reveals momentum shifts",
          "Learn the 'First Pullback' principle: After a strong move, first pullback to key level offers highest probability entry",
          "Document 20 examples of each candle type in your journal with entry/exit annotations",
          "Backtest power candle setups on 5-minute and 15-minute charts across different market conditions",
          "Create a personal checklist for identifying tradeable candle patterns before market open"
        ],
        notes_prompt: "Record the specific candle patterns you observed today. Note which ones preceded significant moves and which failed. Include time of day and market conditions.",
        resources: {
          video: { label: "Candle Anatomy Masterclass", url: "https://example.com/velez-candles" },
          pdf: { label: "Power Candle Identification Guide", url: "https://example.com/power-candles.pdf" },
          community: { label: "Price Action Discussion", url: "https://example.com/velez-forum" }
        }
      },
      {
        slug: "oliver-velez-techniques-module-2",
        track: "oliver-velez-techniques",
        order: 2,
        of: 8,
        title: "MOH & MOL - Market Open High/Low Strategy",
        duration: "30 minutes",
        overview: "The MOH (Market Open High) and MOL (Market Open Low) strategy is Oliver Velez's signature opening range technique. During the first 15-30 minutes of market open, identify the high and low of this period. These levels become your trigger points for the rest of the day. When price breaks above MOH with volume, go long. When price breaks below MOL with volume, go short. The key is waiting for confirmation - not just the break, but a pullback retest of the broken level that holds.",
        prerequisites: [
          "Completed Module 1 - Candle Anatomy",
          "Understanding of market open dynamics",
          "Chart configured with 5-minute candles",
          "Level marking tools ready"
        ],
        steps: [
          "Mark the Opening Range: Draw horizontal lines at the high and low of first 15-30 minutes after open (9:30-10:00 AM ET for stocks)",
          "Wait for Range Completion: Do NOT trade during the opening range formation - patience is critical",
          "Identify Breakout Direction: Volume above average on break confirms institutional participation",
          "Execute MOH Long Setup: Price breaks above MOH → Wait for pullback to MOH level → Enter long when pullback holds and new candle forms above MOH",
          "Execute MOL Short Setup: Price breaks below MOL → Wait for pullback to MOL level → Enter short when pullback holds and new candle forms below MOL",
          "Place Stop Loss: Just beyond the opposite side of the opening range (below MOL for longs, above MOH for shorts)",
          "Target Calculation: Minimum target = Opening range height added to breakout point. Extended target = Previous day's high/low",
          "Practice identifying failed breakouts: Price breaks level but immediately reverses back into range = trap, no trade"
        ],
        notes_prompt: "Record today's MOH and MOL levels. Document which level broke first, whether the pullback occurred, and your entry/exit results."
      },
      {
        slug: "oliver-velez-techniques-module-3",
        track: "oliver-velez-techniques",
        order: 3,
        of: 8,
        title: "The 180° Reversal Pattern",
        duration: "25 minutes",
        overview: "The 180° Reversal is Velez's counter-trend technique for capturing major turning points. This pattern occurs when price makes a sharp move in one direction, exhausts itself with a climactic candle, then immediately reverses direction. Look for: Extended trend move, climactic wide-range candle on high volume, immediate reversal candle that engulfs or closes beyond the previous candle's midpoint. The 180° signals complete sentiment shift and offers excellent risk/reward when combined with support/resistance confluence.",
        prerequisites: [
          "Completed Modules 1-2",
          "Ability to identify trend exhaustion",
          "Understanding of volume analysis",
          "Risk management rules established"
        ],
        steps: [
          "Identify Extended Trend: Look for 5+ consecutive candles in same direction OR price extended 2+ ATR from nearest support/resistance",
          "Spot Climactic Candle: Wide range bar (largest of recent move) on highest volume of the sequence - this is exhaustion",
          "Confirm Reversal Candle: Next candle must close beyond the climactic candle's midpoint in opposite direction",
          "Entry Trigger: Enter on break of reversal candle's high (for long) or low (for short)",
          "Stop Loss Placement: Just beyond the extreme of the climactic candle - if reversal fails, the trend continues",
          "Target Strategy: First target = 50% retracement of the original move. Second target = 100% retracement (full reversal)",
          "Volume Confirmation: Reversal candle should have above-average volume showing new participants entering",
          "False Signal Filter: Avoid 180s at unsupported price levels - look for confluence with moving averages, prior highs/lows, or VWAP"
        ],
        notes_prompt: "Document any 180° reversal patterns you observed. Note what made them valid/invalid and your resulting trade outcomes."
      },
      {
        slug: "oliver-velez-techniques-module-4",
        track: "oliver-velez-techniques",
        order: 4,
        of: 8,
        title: "Risk Management - The Velez Method",
        duration: "20 minutes",
        overview: "Oliver Velez's approach to risk is ruthlessly mathematical: Never risk more than you can make. His core rule is the 2:1 minimum reward-to-risk ratio. If your stop is $0.50 away, your target must be at least $1.00 away. Position sizing uses the 1% rule - never risk more than 1% of trading capital on any single trade. Calculate position size by: Account Size × 0.01 ÷ Stop Loss Distance = Share/Contract Quantity. This protects capital while allowing for normal trade variation.",
        prerequisites: [
          "Understanding of stop loss placement",
          "Account size determined for trading",
          "Basic math skills for position sizing"
        ],
        steps: [
          "Calculate Maximum Risk Per Trade: Trading Account Size × 0.01 = Maximum Dollar Risk (e.g., $50,000 × 0.01 = $500 max risk)",
          "Determine Position Size: Max Risk ÷ Stop Distance = Position Size (e.g., $500 ÷ $0.50 stop = 1,000 shares maximum)",
          "Verify 2:1 Minimum R:R: Before any trade, confirm target distance is at least 2× stop distance",
          "Apply the 'No Edge, No Trade' Rule: If R:R is less than 2:1, skip the trade regardless of how good the setup looks",
          "Implement the 3-Strike Rule: After 3 consecutive losses, stop trading for the day - you're either fighting the market or tilting",
          "Use Mental Stops Only When: You can execute instantly. Otherwise, always use hard stops in the platform",
          "Daily Loss Limit: Set a maximum daily loss (e.g., 2-3% of account). Hit it? Done for the day. No exceptions.",
          "Weekly Review: Every weekend, calculate your win rate, average winner, average loser, and profit factor"
        ],
        notes_prompt: "Record your position sizing calculations for today's trades. Note any trades you passed on due to insufficient R:R."
      },
      {
        slug: "oliver-velez-techniques-module-5",
        track: "oliver-velez-techniques",
        order: 5,
        of: 8,
        title: "The First Pullback Entry Technique",
        duration: "25 minutes",
        overview: "The First Pullback is Velez's highest-probability continuation entry. After a strong directional move (power candle or gap), the first retracement to a key level offers optimal entry. Why? Institutions who missed the initial move use pullbacks to establish positions. First pullbacks have highest success rate because trend is fresh and committed. Key levels for pullback entries: VWAP, 9 EMA, prior day's close, and intraday support/resistance.",
        prerequisites: [
          "Completed previous modules",
          "VWAP and 9 EMA configured on charts",
          "Understanding of intraday levels"
        ],
        steps: [
          "Identify Qualifying Move: Price makes strong directional move with above-average volume and closes near extreme",
          "Wait for Pullback: Price retraces but does NOT exceed 50% of the initial move (shallow pullback preferred)",
          "Locate Key Support Level: First pullback to VWAP, 9 EMA, or prior resistance-turned-support",
          "Entry Trigger: Candle that touches the key level and then closes back in the direction of the original move",
          "Aggressive Entry: Enter when pullback candle touches support and shows rejection (long wick)",
          "Conservative Entry: Wait for next candle to break the high of the pullback candle (confirmation)",
          "Stop Placement: Just below the pullback low (for longs) - if this breaks, the 'first pullback' thesis is invalid",
          "Target: Prior high for first target, measured move (original move added to pullback low) for extended target"
        ],
        notes_prompt: "Document first pullback opportunities you observed. Note which support levels held and which failed."
      },
      {
        slug: "oliver-velez-techniques-module-6",
        track: "oliver-velez-techniques",
        order: 6,
        of: 8,
        title: "Trend Day Recognition & Trading",
        duration: "30 minutes",
        overview: "Trend days are the most profitable days to trade - price moves directionally with few pullbacks, offering multiple entry opportunities. Velez identifies trend days by: Gap in direction of trend, immediate follow-through after open, price stays on one side of VWAP all day, 9 EMA acts as dynamic support/resistance. On trend days, your only job is to find pullback entries in the trend direction and hold for larger targets.",
        prerequisites: [
          "All previous modules completed",
          "VWAP and 9 EMA on charts",
          "Understanding of gap analysis"
        ],
        steps: [
          "Pre-Market Check: Gap > 1% in direction of prior trend suggests potential trend day",
          "First 30 Minutes Test: If price gaps up and holds above prior day's high, trend day is likely",
          "VWAP Rule: On a bullish trend day, price stays above VWAP. Touch and bounce = buy. Close below = trend may be over",
          "9 EMA Dynamic Support: Use 9 EMA as trailing support on 5-minute chart. Each touch is potential add-on entry",
          "Avoid Counter-Trend Trades: On trend days, ONLY trade in the trend direction. Fighting trend = donating money",
          "Position Sizing Adjustment: On confirmed trend days, consider larger position sizes as probability is elevated",
          "Scaling Strategy: Enter 50% position on first pullback. Add 25% on second pullback. Final 25% on third pullback",
          "End-of-Day Exit: Trend days often reverse in final hour. Consider taking profits into 3:30 PM strength/weakness"
        ],
        notes_prompt: "Was today a trend day? What signals confirmed it? Document your entries and how you managed the position."
      },
      {
        slug: "oliver-velez-techniques-module-7",
        track: "oliver-velez-techniques",
        order: 7,
        of: 8,
        title: "Gap Trading Strategies",
        duration: "25 minutes",
        overview: "Gaps reveal overnight sentiment and institutional positioning. Velez classifies gaps as: Continuation gaps (same direction as trend, look to trade in gap direction), Exhaustion gaps (end of trend, potential reversal), and Breakaway gaps (start of new trend). The key question: Will the gap fill or extend? Answer depends on gap size, volume, and relation to key levels.",
        prerequisites: [
          "Understanding of prior modules",
          "Pre-market routine established",
          "Gap measurement skills"
        ],
        steps: [
          "Pre-Market Gap Identification: Calculate gap size as percentage of prior close. Small gaps (<1%) often fill. Large gaps (>2%) tend to extend",
          "Gap and Go Setup: Gap opens above resistance or below support → First 5-minute candle breaks opening high/low → Enter in gap direction",
          "Gap Fill Setup: Gap into prior resistance → First 30 minutes fails to extend → Short for gap fill back to prior close",
          "Fade the Gap Rules: Only fade gaps that gap INTO resistance (gap up into resistance = short potential)",
          "Volume Confirmation: Gap extension needs high volume in first 15 minutes. Low volume = higher fill probability",
          "Key Level Interaction: Gap to major level (prior day high/low, weekly pivot) often sees reaction/reversal",
          "Stop Placement: For Gap and Go, stop below first 5-minute candle low. For gap fade, stop above gap high",
          "Profit Targets: Gap fill trades target prior close. Gap extensions target measured move (gap size added to high/low)"
        ],
        notes_prompt: "Record today's gap, your thesis (fill or extend), and the outcome. Note what signals confirmed or refuted your analysis."
      },
      {
        slug: "oliver-velez-techniques-module-8",
        track: "oliver-velez-techniques",
        order: 8,
        of: 8,
        title: "Putting It All Together - Complete Trading Day",
        duration: "30 minutes",
        overview: "This module integrates all Velez techniques into a complete trading day workflow. From pre-market preparation through post-market review, you'll execute the full Velez methodology. Success comes from consistent application of these techniques, not from any single trade. Master the process, and profits follow.",
        prerequisites: [
          "Completed all previous modules",
          "Trading journal established",
          "Risk rules memorized and internalized"
        ],
        steps: [
          "Pre-Market (7:00 AM): Check overnight gaps, key earnings, economic calendar. Identify potential trend day or gap plays",
          "Opening Range (9:30-10:00): Mark MOH/MOL. Do NOT trade during this period. Watch and plan",
          "First Trade Window (10:00-11:00): Execute MOH/MOL breakout OR first pullback setup. This is typically highest probability window",
          "Midday Patience (11:00-2:00): Low volume chop zone. Reduce position sizes or avoid trading. Protect morning profits",
          "Afternoon Session (2:00-3:30): Look for continuation of morning trend or reversal setups into close",
          "End-of-Day (3:30-4:00): Close or reduce positions. Rarely establish new positions. Review day's action",
          "Post-Market Review: Journal all trades. Calculate statistics. Identify what worked and what needs improvement",
          "Weekend Planning: Review weekly performance. Adjust strategies. Prepare watchlists for next week"
        ],
        notes_prompt: "Complete your trading day summary. Include P&L, number of trades, win rate, and key lessons learned."
      }
    ]
  },

  // 30 SECOND TRADER - Fast Scalping Techniques
  "30secondtrader": {
    track_id: "30secondtrader",
    title: "30 Second Trader - Ultra-Fast Scalping System",
    description: "Master the art of ultra-fast scalping with setups that trigger in under 30 seconds. High-frequency price action for disciplined traders.",
    modules: [
      {
        slug: "30secondtrader-module-1",
        track: "30secondtrader",
        order: 1,
        of: 8,
        title: "Ultra-Fast Scalping Fundamentals",
        duration: "20 minutes",
        overview: "The 30 Second Trader methodology is built for speed and precision. You'll learn to identify, execute, and exit trades in under 30 seconds using price action triggers on 1-minute charts. This isn't about prediction - it's about reaction. The key principles: Trade what you see, not what you think. Enter with momentum. Exit at first sign of stall. Small profits compound into significant returns when executed with discipline.",
        prerequisites: [
          "Fast internet connection and low-latency broker",
          "1-minute chart setup with Level 2 data",
          "Hot keys configured for instant order execution",
          "Strict risk management rules established"
        ],
        steps: [
          "Platform Setup: Configure hot keys - one click to buy, one click to sell, one click to flatten. Speed is everything",
          "Chart Configuration: 1-minute candles, VWAP, 9 EMA only. Remove all clutter. Clean chart = clear decisions",
          "Level 2 Reading: Watch bid/ask flow for 15 minutes without trading. Learn to spot large orders stacking",
          "Identify Active Stocks: Focus on stocks moving 3%+ with volume over 2M shares. Volatility = opportunity",
          "Practice Pattern Recognition: Drill the 5 core patterns until identification is instant (covered in next modules)",
          "Mental Preparation: Scalping requires intense focus. Trade for 30-60 minute blocks maximum, then break",
          "Position Sizing for Speed: Use smaller sizes that allow instant fills. Slippage kills scalping profits",
          "Acceptance of Small Wins: Target 10-20 cents per share. This feels small but compounds rapidly with volume"
        ],
        notes_prompt: "Document your platform setup and hot key configuration. Note any latency issues experienced during practice."
      },
      {
        slug: "30secondtrader-module-2",
        track: "30secondtrader",
        order: 2,
        of: 8,
        title: "The Pop & Drop Pattern",
        duration: "20 minutes",
        overview: "The Pop & Drop is the signature 30-Second setup. After a stock 'pops' (sudden move up), you wait for the immediate pullback ('drop') to support, then enter long on the bounce. Total time from signal to entry: under 30 seconds. This captures continuation momentum while avoiding buying at the top. Works on 1-minute and 5-minute charts.",
        prerequisites: [
          "Completed Module 1",
          "Live market access during trading hours",
          "Position size calculated for scalping"
        ],
        steps: [
          "Identify the Pop: Stock makes sudden move (2+ candles) covering 0.5-1% with above-average volume",
          "Wait for the Drop: Price pulls back 25-50% of the pop on lower volume. This is profit-taking, not reversal",
          "Support Identification: Drop finds support at VWAP, 9 EMA, or the high of pre-pop consolidation",
          "Entry Trigger: When price touches support and next 1-min candle makes a higher low → ENTER LONG",
          "Stop Loss: Immediately below the drop's low. If support breaks, thesis is wrong. Maximum 10-15 cents",
          "Profit Target: Return to the pop's high. This is first target. If it breaks higher, trail stop at breakeven",
          "Time Limit: If trade doesn't work within 2-3 minutes, exit at breakeven or small loss. Don't let scalps become positions",
          "Practice Drill: Review 50 pop & drop patterns. Time yourself identifying entry point. Goal: under 10 seconds"
        ],
        notes_prompt: "Record pop & drop setups traded. Note timing from signal identification to execution and outcome."
      },
      {
        slug: "30secondtrader-module-3",
        track: "30secondtrader",
        order: 3,
        of: 8,
        title: "The Stuff Pattern - Fade the Failed Breakout",
        duration: "20 minutes",
        overview: "The 'Stuff' pattern occurs when price attempts to break a level, fails, and immediately reverses. Traders who bought the breakout are now trapped ('stuffed'), and their panic selling creates momentum for your fade. This is a counter-trend scalp requiring precise timing. Enter the moment the breakout fails, not after confirmation - by then, the move is over.",
        prerequisites: [
          "Completed previous modules",
          "Ability to identify resistance levels quickly",
          "Comfort with counter-trend entries"
        ],
        steps: [
          "Identify Key Level: Prior high, round number, or VWAP extension where buyers are likely trapped",
          "Watch for Breakout Attempt: Price pushes through level with initial volume, attracting breakout traders",
          "Spot the Failure: Within 1-2 candles, price reverses back below the level. This is the 'stuff'",
          "Entry Trigger: Enter short when price closes back below the broken level. This is immediate - within seconds",
          "Trapped Trader Logic: Every buyer above that level is now underwater. Their stop losses fuel your profits",
          "Stop Placement: Just above the failed breakout high. Maximum 15-20 cents for scalps",
          "Target: First support level below entry OR the pre-breakout low. Take quick profits - this is a scalp",
          "Risk Warning: Don't fade every breakout. Only trade 'stuffs' at major levels with clear trapped traders visible"
        ],
        notes_prompt: "Document stuff patterns observed. Note which levels produce the cleanest failed breakouts."
      },
      {
        slug: "30secondtrader-module-4",
        track: "30secondtrader",
        order: 4,
        of: 8,
        title: "Momentum Ignition Entries",
        duration: "25 minutes",
        overview: "Momentum Ignition captures the explosive start of a new directional move. When a consolidation breaks with volume, you have seconds to join before price runs away. The key is pre-positioning your attention on stocks in tight consolidations near breakout points. When the ignition occurs, you're ready to act instantly.",
        prerequisites: [
          "Watchlist of stocks in consolidation patterns",
          "Alert system configured for level breaks",
          "Fast execution capability"
        ],
        steps: [
          "Pre-Market Scan: Identify 5-10 stocks in tight consolidation (narrowing range over 3+ candles) near key levels",
          "Set Breakout Alerts: Configure alerts for break above consolidation high and below consolidation low",
          "Monitor for Volume Surge: When consolidation breaks, volume should spike 2-3x average immediately",
          "Entry Execution: The moment break occurs with volume, enter with market order. Do not wait for pullback",
          "First Target Expectation: Momentum ignition moves 0.5-1% minimum. Take 50% off at this level",
          "Trail the Runner: Move stop to breakeven after first target. Let remaining position ride",
          "Failure Protocol: If break immediately reverses, exit instantly. Failed ignitions mean wrong thesis",
          "Pattern Quality Filter: Best ignitions occur after 15+ minute consolidations. Tighter = better"
        ],
        notes_prompt: "List stocks you're watching for momentum ignition. Document your pre-market preparation process."
      },
      {
        slug: "30secondtrader-module-5",
        track: "30secondtrader",
        order: 5,
        of: 8,
        title: "VWAP Bounce Scalping",
        duration: "20 minutes",
        overview: "VWAP (Volume Weighted Average Price) acts as the day's gravity for institutional traders. Stocks above VWAP tend to stay above; stocks below tend to stay below. When price pulls back to VWAP in a trending stock, it offers a high-probability scalp entry. The VWAP bounce is the bread-and-butter scalp for 30-Second traders.",
        prerequisites: [
          "VWAP displayed on charts",
          "Understanding of VWAP significance",
          "Trending stock identification skills"
        ],
        steps: [
          "Identify Trend: Stock must be clearly above VWAP (bullish) or clearly below VWAP (bearish) for 30+ minutes",
          "Wait for VWAP Touch: Price pulls back to VWAP on lower volume. This is institutions reloading positions",
          "Entry Signal: 1-minute candle touches VWAP and closes back in trend direction (above for bullish, below for bearish)",
          "Aggressive Entry: Enter when price touches VWAP if prior trend is strong. Don't wait for close",
          "Stop Loss: Just beyond VWAP (10-15 cents). If VWAP breaks, trend may be reversing",
          "Target: Prior high/low before the pullback. Conservative target for consistent small wins",
          "Multiple Touches: First touch has highest probability. Second touch is tradeable. Third touch often fails",
          "Time Filter: VWAP bounces work best 10:00 AM - 2:00 PM. Avoid in first and last 30 minutes"
        ],
        notes_prompt: "Record VWAP bounce trades. Note which were first, second, or third touches and success rates."
      },
      {
        slug: "30secondtrader-module-6",
        track: "30secondtrader",
        order: 6,
        of: 8,
        title: "Level 2 Reading for Scalpers",
        duration: "25 minutes",
        overview: "Level 2 shows the order book - all pending buy and sell orders at different price levels. For scalpers, Level 2 reveals where large orders are stacked (support/resistance), where stop losses are likely clustered, and when momentum is building for a move. Master Level 2 reading and you see the market 5-10 seconds before price moves.",
        prerequisites: [
          "Level 2 data subscription active",
          "Time and Sales window configured",
          "Understanding of bid/ask mechanics"
        ],
        steps: [
          "Order Stack Identification: Large orders (5,000+ shares) stacked at a level create support/resistance",
          "Iceberg Order Detection: Repeated fills at same level = iceberg order. Hidden institutional buyer/seller",
          "Momentum Building: Rapid printing on ask (for longs) or bid (for shorts) signals imminent move",
          "Stop Hunt Identification: Price approaches level, large orders appear, price reverses = stop hunt complete",
          "Entry Timing: When bid stacks start building aggressively, momentum to upside is building. Prepare to buy",
          "Exit Signal: When large orders absorb buying (stock stops moving despite heavy buying), momentum fading",
          "Practice Without Trading: Watch Level 2 for 30 minutes before market. Predict moves before they happen",
          "Time and Sales Confirmation: Large prints (10,000+ shares) at ask = institutional buying. Use to confirm thesis"
        ],
        notes_prompt: "Document Level 2 observations. What patterns preceded significant moves? What signals were misleading?"
      },
      {
        slug: "30secondtrader-module-7",
        track: "30secondtrader",
        order: 7,
        of: 8,
        title: "Risk Management for High-Frequency Trading",
        duration: "20 minutes",
        overview: "Scalping amplifies both wins and losses. Without strict risk management, a few bad trades destroy days of profits. The 30-Second method uses maximum 10-20 cent stops and requires 2:1 minimum reward. Because you're taking many trades, consistency matters more than any single outcome. Losing 60% of trades is fine if winners are 2x losers.",
        prerequisites: [
          "Account size determined for scalping",
          "Understanding of per-trade risk",
          "Discipline assessment completed"
        ],
        steps: [
          "Maximum Risk Per Trade: Never risk more than 0.5% of account per scalp trade (smaller than swing trades)",
          "Fixed Cent Stop: Use fixed stop distances (10-15 cents) rather than percentage-based stops for scalps",
          "Position Size Calculation: Account × 0.005 ÷ Stop Distance = Maximum Share Size",
          "Daily Stop-Loss: After losing 1.5% of account in a day, stop trading. Protect capital for tomorrow",
          "Win Rate Reality: Expect 45-55% win rate. Profit comes from R:R, not win rate. Accept this",
          "Revenge Trading Prevention: After 2 consecutive losses, mandatory 10-minute break. Reset mentally",
          "Scaling Position Sizes: Start day with smallest size. Only increase after 2+ winning trades",
          "Monthly Review: Calculate profit factor (gross profit ÷ gross loss). Must be >1.5 to continue scalping"
        ],
        notes_prompt: "Record your scalping risk parameters. Document any rules you violated and the consequences."
      },
      {
        slug: "30secondtrader-module-8",
        track: "30secondtrader",
        order: 8,
        of: 8,
        title: "Complete Scalping Session Workflow",
        duration: "25 minutes",
        overview: "This module brings together all 30-Second techniques into a complete trading session. From pre-market scanning through post-market review, you'll execute the full scalping methodology. Scalping success requires intensity during trading and complete detachment after. Master this rhythm for consistent profitability.",
        prerequisites: [
          "Completed all previous modules",
          "All platform configurations complete",
          "Risk rules memorized"
        ],
        steps: [
          "Pre-Market (8:00-9:15): Scan for gappers, identify 5-10 stocks with potential setups, set alerts on key levels",
          "Opening Bell (9:30-10:00): Watch only, don't trade. Let opening chaos settle. Identify trend directions",
          "Prime Trading Window (10:00-11:30): Execute primary scalping setups. This is highest probability window",
          "Midday Break (11:30-1:00): Reduce activity or stop. Midday chop kills scalping profits",
          "Afternoon Session (1:00-3:00): Resume scalping if clear trends emerge. Smaller size if choppy",
          "End of Day (3:30-4:00): Close all positions. Never hold scalps overnight",
          "Daily Review (4:00-4:30): Journal all trades. Calculate win rate, average win/loss, and profit factor",
          "Weekly Adjustment: Review week's performance. Identify best and worst setups. Refine for next week"
        ],
        notes_prompt: "Complete your scalping session summary. Include trade count, win rate, and total P&L."
      }
    ]
  },

  // WARRIOR TRADING - Momentum Day Trading with Leverage
  "warrior-trading": {
    track_id: "warrior-trading",
    title: "Warrior Trading System - Momentum & Leverage Mastery",
    description: "Aggressive momentum day trading with leverage. High-risk, high-reward setups for experienced traders seeking accelerated returns.",
    modules: [
      {
        slug: "warrior-trading-module-1",
        track: "warrior-trading",
        order: 1,
        of: 8,
        title: "Momentum Trading Fundamentals & Mindset",
        duration: "25 minutes",
        overview: "Warrior Trading is aggressive momentum trading designed for traders seeking outsized returns. This approach uses leverage (margin, options, or perps) to amplify moves in trending stocks. The psychology is crucial: accept higher drawdowns in exchange for higher profits. Only traders with proper risk tolerance should proceed. You must be comfortable losing to have a chance at winning big.",
        prerequisites: [
          "Minimum 6 months trading experience",
          "Margin account approved",
          "Strong stomach for volatility",
          "Emergency fund separate from trading capital"
        ],
        steps: [
          "Risk Assessment: Confirm you can afford to lose 100% of your trading account without lifestyle impact",
          "Margin Understanding: Learn how margin calls work, maintenance requirements, and forced liquidation",
          "Leverage Limits: Start with 2:1 leverage maximum. Never exceed 4:1 until consistently profitable",
          "Capital Allocation: Warrior account should be <20% of total investable assets. Never bet the farm",
          "Mental Preparation: Visualize both winning and losing days. Accept drawdowns as part of the strategy",
          "Trade Selection: Only trade stocks moving 10%+ with news catalyst. Avoid random momentum",
          "Time Focus: Best opportunities occur 9:30-11:00 AM. Afternoon momentum often fades",
          "Commitment Assessment: This strategy requires daily attention. Part-time traders should use swing approach instead"
        ],
        notes_prompt: "Honestly assess your risk tolerance and trading experience. Document why you're pursuing aggressive momentum trading."
      },
      {
        slug: "warrior-trading-module-2",
        track: "warrior-trading",
        order: 2,
        of: 8,
        title: "Finding Momentum Stocks - The Gap Scanner",
        duration: "20 minutes",
        overview: "Momentum requires catalysts. The gap scanner identifies stocks gapping 5%+ pre-market with volume and news. These are the stocks institutional traders and algorithms will be fighting over at open. Your job is to identify the best 2-3 opportunities and be ready to strike when setup triggers. Most momentum stocks come from: earnings surprises, FDA approvals, contract wins, or short squeeze potential.",
        prerequisites: [
          "Pre-market data subscription",
          "News feed configured (Benzinga, Twitter, etc.)",
          "Gap scanner access"
        ],
        steps: [
          "Pre-Market Scan Criteria: Gap up/down 5%+, Pre-market volume 500K+, Float under 50M shares, News catalyst within 24 hours",
          "News Verification: Confirm the catalyst is real and material. Avoid 'manufactured' hype. Real news = real moves",
          "Float Analysis: Smaller float = bigger moves. Under 20M float with high volume creates extreme volatility",
          "Short Interest Check: High short interest (20%+) + good news = potential squeeze. Add to watchlist priority",
          "Pre-Market Pattern: Look for stocks holding gains on high volume. Fading gaps often trap longs at open",
          "Narrow to Top 3: From 10+ gappers, select 3 with best catalyst, float, and pre-market action",
          "Level 2 Pre-Market: Watch order flow in top stocks. Large buyers stacking = opening push likely",
          "Prepare Entry Levels: Mark pre-market high, VWAP, and round numbers before open. Be ready to act"
        ],
        notes_prompt: "Document your pre-market scanning results. Which criteria identified the best opportunities?"
      },
      {
        slug: "warrior-trading-module-3",
        track: "warrior-trading",
        order: 3,
        of: 8,
        title: "The Opening Range Breakout (ORB) Strategy",
        duration: "25 minutes",
        overview: "The Opening Range Breakout is the core Warrior strategy. Mark the high and low of the first 5 minutes after open. When price breaks this range with volume, enter in the breakout direction with momentum. The first 5-minute candle captures initial supply/demand battle. The breakout reveals the winner. Join the winners and profit from the losers' stop losses.",
        prerequisites: [
          "Completed previous modules",
          "Fast execution platform",
          "5-minute chart configured"
        ],
        steps: [
          "Mark Opening Range: Draw horizontal lines at high and low of first 5-minute candle (9:30-9:35)",
          "Volume Requirement: First 5-minute volume should be 2x+ average. High volume = conviction in levels",
          "Wait for Breakout: Do NOT trade inside the range. Patience is critical for clean entry",
          "Long Entry: Price breaks above opening range high + first 1-minute candle closes above → Enter long",
          "Short Entry: Price breaks below opening range low + first 1-minute candle closes below → Enter short",
          "Position Size with Leverage: Use 50% of normal size with 2:1 leverage. Same dollar risk, more shares",
          "Stop Loss: Just beyond opposite side of opening range. If range fails, exit immediately",
          "Target: 2-3x opening range height is typical target. Trail stop as price extends"
        ],
        notes_prompt: "Record ORB trades attempted. Note breakout quality, volume confirmation, and results."
      },
      {
        slug: "warrior-trading-module-4",
        track: "warrior-trading",
        order: 4,
        of: 8,
        title: "Leverage & Position Sizing",
        duration: "20 minutes",
        overview: "Leverage amplifies everything - profits and losses. The Warrior approach uses leverage strategically: smaller base position, same dollar exposure, tighter stops. Key principle: leverage should not increase your dollar risk per trade. It should increase your potential reward while maintaining the same absolute risk through tighter stops.",
        prerequisites: [
          "Margin account active",
          "Understanding of buying power",
          "Risk tolerance confirmed"
        ],
        steps: [
          "Base Position Calculation: Without leverage, your risk per trade might be 1% of $50K = $500",
          "Leveraged Position: With 2:1 leverage and 50% position size, same $500 risk but double the shares",
          "Stop Distance Adjustment: Leverage requires tighter stops. If normal stop is $1, leveraged stop is $0.50",
          "Effective Leverage Guide: 2:1 for normal momentum, 3:1 for high conviction only, 4:1 never recommended for day trades",
          "Margin Call Prevention: Never use more than 70% of buying power. Leave buffer for drawdowns",
          "Per-Trade Leverage Limits: Start each trade at 2:1 max. Only add leverage if trade moves in your favor",
          "Scaling In: Enter 50% position on initial breakout. Add 50% on first pullback to entry area",
          "Daily Leverage Review: Calculate your effective leverage daily. If exceeding 3:1 frequently, reduce size"
        ],
        notes_prompt: "Document your leverage usage today. Did position sizing align with risk management rules?"
      },
      {
        slug: "warrior-trading-module-5",
        track: "warrior-trading",
        order: 5,
        of: 8,
        title: "The ABCD Pattern for Momentum Continuation",
        duration: "25 minutes",
        overview: "The ABCD pattern captures momentum continuation after a pullback. A = initial impulse low, B = impulse high, C = pullback low (higher than A), D = continuation target (projects to match A-B distance). This pattern works across all timeframes and is the most reliable momentum continuation setup in the Warrior arsenal.",
        prerequisites: [
          "Understanding of trend structure",
          "Fibonacci extension tool configured",
          "Pattern recognition practice completed"
        ],
        steps: [
          "Identify Point A: Major swing low that starts the impulse move",
          "Identify Point B: Swing high where initial impulse stalls and pullback begins",
          "Wait for Point C: Pullback retraces 38.2%-61.8% of A-B. Must be higher than A for valid pattern",
          "Measure for Point D: Project A-B distance from point C. This is your profit target",
          "Entry at C: Enter long when pullback finds support at C and first green candle forms",
          "Stop Loss: Just below point C. Maximum 2% of account risk",
          "Target at D: Take 75% profits at D projection. Trail remaining 25% with tight stop",
          "Volume Confirmation: A-B should have highest volume. C pullback should have declining volume. C-D should see volume increase"
        ],
        notes_prompt: "Document ABCD patterns you identified. Measure actual D outcomes versus projected D."
      },
      {
        slug: "warrior-trading-module-6",
        track: "warrior-trading",
        order: 6,
        of: 8,
        title: "Parabolic Move Trading",
        duration: "25 minutes",
        overview: "Parabolic moves are vertical price surges where stocks gain 20-100% in hours. These are rare but offer life-changing profit potential. The challenge: when to enter, when to add, when to exit. Parabolic moves end violently. You must take profits aggressively and never give back gains. This module teaches controlled aggression in extreme momentum situations.",
        prerequisites: [
          "All previous modules mastered",
          "Strong emotional control",
          "Quick profit-taking discipline"
        ],
        steps: [
          "Parabolic Identification: Stock up 10%+ in first hour on extreme volume (10x+ average). Float under 10M preferred",
          "Entry Strategy: Do NOT chase initial move. Wait for first 10%+ pullback to find support",
          "Pullback Entry: When pullback holds and first green 1-minute candle appears, enter with 25% size",
          "Adding Positions: As stock resumes upward, add 25% on each new high. Trail stops on all positions",
          "Aggressive Profit Taking: Every 10% gain, sell 25% of position. Lock in profits continuously",
          "Top Detection: Highest volume candle that closes red after extended move = potential top. Reduce to 25%",
          "Reversal Defense: If top is confirmed with follow-through selling, exit remaining position immediately",
          "Post-Parabolic Fade: After top, avoid longs for rest of day. Consider short scalps on dead cat bounces"
        ],
        notes_prompt: "Document any parabolic moves observed. How did you manage entry, additions, and exits?"
      },
      {
        slug: "warrior-trading-module-7",
        track: "warrior-trading",
        order: 7,
        of: 8,
        title: "Risk Management for Aggressive Trading",
        duration: "25 minutes",
        overview: "Aggressive trading requires even more disciplined risk management. The Warrior approach accepts larger individual trade losses but enforces strict daily and weekly limits. Survive the inevitable losing streaks and the winning streaks will make you profitable. Key rule: live to trade another day.",
        prerequisites: [
          "Account size and daily loss limits defined",
          "Understanding of drawdown recovery math",
          "Emotional control assessment completed"
        ],
        steps: [
          "Per-Trade Risk: Maximum 2% of account per trade. This allows 5 consecutive losses before 10% drawdown",
          "Daily Loss Limit: Stop trading after 5% daily loss. No exceptions. Revenge trading is portfolio suicide",
          "Weekly Loss Limit: After 10% weekly loss, reduce to 50% size for remainder of week",
          "Drawdown Recovery: 20% drawdown requires 25% gain to recover. 50% drawdown requires 100% gain. Protect capital!",
          "Position Correlation: Don't hold 3+ positions in same sector. One news event shouldn't destroy you",
          "Leverage Reduction in Drawdown: In drawdown mode, reduce leverage to 1.5:1 until recovery complete",
          "Win Streak Discipline: After 3 consecutive winners, don't increase size. Overconfidence follows",
          "Monthly Review: If losing money 3+ months, return to paper trading or swing trading approach"
        ],
        notes_prompt: "Document your current drawdown level and risk adjustments made. Track adherence to daily limits."
      },
      {
        slug: "warrior-trading-module-8",
        track: "warrior-trading",
        order: 8,
        of: 8,
        title: "Complete Warrior Trading Day",
        duration: "30 minutes",
        overview: "This module integrates all Warrior techniques into a complete aggressive trading day. From pre-market scanning through position management and daily review. Success requires ruthless discipline - both in taking trades and in stopping. The Warrior who survives fights another day.",
        prerequisites: [
          "All previous modules completed",
          "Paper trading results positive",
          "Capital allocated specifically for this strategy"
        ],
        steps: [
          "Pre-Market (4:00-9:15 AM): Run gap scanner. Identify top 3 momentum candidates. Read all related news",
          "Game Plan (9:15-9:30): Write specific entry, stop, and target for each candidate. Know your plan before open",
          "Opening Battle (9:30-10:00): Mark opening ranges. Do not trade first 5 minutes. Watch for clean breakouts",
          "Prime Attack (10:00-11:00): Execute best ORB or ABCD setup. Use 50% of daily risk allocation",
          "Midday Reduction (11:00-1:00): Close or reduce positions. Do not establish new positions in this window",
          "Afternoon Opportunity (1:00-3:00): Look for continuation of morning winner or new setup in different stock",
          "Close Before Close (3:30-4:00): Flatten all positions. Never hold leveraged positions overnight",
          "War Room Review (4:00-5:00): Journal all trades. Review Level 2 recordings. Calculate daily statistics"
        ],
        notes_prompt: "Complete your Warrior trading day summary. Include trade count, win rate, P&L, and emotional state throughout the day."
      }
    ]
  },

  // SMART MONEY TRADING - Institutional Order Flow
  "smart-money-training": {
    track_id: "smart-money-training",
    title: "Smart Money Trading - Institutional Order Flow Mastery",
    description: "Learn to identify and follow institutional trading activity. Trade alongside banks, hedge funds, and market makers rather than against them.",
    modules: [
      {
        slug: "smart-money-training-module-1",
        track: "smart-money-training",
        order: 1,
        of: 8,
        title: "Understanding Institutional Trading",
        duration: "30 minutes",
        overview: "Smart Money refers to institutional traders who move billions of dollars - banks, hedge funds, pension funds, and market makers. Their trading creates the real market moves. Retail traders who fight institutional flow lose. Those who identify and follow it win. This module reveals how institutions actually trade: they accumulate slowly, manipulate price to better entries, then push price for profit.",
        prerequisites: [
          "Basic understanding of market structure",
          "Access to volume profile or footprint charts",
          "Patience for multi-day analysis"
        ],
        steps: [
          "Market Structure Reality: 80%+ of daily volume is institutional. Individual traders are noise in their ocean",
          "Accumulation Phase: Institutions cannot buy all at once (too big). They buy slowly over days/weeks in a range",
          "Distribution Phase: After accumulating, they push price up, then sell into retail buying",
          "Stop Hunting: Institutions see retail stop clusters. They push price to trigger stops, then reverse",
          "Key Principle: 'Smart Money buys when others sell, sells when others buy' - opposite of retail behavior",
          "Volume Profile Setup: Configure volume profile to see where most trading occurred (Point of Control)",
          "Multi-Day Perspective: Institutional accumulation spans days/weeks. Don't expect to see it in one session",
          "Patience Required: Following smart money means waiting for setups. Overtrading fights their timeline"
        ],
        notes_prompt: "Document your understanding of institutional vs retail behavior. Where have you been trading like retail?"
      },
      {
        slug: "smart-money-training-module-2",
        track: "smart-money-training",
        order: 2,
        of: 8,
        title: "Order Blocks & Institutional Footprints",
        duration: "25 minutes",
        overview: "Order Blocks are the candles where institutions placed their orders. These become future support/resistance because institutions will defend their entries. Bullish Order Block: Last bearish candle before a significant move up. Bearish Order Block: Last bullish candle before a significant move down. When price returns to these levels, expect a reaction.",
        prerequisites: [
          "Completed Module 1",
          "Multi-timeframe chart setup",
          "Understanding of support/resistance"
        ],
        steps: [
          "Identify Impulse Move: Look for strong, aggressive moves that cover significant price distance quickly",
          "Find the Origin: Trace back to find the last opposite-colored candle before the impulse began",
          "Mark the Order Block: Highlight the entire range of this candle (high to low) as your order block zone",
          "Bullish OB Example: Strong upward move → Find last red candle before the move → This zone is support",
          "Bearish OB Example: Strong downward move → Find last green candle before the move → This zone is resistance",
          "Entry Strategy: When price returns to order block, wait for price action confirmation then enter in original direction",
          "Stop Loss: Just beyond the order block zone. If zone breaks, thesis is invalid",
          "Timeframe Hierarchy: Higher timeframe order blocks are more powerful. Daily > 4H > 1H in significance"
        ],
        notes_prompt: "Mark order blocks on your current watchlist stocks. Note which timeframes you're using."
      },
      {
        slug: "smart-money-training-module-3",
        track: "smart-money-training",
        order: 3,
        of: 8,
        title: "Fair Value Gaps (Imbalances)",
        duration: "25 minutes",
        overview: "Fair Value Gaps (FVGs) or imbalances occur when price moves so aggressively that it leaves 'gaps' in price action - areas where no trading occurred. Institutions often return price to these gaps to 'fill' them before continuing the move. Trading FVGs means entering when price returns to fill the gap, expecting continuation in the original direction.",
        prerequisites: [
          "Completed previous modules",
          "Candlestick pattern recognition",
          "Gap identification skills"
        ],
        steps: [
          "FVG Identification: Three-candle pattern where middle candle's body doesn't overlap with candles on either side",
          "Bullish FVG: Candle 1 high is below Candle 3 low. The gap between them is the FVG (price to fill)",
          "Bearish FVG: Candle 1 low is above Candle 3 high. The gap between them is the FVG (price to fill)",
          "Mark the Gap: Draw rectangle from Candle 1 high to Candle 3 low (bullish) or Candle 1 low to Candle 3 high (bearish)",
          "Wait for Retest: Price often returns to fill FVGs before continuing original direction",
          "Entry on Fill: When price enters FVG zone and shows rejection (wick, engulfing candle), enter in original direction",
          "Validity Check: FVGs created with high volume and strong momentum are most likely to be defended",
          "Time Decay: FVGs older than 20 bars lose significance. Focus on recent gaps"
        ],
        notes_prompt: "Document FVGs you've identified. Track which filled and which were skipped."
      },
      {
        slug: "smart-money-training-module-4",
        track: "smart-money-training",
        order: 4,
        of: 8,
        title: "Liquidity Concepts - Where Stops Hide",
        duration: "30 minutes",
        overview: "Liquidity refers to pending orders - specifically stop losses and pending limit orders. Institutions need liquidity to execute large positions. They push price toward stop clusters, trigger them, then use the resulting orders to fill their positions in the opposite direction. Understanding liquidity pools allows you to anticipate stop hunts and trade with institutions.",
        prerequisites: [
          "Understanding of stop loss placement",
          "Previous modules completed",
          "Volume profile or order flow tools"
        ],
        steps: [
          "Buy-Side Liquidity: Stop losses from short sellers sit above swing highs. Taking buy-side = pushing to trigger these",
          "Sell-Side Liquidity: Stop losses from long positions sit below swing lows. Taking sell-side = pushing to trigger these",
          "Equal Highs/Lows: When price makes equal highs/lows, retail traders place stops just beyond. Prime liquidity pool",
          "Liquidity Sweep: Price pushes through previous high/low, triggers stops, then immediately reverses",
          "Trade the Sweep: After liquidity is taken, enter opposite direction. Stops are cleared, path is clear for real move",
          "Sweep Confirmation: Candle that sweeps liquidity should close back inside the range. This confirms reversal",
          "Avoid Being Swept: Don't place stops at obvious levels (just below support, just above resistance). Widen slightly",
          "Multiple Timeframe Confluence: When daily and 4H liquidity levels align, expect significant reaction"
        ],
        notes_prompt: "Identify current liquidity pools on your watchlist. Where are stops clustering?"
      },
      {
        slug: "smart-money-training-module-5",
        track: "smart-money-training",
        order: 5,
        of: 8,
        title: "Market Structure Shifts",
        duration: "25 minutes",
        overview: "Market Structure Shift (MSS) or Break of Structure (BOS) indicates institutional change of direction. When price breaks a significant swing point, the trend has shifted. An MSS from bullish to bearish after a liquidity sweep is the highest probability smart money setup. You're entering as institutions begin their new directional campaign.",
        prerequisites: [
          "Previous modules completed",
          "Swing point identification mastery",
          "Multi-timeframe analysis capability"
        ],
        steps: [
          "Bullish Market Structure: Series of higher highs (HH) and higher lows (HL). Trend is up",
          "Bearish Market Structure: Series of lower highs (LH) and lower lows (LL). Trend is down",
          "Break of Structure: When price breaks the most recent significant swing point in opposite direction",
          "Bullish BOS: Price breaks above most recent lower high in downtrend. Potential reversal to bullish",
          "Bearish BOS: Price breaks below most recent higher low in uptrend. Potential reversal to bearish",
          "Confirmation: After BOS, wait for price to return to order block in new direction, then enter",
          "Stop Loss: Beyond the swing point that created the BOS. If this breaks, the shift was false",
          "Confluence: Best BOS occurs after liquidity sweep at significant level. This confirms institutional intent"
        ],
        notes_prompt: "Document market structure on your charts. Identify recent breaks of structure and outcomes."
      },
      {
        slug: "smart-money-training-module-6",
        track: "smart-money-training",
        order: 6,
        of: 8,
        title: "Time-Based Institutional Activity",
        duration: "25 minutes",
        overview: "Institutions trade on schedules tied to market sessions, options expiration, and economic events. Understanding these time-based patterns reveals when smart money is most active. The 'Kill Zones' - London Open, NY Open, and NY Close - are when institutions execute their largest positions. Trading during these windows increases probability of following smart money flow.",
        prerequisites: [
          "Understanding of market sessions",
          "Economic calendar access",
          "Time zone awareness"
        ],
        steps: [
          "London Kill Zone (2:00-5:00 AM ET): European institutions set the day's direction. Major moves begin here",
          "NY Kill Zone (8:30-11:00 AM ET): Highest volume period. NY institutions respond to London setup",
          "NY Close Kill Zone (2:00-4:00 PM ET): Institutions close positions, rebalance. Often reverses intraday trend",
          "Asian Session (7:00 PM - 2:00 AM ET): Lower volume, consolidation. Rarely initiates major moves",
          "Monthly/Weekly Open: Institutional funds rebalance at month/week open. Expect increased activity first days",
          "OPEX Week: Options expiration week (third Friday monthly) sees increased volatility as MMs hedge",
          "Quarter End: Pension funds and mutual funds rebalance. Last 2 weeks of quarter can have unusual moves",
          "Trade During Kill Zones: Focus your trading during these windows. Avoid random hours with institutional absence"
        ],
        notes_prompt: "Track your trading times. Are you trading during kill zones or during low-activity periods?"
      },
      {
        slug: "smart-money-training-module-7",
        track: "smart-money-training",
        order: 7,
        of: 8,
        title: "COT Report & Institutional Positioning",
        duration: "25 minutes",
        overview: "The Commitment of Traders (COT) Report reveals institutional positioning in futures markets. Published weekly by the CFTC, it shows Commercial (hedgers), Large Speculator (institutions), and Small Speculator (retail) positions. Extreme positioning often precedes major reversals. Following smart money means aligning with large speculators when positioning is favorable.",
        prerequisites: [
          "Access to COT data",
          "Understanding of futures markets",
          "Long-term perspective (swing/position trading)"
        ],
        steps: [
          "Access COT Data: Download from CFTC.gov or use services like tradingster.com, cotbase.com for visual analysis",
          "Focus on Large Speculators: These are hedge funds and institutions. Their positioning drives major moves",
          "Extreme Readings: When large specs are net long/short at 3-year extremes, expect potential reversal",
          "Commercial Hedgers: They're wrong directionally (they hedge). Extreme commercial positioning = contrarian signal",
          "Small Specs (Retail): Usually wrong at extremes. Extreme retail positioning = fade opportunity",
          "Multi-Week Analysis: COT positions don't reverse quickly. Look for trend in positioning over 4-8 weeks",
          "Combine with Technical: COT for direction bias, technical analysis for entry timing",
          "Weekly Check Routine: Every Saturday, review COT for your primary markets. Note positioning changes"
        ],
        notes_prompt: "Document current COT positioning for your primary markets. What is the institutional bias?"
      },
      {
        slug: "smart-money-training-module-8",
        track: "smart-money-training",
        order: 8,
        of: 8,
        title: "Complete Smart Money Trading System",
        duration: "30 minutes",
        overview: "This module integrates all Smart Money concepts into a complete trading system. The methodology: Identify institutional bias through COT and market structure → Wait for price to reach order block or FVG → Confirm with liquidity sweep → Enter on Break of Structure confirmation → Trade during kill zones. This is a patient, selective approach that aligns with institutional flow.",
        prerequisites: [
          "All previous modules completed",
          "Practice identifying all concepts in real-time",
          "Patience for selective trading"
        ],
        steps: [
          "Daily Bias Determination: Check higher timeframe market structure (daily/4H) to determine directional bias",
          "Identify Key Levels: Mark order blocks, FVGs, and liquidity pools on your trading timeframe",
          "Wait for Kill Zone: Only trade during London or NY sessions for maximum institutional participation",
          "Liquidity Sweep Setup: Wait for price to sweep a significant high/low, taking out obvious stop clusters",
          "BOS Confirmation: After sweep, wait for market structure shift confirming reversal in direction of bias",
          "Entry at Order Block: When price retraces to order block in new direction, enter with confirmation candle",
          "Stop Placement: Beyond the liquidity sweep point. If price reclaims this, the sweep was not a reversal",
          "Target: Previous liquidity pool in direction of trade. Smart money targets opposing liquidity"
        ],
        notes_prompt: "Complete your Smart Money trading checklist. Document bias, levels, and trade outcomes."
      }
    ]
  },

  // CREDIT SPREAD INCOME STRATEGY
  "credit-spread-income": {
    track_id: "credit-spread-income",
    title: "Credit Spread Income Strategy - Options Premium Collection",
    description: "Generate consistent monthly income through systematic credit spread options trading with defined risk and 60-90% win rates.",
    modules: [
      {
        slug: "credit-spread-income-module-1",
        track: "credit-spread-income",
        order: 1,
        of: 8,
        title: "Credit Spread Fundamentals",
        duration: "25 minutes",
        overview: "Credit spreads are options strategies that collect premium by selling overpriced options while buying protective options to define risk. Bull Put Spread: Collect premium if stock stays above strike price. Bear Call Spread: Collect premium if stock stays below strike price. You win when the stock does nothing or moves in your favor. Time decay works for you, not against you.",
        prerequisites: [
          "Options trading approval (Level 2 minimum)",
          "Understanding of calls and puts",
          "Ability to analyze probability of profit",
          "Capital for defined-risk positions"
        ],
        steps: [
          "Credit Spread Mechanics: Sell an option (collect premium) + Buy a further OTM option (limit risk) = Net credit received",
          "Bull Put Spread: Sell put at Strike A, Buy put at lower Strike B. Profit = premium collected if stock stays above Strike A",
          "Bear Call Spread: Sell call at Strike A, Buy call at higher Strike B. Profit = premium collected if stock stays below Strike A",
          "Maximum Profit: Limited to premium collected (credit received)",
          "Maximum Loss: Limited to spread width minus premium collected",
          "Breakeven: Sold strike ± credit received (depending on spread direction)",
          "Win Condition: Stock expires anywhere outside your sold strike. Full premium kept",
          "Advantage: Time decay (theta) works in your favor. Every day options lose value, you profit"
        ],
        notes_prompt: "Document your understanding of credit spread mechanics. Practice calculating max profit, max loss, and breakeven."
      },
      {
        slug: "credit-spread-income-module-2",
        track: "credit-spread-income",
        order: 2,
        of: 8,
        title: "Stock Selection for Credit Spreads",
        duration: "20 minutes",
        overview: "Not all stocks are suitable for credit spreads. Ideal candidates: High IV rank (overpriced options = more premium), liquid options market, predictable trading ranges, and no imminent catalyst. Avoid earnings, FDA announcements, and other binary events. The goal is boring stocks that stay within expected ranges.",
        prerequisites: [
          "Completed Module 1",
          "Access to options analytics (IV rank, etc.)",
          "Stock scanning capability"
        ],
        steps: [
          "IV Rank Filter: Look for IV Rank above 30 (current IV is high relative to past year). Higher = more premium",
          "Liquidity Requirement: Bid-ask spread on options should be <$0.10 for reasonable fills",
          "Technical Analysis: Identify stocks in trading ranges. Support and resistance levels define your strikes",
          "Avoid Earnings: Never have credit spreads open through earnings. Close before or open after",
          "Avoid Volatile Names: Stay away from recent IPOs, meme stocks, or anything in active news cycle",
          "Sector Diversification: Don't put all spreads in same sector. One sector crash shouldn't ruin month",
          "Weekly Scan Routine: Every weekend, scan for high IV rank stocks in stable industries",
          "Watchlist Building: Maintain list of 10-15 go-to stocks you know well for credit spreads"
        ],
        notes_prompt: "Build your credit spread watchlist. Note IV rank, support/resistance levels, and any upcoming events."
      },
      {
        slug: "credit-spread-income-module-3",
        track: "credit-spread-income",
        order: 3,
        of: 8,
        title: "Strike Selection & Probability",
        duration: "25 minutes",
        overview: "Strike selection determines your probability of profit. Selling strikes at 1 standard deviation (approximately 85% probability OTM) provides optimal balance between premium collected and win rate. Delta can be used as a proxy for probability - a delta of 0.15 means approximately 85% chance of expiring worthless (profit for you).",
        prerequisites: [
          "Understanding of delta and Greeks",
          "Options chain analysis capability",
          "Probability calculation skills"
        ],
        steps: [
          "Delta as Probability: Option delta ≈ probability of expiring ITM. Delta 0.15 = 15% chance of loss",
          "Target Delta Range: Sell options with delta between 0.10 and 0.20 (80-90% probability of profit)",
          "Standard Deviation Approach: 1SD move = 68% probability. 1.5SD = 87%. 2SD = 95%. Target 1-1.5SD for strikes",
          "Premium Requirement: The credit received should be at least 1/3 of spread width. ($1 spread needs $0.33 credit minimum)",
          "Spread Width: Start with $2.50-$5.00 wide spreads. Wider = more premium but more risk",
          "DTE Selection: 30-45 days to expiration is sweet spot. Enough premium but rapid theta decay approaching expiry",
          "Strike vs Support: For bull put spreads, sell strike should be below nearest support level",
          "Strike vs Resistance: For bear call spreads, sell strike should be above nearest resistance level"
        ],
        notes_prompt: "Practice strike selection on 3 stocks. Document delta, probability, premium, and technical levels."
      },
      {
        slug: "credit-spread-income-module-4",
        track: "credit-spread-income",
        order: 4,
        of: 8,
        title: "Position Sizing & Portfolio Management",
        duration: "20 minutes",
        overview: "Credit spread position sizing is based on maximum loss, not buying power. Even though your broker may only require the spread width as margin, you must size based on potential loss. Rule: Never risk more than 5% of account on any single spread. Diversify across 10-15 positions for optimal risk distribution.",
        prerequisites: [
          "Account size determined",
          "Maximum loss calculation mastery",
          "Portfolio thinking mindset"
        ],
        steps: [
          "Calculate Max Loss Per Spread: (Spread width - Credit received) × 100 = Maximum loss per contract",
          "Position Size Limit: Max loss per position ≤ 5% of total account. $50K account = $2,500 max loss per trade",
          "Contract Calculation: Max risk ÷ Max loss per contract = Maximum contracts. Round down always",
          "Correlation Limit: Maximum 3 positions in same sector. Market-wide sell-off shouldn't devastate you",
          "Capital Allocation: Keep 30-40% buying power available for adjustments or new opportunities",
          "Monthly Income Target: Aim to collect 2-4% of account in premium monthly. 20-30% annualized is excellent",
          "Portfolio Delta: Keep overall portfolio delta near neutral. Balance bullish and bearish spreads",
          "Rolling Reserves: Always keep funds available to roll tested positions. Never be 100% allocated"
        ],
        notes_prompt: "Calculate your maximum contracts per position based on account size. Document your capital allocation plan."
      },
      {
        slug: "credit-spread-income-module-5",
        track: "credit-spread-income",
        order: 5,
        of: 8,
        title: "Trade Entry Execution",
        duration: "20 minutes",
        overview: "Proper entry execution ensures you get filled at fair prices and establish positions correctly. Always use limit orders, never market orders for spreads. Enter spreads as a single order (not as separate legs). Aim for mid-price or better. Be patient - good fills save real money over hundreds of trades.",
        prerequisites: [
          "Options platform proficiency",
          "Understanding of bid-ask spreads",
          "Limit order usage"
        ],
        steps: [
          "Analyze the Chain: Pull up options chain for your target expiration. Note bid-ask spreads on potential strikes",
          "Calculate Natural Credit: (Bid of sold option - Ask of bought option) = Natural credit (worst case fill)",
          "Calculate Mid-Price: (Bid+Ask of sold option)/2 - (Bid+Ask of bought option)/2 = Target credit (fair value)",
          "Enter Limit Order: Start at mid-price credit. If no fill after 5-10 minutes, adjust by $0.01-$0.02",
          "Use Spread Orders: Always trade as a single spread order, never leg in. Leg risk is unacceptable",
          "Timing Entry: Enter during high volume hours (10 AM - 3 PM ET). Avoid opening/closing 30 minutes",
          "IV Timing: Enter credit spreads when IV is elevated (after market pullback). Avoid post-IV crush",
          "Confirmation Checklist: Before clicking submit - verify expiration, strikes, direction, and credit are correct"
        ],
        notes_prompt: "Document your first credit spread entry. Note the bid-ask spread, target credit, and actual fill price."
      },
      {
        slug: "credit-spread-income-module-6",
        track: "credit-spread-income",
        order: 6,
        of: 8,
        title: "Managing Winners & Losers",
        duration: "25 minutes",
        overview: "Credit spread management is about taking profits early on winners and defending losers through adjustment. Never hold until expiration - risk increases exponentially in final days. Take profits at 50% of max profit. Manage losers when spread is tested (stock approaches sold strike). The goal is high win rate with capped losses.",
        prerequisites: [
          "Active positions to manage",
          "Understanding of rolling",
          "Discipline to close early"
        ],
        steps: [
          "50% Profit Rule: Close spread when you can buy it back for 50% of credit received. This is non-negotiable",
          "Why 50%? Holding for remaining 50% exposes you to gamma risk for minimal additional gain. Math favors early exit",
          "Loser Definition: Short strike is tested when stock price is within $1-2 of sold strike",
          "Defensive Roll: When tested, roll to further expiration for credit, or roll strike away for even credit",
          "Rolling Mechanics: Buy back current spread + Sell new spread further out in time = Net credit or even",
          "Maximum Adjustments: Roll maximum 2 times. If still threatened after 2 rolls, accept loss and close",
          "Stop Loss Point: Close spread if loss reaches 2x credit collected. Don't let $100 credit become $300 loss",
          "End of Cycle: Close all positions by Friday of expiration week. Never hold through expiration"
        ],
        notes_prompt: "Document your management rules. Note any positions you closed at 50% profit or rolled defensively."
      },
      {
        slug: "credit-spread-income-module-7",
        track: "credit-spread-income",
        order: 7,
        of: 8,
        title: "Advanced Structures - Iron Condors",
        duration: "25 minutes",
        overview: "Iron Condors combine a bull put spread and bear call spread on the same underlying. You collect premium from both sides, profiting if stock stays within a range. Double the premium but also double the positions to manage. Iron Condors are the evolution of credit spreads for range-bound markets.",
        prerequisites: [
          "Proficiency with single-side credit spreads",
          "Understanding of range-bound markets",
          "Multi-leg order capability"
        ],
        steps: [
          "Iron Condor Construction: Sell put spread below current price + Sell call spread above current price",
          "Profit Zone: Stock can move within the range of your short strikes. You keep full premium",
          "Max Profit: Combined premium from both spreads (minus commissions)",
          "Max Loss: Larger of the two spread widths minus combined premium. Only one side can lose",
          "Strike Selection: Each short strike at approximately 1SD (15 delta). Wing width typically $2.50-$5.00",
          "Management Complexity: Two positions to monitor. If one side is tested, manage it while other side profits",
          "When to Use: High IV rank + Clear support/resistance range + No upcoming catalyst",
          "Adjustment Strategy: If one side tested, close the tested side, let winner run. Don't double down"
        ],
        notes_prompt: "Paper trade an iron condor. Document all four strikes, combined premium, and profit zone."
      },
      {
        slug: "credit-spread-income-module-8",
        track: "credit-spread-income",
        order: 8,
        of: 8,
        title: "Building Consistent Monthly Income",
        duration: "30 minutes",
        overview: "This module brings together all credit spread concepts into a systematic monthly income generation process. The goal: 2-4% monthly return (24-48% annualized) with 60-90% win rate. Consistency beats home runs. The credit spread income strategy is a business, not gambling. Treat it accordingly.",
        prerequisites: [
          "All previous modules completed",
          "Live trading experience with credit spreads",
          "Commitment to consistent execution"
        ],
        steps: [
          "Monthly Planning (First Weekend): Scan for high IV candidates. Identify 10-15 potential trades for the month",
          "Weekly Entry (Monday-Wednesday): Enter 3-5 positions per week, staggered expiration dates for diversification",
          "Daily Monitoring (10 minutes): Check all open positions. Note any approaching sold strikes",
          "Profit Taking (Ongoing): Close positions at 50% profit immediately. Set GTC orders if your platform allows",
          "Friday Review: Close any positions expiring next week if at profit. Assess positions needing adjustment",
          "Monthly Statistics: Calculate win rate, average win, average loss, total premium collected vs returned",
          "Continuous Improvement: Note which setups worked, which failed. Refine stock selection and timing",
          "Scaling Up: After 6 months of consistent profits, consider increasing position sizes by 25%. Slow growth"
        ],
        notes_prompt: "Create your monthly credit spread income plan. Document target number of trades, premium goals, and stocks on radar."
      }
    ]
  }
};

export default ENHANCED_STRATEGY_MODULES;
