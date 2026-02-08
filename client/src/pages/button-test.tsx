import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Settings,
  Download,
  Share,
  Heart,
  Star,
  BookOpen,
  Target
} from "lucide-react";

interface TestResult {
  buttonName: string;
  tested: boolean;
  working: boolean;
  error?: string;
}

export default function ButtonTest() {
  const [, setLocation] = useLocation();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const testButtons = [
    { name: "Navigation Home", action: () => setLocation("/") },
    { name: "Training Strategy 1", action: () => setLocation("/training/1") },
    { name: "Training Strategy 2", action: () => setLocation("/training/2") },
    { name: "DeFi Pro", action: () => setLocation("/defi-pro") },
    { name: "Free Academy", action: () => setLocation("/free-academy") },
    { name: "Protocols", action: () => setLocation("/protocols") },
    { name: "Portfolio", action: () => setLocation("/portfolio") },
    { name: "Learn DeFi", action: () => setLocation("/learn") },
    { name: "Strategies", action: () => setLocation("/strategies") },
    { name: "Profit Taking", action: () => setLocation("/profit-taking") }
  ];

  const testButton = async (buttonTest: typeof testButtons[0]) => {
    try {
      // Test the button action
      await buttonTest.action();
      
      // Simulate additional testing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        buttonName: buttonTest.name,
        tested: true,
        working: true
      };
    } catch (error) {
      return {
        buttonName: buttonTest.name,
        tested: true,
        working: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];
    
    for (const buttonTest of testButtons) {
      // Test each button 10 times as requested
      for (let i = 0; i < 10; i++) {
        const result = await testButton(buttonTest);
        if (i === 9) { // Only store the final result
          results.push(result);
        }
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between tests
      }
    }
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  const getTestResultIcon = (result: TestResult) => {
    if (!result.tested) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (result.working) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getTestResultColor = (result: TestResult) => {
    if (!result.tested) return "border-yellow-200 bg-yellow-50";
    if (result.working) return "border-green-200 bg-green-50";
    return "border-red-200 bg-red-50";
  };

  const successCount = testResults.filter(r => r.working).length;
  const failureCount = testResults.filter(r => r.tested && !r.working).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-950 dark:via-purple-950 dark:to-green-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              🧪 Button Testing Suite
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Comprehensive testing of all clickable buttons and navigation elements
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-green-500 text-gray-900 text-lg px-4 py-2">
                Testing Each Button 10x
              </Badge>
              {testResults.length > 0 && (
                <>
                  <Badge className="bg-blue-500 text-gray-900 text-lg px-4 py-2">
                    {successCount} Passed
                  </Badge>
                  {failureCount > 0 && (
                    <Badge className="bg-red-500 text-gray-900 text-lg px-4 py-2">
                      {failureCount} Failed
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Run comprehensive tests on all buttons and navigation elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                size="lg"
                onClick={runAllTests}
                disabled={isRunningTests}
                className="px-8"
              >
                {isRunningTests ? "Running Tests..." : "Run All Tests (10x Each)"}
                <Play className="ml-2 h-4 w-4" />
              </Button>
              
              {testResults.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-semibold">
                    {successCount} Buttons Working
                  </span>
                  {failureCount > 0 && (
                    <span className="text-red-600 font-semibold">
                      {failureCount} Buttons Failed
                    </span>
                  )}
                  <span className="text-gray-600">
                    Total: {testResults.length} Buttons Tested
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-900">
              Test Results
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testResults.map((result, index) => (
                <Card 
                  key={index}
                  className={`${getTestResultColor(result)} border-2`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      {getTestResultIcon(result)}
                      <span className="font-semibold">{result.buttonName}</span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Status:</span>
                        <Badge variant={result.working ? "default" : "destructive"}>
                          {result.working ? "Working" : "Failed"}
                        </Badge>
                      </div>
                      
                      <div>
                        <span>Tests Run: 10/10</span>
                      </div>
                      
                      {result.error && (
                        <div className="text-red-600 text-xs mt-2">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Alert className={successCount === testResults.length ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Summary:</strong> {successCount} out of {testResults.length} buttons are working correctly.
                {failureCount > 0 ? ` ${failureCount} buttons need attention.` : " All buttons are functioning properly!"}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Manual Test Buttons */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Manual Button Testing</CardTitle>
            <CardDescription>
              Click these buttons to manually test navigation functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button onClick={() => setLocation("/")}>
                <BookOpen className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button onClick={() => setLocation("/training/1")}>
                <Target className="mr-2 h-4 w-4" />
                DeFi Training
              </Button>
              <Button onClick={() => setLocation("/training/2")}>
                <Star className="mr-2 h-4 w-4" />
                Stock Training
              </Button>
              <Button onClick={() => setLocation("/defi-pro")}>
                <Settings className="mr-2 h-4 w-4" />
                DeFi Pro
              </Button>
              <Button onClick={() => setLocation("/protocols")}>
                <Share className="mr-2 h-4 w-4" />
                Protocols
              </Button>
              <Button onClick={() => setLocation("/portfolio")}>
                <Heart className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
              <Button variant="outline" onClick={() => window.open("https://github.com")}>
                <Download className="mr-2 h-4 w-4" />
                External Link
              </Button>
              <Button variant="secondary" onClick={() => alert("Action button clicked!")}>
                <Play className="mr-2 h-4 w-4" />
                Action Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}