import { test, expect } from '@playwright/test';

test.describe('Rule Based Scanner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000/central-scanner');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct title and elements', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Rule Based Scanner');
    await expect(page.getByText('Strategy Rules', { exact: true })).toBeVisible();
    await expect(page.locator('input[placeholder*="AAPL"]')).toBeVisible();
  });

  test('symbol input works correctly', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('TSLA');
    await expect(symbolInput).toHaveValue('TSLA');
  });

  test('source type dropdown works', async ({ page }) => {
    await page.getByRole('combobox').first().click();
    await expect(page.getByRole('option', { name: /Pine Script/i })).toBeVisible();
    await page.getByRole('option', { name: /Pine Script/i }).click();
  });

  test('timeframe dropdown works', async ({ page }) => {
    await page.getByRole('combobox').nth(1).click();
    await expect(page.getByRole('option', { name: '5 Minutes', exact: true })).toBeVisible();
    await page.getByRole('option', { name: '5 Minutes', exact: true }).click();
  });

  test('rules textarea accepts input', async ({ page }) => {
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2% below entry.');
    await expect(rulesInput).toContainText('Buy when RSI < 30');
  });

  test('analyze button is clickable and shows loading state', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2% below entry. Take profit 2:1 RR.');
    
    const analyzeButton = page.getByRole('button', { name: /Analyze Chart/i });
    await expect(analyzeButton).toBeEnabled();
    await analyzeButton.click();
    
    await expect(page.getByText('Analyzing Strategy')).toBeVisible({ timeout: 3000 });
  });

  test('analysis completes and shows price cards', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI crosses below 30. Stop loss 2% below entry. Take profit at 2:1 risk reward ratio.');
    
    const analyzeButton = page.getByRole('button', { name: /Analyze Chart/i });
    await analyzeButton.click();
    
    await expect(page.getByText('Current Price')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Entry Point')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Take Profit', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('risk/reward panel shows after analysis', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2% below entry. Take profit 2:1 RR.');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByText('RISK : REWARD')).toBeVisible({ timeout: 30000 });
  });

  test('tabs are visible after analysis', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2%.');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByRole('tab', { name: /Chart/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('tab', { name: /Rule Breakdown/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Signals/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /AI Analysis/i })).toBeVisible();
  });

  test('rule breakdown tab shows parsed rules', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI crosses below 30. Stop loss 2% below entry.');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByRole('tab', { name: /Rule Breakdown/i })).toBeVisible({ timeout: 30000 });
    await page.getByRole('tab', { name: /Rule Breakdown/i }).click();
    
    await expect(page.getByText('Entry Rules').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Stop Loss Rules').first()).toBeVisible();
  });

  test('empty state shows initial instructions', async ({ page }) => {
    await expect(page.getByText('Analyze Your Trading Strategy')).toBeVisible();
    await expect(page.getByText('Entry Points', { exact: true })).toBeVisible();
  });

  test('validation prevents empty rules analysis', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByText('Enter your trading rules')).toBeVisible({ timeout: 5000 });
  });

  test('chart renders with candlesticks after analysis', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2%. Take profit 2:1.');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByText('TradingView Style Chart')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.bg-green-500, .bg-red-500').first()).toBeVisible({ timeout: 5000 });
  });

  test('signals tab shows signal list', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2%.');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByRole('tab', { name: /Signals/i })).toBeVisible({ timeout: 30000 });
    await page.getByRole('tab', { name: /Signals/i }).click();
    
    await expect(page.getByText('Historical Signals')).toBeVisible({ timeout: 10000 });
  });

  test('AI analysis tab shows analysis text', async ({ page }) => {
    const symbolInput = page.locator('input[placeholder*="AAPL"]');
    await symbolInput.fill('AAPL');
    
    const rulesInput = page.getByRole('textbox', { name: /trading rules/i });
    await rulesInput.fill('Buy when RSI < 30. Stop loss 2%.');
    
    await page.getByRole('button', { name: /Analyze Chart/i }).click();
    
    await expect(page.getByRole('tab', { name: /AI Analysis/i })).toBeVisible({ timeout: 30000 });
    await page.getByRole('tab', { name: /AI Analysis/i }).click();
    
    await expect(page.getByText('AI Strategy Analysis')).toBeVisible({ timeout: 10000 });
  });
});
