import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, TrendingUp, TrendingDown, Shield, Target, AlertTriangle,
  Activity, BarChart3, RefreshCw, Search, Clock, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Eye, Lock, Radio, Settings, Layers, Flame
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import StrongTrendPanel from '@/components/StrongTrendPanel';
import { SignalFusionAnalysis } from '@/components/SignalFusionAnalysis';

interface SystemToggle {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  badge?: string;
  color: string;
}

interface UnifiedSignal {
  symbol: string;
  timestamp: number;
  systems: {
    hfTrading?: any;
    eightGate?: any;
    whaleShield?: any;
    sevenGate?: any;
  };
  overallScore: number;
  overallSignal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  alerts: string[];
  reasoning: string[];
}

const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'META', 'GOOGL', 'AMZN', 'MSFT'];

function SystemToggleCard({ system, onToggle }: { system: SystemToggle; onToggle: (id: string) => void }) {
  const Icon = system.icon;
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer
        ${system.enabled 
          ? `bg-${system.color}-900/30 border-${system.color}-500/50` 
          : 'bg-slate-800/50 border-slate-600 opacity-60'}`}
      onClick={() => onToggle(system.id)}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${system.enabled ? `bg-${system.color}-600` : 'bg-slate-600'}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{system.name}</span>
            {system.badge && (
              <Badge variant="outline" className="text-xs">{system.badge}</Badge>
            )}
          </div>
          <p className="text-xs text-slate-200">{system.description}</p>
        </div>
      </div>
      <Switch checked={system.enabled} onCheckedChange={() => onToggle(system.id)} />
    </div>
  );
}

function SignalCard({ signal, enabledSystems }: { signal: UnifiedSignal; enabledSystems: string[] }) {
  const [expanded, setExpanded] = useState(false);
  
  const getSignalColor = () => {
    switch (signal.overallSignal) {
      case 'STRONG_BUY': return 'from-green-600 to-emerald-500';
      case 'BUY': return 'from-blue-600 to-cyan-500';
      case 'HOLD': return 'from-yellow-600 to-amber-500';
      case 'SELL': return 'from-orange-600 to-red-500';
      case 'STRONG_SELL': return 'from-red-600 to-rose-500';
    }
  };

  const getDirectionIcon = () => {
    if (signal.direction === 'LONG') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (signal.direction === 'SHORT') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-slate-200" />;
  };

  return (
    <Card className="bg-slate-800/80 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg text-white font-bold text-sm bg-gradient-to-r ${getSignalColor()}`}>
              {signal.symbol}
            </div>
            <Badge variant="outline" className="text-white">
              {signal.overallSignal.replace('_', ' ')}
            </Badge>
            {getDirectionIcon()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{signal.overallScore}%</span>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-slate-200">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <Progress value={signal.overallScore} className="h-2" />
        </div>

        {signal.alerts.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {signal.alerts.map((alert, i) => (
              <Badge key={i} variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alert}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          {enabledSystems.includes('hfTrading') && signal.systems.hfTrading && (
            <Badge className="bg-blue-600">HF: {signal.systems.hfTrading.confluenceScore || 0}/10</Badge>
          )}
          {enabledSystems.includes('eightGate') && signal.systems.eightGate && (
            <Badge className="bg-purple-600">8-Gate: {signal.systems.eightGate.totalScore || 0}/{signal.systems.eightGate.maxScore || 80}</Badge>
          )}
          {enabledSystems.includes('whaleShield') && signal.systems.whaleShield && (
            <Badge className={signal.systems.whaleShield.riskLevel === 'high' ? 'bg-red-600' : 'bg-green-600'}>
              Whale: {signal.systems.whaleShield.riskLevel || 'low'}
            </Badge>
          )}
          {enabledSystems.includes('sevenGate') && signal.systems.sevenGate && (
            <Badge className="bg-amber-600">7-Gate: {signal.systems.sevenGate.confidenceScore || 0}%</Badge>
          )}
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-slate-700 pt-3">
            {enabledSystems.includes('hfTrading') && signal.systems.hfTrading && (
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> HF Trading Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Signal: {signal.systems.hfTrading.signalType || 'N/A'}</div>
                  <div>Confluence: {signal.systems.hfTrading.confluenceScore || 0}/10</div>
                  <div>Entry: ${signal.systems.hfTrading.entryPrice?.toFixed(2) || 'N/A'}</div>
                  <div>R/R: {signal.systems.hfTrading.riskRewardRatio?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>
            )}

            {enabledSystems.includes('eightGate') && signal.systems.eightGate && (
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 8-Gate Options System
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Signal: {signal.systems.eightGate.signalType || 'N/A'}</div>
                  <div>Score: {signal.systems.eightGate.totalScore || 0}/{signal.systems.eightGate.maxScore || 80}</div>
                  <div>Direction: {signal.systems.eightGate.direction || 'N/A'}</div>
                  <div>Gates Passed: {signal.systems.eightGate.gates?.filter((g: any) => g.passed).length || 0}/8</div>
                </div>
              </div>
            )}

            {enabledSystems.includes('whaleShield') && signal.systems.whaleShield && (
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Whale Shield
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Max Pain: ${signal.systems.whaleShield.maxPain?.strike?.toFixed(2) || 'N/A'}</div>
                  <div>PCR: {signal.systems.whaleShield.pcr?.value?.toFixed(2) || 'N/A'}</div>
                  <div>Sentiment: {signal.systems.whaleShield.pcr?.sentiment || 'N/A'}</div>
                  <div>Magnet Zone: {signal.systems.whaleShield.maxPain?.magnetZone ? 'Active' : 'Inactive'}</div>
                </div>
                {signal.systems.whaleShield.overallAlert && (
                  <div className="mt-2 p-2 bg-red-900/30 rounded text-red-400 text-xs">
                    {signal.systems.whaleShield.overallAlert}
                  </div>
                )}
              </div>
            )}

            {enabledSystems.includes('sevenGate') && signal.systems.sevenGate && (
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" /> 7-Gate ORB System
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Status: {signal.systems.sevenGate.overallStatus || 'N/A'}</div>
                  <div>Confidence: {signal.systems.sevenGate.confidenceScore || 0}%</div>
                  <div>Direction: {signal.systems.sevenGate.direction || 'N/A'}</div>
                  <div>Signal: {signal.systems.sevenGate.signalType || 'N/A'}</div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-200">
              <h4 className="font-semibold mb-1">Combined Analysis:</h4>
              <ul className="list-disc list-inside space-y-1">
                {signal.reasoning.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function InstitutionalScanner() {
  const [symbol, setSymbol] = useState('SPY');
  const [activeTab, setActiveTab] = useState('scanner');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [systems, setSystems] = useState<SystemToggle[]>([
    { 
      id: 'hfTrading', 
      name: 'HF Trading', 
      description: 'Scalping + Confluence Strategies', 
      icon: Zap, 
      enabled: true, 
      badge: 'Live',
      color: 'blue'
    },
    { 
      id: 'eightGate', 
      name: '8-Gate Options', 
      description: '8-Gate + OBI Pressure', 
      icon: Shield, 
      enabled: true, 
      badge: 'Hot',
      color: 'purple'
    },
    { 
      id: 'whaleShield', 
      name: 'Whale Shield', 
      description: 'Max Pain + PCR Gauge', 
      icon: Eye, 
      enabled: true, 
      badge: 'New',
      color: 'green'
    },
    { 
      id: 'sevenGate', 
      name: '7-Gate ORB', 
      description: 'Opening Range Breakout', 
      icon: Target, 
      enabled: true, 
      badge: 'New',
      color: 'amber'
    }
  ]);

  const enabledSystemIds = systems.filter(s => s.enabled).map(s => s.id);

  const toggleSystem = useCallback((id: string) => {
    setSystems(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  }, []);

  const analyzeSymbol = useMutation({
    mutationFn: async (sym: string) => {
      const results: any = { symbol: sym, timestamp: Date.now(), systems: {} };
      const promises: Promise<void>[] = [];

      if (enabledSystemIds.includes('hfTrading')) {
        promises.push(
          apiRequest(`/api/hf-confluence/analyze/${sym}`, 'GET')
            .then(r => r.json())
            .then(data => { results.systems.hfTrading = data.data; })
            .catch(() => { results.systems.hfTrading = null; })
        );
      }

      if (enabledSystemIds.includes('eightGate')) {
        promises.push(
          apiRequest(`/api/hfc-apex/analyze/${sym}`, 'GET')
            .then(r => r.json())
            .then(data => { results.systems.eightGate = data.data; })
            .catch(() => { results.systems.eightGate = null; })
        );
      }

      if (enabledSystemIds.includes('whaleShield')) {
        promises.push(
          apiRequest(`/api/whale-shield/snapshot/${sym}`, 'GET')
            .then(r => r.json())
            .then(data => { results.systems.whaleShield = data.data; })
            .catch(() => { results.systems.whaleShield = null; })
        );
      }

      if (enabledSystemIds.includes('sevenGate')) {
        promises.push(
          apiRequest(`/api/seven-gate/analyze/${sym}`, 'GET')
            .then(r => r.json())
            .then(data => { results.systems.sevenGate = data.data; })
            .catch(() => { results.systems.sevenGate = null; })
        );
      }

      await Promise.all(promises);
      return processUnifiedSignal(results);
    },
    onSuccess: (data) => {
      toast({ title: 'Analysis Complete', description: `${data.symbol} analyzed across ${enabledSystemIds.length} systems` });
    }
  });

  const runFullScan = useMutation({
    mutationFn: async () => {
      const results: UnifiedSignal[] = [];
      
      for (const sym of DEFAULT_SYMBOLS) {
        const symResults: any = { symbol: sym, timestamp: Date.now(), systems: {} };
        const promises: Promise<void>[] = [];

        if (enabledSystemIds.includes('hfTrading')) {
          promises.push(
            apiRequest(`/api/hf-confluence/analyze/${sym}`, 'GET')
              .then(r => r.json())
              .then(data => { symResults.systems.hfTrading = data.data; })
              .catch(() => { symResults.systems.hfTrading = null; })
          );
        }

        if (enabledSystemIds.includes('eightGate')) {
          promises.push(
            apiRequest(`/api/hfc-apex/analyze/${sym}`, 'GET')
              .then(r => r.json())
              .then(data => { symResults.systems.eightGate = data.data; })
              .catch(() => { symResults.systems.eightGate = null; })
          );
        }

        if (enabledSystemIds.includes('whaleShield')) {
          promises.push(
            apiRequest(`/api/whale-shield/snapshot/${sym}`, 'GET')
              .then(r => r.json())
              .then(data => { symResults.systems.whaleShield = data.data; })
              .catch(() => { symResults.systems.whaleShield = null; })
          );
        }

        if (enabledSystemIds.includes('sevenGate')) {
          promises.push(
            apiRequest(`/api/seven-gate/analyze/${sym}`, 'GET')
              .then(r => r.json())
              .then(data => { symResults.systems.sevenGate = data.data; })
              .catch(() => { symResults.systems.sevenGate = null; })
          );
        }

        await Promise.all(promises);
        results.push(processUnifiedSignal(symResults));
      }

      return results.sort((a, b) => b.overallScore - a.overallScore);
    },
    onSuccess: (data) => {
      toast({ title: 'Full Scan Complete', description: `Scanned ${data.length} symbols across ${enabledSystemIds.length} systems` });
    }
  });

  const processUnifiedSignal = (results: any): UnifiedSignal => {
    let totalScore = 0;
    let scoreCount = 0;
    const alerts: string[] = [];
    const reasoning: string[] = [];
    let bullishSignals = 0;
    let bearishSignals = 0;

    if (results.systems.hfTrading) {
      const hf = results.systems.hfTrading;
      const hfScore = (hf.confluenceScore || 0) * 10;
      totalScore += hfScore;
      scoreCount++;
      
      if (hf.signalType === 'ENTRY') {
        reasoning.push(`HF Trading: Entry signal with ${hf.confluenceScore}/10 confluence`);
        if (hf.direction === 'LONG') bullishSignals++;
        else bearishSignals++;
      }
    }

    if (results.systems.eightGate) {
      const gate8 = results.systems.eightGate;
      const gateScore = ((gate8.totalScore || 0) / (gate8.maxScore || 80)) * 100;
      totalScore += gateScore;
      scoreCount++;
      
      if (gate8.signalType === 'A+_ENTRY' || gate8.signalType === 'ENTRY') {
        reasoning.push(`8-Gate: ${gate8.signalType} signal, ${gate8.gates?.filter((g: any) => g.passed).length || 0}/8 gates passed`);
        if (gate8.direction === 'LONG') bullishSignals++;
        else if (gate8.direction === 'SHORT') bearishSignals++;
      }
    }

    if (results.systems.whaleShield) {
      const whale = results.systems.whaleShield;
      const whaleScore = whale.riskLevel === 'low' ? 80 : 
                         whale.riskLevel === 'medium' ? 50 : 
                         whale.riskLevel === 'high' ? 30 : 10;
      totalScore += whaleScore;
      scoreCount++;
      
      if (whale.pcr?.sentiment === 'bullish_overcrowding') {
        alerts.push('Bullish Overcrowding');
        reasoning.push(`Whale Shield: PCR ${whale.pcr.value?.toFixed(2)} indicates bullish overcrowding - reversal risk`);
        bearishSignals++;
      } else if (whale.pcr?.sentiment === 'bearish_overcrowding') {
        alerts.push('Bearish Overcrowding');
        reasoning.push(`Whale Shield: PCR ${whale.pcr.value?.toFixed(2)} indicates bearish overcrowding - bounce imminent`);
        bullishSignals++;
      }
      
      if (whale.maxPain?.magnetZone) {
        reasoning.push(`Whale Shield: Price in Max Pain magnet zone at $${whale.maxPain.strike}`);
      }
      
      if (whale.overallAlert) {
        alerts.push(whale.overallAlert);
      }
    }

    if (results.systems.sevenGate) {
      const gate7 = results.systems.sevenGate;
      totalScore += gate7.confidenceScore || 0;
      scoreCount++;
      
      if (gate7.signalType && gate7.signalType !== 'WAIT') {
        reasoning.push(`7-Gate ORB: ${gate7.signalType} with ${gate7.confidenceScore}% confidence`);
        if (gate7.direction === 'LONG') bullishSignals++;
        else if (gate7.direction === 'SHORT') bearishSignals++;
      }
    }

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    
    let overallSignal: UnifiedSignal['overallSignal'] = 'HOLD';
    let direction: UnifiedSignal['direction'] = 'NEUTRAL';

    if (bullishSignals > bearishSignals) {
      direction = 'LONG';
      if (avgScore >= 70 && bullishSignals >= 3) overallSignal = 'STRONG_BUY';
      else if (avgScore >= 50 && bullishSignals >= 2) overallSignal = 'BUY';
    } else if (bearishSignals > bullishSignals) {
      direction = 'SHORT';
      if (avgScore >= 70 && bearishSignals >= 3) overallSignal = 'STRONG_SELL';
      else if (avgScore >= 50 && bearishSignals >= 2) overallSignal = 'SELL';
    }

    return {
      symbol: results.symbol,
      timestamp: results.timestamp,
      systems: results.systems,
      overallScore: avgScore,
      overallSignal,
      direction,
      alerts,
      reasoning
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Layers className="h-8 w-8 text-blue-400" />
              Institutional Scanner
            </h1>
            <p className="text-slate-200 mt-1">
              Unified multi-system analysis with {enabledSystemIds.length} active systems
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => runFullScan.mutate()}
              disabled={runFullScan.isPending || enabledSystemIds.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {runFullScan.isPending ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><Radio className="h-4 w-4 mr-2" /> Full Market Scan</>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-blue-600">
              <Radio className="h-4 w-4 mr-2" /> Scanner
            </TabsTrigger>
            <TabsTrigger value="analyze" className="data-[state=active]:bg-blue-600">
              <Search className="h-4 w-4 mr-2" /> Analyze Symbol
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" /> Systems
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Active Trading Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {systems.map(system => (
                  <SystemToggleCard 
                    key={system.id} 
                    system={system} 
                    onToggle={toggleSystem} 
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" /> Analyze Single Symbol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g., SPY)"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button 
                    onClick={() => analyzeSymbol.mutate(symbol)}
                    disabled={analyzeSymbol.isPending || !symbol || enabledSystemIds.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {analyzeSymbol.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">Analyze</span>
                  </Button>
                </div>
                
                {enabledSystemIds.length === 0 && (
                  <div className="mt-4 p-4 bg-amber-900/30 border border-amber-500/50 rounded-lg text-amber-400 text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Enable at least one system in the Settings tab to run analysis
                  </div>
                )}
              </CardContent>
            </Card>

            {symbol && <SignalFusionAnalysis symbol={symbol} assetType="stock" compact />}
            {symbol && <StrongTrendPanel symbol={symbol} showReasons={true} />}
            
            {analyzeSymbol.data && (
              <div className="grid gap-4">
                <SignalCard signal={analyzeSymbol.data} enabledSystems={enabledSystemIds} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-2">
                {systems.filter(s => s.enabled).map(s => (
                  <Badge key={s.id} className={`bg-${s.color}-600`}>
                    <s.icon className="h-3 w-3 mr-1" /> {s.name}
                  </Badge>
                ))}
              </div>
            </div>

            {runFullScan.data ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <Card className="bg-green-900/30 border-green-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {runFullScan.data.filter(s => s.overallSignal === 'STRONG_BUY' || s.overallSignal === 'BUY').length}
                      </div>
                      <div className="text-sm text-slate-200">Buy Signals</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-900/30 border-red-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {runFullScan.data.filter(s => s.overallSignal === 'STRONG_SELL' || s.overallSignal === 'SELL').length}
                      </div>
                      <div className="text-sm text-slate-200">Sell Signals</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-900/30 border-amber-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-amber-400">
                        {runFullScan.data.filter(s => s.alerts.length > 0).length}
                      </div>
                      <div className="text-sm text-slate-200">Alerts</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-900/30 border-blue-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round(runFullScan.data.reduce((acc, s) => acc + s.overallScore, 0) / runFullScan.data.length)}%
                      </div>
                      <div className="text-sm text-slate-200">Avg Score</div>
                    </CardContent>
                  </Card>
                </div>

                {runFullScan.data.map(signal => (
                  <SignalCard 
                    key={signal.symbol} 
                    signal={signal} 
                    enabledSystems={enabledSystemIds} 
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Layers className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Scan</h3>
                  <p className="text-slate-200 mb-4">
                    Click "Full Market Scan" to analyze {DEFAULT_SYMBOLS.length} symbols 
                    across {enabledSystemIds.length} active systems
                  </p>
                  <Button 
                    onClick={() => runFullScan.mutate()}
                    disabled={runFullScan.isPending || enabledSystemIds.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Radio className="h-5 w-5 mr-2" /> Start Full Scan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
