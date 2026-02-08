import YahooFinance from 'yahoo-finance2';
import { customAlertService } from './custom-alert-service';
import sgMail from '@sendgrid/mail';
import type { CustomAlert, AlertNotification } from '@shared/schema';

const yahooFinance = new YahooFinance();

interface MarketData {
  symbol: string;
  price: number;
  previousClose?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

interface IndicatorData {
  rsi?: number;
  macd?: { macd: number; signal: number; histogram: number };
  ema9?: number;
  ema20?: number;
  ema50?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
  bollingerMiddle?: number;
  atr?: number;
  avgVolume?: number;
}

async function getSendGridClient() {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (!xReplitToken || !hostname) {
      console.log('SendGrid: No Replit token available');
      return null;
    }

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (!connectionSettings || !connectionSettings.settings?.api_key || !connectionSettings.settings?.from_email) {
      console.log('SendGrid: Connection not configured');
      return null;
    }

    sgMail.setApiKey(connectionSettings.settings.api_key);
    return {
      client: sgMail,
      fromEmail: connectionSettings.settings.from_email
    };
  } catch (error) {
    console.error('SendGrid initialization error:', error);
    return null;
  }
}

async function sendEmailNotification(notification: AlertNotification, alert: CustomAlert) {
  const sendgrid = await getSendGridClient();
  if (!sendgrid) {
    console.log('Email notification skipped: SendGrid not configured');
    return false;
  }

  try {
    const msg = {
      to: 'user@example.com',
      from: sendgrid.fromEmail,
      subject: `Trading Alert: ${notification.title}`,
      text: notification.message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #fff;">
          <h2 style="color: #8b5cf6;">🔔 ${notification.title}</h2>
          <div style="background: #16162a; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Symbol:</strong> ${notification.symbol}</p>
            <p style="margin: 5px 0;"><strong>Alert Type:</strong> ${notification.alertType}</p>
            <p style="margin: 5px 0;"><strong>Target:</strong> ${notification.targetValue}</p>
            <p style="margin: 5px 0;"><strong>Triggered Value:</strong> ${notification.triggeredValue}</p>
          </div>
          <p style="color: #a1a1aa;">${notification.message}</p>
          <hr style="border-color: #333;">
          <p style="font-size: 12px; color: #666;">CryptoFlow Pro Alert System</p>
        </div>
      `
    };

    await sendgrid.client.send(msg);
    console.log(`Email sent for alert: ${alert.name}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export class AlertMonitorService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private checkIntervalMs = 60000;
  private pushSubscriptions: Map<string, any> = new Map();

  async fetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const yahooSymbol = symbol.includes('/') ? symbol.replace('/', '-') : symbol;
      const quote = await yahooFinance.quote(yahooSymbol);
      
      if (!quote) return null;

      return {
        symbol,
        price: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose,
        volume: quote.regularMarketVolume,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
      return null;
    }
  }

  async calculateIndicators(symbol: string): Promise<IndicatorData | null> {
    try {
      const yahooSymbol = symbol.includes('/') ? symbol.replace('/', '-') : symbol;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 60);

      const historical = await yahooFinance.chart(yahooSymbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });

      if (!historical?.quotes || historical.quotes.length < 20) {
        return null;
      }

      const closes = historical.quotes
        .map(q => q.close)
        .filter((c): c is number => c !== null && c !== undefined);
      
      const volumes = historical.quotes
        .map(q => q.volume)
        .filter((v): v is number => v !== null && v !== undefined);

      if (closes.length < 20) return null;

      const rsi = this.calculateRSI(closes, 14);
      const macd = this.calculateMACD(closes);
      const ema9 = this.calculateEMA(closes, 9);
      const ema20 = this.calculateEMA(closes, 20);
      const ema50 = this.calculateEMA(closes, 50);
      const bollinger = this.calculateBollingerBands(closes, 20);
      const avgVolume = volumes.length > 0 
        ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20 
        : undefined;

      return {
        rsi,
        macd,
        ema9,
        ema20,
        ema50,
        bollingerUpper: bollinger.upper,
        bollingerLower: bollinger.lower,
        bollingerMiddle: bollinger.middle,
        avgVolume
      };
    } catch (error) {
      console.error(`Failed to calculate indicators for ${symbol}:`, error);
      return null;
    }
  }

  private calculateRSI(closes: number[], period: number): number {
    if (closes.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  private calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;
    
    const macdHistory = [];
    let ema12Val = closes.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
    let ema26Val = closes.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
    
    for (let i = 26; i < closes.length; i++) {
      ema12Val = (closes[i] - ema12Val) * (2 / 13) + ema12Val;
      ema26Val = (closes[i] - ema26Val) * (2 / 27) + ema26Val;
      macdHistory.push(ema12Val - ema26Val);
    }

    const signal = macdHistory.length >= 9 
      ? this.calculateEMA(macdHistory, 9)
      : macdLine;

    return {
      macd: macdLine,
      signal,
      histogram: macdLine - signal
    };
  }

  private calculateBollingerBands(closes: number[], period: number): { upper: number; middle: number; lower: number } {
    const slice = closes.slice(-period);
    const middle = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: middle + (stdDev * 2),
      middle,
      lower: middle - (stdDev * 2)
    };
  }

  async checkSingleAlert(alert: CustomAlert): Promise<AlertNotification | null> {
    const marketData = await this.fetchMarketData(alert.symbol);
    if (!marketData) {
      console.log(`No market data for ${alert.symbol}`);
      return null;
    }

    let indicators: IndicatorData | null = null;
    if (alert.alertType === 'indicator' || alert.alertType === 'momentum' || alert.alertType === 'volatility') {
      indicators = await this.calculateIndicators(alert.symbol);
    }

    const notification = await customAlertService.processAlert(alert, marketData, indicators || undefined);

    if (notification && alert.notifyEmail) {
      await sendEmailNotification(notification, alert);
    }

    return notification;
  }

  async checkAllAlerts(): Promise<{ checked: number; triggered: number; notifications: AlertNotification[] }> {
    const activeAlerts = await customAlertService.getActiveAlerts();
    console.log(`Checking ${activeAlerts.length} active alerts...`);

    const notifications: AlertNotification[] = [];
    let triggered = 0;

    for (const alert of activeAlerts) {
      try {
        const notification = await this.checkSingleAlert(alert);
        if (notification) {
          notifications.push(notification);
          triggered++;
          console.log(`Alert triggered: ${alert.name} (${alert.symbol})`);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error checking alert ${alert.name}:`, error);
      }
    }

    return {
      checked: activeAlerts.length,
      triggered,
      notifications
    };
  }

  start(intervalMs = 60000) {
    if (this.isRunning) {
      console.log('Alert monitor already running');
      return;
    }

    this.checkIntervalMs = intervalMs;
    this.isRunning = true;

    console.log(`Starting alert monitor (checking every ${intervalMs / 1000}s)`);
    
    this.checkAllAlerts().catch(console.error);

    this.intervalId = setInterval(async () => {
      try {
        await this.checkAllAlerts();
      } catch (error) {
        console.error('Alert check cycle error:', error);
      }
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Alert monitor stopped');
  }

  isActive() {
    return this.isRunning;
  }

  registerPushSubscription(userId: string, subscription: any) {
    this.pushSubscriptions.set(userId, subscription);
    console.log(`Push subscription registered for user ${userId}`);
  }

  unregisterPushSubscription(userId: string) {
    this.pushSubscriptions.delete(userId);
  }

  async sendTestNotification(alertId: number): Promise<AlertNotification | null> {
    const alert = await customAlertService.getAlert(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    return this.checkSingleAlert(alert);
  }
}

export const alertMonitorService = new AlertMonitorService();
