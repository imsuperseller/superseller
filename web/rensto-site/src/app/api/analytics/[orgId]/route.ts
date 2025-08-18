import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';
import { withRBAC } from '@/lib/rbac';
import { withApiRateLimit } from '@/lib/rate-limiter';
import { ObjectId } from 'mongodb';

// Get analytics data for organization
async function getAnalytics(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    
    const dateRange = searchParams.get('dateRange') || '30d';
    const startDate = getStartDate(dateRange);

    // Get organization
    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
    const organization = await orgsCollection.findOne({ 
      _id: new ObjectId(orgId) 
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get agents data
    const agentsCollection = await getCollection(COLLECTIONS.AGENTS);
    const agents = await agentsCollection.find({ 
      orgId: new ObjectId(orgId) 
    }).toArray();

    // Get agent runs data
    const agentRunsCollection = await getCollection(COLLECTIONS.AGENT_RUNS);
    const agentRuns = await agentRunsCollection.find({
      orgId: new ObjectId(orgId),
      createdAt: { $gte: startDate }
    }).toArray();

    // Get events data
    const eventsCollection = await getCollection(COLLECTIONS.EVENTS);
    const events = await eventsCollection.find({
      orgId: new ObjectId(orgId),
      createdAt: { $gte: startDate }
    }).toArray();

    // Calculate analytics
    const analytics = {
      overview: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        totalRuns: agentRuns.length,
        successfulRuns: agentRuns.filter(r => r.status === 'success').length,
        failedRuns: agentRuns.filter(r => r.status === 'error').length,
        successRate: agentRuns.length > 0 
          ? (agentRuns.filter(r => r.status === 'success').length / agentRuns.length * 100).toFixed(2)
          : 0,
        averageExecutionTime: agentRuns.length > 0
          ? (agentRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0) / agentRuns.length / 1000).toFixed(2)
          : 0,
      },
      trends: {
        dailyRuns: getDailyTrends(agentRuns, dateRange),
        agentPerformance: getAgentPerformance(agents, agentRuns),
        errorTrends: getErrorTrends(agentRuns, dateRange),
      },
      events: {
        recent: events.slice(0, 10),
        byType: getEventTypeDistribution(events),
        byUser: getEventUserDistribution(events),
      },
      performance: {
        topAgents: getTopAgents(agents, agentRuns),
        slowestAgents: getSlowestAgents(agents, agentRuns),
        errorProneAgents: getErrorProneAgents(agents, agentRuns),
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      dateRange,
      startDate: startDate.toISOString(),
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper functions
function getStartDate(dateRange: string): Date {
  const now = new Date();
  switch (dateRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function getDailyTrends(runs: unknown[], dateRange: string): unknown[] {
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const trends = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayRuns = runs.filter(r => {
      const runDate = new Date(r.createdAt);
      return runDate >= dayStart && runDate < dayEnd;
    });
    
    trends.push({
      date: dayStart.toISOString().split('T')[0],
      total: dayRuns.length,
      successful: dayRuns.filter(r => r.status === 'success').length,
      failed: dayRuns.filter(r => r.status === 'error').length,
    });
  }
  
  return trends;
}

function getAgentPerformance(agents: unknown[], runs: unknown[]): unknown[] {
  return agents.map(agent => {
    const agentRuns = runs.filter(r => r.agentId.toString() === agent._id.toString());
    const successfulRuns = agentRuns.filter(r => r.status === 'success');
    
    return {
      agentId: agent._id,
      agentName: agent.name,
      totalRuns: agentRuns.length,
      successfulRuns: successfulRuns.length,
      successRate: agentRuns.length > 0 ? (successfulRuns.length / agentRuns.length * 100).toFixed(2) : 0,
      averageExecutionTime: agentRuns.length > 0 
        ? (agentRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0) / agentRuns.length / 1000).toFixed(2)
        : 0,
    };
  });
}

function getErrorTrends(runs: unknown[], dateRange: string): unknown[] {
  const errorRuns = runs.filter(r => r.status === 'error');
  const errorTypes = {};
  
  errorRuns.forEach(run => {
    const errorType = run.error?.message || 'Unknown Error';
    errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
  });
  
  return Object.entries(errorTypes).map(([type, count]) => ({
    type,
    count,
    percentage: ((count as number) / errorRuns.length * 100).toFixed(2),
  }));
}

function getEventTypeDistribution(events: unknown[]): unknown[] {
  const typeCounts = {};
  events.forEach(event => {
    typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
  });
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: ((count as number) / events.length * 100).toFixed(2),
  }));
}

function getEventUserDistribution(events: unknown[]): unknown[] {
  const userCounts = {};
  events.forEach(event => {
    const userId = event.userId?.toString() || 'System';
    userCounts[userId] = (userCounts[userId] || 0) + 1;
  });
  
  return Object.entries(userCounts).map(([userId, count]) => ({
    userId,
    count,
    percentage: ((count as number) / events.length * 100).toFixed(2),
  }));
}

function getTopAgents(agents: unknown[], runs: unknown[]): unknown[] {
  const agentStats = getAgentPerformance(agents, runs);
  return agentStats
    .filter(agent => agent.totalRuns > 0)
    .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))
    .slice(0, 5);
}

function getSlowestAgents(agents: unknown[], runs: unknown[]): unknown[] {
  const agentStats = getAgentPerformance(agents, runs);
  return agentStats
    .filter(agent => agent.totalRuns > 0)
    .sort((a, b) => parseFloat(b.averageExecutionTime) - parseFloat(a.averageExecutionTime))
    .slice(0, 5);
}

function getErrorProneAgents(agents: unknown[], runs: unknown[]): unknown[] {
  const agentStats = getAgentPerformance(agents, runs);
  return agentStats
    .filter(agent => agent.totalRuns > 0)
    .sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate))
    .slice(0, 5);
}

// Export with rate limiting and RBAC
export const GET = withApiRateLimit(
  withRBAC(getAnalytics, { resource: 'analytics', action: 'read' })
);
