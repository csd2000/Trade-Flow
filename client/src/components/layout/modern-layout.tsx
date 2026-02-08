import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationBell } from '@/components/NotificationBell';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { navigationCategories, type NavItem, type NavCategory, badgeColors } from '@/config/navigation-config';
import { useSkillLevel } from '@/hooks/useSkillLevel';
import { UnlockProgressCard } from '@/components/UnlockProgressCard';
import {
  Menu,
  X,
  Home,
  BookOpen,
  BarChart3,
  Settings,
  User,
  TrendingUp,
  Shield,
  Zap,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Brain,
  LineChart,
  Target,
  Newspaper,
  Calculator,
  Activity,
  PieChart,
  Sparkles,
  GraduationCap,
  Wallet,
  Globe,
  Clock,
  Star,
  Coins,
  DollarSign,
  Building2,
  Eye,
  Network,
  Flame,
  Layers,
  Database,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GlobalSearch } from '@/components/GlobalSearch';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const adminItems = [
  { name: 'Admin Panel', href: '/admin', icon: Settings, description: 'System Settings' },
];

export default function ModernLayout({ children }: ModernLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const logoutMutation = useLogout();
  const { skillLevel, dismissedAdvancedWarnings } = useSkillLevel();

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationCategories.forEach((cat) => {
      initial[cat.id] = cat.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleSignOut = async () => {
    logoutMutation.mutate();
  };

  const NavItemComponent = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const Icon = item.icon;
    const isActive = location === item.href;
    const showWarning = skillLevel === 'beginner' && item.warningLabel && !dismissedAdvancedWarnings;

    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer transition-all duration-200 relative ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5" />
                  {showWarning && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span>{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {showWarning && (
                <span className="text-xs text-amber-400">{item.warningLabel}</span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link href={item.href}>
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
            isActive
              ? 'bg-violet-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{item.name}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${
                    isActive
                      ? 'bg-white/20 text-white border-0'
                      : item.badge === 'New'
                      ? 'bg-emerald-600/30 text-emerald-300 border-0'
                      : item.badge === 'Hot'
                      ? 'bg-orange-600/30 text-orange-300 border-0'
                      : item.badge === 'Live'
                      ? 'bg-red-600/30 text-red-300 border-0'
                      : item.badge === 'AI'
                      ? 'bg-violet-600/30 text-violet-300 border-0'
                      : 'bg-slate-600/30 text-slate-300 border-0'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
              {showWarning && (
                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <span className={`text-xs truncate block ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
              {showWarning ? item.warningLabel : item.description}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  const SectionTitle = ({ title, collapsed }: { title: string; collapsed: boolean }) => {
    if (collapsed) return null;
    return (
      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {title}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Fixed with independent scroll */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen border-r border-slate-700/50 bg-slate-900 transition-all duration-300 z-40 ${
        isSidebarOpen ? 'w-64' : 'w-[72px]'
      }`}>
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-slate-700/50 px-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen ? (
            <>
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer group" data-testid="logo">
                  <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight text-white">TradeFlow</span>
                    <span className="text-[10px] text-slate-400 -mt-0.5">Professional Trading</span>
                  </div>
                </div>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsSidebarOpen(false)}
                data-testid="button-collapse-sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => setIsSidebarOpen(true)}
              data-testid="button-expand-sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className={`space-y-1 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
            {navigationCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategories[category.id];

              if (!isSidebarOpen) {
                // Collapsed sidebar - just show icons
                return (
                  <div key={category.id} className="space-y-1">
                    {category.items.map((item) => (
                      <NavItemComponent key={item.href} item={item} collapsed={true} />
                    ))}
                    <div className="py-1" />
                  </div>
                );
              }

              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                  className="mb-2"
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors group">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4" />
                        <span>{category.label}</span>
                        {category.isAdvanced && skillLevel === 'beginner' && (
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {category.items.map((item) => (
                      <NavItemComponent key={item.href} item={item} collapsed={false} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {isAdmin && (
              <>
                <div className="py-2" />
                <SectionTitle title="Admin" collapsed={!isSidebarOpen} />
                {adminItems.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={{ ...item, skillLevel: 'all' }}
                    collapsed={!isSidebarOpen}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-700 space-y-3">
            {/* Unlock Progress for Beginners */}
            {skillLevel === 'beginner' && (
              <UnlockProgressCard variant="sidebar" />
            )}

            {/* Pro Features Status */}
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Pro Features</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Access real-time data and AI predictions
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-slate-300">Systems Online</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'
      }`}>
        {/* Top Header - Professional dark theme */}
        <header className={`sticky top-0 z-40 h-16 border-b border-slate-700 bg-slate-900 transition-all duration-300 ${
          isScrolled ? 'shadow-lg shadow-black/20' : ''
        }`}>
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            {/* Mobile Menu & Search */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-slate-700 border border-slate-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </Button>
              
              {/* Mobile Logo */}
              <Link href="/">
                <div className="lg:hidden flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white">TradeFlow</span>
                </div>
              </Link>

              {/* Global Search */}
              <GlobalSearch />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Market Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Markets Open</span>
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2" data-testid="button-user-menu">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium max-w-[100px] truncate">
                          {user?.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {isAdmin ? 'Admin' : 'Trader'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.email}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {isAdmin ? 'Administrator' : 'Member'}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => setLocation('/admin')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Security
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setLocation('/login')} className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4" data-testid="button-signin">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay - Full screen with high contrast */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-2xl animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">TradeFlow</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pro Trading</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-4rem)]">
                <div className="p-4 space-y-2">
                  {navigationCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    const isExpanded = expandedCategories[category.id];
                    const showCategoryWarning = category.isAdvanced && skillLevel === 'beginner';

                    return (
                      <Collapsible
                        key={category.id}
                        open={isExpanded}
                        onOpenChange={() => toggleCategory(category.id)}
                        className="mb-2"
                      >
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4" />
                              <span>{category.label}</span>
                              {showCategoryWarning && (
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                          {category.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = location === item.href;
                            const showWarning =
                              skillLevel === 'beginner' &&
                              item.warningLabel &&
                              !dismissedAdvancedWarnings;

                            return (
                              <div key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                <Link href={item.href}>
                                  <div
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                      isActive
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    <Icon className="w-5 h-5" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">{item.name}</span>
                                        {item.badge && (
                                          <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                                              isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'
                                            }`}
                                          >
                                            {item.badge}
                                          </span>
                                        )}
                                        {showWarning && (
                                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        )}
                                      </div>
                                      {showWarning && (
                                        <span className="text-xs text-amber-600 dark:text-amber-400">
                                          {item.warningLabel}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}

                  {isAdmin && (
                    <>
                      <div className="py-3" />
                      <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Admin
                      </div>
                      {adminItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        return (
                          <div key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <Link href={item.href}>
                              <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                  isActive
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="font-semibold">{item.name}</span>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Quick Status in Mobile Menu */}
                  <div className="mt-6 mx-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-100 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Markets Open
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">All systems operational</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer - Hidden on mobile to make room for bottom nav */}
        <footer className="hidden md:block border-t border-border bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">TradeFlow Pro</span>
                <span className="text-xs text-muted-foreground">© 2024</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Support</a>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {[
              { name: 'Home', href: '/', icon: Home },
              { name: 'Scanner', href: '/scanner', icon: Target },
              { name: 'AI Trader', href: '/ai-trader', icon: Brain },
              { name: 'Command', href: '/command-center', icon: Activity },
              { name: 'More', href: '#', icon: Menu, isMenu: true }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              if (item.isMenu) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex flex-col items-center justify-center flex-1 py-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                    data-testid="button-mobile-more"
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </button>
                );
              }
              
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                    }`}
                    data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                    <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{item.name}</span>
                    {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Spacer for mobile bottom nav */}
        <div className="md:hidden h-16" />
      </div>
    </div>
  );
}
