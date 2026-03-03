#!/usr/bin/env node
/**
 * Export WhatsApp Catalogue Cards as 1080x1080 PNGs
 *
 * Usage: node assets/export-catalogue-cards.mjs
 * Output: assets/whatsapp-catalogue-starter.png
 *         assets/whatsapp-catalogue-pro.png
 *         assets/whatsapp-catalogue-team.png
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTML_PATH = path.join(__dirname, 'whatsapp-catalogue-cards.html');
const OUTPUT_DIR = __dirname;

const PLANS = ['starter', 'pro', 'team'];

async function exportCards() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set viewport large enough to render the 1080px cards
  await page.setViewport({ width: 1200, height: 4000, deviceScaleFactor: 1 });

  const fileUrl = `file://${HTML_PATH}`;
  console.log(`Loading ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000)); // Extra wait for font rendering

  for (const plan of PLANS) {
    const selector = `.product-card.${plan}`;
    const element = await page.$(selector);

    if (!element) {
      console.error(`Could not find element: ${selector}`);
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `whatsapp-catalogue-${plan}.png`);

    await element.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false,
    });

    // Verify dimensions
    const { width, height } = await element.boundingBox();
    console.log(`Exported ${plan}: ${outputPath} (${width}x${height})`);
  }

  await browser.close();
  console.log('\nDone! All cards exported to assets/ directory.');
  console.log('WhatsApp Business catalogue recommended image size: 1080x1080px');
}

exportCards().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
