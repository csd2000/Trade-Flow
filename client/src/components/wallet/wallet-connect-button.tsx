import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  Power,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import toast from 'react-hot-toast';

export function WalletConnectButton() {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId, 
    isConnecting, 
    connectMetaMask, 
    connectWalletConnect,
    disconnect 
  } = useWallet();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id?: number) => {
    switch (id) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum';
      case 10: return 'Optimism';
      default: return 'Unknown Chain';
    }
  };

  if (isConnected && address) {
    return (
      <Card className="crypto-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-crypto-primary/15 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-crypto-primary" />
              </div>
              <div>
                <div className="font-semibold text-crypto-text">Wallet Connected</div>
                <div className="text-sm text-crypto-muted">{getChainName(chainId)}</div>
              </div>
            </div>
            <Badge className="badge-success">
              <div className="w-2 h-2 bg-crypto-tertiary rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-crypto-surface rounded-lg">
              <span className="text-crypto-muted text-sm">Address</span>
              <div className="flex items-center space-x-2">
                <span className="text-crypto-text font-mono text-sm">
                  {formatAddress(address)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {balance && (
              <div className="flex items-center justify-between p-3 bg-crypto-surface rounded-lg">
                <span className="text-crypto-muted text-sm">Balance</span>
                <span className="text-crypto-text font-semibold">
                  {parseFloat(balance).toFixed(4)} ETH
                </span>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Explorer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={disconnect}
                className="flex-1 text-red-400 hover:text-red-300"
              >
                <Power className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-crypto-primary/15 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-crypto-primary" />
          </div>
          <h3 className="text-xl font-bold text-crypto-text mb-2">Connect Wallet</h3>
          <p className="text-crypto-muted">
            Connect your wallet to access live portfolio tracking and DeFi strategies
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="btn-primary w-full h-12"
          >
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <span>MetaMask</span>
              </div>
            )}
          </Button>

          <Button
            onClick={connectWalletConnect}
            disabled={isConnecting}
            className="btn-secondary w-full h-12"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">W</span>
              </div>
              <span>WalletConnect</span>
            </div>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-crypto-surface/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-crypto-quaternary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-crypto-muted">
              Your wallet enables live portfolio tracking, yield optimization, and secure DeFi strategy execution.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}