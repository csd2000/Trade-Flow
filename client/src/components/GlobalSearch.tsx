import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Brain, 
  Target, 
  Coins, 
  DollarSign,
  Zap,
  Activity,
  LineChart,
  Eye,
  Network,
  Building2
} from 'lucide-react';

interface AssetSearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'etf' | 'futures';
  price?: number;
  changePercent?: number;
}

const tradingModules = [
  { name: 'AI Trader', path: '/ai-trader', icon: Brain, description: 'Real-time AI Analysis' },
  { name: '5:1 Scanner', path: '/scanner', icon: Target, description: '5:1 Risk/Reward Scanner' },
  { name: 'HF Scalping', path: '/scalping', icon: Zap, description: '1m/5m Real-Time Signals' },
  { name: 'Command Center', path: '/command-center', icon: Activity, description: 'Whale Stream & AI Analyst' },
  { name: 'Futures Desk', path: '/futures', icon: Coins, description: 'Gold & Silver Futures' },
  { name: 'Income Machine', path: '/income-machine', icon: DollarSign, description: 'Options Scanner' },
  { name: 'Stock Research', path: '/stock-research', icon: BarChart3, description: 'AI Stock Analysis' },
  { name: 'Reversal AI', path: '/reversal', icon: TrendingUp, description: 'Divergence Detection' },
  { name: 'Dark Pool AI', path: '/dark-pool', icon: Eye, description: 'Institutional Trades' },
  { name: 'Intermarket', path: '/intermarket', icon: Network, description: 'Cross-Asset Analysis' },
  { name: 'Institutional', path: '/institutional', icon: Building2, description: 'Multi-Source Data' },
  { name: 'Time Series', path: '/timeseries', icon: LineChart, description: 'Price Predictions' },
];

const popularAssets: AssetSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' },
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'etf' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'etf' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'GC=F', name: 'Gold Futures', type: 'futures' },
  { symbol: 'SI=F', name: 'Silver Futures', type: 'futures' },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { data: searchResults, isLoading } = useQuery<AssetSearchResult[]>({
    queryKey: ['/api/search/assets', search],
    enabled: search.length >= 1,
    staleTime: 30000,
  });

  const handleSelectAsset = useCallback((symbol: string, modulePath?: string) => {
    setOpen(false);
    setSearch('');
    
    const targetPath = modulePath || '/stock-research';
    setLocation(`${targetPath}?symbol=${encodeURIComponent(symbol)}`);
  }, [setLocation]);

  const handleSelectModule = useCallback((path: string) => {
    setOpen(false);
    setSearch('');
    setLocation(path);
  }, [setLocation]);

  const filteredAssets = search.length >= 1
    ? (searchResults || popularAssets.filter(a => 
        a.symbol.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase())
      ))
    : popularAssets.slice(0, 6);

  const filteredModules = search.length >= 1
    ? tradingModules.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
      )
    : tradingModules.slice(0, 4);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center w-64 lg:w-80 h-9 pl-9 pr-4 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-all cursor-pointer relative"
        data-testid="button-global-search"
      >
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <span>Search assets, strategies...</span>
        <kbd className="absolute right-3 text-[10px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search stocks, crypto, ETFs, or trading tools..." 
          value={search}
          onValueChange={setSearch}
          data-testid="input-global-search"
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
                <span className="ml-2 text-sm text-slate-400">Searching...</span>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-300">No results found for "{search}"</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for a stock symbol like AAPL, TSLA, or NVDA</p>
              </div>
            )}
          </CommandEmpty>

          {filteredAssets.length > 0 && (
            <CommandGroup heading="Assets">
              {filteredAssets.map((asset) => (
                <CommandItem
                  key={asset.symbol}
                  value={`${asset.symbol} ${asset.name}`}
                  onSelect={() => handleSelectAsset(asset.symbol)}
                  className="flex items-center justify-between cursor-pointer"
                  data-testid={`search-result-${asset.symbol}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      asset.type === 'crypto' ? 'bg-orange-800/50 text-orange-300' :
                      asset.type === 'etf' ? 'bg-blue-800/50 text-blue-300' :
                      asset.type === 'futures' ? 'bg-yellow-800/50 text-yellow-300' :
                      'bg-green-800/50 text-green-300'
                    }`}>
                      <span className="text-xs font-bold">
                        {asset.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-slate-400">{asset.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                      {asset.type.toUpperCase()}
                    </Badge>
                    {asset.changePercent !== undefined && (
                      <span className={`text-xs font-medium flex items-center ${
                        asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.changePercent >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {filteredModules.length > 0 && (
            <CommandGroup heading="Trading Tools">
              {filteredModules.map((module) => {
                const Icon = module.icon;
                return (
                  <CommandItem
                    key={module.path}
                    value={`${module.name} ${module.description}`}
                    onSelect={() => handleSelectModule(module.path)}
                    className="flex items-center gap-3 cursor-pointer"
                    data-testid={`search-module-${module.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-800/50 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-violet-300" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{module.name}</div>
                      <div className="text-xs text-slate-400">{module.description}</div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {search.length >= 1 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  value={`analyze ${search}`}
                  onSelect={() => handleSelectAsset(search.toUpperCase(), '/stock-research')}
                  className="cursor-pointer"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze "{search.toUpperCase()}" with AI
                </CommandItem>
                <CommandItem
                  value={`scan ${search}`}
                  onSelect={() => handleSelectAsset(search.toUpperCase(), '/scalping')}
                  className="cursor-pointer"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Scan "{search.toUpperCase()}" for scalping signals
                </CommandItem>
                <CommandItem
                  value={`predict ${search}`}
                  onSelect={() => handleSelectAsset(search.toUpperCase(), '/timeseries')}
                  className="cursor-pointer"
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  Predict "{search.toUpperCase()}" price movement
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
