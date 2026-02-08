import {
  Home,
  GraduationCap,
  Zap,
  Brain,
  PieChart,
  TrendingUp,
  Eye,
  Clock,
  Bell,
  Activity,
  Coins,
  Building2,
  Flame,
  Layers,
  Database,
  BookOpen,
  BarChart3,
  Shield,
  Crosshair,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react';
import type { SkillLevel } from '@/contexts/SkillLevelContext';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: 'Pro' | 'Live' | 'AI' | 'New' | 'Hot';
  skillLevel: 'all' | 'beginner' | 'experienced';
  warningLabel?: string;
}

export interface NavCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  skillLevel: 'all' | 'beginner' | 'experienced';
  isAdvanced?: boolean;
  defaultExpanded?: boolean;
}

export const navigationCategories: NavCategory[] = [
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    skillLevel: 'all',
    defaultExpanded: true,
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: Home,
        description: 'Overview & Quick Access',
        skillLevel: 'all',
      },
      {
        name: 'Academy',
        href: '/master-academy',
        icon: GraduationCap,
        description: 'Learning Paths',
        skillLevel: 'all',
      },
      {
        name: 'Trading Games',
        href: '/trading-games',
        icon: Gamepad2,
        description: 'Learn Trading Concepts',
        skillLevel: 'all',
      },
      {
        name: 'Interactive Tutorials',
        href: '/interactive-tutorials',
        icon: BookOpen,
        description: 'Guided Trading Simulations',
        badge: 'New',
        skillLevel: 'all',
      },
    ],
  },
  {
    id: 'analyze',
    label: 'Analyze',
    icon: BarChart3,
    skillLevel: 'all',
    defaultExpanded: true,
    items: [
      {
        name: 'Power Scanner',
        href: '/power-scanner',
        icon: Zap,
        description: 'All-in-One AI Analysis & Forecasting',
        badge: 'Pro',
        skillLevel: 'all',
      },
      {
        name: 'Hedge Fund Scanner',
        href: '/hedge-fund-scanner',
        icon: Building2,
        description: 'Institutional Market Maker Analysis',
        badge: 'Pro',
        skillLevel: 'all',
      },
      {
        name: 'AI Trading Assistant',
        href: '/ai-assistant',
        icon: Brain,
        description: 'Strategy Recommendations',
        badge: 'AI',
        skillLevel: 'all',
      },
      {
        name: 'AI Trading Plan',
        href: '/ai-trading-plan',
        icon: PieChart,
        description: 'Portfolio Tracker',
        badge: 'New',
        skillLevel: 'all',
      },
      {
        name: 'Reversal AI',
        href: '/reversal',
        icon: TrendingUp,
        description: 'Divergence + Sentiment',
        badge: 'New',
        skillLevel: 'all',
      },
      {
        name: 'Whale Shield',
        href: '/whale-shield',
        icon: Eye,
        description: 'Max Pain + PCR Gauge',
        skillLevel: 'all',
      },
    ],
  },
  {
    id: 'trade',
    label: 'Trade',
    icon: TrendingUp,
    skillLevel: 'all',
    defaultExpanded: true,
    items: [
      {
        name: 'Daily Checklist',
        href: '/daily-checklist',
        icon: Clock,
        description: 'Trading Workflow',
        skillLevel: 'all',
      },
      {
        name: 'Alert Center',
        href: '/alert-center',
        icon: Bell,
        description: 'Custom Price & Indicator Alerts',
        badge: 'New',
        skillLevel: 'all',
      },
      {
        name: 'AI Automatic Trading',
        href: '/automated-trading',
        icon: Activity,
        description: 'Automated Trade Execution',
        badge: 'Live',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Command Center',
        href: '/command-center',
        icon: Activity,
        description: 'Whale Stream & AI Analyst',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Futures Desk',
        href: '/futures',
        icon: Coins,
        description: 'Gold & Silver Futures',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: Shield,
    skillLevel: 'all',
    isAdvanced: true,
    defaultExpanded: false,
    items: [
      {
        name: 'Dark Pool AI',
        href: '/dark-pool',
        icon: Eye,
        description: 'Institutional Trade Detection',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'HF Trading',
        href: '/scalping',
        icon: Zap,
        description: 'Scalping + Confluence Strategies',
        badge: 'Live',
        skillLevel: 'experienced',
        warningLabel: 'High risk - Recommended for experienced traders',
      },
      {
        name: 'Institutional Analysis',
        href: '/institutional-analysis',
        icon: Building2,
        description: 'All-in-One: 7-Gate, Quant, HF/MM Flow',
        badge: 'Pro',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Stink Bid Calculator',
        href: '/sniper-trader',
        icon: Crosshair,
        description: '7-Gate System & Stink Bid',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Secret Sauce',
        href: '/secret-sauce',
        icon: Flame,
        description: 'SMC + 5-Gate System',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Supply & Demand Scanner',
        href: '/supply-demand',
        icon: Layers,
        description: 'Institutional Zone Detection',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Rule Based Scanner',
        href: '/central-scanner',
        icon: Layers,
        description: 'Multi-Source Rule Engine',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
      {
        name: 'Data Sources',
        href: '/data-sources',
        icon: Database,
        description: 'Bloomberg, Refinitiv & Multi-Source',
        badge: 'New',
        skillLevel: 'experienced',
        warningLabel: 'Recommended for experienced traders',
      },
    ],
  },
];

// Helper function to filter items based on skill level (for potential future use)
export function filterNavigationForSkillLevel(
  categories: NavCategory[],
  userSkillLevel: SkillLevel
): NavCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.skillLevel === 'all' ||
        item.skillLevel === userSkillLevel ||
        userSkillLevel === 'experienced'
    ),
  }));
}

// Get flat list of all nav items (for search, etc.)
export function getAllNavItems(): NavItem[] {
  return navigationCategories.flatMap((category) => category.items);
}

// Badge color mapping
export const badgeColors: Record<string, string> = {
  Pro: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Live: 'bg-red-500/20 text-red-300 border-red-500/30',
  AI: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  New: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Hot: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

// Education nav item (kept separate for potential different handling)
export const educationNavItem: NavItem = {
  name: 'Academy',
  href: '/master-academy',
  icon: GraduationCap,
  description: 'Learning Paths',
  skillLevel: 'all',
};
