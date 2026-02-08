import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Shield,
  LogOut,
  BarChart3,
  Edit3
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  interface AdminStats {
    totalStrategies: number;
    totalModules: number;
    totalUsers: number;
    systemHealth: string;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-16 hover:w-64 transition-all duration-300 bg-black/20 border-r border-white/10 min-h-screen group">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Admin Panel
                </span>
              </div>
              
              <nav className="space-y-2">
                <a href="/admin" className="flex items-center gap-3 p-3 rounded-lg bg-blue-600/20 text-blue-300">
                  <BarChart3 className="w-5 h-5 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dashboard</span>
                </a>
                <a href="/admin/content" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <Edit3 className="w-5 h-5 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Content Editor</span>
                </a>
                <a href="/admin/training" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <GraduationCap className="w-5 h-5 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Training Modules</span>
                </a>
                <a href="/admin/strategies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <TrendingUp className="w-5 h-5 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Strategies</span>
                </a>
                <a href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Settings</span>
                </a>
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {user?.name?.[0] || user?.email?.[0] || 'A'}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-sm font-medium whitespace-nowrap">{user?.name || 'Admin'}</div>
                      <div className="text-xs text-gray-200 whitespace-nowrap">{user?.email}</div>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 group-hover:w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Logout
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-gray-300">
                  Manage your DeFi training platform content, modules, and settings.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    Admin Access
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    {user?.email}
                  </Badge>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Total Strategies</p>
                        <p className="text-2xl font-bold">{(stats as AdminStats)?.totalStrategies || 0}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Training Modules</p>
                        <p className="text-2xl font-bold">{(stats as AdminStats)?.totalModules || 0}</p>
                      </div>
                      <GraduationCap className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">Total Users</p>
                        <p className="text-2xl font-bold">{(stats as AdminStats)?.totalUsers || 0}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-200">System Health</p>
                        <p className="text-2xl font-bold">
                          {(stats as AdminStats)?.systemHealth === 'healthy' ? '✓' : '⚠'}
                        </p>
                      </div>
                      <Shield className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-blue-400" />
                      Content Editor
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Edit training modules, strategies, and page content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => window.location.href = '/admin/content'}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Open Editor
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-green-400" />
                      Training Management
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage training modules and learning paths
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => window.location.href = '/admin/training'}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Manage Training
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Strategy Database
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      View and manage trading strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => window.location.href = '/admin/strategies'}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      View Strategies
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-400" />
                      Step-by-Step Builder
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Build detailed instructions for all modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => window.location.href = '/admin/step-by-step'}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Manage Steps
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/10 border-white/20 mt-8">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription className="text-gray-300">
                    Latest admin actions and system updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">System started successfully</p>
                        <p className="text-xs text-gray-200">Training modules and strategies loaded</p>
                      </div>
                      <span className="text-xs text-gray-200">Now</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Admin login successful</p>
                        <p className="text-xs text-gray-200">{user?.email}</p>
                      </div>
                      <span className="text-xs text-gray-200">Just now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}