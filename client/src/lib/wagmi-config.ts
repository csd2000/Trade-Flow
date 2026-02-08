import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = 'your_walletconnect_project_id'; // User will need to provide this

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism],
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'CryptoFlow Pro',
        description: 'Professional DeFi Strategy & Portfolio Management',
        url: 'https://cryptoflow.pro',
        icons: ['https://cryptoflow.pro/icon.png']
      }
    }),
    coinbaseWallet({
      appName: 'CryptoFlow Pro',
      appLogoUrl: 'https://cryptoflow.pro/icon.png'
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});