// Real training module data extracted from comprehensive strategy documentation
export const realTrainingModules = [
    {
        "title": "ALL Trading Strategies — Unified",
        "overview": "Use the unified launcher to access every preset and training quickly from a single screen.",
        "prereqs": ["Create an account or log in.", "Ensure your role is set (Free or Premium)."],
        "steps": ["Open the app and go to Strategies › Unified.", "Use the search box to filter by tag (e.g., 'defi', 'perps', 'education').", "Hover any card to preview summary, risk, and ROI range.", "Click 'Open Training' to read the module or 'Open Strategy' to configure.", "Save favorites by clicking the star icon."],
        "exit_plan": ["Use 'Export Progress' to backup your setup.", "Review monthly to remove unused strategies."],
        "risks": ["Analysis paralysis from too many options."]
    },
    {
        "title": "Passive Income Training (DeFi)",
        "overview": "Earn yield using stable LPs, lending, and auto-compounding vaults.",
        "prereqs": ["Install MetaMask (or WalletConnect).", "Fund with native gas tokens (ETH, BNB, MATIC, etc.)."],
        "steps": ["Open DeFi Hub › Passive Income.", "Pick a chain (Ethereum, BNB Chain, Polygon).", "Select a strategy card (e.g., Curve DAI/USDC + Convex, Beefy USDT-BUSD).", "Click 'View Steps' to expand the full deposit guide.", "Follow the wallet prompts to approve and deposit.", "Monitor weekly via the dashboard."],
        "exit_plan": ["Set calendar reminders to review APY decay.", "Use 'Emergency Exit' if protocol issues arise."],
        "risks": ["Smart contract risk, impermanent loss, depeg events."]
    },
    {
        "title": "Oliver Velez Techniques (Price Action)",
        "overview": "Apply structured price-action entries/exits with institutional discipline.",
        "prereqs": ["Enable TradingView widget.", "Load market with adequate liquidity."],
        "steps": ["Identify trend on higher timeframe (HTF).", "Mark key levels: prior day high/low, weekly open, round numbers.", "Wait for a pullback to a value area; look for reversal candle (engulfing/pin).", "Enter with stop below/above setup candle; target 1R, 2R, 3R levels.", "Move stop to breakeven after 1R hit.", "Scale out 1/3 at each target."],
        "exit_plan": ["Trail remaining position with 20-EMA or ATR-based stop.", "Close all before major news if unsure."],
        "risks": ["False breakouts, whipsaws, and emotional overriding of rules."]
    },
    {
        "title": "F&C Intelligent Decision Strategy (AI-Assisted)",
        "overview": "Blend AI signals with your rules for entries/exits.",
        "prereqs": ["Enable AI module in settings.", "Define allowed risk per trade."],
        "steps": ["Open Strategy Builder › Presets › F&C.", "Toggle AI confirmation (on) and set minimum confidence (e.g., 65%).", "Define entry filters (trend, volume spike, RSI zone).", "Set stop (ATR-based) and profit ladders.", "Save preset and run a backtest on the last 90 days.", "Paper trade for 2 weeks before going live."],
        "exit_plan": ["Review AI performance weekly; adjust confidence threshold.", "Disable AI if performance degrades below manual trading."],
        "risks": ["Over-reliance on AI, model overfitting, data lag."]
    },
    {
        "title": "Trading Freedom Group (Community)",
        "overview": "Use community signals responsibly with your risk plan.",
        "prereqs": ["Join the group channel and verify role.", "Set your max risk/trade."],
        "steps": ["Open Community Feed inside the app.", "Copy signal parameters (entry, SL, TP).", "Check if signal aligns with your system (trend/ATR).", "Size the trade per your plan and execute.", "Log the signal source and outcome for review."],
        "exit_plan": ["Follow posted stop and TPs; adjust only if your system conflicts.", "Unfollow signal providers with <50% win rate over 20 trades."],
        "risks": ["Blindly following signals, overriding risk rules, FOMO trades."]
    },
    {
        "title": "DeFi Strategist Elite Dashboard",
        "overview": "Customize your command center for quick decisions.",
        "prereqs": ["Connect wallet(s).", "Select preferred base currency (USD/USDT)."],
        "steps": ["Open Dashboard and click 'Customize'.", "Add widgets: Portfolio, Signals, Orderbook, Alerts, Economic Calendar.", "Drag to reorder; save layout.", "Set refresh interval for each widget (e.g., 30s for orderbook)."],
        "exit_plan": ["Enable 'De-Risk Mode' quick toggle to send X% to stables."],
        "risks": ["Information overload leading to decision paralysis."]
    },
    {
        "title": "Mindful Study Education Platform",
        "overview": "Create a consistent daily study loop.",
        "prereqs": ["Pick a study window (e.g., 45 minutes/day)."],
        "steps": ["Open Academy › Mindful Study.", "Select today's lesson and set a timer (25/5 Pomodoro).", "Take notes in the journal panel; capture 3 takeaways.", "Complete quiz and log score."],
        "exit_plan": ["Weekly review: pick 1 concept to implement next week."],
        "risks": ["Skipping reviews reduces retention."]
    },
    {
        "title": "LIVE Crypto Cashflow Challenge (30-Day)",
        "overview": "Daily tasks to stack passive yield safely.",
        "prereqs": ["Start with a small bankroll; define max weekly deposit."],
        "steps": ["Open Academy › Cashflow Challenge.", "Follow Day 1 checklist (wallet setup, first deposit).", "Each day: new task (optimize gas, rotate pools, record APY).", "Post progress in the group (optional)."],
        "exit_plan": ["Withdraw profits weekly to a separate 'savings' wallet."],
        "risks": ["Chasing high APY without due diligence, overexposure to one protocol."]
    },
    {
        "title": "Consolidated Crypto Hub",
        "overview": "Quickly jump to any tool or training.",
        "prereqs": ["None."],
        "steps": ["Open Hub and use the command bar (⌘/Ctrl+K).", "Type a task (e.g., 'open builder') and hit Enter.", "Pin your top 5 actions for speed."],
        "exit_plan": ["N/A — navigation tool."],
        "risks": ["N/A."]
    },
    {
        "title": "Protocols Explorer",
        "overview": "Find, sort, and compare DeFi protocols.",
        "prereqs": ["Wallet and chain list set."],
        "steps": ["Open Protocols and filter by chain, TVL, risk.", "Click a protocol to view docs/audit links.", "Add to watchlist or send to Strategy Builder."],
        "exit_plan": ["Use 'Remove Exposure' button to track exits."],
        "risks": ["Protocol upgrades may change yields."]
    },
    {
        "title": "Strategy Builder (Wizard)",
        "overview": "Design rules, test, and automate.",
        "prereqs": ["Choose market and timeframe."],
        "steps": ["Step 1: Market — pick asset and timeframe.", "Step 2: Rules — define entries (trend + trigger).", "Step 3: Risk — set SL (ATR), TP ladders, and size.", "Step 4: Automate — alerts or bot/webhook."],
        "exit_plan": ["Create an Exit preset (RSI/MA/ATR) and attach to the strategy."],
        "risks": ["Backtests can mislead; forward-test small first."]
    },
    {
        "title": "Portfolio",
        "overview": "Track holdings, yield, PnL.",
        "prereqs": ["Connect wallet(s)."],
        "steps": ["Open Portfolio and sync balances.", "Tag positions by strategy or chain.", "Set cost basis for each holding.", "Export CSV weekly for records."],
        "exit_plan": ["Use 'Trim' to take % profits into stables."],
        "risks": ["Data delays from RPCs; refresh when needed."]
    },
    {
        "title": "Profit Taking (Bull Run)",
        "overview": "Systematize exits with ladders, DCA, and indicators.",
        "prereqs": ["Pick targets and % per ladder."],
        "steps": ["Set ladders: +50%, +100%, +200%, +300% (10/15/20/25%).", "Enable weekly DCA-out (5%) and pause rule if price < 20-DMA by 10%.", "Turn on RSI>80 trim (10%) and MA20/MA50 cross reductions (25% each).", "Enable ATR(14) ×3 trailing stop.", "Save as 'BullRun_Pro' preset."],
        "exit_plan": ["Auto park proceeds to USDC/DAI; rebalance to BTC/ETH when oversold."],
        "risks": ["Early exits in parabolic runs, tax implications."]
    },
    {
        "title": "Exit Strategy Planner",
        "overview": "Plan your final distribution and stable rotation.",
        "prereqs": ["Define end-of-cycle targets."],
        "steps": ["Enter target prices (e.g., BTC 95k).", "Choose DCA schedule (weekly/biweekly).", "Set full-exit conditions (MA cross + funding extremes).", "Enable notifications (email/Telegram)."],
        "exit_plan": ["Export plan to PDF and share with accountability partner."],
        "risks": ["Changing macro conditions—review monthly."]
    },
    {
        "title": "Learn DeFi",
        "overview": "Core lessons for bridging, LPs, and risks.",
        "prereqs": ["None."],
        "steps": ["Open the Beginner track and complete lessons 1–5.", "Do the final quiz; aim for ≥80%.", "Bookmark advanced modules for later."],
        "exit_plan": ["Create a DeFi checklist you reuse every deposit."],
        "risks": ["Skipping audits page before depositing."]
    },
    {
        "title": "Stablecoin Guide",
        "overview": "Pick stables and yields with a risk-first mindset.",
        "prereqs": ["None."],
        "steps": ["Compare DAI/USDC/USDT/LUSD ratings.", "Pick a stable basket for diversification.", "Select a low-risk yield venue (audited, reputable)."],
        "exit_plan": ["Rotate to the safest pools as yields change."],
        "risks": ["Depeg and venue risk; avoid concentration."]
    },
    {
        "title": "Robin Hood Trading (CeFi On-Ramp)",
        "overview": "Move fiat into crypto responsibly.",
        "prereqs": ["KYC completed with chosen CeFi."],
        "steps": ["Buy USDC/BTC/ETH on the CeFi app.", "Withdraw to your self-custody wallet.", "Confirm network fees and address checksum."],
        "exit_plan": ["Use CeFi off-ramp for taxes and bills."],
        "risks": ["Withdrawal holds and downtime—plan ahead."]
    },
    {
        "title": "DeFi Safety System",
        "overview": "Check approvals, revoke risks, and review audits.",
        "prereqs": ["Wallet connected."],
        "steps": ["Run approvals check and revoke unused allowances.", "Open the audit links and scan for critical issues.", "Set a max per-protocol exposure limit."],
        "exit_plan": ["Create a monthly 'safety day' recurring reminder."],
        "risks": ["Blindly trusting unaudited contracts."]
    },
    {
        "title": "Project Discovery",
        "overview": "Research new tokens and airdrops with a checklist.",
        "prereqs": ["Create a discovery watchlist."],
        "steps": ["Filter by chain/sector/TVL growth.", "Open each project card and read docs + tokenomics.", "Tag as 'watch', 'research', or 'avoid'."],
        "exit_plan": ["Add only top-3 ideas to your rotation."],
        "risks": ["Hype traps without fundamentals."]
    },
    {
        "title": "Yield Pools",
        "overview": "Compare and deploy to the best current yields.",
        "prereqs": ["Wallet ready; gas funded."],
        "steps": ["Sort pools by APY and risk.", "Open pool detail and review IL exposure.", "Deposit small first; scale after a week if stable."],
        "exit_plan": ["Set an APR floor alert to rotate out when yield decays."],
        "risks": ["Chasing high APY with poor liquidity."]
    },
    {
        "title": "30SecondTrader",
        "overview": "Execute quick, rules-based setups fast.",
        "prereqs": ["Predefine size and hotkeys."],
        "steps": ["Scan for your setup (breakout/pullback) on LTF.", "Confirm HTF bias.", "Enter with predefined stop; no hesitation.", "Exit partials at 1R/2R; flat by session end."],
        "exit_plan": ["Journal win/loss, screenshots, and emotion score."],
        "risks": ["Overtrading noise; keep attempts limited."]
    },
    {
        "title": "Warrior Trading (Perps)",
        "overview": "Use leverage with strict risk controls.",
        "prereqs": ["Enable perps access and set max leverage."],
        "steps": ["Pick asset; check funding and OI.", "Use isolated margin; set stop immediately.", "Ladder TPs; never add to losers."],
        "exit_plan": ["Close before major events if overlevered."],
        "risks": ["Liquidation risk; respect position size."]
    },
    {
        "title": "Nancy Pelosi Strategy (Public Filings)",
        "overview": "Track public disclosures and mirror themes, not trades.",
        "prereqs": ["List reliable disclosure sources."],
        "steps": ["Collect latest filings and dates.", "Extract sector/theme, not exact trade.", "Build diversified basket; rebalance monthly."],
        "exit_plan": ["Exit on policy reversals or thesis break."],
        "risks": ["Timing mismatch; never blindly copy size."]
    },
    {
        "title": "Economic Calendar",
        "overview": "Plan risk around macro and token unlocks.",
        "prereqs": ["Subscribe to calendar alerts."],
        "steps": ["Mark high-impact events (CPI, FOMC, unlocks).", "Reduce leverage into events; widen stops.", "Trade reaction, not the headline, if at all."],
        "exit_plan": ["Restore risk only after volatility normalizes."],
        "risks": ["Event whipsaws and fakeouts."]
    }
];