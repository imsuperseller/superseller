#!/usr/bin/env node
/**
 * Page Section Verification Tool
 * Tracks which sections on which pages are verified for brand system rollout
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERIFICATION_FILE = path.join(__dirname, 'page-verification-status.json');

// All pages to verify
const ALL_PAGES = {
  service: [
    { path: '/marketplace', name: 'Marketplace' },
    { path: '/subscriptions', name: 'Subscriptions' },
    { path: '/ready-solutions', name: 'Ready Solutions' },
    { path: '/custom-solutions', name: 'Custom Solutions' }
  ],
  niche: [
    { path: '/hvac', name: 'HVAC' },
    { path: '/amazon-seller', name: 'Amazon Seller' },
    { path: '/realtor', name: 'Realtor' },
    { path: '/roofers', name: 'Roofers' },
    { path: '/dentist', name: 'Dentist' },
    { path: '/bookkeeping', name: 'Bookkeeping' },
    { path: '/busy-mom', name: 'Busy Mom' },
    { path: '/ecommerce', name: 'E-commerce' },
    { path: '/fence-contractors', name: 'Fence Contractors' },
    { path: '/insurance', name: 'Insurance' },
    { path: '/lawyer', name: 'Lawyer' },
    { path: '/locksmith', name: 'Locksmith' },
    { path: '/photographers', name: 'Photographers' },
    { path: '/product-supplier', name: 'Product Supplier' },
    { path: '/synagogues', name: 'Synagogues' }
  ],
  core: [
    { path: '/', name: 'Homepage' },
    { path: '/about', name: 'About' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/help-center', name: 'Help Center' },
    { path: '/contact', name: 'Contact' },
    { path: '/documentation', name: 'Documentation' }
  ],
  legal: [
    { path: '/privacy-policy', name: 'Privacy Policy' },
    { path: '/terms-of-service', name: 'Terms of Service' },
    { path: '/cookie-policy', name: 'Cookie Policy' },
    { path: '/security', name: 'Security' }
  ]
};

// Common sections to check
const COMMON_SECTIONS = [
  'hero',
  'navigation',
  'pricing-cards',
  'features',
  'testimonials',
  'cta',
  'footer'
];

function loadVerificationStatus() {
  if (fs.existsSync(VERIFICATION_FILE)) {
    return JSON.parse(fs.readFileSync(VERIFICATION_FILE, 'utf-8'));
  }
  
  // Initialize with all pages unchecked
  const status = {};
  
  Object.values(ALL_PAGES).flat().forEach(page => {
    status[page.path] = {
      name: page.name,
      path: page.path,
      verified: false,
      sections: {},
      notes: '',
      verifiedAt: null,
      verifiedBy: null
    };
    
    COMMON_SECTIONS.forEach(section => {
      status[page.path].sections[section] = {
        verified: false,
        needsFix: false,
        notes: ''
      };
    });
  });
  
  return status;
}

function saveVerificationStatus(status) {
  fs.writeFileSync(VERIFICATION_FILE, JSON.stringify(status, null, 2));
}

function markSectionVerified(pagePath, section, verified = true, notes = '') {
  const status = loadVerificationStatus();
  
  if (!status[pagePath]) {
    console.log(`❌ Page not found: ${pagePath}`);
    return;
  }
  
  if (!status[pagePath].sections[section]) {
    status[pagePath].sections[section] = {};
  }
  
  status[pagePath].sections[section].verified = verified;
  status[pagePath].sections[section].notes = notes;
  
  // Check if all sections are verified
  const allSectionsVerified = Object.values(status[pagePath].sections).every(
    s => s.verified === true
  );
  
  if (allSectionsVerified) {
    status[pagePath].verified = true;
    status[pagePath].verifiedAt = new Date().toISOString();
  }
  
  saveVerificationStatus(status);
  
  console.log(`✅ Section "${section}" on ${pagePath} marked as ${verified ? 'verified' : 'needs review'}`);
}

function markPageVerified(pagePath, verified = true) {
  const status = loadVerificationStatus();
  
  if (!status[pagePath]) {
    console.log(`❌ Page not found: ${pagePath}`);
    return;
  }
  
  status[pagePath].verified = verified;
  status[pagePath].verifiedAt = verified ? new Date().toISOString() : null;
  
  // Mark all sections as verified if page is verified
  if (verified) {
    Object.keys(status[pagePath].sections).forEach(section => {
      status[pagePath].sections[section].verified = true;
    });
  }
  
  saveVerificationStatus(status);
  
  console.log(`✅ Page ${pagePath} marked as ${verified ? 'verified' : 'needs review'}`);
}

function getProgress() {
  const status = loadVerificationStatus();
  const pages = Object.values(status);
  
  const totalPages = pages.length;
  const verifiedPages = pages.filter(p => p.verified).length;
  
  const totalSections = pages.reduce((sum, page) => {
    return sum + Object.keys(page.sections || {}).length;
  }, 0);
  
  const verifiedSections = pages.reduce((sum, page) => {
    return sum + Object.values(page.sections || {}).filter(s => s.verified).length;
  }, 0);
  
  const pageProgress = (verifiedPages / totalPages * 100).toFixed(1);
  const sectionProgress = (verifiedSections / totalSections * 100).toFixed(1);
  
  return {
    pages: { verified: verifiedPages, total: totalPages, progress: pageProgress },
    sections: { verified: verifiedSections, total: totalSections, progress: sectionProgress }
  };
}

function printProgress() {
  const progress = getProgress();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 VERIFICATION PROGRESS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`📄 Pages: ${progress.pages.verified}/${progress.pages.total} (${progress.pages.progress}%)`);
  console.log(`🧩 Sections: ${progress.sections.verified}/${progress.sections.total} (${progress.sections.progress}%)\n`);
  
  const status = loadVerificationStatus();
  const unverifiedPages = Object.entries(status)
    .filter(([_, page]) => !page.verified)
    .slice(0, 5);
  
  if (unverifiedPages.length > 0) {
    console.log('⏳ Next pages to verify:');
    unverifiedPages.forEach(([path, page]) => {
      const verifiedSections = Object.values(page.sections).filter(s => s.verified).length;
      const totalSections = Object.keys(page.sections).length;
      console.log(`   ${path} - ${verifiedSections}/${totalSections} sections verified`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

function printHelp() {
  console.log(`
📋 PAGE VERIFICATION TOOL

Usage:
  node verify-page-sections.js <command> [args]

Commands:
  progress                    Show verification progress
  verify <page> <section>     Mark section as verified
  unverify <page> <section>   Mark section as needs review
  verify-page <page>          Mark entire page as verified
  list                        List all pages and their status
  help                        Show this help

Examples:
  node verify-page-sections.js progress
  node verify-page-sections.js verify /marketplace hero
  node verify-page-sections.js verify-page /subscriptions
  node verify-page-sections.js list

Section names: ${COMMON_SECTIONS.join(', ')}
`);
}

function listPages() {
  const status = loadVerificationStatus();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 ALL PAGES STATUS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  Object.entries(status).forEach(([path, page]) => {
    const verifiedSections = Object.values(page.sections).filter(s => s.verified).length;
    const totalSections = Object.keys(page.sections).length;
    const statusIcon = page.verified ? '✅' : verifiedSections > 0 ? '🟡' : '⏳';
    
    console.log(`${statusIcon} ${page.name} (${path})`);
    console.log(`   Sections: ${verifiedSections}/${totalSections} verified`);
    
    if (page.notes) {
      console.log(`   Notes: ${page.notes}`);
    }
    
    console.log('');
  });
}

// Initialize file if it doesn't exist
function initializeFile() {
  if (!fs.existsSync(VERIFICATION_FILE)) {
    const status = loadVerificationStatus();
    saveVerificationStatus(status);
    console.log('✅ Verification file initialized\n');
  }
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

// Initialize file on any command
if (command && command !== 'help') {
  initializeFile();
}

if (!command || command === 'help') {
  printHelp();
} else if (command === 'progress') {
  printProgress();
} else if (command === 'verify' && args[1] && args[2]) {
  markSectionVerified(args[1], args[2], true, args[3] || '');
} else if (command === 'unverify' && args[1] && args[2]) {
  markSectionVerified(args[1], args[2], false, args[3] || '');
} else if (command === 'verify-page' && args[1]) {
  markPageVerified(args[1], true);
} else if (command === 'list') {
  listPages();
} else if (command === 'init') {
  initializeFile();
  console.log('✅ Verification system initialized!');
  console.log(`   File: ${VERIFICATION_FILE}`);
  console.log('   Run "progress" or "list" to see status\n');
} else {
  console.log('❌ Unknown command. Use "help" for usage.');
}

