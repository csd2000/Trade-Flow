import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, Lock, Unlock, AlertTriangle, CheckCircle, Clock, 
  Target, Activity, Download, RefreshCw, Zap, AlertOctagon,
  TrendingUp, TrendingDown, Droplets, BarChart3, Brain,
  ChevronRight, Eye, EyeOff, Sparkles, XOctagon, HelpCircle, X, ArrowRight, ArrowLeft,
  Bot, Radar, Signal, Radio, Timer
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import TradingViewChart from '@/components/TradingViewChart';
import MarketClock from '@/components/MarketClock';

interface AgentSweep {
  symbol: string;
  type: string;
  trap_type: string;
  direction: string;
  level_type: string;
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

interface AgentStatus {
  isRunning: boolean;
  lastCycle: {
    cycle_number: number;
    timestamp: string;
    symbols_scanned: string[];
    sweeps_detected: AgentSweep[];
    verified_sweeps: AgentSweep[];
    gate_1_status: string;
    cycle_duration?: number;
  } | null;
  totalCycles: number;
  totalSweepsDetected: number;
  totalVerifiedSweeps: number;
  gate1Status: string;
  recentVerifiedSweeps: AgentSweep[];
}

const WALKTHROUGH_STEPS = [
  {
    id: 1,
    title: "Welcome to the 7-Gate Decision Engine",
    content: "This professional trading validation system helps you make disciplined trading decisions by walking you through 7 sequential gates. Each gate must be completed before moving to the next, ensuring you never skip important checks.",
    highlight: 'header'
  },
  {
    id: 2,
    title: "Enter Your Symbol",
    content: "Start by entering the ticker symbol you're analyzing (e.g., SPY, AAPL, QQQ). This helps you track which setup you're validating.",
    highlight: 'symbol'
  },
  {
    id: 3,
    title: "Progress Tracker",
    content: "The progress bar shows your gate completion status. It changes from red to green as you complete more gates. Each circle represents one of the 7 gates (1-7).",
    highlight: 'progress'
  },
  {
    id: 4,
    title: "Gate 1: Liquidity Sweep (The Hunt)",
    content: "PRIMARY TRIGGER: The system must first detect a raid on previous daily, weekly, or session lows. This ensures the reversal is backed by 'smart money' collecting sell-side liquidity. If you select 'No Sweep', the system displays 'STAY FLAT'.",
    highlight: 'gate1'
  },
  {
    id: 5,
    title: "Gates 2-4: Structure & Displacement",
    content: "Gate 2 confirms MSS (break above swing high). Gate 3 validates displacement with a Large Range Candle. Gate 4 identifies the Fair Value Gap entry zone within the displacement leg.",
    highlight: 'structure'
  },
  {
    id: 6,
    title: "Gates 5-6: Premium/Discount & HTF",
    content: "Gate 5 ensures entry is in the DISCOUNT zone (<50% of range). Gate 6 confirms alignment with 4H/Daily HTF bias. Invalid entries in premium zones are blocked.",
    highlight: 'risk'
  },
  {
    id: 7,
    title: "Gate 7: Killzone & Macro Confluence",
    content: "Priority given to setups during London (3-5 AM EST) or New York (9:30-11 AM EST) Killzones. High-impact news check included.",
    highlight: 'killzone'
  },
  {
    id: 8,
    title: "Setup Grade & Trade Card",
    content: "After completing all gates, you'll receive a setup grade (A+, A, B, C, or F) based on sweep quality, HTF alignment, killzone timing, and discount entry. Export your Trade Card as a JSON file.",
    highlight: 'grade'
  },
  {
    id: 9,
    title: "Kill-Switch Protection",
    content: "If you violate a hard rule (no sweep, not in discount zone, or high-impact news), the system displays 'STAY FLAT: INVALID SETUP'. This protects you from taking bad trades.",
    highlight: 'killswitch'
  },
  {
    id: 10,
    title: "You're Ready!",
    content: "Your progress is automatically saved, so you can close the browser and return later. Click 'Reset' to start a fresh analysis. Happy trading!",
    highlight: 'reset'
  }
];

interface GateConfig {
  id: number;
  name: string;
  type: 'primary' | 'structure' | 'risk' | 'psychology';
  description: string;
  fields: GateField[];
}

interface GateField {
  id: string;
  label: string;
  type: 'checkbox' | 'select' | 'number' | 'text';
  options?: string[];
  required?: boolean;
  killSwitch?: boolean;
  killValue?: any;
}

interface GateState {
  completed: boolean;
  data: Record<string, any>;
  timestamp?: number;
}

const GATES: GateConfig[] = [
  {
    id: 1,
    name: "Liquidity Sweep (The Hunt)",
    type: 'primary',
    description: "PRIMARY TRIGGER: Detect raid on previous daily, weekly, or session lows. Smart money collecting sell-side liquidity before reversal.",
    fields: [
      { id: 'sweepStatus', label: 'Sweep Status', type: 'select', options: ['Yes - External Low Swept', 'Yes - External High Swept', 'No Sweep'], required: true, killSwitch: true, killValue: 'No Sweep' },
      { id: 'sweepLevel', label: 'External Liquidity Level', type: 'select', options: ['Previous Day Low (PDL)', 'Previous Week Low (PWL)', 'Session Low', 'Previous Day High (PDH)', 'Previous Week High (PWH)', 'Session High'], required: true },
      { id: 'sweepQuality', label: 'Sweep Quality', type: 'select', options: ['Clean trap (single wick)', 'Multiple touches', 'Deep penetration with recovery'] },
      { id: 'sweepDirection', label: 'Expected Move Direction', type: 'select', options: ['LONG (swept lows → expecting up)', 'SHORT (swept highs → expecting down)'] }
    ]
  },
  {
    id: 2,
    name: "Market Structure Shift (MSS)",
    type: 'structure',
    description: "Clean break above the swing high that preceded the sweep. Confirms reversal momentum.",
    fields: [
      { id: 'mssConfirmed', label: 'MSS/CHoCH confirmed above preceding swing', type: 'checkbox', required: true },
      { id: 'structureType', label: 'Structure Break Type', type: 'select', options: ['CHoCH (Change of Character)', 'BOS (Break of Structure)', 'Internal BOS'] },
      { id: 'swingHighPrice', label: 'Swing High Broken (Price)', type: 'number' },
      { id: 'structureTimeframe', label: 'Confirmation Timeframe', type: 'select', options: ['1-minute', '5-minute', '15-minute', '1-hour'] }
    ]
  },
  {
    id: 3,
    name: "Displacement & Volume",
    type: 'structure',
    description: "Aggressive imbalance candle (Large Range Candle) confirming reversal strength.",
    fields: [
      { id: 'displacementConfirmed', label: 'Large Range Candle (LRC) identified', type: 'checkbox', required: true },
      { id: 'lrcBodySize', label: 'LRC Body vs Recent Average', type: 'select', options: ['2x average (strong)', '3x average (very strong)', '4x+ average (extreme)'] },
      { id: 'volumeSpike', label: 'Volume spike confirmed', type: 'checkbox' },
      { id: 'closeStrength', label: 'Close in direction of move', type: 'select', options: ['Strong close (>75%)', 'Moderate close (50-75%)', 'Weak close (<50%)'] }
    ]
  },
  {
    id: 4,
    name: "Fair Value Gap (FVG) Validation",
    type: 'structure',
    description: "Price inefficiency within the displacement leg. Entry zone identification.",
    fields: [
      { id: 'fvgIdentified', label: 'FVG within displacement leg', type: 'checkbox', required: true },
      { id: 'fvgType', label: 'FVG Type', type: 'select', options: ['Bullish FVG (gap up)', 'Bearish FVG (gap down)'] },
      { id: 'fvgHighPrice', label: 'FVG High Price', type: 'number' },
      { id: 'fvgLowPrice', label: 'FVG Low Price', type: 'number' },
      { id: 'entryPrice', label: 'Entry Price (within FVG)', type: 'number' }
    ]
  },
  {
    id: 5,
    name: "Premium vs. Discount Array",
    type: 'risk',
    description: "Entry signals only valid if price retraces into the DISCOUNT zone (<50% of range).",
    fields: [
      { id: 'rangeHigh', label: 'Range High', type: 'number' },
      { id: 'rangeLow', label: 'Range Low', type: 'number' },
      { id: 'equilibrium', label: '50% Equilibrium Price', type: 'number' },
      { id: 'priceInDiscount', label: 'Entry is in DISCOUNT zone (<50%)', type: 'checkbox', required: true, killSwitch: true, killValue: false },
      { id: 'zoneLocation', label: 'Current Zone', type: 'select', options: ['Deep Discount (0-25%)', 'Discount (25-50%)', 'Premium (50-75%)', 'Deep Premium (75-100%)'] }
    ]
  },
  {
    id: 6,
    name: "Higher Timeframe (HTF) Alignment",
    type: 'structure',
    description: "Confirm reversal aligns with 4H or Daily bias. Institutional flow direction.",
    fields: [
      { id: 'htfBias', label: 'Daily/4H Bias', type: 'select', options: ['Bullish (HTF uptrend)', 'Bearish (HTF downtrend)', 'Ranging (no clear direction)'] },
      { id: 'htfAligned', label: 'Trade aligns with HTF bias', type: 'checkbox', required: true },
      { id: 'htfKeyLevel', label: 'At HTF key level (S/R)', type: 'checkbox' },
      { id: 'htfPOI', label: 'HTF POI Type', type: 'select', options: ['HTF Order Block', 'HTF FVG', 'HTF S/R Level', 'None'] }
    ]
  },
  {
    id: 7,
    name: "Macro/Time Confluence (Killzones)",
    type: 'risk',
    description: "Priority given to setups during London or New York Killzones. Optimal execution windows.",
    fields: [
      { id: 'inKillzone', label: 'Trading during Killzone', type: 'checkbox', required: true },
      { id: 'killzone', label: 'Current Killzone', type: 'select', options: ['London Open (3-5 AM EST)', 'NY Open (9:30-11 AM EST)', 'London Close (11 AM-12 PM EST)', 'NY PM (1:30-3 PM EST)', 'Off-Hours'] },
      { id: 'noHighImpactNews', label: 'No high-impact news within 30 mins', type: 'checkbox', required: true, killSwitch: true, killValue: false },
      { id: 'newsChecked', label: 'Economic calendar verified', type: 'checkbox' }
    ]
  }
];

const STORAGE_KEY = 'seven-gate-decision-state';

export default function SevenGateDecision() {
  const [activeGate, setActiveGate] = useState(1);
  const [gateStates, setGateStates] = useState<Record<number, GateState>>({});
  const [symbol, setSymbol] = useState('');
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState('');
  const [showTradeCard, setShowTradeCard] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [autoScanInterval, setAutoScanInterval] = useState<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: agentStatus, isLoading: agentLoading, refetch: refetchAgent } = useQuery<{ success: boolean; data: AgentStatus }>({
    queryKey: ['/api/liquidity-agent/status'],
    refetchInterval: 30000,
  });

  const scanMutation = useMutation({
    mutationFn: async (symbols?: string[]) => {
      const response = await apiRequest('/api/liquidity-agent/scan', 'POST', { symbols });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liquidity-agent/status'] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (targetSymbol: string) => {
      const response = await apiRequest(`/api/liquidity-agent/analyze/${targetSymbol}`, 'POST');
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data?.data?.isVerified && data?.data?.sweep) {
        const sweep = data.data.sweep;
        const isLow = sweep.trap_type === 'bear_trap' || sweep.direction === 'LONG';
        handleGateUpdate(1, 'sweepStatus', isLow ? 'Yes - External Low Swept' : 'Yes - External High Swept');
        handleGateUpdate(1, 'sweepDirection', sweep.direction === 'LONG' ? 'LONG (swept lows → expecting up)' : 'SHORT (swept highs → expecting down)');
        
        const levelTypeMap: Record<string, string> = {
          'session_low': 'Session Low',
          'session_high': 'Session High',
          'prev_day_low': 'Previous Day Low (PDL)',
          'prev_day_high': 'Previous Day High (PDH)',
          'support': 'Session Low',
          'resistance': 'Session High'
        };
        handleGateUpdate(1, 'sweepLevel', levelTypeMap[sweep.level_type] || 'Session Low');
        
        if (sweep.verification?.confidence_score >= 80) {
          handleGateUpdate(1, 'sweepQuality', 'Clean trap (single wick)');
        } else if (sweep.verification?.confidence_score >= 60) {
          handleGateUpdate(1, 'sweepQuality', 'Multiple touches');
        } else {
          handleGateUpdate(1, 'sweepQuality', 'Deep penetration with recovery');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/liquidity-agent/status'] });
    },
  });

  const startAutonomousScan = () => {
    if (autoScanInterval) {
      clearInterval(autoScanInterval);
      setAutoScanInterval(null);
      return;
    }
    scanMutation.mutate(undefined);
    const interval = setInterval(() => {
      scanMutation.mutate(undefined);
    }, 300000);
    setAutoScanInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (autoScanInterval) {
        clearInterval(autoScanInterval);
      }
    };
  }, [autoScanInterval]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGateStates(parsed.gateStates || {});
        setActiveGate(parsed.activeGate || 1);
        setSymbol(parsed.symbol || '');
      } catch (e) {
        console.error('Failed to parse saved state');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      gateStates,
      activeGate,
      symbol
    }));
  }, [gateStates, activeGate, symbol]);

  const validateGateSequence = useCallback((gateId: number): boolean => {
    if (gateId === 1) return true;
    for (let i = 1; i < gateId; i++) {
      if (!gateStates[i]?.completed) return false;
    }
    return true;
  }, [gateStates]);

  const checkKillSwitch = useCallback((gateId: number, data: Record<string, any>): { kill: boolean; reason: string } => {
    const gate = GATES.find(g => g.id === gateId);
    if (!gate) return { kill: false, reason: '' };
    for (const field of gate.fields) {
      if (field.killSwitch && data[field.id] === field.killValue) {
        return { kill: true, reason: `${field.label} violated` };
      }
    }
    return { kill: false, reason: '' };
  }, []);

  const handleGateUpdate = (gateId: number, fieldId: string, value: any) => {
    if (!validateGateSequence(gateId)) return;
    
    setGateStates(prev => {
      const newData = { ...prev[gateId]?.data, [fieldId]: value };
      const killCheck = checkKillSwitch(gateId, newData);
      
      if (killCheck.kill) {
        setKillSwitchActive(true);
        setKillSwitchReason(killCheck.reason);
      } else {
        setKillSwitchActive(false);
        setKillSwitchReason('');
      }

      return {
        ...prev,
        [gateId]: {
          ...prev[gateId],
          data: newData,
          timestamp: Date.now()
        }
      };
    });
  };

  const handleGateCompletion = (gateId: number) => {
    if (!validateGateSequence(gateId)) return;
    if (killSwitchActive) return;

    const gate = GATES.find(g => g.id === gateId);
    if (!gate) return;
    
    const gateData = gateStates[gateId]?.data || {};
    
    for (const field of gate.fields) {
      if (field.required && !gateData[field.id]) {
        return;
      }
    }

    setGateStates(prev => ({
      ...prev,
      [gateId]: {
        ...prev[gateId],
        completed: true,
        timestamp: Date.now()
      }
    }));

    const gateIndex = GATES.findIndex(g => g.id === gateId);
    if (gateId === activeGate && gateIndex < GATES.length - 1) {
      setActiveGate(GATES[gateIndex + 1].id);
    }

    if (gateId === GATES[GATES.length - 1].id) {
      setShowTradeCard(true);
    }
  };

  const resetAllGates = () => {
    setGateStates({});
    setActiveGate(1);
    setKillSwitchActive(false);
    setKillSwitchReason('');
    setShowTradeCard(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getSetupGrade = (): { grade: string; color: string; description: string } => {
    const completedGates = Object.values(gateStates).filter(g => g.completed).length;
    const sweepQuality = gateStates[1]?.data?.sweepQuality;
    const htfAligned = gateStates[6]?.data?.htfAligned;
    const inKillzone = gateStates[7]?.data?.inKillzone;
    const priceInDiscount = gateStates[5]?.data?.priceInDiscount;

    if (completedGates === 7 && sweepQuality === 'Clean trap (single wick)' && htfAligned && inKillzone && priceInDiscount) {
      return { grade: 'A+', color: 'text-[#00ff41]', description: 'Perfect setup - Maximum conviction' };
    }
    if (completedGates === 7 && htfAligned && (inKillzone || priceInDiscount)) {
      return { grade: 'A', color: 'text-[#00ff41]', description: 'Excellent setup - High conviction' };
    }
    if (completedGates >= 5 && htfAligned) {
      return { grade: 'B', color: 'text-amber-400', description: 'Good setup - Standard conviction' };
    }
    if (completedGates >= 3) {
      return { grade: 'C', color: 'text-orange-400', description: 'Marginal setup - Reduced size' };
    }
    return { grade: 'F', color: 'text-[#ff0000]', description: 'Invalid setup - No trade' };
  };

  const getProgressPercentage = (): number => {
    const completedGates = Object.values(gateStates).filter(g => g.completed).length;
    return (completedGates / GATES.length) * 100;
  };

  const getProgressColor = (): string => {
    const progress = getProgressPercentage();
    if (progress >= 80) return 'bg-[#00ff41]';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-[#ff0000]';
  };

  const exportTradeCard = () => {
    const grade = getSetupGrade();
    const cardData = {
      symbol,
      grade: grade.grade,
      timestamp: new Date().toISOString(),
      sweepLevel: gateStates[1]?.data?.sweepLevel,
      sweepDirection: gateStates[1]?.data?.sweepDirection,
      sweepQuality: gateStates[1]?.data?.sweepQuality,
      mssConfirmed: gateStates[2]?.data?.mssConfirmed,
      swingHighPrice: gateStates[2]?.data?.swingHighPrice,
      displacementConfirmed: gateStates[3]?.data?.displacementConfirmed,
      lrcBodySize: gateStates[3]?.data?.lrcBodySize,
      fvgType: gateStates[4]?.data?.fvgType,
      entryPrice: gateStates[4]?.data?.entryPrice,
      priceInDiscount: gateStates[5]?.data?.priceInDiscount,
      zoneLocation: gateStates[5]?.data?.zoneLocation,
      htfBias: gateStates[6]?.data?.htfBias,
      htfAligned: gateStates[6]?.data?.htfAligned,
      killzone: gateStates[7]?.data?.killzone,
      inKillzone: gateStates[7]?.data?.inKillzone
    };
    
    const blob = new Blob([JSON.stringify(cardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-card-${symbol}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGateField = (gate: GateConfig, field: GateField) => {
    const value = gateStates[gate.id]?.data?.[field.id];
    const isLocked = !validateGateSequence(gate.id);

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="flex items-center gap-3 py-2">
          <Checkbox
            id={field.id}
            checked={!!value}
            onCheckedChange={(checked) => handleGateUpdate(gate.id, field.id, checked)}
            disabled={isLocked}
            className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label 
            htmlFor={field.id} 
            className={`text-sm ${isLocked ? 'text-slate-300' : 'text-slate-200'} ${field.required ? 'font-medium' : ''}`}
          >
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </Label>
        </div>
      );
    }

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.id} className="py-2">
          <Label className={`text-sm ${isLocked ? 'text-slate-300' : 'text-slate-300'}`}>
            {field.label}
          </Label>
          <Select
            value={value || ''}
            onValueChange={(val) => handleGateUpdate(gate.id, field.id, val)}
            disabled={isLocked}
          >
            <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt} className="text-white hover:bg-slate-700">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === 'number' || field.type === 'text') {
      return (
        <div key={field.id} className="py-2">
          <Label className={`text-sm ${isLocked ? 'text-slate-300' : 'text-slate-300'}`}>
            {field.label}
          </Label>
          <Input
            type={field.type}
            value={value || ''}
            onChange={(e) => handleGateUpdate(gate.id, field.id, e.target.value)}
            disabled={isLocked}
            className="mt-1 bg-slate-800 border-slate-600 text-white"
            step={field.type === 'number' ? '0.01' : undefined}
          />
        </div>
      );
    }

    return null;
  };

  const getGateTypeColor = (type: string): string => {
    switch (type) {
      case 'primary': return 'from-violet-600 to-purple-600';
      case 'structure': return 'from-blue-600 to-cyan-600';
      case 'risk': return 'from-amber-600 to-orange-600';
      case 'psychology': return 'from-emerald-600 to-teal-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {killSwitchActive && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <Card className="bg-[#1a0000] border-2 border-[#ff0000] max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <XOctagon className="h-20 w-20 text-[#ff0000] mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-[#ff0000] mb-2">STAY FLAT</h2>
                <p className="text-xl text-red-300 mb-4">INVALID SETUP</p>
                <p className="text-slate-300 mb-6">{killSwitchReason}</p>
                <Button onClick={resetAllGates} className="bg-[#ff0000] hover:bg-red-700 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {showWalkthrough && (
          <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
            <Card className="bg-slate-900 border-2 border-violet-500 max-w-lg w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {walkthroughStep + 1}
                    </div>
                    <span className="text-xs text-slate-200">of {WALKTHROUGH_STEPS.length}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowWalkthrough(false)}
                    className="text-slate-200 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardTitle className="text-white text-xl mt-2">
                  {WALKTHROUGH_STEPS[walkthroughStep]?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed mb-6">
                  {WALKTHROUGH_STEPS[walkthroughStep]?.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setWalkthroughStep(prev => Math.max(0, prev - 1))}
                    disabled={walkthroughStep === 0}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {WALKTHROUGH_STEPS.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === walkthroughStep ? 'bg-violet-500' : idx < walkthroughStep ? 'bg-[#00ff41]' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {walkthroughStep < WALKTHROUGH_STEPS.length - 1 ? (
                    <Button
                      onClick={() => setWalkthroughStep(prev => prev + 1)}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowWalkthrough(false);
                        setWalkthroughStep(0);
                      }}
                      className="bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold"
                    >
                      Start Trading
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <MarketClock />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl animate-pulse">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">7-Gate Decision Engine</h1>
              <p className="text-sm text-slate-200">Sequential Trading Validation System</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol"
              className="w-24 sm:w-32 bg-slate-900 border-slate-700 text-white uppercase text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWalkthroughStep(0);
                setShowWalkthrough(true);
              }}
              className="border-violet-500 text-violet-400 hover:bg-violet-500/10"
            >
              <HelpCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Guide</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllGates}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* Autonomous Liquidity Sweep Agent Panel */}
        <Card className={`border-2 ${autoScanInterval ? 'border-[#00ff41] bg-[#001a0a]' : 'border-cyan-500/50 bg-slate-900/80'}`}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${autoScanInterval ? 'bg-[#00ff41]/20' : 'bg-cyan-500/20'}`}>
                  <Bot className={`h-6 w-6 ${autoScanInterval ? 'text-[#00ff41] animate-pulse' : 'text-cyan-400'}`} />
                </div>
                <div>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    Autonomous Sweep Agent
                    {autoScanInterval && (
                      <Badge className="bg-[#00ff41] text-black text-xs">LIVE</Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-slate-200">Python/CCXT • 5-minute observation cycles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAgentPanel(!showAgentPanel)}
                  className="border-slate-600 text-slate-300"
                >
                  {showAgentPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={() => scanMutation.mutate(undefined)}
                  disabled={scanMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {scanMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Radar className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">Scan Now</span>
                </Button>
                <Button
                  size="sm"
                  onClick={startAutonomousScan}
                  className={autoScanInterval 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-[#00ff41] hover:bg-[#00cc33] text-black'
                  }
                >
                  {autoScanInterval ? (
                    <>
                      <Radio className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Timer className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Auto</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showAgentPanel && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-200">Cycles Run</p>
                  <p className="text-xl font-bold text-white">{agentStatus?.data?.totalCycles || 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-200">Sweeps Detected</p>
                  <p className="text-xl font-bold text-amber-400">{agentStatus?.data?.totalSweepsDetected || 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-200">Verified Sweeps</p>
                  <p className="text-xl font-bold text-[#00ff41]">{agentStatus?.data?.totalVerifiedSweeps || 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-200">Gate 1 Status</p>
                  <p className={`text-sm font-bold ${
                    agentStatus?.data?.gate1Status === 'PASSED' ? 'text-[#00ff41]' : 
                    agentStatus?.data?.gate1Status === 'MONITORING' ? 'text-amber-400' : 'text-slate-200'
                  }`}>
                    {agentStatus?.data?.gate1Status || 'IDLE'}
                  </p>
                </div>
              </div>

              {symbol && (
                <div className="mb-4">
                  <Button
                    onClick={() => analyzeMutation.mutate(symbol)}
                    disabled={analyzeMutation.isPending || !symbol}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    {analyzeMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Signal className="h-4 w-4 mr-2" />
                    )}
                    Analyze {symbol} for Liquidity Sweep
                  </Button>
                </div>
              )}

              {agentStatus?.data?.recentVerifiedSweeps && agentStatus.data.recentVerifiedSweeps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-200 uppercase tracking-wide">Recent Verified Sweeps</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {agentStatus.data.recentVerifiedSweeps.slice(-5).map((sweep, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          sweep.direction === 'LONG' ? 'bg-emerald-900/30 border border-emerald-700/50' : 'bg-red-900/30 border border-red-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {sweep.direction === 'LONG' ? (
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                          <div>
                            <p className="font-bold text-white">{sweep.symbol}</p>
                            <p className="text-xs text-slate-200">{sweep.trap_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            sweep.verification?.grade === 'A+' || sweep.verification?.grade === 'A' 
                              ? 'bg-[#00ff41] text-black' 
                              : sweep.verification?.grade === 'B' 
                                ? 'bg-amber-500 text-black' 
                                : 'bg-slate-600'
                          }`}>
                            {sweep.verification?.grade || 'N/A'}
                          </Badge>
                          <p className="text-xs text-slate-200 mt-1">{sweep.verification?.confidence_score}% conf</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSymbol(sweep.symbol.replace('/USD', ''));
                            const isLow = sweep.trap_type === 'bear_trap' || sweep.direction === 'LONG';
                            handleGateUpdate(1, 'sweepStatus', isLow ? 'Yes - External Low Swept' : 'Yes - External High Swept');
                            handleGateUpdate(1, 'sweepDirection', sweep.direction === 'LONG' ? 'LONG (swept lows → expecting up)' : 'SHORT (swept highs → expecting down)');
                            if (sweep.verification?.confidence_score && sweep.verification.confidence_score >= 80) {
                              handleGateUpdate(1, 'sweepQuality', 'Clean trap (single wick)');
                            } else if (sweep.verification?.confidence_score && sweep.verification.confidence_score >= 60) {
                              handleGateUpdate(1, 'sweepQuality', 'Multiple touches');
                            } else {
                              handleGateUpdate(1, 'sweepQuality', 'Deep penetration with recovery');
                            }
                            const levelTypeMap: Record<string, string> = {
                              'session_low': 'Session Low',
                              'session_high': 'Session High',
                              'prev_day_low': 'Previous Day Low (PDL)',
                              'prev_day_high': 'Previous Day High (PDH)',
                              'support': 'Session Low',
                              'resistance': 'Session High'
                            };
                            handleGateUpdate(1, 'sweepLevel', levelTypeMap[sweep.level_type] || 'Session Low');
                          }}
                          className="text-violet-400 hover:text-violet-300"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-400" />
                TradingView Chart
              </CardTitle>
              <Badge variant="outline" className="text-violet-400 border-violet-400">{symbol || 'SPY'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full">
              <TradingViewChart 
                symbol={symbol ? `NASDAQ:${symbol}` : 'NASDAQ:SPY'}
                interval="15"
                theme="dark"
                height={400}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-200">Gate Progression</span>
              <span className="text-sm font-bold text-white">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor()} transition-all duration-500`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 overflow-x-auto">
              {GATES.map((gate, i) => (
                <div 
                  key={gate.id}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all flex-shrink-0 ${
                    gateStates[i]?.completed 
                      ? 'bg-[#00ff41] text-black' 
                      : activeGate === i 
                        ? 'bg-violet-500 text-white animate-pulse' 
                        : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {gateStates[i]?.completed ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : i}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {getProgressPercentage() === 100 && (
          <Card className={`border-2 ${getSetupGrade().grade === 'A+' || getSetupGrade().grade === 'A' ? 'bg-[#001a0a] border-[#00ff41]' : 'bg-slate-900 border-slate-700'}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`text-4xl sm:text-6xl font-black ${getSetupGrade().color}`}>
                    {getSetupGrade().grade}
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-white">Setup Grade</p>
                    <p className="text-slate-200 text-sm">{getSetupGrade().description}</p>
                  </div>
                </div>
                <Button onClick={exportTradeCard} className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Trade Card
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {GATES.map((gate) => {
            const isLocked = !validateGateSequence(gate.id);
            const isCompleted = gateStates[gate.id]?.completed;
            const isActive = activeGate === gate.id && !isCompleted;
            
            const requiredFields = gate.fields.filter(f => f.required);
            const requiredCompleted = requiredFields.every(f => gateStates[gate.id]?.data?.[f.id]);

            return (
              <Card 
                key={gate.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isLocked 
                    ? 'bg-slate-900/30 border-slate-800 blur-[2px] opacity-60' 
                    : isCompleted 
                      ? 'bg-[#001a0a]/30 border-[#00ff41]/50' 
                      : isActive 
                        ? 'bg-slate-900 border-violet-500 shadow-lg shadow-violet-500/20' 
                        : 'bg-slate-900 border-slate-700'
                }`}
              >
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Lock className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${getGateTypeColor(gate.type)} ${isActive && !isCompleted ? 'animate-pulse' : ''}`}>
                        {gate.id === 1 && <Droplets className="h-5 w-5 text-white" />}
                        {gate.id === 2 && <Activity className="h-5 w-5 text-white" />}
                        {gate.id === 3 && <Zap className="h-5 w-5 text-white" />}
                        {gate.id === 4 && <Target className="h-5 w-5 text-white" />}
                        {gate.id === 5 && <BarChart3 className="h-5 w-5 text-white" />}
                        {gate.id === 6 && <TrendingUp className="h-5 w-5 text-white" />}
                        {gate.id === 7 && <Clock className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-slate-600">
                            Gate {gate.id}
                          </Badge>
                          {gate.name}
                        </CardTitle>
                      </div>
                    </div>
                    {isCompleted && <CheckCircle className="h-6 w-6 text-[#00ff41]" />}
                  </div>
                  <p className="text-sm text-slate-200 mt-2">{gate.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {gate.fields.map(field => renderGateField(gate, field))}
                  </div>

                  {!isLocked && !isCompleted && (
                    <Button
                      onClick={() => handleGateCompletion(gate.id)}
                      disabled={!requiredCompleted}
                      className={`w-full mt-4 ${
                        requiredCompleted 
                          ? gate.id === 1 
                            ? 'bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold animate-pulse' 
                            : 'bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold'
                          : 'bg-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {requiredCompleted ? (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Complete Gate {gate.id}
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Complete Required Fields
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showTradeCard && (
          <Card className="bg-gradient-to-br from-violet-950 to-slate-900 border-2 border-violet-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Trade Card Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Symbol</p>
                  <p className="text-xl font-bold text-white">{symbol || 'N/A'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Grade</p>
                  <p className={`text-xl font-bold ${getSetupGrade().color}`}>{getSetupGrade().grade}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Direction</p>
                  <p className="text-xl font-bold text-white">
                    {gateStates[1]?.data?.sweepDirection?.includes('LONG') ? 'LONG' : 'SHORT'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Sweep Level</p>
                  <p className="text-lg text-emerald-400">{gateStates[1]?.data?.sweepLevel || 'N/A'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Entry</p>
                  <p className="text-lg font-mono text-white">${gateStates[4]?.data?.entryPrice || '0'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Zone</p>
                  <p className="text-lg text-amber-400">{gateStates[5]?.data?.zoneLocation || 'N/A'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">HTF Bias</p>
                  <p className="text-lg text-white">{gateStates[6]?.data?.htfBias || 'N/A'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-200">Killzone</p>
                  <p className="text-lg text-white">{gateStates[7]?.data?.killzone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={exportTradeCard} className="bg-violet-600 hover:bg-violet-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Trade Card
                </Button>
                <Button onClick={resetAllGates} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
