import Anthropic from '@anthropic-ai/sdk';

interface FuturesNewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  impact: 'high' | 'medium' | 'low';
  relevance: number;
  keywords: string[];
  contract: 'GC' | 'SI' | 'BOTH';
}

interface SentimentAnalysis {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  summary: string;
  keyFactors: string[];
  tradingImplication: string;
}

interface NewsCache {
  items: FuturesNewsItem[];
  analysis: SentimentAnalysis | null;
  timestamp: number;
}

const GOLD_KEYWORDS = ['gold', 'xau', 'bullion', 'precious metal', 'comex gold', 'gold futures', 'gold price'];
const SILVER_KEYWORDS = ['silver', 'xag', 'silver futures', 'silver price', 'comex silver'];
const MACRO_KEYWORDS = ['fed', 'federal reserve', 'interest rate', 'inflation', 'cpi', 'dollar', 'usd', 'treasury', 'yields', 'fomc', 'powell', 'monetary policy', 'debt', 'recession'];

const newsCache: Map<string, NewsCache> = new Map();
const CACHE_TTL = 5 * 60 * 1000;

class NewsServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NewsServiceError';
  }
}

async function fetchFinnhubNews(symbol?: string): Promise<any[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.warn('FINNHUB_API_KEY not configured, trying Polygon...');
    return [];
  }

  try {
    const now = new Date();
    const from = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // Last 3 days for freshness
    let url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
    
    if (symbol) {
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${now.toISOString().split('T')[0]}&token=${apiKey}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Finnhub news API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    // Filter to only include news from the last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return (data || []).filter((item: any) => {
      const newsDate = item.datetime ? item.datetime * 1000 : Date.now();
      return newsDate >= sevenDaysAgo;
    }).map((item: any) => ({
      id: item.id?.toString() || `finnhub-${Date.now()}-${Math.random()}`,
      title: item.headline,
      description: item.summary || '',
      publisher: { name: item.source },
      published_utc: new Date(item.datetime * 1000).toISOString(),
      article_url: item.url
    }));
  } catch (error) {
    console.error('Finnhub news fetch error:', error);
    return [];
  }
}

async function fetchPolygonNews(ticker: string): Promise<any[]> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    console.warn('POLYGON_API_KEY not configured');
    return [];
  }

  try {
    const url = `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=20&order=desc&apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('Invalid Polygon.io API key');
        return [];
      }
      if (response.status === 429) {
        console.error('Polygon.io rate limit exceeded');
        return [];
      }
      return [];
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    // Filter to only include news from the last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return results.filter((item: any) => {
      const newsDate = item.published_utc ? new Date(item.published_utc).getTime() : Date.now();
      return newsDate >= sevenDaysAgo;
    });
  } catch (error) {
    console.error('Polygon news fetch error:', error);
    return [];
  }
}

async function fetchGeneralFinanceNews(): Promise<any[]> {
  // Try Finnhub first for fresher news
  const finnhubNews = await fetchFinnhubNews();
  if (finnhubNews.length > 0) {
    return finnhubNews;
  }
  
  // Fall back to Polygon
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    console.warn('POLYGON_API_KEY not configured');
    return [];
  }

  try {
    const url = `https://api.polygon.io/v2/reference/news?limit=10&order=desc&apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    // Filter to only recent news (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return results.filter((item: any) => {
      const newsDate = item.published_utc ? new Date(item.published_utc).getTime() : Date.now();
      return newsDate >= sevenDaysAgo;
    });
  } catch (error) {
    console.error('General news fetch error:', error);
    return [];
  }
}

function isRelevantToFutures(newsItem: any): { relevant: boolean; contract: 'GC' | 'SI' | 'BOTH'; score: number } {
  const text = `${newsItem.title || ''} ${newsItem.description || ''}`.toLowerCase();
  
  const goldMatch = GOLD_KEYWORDS.some(kw => text.includes(kw));
  const silverMatch = SILVER_KEYWORDS.some(kw => text.includes(kw));
  const macroMatch = MACRO_KEYWORDS.some(kw => text.includes(kw));
  
  let score = 0;
  if (goldMatch) score += 40;
  if (silverMatch) score += 40;
  if (macroMatch) score += 20;
  
  if (goldMatch && silverMatch) {
    return { relevant: true, contract: 'BOTH', score };
  } else if (goldMatch) {
    return { relevant: true, contract: 'GC', score };
  } else if (silverMatch) {
    return { relevant: true, contract: 'SI', score };
  } else if (macroMatch) {
    return { relevant: true, contract: 'BOTH', score };
  }
  
  return { relevant: false, contract: 'BOTH', score: 0 };
}

function determineImpact(newsItem: any): 'high' | 'medium' | 'low' {
  const text = `${newsItem.title || ''} ${newsItem.description || ''}`.toLowerCase();
  const highImpactWords = ['fed', 'fomc', 'rate decision', 'inflation data', 'cpi', 'jobs report', 'crisis', 'crash', 'surge', 'plunge', 'record'];
  const mediumImpactWords = ['forecast', 'outlook', 'analysis', 'report', 'data', 'update'];
  
  if (highImpactWords.some(w => text.includes(w))) return 'high';
  if (mediumImpactWords.some(w => text.includes(w))) return 'medium';
  return 'low';
}

function extractKeywords(newsItem: any): string[] {
  const text = `${newsItem.title || ''} ${newsItem.description || ''}`.toLowerCase();
  const allKeywords = [...GOLD_KEYWORDS, ...SILVER_KEYWORDS, ...MACRO_KEYWORDS];
  return allKeywords.filter(kw => text.includes(kw)).slice(0, 5);
}

async function analyzeSentimentWithAI(newsItems: FuturesNewsItem[], contract: string): Promise<SentimentAnalysis> {
  const anthropic = new Anthropic();
  
  const newsContext = newsItems.slice(0, 10).map(item => 
    `- ${item.title} (${item.source}, ${item.impact} impact)`
  ).join('\n');
  
  const contractName = contract === 'GC' ? 'Gold' : contract === 'SI' ? 'Silver' : 'Gold & Silver';
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analyze the following recent news headlines for ${contractName} futures trading sentiment. Provide a JSON response with:
- overall: "bullish", "bearish", or "neutral"
- score: number from -100 (very bearish) to +100 (very bullish)
- confidence: number from 0 to 100
- summary: one sentence summary of market sentiment
- keyFactors: array of 3 key factors driving sentiment
- tradingImplication: one sentence trading recommendation

News headlines:
${newsContext}

Respond with valid JSON only, no markdown.`
      }]
    });

    const responseText = (message.content[0] as any).text;
    const analysis = JSON.parse(responseText);
    
    return {
      overall: analysis.overall || 'neutral',
      score: analysis.score || 0,
      confidence: analysis.confidence || 50,
      summary: analysis.summary || 'Insufficient data for analysis',
      keyFactors: analysis.keyFactors || [],
      tradingImplication: analysis.tradingImplication || 'Monitor market conditions'
    };
  } catch (error) {
    console.error('AI sentiment analysis failed:', error);
    return {
      overall: 'neutral',
      score: 0,
      confidence: 30,
      summary: 'Unable to analyze sentiment at this time',
      keyFactors: ['Data processing error'],
      tradingImplication: 'Exercise caution, await clearer signals'
    };
  }
}

function quickSentimentAnalysis(title: string): { sentiment: 'bullish' | 'bearish' | 'neutral'; score: number } {
  const text = title.toLowerCase();
  
  const bullishWords = ['surge', 'rally', 'gain', 'rise', 'high', 'bullish', 'buy', 'up', 'positive', 'growth', 'safe haven', 'demand'];
  const bearishWords = ['fall', 'drop', 'decline', 'low', 'bearish', 'sell', 'down', 'negative', 'crash', 'plunge', 'weak'];
  
  let score = 0;
  bullishWords.forEach(word => { if (text.includes(word)) score += 15; });
  bearishWords.forEach(word => { if (text.includes(word)) score -= 15; });
  
  score = Math.max(-100, Math.min(100, score));
  
  if (score > 20) return { sentiment: 'bullish', score };
  if (score < -20) return { sentiment: 'bearish', score };
  return { sentiment: 'neutral', score };
}

export async function getFuturesNews(contract?: 'GC' | 'SI'): Promise<{ news: FuturesNewsItem[]; analysis: SentimentAnalysis | null; error?: string }> {
  const cacheKey = contract || 'ALL';
  const cached = newsCache.get(cacheKey);
  
  // Shorter cache TTL for fresher news (2 minutes)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { news: cached.items, analysis: cached.analysis };
  }
  
  let rawNews: any[] = [];
  
  try {
    // Try Finnhub first for the freshest news
    const finnhubGeneral = await fetchFinnhubNews();
    if (finnhubGeneral.length > 0) {
      rawNews = finnhubGeneral;
    }
    
    // Supplement with Polygon ticker-specific news
    if (contract === 'GC') {
      const polygonNews = await fetchPolygonNews('GLD');
      rawNews = [...rawNews, ...polygonNews];
    } else if (contract === 'SI') {
      const polygonNews = await fetchPolygonNews('SLV');
      rawNews = [...rawNews, ...polygonNews];
    } else {
      const [goldNews, silverNews] = await Promise.all([
        fetchPolygonNews('GLD'),
        fetchPolygonNews('SLV')
      ]);
      rawNews = [...rawNews, ...goldNews, ...silverNews];
    }
    
    // If still low on news, get general finance news
    if (rawNews.length < 5) {
      const generalNews = await fetchGeneralFinanceNews();
      rawNews = [...rawNews, ...generalNews];
    }
  } catch (error) {
    console.error('News fetch error:', error);
    // Return empty rather than throwing to avoid breaking the UI
    return { news: [], analysis: null, error: 'Unable to fetch latest news' };
  }
  
  const uniqueNews = Array.from(new Map(rawNews.map(item => [item.id, item])).values());
  
  const processedNews: FuturesNewsItem[] = uniqueNews
    .map(item => {
      const relevance = isRelevantToFutures(item);
      if (!relevance.relevant && !contract) return null;
      
      const { sentiment, score } = quickSentimentAnalysis(item.title || '');
      
      return {
        id: item.id || `news-${Date.now()}-${Math.random()}`,
        title: item.title || 'Untitled',
        description: item.description || '',
        source: item.publisher?.name || item.author || 'Unknown',
        publishedAt: item.published_utc || new Date().toISOString(),
        url: item.article_url || '#',
        sentiment,
        sentimentScore: score,
        impact: determineImpact(item),
        relevance: relevance.score,
        keywords: extractKeywords(item),
        contract: contract || relevance.contract
      };
    })
    .filter((item): item is FuturesNewsItem => item !== null)
    .sort((a, b) => {
      if (a.impact === 'high' && b.impact !== 'high') return -1;
      if (b.impact === 'high' && a.impact !== 'high') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 20);

  let analysis: SentimentAnalysis | null = null;
  if (processedNews.length >= 3) {
    analysis = await analyzeSentimentWithAI(processedNews, contract || 'BOTH');
  }
  
  newsCache.set(cacheKey, {
    items: processedNews,
    analysis,
    timestamp: Date.now()
  });
  
  return { news: processedNews, analysis };
}

export async function getNewsSentimentSummary(contract: 'GC' | 'SI'): Promise<SentimentAnalysis> {
  const { analysis } = await getFuturesNews(contract);
  return analysis || {
    overall: 'neutral',
    score: 0,
    confidence: 0,
    summary: 'No recent news available for analysis',
    keyFactors: [],
    tradingImplication: 'Monitor market for developments'
  };
}
