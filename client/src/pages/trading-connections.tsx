import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Link2, Unlink, RefreshCw, Check, X, AlertTriangle, 
  DollarSign, Trash2, Settings, Shield, Zap, Key
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TradingConnection {
  id: number;
  connectionUuid: string;
  platform: string;
  nickname: string;
  isActive: boolean;
  isPaperTrading: boolean;
  connectionStatus: string;
  lastConnectedAt: string | null;
  createdAt: string;
}

interface Platform {
  id: string;
  name: string;
  assetTypes: string[];
  hasCredentials: boolean;
}

interface OrderStats {
  totalOrders: number;
  filledOrders: number;
  pendingOrders: number;
  rejectedOrders: number;
  totalVolume: number;
  byPlatform: Record<string, number>;
  bySignalSource: Record<string, number>;
}

const PlatformCard = ({ platform, onConnect, onShowApiHelp }: { platform: Platform; onConnect: () => void; onShowApiHelp: (platformId: string) => void }) => {
  const platformColors: Record<string, string> = {
    binance: 'from-yellow-600 to-amber-700',
    alpaca: 'from-green-600 to-emerald-700',
    oanda: 'from-blue-600 to-indigo-700',
    coinbase: 'from-blue-500 to-cyan-600'
  };

  const platformLogos: Record<string, string> = {
    binance: '🟡',
    alpaca: '🦙',
    oanda: '📊',
    coinbase: '🔵'
  };

  const secretNames: Record<string, string> = {
    binance: 'BINANCE_API_KEY & BINANCE_SECRET_KEY',
    alpaca: 'ALPACA_API_KEY & ALPACA_SECRET_KEY',
    oanda: 'OANDA_API_KEY & OANDA_ACCOUNT_ID',
    coinbase: 'COINBASE_API_KEY & COINBASE_SECRET_KEY'
  };

  return (
    <Card className={`bg-gradient-to-br ${platformColors[platform.id] || 'from-gray-600 to-gray-700'} border-0 hover:scale-105 transition-transform`} data-testid={`platform-card-${platform.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{platformLogos[platform.id]}</span>
            <div>
              <h3 className="text-white font-bold">{platform.name}</h3>
              <p className="text-white/70 text-xs">{platform.assetTypes.join(', ')}</p>
            </div>
          </div>
          <Badge className={platform.hasCredentials ? 'bg-green-500' : 'bg-red-500'}>
            {platform.hasCredentials ? 'API Ready' : 'No API Key'}
          </Badge>
        </div>
        {platform.hasCredentials ? (
          <Button 
            onClick={onConnect}
            className="w-full bg-white/20 hover:bg-white/30 text-white"
            data-testid={`connect-${platform.id}`}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Connect
          </Button>
        ) : (
          <Button 
            onClick={() => onShowApiHelp(platform.id)}
            className="w-full bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 border border-amber-400/50"
            data-testid={`add-key-${platform.id}`}
          >
            <Key className="h-4 w-4 mr-2" />
            Add API Key in Secrets
          </Button>
        )}
        {!platform.hasCredentials && (
          <p className="text-white/60 text-xs mt-2 text-center">
            Required: {secretNames[platform.id]}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const ConnectionRow = ({ 
  connection, 
  onToggleActive, 
  onTogglePaper, 
  onDelete,
  onTest
}: { 
  connection: TradingConnection;
  onToggleActive: () => void;
  onTogglePaper: () => void;
  onDelete: () => void;
  onTest: () => void;
}) => {
  const statusColors: Record<string, string> = {
    connected: 'bg-green-500',
    pending: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <Card className="bg-slate-800 border-slate-700" data-testid={`connection-${connection.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${statusColors[connection.connectionStatus] || 'bg-gray-500'}`} />
            <div>
              <h4 className="text-white font-medium">{connection.nickname}</h4>
              <p className="text-slate-200 text-sm capitalize">{connection.platform}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor={`paper-${connection.id}`} className="text-slate-200 text-sm">Paper</Label>
              <Switch 
                id={`paper-${connection.id}`}
                checked={connection.isPaperTrading ?? true}
                onCheckedChange={onTogglePaper}
                data-testid={`paper-toggle-${connection.id}`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor={`active-${connection.id}`} className="text-slate-200 text-sm">Active</Label>
              <Switch 
                id={`active-${connection.id}`}
                checked={connection.isActive ?? false}
                onCheckedChange={onToggleActive}
                data-testid={`active-toggle-${connection.id}`}
              />
            </div>

            <Button variant="outline" size="sm" onClick={onTest} data-testid={`test-${connection.id}`}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="destructive" size="sm" onClick={onDelete} data-testid={`delete-${connection.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {connection.lastConnectedAt && (
          <p className="text-slate-300 text-xs mt-2">
            Last connected: {new Date(connection.lastConnectedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function TradingConnectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const { data: platformsData } = useQuery<{ platforms: Platform[] }>({
    queryKey: ['/api/trading/platforms']
  });

  const { data: connectionsData, isLoading: connectionsLoading } = useQuery<{ connections: TradingConnection[] }>({
    queryKey: ['/api/trading/connections']
  });

  const { data: statsData } = useQuery<{ stats: OrderStats }>({
    queryKey: ['/api/trading/orders/stats']
  });

  const createConnection = useMutation({
    mutationFn: async (data: { platform: string; nickname: string }) => {
      const res = await apiRequest('/api/trading/connections', 'POST', data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/connections'] });
      toast({
        title: data.testResult?.connected ? 'Connection Successful!' : 'Connection Added',
        description: data.testResult?.message || 'Trading platform connected'
      });
      setSelectedPlatform(null);
      setNickname('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create connection', variant: 'destructive' });
    }
  });

  const updateConnection = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TradingConnection> }) => {
      const res = await apiRequest(`/api/trading/connections/${id}`, 'PATCH', updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/connections'] });
    }
  });

  const deleteConnection = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/trading/connections/${id}`, 'DELETE');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/connections'] });
      toast({ title: 'Connection Removed' });
    }
  });

  const testConnection = useMutation({
    mutationFn: async (platform: string) => {
      const res = await apiRequest('/api/trading/test-connection', 'POST', { platform });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.connected ? 'Connection OK' : 'Connection Failed',
        description: data.message,
        variant: data.connected ? 'default' : 'destructive'
      });
    }
  });

  const platforms = platformsData?.platforms || [];
  const connections = connectionsData?.connections || [];
  const stats = statsData?.stats;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Link2 className="h-8 w-8 text-primary" />
              Trading Connections
            </h1>
            <p className="text-slate-200 mt-1">Connect your trading accounts for direct order execution</p>
          </div>
          <Badge className="bg-amber-600 text-white px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            API Keys stored in Secrets
          </Badge>
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-600/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium">Security Notice</h3>
              <p className="text-amber-200/80 text-sm">
                API keys are stored securely in Replit Secrets (environment variables). 
                Add your keys in the Secrets tab: BINANCE_API_KEY, ALPACA_API_KEY, OANDA_API_KEY, or COINBASE_API_KEY
              </p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-slate-200 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-slate-200 text-sm">Filled</p>
                <p className="text-2xl font-bold text-green-400">{stats.filledOrders}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-slate-200 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400">{stats.pendingOrders}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-slate-200 text-sm">Volume</p>
                <p className="text-2xl font-bold text-primary">${stats.totalVolume.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Available Platforms</h2>
          <div className="grid grid-cols-4 gap-4">
            {platforms.map(platform => (
              <PlatformCard 
                key={platform.id} 
                platform={platform}
                onConnect={() => setSelectedPlatform(platform.id)}
                onShowApiHelp={(platformId) => {
                  const secretKeys: Record<string, string[]> = {
                    binance: ['BINANCE_API_KEY', 'BINANCE_SECRET_KEY'],
                    alpaca: ['ALPACA_API_KEY', 'ALPACA_SECRET_KEY'],
                    oanda: ['OANDA_API_KEY', 'OANDA_ACCOUNT_ID'],
                    coinbase: ['COINBASE_API_KEY', 'COINBASE_SECRET_KEY']
                  };
                  const keys = secretKeys[platformId] || [];
                  toast({
                    title: `Add ${platformId.charAt(0).toUpperCase() + platformId.slice(1)} API Keys`,
                    description: `Go to the "Secrets" tab in the Replit sidebar and add: ${keys.join(', ')}. Then refresh this page.`,
                    duration: 10000
                  });
                }}
              />
            ))}
          </div>
        </div>

        {selectedPlatform && (
          <Card className="bg-slate-800 border-primary">
            <CardHeader>
              <CardTitle className="text-white">Connect {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nickname">Account Nickname</Label>
                <Input 
                  id="nickname"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder={`My ${selectedPlatform} Account`}
                  className="bg-slate-700 border-slate-600"
                  data-testid="connection-nickname"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => createConnection.mutate({ platform: selectedPlatform, nickname: nickname || `${selectedPlatform} Account` })}
                  disabled={createConnection.isPending}
                  data-testid="confirm-connect"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Connect (Paper Trading)
                </Button>
                <Button variant="outline" onClick={() => setSelectedPlatform(null)} data-testid="cancel-connect">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Active Connections</h2>
          {connectionsLoading ? (
            <p className="text-slate-200">Loading connections...</p>
          ) : connections.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 border-dashed">
              <CardContent className="p-8 text-center">
                <Unlink className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-200">No trading connections yet</p>
                <p className="text-slate-300 text-sm">Connect a platform above to start trading</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {connections.map(connection => (
                <ConnectionRow
                  key={connection.id}
                  connection={connection}
                  onToggleActive={() => updateConnection.mutate({ id: connection.id, updates: { isActive: !connection.isActive } })}
                  onTogglePaper={() => updateConnection.mutate({ id: connection.id, updates: { isPaperTrading: !connection.isPaperTrading } })}
                  onDelete={() => deleteConnection.mutate(connection.id)}
                  onTest={() => testConnection.mutate(connection.platform)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Required Environment Variables
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-amber-400 font-mono">BINANCE_API_KEY / BINANCE_API_SECRET</p>
              <p className="text-slate-200">For Binance crypto trading</p>
            </div>
            <div>
              <p className="text-green-400 font-mono">ALPACA_API_KEY / ALPACA_API_SECRET</p>
              <p className="text-slate-200">For Alpaca stocks & crypto</p>
            </div>
            <div>
              <p className="text-blue-400 font-mono">OANDA_API_KEY / OANDA_ACCOUNT_ID</p>
              <p className="text-slate-200">For OANDA forex trading</p>
            </div>
            <div>
              <p className="text-cyan-400 font-mono">COINBASE_API_KEY / COINBASE_API_SECRET</p>
              <p className="text-slate-200">For Coinbase crypto trading</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
