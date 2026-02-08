import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, DollarSign, TrendingUp, AlertTriangle, Calculator, BookOpen, Clock } from "lucide-react";
import { stablecoinLearningModule, conversionExamples, stablecoinTypes, conversionTimings, taxScenarios, learningQuiz } from "@/lib/stablecoin-learning-data";

export default function StablecoinLearning() {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [selectedExample, setSelectedExample] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleSectionComplete = (sectionIndex: number) => {
    if (!completedSections.includes(sectionIndex)) {
      setCompletedSections([...completedSections, sectionIndex]);
    }
    if (sectionIndex < stablecoinLearningModule.sections.length - 1) {
      setCurrentSection(sectionIndex + 1);
    }
  };

  const calculateProgress = () => {
    return (completedSections.length / stablecoinLearningModule.sections.length) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Stablecoin Conversion Guide"
        subtitle="Learn when and how to convert crypto to stablecoins"
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {stablecoinLearningModule.title}
              </h1>
              <p className="text-gray-300">{stablecoinLearningModule.description}</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Badge variant="outline" className="bg-crypto-primary/10 text-crypto-primary border-crypto-primary/20">
                {stablecoinLearningModule.difficulty}
              </Badge>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{stablecoinLearningModule.duration}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={calculateProgress()} className="h-2" />
            </div>
            <span className="text-sm text-gray-300">
              {completedSections.length} / {stablecoinLearningModule.sections.length} completed
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <Card className="crypto-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Sections</h3>
              <nav className="space-y-2">
                {stablecoinLearningModule.sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      currentSection === index
                        ? 'bg-crypto-primary/20 text-crypto-primary border border-crypto-primary/30'
                        : 'text-gray-300 hover:text-gray-900 hover:bg-crypto-surface/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {completedSections.includes(index) ? (
                        <CheckCircle className="w-5 h-5 text-crypto-primary" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                      )}
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Card className="crypto-card">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {stablecoinLearningModule.sections[currentSection].title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {stablecoinLearningModule.sections[currentSection].content}
                </p>
              </div>

              {/* Key Points */}
              {stablecoinLearningModule.sections[currentSection].keyPoints && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {stablecoinLearningModule.sections[currentSection].keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-crypto-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Content Based on Section */}
              {currentSection === 2 && (
                <Tabs defaultValue="scenarios" className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="scenarios">Tax Scenarios</TabsTrigger>
                    <TabsTrigger value="calculator">Calculator</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="scenarios" className="space-y-4">
                    {taxScenarios.map((scenario, index) => (
                      <Card key={index} className="bg-crypto-surface/50 border-crypto-border/50 p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-crypto-primary/20 rounded-lg flex items-center justify-center">
                            <span className="text-crypto-primary font-bold">{scenario.taxRate}%</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{scenario.description}</p>
                        <div className="space-y-2">
                          {scenario.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex items-start space-x-2">
                              <AlertTriangle className="w-3 h-3 text-crypto-amber mt-1 flex-shrink-0" />
                              <span className="text-gray-300 text-xs">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="calculator">
                    <Card className="bg-crypto-surface/50 border-crypto-border/50 p-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Tax Calculator</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Initial Value ($)
                          </label>
                          <input
                            type="number"
                            className="w-full input-field"
                            placeholder="10,000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Final Value ($)
                          </label>
                          <input
                            type="number"
                            className="w-full input-field"
                            placeholder="15,000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Holding Period (days)
                          </label>
                          <input
                            type="number"
                            className="w-full input-field"
                            placeholder="180"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Tax Bracket (%)
                          </label>
                          <input
                            type="number"
                            className="w-full input-field"
                            placeholder="24"
                          />
                        </div>
                      </div>
                      <Button className="w-full mt-4 btn-primary">
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Tax
                      </Button>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="examples">
                    <div className="space-y-4">
                      {conversionExamples.map((example, index) => (
                        <Card key={index} className="bg-crypto-surface/50 border-crypto-border/50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{example.title}</h4>
                            <Badge variant={example.type === 'short-term' ? 'destructive' : example.type === 'long-term' ? 'default' : 'outline'}>
                              {example.type === 'short-term' ? 'Short-term' : example.type === 'long-term' ? 'Long-term' : 'Loss'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">{example.scenario}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-300">Initial Value</span>
                              <div className="text-gray-900 font-semibold">{formatCurrency(example.initialValue)}</div>
                            </div>
                            <div>
                              <span className="text-gray-300">Final Value</span>
                              <div className="text-gray-900 font-semibold">{formatCurrency(example.finalValue)}</div>
                            </div>
                            <div>
                              <span className="text-gray-300">Gain/Loss</span>
                              <div className={`font-semibold ${example.gain >= 0 ? 'text-crypto-primary' : 'text-crypto-red'}`}>
                                {example.gain >= 0 ? '+' : ''}{formatCurrency(example.gain)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-300">Tax Owed</span>
                              <div className="text-gray-900 font-semibold">{formatCurrency(example.taxOwed)}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {/* Stablecoin Types Section */}
              {currentSection === 4 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Stablecoins</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stablecoinTypes.map((coin, index) => (
                      <Card key={index} className="bg-crypto-surface/50 border-crypto-border/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-crypto-primary/20 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-crypto-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{coin.name}</h4>
                              <span className="text-sm text-gray-300">{coin.symbol}</span>
                            </div>
                          </div>
                          <Badge variant={coin.riskLevel === 'Low' ? 'default' : coin.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
                            {coin.riskLevel} Risk
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{coin.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Backing:</span>
                            <span className="text-gray-900">{coin.backing}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Popularity:</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={coin.popularity} className="w-16 h-1" />
                              <span className="text-gray-900 text-xs">{coin.popularity}%</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Timing Strategy Section */}
              {currentSection === 3 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Timing Strategies</h3>
                  <div className="space-y-4">
                    {conversionTimings.map((timing, index) => (
                      <Card key={index} className="bg-crypto-surface/50 border-crypto-border/50 p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${timing.color}`} />
                          <h4 className="font-semibold text-gray-900">{timing.condition}</h4>
                          <Badge variant={timing.riskLevel === 'Low' ? 'default' : timing.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
                            {timing.riskLevel} Risk
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{timing.description}</p>
                        <div className="space-y-1">
                          <span className="text-gray-300 text-xs">Indicators:</span>
                          {timing.indicators.map((indicator, indicatorIndex) => (
                            <div key={indicatorIndex} className="flex items-center space-x-2">
                              <TrendingUp className="w-3 h-3 text-crypto-primary" />
                              <span className="text-gray-600 text-xs">{indicator}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Actions */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  className="border-crypto-border text-gray-600 hover:text-gray-900"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={() => handleSectionComplete(currentSection)}
                  className="btn-primary"
                  disabled={completedSections.includes(currentSection)}
                >
                  {completedSections.includes(currentSection) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection(Math.min(stablecoinLearningModule.sections.length - 1, currentSection + 1))}
                  disabled={currentSection === stablecoinLearningModule.sections.length - 1}
                  className="border-crypto-border text-gray-600 hover:text-gray-900"
                >
                  Next
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Completion Alert */}
        {completedSections.length === stablecoinLearningModule.sections.length && (
          <Alert className="mt-8 bg-crypto-primary/10 border-crypto-primary/30">
            <CheckCircle className="w-4 h-4 text-crypto-primary" />
            <AlertDescription className="text-gray-900">
              Congratulations! You've completed the Stablecoin Conversion Guide. You're now ready to make informed decisions about converting your cryptocurrency to stablecoins.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}