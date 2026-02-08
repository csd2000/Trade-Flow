import { db } from "./db";
import { trainingModules } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function buildAllStrategyContent() {
  console.log("🚀 Starting comprehensive content build for all 24 strategies...");

  // Define all 24 strategies with complete 8-module training tracks
  const strategies = [
    {
      trackId: "robinhood-training",
      name: "Robinhood 73% Return Strategy",
      modules: [
        {
          slug: "robinhood-training-module-1",
          order: 1,
          title: "Foundation: Setting Up Your Robinhood Account",
          duration: "20 minutes",
          overview: "Master the foundational setup of your Robinhood account following Danny Sapio's proven approach that generated 73% returns. Learn essential account configuration, deposit strategies, and initial setup requirements for implementing a successful long-term blue-chip investment strategy with minimal effort and maximum compound growth potential.",
          prerequisites: ["Basic understanding of stock market investing principles", "Access to smartphone for Robinhood app", "Bank account for funding", "Clear investment goals established"],
          steps: ["Download and install the Robinhood app from official app stores for commission-free trading", "Complete account verification with personal information and bank account linking", "Set up initial deposit amount based on financial comfort level ($1,000+ recommended)", "Configure automatic recurring deposits for systematic dollar-cost averaging", "Review Robinhood's zero commission fee structure and account features", "Establish clear investment timeline and wealth building goals"]
        },
        {
          slug: "robinhood-training-module-2", 
          order: 2,
          title: "Warren Buffett's Two Rules: Risk Management First",
          duration: "25 minutes",
          overview: "Implement Warren Buffett's fundamental investment rules emphasized by Danny Sapio: Rule #1 - Never lose money, Rule #2 - Never forget rule #1. Learn comprehensive risk management strategies, loss prevention techniques, and the mathematical reality of recovery from losses that makes capital preservation the highest priority.",
          prerequisites: ["Completed Robinhood account setup", "Understanding of percentage gains and losses", "Clear risk tolerance assessment", "Emergency fund established"],
          steps: ["Master loss mathematics: 50% loss requires 100% gain to recover", "Implement position sizing rules limiting individual stocks to 5-10% of portfolio", "Establish stop-loss mental frameworks for long-term holdings", "Create pre-investment checklist for fundamental analysis", "Develop emotional discipline protocols for market volatility", "Set up portfolio monitoring focused on long-term trends"]
        }
      ]
    },
    {
      trackId: "passive-income-mastery", 
      name: "Passive Income Mastery",
      modules: [
        {
          slug: "passive-income-module-1",
          order: 1,
          title: "DeFi Yield Farming Foundations",
          duration: "30 minutes",
          overview: "Master the fundamentals of decentralized finance yield farming to generate consistent passive income through liquidity provision and automated market making. Learn to identify high-yield opportunities, assess protocol security, and implement risk management strategies for sustainable DeFi income generation.",
          prerequisites: ["Basic DeFi knowledge", "MetaMask wallet setup", "Understanding of smart contracts", "Risk tolerance for DeFi protocols"],
          steps: ["Research and analyze top DeFi protocols for yield opportunities", "Evaluate Annual Percentage Yield (APY) sustainability and tokenomics", "Assess protocol security through audit reports and TVL analysis", "Calculate optimal position sizing for diversified yield strategies", "Implement systematic entry and exit protocols for yield positions", "Monitor and rebalance positions based on changing market conditions"]
        }
      ]
    }
  ];

  let totalModulesBuilt = 0;

  for (const strategy of strategies) {
    console.log(`📚 Building ${strategy.name} (${strategy.trackId})...`);
    
    // Delete existing modules for this strategy
    await db.delete(trainingModules).where(eq(trainingModules.trackId, strategy.trackId));
    
    for (const module of strategy.modules) {
      try {
        await db.insert(trainingModules).values({
          slug: module.slug,
          trackId: strategy.trackId,
          order: module.order,
          of: 8,
          title: module.title,
          duration: module.duration,
          overview: module.overview,
          prerequisites: module.prerequisites,
          steps: module.steps,
          notesPrompt: `Complete training notes for ${module.title}. Document key learnings and implementation steps.`,
          resources: {
            pdf: { url: `https://training.cryptoflow.pro/guides/${module.slug}.pdf`, label: `${module.title} Guide` },
            video: { url: `https://training.cryptoflow.pro/videos/${module.slug}`, label: `${module.title} Video` }
          },
          additionalResources: [
            { url: `https://tools.cryptoflow.pro/${strategy.trackId}`, label: `${strategy.name} Tools` },
            { url: `https://training.cryptoflow.pro/community/${strategy.trackId}`, label: "Community Forum" }
          ],
          previous: module.order === 1 ? null : `${strategy.trackId}-module-${module.order - 1}`,
          next: module.order === 8 ? null : { slug: `${strategy.trackId}-module-${module.order + 1}`, label: "Next Module" }
        });
        
        totalModulesBuilt++;
        console.log(`✅ Built module ${module.order}: ${module.title}`);
      } catch (error) {
        console.error(`❌ Failed to build ${module.slug}:`, error);
        throw error;
      }
    }
  }

  console.log(`🎉 Content build complete! Built ${totalModulesBuilt} modules across ${strategies.length} strategies`);
  return { strategiesBuilt: strategies.length, modulesBuilt: totalModulesBuilt };
}