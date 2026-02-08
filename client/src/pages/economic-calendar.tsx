import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  DollarSign,
  BarChart3,
  Flag,
  Building,
  Zap,
  Bell,
  Filter,
  ChevronRight,
  Globe,
  Target
} from "lucide-react";

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  country: string;
  event: string;
  importance: 'Low' | 'Medium' | 'High';
  actual?: string;
  forecast: string;
  previous: string;
  currency: string;
  category: string;
  impact: string;
}

interface MarketImpact {
  asset: string;
  direction: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: string;
  reasoning: string;
}

export default function EconomicCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [importanceFilter, setImportanceFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState("today");

  const economicEvents: EconomicEvent[] = [
    {
      id: "1",
      date: "2025-01-17",
      time: "08:30",
      country: "US",
      event: "Retail Sales (MoM)",
      importance: "High",
      actual: "0.4%",
      forecast: "0.3%",
      previous: "0.7%",
      currency: "USD",
      category: "Consumer Spending",
      impact: "Higher retail sales indicate strong consumer demand, bullish for USD and equities"
    },
    {
      id: "2", 
      date: "2025-01-17",
      time: "10:00",
      country: "US",
      event: "Industrial Production",
      importance: "Medium",
      forecast: "0.2%",
      previous: "0.2%",
      currency: "USD",
      category: "Manufacturing",
      impact: "Shows manufacturing strength, affects industrial stocks and USD"
    },
    {
      id: "3",
      date: "2025-01-17",
      time: "14:00",
      country: "US",
      event: "Fed Chair Powell Speech",
      importance: "High",
      forecast: "N/A",
      previous: "N/A",
      currency: "USD",
      category: "Central Bank",
      impact: "Key insights on monetary policy direction, major market mover"
    },
    {
      id: "4",
      date: "2025-01-18",
      time: "04:00",
      country: "JP",
      event: "BoJ Interest Rate Decision",
      importance: "High",
      forecast: "-0.10%",
      previous: "-0.10%",
      currency: "JPY",
      category: "Monetary Policy",
      impact: "Any change in ultra-low rates would significantly impact JPY and global markets"
    },
    {
      id: "5",
      date: "2025-01-18",
      time: "08:30",
      country: "US",
      event: "Housing Starts",
      importance: "Medium",
      forecast: "1.35M",
      previous: "1.29M",
      currency: "USD",
      category: "Housing",
      impact: "Indicates housing market health, affects construction and materials sectors"
    },
    {
      id: "6",
      date: "2025-01-18",
      time: "09:15",
      country: "US",
      event: "Capacity Utilization",
      importance: "Low",
      forecast: "77.8%",
      previous: "77.9%",
      currency: "USD",
      category: "Manufacturing",
      impact: "Shows economic efficiency, minimal market impact unless major deviation"
    },
    {
      id: "7",
      date: "2025-01-19",
      time: "03:00",
      country: "EU",
      event: "ECB President Lagarde Speech",
      importance: "High",
      forecast: "N/A",
      previous: "N/A",
      currency: "EUR",
      category: "Central Bank",
      impact: "ECB policy outlook affects EUR and European equities significantly"
    },
    {
      id: "8",
      date: "2025-01-19",
      time: "08:30",
      country: "US",
      event: "Initial Jobless Claims",
      importance: "Medium",
      forecast: "220K",
      previous: "201K",
      currency: "USD",
      category: "Employment",
      impact: "Weekly employment indicator, affects USD and bond markets"
    }
  ];

  const marketImpacts: { [key: string]: MarketImpact[] } = {
    "Retail Sales (MoM)": [
      {
        asset: "USD Index",
        direction: "Bullish",
        confidence: "High",
        reasoning: "Strong consumer spending supports USD strength"
      },
      {
        asset: "Consumer Stocks",
        direction: "Bullish", 
        confidence: "Medium",
        reasoning: "Higher retail sales benefit consumer discretionary sector"
      },
      {
        asset: "Bond Yields",
        direction: "Bullish",
        confidence: "Medium",
        reasoning: "Strong data may push Fed toward hawkish stance"
      }
    ],
    "Fed Chair Powell Speech": [
      {
        asset: "USD",
        direction: "Neutral",
        confidence: "High",
        reasoning: "Direction depends on hawkish/dovish tone of speech"
      },
      {
        asset: "Tech Stocks",
        direction: "Bearish",
        confidence: "Medium",
        reasoning: "Hawkish comments typically pressure growth stocks"
      },
      {
        asset: "Gold",
        direction: "Bearish",
        confidence: "Medium",
        reasoning: "Hawkish Fed typically negative for non-yielding assets"
      }
    ]
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Low':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-300 bg-gray-500/10';
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'EU': '🇪🇺', 
      'JP': '🇯🇵',
      'GB': '🇬🇧',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'CH': '🇨🇭'
    };
    return flags[country] || '🌐';
  };

  const filteredEvents = economicEvents.filter(event => {
    const matchesImportance = importanceFilter === 'All' || event.importance === importanceFilter;
    const matchesCountry = countryFilter === 'All' || event.country === countryFilter;
    return matchesImportance && matchesCountry;
  });

  const todaysEvents = filteredEvents.filter(event => event.date === selectedDate);
  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) > new Date(selectedDate));
  const highImpactEvents = filteredEvents.filter(event => event.importance === 'High');

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-crypto-text">
                Economic Calendar
              </h1>
              <p className="text-crypto-muted">
                Track market-moving economic events and their potential impact
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-crypto-muted" />
              <span className="text-crypto-text text-sm">Filters:</span>
            </div>
            
            <div className="flex gap-2">
              {['All', 'High', 'Medium', 'Low'].map((importance) => (
                <Button
                  key={importance}
                  variant={importanceFilter === importance ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImportanceFilter(importance)}
                  className="text-xs"
                >
                  {importance}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              {['All', 'US', 'EU', 'JP', 'GB'].map((country) => (
                <Button
                  key={country}
                  variant={countryFilter === country ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCountryFilter(country)}
                  className="text-xs"
                >
                  {country === 'All' ? 'All Countries' : `${getCountryFlag(country)} ${country}`}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-crypto-primary">{todaysEvents.length}</div>
                <div className="text-crypto-muted text-sm">Today's Events</div>
              </CardContent>
            </Card>
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{highImpactEvents.length}</div>
                <div className="text-crypto-muted text-sm">High Impact</div>
              </CardContent>
            </Card>
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-crypto-accent">{upcomingEvents.length}</div>
                <div className="text-crypto-muted text-sm">This Week</div>
              </CardContent>
            </Card>
            <Card className="bg-crypto-surface border-crypto-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">Live</div>
                <div className="text-crypto-muted text-sm">Market Status</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="today" className="py-2">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="py-2">
              This Week
            </TabsTrigger>
            <TabsTrigger value="impact" className="py-2">
              High Impact
            </TabsTrigger>
            <TabsTrigger value="analysis" className="py-2">
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="space-y-4">
              {todaysEvents.map((event) => (
                <Card key={event.id} className="bg-crypto-surface border-crypto-border hover:border-crypto-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-crypto-text font-bold text-lg">{event.time}</div>
                          <div className="text-crypto-muted text-xs">{getCountryFlag(event.country)} {event.country}</div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-crypto-text font-semibold">{event.event}</h4>
                            <Badge variant="outline" className={getImportanceColor(event.importance)}>
                              {event.importance}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-crypto-muted">Previous: </span>
                              <span className="text-crypto-text font-medium">{event.previous}</span>
                            </div>
                            <div>
                              <span className="text-crypto-muted">Forecast: </span>
                              <span className="text-crypto-text font-medium">{event.forecast}</span>
                            </div>
                            <div>
                              <span className="text-crypto-muted">Actual: </span>
                              <span className={`font-bold ${
                                event.actual 
                                  ? event.actual > event.forecast 
                                    ? 'text-green-400' 
                                    : 'text-red-400'
                                  : 'text-crypto-muted'
                              }`}>
                                {event.actual || 'TBD'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-crypto-primary font-bold">{event.currency}</div>
                        <div className="text-crypto-muted text-xs">{event.category}</div>
                      </div>
                    </div>
                    
                    {event.importance === 'High' && (
                      <div className="mt-3 p-3 bg-crypto-card rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-yellow-400 font-medium text-sm">Market Impact</div>
                            <p className="text-crypto-muted text-xs mt-1">{event.impact}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-6">
            <div className="space-y-6">
              {['2025-01-17', '2025-01-18', '2025-01-19'].map((date) => {
                const dayEvents = filteredEvents.filter(event => event.date === date);
                if (dayEvents.length === 0) return null;
                
                return (
                  <div key={date}>
                    <h3 className="text-lg font-semibold text-crypto-text mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-crypto-primary" />
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    
                    <div className="space-y-3">
                      {dayEvents.map((event) => (
                        <Card key={event.id} className="bg-crypto-surface border-crypto-border">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-crypto-text font-medium text-sm">{event.time}</span>
                                <span className="text-crypto-muted text-xs">{getCountryFlag(event.country)}</span>
                                <span className="text-crypto-text">{event.event}</span>
                                <Badge variant="outline" className={`${getImportanceColor(event.importance)} text-xs`}>
                                  {event.importance}
                                </Badge>
                              </div>
                              <ChevronRight className="w-4 h-4 text-crypto-muted" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="space-y-4">
              {highImpactEvents.map((event) => (
                <Card key={event.id} className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-crypto-text flex items-center gap-2">
                        <Zap className="w-5 h-5 text-red-400" />
                        {event.event}
                      </CardTitle>
                      <Badge variant="outline" className="text-red-400 border-red-400/30">
                        HIGH IMPACT
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-crypto-muted text-sm mb-2">Event Details</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-crypto-muted">Date & Time:</span>
                            <span className="text-crypto-text">{event.date} {event.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-crypto-muted">Country:</span>
                            <span className="text-crypto-text">{getCountryFlag(event.country)} {event.country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-crypto-muted">Currency:</span>
                            <span className="text-crypto-text">{event.currency}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-crypto-muted text-sm mb-2">Market Impact Analysis</div>
                        <p className="text-crypto-text text-sm">{event.impact}</p>
                      </div>
                    </div>
                    
                    {marketImpacts[event.event] && (
                      <div>
                        <div className="text-crypto-muted text-sm mb-3">Potential Asset Impact</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {marketImpacts[event.event].map((impact, index) => (
                            <div key={index} className="p-3 bg-crypto-card rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-crypto-text font-medium text-sm">{impact.asset}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    impact.direction === 'Bullish' 
                                      ? 'text-green-400 border-green-400/30'
                                      : impact.direction === 'Bearish'
                                      ? 'text-red-400 border-red-400/30' 
                                      : 'text-yellow-400 border-yellow-400/30'
                                  }`}
                                >
                                  {impact.direction}
                                </Badge>
                              </div>
                              <p className="text-crypto-muted text-xs">{impact.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-crypto-surface border-crypto-border">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-crypto-primary" />
                    Weekly Market Outlook
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-crypto-accent font-medium">Key Focus: Federal Reserve Policy</div>
                      <p className="text-crypto-muted text-sm">
                        Powell's speech will provide crucial insights into 2025 monetary policy direction
                      </p>
                    </div>
                    <div>
                      <div className="text-crypto-accent font-medium">Consumer Spending Strength</div>
                      <p className="text-crypto-muted text-sm">
                        Retail sales data will indicate holiday spending impact and Q1 consumer trends
                      </p>
                    </div>
                    <div>
                      <div className="text-crypto-accent font-medium">Global Central Bank Week</div>
                      <p className="text-crypto-muted text-sm">
                        BoJ and ECB communications may set tone for global monetary policy coordination
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-crypto-surface border-crypto-border">
                <CardHeader>
                  <CardTitle className="text-crypto-text flex items-center gap-2">
                    <Target className="w-5 h-5 text-crypto-accent" />
                    Trading Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-crypto-card rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-crypto-text font-medium">USD Strength Play</span>
                        <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                          Bullish
                        </Badge>
                      </div>
                      <p className="text-crypto-muted text-sm">
                        Strong retail sales + hawkish Fed could boost USD index
                      </p>
                    </div>
                    <div className="p-3 bg-crypto-card rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-crypto-text font-medium">Tech Stock Volatility</span>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 text-xs">
                          Watch
                        </Badge>
                      </div>
                      <p className="text-crypto-muted text-sm">
                        Powell's comments on rates could impact growth stocks significantly
                      </p>
                    </div>
                    <div className="p-3 bg-crypto-card rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-crypto-text font-medium">JPY Pairs</span>
                        <Badge variant="outline" className="text-red-400 border-red-400/30 text-xs">
                          Bearish
                        </Badge>
                      </div>
                      <p className="text-crypto-muted text-sm">
                        BoJ likely to maintain ultra-low rates, pressuring JPY
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Alerts */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-crypto-text flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Active Market Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-yellow-400 font-medium text-sm">High Volatility Expected</div>
                      <p className="text-crypto-muted text-sm">
                        Fed Chair Powell speech at 2:00 PM EST could trigger significant market movements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-blue-400 font-medium text-sm">Retail Sales Release</div>
                      <p className="text-crypto-muted text-sm">
                        8:30 AM EST - Higher than expected numbers could boost consumer stocks
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}