import React, { useState } from "react";
import { Sidebar } from "./sidebar-clean";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

export function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile header - Only visible on mobile */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMobileMenu}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Professional Trading Academy
            </h1>
            <p className="text-xs text-gray-600">
              Elite Trading Education Platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden lg:block w-72 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
          <Sidebar />
        </div>
        
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm" 
              onClick={closeMobileMenu} 
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl">
              <Sidebar onClose={closeMobileMenu} />
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <main className="flex-1 lg:ml-72">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}