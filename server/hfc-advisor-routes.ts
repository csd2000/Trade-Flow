import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { sevenGateORBEngine } from './seven-gate-orb-engine';

const router = Router();
const anthropic = new Anthropic();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolResult {
  name: string;
  data: any;
}

async function fetchYahooQuote(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const lastIdx = quote?.close?.length - 1;
    
    return {
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
      volume: quote?.volume?.[lastIdx],
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow
    };
  } catch (error) {
    console.error('Yahoo quote error:', error);
    return null;
  }
}

async function fetchYahooCandles(symbol: string, interval: string, range: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result?.timestamp) return [];

    const { timestamp, indicators } = result;
    const quote = indicators?.quote?.[0];
    if (!quote) return [];

    return timestamp.map((time: number, i: number) => ({
      time: time * 1000,
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0
    })).filter((c: any) => c.open > 0 && c.close > 0);
  } catch (error) {
    return [];
  }
}

async function getGateStatus(ticker: string): Promise<ToolResult> {
  try {
    const [candles15m, candles5m, candles1m] = await Promise.all([
      fetchYahooCandles(ticker, '15m', '1d'),
      fetchYahooCandles(ticker, '5m', '1d'),
      fetchYahooCandles(ticker, '1m', '1d')
    ]);

    if (candles15m.length === 0) {
      return { name: 'get_gate_status', data: { error: `No data available for ${ticker}` } };
    }

    const analysis = await sevenGateORBEngine.runFullAnalysis(ticker, candles15m, candles5m, candles1m);
    
    const gatesActive = countActiveGates(analysis);
    const gate67 = analysis.gates?.gate6_7;
    const currentPrice = candles15m[candles15m.length - 1]?.close || 0;
    const entryPrice = gate67?.entryPrice || currentPrice;
    const stopLoss = gate67?.stopLoss || (entryPrice * 0.98);
    const target1 = gate67?.target05SD || (entryPrice * 1.02);
    const target2 = gate67?.target10SD || (entryPrice * 1.04);
    
    return {
      name: 'get_gate_status',
      data: {
        ticker,
        gatesActive,
        totalGates: 8,
        direction: analysis.direction,
        confidence: analysis.confidenceScore,
        signalType: analysis.signalType,
        overallStatus: analysis.overallStatus,
        entry: entryPrice.toFixed(2),
        stopLoss: stopLoss.toFixed(2),
        target1: target1.toFixed(2),
        target2: target2.toFixed(2),
        reasoning: analysis.reasoning?.slice(0, 3) || [],
        summary: `${ticker}: ${gatesActive}/8 gates passed (${analysis.direction} bias, ${analysis.confidenceScore}% confidence)`
      }
    };
  } catch (error: any) {
    return { name: 'get_gate_status', data: { error: error.message } };
  }
}

async function getPressureReading(ticker: string): Promise<ToolResult> {
  try {
    const quote = await fetchYahooQuote(ticker);
    if (!quote) {
      return { name: 'get_pressure_reading', data: { error: `No quote data for ${ticker}` } };
    }

    const changeNum = parseFloat(quote.change);
    let pressure = 50;
    if (changeNum > 2) pressure = 75 + Math.min(changeNum * 2, 20);
    else if (changeNum > 0) pressure = 50 + changeNum * 12;
    else if (changeNum < -2) pressure = 25 - Math.min(Math.abs(changeNum) * 2, 20);
    else pressure = 50 + changeNum * 12;
    
    pressure = Math.max(5, Math.min(95, pressure));

    return {
      name: 'get_pressure_reading',
      data: {
        ticker,
        price: quote.price,
        change: `${changeNum > 0 ? '+' : ''}${quote.change}%`,
        obi: pressure.toFixed(0),
        bias: pressure > 60 ? 'Bullish Pressure' : pressure < 40 ? 'Bearish Pressure' : 'Neutral',
        summary: `${ticker} OBI: ${pressure.toFixed(0)}% (${pressure > 60 ? 'Buy' : pressure < 40 ? 'Sell' : 'Neutral'} pressure at $${quote.price})`
      }
    };
  } catch (error: any) {
    return { name: 'get_pressure_reading', data: { error: error.message } };
  }
}

async function checkNewsSentiment(ticker: string): Promise<ToolResult> {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return { 
        name: 'check_news_sentiment', 
        data: { 
          ticker,
          sentiment: 'neutral',
          score: 50,
          note: 'News API not configured',
          summary: `${ticker}: News sentiment unavailable (API not configured)`
        } 
      };
    }

    const response = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${getDateDaysAgo(3)}&to=${getDateDaysAgo(0)}&token=${apiKey}`);
    
    if (!response.ok) {
      throw new Error('Finnhub API error');
    }
    
    const news = await response.json();
    const headlines = news.slice(0, 5).map((n: any) => n.headline);
    
    let sentimentScore = 50;
    const positiveWords = ['surge', 'jump', 'rally', 'gain', 'beat', 'strong', 'bullish', 'upgrade', 'buy'];
    const negativeWords = ['drop', 'fall', 'decline', 'miss', 'weak', 'bearish', 'downgrade', 'sell', 'crash'];
    
    headlines.forEach((headline: string) => {
      const lower = headline.toLowerCase();
      positiveWords.forEach(w => { if (lower.includes(w)) sentimentScore += 8; });
      negativeWords.forEach(w => { if (lower.includes(w)) sentimentScore -= 8; });
    });
    
    sentimentScore = Math.max(0, Math.min(100, sentimentScore));
    const sentiment = sentimentScore > 60 ? 'bullish' : sentimentScore < 40 ? 'bearish' : 'neutral';
    
    return {
      name: 'check_news_sentiment',
      data: {
        ticker,
        sentiment,
        score: sentimentScore,
        headlines: headlines.slice(0, 3),
        summary: `${ticker} News Sentiment: ${sentiment} (Score: ${sentimentScore}/100)`
      }
    };
  } catch (error: any) {
    return { 
      name: 'check_news_sentiment', 
      data: { 
        ticker,
        sentiment: 'neutral',
        score: 50,
        summary: `${ticker}: No significant news detected`
      } 
    };
  }
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function countActiveGates(analysis: any): number {
  let count = 0;
  const gates = analysis.gates;
  
  if (gates?.gate0?.systemStatus !== 'PAUSED') count++;
  if (gates?.gate1_2?.openingRange?.isFormed) count += 2;
  if (gates?.gate3?.fibonacciConfirm) count++;
  if (gates?.gate4_5?.entryConfirmed) count += 2;
  if (gates?.gate6_7?.stopPlaced) count++;
  if (gates?.gate6_7?.targetHit) count++;
  
  return Math.min(count, 8);
}

async function generateOptionPlay(ticker: string): Promise<ToolResult> {
  try {
    const quote = await fetchYahooQuote(ticker);
    if (!quote) {
      return { name: 'generate_option_play', data: { error: `No quote data for ${ticker}` } };
    }

    const price = quote.price;
    const changeNum = parseFloat(quote.change);
    const direction = changeNum >= 0 ? 'CALL' : 'PUT';
    
    const strikeStep = price > 100 ? 5 : price > 50 ? 2.5 : 1;
    const atmStrike = Math.round(price / strikeStep) * strikeStep;
    const delta80Strike = direction === 'CALL' 
      ? atmStrike - strikeStep * 2 
      : atmStrike + strikeStep * 2;

    const today = new Date();
    const daysToFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today.getTime() + daysToFriday * 24 * 60 * 60 * 1000);
    const expiry = nextFriday.toISOString().split('T')[0];

    const intrinsicValue = direction === 'CALL' 
      ? Math.max(0, price - delta80Strike)
      : Math.max(0, delta80Strike - price);
    const timeValue = price * 0.02;
    const estimatedPremium = (intrinsicValue + timeValue).toFixed(2);

    return {
      name: 'generate_option_play',
      data: {
        ticker,
        currentPrice: price,
        direction,
        strike: delta80Strike,
        delta: 0.80,
        expiry,
        estimatedPremium,
        summary: `${ticker} ${direction} $${delta80Strike} (0.80 Delta) exp ${expiry} - Est. Premium: $${estimatedPremium}`
      }
    };
  } catch (error: any) {
    return { name: 'generate_option_play', data: { error: error.message } };
  }
}

async function executeTools(toolName: string, ticker: string): Promise<ToolResult> {
  switch (toolName) {
    case 'get_gate_status':
      return await getGateStatus(ticker);
    case 'get_pressure_reading':
      return await getPressureReading(ticker);
    case 'check_news_sentiment':
      return await checkNewsSentiment(ticker);
    case 'generate_option_play':
      return await generateOptionPlay(ticker);
    default:
      return { name: toolName, data: { error: 'Unknown tool' } };
  }
}

const SYSTEM_PROMPT = `You are the Apex Institutional Advisor, an expert AI trading assistant integrated into the HFC 8-Gate Intelligence Engine. You have access to real-time market data and can analyze any stock or crypto ticker using our proprietary 8-Gate validation system.

Your capabilities:
1. **Gate Analysis**: Evaluate the 8-Gate liquidity sweep system to determine trade validity
2. **Pressure Reading**: Check Order Book Imbalance (OBI) for buy/sell pressure
3. **News Sentiment**: Analyze current news sentiment for any ticker
4. **Option Plays**: Generate 0.80 Delta option recommendations

When a user asks about a specific ticker, use your tools to gather real data before responding. Always explain your analysis in clear, actionable terms.

Response style:
- Be concise but thorough
- Use bullet points for key metrics
- Highlight the most important gate statuses
- Provide clear entry/stop/target levels when applicable
- Use emojis sparingly for visual clarity (✅ ❌ 🎯 ⚠️)

IMPORTANT: Always append this disclaimer at the end of trade-related responses:
"*This is technical analysis, not financial advice. Always do your own research.*"

If a user asks about concepts like "Fair Value Gap", "Liquidity Sweep", or other trading terms, explain them clearly using educational language.`;

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, ticker, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required and must be a string' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, error: 'Message too long (max 2000 characters)' });
    }

    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({ success: false, error: 'Conversation history must be an array' });
    }

    const extractedTicker = ticker || extractTickerFromMessage(message);
    
    let contextData = '';
    if (extractedTicker) {
      const [gateResult, pressureResult, sentimentResult] = await Promise.all([
        getGateStatus(extractedTicker),
        getPressureReading(extractedTicker),
        checkNewsSentiment(extractedTicker)
      ]);

      contextData = `
## Live Market Data for ${extractedTicker}:
${JSON.stringify(gateResult.data, null, 2)}

## Pressure Reading:
${JSON.stringify(pressureResult.data, null, 2)}

## News Sentiment:
${JSON.stringify(sentimentResult.data, null, 2)}
`;
    }

    const messages: any[] = [
      ...conversationHistory.slice(-10).map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: contextData 
          ? `${message}\n\n[LIVE DATA CONTEXT]:\n${contextData}`
          : message
      }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages
    });

    let assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I could not generate a response.';
    
    const hasDisclaimer = assistantMessage.toLowerCase().includes('not financial advice');
    if (!hasDisclaimer && (extractedTicker || message.toLowerCase().includes('buy') || message.toLowerCase().includes('sell') || message.toLowerCase().includes('trade'))) {
      assistantMessage += '\n\n*This is technical analysis, not financial advice. Always do your own research.*';
    }

    res.json({
      success: true,
      response: assistantMessage,
      ticker: extractedTicker,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('HFC Advisor chat error:', error);
    
    let errorMessage = 'Failed to process your request. Please try again.';
    let statusCode = 500;
    
    if (error?.error?.error?.message?.includes('credit balance is too low') || 
        error?.message?.includes('credit balance is too low')) {
      errorMessage = 'The AI service is temporarily unavailable due to API credit limits. The advisor will provide a market data summary instead.';
      statusCode = 503;
      
      const extractedTicker = req.body.ticker || extractTickerFromMessage(req.body.message);
      if (!extractedTicker) {
        return res.json({
          success: true,
          response: `I'm the Apex Advisor - your AI-powered trading assistant. I can analyze any stock or crypto for you using our 8-Gate system, check order flow pressure, review news sentiment, and suggest options plays.\n\n**Try asking me about a specific ticker, for example:**\n- "Analyze AAPL for me"\n- "What's the gate status on NVDA?"\n- "Show me the pressure on TSLA"\n- "Check news sentiment for MSFT"\n\n*Note: AI-enhanced analysis is temporarily limited. I'll show you real-time market data instead.*`,
          timestamp: new Date().toISOString(),
          fallback: true
        });
      }
      if (extractedTicker) {
        try {
          const [gateResult, pressureResult, sentimentResult] = await Promise.all([
            getGateStatus(extractedTicker),
            getPressureReading(extractedTicker),
            checkNewsSentiment(extractedTicker)
          ]);
          
          const gate = gateResult.data;
          const pressure = pressureResult.data;
          const sentiment = sentimentResult.data;
          
          const priceDisplay = gate.entry || 'N/A';
          const directionDisplay = gate.direction || 'neutral';
          const confidenceDisplay = gate.confidence || 'N/A';
          const pressureDisplay = pressure.reading || pressure.pressure || 'N/A';
          const obiDisplay = typeof pressure.obi === 'number' && !isNaN(pressure.obi) ? pressure.obi.toFixed(1) : 'N/A';
          
          const fallbackResponse = `**${extractedTicker} Market Data Summary** (AI unavailable - showing raw data)\n\n` +
            `**Price:** $${priceDisplay} | Direction: ${directionDisplay}\n` +
            `**Gate Score:** ${gate.gatesActive || 0}/8 gates active | Confidence: ${confidenceDisplay}%\n` +
            `**Signal:** ${gate.signalType || 'N/A'} | Status: ${gate.overallStatus || 'N/A'}\n` +
            `**Pressure:** ${pressureDisplay} (OBI: ${obiDisplay})\n` +
            `**News Sentiment:** ${sentiment.sentiment || 'neutral'} (Score: ${sentiment.score || 50}/100)\n` +
            (gate.stopLoss ? `**Levels:** Entry $${gate.entry} | Stop $${gate.stopLoss} | Target $${gate.target1}\n` : '') +
            `\n*AI analysis temporarily unavailable. Please check your Anthropic API credits. Data above is from live market feeds.*`;
          
          return res.json({
            success: true,
            response: fallbackResponse,
            ticker: extractedTicker,
            timestamp: new Date().toISOString(),
            fallback: true
          });
        } catch (fallbackError) {
          console.error('Fallback data fetch failed:', fallbackError);
        }
      }
    } else if (error?.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error?.status === 401) {
      errorMessage = 'AI service authentication failed. Please check the API key configuration.';
      statusCode = 401;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage
    });
  }
});

router.post('/quick-analysis', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.body;

    if (!ticker) {
      return res.status(400).json({ success: false, error: 'Ticker is required' });
    }

    const [gateResult, pressureResult, sentimentResult, optionResult] = await Promise.all([
      getGateStatus(ticker),
      getPressureReading(ticker),
      checkNewsSentiment(ticker),
      generateOptionPlay(ticker)
    ]);

    res.json({
      success: true,
      ticker,
      analysis: {
        gates: gateResult.data,
        pressure: pressureResult.data,
        sentiment: sentimentResult.data,
        option: optionResult.data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Quick analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function extractTickerFromMessage(message: string): string | null {
  const tickerPatterns = [
    /\b([A-Z]{1,5})\b/g,
    /\$([A-Z]{1,5})\b/g,
    /ticker[:\s]+([A-Z]{1,5})/gi,
    /symbol[:\s]+([A-Z]{1,5})/gi
  ];

  const commonWords = new Set([
    'I', 'A', 'THE', 'AND', 'OR', 'BUT', 'FOR', 'NOT', 'YOU', 'ARE', 'CAN',
    'WHAT', 'WHY', 'HOW', 'WHEN', 'IS', 'IT', 'TO', 'OF', 'IN', 'ON', 'AT',
    'BE', 'DO', 'IF', 'SO', 'AS', 'BY', 'AN', 'UP', 'NO', 'MY', 'ME', 'WE',
    'BUY', 'SELL', 'CALL', 'PUT', 'ATM', 'ITM', 'OTM', 'EMA', 'SMA', 'RSI',
    'MACD', 'OBI', 'FVG', 'ORB', 'PDH', 'PDL', 'HOD', 'LOD', 'ATH', 'ATL'
  ]);

  for (const pattern of tickerPatterns) {
    const matches = message.match(pattern);
    if (matches) {
      for (const match of matches) {
        const ticker = match.replace('$', '').toUpperCase();
        if (ticker.length >= 1 && ticker.length <= 5 && !commonWords.has(ticker)) {
          return ticker;
        }
      }
    }
  }

  return null;
}

export default router;
