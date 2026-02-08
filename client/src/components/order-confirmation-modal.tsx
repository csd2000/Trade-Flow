import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Loader2, Check, X, AlertCircle, Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OrderSignal {
  asset: string;
  signal: 'STRONG BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG SELL';
  entryPrice: number;
  exitTarget: number;
  exitTarget2?: number;
  stopLoss: number;
  confidence: number;
}

interface TradingConnection {
  id: number;
  platform: string;
  nickname: string;
  isActive: boolean;
  isPaperTrading: boolean;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: OrderSignal | null;
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

export default function OrderConfirmationModal({ isOpen, onClose, signal }: OrderConfirmationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState('100');
  const [stopLossPercent, setStopLossPercent] = useState('2');
  const [takeProfitPercent, setTakeProfitPercent] = useState('4');
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);

  const { data: connectionsData } = useQuery<{ connections: TradingConnection[] }>({
    queryKey: ['/api/trading/connections'],
    enabled: isOpen
  });

  const connections = connectionsData?.connections?.filter(c => c.isActive) || [];

  useEffect(() => {
    if (connections.length > 0 && !selectedConnection) {
      setSelectedConnection(connections[0].id);
    }
  }, [connections, selectedConnection]);

  const executeOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest('/api/trading/execute', 'POST', orderData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/orders'] });
      toast({
        title: data.success ? 'Order Placed!' : 'Order Failed',
        description: data.message || (data.success ? `Order ID: ${data.orderId}` : 'Please try again'),
        variant: data.success ? 'default' : 'destructive'
      });
      if (data.success) onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Order Failed',
        description: error.message || 'Failed to execute order',
        variant: 'destructive'
      });
    }
  });

  const calculations = useMemo(() => {
    if (!signal) return null;
    
    const qty = Math.max(1, parseInt(quantity) || 0);
    const slPercent = Math.max(0.1, parseFloat(stopLossPercent) || 2);
    const tpPercent = Math.max(0.1, parseFloat(takeProfitPercent) || 4);
    const entry = signal.entryPrice;
    const isBuy = signal.signal.includes('BUY');
    
    const stopLoss = isBuy 
      ? entry * (1 - slPercent / 100)
      : entry * (1 + slPercent / 100);
    
    const takeProfit = isBuy
      ? entry * (1 + tpPercent / 100)
      : entry * (1 - tpPercent / 100);
    
    const totalCost = qty * entry;
    const maxLoss = qty * entry * (slPercent / 100);
    const potentialProfit = qty * entry * (tpPercent / 100);
    const riskReward = tpPercent / slPercent;
    
    return {
      qty,
      stopLoss,
      takeProfit,
      totalCost,
      maxLoss,
      potentialProfit,
      riskReward,
      isBuy
    };
  }, [signal, quantity, stopLossPercent, takeProfitPercent]);

  if (!signal || !calculations) return null;

  const selectedConn = connections.find(c => c.id === selectedConnection);
  const isPaper = selectedConn?.isPaperTrading ?? true;
  const { isBuy } = calculations;

  const handleExecute = () => {
    if (!selectedConnection) {
      toast({
        title: 'No Connection',
        description: 'Please connect a broker first',
        variant: 'destructive'
      });
      return;
    }

    executeOrder.mutate({
      connectionId: selectedConnection,
      symbol: signal.asset,
      side: isBuy ? 'buy' : 'sell',
      quantity: calculations.qty,
      orderType: 'market',
      price: signal.entryPrice,
      limitPrice: signal.entryPrice,
      stopLoss: calculations.stopLoss,
      takeProfit: calculations.takeProfit,
      signalConfidence: signal.confidence,
      signalType: signal.signal,
      signalSource: 'scanner'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0a0f] border border-slate-700 text-white p-0 overflow-hidden">
        <div className={`p-4 ${isBuy ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {isBuy ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                <div>
                  <p className="text-lg font-bold">{isBuy ? 'BUY' : 'SELL'} {signal.asset}</p>
                  <p className="text-sm opacity-90">{formatPrice(signal.entryPrice)} per unit</p>
                </div>
              </div>
              <Badge className={`${isPaper ? 'bg-white/20' : 'bg-red-800'} text-white`}>
                {isPaper ? 'PAPER' : 'LIVE'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wide">Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 bg-slate-800 border-slate-600 text-white text-lg h-12"
              placeholder="Enter quantity"
            />
            <p className="text-xs text-slate-500 mt-1">
              Total: {formatCurrency(calculations.totalCost)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-wide">Stop Loss %</Label>
              <Input
                type="number"
                step="0.5"
                value={stopLossPercent}
                onChange={(e) => setStopLossPercent(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-600 text-white h-10"
              />
              <p className="text-xs text-red-400 mt-1">
                @ {formatPrice(calculations.stopLoss)}
              </p>
            </div>
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-wide">Take Profit %</Label>
              <Input
                type="number"
                step="0.5"
                value={takeProfitPercent}
                onChange={(e) => setTakeProfitPercent(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-600 text-white h-10"
              />
              <p className="text-xs text-emerald-400 mt-1">
                @ {formatPrice(calculations.takeProfit)}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-500 text-xs">Max Loss</p>
                <p className="text-red-400 font-bold text-lg">{formatCurrency(calculations.maxLoss)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Potential Profit</p>
                <p className="text-emerald-400 font-bold text-lg">{formatCurrency(calculations.potentialProfit)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Risk/Reward</p>
                <p className={`font-bold text-lg ${calculations.riskReward >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  1:{calculations.riskReward.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {connections.length > 0 ? (
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-wide flex items-center gap-2">
                <Wallet className="h-3 w-3" /> Trading Account
              </Label>
              <select
                value={selectedConnection || ''}
                onChange={(e) => setSelectedConnection(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-md px-3 py-2.5 text-white"
              >
                {connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.nickname} ({conn.platform}) {conn.isPaperTrading ? '- Paper' : '- Live'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-amber-300 text-sm font-medium">No broker connected</p>
                <p className="text-amber-400/70 text-xs">Go to Settings to connect</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-slate-600 text-slate-300 h-12"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleExecute}
              disabled={executeOrder.isPending || connections.length === 0}
              className={`flex-1 h-12 font-bold ${isBuy ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {executeOrder.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
