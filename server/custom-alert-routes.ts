import { Router, Request, Response } from 'express';
import { customAlertService } from './custom-alert-service';
import { alertMonitorService } from './alert-monitor-service';
import { insertCustomAlertSchema, alertConditions, alertTypes } from '@shared/schema';
import { z } from 'zod';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const alerts = await customAlertService.getAlerts(userId);
    res.json(alerts);
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts', message: error?.message });
  }
});

router.get('/active', async (req: Request, res: Response) => {
  try {
    const alerts = await customAlertService.getActiveAlerts();
    res.json(alerts);
  } catch (error: any) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({ error: 'Failed to fetch active alerts', message: error?.message });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const stats = await customAlertService.getAlertStats(userId);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert stats', message: error?.message });
  }
});

router.get('/conditions', (req: Request, res: Response) => {
  res.json({
    alertTypes,
    alertConditions,
    defaultValues: {
      rsi_overbought: 70,
      rsi_oversold: 30,
      volume_spike: 2.0,
      price_change_percent: 5.0,
    }
  });
});

router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const unreadOnly = req.query.unread === 'true';
    const notifications = await customAlertService.getNotifications(userId, unreadOnly);
    res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', message: error?.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const alert = await customAlertService.getAlert(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error: any) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert', message: error?.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertCustomAlertSchema.parse(req.body);
    const alert = await customAlertService.createAlert(validatedData);
    res.status(201).json(alert);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert', message: error?.message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const alert = await customAlertService.updateAlert(id, req.body);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error: any) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert', message: error?.message });
  }
});

router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const alert = await customAlertService.toggleAlert(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error: any) {
    console.error('Error toggling alert:', error);
    res.status(500).json({ error: 'Failed to toggle alert', message: error?.message });
  }
});

router.patch('/:id/reset', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const alert = await customAlertService.resetAlert(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error: any) {
    console.error('Error resetting alert:', error);
    res.status(500).json({ error: 'Failed to reset alert', message: error?.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await customAlertService.deleteAlert(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert', message: error?.message });
  }
});

router.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const notification = await customAlertService.markNotificationRead(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Failed to mark notification read', message: error?.message });
  }
});

router.post('/notifications/mark-all-read', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId ? parseInt(req.body.userId) : 1;
    await customAlertService.markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications read', message: error?.message });
  }
});

router.delete('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await customAlertService.deleteNotification(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification', message: error?.message });
  }
});

router.get('/monitor/status', (req: Request, res: Response) => {
  res.json({
    isRunning: alertMonitorService.isActive(),
    message: alertMonitorService.isActive() ? 'Alert monitor is running' : 'Alert monitor is stopped'
  });
});

router.post('/monitor/start', (req: Request, res: Response) => {
  try {
    let intervalMs = parseInt(req.body.intervalMs as string) || 60000;
    intervalMs = Math.max(30000, Math.min(intervalMs, 600000));
    alertMonitorService.start(intervalMs);
    res.json({ success: true, message: `Alert monitor started (interval: ${intervalMs / 1000}s)` });
  } catch (error: any) {
    console.error('Error starting monitor:', error);
    res.status(500).json({ error: 'Failed to start monitor', message: error?.message });
  }
});

router.post('/monitor/stop', (req: Request, res: Response) => {
  try {
    alertMonitorService.stop();
    res.json({ success: true, message: 'Alert monitor stopped' });
  } catch (error: any) {
    console.error('Error stopping monitor:', error);
    res.status(500).json({ error: 'Failed to stop monitor', message: error?.message });
  }
});

router.post('/monitor/check-now', async (req: Request, res: Response) => {
  try {
    const result = await alertMonitorService.checkAllAlerts();
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error running check:', error);
    res.status(500).json({ error: 'Failed to check alerts', message: error?.message });
  }
});

router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const notification = await alertMonitorService.sendTestNotification(id);
    if (notification) {
      res.json({ 
        success: true, 
        triggered: true,
        notification 
      });
    } else {
      res.json({ 
        success: true, 
        triggered: false,
        message: 'Alert conditions not met' 
      });
    }
  } catch (error: any) {
    console.error('Error testing alert:', error);
    res.status(500).json({ error: 'Failed to test alert', message: error?.message });
  }
});

router.post('/push/subscribe', (req: Request, res: Response) => {
  try {
    const { userId, subscription } = req.body;
    alertMonitorService.registerPushSubscription(userId || '1', subscription);
    res.json({ success: true, message: 'Push subscription registered' });
  } catch (error: any) {
    console.error('Error registering push subscription:', error);
    res.status(500).json({ error: 'Failed to register push subscription', message: error?.message });
  }
});

router.post('/push/unsubscribe', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    alertMonitorService.unregisterPushSubscription(userId || '1');
    res.json({ success: true, message: 'Push subscription removed' });
  } catch (error: any) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ error: 'Failed to remove push subscription', message: error?.message });
  }
});

export default router;
