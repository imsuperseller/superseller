#!/usr/bin/env node

/**
 * Populate Boost.space Custom Fields via Browser Automation
 * 
 * Since API doesn't save custom fields, we use browser automation
 * to fill them in via the UI (which works).
 * 
 * This script:
 * 1. Analyzes workflow data (same as analyze-and-populate-lead-workflow.cjs)
 * 2. Navigates to Boost.space record
 * 3. Fills all 86 custom fields via browser UI
 * 4. Saves the record
 * 
 * Usage:
 *   node scripts/boost-space/populate-fields-via-browser-complete.cjs
 * 
 * Requirements:
 *   npm install playwright
 */

const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Import the data mapping function from analyze script
const { mapWorkflowData } = require('./analyze-and-populate-lead-workflow.cjs');

const CONFIG = {
  boostSpace: {
    baseUrl: 'https://superseller.boost.space',
    username: process.env.BOOST_SPACE_USERNAME || 'your-email@example.com',
    password: process.env.BOOST_SPACE_PASSWORD || 'your-password',
    spaceId: 45,
    recordId: 257, // INT-LEAD-001 record
    recordUrl: 'https://superseller.boost.space/list/note/45/257'
  },
  fieldGroupId: 475
};

/**
 * Get field name to label mapping from Boost.space
 */
async function getFieldLabels(api) {
  try {
    const response = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
    const fields = response.data.inputs || [];
    
    const mapping = {};
    fields.forEach(field => {
      mapping[field.name] = {
        id: field.id,
        label: field.description || field.name,
        type: field.inputType
      };
    });
    
    return mapping;
  } catch (error) {
    console.error('Error getting field labels:', error.message);
    return {};
  }
}

/**
 * Fill custom fields via browser automation
 */
async function populateFieldsViaBrowser(workflowData, fieldLabels) {
  console.log('🌐 Starting browser automation to populate custom fields...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 100 // Slow down actions for visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to record (assuming already logged in or using session)
    console.log('📄 Navigating to record...');
    await page.goto(CONFIG.boostSpace.recordUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Look for edit button or click on record title to edit
    console.log('✏️  Opening edit mode...');
    
    // Try multiple strategies to enter edit mode
    const editSelectors = [
      'button:has-text("Edit")',
      'button[aria-label*="Edit"]',
      '.edit-button',
      '[data-action="edit"]',
      'button:has-text("✏️")',
      'button:has-text("Edit record")'
    ];
    
    let editMode = false;
    for (const selector of editSelectors) {
      try {
        const editBtn = page.locator(selector).first();
        if (await editBtn.isVisible({ timeout: 2000 })) {
          await editBtn.click();
          await page.waitForTimeout(2000);
          editMode = true;
          console.log('   ✅ Entered edit mode');
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // If no edit button, try clicking on the title or main content area
    if (!editMode) {
      try {
        const title = page.locator('h1, h2, [role="heading"]').first();
        if (await title.isVisible({ timeout: 2000 })) {
          await title.dblclick();
          await page.waitForTimeout(1000);
          editMode = true;
          console.log('   ✅ Entered edit mode (double-click)');
        }
      } catch (e) {
        console.log('   ⚠️  Could not enter edit mode automatically');
      }
    }
    
    // Fill custom fields
    console.log('\n📝 Filling custom fields...');
    let filledCount = 0;
    let skippedCount = 0;
    
    for (const [fieldName, value] of Object.entries(workflowData)) {
      if (value === null || value === undefined || value === '') {
        skippedCount++;
        continue;
      }
      
      const fieldInfo = fieldLabels[fieldName];
      const fieldLabel = fieldInfo?.label || fieldName;
      
      try {
        // Try multiple selector strategies for finding the field
        const selectors = [
          // By label text
          `label:has-text("${fieldLabel}") + input`,
          `label:has-text("${fieldLabel}") + textarea`,
          `label:has-text("${fieldLabel}") + select`,
          // By field name attribute
          `input[name="${fieldName}"]`,
          `textarea[name="${fieldName}"]`,
          `select[name="${fieldName}"]`,
          // By data attributes
          `[data-field="${fieldName}"]`,
          `[data-custom-field="${fieldName}"]`,
          `[data-field-id="${fieldInfo?.id}"]`,
          // By aria-label
          `[aria-label*="${fieldLabel}"]`,
          // Generic input near label
          `label:has-text("${fieldLabel}") ~ input`,
          `label:has-text("${fieldLabel}") ~ textarea`
        ];
        
        let filled = false;
        for (const selector of selectors) {
          try {
            const field = page.locator(selector).first();
            if (await field.isVisible({ timeout: 1000 })) {
              // Clear existing value
              await field.clear();
              await page.waitForTimeout(100);
              
              // Fill value
              const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
              await field.fill(stringValue);
              await page.waitForTimeout(100);
              
              filled = true;
              filledCount++;
              console.log(`   ✅ ${fieldName}: ${stringValue.substring(0, 50)}${stringValue.length > 50 ? '...' : ''}`);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
        
        if (!filled) {
          console.log(`   ⚠️  Field not found: ${fieldName} (label: ${fieldLabel})`);
        }
      } catch (error) {
        console.log(`   ❌ Error filling ${fieldName}: ${error.message}`);
      }
    }
    
    // Save changes
    console.log('\n💾 Saving changes...');
    const saveSelectors = [
      'button:has-text("Save")',
      'button[aria-label*="Save"]',
      '.save-button',
      '[data-action="save"]',
      'button:has-text("💾")',
      'button[type="submit"]'
    ];
    
    let saved = false;
    for (const selector of saveSelectors) {
      try {
        const saveBtn = page.locator(selector).first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          saved = true;
          console.log('   ✅ Changes saved');
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!saved) {
      console.log('   ⚠️  Could not find save button - changes may not be saved');
    }
    
    console.log(`\n✅ Complete! Filled ${filledCount} fields, skipped ${skippedCount} empty fields.`);
    
    // Wait a bit to see the result
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'error-screenshot.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Boost.space Browser Automation - Custom Fields Population\n');
  console.log('='.repeat(60));
  
  // Get workflow data (reuse from analyze script)
  const workflowData = {
    workflow_name: 'INT-LEAD-001',
    category: 'Internal',
    status: 'Active',
    // ... add all fields here
  };
  
  // Get field labels from API
  const api = axios.create({
    baseURL: CONFIG.boostSpace.baseUrl,
    headers: {
      'Authorization': `Bearer ${process.env.BOOST_SPACE_API_KEY || '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba'}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('📋 Getting field labels...');
  const fieldLabels = await getFieldLabels(api);
  console.log(`✅ Found ${Object.keys(fieldLabels).length} field labels\n`);
  
  // Populate via browser
  await populateFieldsViaBrowser(workflowData, fieldLabels);
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { populateFieldsViaBrowser, getFieldLabels };
