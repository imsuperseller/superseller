#!/usr/bin/env node

/**
 * 🧹 REMOVE DEPRECATED OAUTH URLs
 * 
 * This script systematically removes all deprecated OAuth redirect URIs
 * from all files and replaces them with the authorized permanent URLs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Deprecated URLs to remove
const deprecatedUrls = [
    'https://mr-lost-suited-athens.trycloudflare.com/rest/oauth2-credential/callback',
    'https://red-blocking-gl-answered.trycloudflare.com/rest/oauth2-credential/callback',
    'https://n8n-oauth2.rensto.com/rest/oauth2-credential/callback',
    'http://173.254.201.134:5678/rest/oauth2-credential/callback',
    'https://mr-lost-suited-athens.trycloudflare.com',
    'https://red-blocking-gl-answered.trycloudflare.com',
    'https://n8n-oauth2.rensto.com',
    'http://173.254.201.134:5678'
];

// Authorized URLs to use instead
const authorizedUrls = {
    primary: 'https://rensto.com/oauth/callback',
    admin: 'https://admin.rensto.com/api/oauth/quickbooks-callback',
    webflow: 'https://admin.rensto.com/api/oauth/webflow-callback',
    stripe: 'https://admin.rensto.com/api/oauth/stripe-callback',
    typeform: 'https://admin.rensto.com/api/oauth/typeform-callback'
};

// Files to skip (don't modify these)
const skipFiles = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'package-lock.json',
    'yarn.lock'
];

// File extensions to process
const processExtensions = ['.md', '.js', '.ts', '.tsx', '.json', '.txt', '.yml', '.yaml'];

function shouldSkipFile(filePath) {
    return skipFiles.some(skip => filePath.includes(skip));
}

function shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    return processExtensions.includes(ext);
}

function replaceDeprecatedUrls(content) {
    let updated = content;
    let replacements = 0;
    
    // Replace deprecated URLs with authorized ones
    deprecatedUrls.forEach(deprecatedUrl => {
        const regex = new RegExp(deprecatedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = updated.match(regex);
        
        if (matches) {
            // Determine which authorized URL to use based on context
            let replacement = authorizedUrls.primary;
            
            if (content.includes('quickbooks') || content.includes('QuickBooks')) {
                replacement = authorizedUrls.admin;
            } else if (content.includes('webflow') || content.includes('Webflow')) {
                replacement = authorizedUrls.webflow;
            } else if (content.includes('stripe') || content.includes('Stripe')) {
                replacement = authorizedUrls.stripe;
            } else if (content.includes('typeform') || content.includes('Typeform')) {
                replacement = authorizedUrls.typeform;
            }
            
            updated = updated.replace(regex, replacement);
            replacements += matches.length;
        }
    });
    
    return { content: updated, replacements };
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { content: updatedContent, replacements } = replaceDeprecatedUrls(content);
        
        if (replacements > 0) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`✅ Updated ${filePath} (${replacements} replacements)`);
            return replacements;
        }
        
        return 0;
    } catch (error) {
        console.log(`❌ Error processing ${filePath}: ${error.message}`);
        return 0;
    }
}

function walkDirectory(dir, results = []) {
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!shouldSkipFile(fullPath)) {
                    walkDirectory(fullPath, results);
                }
            } else if (stat.isFile()) {
                if (shouldProcessFile(fullPath) && !shouldSkipFile(fullPath)) {
                    results.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.log(`❌ Error reading directory ${dir}: ${error.message}`);
    }
    
    return results;
}

async function removeDeprecatedUrls() {
    console.log('🧹 REMOVING DEPRECATED OAUTH URLs FROM ALL FILES...\n');
    
    console.log('📋 Deprecated URLs to remove:');
    deprecatedUrls.forEach(url => console.log(`   ❌ ${url}`));
    
    console.log('\n📋 Authorized URLs to use:');
    Object.entries(authorizedUrls).forEach(([key, url]) => {
        console.log(`   ✅ ${key}: ${url}`);
    });
    
    console.log('\n🔍 Scanning files...');
    const files = walkDirectory(projectRoot);
    console.log(`Found ${files.length} files to process\n`);
    
    let totalReplacements = 0;
    let filesUpdated = 0;
    
    for (const file of files) {
        const replacements = processFile(file);
        if (replacements > 0) {
            totalReplacements += replacements;
            filesUpdated++;
        }
    }
    
    console.log(`\n📊 CLEANUP COMPLETE:`);
    console.log(`✅ Files updated: ${filesUpdated}`);
    console.log(`🔄 Total replacements: ${totalReplacements}`);
    console.log(`📁 Files scanned: ${files.length}`);
    
    if (totalReplacements > 0) {
        console.log('\n🎉 ALL DEPRECATED OAUTH URLs REMOVED!');
        console.log('📋 Next steps:');
        console.log('   1. Update OAuth apps in external services');
        console.log('   2. Test all OAuth flows');
        console.log('   3. Verify admin dashboard callbacks work');
    } else {
        console.log('\n✅ No deprecated URLs found - system is clean!');
    }
}

// Run the cleanup
removeDeprecatedUrls().catch(console.error);
