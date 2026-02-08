import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMarketSentiment } from "@/hooks/use-crypto-prices";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  AlertTriangle,
  History,
  BarChart3,
  RefreshCw,
  Clock,
  Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export function FearGreedIndex() {
  const { data: sentiment, isLoading, refetch } = useMarketSentiment();
  
  // Fetch historical Fear & Greed data for trend analysis
  const { data: historicalData } = useQuery({
    queryKey: ['fear-greed-historical'],
    queryFn: async () => {
      const response = await fetch('https://api.alternative.me/fng/?limit=30');
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      const data = await response.json();
      return data.data.map((item: any) => ({
        value: parseInt(item.value),
        classification: item.value_classification,
        timestamp: new Date(item.timestamp * 1000).toISOString().split('T')[0]
      }));
    },
    refetchInterval: 3600000, // Refetch every hour
    staleTime: 1800000, // Consider data stale after 30 minutes
  });

  const getSentimentEmoji = (value: number) => {
    if (value <= 20) return '😱'; // Extreme Fear
    if (value <= 40) return '😰'; // Fear
    if (value <= 60) return '😐'; // Neutral
    if (value <= 80) return '😊'; // Greed
    return '🤑'; // Extreme Greed
  };

  const getSentimentColor = (value: number) => {
    if (value <= 20) return 'text-red-500';
    if (value <= 40) return 'text-orange-500';
    if (value <= 60) return 'text-yellow-500';
    if (value <= 80) return 'text-crypto-tertiary';
    return 'text-crypto-primary';
  };

  const getSentimentBackground = (value: number) => {
    if (value <= 20) return 'bg-red-500/10 border-red-500/20';
    if (value <= 40) return 'bg-orange-500/10 border-orange-500/20';
    if (value <= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (value <= 80) return 'bg-crypto-tertiary/10 border-crypto-tertiary/20';
    return 'bg-crypto-primary/10 border-crypto-primary/20';
  };

  const getSentimentStrategy = (value: number) => {
    if (value <= 25) return {
      action: "💎 STRONG BUY",
      description: "Extreme fear creates exceptional buying opportunities. Dollar-cost average into quality assets.",
      icon: Target,
      color: "text-crypto-tertiary",
      bgColor: "bg-crypto-tertiary/15"
    };
    if (value <= 50) return {
      action: "📈 ACCUMULATE", 
      description: "Fear levels suggest gradual accumulation. Consider DCA strategy with quality projects.",
      icon: TrendingDown,
      color: "text-crypto-quaternary",
      bgColor: "bg-crypto-quaternary/15"
    };
    if (value <= 75) return {
      action: "⚖️ HOLD POSITION",
      description: "Neutral sentiment. Monitor positions and maintain current strategy.",
      icon: Activity,
      color: "text-crypto-muted",
      bgColor: "bg-crypto-muted/15"
    };
    return {
      action: "💰 TAKE PROFITS",
      description: "Extreme greed signals caution. Consider taking profits and reducing exposure.",
      icon: AlertTriangle,
      color: "text-crypto-quaternary",
      bgColor: "bg-crypto-quaternary/15"
    };
  };

  const getWeeklyTrend = () => {
    if (!historicalData || historicalData.length < 7) return null;
    
    const recent = historicalData.slice(0, 7);
    const current = recent[0].value;
    const weekAgo = recent[6].value;
    const change = current - weekAgo;
    
    return {
      change,
      direction: change > 0 ? 'up' : 'down',
      percentage: Math.abs((change / weekAgo) * 100).toFixed(1)
    };
  };

  const weeklyTrend = getWeeklyTrend();

  if (isLoading) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
            <div className="p-2 bg-crypto-primary/15 rounded-lg animate-pulse">
              <Activity className="w-5 h-5 text-crypto-primary" />
            </div>
            Fear & Greed Index
            <Badge className="badge-warning animate-pulse">Loading</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-8 bg-crypto-surface rounded-2xl border border-crypto-border">
            <div className="animate-pulse space-y-4">
              <div className="w-20 h-20 bg-crypto-border rounded-full mx-auto"></div>
              <div className="w-24 h-8 bg-crypto-border rounded mx-auto"></div>
              <div className="w-32 h-4 bg-crypto-border rounded mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sentiment) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
            <div className="p-2 bg-red-500/15 rounded-lg">
              <Activity className="w-5 h-5 text-red-500" />
            </div>
            Fear & Greed Index
            <Badge className="badge-error">Offline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-crypto-muted mb-4">Unable to load current data</p>
          <Button onClick={() => refetch()} className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const strategy = getSentimentStrategy(sentiment.value);

  return (
    <Card className="crypto-card hover-lift">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
          <div className="p-2 bg-crypto-primary/15 rounded-lg">
            <Activity className="w-5 h-5 text-crypto-primary" />
          </div>
          Live Fear & Greed Index
          <Badge className="badge-success animate-pulse">Live</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Index Display */}
        <div className={`text-center p-8 rounded-2xl border-2 ${getSentimentBackground(sentiment.value)}`}>
          <div className="text-7xl mb-4 animate-bounce-subtle">
            {getSentimentEmoji(sentiment.value)}
          </div>
          <div className={`text-4xl font-black mb-3 ${getSentimentColor(sentiment.value)}`}>
            {sentiment.value}/100
          </div>
          <div className="text-crypto-text font-bold text-lg mb-2">
            {sentiment.classification}
          </div>
          <div className="text-crypto-muted text-sm flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            Last updated: {format(new Date(sentiment.timestamp * 1000), 'MMM dd, HH:mm')}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-red-500 font-medium">Extreme Fear</span>
            <span className="text-crypto-primary font-medium">Extreme Greed</span>
          </div>
          <Progress 
            value={sentiment.value} 
            className="h-3 bg-crypto-surface"
            style={{
              background: `linear-gradient(90deg, 
                #ef4444 0%, 
                #f97316 25%, 
                #eab308 50%, 
                #22c55e 75%, 
                #10b981 100%)`
            }}
          />
          <div className="grid grid-cols-5 text-xs text-crypto-muted">
            <span>0-20</span>
            <span>21-40</span>
            <span>41-60</span>
            <span>61-80</span>
            <span>81-100</span>
          </div>
        </div>

        {/* Strategy Recommendation */}
        <div className={`p-4 rounded-xl border ${strategy.bgColor} border-opacity-50`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${strategy.bgColor} ${strategy.color}`}>
              <strategy.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-bold text-lg mb-1 ${strategy.color}`}>
                {strategy.action}
              </h4>
              <p className="text-crypto-muted text-sm leading-relaxed">
                {strategy.description}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Trend Analysis */}
        {weeklyTrend && (
          <div className="p-4 bg-crypto-surface rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-crypto-text flex items-center gap-2">
                <History className="w-4 h-4" />
                7-Day Trend
              </h4>
              <div className={`flex items-center gap-1 ${
                weeklyTrend.direction === 'up' ? 'text-crypto-tertiary' : 'text-red-400'
              }`}>
                {weeklyTrend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-bold">
                  {weeklyTrend.direction === 'up' ? '+' : ''}{weeklyTrend.change} 
                  ({weeklyTrend.percentage}%)
                </span>
              </div>
            </div>
            <div className="text-crypto-muted text-xs">
              {weeklyTrend.direction === 'up' 
                ? 'Market sentiment improving over the past week'
                : 'Market sentiment declining over the past week'
              }
            </div>
          </div>
        )}

        {/* Historical Mini Chart */}
        {historicalData && historicalData.length > 0 && (
          <div className="p-4 bg-crypto-surface rounded-xl">
            <h4 className="font-semibold text-crypto-text mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              30-Day History
            </h4>
            <div className="flex items-end justify-between h-16 gap-1">
              {historicalData.slice(0, 15).reverse().map((item: Record<string, unknown>, index: number) => (
                <div
                  key={index}
                  className={`w-full rounded-t transition-all hover:opacity-80 ${getSentimentColor(item.value as number).replace('text-', 'bg-')}`}
                  style={{ height: `${((item.value as number) / 100) * 100}%` }}
                  title={`${item.timestamp}: ${item.value} (${item.classification})`}
                />
              ))}
            </div>
            <div className="text-xs text-crypto-muted mt-2 text-center">
              Past 15 days (hover for details)
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => refetch()} 
            className="btn-secondary group"
          >
            <RefreshCw className="w-4 h-4 mr-2 group-hover:animate-spin" />
            Refresh
          </Button>
          <Button className="btn-primary">
            <Info className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </div>

        {/* Educational Note */}
        <div className="text-xs text-crypto-muted p-3 bg-crypto-dark/50 rounded-lg border border-crypto-border/50">
          <strong>About Fear & Greed Index:</strong> This indicator measures market emotions and sentiment. 
          Values below 25 often signal buying opportunities, while values above 75 suggest considering profit-taking. 
          Use as one factor in your investment decisions.
        </div>
      </CardContent>
    </Card>
  );
}