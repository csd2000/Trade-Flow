import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Target, 
  BookOpen, 
  Settings,
  X,
  Star,
  TestTube,
  Brain,
  TrendingUp
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
  
  // Clean navigation with exactly what we need - no duplicates
  const navigationItems = [
    {
      id: "home",
      title: "🎓 Free Training Academy",
      href: "/", 
      icon: Home,
      active: location === "/"
    },
    {
      id: "button-test",
      title: "🧪 Button Testing",
      href: "/button-test",
      icon: TestTube,
      active: location === "/button-test"
    },
    {
      id: "defi-pro",
      title: "💼 DeFi Strategist Pro",
      href: "/defi-pro",
      icon: Star,
      active: location === "/defi-pro"
    },
    {
      id: "protocols",
      title: "🔗 Protocols",
      href: "/protocols",
      icon: Target,
      active: location === "/protocols"
    },
    {
      id: "portfolio",
      title: "📊 Portfolio",
      href: "/portfolio",
      icon: BookOpen,
      active: location === "/portfolio"
    },
    {
      id: "crypto-profit-calculator",
      title: "🎯 Profit Calculator",
      href: "/crypto-profit-calculator",
      icon: Target,
      active: location === "/crypto-profit-calculator"
    },
    {
      id: "bull-run-profit-taking",
      title: "🚀 Bull Run Exit Strategy",
      href: "/bull-run-profit-taking",
      icon: Target,
      active: location === "/bull-run-profit-taking"
    },
    {
      id: "timeseries",
      title: "🔮 Time Series AI Predictions",
      href: "/timeseries",
      icon: Brain,
      active: location === "/timeseries"
    },
    {
      id: "quant",
      title: "📈 Quantitative Trading AI",
      href: "/quant",
      icon: TrendingUp,
      active: location === "/quant"
    }
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Professional Trading</h2>
            <p className="text-gray-600 text-sm">Elite Education Platform</p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleLinkClick}
              className={`w-full justify-start text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                item.active
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            100% Free Forever
          </p>
        </div>
      </div>
    </div>
  );
}