import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ExternalLink } from "lucide-react";
import { mockProtocols } from "@/lib/mock-data";

export default function ProtocolExplorer() {
  const getRiskColor = (risk: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-400 border-green-500/20",
      Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      High: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500/10 text-gray-300";
  };

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

  return (
    <div>
      <Header
        title="Protocol Explorer"
        subtitle="Discover and analyze top DeFi protocols across all chains"
      />

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <Card className="bg-crypto-surface border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
              <Input
                placeholder="Search protocols..."
                className="pl-10 bg-gray-700 border-gray-600 text-gray-900"
              />
            </div>
            <div className="flex gap-4">
              <Select defaultValue="all-chains">
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-chains">All Chains</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-categories">
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="lending">Lending</SelectItem>
                  <SelectItem value="dex">DEX/AMM</SelectItem>
                  <SelectItem value="derivatives">Derivatives</SelectItem>
                  <SelectItem value="yield">Yield Farming</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-risk">
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-risk">All Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="border-gray-600 text-gray-300">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProtocols.map((protocol) => (
            <Card key={protocol.id} className="bg-crypto-surface border-gray-700 p-6 hover:border-crypto-green/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${getIconColor(protocol.color)} rounded-lg flex items-center justify-center`}>
                    <span className="text-gray-900 font-bold text-lg">
                      {protocol.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
                    <p className="text-sm text-gray-300">{protocol.chain}</p>
                  </div>
                </div>
                <Badge className={getRiskColor(protocol.riskLevel)}>
                  {protocol.riskLevel}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Category</span>
                  <span className="text-gray-900 text-sm font-medium">{protocol.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">APR Range</span>
                  <span className="text-gray-900 text-sm font-medium">
                    {protocol.minAPR} - {protocol.maxAPR}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">TVL</span>
                  <span className="text-gray-900 text-sm font-medium">{protocol.tvl}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{protocol.description}</p>

              <div className="flex gap-2">
                <Button className="flex-1 bg-crypto-green text-black hover:bg-green-400">
                  Start Strategy
                </Button>
                <Button variant="outline" size="icon" className="border-gray-600 text-gray-300">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" className="border-gray-600 text-gray-600 hover:text-gray-900">
            Load More Protocols
          </Button>
        </div>
      </div>
    </div>
  );
}
