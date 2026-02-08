import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Target,
  Shield,
  Lightbulb,
  BarChart3,
  Activity,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Loader2,
  Brain,
  ChartLine,
  DollarSign,
  Zap
} from 'lucide-react';
import { IntermarketBanner } from '@/components/IntermarketBanner';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  beta: number | null;
}

interface TechnicalIndicators {
  rsi14: number;
  macd: { value: number; signal: number; histogram: number };
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  atr14: number;
  volumeRatio: number;
}

interface StockResearchResult {
  quote: StockQuote;
  technicals: TechnicalIndicators;
  aiAnalysis: {
    summary: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    keyPoints: string[];
    risks: string[];
    opportunities: string[];
    priceTargets: { support: number; resistance: number };
    recommendation: string;
  };
  timestamp: string;
}

const popularStocks = ['^GSPC', '^SPX', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY', 'QQQ', 'AMD', 'XRP-USD', 'HBAR-USD', 'XLM-USD'];

export default function StockResearch() {
  const [symbol, setSymbol] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');

  const { data, isLoading, error, refetch } = useQuery<StockResearchResult>({
    queryKey: ['/api/stock-research/research', searchSymbol],
    enabled: !!searchSymbol,
  });

  const handleSearch = () => {
    if (symbol.trim()) {
      setSearchSymbol(symbol.trim().toUpperCase());
    }
  };

  const handleQuickSearch = (ticker: string) => {
    setSymbol(ticker);
    setSearchSymbol(ticker);
  };

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-500/10 border-green-500/30';
      case 'bearish': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-500';
    if (rsi < 30) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <IntermarketBanner />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              Stock Research Assistant
            </h1>
            <p className="text-muted-foreground mt-1">AI-powered real-time stock analysis with technical indicators</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live Data
            </Badge>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter stock symbol (e.g., AAPL, MSFT, TSLA)"
                  className="pl-10 h-12 text-lg"
                  data-testid="input-stock-symbol"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !symbol.trim()}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-research"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                Research
              </Button>
            </div>

            {/* Quick Access */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Popular stocks:</p>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map((ticker) => (
                  <Button
                    key={ticker}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch(ticker)}
                    className="hover:bg-primary/10"
                    data-testid={`button-quick-${ticker.toLowerCase()}`}
                  >
                    {ticker}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Research Failed</p>
                  <p className="text-sm">{(error as Error).message || 'Unable to fetch stock data. Please check the symbol and try again.'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <div className="space-y-6">
            {/* Stock Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Quote Card */}
              <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {data.quote.symbol}
                        <Badge variant="secondary" className="font-normal">
                          {data.quote.name}
                        </Badge>
                      </CardTitle>
                      <CardDescription>Real-time quote from Yahoo Finance</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-4xl font-bold">${data.quote.price.toFixed(2)}</span>
                    <div className={`flex items-center gap-1 text-xl ${data.quote.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.quote.change >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                      <span>{data.quote.change >= 0 ? '+' : ''}{data.quote.change.toFixed(2)}</span>
                      <span>({data.quote.changePercent >= 0 ? '+' : ''}{data.quote.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Open</p>
                      <p className="font-semibold">${data.quote.open.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="font-semibold text-green-600">${data.quote.high.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="font-semibold text-red-600">${data.quote.low.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Prev Close</p>
                      <p className="font-semibold">${data.quote.previousClose.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Volume</p>
                      <p className="font-semibold">{formatVolume(data.quote.volume)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Avg Volume</p>
                      <p className="font-semibold">{formatVolume(data.quote.avgVolume)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">52W High</p>
                      <p className="font-semibold text-green-600">${data.quote.fiftyTwoWeekHigh.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">52W Low</p>
                      <p className="font-semibold text-red-600">${data.quote.fiftyTwoWeekLow.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Sentiment Card */}
              <Card className={`border-2 ${getSentimentBg(data.aiAnalysis.sentiment)} shadow-lg`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className={`p-4 rounded-full ${getSentimentBg(data.aiAnalysis.sentiment)}`}>
                      {data.aiAnalysis.sentiment === 'bullish' ? (
                        <TrendingUp className="w-12 h-12 text-green-500" />
                      ) : data.aiAnalysis.sentiment === 'bearish' ? (
                        <TrendingDown className="w-12 h-12 text-red-500" />
                      ) : (
                        <Minus className="w-12 h-12 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className={`text-lg px-4 py-1 ${
                      data.aiAnalysis.sentiment === 'bullish' ? 'bg-green-500' :
                      data.aiAnalysis.sentiment === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {data.aiAnalysis.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {data.aiAnalysis.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-2 bg-green-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">Support</p>
                      <p className="font-bold text-green-600">${data.aiAnalysis.priceTargets.support.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">Resistance</p>
                      <p className="font-bold text-red-600">${data.aiAnalysis.priceTargets.resistance.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technical Indicators & Analysis Tabs */}
            <Tabs defaultValue="technicals" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="technicals" className="flex items-center gap-2" data-testid="tab-technicals">
                  <ChartLine className="w-4 h-4" />
                  Technicals
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2" data-testid="tab-analysis">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="risks" className="flex items-center gap-2" data-testid="tab-risks">
                  <Shield className="w-4 h-4" />
                  Risks
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex items-center gap-2" data-testid="tab-opportunities">
                  <Lightbulb className="w-4 h-4" />
                  Opportunities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="technicals">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* RSI */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">RSI (14)</span>
                        <Badge variant="outline" className={getRSIColor(data.technicals.rsi14)}>
                          {getRSILabel(data.technicals.rsi14)}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-2">{data.technicals.rsi14.toFixed(1)}</div>
                      <Progress value={data.technicals.rsi14} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Oversold (30)</span>
                        <span>Overbought (70)</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* MACD */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">MACD</span>
                        <Badge variant="outline" className={data.technicals.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'}>
                          {data.technicals.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">MACD Line</span>
                          <span className="font-semibold">{data.technicals.macd.value.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Signal Line</span>
                          <span className="font-semibold">{data.technicals.macd.signal.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Histogram</span>
                          <span className={`font-semibold ${data.technicals.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.technicals.macd.histogram.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Moving Averages */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Moving Averages</span>
                        <Badge variant="outline" className={data.quote.price > data.technicals.sma200 ? 'text-green-500' : 'text-red-500'}>
                          {data.quote.price > data.technicals.sma200 ? 'Above 200 SMA' : 'Below 200 SMA'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">SMA 20</span>
                          <span className={`font-semibold ${data.quote.price > data.technicals.sma20 ? 'text-green-500' : 'text-red-500'}`}>
                            ${data.technicals.sma20.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">SMA 50</span>
                          <span className={`font-semibold ${data.quote.price > data.technicals.sma50 ? 'text-green-500' : 'text-red-500'}`}>
                            ${data.technicals.sma50.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">SMA 200</span>
                          <span className={`font-semibold ${data.quote.price > data.technicals.sma200 ? 'text-green-500' : 'text-red-500'}`}>
                            ${data.technicals.sma200.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bollinger Bands */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Bollinger Bands</span>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">Upper</span>
                          <span className="font-semibold text-red-500">${data.technicals.bollingerBands.upper.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Middle</span>
                          <span className="font-semibold">${data.technicals.bollingerBands.middle.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Lower</span>
                          <span className="font-semibold text-green-500">${data.technicals.bollingerBands.lower.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ATR */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">ATR (14)</span>
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="text-2xl font-bold">${data.technicals.atr14.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average True Range - Volatility measure
                      </p>
                    </CardContent>
                  </Card>

                  {/* Volume Ratio */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Volume Ratio</span>
                        <Badge variant="outline" className={data.technicals.volumeRatio > 1.5 ? 'text-green-500' : data.technicals.volumeRatio < 0.5 ? 'text-red-500' : ''}>
                          {data.technicals.volumeRatio > 1.5 ? 'High' : data.technicals.volumeRatio < 0.5 ? 'Low' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{(data.technicals.volumeRatio * 100).toFixed(0)}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Relative to 20-day average
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-primary" />
                          Recommendation
                        </h3>
                        <p className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                          {data.aiAnalysis.recommendation}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Key Points
                        </h3>
                        <ul className="space-y-2">
                          {data.aiAnalysis.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risks">
                <Card className="border-red-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold">Risk Factors</h3>
                    </div>
                    <ul className="space-y-3">
                      {data.aiAnalysis.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                          <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities">
                <Card className="border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Opportunities</h3>
                    </div>
                    <ul className="space-y-3">
                      {data.aiAnalysis.opportunities.map((opp, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                          <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-sm">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!data && !isLoading && !error && (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Your Research</h3>
              <p className="text-muted-foreground mb-4">
                Enter a stock symbol above to get AI-powered analysis with real-time data
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularStocks.slice(0, 5).map((ticker) => (
                  <Button
                    key={ticker}
                    variant="outline"
                    onClick={() => handleQuickSearch(ticker)}
                  >
                    Try {ticker}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
