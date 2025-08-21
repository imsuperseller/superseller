import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BEN_N8N_CONFIG = {
  url: 'https://tax4usllc.app.n8n.cloud',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
};

export async function GET() {
  try {
    console.log('🔍 Fetching Ben\'s n8n cloud workflows...');
    
    const response = await axios.get(`${BEN_N8N_CONFIG.url}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey
      }
    });

    const workflows = response.data.data || response.data || [];
    
    console.log(`✅ Found ${workflows.length} workflows for Ben`);
    
    // Filter and format workflows
    const formattedWorkflows = workflows.map((workflow: { id: string; name: string; active: boolean; createdAt: string; updatedAt: string; tags?: string[]; description?: string }) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      tags: workflow.tags || [],
      description: workflow.description || ''
    }));

    return NextResponse.json({
      success: true,
      workflows: formattedWorkflows,
      total: formattedWorkflows.length,
      active: formattedWorkflows.filter((w: { active: boolean }) => w.active).length
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to fetch Ben\'s workflows:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workflows',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workflowData = await request.json();
    
    console.log('🚀 Creating new workflow for Ben...');
    
    const response = await axios.post(`${BEN_N8N_CONFIG.url}/api/v1/workflows`, workflowData, {
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey
      }
    });

    console.log(`✅ Created workflow: ${response.data.name}`);

    return NextResponse.json({
      success: true,
      workflow: response.data,
      message: 'Workflow created successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to create workflow:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create workflow',
      details: errorMessage
    }, { status: 500 });
  }
}
