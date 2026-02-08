import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, BarChart3, Bell, Activity } from "lucide-react";

export default function ThirtySecondTrader() {
  const { data: stockAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/stock-alerts"],
  });

  const { data: stockNews, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/stock-news"],
  });

  const { data: marketOverview, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/market-overview"],
  });

  const { data: tradingSignals, isLoading: signalsLoading } = useQuery({
    queryKey: ["/api/trading-signals"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-gray-900" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              30SecondTrader Pro
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto">
            Daily top stock picks, market analysis, and professional trading signals
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <Badge variant="secondary" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Live Market Data
            </Badge>
            <Badge variant="secondary" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              SMS/Email Alerts
            </Badge>
            <Badge variant="secondary" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Top 5 Daily Movers
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="market-overview" className="space-y-4 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto h-auto p-1">
            <TabsTrigger value="market-overview" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Market Overview</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="top-movers" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Top Movers</span>
              <span className="sm:hidden">Movers</span>
            </TabsTrigger>
            <TabsTrigger value="big-news" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Big News</span>
              <span className="sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger value="trading-signals" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              <span className="hidden sm:inline">Trading Signals</span>
              <span className="sm:hidden">Signals</span>
            </TabsTrigger>
          </TabsList>

          {/* Market Overview Tab */}
          <TabsContent value="market-overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {marketLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (marketOverview as any[])?.length > 0 ? (
                (marketOverview as any[]).map((index: any) => (
                  <Card key={index.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {index.indexName}
                        <Badge variant={index.changePercent >= 0 ? "default" : "destructive"}>
                          {index.marketStatus}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          ${parseFloat(index.currentValue).toLocaleString()}
                        </div>
                        <div className={`flex items-center gap-1 ${
                          parseFloat(index.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {parseFloat(index.changePercent) >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {index.changeValue} ({index.changePercent}%)
                          </span>
                        </div>
                        {index.volume && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Volume: {parseInt(index.volume).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Sample Market Overview
                    </CardTitle>
                    <CardDescription>
                      Live market data will appear here. Enable real-time updates to see current market conditions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400">S&P 500</div>
                        <div className="text-xl font-bold">4,485.23</div>
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +1.2%
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400">NASDAQ</div>
                        <div className="text-xl font-bold">13,940.83</div>
                        <div className="text-sm text-blue-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +0.8%
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-sm text-red-600 dark:text-red-400">DOW</div>
                        <div className="text-xl font-bold">34,721.12</div>
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          -0.3%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Top Movers Tab */}
          <TabsContent value="top-movers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top 5 Daily Stock Movers
                </CardTitle>
                <CardDescription>
                  The biggest percentage gainers and losers in today's market
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : (stockAlerts as any[])?.length > 0 ? (
                  <div className="space-y-4">
                    {(stockAlerts as any[]).slice(0, 5).map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-lg">{alert.symbol}</div>
                            <Badge variant="outline">{alert.sector || "Tech"}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {alert.companyName}
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            ${parseFloat(alert.price).toFixed(2)} • Volume: {parseInt(alert.volume).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            parseFloat(alert.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {parseFloat(alert.percentChange) >= 0 ? '+' : ''}{alert.percentChange}%
                          </div>
                          <div className={`text-sm ${
                            parseFloat(alert.priceChange) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {parseFloat(alert.priceChange) >= 0 ? '+' : ''}${alert.priceChange}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-800 mb-2">
                      No stock data available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Connect to real-time data feeds to see top daily movers
                    </p>
                    <Button>
                      Enable Live Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Big News Tab */}
          <TabsContent value="big-news">
            <div className="space-y-6">
              {newsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (stockNews as any[])?.length > 0 ? (
                (stockNews as any[]).map((news: any) => (
                  <Card key={news.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl flex-1 pr-4">
                          {news.headline}
                        </CardTitle>
                        <Badge variant={
                          news.impactLevel === 'high' ? 'destructive' :
                          news.impactLevel === 'medium' ? 'default' : 'secondary'
                        }>
                          {news.impactLevel} impact
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{news.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(news.publishedAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">{news.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-600 mb-4">
                        {news.summary}
                      </p>
                      {news.affectedSymbols?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">Affected stocks:</span>
                          {news.affectedSymbols.map((symbol: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Market News & Analysis
                    </CardTitle>
                    <CardDescription>
                      Stay updated with the latest market-moving news and analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Fed Meeting Minutes Released</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                          Federal Reserve officials signal potential rate cuts in Q2 2024, markets respond positively
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">SPY</Badge>
                          <Badge variant="outline" className="text-xs">QQQ</Badge>
                          <Badge variant="outline" className="text-xs">IWM</Badge>
                        </div>
                      </div>
                      <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Tech Earnings Beat Expectations</h4>
                        <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                          Major technology companies report strong Q4 earnings, AI investments paying off
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">AAPL</Badge>
                          <Badge variant="outline" className="text-xs">MSFT</Badge>
                          <Badge variant="outline" className="text-xs">GOOGL</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Trading Signals Tab */}
          <TabsContent value="trading-signals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Professional Trading Signals
                  </CardTitle>
                  <CardDescription>
                    Expert-curated buy/sell signals with entry points and targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {signalsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (tradingSignals as any[])?.length > 0 ? (
                    <div className="space-y-4">
                      {(tradingSignals as any[]).map((signal: any) => (
                        <div key={signal.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-lg">{signal.symbol}</span>
                                <Badge variant={
                                  signal.signalType === 'buy' ? 'default' :
                                  signal.signalType === 'sell' ? 'destructive' : 'secondary'
                                }>
                                  {signal.signalType.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{signal.timeframe}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-300">Entry:</span>
                                  <span className="ml-1 font-medium">${signal.entryPrice}</span>
                                </div>
                                {signal.targetPrice && (
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-300">Target:</span>
                                    <span className="ml-1 font-medium text-green-600">${signal.targetPrice}</span>
                                  </div>
                                )}
                                {signal.stopLoss && (
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-300">Stop Loss:</span>
                                    <span className="ml-1 font-medium text-red-600">${signal.stopLoss}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600 dark:text-gray-300">Confidence:</span>
                                  <span className="ml-1 font-medium">{signal.confidence}%</span>
                                </div>
                              </div>
                              {signal.reasoning && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                  {signal.reasoning}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-800 mb-2">
                        No active signals
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Trading signals will appear here when market opportunities arise
                      </p>
                      <Button>
                        Enable Signal Notifications
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Newsletter Signup */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-gray-900">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Daily Stock Picks</CardTitle>
            <CardDescription className="text-blue-100">
              Join thousands of traders getting our top stock picks delivered every morning
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1 max-w-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-2 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white"
              />
            </div>
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}