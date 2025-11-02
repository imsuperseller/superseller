#!/usr/bin/env node
/**
 * CSS Alignment Audit Tool
 * 
 * Checks for common alignment issues:
 * - Navigation logo/button alignment
 * - Footer column alignment
 * - Card grid alignment
 * - Button height consistency
 * - Flexbox/Grid alignment issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'css-audit-results');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Common alignment issues to check
const ALIGNMENT_CHECKS = {
    navigation: {
        logo: {
            issue: 'Logo not vertically centered in nav',
            fix: 'Use flexbox: align-items: center; on nav container',
            selector: 'nav .logo, .nav-logo, header .logo',
            standard: 'Logo should be vertically centered'
        },
        buttons: {
            issue: 'Nav buttons have inconsistent heights',
            fix: 'Standardize button height to 48px',
            selector: 'nav button, nav .button, nav .cta',
            standard: 'Buttons should be 48px height minimum'
        },
        links: {
            issue: 'Nav links not aligned',
            fix: 'Use flexbox with align-items: center',
            selector: 'nav a, .nav-link',
            standard: 'Links should be vertically centered'
        }
    },
    footer: {
        columns: {
            issue: 'Footer columns have unequal heights',
            fix: 'Use CSS Grid or Flexbox with equal heights',
            selector: '.footer-column, .footer-section',
            standard: 'Columns should align at top'
        },
        links: {
            issue: 'Footer links not aligned',
            fix: 'Consistent line-height and spacing',
            selector: '.footer a, .footer-link',
            standard: 'Links should align properly'
        }
    },
    cards: {
        grid: {
            issue: 'Cards in grid have unequal heights',
            fix: 'Use CSS Grid or align-items: stretch',
            selector: '.card, .service-card, .pricing-card',
            standard: 'Cards should have equal heights in grid'
        },
        content: {
            issue: 'Card content not aligned',
            fix: 'Use flexbox with consistent padding',
            selector: '.card-content, .card-body',
            standard: 'Content should be aligned within cards'
        }
    },
    buttons: {
        height: {
            issue: 'Button heights inconsistent',
            fix: 'Standardize to 48px (min-height: 48px)',
            selector: 'button, .button, .btn, [role="button"]',
            standard: 'All buttons should be 48px height'
        },
        alignment: {
            issue: 'Buttons not aligned in containers',
            fix: 'Use flexbox: align-items: center',
            selector: '.button-group, .cta-group',
            standard: 'Buttons should align in groups'
        }
    },
    pricing: {
        tables: {
            issue: 'Pricing cards have unequal heights',
            fix: 'Use CSS Grid with grid-template-rows: auto',
            selector: '.pricing-card, .plan-card',
            standard: 'All pricing tiers should have equal height'
        },
        features: {
            issue: 'Feature lists not aligned across cards',
            fix: 'Use flexbox: align-items: flex-start',
            selector: '.pricing-features, .plan-features',
            standard: 'Feature lists should align'
        }
    }
};

function generateCSSAuditReport() {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎨 CSS ALIGNMENT AUDIT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const report = {
        timestamp: new Date().toISOString(),
        checks: [],
        fixes: [],
        priority: {
            high: [],
            medium: [],
            low: []
        }
    };

    // Generate checks for each category
    for (const [category, checks] of Object.entries(ALIGNMENT_CHECKS)) {
        console.log(`📋 Checking ${category}...`);
        
        for (const [checkName, checkData] of Object.entries(checks)) {
            const check = {
                category,
                check: checkName,
                issue: checkData.issue,
                selector: checkData.selector,
                standard: checkData.standard,
                fix: checkData.fix,
                priority: category === 'navigation' || category === 'footer' ? 'high' : 
                         category === 'cards' || category === 'buttons' ? 'medium' : 'low'
            };
            
            report.checks.push(check);
            report.priority[check.priority].push(check);
        }
    }

    // Generate CSS fixes
    console.log('\n📝 Generating CSS fixes...\n');
    
    const cssFixes = generateCSSFixes();
    report.fixes = cssFixes;

    // Save report
    const reportPath = path.join(OUTPUT_DIR, `css-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate CSS fix file
    const cssPath = path.join(OUTPUT_DIR, `alignment-fixes.css`);
    fs.writeFileSync(cssPath, cssFixes.css);

    console.log('✅ CSS audit complete!');
    console.log(`   Report: ${reportPath}`);
    console.log(`   CSS Fixes: ${cssPath}\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total Checks: ${report.checks.length}`);
    console.log(`High Priority: ${report.priority.high.length}`);
    console.log(`Medium Priority: ${report.priority.medium.length}`);
    console.log(`Low Priority: ${report.priority.low.length}`);
    console.log('\n⚠️  Manual verification required - inspect pages with browser DevTools');
    console.log('═══════════════════════════════════════════════════════════════\n');

    return report;
}

function generateCSSFixes() {
    return {
        css: `/* CSS Alignment Fixes */
/* Generated: ${new Date().toISOString()} */
/* Add this to Webflow: Site Settings → Custom Code → Before </body> tag */

/* ============================================
   NAVIGATION ALIGNMENT FIXES
   ============================================ */

/* Logo Vertical Centering */
nav .logo,
.nav-logo,
header .logo,
.w-nav-brand {
    display: flex;
    align-items: center;
    height: 100%;
}

/* Navigation Container */
nav,
.navbar,
.w-nav {
    display: flex;
    align-items: center;
    min-height: 80px; /* Adjust based on design */
}

/* Nav Links Alignment */
nav a,
.nav-link,
.w-nav-link {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 1rem;
}

/* Nav Buttons Standard Height */
nav button,
nav .button,
nav .cta,
.w-button {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
}

/* ============================================
   FOOTER ALIGNMENT FIXES
   ============================================ */

/* Footer Container */
footer,
.footer {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
}

/* Footer Columns - Equal Heights */
.footer-column,
.footer-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
}

/* Footer Links Alignment */
.footer a,
.footer-link {
    line-height: 1.6;
    padding: 0.25rem 0;
}

/* Footer Logo/Content Alignment */
.footer .logo,
.footer-content {
    display: flex;
    align-items: flex-start;
}

/* ============================================
   CARD GRID ALIGNMENT FIXES
   ============================================ */

/* Card Grid Container */
.card-grid,
.service-grid,
.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    align-items: stretch; /* Equal heights */
}

/* Individual Cards */
.card,
.service-card,
.pricing-card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Card Content Alignment */
.card-content,
.card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 1.5rem;
}

/* Card Buttons - Align to Bottom */
.card-footer,
.card-cta {
    margin-top: auto;
    padding-top: 1.5rem;
}

/* ============================================
   BUTTON STANDARDIZATION
   ============================================ */

/* All Buttons - Standard Height */
button,
.button,
.btn,
[role="button"],
.w-button {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    box-sizing: border-box;
}

/* Button Groups Alignment */
.button-group,
.cta-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* ============================================
   PRICING TABLE ALIGNMENT
   ============================================ */

/* Pricing Grid */
.pricing-grid,
.pricing-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    align-items: stretch;
}

/* Pricing Cards */
.pricing-card,
.plan-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 2rem;
}

/* Pricing Features List */
.pricing-features,
.plan-features {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.75rem;
    padding: 1.5rem 0;
}

/* Pricing CTA - Align to Bottom */
.pricing-cta {
    margin-top: auto;
    padding-top: 1.5rem;
}

/* ============================================
   RESPONSIVE ALIGNMENT
   ============================================ */

@media (max-width: 768px) {
    /* Stack cards on mobile */
    .card-grid,
    .pricing-grid {
        grid-template-columns: 1fr;
    }
    
    /* Nav items stack */
    nav {
        flex-direction: column;
        align-items: flex-start;
    }
    
    /* Footer columns stack */
    footer,
    .footer {
        flex-direction: column;
    }
}

/* ============================================
   GENERAL FLEXBOX HELPERS
   ============================================ */

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.flex-start {
    display: flex;
    align-items: flex-start;
}

.flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.flex-column {
    display: flex;
    flex-direction: column;
}

.equal-height {
    display: flex;
    align-items: stretch;
}
`
    };
}

// Run audit
generateCSSAuditReport();

