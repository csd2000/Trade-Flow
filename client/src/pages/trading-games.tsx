import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gamepad2, 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Star,
  Clock,
  Newspaper,
  LineChart
} from 'lucide-react';

interface GameScore {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

interface CandlestickPattern {
  name: string;
  description: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  pattern: string[];
}

interface RiskRewardScenario {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  correctRR: string;
  options: string[];
}

interface SupportResistanceLevel {
  prices: number[];
  correctLevel: number;
  type: 'support' | 'resistance';
}

interface NewsEvent {
  headline: string;
  impact: 'positive' | 'negative' | 'neutral';
  correctAction: 'buy' | 'sell' | 'hold';
  explanation: string;
}

const candlestickPatterns: CandlestickPattern[] = [
  { name: 'Hammer', description: 'Small body at top, long lower wick', signal: 'bullish', pattern: ['▁', '│', '▄'] },
  { name: 'Doji', description: 'Open and close nearly equal', signal: 'neutral', pattern: ['─', '│', '─'] },
  { name: 'Engulfing Bullish', description: 'Green candle engulfs previous red', signal: 'bullish', pattern: ['▃', '▇'] },
  { name: 'Engulfing Bearish', description: 'Red candle engulfs previous green', signal: 'bearish', pattern: ['▇', '▃'] },
  { name: 'Morning Star', description: 'Three candle reversal pattern', signal: 'bullish', pattern: ['▃', '▁', '▆'] },
  { name: 'Evening Star', description: 'Three candle reversal pattern', signal: 'bearish', pattern: ['▆', '▁', '▃'] },
  { name: 'Shooting Star', description: 'Small body at bottom, long upper wick', signal: 'bearish', pattern: ['▄', '│', '▁'] },
  { name: 'Inverted Hammer', description: 'Small body at bottom, long upper wick after downtrend', signal: 'bullish', pattern: ['▁', '│', '▄'] },
];

const riskRewardScenarios: RiskRewardScenario[] = [
  { entry: 100, stopLoss: 95, takeProfit: 115, correctRR: '3:1', options: ['1:1', '2:1', '3:1', '4:1'] },
  { entry: 50, stopLoss: 48, takeProfit: 56, correctRR: '3:1', options: ['2:1', '3:1', '4:1', '5:1'] },
  { entry: 200, stopLoss: 190, takeProfit: 220, correctRR: '2:1', options: ['1:1', '2:1', '3:1', '1.5:1'] },
  { entry: 75, stopLoss: 70, takeProfit: 85, correctRR: '2:1', options: ['1:1', '2:1', '3:1', '2.5:1'] },
  { entry: 150, stopLoss: 145, takeProfit: 165, correctRR: '3:1', options: ['2:1', '3:1', '4:1', '2.5:1'] },
];

const newsEvents: NewsEvent[] = [
  { headline: 'Fed announces surprise 50bp rate cut', impact: 'positive', correctAction: 'buy', explanation: 'Rate cuts typically boost stock prices as borrowing becomes cheaper' },
  { headline: 'Company misses earnings by 30%', impact: 'negative', correctAction: 'sell', explanation: 'Significant earnings miss usually leads to price decline' },
  { headline: 'CEO announces stock buyback program', impact: 'positive', correctAction: 'buy', explanation: 'Buybacks reduce shares outstanding, increasing EPS' },
  { headline: 'Major lawsuit filed against company', impact: 'negative', correctAction: 'sell', explanation: 'Legal issues create uncertainty and potential liability' },
  { headline: 'Quarterly revenue in line with expectations', impact: 'neutral', correctAction: 'hold', explanation: 'Meeting expectations typically means no major price movement' },
  { headline: 'New product launch exceeds analyst projections', impact: 'positive', correctAction: 'buy', explanation: 'Strong product performance signals future growth' },
  { headline: 'Industry-wide supply chain disruption reported', impact: 'negative', correctAction: 'sell', explanation: 'Supply issues can hurt margins and revenue' },
  { headline: 'Inflation data comes in at expected levels', impact: 'neutral', correctAction: 'hold', explanation: 'Expected data is already priced in' },
];

function CandlestickQuiz({ onScoreUpdate }: { onScoreUpdate: (score: GameScore) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<GameScore>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(['bullish', 'bearish', 'neutral']);

  const currentPattern = candlestickPatterns[currentIndex];

  useEffect(() => {
    const allOptions = ['bullish', 'bearish', 'neutral'];
    setShuffledOptions([...allOptions].sort(() => Math.random() - 0.5));
  }, [currentIndex]);

  function handleAnswer(answer: string) {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentPattern.signal;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
      streak: isCorrect ? score.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(score.bestStreak, score.streak + 1) : score.bestStreak
    };
    setScore(newScore);
    onScoreUpdate(newScore);
  }

  function nextQuestion() {
    setShowResult(false);
    setSelectedAnswer(null);
    setCurrentIndex((prev) => (prev + 1) % candlestickPatterns.length);
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2">{currentPattern.name}</h3>
        <div className="flex justify-center gap-2 text-4xl mb-4">
          {currentPattern.pattern.map((p, i) => (
            <span key={i} className="text-amber-400">{p}</span>
          ))}
        </div>
        <p className="text-slate-400">{currentPattern.description}</p>
      </div>

      <div className="space-y-3">
        <p className="text-white font-medium text-center">What signal does this pattern indicate?</p>
        <div className="grid grid-cols-3 gap-3">
          {shuffledOptions.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={`py-6 ${
                showResult
                  ? option === currentPattern.signal
                    ? 'bg-green-600 hover:bg-green-600'
                    : option === selectedAnswer
                    ? 'bg-red-600 hover:bg-red-600'
                    : 'bg-slate-700'
                  : option === 'bullish'
                  ? 'bg-green-700 hover:bg-green-600'
                  : option === 'bearish'
                  ? 'bg-red-700 hover:bg-red-600'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {option === 'bullish' && <TrendingUp className="w-5 h-5 mr-2" />}
              {option === 'bearish' && <TrendingDown className="w-5 h-5 mr-2" />}
              {option === 'neutral' && <BarChart3 className="w-5 h-5 mr-2" />}
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className={`p-4 rounded-lg ${selectedAnswer === currentPattern.signal ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {selectedAnswer === currentPattern.signal ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={selectedAnswer === currentPattern.signal ? 'text-green-400' : 'text-red-400'}>
              {selectedAnswer === currentPattern.signal ? 'Correct!' : `Incorrect - The answer is ${currentPattern.signal}`}
            </span>
          </div>
          <Button onClick={nextQuestion} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
            Next Pattern <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

function RiskRewardChallenge({ onScoreUpdate }: { onScoreUpdate: (score: GameScore) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<GameScore>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const scenario = riskRewardScenarios[currentIndex];
  const risk = scenario.entry - scenario.stopLoss;
  const reward = scenario.takeProfit - scenario.entry;

  function handleAnswer(answer: string) {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === scenario.correctRR;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
      streak: isCorrect ? score.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(score.bestStreak, score.streak + 1) : score.bestStreak
    };
    setScore(newScore);
    onScoreUpdate(newScore);
  }

  function nextQuestion() {
    setShowResult(false);
    setSelectedAnswer(null);
    setCurrentIndex((prev) => (prev + 1) % riskRewardScenarios.length);
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Calculate the Risk/Reward Ratio</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 text-xs mb-1">Entry Price</p>
            <p className="text-xl font-bold text-white">${scenario.entry}</p>
          </div>
          <div className="p-3 bg-red-900/30 rounded-lg border border-red-500/30">
            <p className="text-red-400 text-xs mb-1">Stop Loss</p>
            <p className="text-xl font-bold text-white">${scenario.stopLoss}</p>
          </div>
          <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
            <p className="text-green-400 text-xs mb-1">Take Profit</p>
            <p className="text-xl font-bold text-white">${scenario.takeProfit}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-slate-400 text-sm">
            <span className="text-red-400">Risk:</span> ${risk} | <span className="text-green-400">Reward:</span> ${reward}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-white font-medium text-center">What is the Risk/Reward ratio?</p>
        <div className="grid grid-cols-2 gap-3">
          {scenario.options.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={`py-4 ${
                showResult
                  ? option === scenario.correctRR
                    ? 'bg-green-600 hover:bg-green-600'
                    : option === selectedAnswer
                    ? 'bg-red-600 hover:bg-red-600'
                    : 'bg-slate-700'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className={`p-4 rounded-lg ${selectedAnswer === scenario.correctRR ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {selectedAnswer === scenario.correctRR ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={selectedAnswer === scenario.correctRR ? 'text-green-400' : 'text-red-400'}>
              {selectedAnswer === scenario.correctRR ? 'Correct!' : `Incorrect - The answer is ${scenario.correctRR}`}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3">
            Reward ({reward}) ÷ Risk ({risk}) = {(reward / risk).toFixed(1)}:1
          </p>
          <Button onClick={nextQuestion} className="w-full bg-blue-600 hover:bg-blue-700">
            Next Scenario <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

function TradeTheNews({ onScoreUpdate }: { onScoreUpdate: (score: GameScore) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<GameScore>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);

  const event = newsEvents[currentIndex];

  useEffect(() => {
    if (showResult) return;
    
    if (timeLeft <= 0) {
      handleAnswer('timeout');
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  function handleAnswer(answer: string) {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === event.correctAction;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
      streak: isCorrect ? score.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(score.bestStreak, score.streak + 1) : score.bestStreak
    };
    setScore(newScore);
    onScoreUpdate(newScore);
  }

  function nextQuestion() {
    setShowResult(false);
    setSelectedAnswer(null);
    setTimeLeft(10);
    setCurrentIndex((prev) => (prev + 1) % newsEvents.length);
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900 rounded-xl border border-blue-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-400" />
            <Badge className="bg-red-600">BREAKING NEWS</Badge>
          </div>
          {!showResult && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft <= 3 ? 'bg-red-900/50 border border-red-500' : 'bg-slate-800 border border-slate-600'}`}>
              <Clock className={`w-4 h-4 ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span className={`font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold text-white">{event.headline}</h3>
      </div>

      <div className="space-y-3">
        <p className="text-white font-medium text-center">
          {showResult ? 'Result:' : 'How should you react to this news?'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {['buy', 'sell', 'hold'].map((action) => (
            <Button
              key={action}
              onClick={() => handleAnswer(action)}
              disabled={showResult}
              className={`py-6 ${
                showResult
                  ? action === event.correctAction
                    ? 'bg-green-600 hover:bg-green-600'
                    : action === selectedAnswer
                    ? 'bg-red-600 hover:bg-red-600'
                    : 'bg-slate-700'
                  : action === 'buy'
                  ? 'bg-green-700 hover:bg-green-600'
                  : action === 'sell'
                  ? 'bg-red-700 hover:bg-red-600'
                  : 'bg-amber-700 hover:bg-amber-600'
              }`}
            >
              {action === 'buy' && <TrendingUp className="w-5 h-5 mr-2" />}
              {action === 'sell' && <TrendingDown className="w-5 h-5 mr-2" />}
              {action === 'hold' && <Clock className="w-5 h-5 mr-2" />}
              {action.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className={`p-4 rounded-lg ${selectedAnswer === event.correctAction ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {selectedAnswer === event.correctAction ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={selectedAnswer === event.correctAction ? 'text-green-400' : 'text-red-400'}>
              {selectedAnswer === event.correctAction 
                ? 'Correct!' 
                : selectedAnswer === 'timeout'
                ? `Time's up! The answer was ${event.correctAction.toUpperCase()}`
                : `Incorrect - The answer is ${event.correctAction.toUpperCase()}`}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3">{event.explanation}</p>
          <Button onClick={nextQuestion} className="w-full bg-blue-600 hover:bg-blue-700">
            Next News Event <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

function SupportResistanceGame({ onScoreUpdate }: { onScoreUpdate: (score: GameScore) => void }) {
  const [score, setScore] = useState<GameScore>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState(() => generateChallenge());

  function generateChallenge() {
    const isSupport = Math.random() > 0.5;
    const basePrice = Math.floor(Math.random() * 100) + 50;
    const correctLevel = isSupport 
      ? basePrice - Math.floor(Math.random() * 10) - 5
      : basePrice + Math.floor(Math.random() * 10) + 5;
    
    const prices = [];
    for (let i = 0; i < 10; i++) {
      if (isSupport) {
        prices.push(basePrice + Math.floor(Math.random() * 15) - 5);
        if (i === 3 || i === 7) prices[i] = correctLevel + Math.floor(Math.random() * 2);
      } else {
        prices.push(basePrice - Math.floor(Math.random() * 15) + 5);
        if (i === 2 || i === 6) prices[i] = correctLevel - Math.floor(Math.random() * 2);
      }
    }
    
    return {
      prices,
      correctLevel,
      type: isSupport ? 'support' : 'resistance' as 'support' | 'resistance',
      options: [
        correctLevel,
        correctLevel + 5,
        correctLevel - 5,
        correctLevel + 10
      ].sort(() => Math.random() - 0.5)
    };
  }

  function handleAnswer(level: number) {
    if (showResult) return;
    
    setSelectedLevel(level);
    setShowResult(true);
    
    const isCorrect = level === currentChallenge.correctLevel;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
      streak: isCorrect ? score.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(score.bestStreak, score.streak + 1) : score.bestStreak
    };
    setScore(newScore);
    onScoreUpdate(newScore);
  }

  function nextQuestion() {
    setShowResult(false);
    setSelectedLevel(null);
    setCurrentChallenge(generateChallenge());
  }

  const minPrice = Math.min(...currentChallenge.prices) - 5;
  const maxPrice = Math.max(...currentChallenge.prices) + 5;
  const range = maxPrice - minPrice;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">
          Find the {currentChallenge.type === 'support' ? 'Support' : 'Resistance'} Level
        </h3>
        <div className="h-48 relative bg-slate-800 rounded-lg p-4">
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-500">
            <span>${maxPrice}</span>
            <span>${Math.floor((maxPrice + minPrice) / 2)}</span>
            <span>${minPrice}</span>
          </div>
          <div className="ml-10 h-full flex items-end justify-around">
            {currentChallenge.prices.map((price, i) => {
              const height = ((price - minPrice) / range) * 100;
              return (
                <div
                  key={i}
                  className="w-4 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          {showResult && (
            <div 
              className={`absolute left-10 right-4 h-0.5 ${currentChallenge.type === 'support' ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ 
                bottom: `${((currentChallenge.correctLevel - minPrice) / range) * 100}%`,
                transform: 'translateY(50%)'
              }}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-white font-medium text-center">
          Where is the {currentChallenge.type === 'support' ? 'support (price floor)' : 'resistance (price ceiling)'}?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {currentChallenge.options.map((level) => (
            <Button
              key={level}
              onClick={() => handleAnswer(level)}
              disabled={showResult}
              className={`py-4 ${
                showResult
                  ? level === currentChallenge.correctLevel
                    ? 'bg-green-600 hover:bg-green-600'
                    : level === selectedLevel
                    ? 'bg-red-600 hover:bg-red-600'
                    : 'bg-slate-700'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              ${level}
            </Button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className={`p-4 rounded-lg ${selectedLevel === currentChallenge.correctLevel ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {selectedLevel === currentChallenge.correctLevel ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={selectedLevel === currentChallenge.correctLevel ? 'text-green-400' : 'text-red-400'}>
              {selectedLevel === currentChallenge.correctLevel ? 'Correct!' : `Incorrect - The ${currentChallenge.type} is at $${currentChallenge.correctLevel}`}
            </span>
          </div>
          <Button onClick={nextQuestion} className="w-full bg-blue-600 hover:bg-blue-700">
            Next Challenge <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TradingGames() {
  const [activeGame, setActiveGame] = useState('patterns');
  const [scores, setScores] = useState<Record<string, GameScore>>({
    patterns: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
    riskReward: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
    news: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
    levels: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
  });

  const totalCorrect = Object.values(scores).reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading Games</h1>
              <p className="text-slate-400 text-sm">Learn trading concepts through interactive challenges</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-500/30">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-400">Overall Score</p>
                  <p className="text-lg font-bold text-amber-400">{totalCorrect}/{totalQuestions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Accuracy</span>
              <span className="text-sm font-bold text-white">{overallAccuracy.toFixed(0)}%</span>
            </div>
            <Progress value={overallAccuracy} className="h-2" />
          </CardContent>
        </Card>

        <Tabs value={activeGame} onValueChange={setActiveGame} className="space-y-4">
          <TabsList className="grid grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" /> Patterns
            </TabsTrigger>
            <TabsTrigger value="riskReward" className="data-[state=active]:bg-blue-600">
              <Target className="w-4 h-4 mr-1 hidden sm:inline" /> R:R
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-amber-600">
              <Newspaper className="w-4 h-4 mr-1 hidden sm:inline" /> News
            </TabsTrigger>
            <TabsTrigger value="levels" className="data-[state=active]:bg-green-600">
              <LineChart className="w-4 h-4 mr-1 hidden sm:inline" /> S/R
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patterns">
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Candlestick Pattern Quiz
                </CardTitle>
                <CardDescription>Learn to identify bullish, bearish, and neutral patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">{scores.patterns.correct} Correct</Badge>
                    <Badge variant="outline">{scores.patterns.total} Total</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-bold">Streak: {scores.patterns.streak}</span>
                  </div>
                </div>
                <CandlestickQuiz onScoreUpdate={(s) => setScores(prev => ({ ...prev, patterns: s }))} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="riskReward">
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Risk/Reward Challenge
                </CardTitle>
                <CardDescription>Master position sizing and risk management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">{scores.riskReward.correct} Correct</Badge>
                    <Badge variant="outline">{scores.riskReward.total} Total</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-bold">Streak: {scores.riskReward.streak}</span>
                  </div>
                </div>
                <RiskRewardChallenge onScoreUpdate={(s) => setScores(prev => ({ ...prev, riskReward: s }))} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-amber-400" />
                  Trade the News
                </CardTitle>
                <CardDescription>React to breaking market news like a pro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">{scores.news.correct} Correct</Badge>
                    <Badge variant="outline">{scores.news.total} Total</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-bold">Streak: {scores.news.streak}</span>
                  </div>
                </div>
                <TradeTheNews onScoreUpdate={(s) => setScores(prev => ({ ...prev, news: s }))} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels">
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-green-400" />
                  Support/Resistance Spotter
                </CardTitle>
                <CardDescription>Identify key price levels on charts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">{scores.levels.correct} Correct</Badge>
                    <Badge variant="outline">{scores.levels.total} Total</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-bold">Streak: {scores.levels.streak}</span>
                  </div>
                </div>
                <SupportResistanceGame onScoreUpdate={(s) => setScores(prev => ({ ...prev, levels: s }))} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-purple-900/30 via-slate-800/50 to-pink-900/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-white font-semibold">Pro Tip</h3>
                <p className="text-slate-400 text-sm">
                  Practice these concepts daily to build muscle memory for real trading decisions. 
                  Aim for 80%+ accuracy before trading with real money!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
