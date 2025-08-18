import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';

export async function GET() {
  try {
    await connectToDatabase();
    const agents = await Agent.find({}).limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection working',
      agentCount: agents.length,
      sampleAgent: agents[0] || null
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
