import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ title, subtitle, onMenuClick, showMobileMenu = false }: HeaderProps) {
  return (
    <div className="bg-crypto-surface border-b border-crypto-border px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="text-white hover:bg-slate-700 border border-slate-600 mobile-button"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-crypto-text mobile-text">
              {title}
            </h1>
            <p className="text-sm text-crypto-muted mobile-text">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}