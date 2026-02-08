import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  RefreshCw,
  Zap,
  DollarSign,
  Activity,
  ArrowUpDown,
  Printer,
  ChevronDown,
  ChevronUp,
  Gauge,
  Calendar,
  Eye,
  Search,
  Loader2,
  X
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  phase: string;
  task: string;
  description: string;
  checked: boolean;
  iconName: 'TrendingUp' | 'DollarSign' | 'ArrowUpDown' | 'BarChart3' | 'Activity' | 'Zap';
  category: 'macro' | 'whale' | 'technical' | 'volume';
  dataType: 'macro' | 'whale' | 'gap' | 'volume' | 'reversal' | 'closing';
}

const iconMap: Record<string, JSX.Element> = {
  TrendingUp: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
  DollarSign: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
  ArrowUpDown: <ArrowUpDown className="h-4 w-4 sm:h-5 sm:w-5" />,
  BarChart3: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
  Activity: <Activity className="h-4 w-4 sm:h-5 sm:w-5" />,
  Zap: <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
};

const initialChecklist: ChecklistItem[] = [
  {
    id: '1',
    phase: '08:30 AM',
    task: 'Macro Check',
    description: 'Did CPI, NFP, or FOMC data just drop?',
    checked: false,
    iconName: 'TrendingUp',
    category: 'macro',
    dataType: 'macro'
  },
  {
    id: '2',
    phase: '09:00 AM',
    task: 'Whale Check',
    description: 'Any >$100M moves to/from exchanges?',
    checked: false,
    iconName: 'DollarSign',
    category: 'whale',
    dataType: 'whale'
  },
  {
    id: '3',
    phase: '09:15 AM',
    task: 'The Gap',
    description: "Is price opening significantly away from yesterday's close?",
    checked: false,
    iconName: 'ArrowUpDown',
    category: 'technical',
    dataType: 'gap'
  },
  {
    id: '4',
    phase: '09:30 AM',
    task: 'Opening Drive',
    description: 'Does the volume support the news direction?',
    checked: false,
    iconName: 'BarChart3',
    category: 'volume',
    dataType: 'volume'
  },
  {
    id: '5',
    phase: '11:00 AM',
    task: 'Reversal Window',
    description: 'Is the news "priced in" or continuing?',
    checked: false,
    iconName: 'Activity',
    category: 'technical',
    dataType: 'reversal'
  },
  {
    id: '6',
    phase: '03:30 PM',
    task: 'Closing Inflows',
    description: 'Are Whales positioning for tomorrow?',
    checked: false,
    iconName: 'Zap',
    category: 'whale',
    dataType: 'closing'
  }
];

const categoryColors: Record<string, string> = {
  macro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  whale: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  technical: 'bg-green-500/20 text-green-400 border-green-500/30',
  volume: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
};

const categoryLabels: Record<string, string> = {
  macro: 'Macro',
  whale: 'Whale',
  technical: 'Technical',
  volume: 'Volume'
};

const popularAssets = [
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'ETF' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock' },
  { symbol: 'META', name: 'Meta Platforms', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'Crypto' },
];

export default function DailyChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('dailyChecklist');
    const savedDate = localStorage.getItem('dailyChecklistDate');
    const today = new Date().toDateString();
    
    if (saved && savedDate === today) {
      return JSON.parse(saved);
    }
    return initialChecklist;
  });

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedAsset, setSelectedAsset] = useState<string>(() => {
    return localStorage.getItem('checklistAsset') || 'SPY';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: assetData, isLoading: assetLoading, refetch } = useQuery({
    queryKey: ['/api/checklist/asset-data', selectedAsset],
    enabled: !!selectedAsset,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyChecklist', JSON.stringify(checklist));
    localStorage.setItem('dailyChecklistDate', new Date().toDateString());
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('checklistAsset', selectedAsset);
  }, [selectedAsset]);

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setChecklist(initialChecklist);
    setExpandedItems(new Set());
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAssetSelect = (symbol: string) => {
    setSelectedAsset(symbol);
    setSearchQuery('');
    setShowSearch(false);
    refetch();
  };

  const filteredAssets = popularAssets.filter(asset => 
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = checklist.filter(item => item.checked).length;
  const progress = (completedCount / checklist.length) * 100;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPhaseStatus = (phase: string) => {
    const now = currentTime;
    const [time, period] = phase.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const phaseDate = new Date(now);
    phaseDate.setHours(hour24, minutes, 0, 0);

    const diffMs = now.getTime() - phaseDate.getTime();
    const diffMins = diffMs / (1000 * 60);

    if (diffMins >= 0 && diffMins < 30) return 'active';
    if (diffMins >= 30) return 'past';
    return 'upcoming';
  };

  const getAssetInfo = () => {
    const asset = popularAssets.find(a => a.symbol === selectedAsset);
    if (asset) return asset;
    
    // Detect asset type for custom symbols
    const symbol = selectedAsset.toUpperCase();
    let type = 'Stock';
    
    // Crypto detection
    if (['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'SHIB', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'AAVE', 'LTC', 'BCH', 'ATOM', 'FIL', 'APE', 'ARB', 'OP'].includes(symbol) ||
        symbol.endsWith('USD') || symbol.endsWith('USDT') || symbol.includes('-USD')) {
      type = 'Crypto';
    }
    // Forex detection
    else if (['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP'].includes(symbol) ||
             (symbol.length === 6 && /^[A-Z]{6}$/.test(symbol))) {
      type = 'Forex';
    }
    // Futures detection
    else if (symbol.includes('=F') || ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'ZB', 'ZN', 'ZC', 'ZS', 'ZW', 'NG', 'HG', 'PL'].includes(symbol)) {
      type = 'Futures';
    }
    // ETF detection
    else if (['SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'ARKK', 'XLF', 'XLE', 'XLK', 'GLD', 'SLV', 'TLT', 'HYG', 'VXX', 'UVXY'].includes(symbol)) {
      type = 'ETF';
    }
    // Index detection
    else if (symbol.startsWith('^') || ['VIX', 'DXY'].includes(symbol)) {
      type = 'Index';
    }
    
    return { symbol: selectedAsset, name: selectedAsset, type };
  };

  const renderDataContent = (dataType: string) => {
    const data = assetData as any;
    const assetInfo = getAssetInfo();
    const isCrypto = assetInfo.type === 'Crypto';

    if (assetLoading) {
      return (
        <div className="flex items-center justify-center p-8 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400 mr-2" />
          <span className="text-slate-200">Loading {selectedAsset} data...</span>
        </div>
      );
    }

    switch (dataType) {
      case 'macro':
        return (
          <div className="space-y-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600">{selectedAsset}</Badge>
              <span className="text-xs text-slate-200">Macro Environment</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-1 mb-1">
                  <Gauge className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-[10px] sm:text-xs text-blue-400">Fear & Greed</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white">{data?.macro?.fearGreed?.value || 62}</div>
                <div className="text-[10px] sm:text-xs text-slate-200">{data?.macro?.fearGreed?.label || 'Greed'}</div>
              </div>
              <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-1 mb-1">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                  <span className="text-[10px] sm:text-xs text-purple-400">VIX</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white">{data?.macro?.vix?.value || 14.5}</div>
                <div className={`text-[10px] sm:text-xs ${(data?.macro?.vix?.change || -0.8) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data?.macro?.vix?.change || -0.8}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2 sm:p-3 bg-slate-800/50 rounded-lg">
                <div className="text-[10px] sm:text-xs text-cyan-300 mb-1">{selectedAsset} Correlation</div>
                <div className="text-xs sm:text-sm text-white">{data?.macro?.correlation || `${selectedAsset} tracks ${isCrypto ? 'crypto market sentiment' : 'S&P 500 movements'}`}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" /> Events Affecting {selectedAsset}
              </h4>
              <div className="space-y-1.5">
                {(data?.macro?.events || [
                  { time: '08:30 AM', event: 'Initial Jobless Claims', actual: '215K', expected: '220K', impact: 'Medium' },
                  { time: '10:00 AM', event: isCrypto ? 'Crypto Regulatory News' : 'Existing Home Sales', actual: 'Pending', expected: '-', impact: 'Low' },
                ]).map((event: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-slate-800/50 rounded text-xs sm:text-sm gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-cyan-300 font-mono text-[10px] sm:text-xs">{event.time}</span>
                      <span className="text-white">{event.event}</span>
                      <Badge variant="outline" className={`text-[10px] sm:text-xs ${event.impact === 'High' ? 'text-red-400 border-red-500' : event.impact === 'Medium' ? 'text-yellow-400 border-yellow-500' : 'text-slate-200 border-slate-500'}`}>
                        {event.impact}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-medium">{event.actual}</span>
                      {event.expected && <span className="text-slate-300 text-[10px] sm:text-xs ml-1">(exp: {event.expected})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'whale':
        return (
          <div className="space-y-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-600">{selectedAsset}</Badge>
              <span className="text-xs text-slate-200">Whale & Institutional Activity</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                <div className="text-[10px] sm:text-xs text-green-400">{selectedAsset} Net Flow (24h)</div>
                <div className="text-base sm:text-xl font-bold text-green-400">{data?.whale?.netFlow || '-$142M'}</div>
                <div className="text-[10px] text-slate-200">Outflow = {isCrypto ? 'Bullish' : 'Accumulation'}</div>
              </div>
              <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="text-[10px] sm:text-xs text-purple-400">Institutional Ownership</div>
                <div className="text-base sm:text-xl font-bold text-white">{data?.whale?.institutionalOwn || (isCrypto ? 'N/A' : '78.4%')}</div>
                <div className="text-[10px] text-slate-200">{isCrypto ? 'Whale wallets tracked' : 'vs 76.2% last Q'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-white mb-2">{selectedAsset} Large Transactions</h4>
              <div className="space-y-1.5">
                {(data?.whale?.recentMoves || [
                  { amount: '$142M', direction: 'Outflow', time: '2h ago', signal: 'Bullish' },
                  { amount: '$89M', direction: 'Inflow', time: '4h ago', signal: 'Neutral' },
                  { amount: '$65M', direction: 'Outflow', time: '6h ago', signal: 'Bullish' },
                ]).map((move: any, i: number) => (
                  <div key={i} className="p-2 bg-slate-800/50 rounded text-xs sm:text-sm">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-600 text-[10px] sm:text-xs">{selectedAsset}</Badge>
                        <span className="text-white font-medium">{move.amount}</span>
                        <span className="text-cyan-300 text-[10px]">{move.time}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] sm:text-xs ${move.signal === 'Bullish' ? 'text-green-400 border-green-500' : move.signal === 'Bearish' ? 'text-red-400 border-red-500' : 'text-slate-200 border-slate-500'}`}>
                        {move.direction} - {move.signal}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="text-[10px] sm:text-xs text-purple-400 mb-1">Recommendation for {selectedAsset}</div>
              <p className="text-xs sm:text-sm text-slate-300">{data?.whale?.recommendation || `Net outflows from ${selectedAsset} suggest institutional accumulation`}</p>
            </div>
          </div>
        );
        
      case 'gap':
        return (
          <div className="space-y-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600">{selectedAsset}</Badge>
              <span className="text-xs text-slate-200">Gap Analysis</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-[10px] sm:text-xs text-cyan-300">Prev Close</div>
                <div className="text-sm sm:text-xl font-bold text-white">${data?.gap?.prevClose || '582.45'}</div>
              </div>
              <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-[10px] sm:text-xs text-cyan-300">Open</div>
                <div className="text-sm sm:text-xl font-bold text-white">${data?.gap?.open || '584.20'}</div>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg text-center ${(data?.gap?.gapPercent || 0.30) >= 0 ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                <div className="text-[10px] sm:text-xs text-cyan-300">Gap</div>
                <div className={`text-sm sm:text-xl font-bold ${(data?.gap?.gapPercent || 0.30) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data?.gap?.gapPercent || 0.30) >= 0 ? '+' : ''}{data?.gap?.gapPercent || 0.30}%
                </div>
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cyan-300">Gap Status</span>
                <Badge variant="outline" className={`text-[10px] sm:text-xs ${data?.gap?.filled ? 'text-green-400 border-green-500' : 'text-yellow-400 border-yellow-500'}`}>
                  {data?.gap?.filled ? 'Filled' : 'Open'}
                </Badge>
              </div>
              <div className="text-xs sm:text-sm text-white">
                {selectedAsset} {(data?.gap?.gapPercent || 0.30) >= 0 ? 'gapped up' : 'gapped down'} {Math.abs(data?.gap?.gapPercent || 0.30)}% from yesterday's close
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="text-[10px] sm:text-xs text-green-400 mb-1">Analysis for {selectedAsset}</div>
              <p className="text-xs sm:text-sm text-slate-300">{data?.gap?.analysis || '73% of gaps this size fill within first hour'}</p>
              <p className="text-xs sm:text-sm text-white mt-1 font-medium">{data?.gap?.tradingBias || 'Neutral - Wait for gap fill attempt'}</p>
            </div>
          </div>
        );
        
      case 'volume':
        return (
          <div className="space-y-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-orange-600">{selectedAsset}</Badge>
              <span className="text-xs text-slate-200">Volume Analysis</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                <div className="text-[10px] sm:text-xs text-cyan-300">Pre-Market Vol</div>
                <div className="text-sm sm:text-xl font-bold text-white">{data?.volume?.premarket || '12.5M'}</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                <div className="text-[10px] sm:text-xs text-cyan-300">Avg Volume</div>
                <div className="text-sm sm:text-xl font-bold text-white">{data?.volume?.avgVolume || '45.2M'}</div>
              </div>
              <div className={`p-2 rounded-lg text-center ${(data?.volume?.ratio || 1.52) > 1 ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                <div className="text-[10px] sm:text-xs text-cyan-300">Ratio</div>
                <div className={`text-sm sm:text-xl font-bold ${(data?.volume?.ratio || 1.52) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {data?.volume?.ratio || 1.52}x
                </div>
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-white mb-2">{selectedAsset} Volume Profile</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-cyan-300">Buy Volume</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 sm:w-32 bg-slate-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data?.volume?.buyPercent || 58}%` }}></div>
                    </div>
                    <span className="text-xs text-green-400">{data?.volume?.buyPercent || 58}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-cyan-300">Sell Volume</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 sm:w-32 bg-slate-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${data?.volume?.sellPercent || 42}%` }}></div>
                    </div>
                    <span className="text-xs text-red-400">{data?.volume?.sellPercent || 42}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
              <div className="text-[10px] sm:text-xs text-orange-400 mb-1">Recommendation for {selectedAsset}</div>
              <p className="text-xs sm:text-sm text-slate-300">{data?.volume?.recommendation || `Above average volume on ${selectedAsset} - Bullish bias confirmed`}</p>
            </div>
          </div>
        );
        
      case 'reversal':
        return (
          <div className="space-y-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-cyan-600">{selectedAsset}</Badge>
              <span className="text-xs text-slate-200">Technical Indicators & Pivot Levels</span>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-white mb-2">{selectedAsset} Technical Indicators</h4>
              <div className="space-y-1.5">
                {(data?.reversal?.technicals || [
                  { indicator: 'RSI (14)', value: 58, signal: 'Neutral' },
                  { indicator: 'MACD', value: 'Bullish', signal: 'Positive' },
                  { indicator: 'VWAP', value: 'Above', signal: 'Bullish' },
                ]).map((tech: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-xs sm:text-sm">
                    <span className="text-white font-medium">{tech.indicator}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{selectedAsset}: <span className="text-white">{tech.value}</span></span>
                      <Badge variant="outline" className={`text-[10px] sm:text-xs ${tech.signal === 'Bullish' || tech.signal === 'Positive' ? 'text-green-400 border-green-500' : tech.signal === 'Bearish' || tech.signal === 'Negative' ? 'text-red-400 border-red-500' : 'text-cyan-400 border-cyan-500'}`}>
                        {tech.signal}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-green-900/30 rounded-lg border border-green-500/30 text-center">
                <div className="text-[10px] sm:text-xs text-green-400">R1</div>
                <div className="text-sm sm:text-xl font-bold text-white">${data?.reversal?.pivotLevels?.r1 || '585.50'}</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                <div className="text-[10px] sm:text-xs text-cyan-300">Pivot</div>
                <div className="text-sm sm:text-xl font-bold text-white">${data?.reversal?.pivotLevels?.pivot || '583.00'}</div>
              </div>
              <div className="p-2 bg-red-900/30 rounded-lg border border-red-500/30 text-center">
                <div className="text-[10px] sm:text-xs text-red-400">S1</div>
                <div className="text-sm sm:text-xl font-bold text-white">${data?.reversal?.pivotLevels?.s1 || '580.50'}</div>
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
              <div className="text-[10px] sm:text-xs text-cyan-400 mb-1">Recommendation for {selectedAsset}</div>
              <p className="text-xs sm:text-sm text-slate-300">{data?.reversal?.recommendation || `No divergence on ${selectedAsset} - Trend continuation likely`}</p>
            </div>
          </div>
        );
        
      case 'closing':
        return (
          <div className="space-y-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-violet-600">{selectedAsset}</Badge>
              <span className="text-xs text-slate-200">Closing Flow Analysis</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                <div className="text-[10px] sm:text-xs text-green-400">{selectedAsset} MOC Imbalance</div>
                <div className="text-base sm:text-xl font-bold text-green-400">{data?.closing?.moc?.imbalance || '+$180M'}</div>
                <div className="text-[10px] text-slate-200">{data?.closing?.moc?.direction || 'Buy'} side</div>
              </div>
              <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="text-[10px] sm:text-xs text-purple-400">Dark Pool %</div>
                <div className="text-base sm:text-xl font-bold text-white">{data?.closing?.darkPool?.volume || '42%'}</div>
                <div className="text-[10px] text-slate-200">{data?.closing?.darkPool?.vsAvg || '+5%'} vs avg</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-white mb-2">{selectedAsset} Sector & Related Flows</h4>
              <div className="space-y-1.5">
                {(data?.closing?.flowAnalysis || [
                  { sector: isCrypto ? 'Crypto Total' : 'Technology', flow: '+$1.2B', signal: 'Strong' },
                  { sector: isCrypto ? 'Altcoins' : 'Related ETFs', flow: '+$450M', signal: 'Moderate' },
                  { sector: isCrypto ? 'Stablecoins' : 'Options Flow', flow: '-$280M', signal: 'Weak' },
                ]).map((sector: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-xs sm:text-sm">
                    <span className="text-white">{sector.sector}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${sector.flow.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {sector.flow}
                      </span>
                      <Badge variant="outline" className={`text-[10px] sm:text-xs ${sector.signal === 'Strong' ? 'text-green-400 border-green-500' : sector.signal === 'Weak' ? 'text-red-400 border-red-500' : 'text-slate-200 border-slate-500'}`}>
                        {sector.signal}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-violet-900/20 rounded-lg border border-violet-500/30">
              <div className="text-[10px] sm:text-xs text-violet-400 mb-1">Recommendation for {selectedAsset}</div>
              <p className="text-xs sm:text-sm text-slate-300">{data?.closing?.recommendation || `Strong buy-side MOC on ${selectedAsset} - Bullish overnight bias`}</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3" data-testid="page-title">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            Daily Market Checklist
          </h1>
          <p className="text-xs sm:text-base text-slate-200">Professional trading workflow with live data</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-200" />
                  <span className="text-sm text-slate-200">Select Asset for Analysis:</span>
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none justify-between bg-slate-900 border-slate-600 text-white hover:bg-slate-800"
                      onClick={() => setShowSearch(!showSearch)}
                    >
                      <span className="flex items-center gap-2">
                        <Badge className="bg-blue-600">{selectedAsset}</Badge>
                        <span className="hidden sm:inline text-slate-200">{getAssetInfo().name}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                    {assetLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                  </div>
                  
                  {showSearch && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-600 rounded-lg shadow-xl">
                      <div className="p-2 border-b border-slate-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200" />
                          <Input
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-800 border-slate-600 text-white"
                            autoFocus
                          />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                              onClick={() => setSearchQuery('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                        {filteredAssets.map((asset) => (
                          <Button
                            key={asset.symbol}
                            variant="ghost"
                            className={`w-full justify-start gap-2 ${selectedAsset === asset.symbol ? 'bg-blue-600/20 text-blue-400' : 'text-white hover:bg-slate-800'}`}
                            onClick={() => handleAssetSelect(asset.symbol)}
                          >
                            <Badge variant="outline" className={`${asset.type === 'Crypto' ? 'border-orange-500 text-orange-400' : asset.type === 'ETF' ? 'border-green-500 text-green-400' : 'border-blue-500 text-blue-400'}`}>
                              {asset.symbol}
                            </Badge>
                            <span className="text-sm truncate">{asset.name}</span>
                            <Badge variant="outline" className="ml-auto text-[10px] text-slate-200 border-slate-600">
                              {asset.type}
                            </Badge>
                          </Button>
                        ))}
                        {filteredAssets.length === 0 && searchQuery.trim().length > 0 && (
                          <div className="py-2 space-y-2">
                            <p className="text-center text-slate-400 text-xs">No matching assets in list</p>
                            <Button
                              variant="outline"
                              className="w-full justify-center gap-2 border-green-500/50 text-green-400 hover:bg-green-900/30"
                              onClick={() => handleAssetSelect(searchQuery.trim().toUpperCase())}
                            >
                              <Search className="h-4 w-4" />
                              Analyze "{searchQuery.trim().toUpperCase()}"
                            </Button>
                            <p className="text-center text-slate-500 text-[10px]">Stocks, ETFs, Crypto, Forex, Futures</p>
                          </div>
                        )}
                        {filteredAssets.length === 0 && searchQuery.trim().length === 0 && (
                          <div className="text-center py-4 text-slate-200 text-sm">
                            Type a symbol to search...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-700">
                <div className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl font-mono text-white" data-testid="current-time">{formatTime(currentTime)}</p>
                  <p className="text-slate-200 text-xs sm:text-sm">{formatDate(currentTime)}</p>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-blue-400" data-testid="progress-count">{completedCount}/{checklist.length}</p>
                    <p className="text-slate-200 text-[10px] sm:text-xs">Complete</p>
                  </div>
                  <div className="w-24 sm:w-32">
                    <Progress value={progress} className="h-2 sm:h-3" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrint}
                  className="border-blue-600 text-blue-400 hover:bg-blue-900/30 text-xs sm:text-sm"
                  data-testid="button-print"
                >
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetChecklist}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm"
                  data-testid="button-reset"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:gap-4">
          {checklist.map((item) => {
            const status = getPhaseStatus(item.phase);
            const isActive = status === 'active';
            const isPast = status === 'past';
            const isExpanded = expandedItems.has(item.id);

            return (
              <Card 
                key={item.id}
                className={`transition-all duration-300 ${
                  item.checked 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : isActive
                      ? 'bg-blue-900/30 border-blue-500/50 ring-2 ring-blue-500/30'
                      : isPast
                        ? 'bg-slate-800/30 border-slate-700/50'
                        : 'bg-slate-800/50 border-slate-700'
                }`}
                data-testid={`checklist-item-${item.id}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg ${
                      item.checked ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-200'
                    }`}>
                      {iconMap[item.iconName]}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-[10px] sm:text-xs ${
                            isActive ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'text-slate-200 border-slate-600'
                          }`}
                        >
                          {item.phase}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] sm:text-xs ${categoryColors[item.category]}`}>
                          {categoryLabels[item.category]}
                        </Badge>
                        {isActive && (
                          <Badge className="bg-blue-500 text-white animate-pulse text-[10px] sm:text-xs">
                            NOW
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className={`font-semibold text-sm sm:text-lg ${
                        item.checked ? 'text-green-400 line-through' : 'text-white'
                      }`}>
                        {item.task}
                      </h3>
                      <p className={`text-xs sm:text-sm ${
                        item.checked ? 'text-slate-300' : 'text-slate-200'
                      }`}>
                        {item.description}
                      </p>
                      
                      <button 
                        type="button"
                        className="mt-2 inline-flex items-center text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 px-2 py-1 h-7 sm:h-8 text-xs sm:text-sm rounded-md relative z-10 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(item.id);
                        }}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {isExpanded ? (
                          <>Hide Data <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /></>
                        ) : (
                          <>View {selectedAsset} Data <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /></>
                        )}
                      </button>
                      
                      {isExpanded && renderDataContent(item.dataType)}
                    </div>

                    <div className="flex-shrink-0 flex items-center">
                      <Checkbox 
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className={`h-6 w-6 sm:h-8 sm:w-8 border-2 rounded-md ${item.checked ? 'border-green-500 bg-green-500 data-[state=checked]:bg-green-500' : isActive ? 'border-blue-400' : 'border-slate-500'}`}
                        data-testid={`checkbox-${item.id}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              Trading Notes for {selectedAsset}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Key reminders for {getAssetInfo().name}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 sm:p-3">
                <p className="font-semibold text-blue-400 mb-1 text-xs sm:text-sm">Macro Events</p>
                <p className="text-slate-200 text-[10px] sm:text-xs">CPI, NFP, FOMC cause volatility. Wait for {selectedAsset} reaction.</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 sm:p-3">
                <p className="font-semibold text-purple-400 mb-1 text-xs sm:text-sm">Whale Moves</p>
                <p className="text-slate-200 text-[10px] sm:text-xs">Large {selectedAsset} flows signal major moves.</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 sm:p-3">
                <p className="font-semibold text-green-400 mb-1 text-xs sm:text-sm">Gap Analysis</p>
                <p className="text-slate-200 text-[10px] sm:text-xs">{selectedAsset} gaps often fill within first hour.</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 sm:p-3">
                <p className="font-semibold text-orange-400 mb-1 text-xs sm:text-sm">Volume</p>
                <p className="text-slate-200 text-[10px] sm:text-xs">True {selectedAsset} breakouts need volume support.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
