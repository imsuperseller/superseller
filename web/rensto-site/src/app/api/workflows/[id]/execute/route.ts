import { NextRequest, NextResponse } from 'next/server';
import { workflowAutomation } from '@/lib/workflow-automation';
import { withRBAC } from '@/lib/rbac';
import { withApiRateLimit } from '@/lib/rate-limiter';

// Execute workflow
async function executeWorkflow(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;
    const variables = await req.json();

    const execution = await workflowAutomation.executeWorkflow(id, variables);

    return NextResponse.json({
      success: true,
      data: execution,
      message: 'Workflow execution started',
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to execute workflow',
      },
      { status: 500 }
    );
  }
}

// Get workflow executions
async function getWorkflowExecutions(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;

    const executions = await workflowAutomation.getExecutions(id);

    return NextResponse.json({
      success: true,
      data: executions,
      count: executions.length,
    });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow executions' },
      { status: 500 }
    );
  }
}

// Export with rate limiting and RBAC
export const POST = withApiRateLimit(
  withRBAC(executeWorkflow, { resource: 'workflows', action: 'execute' })
);

export const GET = withApiRateLimit(
  withRBAC(getWorkflowExecutions, { resource: 'workflows', action: 'read' })
);
