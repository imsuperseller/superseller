/**
 * Video Create Page Flash Detection Suite
 *
 * Programmatically detects:
 * 1. Cumulative Layout Shift (CLS) - layout instability
 * 2. Background flash - white/light color during load
 * 3. Form visibility within timeout
 *
 * Run: npx playwright test e2e/video-create-flash.spec.ts
 * Server must be running on 3002, or: npm run test:e2e (starts it)
 */
import { test, expect } from '@playwright/test';

const VIDEO_CREATE_URL = '/video/create';
const CLS_THRESHOLD = 0.1;
const SETTLE_MS = 2500;

/** Compute CLS from Layout Instability API. */
async function getCLS(page: import('@playwright/test').Page, settleMs: number): Promise<number> {
  return page.evaluate((ms) => {
    return new Promise<number>((resolve) => {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: { startTime: number }[] = [];

      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const e = entry as unknown as { hadRecentInput?: boolean; value?: number; startTime?: number };
          if (e.hadRecentInput) continue;
          const value = e.value ?? 0;
          const startTime = e.startTime ?? 0;

          if (
            sessionValue > 0 &&
            sessionEntries.length > 0 &&
            startTime - sessionEntries[sessionEntries.length - 1]!.startTime < 1000 &&
            startTime - sessionEntries[0]!.startTime < 5000
          ) {
            sessionValue += value;
            sessionEntries.push({ startTime });
          } else {
            sessionValue = value;
            sessionEntries = [{ startTime }];
          }
          if (sessionValue > clsValue) clsValue = sessionValue;
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, ms);
    });
  }, settleMs);
}

/** Sample body computed background at given delay. */
async function getBodyBg(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

/** True if color is light/white. */
function isLightColor(cssColor: string): boolean {
  const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 200;
  }
  return (
    cssColor === 'white' ||
    cssColor === 'rgb(255, 255, 255)' ||
    /^#f{6}$/i.test(cssColor) ||
    /^#fff$/i.test(cssColor)
  );
}

test.describe('Video Create Page - Flash Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(VIDEO_CREATE_URL, { waitUntil: 'domcontentloaded' });
  });

  test('CLS should be below 0.1 (no significant layout shift)', async ({ page }) => {
    await page.waitForTimeout(SETTLE_MS);
    const cls = await getCLS(page, SETTLE_MS);
    expect(cls, `CLS ${cls} exceeded threshold ${CLS_THRESHOLD}`).toBeLessThan(CLS_THRESHOLD);
  });

  test('body background should never be white/light at 50ms, 200ms, 500ms, 1500ms', async ({ page }) => {
    for (const ms of [50, 200, 500, 1500]) {
      await page.waitForTimeout(ms);
      const bg = await getBodyBg(page);
      expect(isLightColor(bg), `At ${ms}ms body bg was light: ${bg}`).toBe(false);
    }
  });

  test('form and heading should be visible within 3s', async ({ page }) => {
    await page.waitForSelector('form', { timeout: 3000 });
    const heading = page.getByRole('heading', { name: /Create AI Property Tour/i });
    await expect(heading).toBeVisible({ timeout: 2000 });
  });

  test('diagnostic: sample backgrounds at 0, 100, 300, 500, 1000ms (for debugging)', async ({ page }) => {
    const intervals = [0, 100, 300, 500, 1000];
    let last = 0;
    const samples: { ms: number; bg: string; light: boolean }[] = [];
    for (const ms of intervals) {
      await page.waitForTimeout(ms - last);
      last = ms;
      const bg = await getBodyBg(page);
      samples.push({ ms, bg, light: isLightColor(bg) });
    }
    const light = samples.filter((s) => s.light);
    expect(light, `Light backgrounds at: ${JSON.stringify(light)}`).toHaveLength(0);
  });

  test('no white flash in first 150ms (fine-grained: 0, 16, 33, 50, 83, 100, 150ms)', async ({ page }) => {
    const intervals = [0, 16, 33, 50, 83, 100, 150];
    let last = 0;
    for (const ms of intervals) {
      await page.waitForTimeout(ms - last);
      last = ms;
      const bg = await getBodyBg(page);
      expect(isLightColor(bg), `At ${ms}ms body bg was light: ${bg}`).toBe(false);
    }
  });

  test('no white flash with Fast 3G throttling', async ({ page, browserName }) => {
    if (browserName !== 'chromium') {
      test.skip(); // CDP only in Chromium
      return;
    }
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 562.5,
    });
    await page.goto(VIDEO_CREATE_URL, { waitUntil: 'domcontentloaded' });
    const intervals = [0, 100, 300, 800, 1500];
    let last = 0;
    for (const ms of intervals) {
      await page.waitForTimeout(ms - last);
      last = ms;
      const bg = await getBodyBg(page);
      expect(isLightColor(bg), `At ${ms}ms with Fast 3G, body bg was light: ${bg}`).toBe(false);
    }
  });
});
