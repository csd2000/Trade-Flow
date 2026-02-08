import { Router } from 'express';
import { futuresService } from './futures-service';
import { getFuturesNews, getNewsSentimentSummary } from './futures-news-service';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic();

interface AIFlashPrediction {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  timeframe: string;
  reasoning: string;
  keyFactors: string[];
  marketCondition: string;
  timestamp: string;
}

router.get('/contracts', async (req, res) => {
  try {
    const contracts = futuresService.getContractSpecs();
    res.json({ success: true, data: contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contracts' });
  }
});

router.get('/quotes', async (req, res) => {
  try {
    const contracts = futuresService.getContractSpecs();
    const quotes = await Promise.all(
      contracts.map(c => futuresService.fetchQuote(c.symbol))
    );
    
    const validQuotes = quotes.filter(q => q !== null);
    res.json({ success: true, data: validQuotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quotes' });
  }
});

router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await futuresService.fetchQuote(symbol);
    
    if (!quote) {
      return res.status(404).json({ success: false, error: 'Symbol not found' });
    }
    
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quote' });
  }
});

router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '15m', range = '5d' } = req.query;
    
    const candles = await futuresService.fetchCandles(
      symbol, 
      interval as string, 
      range as string
    );
    
    res.json({ success: true, data: candles });
  } catch (error) {
    console.error('Error fetching candles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch candles' });
  }
});

router.get('/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const contract = futuresService.getContractSpec(symbol);
    
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const [quote, candles] = await Promise.all([
      futuresService.fetchQuote(symbol),
      futuresService.fetchCandles(symbol, '15m', '5d')
    ]);

    if (!quote) {
      return res.status(404).json({ success: false, error: 'Quote not available' });
    }

    const indicators = futuresService.calculateIndicators(candles);
    const signal = futuresService.generateSignal(quote, indicators, contract);

    res.json({
      success: true,
      data: {
        contract,
        quote,
        indicators,
        signal
      }
    });
  } catch (error) {
    console.error('Error analyzing futures:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze futures' });
  }
});

router.get('/signals', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '15m';
    const validTimeframes = ['5m', '15m', '30m', '1h'];
    const interval = validTimeframes.includes(timeframe) ? timeframe : '15m';
    
    const contracts = futuresService.getContractSpecs();
    const signals = [];

    for (const contract of contracts) {
      const [quote, candles] = await Promise.all([
        futuresService.fetchQuote(contract.symbol),
        futuresService.fetchCandles(contract.symbol, interval, '5d')
      ]);

      if (quote) {
        const indicators = futuresService.calculateIndicators(candles);
        const signal = futuresService.generateSignal(quote, indicators, contract);
        signals.push({ contract, quote, indicators, signal });
      }
    }

    res.json({ success: true, data: signals });
  } catch (error) {
    console.error('Error generating signals:', error);
    res.status(500).json({ success: false, error: 'Failed to generate signals' });
  }
});

router.post('/position-size', async (req, res) => {
  try {
    const { symbol, accountBalance, riskPercent, entryPrice, stopLoss } = req.body;
    
    if (!symbol || !accountBalance || !riskPercent || !entryPrice || !stopLoss) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: symbol, accountBalance, riskPercent, entryPrice, stopLoss' 
      });
    }

    const contract = futuresService.getContractSpec(symbol);
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const result = futuresService.calculatePositionSize(
      parseFloat(accountBalance),
      parseFloat(riskPercent),
      parseFloat(entryPrice),
      parseFloat(stopLoss),
      contract
    );

    res.json({ 
      success: true, 
      data: {
        ...result,
        contract: {
          symbol: contract.symbol,
          name: contract.name,
          contractSize: contract.contractSize,
          tickSize: contract.tickSize,
          tickValue: contract.tickValue,
          marginRequirement: contract.marginRequirement
        }
      }
    });
  } catch (error) {
    console.error('Error calculating position size:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate position size' });
  }
});

router.get('/news', async (req, res) => {
  try {
    const contract = req.query.contract as 'GC' | 'SI' | undefined;
    const { news, analysis } = await getFuturesNews(contract);
    
    res.json({ 
      success: true, 
      data: { 
        news, 
        analysis,
        timestamp: new Date().toISOString()
      } 
    });
  } catch (error: any) {
    console.error('Error fetching futures news:', error);
    const errorMessage = error?.message || 'Failed to fetch news';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    let statusCode = 500;
    if (errorCode === 'MISSING_API_KEY') statusCode = 503;
    else if (errorCode === 'INVALID_API_KEY') statusCode = 401;
    else if (errorCode === 'RATE_LIMIT') statusCode = 429;
    
    res.status(statusCode).json({ success: false, error: errorMessage, code: errorCode });
  }
});

router.get('/news/sentiment/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const contract = symbol.toUpperCase() as 'GC' | 'SI';
    
    if (contract !== 'GC' && contract !== 'SI') {
      return res.status(400).json({ success: false, error: 'Invalid contract symbol. Use GC or SI.' });
    }
    
    const sentiment = await getNewsSentimentSummary(contract);
    
    res.json({ 
      success: true, 
      data: {
        contract,
        sentiment,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error fetching sentiment:', error);
    const errorMessage = error?.message || 'Failed to analyze sentiment';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    let statusCode = 500;
    if (errorCode === 'MISSING_API_KEY') statusCode = 503;
    else if (errorCode === 'INVALID_API_KEY') statusCode = 401;
    else if (errorCode === 'RATE_LIMIT') statusCode = 429;
    
    res.status(statusCode).json({ success: false, error: errorMessage, code: errorCode });
  }
});

router.get('/ai-flash-prediction/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) || '15m';
    const contract = futuresService.getContractSpec(symbol);
    
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const [quote, candles, newsData] = await Promise.all([
      futuresService.fetchQuote(symbol),
      futuresService.fetchCandles(symbol, timeframe, '5d'),
      getFuturesNews(symbol.toUpperCase() as 'GC' | 'SI')
    ]);

    if (!quote) {
      return res.status(404).json({ success: false, error: 'Quote not available' });
    }

    const indicators = futuresService.calculateIndicators(candles);
    const recentCandles = candles.slice(-20);
    
    const priceAction = recentCandles.map(c => ({
      time: new Date(c[0]).toISOString(),
      open: c[1].toFixed(2),
      high: c[2].toFixed(2),
      low: c[3].toFixed(2),
      close: c[4].toFixed(2),
      volume: Math.round(c[5])
    }));

    const newsHeadlines = newsData.news.slice(0, 5).map(n => 
      `[${n.sentiment}] ${n.title} (${n.source})`
    ).join('\n');

    const prompt = `You are an expert futures trader analyzing ${contract.name} (${contract.symbol}) on the ${timeframe} timeframe.

CURRENT MARKET DATA:
- Current Price: $${quote.price.toFixed(2)}
- Day Change: ${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)
- Day High: $${quote.dayHigh.toFixed(2)}
- Day Low: $${quote.dayLow.toFixed(2)}
- Volume: ${quote.volume.toLocaleString()}

TECHNICAL INDICATORS:
- RSI (14): ${indicators.rsi.toFixed(1)}
- MACD Line: ${indicators.macd.line.toFixed(3)}
- MACD Signal: ${indicators.macd.signal.toFixed(3)}
- MACD Histogram: ${indicators.macd.histogram.toFixed(3)}
- EMA 9: $${indicators.ema9.toFixed(2)}
- EMA 20: $${indicators.ema20.toFixed(2)}
- EMA 50: $${indicators.ema50.toFixed(2)}
- ATR: ${indicators.atr.toFixed(2)}
- Trend: ${indicators.trend.toUpperCase()}
- Volatility: ${indicators.volatility.toUpperCase()}

RECENT PRICE ACTION (Last 20 ${timeframe} candles):
${JSON.stringify(priceAction.slice(-5), null, 2)}

LATEST NEWS & SENTIMENT:
${newsHeadlines || 'No recent news available'}
News Sentiment: ${newsData.analysis?.overall || 'neutral'} (Score: ${newsData.analysis?.score || 0})

Based on ALL this data, provide a trading prediction in this EXACT JSON format:
{
  "direction": "LONG" or "SHORT" or "NEUTRAL",
  "confidence": 0-100,
  "entryPrice": number,
  "stopLoss": number,
  "target1": number (conservative target),
  "target2": number (aggressive target),
  "riskReward": number,
  "reasoning": "2-3 sentence summary of why this trade makes sense",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "marketCondition": "trending/ranging/volatile/quiet"
}

Be decisive. Provide specific price levels. Consider risk management with 2:1 minimum R:R.
Respond with valid JSON only, no markdown.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = (message.content[0] as any).text;
    let prediction: any;
    
    try {
      prediction = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    const flashPrediction: AIFlashPrediction = {
      symbol: contract.symbol,
      direction: prediction.direction || 'NEUTRAL',
      confidence: prediction.confidence || 50,
      entryPrice: prediction.entryPrice || quote.price,
      stopLoss: prediction.stopLoss || quote.price - indicators.atr * 2,
      target1: prediction.target1 || quote.price + indicators.atr * 2,
      target2: prediction.target2 || quote.price + indicators.atr * 4,
      riskReward: prediction.riskReward || 2,
      timeframe,
      reasoning: prediction.reasoning || 'Analysis pending',
      keyFactors: prediction.keyFactors || [],
      marketCondition: prediction.marketCondition || 'unknown',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        prediction: flashPrediction,
        quote,
        indicators,
        contract: {
          symbol: contract.symbol,
          name: contract.name,
          tickSize: contract.tickSize,
          tickValue: contract.tickValue
        }
      }
    });
  } catch (error) {
    console.error('Error generating AI flash prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AI prediction' });
  }
});

router.get('/ai-flash-signals', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '15m';
    const contracts = futuresService.getContractSpecs();
    const predictions = [];

    for (const contract of contracts) {
      try {
        const [quote, candles, newsData] = await Promise.all([
          futuresService.fetchQuote(contract.symbol),
          futuresService.fetchCandles(contract.symbol, timeframe, '5d'),
          getFuturesNews(contract.symbol as 'GC' | 'SI')
        ]);

        if (!quote) continue;

        const indicators = futuresService.calculateIndicators(candles);
        
        const newsContext = newsData.news.slice(0, 3).map(n => n.title).join('; ');
        const sentiment = newsData.analysis?.overall || 'neutral';

        const quickPrompt = `Analyze ${contract.name} for a ${timeframe} trade signal.
Price: $${quote.price.toFixed(2)}, RSI: ${indicators.rsi.toFixed(1)}, Trend: ${indicators.trend}, MACD: ${indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
News sentiment: ${sentiment}
Recent headlines: ${newsContext || 'None'}

Respond with JSON only:
{"direction":"LONG/SHORT/NEUTRAL","confidence":0-100,"reasoning":"one sentence","stopLoss":number,"target":number}`;

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{ role: 'user', content: quickPrompt }]
        });

        const responseText = (message.content[0] as any).text;
        let aiSignal: any;
        
        try {
          aiSignal = JSON.parse(responseText);
        } catch {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiSignal = JSON.parse(jsonMatch[0]);
          } else {
            continue;
          }
        }

        predictions.push({
          contract: {
            symbol: contract.symbol,
            name: contract.name
          },
          quote,
          indicators,
          aiSignal: {
            direction: aiSignal.direction || 'NEUTRAL',
            confidence: aiSignal.confidence || 50,
            reasoning: aiSignal.reasoning || '',
            stopLoss: aiSignal.stopLoss || quote.price - indicators.atr * 2,
            target: aiSignal.target || quote.price + indicators.atr * 3,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err) {
        console.error(`Error processing ${contract.symbol}:`, err);
      }
    }

    res.json({
      success: true,
      data: predictions,
      timeframe,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating AI flash signals:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AI signals' });
  }
});

export default router;
