#!/usr/bin/env node
/**
 * Lighthouse & PageSpeed Audit Tool
 * 
 * Runs Lighthouse audits on all pages via browser automation
 * Checks: Performance, Accessibility, Best Practices, SEO
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'lighthouse-results');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES_TO_AUDIT = [
    { name: 'Homepage', url: 'https://rensto.com', priority: 'high' },
    { name: 'Marketplace', url: 'https://rensto.com/marketplace', priority: 'high' },
    { name: 'Subscriptions', url: 'https://rensto.com/subscriptions', priority: 'high' },
    { name: 'Ready Solutions', url: 'https://rensto.com/ready-solutions', priority: 'high' },
    { name: 'Custom Solutions', url: 'https://rensto.com/custom-solutions', priority: 'high' },
];

async function checkLighthouseInstalled() {
    try {
        await execAsync('lighthouse --version');
        return true;
    } catch (error) {
        console.log('⚠️  Lighthouse CLI not installed. Installing...\n');
        try {
            await execAsync('npm install -g lighthouse');
            return true;
        } catch (installError) {
            console.error('❌ Could not install Lighthouse. Please install manually:');
            console.error('   npm install -g lighthouse\n');
            return false;
        }
    }
}

async function runLighthouseAudit(page) {
    console.log(`🔍 Auditing: ${page.name}...`);
    
    const outputPath = path.join(OUTPUT_DIR, `${page.name.toLowerCase().replace(/\s+/g, '-')}-lighthouse.json`);
    const htmlPath = path.join(OUTPUT_DIR, `${page.name.toLowerCase().replace(/\s+/g, '-')}-report.html`);
    
    try {
        // Run Lighthouse with mobile and desktop presets
        const command = `lighthouse "${page.url}" ` +
            `--output=json,html ` +
            `--output-path=${htmlPath} ` +
            `--chrome-flags="--headless" ` +
            `--only-categories=performance,accessibility,best-practices,seo`;
        
        const { stdout, stderr } = await execAsync(command, { 
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        
        // Parse JSON output
        const jsonContent = fs.readFileSync(outputPath.replace('.html', '.json'), 'utf-8');
        const data = JSON.parse(jsonContent);
        
        return {
            page: page.name,
            url: page.url,
            priority: page.priority,
            performance: {
                score: Math.round(data.categories.performance.score * 100),
                metrics: {
                    firstContentfulPaint: data.audits['first-contentful-paint'].numericValue,
                    largestContentfulPaint: data.audits['largest-contentful-paint'].numericValue,
                    totalBlockingTime: data.audits['total-blocking-time'].numericValue,
                    cumulativeLayoutShift: data.audits['cumulative-layout-shift'].numericValue,
                },
                opportunities: data.audits
                    .filter(audit => audit.details?.type === 'opportunity')
                    .map(audit => ({
                        id: audit.id,
                        title: audit.title,
                        impact: audit.details?.overallSavingsMs,
                        description: audit.description
                    }))
                    .sort((a, b) => (b.impact || 0) - (a.impact || 0))
                    .slice(0, 5)
            },
            accessibility: {
                score: Math.round(data.categories.accessibility.score * 100),
                issues: data.audits
                    .filter(audit => audit.score !== null && audit.score < 1)
                    .map(audit => ({
                        id: audit.id,
                        title: audit.title,
                        description: audit.description
                    }))
            },
            bestPractices: {
                score: Math.round(data.categories['best-practices'].score * 100),
                issues: data.audits
                    .filter(audit => audit.score !== null && audit.score < 1)
                    .map(audit => ({
                        id: audit.id,
                        title: audit.title,
                        description: audit.description
                    }))
            },
            seo: {
                score: Math.round(data.categories.seo.score * 100),
                issues: data.audits
                    .filter(audit => audit.score !== null && audit.score < 1)
                    .map(audit => ({
                        id: audit.id,
                        title: audit.title,
                        description: audit.description
                    }))
            },
            reportPath: htmlPath
        };
    } catch (error) {
        console.error(`❌ Error auditing ${page.name}:`, error.message);
        return {
            page: page.name,
            url: page.url,
            error: error.message
        };
    }
}

async function generateSummaryReport(results) {
    const summary = {
        timestamp: new Date().toISOString(),
        totalPages: results.length,
        averageScores: {
            performance: 0,
            accessibility: 0,
            bestPractices: 0,
            seo: 0
        },
        pages: results,
        recommendations: []
    };

    // Calculate averages
    const validScores = results.filter(r => !r.error);
    if (validScores.length > 0) {
        summary.averageScores.performance = Math.round(
            validScores.reduce((sum, r) => sum + (r.performance?.score || 0), 0) / validScores.length
        );
        summary.averageScores.accessibility = Math.round(
            validScores.reduce((sum, r) => sum + (r.accessibility?.score || 0), 0) / validScores.length
        );
        summary.averageScores.bestPractices = Math.round(
            validScores.reduce((sum, r) => sum + (r.bestPractices?.score || 0), 0) / validScores.length
        );
        summary.averageScores.seo = Math.round(
            validScores.reduce((sum, r) => sum + (r.seo?.score || 0), 0) / validScores.length
        );
    }

    // Generate recommendations
    results.forEach(result => {
        if (result.error) return;
        
        if (result.performance.score < 70) {
            summary.recommendations.push({
                page: result.page,
                category: 'Performance',
                priority: 'high',
                issues: result.performance.opportunities.slice(0, 3),
                action: 'Optimize images, reduce JavaScript, enable caching'
            });
        }
        
        if (result.accessibility.score < 90) {
            summary.recommendations.push({
                page: result.page,
                category: 'Accessibility',
                priority: 'medium',
                issues: result.accessibility.issues.slice(0, 3),
                action: 'Add alt text, improve color contrast, fix ARIA labels'
            });
        }
    });

    return summary;
}

async function runAudits() {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🚀 LIGHTHOUSE & PAGESPEED AUDIT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Check if Lighthouse is installed
    const lighthouseInstalled = await checkLighthouseInstalled();
    if (!lighthouseInstalled) {
        console.log('\n📋 MANUAL AUDIT OPTIONS:');
        console.log('   1. Use Lighthouse in Chrome DevTools');
        console.log('   2. Use PageSpeed Insights: https://pagespeed.web.dev/');
        console.log('   3. Install Lighthouse: npm install -g lighthouse\n');
        return;
    }

    console.log(`📄 Auditing ${PAGES_TO_AUDIT.length} pages...\n`);

    const results = [];
    for (const page of PAGES_TO_AUDIT) {
        const result = await runLighthouseAudit(page);
        results.push(result);
        
        if (!result.error) {
            console.log(`   ✅ Performance: ${result.performance.score}/100`);
            console.log(`   ✅ Accessibility: ${result.accessibility.score}/100`);
            console.log(`   ✅ Best Practices: ${result.bestPractices.score}/100`);
            console.log(`   ✅ SEO: ${result.seo.score}/100\n`);
        }
    }

    // Generate summary
    const summary = await generateSummaryReport(results);
    const summaryPath = path.join(OUTPUT_DIR, `lighthouse-summary-${Date.now()}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Average Performance: ${summary.averageScores.performance}/100`);
    console.log(`Average Accessibility: ${summary.averageScores.accessibility}/100`);
    console.log(`Average Best Practices: ${summary.averageScores.bestPractices}/100`);
    console.log(`Average SEO: ${summary.averageScores.seo}/100`);
    console.log(`\n✅ Reports saved to: ${OUTPUT_DIR}`);
    console.log(`✅ Summary: ${summaryPath}`);
    console.log('\n⚠️  Open HTML reports in browser for detailed analysis');
    console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run audits
runAudits().catch(console.error);

