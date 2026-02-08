import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Shield,
  BarChart3,
  Activity,
  Target
} from "lucide-react";
import { PortfolioData } from "@/types";

interface PortfolioCardsProps {
  data: PortfolioData;
}

export function PortfolioCards({ data }: PortfolioCardsProps) {
  const isPositive = data.dailyChange.startsWith('+');
  const isIncomePositive = data.incomeChange.startsWith('+');
  
  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'Low': return 'badge-success';
      case 'Medium': return 'badge-warning';
      case 'High': return 'badge-error';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Portfolio Value */}
      <Card className="crypto-card hover-lift group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-crypto-muted">
            Total Portfolio Value
          </CardTitle>
          <div className="p-2 bg-crypto-primary rounded-xl bg-opacity-20 group-hover:scale-110 transition-transform">
            <DollarSign className="w-4 h-4 text-crypto-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-crypto-text mb-2">
            {data.totalValue}
          </div>
          <div className="flex items-center text-sm">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1 text-crypto-tertiary" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 text-crypto-error" />
            )}
            <span className={`font-semibold ${isPositive ? 'text-crypto-tertiary' : 'text-crypto-error'}`}>
              {data.dailyChange}
            </span>
            <span className="text-crypto-muted ml-1">24h</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Income */}
      <Card className="crypto-card hover-lift group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-crypto-muted">
            Daily Income
          </CardTitle>
          <div className="p-2 bg-crypto-tertiary rounded-xl bg-opacity-20 group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4 text-crypto-tertiary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-crypto-text mb-2">
            {data.dailyIncome}
          </div>
          <div className="flex items-center text-sm">
            {isIncomePositive ? (
              <TrendingUp className="w-4 h-4 mr-1 text-crypto-tertiary" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 text-crypto-error" />
            )}
            <span className={`font-semibold ${isIncomePositive ? 'text-crypto-tertiary' : 'text-crypto-error'}`}>
              {data.incomeChange}
            </span>
            <span className="text-crypto-muted ml-1">vs yesterday</span>
          </div>
        </CardContent>
      </Card>

      {/* Average APR */}
      <Card className="crypto-card hover-lift group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-crypto-muted">
            Average APR
          </CardTitle>
          <div className="p-2 bg-crypto-quaternary rounded-xl bg-opacity-20 group-hover:scale-110 transition-transform">
            <Percent className="w-4 h-4 text-crypto-quaternary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-crypto-text mb-2">
            {data.avgAPR}
          </div>
          <div className="flex items-center text-sm">
            <BarChart3 className="w-4 h-4 mr-1 text-crypto-quaternary" />
            <span className="text-crypto-muted">Across all protocols</span>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card className="crypto-card hover-lift group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-crypto-muted">
            Risk Level
          </CardTitle>
          <div className="p-2 bg-crypto-secondary rounded-xl bg-opacity-20 group-hover:scale-110 transition-transform">
            <Shield className="w-4 h-4 text-crypto-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 mb-3">
            <Badge className={getRiskBadgeClass(data.riskLevel)}>
              {data.riskLevel}
            </Badge>
            <span className="text-crypto-text font-semibold">Risk</span>
          </div>
          <div className="flex items-center text-sm">
            <Target className="w-4 h-4 mr-1 text-crypto-secondary" />
            <span className="text-crypto-muted">Well diversified</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}