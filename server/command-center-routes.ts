import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

interface WhaleTransaction {
  id: string;
  timestamp: string;
  amount: number;
  symbol: string;
  from: string;
  to: string;
  type: 'exchange_inflow' | 'exchange_outflow' | 'wallet_transfer';
  usdValue: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  keywords: string[];
}

const EXCHANGE_ADDRESSES = [
  'binance', 'coinbase', 'kraken', 'ftx', 'okex', 'huobi', 'kucoin', 'bitfinex'
];

const HIGH_IMPACT_KEYWORDS = ['SEC', 'Fed', 'FOMC', 'Hack', 'ETF', 'Rate', 'Inflation', 'CPI', 'NFP', 'Regulation', 'Ban', 'Approval'];

async function fetchWhaleAlerts(): Promise<WhaleTransaction[]> {
  const apiKey = process.env.WHALE_ALERT_API_KEY;
  
  if (!apiKey) {
    console.log('No WHALE_ALERT_API_KEY configured, using simulated data');
    return generateSimulatedWhaleData();
  }

  try {
    const minValue = 10000000;
    const url = `https://api.whale-alert.io/v1/transactions?api_key=${apiKey}&min_value=${minValue}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.result === 'error') {
      console.error('Whale Alert API error:', data.message);
      return generateSimulatedWhaleData();
    }

    return (data.transactions || []).map((tx: any) => ({
      id: tx.id || tx.hash,
      timestamp: new Date(tx.timestamp * 1000).toISOString(),
      amount: tx.amount,
      symbol: tx.symbol?.toUpperCase() || 'BTC',
      from: tx.from?.owner || 'unknown',
      to: tx.to?.owner || 'unknown',
      type: determineTransactionType(tx.from?.owner, tx.to?.owner),
      usdValue: tx.amount_usd || tx.amount * 50000
    }));
  } catch (error) {
    console.error('Failed to fetch whale alerts:', error);
    return generateSimulatedWhaleData();
  }
}

function determineTransactionType(from: string, to: string): 'exchange_inflow' | 'exchange_outflow' | 'wallet_transfer' {
  const fromIsExchange = EXCHANGE_ADDRESSES.some(ex => from?.toLowerCase().includes(ex));
  const toIsExchange = EXCHANGE_ADDRESSES.some(ex => to?.toLowerCase().includes(ex));

  if (!fromIsExchange && toIsExchange) return 'exchange_inflow';
  if (fromIsExchange && !toIsExchange) return 'exchange_outflow';
  return 'wallet_transfer';
}

function generateSimulatedWhaleData(): WhaleTransaction[] {
  const symbols = ['BTC', 'ETH', 'USDT', 'USDC', 'XRP'];
  const types: ('exchange_inflow' | 'exchange_outflow' | 'wallet_transfer')[] = ['exchange_inflow', 'exchange_outflow', 'wallet_transfer'];
  
  return Array.from({ length: 5 }, (_, i) => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const baseAmount = 10000000 + Math.random() * 90000000;
    
    return {
      id: `sim-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      amount: symbol === 'BTC' ? baseAmount / 50000 : symbol === 'ETH' ? baseAmount / 2500 : baseAmount,
      symbol,
      from: type === 'exchange_outflow' ? 'binance' : 'unknown_wallet',
      to: type === 'exchange_inflow' ? 'coinbase' : 'unknown_wallet',
      type,
      usdValue: baseAmount
    };
  });
}

async function fetchCryptoNews(): Promise<NewsItem[]> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  
  if (!apiKey) {
    console.log('No CRYPTOPANIC_API_KEY configured, using simulated news');
    return generateSimulatedNews();
  }

  try {
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&filter=important&public=true`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      return generateSimulatedNews();
    }

    return data.results.slice(0, 10).map((item: any) => {
      const matchedKeywords = HIGH_IMPACT_KEYWORDS.filter(kw => 
        item.title?.toLowerCase().includes(kw.toLowerCase())
      );

      return {
        id: item.id?.toString() || `news-${Date.now()}`,
        title: item.title,
        source: item.source?.title || 'Unknown',
        timestamp: item.published_at || new Date().toISOString(),
        sentiment: item.votes?.positive > item.votes?.negative ? 'positive' : 
                   item.votes?.negative > item.votes?.positive ? 'negative' : 'neutral',
        impact: matchedKeywords.length > 0 ? 'high' : 'medium',
        keywords: matchedKeywords
      };
    });
  } catch (error) {
    console.error('Failed to fetch crypto news:', error);
    return generateSimulatedNews();
  }
}

function generateSimulatedNews(): NewsItem[] {
  const headlines = [
    { title: 'SEC Delays Decision on Bitcoin ETF Application', keywords: ['SEC', 'ETF'], sentiment: 'negative' as const },
    { title: 'Fed Signals Potential Rate Pause in Coming Months', keywords: ['Fed', 'Rate'], sentiment: 'positive' as const },
    { title: 'Major Exchange Reports Security Breach', keywords: ['Hack'], sentiment: 'negative' as const },
    { title: 'Institutional Investors Increase Crypto Allocations', keywords: [], sentiment: 'positive' as const },
    { title: 'New Regulations Proposed for DeFi Protocols', keywords: ['Regulation'], sentiment: 'neutral' as const },
  ];

  return headlines.map((h, i) => ({
    id: `sim-news-${i}`,
    title: h.title,
    source: ['Bloomberg', 'Reuters', 'CoinDesk', 'The Block'][Math.floor(Math.random() * 4)],
    timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
    sentiment: h.sentiment,
    impact: h.keywords.length > 0 ? 'high' as const : 'medium' as const,
    keywords: h.keywords
  }));
}

async function generateAIAnalysis(whales: WhaleTransaction[], news: NewsItem[]): Promise<any> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicKey) {
    return generateFallbackAnalysis(whales, news);
  }

  try {
    const client = new Anthropic({ apiKey: anthropicKey });
    
    const whalesSummary = whales.slice(0, 5).map(w => 
      `${w.symbol}: $${(w.usdValue / 1e6).toFixed(1)}M ${w.type.replace('_', ' ')}`
    ).join('; ');

    const newsSummary = news.slice(0, 5).map(n => 
      `[${n.sentiment}] ${n.title}`
    ).join('; ');

    const prompt = `You are a Lead Alpha Analyst for a trading desk. Analyze this last hour of market data and provide actionable intelligence.

WHALE ACTIVITY:
${whalesSummary || 'No significant whale activity detected'}

BREAKING NEWS:
${newsSummary || 'No major news events'}

Provide your analysis in this EXACT JSON format:
{
  "summary": "2-3 sentence market assessment",
  "volatilityScore": 1-10 number,
  "marketBias": "bullish" or "bearish" or "neutral",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "riskLevel": "low" or "medium" or "high" or "extreme"
}

Be concise and actionable. Focus on what traders need to know RIGHT NOW.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return generateFallbackAnalysis(whales, news);
  } catch (error) {
    console.error('AI analysis failed:', error);
    return generateFallbackAnalysis(whales, news);
  }
}

function generateFallbackAnalysis(whales: WhaleTransaction[], news: NewsItem[]): any {
  const inflowCount = whales.filter(w => w.type === 'exchange_inflow').length;
  const outflowCount = whales.filter(w => w.type === 'exchange_outflow').length;
  const negativeNews = news.filter(n => n.sentiment === 'negative').length;
  const positiveNews = news.filter(n => n.sentiment === 'positive').length;

  const bias = outflowCount > inflowCount && positiveNews >= negativeNews ? 'bullish' :
               inflowCount > outflowCount && negativeNews > positiveNews ? 'bearish' : 'neutral';
  
  const volatilityScore = Math.min(10, Math.max(1, 
    3 + whales.length + news.filter(n => n.impact === 'high').length
  ));

  const riskLevel = volatilityScore <= 3 ? 'low' :
                    volatilityScore <= 5 ? 'medium' :
                    volatilityScore <= 7 ? 'high' : 'extreme';

  return {
    summary: `Market showing ${bias} signals with ${whales.length} whale moves detected. ${negativeNews > positiveNews ? 'Negative news sentiment predominates.' : positiveNews > negativeNews ? 'Positive news flow supporting price.' : 'Mixed news sentiment.'}`,
    volatilityScore,
    marketBias: bias,
    keyInsights: [
      `${whales.length} whale transactions in the last hour`,
      `Exchange ${inflowCount > outflowCount ? 'inflows exceed outflows (sell pressure)' : 'outflows exceed inflows (accumulation)'}`,
      `${news.filter(n => n.impact === 'high').length} high-impact news events active`
    ],
    riskLevel,
    timestamp: new Date().toISOString()
  };
}

router.get('/whales', async (req: Request, res: Response) => {
  try {
    const transactions = await fetchWhaleAlerts();
    res.json({ transactions });
  } catch (error) {
    console.error('Whale endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch whale data' });
  }
});

router.get('/news', async (req: Request, res: Response) => {
  try {
    const news = await fetchCryptoNews();
    res.json({ news });
  } catch (error) {
    console.error('News endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.get('/ai-analysis', async (req: Request, res: Response) => {
  try {
    const [whales, news] = await Promise.all([
      fetchWhaleAlerts(),
      fetchCryptoNews()
    ]);
    
    const analysis = await generateAIAnalysis(whales, news);
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

export default router;
