import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  CheckCircle,
  X,
  Zap,
  Gift,
  Award,
  Brain,
  Coins,
  Shield
} from "lucide-react";
import toast from 'react-hot-toast';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'defi' | 'trading' | 'security' | 'yield';
  reward: number;
}

interface UserProgress {
  totalPoints: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  level: number;
  badges: string[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What does APY stand for in DeFi?",
    options: ["Annual Percentage Yield", "Average Price Year", "Asset Protection Yield", "Automated Protocol Yield"],
    correct: 0,
    explanation: "APY (Annual Percentage Yield) represents the real rate of return earned on an investment, taking into account the effect of compounding interest.",
    difficulty: 'beginner',
    category: 'defi',
    reward: 10
  },
  {
    id: 2,
    question: "What is impermanent loss in liquidity provision?",
    options: [
      "Permanent loss of funds due to smart contract bugs",
      "Temporary loss due to price volatility that becomes permanent when withdrawing",
      "Loss of staking rewards due to network congestion",
      "Fee reduction due to low trading volume"
    ],
    correct: 1,
    explanation: "Impermanent loss occurs when the price of tokens in a liquidity pool changes compared to when you deposited them. The loss becomes 'permanent' when you withdraw your liquidity.",
    difficulty: 'intermediate',
    category: 'defi',
    reward: 25
  },
  {
    id: 3,
    question: "Which DeFi protocol is known for automated yield farming strategies?",
    options: ["Uniswap", "Aave", "Yearn Finance", "Compound"],
    correct: 2,
    explanation: "Yearn Finance is famous for its automated yield farming strategies, where smart contracts automatically move funds to the highest-yielding opportunities.",
    difficulty: 'intermediate',
    category: 'yield',
    reward: 20
  },
  {
    id: 4,
    question: "What is the Fear & Greed Index used for?",
    options: [
      "Measuring smart contract security",
      "Calculating APY rates",
      "Assessing market sentiment",
      "Determining gas fees"
    ],
    correct: 2,
    explanation: "The Fear & Greed Index measures market sentiment on a scale of 0-100, helping traders understand whether the market is driven by fear or greed.",
    difficulty: 'beginner',
    category: 'trading',
    reward: 15
  },
  {
    id: 5,
    question: "What is a smart contract audit in DeFi?",
    options: [
      "Automatic yield optimization",
      "Security review of contract code by experts",
      "Tax reporting for DeFi transactions",
      "Performance monitoring of protocols"
    ],
    correct: 1,
    explanation: "A smart contract audit is a comprehensive security review performed by experts to identify vulnerabilities and ensure the contract works as intended.",
    difficulty: 'advanced',
    category: 'security',
    reward: 35
  }
];

export function CryptoQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState<UserProgress>({
    totalPoints: 250,
    questionsAnswered: 12,
    correctAnswers: 9,
    streak: 3,
    level: 2,
    badges: ['First Steps', 'DeFi Explorer']
  });
  const [availableQuestions, setAvailableQuestions] = useState(quizQuestions);
  const [quizActive, setQuizActive] = useState(false);

  const startQuiz = () => {
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizActive(true);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.correct;
    setIsCorrect(correct);
    setShowResult(true);

    // Update progress
    setProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + (correct ? currentQuestion.reward : 0),
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0
    }));

    // Show toast
    if (correct) {
      toast.success(`Correct! +${currentQuestion.reward} points 🎉`);
    } else {
      toast.error("Incorrect answer. Keep learning! 📚");
    }

    // Remove question from available questions
    setAvailableQuestions(prev => prev.filter(q => q.id !== currentQuestion.id));
  };

  const nextQuestion = () => {
    if (availableQuestions.length === 0) {
      setQuizActive(false);
      setCurrentQuestion(null);
      setAvailableQuestions(quizQuestions); // Reset questions
      toast.success("Quiz completed! You've earned bonus rewards! 🏆");
      return;
    }
    startQuiz();
  };

  const getStreakBonus = () => {
    if (progress.streak >= 10) return '🔥 Fire Streak!';
    if (progress.streak >= 5) return '⚡ Hot Streak!';
    if (progress.streak >= 3) return '🌟 Good Streak!';
    return '';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-crypto-tertiary';
      case 'intermediate': return 'text-crypto-quaternary';
      case 'advanced': return 'text-red-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'defi': return Target;
      case 'trading': return Trophy;
      case 'security': return Shield;
      case 'yield': return Coins;
      default: return Star;
    }
  };

  const getLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  const getPointsToNextLevel = (points: number) => {
    const currentLevel = getLevel(points);
    return (currentLevel * 100) - points;
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
            <Brain className="w-6 h-6 text-crypto-primary" />
            Crypto Knowledge Quiz
            <Badge className="badge-warning animate-pulse">
              <Gift className="w-3 h-3 mr-1" />
              Earn Rewards
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Progress */}
        <div className="p-4 bg-crypto-surface rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-crypto-primary">{progress.totalPoints}</div>
              <div className="text-crypto-muted text-xs">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-crypto-tertiary">Level {getLevel(progress.totalPoints)}</div>
              <div className="text-crypto-muted text-xs">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-crypto-quaternary">{progress.streak}</div>
              <div className="text-crypto-muted text-xs">Streak {getStreakBonus()}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-crypto-text">
                {Math.round((progress.correctAnswers / Math.max(progress.questionsAnswered, 1)) * 100)}%
              </div>
              <div className="text-crypto-muted text-xs">Accuracy</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-crypto-muted">Progress to Level {getLevel(progress.totalPoints) + 1}</span>
              <span className="text-crypto-text">{getPointsToNextLevel(progress.totalPoints)} points needed</span>
            </div>
            <Progress 
              value={((progress.totalPoints % 100) / 100) * 100} 
              className="h-2"
            />
          </div>
        </div>

        {/* Badges */}
        {progress.badges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-crypto-text flex items-center gap-2">
              <Award className="w-4 h-4 text-crypto-secondary" />
              Earned Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((badge, index) => (
                <Badge key={index} className="badge-secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Interface */}
        {!quizActive ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-crypto-primary/15 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-crypto-primary" />
            </div>
            <h3 className="text-xl font-bold text-crypto-text mb-2">Test Your Knowledge</h3>
            <p className="text-crypto-muted mb-6">
              Answer DeFi questions and earn points to unlock exclusive features
            </p>
            <Button onClick={startQuiz} className="btn-primary">
              <Zap className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={`${getDifficultyColor(currentQuestion.difficulty)} bg-crypto-surface border border-current`}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge className="badge-secondary">
                  {(() => {
                    const Icon = getCategoryIcon(currentQuestion.category);
                    return <Icon className="w-3 h-3 mr-1" />;
                  })()}
                  {currentQuestion.category}
                </Badge>
              </div>
              <Badge className="badge-primary">
                <Coins className="w-3 h-3 mr-1" />
                {currentQuestion.reward} pts
              </Badge>
            </div>

            {/* Question */}
            <div className="p-6 bg-crypto-card rounded-lg">
              <h3 className="text-lg font-semibold text-crypto-text mb-4">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    disabled={showResult}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? 'border-crypto-primary bg-crypto-primary/10'
                        : 'border-crypto-border bg-crypto-surface hover:border-crypto-primary/50'
                    } ${showResult ? 
                        index === currentQuestion.correct 
                          ? 'border-crypto-tertiary bg-crypto-tertiary/10' 
                          : selectedAnswer === index && index !== currentQuestion.correct
                            ? 'border-red-500 bg-red-500/10'
                            : ''
                      : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-crypto-text">{option}</span>
                      {showResult && (
                        <>
                          {index === currentQuestion.correct && (
                            <CheckCircle className="w-5 h-5 text-crypto-tertiary" />
                          )}
                          {selectedAnswer === index && index !== currentQuestion.correct && (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Result Explanation */}
            {showResult && (
              <div className={`p-4 rounded-lg ${
                isCorrect ? 'bg-crypto-tertiary/10 border border-crypto-tertiary' : 'bg-red-500/10 border border-red-500'
              }`}>
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-crypto-tertiary mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-crypto-tertiary' : 'text-red-400'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-crypto-text text-sm">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!showResult ? (
                <Button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="btn-primary flex-1"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="btn-primary flex-1">
                  {availableQuestions.length > 1 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              )}
              
              <Button
                onClick={() => setQuizActive(false)}
                variant="outline"
                className="btn-secondary"
              >
                Exit Quiz
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}