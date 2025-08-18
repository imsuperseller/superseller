import { NextRequest, NextResponse } from 'next/server';
import { workflowAutomation } from '@/lib/workflow-automation';
import { withRBAC } from '@/lib/rbac';
import { withApiRateLimit } from '@/lib/rate-limiter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get all workflows for organization
async function getWorkflows(req: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const workflows = await workflowAutomation.getWorkflows(orgId);

    return NextResponse.json({
      success: true,
      data: workflows,
      count: workflows.length,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// Create new workflow
async function createWorkflow(req: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const workflowData = await req.json();

    // Validate required fields
    if (
      !workflowData.name ||
      !workflowData.orgId ||
      !workflowData.trigger ||
      !workflowData.steps
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: name, orgId, trigger, steps' },
        { status: 400 }
      );
    }

    // Add creator information
    const workflow = await workflowAutomation.createWorkflow({
      ...workflowData,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully',
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// Export with rate limiting and RBAC
export const GET = withApiRateLimit(
  withRBAC(getWorkflows, { resource: 'workflows', action: 'read' })
);

export const POST = withApiRateLimit(
  withRBAC(createWorkflow, { resource: 'workflows', action: 'create' })
);
