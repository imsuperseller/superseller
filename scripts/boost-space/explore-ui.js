#!/usr/bin/env node
/**
 * Explore Boost.space UI after login
 * Take screenshots to understand navigation structure
 */

const { chromium } = require('playwright');

const BOOST_SPACE_CONFIG = {
  url: 'https://superseller.boost.space',
  email: 'shai', // Just username
  password: 'e1UVP5lVY'
};

async function main() {
  console.log('🔍 Exploring Boost.space UI...\n');

  const browser = await chromium.launch({
    headless: true,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto(BOOST_SPACE_CONFIG.url);
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    await page.waitForSelector('input[placeholder*="username"], input[placeholder*="email"]');

    await page.fill('input[placeholder*="username"], input[placeholder*="email"]', BOOST_SPACE_CONFIG.email);
    await page.fill('input[placeholder*="password"]', BOOST_SPACE_CONFIG.password);
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Log in")');

    console.log('⏳ Waiting for dashboard to load...');
    await page.waitForTimeout(5000);

    // Take screenshot of dashboard
    await page.screenshot({ path: '/tmp/boost-space-dashboard.png', fullPage: true });
    console.log('📸 Dashboard screenshot saved to /tmp/boost-space-dashboard.png');

    // Get current URL
    console.log('📍 Current URL:', page.url());

    // Try to find navigation elements
    console.log('\n🔍 Looking for navigation elements...');

    const navTexts = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('nav a, nav button, [role="navigation"] a, [role="navigation"] button, .sidebar a, .sidebar button, .menu a, .menu button'));
      return elements.map(el => ({
        text: el.textContent?.trim(),
        tag: el.tagName,
        class: el.className
      })).filter(item => item.text && item.text.length > 0 && item.text.length < 50);
    });

    console.log('Found navigation items:', navTexts.slice(0, 20)); // Show first 20

    // Look for settings/admin links
    console.log('\n⚙️  Looking for Settings/Admin...');
    const settingsLinks = navTexts.filter(item =>
      item.text.toLowerCase().includes('setting') ||
      item.text.toLowerCase().includes('admin') ||
      item.text.toLowerCase().includes('module') ||
      item.text.toLowerCase().includes('config')
    );
    console.log('Settings-related links:', settingsLinks);

    // Try clicking on different menu items to explore
    console.log('\n🖱️  Exploring menu items...');

    // Get page HTML for analysis
    const html = await page.content();
    require('fs').writeFileSync('/tmp/boost-space-dashboard.html', html);
    console.log('📝 HTML saved to /tmp/boost-space-dashboard.html');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/tmp/boost-space-explore-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Exploration complete');
  }
}

main().catch(console.error);
