import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  RotateCcw,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'quiz' | 'simulation';
  quizOptions?: { label: string; correct: boolean; explanation: string }[];
  simulationData?: SimulationData;
}

interface SimulationData {
  scenario: string;
  initialPrice: number;
  priceHistory: number[];
  correctAction: 'buy' | 'sell' | 'wait';
  indicators: {
    rsi: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    volume: 'high' | 'normal' | 'low';
    support: number;
    resistance: number;
  };
  explanation: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'technical' | 'risk' | 'psychology';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: TutorialStep[];
  icon: any;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'support-resistance',
    title: 'Support & Resistance Levels',
    description: 'Learn to identify key price levels where buying or selling pressure is likely to occur.',
    category: 'technical',
    difficulty: 'beginner',
    duration: '10 min',
    icon: Target,
    steps: [
      {
        id: 'sr-intro',
        title: 'What are Support & Resistance?',
        type: 'info',
        content: `**Support** is a price level where a stock tends to stop falling and bounce back up. Think of it as a "floor" that catches the price.

**Resistance** is a price level where a stock tends to stop rising and fall back down. Think of it as a "ceiling" that blocks upward movement.

These levels form because of trader psychology - many traders remember these price points and act accordingly.`
      },
      {
        id: 'sr-identify',
        title: 'How to Identify These Levels',
        type: 'info',
        content: `Look for areas where price has:
- **Bounced multiple times** - The more touches, the stronger the level
- **Previous highs and lows** - Old highs become resistance, old lows become support
- **Round numbers** - Psychological levels like $100, $50, etc.
- **High volume areas** - Where lots of trading occurred

**Pro Tip:** When support breaks, it often becomes resistance (and vice versa). This is called "role reversal."`
      },
      {
        id: 'sr-quiz-1',
        title: 'Quick Check',
        type: 'quiz',
        content: 'A stock has bounced off $45 three times in the past month. What does $45 represent?',
        quizOptions: [
          { label: 'Resistance level', correct: false, explanation: 'Resistance is a ceiling that blocks upward movement.' },
          { label: 'Support level', correct: true, explanation: 'Correct! A price that the stock bounces UP from is support - it acts as a floor.' },
          { label: 'Moving average', correct: false, explanation: 'Moving averages are calculated indicators, not natural price levels.' }
        ]
      },
      {
        id: 'sr-simulation',
        title: 'Practice: Identify the Trade',
        type: 'simulation',
        content: 'Analyze this chart and decide what action to take.',
        simulationData: {
          scenario: 'AAPL is approaching a strong support level at $175 after falling from $185. RSI shows oversold conditions.',
          initialPrice: 176.50,
          priceHistory: [185, 183, 181, 179, 177, 176.50],
          correctAction: 'buy',
          indicators: {
            rsi: 28,
            trend: 'bearish',
            volume: 'high',
            support: 175,
            resistance: 185
          },
          explanation: 'With price near strong support ($175), oversold RSI (28), and high volume, this is a potential bounce opportunity. A buy near support with a stop just below $175 offers good risk/reward.'
        }
      }
    ]
  },
  {
    id: 'risk-management',
    title: 'Risk Management Fundamentals',
    description: 'Master position sizing, stop losses, and protecting your capital.',
    category: 'risk',
    difficulty: 'beginner',
    duration: '12 min',
    icon: AlertTriangle,
    steps: [
      {
        id: 'risk-intro',
        title: 'Why Risk Management Matters',
        type: 'info',
        content: `Risk management is the **#1 factor** that separates successful traders from those who blow up their accounts.

**The 2% Rule:** Never risk more than 2% of your total capital on a single trade.

Example: With a $10,000 account, your maximum loss per trade should be $200.

This means even 10 consecutive losses only costs you 20% of your account - painful but recoverable.`
      },
      {
        id: 'risk-position',
        title: 'Position Sizing Formula',
        type: 'info',
        content: `**Position Size = Risk Amount / (Entry Price - Stop Loss)**

Example:
- Account: $10,000
- Risk per trade: 2% = $200
- Entry: $50
- Stop Loss: $48 (you're risking $2 per share)

Position Size = $200 / $2 = **100 shares**

This ensures you never lose more than your planned risk amount.`
      },
      {
        id: 'risk-quiz',
        title: 'Calculate Your Position',
        type: 'quiz',
        content: 'You have a $5,000 account and want to risk 2%. Entry is $25, stop loss is $23. How many shares can you buy?',
        quizOptions: [
          { label: '50 shares', correct: true, explanation: 'Correct! Risk = $100, Price risk = $2, so 100/2 = 50 shares.' },
          { label: '100 shares', correct: false, explanation: 'That would risk $200 (4% of account), double your limit.' },
          { label: '200 shares', correct: false, explanation: 'That would risk $400 (8% of account), way too much.' }
        ]
      },
      {
        id: 'risk-simulation',
        title: 'Practice: Risk/Reward Analysis',
        type: 'simulation',
        content: 'Evaluate this trade setup for risk/reward.',
        simulationData: {
          scenario: 'NVDA setup: Entry at $450, support at $440, resistance target at $480. Should you take this trade?',
          initialPrice: 450,
          priceHistory: [440, 445, 448, 452, 447, 450],
          correctAction: 'buy',
          indicators: {
            rsi: 52,
            trend: 'bullish',
            volume: 'normal',
            support: 440,
            resistance: 480
          },
          explanation: 'Risk is $10 (450-440), reward is $30 (480-450). That is a 3:1 reward-to-risk ratio - excellent! With neutral RSI and bullish trend, this setup has favorable odds.'
        }
      }
    ]
  },
  {
    id: 'trend-trading',
    title: 'Trading with the Trend',
    description: 'Learn to identify and trade in the direction of the primary trend.',
    category: 'technical',
    difficulty: 'intermediate',
    duration: '15 min',
    icon: TrendingUp,
    steps: [
      {
        id: 'trend-intro',
        title: 'The Power of Trend Following',
        type: 'info',
        content: `**"The trend is your friend"** - This old saying holds powerful truth.

Trading WITH the trend significantly improves your win rate because:
- Momentum tends to continue
- Large players (institutions) drive trends
- Fighting the trend means fighting smart money

**Key Rule:** In an uptrend, look for buying opportunities. In a downtrend, look for selling/shorting opportunities.`
      },
      {
        id: 'trend-identify',
        title: 'How to Identify the Trend',
        type: 'info',
        content: `**Higher Highs + Higher Lows = Uptrend**
Each peak is higher than the last, each dip is higher than the last.

**Lower Highs + Lower Lows = Downtrend**
Each peak is lower than the last, each dip is lower than the last.

**Moving Averages:**
- Price above 20 EMA = Short-term bullish
- Price above 50 SMA = Medium-term bullish
- Price above 200 SMA = Long-term bullish

**Pro Tip:** The strongest setups occur when all timeframes align.`
      },
      {
        id: 'trend-quiz',
        title: 'Trend Identification',
        type: 'quiz',
        content: 'A stock made highs at $50, $48, $46 and lows at $45, $43, $41. What is the trend?',
        quizOptions: [
          { label: 'Uptrend', correct: false, explanation: 'An uptrend would show higher highs and higher lows.' },
          { label: 'Downtrend', correct: true, explanation: 'Correct! Lower highs ($50→$48→$46) and lower lows ($45→$43→$41) = downtrend.' },
          { label: 'Sideways/No trend', correct: false, explanation: 'Sideways would show similar highs and lows, not progressively lower.' }
        ]
      },
      {
        id: 'trend-simulation',
        title: 'Practice: Trend Trade Entry',
        type: 'simulation',
        content: 'The market is in a clear uptrend. Price has pulled back to the 20 EMA. What do you do?',
        simulationData: {
          scenario: 'MSFT is in an uptrend, making higher highs and higher lows. It just pulled back to touch the 20 EMA with RSI at 45.',
          initialPrice: 420,
          priceHistory: [400, 410, 405, 420, 415, 430, 420],
          correctAction: 'buy',
          indicators: {
            rsi: 45,
            trend: 'bullish',
            volume: 'normal',
            support: 415,
            resistance: 440
          },
          explanation: 'In an uptrend, pullbacks to the 20 EMA are ideal buying opportunities. RSI at 45 is neutral (not overbought), and the trend remains intact. This is a high-probability long entry.'
        }
      }
    ]
  },
  {
    id: 'trading-psychology',
    title: 'Trading Psychology Mastery',
    description: 'Control emotions and develop the mindset of a professional trader.',
    category: 'psychology',
    difficulty: 'intermediate',
    duration: '10 min',
    icon: Lightbulb,
    steps: [
      {
        id: 'psych-intro',
        title: 'Your Biggest Enemy: Yourself',
        type: 'info',
        content: `Most traders fail not because of bad strategies, but because of **emotional decisions**.

**Fear** causes you to:
- Exit winners too early
- Avoid good setups
- Hesitate on entries

**Greed** causes you to:
- Hold losers hoping they recover
- Overtrade
- Take excessive risk

The solution? **Have a plan and follow it mechanically.**`
      },
      {
        id: 'psych-rules',
        title: 'Building Mental Discipline',
        type: 'info',
        content: `**Pre-Trade Checklist:**
1. Does this setup match my strategy criteria?
2. Is my position size correct for my risk rules?
3. Do I have a clear stop loss and target?
4. Am I trading based on analysis, not emotion?

**During Trade:**
- Set your stop loss immediately after entry
- Don't move your stop further away
- Let winners run to target
- Accept that losses are part of the game

**Remember:** A losing trade following your rules is a GOOD trade. A winning trade breaking your rules is a BAD trade.`
      },
      {
        id: 'psych-quiz',
        title: 'Psychology Check',
        type: 'quiz',
        content: 'Your trade hits your stop loss for a $100 loss. You immediately see another setup. What should you do?',
        quizOptions: [
          { label: 'Take the trade to recover the loss', correct: false, explanation: 'This is revenge trading - one of the most destructive patterns. Never trade to recover losses.' },
          { label: 'Wait, review the loss, then decide calmly', correct: true, explanation: 'Correct! Take a break, analyze what happened, and only trade again when emotionally neutral.' },
          { label: 'Double your position size to recover faster', correct: false, explanation: 'This is extremely dangerous and violates risk management. Never increase size after a loss.' }
        ]
      },
      {
        id: 'psych-simulation',
        title: 'Practice: Emotional Control',
        type: 'simulation',
        content: 'You are in a winning trade. Price suddenly drops 2% but is still above your stop loss.',
        simulationData: {
          scenario: 'Your GOOGL long is up $500. Price suddenly drops but is still $5 above your stop loss. Your target is $15 above current price.',
          initialPrice: 175,
          priceHistory: [170, 172, 175, 180, 178, 175],
          correctAction: 'wait',
          indicators: {
            rsi: 55,
            trend: 'bullish',
            volume: 'high',
            support: 170,
            resistance: 190
          },
          explanation: 'The correct action is to WAIT. Your stop is intact, your target is still valid. Normal volatility causes temporary pullbacks. Trust your plan - do not panic sell just because of a small drawdown.'
        }
      }
    ]
  },
  {
    id: 'candlestick-patterns',
    title: 'Essential Candlestick Patterns',
    description: 'Read price action through candlestick patterns and predict reversals.',
    category: 'technical',
    difficulty: 'beginner',
    duration: '12 min',
    icon: TrendingDown,
    steps: [
      {
        id: 'candle-intro',
        title: 'Understanding Candlesticks',
        type: 'info',
        content: `Each candlestick tells a story of the battle between buyers and sellers.

**Anatomy:**
- **Body:** The thick part showing open-to-close range
- **Wicks/Shadows:** The thin lines showing high and low
- **Green/White:** Price closed higher than it opened (bullish)
- **Red/Black:** Price closed lower than it opened (bearish)

**What to look for:**
- Long bodies = Strong conviction
- Long wicks = Rejection of price levels
- Small bodies = Indecision`
      },
      {
        id: 'candle-reversal',
        title: 'Powerful Reversal Patterns',
        type: 'info',
        content: `**Bullish Patterns (potential bottom):**
- **Hammer:** Small body, long lower wick - buyers rejected lower prices
- **Bullish Engulfing:** Large green candle swallows previous red candle
- **Morning Star:** Three-candle pattern showing shift from sellers to buyers

**Bearish Patterns (potential top):**
- **Shooting Star:** Small body, long upper wick - sellers rejected higher prices
- **Bearish Engulfing:** Large red candle swallows previous green candle
- **Evening Star:** Three-candle pattern showing shift from buyers to sellers

**Key:** These patterns work best at support/resistance levels!`
      },
      {
        id: 'candle-quiz',
        title: 'Pattern Recognition',
        type: 'quiz',
        content: 'After a downtrend, you see a candle with a small body at the top and a very long lower wick. What pattern is this?',
        quizOptions: [
          { label: 'Shooting Star', correct: false, explanation: 'Shooting Star has a long UPPER wick and appears at tops, not bottoms.' },
          { label: 'Hammer', correct: true, explanation: 'Correct! A Hammer has a small body at top with long lower wick, appearing at bottoms. It signals potential reversal upward.' },
          { label: 'Doji', correct: false, explanation: 'A Doji has almost no body (open equals close), showing pure indecision.' }
        ]
      },
      {
        id: 'candle-simulation',
        title: 'Practice: Read the Candles',
        type: 'simulation',
        content: 'A hammer candle formed at a key support level. What action do you take?',
        simulationData: {
          scenario: 'AMD has dropped to $150 support. Today formed a hammer candle with strong volume. RSI is oversold at 25.',
          initialPrice: 152,
          priceHistory: [165, 160, 155, 150, 148, 152],
          correctAction: 'buy',
          indicators: {
            rsi: 25,
            trend: 'bearish',
            volume: 'high',
            support: 150,
            resistance: 165
          },
          explanation: 'The hammer at support with oversold RSI and high volume is a classic reversal setup. Enter long with stop just below the hammer low ($148). Target the next resistance level.'
        }
      }
    ]
  }
];

export default function InteractiveTutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [simulationAction, setSimulationAction] = useState<string | null>(null);
  const [showSimulationResult, setShowSimulationResult] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('tutorial-progress');
    if (saved) {
      const { completed, tutorials } = JSON.parse(saved);
      setCompletedSteps(new Set(completed || []));
      setCompletedTutorials(new Set(tutorials || []));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tutorial-progress', JSON.stringify({
      completed: Array.from(completedSteps),
      tutorials: Array.from(completedTutorials)
    }));
  }, [completedSteps, completedTutorials]);

  const currentStep = selectedTutorial?.steps[currentStepIndex];
  const progress = selectedTutorial 
    ? ((currentStepIndex + 1) / selectedTutorial.steps.length) * 100 
    : 0;

  const handleNext = () => {
    if (!selectedTutorial || !currentStep) return;
    
    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep.id]));
    
    if (currentStepIndex < selectedTutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setSimulationAction(null);
      setShowSimulationResult(false);
    } else {
      setCompletedTutorials(prev => new Set([...Array.from(prev), selectedTutorial.id]));
      setSelectedTutorial(null);
      setCurrentStepIndex(0);
    }
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleSimulationAction = (action: string) => {
    setSimulationAction(action);
    setShowSimulationResult(true);
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    setCompletedTutorials(new Set());
    localStorage.removeItem('tutorial-progress');
  };

  const filteredTutorials = activeCategory === 'all' 
    ? TUTORIALS 
    : TUTORIALS.filter(t => t.category === activeCategory);

  const totalProgress = (completedTutorials.size / TUTORIALS.length) * 100;

  if (selectedTutorial && currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedTutorial(null);
                setCurrentStepIndex(0);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setSimulationAction(null);
                setShowSimulationResult(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Tutorials
            </Button>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                  Step {currentStepIndex + 1} of {selectedTutorial.steps.length}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={
                    currentStep.type === 'info' ? 'text-blue-400 border-blue-400' :
                    currentStep.type === 'quiz' ? 'text-yellow-400 border-yellow-400' :
                    'text-green-400 border-green-400'
                  }
                >
                  {currentStep.type === 'info' ? 'Learn' : currentStep.type === 'quiz' ? 'Quiz' : 'Practice'}
                </Badge>
              </div>
              <Progress value={progress} className="h-2 mb-4" />
              <CardTitle className="text-2xl text-white">{currentStep.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep.type === 'info' && (
                <div className="prose prose-invert max-w-none">
                  {currentStep.content.split('\n').map((line, i) => (
                    <p key={i} className="text-slate-300 leading-relaxed">
                      {line.split('**').map((part, j) => 
                        j % 2 === 1 ? <strong key={j} className="text-cyan-400">{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>
              )}

              {currentStep.type === 'quiz' && currentStep.quizOptions && (
                <div className="space-y-4">
                  <p className="text-lg text-white">{currentStep.content}</p>
                  <div className="space-y-3">
                    {currentStep.quizOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={showExplanation}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedAnswer === index
                            ? option.correct
                              ? 'bg-green-500/20 border-green-500 text-green-400'
                              : 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-cyan-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {showExplanation && selectedAnswer !== null && (
                    <div className={`p-4 rounded-lg ${
                      currentStep.quizOptions[selectedAnswer].correct 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {currentStep.quizOptions[selectedAnswer].correct ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={currentStep.quizOptions[selectedAnswer].correct ? 'text-green-400' : 'text-red-400'}>
                          {currentStep.quizOptions[selectedAnswer].correct ? 'Correct!' : 'Not quite...'}
                        </span>
                      </div>
                      <p className="text-slate-300">{currentStep.quizOptions[selectedAnswer].explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep.type === 'simulation' && currentStep.simulationData && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                    <h4 className="text-cyan-400 font-semibold mb-2">Scenario</h4>
                    <p className="text-slate-300">{currentStep.simulationData.scenario}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 text-sm">Current Price</div>
                      <div className="text-xl font-bold text-white">${currentStep.simulationData.initialPrice}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 text-sm">RSI</div>
                      <div className={`text-xl font-bold ${
                        currentStep.simulationData.indicators.rsi < 30 ? 'text-green-400' :
                        currentStep.simulationData.indicators.rsi > 70 ? 'text-red-400' : 'text-yellow-400'
                      }`}>{currentStep.simulationData.indicators.rsi}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 text-sm">Support</div>
                      <div className="text-xl font-bold text-green-400">${currentStep.simulationData.indicators.support}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 text-sm">Resistance</div>
                      <div className="text-xl font-bold text-red-400">${currentStep.simulationData.indicators.resistance}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                    <div className="text-slate-400 text-sm mb-2">Price Action</div>
                    <div className="flex items-end gap-1 h-24">
                      {currentStep.simulationData.priceHistory.map((price, i) => {
                        const min = Math.min(...currentStep.simulationData!.priceHistory);
                        const max = Math.max(...currentStep.simulationData!.priceHistory);
                        const height = ((price - min) / (max - min)) * 100 || 50;
                        const isLast = i === currentStep.simulationData!.priceHistory.length - 1;
                        const isUp = i > 0 && price > currentStep.simulationData!.priceHistory[i-1];
                        return (
                          <div 
                            key={i}
                            className={`flex-1 rounded-t ${isLast ? 'bg-cyan-500' : isUp ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {!showSimulationResult ? (
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => handleSimulationAction('buy')}
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        BUY
                      </Button>
                      <Button 
                        onClick={() => handleSimulationAction('wait')}
                        variant="outline"
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 px-8"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        WAIT
                      </Button>
                      <Button 
                        onClick={() => handleSimulationAction('sell')}
                        className="bg-red-600 hover:bg-red-700 text-white px-8"
                      >
                        <ArrowDown className="w-4 h-4 mr-2" />
                        SELL
                      </Button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg ${
                      simulationAction === currentStep.simulationData.correctAction
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-yellow-500/10 border border-yellow-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {simulationAction === currentStep.simulationData.correctAction ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-semibold">Excellent Decision!</span>
                          </>
                        ) : (
                          <>
                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-400 font-semibold">Good try! Here's the optimal approach:</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-300">{currentStep.simulationData.explanation}</p>
                      <p className="text-slate-400 mt-2">
                        Best action: <span className="text-cyan-400 font-semibold uppercase">{currentStep.simulationData.correctAction}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-700">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentStepIndex > 0) {
                      setCurrentStepIndex(prev => prev - 1);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      setSimulationAction(null);
                      setShowSimulationResult(false);
                    }
                  }}
                  disabled={currentStepIndex === 0}
                  className="text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep.type === 'quiz' && !showExplanation) ||
                    (currentStep.type === 'simulation' && !showSimulationResult)
                  }
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {currentStepIndex === selectedTutorial.steps.length - 1 ? 'Complete Tutorial' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-cyan-400" />
              Interactive Tutorials
            </h1>
            <p className="text-slate-400 mt-2">Learn trading concepts through hands-on practice and simulations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-slate-400 text-sm">Overall Progress</div>
              <div className="text-2xl font-bold text-cyan-400">{Math.round(totalProgress)}%</div>
            </div>
            <Button variant="ghost" onClick={resetProgress} className="text-slate-400">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Progress value={totalProgress} className="h-2 mb-8" />

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="all" onClick={() => setActiveCategory('all')}>All</TabsTrigger>
            <TabsTrigger value="basics" onClick={() => setActiveCategory('basics')}>Basics</TabsTrigger>
            <TabsTrigger value="technical" onClick={() => setActiveCategory('technical')}>Technical</TabsTrigger>
            <TabsTrigger value="risk" onClick={() => setActiveCategory('risk')}>Risk</TabsTrigger>
            <TabsTrigger value="psychology" onClick={() => setActiveCategory('psychology')}>Psychology</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map(tutorial => {
            const Icon = tutorial.icon;
            const isCompleted = completedTutorials.has(tutorial.id);
            const stepsCompleted = tutorial.steps.filter(s => completedSteps.has(s.id)).length;
            const tutorialProgress = (stepsCompleted / tutorial.steps.length) * 100;

            return (
              <Card 
                key={tutorial.id}
                className={`bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer ${
                  isCompleted ? 'ring-2 ring-green-500/30' : ''
                }`}
                onClick={() => {
                  setSelectedTutorial(tutorial);
                  setCurrentStepIndex(0);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${
                      isCompleted ? 'bg-green-500/20' : 'bg-cyan-500/20'
                    }`}>
                      {isCompleted ? (
                        <Award className="w-6 h-6 text-green-400" />
                      ) : (
                        <Icon className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={
                        tutorial.difficulty === 'beginner' ? 'text-green-400 border-green-400' :
                        tutorial.difficulty === 'intermediate' ? 'text-yellow-400 border-yellow-400' :
                        'text-red-400 border-red-400'
                      }>
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white mt-4">{tutorial.title}</CardTitle>
                  <CardDescription className="text-slate-400">{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {tutorial.duration}
                    </span>
                    <span>{tutorial.steps.length} steps</span>
                  </div>
                  <Progress value={tutorialProgress} className="h-1" />
                  <div className="flex justify-between mt-4">
                    <span className="text-slate-400 text-sm">
                      {stepsCompleted}/{tutorial.steps.length} completed
                    </span>
                    <Button size="sm" className={isCompleted ? 'bg-green-600' : 'bg-cyan-600'}>
                      {isCompleted ? 'Review' : stepsCompleted > 0 ? 'Continue' : 'Start'}
                      <Play className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
