import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisType, timeRange, includeRecommendations } = body;

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
          name: 'analyze_rensto_performance',
          arguments: {
            analysisType: analysisType || 'system',
            timeRange: timeRange || '30d',
            includeRecommendations: includeRecommendations !== false
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
      message: `${analysisType} performance analysis completed`
    });

  } catch (error) {
    console.error('Error analyzing Rensto performance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze Rensto performance'
      },
      { status: 500 }
    );
  }
}
