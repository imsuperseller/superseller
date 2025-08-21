import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, timeRange, includeMetrics, action } = body;

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
          name: 'monitor_n8n_execution',
          arguments: {
            workflowId,
            timeRange: timeRange || '24h',
            includeMetrics: includeMetrics !== false
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
      message: `Execution monitoring data retrieved for workflow ${workflowId}`
    });

  } catch (error) {
    console.error('Error monitoring n8n execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to monitor n8n execution'
      },
      { status: 500 }
    );
  }
}
