import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log('Triggering agent:', id);

    // Connect to database
    await connectToDatabase();

    // Get database connection
    const db = mongoose.connection.db;
    
    // Update agent directly in database
    const result = await db.collection('agents').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: { 
          status: 'ready',
          lastRun: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('Agent not found:', id);
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    console.log('Agent updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Agent triggered successfully',
      agentId: id,
      updated: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('Agent trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger agent' },
      { status: 500 }
    );
  }
}
