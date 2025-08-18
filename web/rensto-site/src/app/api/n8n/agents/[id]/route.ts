import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n';
import { withRBAC } from '@/lib/rbac';

// Get agent details
async function getAgent(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;
    
    const workflow = await n8nService.getWorkflow(id);
    const stats = await n8nService.getWorkflowStats(id);
    const webhooks = await n8nService.getWebhooks(id);
    
    return NextResponse.json({
      success: true,
      data: {
        ...workflow,
        stats,
        webhooks,
      },
    });

  } catch (error) {
    console.error(`Error fetching agent ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// Update agent
async function updateAgent(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;
    const updateData = await req.json();

    const updatedWorkflow = await n8nService.updateWorkflow(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: 'Agent updated successfully',
    });

  } catch (error) {
    console.error(`Error updating agent ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// Delete agent
async function deleteAgent(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;

    await n8nService.deleteWorkflow(id);

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });

  } catch (error) {
    console.error(`Error deleting agent ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = withRBAC(getAgent, { 
  resource: 'agents', 
  action: 'read' 
});

export const PUT = withRBAC(updateAgent, { 
  resource: 'agents', 
  action: 'update' 
});

export const DELETE = withRBAC(deleteAgent, { 
  resource: 'agents', 
  action: 'delete' 
});
