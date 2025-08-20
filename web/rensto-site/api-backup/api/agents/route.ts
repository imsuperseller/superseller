import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';

export async function GET() {
  try {
    await connectToDatabase();
    const agents = await Agent.find({}).sort({ createdAt: -1 });
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const agent = new Agent({
      name: body.name,
      key: body.key,
      description: body.description,
      status: body.status || 'draft',
      icon: body.icon || '🤖',
      tags: body.tags || [],
      capabilities: body.capabilities || [],
      pricing: body.pricing || { model: 'per_run', rate: 0 },
      isActive: body.isActive || false,
      schedule: body.schedule || 'manual',
      dependencies: body.dependencies || [],
    });

    await agent.save();
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
