import { db } from "./db";
import { trainingTracks } from "@shared/schema";
import { eq } from "drizzle-orm";
import { buildAuctionMarketTheoryStrategy } from "./comprehensive-strategy-builder";

async function runAuctionBuild() {
  console.log("🎯 Building complete Auction Market Theory strategy...");
  
  // Ensure the track exists
  const existingTrack = await db.select()
    .from(trainingTracks)
    .where(eq(trainingTracks.trackId, "auction-market-theory"))
    .limit(1);
  
  if (existingTrack.length === 0) {
    await db.insert(trainingTracks).values({
      trackId: "auction-market-theory",
      title: "Auction Market Theory & Volume Profile Trading",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Track created");
  }
  
  // Build all 8 modules
  await buildAuctionMarketTheoryStrategy();
  
  console.log("🎉 Complete! All 8 Auction Market Theory modules are ready.");
  process.exit(0);
}

runAuctionBuild().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
