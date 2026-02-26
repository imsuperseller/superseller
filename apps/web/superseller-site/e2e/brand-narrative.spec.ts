/**
 * E2E Tests — Brand Narrative & Content Verification
 * Verifies the "Super Seller" transformation narrative is live across key pages.
 *
 * Run: PLAYWRIGHT_BASE_URL=https://superseller.agency npx playwright test e2e/brand-narrative.spec.ts
 */
import { test, expect } from '@playwright/test';

test.describe('Homepage — Brand Narrative', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('hero displays transformation headline', async ({ page }) => {
    await expect(page.getByText('Stop Hustling.')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Start Selling.')).toBeVisible();
    await expect(page.getByText('Handles the Rest.')).toBeVisible();
  });

  test('hero sub-headline mentions Super Seller', async ({ page }) => {
    // Multiple "Super Seller" on page — use .first() for strict mode
    await expect(
      page.getByText('Super Seller', { exact: false }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('hero eyebrow badge shows "Your AI Crew Is Ready"', async ({ page }) => {
    // Badge text also appears in sub-headline — target the badge specifically
    await expect(
      page.getByText('Your AI Crew Is Ready').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('crew section shows "Seven Agents. Zero Overhead."', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Seven Agents.*Zero Overhead/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('industry section shows "Your Industry. Your Crew."', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Your Industry.*Your Crew/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('final CTA says "Become a Super Seller"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Become a.*Super Seller/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('trust line mentions real industries', async ({ page }) => {
    await expect(
      page.getByText(/restaurants.*contractors.*locksmiths/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Crew Page', () => {
  test('Buzz is visible on crew page', async ({ page }) => {
    await page.goto('/crew', { waitUntil: 'networkidle' });
    // Look for Buzz by name in any element
    await expect(
      page.getByText('Buzz', { exact: true }).first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('crew page subtitle mentions transformation', async ({ page }) => {
    await page.goto('/crew', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByText('You focus on your craft')
    ).toBeVisible({ timeout: 5000 });
  });
});

// Process Page tests removed — /process permanently redirects to /crew (next.config.mjs)

test.describe('Blog Page', () => {
  test('blog page loads and shows articles', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: /SuperSeller AI Insights/i })
    ).toBeVisible({ timeout: 5000 });

    // Should have at least 5 articles (seeded)
    const articles = page.locator('a[href^="/blog/"]');
    await expect(articles.first()).toBeVisible({ timeout: 5000 });
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('blog articles have titles visible', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });

    // Check for at least one seeded article title
    const aiCrewArticle = page.getByText(/AI Crew/i);
    await expect(aiCrewArticle.first()).toBeVisible({ timeout: 5000 });
  });
});
