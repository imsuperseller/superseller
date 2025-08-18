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

    const { schedule } = await request.json();
    const { id } = await params;

    // Validate schedule
    const validSchedules = ['manual', 'daily', 'weekly', 'monthly'];
    if (!validSchedules.includes(schedule)) {
      return NextResponse.json(
        {
          error:
            'Invalid schedule. Must be one of: manual, daily, weekly, monthly',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const agent = await Agent.findByIdAndUpdate(
      id,
      { schedule },
      { new: true }
    );

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agent,
      message: `Agent schedule updated to ${schedule}`,
    });
  } catch (error) {
    console.error('Error updating agent schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update agent schedule' },
      { status: 500 }
    );
  }
}
