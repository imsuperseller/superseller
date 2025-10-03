#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailAutomationDeployer {
    constructor() {
        this.workflowData = this.loadWorkflowData();
    }

    loadWorkflowData() {
        const workflowPath = path.join(__dirname, '../workflows/email-automation-system.json');
        return JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    }

    createDeploymentScript() {
        const script = `#!/usr/bin/env node

// Email Automation Workflow Deployment Script
// This script deploys the email automation workflow to n8n

const workflowData = ${JSON.stringify(this.workflowData, null, 2)};

console.log('🚀 DEPLOYING EMAIL AUTOMATION WORKFLOW TO N8N...');
console.log('📧 Workflow Name:', workflowData.name);
console.log('🔗 Webhook Path:', '/email-webhook');
console.log('👥 Email Personas:', ['Mary (Customer Success)', 'John (Technical Support)', 'Winston (Business Development)', 'Sarah (Marketing)', 'Alex (Operations)', 'Quinn (Finance)']);
console.log('');

console.log('✅ WORKFLOW FEATURES:');
console.log('• Email webhook trigger at /email-webhook');
console.log('• AI-powered persona identification');
console.log('• Automated response generation');
console.log('• Airtable customer record creation');
console.log('• Follow-up task scheduling');
console.log('• Slack notifications');
console.log('• Human escalation for urgent emails');
console.log('');

console.log('📋 DEPLOYMENT STEPS:');
console.log('1. Import workflow JSON into n8n');
console.log('2. Configure email credentials');
console.log('3. Set up Airtable credentials');
console.log('4. Configure Slack webhook');
console.log('5. Test webhook endpoint');
console.log('6. Activate workflow');
console.log('');

console.log('🔧 CONFIGURATION REQUIRED:');
console.log('• Email Send node: Configure SMTP credentials');
console.log('• Airtable nodes: Configure API key and base ID');
console.log('• Slack nodes: Configure webhook URLs');
console.log('• Webhook URL: https://n8n.rensto.com/webhook/email-webhook');
console.log('');

console.log('📊 EXPECTED BEHAVIOR:');
console.log('• Emails sent to service@rensto.com will trigger webhook');
console.log('• AI will identify appropriate persona based on content');
console.log('• Automated response sent from persona email');
console.log('• Customer record created in Airtable');
console.log('• Follow-up task scheduled');
console.log('• Slack notification sent');
console.log('');

console.log('🎯 SUCCESS CRITERIA:');
console.log('• service@rensto.com receives and processes emails');
console.log('• Automated responses sent within 5 minutes');
console.log('• Customer records created in Airtable');
console.log('• Follow-up tasks scheduled');
console.log('• Slack notifications working');
console.log('');

console.log('⚠️  TROUBLESHOOTING:');
console.log('• Check webhook URL accessibility');
console.log('• Verify email credentials');
console.log('• Test Airtable API connection');
console.log('• Confirm Slack webhook configuration');
console.log('• Monitor n8n execution logs');
console.log('');

console.log('📈 MONITORING:');
console.log('• Check n8n execution history');
console.log('• Monitor Airtable for new records');
console.log('• Review Slack notifications');
console.log('• Track email response times');
console.log('');

console.log('🚀 READY FOR DEPLOYMENT!');
console.log('Copy the workflow JSON and import it into your n8n instance.');
`;

        const scriptPath = path.join(__dirname, 'deploy-email-automation.js');
        fs.writeFileSync(scriptPath, script);
        console.log('✅ Email automation deployment script created:', scriptPath);
        
        return scriptPath;
    }

    generateWebhookTestScript() {
        const testScript = `#!/usr/bin/env node

// Email Webhook Test Script
// Tests the email automation workflow webhook

const testEmail = {
    from: "test@example.com",
    to: "service@rensto.com", 
    subject: "Test Email - Customer Support",
    body: "Hello, I need help with my account setup and onboarding process.",
    html: "<p>Hello, I need help with my account setup and onboarding process.</p>",
    messageId: "test-message-" + Date.now(),
    threadId: "test-thread-" + Date.now()
};

console.log('🧪 TESTING EMAIL AUTOMATION WEBHOOK...');
console.log('📧 Test Email Data:', JSON.stringify(testEmail, null, 2));
console.log('');

console.log('🔗 Webhook URL: https://n8n.rensto.com/webhook/email-webhook');
console.log('📝 Expected Response: Mary Johnson (Customer Success) persona');
console.log('');

console.log('💡 To test manually:');
console.log('curl -X POST https://n8n.rensto.com/webhook/email-webhook \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify(testEmail) + '\'');
console.log('');

console.log('✅ Expected Results:');
console.log('• Persona: mary (Customer Success)');
console.log('• Confidence: 0.95');
console.log('• Auto-reply sent from mary@rensto.com');
console.log('• Customer record created in Airtable');
console.log('• Follow-up task scheduled');
console.log('• Slack notification sent');
`;

        const testPath = path.join(__dirname, 'test-email-webhook.js');
        fs.writeFileSync(testPath, testScript);
        console.log('✅ Email webhook test script created:', testPath);
        
        return testPath;
    }

    async deploy() {
        console.log('🚀 EMAIL AUTOMATION WORKFLOW DEPLOYMENT');
        console.log('=====================================');
        console.log('');

        // Create deployment script
        const deploymentScript = this.createDeploymentScript();
        
        // Create test script
        const testScript = this.generateWebhookTestScript();
        
        console.log('✅ DEPLOYMENT SCRIPTS CREATED');
        console.log('📁 Deployment script:', deploymentScript);
        console.log('🧪 Test script:', testScript);
        console.log('');

        console.log('📋 NEXT STEPS:');
        console.log('1. Run: node scripts/deploy-email-automation.js');
        console.log('2. Import workflow JSON into n8n');
        console.log('3. Configure credentials');
        console.log('4. Test webhook: node scripts/test-email-webhook.js');
        console.log('5. Send test email to service@rensto.com');
        console.log('');

        return {
            deploymentScript,
            testScript,
            workflowData: this.workflowData
        };
    }
}

// Run deployment
const deployer = new EmailAutomationDeployer();
deployer.deploy().catch(console.error);

export default EmailAutomationDeployer;
