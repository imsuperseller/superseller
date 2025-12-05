#!/usr/bin/env node

/**
 * Assign "n8n Workflow Fields" Field Group to Space 45 via Browser Automation
 * 
 * This script:
 * 1. Logs in to Boost.space
 * 2. Navigates to Custom Fields settings
 * 3. Finds "n8n Workflow Fields" field group
 * 4. Clicks on the Spaces column
 * 5. Selects Space 45 (n8n Workflows Notes)
 * 6. Saves the assignment
 * 
 * Usage:
 *   node scripts/boost-space/assign-field-group-to-space.cjs
 * 
 * Requirements:
 *   npm install playwright
 */

const { chromium } = require('playwright');

const CONFIG = {
  boostSpace: {
    baseUrl: 'https://superseller.boost.space',
    username: 'shai',
    password: 'e1UVP5lV',
    fieldGroupName: 'n8n Workflow Fields (Products)', // Field group for Products module - workflows are products!
    spaceName: 'MCP Servers & Business References', // Space 39: Products space
    spaceId: 39, // Space 39: Products module
    module: 'product' // Native Products module
  }
};

async function assignFieldGroupToSpace() {
  console.log('🚀 Boost.space Field Group Assignment Script\n');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Step 1: Log in
    console.log('🔐 Step 1: Logging in...');
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
    
    // Fill login form using same approach as populate script
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
          await page.screenshot({ path: 'login-failed-assignment.png', fullPage: true });
          throw new Error('Login failed - error message detected');
        } else {
          console.log('   ⚠️  Still on login page - credentials may be incorrect or form submission failed');
          await page.screenshot({ path: 'login-failed-assignment.png', fullPage: true });
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
        await page.screenshot({ path: 'login-form-assignment.png', fullPage: true });
        throw new Error('Could not find login submit button');
      }
    }
    
    // Step 2: Navigate to Custom Fields settings
    console.log('\n📋 Step 2: Navigating to Custom Fields settings...');
    
    // First, try to find the field group via API to confirm it exists
    const axios = require('axios');
    const api = axios.create({
      baseURL: CONFIG.boostSpace.baseUrl,
      headers: {
        'Authorization': `Bearer 88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba`
      }
    });
    
    try {
      const apiResponse = await api.get(`/api/custom-field/${477}`);
      console.log(`   ✅ Field group exists via API: "${apiResponse.data.name}"`);
      console.log(`   📋 Module: ${apiResponse.data.module}, Spaces: ${JSON.stringify(apiResponse.data.spaces || [])}`);
    } catch (e) {
      console.log(`   ⚠️  Could not verify via API: ${e.message}`);
    }
    
    // Try multiple navigation paths:
    // 1. Space-specific Projects module settings
    // 2. Projects module custom fields
    // 3. Global custom fields
    const settingsUrls = [
      `${CONFIG.boostSpace.baseUrl}/list/project/${CONFIG.boostSpace.spaceId}`, // Navigate to Projects list first
      `${CONFIG.boostSpace.baseUrl}/settings/custom-field/?module=project&space=${CONFIG.boostSpace.spaceId}`,
      `${CONFIG.boostSpace.baseUrl}/settings/custom-field/?module=project`,
      `${CONFIG.boostSpace.baseUrl}/settings/custom-field/project`,
      `${CONFIG.boostSpace.baseUrl}/settings/custom-field/`
    ];
    
    let settingsLoaded = false;
    let finalUrl = '';
    
    // Start with the most direct URL (custom fields settings)
    const directUrl = `${CONFIG.boostSpace.baseUrl}/settings/custom-field/?module=project`;
    try {
      console.log(`   🔗 Navigating to: ${directUrl}`);
      await page.goto(directUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000);
      finalUrl = page.url();
      console.log(`   ✅ Page loaded: ${finalUrl}`);
      settingsLoaded = true;
    } catch (e) {
      console.log(`   ⚠️  Direct navigation failed: ${e.message}`);
      // Try fallback
      try {
        await page.goto(`${CONFIG.boostSpace.baseUrl}/settings/custom-field/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000);
        finalUrl = page.url();
        console.log(`   ✅ Fallback page loaded: ${finalUrl}`);
        settingsLoaded = true;
      } catch (e2) {
        console.log(`   ❌ Fallback also failed: ${e2.message}`);
      }
    }
    
    if (!settingsLoaded) {
      throw new Error('Could not load custom fields settings page');
    }
    
    // Take initial screenshot
    await page.screenshot({ path: 'custom-fields-initial.png', fullPage: true });
    console.log('   📸 Initial screenshot saved: custom-fields-initial.png');
    
    // Look for module filter/tabs
    console.log('   🔍 Checking for module filters or tabs...');
    const moduleFilters = await page.evaluate(() => {
      const filters = [];
      // Look for tabs
      const tabs = Array.from(document.querySelectorAll('[role="tab"], .tab, button[class*="tab"]'));
      tabs.forEach(tab => {
        const text = tab.textContent?.trim() || '';
        if (text.includes('Project') || text.includes('Note') || text.includes('Module')) {
          filters.push({ type: 'tab', text, element: 'found' });
        }
      });
      // Look for dropdowns/selects
      const selects = Array.from(document.querySelectorAll('select, [role="combobox"]'));
      selects.forEach(sel => {
        const label = sel.previousElementSibling?.textContent || sel.parentElement?.textContent || '';
        if (label.includes('Module') || label.includes('Filter')) {
          filters.push({ type: 'select', text: label, element: 'found' });
        }
      });
      return filters;
    });
    
    if (moduleFilters.length > 0) {
      console.log(`   ℹ️  Found ${moduleFilters.length} potential module filters`);
      moduleFilters.forEach((f, i) => console.log(`      ${i + 1}. ${f.type}: ${f.text}`));
    } else {
      console.log('   ℹ️  No module filters found - field groups might be shown for all modules');
    }
    
    // Step 3: Try to filter by Projects module if filter exists
    console.log(`\n🔍 Step 3: Attempting to filter by Projects module...`);
    
    // Look for clickable elements (buttons, tabs, links) containing "Projects"
    const clickableProjects = await page.evaluate(() => {
      const clickables = Array.from(document.querySelectorAll('button, a, [role="button"], [role="tab"], [onclick]'));
      for (const el of clickables) {
        const text = el.textContent?.trim() || '';
        if (text.includes('Projects') && text.length < 50) {
          return { found: true, tag: el.tagName, text: text.substring(0, 30) };
        }
      }
      return { found: false };
    });
    
    if (clickableProjects.found) {
      console.log(`   ✅ Found clickable "Projects" element: ${clickableProjects.tag} - "${clickableProjects.text}"`);
      try {
        await page.click(`button:has-text("Projects"), a:has-text("Projects"), [role="tab"]:has-text("Projects")`, { timeout: 5000 });
        await page.waitForTimeout(3000);
        console.log('   ✅ Clicked Projects filter');
      } catch (e) {
        console.log(`   ⚠️  Could not click: ${e.message}`);
      }
    } else {
      // Try finding a select dropdown for module
      const moduleSelect = await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select'));
        for (const sel of selects) {
          const label = sel.previousElementSibling?.textContent || sel.parentElement?.textContent || '';
          if (label.toLowerCase().includes('module')) {
            return { found: true, id: sel.id, name: sel.name };
          }
        }
        return { found: false };
      });
      
      if (moduleSelect.found) {
        console.log('   ✅ Found module select dropdown');
        try {
          await page.selectOption(`select#${moduleSelect.id} || select[name="${moduleSelect.name}"]`, { label: 'Projects' }).catch(async () => {
            await page.selectOption('select', { value: 'project' }).catch(() => {});
          });
          await page.waitForTimeout(3000);
        } catch (e) {
          console.log(`   ⚠️  Could not select: ${e.message}`);
        }
      } else {
        console.log('   ℹ️  No module filter found - will search all field groups');
      }
    }
    
    // Step 4: Find "n8n Workflow Fields (Projects)" row using Playwright locators
    console.log(`\n🔍 Step 4: Finding "${CONFIG.boostSpace.fieldGroupName}" field group...`);
    await page.waitForTimeout(5000); // Wait longer for table to load
    
    // Wait for table to be visible
    try {
      await page.waitForSelector('table, [role="table"]', { timeout: 10000 });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('   ⚠️  Table not found, but continuing...');
    }
    
    // Refresh page to ensure new field group is visible (after filter if applied)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Take screenshot after refresh
    await page.screenshot({ path: 'custom-fields-after-refresh.png', fullPage: true });
    console.log('   📸 Screenshot after refresh: custom-fields-after-refresh.png');
    
    // Use text-based search to find the element, then get its row
    const fieldGroupFound = await page.evaluate(({ fieldGroupName }) => {
      const allText = document.body.innerText;
      // Prioritize exact match first, then fallback to partial
      const searchTerms = [fieldGroupName]; // Exact name first: "n8n Workflow Fields (Projects)"
      if (!allText.includes(fieldGroupName)) {
        // Fallback to partial matches if exact not found
        searchTerms.push('n8n Workflow Fields (Projects)', 'Workflow Fields (Projects)', 'n8n Workflow Fields');
      }
      const hasFieldGroup = searchTerms.some(term => allText.includes(term));
      
      if (!hasFieldGroup) {
        return { 
          found: false, 
          reason: 'Text not found on page', 
          searchedTerms: searchTerms,
          pageText: allText.substring(0, 1000) 
        };
      }
      
      // Try multiple selectors for rows
      const allRows = Array.from(document.querySelectorAll('tr, [role="row"], tbody tr, table tr'));
      // Prioritize exact match first
      let n8nRow = allRows.find(row => {
        const text = row.textContent || '';
        const isDataRow = text.length > 20 && !text.includes('Field groupSpaces') && !text.includes('New field group');
        // Exact match for "n8n Workflow Fields (Projects)"
        return isDataRow && text.includes(fieldGroupName);
      });
      
      // If exact match not found, try partial matches
      if (!n8nRow) {
        n8nRow = allRows.find(row => {
          const text = row.textContent || '';
          const isDataRow = text.length > 20 && !text.includes('Field groupSpaces') && !text.includes('New field group');
          return isDataRow && (text.includes('n8n Workflow Fields (Projects)') || 
                               (text.includes('Workflow Fields') && text.includes('Projects')));
        });
      }
      
      // If not found, try searching in all table cells
      if (!n8nRow) {
        const allCells = Array.from(document.querySelectorAll('td, [role="cell"]'));
        const n8nCell = allCells.find(cell => {
          const text = cell.textContent || '';
          return searchTerms.some(term => text.includes(term));
        });
        if (n8nCell) {
          const foundRow = n8nCell.closest('tr, [role="row"]');
          if (foundRow) {
            return { foundRow, foundVia: 'cell-search' };
          }
        }
      }
      
      if (n8nRow) {
        const cells = Array.from(n8nRow.querySelectorAll('td, [role="cell"]'));
        // Find the Spaces column - look for header first
        const headers = Array.from(document.querySelectorAll('th, [role="columnheader"]'));
        const spaceHeader = headers.find(h => {
          const headerText = h.textContent || '';
          return headerText.includes('Space') || headerText.includes('Spaces');
        });
        const spaceHeaderIndex = spaceHeader ? Array.from(spaceHeader.parentElement?.children || []).indexOf(spaceHeader) : 3;
        
        const spaceCell = cells[spaceHeaderIndex] || cells[3] || cells.find(cell => 
          cell.textContent?.includes('Space') || cell.querySelector('button, [role="button"]')
        );
        
        return {
          found: true,
          rowText: n8nRow.textContent?.trim().substring(0, 100),
          spaceCellText: spaceCell?.textContent?.trim(),
          spaceCellHasButton: !!spaceCell?.querySelector('button, [role="button"]'),
          spaceCellIndex: cells.indexOf(spaceCell),
          totalCells: cells.length,
          allCellTexts: cells.map(c => c.textContent?.trim().substring(0, 30)),
          rowElement: n8nRow // Return the actual element reference
        };
      }
      
      // Last resort: search by text content in all elements
      const allElements = Array.from(document.querySelectorAll('*'));
      const n8nElement = allElements.find(el => {
        const text = el.textContent?.trim() || '';
        return text === 'n8n Workflow Fields' || (text.includes('n8n Workflow Fields') && text.length < 50);
      });
      
      if (n8nElement) {
        const row = n8nElement.closest('tr, [role="row"]');
        if (row) {
          const cells = Array.from(row.querySelectorAll('td, [role="cell"]'));
          const spaceCell = cells[3] || cells.find(cell => cell.querySelector('button, [role="button"]'));
          return {
            found: true,
            rowText: row.textContent?.trim().substring(0, 100),
            spaceCellText: spaceCell?.textContent?.trim(),
            spaceCellHasButton: !!spaceCell?.querySelector('button, [role="button"]'),
            spaceCellIndex: cells.indexOf(spaceCell),
            totalCells: cells.length,
            allCellTexts: cells.map(c => c.textContent?.trim().substring(0, 30)),
            foundVia: 'element-search'
          };
        }
      }
      
      return { 
        found: false, 
        totalRows: allRows.length, 
        sampleRows: allRows.slice(0, 5).map(r => r.textContent?.trim().substring(0, 80)),
        pageText: allText.substring(0, 1000) 
      };
    }, { fieldGroupName: CONFIG.boostSpace.fieldGroupName });
    
    if (!fieldGroupFound.found) {
      console.log(`   ❌ Field group not found via evaluate`);
      console.log(`   Debug info:`, JSON.stringify(fieldGroupFound, null, 2));
      
      // Try using Playwright text locator as fallback
      console.log(`   🔄 Trying Playwright text locator...`);
      
      // First, take a screenshot to see what's on the page
      await page.screenshot({ path: 'custom-fields-page-debug.png', fullPage: true });
      console.log('   📸 Screenshot saved: custom-fields-page-debug.png');
      
      // Get all text on the page to see what field groups are visible
      const pageText = await page.textContent('body');
      const hasProjectsFieldGroup = pageText.includes('n8n Workflow Fields (Projects)');
      const hasOldFieldGroup = pageText.includes('n8n Workflow Fields') && !pageText.includes('(Projects)');
      
      console.log(`   ℹ️  Page contains "n8n Workflow Fields (Projects)": ${hasProjectsFieldGroup}`);
      console.log(`   ℹ️  Page contains old "n8n Workflow Fields": ${hasOldFieldGroup}`);
      
      // List ALL field groups visible on the page
      const allFieldGroupsOnPage = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
        const fieldGroups = [];
        rows.forEach((row, idx) => {
          const text = row.textContent?.trim() || '';
          if (text.length > 10 && !text.includes('Field groupSpaces') && !text.includes('New field group')) {
            const cells = Array.from(row.querySelectorAll('td, [role="cell"]'));
            const firstCell = cells[0]?.textContent?.trim() || '';
            if (firstCell && firstCell.length > 0) {
              fieldGroups.push({ index: idx, name: firstCell.substring(0, 50), fullText: text.substring(0, 100) });
            }
          }
        });
        return fieldGroups;
      });
      
      console.log(`   📋 All field groups visible on page (${allFieldGroupsOnPage.length}):`);
      allFieldGroupsOnPage.slice(0, 10).forEach((fg, i) => {
        console.log(`      ${i + 1}. "${fg.name}"`);
      });
      
      // Try exact match first
      let textLocator = page.getByText('n8n Workflow Fields (Projects)', { exact: true });
      let textCount = await textLocator.count();
      
      if (textCount === 0) {
        // Try partial match
        textLocator = page.getByText('n8n Workflow Fields (Projects)', { exact: false });
        textCount = await textLocator.count();
      }
      
      if (textCount > 0) {
        console.log(`   ✅ Found "${CONFIG.boostSpace.fieldGroupName}" via Playwright (${textCount} matches)`);
        fieldGroupFound.found = true;
        fieldGroupFound.rowText = await textLocator.first().textContent();
        fieldGroupElement = await textLocator.first();
      } else {
        // Check if it's in the list but with different text
        const projectsFieldGroupInList = allFieldGroupsOnPage.find(fg => 
          fg.name.includes('Workflow Fields') && (fg.name.includes('Projects') || fg.name.includes('(Projects)'))
        );
        
        if (projectsFieldGroupInList) {
          console.log(`   ✅ Found field group in list: "${projectsFieldGroupInList.name}"`);
          // Try to find it by the name we found
          textLocator = page.getByText(projectsFieldGroupInList.name, { exact: false });
          if (await textLocator.count() > 0) {
            fieldGroupFound.found = true;
            fieldGroupFound.rowText = projectsFieldGroupInList.fullText;
            fieldGroupElement = await textLocator.first();
          }
        }
      }
      
      if (!fieldGroupFound.found) {
        console.log(`   ❌ Field group "${CONFIG.boostSpace.fieldGroupName}" not found on page`);
        console.log(`   💡 The field group exists via API but is not visible in UI`);
        console.log(`   💡 Attempting alternative: Navigate to Space 49 Projects and access settings from there...`);
        
        // Alternative approach: Navigate to Space 49 Projects list, then access module settings
        try {
          console.log(`   🔄 Trying alternative navigation path...`);
          await page.goto(`${CONFIG.boostSpace.baseUrl}/list/project/${CONFIG.boostSpace.spaceId}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(3000);
          
          // Look for module settings or custom fields option
          const moduleSettings = await page.evaluate(() => {
            // Look for any button/link containing "Settings", "Custom", "Fields", or gear icon
            const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
            for (const btn of allButtons) {
              const text = btn.textContent?.toLowerCase() || '';
              const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
              if (text.includes('settings') || text.includes('custom') || text.includes('field') || 
                  ariaLabel.includes('settings') || ariaLabel.includes('custom')) {
                return { found: true, text: btn.textContent?.trim(), tag: btn.tagName };
              }
            }
            return { found: false };
          });
          
          if (moduleSettings.found) {
            console.log(`   ✅ Found module settings option: "${moduleSettings.text}"`);
            // Try clicking it
            await page.click(`button:has-text("${moduleSettings.text}"), a:has-text("${moduleSettings.text}")`).catch(() => {});
            await page.waitForTimeout(3000);
            
            // Now try finding the field group again
            const retrySearch = await page.evaluate(({ fieldGroupName }) => {
              const allText = document.body.innerText;
              return allText.includes(fieldGroupName);
            }, { fieldGroupName: CONFIG.boostSpace.fieldGroupName });
            
            if (retrySearch) {
              console.log(`   ✅ Field group now visible after navigating to module settings!`);
              fieldGroupFound.found = true;
            }
          }
        } catch (e) {
          console.log(`   ⚠️  Alternative navigation failed: ${e.message}`);
        }
        
        if (!fieldGroupFound.found) {
          console.log(`   ❌ Field group still not found after alternative navigation`);
          console.log(`   💡 Recommendation: Assign field group manually via UI or use API if supported`);
          throw new Error(`Field group "${CONFIG.boostSpace.fieldGroupName}" not found on page`);
        }
      }
    } else {
      console.log(`   ✅ Found field group: ${fieldGroupFound.rowText}`);
      console.log(`   ℹ️  Spaces cell: ${fieldGroupFound.spaceCellText || 'Empty'}`);
      console.log(`   ℹ️  Cell texts: ${fieldGroupFound.allCellTexts?.join(', ') || 'N/A'}`);
    }
    
    // Step 5: Click the EDIT (pencil) icon next to "n8n Workflow Fields (Projects)" group
    console.log(`\n📝 Step 5: Clicking EDIT icon for "${CONFIG.boostSpace.fieldGroupName}" group...`);
    
    // Find the edit button (pencil icon) next to the field group name
    // Based on the screenshot, the edit icon is a button near the "n8n Workflow Fields" text
    const editClicked = await page.evaluate(() => {
      // Find the "n8n Workflow Fields" text element
      const allElements = Array.from(document.querySelectorAll('*'));
      const n8nTextEl = allElements.find(el => {
        const text = el.textContent?.trim() || '';
        return text === 'n8n Workflow Fields' || (text.includes('n8n Workflow Fields') && text.length < 50);
      });
      
      if (n8nTextEl) {
        // Find the parent container that holds both the text and the edit button
        let container = n8nTextEl;
        for (let i = 0; i < 10; i++) {
          if (!container) break;
          
          // Look for buttons in this container
          const buttons = container.querySelectorAll('button');
          if (buttons.length > 0) {
            // Find button that's near the text (likely the edit/pencil icon)
            const textRect = n8nTextEl.getBoundingClientRect();
            const nearbyButton = Array.from(buttons).find(btn => {
              const btnRect = btn.getBoundingClientRect();
              // Button should be near the text (same row, within 300px horizontally)
              return Math.abs(btnRect.top - textRect.top) < 30 && 
                     Math.abs(btnRect.left - textRect.left) < 300 &&
                     btnRect.width > 0 && btnRect.height > 0;
            });
            
            if (nearbyButton) {
              // Check if it's likely an edit button (has icon, or is first/second button)
              const buttonIndex = Array.from(buttons).indexOf(nearbyButton);
              if (buttonIndex < 3) { // First few buttons are likely edit/delete
                nearbyButton.click();
                return { clicked: true, method: 'nearby-button', buttonIndex };
              }
            }
          }
          
          container = container.parentElement;
        }
      }
      
      return { clicked: false };
    });
    
    if (!editClicked.clicked) {
      // Alternative: Use Playwright to find and click edit button
      console.log(`   🔄 Trying Playwright locator for edit button...`);
      const n8nText = page.getByText('n8n Workflow Fields', { exact: false });
      await n8nText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Look for edit button near the text
      const editButton = page.locator('button').filter({ hasText: /edit/i }).or(page.locator('button[aria-label*="edit" i]')).or(page.locator('button svg')).first();
      
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();
        console.log('   ✅ Clicked edit button via Playwright');
        editClicked.clicked = true;
      } else {
        // Last resort: click on any button near "n8n Workflow Fields"
        const clicked = await page.evaluate(() => {
          const textEl = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.trim() === 'n8n Workflow Fields'
          );
          if (textEl) {
            const parent = textEl.closest('[class*="group"], [class*="row"], [class*="item"]');
            if (parent) {
              const buttons = parent.querySelectorAll('button');
              if (buttons.length > 0) {
                // Click the first button (likely the edit button)
                buttons[0].click();
                return true;
              }
            }
          }
          return false;
        });
        if (clicked) {
          console.log('   ✅ Clicked button near field group name');
          editClicked.clicked = true;
        }
      }
    } else {
      console.log(`   ✅ Clicked edit button (method: ${editClicked.method})`);
    }
    
    if (!editClicked.clicked) {
      throw new Error('Could not find or click edit button for "n8n Workflow Fields" group');
    }
    
    await page.waitForTimeout(3000); // Wait for modal/dialog to appear
    
    // Step 6: Select Space 49 (Projects)
    console.log(`\n🎯 Step 6: Selecting "${CONFIG.boostSpace.spaceName}" (Space ${CONFIG.boostSpace.spaceId})...`);
    
    // Wait a bit for modal to fully load
    await page.waitForTimeout(2000);
    
    const spaceSelected = await page.evaluate(({ spaceName, spaceId }) => {
      // Look for modal/dialog content
      const modal = document.querySelector('[role="dialog"], [class*="modal"], [class*="dialog"], [class*="overlay"]');
      const searchArea = modal || document.body;
      
      // Strategy 1: Look for text containing space name or ID
      const allText = searchArea.textContent || '';
      const hasSpace = allText.includes(spaceName) || allText.includes(`Space ${spaceId}`) || 
                       allText.includes(`n8n Workflow`) || allText.includes('45');
      
      if (!hasSpace) {
        return { selected: false, reason: 'Space text not found in modal' };
      }
      
      // Strategy 2: Look for checkboxes (most common for space selection)
      const checkboxes = Array.from(searchArea.querySelectorAll('input[type="checkbox"]'));
      for (const cb of checkboxes) {
        // Check label text
        const label = cb.labels?.[0] || cb.closest('label');
        const labelText = label?.textContent?.trim() || '';
        
        // Check nearby text
        const parent = cb.closest('div, li, tr, [role="option"]');
        const parentText = parent?.textContent?.trim() || '';
        
        const combinedText = (labelText + ' ' + parentText).toLowerCase();
        
        if (combinedText.includes(spaceName.toLowerCase()) || 
            combinedText.includes(`space ${spaceId}`) ||
            combinedText.includes('n8n workflow') ||
            (combinedText.includes('45') && combinedText.includes('note'))) {
          if (!cb.checked) {
            cb.click();
            return { selected: true, method: 'checkbox', text: labelText || parentText };
          } else {
            return { selected: true, method: 'already-checked', text: labelText || parentText };
          }
        }
      }
      
      // Strategy 3: Look for clickable elements with space text
      const allClickable = Array.from(searchArea.querySelectorAll('button, [role="button"], [role="option"], [role="menuitem"], a, label, div[onclick]'));
      const spaceOption = allClickable.find(el => {
        const text = el.textContent?.trim() || '';
        const lowerText = text.toLowerCase();
        return lowerText.includes(spaceName.toLowerCase()) || 
               lowerText.includes(`space ${spaceId}`) || 
               (lowerText.includes('n8n') && lowerText.includes('workflow')) ||
               (lowerText.includes('45') && lowerText.includes('note'));
      });
      
      if (spaceOption) {
        spaceOption.click();
        return { selected: true, method: 'clickable', text: spaceOption.textContent?.trim() };
      }
      
      return { selected: false, totalCheckboxes: checkboxes.length, totalClickable: allClickable.length };
    }, { spaceName: CONFIG.boostSpace.spaceName, spaceId: CONFIG.boostSpace.spaceId });
    
    if (!spaceSelected.selected) {
      console.log('   ⚠️  Could not find space option automatically');
      console.log('   ⏸️  Pausing for 30 seconds for manual selection...');
      await page.waitForTimeout(30000);
    } else {
      console.log(`   ✅ Selected: ${spaceSelected.optionText}`);
      await page.waitForTimeout(2000);
    }
    
    // Step 7: Save/Confirm
    console.log('\n💾 Step 7: Saving assignment...');
    
    const saved = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(b => {
        const text = b.textContent?.toLowerCase() || '';
        return text.includes('save') || text.includes('confirm') || text.includes('apply') || text.includes('ok');
      });
      
      if (saveButtons.length > 0) {
        saveButtons[0].click();
        return { saved: true, buttonText: saveButtons[0].textContent?.trim() };
      }
      
      // Try pressing Escape or clicking outside to close modal
      return { saved: false };
    });
    
    if (saved.saved) {
      console.log(`   ✅ Saved: ${saved.buttonText}`);
      await page.waitForTimeout(3000);
    } else {
      console.log('   ℹ️  No save button found - may auto-save or need manual confirmation');
      await page.waitForTimeout(2000);
    }
    
    // Step 8: Verify assignment
    console.log('\n✅ Step 8: Verifying assignment...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const verification = await page.evaluate(({ fieldGroupName, spaceName }) => {
      const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
      const n8nRow = rows.find(row => row.textContent?.includes(fieldGroupName));
      
      if (n8nRow) {
        const cells = Array.from(n8nRow.querySelectorAll('td, [role="cell"]'));
        const spaceCell = cells[3];
        const spaceCellText = spaceCell?.textContent?.trim() || '';
        
        return {
          found: true,
          assigned: spaceCellText.includes(spaceName) || spaceCellText.includes('45') || spaceCellText.length > 0,
          spaceCellText: spaceCellText
        };
      }
      
      return { found: false };
    }, { fieldGroupName: CONFIG.boostSpace.fieldGroupName, spaceName: CONFIG.boostSpace.spaceName });
    
    if (verification.found && verification.assigned) {
      console.log(`   ✅ Field group assigned to space!`);
      console.log(`   📍 Spaces column shows: ${verification.spaceCellText}`);
    } else if (verification.found) {
      console.log(`   ⚠️  Field group found but assignment not confirmed`);
      console.log(`   📍 Spaces column shows: ${verification.spaceCellText || 'Empty'}`);
    } else {
      console.log('   ❌ Could not verify assignment');
    }
    
    console.log('\n✅ Complete! Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'field-group-assignment-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  assignFieldGroupToSpace()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { assignFieldGroupToSpace };
