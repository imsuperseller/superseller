#!/usr/bin/env node

/**
 * 🚀 SIMPLE RENSTO EMAIL AUTOMATION SYSTEM BUILDER
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Building Rensto Email Automation System...\n');

// Create workflows directory if it doesn't exist
const workflowsDir = path.join(process.cwd(), 'workflows');
if (!fs.existsSync(workflowsDir)) {
  fs.mkdirSync(workflowsDir, { recursive: true });
}

// 1. Email Processing Workflow
console.log('📧 Creating Email Processing Workflow...');
const emailProcessingWorkflow = {
  name: "Rensto Email Processing - service@rensto.com",
  nodes: [
    {
      id: "email_trigger",
      name: "Email Trigger",
      type: "n8n-nodes-base.emailReadImap",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        host: "outlook.office365.com",
        port: 993,
        secure: true,
        mailbox: "INBOX",
        markSeen: false,
        simple: false,
        filters: {
          from: "service@rensto.com"
        }
      }
    },
    {
      id: "email_analyzer",
      name: "Email Content Analyzer",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        jsCode: `
// Analyze incoming email content
const email = $input.first().json;

// Extract key information
const analysis = {
  sender: email.from,
  subject: email.subject,
  body: email.text || email.html,
  urgency: 'normal',
  category: 'general',
  customerId: null,
  projectId: null,
  requiresResponse: true,
  responseType: 'standard'
};

// Determine urgency based on keywords
const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'help'];
const urgentFound = urgentKeywords.some(keyword => 
  email.subject.toLowerCase().includes(keyword) || 
  (email.text && email.text.toLowerCase().includes(keyword))
);

if (urgentFound) {
  analysis.urgency = 'high';
}

// Determine category
if (email.subject.toLowerCase().includes('support') || email.subject.toLowerCase().includes('help')) {
  analysis.category = 'support';
  analysis.responseType = 'technical';
} else if (email.subject.toLowerCase().includes('sales') || email.subject.toLowerCase().includes('quote')) {
  analysis.category = 'sales';
  analysis.responseType = 'sales';
} else if (email.subject.toLowerCase().includes('project') || email.subject.toLowerCase().includes('status')) {
  analysis.category = 'project';
  analysis.responseType = 'project';
}

return {
  originalEmail: email,
  analysis: analysis,
  timestamp: new Date().toISOString()
};`
      }
    }
  ],
  connections: {
    "Email Trigger": {
      "main": [
        [
          {
            "node": "Email Content Analyzer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(
  path.join(workflowsDir, 'email-processing-workflow.json'),
  JSON.stringify(emailProcessingWorkflow, null, 2)
);
console.log('✅ Email Processing Workflow created');

// 2. Response Generation Workflow
console.log('🤖 Creating Response Generation Workflow...');
const responseGenerationWorkflow = {
  name: "Rensto AI Response Generator",
  nodes: [
    {
      id: "webhook_trigger",
      name: "Response Request Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        path: "generate-email-response",
        httpMethod: "POST"
      }
    },
    {
      id: "openai_generator",
      name: "OpenAI Response Generator",
      type: "n8n-nodes-base.openAi",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        resource: "chat",
        operation: "create",
        model: "gpt-4o-mini",
        messages: {
          values: [
            {
              role: "system",
              content: "You are a professional customer service representative for Rensto, an automation and business process optimization company. Respond to customer emails with helpful, professional, and solution-oriented messages. Always maintain a friendly but professional tone."
            },
            {
              role: "user",
              content: "Email Subject: {{ $json.subject }}\\n\\nEmail Content: {{ $json.content }}\\n\\nCustomer Info: {{ $json.customerInfo }}\\n\\nCategory: {{ $json.category }}\\n\\nGenerate an appropriate response:"
            }
          ]
        },
        temperature: 0.7,
        maxTokens: 500
      }
    }
  ],
  connections: {
    "Response Request Webhook": {
      "main": [
        [
          {
            "node": "OpenAI Response Generator",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(
  path.join(workflowsDir, 'response-generation-workflow.json'),
  JSON.stringify(responseGenerationWorkflow, null, 2)
);
console.log('✅ Response Generation Workflow created');

// 3. Customer Journey Integration
console.log('🔄 Creating Customer Journey Integration...');
const customerJourneyWorkflow = {
  name: "Rensto Customer Journey Integration",
  nodes: [
    {
      id: "webhook_trigger",
      name: "Customer Journey Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        path: "customer-journey-update",
        httpMethod: "POST"
      }
    },
    {
      id: "update_customer_record",
      name: "Update Customer Record",
      type: "n8n-nodes-base.airtable",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        operation: "update",
        base: {
          __rl: true,
          value: "appQijHhqqP4z6wGe", // Rensto Client Operations
          mode: "id"
        },
        table: {
          __rl: true,
          value: "tbl6BMipQQPJvPIWw", // Customers table
          mode: "id"
        },
        id: "={{ $json.customerId }}",
        columns: {
          mappingMode: "defineBelow",
          value: {
            "Last Contact": "={{ $now }}",
            "Status": "Active",
            "Notes": "={{ $json.interactionNotes }}"
          }
        }
      }
    }
  ],
  connections: {
    "Customer Journey Webhook": {
      "main": [
        [
          {
            "node": "Update Customer Record",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(
  path.join(workflowsDir, 'customer-journey-integration.json'),
  JSON.stringify(customerJourneyWorkflow, null, 2)
);
console.log('✅ Customer Journey Integration created');

// 4. Escalation Rules
console.log('⚠️ Creating Escalation Rules...');
const escalationWorkflow = {
  name: "Rensto Email Escalation Rules",
  nodes: [
    {
      id: "webhook_trigger",
      name: "Escalation Check Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        path: "check-escalation",
        httpMethod: "POST"
      }
    },
    {
      id: "escalation_logic",
      name: "Escalation Logic",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        jsCode: `
// Check if email requires escalation
const emailData = $input.first().json;
const escalationRules = {
  highUrgency: emailData.urgency === 'high',
  multipleEmails: emailData.emailCount > 3,
  complaintKeywords: ['complaint', 'dissatisfied', 'unhappy', 'problem', 'issue'],
  timeSinceLastResponse: emailData.hoursSinceLastResponse > 24
};

// Check for complaint keywords
const hasComplaint = escalationRules.complaintKeywords.some(keyword => 
  emailData.subject.toLowerCase().includes(keyword) || 
  emailData.body.toLowerCase().includes(keyword)
);

// Determine escalation level
let escalationLevel = 'none';
let escalateTo = null;

if (escalationRules.highUrgency || hasComplaint) {
  escalationLevel = 'immediate';
  escalateTo = 'winston@rensto.com'; // Sales/Management
} else if (escalationRules.multipleEmails || escalationRules.timeSinceLastResponse) {
  escalationLevel = 'standard';
  escalateTo = 'sarah@rensto.com'; // Project Management
}

return {
  ...emailData,
  escalation: {
    level: escalationLevel,
    escalateTo: escalateTo,
    reason: escalationLevel === 'immediate' ? 'High urgency or complaint detected' : 
            escalationLevel === 'standard' ? 'Multiple emails or delayed response' : 'No escalation needed',
    timestamp: new Date().toISOString()
  }
};`
      }
    }
  ],
  connections: {
    "Escalation Check Webhook": {
      "main": [
        [
          {
            "node": "Escalation Logic",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(
  path.join(workflowsDir, 'escalation-rules.json'),
  JSON.stringify(escalationWorkflow, null, 2)
);
console.log('✅ Escalation Rules created');

// 5. Analytics & Tracking
console.log('📊 Creating Analytics & Tracking...');
const analyticsWorkflow = {
  name: "Rensto Email Analytics & Tracking",
  nodes: [
    {
      id: "webhook_trigger",
      name: "Analytics Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        path: "email-analytics",
        httpMethod: "POST"
      }
    },
    {
      id: "track_metrics",
      name: "Track Email Metrics",
      type: "n8n-nodes-base.airtable",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        operation: "create",
        base: {
          __rl: true,
          value: "appQijHhqqP4z6wGe", // Rensto Client Operations
          mode: "id"
        },
        table: {
          __rl: true,
          value: "tblYR2UftNJ7nUl1Q", // Leads table (using for analytics)
          mode: "id"
        },
        columns: {
          mappingMode: "defineBelow",
          value: {
            "Lead Name": "Email Analytics: {{ $json.date }}",
            "Email": "analytics@rensto.com",
            "Source": "Email Automation",
            "Status": "Analytics",
            "Notes": "Response time: {{ $json.responseTime }}ms, Category: {{ $json.category }}, Urgency: {{ $json.urgency }}"
          }
        }
      }
    }
  ],
  connections: {
    "Analytics Webhook": {
      "main": [
        [
          {
            "node": "Track Email Metrics",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(
  path.join(workflowsDir, 'email-analytics.json'),
  JSON.stringify(analyticsWorkflow, null, 2)
);
console.log('✅ Analytics & Tracking created');

console.log('\n🎉 EMAIL AUTOMATION SYSTEM BUILD COMPLETE!');
console.log('\n📋 Created Workflows:');
console.log('1. email-processing-workflow.json');
console.log('2. response-generation-workflow.json');
console.log('3. customer-journey-integration.json');
console.log('4. escalation-rules.json');
console.log('5. email-analytics.json');

console.log('\n📋 Next Steps:');
console.log('1. Deploy workflows to n8n instance');
console.log('2. Configure email credentials');
console.log('3. Test with real emails');
console.log('4. Monitor and optimize');

console.log('\n✅ Email Automation System Ready for Deployment!');
