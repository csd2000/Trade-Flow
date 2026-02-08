// Training API service - manages all training-related data operations
const API_BASE = '';

async function apiRequest(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Types for enhanced training system
export interface UserStats {
  strategiesCompleted: number;
  modulesCompleted: number;
  totalTimeSpent: number;
  alertsActive: number;
  strategiesSaved: number;
  backtestsRun: number;
}

export interface TrainingStrategy {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: string;
  risk: string;
  roiRange?: string;
  tags: string[];
  trainingUrl?: string;
  pdfUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trackId?: string;
  firstModuleSlug?: string;
  successRate?: string;
}

export interface TrainingModule {
  id: number;
  strategyId: number;
  moduleNumber: number;
  title: string;
  description?: string;
  content?: any;
  videoUrl?: string;
  duration: string;
  durationMinutes: number;
  isRequired: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface UserProgress {
  id: number;
  userId: number;
  moduleId: number;
  strategySlug: string;
  isCompleted: boolean;
  completedAt?: string;
  timeSpentMinutes: number;
  quizScore?: number;
  notes?: string;
}

export interface UserAlert {
  id: number;
  userId: number;
  strategySlug: string;
  alertType: string;
  title: string;
  message: string;
  triggerConditions?: any;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface SavedStrategy {
  id: number;
  userId: number;
  strategySlug: string;
  customName?: string;
  personalNotes?: string;
  customSettings?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BacktestResult {
  id: number;
  userId: number;
  strategySlug: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: string;
  finalCapital: string;
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  profitFactor?: number;
  avgWin?: number;
  avgLoss?: number;
  maxWin?: number;
  maxLoss?: number;
  tradeDetails?: any;
  performanceChart?: any;
  createdAt: string;
}

// Default user ID for demo purposes
const DEFAULT_USER_ID = 1;

// Training Strategy API
export const trainingApi = {
  // Get all strategies
  async getStrategies(): Promise<TrainingStrategy[]> {
    return apiRequest('/api/strategies');
  },

  // Get strategy by slug
  async getStrategy(slug: string): Promise<TrainingStrategy> {
    return apiRequest(`/api/strategies/${slug}`);
  },

  // Get modules for a strategy
  async getStrategyModules(slug: string): Promise<TrainingModule[]> {
    return apiRequest(`/api/strategies/${slug}/modules`);
  },

  // Get user progress for a strategy
  async getUserProgress(slug: string, userId: number = DEFAULT_USER_ID): Promise<{
    progress: UserProgress[];
    completionRate: { completed: number; total: number; percentage: number };
  }> {
    return apiRequest(`/api/user/${userId}/progress/${slug}`);
  },

  // Complete a module
  async completeModule(moduleId: number, strategySlug: string, timeSpentMinutes: number = 0, userId: number = DEFAULT_USER_ID): Promise<UserProgress> {
    return apiRequest(`/api/user/${userId}/complete-module`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId,
        strategySlug,
        timeSpentMinutes
      })
    });
  },

  // Alert management
  async getUserAlerts(userId: number = DEFAULT_USER_ID): Promise<UserAlert[]> {
    return apiRequest(`/api/user/${userId}/alerts`);
  },

  async createAlert(alertData: {
    strategySlug: string;
    alertType: string;
    title: string;
    message: string;
    triggerConditions?: any;
  }, userId: number = DEFAULT_USER_ID): Promise<UserAlert> {
    return apiRequest(`/api/user/${userId}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    });
  },

  async deleteAlert(alertId: number, userId: number = DEFAULT_USER_ID): Promise<{ success: boolean }> {
    return apiRequest(`/api/user/${userId}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Saved strategies management
  async getSavedStrategies(userId: number = DEFAULT_USER_ID): Promise<SavedStrategy[]> {
    return apiRequest(`/api/user/${userId}/saved-strategies`);
  },

  async saveStrategy(strategyData: {
    strategySlug: string;
    customName?: string;
    personalNotes?: string;
    customSettings?: any;
  }, userId: number = DEFAULT_USER_ID): Promise<SavedStrategy> {
    return apiRequest(`/api/user/${userId}/save-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategyData)
    });
  },

  async unsaveStrategy(strategySlug: string, userId: number = DEFAULT_USER_ID): Promise<{ success: boolean }> {
    return apiRequest(`/api/user/${userId}/unsave-strategy/${strategySlug}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Backtest management
  async getBacktestResults(strategySlug?: string, userId: number = DEFAULT_USER_ID): Promise<BacktestResult[]> {
    const url = strategySlug 
      ? `/api/user/${userId}/backtests?strategySlug=${strategySlug}`
      : `/api/user/${userId}/backtests`;
    return apiRequest(url);
  },

  async runBacktest(backtestData: {
    strategySlug: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  }, userId: number = DEFAULT_USER_ID): Promise<BacktestResult> {
    return apiRequest(`/api/user/${userId}/run-backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backtestData)
    });
  },

  // Analytics
  async getSystemStats(): Promise<{
    totalStrategies: number;
    totalModules: number;
    totalUsers: number;
    totalBacktests: number;
  }> {
    return apiRequest('/api/analytics/system-stats');
  },

  async getUserStats(userId: number = DEFAULT_USER_ID): Promise<UserStats> {
    // Mock data for now since user system isn't implemented yet
    return {
      strategiesCompleted: 12,
      modulesCompleted: 89,
      totalTimeSpent: 156,
      alertsActive: 7,
      strategiesSaved: 5,
      backtestsRun: 23
    };
  }
};