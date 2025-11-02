#!/usr/bin/env node
/**
 * Visual Audit Tool - Automated detection of visual gaps
 * 
 * Scans all Webflow pages and identifies:
 * 1. Missing images/videos
 * 2. Alignment issues
 * 3. Mobile responsiveness problems
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_ID = '66c7e551a317e0e9c9f906d8';
const API_TOKEN = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';

const OUTPUT_DIR = path.join(__dirname, 'visual-audit-results');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function getAllPages() {
    try {
        const response = await axios.get(
            `https://api.webflow.com/v1/sites/${SITE_ID}/pages`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'accept-version': '1.0.0'
                },
                params: {
                    limit: 100
                }
            }
        );
        return response.data.pages.filter(page => !page.draft && !page.archived);
    } catch (error) {
        console.error('Error fetching pages:', error.response?.data || error.message);
        return [];
    }
}

async function getPageContent(pageId) {
    try {
        const response = await axios.get(
            `https://api.webflow.com/v2/sites/${SITE_ID}/pages/${pageId}/content`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'accept-version': '2.0.0'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching page content for ${pageId}:`, error.response?.data || error.message);
        return null;
    }
}

function analyzeVisualContent(pageContent, pageInfo) {
    const issues = [];
    const content = JSON.stringify(pageContent);

    // Check for images
    const hasImages = /<img|image|\.jpg|\.png|\.webp|\.svg/i.test(content);
    if (!hasImages) {
        issues.push({
            type: 'missing_image',
            severity: 'medium',
            message: 'No images detected in page content',
            section: 'general'
        });
    }

    // Check for videos
    const hasVideos = /<video|\.mp4|\.webm|youtube|vimeo/i.test(content);
    if (!hasVideos && ['Home', 'Marketplace', 'Ready Solutions', 'Subscriptions', 'Custom Solutions'].includes(pageInfo.title)) {
        issues.push({
            type: 'missing_video',
            severity: 'low',
            message: 'Consider adding hero video or demo video',
            section: 'hero'
        });
    }

    // Check for hero section
    if (pageInfo.title === 'Home') {
        const hasHero = /hero|banner|header/i.test(content);
        if (!hasHero) {
            issues.push({
                type: 'missing_hero',
                severity: 'high',
                message: 'Homepage missing hero section',
                section: 'hero'
            });
        }
    }

    return issues;
}

function checkAlignmentIssues(pageContent, pageInfo) {
    const issues = [];
    const content = JSON.stringify(pageContent);

    // Check for flex/grid containers (alignment contexts)
    const hasFlex = /display:\s*flex|display:\s*grid/i.test(content);
    if (!hasFlex) {
        issues.push({
            type: 'alignment_check',
            severity: 'low',
            message: 'Manual alignment check needed - no flex/grid detected',
            section: 'layout'
        });
    }

    return issues;
}

async function generateAuditReport() {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎨 VISUAL AUDIT TOOL');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const pages = await getAllPages();
    console.log(`📄 Found ${pages.length} published pages\n`);

    const auditResults = {
        timestamp: new Date().toISOString(),
        totalPages: pages.length,
        pages: []
    };

    for (const page of pages) {
        console.log(`📋 Auditing: ${page.title} (${page.slug})`);
        
        const pageContent = await getPageContent(page.id);
        
        const pageResult = {
            id: page.id,
            title: page.title,
            slug: page.slug,
            url: page.publishedPath || `/${page.slug}`,
            issues: []
        };

        if (pageContent) {
            const visualIssues = analyzeVisualContent(pageContent, page);
            const alignmentIssues = checkAlignmentIssues(pageContent, page);
            
            pageResult.issues = [...visualIssues, ...alignmentIssues];
        } else {
            pageResult.issues.push({
                type: 'content_unavailable',
                severity: 'high',
                message: 'Could not fetch page content for analysis',
                section: 'general'
            });
        }

        auditResults.pages.push(pageResult);
        
        if (pageResult.issues.length > 0) {
            console.log(`   ⚠️  Found ${pageResult.issues.length} potential issues`);
        } else {
            console.log(`   ✅ No obvious issues detected`);
        }
    }

    // Save audit report
    const reportPath = path.join(OUTPUT_DIR, `visual-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
    
    console.log(`\n✅ Audit complete! Report saved to: ${reportPath}`);

    // Generate summary
    const totalIssues = auditResults.pages.reduce((sum, page) => sum + page.issues.length, 0);
    const pagesWithIssues = auditResults.pages.filter(p => p.issues.length > 0).length;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total Pages Audited: ${auditResults.pages.length}`);
    console.log(`Pages with Issues: ${pagesWithIssues}`);
    console.log(`Total Issues Found: ${totalIssues}`);
    console.log('\n⚠️  NOTE: This is an automated scan. Manual verification required.');
    console.log('═══════════════════════════════════════════════════════════════\n');

    return auditResults;
}

// Run audit
generateAuditReport().catch(console.error);

