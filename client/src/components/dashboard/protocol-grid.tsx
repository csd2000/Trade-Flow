import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useProtocols } from "@/hooks/use-protocols";
import { DefiProtocol } from "@shared/schema";
import { ProtocolData } from "@/types";

interface ProtocolGridProps {
  protocols?: ProtocolData[]; // Keep for backward compatibility
}

export function ProtocolGrid({ protocols: fallbackProtocols }: ProtocolGridProps) {
  const { data: dbProtocols, isLoading, error } = useProtocols();
  
  // Use database protocols if available, otherwise fall back to props
  const protocols = dbProtocols || fallbackProtocols || [];
  const getIconColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      pink: "bg-pink-500",
      green: "bg-green-500"
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-400",
      Medium: "bg-yellow-500/10 text-yellow-400", 
      High: "bg-red-500/10 text-red-400"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500/10 text-gray-400";
  };

  if (isLoading) {
    return (
      <Card className="bg-crypto-surface border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-crypto-green" />
          <span className="ml-2 text-gray-400">Loading protocols...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-crypto-surface border-gray-700 p-6">
        <div className="text-center py-8">
          <p className="text-red-400">Failed to load protocols</p>
          <p className="text-gray-400 text-sm mt-2">Using cached data</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="crypto-card">
      {/* Header with Mobile-Responsive Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-crypto-primary to-crypto-secondary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Live Protocols</h3>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="input-field min-w-[120px] sm:w-32">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent className="bg-crypto-surface border-crypto-border">
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="link"
            className="text-crypto-primary hover:text-crypto-secondary text-sm font-medium p-0 transition-colors"
          >
            View All
          </Button>
        </div>
      </div>
      
      {/* Protocol Grid - Fully Responsive */}
      <div className="grid mobile-grid-1 tablet-grid-2 desktop-grid-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {protocols.map((protocol, index) => (
          <div
            key={protocol.id}
            className="group crypto-card bg-gradient-to-br from-crypto-card to-crypto-surface border border-crypto-border hover:border-crypto-primary/50 cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Protocol Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-crypto-primary via-crypto-secondary to-crypto-purple rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {protocol.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-white truncate text-sm sm:text-base">
                    {protocol.name}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">{protocol.chain}</p>
                </div>
              </div>
              <Badge className={`${getRiskColor(protocol.riskLevel)} shrink-0 text-xs`}>
                {protocol.riskLevel}
              </Badge>
            </div>

            {/* Protocol Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">APR Range</span>
                <span className="text-crypto-primary font-semibold text-sm">
                  {parseFloat(protocol.minAPR).toFixed(1)}% - {parseFloat(protocol.maxAPR).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">TVL</span>
                <span className="text-crypto-secondary font-semibold text-sm">
                  ${(parseFloat(protocol.tvl) / 1000000000).toFixed(1)}B
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Category</span>
                <span className="text-white text-sm font-medium">
                  {protocol.category}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4 pt-4 border-t border-crypto-border">
              <Button 
                size="sm" 
                className="w-full btn-primary group-hover:scale-105 transition-transform duration-300"
              >
                Explore Protocol
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {protocols.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-crypto-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">₿</span>
          </div>
          <p className="text-gray-400 text-lg mb-2">No protocols found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  );
}
