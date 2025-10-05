#!/usr/bin/env node

const https = require('https');
const http = require('http');

// API Configuration
const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN || 'tfp_23fioVVoCFUNXHt3iGaUGFdkGLLSch3ayhYRvVupwGJm_3pYPDbJ396ECL3';
const TYPEFORM_API_BASE = 'https://api.typeform.com';
const AIRTABLE_API_KEY = 'AIRTABLE_KEY_REDACTED';
const AIRTABLE_BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation base
const N8N_URL = 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

async function createTypeform(formData) {
  const response = await makeRequest(`${TYPEFORM_API_BASE}/forms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: formData
  });
  return response;
}

async function syncToAirtable(workflowData) {
  const response = await makeRequest(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/n8n%20Workflows`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: { fields: workflowData }
  });
  return response;
}

async function getAllN8NWorkflows() {
  const response = await makeRequest(`${N8N_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  return response.statusCode === 200 ? response.data.data : [];
}

// Typeform 1: Ready Solutions Industry Quiz
const readySolutionsQuiz = {
  title: 'Ready Solutions Industry Quiz',
  type: 'quiz',
  workspace: { href: 'https://api.typeform.com/workspaces/default' },
  settings: {
    is_public: true,
    show_progress_bar: true,
    show_typeform_branding: false
  },
  welcome_screens: [{
    title: 'Find Your Perfect Industry Automation Package',
    properties: {
      description: 'Answer 5 quick questions and we\'ll recommend the exact solutions for your business.',
      button_text: 'Start Quiz →'
    }
  }],
  thankyou_screens: [{
    title: 'Perfect! Check Your Email 📧',
    properties: {
      description: 'We\'re sending your personalized industry automation package recommendation to your inbox right now.\n\n You\'ll get:\n✓ Recommended solutions for your industry\n✓ Pricing breakdown\n✓ Implementation timeline\n✓ Industry case study\n\nExpected: Within 2 minutes',
      button_text: 'Browse All Solutions →',
      button_url: 'https://rensto.com/solutions'
    }
  }],
  fields: [
    {
      title: 'What industry are you in?',
      type: 'dropdown',
      properties: {
        choices: [
          { label: 'HVAC' }, { label: 'Roofer' }, { label: 'Realtor' },
          { label: 'Insurance Agent' }, { label: 'Synagogue' }, { label: 'Torah Teacher' },
          { label: 'Locksmith' }, { label: 'Busy Mom' }, { label: 'Photographer' },
          { label: 'Dentist' }, { label: 'E-commerce' }, { label: 'Fence Contractor' },
          { label: 'Product Supplier' }, { label: 'Bookkeeping/Tax' }, { label: 'Lawyer' },
          { label: 'Amazon Seller' }, { label: 'Other' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'What\'s your BIGGEST time-waster right now?',
      type: 'multiple_choice',
      properties: {
        choices: [
          { label: 'Manual data entry' }, { label: 'Scheduling/calendar management' },
          { label: 'Follow-up emails/calls' }, { label: 'Invoice/payment processing' },
          { label: 'Lead qualification' }, { label: 'Report generation' },
          { label: 'Customer communication' }, { label: 'Document management' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'How many people work in your business?',
      type: 'number',
      validations: { required: true, min_value: 1, max_value: 1000 }
    },
    {
      title: 'What tools do you currently use? (Select all that apply)',
      type: 'multiple_choice',
      properties: {
        allow_multiple_selection: true,
        choices: [
          { label: 'Google Workspace (Gmail, Calendar, Drive)' },
          { label: 'Microsoft Office 365' }, { label: 'Salesforce' },
          { label: 'HubSpot' }, { label: 'QuickBooks' }, { label: 'Stripe' },
          { label: 'Mailchimp' }, { label: 'Shopify' }, { label: 'WordPress' },
          { label: 'Facebook/Instagram' }, { label: 'None / Other' }
        ]
      },
      validations: { required: false }
    },
    {
      title: 'When do you want to start?',
      type: 'multiple_choice',
      properties: {
        choices: [
          { label: 'This week (urgent)' }, { label: 'This month (ready soon)' },
          { label: 'Next 1-3 months (planning)' }, { label: 'Just exploring (no rush)' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'Where should we send your personalized recommendation?',
      type: 'email',
      validations: { required: true }
    }
  ]
};

// Typeform 2: FREE 50 Leads Sample
const freeLeadsSample = {
  title: 'Get 50 FREE Sample Leads',
  type: 'form',
  workspace: { href: 'https://api.typeform.com/workspaces/default' },
  settings: {
    is_public: true,
    show_progress_bar: true
  },
  welcome_screens: [{
    title: 'Get 50 FREE Sample Leads 🎯',
    properties: {
      description: 'No credit card required. See the quality for yourself.',
      button_text: 'Get My Free Leads →'
    }
  }],
  thankyou_screens: [{
    title: 'Your FREE 50 Leads Are Being Generated! ⚡',
    properties: {
      description: 'We\'re pulling 50 high-quality leads matching your criteria.\n\nWhat you\'ll receive:\n✓ 50 verified business contacts\n✓ Email addresses + phone numbers\n✓ Company name + location\n✓ CSV file (ready to import)\n\nDelivery: Within 24 hours',
      button_text: 'See Our Pricing →',
      button_url: 'https://rensto.com/subscriptions#pricing'
    }
  }],
  fields: [
    {
      title: 'Where should we send your 50 free leads?',
      type: 'email',
      validations: { required: true }
    },
    {
      title: 'What industry are you in?',
      type: 'dropdown',
      properties: {
        choices: [
          { label: 'Insurance' }, { label: 'Real Estate' }, { label: 'HVAC/Home Services' },
          { label: 'Financial Services' }, { label: 'Legal Services' }, { label: 'Healthcare' },
          { label: 'E-commerce' }, { label: 'B2B SaaS' }, { label: 'Marketing Agency' }, { label: 'Other' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'What city/state do you want leads from?',
      type: 'short_text',
      properties: { description: 'e.g., "Chicago, IL" or "California"' },
      validations: { required: true }
    },
    {
      title: 'What type of businesses do you want to reach?',
      type: 'short_text',
      properties: { description: 'e.g., "Small business owners with 10-50 employees"' },
      validations: { required: true }
    },
    {
      title: 'Where should we source your leads? (Select all that apply)',
      type: 'multiple_choice',
      properties: {
        allow_multiple_selection: true,
        choices: [
          { label: 'LinkedIn (business professionals)' },
          { label: 'Google Maps (local businesses)' },
          { label: 'Facebook (groups/pages)' },
          { label: 'Apify (web scraping)' }
        ]
      },
      validations: { required: true }
    }
  ]
};

// Typeform 3: Marketplace Template Request
const templateRequest = {
  title: 'Request a Custom Template',
  type: 'form',
  workspace: { href: 'https://api.typeform.com/workspaces/default' },
  settings: {
    is_public: true,
    show_progress_bar: true
  },
  welcome_screens: [{
    title: 'Don\'t See the Template You Need? 🔍',
    properties: {
      description: 'Tell us what workflow you want to automate and we\'ll build it.',
      button_text: 'Request a Template →'
    }
  }],
  thankyou_screens: [{
    title: 'Request Received! 🚀',
    properties: {
      description: 'We\'ll review your template request and get back to you within 48 hours.\n\nWhat happens next:\n✓ We\'ll assess complexity & feasibility\n✓ Send you a quote + timeline\n✓ Build the template if approved\n✓ Deliver with installation guide',
      button_text: 'Browse Templates →',
      button_url: 'https://rensto.com/marketplace#categories'
    }
  }],
  fields: [
    { title: 'Your email address', type: 'email', validations: { required: true } },
    {
      title: 'What would you call this template?',
      type: 'short_text',
      properties: { description: 'e.g., "Shopify Order to QuickBooks Invoice"' },
      validations: { required: true }
    },
    {
      title: 'Describe the workflow you want to automate',
      type: 'long_text',
      properties: { description: 'Explain what should happen automatically' },
      validations: { required: true }
    },
    {
      title: 'Which tools need to connect? (Select all that apply)',
      type: 'multiple_choice',
      properties: {
        allow_multiple_selection: true,
        choices: [
          { label: 'Shopify' }, { label: 'Salesforce' }, { label: 'HubSpot' },
          { label: 'Gmail' }, { label: 'Slack' }, { label: 'QuickBooks' },
          { label: 'Stripe' }, { label: 'WordPress' }, { label: 'Google Sheets' },
          { label: 'Airtable' }, { label: 'Mailchimp' }, { label: 'Other' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'How urgently do you need this?',
      type: 'multiple_choice',
      properties: {
        choices: [
          { label: 'ASAP (willing to pay premium)' },
          { label: 'Within 1-2 weeks' },
          { label: 'Within 1 month' },
          { label: 'No rush (just exploring)' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'What\'s your budget for this template?',
      type: 'multiple_choice',
      properties: {
        choices: [
          { label: 'Under $100 (DIY template)' },
          { label: '$100-$300 (Advanced template)' },
          { label: '$300-$1,000 (Custom build)' },
          { label: '$1,000+ (Full-service)' }
        ]
      },
      validations: { required: false }
    }
  ]
};

// Typeform 4: Readiness Scorecard
const readinessScorecard = {
  title: 'Automation Readiness Assessment',
  type: 'quiz',
  workspace: { href: 'https://api.typeform.com/workspaces/default' },
  settings: {
    is_public: true,
    show_progress_bar: true
  },
  welcome_screens: [{
    title: 'Is Your Business Ready for Custom Automation? 📊',
    properties: {
      description: 'Take our 2-minute assessment and get a FREE readiness scorecard.',
      button_text: 'Start Assessment →'
    }
  }],
  thankyou_screens: [{
    title: 'Calculating Your Readiness Score... ⚡',
    properties: {
      description: 'We\'re analyzing your responses and generating your personalized automation readiness scorecard.\n\nYou\'ll receive:\n✓ Your Readiness Score (0-100)\n✓ Top 3 automation opportunities\n✓ Estimated ROI for each\n✓ Recommended implementation timeline\n\nDelivery: Check your email in 2 minutes!',
      button_text: 'Book FREE Consultation →',
      button_url: 'https://form.typeform.com/to/01JKTNHQXKAWM6W90F0A6JQNJ7'
    }
  }],
  fields: [
    { title: 'What\'s your business name?', type: 'short_text', validations: { required: true } },
    { title: 'Your email', type: 'email', validations: { required: true } },
    {
      title: 'How many repetitive tasks do you do manually each week?',
      type: 'multiple_choice',
      properties: {
        choices: [
          { label: '0-5 (minimal)' }, { label: '6-15 (moderate)' },
          { label: '16-30 (significant)' }, { label: '31+ (overwhelming)' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'What automation tools do you currently use?',
      type: 'multiple_choice',
      properties: {
        allow_multiple_selection: true,
        choices: [
          { label: 'None (we\'re manual)' }, { label: 'Zapier/Make' },
          { label: 'Native integrations' }, { label: 'Custom scripts' },
          { label: 'Other automation tools' }
        ]
      },
      validations: { required: true }
    },
    {
      title: 'How many people work in your business?',
      type: 'number',
      validations: { required: true, min_value: 1 }
    },
    {
      title: 'What\'s the #1 workflow you want to automate first?',
      type: 'long_text',
      properties: { description: 'Describe the most time-consuming or error-prone process' },
      validations: { required: true }
    },
    {
      title: 'What budget have you allocated for automation?',
      type: 'multiple_choice',
      properties: {
        choices: [
          { label: 'Haven\'t thought about it yet' },
          { label: 'Under $5,000' },
          { label: '$5,000-$10,000' },
          { label: '$10,000-$25,000' },
          { label: '$25,000+' }
        ]
      },
      validations: { required: false }
    }
  ]
};

async function main() {
  console.log('🚀 CREATING TYPEFORMS AND SYNCING TO AIRTABLE\n');
  console.log('='.repeat(60) + '\n');

  // Part 1: Create Typeforms
  console.log('📝 PART 1: Creating 4 Typeforms\n');

  const typeforms = [
    { name: 'Ready Solutions Industry Quiz', data: readySolutionsQuiz },
    { name: 'FREE 50 Leads Sample', data: freeLeadsSample },
    { name: 'Marketplace Template Request', data: templateRequest },
    { name: 'Automation Readiness Scorecard', data: readinessScorecard }
  ];

  const createdForms = [];

  for (const form of typeforms) {
    process.stdout.write(`Creating: ${form.name}... `);
    try {
      const result = await createTypeform(form.data);
      if (result.statusCode === 201 && result.data) {
        console.log(`✅ ID: ${result.data.id}`);
        createdForms.push({
          name: form.name,
          id: result.data.id,
          url: `https://form.typeform.com/to/${result.data.id}`
        });
      } else {
        console.log(`❌ Status: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Part 2: Sync n8n workflows to Airtable
  console.log('\n📊 PART 2: Syncing n8n Workflows to Airtable\n');

  const workflows = await getAllN8NWorkflows();
  console.log(`Found ${workflows.length} n8n workflows\n`);

  let synced = 0;
  let failed = 0;

  for (const wf of workflows) {
    // Determine category
    let businessModel = 'Other';
    let category = 'Other';

    if (wf.name.startsWith('INT-')) {
      businessModel = 'Internal';
      if (wf.name.includes('LEAD')) category = 'Lead Generation';
      else if (wf.name.includes('EMAIL')) category = 'Email Automation';
      else if (wf.name.includes('TECH')) category = 'Technical Integration';
      else if (wf.name.includes('MONITOR')) category = 'Monitoring';
      else if (wf.name.includes('CUSTOMER')) category = 'Customer Management';
    } else if (wf.name.startsWith('SUB-')) {
      businessModel = 'Subscription';
      category = wf.name.includes('LEAD') ? 'Lead Generation' : 'Finance';
    } else if (wf.name.startsWith('MKT-')) {
      businessModel = 'Marketplace';
      category = wf.name.includes('LEAD') ? 'Lead Generation' : 'Content Marketing';
    } else if (wf.name.startsWith('DEV-')) {
      businessModel = 'Development';
      category = 'Utility';
    } else if (wf.name.includes('[ARCHIVED]')) {
      businessModel = 'Archived';
      category = 'Old Version';
    }

    const airtableData = {
      'Workflow Name': wf.name,
      'Workflow ID': wf.id,
      'Business Model': businessModel,
      'Category': category,
      'Status': wf.active ? 'Active' : 'Inactive',
      'Node Count': wf.nodes ? wf.nodes.length : 0,
      'Created At': wf.createdAt,
      'Updated At': wf.updatedAt
    };

    process.stdout.write(`  Syncing: ${wf.name.substring(0, 40)}... `);
    try {
      const result = await syncToAirtable(airtableData);
      if (result.statusCode === 200) {
        console.log('✅');
        synced++;
      } else {
        console.log(`❌ (${result.statusCode})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      failed++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS:\n');
  console.log(`Typeforms created: ${createdForms.length}/4`);
  console.log(`n8n workflows synced to Airtable: ${synced}/${workflows.length}`);
  console.log(`Failed: ${failed}\n`);

  if (createdForms.length > 0) {
    console.log('🎉 NEW TYPEFORM IDS:');
    createdForms.forEach(f => {
      console.log(`  ${f.name}:`);
      console.log(`    ID: ${f.id}`);
      console.log(`    URL: ${f.url}`);
    });
  }
}

main().catch(err => console.error('Error:', err.message));
