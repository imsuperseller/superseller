import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AgentRun from '@/models/AgentRun';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = {};
    if (orgId) query.orgId = orgId;
    if (agentId) query.agentId = agentId;
    if (status) query.status = status;

    const runs = await AgentRun.find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .populate('agentId', 'name key icon')
      .lean(); // Convert to plain objects

    return NextResponse.json(runs);
  } catch (error) {
    console.error('Error fetching runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runs' },
      { status: 500 }
    );
  }
}
