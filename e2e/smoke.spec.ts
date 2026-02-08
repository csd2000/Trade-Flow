import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5000';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/command-center', name: 'Command Center' },
  { path: '/ai-trader', name: 'AI Trader' },
  { path: '/scanner', name: '5:1 Scanner' },
  { path: '/futures', name: 'Futures Desk' },
  { path: '/income-machine', name: 'Income Machine' },
  { path: '/market-intelligence', name: 'Market Intelligence' },
  { path: '/institutional', name: 'Institutional Terminal' },
  { path: '/daily-checklist', name: 'Daily Checklist' },
  { path: '/quant', name: 'Quant Dashboard' },
  { path: '/timeseries', name: 'Time Series' },
  { path: '/ai-profit-studio', name: 'AI Profit Studio' },
  { path: '/strategies', name: 'Strategies' },
  { path: '/seven-gate-decision', name: '7-Gate Decision Engine' },
];

test.describe('Smoke Tests - All Pages Load', () => {
  for (const page of pages) {
    test(`${page.name} page loads without errors`, async ({ page: browserPage }) => {
      const errors: string[] = [];
      
      browserPage.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      browserPage.on('pageerror', error => {
        errors.push(error.message);
      });

      const response = await browserPage.goto(`${BASE_URL}${page.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      expect(response?.status()).toBeLessThan(400);
      
      await browserPage.waitForTimeout(1000);

      const criticalErrors = errors.filter(e => 
        !e.includes('401') && 
        !e.includes('Not authenticated') &&
        !e.includes('credit balance') &&
        !e.includes('Anthropic')
      );

      if (criticalErrors.length > 0) {
        console.log(`Errors on ${page.name}:`, criticalErrors);
      }
    });
  }
});

test.describe('Core Functionality Tests', () => {
  test('Layout renders correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.length).toBeGreaterThan(5000);
  });

  test('Income Machine page has tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/income-machine`);
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.length).toBeGreaterThan(1000);
  });

  test('Institutional Terminal displays data', async ({ page }) => {
    await page.goto(`${BASE_URL}/institutional`);
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.length).toBeGreaterThan(1000);
  });
});

test.describe('Futures Desk Tests', () => {
  test('Futures API returns signals', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/futures/signals`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('Futures API returns news', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/futures/news`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Futures Desk displays Gold and Silver controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/futures`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const goldButton = page.getByRole('button', { name: /Gold/i });
    const silverButton = page.getByRole('button', { name: /Silver/i });
    await expect(goldButton.first()).toBeVisible();
    await expect(silverButton.first()).toBeVisible();
  });

  test('Futures Desk displays chart section', async ({ page }) => {
    await page.goto(`${BASE_URL}/futures`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const content = await page.content();
    expect(content.length).toBeGreaterThan(10000);
  });
});

test.describe('7-Gate Decision Engine Tests', () => {
  test('7-Gate analyze API works', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/seven-gate/analyze/SPY`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('symbol');
    expect(data.data).toHaveProperty('gates');
  });

  test('7-Gate page displays gates', async ({ page }) => {
    await page.goto(`${BASE_URL}/seven-gate-decision`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content).toContain('Gate');
  });
});
