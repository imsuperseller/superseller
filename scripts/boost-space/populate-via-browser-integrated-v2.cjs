#!/usr/bin/env node

/**
 * Populate Boost.space Custom Fields via Browser Automation (v2)
 * 
 * This version:
 * 1. Logs in to Boost.space
 * 2. Navigates to the list page
 * 3. Finds the record by searching for INT-LEAD-001
 * 4. Opens the record detail view
 * 5. Opens the Fields section
 * 6. Fills all custom fields using JavaScript evaluation
 * 7. Saves the record
 * 
 * Usage:
 *   node scripts/boost-space/populate-via-browser-integrated-v2.cjs
 */

const { chromium } = require('playwright');
const axios = require('axios');

const CONFIG = {
  boostSpace: {
    baseUrl: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    username: 'shai',
    password: 'e1UVP5lV',
    module: 'product', // Using Products native module - workflows are products!
    spaceId: 39, // Space 39: Products (MCP Servers & Business References)
    recordId: null, // Will find/create record in Products space
    recordTitle: 'INT-LEAD-001', // Record title to search for
    fieldGroupId: null // Field group will be created for Products module
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
  const { analyzeCodebase, getN8nWorkflow, getWorkflowStats, mapToBoostSpace } = require('./analyze-and-populate-lead-workflow.cjs');
  
  console.log('📊 Analyzing workflow data...');
  const codebaseInfo = analyzeCodebase();
  const n8nWorkflow = await getN8nWorkflow().catch(() => null);
  const stats = await getWorkflowStats(codebaseInfo.workflowId).catch(() => null);
  
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
 * Fill custom fields via browser using JavaScript evaluation
 */
async function populateFieldsViaBrowser(workflowData, fieldLabels) {
  console.log('🌐 Starting browser automation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Store cookies to maintain session
    storageState: undefined // Will be saved after login
  });
  const page = await context.newPage();
  
  try {
    // Step 1: Log in (always attempt login)
    console.log('🔐 Step 1: Logging in...');
    // Try both possible login URLs
    const loginUrls = [
      `${CONFIG.boostSpace.baseUrl}/auth/login`,
      `${CONFIG.boostSpace.baseUrl}/login`
    ];
    
    let loginPageLoaded = false;
    for (const loginUrl of loginUrls) {
      try {
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        if (currentUrl.includes('/login') || currentUrl.includes('/auth/login')) {
          loginPageLoaded = true;
          console.log(`   ✅ Loaded login page: ${loginUrl}`);
          break;
        }
      } catch (e) {
        console.log(`   ⚠️  Failed to load ${loginUrl}, trying next...`);
      }
    }
    
    if (!loginPageLoaded) {
      throw new Error('Could not load login page');
    }
    
    // Always fill login form (even if we think we're logged in)
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill(CONFIG.boostSpace.username);
      await page.waitForTimeout(500);
      console.log('   ✅ Filled username');
    }
    
    if (await passwordInput.isVisible({ timeout: 5000 })) {
      await passwordInput.fill(CONFIG.boostSpace.password);
      await page.waitForTimeout(500);
      console.log('   ✅ Filled password');
    }
    
    // Find and click submit button - try multiple strategies
    console.log('   🔍 Looking for submit button...');
    
    // Strategy 1: Standard submit button
    let submitBtn = page.locator('button[type="submit"]').first();
    let submitClicked = false;
    
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   🔘 Clicking submit button...');
      await submitBtn.click();
      submitClicked = true;
    } else {
      // Strategy 2: Look for button with "Login" or "Sign in" text
      const loginBtn = page.locator('button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")').first();
      if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   🔘 Clicking login button...');
        await loginBtn.click();
        submitClicked = true;
      } else {
        // Strategy 3: Try pressing Enter on password field
        console.log('   🔘 Pressing Enter on password field...');
        await passwordInput.press('Enter');
        submitClicked = true;
      }
    }
    
    if (submitClicked) {
      // Wait for navigation or timeout
      console.log('   ⏳ Waiting for login to complete...');
      await page.waitForTimeout(5000);
      
      // Check if URL changed
      const newUrl = page.url();
      console.log(`   📍 Current URL: ${newUrl}`);
      
      if (!newUrl.includes('/login') && !newUrl.includes('/auth/login')) {
        console.log(`   ✅ Logged in successfully - redirected to: ${newUrl}`);
      } else {
        // Check for error messages or CAPTCHA
        const pageText = await page.textContent('body').catch(() => '');
        const hasError = pageText.includes('error') || pageText.includes('Error') || pageText.includes('invalid') || pageText.includes('incorrect');
        const hasCaptcha = pageText.includes('captcha') || pageText.includes('CAPTCHA') || await page.locator('[class*="captcha"], [id*="captcha"]').count() > 0;
        
        if (hasCaptcha) {
          console.log('   ⚠️  CAPTCHA detected - manual intervention needed');
          console.log('   ⏸️  Pausing for 30 seconds to allow manual CAPTCHA completion...');
          await page.waitForTimeout(30000);
          const finalUrl = page.url();
          if (!finalUrl.includes('/login') && !finalUrl.includes('/auth/login')) {
            console.log(`   ✅ Login completed after CAPTCHA - redirected to: ${finalUrl}`);
          } else {
            throw new Error('Login failed - CAPTCHA not completed');
          }
        } else if (hasError) {
          console.log('   ❌ Login error detected on page');
          await page.screenshot({ path: 'login-failed.png', fullPage: true });
          throw new Error('Login failed - error message detected');
        } else {
          console.log('   ⚠️  Still on login page - credentials may be incorrect or form submission failed');
          await page.screenshot({ path: 'login-failed.png', fullPage: true });
          throw new Error('Login failed - still on login page');
        }
      }
    } else {
      // Maybe already logged in - check URL
      const currentUrl = page.url();
      if (!currentUrl.includes('/login') && !currentUrl.includes('/auth/login')) {
        console.log('   ✅ Already logged in');
      } else {
        console.log('   ❌ Could not find any way to submit login form');
        await page.screenshot({ path: 'login-form.png', fullPage: true });
        throw new Error('Could not find login submit button');
      }
    }
    
    // Step 2: Navigate to list page
    console.log('\n📋 Step 2: Navigating to list page...');
    const listUrl = `${CONFIG.boostSpace.baseUrl}/list/note/${CONFIG.boostSpace.spaceId}`;
    
    // Verify we're logged in before navigating
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/auth/login')) {
      throw new Error('Still on login page - login failed');
    }
    
    try {
      await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // Check if we got redirected to login
      const newUrl = page.url();
      if (newUrl.includes('/login') || newUrl.includes('/auth/login')) {
        throw new Error('Redirected to login - session expired');
      }
      
      console.log('   ✅ List page loaded');
    } catch (error) {
      if (error.message.includes('Timeout')) {
        // Try with shorter timeout and different wait strategy
        await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        console.log('   ✅ List page loaded (with shorter timeout)');
      } else {
        throw error;
      }
    }
    
    // Step 3: Find and click the record to open detail view
    console.log('\n🔍 Step 3: Finding and opening INT-LEAD-001 record detail view...');
    
    // Wait for list to fully render
    await page.waitForTimeout(2000);
    
    // Try multiple strategies to find and click the record
    const recordOpened = await page.evaluate(({ recordId, searchText }) => {
      // Strategy 1: Look for table rows or list items containing the text
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], [class*="row"], [class*="item"]'));
      const matchingRow = rows.find(row => {
        const text = row.textContent || '';
        return text.includes(searchText);
      });
      
      if (matchingRow) {
        // Find clickable element within the row (title, link, or the row itself)
        const clickable = matchingRow.querySelector('a, button, [onclick], [role="button"]') || 
                         matchingRow.querySelector('[class*="title"], [class*="name"]') ||
                         matchingRow;
        if (clickable) {
          clickable.click();
          return { opened: true, method: 'row-click' };
        }
      }
      
      // Strategy 2: Look for any clickable element with the text
      const allClickable = Array.from(document.querySelectorAll('a, button, [onclick], [role="button"], [class*="clickable"], [class*="link"]'));
      const matchingClickable = allClickable.find(el => {
        const text = el.textContent || '';
        return text.includes(searchText) && text.length < 200; // Avoid matching entire page
      });
      
      if (matchingClickable) {
        matchingClickable.click();
        return { opened: true, method: 'clickable-element' };
      }
      
      // Strategy 3: Look for data attributes
      const byId = document.querySelector(`[data-record-id="${recordId}"], [data-id="${recordId}"]`);
      if (byId) {
        const clickable = byId.querySelector('a, button') || byId;
        clickable.click();
        return { opened: true, method: 'data-attribute' };
      }
      
      return { opened: false };
    }, { recordId: CONFIG.boostSpace.recordId.toString(), searchText: 'INT-LEAD-001' });
    
    // IMPORTANT: /apps/note/257 returns "Record does not exist" error
    // Need to access via list view click - this is the most reliable method
    console.log('   📍 Navigating to record via list view (most reliable method)...');
    
    // Navigate to list view and find the record
    const module = CONFIG.boostSpace.module || 'project';
    const listViewUrl = `${CONFIG.boostSpace.baseUrl}/list/${module}/${CONFIG.boostSpace.spaceId}`;
    await page.goto(listViewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Find and click the record
    let recordUrl = null;
    const recordClicked = await page.evaluate(({ recordTitle }) => {
      const rows = Array.from(document.querySelectorAll('tbody tr, table tr, [role="row"]'));
      const recordRow = rows.find(row => {
        const text = row.textContent || '';
        return text.includes(recordTitle) && text.length > 20;
      });
      
      if (recordRow) {
        const firstCell = recordRow.querySelector('td, [role="cell"]');
        const link = firstCell?.querySelector('a, button') || firstCell;
        if (link) {
          link.click();
          return { clicked: true };
        }
      }
      return { clicked: false, totalRows: rows.length };
    }, { recordTitle: 'INT-LEAD-001' });
    
    if (recordClicked.clicked) {
      await page.waitForTimeout(3000);
      recordUrl = page.url();
      const hasError = await page.evaluate(() => document.body.innerText.includes('Record does not exist'));
      if (hasError) {
        console.log('   ⚠️  Clicked record but got error page');
        recordUrl = null;
      } else {
        console.log(`   ✅ Navigated via list view click to: ${recordUrl}`);
      }
    } else {
      console.log(`   ⚠️  Record not found in list (rows: ${recordClicked.totalRows})`);
    }
    
      // Fallback: Try URL patterns if list click failed
      if (!recordUrl && CONFIG.boostSpace.recordId) {
        console.log('   🔄 Trying URL patterns as fallback...');
        const module = CONFIG.boostSpace.module || 'project';
        const possibleUrls = [
          `${CONFIG.boostSpace.baseUrl}/apps/${module}/${CONFIG.boostSpace.spaceId}/${CONFIG.boostSpace.recordId}`, // With space ID
          `${CONFIG.boostSpace.baseUrl}/${module}/${CONFIG.boostSpace.spaceId}/${CONFIG.boostSpace.recordId}`,
          `${CONFIG.boostSpace.baseUrl}/list/${module}/${CONFIG.boostSpace.spaceId}/${CONFIG.boostSpace.recordId}`
        ];
      
      for (const url of possibleUrls) {
        try {
          console.log(`   🔗 Trying: ${url}`);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          const hasError = await page.evaluate(() => document.body.innerText.includes('Record does not exist'));
          
          if (!hasError && !currentUrl.includes('/list/') && !currentUrl.includes('/error/')) {
            recordUrl = currentUrl;
            console.log(`   ✅ Successfully loaded detail view: ${currentUrl}`);
            break;
          }
        } catch (e) {
          console.log(`   ⚠️  Failed: ${e.message}`);
          continue;
        }
      }
    }
    
    if (!recordUrl) {
      throw new Error('Could not navigate to record detail view - record may not be visible in list or URL pattern is incorrect');
    }
    
    // Step 4: Verify we're in detail view and open Fields section
    console.log('\n📝 Step 4: Verifying detail view and opening Fields section...');
    await page.waitForTimeout(2000);
    
    // Try to click "Fields" button to open custom fields section
    try {
      const fieldsButton = page.getByText('Fields', { exact: false }).first();
      if (await fieldsButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('   🔘 Clicking "Fields" button to open custom fields...');
        await fieldsButton.click();
        await page.waitForTimeout(3000); // Wait for fields to load
        console.log('   ✅ Fields section opened');
      }
    } catch (e) {
      console.log('   ⚠️  Could not find Fields button, continuing...');
    }
    
    // According to Boost.space docs, custom fields appear in detail view alongside standard fields
    // They should be visible without needing to click anything special
    const detailViewInfo = await page.evaluate(() => {
      const url = window.location.href;
      
      // Check if we're actually logged in (not on login page)
      const isLoggedIn = !url.includes('/login') && !url.includes('/auth/login');
      
      // Check if we're in a detail view using correct URL pattern
      // Pattern: /note/space/space-id/record/record-id
      const isDetailView = isLoggedIn && (
        url.match(/\/note\/space\/\d+\/record\/\d+/) || // Correct pattern
        url.includes(`/record/`) ||
        document.querySelector('[class*="detail"], [class*="Detail"], [class*="record-detail"]')
      );
      
      // Look for custom field indicators
      const hasCustomFields = document.querySelector('[class*="custom-field"], [class*="CustomField"], [data-custom-field]') ||
                             Array.from(document.querySelectorAll('input, textarea, select')).some(el => {
                               const label = el.closest('label, div, section')?.textContent || '';
                               return label.length > 0 && !['Name', 'Status', 'Note', 'ID'].some(standard => label.includes(standard));
                             });
      
      // Count visible inputs (custom fields should be among them)
      const visibleInputs = Array.from(document.querySelectorAll('input, textarea, select')).filter(i => i.offsetParent !== null);
      
      return {
        isLoggedIn,
        isDetailView,
        hasCustomFields: !!hasCustomFields,
        visibleInputCount: visibleInputs.length,
        url: url
      };
    });
    
    console.log(`   ℹ️  Logged in: ${detailViewInfo.isLoggedIn ? 'Yes' : 'No'}`);
    
    console.log(`   ℹ️  Detail view: ${detailViewInfo.isDetailView ? 'Yes' : 'No'}`);
    console.log(`   ℹ️  Custom fields detected: ${detailViewInfo.hasCustomFields ? 'Yes' : 'No'}`);
    console.log(`   ℹ️  Visible inputs: ${detailViewInfo.visibleInputCount}`);
    console.log(`   ℹ️  Current URL: ${detailViewInfo.url}`);
    
    // If not logged in, we need to log in first
    if (!detailViewInfo.isLoggedIn) {
      console.log('   ❌ Not logged in - cannot proceed');
      throw new Error('Login failed or session expired');
    }
    
      // If not in detail view, navigate via list view click (more reliable)
      if (!detailViewInfo.isDetailView) {
        console.log('   ⚠️  Not in detail view, navigating via list view...');
        const module = CONFIG.boostSpace.module || 'project';
        const listUrl = `${CONFIG.boostSpace.baseUrl}/list/${module}/${CONFIG.boostSpace.spaceId}`;
        await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Find and click the record
        const clicked = await page.evaluate(({ recordTitle }) => {
          const rows = Array.from(document.querySelectorAll('tbody tr, table tr'));
          const recordRow = rows.find(row => row.textContent?.includes(recordTitle));
          if (recordRow) {
            const firstCell = recordRow.querySelector('td');
            const link = firstCell?.querySelector('a, button') || firstCell;
            if (link) {
              link.click();
              return true;
            }
          }
          return false;
        }, { recordTitle: CONFIG.boostSpace.recordTitle || 'INT-LEAD-001' });
      
      if (clicked) {
        await page.waitForTimeout(3000);
        const newUrl = page.url();
        console.log(`   ✅ Navigated via list click to: ${newUrl}`);
      }
    }
    
    // Step 5: Fill custom fields using JavaScript evaluation
    console.log('\n📝 Step 5: Filling custom fields...');
    await page.waitForTimeout(1000);
    
    const fillResult = await page.evaluate(({ data, labels }) => {
      const results = { filled: 0, skipped: 0, notFound: [], errors: [] };
      
      for (const [fieldName, value] of Object.entries(data)) {
        if (value === null || value === undefined || value === '') {
          results.skipped++;
          continue;
        }
        
        const fieldInfo = labels[fieldName];
        const fieldLabel = fieldInfo?.label || fieldName;
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        try {
          let filled = false;
          
          // Strategy 1: Find by label text (most reliable for custom fields)
          const allLabels = Array.from(document.querySelectorAll('label'));
          const matchingLabel = allLabels.find(l => {
            const labelText = l.textContent?.trim().toLowerCase();
            const searchTerms = [fieldLabel.toLowerCase(), fieldName.toLowerCase()];
            return searchTerms.some(term => labelText === term || labelText.includes(term));
          });
          
          if (matchingLabel) {
            // Try multiple ways to get the associated input
            let input = matchingLabel.control; // Standard HTML label.control
            if (!input && matchingLabel.getAttribute('for')) {
              input = document.getElementById(matchingLabel.getAttribute('for'));
            }
            if (!input) {
              input = matchingLabel.querySelector('input, textarea, select');
            }
            // If still no input, look for input near the label (next sibling or parent)
            if (!input) {
              const nextSibling = matchingLabel.nextElementSibling;
              if (nextSibling) {
                input = nextSibling.querySelector('input, textarea, select') || 
                       (['INPUT', 'TEXTAREA', 'SELECT'].includes(nextSibling.tagName) ? nextSibling : null);
              }
            }
            if (!input) {
              const parent = matchingLabel.parentElement;
              if (parent) {
                input = parent.querySelector('input, textarea, select');
              }
            }
            
            if (input && input.offsetParent !== null && !input.disabled && !input.readOnly) {
              input.focus();
              input.value = stringValue;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
              filled = true;
              results.filled++;
            }
          }
          
          // Strategy 2: Find by name attribute
          if (!filled) {
            const byName = document.querySelector(`input[name*="${fieldName}"], textarea[name*="${fieldName}"], select[name*="${fieldName}"]`);
            if (byName && byName.offsetParent !== null) {
              byName.focus();
              byName.value = stringValue;
              byName.dispatchEvent(new Event('input', { bubbles: true }));
              byName.dispatchEvent(new Event('change', { bubbles: true }));
              filled = true;
              results.filled++;
            }
          }
          
          // Strategy 3: Find by data attributes
          if (!filled) {
            const byData = document.querySelector(`[data-field="${fieldName}"], [data-custom-field="${fieldName}"], [data-field-id="${fieldInfo?.id}"]`);
            if (byData) {
              const input = byData.querySelector('input, textarea, select') || (byData.tagName === 'INPUT' || byData.tagName === 'TEXTAREA' || byData.tagName === 'SELECT' ? byData : null);
              if (input && input.offsetParent !== null) {
                input.focus();
                input.value = stringValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                filled = true;
                results.filled++;
              }
            }
          }
          
          // Strategy 4: Find by aria-label
          if (!filled) {
            const byAria = Array.from(document.querySelectorAll('input, textarea, select')).find(el => {
              const ariaLabel = el.getAttribute('aria-label')?.toLowerCase();
              return ariaLabel?.includes(fieldLabel.toLowerCase()) || ariaLabel?.includes(fieldName.toLowerCase());
            });
            if (byAria && byAria.offsetParent !== null) {
              byAria.focus();
              byAria.value = stringValue;
              byAria.dispatchEvent(new Event('input', { bubbles: true }));
              byAria.dispatchEvent(new Event('change', { bubbles: true }));
              filled = true;
              results.filled++;
            }
          }
          
          // Strategy 5: Find by placeholder
          if (!filled) {
            const byPlaceholder = Array.from(document.querySelectorAll('input, textarea')).find(el => {
              const placeholder = el.placeholder?.toLowerCase();
              return placeholder?.includes(fieldLabel.toLowerCase()) || placeholder?.includes(fieldName.toLowerCase());
            });
            if (byPlaceholder && byPlaceholder.offsetParent !== null) {
              byPlaceholder.focus();
              byPlaceholder.value = stringValue;
              byPlaceholder.dispatchEvent(new Event('input', { bubbles: true }));
              byPlaceholder.dispatchEvent(new Event('change', { bubbles: true }));
              filled = true;
              results.filled++;
            }
          }
          
          if (!filled) {
            results.notFound.push(fieldName);
          }
        } catch (error) {
          results.errors.push({ field: fieldName, error: error.message });
        }
      }
      
      return results;
    }, { data: workflowData, labels: fieldLabels });
    
    console.log(`   ✅ Filled ${fillResult.filled} fields`);
    console.log(`   ⏭️  Skipped ${fillResult.skipped} empty fields`);
    if (fillResult.notFound.length > 0) {
      console.log(`   ⚠️  ${fillResult.notFound.length} fields not found: ${fillResult.notFound.slice(0, 5).join(', ')}${fillResult.notFound.length > 5 ? '...' : ''}`);
    }
    if (fillResult.errors.length > 0) {
      console.log(`   ❌ ${fillResult.errors.length} errors occurred`);
    }
    
    // Step 6: Save changes
    console.log('\n💾 Step 6: Saving changes...');
    await page.waitForTimeout(1000);
    
    const saved = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(b => {
        const text = b.textContent?.toLowerCase() || '';
        return text.includes('save') || b.getAttribute('aria-label')?.toLowerCase().includes('save');
      });
      
      if (saveButtons.length > 0) {
        saveButtons[0].click();
        return { saved: true };
      }
      
      // Try auto-save (some forms save automatically)
      return { saved: false, autoSave: true };
    });
    
    if (saved.saved) {
      console.log('   ✅ Changes saved');
      await page.waitForTimeout(2000);
    } else {
      console.log('   ℹ️  Auto-save may be enabled or save button not found');
    }
    
    console.log(`\n✅ Complete! Filled ${fillResult.filled} fields, skipped ${fillResult.skipped} empty fields.`);
    console.log('\n⏸️  Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
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
  console.log('🚀 Boost.space Browser Automation v2 - Custom Fields Population\n');
  console.log('='.repeat(60));
  
  console.log('📋 Getting field labels...');
  const fieldLabels = await getFieldLabels();
  console.log(`✅ Found ${Object.keys(fieldLabels).length} field labels\n`);
  
  const workflowData = await getWorkflowData();
  
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
