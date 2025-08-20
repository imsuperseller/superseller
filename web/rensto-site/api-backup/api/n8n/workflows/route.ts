import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n';
import { withRBAC } from '@/lib/rbac';

// Get all workflows
async function getWorkflows(req: NextRequest, context: unknown) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'all' | 'agents' | 'workflows'
    
    let workflows;
    
    if (type === 'agents') {
      workflows = await n8nService.getAgentWorkflows();
    } else {
      workflows = await n8nService.getWorkflows();
    }
    
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
    const { user } = context;
    const workflowData = await req.json();

    // Add metadata
    const workflow = {
      ...workflowData,
      tags: [...(workflowData.tags || []), 'created-by-portal'],
      settings: {
        ...workflowData.settings,
        createdBy: user.email,
        organizationId: user.orgId,
        createdAt: new Date().toISOString(),
      },
    };

    const newWorkflow = await n8nService.createWorkflow(workflow);

    return NextResponse.json({
      success: true,
      data: newWorkflow,
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

// Export protected handlers
export const GET = withRBAC(getWorkflows, { 
  resource: 'agents', 
  action: 'read' 
});

export const POST = withRBAC(createWorkflow, { 
  resource: 'agents', 
  action: 'create' 
});
