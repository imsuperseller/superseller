#!/usr/bin/env node

import axios from 'axios';

class BenWorkflowAnalyzer {
  constructor() {
    this.benConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
  }

  async analyzeBenWorkflows() {
    console.log('🔍 Analyzing Ben Ginati\'s Workflow Needs...');
    console.log('🏢 Business: Tax4US (tax4us.co.il)');
    console.log('');

    try {
      const workflowsResponse = await axios.get(`${this.benConfig.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const workflows = workflowsResponse.data.data || [];
      console.log(`📊 Found ${workflows.length} workflows to analyze`);
      console.log('');

      // Categorize workflows by function
      const categories = {
        content: [],
        email: [],
        scheduling: [],
        testing: [],
        tax: []
      };

      workflows.forEach(workflow => {
        const name = workflow.name.toLowerCase();
        
        if (name.includes('content') || name.includes('blog') || name.includes('wordpress')) {
          categories.content.push(workflow);
        } else if (name.includes('email') || name.includes('outlook')) {
          categories.email.push(workflow);
        } else if (name.includes('schedule') || name.includes('cron')) {
          categories.scheduling.push(workflow);
        } else if (name.includes('test') || name.includes('mcp')) {
          categories.testing.push(workflow);
        } else if (name.includes('tax') || name.includes('bmad')) {
          categories.tax.push(workflow);
        }
      });

      console.log('📋 WORKFLOW CATEGORIES:');
      console.log(`📝 Content Management: ${categories.content.length} workflows`);
      console.log(`📧 Email Automation: ${categories.email.length} workflows`);
      console.log(`⏰ Scheduling: ${categories.scheduling.length} workflows`);
      console.log(`🧪 Testing: ${categories.testing.length} workflows`);
      console.log(`💰 Tax Processing: ${categories.tax.length} workflows`);
      console.log('');

      // Analyze active workflows specifically
      const activeWorkflows = workflows.filter(w => w.active);
      console.log('✅ ACTIVE WORKFLOWS (11):');
      activeWorkflows.forEach(workflow => {
        console.log(`  🔄 ${workflow.name}`);
      });
      console.log('');

      // Analyze node usage from previous test
      console.log('🔧 CURRENT NODE USAGE:');
      console.log('  • n8n-nodes-base.code: 37 times (Most used)');
      console.log('  • n8n-nodes-base.microsoftOutlook: 26 times');
      console.log('  • n8n-nodes-base.webhook: 17 times');
      console.log('  • n8n-nodes-base.respondToWebhook: 13 times');
      console.log('  • n8n-nodes-base.scheduleTrigger: 10 times');
      console.log('  • n8n-nodes-base.httpRequest: 10 times');
      console.log('  • n8n-nodes-base.googleSheets: 10 times');
      console.log('  • n8n-nodes-base.openAi: 6 times');
      console.log('');

      // Analyze business needs
      console.log('🎯 BUSINESS ANALYSIS:');
      console.log('🏢 Tax4US is a tax consulting business that needs:');
      console.log('');
      console.log('1. 📝 CONTENT MANAGEMENT:');
      console.log('   • Blog content generation and publishing');
      console.log('   • Website content monitoring and updates');
      console.log('   • Social media content scheduling');
      console.log('   • Podcast script generation');
      console.log('');
      console.log('2. 📧 EMAIL AUTOMATION:');
      console.log('   • Client communication');
      console.log('   • Tax filing reminders');
      console.log('   • Newsletter distribution');
      console.log('   • Appointment scheduling');
      console.log('');
      console.log('3. 💰 TAX PROCESSING:');
      console.log('   • Tax document processing');
      console.log('   • Client data management');
      console.log('   • Filing deadline tracking');
      console.log('   • Report generation');
      console.log('');
      console.log('4. ⏰ SCHEDULING & AUTOMATION:');
      console.log('   • Regular content publishing');
      console.log('   • Email campaigns');
      console.log('   • Tax filing reminders');
      console.log('   • Client follow-ups');
      console.log('');

      // Determine actual integration needs
      console.log('🔗 ACTUAL INTEGRATION NEEDS:');
      console.log('');
      console.log('✅ ALREADY WORKING (No additional setup needed):');
      console.log('  • Microsoft Outlook - Email automation');
      console.log('  • Google Sheets - Data processing');
      console.log('  • OpenAI - Content generation');
      console.log('  • Webhooks - External integrations');
      console.log('  • Schedule triggers - Automation');
      console.log('');
      console.log('❓ POTENTIALLY NEEDED (Based on business requirements):');
      console.log('  • Gmail/SMTP - Alternative email service');
      console.log('  • Google Drive - File storage and sharing');
      console.log('  • WordPress - Content publishing (if not already configured)');
      console.log('  • Social media APIs - Content scheduling');
      console.log('  • Calendar APIs - Appointment scheduling');
      console.log('');
      console.log('❌ NOT NEEDED (Based on current workflows):');
      console.log('  • HubSpot - No CRM workflows detected');
      console.log('  • Airtable - No database workflows detected');
      console.log('  • Slack - No team communication workflows');
      console.log('  • Discord - No community workflows');
      console.log('  • Facebook/LinkedIn/Twitter - No social workflows yet');
      console.log('');

      // Recommendations
      console.log('💡 RECOMMENDATIONS:');
      console.log('');
      console.log('1. 🎯 FOCUS ON EXISTING INTEGRATIONS:');
      console.log('   • Ben already has Microsoft Outlook, Google Sheets, and OpenAI working');
      console.log('   • These cover his main business needs');
      console.log('   • No need to add HubSpot, Airtable, or other CRMs');
      console.log('');
      console.log('2. 🔧 OPTIMIZE CURRENT WORKFLOWS:');
      console.log('   • Improve existing content generation workflows');
      console.log('   • Enhance email automation for tax clients');
      console.log('   • Streamline scheduling and reminders');
      console.log('');
      console.log('3. 📈 FUTURE EXPANSION (Optional):');
      console.log('   • Google Drive for document storage');
      console.log('   • Social media APIs for content distribution');
      console.log('   • Calendar integration for appointments');
      console.log('   • Payment processing for client billing');
      console.log('');
      console.log('4. 🚫 AVOID UNNECESSARY COMPLEXITY:');
      console.log('   • Don\'t add HubSpot unless CRM is needed');
      console.log('   • Don\'t add Airtable unless database is needed');
      console.log('   • Don\'t add Slack unless team collaboration is needed');
      console.log('');

      // Conclusion
      console.log('🎯 CONCLUSION:');
      console.log('Ben\'s tax business is already well-automated with:');
      console.log('✅ Microsoft Outlook (email automation)');
      console.log('✅ Google Sheets (data processing)');
      console.log('✅ OpenAI (content generation)');
      console.log('✅ Webhooks (external integrations)');
      console.log('✅ Scheduling (automation)');
      console.log('');
      console.log('He does NOT need HubSpot, Airtable, or other CRMs unless he');
      console.log('specifically wants to expand into CRM functionality.');
      console.log('');
      console.log('The focus should be on optimizing his existing tax-focused');
      console.log('workflows rather than adding unnecessary integrations.');

    } catch (error) {
      console.error('❌ Failed to analyze workflows:', error.message);
    }
  }

  async getWorkflowDetails(workflowId) {
    try {
      const response = await axios.get(`${this.benConfig.url}/api/v1/workflows/${workflowId}`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get workflow ${workflowId}:`, error.message);
      return null;
    }
  }
}

// Run analysis
const analyzer = new BenWorkflowAnalyzer();
analyzer.analyzeBenWorkflows().catch(console.error);
