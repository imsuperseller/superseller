import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS, AgentRun } from '@/lib/models';
import { ObjectId } from 'mongodb';

// n8n webhook for agent execution tracking
export async function POST(req: NextRequest) {
  try {
    const webhookData = await req.json();
    
    // Validate webhook data
    if (!webhookData.workflowId || !webhookData.executionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract data from webhook
    const {
      workflowId,
      executionId,
      organizationId,
      status,
      startedAt,
      endedAt,
      durationMs,
      input,
      output,
      error,
      metadata,
    } = webhookData;

    // Get organization
    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
    const organization = await orgsCollection.findOne({ 
      _id: new ObjectId(organizationId) 
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get agent by workflow ID
    const agentsCollection = await getCollection(COLLECTIONS.AGENTS);
    const agent = await agentsCollection.findOne({ 
      'config.workflowId': workflowId,
      orgId: organization._id 
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Create agent run record
    const agentRunsCollection = await getCollection(COLLECTIONS.AGENT_RUNS);
    
    const agentRun: Omit<AgentRun, '_id'> = {
      agentId: agent._id,
      orgId: organization._id,
      triggeredBy: new ObjectId(), // System user
      status: status || 'success',
      startedAt: new Date(startedAt || Date.now()),
      endedAt: endedAt ? new Date(endedAt) : undefined,
      durationMs: durationMs || 0,
      input: input || {},
      output: output || {},
      error: error ? {
        message: error.message || 'Unknown error',
        stack: error.stack,
        code: error.code,
      } : undefined,
      metadata: {
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        source: metadata?.source || 'webhook',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await agentRunsCollection.insertOne(agentRun);

    // Update agent metrics
    const updateData: unknown = {
      $inc: {
        'metrics.totalRuns': 1,
      },
      $set: {
        'metrics.lastRunAt': new Date(),
        updatedAt: new Date(),
      },
    };

    if (status === 'success') {
      updateData.$inc['metrics.successfulRuns'] = 1;
    } else if (status === 'error') {
      updateData.$inc['metrics.failedRuns'] = 1;
    }

    if (durationMs) {
      // Update average execution time
      const currentAvg = agent.metrics.averageExecutionTime;
      const totalRuns = agent.metrics.totalRuns + 1;
      const newAvg = ((currentAvg * agent.metrics.totalRuns) + durationMs) / totalRuns;
      updateData.$set['metrics.averageExecutionTime'] = newAvg;
    }

    await agentsCollection.updateOne(
      { _id: agent._id },
      updateData
    );

    // Log the execution event
    const eventsCollection = await getCollection(COLLECTIONS.EVENTS);
    await eventsCollection.insertOne({
      orgId: organization._id,
      userId: new ObjectId(), // System user
      type: 'agent_execution',
      action: status,
      resource: 'agent',
      resourceId: agent._id,
      metadata: {
        workflowId,
        executionId,
        agentName: agent.name,
        durationMs,
        status,
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.ip,
      userAgent: req.headers.get('user-agent'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        runId: result.insertedId,
        status: 'tracked',
        message: 'Agent execution tracked successfully',
      },
    });

  } catch (error) {
    console.error('n8n execution webhook error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to track agent execution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check for the webhook
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'n8n execution webhook is operational',
    timestamp: new Date().toISOString(),
  });
}
