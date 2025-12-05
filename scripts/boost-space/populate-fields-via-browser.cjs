#!/usr/bin/env node

/**
 * Populate Boost.space Custom Fields via Browser Automation
 * 
 * Since API doesn't save custom fields, we use browser automation
 * to fill them in via the UI (which works).
 * 
 * Usage:
 *   node scripts/boost-space/populate-fields-via-browser.cjs
 */

const { chromium } = require('playwright');

const CONFIG = {
  boostSpace: {
    baseUrl: 'https://superseller.boost.space',
    username: process.env.BOOST_SPACE_USERNAME || 'your-email@example.com',
    password: process.env.BOOST_SPACE_PASSWORD || 'your-password',
    recordUrl: 'https://superseller.boost.space/list/note/45/257' // Space 45, Record 257
  },
  fields: {
    // Sample data - replace with actual workflow data
    workflow_name: 'INT-LEAD-001',
    category: 'Internal',
    status: 'Active',
    // ... add all 86 fields here
  }
};

async function populateFieldsViaBrowser() {
  console.log('🌐 Starting browser automation to populate custom fields...\n');
  
  const browser = await chromium.launch({ headless: false }); // Set to true for headless
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login
    console.log('📝 Logging in to Boost.space...');
    await page.goto('https://superseller.boost.space/login');
    await page.waitForTimeout(2000);
    
    // Fill login form (adjust selectors based on actual Boost.space login page)
    await page.fill('input[type="email"]', CONFIG.boostSpace.username);
    await page.fill('input[type="password"]', CONFIG.boostSpace.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Navigate to record
    console.log('📄 Navigating to record...');
    await page.goto(CONFIG.boostSpace.recordUrl);
    await page.waitForTimeout(3000);
    
    // Look for edit button or click on record to edit
    console.log('✏️  Opening edit mode...');
    const editButton = await page.locator('button:has-text("Edit"), button[aria-label*="Edit"], .edit-button').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Fill custom fields
    console.log('📝 Filling custom fields...');
    let filledCount = 0;
    
    for (const [fieldName, value] of Object.entries(CONFIG.fields)) {
      if (value === null || value === undefined || value === '') continue;
      
      try {
        // Try multiple selector strategies
        const selectors = [
          `input[name="${fieldName}"]`,
          `textarea[name="${fieldName}"]`,
          `[data-field="${fieldName}"]`,
          `[data-custom-field="${fieldName}"]`,
          `label:has-text("${fieldName}") + input`,
          `label:has-text("${fieldName}") + textarea`
        ];
        
        let filled = false;
        for (const selector of selectors) {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 1000 })) {
            await field.fill(String(value));
            filled = true;
            filledCount++;
            console.log(`   ✅ ${fieldName}: ${value}`);
            break;
          }
        }
        
        if (!filled) {
          console.log(`   ⚠️  Field not found: ${fieldName}`);
        }
      } catch (error) {
        console.log(`   ❌ Error filling ${fieldName}: ${error.message}`);
      }
    }
    
    // Save changes
    console.log('\n💾 Saving changes...');
    const saveButton = await page.locator('button:has-text("Save"), button[aria-label*="Save"], .save-button').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    console.log(`\n✅ Complete! Filled ${filledCount} fields via browser automation.`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  populateFieldsViaBrowser()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { populateFieldsViaBrowser };
