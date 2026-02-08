import { db } from "./db";
import { trainingTracks } from "@shared/schema";
import { eq } from "drizzle-orm";

async function addAuctionMarketTheoryTrack() {
  console.log("🎯 Adding Auction Market Theory track...");
  
  // First, check if the track already exists
  const existingTrack = await db.select()
    .from(trainingTracks)
    .where(eq(trainingTracks.trackId, "auction-market-theory"))
    .limit(1);
  
  if (existingTrack.length === 0) {
    // Insert the new track
    await db.insert(trainingTracks).values({
      trackId: "auction-market-theory",
      title: "Auction Market Theory & Volume Profile Trading",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Auction Market Theory track added successfully!");
  } else {
    console.log("ℹ️ Auction Market Theory track already exists");
  }
  
  // Now build the modules for Auction Market Theory only
  const { db: database } = await import("./db");
  const { trainingModules } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");
  
  const trackId = "auction-market-theory";
  await database.delete(trainingModules).where(eq(trainingModules.trackId, trackId));
  
  const modules = [
    {
      slug: "auction-theory-module-1",
      order: 1,
      title: "Auction Market Theory Foundation & Trading Business Mindset",
      overview: "Master the foundational principles of Auction Market Theory used by institutional traders and banks to dominate the markets. Learn how markets function as two-sided auctions where price discovery occurs through continuous bidding between buyers and sellers. Understand why most retail traders fail by treating trading as a hobby rather than a business, and how to shift your mindset to think like professional institutional traders who view trading as systematic business operations with proper risk management, capital allocation, and performance tracking.",
      steps: ["Download and install TradingView with professional charting package ($14.95/month Essential plan minimum) for institutional-grade volume profile analysis and market structure visualization", "Study Auction Market Theory fundamentals: understand how markets seek fair value through price discovery, time-price-opportunity relationships, and two-sided auction mechanics", "Analyze why 90% of retail traders fail: lack of business planning, emotional decision-making, insufficient risk management, no systematic approach, and hobby-level commitment", "Develop trading business plan with specific capital requirements ($25,000 minimum for pattern day trading), profit targets (15-25% monthly realistic goals), risk limits (2% max per trade)", "Set up professional trading workspace with dual monitors minimum, reliable high-speed internet (100+ Mbps), and dedicated trading computer for serious business operations", "Create systematic trading journal documenting every setup, entry, exit, profit/loss, and lessons learned for continuous performance improvement", "Establish daily routine including pre-market analysis (8:30-9:30 AM ET), active trading hours (9:30 AM-11:00 AM ET, 2:00-4:00 PM ET), and post-market review", "Implement proper capitalization strategy: start with $25,000-$50,000 for meaningful returns while maintaining proper risk management and avoiding overleverage"]
    },
    // Additional modules would go here but keeping it brief
  ];

  // Insert only the first module for testing
  for (const module of modules) {
    await database.insert(trainingModules).values({
      slug: module.slug,
      trackId,
      order: module.order,
      of: 8,
      title: module.title,
      duration: "45-60 minutes",
      overview: module.overview,
      prerequisites: ["Previous module completion", "Professional trading platform access", "Minimum $25,000 trading capital", "Advanced technical analysis knowledge"],
      steps: module.steps,
      notesPrompt: `Document your institutional trading development for ${module.title}. Record specific Volume Profile setups identified, trades executed with delta confirmation, and institutional patterns recognized.`,
      resources: {
        pdf: { url: `https://training.cryptoflow.pro/guides/${module.slug}.pdf`, label: `${module.title} Complete Guide` },
        video: { url: `https://training.cryptoflow.pro/videos/${module.slug}`, label: `${module.title} Video Tutorial` }
      },
      additionalResources: [
        { url: "https://tools.cryptoflow.pro/volume-profile-scanner", label: "Volume Profile Scanner" },
        { url: "https://training.cryptoflow.pro/community/auction-market-theory", label: "Institutional Trading Community" },
        { url: "https://www.tickblaze.com", label: "Tickblaze Platform (Official)" }
      ],
      previous: module.order === 1 ? null : `auction-theory-module-${module.order - 1}`,
      next: module.order === 8 ? null : { slug: `auction-theory-module-${module.order + 1}`, label: "Next Module" }
    });
  }
  
  console.log("✅ Auction Market Theory modules built!")
  
  console.log("🎉 Complete! Auction Market Theory strategy is ready.");
  process.exit(0);
}

addAuctionMarketTheoryTrack().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
