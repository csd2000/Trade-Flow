import { Router, Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";

const router = Router();

interface SweepResult {
  symbol: string;
  type: string;
  trap_type: string;
  direction: string;
  sweep_level: number;
  close_price: number;
  penetration: number;
  volume_ratio: number;
  timestamp: string;
  verification?: {
    gate_passed: boolean;
    confidence_score: number;
    grade: string;
    reasons: string[];
  };
}

interface ObservationCycle {
  cycle_number: number;
  timestamp: string;
  symbols_scanned: string[];
  sweeps_detected: SweepResult[];
  verified_sweeps: SweepResult[];
  gate_1_status: string;
  cycle_duration?: number;
}

let agentState = {
  isRunning: false,
  lastCycle: null as ObservationCycle | null,
  cycleHistory: [] as ObservationCycle[],
  totalSweepsDetected: 0,
  totalVerifiedSweeps: 0,
  startTime: null as string | null,
};

async function runPythonScan(symbols?: string[]): Promise<ObservationCycle> {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(process.cwd(), ".pythonlibs", "bin", "python");
    const scriptPath = path.join(process.cwd(), "python_agent", "liquidity_sweep_agent.py");
    
    const args = ["--scan"];
    if (symbols && symbols.length > 0) {
      args.push(...symbols);
    }
    
    const pythonProcess = spawn(pythonPath, [scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env }
    });
    
    let stdout = "";
    let stderr = "";
    
    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
      console.log("[Agent]", data.toString().trim());
    });
    
    pythonProcess.on("close", (code) => {
      try {
        const trimmedOutput = stdout.trim();
        if (trimmedOutput) {
          const result = JSON.parse(trimmedOutput);
          if (result.error) {
            console.error("Agent error:", result.error);
          }
          resolve(result);
        } else {
          reject(new Error("Empty output from Python agent"));
        }
      } catch (e) {
        console.error("Parse error, stdout:", stdout, "stderr:", stderr);
        reject(new Error(`Failed to parse Python output: ${e}`));
      }
    });
    
    pythonProcess.on("error", (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
    
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error("Python scan timed out after 120 seconds"));
    }, 120000);
    
    pythonProcess.on("close", () => clearTimeout(timeout));
  });
}

router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;
    
    console.log("Starting liquidity sweep scan...");
    agentState.isRunning = true;
    if (!agentState.startTime) {
      agentState.startTime = new Date().toISOString();
    }
    
    const result = await runPythonScan(symbols);
    
    agentState.lastCycle = result;
    agentState.cycleHistory.push(result);
    if (agentState.cycleHistory.length > 100) {
      agentState.cycleHistory.shift();
    }
    
    agentState.totalSweepsDetected += result.sweeps_detected.length;
    agentState.totalVerifiedSweeps += result.verified_sweeps.length;
    agentState.isRunning = false;
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Scan error:", error.message);
    agentState.isRunning = false;
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get("/status", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      isRunning: agentState.isRunning,
      lastCycle: agentState.lastCycle,
      totalCycles: agentState.cycleHistory.length,
      totalSweepsDetected: agentState.totalSweepsDetected,
      totalVerifiedSweeps: agentState.totalVerifiedSweeps,
      startTime: agentState.startTime,
      gate1Status: agentState.lastCycle?.gate_1_status || "IDLE",
      recentVerifiedSweeps: agentState.cycleHistory
        .flatMap(c => c.verified_sweeps)
        .slice(-10)
    }
  });
});

router.get("/history", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  
  res.json({
    success: true,
    data: agentState.cycleHistory.slice(-limit)
  });
});

router.get("/verified-sweeps", (req: Request, res: Response) => {
  const allVerified = agentState.cycleHistory.flatMap(c => c.verified_sweeps);
  
  res.json({
    success: true,
    data: allVerified,
    count: allVerified.length
  });
});

router.post("/analyze/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const formattedSymbol = symbol.includes("/") ? symbol : `${symbol}/USDT`;
    
    console.log(`Analyzing ${formattedSymbol} for liquidity sweeps...`);
    const result = await runPythonScan([formattedSymbol]);
    
    const sweepForSymbol = result.sweeps_detected.find(s => s.symbol === formattedSymbol);
    const verifiedSweep = result.verified_sweeps.find(s => s.symbol === formattedSymbol);
    
    res.json({
      success: true,
      data: {
        symbol: formattedSymbol,
        hasSweep: !!sweepForSymbol,
        isVerified: !!verifiedSweep,
        sweep: sweepForSymbol || null,
        gate1Passed: !!verifiedSweep,
        analysis: {
          direction: verifiedSweep?.direction || sweepForSymbol?.direction || null,
          confidence: verifiedSweep?.verification?.confidence_score || 0,
          grade: verifiedSweep?.verification?.grade || "N/A",
          reasons: verifiedSweep?.verification?.reasons || []
        }
      }
    });
  } catch (error: any) {
    console.error(`Analysis error for ${req.params.symbol}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/reset", (req: Request, res: Response) => {
  agentState = {
    isRunning: false,
    lastCycle: null,
    cycleHistory: [],
    totalSweepsDetected: 0,
    totalVerifiedSweeps: 0,
    startTime: null,
  };
  
  res.json({
    success: true,
    message: "Agent state reset"
  });
});

export default router;
