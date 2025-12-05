#!/usr/bin/env node

/**
 * Populate Boost.space Custom Fields via Browser Automation
 * 
 * Integrates with analyze-and-populate-lead-workflow.cjs to:
 * 1. Analyze workflow data
 * 2. Navigate to Boost.space record
 * 3. Fill all 86 custom fields via browser UI
 * 4. Save the record
 * 
 * Usage:
 *   node scripts/boost-space/populate-via-browser-integrated.cjs
 * 
 * Requirements:
 *   npm install playwright
 */

const { chromium } = require('playwright');
const axios = require('axios');

// Import data mapping from analyze script
const CONFIG = {
  boostSpace: {
    baseUrl: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    username: 'shai',
    password: 'e1UVP5lV',
    spaceId: 45,
    recordId: 257, // INT-LEAD-001 record
    fieldGroupId: 475
  },
  n8n: {
    url: 'http://173.254.201.134:5678',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzI3OTI1MjAsImV4cCI6MTczNTM4NDUyMCwidXNlcklkIjoiMSIsInNjb3BlIjoiZGVmYXVsdCJ9.7Q8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E',
    workflowId: 'x7GwugG3fzdpuC4f'
  }
};

/**
 * Get workflow data - calls the analyze script
 */
async function getWorkflowData() {
  // Import functions from analyze script
  const { analyzeCodebase, getN8nWorkflow, getWorkflowStats, mapToBoostSpace } = require('./analyze-and-populate-lead-workflow.cjs');
  
  // Run the full analysis
  console.log('📊 Analyzing workflow data...');
  const codebaseInfo = analyzeCodebase();
  const n8nWorkflow = await getN8nWorkflow();
  const stats = await getWorkflowStats(codebaseInfo.workflowId);
  
  // Map to Boost.space format
  const data = mapToBoostSpace(codebaseInfo, n8nWorkflow, stats);
  
  return data;
}

/**
 * Get field name to label mapping
 */
async function getFieldLabels() {
  const api = axios.create({
    baseURL: CONFIG.boostSpace.baseUrl,
    headers: {
      'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    const response = await api.get(`/api/custom-field/${CONFIG.boostSpace.fieldGroupId}`);
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
 * Fill custom fields via browser
 */
async function populateFieldsViaBrowser(workflowData, fieldLabels) {
  console.log('🌐 Starting browser automation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // First, log in
    console.log('🔐 Logging in to Boost.space...');
    await page.goto(`${CONFIG.boostSpace.baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Find and fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")').first();
    
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill(CONFIG.boostSpace.username);
      await page.waitForTimeout(500);
    }
    
    if (await passwordInput.isVisible({ timeout: 5000 })) {
      await passwordInput.fill(CONFIG.boostSpace.password);
      await page.waitForTimeout(500);
    }
    
    if (await submitButton.isVisible({ timeout: 5000 })) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      console.log('   ✅ Logged in');
    } else {
      console.log('   ⚠️  Could not find login button - may already be logged in');
    }
    
    // Navigate to record
    const recordUrl = `${CONFIG.boostSpace.baseUrl}/list/note/${CONFIG.boostSpace.spaceId}/${CONFIG.boostSpace.recordId}`;
    console.log(`📄 Navigating to: ${recordUrl}`);
    await page.goto(recordUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for the record content or edit button
    console.log('🔍 Looking for record content...');
    
    // Try to find and click edit button
    const editSelectors = [
      'button:has-text("Edit")',
      'button[aria-label*="Edit"]',
      '[data-action="edit"]',
      'button:has-text("✏️")',
      '.edit-button',
      'button[title*="Edit"]'
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
        // Continue
      }
    }
    
    // If no edit button, try double-clicking on title or main content
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
        console.log('   ⚠️  Could not enter edit mode - will try to fill fields directly');
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
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      try {
        // Multiple selector strategies
        const selectors = [
          // By label text (most common)
          `label:has-text("${fieldLabel}") + input`,
          `label:has-text("${fieldLabel}") + textarea`,
          `label:has-text("${fieldLabel}") + select`,
          // By field name
          `input[name="${fieldName}"]`,
          `textarea[name="${fieldName}"]`,
          `select[name="${fieldName}"]`,
          // By data attributes
          `[data-field="${fieldName}"]`,
          `[data-custom-field="${fieldName}"]`,
          `[data-field-id="${fieldInfo?.id}"]`,
          // By aria-label
          `[aria-label*="${fieldLabel}"]`,
          `[aria-label*="${fieldName}"]`
        ];
        
        let filled = false;
        for (const selector of selectors) {
          try {
            const field = page.locator(selector).first();
            if (await field.isVisible({ timeout: 1000 })) {
              await field.clear();
              await field.fill(stringValue);
              await page.waitForTimeout(50);
              filled = true;
              filledCount++;
              console.log(`   ✅ ${fieldName}: ${stringValue.substring(0, 40)}${stringValue.length > 40 ? '...' : ''}`);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
        
        if (!filled) {
          console.log(`   ⚠️  Field not found: ${fieldName}`);
        }
      } catch (error) {
        console.log(`   ❌ Error filling ${fieldName}: ${error.message}`);
      }
    }
    
    // Save
    console.log('\n💾 Saving changes...');
    const saveSelectors = [
      'button:has-text("Save")',
      'button[aria-label*="Save"]',
      '.save-button',
      '[data-action="save"]',
      'button[type="submit"]'
    ];
    
    for (const selector of saveSelectors) {
      try {
        const saveBtn = page.locator(selector).first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          console.log('   ✅ Changes saved');
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    console.log(`\n✅ Complete! Filled ${filledCount} fields, skipped ${skippedCount} empty fields.`);
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Boost.space Browser Automation - Custom Fields Population\n');
  console.log('='.repeat(60));
  
  // Get field labels
  console.log('📋 Getting field labels...');
  const fieldLabels = await getFieldLabels();
  console.log(`✅ Found ${Object.keys(fieldLabels).length} field labels\n`);
  
  // Get workflow data (simplified - should import from analyze script)
  const workflowData = await getWorkflowData();
  
  // Populate via browser
  await populateFieldsViaBrowser(workflowData, fieldLabels);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { populateFieldsViaBrowser, getFieldLabels };
