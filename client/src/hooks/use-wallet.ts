import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import toast from 'react-hot-toast';

interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
  isConnecting: boolean;
  error?: string;
}

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
  });

  useEffect(() => {
    setWalletState({
      isConnected,
      address: address,
      balance: balance?.formatted,
      chainId,
      isConnecting: isPending,
    });
  }, [isConnected, address, balance, chainId, isPending]);

  const connectMetaMask = async () => {
    try {
      const metaMaskConnector = connectors.find(
        (connector) => connector.id === 'injected'
      );
      if (metaMaskConnector) {
        connect({ connector: metaMaskConnector });
        toast.success('Connecting to MetaMask...');
      } else {
        toast.error('MetaMask not found. Please install MetaMask.');
      }
    } catch (error) {
      toast.error('Failed to connect MetaMask');
      console.error('MetaMask connection error:', error);
    }
  };

  const connectWalletConnect = async () => {
    try {
      const walletConnectConnector = connectors.find(
        (connector) => connector.id === 'walletConnect'
      );
      if (walletConnectConnector) {
        connect({ connector: walletConnectConnector });
        toast.success('Connecting with WalletConnect...');
      } else {
        toast.error('WalletConnect not available');
      }
    } catch (error) {
      toast.error('Failed to connect with WalletConnect');
      console.error('WalletConnect connection error:', error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const switchToMainnet = async () => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
    } catch (error) {
      console.error('Failed to switch to mainnet:', error);
    }
  };

  return {
    ...walletState,
    connectMetaMask,
    connectWalletConnect,
    disconnect: disconnectWallet,
    switchToMainnet,
    connectors,
  };
}