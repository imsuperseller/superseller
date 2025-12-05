import { NextResponse } from 'next/server';

const N8N_BASE_URL = 'http://n8n.rensto.com';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0ODQ1NjEwfQ.n3hVnIsEL7Ra3fst8NUMVENPMrlDD-iN9M-0aQ62TrE';

export async function GET() {
  try {
    // Check n8n health
    const healthResponse = await fetch(`${N8N_BASE_URL}/healthz`);
    const healthData = await healthResponse.json();

    if (!healthResponse.ok) {
      return NextResponse.json({
        success: false,
        data: {
          status: 'unhealthy',
          message: 'n8n service is not responding',
          workflows: 0,
          activeWorkflows: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get workflows count
    const workflowsResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    let workflows = [];
    let activeWorkflows = 0;

    if (workflowsResponse.ok) {
      const workflowsData = await workflowsResponse.json();
      workflows = workflowsData.data || [];
      activeWorkflows = workflows.filter((wf: unknown) => wf.active).length;
    }

    return NextResponse.json({
      success: true,
      data: {
        status: healthData.status || 'healthy',
        message: 'n8n service is responding',
        workflows: workflows.length,
        activeWorkflows,
        workflows: workflows.slice(0, 10) // Return first 10 workflows for preview
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('n8n health check error:', error);
    
    return NextResponse.json({
      success: false,
      data: {
        status: 'error',
        message: 'Failed to connect to n8n service',
        workflows: 0,
        activeWorkflows: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    });
  }
}
