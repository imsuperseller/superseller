import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive workflow management data
    // This would typically integrate with n8n, Zapier, or other workflow automation platforms
    
    // For now, return comprehensive mock data that demonstrates the full workflow management capability
    const workflows = [
      {
        id: 'wf_001',
        name: 'Customer Onboarding Automation',
        description: 'Automated customer onboarding process with email sequences and data collection',
        status: 'active',
        category: 'automation',
        executions: {
          total: 1247,
          successful: 1189,
          failed: 58,
          lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        performance: {
          averageExecutionTime: 45,
          successRate: 95.3,
          cost: 12.50
        },
        triggers: ['New Customer Signup', 'Form Submission'],
        nodes: 15,
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Shai Friedman'
      },
      {
        id: 'wf_002',
        name: 'Stripe Payment Processing',
        description: 'Process payments and update customer records in Airtable',
        status: 'active',
        category: 'integration',
        executions: {
          total: 3421,
          successful: 3398,
          failed: 23,
          lastRun: new Date(Date.now() - 30 * 1000).toISOString()
        },
        performance: {
          averageExecutionTime: 2.3,
          successRate: 99.3,
          cost: 8.75
        },
        triggers: ['Payment Success', 'Payment Failed'],
        nodes: 8,
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'System'
      },
      {
        id: 'wf_003',
        name: 'Lead Nurturing Campaign',
        description: 'Automated email sequences for lead nurturing and conversion',
        status: 'paused',
        category: 'notification',
        executions: {
          total: 892,
          successful: 845,
          failed: 47,
          lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        performance: {
          averageExecutionTime: 12,
          successRate: 94.7,
          cost: 5.20
        },
        triggers: ['New Lead', 'Email Opened', 'Link Clicked'],
        nodes: 12,
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Marketing Team'
      },
      {
        id: 'wf_004',
        name: 'Data Sync Airtable-Notion',
        description: 'Bidirectional sync between Airtable and Notion databases',
        status: 'error',
        category: 'data-processing',
        executions: {
          total: 156,
          successful: 134,
          failed: 22,
          lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        performance: {
          averageExecutionTime: 180,
          successRate: 85.9,
          cost: 15.80
        },
        triggers: ['Scheduled', 'Manual Trigger'],
        nodes: 20,
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Data Team'
      },
      {
        id: 'wf_005',
        name: 'Support Ticket Automation',
        description: 'Automated support ticket routing and escalation',
        status: 'active',
        category: 'automation',
        executions: {
          total: 567,
          successful: 556,
          failed: 11,
          lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        performance: {
          averageExecutionTime: 8,
          successRate: 98.1,
          cost: 3.40
        },
        triggers: ['New Support Ticket', 'Ticket Update'],
        nodes: 10,
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Support Team'
      }
    ];

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}
