import { useState, useEffect } from 'react';

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

interface YieldOpportunity {
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
  risk_level: 'low' | 'medium' | 'high';
  chain: string;
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [yields, setYields] = useState<YieldOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mock data for development - replace with real API calls
  const mockPrices: CryptoPrice[] = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 43250.75,
      price_change_percentage_24h: 2.34,
      market_cap: 847000000000,
      total_volume: 18500000000,
      image: '/crypto-icons/btc.svg'
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 2634.82,
      price_change_percentage_24h: 1.87,
      market_cap: 316000000000,
      total_volume: 12300000000,
      image: '/crypto-icons/eth.svg'
    },
    {
      id: 'binancecoin',
      symbol: 'bnb',
      name: 'BNB',
      current_price: 312.45,
      price_change_percentage_24h: -0.45,
      market_cap: 47800000000,
      total_volume: 1200000000,
      image: '/crypto-icons/bnb.svg'
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      current_price: 98.23,
      price_change_percentage_24h: 3.21,
      market_cap: 42100000000,
      total_volume: 2100000000,
      image: '/crypto-icons/sol.svg'
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      current_price: 0.487,
      price_change_percentage_24h: 1.12,
      market_cap: 17200000000,
      total_volume: 340000000,
      image: '/crypto-icons/ada.svg'
    }
  ];

  const mockYields: YieldOpportunity[] = [
    {
      protocol: 'Aave',
      token: 'USDC',
      apy: 4.25,
      tvl: 8900000000,
      risk_level: 'low',
      chain: 'Ethereum'
    },
    {
      protocol: 'Curve',
      token: 'USDT-USDC',
      apy: 6.75,
      tvl: 2400000000,
      risk_level: 'low',
      chain: 'Ethereum'
    },
    {
      protocol: 'Yearn',
      token: 'WETH',
      apy: 12.45,
      tvl: 450000000,
      risk_level: 'medium',
      chain: 'Ethereum'
    },
    {
      protocol: 'PancakeSwap',
      token: 'CAKE-BNB',
      apy: 23.67,
      tvl: 890000000,
      risk_level: 'high',
      chain: 'BSC'
    },
    {
      protocol: 'Raydium',
      token: 'SOL-USDC',
      apy: 18.34,
      tvl: 320000000,
      risk_level: 'medium',
      chain: 'Solana'
    }
  ];

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add some random variation to simulate live prices
      const updatedPrices = mockPrices.map(price => ({
        ...price,
        current_price: price.current_price * (0.98 + Math.random() * 0.04),
        price_change_percentage_24h: price.price_change_percentage_24h + (Math.random() - 0.5) * 2
      }));

      setPrices(updatedPrices);
      setYields(mockYields);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getPriceBySymbol = (symbol: string) => {
    return prices.find(p => p.symbol.toLowerCase() === symbol.toLowerCase());
  };

  const getTopGainers = (limit = 5) => {
    return [...prices]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, limit);
  };

  const getTopLosers = (limit = 5) => {
    return [...prices]
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, limit);
  };

  const getHighestYields = (limit = 5) => {
    return [...yields]
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  };

  return {
    prices,
    yields,
    loading,
    error,
    lastUpdate,
    refresh: fetchPrices,
    getPriceBySymbol,
    getTopGainers,
    getTopLosers,
    getHighestYields,
  };
}