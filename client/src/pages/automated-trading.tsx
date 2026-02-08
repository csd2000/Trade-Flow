import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, Play, Pause, Plus, Settings, Trash2, RefreshCcw, 
  TrendingUp, TrendingDown, Target, Shield, Clock, Activity,
  AlertTriangle, CheckCircle, XCircle, DollarSign, BarChart3,
  Zap, Power, History, FileText, Brain, Briefcase, Wallet, LineChart, ArrowUpRight, MinusCircle,
  Cpu, Radar, GitBranch, Lock, Newspaper, Globe, Sliders, LayoutDashboard
} from 'lucide-react';
import { Link } from 'wouter';

interface AIPosition {
  id: number;
  symbol: string;
  assetType: string;
  side: string;
  quantity: string;
  entryPrice: string;
  currentPrice: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
  aiAdvice: string | null;
  aiReasoning: string | null;
  aiConfidence: string | null;
  status: string;
}

const assetTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  stock: { icon: BarChart3, color: 'text-blue-400', label: 'Stock' },
  options: { icon: Target, color: 'text-purple-400', label: 'Options' },
  crypto: { icon: Wallet, color: 'text-orange-400', label: 'Crypto' },
  forex: { icon: DollarSign, color: 'text-green-400', label: 'Forex' },
  futures: { icon: LineChart, color: 'text-cyan-400', label: 'Futures' }
};

const adviceConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  HOLD: { icon: MinusCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' },
  EXIT: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-900/30' },
  SCALE_IN: { icon: Plus, color: 'text-green-400', bgColor: 'bg-green-900/30' },
  TAKE_PROFIT: { icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-900/30' },
  BUY: { icon: ArrowUpRight, color: 'text-green-400', bgColor: 'bg-green-900/30' },
  WAIT: { icon: Clock, color: 'text-slate-200', bgColor: 'bg-slate-900/30' }
};

interface TradingRule {
  id: number;
  name: string;
  description: string | null;
  symbol: string;
  assetType: string;
  connectionId: number | null;
  entryConditions: any[];
  exitConditions: any[];
  positionSizeType: string;
  positionSize: string;
  stopLossType: string;
  stopLossValue: string;
  takeProfitType: string | null;
  takeProfitValue: string | null;
  trailingStopActivation: string | null;
  trailingStopDistance: string | null;
  maxDailyLoss: string | null;
  maxDailyTrades: number | null;
  tradingHoursStart: string | null;
  tradingHoursEnd: string | null;
  isActive: boolean;
  isPaperTrading: boolean;
  todayTradeCount: number;
  todayPnl: string;
  totalTrades: number;
  winningTrades: number;
  createdAt: string;
}

interface TradeExecution {
  id: number;
  ruleId: number;
  symbol: string;
  side: string;
  executionType: string;
  quantity: string;
  entryPrice: string | null;
  exitPrice: string | null;
  pnl: string | null;
  pnlPercent: string | null;
  status: string;
  executedAt: string;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  totalTrades: number;
  winningTrades: number;
  winRate: string;
  totalPnl: string;
  todayTrades: number;
  todayPnl: string;
  engineStatus: { isRunning: boolean; activePositions: any[] };
}

function StatsCard({ label, value, icon: Icon, trend, color }: { label: string; value: string | number; icon: any; trend?: 'up' | 'down'; color?: string }) {
  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200">{label}</p>
            <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color ? color.replace('text-', 'bg-').replace('400', '900/30') : 'bg-slate-700'}`}>
            <Icon className={`h-6 w-6 ${color || 'text-slate-200'}`} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {trend === 'up' ? 'Improving' : 'Declining'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RuleCard({ rule, onToggle, onEdit, onDelete, onViewLogs }: { 
  rule: TradingRule; 
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewLogs: () => void;
}) {
  const winRate = rule.totalTrades > 0 ? ((rule.winningTrades / rule.totalTrades) * 100).toFixed(1) : '0.0';
  const todayPnl = Number(rule.todayPnl || 0);
  
  return (
    <Card className={`border transition-all ${rule.isActive ? 'border-green-600 bg-green-900/10' : 'border-slate-700 bg-slate-800/80'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{rule.name}</h3>
              <Badge variant={rule.isPaperTrading ? 'secondary' : 'default'}>
                {rule.isPaperTrading ? 'Paper' : 'Live'}
              </Badge>
              <Badge variant={rule.isActive ? 'default' : 'outline'} className={rule.isActive ? 'bg-green-600' : ''}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-slate-200 mt-1">{rule.description || 'No description'}</p>
          </div>
          <Switch checked={rule.isActive} onCheckedChange={onToggle} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="bg-slate-900">{rule.symbol}</Badge>
          <Badge variant="outline" className="bg-slate-900 capitalize">{rule.assetType}</Badge>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
          <div>
            <p className="text-slate-200">Trades</p>
            <p className="text-white font-semibold">{rule.totalTrades}</p>
          </div>
          <div>
            <p className="text-slate-200">Win Rate</p>
            <p className="text-white font-semibold">{winRate}%</p>
          </div>
          <div>
            <p className="text-slate-200">Today</p>
            <p className={`font-semibold ${todayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {todayPnl >= 0 ? '+' : ''}${todayPnl.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-slate-200">Today Trades</p>
            <p className="text-white font-semibold">{rule.todayTradeCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm border-t border-slate-700 pt-3">
          <div>
            <p className="text-red-400 text-xs">Stop Loss</p>
            <p className="text-white">{rule.stopLossValue}% ({rule.stopLossType})</p>
          </div>
          <div>
            <p className="text-green-400 text-xs">Take Profit</p>
            <p className="text-white">{rule.takeProfitValue || 'None'}{rule.takeProfitType ? ` (${rule.takeProfitType})` : ''}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
            <Settings className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onViewLogs}>
            <History className="h-4 w-4 mr-1" />
            Logs
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="text-red-400 hover:bg-red-900/30">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateRuleDialog({ connections, templates, onSuccess }: { 
  connections: any[]; 
  templates: any;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    assetType: 'stock',
    connectionId: '',
    positionSizeType: 'fixed',
    positionSize: '100',
    stopLossType: 'percentage',
    stopLossValue: '2',
    takeProfitType: 'percentage',
    takeProfitValue: '4',
    trailingStopActivation: '',
    trailingStopDistance: '',
    maxDailyLoss: '',
    maxDailyTrades: '',
    tradingHoursStart: '09:30',
    tradingHoursEnd: '16:00',
    isPaperTrading: true,
    entryConditions: [] as any[],
    exitConditions: [] as any[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRule = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/stats'] });
      toast({ title: 'Trading rule created successfully' });
      setOpen(false);
      setStep(1);
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create rule', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.symbol) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }
    createRule.mutate({
      ...formData,
      connectionId: formData.connectionId ? parseInt(formData.connectionId) : null,
      maxDailyTrades: formData.maxDailyTrades ? parseInt(formData.maxDailyTrades) : null
    });
  };

  const addCondition = (type: 'entry' | 'exit', conditionType: string) => {
    const newCondition = { id: Date.now().toString(), type: conditionType, operator: 'above', value: 0, period: 14 };
    if (type === 'entry') {
      setFormData({ ...formData, entryConditions: [...formData.entryConditions, newCondition] });
    } else {
      setFormData({ ...formData, exitConditions: [...formData.exitConditions, newCondition] });
    }
  };

  const removeCondition = (type: 'entry' | 'exit', id: string) => {
    if (type === 'entry') {
      setFormData({ ...formData, entryConditions: formData.entryConditions.filter(c => c.id !== id) });
    } else {
      setFormData({ ...formData, exitConditions: formData.exitConditions.filter(c => c.id !== id) });
    }
  };

  const updateCondition = (type: 'entry' | 'exit', id: string, field: string, value: any) => {
    const updateFn = (conditions: any[]) => 
      conditions.map(c => c.id === id ? { ...c, [field]: value } : c);
    
    if (type === 'entry') {
      setFormData({ ...formData, entryConditions: updateFn(formData.entryConditions) });
    } else {
      setFormData({ ...formData, exitConditions: updateFn(formData.exitConditions) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Trading Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-400" />
            Create Automated Trading Rule
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${step >= s ? 'bg-green-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Settings</h3>
            
            <div>
              <Label className="text-slate-300">Rule Name *</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="My RSI Strategy"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Buy when RSI is oversold and price is above EMA..."
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Symbol *</Label>
                <Input
                  value={formData.symbol}
                  onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL, BTC, EURUSD"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Asset Type</Label>
                <Select value={formData.assetType} onValueChange={v => setFormData({ ...formData, assetType: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="options">Options</SelectItem>
                    <SelectItem value="futures">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Trading Connection</Label>
                <Select value={formData.connectionId} onValueChange={v => setFormData({ ...formData, connectionId: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select connection..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {connections.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nickname || c.platform} {c.isActive ? '✓' : '(inactive)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.isPaperTrading}
                  onCheckedChange={v => setFormData({ ...formData, isPaperTrading: v })}
                />
                <Label className="text-slate-300">Paper Trading (Simulated)</Label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Entry & Exit Conditions</h3>
            
            <div className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Entry Conditions (All must be true)
                </h4>
                <Select onValueChange={v => addCondition('entry', v)}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Add condition..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {templates?.entry?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.entryConditions.length === 0 ? (
                <p className="text-sm text-slate-300">No entry conditions added. Add conditions to trigger trades.</p>
              ) : (
                <div className="space-y-2">
                  {formData.entryConditions.map(condition => (
                    <div key={condition.id} className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                      <Badge variant="outline">{condition.type}</Badge>
                      <Input
                        type="number"
                        value={condition.value}
                        onChange={e => updateCondition('entry', condition.id, 'value', Number(e.target.value))}
                        className="w-24 bg-slate-700 border-slate-600 text-white"
                        placeholder="Value"
                      />
                      {condition.type.includes('rsi') || condition.type.includes('ema') ? (
                        <Input
                          type="number"
                          value={condition.period || 14}
                          onChange={e => updateCondition('entry', condition.id, 'period', Number(e.target.value))}
                          className="w-20 bg-slate-700 border-slate-600 text-white"
                          placeholder="Period"
                        />
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCondition('entry', condition.id)}
                        className="text-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-red-400 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Exit Conditions (Any triggers exit)
                </h4>
                <Select onValueChange={v => addCondition('exit', v)}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Add condition..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {templates?.exit?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.exitConditions.length === 0 ? (
                <p className="text-sm text-slate-300">No exit conditions. Stop-loss and take-profit are configured in Risk Management.</p>
              ) : (
                <div className="space-y-2">
                  {formData.exitConditions.map(condition => (
                    <div key={condition.id} className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                      <Badge variant="outline">{condition.type}</Badge>
                      <Input
                        type="number"
                        value={condition.value}
                        onChange={e => updateCondition('exit', condition.id, 'value', Number(e.target.value))}
                        className="w-24 bg-slate-700 border-slate-600 text-white"
                        placeholder="Value"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCondition('exit', condition.id)}
                        className="text-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Risk Management</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Position Size Type</Label>
                <Select value={formData.positionSizeType} onValueChange={v => setFormData({ ...formData, positionSizeType: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="fixed">Fixed Quantity</SelectItem>
                    <SelectItem value="percent_capital">% of Capital</SelectItem>
                    <SelectItem value="risk_based">Risk-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Position Size</Label>
                <Input
                  type="number"
                  value={formData.positionSize}
                  onChange={e => setFormData({ ...formData, positionSize: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-red-400">Stop Loss Type</Label>
                <Select value={formData.stopLossType} onValueChange={v => setFormData({ ...formData, stopLossType: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="atr">ATR Multiple</SelectItem>
                    <SelectItem value="trailing">Trailing Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-red-400">Stop Loss Value (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.stopLossValue}
                  onChange={e => setFormData({ ...formData, stopLossValue: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-green-400">Take Profit Type</Label>
                <Select value={formData.takeProfitType} onValueChange={v => setFormData({ ...formData, takeProfitType: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="risk_reward">Risk/Reward Ratio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-green-400">Take Profit Value</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.takeProfitValue}
                  onChange={e => setFormData({ ...formData, takeProfitValue: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Max Daily Loss ($)</Label>
                <Input
                  type="number"
                  value={formData.maxDailyLoss}
                  onChange={e => setFormData({ ...formData, maxDailyLoss: e.target.value })}
                  placeholder="500"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Max Daily Trades</Label>
                <Input
                  type="number"
                  value={formData.maxDailyTrades}
                  onChange={e => setFormData({ ...formData, maxDailyTrades: e.target.value })}
                  placeholder="10"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Trading Hours Start</Label>
                <Input
                  type="time"
                  value={formData.tradingHoursStart}
                  onChange={e => setFormData({ ...formData, tradingHoursStart: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Trading Hours End</Label>
                <Input
                  type="time"
                  value={formData.tradingHoursEnd}
                  onChange={e => setFormData({ ...formData, tradingHoursEnd: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-700">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createRule.isPending} className="bg-green-600 hover:bg-green-700">
              {createRule.isPending ? 'Creating...' : 'Create Rule'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExecutionHistoryPanel({ executions }: { executions: TradeExecution[] }) {
  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="h-5 w-5 text-blue-400" />
          Recent Executions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <p className="text-slate-200 text-center py-4">No trades executed yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {executions.map(exec => (
              <div key={exec.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={exec.side === 'buy' ? 'default' : 'destructive'}>
                    {exec.side.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="text-white font-medium">{exec.symbol}</p>
                    <p className="text-xs text-slate-200">{exec.executionType} • {new Date(exec.executedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{exec.quantity} @ ${exec.entryPrice || exec.exitPrice}</p>
                  {exec.pnl && (
                    <p className={Number(exec.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {Number(exec.pnl) >= 0 ? '+' : ''}${Number(exec.pnl).toFixed(2)}
                    </p>
                  )}
                </div>
                <Badge variant={exec.status === 'filled' ? 'default' : 'secondary'}>
                  {exec.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AutomatedTrading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rulesData, isLoading: rulesLoading, refetch: refetchRules } = useQuery<{ success: boolean; rules: TradingRule[] }>({
    queryKey: ['/api/automation/rules']
  });

  const { data: statsData } = useQuery<{ success: boolean; stats: AutomationStats }>({
    queryKey: ['/api/automation/stats'],
    refetchInterval: 5000
  });

  const { data: executionsData } = useQuery<{ success: boolean; executions: TradeExecution[] }>({
    queryKey: ['/api/automation/executions']
  });

  const { data: connectionsData } = useQuery<{ connections: any[] }>({
    queryKey: ['/api/trading/connections']
  });

  const { data: templatesData } = useQuery<{ success: boolean; templates: any }>({
    queryKey: ['/api/automation/condition-templates']
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const endpoint = isActive ? 'deactivate' : 'activate';
      const response = await fetch(`/api/automation/rules/${id}/${endpoint}`, { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/stats'] });
    }
  });

  const deleteRule = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/automation/rules/${id}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
      toast({ title: 'Rule deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete rule', variant: 'destructive' });
    }
  });

  // Trading Connections mutations
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [newConnectionPlatform, setNewConnectionPlatform] = useState('');
  const [newConnectionNickname, setNewConnectionNickname] = useState('');

  const createConnection = useMutation({
    mutationFn: async (data: { platform: string; nickname: string; isPaperTrading: boolean }) => {
      const response = await fetch('/api/trading/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/connections'] });
      toast({ title: 'Connection added successfully' });
      setShowAddConnection(false);
      setNewConnectionPlatform('');
      setNewConnectionNickname('');
    },
    onError: () => {
      toast({ title: 'Failed to add connection', variant: 'destructive' });
    }
  });

  const deleteConnection = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/trading/connections/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/connections'] });
      toast({ title: 'Connection deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete connection', variant: 'destructive' });
    }
  });

  const syncConnection = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/trading/connections/${id}/sync`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to sync connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/connections'] });
      toast({ title: 'Connection synced' });
    },
    onError: () => {
      toast({ title: 'Failed to sync connection', variant: 'destructive' });
    }
  });

  const controlEngine = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await fetch(`/api/automation/engine/${action}`, { method: 'POST' });
      return response.json();
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/stats'] });
      toast({ title: `Automation engine ${action === 'start' ? 'started' : 'stopped'}` });
    }
  });

  // AI Trading Plan integration
  const { data: positionsData, isLoading: positionsLoading, refetch: refetchPositions } = useQuery<{ success: boolean; data: AIPosition[] }>({
    queryKey: ['/api/trading-plan/positions'],
    refetchInterval: 10000
  });

  const { data: portfolioData } = useQuery<{ success: boolean; data: { totalPositions: number; totalPnl: number; pnlPercent: number } }>({
    queryKey: ['/api/trading-plan/portfolio-summary'],
    refetchInterval: 10000
  });

  const automatePosition = useMutation({
    mutationFn: async (positionId: number) => {
      const response = await fetch(`/api/trading-plan/positions/${positionId}/automate`, { method: 'POST' });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      toast({ title: 'Position automated!', description: `Created rule: ${data.rule?.name}` });
    },
    onError: () => toast({ title: 'Failed to automate position', variant: 'destructive' })
  });

  const executeAIAdvice = useMutation({
    mutationFn: async (positionId: number) => {
      const response = await fetch(`/api/trading-plan/positions/${positionId}/execute-ai`, { method: 'POST' });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/portfolio-summary'] });
      toast({ title: 'AI advice executed!', description: data.message });
    },
    onError: () => toast({ title: 'Failed to execute AI advice', variant: 'destructive' })
  });

  const closePosition = useMutation({
    mutationFn: async (positionId: number) => {
      const response = await fetch(`/api/trading-plan/positions/${positionId}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-plan/portfolio-summary'] });
      toast({ title: 'Position closed' });
    }
  });

  const rules = rulesData?.rules || [];
  const positions = positionsData?.data || [];
  const portfolio = portfolioData?.data;
  const aiPlanRules = rules.filter(r => r.name.includes('(from AI Plan)'));
  const exitablePositions = positions.filter(p => p.aiAdvice === 'EXIT' || p.aiAdvice === 'TAKE_PROFIT');
  const stats = statsData?.stats;
  const executions = executionsData?.executions || [];
  const connections = connectionsData?.connections || [];
  const templates = templatesData?.templates;
  const isEngineRunning = stats?.engineStatus?.isRunning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="h-8 w-8 text-green-400" />
              Automated Trading
            </h1>
            <p className="text-slate-200 mt-1">Set your rules, let the platform execute trades automatically</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isEngineRunning ? 'destructive' : 'default'}
              onClick={() => controlEngine.mutate(isEngineRunning ? 'stop' : 'start')}
              disabled={controlEngine.isPending}
              className={isEngineRunning ? '' : 'bg-green-600 hover:bg-green-700'}
            >
              {isEngineRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Engine
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Engine
                </>
              )}
            </Button>
            <CreateRuleDialog 
              connections={connections} 
              templates={templates}
              onSuccess={() => refetchRules()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Active Rules"
            value={stats?.activeRules || 0}
            icon={Zap}
            color="text-green-400"
          />
          <StatsCard
            label="Today's Trades"
            value={stats?.todayTrades || 0}
            icon={Activity}
            color="text-blue-400"
          />
          <StatsCard
            label="Today's P/L"
            value={`$${stats?.todayPnl || '0.00'}`}
            icon={DollarSign}
            color={Number(stats?.todayPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatsCard
            label="Win Rate"
            value={`${stats?.winRate || '0.0'}%`}
            icon={Target}
            color="text-purple-400"
          />
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className={`w-3 h-3 rounded-full ${isEngineRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-white font-medium">
            Automation Engine: {isEngineRunning ? 'Running' : 'Stopped'}
          </span>
          {isEngineRunning && stats?.engineStatus?.activePositions?.length > 0 && (
            <Badge className="bg-blue-600">{stats.engineStatus.activePositions.length} Active Positions</Badge>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => refetchRules()}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Advanced Algorithmic Engine Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30 hover:border-blue-400/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Cpu className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Algorithmic Engine</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Radar className="h-3 w-3 text-blue-400" />
                  Real-time data analysis
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-blue-400" />
                  Machine learning integration
                </li>
                <li className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3 text-blue-400" />
                  Adaptive learning algorithms
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-3 w-3 text-blue-400" />
                  Pattern recognition
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 hover:border-green-400/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Trade Execution</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-400" />
                  Optimal entry/exit points
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  Trend following strategies
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-green-400" />
                  Mean reversion detection
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-green-400" />
                  Multi-market scanning
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border-purple-500/30 hover:border-purple-400/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Sliders className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Customization</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Settings className="h-3 w-3 text-purple-400" />
                  Custom parameters
                </li>
                <li className="flex items-center gap-2">
                  <LayoutDashboard className="h-3 w-3 text-purple-400" />
                  Strategy tailoring
                </li>
                <li className="flex items-center gap-2">
                  <Bot className="h-3 w-3 text-purple-400" />
                  Platform integration
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-purple-400" />
                  Scalping to swing trading
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/30 hover:border-red-400/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Shield className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">Risk Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  Auto stop-loss protection
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-red-400" />
                  Smart profit targets
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-red-400" />
                  Encrypted data protection
                </li>
                <li className="flex items-center gap-2">
                  <Newspaper className="h-3 w-3 text-red-400" />
                  News sentiment analysis
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pre-loaded Strategies */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-400" />
              Pre-Loaded Proven Strategies
            </CardTitle>
            <CardDescription>Optimized strategies based on historical performance - ready to deploy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: 'RSI Oversold', type: 'Mean Reversion', color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
                { name: 'EMA Crossover', type: 'Trend Following', color: 'bg-green-500/20 border-green-500/30 text-green-400' },
                { name: 'MACD Divergence', type: 'Reversal', color: 'bg-purple-500/20 border-purple-500/30 text-purple-400' },
                { name: 'Bollinger Bounce', type: 'Mean Reversion', color: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' },
                { name: 'Breakout Scanner', type: 'Momentum', color: 'bg-orange-500/20 border-orange-500/30 text-orange-400' },
                { name: 'Volume Spike', type: 'Volatility', color: 'bg-pink-500/20 border-pink-500/30 text-pink-400' }
              ].map((strategy) => (
                <div key={strategy.name} className={`p-3 rounded-lg border ${strategy.color} text-center`}>
                  <p className="font-medium text-white text-sm">{strategy.name}</p>
                  <p className="text-xs opacity-80">{strategy.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="rules" className="data-[state=active]:bg-slate-700">
              <Bot className="h-4 w-4 mr-2" />
              Trading Rules
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">
              <History className="h-4 w-4 mr-2" />
              Execution History
            </TabsTrigger>
            <TabsTrigger value="ai-plan" className="data-[state=active]:bg-purple-700">
              <Brain className="h-4 w-4 mr-2" />
              AI Trading Plan
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-cyan-700">
              <Wallet className="h-4 w-4 mr-2" />
              Trading Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules">
            {rulesLoading ? (
              <div className="text-center py-8">
                <RefreshCcw className="h-8 w-8 animate-spin text-slate-200 mx-auto" />
                <p className="text-slate-200 mt-2">Loading rules...</p>
              </div>
            ) : rules.length === 0 ? (
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Trading Rules Yet</h3>
                  <p className="text-slate-200 mb-4">Create your first automated trading rule to start hands-free trading</p>
                  <CreateRuleDialog connections={connections} templates={templates} onSuccess={() => refetchRules()} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rules.map(rule => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={() => toggleRule.mutate({ id: rule.id, isActive: rule.isActive })}
                    onEdit={() => {}}
                    onDelete={() => deleteRule.mutate(rule.id)}
                    onViewLogs={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <ExecutionHistoryPanel executions={executions} />
          </TabsContent>

          <TabsContent value="ai-plan">
            <div className="space-y-4">
              {/* AI Trading Plan Stats Banner */}
              <Card className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 border-purple-600">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-600/30 rounded-lg">
                        <Brain className="h-8 w-8 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">AI Trading Plan</h2>
                        <p className="text-purple-200 text-sm">Manage positions with AI-powered automation</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{portfolio?.totalPositions || 0}</div>
                        <div className="text-xs text-slate-200">Positions</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${(portfolio?.totalPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(portfolio?.totalPnl || 0) >= 0 ? '+' : ''}${(portfolio?.totalPnl || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-200">Total P/L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">{aiPlanRules.length}</div>
                        <div className="text-xs text-slate-200">Automated</div>
                      </div>
                      {exitablePositions.length > 0 && (
                        <Badge className="bg-red-600 animate-pulse text-lg px-3 py-1">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {exitablePositions.length} AI Exits Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => refetchPositions()}>
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                      <Link href="/ai-trading-plan">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Position
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Positions Grid */}
              {positionsLoading ? (
                <div className="text-center py-8">
                  <RefreshCcw className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                  <p className="text-slate-200 mt-2">Loading positions...</p>
                </div>
              ) : positions.length === 0 ? (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-16 w-16 text-purple-600/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Positions Yet</h3>
                    <p className="text-slate-200 mb-4">Add your first position to start AI-powered portfolio management</p>
                    <Link href="/ai-trading-plan">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Position
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {positions.map(position => {
                    const config = assetTypeConfig[position.assetType] || assetTypeConfig.stock;
                    const Icon = config.icon;
                    const pnl = position.unrealizedPnl ? parseFloat(position.unrealizedPnl) : 0;
                    const pnlPercent = position.unrealizedPnlPercent ? parseFloat(position.unrealizedPnlPercent) : 0;
                    const advConf = adviceConfig[position.aiAdvice || 'HOLD'] || adviceConfig.HOLD;
                    const AdvIcon = advConf.icon;
                    const isExitable = position.aiAdvice === 'EXIT' || position.aiAdvice === 'TAKE_PROFIT';
                    
                    return (
                      <Card key={position.id} className={`bg-slate-800/80 border transition-all ${isExitable ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700 hover:border-purple-600'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-5 w-5 ${config.color}`} />
                              <div>
                                <div className="font-bold text-white text-lg">{position.symbol}</div>
                                <div className="text-xs text-slate-200 flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{config.label}</Badge>
                                  <Badge variant={position.side === 'long' ? 'default' : 'destructive'} className="text-xs">
                                    {position.side.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                              </div>
                              <div className={`text-xs ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                            <div>
                              <div className="text-slate-200">Entry</div>
                              <div className="text-white">${parseFloat(position.entryPrice).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-slate-200">Current</div>
                              <div className="text-white">${position.currentPrice ? parseFloat(position.currentPrice).toFixed(2) : '--'}</div>
                            </div>
                            <div>
                              <div className="text-slate-200">Qty</div>
                              <div className="text-white">{parseFloat(position.quantity).toFixed(2)}</div>
                            </div>
                          </div>

                          {/* AI Recommendation */}
                          <div className={`rounded-lg p-2 ${advConf.bgColor} border border-slate-600 mb-3`}>
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-purple-400" />
                              <span className="text-xs text-slate-300">AI:</span>
                              <Badge className={`${advConf.bgColor} ${advConf.color} border-0`}>
                                <AdvIcon className="h-3 w-3 mr-1" />
                                {position.aiAdvice || 'ANALYZING'}
                              </Badge>
                              {position.aiConfidence && (
                                <span className="text-xs text-purple-400 ml-auto">{parseFloat(position.aiConfidence).toFixed(0)}%</span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 text-cyan-400 border-cyan-700 hover:bg-cyan-900/30"
                              onClick={() => automatePosition.mutate(position.id)}
                              disabled={automatePosition.isPending}
                            >
                              <Bot className="h-3 w-3 mr-1" />
                              Automate
                            </Button>
                            {isExitable && (
                              <Button 
                                size="sm"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => executeAIAdvice.mutate(position.id)}
                                disabled={executeAIAdvice.isPending}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Execute AI
                              </Button>
                            )}
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-slate-200 border-slate-600 hover:bg-slate-700"
                              onClick={() => closePosition.mutate(position.id)}
                              disabled={closePosition.isPending}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="space-y-6">
              {/* Trading Connections Header */}
              <Card className="bg-gradient-to-r from-cyan-900/50 via-blue-900/50 to-indigo-900/50 border-cyan-600">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-cyan-600/30 rounded-lg">
                        <Wallet className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Trading Connections</h2>
                        <p className="text-cyan-200 text-sm">Connect your trading accounts for direct order execution</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{connections.length}</div>
                        <div className="text-xs text-slate-200">Connected</div>
                      </div>
                      <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
                        <DialogTrigger asChild>
                          <Button className="bg-cyan-600 hover:bg-cyan-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Connection
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Add Trading Connection</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-slate-300 mb-2 block">Platform</label>
                              <Select value={newConnectionPlatform} onValueChange={setNewConnectionPlatform}>
                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                  <SelectItem value="alpaca">Alpaca (Stocks)</SelectItem>
                                  <SelectItem value="binance">Binance (Crypto)</SelectItem>
                                  <SelectItem value="coinbase">Coinbase (Crypto)</SelectItem>
                                  <SelectItem value="oanda">OANDA (Forex)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm text-slate-300 mb-2 block">Nickname (optional)</label>
                              <Input 
                                value={newConnectionNickname}
                                onChange={(e) => setNewConnectionNickname(e.target.value)}
                                placeholder="My Trading Account"
                                className="bg-slate-900 border-slate-600 text-white"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancel</Button>
                            <Button 
                              className="bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => createConnection.mutate({ 
                                platform: newConnectionPlatform, 
                                nickname: newConnectionNickname,
                                isPaperTrading: true 
                              })}
                              disabled={!newConnectionPlatform || createConnection.isPending}
                            >
                              {createConnection.isPending ? 'Adding...' : 'Add Connection'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Broker Connections Grid */}
              {connections.length === 0 ? (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <Wallet className="h-16 w-16 text-cyan-600/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Trading Accounts Connected</h3>
                    <p className="text-slate-200 mb-6 max-w-md mx-auto">
                      Connect your brokerage accounts to enable automated order execution. Supported brokers include major platforms for stocks, options, crypto, and forex.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
                      {[
                        { name: 'Interactive Brokers', type: 'Stocks/Options' },
                        { name: 'TD Ameritrade', type: 'Stocks/Options' },
                        { name: 'Alpaca', type: 'Stocks' },
                        { name: 'Binance', type: 'Crypto' },
                        { name: 'Coinbase Pro', type: 'Crypto' },
                        { name: 'OANDA', type: 'Forex' },
                        { name: 'Tradier', type: 'Options' },
                        { name: 'Paper Trading', type: 'Simulation' }
                      ].map((broker) => (
                        <div key={broker.name} className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-center hover:border-cyan-500 cursor-pointer transition-all">
                          <p className="font-medium text-white text-sm">{broker.name}</p>
                          <p className="text-xs text-slate-400">{broker.type}</p>
                        </div>
                      ))}
                    </div>
                    <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowAddConnection(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect First Account
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((connection: any) => (
                    <Card key={connection.id} className="bg-slate-800/80 border-slate-700 hover:border-cyan-600 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-600/20 rounded-lg">
                              <Wallet className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{connection.name}</h3>
                              <p className="text-sm text-slate-400">{connection.broker || 'Broker'}</p>
                            </div>
                          </div>
                          <Badge className={connection.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {connection.status === 'active' ? 'Connected' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-slate-400">Account Type</p>
                            <p className="text-white">{connection.accountType || 'Trading'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Last Sync</p>
                            <p className="text-white">{connection.lastSync ? new Date(connection.lastSync).toLocaleDateString() : 'Never'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-cyan-400 border-cyan-700 hover:bg-cyan-900/30"
                            onClick={() => syncConnection.mutate(connection.id)}
                            disabled={syncConnection.isPending}
                          >
                            <RefreshCcw className={`h-3 w-3 mr-1 ${syncConnection.isPending ? 'animate-spin' : ''}`} />
                            Sync
                          </Button>
                          <Button size="sm" variant="outline" className="text-slate-400 border-slate-600 hover:bg-slate-700">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-400 border-red-700 hover:bg-red-900/30"
                            onClick={() => deleteConnection.mutate(connection.id)}
                            disabled={deleteConnection.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Connection Security Info */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-600/20 rounded-lg">
                      <Lock className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Secure Connection</h4>
                      <p className="text-sm text-slate-300">
                        All broker connections use encrypted OAuth 2.0 authentication. Your credentials are never stored directly. 
                        We use read-only access where possible and request trading permissions only when needed for automation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
