import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowName, workflowData, environment, customerId } = body;

    // Call the MCP server
    const mcpResponse = await fetch('https://customer-portal-mcp.service-46a.workers.dev/sse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'deploy_n8n_workflow',
          arguments: {
            workflowName,
            workflowData,
            environment: environment || 'production',
            customerId: customerId || 'internal'
          }
        }
      })
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP server error: ${mcpResponse.statusText}`);
    }

    const mcpData = await mcpResponse.json();
    
    if (mcpData.error) {
      throw new Error(`MCP tool error: ${mcpData.error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: mcpData.result,
      message: `Workflow '${workflowName}' deployed successfully to ${environment}`
    });

  } catch (error) {
    console.error('Error deploying n8n workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to deploy n8n workflow'
      },
      { status: 500 }
    );
  }
}
