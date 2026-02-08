import crypto from 'crypto';

interface OrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop';
  price?: number;
  stopPrice?: number;
  takeProfitPrice?: number;
}

interface OrderResult {
  success: boolean;
  orderId?: string;
  filledPrice?: number;
  filledQuantity?: number;
  status: 'submitted' | 'filled' | 'rejected' | 'error';
  message: string;
  timestamp: string;
}

interface PlatformCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

interface AccountBalance {
  platform: string;
  currency: string;
  available: number;
  total: number;
  timestamp: string;
}

type SupportedPlatform = 'binance' | 'alpaca' | 'oanda' | 'coinbase';

class TradingExecutionService {
  private getCredentials(platform: SupportedPlatform): PlatformCredentials | null {
    const envMap: Record<SupportedPlatform, { key: string; secret: string; passphrase?: string }> = {
      binance: { key: 'BINANCE_API_KEY', secret: 'BINANCE_API_SECRET' },
      alpaca: { key: 'ALPACA_API_KEY', secret: 'ALPACA_SECRET_KEY' },
      oanda: { key: 'OANDA_API_KEY', secret: 'OANDA_ACCOUNT_ID' },
      coinbase: { key: 'COINBASE_API_KEY', secret: 'COINBASE_API_SECRET', passphrase: 'COINBASE_PASSPHRASE' }
    };

    const config = envMap[platform];
    if (!config) return null;

    const apiKey = process.env[config.key];
    const apiSecret = process.env[config.secret];
    const passphrase = config.passphrase ? process.env[config.passphrase] : undefined;

    if (!apiKey || !apiSecret) {
      console.log(`⚠️ Missing credentials for ${platform}`);
      return null;
    }

    return { apiKey, apiSecret, passphrase };
  }

  async testConnection(platform: SupportedPlatform): Promise<{ connected: boolean; message: string; balance?: AccountBalance }> {
    const creds = this.getCredentials(platform);
    if (!creds) {
      return { connected: false, message: `No API credentials configured for ${platform}` };
    }

    try {
      switch (platform) {
        case 'binance':
          return await this.testBinanceConnection(creds);
        case 'alpaca':
          return await this.testAlpacaConnection(creds);
        case 'oanda':
          return await this.testOandaConnection(creds);
        case 'coinbase':
          return await this.testCoinbaseConnection(creds);
        default:
          return { connected: false, message: `Unsupported platform: ${platform}` };
      }
    } catch (error) {
      return { connected: false, message: `Connection error: ${(error as Error).message}` };
    }
  }

  private async testBinanceConnection(creds: PlatformCredentials): Promise<{ connected: boolean; message: string; balance?: AccountBalance }> {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', creds.apiSecret).update(queryString).digest('hex');
      
      const response = await fetch(`https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`, {
        headers: { 'X-MBX-APIKEY': creds.apiKey }
      });

      if (!response.ok) {
        const error = await response.json();
        return { connected: false, message: error.msg || 'Binance connection failed' };
      }

      const data = await response.json();
      const usdtBalance = data.balances?.find((b: any) => b.asset === 'USDT');
      
      return {
        connected: true,
        message: 'Binance connected successfully',
        balance: {
          platform: 'binance',
          currency: 'USDT',
          available: parseFloat(usdtBalance?.free || '0'),
          total: parseFloat(usdtBalance?.free || '0') + parseFloat(usdtBalance?.locked || '0'),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { connected: false, message: `Binance error: ${(error as Error).message}` };
    }
  }

  private async testAlpacaConnection(creds: PlatformCredentials): Promise<{ connected: boolean; message: string; balance?: AccountBalance }> {
    try {
      const baseUrl = process.env.ALPACA_PAPER === 'true' 
        ? 'https://paper-api.alpaca.markets' 
        : 'https://api.alpaca.markets';

      const response = await fetch(`${baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': creds.apiKey,
          'APCA-API-SECRET-KEY': creds.apiSecret
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { connected: false, message: error.message || 'Alpaca connection failed' };
      }

      const data = await response.json();
      
      return {
        connected: true,
        message: `Alpaca ${data.status} - ${process.env.ALPACA_PAPER === 'true' ? 'Paper' : 'Live'} Trading`,
        balance: {
          platform: 'alpaca',
          currency: 'USD',
          available: parseFloat(data.buying_power || '0'),
          total: parseFloat(data.equity || '0'),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { connected: false, message: `Alpaca error: ${(error as Error).message}` };
    }
  }

  private async testOandaConnection(creds: PlatformCredentials): Promise<{ connected: boolean; message: string; balance?: AccountBalance }> {
    try {
      const accountId = creds.apiSecret;
      const baseUrl = process.env.OANDA_PRACTICE === 'true'
        ? 'https://api-fxpractice.oanda.com'
        : 'https://api-fxtrade.oanda.com';

      const response = await fetch(`${baseUrl}/v3/accounts/${accountId}/summary`, {
        headers: {
          'Authorization': `Bearer ${creds.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { connected: false, message: error.errorMessage || 'OANDA connection failed' };
      }

      const data = await response.json();
      
      return {
        connected: true,
        message: `OANDA ${process.env.OANDA_PRACTICE === 'true' ? 'Practice' : 'Live'} Account Connected`,
        balance: {
          platform: 'oanda',
          currency: data.account?.currency || 'USD',
          available: parseFloat(data.account?.marginAvailable || '0'),
          total: parseFloat(data.account?.NAV || '0'),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { connected: false, message: `OANDA error: ${(error as Error).message}` };
    }
  }

  private async testCoinbaseConnection(creds: PlatformCredentials): Promise<{ connected: boolean; message: string; balance?: AccountBalance }> {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = 'GET';
      const path = '/api/v3/brokerage/accounts';
      const message = timestamp + method + path;
      const signature = crypto.createHmac('sha256', creds.apiSecret).update(message).digest('hex');

      const response = await fetch(`https://api.coinbase.com${path}`, {
        headers: {
          'CB-ACCESS-KEY': creds.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { connected: false, message: error.message || 'Coinbase connection failed' };
      }

      const data = await response.json();
      const usdAccount = data.accounts?.find((a: any) => a.currency === 'USD');
      
      return {
        connected: true,
        message: 'Coinbase connected successfully',
        balance: {
          platform: 'coinbase',
          currency: 'USD',
          available: parseFloat(usdAccount?.available_balance?.value || '0'),
          total: parseFloat(usdAccount?.available_balance?.value || '0'),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { connected: false, message: `Coinbase error: ${(error as Error).message}` };
    }
  }

  async executeOrder(platform: SupportedPlatform, order: OrderParams, isPaperTrading: boolean = true): Promise<OrderResult> {
    const creds = this.getCredentials(platform);
    if (!creds) {
      return {
        success: false,
        status: 'error',
        message: `No API credentials for ${platform}`,
        timestamp: new Date().toISOString()
      };
    }

    if (isPaperTrading) {
      return this.simulatePaperOrder(platform, order);
    }

    try {
      switch (platform) {
        case 'binance':
          return await this.executeBinanceOrder(creds, order);
        case 'alpaca':
          return await this.executeAlpacaOrder(creds, order);
        case 'oanda':
          return await this.executeOandaOrder(creds, order);
        case 'coinbase':
          return await this.executeCoinbaseOrder(creds, order);
        default:
          return {
            success: false,
            status: 'error',
            message: `Unsupported platform: ${platform}`,
            timestamp: new Date().toISOString()
          };
      }
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: `Order execution error: ${(error as Error).message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private simulatePaperOrder(platform: string, order: OrderParams): OrderResult {
    const simulatedPrice = order.price || Math.random() * 100 + 50;
    const orderId = `PAPER_${platform.toUpperCase()}_${Date.now()}`;
    
    console.log(`📝 PAPER TRADE: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol} @ $${simulatedPrice.toFixed(2)}`);
    
    return {
      success: true,
      orderId,
      filledPrice: simulatedPrice,
      filledQuantity: order.quantity,
      status: 'filled',
      message: `Paper trade executed: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeBinanceOrder(creds: PlatformCredentials, order: OrderParams): Promise<OrderResult> {
    const timestamp = Date.now();
    const params = new URLSearchParams({
      symbol: order.symbol.replace('-', '').replace('/', ''),
      side: order.side.toUpperCase(),
      type: order.orderType.toUpperCase(),
      quantity: order.quantity.toString(),
      timestamp: timestamp.toString()
    });

    if (order.orderType === 'limit' && order.price) {
      params.append('price', order.price.toString());
      params.append('timeInForce', 'GTC');
    }

    const signature = crypto.createHmac('sha256', creds.apiSecret).update(params.toString()).digest('hex');
    params.append('signature', signature);

    const response = await fetch(`https://api.binance.com/api/v3/order?${params}`, {
      method: 'POST',
      headers: { 'X-MBX-APIKEY': creds.apiKey }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: 'rejected',
        message: data.msg || 'Binance order rejected',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      orderId: data.orderId?.toString(),
      filledPrice: parseFloat(data.fills?.[0]?.price || data.price || '0'),
      filledQuantity: parseFloat(data.executedQty || '0'),
      status: data.status === 'FILLED' ? 'filled' : 'submitted',
      message: `Binance order ${data.status}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeAlpacaOrder(creds: PlatformCredentials, order: OrderParams): Promise<OrderResult> {
    const baseUrl = process.env.ALPACA_PAPER === 'true' 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';

    const body = {
      symbol: order.symbol.replace('-', '').replace('/', ''),
      qty: order.quantity.toString(),
      side: order.side,
      type: order.orderType,
      time_in_force: 'day',
      ...(order.price && order.orderType === 'limit' && { limit_price: order.price }),
      ...(order.stopPrice && { stop_price: order.stopPrice })
    };

    const response = await fetch(`${baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': creds.apiKey,
        'APCA-API-SECRET-KEY': creds.apiSecret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: 'rejected',
        message: data.message || 'Alpaca order rejected',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      orderId: data.id,
      filledPrice: parseFloat(data.filled_avg_price || '0'),
      filledQuantity: parseFloat(data.filled_qty || '0'),
      status: data.status === 'filled' ? 'filled' : 'submitted',
      message: `Alpaca order ${data.status}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeOandaOrder(creds: PlatformCredentials, order: OrderParams): Promise<OrderResult> {
    const accountId = creds.apiSecret;
    const baseUrl = process.env.OANDA_PRACTICE === 'true'
      ? 'https://api-fxpractice.oanda.com'
      : 'https://api-fxtrade.oanda.com';

    const units = order.side === 'buy' ? order.quantity : -order.quantity;
    const instrument = order.symbol.replace('/', '_');

    const body = {
      order: {
        type: order.orderType.toUpperCase(),
        instrument,
        units: units.toString(),
        ...(order.orderType === 'limit' && order.price && { price: order.price.toString() }),
        ...(order.stopPrice && { stopLossOnFill: { price: order.stopPrice.toString() } }),
        ...(order.takeProfitPrice && { takeProfitOnFill: { price: order.takeProfitPrice.toString() } })
      }
    };

    const response = await fetch(`${baseUrl}/v3/accounts/${accountId}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: 'rejected',
        message: data.errorMessage || 'OANDA order rejected',
        timestamp: new Date().toISOString()
      };
    }

    const fill = data.orderFillTransaction;
    return {
      success: true,
      orderId: data.orderCreateTransaction?.id || fill?.id,
      filledPrice: parseFloat(fill?.price || '0'),
      filledQuantity: Math.abs(parseFloat(fill?.units || '0')),
      status: fill ? 'filled' : 'submitted',
      message: `OANDA order executed`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeCoinbaseOrder(creds: PlatformCredentials, order: OrderParams): Promise<OrderResult> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = 'POST';
    const path = '/api/v3/brokerage/orders';
    
    const body = {
      client_order_id: `cf_${Date.now()}`,
      product_id: order.symbol,
      side: order.side.toUpperCase(),
      order_configuration: order.orderType === 'market' 
        ? { market_market_ioc: { quote_size: (order.quantity * (order.price || 100)).toString() } }
        : { limit_limit_gtc: { base_size: order.quantity.toString(), limit_price: order.price?.toString() } }
    };

    const message = timestamp + method + path + JSON.stringify(body);
    const signature = crypto.createHmac('sha256', creds.apiSecret).update(message).digest('hex');

    const response = await fetch(`https://api.coinbase.com${path}`, {
      method: 'POST',
      headers: {
        'CB-ACCESS-KEY': creds.apiKey,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        status: 'rejected',
        message: data.error_response?.message || 'Coinbase order rejected',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      orderId: data.order_id,
      status: 'submitted',
      message: 'Coinbase order submitted',
      timestamp: new Date().toISOString()
    };
  }

  getSupportedPlatforms(): { id: SupportedPlatform; name: string; assetTypes: string[]; hasCredentials: boolean }[] {
    return [
      { 
        id: 'binance', 
        name: 'Binance', 
        assetTypes: ['crypto'],
        hasCredentials: !!this.getCredentials('binance')
      },
      { 
        id: 'alpaca', 
        name: 'Alpaca', 
        assetTypes: ['stocks', 'crypto'],
        hasCredentials: !!this.getCredentials('alpaca')
      },
      { 
        id: 'oanda', 
        name: 'OANDA', 
        assetTypes: ['forex'],
        hasCredentials: !!this.getCredentials('oanda')
      },
      { 
        id: 'coinbase', 
        name: 'Coinbase', 
        assetTypes: ['crypto'],
        hasCredentials: !!this.getCredentials('coinbase')
      }
    ];
  }
}

export const tradingExecutionService = new TradingExecutionService();
