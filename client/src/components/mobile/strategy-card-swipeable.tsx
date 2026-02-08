import { SwipeableCard } from "@/components/ui/swipeable-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share, 
  DollarSign, 
  Clock, 
  Shield,
  Zap 
} from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  category: string;
  apy: string;
  risk: 'Low' | 'Medium' | 'High';
  protocols: string[];
  description: string;
  tvl: string;
  timeCommitment: string;
}

interface StrategyCardSwipeableProps {
  strategy: Strategy;
  onView: (id: string) => void;
  onFavorite: (id: string) => void;
  onShare: (id: string) => void;
  isFavorited?: boolean;
}

export function StrategyCardSwipeable({ 
  strategy, 
  onView, 
  onFavorite, 
  onShare,
  isFavorited = false 
}: StrategyCardSwipeableProps) {
  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-400 border-green-500/30",
      Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      High: "bg-red-500/10 text-red-400 border-red-500/30"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500/10 text-gray-400";
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <Shield className="w-4 h-4" />;
      case 'Medium':
        return <TrendingUp className="w-4 h-4" />;
      case 'High':
        return <Zap className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <SwipeableCard
      leftAction={{
        icon: <Heart className="w-5 h-5" />,
        label: isFavorited ? "Remove" : "Favorite",
        action: () => onFavorite(strategy.id),
        color: isFavorited ? "#ef4444" : "#10b981"
      }}
      rightAction={{
        icon: <Share className="w-5 h-5" />,
        label: "Share",
        action: () => onShare(strategy.id),
        color: "#3b82f6"
      }}
      className="bg-crypto-surface border-crypto-border hover:border-crypto-primary transition-all duration-300"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-crypto-text text-lg mb-1">
              {strategy.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {strategy.category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-crypto-primary">
              {strategy.apy}
            </div>
            <div className="text-xs text-crypto-muted">APY</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-crypto-muted text-sm line-clamp-2">
          {strategy.description}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-crypto-card rounded-lg">
            <div className="flex items-center justify-center mb-1">
              {getRiskIcon(strategy.risk)}
            </div>
            <div className="text-xs text-crypto-muted">Risk</div>
            <Badge variant="outline" className={`text-xs mt-1 ${getRiskColor(strategy.risk)}`}>
              {strategy.risk}
            </Badge>
          </div>
          <div className="text-center p-2 bg-crypto-card rounded-lg">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-crypto-primary" />
            <div className="text-xs text-crypto-muted">TVL</div>
            <div className="text-sm font-semibold text-crypto-text">{strategy.tvl}</div>
          </div>
          <div className="text-center p-2 bg-crypto-card rounded-lg">
            <Clock className="w-4 h-4 mx-auto mb-1 text-crypto-accent" />
            <div className="text-xs text-crypto-muted">Time</div>
            <div className="text-sm font-semibold text-crypto-text">{strategy.timeCommitment}</div>
          </div>
        </div>

        {/* Protocols */}
        <div>
          <div className="text-xs text-crypto-muted mb-2">Top Protocols:</div>
          <div className="flex flex-wrap gap-1">
            {strategy.protocols.slice(0, 3).map((protocol, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {protocol}
              </Badge>
            ))}
            {strategy.protocols.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{strategy.protocols.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => onView(strategy.id)}
            className="flex-1 bg-crypto-primary hover:bg-crypto-primary/90 h-9"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            onClick={() => onFavorite(strategy.id)}
            className="px-3 h-9"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-400 text-red-400' : ''}`} />
          </Button>
        </div>

        {/* Swipe Instructions */}
        <div className="text-center">
          <div className="text-xs text-crypto-muted opacity-60">
            ← Swipe for actions →
          </div>
        </div>
      </CardContent>
    </SwipeableCard>
  );
}