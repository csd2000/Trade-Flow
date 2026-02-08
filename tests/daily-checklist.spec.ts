import { test, expect } from '@playwright/test';

test.describe('Daily Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/daily-checklist');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with title', async ({ page }) => {
    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.getByTestId('page-title')).toContainText('Daily Market Checklist');
  });

  test('displays current time', async ({ page }) => {
    await expect(page.getByTestId('current-time')).toBeVisible();
  });

  test('displays progress counter', async ({ page }) => {
    await expect(page.getByTestId('progress-count')).toBeVisible();
  });

  test('displays all 6 checklist items', async ({ page }) => {
    for (let i = 1; i <= 6; i++) {
      await expect(page.getByTestId(`checklist-item-${i}`)).toBeVisible();
    }
  });

  test('can expand data dropdown by clicking View Data button', async ({ page }) => {
    const firstItem = page.getByTestId('checklist-item-1');
    await expect(firstItem).toBeVisible();
    
    const viewDataButton = firstItem.getByRole('button', { name: /View.*Data/i });
    await expect(viewDataButton).toBeVisible();
    await viewDataButton.click();
    
    // After click, button should change to "Hide Data"
    const hideDataButton = firstItem.getByRole('button', { name: /Hide Data/i });
    await expect(hideDataButton).toBeVisible({ timeout: 5000 });
    
    // Check that data content is visible (Fear & Greed, VIX, etc.)
    await expect(firstItem.getByText(/Fear & Greed/i)).toBeVisible({ timeout: 5000 });
  });

  test('can toggle checkbox on right side', async ({ page }) => {
    const checkbox = page.getByTestId('checkbox-1');
    await expect(checkbox).toBeVisible();
    
    // Click the checkbox
    await checkbox.click();
    
    // Verify it's checked
    await expect(checkbox).toBeChecked();
  });

  test('reset button clears all checkmarks', async ({ page }) => {
    // First check an item
    const checkbox = page.getByTestId('checkbox-1');
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // Click reset
    await page.getByTestId('button-reset').click();
    
    // Verify checkbox is unchecked
    await expect(checkbox).not.toBeChecked();
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.getByTestId('checklist-item-1')).toBeVisible();
  });

  test('responsive layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.getByTestId('checklist-item-1')).toBeVisible();
  });
});
