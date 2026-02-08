import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, Activity, Zap, Globe, Building2, 
  TrendingUp, Shield, Clock, CheckCircle, XCircle, 
  AlertTriangle, BarChart3, Wifi
} from 'lucide-react';

interface DataSource {
  name: string;
  type: 'primary' | 'secondary' | 'alternative';
  status: 'connected' | 'degraded' | 'offline';
  latency: number;
  lastUpdate: string;
  dataQuality: number;
  description?: string;
  coverage?: string[];
  tier?: string;
}

interface MarketSummary {
  indices: Array<{ symbol: string; name: string; price: number; change: number }>;
  breadth: {
    advancers: number;
    decliners: number;
    unchanged: number;
  };
  sources: DataSource[];
  aiSummary: string;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'connected') {
    return <CheckCircle className="h-5 w-5 text-green-400" />;
  } else if (status === 'degraded') {
    return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
  }
  return <XCircle className="h-5 w-5 text-red-400" />;
}

function TierBadge({ tier }: { tier?: string }) {
  const colors: Record<string, string> = {
    institutional: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    professional: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    standard: 'bg-green-500/20 text-green-300 border-green-500/30',
    government: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    alternative: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  };
  
  return (
    <Badge className={`${colors[tier || 'standard']} border text-xs`}>
      {tier?.toUpperCase() || 'STANDARD'}
    </Badge>
  );
}

function DataSourceCard({ source }: { source: DataSource }) {
  const latencyColor = source.latency < 50 ? 'text-green-400' : source.latency < 100 ? 'text-yellow-400' : 'text-orange-400';
  const qualityColor = source.dataQuality >= 95 ? 'text-green-400' : source.dataQuality >= 85 ? 'text-blue-400' : 'text-yellow-400';
  
  return (
    <Card className="bg-slate-800/80 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${source.tier === 'institutional' ? 'bg-purple-500/20' : source.tier === 'professional' ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
              {source.tier === 'institutional' ? (
                <Building2 className="h-5 w-5 text-purple-400" />
              ) : source.tier === 'professional' ? (
                <TrendingUp className="h-5 w-5 text-blue-400" />
              ) : source.tier === 'government' ? (
                <Shield className="h-5 w-5 text-amber-400" />
              ) : (
                <Database className="h-5 w-5 text-slate-200" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{source.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon status={source.status} />
                <span className={`text-xs ${source.status === 'connected' ? 'text-green-400' : source.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {source.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <TierBadge tier={source.tier} />
        </div>
        
        {source.description && (
          <p className="text-sm text-slate-200 mb-3">{source.description}</p>
        )}
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-slate-900/50 rounded text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-slate-200" />
              <span className="text-xs text-slate-200">Latency</span>
            </div>
            <div className={`font-bold ${latencyColor}`}>{source.latency}ms</div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-3 w-3 text-slate-200" />
              <span className="text-xs text-slate-200">Quality</span>
            </div>
            <div className={`font-bold ${qualityColor}`}>{source.dataQuality}%</div>
          </div>
          <div className="p-2 bg-slate-900/50 rounded text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-3 w-3 text-slate-200" />
              <span className="text-xs text-slate-200">Type</span>
            </div>
            <div className="font-bold text-white capitalize text-sm">{source.type}</div>
          </div>
        </div>
        
        {source.coverage && source.coverage.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {source.coverage.map((item, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-slate-900/50 text-slate-300 border-slate-600">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DataSources() {
  const { data: marketSummary, isLoading } = useQuery<MarketSummary>({
    queryKey: ['/api/institutional/market-summary'],
    refetchInterval: 30000
  });

  const sources = marketSummary?.sources || [];
  const connectedCount = sources.filter(s => s.status === 'connected').length;
  const avgQuality = sources.length > 0 
    ? Math.round(sources.reduce((sum, s) => sum + s.dataQuality, 0) / sources.length)
    : 0;
  const avgLatency = sources.length > 0
    ? Math.round(sources.reduce((sum, s) => sum + s.latency, 0) / sources.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Institutional Data Sources</h1>
              <p className="text-slate-200">Bloomberg, Refinitiv & Multi-Source Data Aggregation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Wifi className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{connectedCount}/{sources.length}</div>
                  <div className="text-sm text-slate-200">Sources Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{avgQuality}%</div>
                  <div className="text-sm text-slate-200">Avg Data Quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{avgLatency}ms</div>
                  <div className="text-sm text-slate-200">Avg Latency</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {sources.filter(s => s.tier === 'institutional').length}
                  </div>
                  <div className="text-sm text-slate-200">Institutional Feeds</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Building2 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Institutional-Grade Data Integration</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    This platform aggregates data from multiple institutional and professional sources to provide 
                    Bloomberg-quality market intelligence. Real-time quotes, options flow, and market breadth data 
                    are consolidated from 9+ data providers with automatic failover and quality scoring.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Multi-Source Validation
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Automatic Failover
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                      Real-Time Updates
                    </Badge>
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Quality Scoring
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Connected Data Sources
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-slate-800/80 border-slate-700 animate-pulse">
                <CardContent className="p-4 h-48" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source, idx) => (
              <DataSourceCard key={idx} source={source} />
            ))}
          </div>
        )}

        <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">What This Means:</h3>
          <p className="text-xs text-slate-200 mb-3">
            Institutional-grade data ensures you're trading with the same quality information used by hedge funds and 
            professional traders. Multi-source aggregation provides redundancy and validation - if one source fails, 
            others automatically take over.
          </p>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">What To Do:</h3>
          <ul className="text-xs text-slate-200 space-y-1">
            <li>• <strong className="text-green-400">Green status</strong> means data is flowing normally - trade with confidence</li>
            <li>• <strong className="text-yellow-400">Yellow/degraded</strong> means reduced reliability - verify signals with multiple sources</li>
            <li>• <strong className="text-red-400">Red/offline</strong> means source is unavailable - automatic failover is active</li>
            <li>• Higher data quality percentages indicate more reliable, validated information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
