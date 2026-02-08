import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Activity, Newspaper, BarChart3, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface AgentResult {
  agentName: string;
  confidence: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  insights: string[];
  rawScore: number;
  weight: number;
}

interface SignalFusionData {
  symbol: string;
  assetType: string;
  timestamp: number;
  masterSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  overallConfidence: number;
  compositeScore: number;
  agents: AgentResult[];
  unifiedInsight: string;
  actionableRecommendation: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  keyDrivers: string[];
  smartDataProfile: {
    trendStrength: number;
    momentumScore: number;
    sentimentScore: number;
    volumeProfile: string;
    supportResistance: { support: number; resistance: number };
  };
}

interface SignalFusionAnalysisProps {
  symbol: string;
  assetType?: 'stock' | 'crypto' | 'forex' | 'commodity';
  compact?: boolean;
}

const getSignalColor = (signal: string) => {
  switch (signal) {
    case 'STRONG_BUY': return 'bg-emerald-500 text-white';
    case 'BUY': return 'bg-green-500 text-white';
    case 'NEUTRAL': return 'bg-yellow-500 text-black';
    case 'SELL': return 'bg-orange-500 text-white';
    case 'STRONG_SELL': return 'bg-red-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'LOW': return 'text-emerald-400';
    case 'MEDIUM': return 'text-yellow-400';
    case 'HIGH': return 'text-orange-400';
    case 'EXTREME': return 'text-red-400';
    default: return 'text-slate-400';
  }
};

const getAgentIcon = (name: string) => {
  if (name.includes('Technical')) return <BarChart3 className="w-4 h-4" />;
  if (name.includes('Sentiment')) return <Activity className="w-4 h-4" />;
  if (name.includes('On-Chain')) return <Zap className="w-4 h-4" />;
  if (name.includes('News')) return <Newspaper className="w-4 h-4" />;
  return <Brain className="w-4 h-4" />;
};

export function SignalFusionAnalysis({ symbol, assetType = 'stock', compact = false }: SignalFusionAnalysisProps) {
  const [expanded, setExpanded] = useState(!compact);

  const { data, isLoading, error, refetch, isFetching } = useQuery<SignalFusionData>({
    queryKey: ['/api/signal-fusion/analyze', symbol, assetType],
    queryFn: async () => {
      const res = await fetch(`/api/signal-fusion/analyze/${symbol}?assetType=${assetType}`);
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    enabled: !!symbol,
    staleTime: 60000,
    refetchInterval: 120000,
  });

  if (!symbol) return null;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            <div>
              <p className="text-purple-300 font-medium">Signal Fusion AI</p>
              <p className="text-sm text-slate-400">Fusing intelligence for {symbol}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-slate-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Signal Fusion analysis unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact && !expanded) {
    return (
      <Card 
        className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-all"
        onClick={() => setExpanded(true)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium text-sm">Signal Fusion AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getSignalColor(data.masterSignal)} text-xs`}>
                {data.masterSignal.replace('_', ' ')}
              </Badge>
              <span className="text-sm text-slate-300">{data.compositeScore.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 via-slate-900/50 to-blue-900/20 border-purple-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Signal Fusion AI
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-7 px-2"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            {compact && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setExpanded(false)}
                className="h-7 px-2 text-xs"
              >
                Collapse
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">Master Signal</div>
            <Badge className={`${getSignalColor(data.masterSignal)} text-sm px-3`}>
              {data.masterSignal.replace('_', ' ')}
            </Badge>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">Composite Score</div>
            <div className="text-xl font-bold text-white">{data.compositeScore.toFixed(0)}%</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">Confidence</div>
            <div className="text-xl font-bold text-cyan-400">{data.overallConfidence.toFixed(0)}%</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">Risk Level</div>
            <div className={`text-lg font-bold ${getRiskColor(data.riskLevel)}`}>{data.riskLevel}</div>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Unified AI Insight
          </h4>
          <p className="text-slate-200 text-sm leading-relaxed">{data.unifiedInsight}</p>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Actionable Recommendation
          </h4>
          <p className="text-slate-200 text-sm">{data.actionableRecommendation}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Agent Swarm Analysis</h4>
          {data.agents.map((agent, idx) => (
            <div key={idx} className="bg-slate-800/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getAgentIcon(agent.agentName)}
                  <span className="text-sm font-medium text-slate-200">{agent.agentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      agent.signal === 'bullish' ? 'border-green-500 text-green-400' :
                      agent.signal === 'bearish' ? 'border-red-500 text-red-400' :
                      'border-yellow-500 text-yellow-400'
                    }`}
                  >
                    {agent.signal === 'bullish' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                     agent.signal === 'bearish' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                    {agent.signal.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400">{(agent.weight * 100).toFixed(0)}% weight</span>
                </div>
              </div>
              <Progress value={agent.rawScore} className="h-1.5 mb-2" />
              <div className="space-y-1">
                {agent.insights.slice(0, 2).map((insight, i) => (
                  <p key={i} className="text-xs text-slate-400">• {insight}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Smart Data Profile</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-400">Trend Strength</div>
              <div className="text-lg font-semibold text-purple-400">{data.smartDataProfile.trendStrength.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Momentum</div>
              <div className="text-lg font-semibold text-cyan-400">{data.smartDataProfile.momentumScore.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Sentiment</div>
              <div className="text-lg font-semibold text-blue-400">{data.smartDataProfile.sentimentScore.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Volume</div>
              <div className="text-sm font-medium text-slate-200">{data.smartDataProfile.volumeProfile}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Support</div>
              <div className="text-sm font-medium text-green-400">${data.smartDataProfile.supportResistance.support.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Resistance</div>
              <div className="text-sm font-medium text-red-400">${data.smartDataProfile.supportResistance.resistance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {data.keyDrivers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Key Drivers</h4>
            <div className="flex flex-wrap gap-2">
              {data.keyDrivers.slice(0, 4).map((driver, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                  {driver.length > 50 ? driver.substring(0, 47) + '...' : driver}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SignalFusionAnalysis;
