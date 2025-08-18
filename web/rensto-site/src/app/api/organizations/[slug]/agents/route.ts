import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS, Agent } from '@/lib/models';
import { withRBAC } from '@/lib/rbac';
import { ObjectId } from 'mongodb';

// Get agents for organization
async function getOrganizationAgents(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { slug } = await params;

    // First get the organization to get its ID
    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
    const organization = await orgsCollection.findOne({ slug });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get agents for this organization
    const agentsCollection = await getCollection(COLLECTIONS.AGENTS);
    const agents = await agentsCollection
      .find({
        orgId: organization._id,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Error fetching organization agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// Create agent for organization
async function createOrganizationAgent(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { slug } = await params;
    const { user } = context;
    const agentData = await req.json();

    // First get the organization to get its ID
    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
    const organization = await orgsCollection.findOne({ slug });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create the agent
    const agentsCollection = await getCollection(COLLECTIONS.AGENTS);

    const agent: Omit<Agent, '_id'> = {
      name: agentData.name,
      description: agentData.description,
      orgId: organization._id,
      createdBy: new ObjectId(user.id),
      type: agentData.type || 'workflow',
      status: 'draft',
      config: {
        workflowId: agentData.workflowId,
        n8nWebhookUrl: agentData.n8nWebhookUrl,
        triggers: agentData.triggers || [],
        dataSources: agentData.dataSources || [],
        settings: agentData.settings || {},
      },
      metrics: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageExecutionTime: 0,
      },
      tags: agentData.tags || [],
      isPublic: agentData.isPublic || false,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await agentsCollection.insertOne(agent);

    return NextResponse.json({
      success: true,
      data: { ...agent, _id: result.insertedId },
      message: 'Agent created successfully',
    });
  } catch (error) {
    console.error('Error creating organization agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = withRBAC(getOrganizationAgents, {
  resource: 'agents',
  action: 'read',
});

export const POST = withRBAC(createOrganizationAgent, {
  resource: 'agents',
  action: 'create',
});
