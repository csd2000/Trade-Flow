import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Clock, BookOpen, Star, ChevronRight } from "lucide-react";
import { mockTutorials } from "@/lib/mock-data";

export default function LearnDeFi() {
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
      Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Advanced: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-500/10 text-gray-300";
  };

  const allTutorials = [
    ...mockTutorials,
    {
      id: "7",
      title: "Setting Up MetaMask",
      description: "Complete guide to installing and configuring MetaMask wallet for DeFi",
      difficulty: "Beginner" as const,
      duration: "8 min",
      category: "Wallets"
    },
    {
      id: "8", 
      title: "Understanding Gas Fees",
      description: "Learn how gas fees work and optimize transaction costs across chains",
      difficulty: "Beginner" as const,
      duration: "12 min",
      category: "Fundamentals"
    },
    {
      id: "9",
      title: "Liquidity Pool Strategies",
      description: "Advanced strategies for providing liquidity in DeFi protocols like Uniswap V3",
      difficulty: "Advanced" as const,
      duration: "25 min",
      category: "Strategy"
    },
    {
      id: "10",
      title: "DeFi Lending & Borrowing",
      description: "Master Aave and Compound protocols for maximum yield",
      difficulty: "Intermediate" as const,
      duration: "18 min",
      category: "Strategy"
    },
    {
      id: "11",
      title: "Cross-Chain DeFi",
      description: "Navigate bridges and multi-chain protocols safely",
      difficulty: "Advanced" as const,
      duration: "22 min",
      category: "Advanced"
    },
    {
      id: "12",
      title: "DeFi Tax Considerations",
      description: "Understand tax implications of DeFi trading and yield farming",
      difficulty: "Intermediate" as const,
      duration: "16 min",
      category: "Advanced"
    }
  ];

  const categories = ["All", "Fundamentals", "Wallets", "Strategy", "Risk Management", "Advanced"];

  return (
    <div>
      <Header
        title="Learn DeFi"
        subtitle="Master DeFi concepts with our comprehensive tutorials"
      />

      <div className="p-6 space-y-6">
        {/* Featured Tutorial */}
        <Card className="bg-gradient-to-r from-crypto-green/10 to-crypto-blue/10 border border-crypto-green/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Badge className="bg-crypto-green/20 text-crypto-green border-crypto-green/30 mb-3">
                Featured Tutorial
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete DeFi Beginner's Guide</h3>
              <p className="text-gray-600 mb-4">
                Start your DeFi journey with our comprehensive beginner's guide. Learn the fundamentals, 
                set up your wallet, and make your first investment safely.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  45 min
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  8 modules
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  4.9/5
                </span>
              </div>
              <Button className="bg-crypto-green text-black hover:bg-green-400">
                <Play className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            </div>
            <div className="w-32 h-32 bg-crypto-green/20 rounded-lg flex items-center justify-center ml-6">
              <Play className="w-12 h-12 text-crypto-green" />
            </div>
          </div>
        </Card>

        {/* Search and Categories */}
        <Card className="bg-crypto-surface border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
              <Input
                placeholder="Search tutorials..."
                className="pl-10 bg-gray-700 border-gray-600 text-gray-900"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className={category === "All" 
                    ? "bg-crypto-green/10 border-crypto-green/20 text-crypto-green"
                    : "border-gray-600 text-gray-600 hover:text-gray-900"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Tutorial Content */}
        <Card className="bg-crypto-surface border-gray-700">
          <Tabs defaultValue="tutorials" className="w-full">
            <div className="border-b border-gray-700 px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="tutorials" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                  All Tutorials
                </TabsTrigger>
                <TabsTrigger value="learning-path" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                  Learning Paths
                </TabsTrigger>
                <TabsTrigger value="quiz" className="data-[state=active]:bg-crypto-green/10 data-[state=active]:text-crypto-green">
                  Quiz & Tests
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tutorials" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="bg-gray-800/50 border-gray-600 p-6 hover:border-crypto-green/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-900">
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {tutorial.duration}
                      </span>
                      <span>{tutorial.category}</span>
                    </div>

                    <Button className="w-full bg-crypto-green text-black hover:bg-green-400">
                      Start Tutorial
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="learning-path" className="p-6">
              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">DeFi Beginner Path</h4>
                      <p className="text-gray-600 text-sm">Complete guide from zero to your first DeFi investment</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      Beginner
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-crypto-green rounded-full mr-3"></div>
                      <span className="text-gray-600">What is DeFi?</span>
                      <span className="ml-auto text-crypto-green">✓</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-crypto-green rounded-full mr-3"></div>
                      <span className="text-gray-600">Setting up MetaMask</span>
                      <span className="ml-auto text-crypto-green">✓</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-600">Understanding Gas Fees</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-600">Your First DeFi Investment</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Progress: 2/4 completed</span>
                    <Button size="sm" className="bg-crypto-green text-black hover:bg-green-400">
                      Continue Path
                    </Button>
                  </div>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Advanced Strategy Path</h4>
                      <p className="text-gray-600 text-sm">Master complex DeFi strategies and risk management</p>
                    </div>
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                      Advanced
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-600">Yield Farming Strategies</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-600">Advanced LP Positioning</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-600">Risk Management</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Progress: 0/3 completed</span>
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-600">
                      Start Path
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-600 p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">DeFi Fundamentals Quiz</h4>
                  <p className="text-gray-600 text-sm mb-4">Test your knowledge of basic DeFi concepts</p>
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                    <span>10 questions</span>
                    <span>15 minutes</span>
                  </div>
                  <Button className="w-full bg-crypto-blue text-gray-900 hover:bg-blue-600">
                    Take Quiz
                  </Button>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600 p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Risk Assessment Test</h4>
                  <p className="text-gray-600 text-sm mb-4">Evaluate your understanding of DeFi risks</p>
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                    <span>15 questions</span>
                    <span>20 minutes</span>
                  </div>
                  <Button className="w-full bg-crypto-amber text-black hover:bg-amber-400">
                    Start Test
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
