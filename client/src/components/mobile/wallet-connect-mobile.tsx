import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";

export function WalletConnectMobile() {
  const { isConnected, address, balance, chainId, isConnecting, error, connect, disconnect, switchChain } = useWallet();
  const [copySuccess, setCopySuccess] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Card className="bg-crypto-surface border-crypto-border">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-crypto-primary to-crypto-secondary rounded-full flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-crypto-text text-xl">
            Connect Your Wallet
          </CardTitle>
          <p className="text-crypto-muted text-sm">
            Connect your wallet to access DeFi strategies and track your portfolio
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
          
          <Button 
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-crypto-primary hover:bg-crypto-primary/90 h-12"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect MetaMask
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-crypto-muted text-xs mb-3">
              Don't have MetaMask?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-crypto-primary border-crypto-primary"
              onClick={() => window.open('https://metamask.io/', '_blank')}
            >
              Install MetaMask
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Security Features */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-crypto-muted">256-bit encryption</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-crypto-muted">Non-custodial security</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-crypto-muted">Instant access to DeFi</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-crypto-surface border-crypto-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-crypto-text text-lg">
                Wallet Connected
              </CardTitle>
              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                {getChainName(chainId || 1)}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={disconnect}
            className="text-crypto-muted hover:text-red-400"
          >
            Disconnect
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="p-3 bg-crypto-card rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-muted text-xs mb-1">Address</p>
              <p className="text-crypto-text font-mono text-sm">
                {formatAddress(address || '')}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyAddress}
              className="hover:bg-crypto-primary/10"
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="p-3 bg-crypto-card rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-muted text-xs mb-1">ETH Balance</p>
              <p className="text-crypto-text font-semibold text-lg">
                {balance || '0.0000'} ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-crypto-muted text-xs mb-1">USD Value</p>
              <p className="text-crypto-primary font-semibold">
                ${((parseFloat(balance || '0') * 2634.82).toFixed(2))}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center gap-1"
            onClick={() => {/* Add strategy action */}}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Add Strategy</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center gap-1"
            onClick={() => {/* View portfolio action */}}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Portfolio</span>
          </Button>
        </div>

        {/* Network Switching */}
        {chainId !== 1 && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => switchChain(1)}
              className="w-full text-crypto-primary border-crypto-primary"
            >
              Switch to Ethereum Mainnet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}