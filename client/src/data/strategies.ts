// Strategy model
export type Strategy = {
  id: number;              // unique
  slug: string;            // url-safe unique ("oliver-velez-breakout")
  title: string;
  summary: string;
  category: "DeFi" | "Day" | "Swing" | "Alpha" | "Education";
  risk: "Low" | "Medium" | "High";
  roiRange?: string;
  tags: string[];
  trainingUrl?: string;    // video or pdf
  pdfUrl?: string;
};

export const strategies: Strategy[] = [
  { id: 1, slug: "all-trading-strategies-unified", title: "ALL Trading Strategies — Unified", summary: "Launchpad for every preset.", category: "Education", risk: "Low", tags: ["hub","presets"] },
  { id: 2, slug: "passive-income-training", title: "Passive Income Training", summary: "DeFi income, vaults, LPs, auto-compound.", category: "DeFi", risk: "Low", roiRange: "4–40% APY", tags: ["defi","yield"] },
  { id: 3, slug: "oliver-velez-techniques", title: "Oliver Velez Techniques", summary: "Classic professional entries/exits.", category: "Day", risk: "Medium", tags: ["price-action","pro"] },
  { id: 4, slug: "fc-intelligent-decision", title: "F&C Intelligent Decision Strategy", summary: "AI-filtered entries/exits.", category: "Swing", risk: "Medium", tags: ["ai","risk"] },
  { id: 5, slug: "trading-freedom-group", title: "Trading Freedom Group", summary: "Community signals & playbooks.", category: "Education", risk: "Low", tags: ["community","signals"] },
  { id: 6, slug: "defi-strategist-elite-dashboard", title: "DeFi Strategist Elite Dashboard", summary: "All metrics in one view.", category: "Education", risk: "Low", tags: ["dashboard"] },
  { id: 7, slug: "mindful-study-platform", title: "Mindful Study Education Platform", summary: "Discipline, checklists, routines.", category: "Education", risk: "Low", tags: ["mindset"] },
  { id: 8, slug: "live-crypto-cashflow-challenge", title: "LIVE Crypto Cashflow Challenge", summary: "30-day yield challenge.", category: "DeFi", risk: "Low", tags: ["challenge","defi"] },
  { id: 9, slug: "consolidated-crypto-hub", title: "Consolidated Crypto Hub", summary: "All tools unified.", category: "Education", risk: "Low", tags: ["hub"] },
  { id: 10, slug: "protocols", title: "Protocols", summary: "Explore Aave, Curve, GMX, etc.", category: "DeFi", risk: "Medium", tags: ["catalog"] },
  { id: 11, slug: "strategy-builder", title: "Strategy Builder", summary: "Wizard: market→rules→risk→automate.", category: "Education", risk: "Medium", tags: ["builder"] },
  { id: 12, slug: "portfolio", title: "Portfolio", summary: "Positions, PnL, allocations.", category: "Education", risk: "Low", tags: ["portfolio"] },
  { id: 13, slug: "profit-taking", title: "Profit Taking", summary: "Ladders, time-DCA, ATR trail.", category: "Education", risk: "Low", tags: ["exits"] },
  { id: 14, slug: "exit-strategy", title: "Exit Strategy", summary: "Full bull-run exit presets + alerts.", category: "Education", risk: "Low", tags: ["exits","alerts"] },
  { id: 15, slug: "learn-defi", title: "Learn DeFi", summary: "LPs, IL, bridges, audits.", category: "DeFi", risk: "Low", tags: ["education"] },
  { id: 16, slug: "stablecoin-guide", title: "Stablecoin Guide", summary: "DAI/USDC/USDT/LUSD risk/yield.", category: "DeFi", risk: "Low", tags: ["stable"] },
  { id: 17, slug: "robinhood-trading", title: "Robin Hood Trading", summary: "CeFi on-ramp, compare fees.", category: "Education", risk: "Low", tags: ["onramp"] },
  { id: 18, slug: "defi-safety-system", title: "DeFi Safety System", summary: "Revoke, rug-check, approvals.", category: "DeFi", risk: "Low", tags: ["safety"] },
  { id: 19, slug: "project-discovery", title: "Project Discovery", summary: "New tokens, airdrops, narratives.", category: "Alpha", risk: "High", tags: ["discovery"] },
  { id: 20, slug: "yield-pools", title: "Yield Pools", summary: "Compare APY/TVL live.", category: "DeFi", risk: "Medium", tags: ["yield"] },
  { id: 21, slug: "30secondtrader", title: "30SecondTrader", summary: "Fast setups under 30s.", category: "Day", risk: "High", tags: ["quick"] },
  { id: 22, slug: "warrior-trading", title: "Warrior Trading", summary: "Leverage/perps presets.", category: "Day", risk: "High", tags: ["perps"] },
  { id: 23, slug: "nancy-pelosi-strategy", title: "Nancy Pelosi Strategy", summary: "News-based 'smart money' tracking.", category: "Swing", risk: "Medium", tags: ["news"] },
  { id: 24, slug: "economic-calendar", title: "Economic Calendar", summary: "CPI, FOMC, ETF, unlocks.", category: "Education", risk: "Low", tags: ["calendar"] }
];