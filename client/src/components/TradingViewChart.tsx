import { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
  width?: string;
  autosize?: boolean;
  hideTopToolbar?: boolean;
  hideSideToolbar?: boolean;
  allowSymbolChange?: boolean;
}

const TradingViewChart = memo(function TradingViewChart({
  symbol,
  interval = '15',
  theme = 'dark',
  height = 400,
  width = '100%',
  autosize = true,
  hideTopToolbar = false,
  hideSideToolbar = true,
  allowSymbolChange = true
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
    containerRef.current.id = containerId;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          autosize: autosize,
          symbol: symbol,
          interval: interval,
          timezone: 'America/New_York',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#1e293b',
          enable_publishing: false,
          allow_symbol_change: allowSymbolChange,
          hide_top_toolbar: hideTopToolbar,
          hide_side_toolbar: hideSideToolbar,
          container_id: containerId,
          save_image: false,
          studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, autosize, hideTopToolbar, hideSideToolbar, allowSymbolChange]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height: autosize ? '100%' : height, 
        width: width,
        minHeight: height
      }} 
      className="tradingview-widget-container"
    />
  );
});

export default TradingViewChart;
