import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();
    const { id } = await params;

    await connectToDatabase();

    const agent = await Agent.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agent,
      message: `Agent ${isActive ? 'activated' : 'paused'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling agent:', error);
    return NextResponse.json(
      { error: 'Failed to toggle agent status' },
      { status: 500 }
    );
  }
}
