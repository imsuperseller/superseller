import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    const agentRuns = await db.collection('agent_runs').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(agentRuns);
  } catch (error) {
    console.error('Error fetching agent runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent runs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const db = mongoose.connection.db;
    const result = await db.collection('agent_runs').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating agent run:', error);
    return NextResponse.json(
      { error: 'Failed to create agent run' },
      { status: 500 }
    );
  }
}
