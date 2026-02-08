import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, Send, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AlertConfig {
  enabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  emailAddress: string | null;
  telegramConfigured: boolean;
  scoreThreshold: number;
  lastScore: {
    score: number;
    total: number;
    reasons: string[];
    timestamp: string;
  } | null;
}

interface TelegramSetup {
  instructions: string[];
  tokenConfigured: boolean;
}

export function AlertSettings() {
  const { toast } = useToast();
  const [emailAddress, setEmailAddress] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [scoreThreshold, setScoreThreshold] = useState(5);

  const { data: config, refetch } = useQuery<AlertConfig>({
    queryKey: ['/api/alerts/config'],
  });

  const { data: telegramSetup } = useQuery<TelegramSetup>({
    queryKey: ['/api/alerts/telegram-setup'],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<AlertConfig & { telegramChatId?: string }>) => {
      return apiRequest('/api/alerts/config', 'POST', updates);
    },
    onSuccess: () => {
      refetch();
      toast({ title: 'Alert settings updated' });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('/api/alerts/test-email', 'POST', { email });
    },
    onSuccess: () => {
      toast({ title: 'Test email sent!', description: 'Check your inbox for the alert.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to send test email', description: error.message, variant: 'destructive' });
    },
  });

  const testTelegramMutation = useMutation({
    mutationFn: async (chatId: string) => {
      return apiRequest('/api/alerts/test-telegram', 'POST', { chatId });
    },
    onSuccess: () => {
      toast({ title: 'Test message sent!', description: 'Check your Telegram for the alert.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to send Telegram message', description: error.message, variant: 'destructive' });
    },
  });

  const handleToggleAlerts = (enabled: boolean) => {
    updateConfigMutation.mutate({ enabled });
  };

  const handleToggleEmail = (emailEnabled: boolean) => {
    updateConfigMutation.mutate({ emailEnabled });
  };

  const handleToggleTelegram = (telegramEnabled: boolean) => {
    updateConfigMutation.mutate({ telegramEnabled });
  };

  const handleSaveEmail = () => {
    if (!emailAddress) return;
    updateConfigMutation.mutate({ emailAddress, emailEnabled: true });
  };

  const handleSaveTelegram = () => {
    if (!telegramChatId) return;
    updateConfigMutation.mutate({ telegramChatId, telegramEnabled: true });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Alert Settings</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="alerts-enabled" className="text-sm text-muted-foreground">
              Alerts {config?.enabled ? 'On' : 'Off'}
            </Label>
            <Switch
              id="alerts-enabled"
              checked={config?.enabled ?? false}
              onCheckedChange={handleToggleAlerts}
              data-testid="switch-alerts-enabled"
            />
          </div>
        </div>
        <CardDescription>
          Get notified instantly when a perfect 5/5 market score is detected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {config?.lastScore && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Last Score</span>
              <Badge variant={config.lastScore.score >= 5 ? 'default' : 'secondary'}>
                {config.lastScore.score}/{config.lastScore.total}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(config.lastScore.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Telegram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Alerts
              </Label>
              <Switch
                id="email-enabled"
                checked={config?.emailEnabled ?? false}
                onCheckedChange={handleToggleEmail}
                data-testid="switch-email-enabled"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email-address"
                  type="email"
                  placeholder="your@email.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  data-testid="input-email-address"
                />
                <Button 
                  onClick={handleSaveEmail}
                  disabled={!emailAddress || updateConfigMutation.isPending}
                  data-testid="button-save-email"
                >
                  Save
                </Button>
              </div>
              {config?.emailAddress && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Configured: {config.emailAddress}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => testEmailMutation.mutate(emailAddress || '')}
              disabled={!emailAddress || testEmailMutation.isPending}
              data-testid="button-test-email"
            >
              {testEmailMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Test Email
            </Button>
          </TabsContent>

          <TabsContent value="telegram" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="telegram-enabled" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Telegram Alerts
              </Label>
              <Switch
                id="telegram-enabled"
                checked={config?.telegramEnabled ?? false}
                onCheckedChange={handleToggleTelegram}
                data-testid="switch-telegram-enabled"
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-500">
                  <p className="font-medium mb-1">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Message @BotFather on Telegram</li>
                    <li>Send /newbot and create your bot</li>
                    <li>Add the token as a secret: TELEGRAM_BOT_TOKEN</li>
                    <li>Message @userinfobot to get your chat ID</li>
                  </ol>
                </div>
              </div>
            </div>

            {telegramSetup?.tokenConfigured ? (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                Bot token configured
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <AlertCircle className="w-4 h-4" />
                TELEGRAM_BOT_TOKEN not set
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="telegram-chat-id">Your Chat ID</Label>
              <div className="flex gap-2">
                <Input
                  id="telegram-chat-id"
                  type="text"
                  placeholder="123456789"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  data-testid="input-telegram-chat-id"
                />
                <Button 
                  onClick={handleSaveTelegram}
                  disabled={!telegramChatId || updateConfigMutation.isPending}
                  data-testid="button-save-telegram"
                >
                  Save
                </Button>
              </div>
              {config?.telegramConfigured && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Chat ID configured
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => testTelegramMutation.mutate(telegramChatId)}
              disabled={!telegramChatId || !telegramSetup?.tokenConfigured || testTelegramMutation.isPending}
              data-testid="button-test-telegram"
            >
              {testTelegramMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Test Message
            </Button>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <Label className="text-sm text-muted-foreground">
            Score Threshold: {scoreThreshold}/5
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Alerts trigger when market score reaches {scoreThreshold} or higher
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
