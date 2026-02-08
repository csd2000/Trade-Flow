import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Search, 
  Target, 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Settings,
  X,
  DollarSign,
  ShieldCheck,
  Activity,
  GraduationCap,
  Calendar,
  Shield,
  Rocket,
  Layers,
  Building,
  Users,
  Brain,
  Globe,
  Star,
  Zap,
  Crosshair,
  Bot
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };
  
  const navigationItems = [
    {
      id: "home",
      title: "🎓 Free Training Academy",
      href: "/", 
      icon: BookOpen,
      active: location === "/"
    },
    {
      id: "hfc-apex",
      title: "⚡ 8-Gate Options System",
      href: "/hfc-apex",
      icon: Zap,
      active: location === "/hfc-apex"
    },
    {
      id: "seven-gate",
      title: "🚀 7-Gate ORB System",
      href: "/seven-gate",
      icon: Layers,
      active: location === "/seven-gate"
    },
    {
      id: "scanner",
      title: "🎯 5:1 Scanner",
      href: "/scanner",
      icon: Crosshair,
      active: location === "/scanner"
    },
    {
      id: "candle-cheatsheet",
      title: "🕯️ Candle Cheat Sheet",
      href: "/training/secret-sauce-candle-cheatsheet",
      icon: BookOpen,
      active: location.startsWith("/training/secret-sauce-candle-cheatsheet")
    },
    {
      id: "ai-assistant",
      title: "🤖 AI Trading Assistant",
      href: "/ai-assistant",
      icon: Brain,
      active: location === "/ai-assistant"
    },
    {
      id: "ai-trading-plan",
      title: "📊 AI Trading Plan",
      href: "/ai-trading-plan",
      icon: TrendingUp,
      active: location === "/ai-trading-plan"
    },
    {
      id: "automated-trading",
      title: "🤖 Automated Trading",
      href: "/automated-trading",
      icon: Bot,
      active: location === "/automated-trading"
    },
    {
      id: "supply-demand",
      title: "📊 Supply & Demand Scanner",
      href: "/supply-demand",
      icon: Layers,
      active: location === "/supply-demand"
    },
    {
      id: "defi-pro",
      title: "💼 DeFi Strategist Pro",
      href: "/defi-pro",
      icon: Star,
      active: location === "/defi-pro"
    },
    {
      title: "Protocols",
      href: "/protocols", 
      icon: Search,
      active: location === "/protocols"
    },
    {
      title: "Strategy Builder",
      href: "/strategies",
      icon: Target,
      active: location === "/strategies"
    },
    {
      title: "Portfolio",
      href: "/portfolio",
      icon: BarChart3,
      active: location === "/portfolio"
    },
    {
      title: "Profit Taking",
      href: "/profit-taking",
      icon: DollarSign,
      active: location === "/profit-taking"
    },
    {
      title: "Exit Strategy",
      href: "/exit-strategy",
      icon: ShieldCheck,
      active: location === "/exit-strategy"
    },
    {
      title: "Learn DeFi",
      href: "/learn",
      icon: BookOpen,
      active: location === "/learn"
    },
    {
      title: "Stablecoin Guide",
      href: "/stablecoin-guide",
      icon: TrendingUp,
      active: location === "/stablecoin-guide"
    },
    {
      title: "Robin Hood Trading",
      href: "/robin-hood-trading",
      icon: Activity,
      active: location === "/robin-hood-trading"
    },

    {
      title: "Cashflow Challenge",
      href: "/crypto-cashflow-challenge",
      icon: Calendar,
      active: location === "/crypto-cashflow-challenge"
    },
    {
      title: "DeFi Safety System",
      href: "/defi-safety-system",
      icon: Shield,
      active: location === "/defi-safety-system"
    },
    {
      title: "Education Hub",
      href: "/crypto-education-hub",
      icon: BookOpen,
      active: location === "/crypto-education-hub"
    },
    {
      title: "Project Discovery",
      href: "/crypto-project-discovery",
      icon: Rocket,
      active: location === "/crypto-project-discovery"
    },
    {
      title: "Yield Pools",
      href: "/yield-pools-explorer",
      icon: Layers,
      active: location === "/yield-pools-explorer"
    },
    {
      title: "30SecondTrader",
      href: "/thirty-second-trader",
      icon: Activity,
      active: location === "/thirty-second-trader"
    },
    {
      title: "Warrior Trading",
      href: "/warrior-trading",
      icon: Target,
      active: location === "/warrior-trading"
    },

    {
      title: "Nancy Pelosi Strategy",
      href: "/nancy-pelosi-strategy",
      icon: TrendingUp,
      active: location === "/nancy-pelosi-strategy"
    },
    {
      title: "Economic Calendar",
      href: "/economic-calendar",
      icon: Calendar,
      active: location === "/economic-calendar"
    },
    {
      title: "🔮 Time Series AI",
      href: "/timeseries",
      icon: Brain,
      active: location === "/timeseries"
    },
    {
      title: "📈 Quantitative Trading AI",
      href: "/quant",
      icon: TrendingUp,
      active: location === "/quant"
    }
  ];

  return (
    <div className="w-72 bg-crypto-surface border-r border-crypto-border h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-crypto-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-crypto-text">CryptoFlow</h2>
            <p className="text-crypto-muted text-sm">Professional DeFi Platform</p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden btn-secondary"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-12 ${
                  item.active 
                    ? 'bg-crypto-primary bg-opacity-15 text-crypto-primary border-crypto-primary' 
                    : 'text-crypto-muted hover:text-crypto-text hover:bg-crypto-card'
                }`}
                onClick={handleLinkClick}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-crypto-border">
        <div className="p-4 rounded-xl bg-crypto-card">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-crypto-primary rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-crypto-text">Pro Account</div>
              <div className="text-xs text-crypto-muted">Advanced Features</div>
            </div>
          </div>
          <Button size="sm" className="btn-primary w-full">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}