import { db } from './db';
import { customAlerts, alertNotifications, type CustomAlert, type InsertCustomAlert, type AlertNotification, type InsertAlertNotification } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

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

export class CustomAlertService {
  async createAlert(alertData: InsertCustomAlert): Promise<CustomAlert> {
    const [alert] = await db.insert(customAlerts).values(alertData).returning();
    return alert;
  }

  async getAlerts(userId?: number): Promise<CustomAlert[]> {
    if (userId) {
      return await db.select().from(customAlerts).where(eq(customAlerts.userId, userId)).orderBy(desc(customAlerts.createdAt));
    }
    return await db.select().from(customAlerts).orderBy(desc(customAlerts.createdAt));
  }

  async getActiveAlerts(): Promise<CustomAlert[]> {
    return await db.select().from(customAlerts).where(eq(customAlerts.isActive, true));
  }

  async getAlert(id: number): Promise<CustomAlert | undefined> {
    const [alert] = await db.select().from(customAlerts).where(eq(customAlerts.id, id));
    return alert;
  }

  async updateAlert(id: number, updates: Partial<InsertCustomAlert>): Promise<CustomAlert | undefined> {
    const [alert] = await db.update(customAlerts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customAlerts.id, id))
      .returning();
    return alert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    await db.delete(customAlerts).where(eq(customAlerts.id, id));
    return true;
  }

  async toggleAlert(id: number): Promise<CustomAlert | undefined> {
    const alert = await this.getAlert(id);
    if (!alert) return undefined;
    
    return await this.updateAlert(id, { isActive: !alert.isActive });
  }

  async resetAlert(id: number): Promise<CustomAlert | undefined> {
    const [alert] = await db.update(customAlerts)
      .set({ isTriggered: false, lastTriggeredAt: null })
      .where(eq(customAlerts.id, id))
      .returning();
    return alert;
  }

  async checkAlertCondition(alert: CustomAlert, marketData: MarketData, indicators?: IndicatorData): Promise<{ triggered: boolean; currentValue: number; message: string }> {
    const { condition, targetValue } = alert;
    const target = parseFloat(targetValue);
    
    let triggered = false;
    let currentValue = marketData.price;
    let message = '';

    switch (condition) {
      case 'price_above':
        triggered = marketData.price > target;
        currentValue = marketData.price;
        message = `${alert.symbol} price ($${marketData.price.toFixed(2)}) crossed above $${target.toFixed(2)}`;
        break;

      case 'price_below':
        triggered = marketData.price < target;
        currentValue = marketData.price;
        message = `${alert.symbol} price ($${marketData.price.toFixed(2)}) dropped below $${target.toFixed(2)}`;
        break;

      case 'price_change_percent':
        if (marketData.changePercent !== undefined) {
          triggered = Math.abs(marketData.changePercent) >= target;
          currentValue = marketData.changePercent;
          message = `${alert.symbol} moved ${marketData.changePercent > 0 ? '+' : ''}${marketData.changePercent.toFixed(2)}% (threshold: ${target}%)`;
        }
        break;

      case 'rsi_overbought':
        if (indicators?.rsi !== undefined) {
          triggered = indicators.rsi >= target;
          currentValue = indicators.rsi;
          message = `${alert.symbol} RSI (${indicators.rsi.toFixed(1)}) crossed into overbought territory (>${target})`;
        }
        break;

      case 'rsi_oversold':
        if (indicators?.rsi !== undefined) {
          triggered = indicators.rsi <= target;
          currentValue = indicators.rsi;
          message = `${alert.symbol} RSI (${indicators.rsi.toFixed(1)}) crossed into oversold territory (<${target})`;
        }
        break;

      case 'macd_crossover':
        if (indicators?.macd) {
          triggered = indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0;
          currentValue = indicators.macd.histogram;
          message = `${alert.symbol} MACD bullish crossover detected`;
        }
        break;

      case 'macd_crossunder':
        if (indicators?.macd) {
          triggered = indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0;
          currentValue = indicators.macd.histogram;
          message = `${alert.symbol} MACD bearish crossunder detected`;
        }
        break;

      case 'ema_cross':
        if (indicators?.ema9 !== undefined && indicators?.ema20 !== undefined) {
          const fastAboveSlow = indicators.ema9 > indicators.ema20;
          triggered = fastAboveSlow;
          currentValue = indicators.ema9;
          message = `${alert.symbol} EMA9 crossed ${fastAboveSlow ? 'above' : 'below'} EMA20`;
        }
        break;

      case 'bollinger_upper':
        if (indicators?.bollingerUpper !== undefined) {
          triggered = marketData.price >= indicators.bollingerUpper;
          currentValue = marketData.price;
          message = `${alert.symbol} price touched upper Bollinger Band ($${indicators.bollingerUpper.toFixed(2)})`;
        }
        break;

      case 'bollinger_lower':
        if (indicators?.bollingerLower !== undefined) {
          triggered = marketData.price <= indicators.bollingerLower;
          currentValue = marketData.price;
          message = `${alert.symbol} price touched lower Bollinger Band ($${indicators.bollingerLower.toFixed(2)})`;
        }
        break;

      case 'volume_spike':
        if (marketData.volume !== undefined && indicators?.avgVolume !== undefined) {
          const volumeMultiplier = marketData.volume / indicators.avgVolume;
          triggered = volumeMultiplier >= target;
          currentValue = volumeMultiplier;
          message = `${alert.symbol} volume spike detected (${volumeMultiplier.toFixed(1)}x average)`;
        }
        break;

      default:
        message = `Unknown condition: ${condition}`;
    }

    return { triggered, currentValue, message };
  }

  async processAlert(alert: CustomAlert, marketData: MarketData, indicators?: IndicatorData): Promise<AlertNotification | null> {
    const now = new Date();
    
    if (alert.lastTriggeredAt) {
      const cooldownMs = (alert.cooldownMinutes || 60) * 60 * 1000;
      const timeSinceLastTrigger = now.getTime() - new Date(alert.lastTriggeredAt).getTime();
      if (timeSinceLastTrigger < cooldownMs) {
        return null;
      }
    }

    if (alert.isTriggered && !alert.repeatAlert) {
      return null;
    }

    const { triggered, currentValue, message } = await this.checkAlertCondition(alert, marketData, indicators);

    await db.update(customAlerts)
      .set({ lastCheckedAt: now, lastValue: currentValue.toString() })
      .where(eq(customAlerts.id, alert.id));

    if (!triggered) {
      return null;
    }

    await db.update(customAlerts)
      .set({
        isTriggered: true,
        lastTriggeredAt: now,
        triggerCount: sql`${customAlerts.triggerCount} + 1`,
      })
      .where(eq(customAlerts.id, alert.id));

    const notification = await this.createNotification({
      alertId: alert.id,
      userId: alert.userId,
      title: `Alert: ${alert.name}`,
      message,
      symbol: alert.symbol,
      alertType: alert.alertType,
      triggeredValue: currentValue.toString(),
      targetValue: alert.targetValue,
      notificationChannel: 'in_app',
      isRead: false,
      isSent: true,
    });

    return notification;
  }

  async createNotification(data: InsertAlertNotification): Promise<AlertNotification> {
    const [notification] = await db.insert(alertNotifications).values(data).returning();
    return notification;
  }

  async getNotifications(userId?: number, unreadOnly = false): Promise<AlertNotification[]> {
    if (userId && unreadOnly) {
      return await db.select().from(alertNotifications).where(and(eq(alertNotifications.userId, userId), eq(alertNotifications.isRead, false))).orderBy(desc(alertNotifications.createdAt));
    } else if (userId) {
      return await db.select().from(alertNotifications).where(eq(alertNotifications.userId, userId)).orderBy(desc(alertNotifications.createdAt));
    }
    return await db.select().from(alertNotifications).orderBy(desc(alertNotifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<AlertNotification | undefined> {
    const [notification] = await db.update(alertNotifications)
      .set({ isRead: true })
      .where(eq(alertNotifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(alertNotifications)
      .set({ isRead: true })
      .where(eq(alertNotifications.userId, userId));
  }

  async deleteNotification(id: number): Promise<boolean> {
    await db.delete(alertNotifications).where(eq(alertNotifications.id, id));
    return true;
  }

  async getAlertStats(userId?: number): Promise<{ total: number; active: number; triggered: number; notifications: number }> {
    const alerts = userId 
      ? await db.select().from(customAlerts).where(eq(customAlerts.userId, userId))
      : await db.select().from(customAlerts);
    
    const notifications = userId
      ? await db.select().from(alertNotifications).where(and(eq(alertNotifications.userId, userId), eq(alertNotifications.isRead, false)))
      : await db.select().from(alertNotifications).where(eq(alertNotifications.isRead, false));

    return {
      total: alerts.length,
      active: alerts.filter(a => a.isActive).length,
      triggered: alerts.filter(a => a.isTriggered).length,
      notifications: notifications.length,
    };
  }
}

export const customAlertService = new CustomAlertService();
