#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class Microsoft365PrerequisitesCheck {
    constructor() {
        this.prerequisites = {
            accountAccess: {},
            emailConfiguration: {},
            securitySettings: {},
            automationRequirements: {}
        };
    }

    async runPrerequisitesCheck() {
        console.log('🔍 Microsoft 365 Prerequisites Check for Email Persona System\n');

        try {
            await this.checkAccountAccess();
            await this.checkEmailConfiguration();
            await this.checkSecuritySettings();
            await this.checkAutomationRequirements();

            this.generatePrerequisitesReport();
        } catch (error) {
            console.error('❌ Prerequisites check failed:', error);
        }
    }

    async checkAccountAccess() {
        console.log('📋 ACCOUNT ACCESS REQUIREMENTS:');

        this.prerequisites.accountAccess = {
            adminAccess: {
                required: true,
                description: 'Admin access to Microsoft 365 account',
                currentStatus: 'UNKNOWN',
                action: 'Verify admin access to service@rensto.com account'
            },
            emailBoxAccess: {
                required: true,
                description: 'Access to configure email rules and settings',
                currentStatus: 'UNKNOWN',
                action: 'Ensure you can log into Outlook/Office 365'
            },
            goDaddyAccess: {
                required: true,
                description: 'Access to GoDaddy Microsoft 365 management',
                currentStatus: 'UNKNOWN',
                action: 'Verify GoDaddy account access for Microsoft 365'
            }
        };

        console.log('✅ Account access requirements defined');
    }

    async checkEmailConfiguration() {
        console.log('\n📧 EMAIL CONFIGURATION REQUIREMENTS:');

        this.prerequisites.emailConfiguration = {
            emailRules: {
                required: true,
                description: 'Ability to create email rules in Outlook',
                currentStatus: 'UNKNOWN',
                action: 'Test creating a simple email rule'
            },
            emailTemplates: {
                required: true,
                description: 'Ability to create email templates',
                currentStatus: 'UNKNOWN',
                action: 'Test creating an email template'
            },
            autoReplies: {
                required: true,
                description: 'Ability to set up auto-replies',
                currentStatus: 'UNKNOWN',
                action: 'Test setting up an auto-reply'
            },
            folderOrganization: {
                required: true,
                description: 'Ability to create folders and labels',
                currentStatus: 'UNKNOWN',
                action: 'Test creating email folders'
            }
        };

        console.log('✅ Email configuration requirements defined');
    }

    async checkSecuritySettings() {
        console.log('\n🔒 SECURITY SETTINGS REQUIREMENTS:');

        this.prerequisites.securitySettings = {
            apiAccess: {
                required: true,
                description: 'Enable API access for automation',
                currentStatus: 'UNKNOWN',
                action: 'Enable Microsoft Graph API access'
            },
            appPermissions: {
                required: true,
                description: 'Allow third-party app access',
                currentStatus: 'UNKNOWN',
                action: 'Configure app permissions for n8n integration'
            },
            modernAuthentication: {
                required: true,
                description: 'Enable modern authentication',
                currentStatus: 'UNKNOWN',
                action: 'Ensure modern authentication is enabled'
            }
        };

        console.log('✅ Security settings requirements defined');
    }

    async checkAutomationRequirements() {
        console.log('\n🤖 AUTOMATION REQUIREMENTS:');

        this.prerequisites.automationRequirements = {
            webhookSupport: {
                required: true,
                description: 'Support for webhook notifications',
                currentStatus: 'UNKNOWN',
                action: 'Verify webhook support in Microsoft 365'
            },
            apiEndpoints: {
                required: true,
                description: 'Access to Microsoft Graph API endpoints',
                currentStatus: 'UNKNOWN',
                action: 'Test API connectivity'
            },
            integrationPermissions: {
                required: true,
                description: 'Permissions for n8n integration',
                currentStatus: 'UNKNOWN',
                action: 'Configure integration permissions'
            }
        };

        console.log('✅ Automation requirements defined');
    }

    generatePrerequisitesReport() {
        console.log('\n📋 Microsoft 365 Prerequisites Report');
        console.log('=====================================\n');

        console.log('🎯 MINIMUM REQUIREMENTS BEFORE IMPLEMENTATION:\n');

        console.log('1. 📋 ACCOUNT ACCESS:');
        console.log('   • Admin access to Microsoft 365 account (service@rensto.com)');
        console.log('   • Ability to log into Outlook/Office 365');
        console.log('   • Access to GoDaddy Microsoft 365 management panel');

        console.log('\n2. 📧 EMAIL CONFIGURATION:');
        console.log('   • Ability to create email rules in Outlook');
        console.log('   • Ability to create email templates');
        console.log('   • Ability to set up auto-replies');
        console.log('   • Ability to create folders and labels');

        console.log('\n3. 🔒 SECURITY SETTINGS:');
        console.log('   • Enable Microsoft Graph API access');
        console.log('   • Configure app permissions for n8n integration');
        console.log('   • Ensure modern authentication is enabled');

        console.log('\n4. 🤖 AUTOMATION REQUIREMENTS:');
        console.log('   • Verify webhook support in Microsoft 365');
        console.log('   • Test API connectivity');
        console.log('   • Configure integration permissions');

        console.log('\n🚀 IMMEDIATE ACTIONS NEEDED:');
        console.log('1. Log into your GoDaddy account');
        console.log('2. Access Microsoft 365 management');
        console.log('3. Verify admin access to service@rensto.com');
        console.log('4. Test basic email configuration capabilities');
        console.log('5. Enable API access if needed');

        console.log('\n⏱️  ESTIMATED TIME: 15-30 minutes');
        console.log('🎯 DIFFICULTY: Low (mostly verification)');
        console.log('⚠️  RISK: Minimal (no changes to existing email)');

        console.log('\n✅ ONCE COMPLETED:');
        console.log('• I can implement the Email Persona System immediately');
        console.log('• All 6 AI personas will be configured');
        console.log('• Email automation will be deployed');
        console.log('• Professional multi-department presence will be active');

        // Save detailed report
        const reportPath = path.join(__dirname, '../docs/microsoft365-prerequisites-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.prerequisites, null, 2));
        console.log(`\n📄 Detailed prerequisites report saved to: ${reportPath}`);
    }
}

// Run the prerequisites check
const check = new Microsoft365PrerequisitesCheck();
check.runPrerequisitesCheck();

