import { useQuery } from '@tanstack/react-query';

interface CryptoPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image: string;
}

interface YieldData {
  protocol: string;
  symbol: string;
  apy: number;
  tvl: number;
  risk_level: 'low' | 'medium' | 'high';
  chain: string;
}

// CoinGecko API for live prices
export function useCryptoPrices(symbols: string[] = ['bitcoin', 'ethereum', 'polygon-matic', 'chainlink']) {
  return useQuery({
    queryKey: ['crypto-prices', symbols],
    queryFn: async (): Promise<CryptoPriceData[]> => {
      const symbolsString = symbols.join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbolsString}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

// DeFiLlama API for yield data
export function useYieldData() {
  return useQuery({
    queryKey: ['yield-data'],
    queryFn: async (): Promise<YieldData[]> => {
      const response = await fetch('https://yields.llama.fi/pools');
      
      if (!response.ok) {
        throw new Error('Failed to fetch yield data');
      }
      
      const data = await response.json();
      
      // Filter and transform the data for major protocols
      return data.data
        .filter((pool: any) => 
          ['Uniswap V3', 'Aave', 'Compound', 'Curve', 'Yearn'].includes(pool.project) &&
          pool.tvlUsd > 1000000 // Only pools with >$1M TVL
        )
        .slice(0, 20) // Top 20 pools
        .map((pool: any) => ({
          protocol: pool.project,
          symbol: pool.symbol,
          apy: pool.apy || 0,
          tvl: pool.tvlUsd || 0,
          risk_level: pool.ilRisk ? 'high' : pool.apy > 20 ? 'medium' : 'low',
          chain: pool.chain,
        }));
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  });
}

// Fear & Greed Index
export function useMarketSentiment() {
  return useQuery({
    queryKey: ['market-sentiment'],
    queryFn: async () => {
      const response = await fetch('https://api.alternative.me/fng/?limit=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch market sentiment');
      }
      
      const data = await response.json();
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
        timestamp: data.data[0].timestamp,
      };
    },
    refetchInterval: 3600000, // Refetch every hour
    staleTime: 1800000, // Consider data stale after 30 minutes
  });
}

// Portfolio value calculator
export function usePortfolioValue(holdings: Array<{symbol: string, amount: number}>) {
  const { data: prices, isLoading } = useCryptoPrices(
    holdings.map(h => h.symbol.toLowerCase())
  );
  
  if (isLoading || !prices) {
    return { totalValue: 0, isLoading: true };
  }
  
  const totalValue = holdings.reduce((total, holding) => {
    const price = prices.find(p => p.symbol.toLowerCase() === holding.symbol.toLowerCase());
    return total + (price ? price.current_price * holding.amount : 0);
  }, 0);
  
  return { totalValue, isLoading: false };
}