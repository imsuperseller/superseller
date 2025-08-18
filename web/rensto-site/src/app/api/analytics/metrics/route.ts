import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Agent } from '@/models/Agent';
import Organization from '@/models/Organization';

export async function GET() {
  try {
    await dbConnect();

    // Get basic metrics
    const [totalAgents, totalOrganizations] = await Promise.all([
      Agent.countDocuments(),
      Organization.countDocuments(),
    ]);

    // Calculate some basic analytics
    const totalRevenue = totalAgents * 50; // Mock revenue calculation
    const activeProjects = Math.floor(totalAgents * 0.8); // Mock active projects

    // Mock recent activity
    const recentActivity = [
      {
        id: '1',
        type: 'agent_run',
        description: 'Lead Intake Agent completed successfully',
        timestamp: new Date().toISOString(),
        status: 'success' as const,
      },
      {
        id: '2',
        type: 'user_signup',
        description: 'New user registered: john@example.com',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'info' as const,
      },
      {
        id: '3',
        type: 'payment',
        description: 'Payment received: $1,500',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'success' as const,
      },
    ];

    return NextResponse.json({
      totalRevenue,
      activeProjects,
      recentActivity,
      totalAgents,
      totalOrganizations,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
