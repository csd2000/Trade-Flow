import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, LogOut, ArrowRight, DollarSign } from "lucide-react";
import { Link } from "wouter";

export function QuickActions() {
  const actions = [
    {
      label: "New Strategy",
      icon: Plus,
      variant: "primary",
      className: "bg-crypto-primary/10 border-crypto-primary/20 text-crypto-primary hover:bg-crypto-primary/20"
    },
    {
      label: "View Analytics", 
      icon: BarChart3,
      variant: "secondary",
      className: "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
    },
    {
      label: "Profit Taking",
      icon: DollarSign,
      variant: "secondary", 
      className: "bg-crypto-secondary/10 border-crypto-secondary/20 text-crypto-secondary hover:bg-crypto-secondary/20"
    },
    {
      label: "Exit Strategy",
      icon: LogOut,
      variant: "secondary", 
      className: "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
    }
  ];

  return (
    <div className="crypto-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-crypto-purple to-crypto-secondary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">🚀</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">Quick Actions</h3>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const href = action.label === "Profit Taking" ? "/profit-taking" : 
                      action.label === "Exit Strategy" ? "/exit-strategy" : 
                      action.label === "View Analytics" ? "/portfolio" : "/strategies";
          
          return (
            <Link key={index} href={href}>
              <Button
                variant="outline"
                className={`w-full justify-between p-3 sm:p-4 border ${action.className} transition-all duration-300 hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">{action.label}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
