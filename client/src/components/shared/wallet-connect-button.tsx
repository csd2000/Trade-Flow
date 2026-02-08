import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WalletConnectButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  if (isConnected) {
    return (
      <Button
        variant="outline"
        className="bg-crypto-tertiary/10 border-crypto-tertiary/30 text-crypto-tertiary hover:bg-crypto-tertiary/20 font-semibold"
      >
        <Check className="w-4 h-4 mr-2" />
        Connected
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn(
        "btn-primary font-semibold",
        isConnecting && "opacity-75 cursor-not-allowed"
      )}
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          <span>Connect Wallet</span>
        </>
      )}
    </Button>
  );
}