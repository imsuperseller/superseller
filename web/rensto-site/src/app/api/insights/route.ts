import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';
import AgentRun from '@/models/AgentRun';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user's agents and recent runs
    const agents = await Agent.find({}).limit(10);
    const recentRuns = await AgentRun.find({}).sort({ startedAt: -1 }).limit(50);

    // Generate AI insights based on data
    const insights = [];

    // Performance optimization insights
    const slowAgents = agents.filter(agent => agent.avgDuration && agent.avgDuration > 60);
    if (slowAgents.length > 0) {
      insights.push({
        id: 'perf-1',
        type: 'optimization',
        title: 'Performance Optimization Opportunity',
        description: `${slowAgents.length} agent(s) are running slower than average. Consider adjusting concurrency settings or optimizing workflows.`,
        impact: 'high',
        action: 'Optimize Agents',
        timestamp: new Date().toISOString(),
      });
    }

    // Cost optimization insights
    const expensiveAgents = agents.filter(agent => agent.costEst && agent.costEst > 10);
    if (expensiveAgents.length > 0) {
      insights.push({
        id: 'cost-1',
        type: 'cost',
        title: 'Cost Reduction Opportunity',
        description: `${expensiveAgents.length} agent(s) have high estimated costs. Consider switching to weekly scheduling to reduce monthly expenses by ~70%.`,
        impact: 'medium',
        action: 'View Cost Analysis',
        timestamp: new Date().toISOString(),
      });
    }

    // Success rate insights
    const lowSuccessAgents = agents.filter(agent => agent.successRate && agent.successRate < 80);
    if (lowSuccessAgents.length > 0) {
      insights.push({
        id: 'success-1',
        type: 'performance',
        title: 'Low Success Rate Alert',
        description: `${lowSuccessAgents.length} agent(s) have success rates below 80%. Review error logs and consider updating integration credentials.`,
        impact: 'high',
        action: 'Review Errors',
        timestamp: new Date().toISOString(),
      });
    }

    // Inactive agents insights
    const inactiveAgents = agents.filter(agent => !agent.isActive);
    if (inactiveAgents.length > 0) {
      insights.push({
        id: 'inactive-1',
        type: 'performance',
        title: 'Inactive Agents Detected',
        description: `${inactiveAgents.length} agent(s) are currently paused. Consider reactivating them if they're still needed for your workflows.`,
        impact: 'low',
        action: 'Review Agents',
        timestamp: new Date().toISOString(),
      });
    }

    // New feature suggestions
    if (agents.length > 0) {
      insights.push({
        id: 'feature-1',
        type: 'optimization',
        title: 'New Integration Available',
        description: 'We detected potential for Facebook group scraping integration. This could help expand your lead generation capabilities.',
        impact: 'medium',
        action: 'Learn More',
        timestamp: new Date().toISOString(),
      });
    }

    // Usage optimization
    const totalRuns = recentRuns.length;
    const dailyRuns = recentRuns.filter(run => {
      const runDate = new Date(run.startedAt);
      const now = new Date();
      return runDate.toDateString() === now.toDateString();
    }).length;

    if (dailyRuns > 20) {
      insights.push({
        id: 'usage-1',
        type: 'cost',
        title: 'High Daily Usage',
        description: `You're running ${dailyRuns} workflows today. Consider batching operations to reduce API costs and improve efficiency.`,
        impact: 'medium',
        action: 'Optimize Usage',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      insights: insights.slice(0, 5), // Return top 5 insights
      summary: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.isActive).length,
        totalRuns: totalRuns,
        averageSuccessRate: agents.length > 0 
          ? Math.round(agents.reduce((sum, agent) => sum + (agent.successRate || 0), 0) / agents.length)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
