import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n';
import { withRBAC } from '@/lib/rbac';

// Trigger agent execution
async function triggerAgent(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;
    const inputData = await req.json();

    // Validate input data
    if (!inputData || typeof inputData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Trigger the agent
    const execution = await n8nService.triggerAgent(id, inputData);

    return NextResponse.json({
      success: true,
      data: {
        executionId: execution.id,
        status: execution.status,
        startedAt: execution.startedAt,
        inputData,
      },
      message: 'Agent triggered successfully',
    });

  } catch (error) {
    console.error(`Error triggering agent ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to trigger agent' },
      { status: 500 }
    );
  }
}

// Get agent execution history
async function getAgentHistory(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const executions = await n8nService.getAgentExecutionHistory(id, limit);

    return NextResponse.json({
      success: true,
      data: executions,
      pagination: {
        limit,
        offset,
        total: executions.length,
      },
    });

  } catch (error) {
    console.error(`Error fetching agent history ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch agent history' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const POST = withRBAC(triggerAgent, { 
  resource: 'agents', 
  action: 'execute' 
});

export const GET = withRBAC(getAgentHistory, { 
  resource: 'agents', 
  action: 'read' 
});
