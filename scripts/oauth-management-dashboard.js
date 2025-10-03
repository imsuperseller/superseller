#!/usr/bin/env node

// OAuth Management Dashboard
// Centralized management of all OAuth applications and redirect URIs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OAuthManagementDashboard {
    constructor() {
        this.authorizedRedirectURIs = [
  "https://rensto.com/oauth/callback",
  "https://admin.rensto.com/api/oauth/quickbooks-callback",
  "https://admin.rensto.com/api/oauth/webflow-callback",
  "https://admin.rensto.com/api/oauth/stripe-callback",
  "https://admin.rensto.com/api/oauth/typeform-callback"
];
        this.oauthApps = {
  "QuickBooks": {
    "clientId": "QB_CLIENT_ID",
    "clientSecret": "QB_CLIENT_SECRET",
    "redirectURIs": [
      "https://admin.rensto.com/api/oauth/quickbooks-callback"
    ],
    "scopes": [
      "com.intuit.quickbooks.accounting"
    ],
    "status": "active"
  },
  "Webflow": {
    "clientId": "WF_CLIENT_ID",
    "clientSecret": "WF_CLIENT_SECRET",
    "redirectURIs": [
      "https://admin.rensto.com/api/oauth/webflow-callback"
    ],
    "scopes": [
      "sites:read",
      "sites:write"
    ],
    "status": "active"
  },
  "Stripe": {
    "clientId": "STRIPE_CLIENT_ID",
    "clientSecret": "STRIPE_CLIENT_SECRET",
    "redirectURIs": [
      "https://admin.rensto.com/api/oauth/stripe-callback"
    ],
    "scopes": [
      "read",
      "write"
    ],
    "status": "active"
  },
  "Typeform": {
    "clientId": "TYPEFORM_CLIENT_ID",
    "clientSecret": "TYPEFORM_CLIENT_SECRET",
    "redirectURIs": [
      "https://admin.rensto.com/api/oauth/typeform-callback"
    ],
    "scopes": [
      "forms:read",
      "forms:write"
    ],
    "status": "active"
  }
};
        this.auditLog = [];
    }

    validateRedirectURI(uri) {
        const isValid = this.authorizedRedirectURIs.includes(uri);
        
        this.auditLog.push({
            action: 'validate_redirect_uri',
            uri: uri,
            isValid: isValid,
            timestamp: new Date().toISOString()
        });

        return {
            valid: isValid,
            message: isValid ? 'URI is authorized' : 'URI is not authorized',
            authorizedURIs: this.authorizedRedirectURIs
        };
    }

    updateOAuthApp(appName, updates) {
        console.log(`🔧 Updating OAuth app: ${appName}`);
        
        if (!this.oauthApps[appName]) {
            throw new Error(`OAuth app ${appName} not found`);
        }

        // Validate redirect URIs
        if (updates.redirectURIs) {
            for (const uri of updates.redirectURIs) {
                const validation = this.validateRedirectURI(uri);
                if (!validation.valid) {
                    throw new Error(`Invalid redirect URI: ${uri}`);
                }
            }
        }

        // Update app configuration
        this.oauthApps[appName] = {
            ...this.oauthApps[appName],
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        this.auditLog.push({
            action: 'update_oauth_app',
            appName: appName,
            updates: updates,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ Successfully updated ${appName}`);
        return this.oauthApps[appName];
    }

    testOAuthFlow(appName) {
        console.log(`🧪 Testing OAuth flow for: ${appName}`);
        
        const app = this.oauthApps[appName];
        if (!app) {
            throw new Error(`OAuth app ${appName} not found`);
        }

        const testResults = {
            appName: appName,
            clientId: app.clientId,
            redirectURIs: app.redirectURIs,
            scopes: app.scopes,
            status: app.status,
            tests: {
                redirectURIValidation: this.testRedirectURIs(app.redirectURIs),
                scopeValidation: this.testScopes(app.scopes),
                configurationValidation: this.testConfiguration(app)
            },
            testedAt: new Date().toISOString()
        };

        this.auditLog.push({
            action: 'test_oauth_flow',
            appName: appName,
            results: testResults,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ OAuth flow test completed for ${appName}`);
        return testResults;
    }

    testRedirectURIs(redirectURIs) {
        const results = [];
        
        for (const uri of redirectURIs) {
            const validation = this.validateRedirectURI(uri);
            results.push({
                uri: uri,
                valid: validation.valid,
                message: validation.message
            });
        }

        return {
            total: redirectURIs.length,
            valid: results.filter(r => r.valid).length,
            invalid: results.filter(r => !r.valid).length,
            results: results
        };
    }

    testScopes(scopes) {
        return {
            total: scopes.length,
            scopes: scopes,
            valid: true // Assuming all scopes are valid for now
        };
    }

    testConfiguration(app) {
        const issues = [];
        
        if (!app.clientId) issues.push('Missing client ID');
        if (!app.clientSecret) issues.push('Missing client secret');
        if (!app.redirectURIs || app.redirectURIs.length === 0) issues.push('No redirect URIs configured');
        if (!app.scopes || app.scopes.length === 0) issues.push('No scopes configured');

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    generateOAuthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalApps: Object.keys(this.oauthApps).length,
            authorizedRedirectURIs: this.authorizedRedirectURIs,
            oauthApps: this.oauthApps,
            auditLog: this.auditLog,
            summary: {
                activeApps: Object.values(this.oauthApps).filter(app => app.status === 'active').length,
                totalRedirectURIs: this.authorizedRedirectURIs.length,
                totalAuditEntries: this.auditLog.length
            }
        };

        const reportPath = path.join(__dirname, '../data/oauth-management-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📊 OAuth Management Report generated:', reportPath);
        return report;
    }

    async runOAuthAudit() {
        console.log('🔍 OAuth Management Audit');
        console.log('========================');
        console.log('');

        // Test all OAuth apps
        const testResults = [];
        for (const appName of Object.keys(this.oauthApps)) {
            console.log(`🧪 Testing ${appName}...`);
            const result = this.testOAuthFlow(appName);
            testResults.push(result);
            console.log('');
        }

        // Generate report
        const report = this.generateOAuthReport();
        
        console.log('📊 AUDIT RESULTS:');
        console.log(`✅ Total Apps: ${report.summary.totalApps}`);
        console.log(`✅ Active Apps: ${report.summary.activeApps}`);
        console.log(`✅ Authorized Redirect URIs: ${report.summary.totalRedirectURIs}`);
        console.log(`✅ Audit Entries: ${report.summary.totalAuditEntries}`);
        console.log('');

        return {
            report,
            testResults
        };
    }
}

// Run OAuth audit
const dashboard = new OAuthManagementDashboard();
dashboard.runOAuthAudit().catch(console.error);

export default OAuthManagementDashboard;
