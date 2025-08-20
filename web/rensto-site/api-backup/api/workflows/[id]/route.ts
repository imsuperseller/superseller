import { NextRequest, NextResponse } from 'next/server';
import { workflowAutomation } from '@/lib/workflow-automation';
import { withRBAC } from '@/lib/rbac';
import { withApiRateLimit } from '@/lib/rate-limiter';

// Get specific workflow
async function getWorkflow(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;

    const workflow = await workflowAutomation.getWorkflow(id);

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });

  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

// Update workflow
async function updateWorkflow(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;
    const updateData = await req.json();

    const workflow = await workflowAutomation.updateWorkflow(id, updateData);

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow updated successfully',
    });

  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// Delete workflow
async function deleteWorkflow(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;

    const deleted = await workflowAutomation.deleteWorkflow(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}

// Export with rate limiting and RBAC
export const GET = withApiRateLimit(
  withRBAC(getWorkflow, { resource: 'workflows', action: 'read' })
);

export const PUT = withApiRateLimit(
  withRBAC(updateWorkflow, { resource: 'workflows', action: 'update' })
);

export const DELETE = withApiRateLimit(
  withRBAC(deleteWorkflow, { resource: 'workflows', action: 'delete' })
);
