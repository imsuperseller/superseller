import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n';
import { withRBAC } from '@/lib/rbac';

// Get agent performance metrics
async function getAgentMetrics(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { id } = await params;

    const metrics = await n8nService.getAgentMetrics(id);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error(`Error fetching agent metrics ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch agent metrics' },
      { status: 500 }
    );
  }
}

// Export protected handler
export const GET = withRBAC(getAgentMetrics, {
  resource: 'agents',
  action: 'read',
});
