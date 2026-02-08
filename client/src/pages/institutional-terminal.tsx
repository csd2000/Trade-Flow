import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Activity, Database, Globe, 
  BarChart3, DollarSign, Building2, Wifi, WifiOff, Clock,
  Search, RefreshCw, Zap, Shield, LineChart, PieChart,
  ArrowUpRight, ArrowDownRight, Minus, Brain
} from 'lucide-react';

interface DataSource {
  name: string;
  type: 'primary' | 'secondary' | 'alternative';
  status: 'connected' | 'degraded' | 'offline';
  latency: number;
  lastUpdate: string;
  dataQuality: number;
}

interface InstitutionalQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  volume: number;
  avgVolume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  dividendYield: number;
  beta: number;
  week52High: number;
  week52Low: number;
  sources: string[];
  dataQuality: number;
  lastUpdate: string;
}

interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  advanceVolume: number;
  declineVolume: number;
  newHighs: number;
  newLows: number;
  upDownRatio: number;
  mcclellanOscillator: number;
  advanceDeclineLine: number;
}

interface SectorFlow {
  sector: string;
  performance1D: number;
  performance1W: number;
  performance1M: number;
  performance3M: number;
  performanceYTD: number;
  volume: number;
  avgVolume: number;
  moneyFlow: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface EconomicIndicator {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  frequency: string;
  lastUpdate: string;
  source: string;
  trend: 'rising' | 'falling' | 'stable';
}

interface FixedIncomeData {
  instrument: string;
  yield: number;
  price: number;
  change: number;
  duration: number;
  spread: number;
  rating: string;
}

interface MarketSummary {
  indices: { symbol: string; name: string; price: number; change: number }[];
  breadth: MarketBreadth;
  sectors: SectorFlow[];
  fixedIncome: FixedIncomeData[];
  economic: EconomicIndicator[];
  sources: DataSource[];
  aiSummary: string;
}

function DataSourceStatus({ source }: { source: DataSource }) {
  const statusColors = {
    connected: 'bg-green-500',
    degraded: 'bg-yellow-500',
    offline: 'bg-red-500'
  };

  const typeColors = {
    primary: 'text-blue-600 bg-blue-100',
    secondary: 'text-purple-600 bg-purple-100',
    alternative: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[source.status]}`} />
        <div>
          <div className="font-medium text-sm">{source.name}</div>
          <Badge variant="outline" className={`text-xs ${typeColors[source.type]}`}>
            {source.type}
          </Badge>
        </div>
      </div>
      <div className="text-right text-sm">
        <div className="text-gray-300">{source.latency}ms</div>
        <div className="flex items-center gap-1">
          <Progress value={source.dataQuality} className="w-16 h-1" />
          <span className="text-xs text-gray-300">{source.dataQuality}%</span>
        </div>
      </div>
    </div>
  );
}

function QuoteDisplay({ quote }: { quote: InstitutionalQuote }) {
  const isPositive = quote.change >= 0;
  
  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{quote.symbol}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {quote.sources.map((src, i) => (
                <Badge key={i} variant="outline" className="text-xs">{src}</Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${quote.price.toFixed(2)}</div>
            <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-medium">
                {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-300">Bid/Ask</div>
            <div className="font-medium">${quote.bid.toFixed(2)} / ${quote.ask.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-300">Volume</div>
            <div className="font-medium">{(quote.volume / 1000000).toFixed(2)}M</div>
          </div>
          <div>
            <div className="text-gray-300">High/Low</div>
            <div className="font-medium">${quote.high.toFixed(2)} / ${quote.low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-300">Prev Close</div>
            <div className="font-medium">${quote.prevClose.toFixed(2)}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t">
          <div>
            <div className="text-gray-300">Market Cap</div>
            <div className="font-medium">${(quote.marketCap / 1000000000).toFixed(2)}B</div>
          </div>
          <div>
            <div className="text-gray-300">P/E</div>
            <div className="font-medium">{quote.pe.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-300">Beta</div>
            <div className="font-medium">{quote.beta.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-300">52W Range</div>
            <div className="font-medium">${quote.week52Low.toFixed(0)} - ${quote.week52High.toFixed(0)}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm">Data Quality: {quote.dataQuality}%</span>
          </div>
          <div className="text-xs text-gray-300">
            Last Update: {new Date(quote.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectorHeatmap({ sectors }: { sectors: SectorFlow[] }) {
  const getColor = (value: number) => {
    if (value >= 2) return 'bg-green-600 text-white';
    if (value >= 1) return 'bg-green-400 text-white';
    if (value >= 0) return 'bg-green-200 text-green-800';
    if (value >= -1) return 'bg-red-200 text-red-800';
    if (value >= -2) return 'bg-red-400 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {sectors.map(sector => (
        <div 
          key={sector.sector}
          className={`p-3 rounded-lg ${getColor(sector.performance1D)}`}
        >
          <div className="font-medium text-sm truncate">{sector.sector}</div>
          <div className="text-lg font-bold">
            {sector.performance1D >= 0 ? '+' : ''}{sector.performance1D.toFixed(2)}%
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs mt-1 ${
              sector.sentiment === 'bullish' ? 'border-green-300' : 
              sector.sentiment === 'bearish' ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {sector.sentiment}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export default function InstitutionalTerminal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery<MarketSummary>({
    queryKey: ['/api/institutional/summary'],
    refetchInterval: 60000
  });

  const { data: quote, isLoading: loadingQuote } = useQuery<InstitutionalQuote>({
    queryKey: ['/api/institutional/quote', selectedSymbol],
    enabled: !!selectedSymbol
  });

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      setSelectedSymbol(searchSymbol.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              Institutional Data Terminal
            </h1>
            <p className="text-gray-600 dark:text-gray-200 mt-1">
              Bloomberg/Refinitiv-style multi-source data aggregation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Input 
                placeholder="Symbol (e.g., AAPL)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-40"
                data-testid="input-institutional-symbol"
              />
              <Button onClick={handleSearch} variant="outline" data-testid="button-search-quote">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={() => refetchSummary()} variant="outline" data-testid="button-refresh-institutional">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {summary?.sources && (
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" /> Connected Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {summary.sources.map((source, i) => (
                  <DataSourceStatus key={i} source={source} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" /> Market Overview
            </TabsTrigger>
            <TabsTrigger value="quote" data-testid="tab-quote">
              <DollarSign className="w-4 h-4 mr-2" /> Quote
            </TabsTrigger>
            <TabsTrigger value="sectors" data-testid="tab-sectors">
              <PieChart className="w-4 h-4 mr-2" /> Sectors
            </TabsTrigger>
            <TabsTrigger value="fixed-income" data-testid="tab-fixed-income">
              <LineChart className="w-4 h-4 mr-2" /> Fixed Income
            </TabsTrigger>
            <TabsTrigger value="economic" data-testid="tab-economic">
              <Building2 className="w-4 h-4 mr-2" /> Economic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {summary?.aiSummary && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1">AI Market Analysis</div>
                      <p className="text-gray-700 dark:text-gray-300">{summary.aiSummary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-5 gap-4">
              {summary?.indices?.map((idx, i) => (
                <Card key={i} className={`${idx.change >= 0 ? 'border-green-200' : 'border-red-200'}`}>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-300">{idx.name}</div>
                    <div className="text-xl font-bold">${idx.price.toFixed(2)}</div>
                    <div className={`flex items-center gap-1 text-sm ${idx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {idx.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {summary?.breadth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Market Breadth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{summary.breadth.advancers}</div>
                      <div className="text-sm text-gray-300">Advancers</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{summary.breadth.decliners}</div>
                      <div className="text-sm text-gray-300">Decliners</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold">{summary.breadth.unchanged}</div>
                      <div className="text-sm text-gray-300">Unchanged</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{summary.breadth.upDownRatio.toFixed(2)}</div>
                      <div className="text-sm text-gray-300">Up/Down Ratio</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{summary.breadth.mcclellanOscillator.toFixed(0)}</div>
                      <div className="text-sm text-gray-300">McClellan Osc</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-300">New 52-Week Highs</div>
                        <div className="text-xl font-bold text-green-600">{summary.breadth.newHighs}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-300">New 52-Week Lows</div>
                        <div className="text-xl font-bold text-red-600">{summary.breadth.newLows}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quote" className="mt-6 space-y-6">
            {loadingQuote ? (
              <Card className="p-8 text-center">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                <p className="mt-2 text-gray-300">Loading quote data...</p>
              </Card>
            ) : quote ? (
              <QuoteDisplay quote={quote} />
            ) : (
              <Card className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-200" />
                <h3 className="text-xl font-semibold mt-4">Search for a Symbol</h3>
                <p className="text-gray-300 mt-2">Enter a stock symbol above to view institutional-grade quote data</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sectors" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" /> Sector Performance Heatmap
                </CardTitle>
                <CardDescription>Real-time sector performance with money flow analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.sectors && <SectorHeatmap sectors={summary.sectors} />}
              </CardContent>
            </Card>

            {summary?.sectors && (
              <Card>
                <CardHeader>
                  <CardTitle>Sector Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="p-2 text-left">Sector</th>
                          <th className="p-2 text-right">1D</th>
                          <th className="p-2 text-right">1W</th>
                          <th className="p-2 text-right">1M</th>
                          <th className="p-2 text-right">3M</th>
                          <th className="p-2 text-right">YTD</th>
                          <th className="p-2 text-right">Money Flow</th>
                          <th className="p-2 text-center">Sentiment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.sectors.map((sector, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2 font-medium">{sector.sector}</td>
                            <td className={`p-2 text-right ${sector.performance1D >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {sector.performance1D >= 0 ? '+' : ''}{sector.performance1D.toFixed(2)}%
                            </td>
                            <td className={`p-2 text-right ${sector.performance1W >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {sector.performance1W >= 0 ? '+' : ''}{sector.performance1W.toFixed(2)}%
                            </td>
                            <td className={`p-2 text-right ${sector.performance1M >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {sector.performance1M >= 0 ? '+' : ''}{sector.performance1M.toFixed(2)}%
                            </td>
                            <td className={`p-2 text-right ${sector.performance3M >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {sector.performance3M >= 0 ? '+' : ''}{sector.performance3M.toFixed(2)}%
                            </td>
                            <td className={`p-2 text-right ${sector.performanceYTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {sector.performanceYTD >= 0 ? '+' : ''}{sector.performanceYTD.toFixed(2)}%
                            </td>
                            <td className={`p-2 text-right ${sector.moneyFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${(sector.moneyFlow / 1000000).toFixed(0)}M
                            </td>
                            <td className="p-2 text-center">
                              <Badge variant={
                                sector.sentiment === 'bullish' ? 'default' :
                                sector.sentiment === 'bearish' ? 'destructive' : 'secondary'
                              }>
                                {sector.sentiment}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="fixed-income" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" /> Fixed Income & Treasury Yields
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.fixedIncome && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="p-3 text-left">Instrument</th>
                          <th className="p-3 text-right">Yield</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-right">Change</th>
                          <th className="p-3 text-right">Duration</th>
                          <th className="p-3 text-right">Spread (bps)</th>
                          <th className="p-3 text-center">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.fixedIncome.map((fi, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-3 font-medium">{fi.instrument}</td>
                            <td className="p-3 text-right text-blue-600 font-semibold">{fi.yield.toFixed(2)}%</td>
                            <td className="p-3 text-right">${fi.price.toFixed(2)}</td>
                            <td className={`p-3 text-right ${fi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {fi.change >= 0 ? '+' : ''}{fi.change.toFixed(2)}
                            </td>
                            <td className="p-3 text-right">{fi.duration.toFixed(1)}</td>
                            <td className="p-3 text-right">{fi.spread}</td>
                            <td className="p-3 text-center">
                              <Badge variant={fi.rating === 'AAA' ? 'default' : 'secondary'}>
                                {fi.rating}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economic" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Economic Indicators
                </CardTitle>
                <CardDescription>Key macroeconomic data from Federal Reserve, BLS, and other sources</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.economic && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {summary.economic.map((ind, i) => (
                      <Card key={i} className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-300 mb-1">{ind.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">
                              {ind.name.includes('Rate') || ind.name.includes('Yield') || ind.name.includes('CPI') || ind.name.includes('GDP') 
                                ? `${ind.value.toFixed(2)}%` 
                                : ind.value.toLocaleString()}
                            </span>
                            {ind.trend === 'rising' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : ind.trend === 'falling' ? (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-200" />
                            )}
                          </div>
                          <div className={`text-sm mt-1 ${ind.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ind.change >= 0 ? '+' : ''}{ind.change.toFixed(2)} vs prev
                          </div>
                          <div className="text-xs text-gray-200 mt-2">
                            {ind.source} • {ind.frequency}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
