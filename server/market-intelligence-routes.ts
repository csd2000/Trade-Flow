import { Router, Request, Response } from "express";
import { getMarketHealthScore, getAIMarketAnalysis } from "./market-intelligence-service";

const router = Router();

router.get("/health-score", async (req: Request, res: Response) => {
  try {
    const healthScore = await getMarketHealthScore();
    res.json(healthScore);
  } catch (error) {
    console.error("Market health score error:", error);
    res.status(500).json({ message: "Failed to calculate market health score" });
  }
});

router.get("/ai-analysis", async (req: Request, res: Response) => {
  try {
    const healthScore = await getMarketHealthScore();
    const analysis = await getAIMarketAnalysis(healthScore);
    res.json({ 
      analysis,
      healthScore 
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({ message: "Failed to generate AI analysis" });
  }
});

export default router;
