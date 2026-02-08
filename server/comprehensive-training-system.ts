import { db } from './db';
import { trainingTracks, trainingModules, strategyCatalog, cmsContent } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { comprehensiveTrainingData } from './comprehensive-training-modules';
import { ENHANCED_STRATEGY_MODULES } from './enhanced-strategy-techniques';

// Import the JSON data - now using comprehensive training modules
const masterTrainingData = comprehensiveTrainingData;

// Convert enhanced strategy modules to track format for merging
const enhancedTracks = Object.entries(ENHANCED_STRATEGY_MODULES).map(([key, strategy]) => ({
  track_id: strategy.track_id,
  title: strategy.title,
  description: strategy.description,
  modules: strategy.modules.map(module => ({
    ...module,
    resources: module.resources || {
      video: { label: "Training Video", url: `https://example.com/${module.slug}-video` },
      pdf: { label: "Strategy Guide", url: `https://example.com/${module.slug}.pdf` },
      community: { label: "Discussion Forum", url: `https://example.com/${module.slug}-forum` }
    },
    additional_resources: module.additional_resources || []
  }))
}));

// Merge enhanced tracks into master training data
const mergedTrainingData = {
  ...masterTrainingData,
  tracks: [...masterTrainingData.tracks, ...enhancedTracks]
};

const additionalData = {
  "tracks": [
    {
      "track_id": "passive-income-training",
      "title": "Passive Income Training",
      "modules": [
        {
          "slug": "passive-income-module-1",
          "track": "passive-income-training",
          "order": 1,
          "of": 8,
          "title": "Module 1: Overview & Prerequisites",
          "duration": "15 minutes",
          "overview": "Earn yield using stable LPs, lending, and auto-compounding vaults. This module orients you to safe venues, the wallet setup, and the exact prerequisites before depositing.",
          "prerequisites": [
            "Install MetaMask (or WalletConnect-compatible wallet).",
            "Fund gas on the target chain (ETH on Ethereum, MATIC on Polygon, BNB on BNB Chain).",
            "Have a small test amount ready (e.g., $50–$100) for first deposit.",
            "Bookmark the protocols you plan to use (e.g., Aave, Curve, Beefy)."
          ],
          "steps": [
            "Open DeFi Hub → Passive Income.",
            "Pick a chain (Ethereum, Polygon, or BNB Chain).",
            "Select one conservative strategy (e.g., Aave USDC lending or Curve DAI/USDC LP).",
            "Click 'View Steps' to expand the deposit guide.",
            "Approve the token (one-time) then deposit a small test amount.",
            "Enable auto-compound (if available) and confirm in your wallet.",
            "Write down the protocol URL, deposit date, expected APY, and risks in your notes."
          ],
          "notes_prompt": "Record your funding source, gas cost, and which protocol you deposited into. Add any questions for the next module.",
          "resources": {
            "video": {
              "label": "Watch Video",
              "url": "https://example.com/passive-income-module-1-video"
            },
            "pdf": {
              "label": "Download PDF",
              "url": "https://example.com/passive-income-module-1-guide.pdf"
            },
            "community": {
              "label": "Join Discussion",
              "url": "https://example.com/community-passive-income"
            }
          },
          "additional_resources": [
            {
              "label": "Aave Docs",
              "url": "https://docs.aave.com"
            },
            {
              "label": "Curve Docs",
              "url": "https://resources.curve.fi"
            },
            {
              "label": "Beefy Docs",
              "url": "https://docs.beefy.finance"
            }
          ],
          "previous": null,
          "next": {
            "label": "Next Module",
            "slug": "passive-income-module-2"
          }
        }
      ]
    },
    {
      "track_id": "strategy-builder-training",
      "title": "Strategy Builder Training",
      "modules": [
        {
          "slug": "strategy-builder-module-1",
          "track": "strategy-builder-training",
          "order": 1,
          "of": 8,
          "title": "Foundation of Strategy Building",
          "duration": "20 minutes",
          "overview": "Learn the core principles of creating a profitable crypto trading strategy.",
          "prerequisites": ["Basic knowledge of cryptocurrency markets."],
          "steps": [
            "Understand the concept of edge in trading.",
            "Identify your risk tolerance and trading style.",
            "Familiarize yourself with market types: trending, ranging, volatile."
          ],
          "notes_prompt": "A good strategy is built around your personal goals and the market's behavior.",
          "resources": {
            "video": {
              "label": "Video Tutorial",
              "url": "https://example.com/video-strategy-foundation"
            },
            "pdf": {
              "label": "Strategy Documentation",
              "url": "https://example.com/strategy-foundation.pdf"
            }
          },
          "additional_resources": [
            {
              "label": "Trading View Education",
              "url": "https://www.tradingview.com/education/"
            }
          ],
          "previous": null,
          "next": {
            "label": "Next Module",
            "slug": "strategy-builder-module-2"
          }
        }
      ]
    }
  ]
};

const strategiesData = {
  "strategies": [
    {
      "id": 1,
      "slug": "all-trading-strategies-unified",
      "title": "ALL Trading Strategies — Unified",
      "category": "Education",
      "risk": "Low",
      "roi_range": null,
      "tags": ["hub", "presets"],
      "summary": "Launchpad for every preset.",
      "track_id": null,
      "first_module_slug": null
    },
    {
      "id": 2,
      "slug": "passive-income-training",
      "title": "Passive Income Training",
      "category": "DeFi",
      "risk": "Low",
      "roi_range": "4–40% APY",
      "tags": ["defi", "yield"],
      "summary": "DeFi income, vaults, LPs, auto-compound.",
      "track_id": "passive-income-training",
      "first_module_slug": "passive-income-module-1"
    },
    {
      "id": 11,
      "slug": "strategy-builder",
      "title": "Strategy Builder",
      "category": "Education",
      "risk": "Medium",
      "roi_range": null,
      "tags": ["builder"],
      "summary": "Wizard: market→rules→risk→automate.",
      "track_id": "strategy-builder-training",
      "first_module_slug": "strategy-builder-module-1"
    }
  ]
};

// Training system class to handle all operations
export class ComprehensiveTrainingSystem {
  async seedDatabase() {
    console.log("🌱 Starting comprehensive training database seeding...");
    
    try {
      // Seed tracks from merged data (includes enhanced strategy modules)
      for (const track of mergedTrainingData.tracks) {
        await db.insert(trainingTracks)
          .values({
            trackId: track.track_id,
            title: track.title
          })
          .onConflictDoUpdate({
            target: trainingTracks.trackId,
            set: {
              title: track.title,
              updatedAt: new Date()
            }
          });
        
        console.log(`✓ Seeded track: ${track.title}`);
        
        // Seed modules for this track
        for (const module of track.modules) {
          await db.insert(trainingModules)
            .values({
              trackId: track.track_id,
              slug: module.slug,
              order: module.order,
              of: module.of,
              title: module.title,
              duration: module.duration,
              overview: module.overview,
              prerequisites: module.prerequisites,
              steps: module.steps,
              notesPrompt: module.notes_prompt,
              resources: module.resources,
              additionalResources: module.additional_resources,
              previous: module.previous,
              next: module.next
            })
            .onConflictDoUpdate({
              target: [trainingModules.trackId, trainingModules.slug],
              set: {
                title: module.title,
                duration: module.duration,
                overview: module.overview,
                prerequisites: module.prerequisites,
                steps: module.steps,
                notesPrompt: module.notes_prompt,
                resources: module.resources,
                additionalResources: module.additional_resources,
                previous: module.previous,
                next: module.next,
                updatedAt: new Date()
              }
            });
          
          console.log(`  ✓ Seeded module: ${module.title}`);
        }
      }
      
      // Seed strategies
      for (const strategy of strategiesData.strategies) {
        await db.insert(strategyCatalog)
          .values({
            id: strategy.id,
            slug: strategy.slug,
            title: strategy.title,
            category: strategy.category,
            risk: strategy.risk,
            roiRange: strategy.roi_range,
            tags: strategy.tags,
            summary: strategy.summary,
            trackId: strategy.track_id,
            firstModuleSlug: strategy.first_module_slug
          })
          .onConflictDoUpdate({
            target: strategyCatalog.id,
            set: {
              slug: strategy.slug,
              title: strategy.title,
              category: strategy.category,
              risk: strategy.risk,
              roiRange: strategy.roi_range,
              tags: strategy.tags,
              summary: strategy.summary,
              trackId: strategy.track_id,
              firstModuleSlug: strategy.first_module_slug,
              updatedAt: new Date()
            }
          });
        
        console.log(`✓ Seeded strategy: ${strategy.title}`);
      }
      
      console.log("🌱 Training database seeding completed successfully!");
      return { success: true, message: "Training database seeded successfully" };
    } catch (error) {
      console.error("❌ Error seeding training database:", error);
      throw error;
    }
  }

  async getModule(trackId: string, slug: string) {
    // First check for CMS override
    const cmsOverride = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.path, `/academy/module/${trackId}/${slug}`))
      .limit(1);

    if (cmsOverride.length > 0) {
      // Return CMS override data
      return cmsOverride[0].data;
    }

    // Fallback to database content
    const module = await db
      .select()
      .from(trainingModules)
      .where(
        and(
          eq(trainingModules.trackId, trackId),
          eq(trainingModules.slug, slug)
        )
      )
      .limit(1);

    if (module.length === 0) {
      return null;
    }

    return module[0];
  }

  async getAllStrategies() {
    return await db.select().from(strategyCatalog);
  }

  async getStrategy(slug: string) {
    const strategy = await db
      .select()
      .from(strategyCatalog)
      .where(eq(strategyCatalog.slug, slug))
      .limit(1);

    return strategy.length > 0 ? strategy[0] : null;
  }

  async getTrack(trackId: string) {
    const track = await db
      .select()
      .from(trainingTracks)
      .where(eq(trainingTracks.trackId, trackId))
      .limit(1);

    return track.length > 0 ? track[0] : null;
  }

  async getModulesByTrack(trackId: string) {
    return await db
      .select()
      .from(trainingModules)
      .where(eq(trainingModules.trackId, trackId))
      .orderBy(trainingModules.order);
  }
}

export const trainingSystem = new ComprehensiveTrainingSystem();