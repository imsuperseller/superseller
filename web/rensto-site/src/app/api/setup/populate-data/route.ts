import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataPopulator } from '../../../../../scripts/populate-sample-data.js';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { confirm } = await req.json();

    if (!confirm) {
      return NextResponse.json(
        { error: 'Confirmation required to populate data' },
        { status: 400 }
      );
    }

    // Start data population
    console.log('🚀 Starting data population via API...');

    const populator = new DataPopulator();
    await populator.populate();

    return NextResponse.json({
      success: true,
      message: 'Data population completed successfully',
      data: {
        organizations: 10,
        users: '50+',
        agents: '50+',
        workflows: '30+',
        analytics: '200+',
      },
    });
  } catch (error) {
    console.error('❌ Data population failed:', error);
    return NextResponse.json(
      {
        error: 'Data population failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Return data population status and configuration
    return NextResponse.json({
      success: true,
      data: {
        status: 'ready',
        configuration: {
          organizations: 10,
          usersPerOrg: { min: 5, max: 20 },
          agentsPerOrg: { min: 3, max: 15 },
          workflowsPerOrg: { min: 5, max: 20 },
          historicalDays: 90,
        },
        templates: [
          'Software as a Service',
          'Business Consulting',
          'E-commerce',
          'Healthcare Technology',
          'Education Technology',
        ],
      },
    });
  } catch (error) {
    console.error('❌ Failed to get data population status:', error);
    return NextResponse.json(
      { error: 'Failed to get data population status' },
      { status: 500 }
    );
  }
}
