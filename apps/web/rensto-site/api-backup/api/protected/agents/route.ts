import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/lib/rbac';

// Example protected API route using RBAC
async function getAgents(req: NextRequest, context: unknown) {
  try {
    const { user, userRole } = context;

    // This demonstrates how RBAC middleware provides user context
    console.log(`User ${user.email} (${userRole}) accessing agents`);

    // Mock agent data - in real implementation, fetch from database
    const mockAgents = [
      {
        id: '1',
        name: 'Lead Qualification Agent',
        status: 'ready',
        lastRun: new Date().toISOString(),
        successRate: 95.2,
        ownerId: user.id,
      },
      {
        id: '2',
        name: 'Invoice Processing Agent',
        status: 'running',
        lastRun: new Date().toISOString(),
        successRate: 87.8,
        ownerId: '2', // Different owner
      },
    ];

    // Filter agents based on user role
    let filteredAgents = mockAgents;

    if (userRole === 'member') {
      // Members can only see their own agents
      filteredAgents = mockAgents.filter(agent => agent.ownerId === user.id);
    }

    return NextResponse.json({
      success: true,
      data: filteredAgents,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// Export the protected handler
export const GET = withRBAC(getAgents, { resource: 'agents', action: 'read' });
