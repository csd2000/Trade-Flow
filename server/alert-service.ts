import { Router, Request, Response } from 'express';
import sgMail from '@sendgrid/mail';

const router = Router();

interface AlertConfig {
  enabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  emailAddress?: string;
  telegramChatId?: string;
  scoreThreshold: number;
  lastAlertTime?: number;
}

interface MarketScore {
  score: number;
  total: number;
  reasons: string[];
  timestamp: string;
}

let alertConfig: AlertConfig = {
  enabled: false,
  emailEnabled: false,
  telegramEnabled: false,
  scoreThreshold: 5,
};

let lastScore: MarketScore | null = null;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

async function sendEmailAlert(score: MarketScore, toEmail: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const reasonsList = score.reasons.map(r => `• ${r}`).join('\n');
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `🚨 ALERT: Perfect 5/5 Market Score Detected!`,
      text: `
MARKET INTELLIGENCE ALERT
========================

A perfect ${score.score}/${score.total} market score has been detected!

CONDITIONS MET:
${reasonsList}

Time: ${score.timestamp}

This is the optimal "Best Case Scenario" for trading. 
All macro and technical indicators are aligned for high-probability setups.

---
TradeFlow Pro Alert System
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff; border-radius: 10px;">
          <h1 style="color: #00ff88; text-align: center;">🚨 PERFECT SCORE ALERT</h1>
          <div style="background: linear-gradient(135deg, #00ff88, #00cc6a); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #000; margin: 0; font-size: 48px;">${score.score}/${score.total}</h2>
            <p style="color: #000; margin: 5px 0 0 0;">Market Score</p>
          </div>
          <h3 style="color: #00ff88;">✅ CONDITIONS MET:</h3>
          <ul style="list-style: none; padding: 0;">
            ${score.reasons.map(r => `<li style="padding: 8px 0; border-bottom: 1px solid #333;">✓ ${r}</li>`).join('')}
          </ul>
          <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
            Time: ${score.timestamp}<br>
            TradeFlow Pro Alert System
          </p>
        </div>
      `
    };

    await client.send(msg);
    console.log(`✅ Email alert sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Email alert failed:', error);
    return false;
  }
}

async function sendTelegramAlert(score: MarketScore, chatId: string): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return false;
    }

    const reasonsList = score.reasons.map(r => `✅ ${r}`).join('\n');
    
    const message = `
🚨 *PERFECT SCORE ALERT* 🚨

*Market Score: ${score.score}/${score.total}*

*CONDITIONS MET:*
${reasonsList}

⏰ Time: ${score.timestamp}

_This is the optimal "Best Case Scenario" for trading!_
_All indicators aligned for high-probability setups._

📊 TradeFlow Pro
    `.trim();

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    console.log(`✅ Telegram alert sent to chat ${chatId}`);
    return true;
  } catch (error) {
    console.error('Telegram alert failed:', error);
    return false;
  }
}

async function checkAndSendAlerts(score: MarketScore) {
  if (!alertConfig.enabled) return;
  
  if (score.score < alertConfig.scoreThreshold) return;
  
  const now = Date.now();
  const cooldownMs = 5 * 60 * 1000;
  if (alertConfig.lastAlertTime && (now - alertConfig.lastAlertTime) < cooldownMs) {
    console.log('Alert cooldown active, skipping...');
    return;
  }

  let alertsSent = false;

  if (alertConfig.emailEnabled && alertConfig.emailAddress) {
    const sent = await sendEmailAlert(score, alertConfig.emailAddress);
    if (sent) alertsSent = true;
  }

  if (alertConfig.telegramEnabled && alertConfig.telegramChatId) {
    const sent = await sendTelegramAlert(score, alertConfig.telegramChatId);
    if (sent) alertsSent = true;
  }

  if (alertsSent) {
    alertConfig.lastAlertTime = now;
  }
}

router.get('/config', (req: Request, res: Response) => {
  res.json({
    enabled: alertConfig.enabled,
    emailEnabled: alertConfig.emailEnabled,
    telegramEnabled: alertConfig.telegramEnabled,
    emailAddress: alertConfig.emailAddress ? '****' + alertConfig.emailAddress.slice(-10) : null,
    telegramConfigured: !!alertConfig.telegramChatId,
    scoreThreshold: alertConfig.scoreThreshold,
    lastScore: lastScore
  });
});

router.post('/config', (req: Request, res: Response) => {
  const { enabled, emailEnabled, telegramEnabled, emailAddress, telegramChatId, scoreThreshold } = req.body;
  
  if (typeof enabled === 'boolean') alertConfig.enabled = enabled;
  if (typeof emailEnabled === 'boolean') alertConfig.emailEnabled = emailEnabled;
  if (typeof telegramEnabled === 'boolean') alertConfig.telegramEnabled = telegramEnabled;
  if (emailAddress) alertConfig.emailAddress = emailAddress;
  if (telegramChatId) alertConfig.telegramChatId = telegramChatId;
  if (typeof scoreThreshold === 'number') alertConfig.scoreThreshold = scoreThreshold;
  
  res.json({ success: true, config: {
    enabled: alertConfig.enabled,
    emailEnabled: alertConfig.emailEnabled,
    telegramEnabled: alertConfig.telegramEnabled,
    scoreThreshold: alertConfig.scoreThreshold
  }});
});

router.post('/test-email', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address required' });
  }

  const testScore: MarketScore = {
    score: 5,
    total: 5,
    reasons: [
      'DXY is weakening (Bullish)',
      'S&P 500 above average (Bullish)',
      'Golden Cross active',
      'RSI in Bullish Momentum zone',
      'Volume confirmation'
    ],
    timestamp: new Date().toISOString()
  };

  const sent = await sendEmailAlert(testScore, email);
  if (sent) {
    res.json({ success: true, message: 'Test email sent!' });
  } else {
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

router.post('/test-telegram', async (req: Request, res: Response) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ error: 'Telegram chat ID required' });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(400).json({ 
      error: 'TELEGRAM_BOT_TOKEN not configured',
      instructions: 'Add your Telegram bot token as a secret named TELEGRAM_BOT_TOKEN'
    });
  }

  const testScore: MarketScore = {
    score: 5,
    total: 5,
    reasons: [
      'DXY is weakening (Bullish)',
      'S&P 500 above average (Bullish)',
      'Golden Cross active',
      'RSI in Bullish Momentum zone',
      'Volume confirmation'
    ],
    timestamp: new Date().toISOString()
  };

  const sent = await sendTelegramAlert(testScore, chatId);
  if (sent) {
    res.json({ success: true, message: 'Test Telegram message sent!' });
  } else {
    res.status(500).json({ error: 'Failed to send Telegram message' });
  }
});

router.post('/trigger', async (req: Request, res: Response) => {
  const { score, total, reasons } = req.body;
  
  const marketScore: MarketScore = {
    score: score || 5,
    total: total || 5,
    reasons: reasons || ['Manual trigger'],
    timestamp: new Date().toISOString()
  };

  lastScore = marketScore;
  
  await checkAndSendAlerts(marketScore);
  
  res.json({ success: true, score: marketScore });
});

router.get('/telegram-setup', (req: Request, res: Response) => {
  res.json({
    instructions: [
      '1. Open Telegram and search for @BotFather',
      '2. Send /newbot and follow the prompts to create your bot',
      '3. Copy the bot token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)',
      '4. Add the token as a secret named TELEGRAM_BOT_TOKEN in Replit',
      '5. Start a chat with your new bot and send /start',
      '6. To get your chat ID, send a message to @userinfobot or visit:',
      '   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates',
      '7. Enter your chat ID in the alert settings'
    ],
    tokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN
  });
});

export { checkAndSendAlerts };
export default router;
