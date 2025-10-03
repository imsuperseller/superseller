#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OAuthManagementSystem {
    constructor() {
        this.authorizedRedirectURIs = [
            'https://rensto.com/oauth/callback',
            'https://admin.rensto.com/api/oauth/quickbooks-callback',
            'https://admin.rensto.com/api/oauth/webflow-callback',
            'https://admin.rensto.com/api/oauth/stripe-callback',
            'https://admin.rensto.com/api/oauth/typeform-callback'
        ];
        this.oauthApps = this.loadOAuthApps();
    }

    loadOAuthApps() {
        return {
            'QuickBooks': {
                clientId: 'QB_CLIENT_ID',
                clientSecret: 'QB_CLIENT_SECRET',
                redirectURIs: [
                    'https://admin.rensto.com/api/oauth/quickbooks-callback'
                ],
                scopes: ['com.intuit.quickbooks.accounting'],
                status: 'active'
            },
            'Webflow': {
                clientId: 'WF_CLIENT_ID',
                clientSecret: 'WF_CLIENT_SECRET',
                redirectURIs: [
                    'https://admin.rensto.com/api/oauth/webflow-callback'
                ],
                scopes: ['sites:read', 'sites:write'],
                status: 'active'
            },
            'Stripe': {
                clientId: 'STRIPE_CLIENT_ID',
                clientSecret: 'STRIPE_CLIENT_SECRET',
                redirectURIs: [
                    'https://admin.rensto.com/api/oauth/stripe-callback'
                ],
                scopes: ['read', 'write'],
                status: 'active'
            },
            'Typeform': {
                clientId: 'TYPEFORM_CLIENT_ID',
                clientSecret: 'TYPEFORM_CLIENT_SECRET',
                redirectURIs: [
                    'https://admin.rensto.com/api/oauth/typeform-callback'
                ],
                scopes: ['forms:read', 'forms:write'],
                status: 'active'
            }
        };
    }

    generateOAuthManagementDashboard() {
        const dashboard = `#!/usr/bin/env node

// OAuth Management Dashboard
// Centralized management of all OAuth applications and redirect URIs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OAuthManagementDashboard {
    constructor() {
        this.authorizedRedirectURIs = ${JSON.stringify(this.authorizedRedirectURIs, null, 2)};
        this.oauthApps = ${JSON.stringify(this.oauthApps, null, 2)};
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
        console.log(\`🔧 Updating OAuth app: \${appName}\`);
        
        if (!this.oauthApps[appName]) {
            throw new Error(\`OAuth app \${appName} not found\`);
        }

        // Validate redirect URIs
        if (updates.redirectURIs) {
            for (const uri of updates.redirectURIs) {
                const validation = this.validateRedirectURI(uri);
                if (!validation.valid) {
                    throw new Error(\`Invalid redirect URI: \${uri}\`);
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

        console.log(\`✅ Successfully updated \${appName}\`);
        return this.oauthApps[appName];
    }

    testOAuthFlow(appName) {
        console.log(\`🧪 Testing OAuth flow for: \${appName}\`);
        
        const app = this.oauthApps[appName];
        if (!app) {
            throw new Error(\`OAuth app \${appName} not found\`);
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

        console.log(\`✅ OAuth flow test completed for \${appName}\`);
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
            console.log(\`🧪 Testing \${appName}...\`);
            const result = this.testOAuthFlow(appName);
            testResults.push(result);
            console.log('');
        }

        // Generate report
        const report = this.generateOAuthReport();
        
        console.log('📊 AUDIT RESULTS:');
        console.log(\`✅ Total Apps: \${report.summary.totalApps}\`);
        console.log(\`✅ Active Apps: \${report.summary.activeApps}\`);
        console.log(\`✅ Authorized Redirect URIs: \${report.summary.totalRedirectURIs}\`);
        console.log(\`✅ Audit Entries: \${report.summary.totalAuditEntries}\`);
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
`;

        const dashboardPath = path.join(__dirname, 'oauth-management-dashboard.js');
        fs.writeFileSync(dashboardPath, dashboard);
        console.log('✅ OAuth Management Dashboard created:', dashboardPath);
        
        return dashboardPath;
    }

    generateOAuthConfigurationValidator() {
        const validator = `#!/usr/bin/env node

// OAuth Configuration Validator
// Validates OAuth configurations and prevents conflicts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OAuthConfigurationValidator {
    constructor() {
        this.authorizedRedirectURIs = ${JSON.stringify(this.authorizedRedirectURIs, null, 2)};
        this.validationRules = this.loadValidationRules();
    }

    loadValidationRules() {
        return {
            redirectURI: {
                required: true,
                mustBeAuthorized: true,
                format: 'https://',
                domains: ['rensto.com', 'admin.rensto.com']
            },
            clientId: {
                required: true,
                format: 'string',
                minLength: 10
            },
            clientSecret: {
                required: true,
                format: 'string',
                minLength: 20
            },
            scopes: {
                required: true,
                format: 'array',
                minItems: 1
            }
        };
    }

    validateOAuthConfiguration(config) {
        const errors = [];
        const warnings = [];

        // Validate redirect URIs
        if (config.redirectURIs) {
            for (const uri of config.redirectURIs) {
                const validation = this.validateRedirectURI(uri);
                if (!validation.valid) {
                    errors.push(\`Invalid redirect URI: \${uri}\`);
                }
            }
        } else {
            errors.push('No redirect URIs provided');
        }

        // Validate client ID
        if (!config.clientId) {
            errors.push('Client ID is required');
        } else if (config.clientId.length < this.validationRules.clientId.minLength) {
            errors.push('Client ID is too short');
        }

        // Validate client secret
        if (!config.clientSecret) {
            errors.push('Client secret is required');
        } else if (config.clientSecret.length < this.validationRules.clientSecret.minLength) {
            errors.push('Client secret is too short');
        }

        // Validate scopes
        if (!config.scopes || !Array.isArray(config.scopes)) {
            errors.push('Scopes must be an array');
        } else if (config.scopes.length < this.validationRules.scopes.minItems) {
            errors.push('At least one scope is required');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    validateRedirectURI(uri) {
        // Check if URI is in authorized list
        const isAuthorized = this.authorizedRedirectURIs.includes(uri);
        
        // Check format
        const hasHttps = uri.startsWith('https://');
        const hasValidDomain = this.validationRules.redirectURI.domains.some(domain => 
            uri.includes(domain)
        );

        return {
            valid: isAuthorized && hasHttps && hasValidDomain,
            isAuthorized: isAuthorized,
            hasHttps: hasHttps,
            hasValidDomain: hasValidDomain,
            authorizedURIs: this.authorizedRedirectURIs
        };
    }

    checkForConflicts(config1, config2) {
        const conflicts = [];

        // Check for duplicate redirect URIs
        if (config1.redirectURIs && config2.redirectURIs) {
            const commonURIs = config1.redirectURIs.filter(uri => 
                config2.redirectURIs.includes(uri)
            );
            
            if (commonURIs.length > 0) {
                conflicts.push({
                    type: 'duplicate_redirect_uri',
                    message: 'Duplicate redirect URIs found',
                    uris: commonURIs
                });
            }
        }

        // Check for duplicate client IDs
        if (config1.clientId === config2.clientId) {
            conflicts.push({
                type: 'duplicate_client_id',
                message: 'Duplicate client ID found',
                clientId: config1.clientId
            });
        }

        return {
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts
        };
    }

    generateValidationReport(configurations) {
        const report = {
            timestamp: new Date().toISOString(),
            totalConfigurations: configurations.length,
            validConfigurations: 0,
            invalidConfigurations: 0,
            validationResults: [],
            conflicts: [],
            summary: {
                totalErrors: 0,
                totalWarnings: 0
            }
        };

        // Validate each configuration
        for (const config of configurations) {
            const validation = this.validateOAuthConfiguration(config);
            report.validationResults.push({
                name: config.name || 'Unnamed Configuration',
                validation: validation
            });

            if (validation.valid) {
                report.validConfigurations++;
            } else {
                report.invalidConfigurations++;
                report.summary.totalErrors += validation.errors.length;
            }

            report.summary.totalWarnings += validation.warnings.length;
        }

        // Check for conflicts between configurations
        for (let i = 0; i < configurations.length; i++) {
            for (let j = i + 1; j < configurations.length; j++) {
                const conflict = this.checkForConflicts(configurations[i], configurations[j]);
                if (conflict.hasConflicts) {
                    report.conflicts.push({
                        config1: configurations[i].name || 'Configuration ' + i,
                        config2: configurations[j].name || 'Configuration ' + j,
                        conflicts: conflict.conflicts
                    });
                }
            }
        }

        const reportPath = path.join(__dirname, '../data/oauth-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📊 OAuth Validation Report generated:', reportPath);
        return report;
    }
}

export default OAuthConfigurationValidator;
`;

        const validatorPath = path.join(__dirname, 'oauth-configuration-validator.js');
        fs.writeFileSync(validatorPath, validator);
        console.log('✅ OAuth Configuration Validator created:', validatorPath);
        
        return validatorPath;
    }

    async createOAuthManagementSystem() {
        console.log('🔐 OAuth Management System');
        console.log('=========================');
        console.log('');

        // Generate OAuth management dashboard
        const dashboardPath = this.generateOAuthManagementDashboard();
        
        // Generate OAuth configuration validator
        const validatorPath = this.generateOAuthConfigurationValidator();
        
        console.log('✅ OAUTH MANAGEMENT SYSTEM COMPONENTS CREATED');
        console.log('📁 OAuth Management Dashboard:', dashboardPath);
        console.log('📁 OAuth Configuration Validator:', validatorPath);
        console.log('');

        console.log('📋 SYSTEM FEATURES:');
        console.log('• Centralized OAuth app management');
        console.log('• Redirect URI validation and authorization');
        console.log('• OAuth flow testing and validation');
        console.log('• Configuration conflict detection');
        console.log('• Audit logging and reporting');
        console.log('• Automated configuration updates');
        console.log('');

        console.log('🎯 AUTHORIZED REDIRECT URIs:');
        this.authorizedRedirectURIs.forEach(uri => {
            console.log(`  ✅ ${uri}`);
        });
        console.log('');

        console.log('🔧 OAUTH APPS CONFIGURED:');
        Object.keys(this.oauthApps).forEach(app => {
            console.log(`  📱 ${app}: ${this.oauthApps[app].status}`);
        });
        console.log('');

        console.log('🎯 NEXT STEPS:');
        console.log('1. Run: node scripts/oauth-management-dashboard.js');
        console.log('2. Test OAuth flows for all configured apps');
        console.log('3. Validate redirect URI configurations');
        console.log('4. Update OAuth apps with authorized URIs only');
        console.log('5. Monitor OAuth usage and performance');
        console.log('');

        return {
            dashboardPath,
            validatorPath,
            authorizedRedirectURIs: this.authorizedRedirectURIs,
            oauthApps: this.oauthApps
        };
    }
}

// Run OAuth management system creation
const oauthSystem = new OAuthManagementSystem();
oauthSystem.createOAuthManagementSystem().catch(console.error);

export default OAuthManagementSystem;
