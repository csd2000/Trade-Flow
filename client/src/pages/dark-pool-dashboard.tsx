import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, Search, TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
  Eye, BarChart3, Brain, Shield, Target, Zap, Building2, Volume2, VolumeX, Bell, ShoppingCart, Link2
} from 'lucide-react';
import { Link } from 'wouter';
import { WalkthroughGuide, MODULE_GUIDES } from '@/components/WalkthroughGuide';

const playDarkPoolSound = (type: 'accumulation' | 'distribution' | 'alert' = 'alert') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'accumulation') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'distribution') {
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.error('Audio error:', error);
  }
};

const sendBrowserNotification = (title: string, body: string, type: 'accumulation' | 'distribution' | 'neutral') => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const icon = type === 'accumulation' ? '📈' : type === 'distribution' ? '📉' : '🏦';
  new Notification(`${icon} ${title}`, {
    body,
    icon: '/favicon.ico',
    tag: `darkpool-${Date.now()}`,
    requireInteraction: false
  });
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

interface DarkPoolTrade {
  symbol: string;
  price: number;
  size: number;
  value: number;
  timestamp: string;
  exchange: string;
  isBlockTrade: boolean;
  percentOfAvgVolume: number;
}

interface DarkPoolSummary {
  symbol: string;
  totalDarkPoolVolume: number;
  totalDarkPoolValue: number;
  darkPoolPercent: number;
  averageTradeSize: number;
  largestTrade: DarkPoolTrade | null;
  blockTradeCount: number;
  totalTradeCount: number;
  priceImpact: number;
  lastUpdate: string;
}

interface InstitutionalSignal {
  symbol: string;
  signalType: 'accumulation' | 'distribution' | 'neutral';
  confidence: number;
  reasoning: string;
  darkPoolActivity: 'high' | 'medium' | 'low';
  volumeAnomaly: boolean;
  priceAction: string;
  institutionalBias: 'bullish' | 'bearish' | 'neutral';
  suggestedAction: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface DarkPoolScan {
  timestamp: string;
  totalSymbolsScanned: number;
  activeSignals: InstitutionalSignal[];
  topAccumulators: DarkPoolSummary[];
  topDistributors: DarkPoolSummary[];
  unusualActivity: DarkPoolSummary[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function SignalCard({ signal }: { signal: InstitutionalSignal }) {
  const isBullish = signal.institutionalBias === 'bullish';
  const isBearish = signal.institutionalBias === 'bearish';
  
  return (
    <Card className={`bg-slate-900 border-slate-700 ${
      isBullish ? 'border-l-4 border-l-green-500' : 
      isBearish ? 'border-l-4 border-l-red-500' : 
      'border-l-4 border-l-slate-500'
    }`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold text-white">{signal.symbol}</span>
            <Badge variant={isBullish ? 'default' : isBearish ? 'destructive' : 'secondary'} className="text-xs">
              {signal.signalType.toUpperCase()}
            </Badge>
            {signal.volumeAnomaly && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                UNUSUAL
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs sm:text-sm font-medium ${
              signal.confidence >= 75 ? 'text-green-400' : 
              signal.confidence >= 60 ? 'text-yellow-400' : 'text-slate-200'
            }`}>
              {signal.confidence}% confidence
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs sm:text-sm">
          <div className="bg-slate-800 rounded p-2">
            <p className="text-slate-200">Activity</p>
            <p className={`font-medium ${
              signal.darkPoolActivity === 'high' ? 'text-red-400' : 
              signal.darkPoolActivity === 'medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {signal.darkPoolActivity.toUpperCase()}
            </p>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <p className="text-slate-200">Price Action</p>
            <p className="text-white font-medium capitalize">{signal.priceAction}</p>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <p className="text-slate-200">Inst. Bias</p>
            <p className={`font-medium ${
              isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-slate-200'
            }`}>
              {signal.institutionalBias.toUpperCase()}
            </p>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <p className="text-slate-200">Risk</p>
            <p className={`font-medium ${
              signal.riskLevel === 'low' ? 'text-green-400' : 
              signal.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {signal.riskLevel.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded p-2 sm:p-3 mb-2">
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-purple-400" />
            {signal.reasoning}
          </p>
        </div>

        <div className="bg-blue-900/30 border border-blue-800/50 rounded p-2 mb-3">
          <p className="text-blue-300 text-xs sm:text-sm">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
            <strong>Action:</strong> {signal.suggestedAction}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/trading-connections?execute=${signal.symbol}&side=${isBullish ? 'buy' : 'sell'}`} className="flex-1">
            <Button 
              size="sm" 
              className={`w-full ${isBullish ? 'bg-green-600 hover:bg-green-700' : isBearish ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-700'}`}
            >
              <ShoppingCart className="w-4 h-4 mr-1" /> 
              {isBullish ? 'Buy' : isBearish ? 'Sell' : 'Trade'} {signal.symbol}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ summary, rank }: { summary: DarkPoolSummary; rank: number }) {
  const isPositive = summary.priceImpact > 0;
  
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs sm:text-sm font-bold text-slate-300">#{rank}</span>
          <span className="text-base sm:text-lg font-bold text-white">{summary.symbol}</span>
          <Badge variant={isPositive ? 'default' : 'destructive'} className="text-xs ml-auto">
            {isPositive ? '+' : ''}{summary.priceImpact.toFixed(2)}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <p className="text-slate-200">Dark Pool %</p>
            <p className={`font-medium ${
              summary.darkPoolPercent > 50 ? 'text-red-400' : 
              summary.darkPoolPercent > 35 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {summary.darkPoolPercent.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-slate-200">Block Trades</p>
            <p className="text-white font-medium">{summary.blockTradeCount}</p>
          </div>
          <div>
            <p className="text-slate-200">Volume</p>
            <p className="text-white font-medium">{formatNumber(summary.totalDarkPoolVolume)}</p>
          </div>
          <div>
            <p className="text-slate-200">Value</p>
            <p className="text-white font-medium">{formatCurrency(summary.totalDarkPoolValue)}</p>
          </div>
        </div>

        {summary.largestTrade && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-slate-200 text-xs">Largest Trade</p>
            <p className="text-white text-xs sm:text-sm font-medium">
              {formatNumber(summary.largestTrade.size)} shares @ ${summary.largestTrade.price.toFixed(2)}
              <span className="text-slate-200 ml-1">({formatCurrency(summary.largestTrade.value)})</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DarkPoolDashboard() {
  const [activeTab, setActiveTab] = useState('scan');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastAlertRef = useRef<string>('');
  const prevSignalsRef = useRef<InstitutionalSignal[]>([]);

  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

  const scanQuery = useQuery<DarkPoolScan>({
    queryKey: ['/api/dark-pool/scan'],
    enabled: false
  });

  useEffect(() => {
    if (!scanQuery.data?.activeSignals) return;
    
    const signals = scanQuery.data.activeSignals;
    const highConfidenceSignals = signals.filter(s => s.confidence >= 75);
    
    if (highConfidenceSignals.length > 0) {
      const alertId = highConfidenceSignals.map(s => `${s.symbol}-${s.signalType}`).join(',');
      
      if (alertId !== lastAlertRef.current) {
        const newSignals = highConfidenceSignals.filter(
          s => !prevSignalsRef.current.some(p => p.symbol === s.symbol && p.signalType === s.signalType)
        );
        
        if (newSignals.length > 0) {
          if (audioEnabled) {
            playDarkPoolSound(newSignals[0].signalType as 'accumulation' | 'distribution');
          }
          
          if (notificationsEnabled) {
            newSignals.forEach((signal, index) => {
              setTimeout(() => {
                const title = `Dark Pool ${signal.signalType.toUpperCase()} Signal`;
                const body = `${signal.symbol}: ${signal.confidence}% confidence - ${signal.reasoning.substring(0, 100)}...`;
                sendBrowserNotification(title, body, signal.signalType as 'accumulation' | 'distribution' | 'neutral');
              }, index * 500);
            });
          }
        }
        
        lastAlertRef.current = alertId;
        prevSignalsRef.current = highConfidenceSignals;
      }
    }
  }, [scanQuery.data, audioEnabled, notificationsEnabled]);

  const testSound = () => {
    playDarkPoolSound('accumulation');
    setTimeout(() => playDarkPoolSound('distribution'), 500);
  };

  const analyzeQuery = useQuery<InstitutionalSignal>({
    queryKey: ['/api/dark-pool/analyze', searchSymbol],
    enabled: false
  });

  const summaryQuery = useQuery<DarkPoolSummary>({
    queryKey: ['/api/dark-pool/summary', searchSymbol],
    enabled: false
  });

  const handleScan = async () => {
    setIsScanning(true);
    await scanQuery.refetch();
    setIsScanning(false);
  };

  const handleAnalyze = async () => {
    if (!searchSymbol.trim()) return;
    await Promise.all([analyzeQuery.refetch(), summaryQuery.refetch()]);
  };

  const scanData = scanQuery.data;
  const activeSignals = scanData?.activeSignals || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                Dark Pool AI
              </h1>
              <WalkthroughGuide steps={MODULE_GUIDES['dark-pool']} title="Guide" accentColor="violet" />
              <Link href="/trading-connections">
                <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-900/30">
                  <Link2 className="w-4 h-4 mr-1" /> Trading
                </Button>
              </Link>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Institutional Trade Detection & Analysis
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <button onClick={testSound} className="p-1 hover:bg-slate-700 rounded" title="Test sound">
                {audioEnabled ? <Volume2 className="h-4 w-4 text-green-400" /> : <VolumeX className="h-4 w-4 text-slate-300" />}
              </button>
              <Switch
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
                className="scale-75 sm:scale-100"
              />
              <Label className="text-xs text-slate-200 hidden sm:block">Sound</Label>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <Bell className={`h-4 w-4 ${notificationsEnabled ? 'text-blue-400' : 'text-slate-300'}`} />
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="scale-75 sm:scale-100"
              />
              <Label className="text-xs text-slate-200 hidden sm:block">Alerts</Label>
            </div>
            
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
              data-testid="btn-scan-dark-pool"
            >
              {isScanning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {isScanning ? 'Scanning...' : 'Scan Market'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-slate-200 text-xs sm:text-sm">Active Signals</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-400">{activeSignals.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-slate-200 text-xs sm:text-sm">Accumulation</p>
              <p className="text-lg sm:text-2xl font-bold text-green-400">
                {activeSignals.filter(s => s.signalType === 'accumulation').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-slate-200 text-xs sm:text-sm">Distribution</p>
              <p className="text-lg sm:text-2xl font-bold text-red-400">
                {activeSignals.filter(s => s.signalType === 'distribution').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-slate-200 text-xs sm:text-sm">Market Sentiment</p>
              <p className={`text-lg sm:text-2xl font-bold ${
                scanData?.marketSentiment === 'bullish' ? 'text-green-400' :
                scanData?.marketSentiment === 'bearish' ? 'text-red-400' : 'text-slate-200'
              }`}>
                {scanData?.marketSentiment?.toUpperCase() || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 mb-4 w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="scan" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-scan">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Market </span>Scan
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-analyze">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4" data-testid="tab-signals">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Signals ({activeSignals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            {isScanning ? (
              <div className="text-center py-8 sm:py-12">
                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-200 text-sm sm:text-base">Scanning dark pool activity across top stocks...</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-2">AI analyzing institutional trading patterns</p>
              </div>
            ) : scanQuery.error ? (
              <div className="text-center py-8 sm:py-12">
                <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 text-sm sm:text-base font-medium">Dark Pool Data Unavailable</p>
                <p className="text-slate-200 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                  {(scanQuery.error as any)?.message?.includes('POLYGON_API_KEY') 
                    ? 'Polygon.io API key required for real dark pool data. This feature requires a paid Polygon.io subscription.'
                    : 'Failed to fetch dark pool data. Please try again later.'}
                </p>
              </div>
            ) : scanData ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Top Accumulators
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {scanData.topAccumulators.length > 0 ? (
                        scanData.topAccumulators.map((s, i) => (
                          <SummaryCard key={s.symbol} summary={s} rank={i + 1} />
                        ))
                      ) : (
                        <p className="text-slate-300 text-sm py-4 text-center">No accumulation detected</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        Top Distributors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {scanData.topDistributors.length > 0 ? (
                        scanData.topDistributors.map((s, i) => (
                          <SummaryCard key={s.symbol} summary={s} rank={i + 1} />
                        ))
                      ) : (
                        <p className="text-slate-300 text-sm py-4 text-center">No distribution detected</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        Unusual Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {scanData.unusualActivity.length > 0 ? (
                        scanData.unusualActivity.map((s, i) => (
                          <SummaryCard key={s.symbol} summary={s} rank={i + 1} />
                        ))
                      ) : (
                        <p className="text-slate-300 text-sm py-4 text-center">No unusual activity</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-200 text-sm sm:text-base">Click "Scan Market" to detect institutional dark pool activity</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-2">
                  AI will analyze block trades, volume patterns, and institutional flow
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analyze">
            <Card className="bg-slate-900 border-slate-700 mb-4">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Input
                    placeholder="Enter symbol (AAPL, MSFT, NVDA)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                    className="bg-slate-800 border-slate-600 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    data-testid="input-symbol-analyze"
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzeQuery.isLoading || summaryQuery.isLoading}
                    data-testid="btn-analyze-symbol"
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                  >
                    {analyzeQuery.isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 mt-2">
                  Enter any US stock symbol to analyze dark pool activity and detect institutional trades
                </p>
              </CardContent>
            </Card>

            {analyzeQuery.error && (
              <div className="text-center py-8 sm:py-12">
                <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 text-sm sm:text-base font-medium">Analysis Unavailable</p>
                <p className="text-slate-200 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                  {(analyzeQuery.error as any)?.message?.includes('POLYGON_API_KEY') 
                    ? 'Polygon.io API key required for real dark pool analysis.'
                    : 'Failed to analyze symbol. Please verify the symbol and try again.'}
                </p>
              </div>
            )}

            {analyzeQuery.data && !analyzeQuery.error && (
              <div className="space-y-4">
                <SignalCard signal={analyzeQuery.data} />
                
                {summaryQuery.data && (
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                        Dark Pool Summary - {summaryQuery.data.symbol}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Total Volume</p>
                          <p className="text-white text-base sm:text-lg font-bold">
                            {formatNumber(summaryQuery.data.totalDarkPoolVolume)}
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Total Value</p>
                          <p className="text-white text-base sm:text-lg font-bold">
                            {formatCurrency(summaryQuery.data.totalDarkPoolValue)}
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Dark Pool %</p>
                          <p className={`text-base sm:text-lg font-bold ${
                            summaryQuery.data.darkPoolPercent > 50 ? 'text-red-400' : 
                            summaryQuery.data.darkPoolPercent > 35 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {summaryQuery.data.darkPoolPercent.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Avg Trade Size</p>
                          <p className="text-white text-base sm:text-lg font-bold">
                            {formatNumber(summaryQuery.data.averageTradeSize)}
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Block Trades</p>
                          <p className="text-purple-400 text-base sm:text-lg font-bold">
                            {summaryQuery.data.blockTradeCount}
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Total Trades</p>
                          <p className="text-white text-base sm:text-lg font-bold">
                            {summaryQuery.data.totalTradeCount}
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Price Impact</p>
                          <p className={`text-base sm:text-lg font-bold ${
                            summaryQuery.data.priceImpact > 0 ? 'text-green-400' : 
                            summaryQuery.data.priceImpact < 0 ? 'text-red-400' : 'text-slate-200'
                          }`}>
                            {summaryQuery.data.priceImpact > 0 ? '+' : ''}
                            {summaryQuery.data.priceImpact.toFixed(2)}%
                          </p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-slate-200 text-xs sm:text-sm">Largest Trade</p>
                          <p className="text-white text-base sm:text-lg font-bold">
                            {summaryQuery.data.largestTrade 
                              ? formatCurrency(summaryQuery.data.largestTrade.value)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="signals">
            {activeSignals.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-200 text-sm sm:text-base">No active institutional signals detected</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-2">Run a market scan to detect dark pool activity</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {activeSignals
                  .sort((a, b) => b.confidence - a.confidence)
                  .map(signal => (
                    <SignalCard key={signal.symbol} signal={signal} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-400" />
            What is Dark Pool Trading?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-200">
            <div>
              <p className="text-slate-300 font-medium mb-1">Hidden Liquidity</p>
              <p>Dark pools are private exchanges where large institutions trade without public visibility until after execution</p>
            </div>
            <div>
              <p className="text-slate-300 font-medium mb-1">Block Trades</p>
              <p>Trades of 10,000+ shares or $200K+ value indicate significant institutional positioning</p>
            </div>
            <div>
              <p className="text-slate-300 font-medium mb-1">AI Detection</p>
              <p>Our AI analyzes patterns to detect accumulation (buying) or distribution (selling) by smart money</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
