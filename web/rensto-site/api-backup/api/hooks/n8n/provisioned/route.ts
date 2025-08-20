import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS, Agent } from '@/lib/models';
import { ObjectId } from 'mongodb';

// n8n webhook for agent provisioning
export async function POST(req: NextRequest) {
  try {
    const webhookData = await req.json();

    // Validate webhook data
    if (!webhookData.workflowId || !webhookData.organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract data from webhook
    const {
      workflowId,
      organizationId,
      agentName,
      agentDescription,
      triggers,
      dataSources,
      settings,
      webhookUrl,
    } = webhookData;

    // Get organization
    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
    const organization = await orgsCollection.findOne({
      _id: new ObjectId(organizationId),
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create or update agent
    const agentsCollection = await getCollection(COLLECTIONS.AGENTS);

    const agentData: Omit<Agent, '_id'> = {
      name: agentName || `Agent ${workflowId}`,
      description: agentDescription || 'Automated workflow agent',
      orgId: organization._id,
      createdBy: new ObjectId(), // System user
      type: 'workflow',
      status: 'active',
      config: {
        workflowId,
        n8nWebhookUrl: webhookUrl,
        triggers: triggers || [],
        dataSources: dataSources || [],
        settings: settings || {},
      },
      metrics: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageExecutionTime: 0,
      },
      tags: ['n8n', 'provisioned'],
      isPublic: false,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if agent already exists
    const existingAgent = await agentsCollection.findOne({
      'config.workflowId': workflowId,
      orgId: organization._id,
    });

    let agent;
    if (existingAgent) {
      // Update existing agent
      const result = await agentsCollection.findOneAndUpdate(
        { _id: existingAgent._id },
        {
          $set: {
            ...agentData,
            _id: existingAgent._id,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );
      agent = result;
    } else {
      // Create new agent
      const result = await agentsCollection.insertOne(agentData);
      agent = { ...agentData, _id: result.insertedId };
    }

    // Log the provisioning event
    const eventsCollection = await getCollection(COLLECTIONS.EVENTS);
    await eventsCollection.insertOne({
      orgId: organization._id,
      userId: new ObjectId(), // System user
      type: 'agent_provisioned',
      action: existingAgent ? 'updated' : 'created',
      resource: 'agent',
      resourceId: agent._id,
      metadata: {
        workflowId,
        agentName: agent.name,
        webhookUrl,
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.ip,
      userAgent: req.headers.get('user-agent'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        agentId: agent._id,
        status: 'provisioned',
        message: `Agent ${existingAgent ? 'updated' : 'created'} successfully`,
      },
    });
  } catch (error) {
    console.error('n8n provisioning webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to provision agent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check for the webhook
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'n8n provisioning webhook is operational',
    timestamp: new Date().toISOString(),
  });
}
