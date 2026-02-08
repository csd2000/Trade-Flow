import { Switch, Route, useLocation, Redirect } from "wouter";
import { Suspense, lazy } from "react";
import StrategyIndex from "./pages/strategy-index";
import StrategyTraining from "./pages/strategy-training";
import NotFound from "./pages/not-found";
import EnhancedStrategyIndex from "./pages/enhanced-strategy-index";
import ModernLayout from "./components/layout/modern-layout";
import { SkillLevelProvider, useSkillLevel } from "./contexts/SkillLevelContext";
import { GlobalNewsAlertProvider } from "./contexts/GlobalNewsAlertContext";
import GlobalNewsOverlay from "./components/GlobalNewsOverlay";
import HFCAdvisorChat from "./components/HFCAdvisorChat";

// Lazy load enhanced components
const LazyStrategyTrainingEnhanced = lazy(() => import('./pages/strategy-training-enhanced'));
const LazyBacktestStrategy = lazy(() => import('./pages/backtest-strategy'));
const LazyAcademyModule = lazy(() => import('./pages/academy-module'));
const LazyAcademyModuleTraining = lazy(() => import('./pages/academy-module-training'));
const LazyTrainingSystemTest = lazy(() => import('./pages/training-system-test'));
const LazyLogin = lazy(() => import('./pages/login'));
const LazyAdminDashboard = lazy(() => import('./pages/admin-dashboard'));
const LazyAdminContent = lazy(() => import('./pages/admin-content'));
const LazyAdminTraining = lazy(() => import('./pages/admin-training'));
const LazyAdminStrategies = lazy(() => import('./pages/admin-strategies'));
const LazyAIProfitStudio = lazy(() => import('./pages/AIProfitStudio'));
const LazyTimeSeriesDashboard = lazy(() => import('./pages/timeseries-dashboard'));
const LazyQuantDashboard = lazy(() => import('./pages/quant-dashboard'));
const LazyAITrader = lazy(() => import('./pages/ai-trader'));
const LazyDailyChecklist = lazy(() => import('./pages/daily-checklist'));
const LazyCommandCenter = lazy(() => import('./pages/command-center'));
const LazyHFScanner = lazy(() => import('./pages/hf-scanner'));
const LazyFuturesDesk = lazy(() => import('./pages/futures-desk'));
const LazyIncomeMachine = lazy(() => import('./pages/income-machine'));
const LazyMarketIntelligence = lazy(() => import('./pages/market-intelligence'));
const LazySupplyDemandScanner = lazy(() => import('./pages/supply-demand-scanner'));
const LazyInstitutionalTerminal = lazy(() => import('./pages/institutional-terminal'));
const LazyReversalDetection = lazy(() => import('./pages/reversal-detection'));
const LazyScalpingDashboard = lazy(() => import('./pages/scalping-dashboard'));
const LazyTradingConnections = lazy(() => import('./pages/trading-connections'));
const LazyDarkPoolDashboard = lazy(() => import('./pages/dark-pool-dashboard'));
const LazyIntermarketAnalysis = lazy(() => import('./pages/intermarket-analysis'));
const LazyStockResearch = lazy(() => import('./pages/stock-research'));
const LazyConfluenceScanner = lazy(() => import('./pages/confluence-scanner'));
const LazySecretSauceStrategy = lazy(() => import('./pages/secret-sauce-strategy'));
const LazyHFCApexScanner = lazy(() => import('./pages/hfc-apex-scanner'));
const LazySevenGateDashboard = lazy(() => import('./pages/seven-gate-dashboard'));
const LazyAITradingAssistant = lazy(() => import('./pages/ai-trading-assistant'));
const LazyWhaleShield = lazy(() => import('./pages/whale-shield'));
const LazySniperTrader = lazy(() => import('./pages/sniper-trader'));
const LazyInstitutionalScanner = lazy(() => import('./pages/institutional-scanner'));
const LazyDataSources = lazy(() => import('./pages/data-sources'));
const LazyAITradingPlan = lazy(() => import('./pages/ai-trading-plan'));
const LazyEnhancedAIStrategy = lazy(() => import('./pages/enhanced-ai-strategy'));
const LazyUniversalForecaster = lazy(() => import('./pages/universal-forecaster'));
const LazyAutomatedTrading = lazy(() => import('./pages/automated-trading'));
const LazyDeFiMasteryTraining = lazy(() => import('./pages/defi-mastery-training'));
const LazyExitProfitTraining = lazy(() => import('./pages/exit-profit-training'));
const LazyPortfolioToolsTraining = lazy(() => import('./pages/portfolio-tools-training'));
const LazyCommunityToolsTraining = lazy(() => import('./pages/community-tools-training'));
const LazyEducationPlanningTraining = lazy(() => import('./pages/education-planning-training'));
const LazyOptionsIncomeTraining = lazy(() => import('./pages/options-income-training'));
const LazySmartMoneyTraining = lazy(() => import('./pages/smart-money-training'));
const LazyDayTradingTraining = lazy(() => import('./pages/day-trading-training'));
const LazyAIToolsTraining = lazy(() => import('./pages/ai-tools-training'));
const LazyNewsDiscoveryTraining = lazy(() => import('./pages/news-discovery-training'));
const LazyAlertCenter = lazy(() => import('./pages/alert-center'));
const LazySevenGateDecision = lazy(() => import('./pages/seven-gate-decision'));
const LazyMAFibonacciStrategy = lazy(() => import('./pages/ma-fibonacci-strategy'));
const LazyMAFibonacciScanner = lazy(() => import('./pages/ma-fibonacci-scanner'));
const LazyCentralScanner = lazy(() => import('./pages/central-scanner'));
const LazyInstitutionalAnalysisSystem = lazy(() => import('./pages/institutional-analysis-system'));
const LazyPowerScanner = lazy(() => import('./pages/power-scanner'));
const LazySkillSelection = lazy(() => import('./pages/skill-selection'));
const LazyTradingGames = lazy(() => import('./pages/trading-games'));
const LazyInteractiveTutorials = lazy(() => import('./pages/interactive-tutorials'));
const LazyHedgeFundScanner = lazy(() => import('./pages/hedge-fund-scanner'));

// Modern loading component
const ModernLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Inner app component that uses the skill level context
function AppContent() {
  const [location] = useLocation();
  const { hasSeenOnboarding, isLoading } = useSkillLevel();

  // Show loading while checking onboarding status
  if (isLoading) {
    return <ModernLoadingSpinner />;
  }

  // Redirect to AI Trading Assistant for onboarding if user hasn't seen it
  // But not if they're already on allowed pages
  if (!hasSeenOnboarding && location !== '/ai-assistant' && location !== '/skill-selection' && location !== '/login') {
    return <Redirect to="/ai-assistant" />;
  }

  return (
    <ModernLayout>
      <Switch>
        {/* Skill Selection Page - shown first for new users */}
        <Route path="/skill-selection">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySkillSelection />
          </Suspense>
        </Route>

        {/* New unified strategy system */}
        <Route path="/" component={EnhancedStrategyIndex} />
        <Route path="/strategies" component={EnhancedStrategyIndex} />
        <Route path="/legacy" component={StrategyIndex} />
        <Route path="/training/:trackId/:moduleSlug">
          {(params) => (
            <Suspense fallback={<ModernLoadingSpinner />}>
              <LazyAcademyModuleTraining />
            </Suspense>
          )}
        </Route>
        {/* Consolidated training routes - must be before generic /training/:slug */}
        <Route path="/training/defi-mastery">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyDeFiMasteryTraining />
          </Suspense>
        </Route>
        <Route path="/training/exit-profit">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyExitProfitTraining />
          </Suspense>
        </Route>
        <Route path="/training/portfolio-tools">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyPortfolioToolsTraining />
          </Suspense>
        </Route>
        <Route path="/training/community-tools">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyCommunityToolsTraining />
          </Suspense>
        </Route>
        <Route path="/training/education-planning">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyEducationPlanningTraining />
          </Suspense>
        </Route>
        <Route path="/training/options-income">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyOptionsIncomeTraining />
          </Suspense>
        </Route>
        <Route path="/training/smart-money">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySmartMoneyTraining />
          </Suspense>
        </Route>
        <Route path="/training/day-trading">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyDayTradingTraining />
          </Suspense>
        </Route>
        <Route path="/training/ai-tools">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAIToolsTraining />
          </Suspense>
        </Route>
        <Route path="/training/news-discovery">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyNewsDiscoveryTraining />
          </Suspense>
        </Route>
        <Route path="/training/:slug" component={StrategyTraining} />
        <Route path="/enhanced-training/:slug">
          {(params) => (
            <Suspense fallback={<ModernLoadingSpinner />}>
              <LazyStrategyTrainingEnhanced />
            </Suspense>
          )}
        </Route>
        <Route path="/backtest/:slug">
          {(params) => (
            <Suspense fallback={<ModernLoadingSpinner />}>
              <LazyBacktestStrategy />
            </Suspense>
          )}
        </Route>
        <Route path="/academy/module/:slug">
          {(params) => (
            <Suspense fallback={<ModernLoadingSpinner />}>
              <LazyAcademyModule />
            </Suspense>
          )}
        </Route>
        <Route path="/academy/module/:track/:slug">
          {(params) => (
            <Suspense fallback={<ModernLoadingSpinner />}>
              <LazyAcademyModuleTraining />
            </Suspense>
          )}
        </Route>
        <Route path="/training-system-test">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyTrainingSystemTest />
          </Suspense>
        </Route>
        <Route path="/timeseries">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyTimeSeriesDashboard />
          </Suspense>
        </Route>
        <Route path="/quant">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyQuantDashboard />
          </Suspense>
        </Route>
        <Route path="/ai-trader">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAITrader />
          </Suspense>
        </Route>
        <Route path="/login">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyLogin />
          </Suspense>
        </Route>
        <Route path="/admin">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAdminDashboard />
          </Suspense>
        </Route>
        <Route path="/admin/content">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAdminContent />
          </Suspense>
        </Route>
        <Route path="/admin/training">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAdminTraining />
          </Suspense>
        </Route>
        <Route path="/admin/strategies">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAdminStrategies />
          </Suspense>
        </Route>
        <Route path="/ai-profit-studio">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAIProfitStudio />
          </Suspense>
        </Route>
        <Route path="/daily-checklist">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyDailyChecklist />
          </Suspense>
        </Route>
        <Route path="/command-center">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyCommandCenter />
          </Suspense>
        </Route>
        <Route path="/scanner">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyHFScanner />
          </Suspense>
        </Route>
        <Route path="/futures">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyFuturesDesk />
          </Suspense>
        </Route>
        <Route path="/income-machine">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyIncomeMachine />
          </Suspense>
        </Route>
        <Route path="/market-intelligence">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyMarketIntelligence />
          </Suspense>
        </Route>
        <Route path="/institutional">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyInstitutionalTerminal />
          </Suspense>
        </Route>
        <Route path="/reversal">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyReversalDetection />
          </Suspense>
        </Route>
        <Route path="/scalping">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyScalpingDashboard />
          </Suspense>
        </Route>
        <Route path="/secret-sauce">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySecretSauceStrategy />
          </Suspense>
        </Route>
        <Route path="/supply-demand">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySupplyDemandScanner />
          </Suspense>
        </Route>
        <Route path="/trading-connections">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyTradingConnections />
          </Suspense>
        </Route>
        <Route path="/dark-pool">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyDarkPoolDashboard />
          </Suspense>
        </Route>
        <Route path="/intermarket">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyIntermarketAnalysis />
          </Suspense>
        </Route>
        <Route path="/stock-research">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyStockResearch />
          </Suspense>
        </Route>
        <Route path="/confluence">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyConfluenceScanner />
          </Suspense>
        </Route>
        <Route path="/hfc-apex">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyHFCApexScanner />
          </Suspense>
        </Route>
        <Route path="/seven-gate">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySevenGateDashboard />
          </Suspense>
        </Route>
        <Route path="/seven-gate-decision">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySevenGateDecision />
          </Suspense>
        </Route>
        <Route path="/ai-assistant">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAITradingAssistant />
          </Suspense>
        </Route>
        <Route path="/whale-shield">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyWhaleShield />
          </Suspense>
        </Route>
        <Route path="/sniper-trader">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazySniperTrader />
          </Suspense>
        </Route>
        <Route path="/institutional-scanner">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyInstitutionalScanner />
          </Suspense>
        </Route>
        <Route path="/data-sources">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyDataSources />
          </Suspense>
        </Route>
        <Route path="/trading-plan">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAITradingPlan />
          </Suspense>
        </Route>
        <Route path="/ai-trading-plan">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAITradingPlan />
          </Suspense>
        </Route>
        <Route path="/enhanced-strategy">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyEnhancedAIStrategy />
          </Suspense>
        </Route>
        <Route path="/ai-strategy">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyEnhancedAIStrategy />
          </Suspense>
        </Route>
        <Route path="/universal-forecaster">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyUniversalForecaster />
          </Suspense>
        </Route>
        <Route path="/automated-trading">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAutomatedTrading />
          </Suspense>
        </Route>
        <Route path="/automation">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAutomatedTrading />
          </Suspense>
        </Route>
        <Route path="/alert-center">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAlertCenter />
          </Suspense>
        </Route>
        <Route path="/alerts">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyAlertCenter />
          </Suspense>
        </Route>
        
        {/* Backward compatibility routes - redirect to new system */}
        <Route path="/professional-trading-academy">
          {() => {
            window.location.href = "/strategies";
            return null;
          }}
        </Route>
        
        <Route path="/master-academy">
          {() => {
            window.location.href = "/strategies";
            return null;
          }}
        </Route>
        
        <Route path="/free-training">
          {() => {
            window.location.href = "/strategies";
            return null;
          }}
        </Route>

        {/* Legacy numeric routes - redirect to slug-based routes */}
        <Route path="/training/1">
          {() => {
            window.location.href = "/training/all-trading-strategies-unified";
            return null;
          }}
        </Route>
        <Route path="/training/2">
          {() => {
            window.location.href = "/training/passive-income-training";
            return null;
          }}
        </Route>
        <Route path="/training/3">
          {() => {
            window.location.href = "/training/oliver-velez-techniques";
            return null;
          }}
        </Route>
        <Route path="/training/4">
          {() => {
            window.location.href = "/training/fc-intelligent-decision";
            return null;
          }}
        </Route>
        <Route path="/training/5">
          {() => {
            window.location.href = "/training/trading-freedom-group";
            return null;
          }}
        </Route>
        <Route path="/training/6">
          {() => {
            window.location.href = "/training/defi-strategist-elite-dashboard";
            return null;
          }}
        </Route>
        <Route path="/training/7">
          {() => {
            window.location.href = "/training/mindful-study-platform";
            return null;
          }}
        </Route>
        <Route path="/training/8">
          {() => {
            window.location.href = "/training/live-crypto-cashflow-challenge";
            return null;
          }}
        </Route>
        <Route path="/training/9">
          {() => {
            window.location.href = "/training/consolidated-crypto-hub";
            return null;
          }}
        </Route>
        <Route path="/training/10">
          {() => {
            window.location.href = "/training/protocols";
            return null;
          }}
        </Route>
        <Route path="/training/11">
          {() => {
            window.location.href = "/training/strategy-builder";
            return null;
          }}
        </Route>
        <Route path="/training/12">
          {() => {
            window.location.href = "/training/portfolio";
            return null;
          }}
        </Route>

        {/* Legacy pages - redirect to main strategies for now */}
        <Route path="/button-test">
          {() => {
            window.location.href = "/strategies";
            return null;
          }}
        </Route>
        <Route path="/crypto-profit-calculator">
          {() => {
            window.location.href = "/strategies";
            return null;
          }}
        </Route>
        <Route path="/protocols">
          {() => {
            window.location.href = "/training/protocols";
            return null;
          }}
        </Route>
        <Route path="/strategies-builder">
          {() => {
            window.location.href = "/training/strategy-builder";
            return null;
          }}
        </Route>
        <Route path="/portfolio">
          {() => {
            window.location.href = "/training/portfolio";
            return null;
          }}
        </Route>
        <Route path="/exit-strategy">
          {() => {
            window.location.href = "/training/exit-strategy";
            return null;
          }}
        </Route>
        <Route path="/profit-taking">
          {() => {
            window.location.href = "/training/profit-taking";
            return null;
          }}
        </Route>
        <Route path="/learn">
          {() => {
            window.location.href = "/training/learn-defi";
            return null;
          }}
        </Route>
        <Route path="/stablecoin-guide">
          {() => {
            window.location.href = "/training/stablecoin-guide";
            return null;
          }}
        </Route>
        <Route path="/robin-hood-trading">
          {() => {
            window.location.href = "/training/robinhood-trading";
            return null;
          }}
        </Route>
        <Route path="/passive-income-training">
          {() => {
            window.location.href = "/training/passive-income-training";
            return null;
          }}
        </Route>
        <Route path="/crypto-project-discovery">
          {() => {
            window.location.href = "/training/project-discovery";
            return null;
          }}
        </Route>
        <Route path="/yield-pools-explorer">
          {() => {
            window.location.href = "/training/yield-pools";
            return null;
          }}
        </Route>
        <Route path="/thirty-second-trader">
          {() => {
            window.location.href = "/training/30secondtrader";
            return null;
          }}
        </Route>
        <Route path="/warrior-trading">
          {() => {
            window.location.href = "/training/warrior-trading";
            return null;
          }}
        </Route>
        <Route path="/nancy-pelosi-strategy">
          {() => {
            window.location.href = "/training/nancy-pelosi-strategy";
            return null;
          }}
        </Route>
        <Route path="/economic-calendar">
          {() => {
            window.location.href = "/training/economic-calendar";
            return null;
          }}
        </Route>
        <Route path="/ma-fibonacci">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyMAFibonacciStrategy />
          </Suspense>
        </Route>
        <Route path="/ma-fibonacci-scanner">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyMAFibonacciScanner />
          </Suspense>
        </Route>
        <Route path="/central-scanner">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyCentralScanner />
          </Suspense>
        </Route>
        <Route path="/institutional-analysis">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyInstitutionalAnalysisSystem />
          </Suspense>
        </Route>
        <Route path="/power-scanner">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyPowerScanner />
          </Suspense>
        </Route>
        <Route path="/trading-games">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyTradingGames />
          </Suspense>
        </Route>
        <Route path="/interactive-tutorials">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyInteractiveTutorials />
          </Suspense>
        </Route>
        <Route path="/hedge-fund-scanner">
          <Suspense fallback={<ModernLoadingSpinner />}>
            <LazyHedgeFundScanner />
          </Suspense>
        </Route>
        
        {/* Catch-all 404 */}
        <Route component={NotFound} />
      </Switch>
    </ModernLayout>
  );
}

// Main App component with providers
export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalNewsAlertProvider>
        <SkillLevelProvider>
          <AppContent />
          <GlobalNewsOverlay />
          <HFCAdvisorChat />
        </SkillLevelProvider>
      </GlobalNewsAlertProvider>
    </div>
  );
}