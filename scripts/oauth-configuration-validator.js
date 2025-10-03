#!/usr/bin/env node

// OAuth Configuration Validator
// Validates OAuth configurations and prevents conflicts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OAuthConfigurationValidator {
    constructor() {
        this.authorizedRedirectURIs = [
  "https://rensto.com/oauth/callback",
  "https://admin.rensto.com/api/oauth/quickbooks-callback",
  "https://admin.rensto.com/api/oauth/webflow-callback",
  "https://admin.rensto.com/api/oauth/stripe-callback",
  "https://admin.rensto.com/api/oauth/typeform-callback"
];
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
                    errors.push(`Invalid redirect URI: ${uri}`);
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
