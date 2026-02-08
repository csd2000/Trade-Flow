import { useState, useEffect, useCallback, useRef } from 'react';

interface LivePrice {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

interface LivePricesState {
  prices: Record<string, LivePrice>;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;
  source: string;
}

export function useLivePrices(symbols: string[], refreshInterval = 2000) {
  const [state, setState] = useState<LivePricesState>({
    prices: {},
    isLoading: true,
    error: null,
    lastUpdate: null,
    source: ''
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;
    
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    
    try {
      const response = await fetch(`/api/scalping/live-prices?symbols=${symbols.join(',')}`, {
        signal: abortRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch live prices');
      }
      
      const data = await response.json();
      
      setState({
        prices: data.prices || {},
        isLoading: false,
        error: null,
        lastUpdate: data.timestamp || Date.now(),
        source: data.source || 'Unknown'
      });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch prices'
      }));
    }
  }, [symbols]);

  useEffect(() => {
    fetchPrices();
    
    intervalRef.current = setInterval(fetchPrices, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      abortRef.current?.abort();
    };
  }, [fetchPrices, refreshInterval]);

  const getPrice = useCallback((symbol: string): LivePrice | null => {
    return state.prices[symbol] || null;
  }, [state.prices]);

  const refresh = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    ...state,
    getPrice,
    refresh
  };
}

export function useLiveQuote(symbol: string, refreshInterval = 2000) {
  const [quote, setQuote] = useState<{
    price: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    change: number;
    changePercent: number;
    timestamp: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    let intervalId: NodeJS.Timeout;
    const abortController = new AbortController();

    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/scalping/live-quote/${symbol}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch quote');
        
        const data = await response.json();
        setQuote({
          price: data.price,
          open: data.open,
          high: data.high,
          low: data.low,
          previousClose: data.previousClose,
          change: data.change,
          changePercent: data.changePercent,
          timestamp: data.timestamp
        });
        setIsLoading(false);
        setError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchQuote();
    intervalId = setInterval(fetchQuote, refreshInterval);

    return () => {
      clearInterval(intervalId);
      abortController.abort();
    };
  }, [symbol, refreshInterval]);

  return { quote, isLoading, error };
}
