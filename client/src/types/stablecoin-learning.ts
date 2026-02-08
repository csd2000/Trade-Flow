export interface StablecoinLearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  sections: LearningSection[];
  quiz?: QuizQuestion[];
  resources: ResourceLink[];
}

export interface LearningSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'calculator';
  examples?: ConversionExample[];
  keyPoints?: string[];
}

export interface ConversionExample {
  id: string;
  title: string;
  scenario: string;
  initialValue: number;
  finalValue: number;
  holdingPeriod: number;
  taxBracket: number;
  gain: number;
  taxOwed: number;
  type: 'short-term' | 'long-term' | 'loss';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  type: 'article' | 'video' | 'tool' | 'official';
}

export interface StablecoinType {
  name: string;
  symbol: string;
  description: string;
  backing: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  popularity: number;
  useCases: string[];
  pros: string[];
  cons: string[];
}

export interface ConversionTiming {
  condition: string;
  description: string;
  indicators: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  color: string;
}

export interface TaxScenario {
  name: string;
  description: string;
  example: ConversionExample;
  taxRate: number;
  tips: string[];
}