import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Load Shelly's configuration
    const configPath = path.join(process.cwd(), 'config', 'n8n', 'shelly-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // Check n8n workflow status
    const n8nUrl = config.n8n.url;
    const n8nApiKey = config.n8n.apiKey;

    let workflowStatus = 'unknown';
    let credentials = config.n8n.credentials.required;

    try {
      // Check if n8n is running and workflow exists
      const workflowResponse = await fetch(`${n8nUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey
        }
      });

      if (workflowResponse.ok) {
        const workflows = await workflowResponse.json();
        const shellyWorkflow = workflows.data.find((w: any) => 
          w.name === 'Shelly Excel Family Profile Processor - Production'
        );

        if (shellyWorkflow) {
          workflowStatus = shellyWorkflow.active ? 'active' : 'inactive';
        } else {
          workflowStatus = 'missing';
        }
      }
    } catch (error) {
      console.error('Failed to check n8n status:', error);
      workflowStatus = 'error';
    }

    // Update integration status based on workflow status
    const missingComponents = [];
    if (workflowStatus === 'missing' || workflowStatus === 'error') {
      missingComponents.push('n8n_workflow');
    }
    if (credentials.some((c: any) => c.missing)) {
      missingComponents.push('n8n_credentials');
    }

    const integrationStatus = {
      status: missingComponents.length === 0 ? 'complete' : 'setup_required',
      missing_components: missingComponents,
      workflow_status: workflowStatus
    };

    return NextResponse.json({
      customer: config.customer,
      credentials,
      integration: integrationStatus,
      n8n: {
        url: n8nUrl,
        workflow_status: workflowStatus
      }
    });

  } catch (error) {
    console.error('Failed to load integration status:', error);
    return NextResponse.json(
      { error: 'Failed to load integration status' },
      { status: 500 }
    );
  }
}
