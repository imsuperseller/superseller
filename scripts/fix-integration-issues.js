#!/usr/bin/env node

/**
 * FIX INTEGRATION ISSUES
 * 
 * This script properly diagnoses and fixes the actual integration issues:
 * - n8n: Check Racknerd VPS setup
 * - Webflow: Use correct site ID and API v2
 * - Lightrag: Check deployment and credentials
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration - need to get actual values
const config = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        baseId: 'appQijHhqqP4z6wGe'
    },
    n8n: {
        // Need to get actual Racknerd VPS URL and port
        url: process.env.N8N_URL || 'http://your-racknerd-ip:5678',
        token: process.env.N8N_API_KEY || 'your-n8n-api-key'
    },
    webflow: {
        token: process.env.WEBFLOW_TOKEN || 'your-webflow-token',
        // Need to get actual site ID from your Webflow account
        siteId: process.env.WEBFLOW_SITE_ID || 'your-webflow-site-id'
    },
    lightrag: {
        url: process.env.LIGHTRAG_URL || 'https://rensto-lightrag.onrender.com',
        apiKey: process.env.LIGHTRAG_API_KEY || 'your-lightrag-api-key'
    }
};

class IntegrationIssueFixer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            issues: {},
            fixes: {},
            summary: {
                resolved: 0,
                needsAction: 0,
                errors: 0
            }
        };
    }

    async diagnoseN8nIssue() {
        console.log('\n🔍 Diagnosing n8n Integration Issue...');
        
        // Test different possible n8n URLs
        const possibleUrls = [
            'http://localhost:5678',
            'http://127.0.0.1:5678',
            'https://n8n.rensto.com',
            'http://your-racknerd-ip:5678'
        ];

        for (const url of possibleUrls) {
            try {
                console.log(`Testing n8n URL: ${url}`);
                const response = await axios.get(`${url}/healthz`, {
                    timeout: 5000
                });
                
                if (response.status === 200) {
                    console.log(`✅ n8n found at: ${url}`);
                    this.results.fixes.n8n = {
                        status: 'found',
                        url: url,
                        action: 'Update configuration with correct URL'
                    };
                    return true;
                }
            } catch (error) {
                console.log(`❌ ${url}: ${error.message}`);
            }
        }

        console.log('❌ n8n not found at any tested URL');
        this.results.issues.n8n = {
            status: 'not_found',
            action: 'Need to check Racknerd VPS setup and get correct URL'
        };
        return false;
    }

    async diagnoseWebflowIssue() {
        console.log('\n🔍 Diagnosing Webflow Integration Issue...');
        
        try {
            // First, list all sites to get the correct site ID
            console.log('Getting Webflow sites...');
            const sitesResponse = await axios.get('https://api.webflow.com/v2/sites', {
                headers: {
                    'Authorization': `Bearer ${config.webflow.token}`,
                    'Accept': 'application/json'
                }
            });

            const sites = sitesResponse.data.sites || [];
            console.log(`✅ Found ${sites.length} Webflow sites:`);
            
            for (const site of sites) {
                console.log(`- ${site.name} (ID: ${site.id})`);
            }

            // If we have sites, test the first one
            if (sites.length > 0) {
                const testSite = sites[0];
                console.log(`Testing site: ${testSite.name}`);
                
                const siteResponse = await axios.get(`https://api.webflow.com/v2/sites/${testSite.id}`, {
                    headers: {
                        'Authorization': `Bearer ${config.webflow.token}`,
                        'Accept': 'application/json'
                    }
                });

                console.log(`✅ Webflow API working with site: ${testSite.name}`);
                this.results.fixes.webflow = {
                    status: 'working',
                    sites: sites.length,
                    testSite: testSite.name,
                    siteId: testSite.id,
                    action: 'Use correct site ID in configuration'
                };
                return true;
            }

        } catch (error) {
            console.log(`❌ Webflow API error: ${error.message}`);
            this.results.issues.webflow = {
                status: 'api_error',
                error: error.message,
                action: 'Check API token and permissions'
            };
        }
        
        return false;
    }

    async diagnoseLightragIssue() {
        console.log('\n🔍 Diagnosing Lightrag Integration Issue...');
        
        try {
            // Test basic connectivity
            console.log('Testing Lightrag connectivity...');
            const response = await axios.get(config.lightrag.url, {
                timeout: 10000
            });
            
            console.log(`✅ Lightrag responding at: ${config.lightrag.url}`);
            this.results.fixes.lightrag = {
                status: 'responding',
                url: config.lightrag.url,
                action: 'Check API endpoints and credentials'
            };
            return true;

        } catch (error) {
            console.log(`❌ Lightrag error: ${error.message}`);
            
            if (error.code === 'ENOTFOUND') {
                this.results.issues.lightrag = {
                    status: 'dns_error',
                    error: error.message,
                    action: 'Check deployment URL and DNS'
                };
            } else if (error.response?.status === 404) {
                this.results.issues.lightrag = {
                    status: 'not_found',
                    error: '404 - Endpoint not found',
                    action: 'Check API endpoints and deployment status'
                };
            } else {
                this.results.issues.lightrag = {
                    status: 'connection_error',
                    error: error.message,
                    action: 'Check deployment and credentials'
                };
            }
        }
        
        return false;
    }

    async generateFixInstructions() {
        console.log('\n📋 GENERATING FIX INSTRUCTIONS...');
        
        const instructions = {
            n8n: {
                issue: this.results.issues.n8n?.status || 'unknown',
                fix: this.results.fixes.n8n?.action || 'Need to investigate',
                steps: [
                    '1. Check Racknerd VPS n8n installation',
                    '2. Get correct n8n URL and port',
                    '3. Update configuration with correct URL',
                    '4. Test n8n API endpoints'
                ]
            },
            webflow: {
                issue: this.results.issues.webflow?.status || 'unknown',
                fix: this.results.fixes.webflow?.action || 'Need to investigate',
                steps: [
                    '1. Use correct site ID from Webflow account',
                    '2. Update configuration with site ID',
                    '3. Test Webflow API endpoints',
                    '4. Verify API permissions'
                ]
            },
            lightrag: {
                issue: this.results.issues.lightrag?.status || 'unknown',
                fix: this.results.fixes.lightrag?.action || 'Need to investigate',
                steps: [
                    '1. Check Lightrag deployment status',
                    '2. Verify API credentials',
                    '3. Test API endpoints',
                    '4. Update configuration'
                ]
            }
        };

        this.results.instructions = instructions;
        return instructions;
    }

    async executeDiagnosis() {
        console.log('\n🚀 EXECUTING INTEGRATION DIAGNOSIS...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);
        
        try {
            // Diagnose all integration issues
            await this.diagnoseN8nIssue();
            await this.diagnoseWebflowIssue();
            await this.diagnoseLightragIssue();
            
            // Generate fix instructions
            await this.generateFixInstructions();
            
            // Save results
            console.log('\n💾 SAVING RESULTS...');
            const resultsPath = path.join(__dirname, '../docs/integration-diagnosis-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
            
            // Generate summary
            this.generateDiagnosisSummary();
            
            console.log('\n🎉 INTEGRATION DIAGNOSIS COMPLETE!');
            console.log(`📄 Results saved to: ${resultsPath}`);
            
            return this.results;
            
        } catch (error) {
            console.error('\n❌ Diagnosis failed:', error.message);
            return null;
        }
    }

    generateDiagnosisSummary() {
        console.log('\n📋 INTEGRATION DIAGNOSIS SUMMARY:');
        
        console.log('\n🔍 ISSUES FOUND:');
        for (const [component, issue] of Object.entries(this.results.issues)) {
            console.log(`❌ ${component.toUpperCase()}: ${issue.status} - ${issue.action}`);
        }
        
        console.log('\n✅ FIXES IDENTIFIED:');
        for (const [component, fix] of Object.entries(this.results.fixes)) {
            console.log(`✅ ${component.toUpperCase()}: ${fix.status} - ${fix.action}`);
        }
        
        console.log('\n🎯 NEXT ACTIONS:');
        for (const [component, instruction] of Object.entries(this.results.instructions)) {
            console.log(`\n${component.toUpperCase()}:`);
            for (const step of instruction.steps) {
                console.log(`  ${step}`);
            }
        }
    }
}

// Run the diagnosis
async function main() {
    const fixer = new IntegrationIssueFixer();
    const results = await fixer.executeDiagnosis();
    process.exit(results ? 0 : 1);
}

main().catch(console.error);
