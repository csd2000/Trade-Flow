import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, ArrowRight, ArrowLeft, CheckCircle, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTTS } from '@/hooks/use-tts';

export interface WalkthroughStep {
  id: number;
  title: string;
  content: string;
  highlight?: string;
}

interface WalkthroughGuideProps {
  steps: WalkthroughStep[];
  title?: string;
  accentColor?: string;
}

export function WalkthroughGuide({ steps, title = "Guide", accentColor = "violet" }: WalkthroughGuideProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { speak, stop, isPlaying, isLoading } = useTTS();

  const handleReadStep = () => {
    if (isPlaying) {
      stop();
    } else {
      const step = steps[currentStep];
      const textToRead = `${step.title}. ${step.content}`;
      speak(textToRead);
    }
  };

  const handleCloseGuide = () => {
    stop();
    setShowWalkthrough(false);
  };

  const colorClasses = {
    violet: {
      button: "border-violet-500 text-violet-400 hover:bg-violet-500/10",
      header: "bg-violet-600",
      border: "border-violet-500",
      dot: "bg-violet-500",
      finish: "bg-violet-600 hover:bg-violet-700"
    },
    emerald: {
      button: "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10",
      header: "bg-emerald-600",
      border: "border-emerald-500",
      dot: "bg-emerald-500",
      finish: "bg-emerald-600 hover:bg-emerald-700"
    },
    amber: {
      button: "border-amber-500 text-amber-400 hover:bg-amber-500/10",
      header: "bg-amber-600",
      border: "border-amber-500",
      dot: "bg-amber-500",
      finish: "bg-amber-600 hover:bg-amber-700"
    },
    cyan: {
      button: "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10",
      header: "bg-cyan-600",
      border: "border-cyan-500",
      dot: "bg-cyan-500",
      finish: "bg-cyan-600 hover:bg-cyan-700"
    },
    rose: {
      button: "border-rose-500 text-rose-400 hover:bg-rose-500/10",
      header: "bg-rose-600",
      border: "border-rose-500",
      dot: "bg-rose-500",
      finish: "bg-rose-600 hover:bg-rose-700"
    },
    blue: {
      button: "border-blue-500 text-blue-400 hover:bg-blue-500/10",
      header: "bg-blue-600",
      border: "border-blue-500",
      dot: "bg-blue-500",
      finish: "bg-blue-600 hover:bg-blue-700"
    },
    orange: {
      button: "border-orange-500 text-orange-400 hover:bg-orange-500/10",
      header: "bg-orange-600",
      border: "border-orange-500",
      dot: "bg-orange-500",
      finish: "bg-orange-600 hover:bg-orange-700"
    }
  };

  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.violet;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setCurrentStep(0);
          setShowWalkthrough(true);
        }}
        className={colors.button}
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        {title}
      </Button>

      {showWalkthrough && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
          <Card className={`bg-slate-900 border-2 ${colors.border} max-w-lg w-full`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${colors.header} flex items-center justify-center text-white text-sm font-bold`}>
                    {currentStep + 1}
                  </div>
                  <span className="text-xs text-slate-400">of {steps.length}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCloseGuide}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardTitle className="text-white text-xl mt-2">
                {steps[currentStep]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-slate-300 leading-relaxed flex-1">
                  {steps[currentStep]?.content}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReadStep}
                  disabled={isLoading}
                  className="flex-shrink-0 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                  title={isPlaying ? "Stop reading" : "Read aloud"}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => { stop(); setCurrentStep(prev => Math.max(0, prev - 1)); }}
                  disabled={currentStep === 0}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentStep ? colors.dot : idx < currentStep ? 'bg-[#00ff41]' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() => { stop(); setCurrentStep(prev => prev + 1); }}
                    className={colors.finish}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      stop();
                      setShowWalkthrough(false);
                      setCurrentStep(0);
                    }}
                    className="bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold"
                  >
                    Got It!
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export const MODULE_GUIDES: Record<string, WalkthroughStep[]> = {
  'scanner': [
    { id: 1, title: "Welcome to the 5:1 Scanner", content: "This high-frequency scanner identifies trades with a minimum 5:1 risk-to-reward ratio. It scans the market in real-time to find the best setups." },
    { id: 2, title: "Enter Your Symbol", content: "Type any stock ticker (like SPY, AAPL, or TSLA) to analyze it. The scanner will calculate potential entry, stop-loss, and target levels." },
    { id: 3, title: "Understanding the Signals", content: "Green signals indicate bullish setups, red signals indicate bearish setups. The confidence score shows how strong the signal is (higher is better)." },
    { id: 4, title: "Risk/Reward Calculation", content: "Each signal shows the calculated risk (distance to stop) and reward (distance to target). Only setups with 5:1 or better ratios are displayed." },
    { id: 5, title: "Taking Action", content: "When you see a signal you like, note the entry price, stop-loss, and target. Always use proper position sizing based on your account size." }
  ],
  'seven-gate-orb': [
    { id: 1, title: "Opening Range Breakout Strategy", content: "The 7-Gate ORB system uses the first 15-30 minutes of market action to identify high-probability breakout trades." },
    { id: 2, title: "Define the Opening Range", content: "The system automatically identifies the high and low of the opening range (OR). A breakout above OR high is bullish; below OR low is bearish." },
    { id: 3, title: "Gate Validation", content: "Each gate validates a different aspect: trend direction, volume confirmation, time of day, and risk/reward. All gates must pass for a valid signal." },
    { id: 4, title: "Entry Timing", content: "The best entries occur when price breaks the OR level with strong volume, preferably within the first 2 hours of the session." },
    { id: 5, title: "Managing Your Trade", content: "Use the OR high/low as your stop reference. First target is typically 1x the OR range; second target is 2x the range." }
  ],
  'hfc-apex': [
    { id: 1, title: "8-Gate Institutional Options", content: "This advanced system combines 8 validation gates with Order Book Imbalance (OBI) pressure to identify institutional-grade options setups." },
    { id: 2, title: "OBI Pressure Analysis", content: "Order Book Imbalance measures buying vs selling pressure in the order book. High buy pressure with price support indicates institutional accumulation." },
    { id: 3, title: "Delta Selection", content: "Use 0.60-0.65 Delta ITM options for the best probability. 1-3 DTE (days to expiration) provides optimal theta management." },
    { id: 4, title: "Gate Progression", content: "Complete each gate sequentially. If any gate fails, the system shows 'No Trade' - protecting you from suboptimal setups." },
    { id: 5, title: "Position Sizing", content: "Risk no more than 1-2% of your account per trade. The system calculates suggested position size based on your inputs." }
  ],
  'automated-trading': [
    { id: 1, title: "AI Automatic Trading", content: "This module allows you to set up automated trading rules that execute trades based on predefined conditions and signals." },
    { id: 2, title: "Creating Trading Rules", content: "Define your entry conditions (price levels, indicator values, time windows) and the system will monitor and execute when conditions are met." },
    { id: 3, title: "Risk Controls", content: "Set maximum position sizes, daily loss limits, and trade frequency caps to protect your account from overtrading." },
    { id: 4, title: "Backtesting", content: "Before going live, test your rules against historical data to see how they would have performed." },
    { id: 5, title: "Monitoring", content: "The dashboard shows all active rules, pending orders, and executed trades. You can pause or modify rules at any time." }
  ],
  'ai-profit-studio': [
    { id: 1, title: "AI Profit Indicator Studio", content: "This powerful scanner analyzes 8,639+ stocks and ETFs daily to find the highest-probability trading opportunities using AI." },
    { id: 2, title: "3 Strict Criteria", content: "Every signal must meet: ≥70% confidence score, <60 days timeframe, and ≥1.5:1 profit/risk ratio. This filters out low-quality setups." },
    { id: 3, title: "Full Market Scan", content: "Click 'Run Full Scan' to analyze the entire market in 10-20 seconds. The AI ranks and returns only the top 5-10 qualified signals." },
    { id: 4, title: "Individual Stock Analysis", content: "Use the 'Analyze Stock' tab to get instant AI predictions on any specific ticker you're interested in." },
    { id: 5, title: "Active Signals", content: "The Active Signals tab tracks all current recommendations. Signals are automatically removed when they expire or hit targets." }
  ],
  'ai-trader': [
    { id: 1, title: "AI Trader Dashboard", content: "Your real-time AI trading companion that provides live analysis, health scores, and position sizing recommendations." },
    { id: 2, title: "Volatility Quotient (VQ)", content: "The VQ measures current market volatility. High VQ means use smaller positions; low VQ allows for larger positions." },
    { id: 3, title: "Health Score", content: "Each stock receives a health score based on technical and fundamental factors. Higher scores indicate stronger, more tradeable stocks." },
    { id: 4, title: "Position Sizing", content: "The AI calculates optimal position size based on your account size, the stock's volatility, and your risk tolerance." },
    { id: 5, title: "Real-time Updates", content: "The dashboard refreshes continuously with live market data. Use the insights to time your entries and exits." }
  ],
  'ai-assistant': [
    { id: 1, title: "AI Trading Assistant", content: "This intelligent assistant helps match you with the best trading strategies based on your experience level, risk tolerance, and goals." },
    { id: 2, title: "Risk Profile Questionnaire", content: "Answer 3 simple questions about your trading experience, how much risk you're comfortable with, and your investment goals." },
    { id: 3, title: "AI Strategy Matching", content: "Based on your profile, the AI analyzes all available strategies and recommends the best matches with detailed explanations." },
    { id: 4, title: "Match Scores", content: "Each recommendation includes a match score (percentage), key benefits, potential warnings, and direct links to training modules." },
    { id: 5, title: "Getting Started", content: "Click on any recommended strategy to access its full training program. Start with strategies that have the highest match scores." }
  ],
  'alert-center': [
    { id: 1, title: "Custom Alert Center", content: "Create personalized price and technical indicator alerts that notify you when market conditions match your criteria." },
    { id: 2, title: "Price Alerts", content: "Set alerts for when a stock goes above or below a specific price, or moves by a certain percentage from current levels." },
    { id: 3, title: "Technical Indicators", content: "Create alerts for RSI overbought/oversold, MACD crossovers, EMA crosses, Bollinger Band touches, and volume spikes." },
    { id: 4, title: "Notification Channels", content: "Receive alerts via in-app notifications (bell icon), email, or push notifications. Configure your preferences in settings." },
    { id: 5, title: "Managing Alerts", content: "Toggle alerts on/off, edit conditions, set cooldown periods, and delete alerts you no longer need from the management panel." }
  ],
  'command-center': [
    { id: 1, title: "Command Center", content: "Your central hub for whale activity tracking, breaking market news, and AI-powered market analysis in one unified dashboard." },
    { id: 2, title: "Whale Stream", content: "Monitor large institutional trades in real-time. Big money movements often precede significant price action." },
    { id: 3, title: "News Feed", content: "Breaking market news filtered for relevance. The AI highlights news that could impact your positions or watchlist." },
    { id: 4, title: "AI Analyst", content: "Get AI-powered insights and analysis on current market conditions, sector rotations, and potential opportunities." },
    { id: 5, title: "Quick Actions", content: "Use the command bar to quickly search stocks, check news, or get AI analysis on any ticker." }
  ],
  'dark-pool': [
    { id: 1, title: "Dark Pool AI", content: "Detect institutional trading activity that happens 'off-exchange' in dark pools. These hidden trades often signal smart money positioning." },
    { id: 2, title: "Dark Pool Prints", content: "Large block trades executed in dark pools are displayed with size, price, and timing. Unusual activity is highlighted." },
    { id: 3, title: "Accumulation Detection", content: "The AI identifies patterns of systematic buying or selling that suggest institutional accumulation or distribution." },
    { id: 4, title: "Flow Analysis", content: "See the balance between dark pool buying and selling. Consistent buy-side flow often precedes upward price movement." },
    { id: 5, title: "Trading with Institutions", content: "Use dark pool signals as confirmation for your trade ideas. When institutions are accumulating, consider going long." }
  ],
  'quant': [
    { id: 1, title: "Quantitative Trading System", content: "Advanced quantitative analysis combining multiple technical indicators, sentiment data, and AI to generate weighted trading signals." },
    { id: 2, title: "Multi-Factor Analysis", content: "The system analyzes RSI, MACD, Stochastic, Bollinger Bands, multiple EMAs, volume indicators, and market sentiment." },
    { id: 3, title: "Signal Generation", content: "Signals range from Strong Buy to Strong Sell, with confidence scores. Higher confidence indicates stronger factor agreement." },
    { id: 4, title: "Technical View", content: "The Technical View tab shows all individual indicators and their current readings for deep analysis." },
    { id: 5, title: "Using the Signals", content: "Best results come from trading in the direction of Strong Buy/Sell signals with >70% confidence, aligned with the overall trend." }
  ],
  'reversal': [
    { id: 1, title: "Reversal Detection AI", content: "Identify potential market reversals using divergence analysis, sentiment extremes, and AI-powered confirmation." },
    { id: 2, title: "Divergence Analysis", content: "The system detects RSI and MACD divergences - when price makes new highs/lows but the indicator doesn't confirm." },
    { id: 3, title: "Sentiment Extremes", content: "Extreme fear or greed readings often precede reversals. The Fear & Greed Index helps identify these extremes." },
    { id: 4, title: "Support/Resistance", content: "Reversals are more reliable at key support/resistance levels. The system identifies these pivot points automatically." },
    { id: 5, title: "Trade Setup", content: "A valid reversal signal includes: divergence + sentiment extreme + key level. Wait for price confirmation before entering." }
  ],
  'secret-sauce': [
    { id: 1, title: "Secret Sauce Strategy", content: "The ultimate Smart Money Concepts (SMC) trading system combining liquidity sweeps, FVG fills, ORB, and 5-gate confluence." },
    { id: 2, title: "Liquidity Sweeps", content: "Identify where stop-losses cluster (above highs, below lows). Smart money sweeps these levels before reversing." },
    { id: 3, title: "Fair Value Gaps (FVG)", content: "Price imbalances create gaps that often get filled. Use FVGs as entry zones after a liquidity sweep." },
    { id: 4, title: "5-Gate Confluence", content: "Validate setups with 5 factors: liquidity sweep, market structure shift, FVG entry, proper R:R, and session timing." },
    { id: 5, title: "Execution", content: "Enter on FVG fill after sweep, stop below recent low (for longs), target previous high or 2:1 minimum R:R." }
  ],
  'supply-demand': [
    { id: 1, title: "Supply & Demand Scanner", content: "Identify institutional supply and demand zones where large players have entered the market, creating areas of support/resistance." },
    { id: 2, title: "Demand Zones", content: "Areas where institutional buying occurred. Price often bounces from these zones as unfilled buy orders still exist." },
    { id: 3, title: "Supply Zones", content: "Areas of institutional selling. Price tends to reverse down from supply zones due to remaining sell orders." },
    { id: 4, title: "Zone Strength", content: "Fresh zones (never tested) are strongest. Zones become weaker each time they're tested as orders get filled." },
    { id: 5, title: "Trading Zones", content: "Look to buy at demand zones with stops below, sell at supply zones with stops above. Best setups have 2:1 R:R minimum." }
  ],
  'timeseries': [
    { id: 1, title: "Time Series Predictions", content: "AI-powered price forecasting using statistical models, moving averages, and machine learning to predict future price movements." },
    { id: 2, title: "Historical Analysis", content: "The system analyzes historical price data to identify patterns, trends, and seasonality that may repeat." },
    { id: 3, title: "Prediction Models", content: "Multiple models (EMA, RSI, volatility analysis) are combined to generate predictions with confidence intervals." },
    { id: 4, title: "Trend Detection", content: "The AI classifies the trend as bullish, bearish, neutral, or volatile. Trade in the direction of the primary trend." },
    { id: 5, title: "Using Forecasts", content: "Predictions are probabilistic, not guarantees. Use them as one input alongside other analysis and risk management." }
  ],
  'income-machine': [
    { id: 1, title: "Income Machine", content: "Options scanner designed to find consistent income-generating opportunities through premium selling strategies." },
    { id: 2, title: "Credit Spreads", content: "The scanner identifies optimal credit spread opportunities - selling premium at high IV with defined risk." },
    { id: 3, title: "Wheel Strategy", content: "Find stocks suitable for selling cash-secured puts and covered calls - the 'Wheel' income strategy." },
    { id: 4, title: "IV Rank Analysis", content: "High IV Rank (>50%) means options are expensive relative to history - ideal for selling premium." },
    { id: 5, title: "Risk Management", content: "Each setup shows max profit, max loss, probability of profit, and break-even points. Never risk more than 2-5% per trade." }
  ],
  'institutional': [
    { id: 1, title: "Institutional Terminal", content: "Professional-grade multi-source data terminal aggregating institutional-level market data and analysis tools." },
    { id: 2, title: "Multi-Source Data", content: "Data from multiple premium sources is aggregated and normalized for comprehensive market analysis." },
    { id: 3, title: "Institutional Ownership", content: "Track which institutions own positions, changes in ownership, and concentration of holdings." },
    { id: 4, title: "Options Flow", content: "Monitor large options trades that may indicate institutional positioning and expectations." },
    { id: 5, title: "Following Smart Money", content: "Use institutional data as confirmation. When institutions accumulate with positive flow, it's a bullish signal." }
  ],
  'whale-shield': [
    { id: 1, title: "Whale Shield Protection", content: "Protect your trades by understanding where 'whales' (large traders) are positioned through Max Pain and Put/Call Ratio analysis." },
    { id: 2, title: "Max Pain", content: "The price at which most options expire worthless. Price often gravitates toward Max Pain near expiration." },
    { id: 3, title: "Put/Call Ratio (PCR)", content: "The ratio of put volume to call volume. High PCR (>1.2) indicates bearish sentiment; low PCR (<0.7) indicates bullish sentiment." },
    { id: 4, title: "Sweep Verification", content: "Large option sweeps across multiple exchanges often indicate urgent institutional positioning." },
    { id: 5, title: "Using Whale Shield", content: "Avoid taking positions against whale positioning. If Max Pain is significantly higher, expect upward price pressure." }
  ],
  'futures': [
    { id: 1, title: "Futures Trading Desk", content: "Specialized analysis for Gold and Silver futures trading with real-time quotes, technicals, and AI insights." },
    { id: 2, title: "Contract Specifications", content: "Understand contract sizes, tick values, and margin requirements before trading futures." },
    { id: 3, title: "Correlation Analysis", content: "Gold and Silver often move together but with different magnitudes. The system tracks this relationship." },
    { id: 4, title: "Technical Levels", content: "Key support/resistance levels, pivot points, and Fibonacci levels are calculated automatically." },
    { id: 5, title: "Risk Management", content: "Futures are leveraged instruments. Always use stop-losses and size positions appropriately for your account." }
  ],
  'intermarket': [
    { id: 1, title: "Intermarket Analysis", content: "Analyze cross-asset correlations to understand how different markets (stocks, bonds, commodities, currencies) influence each other." },
    { id: 2, title: "Asset Correlations", content: "See real-time correlation coefficients between major asset classes. Strong correlations help predict movements." },
    { id: 3, title: "Risk-On/Risk-Off", content: "Identify market regimes. Risk-on favors stocks and commodities; risk-off favors bonds and safe-haven currencies." },
    { id: 4, title: "Sector Rotation", content: "Money flows between sectors based on economic cycles. Track where capital is moving." },
    { id: 5, title: "Trading Applications", content: "Use intermarket signals as confirmation. A bullish stock setup is stronger when bonds are weak and VIX is falling." }
  ],
  'scalping': [
    { id: 1, title: "High-Frequency Trading", content: "Real-time scalping system for 1-minute and 5-minute timeframe execution with 4 confluence entry conditions." },
    { id: 2, title: "Entry Conditions", content: "4 conditions must align: Momentum (RSI/MACD), Structure (FVG/S&R), Volatility (Bollinger), Sentiment (Fear & Greed)." },
    { id: 3, title: "Signal Requirements", content: "Signals only generate when 3+ of 4 conditions align. This filter eliminates low-quality setups." },
    { id: 4, title: "Exit Rules", content: "Take profit at 1.5x ATR from entry. Hard stop at 0.5% loss. These rules are non-negotiable." },
    { id: 5, title: "Execution Speed", content: "Scalping requires quick execution. Use the Live Scanner for real-time alerts and be ready to act immediately." }
  ],
  'stock-research': [
    { id: 1, title: "Stock Research Assistant", content: "AI-powered deep research tool for comprehensive stock analysis including fundamentals, technicals, and news." },
    { id: 2, title: "Company Analysis", content: "Get detailed company information, financial metrics, earnings history, and analyst ratings." },
    { id: 3, title: "Technical Analysis", content: "Charts with key technical indicators, support/resistance levels, and pattern recognition." },
    { id: 4, title: "News Integration", content: "Recent news and sentiment analysis to understand catalysts that may affect the stock." },
    { id: 5, title: "Research Reports", content: "Generate comprehensive research reports combining all analysis for better decision-making." }
  ],
  'market-intelligence': [
    { id: 1, title: "Market Intelligence Hub", content: "Tri-factor Bitcoin analysis combining on-chain metrics, technical analysis, and market sentiment for complete market understanding." },
    { id: 2, title: "On-Chain Metrics", content: "Track blockchain data: active addresses, transaction volume, whale movements, and exchange flows." },
    { id: 3, title: "Technical Analysis", content: "Price action, trend analysis, and key technical indicators specific to cryptocurrency markets." },
    { id: 4, title: "Sentiment Analysis", content: "Social media sentiment, Fear & Greed Index, and market positioning data." },
    { id: 5, title: "Signal Synthesis", content: "The three factors are combined to generate a unified market outlook with confidence scores." }
  ],
  'universal-forecaster': [
    { id: 1, title: "Universal AI Forecaster", content: "Multi-asset AI prediction system that forecasts price movements across stocks, crypto, forex, and commodities." },
    { id: 2, title: "Multi-Asset Support", content: "Analyze any asset class with the same powerful AI engine. Enter any symbol to get predictions." },
    { id: 3, title: "Forecast Timeframes", content: "Get short-term (1-7 days), medium-term (1-4 weeks), and long-term (1-3 months) predictions." },
    { id: 4, title: "Confidence Scoring", content: "Each forecast includes a confidence score. Higher confidence predictions are more reliable." },
    { id: 5, title: "Alert Integration", content: "Set alerts on forecasts to be notified when price approaches predicted targets or stops." }
  ],
  'daily-checklist': [
    { id: 1, title: "Daily Trading Checklist", content: "Your pre-market and trading day workflow to ensure consistent, disciplined trading." },
    { id: 2, title: "Pre-Market Prep", content: "Review overnight news, check futures, identify key levels, and scan for opportunities before the open." },
    { id: 3, title: "Trading Session", content: "Follow your trading plan, manage open positions, and document all trades in your journal." },
    { id: 4, title: "End of Day Review", content: "Review trades, update journal, prepare watchlist for next day, and calculate P&L." },
    { id: 5, title: "Building Habits", content: "Check off items daily to build consistent trading habits. Consistency leads to profitability." }
  ],
  'ai-trading-plan': [
    { id: 1, title: "AI Trading Plan", content: "Your personal portfolio tracker and AI-powered trading advisor for strategic portfolio management." },
    { id: 2, title: "Portfolio Tracking", content: "Add your positions and the system tracks performance, allocation, and overall portfolio health." },
    { id: 3, title: "AI Advisor", content: "Get AI recommendations for rebalancing, position sizing, and risk management based on your portfolio." },
    { id: 4, title: "Performance Metrics", content: "Track win rate, average gain/loss, Sharpe ratio, and other key performance indicators." },
    { id: 5, title: "Goal Setting", content: "Set trading goals and track progress. The AI provides guidance to help you reach your targets." }
  ],
  'data-sources': [
    { id: 1, title: "Data Sources Hub", content: "Access multiple premium data sources including Bloomberg-style data, Refinitiv feeds, and multi-source aggregation." },
    { id: 2, title: "Source Selection", content: "Choose from available data sources based on your needs. Each source has different strengths and coverage." },
    { id: 3, title: "Data Quality", content: "Real-time quality indicators show data freshness, reliability, and any delays or issues." },
    { id: 4, title: "Custom Feeds", content: "Configure custom data feeds combining multiple sources for comprehensive market coverage." },
    { id: 5, title: "API Access", content: "Developer tools for integrating data into your own applications and trading systems." }
  ],
  'institutional-scanner': [
    { id: 1, title: "Institutional Scanner", content: "Unified multi-system analysis combining all institutional detection tools in one powerful scanner." },
    { id: 2, title: "Aggregated Signals", content: "Signals from dark pools, options flow, whale activity, and institutional ownership are combined and ranked." },
    { id: 3, title: "Strength Scoring", content: "Each stock receives an institutional strength score based on multiple factors. Higher is better." },
    { id: 4, title: "Filter Options", content: "Filter by sector, market cap, signal type, and minimum strength to find exactly what you're looking for." },
    { id: 5, title: "Quick Analysis", content: "Click any signal for detailed breakdown of all institutional factors affecting that stock." }
  ]
};
