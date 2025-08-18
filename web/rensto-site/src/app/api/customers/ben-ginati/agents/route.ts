import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BEN_N8N_CONFIG = {
  url: 'https://tax4usllc.app.n8n.cloud',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
};

// Define Ben's agents with their n8n workflow IDs and details
const BEN_AGENTS = {
  'content-agent': {
    _id: 'zYQIOa3bA6yXX3uP',
    name: 'Tax4Us Content Agent (Non-Blog)',
    key: 'content-agent',
    description: 'Generates professional content for emails, social media, marketing materials, legal documents, and support content. Exclusively handles non-blog content.',
    status: 'ready',
    icon: '📝',
    tags: ['content', 'marketing', 'professional', 'tax4us'],
    capabilities: ['Content Generation', 'Email Marketing', 'Social Media', 'Legal Documents', 'Support Content'],
    pricing: {
      model: 'per_run',
      rate: 0
    },
    isActive: true,
    schedule: 'manual',
    dependencies: ['openai-api', 'wordpress-api'],
    successRate: 95,
    avgDuration: 30,
    costEst: 0.05,
    roi: 85,
    webhookUrl: 'https://tax4usllc.app.n8n.cloud/webhook/content-agent',
    n8nWorkflowId: 'zYQIOa3bA6yXX3uP',
    category: 'Content Generation',
    features: [
      'Professional content generation',
      'Email and marketing materials',
      'Legal document assistance',
      'Support content creation',
      'Hebrew and English support'
    ],
    estimatedROI: '85% efficiency improvement',
    setupTime: 'Ready to use',
    lastRun: null
  },
  'blog-agent': {
    _id: '2LRWPm2F913LrXFy',
    name: 'Tax4Us Blog & Posts Agent (WordPress)',
    key: 'blog-agent',
    description: 'Specialized blog post generator for Tax4Us WordPress site. Creates SEO-optimized blog posts in Hebrew and English with proper WordPress formatting.',
    status: 'ready',
    icon: '📰',
    tags: ['blog', 'wordpress', 'seo', 'tax4us', 'content'],
    capabilities: ['Blog Post Generation', 'WordPress Integration', 'SEO Optimization', 'Hebrew Content', 'English Content'],
    pricing: {
      model: 'per_run',
      rate: 0
    },
    isActive: true,
    schedule: 'manual',
    dependencies: ['openai-api', 'wordpress-api'],
    successRate: 100,
    avgDuration: 45,
    costEst: 0.08,
    roi: 90,
    webhookUrl: 'https://tax4usllc.app.n8n.cloud/webhook/blog-posts-agent',
    n8nWorkflowId: '2LRWPm2F913LrXFy',
    category: 'Blog & Content',
    features: [
      'SEO-optimized blog posts',
      'WordPress integration',
      'Hebrew and English content',
      'Professional formatting',
      'Tax consulting focus'
    ],
    estimatedROI: '90% content creation efficiency',
    setupTime: 'Ready to use',
    lastRun: '2025-08-18T03:36:09.000Z'
  }
};

export async function GET() {
  try {
    console.log('🔍 Fetching Ben Ginati\'s agents...');
    
    // Get current workflows from n8n to check status
    const workflowsResponse = await axios.get(`${BEN_N8N_CONFIG.url}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey
      }
    });

    const workflows = workflowsResponse.data.data || [];
    console.log(`✅ Found ${workflows.length} workflows in Ben's n8n instance`);

    // Get recent executions for each agent to update metrics
    const agentsWithMetrics = await Promise.all(
      Object.values(BEN_AGENTS).map(async (agent) => {
        try {
          // Get workflow details
          const workflow = workflows.find((w: any) => w.id === agent.n8nWorkflowId);
          
          // Get recent executions
          const executionsResponse = await axios.get(
            `${BEN_N8N_CONFIG.url}/api/v1/executions`,
            {
              headers: { 'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey },
              params: {
                workflowId: agent.n8nWorkflowId,
                limit: 10
              }
            }
          );

          const executions = executionsResponse.data.data || [];
          
          // Calculate metrics
          const totalExecutions = executions.length;
          const successfulExecutions = executions.filter((e: any) => e.status === 'success').length;
          const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
          const lastRun = executions.length > 0 ? executions[0].startedAt : null;
          
          // Calculate average duration
          const completedExecutions = executions.filter((e: any) => e.stoppedAt && e.startedAt);
          const avgDuration = completedExecutions.length > 0 
            ? completedExecutions.reduce((sum: number, e: any) => {
                const duration = new Date(e.stoppedAt) - new Date(e.startedAt);
                return sum + duration;
              }, 0) / completedExecutions.length / 1000 // Convert to seconds
            : agent.avgDuration;

          return {
            ...agent,
            status: workflow?.active ? 'ready' : 'paused',
            successRate: Math.round(successRate),
            avgDuration: Math.round(avgDuration),
            lastRun,
            totalExecutions,
            successfulExecutions,
            isActive: workflow?.active || false,
            workflowStatus: workflow?.active ? 'Active' : 'Inactive'
          };
        } catch (error) {
          console.error(`Error fetching metrics for ${agent.name}:`, error);
          return {
            ...agent,
            status: 'error',
            successRate: 0,
            avgDuration: agent.avgDuration,
            lastRun: null,
            totalExecutions: 0,
            successfulExecutions: 0,
            isActive: false,
            workflowStatus: 'Error'
          };
        }
      })
    );

    console.log(`✅ Processed ${agentsWithMetrics.length} agents for Ben Ginati`);

    return NextResponse.json({
      success: true,
      agents: agentsWithMetrics,
      total: agentsWithMetrics.length,
      active: agentsWithMetrics.filter(a => a.isActive).length,
      customer: {
        name: 'Ben Ginati',
        company: 'Tax4Us',
        email: 'ben@tax4us.co.il',
        portal: 'tax4us'
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch Ben\'s agents:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agents',
      details: error.message,
      agents: Object.values(BEN_AGENTS) // Fallback to static data
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, agentKey, data } = await request.json();
    
    if (!action || !agentKey) {
      return NextResponse.json({
        success: false,
        error: 'Action and agent key are required'
      }, { status: 400 });
    }

    const agent = BEN_AGENTS[agentKey as keyof typeof BEN_AGENTS];
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Invalid agent key'
      }, { status: 400 });
    }

    console.log(`🤖 Executing action '${action}' for agent: ${agent.name}`);

    switch (action) {
      case 'run':
        return await runAgent(agent, data);
      
      case 'activate':
        return await activateAgent(agent);
      
      case 'deactivate':
        return await deactivateAgent(agent);
      
      case 'get_metrics':
        return await getAgentMetrics(agent);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Agent action failed:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute agent action',
      details: error.message
    }, { status: 500 });
  }
}

async function runAgent(agent: any, data: any) {
  try {
    console.log(`🚀 Running agent: ${agent.name}`);
    
    const response = await axios.post(
      agent.webhookUrl,
      {
        type: 'manual_execution',
        topic: data?.topic || 'Tax4Us content generation',
        language: data?.language || 'hebrew',
        tone: data?.tone || 'professional',
        ...data
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    return NextResponse.json({
      success: true,
      message: `Agent ${agent.name} executed successfully`,
      response: response.data,
      agent: agent.name,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ Failed to run agent ${agent.name}:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: `Failed to run ${agent.name}`,
      details: error.message
    }, { status: 500 });
  }
}

async function activateAgent(agent: any) {
  try {
    console.log(`🔄 Activating agent: ${agent.name}`);
    
    const response = await axios.post(
      `${BEN_N8N_CONFIG.url}/api/v1/workflows/${agent.n8nWorkflowId}/activate`,
      {},
      {
        headers: { 'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Agent ${agent.name} activated successfully`,
      agent: agent.name,
      status: 'active'
    });

  } catch (error: any) {
    console.error(`❌ Failed to activate agent ${agent.name}:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: `Failed to activate ${agent.name}`,
      details: error.message
    }, { status: 500 });
  }
}

async function deactivateAgent(agent: any) {
  try {
    console.log(`⏸️ Deactivating agent: ${agent.name}`);
    
    const response = await axios.post(
      `${BEN_N8N_CONFIG.url}/api/v1/workflows/${agent.n8nWorkflowId}/deactivate`,
      {},
      {
        headers: { 'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Agent ${agent.name} deactivated successfully`,
      agent: agent.name,
      status: 'inactive'
    });

  } catch (error: any) {
    console.error(`❌ Failed to deactivate agent ${agent.name}:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: `Failed to deactivate ${agent.name}`,
      details: error.message
    }, { status: 500 });
  }
}

async function getAgentMetrics(agent: any) {
  try {
    console.log(`📊 Getting metrics for agent: ${agent.name}`);
    
    const executionsResponse = await axios.get(
      `${BEN_N8N_CONFIG.url}/api/v1/executions`,
      {
        headers: { 'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey },
        params: {
          workflowId: agent.n8nWorkflowId,
          limit: 50
        }
      }
    );

    const executions = executionsResponse.data.data || [];
    
    const metrics = {
      totalExecutions: executions.length,
      successfulExecutions: executions.filter((e: any) => e.status === 'success').length,
      failedExecutions: executions.filter((e: any) => e.status === 'error').length,
      successRate: executions.length > 0 
        ? (executions.filter((e: any) => e.status === 'success').length / executions.length) * 100 
        : 0,
      lastRun: executions.length > 0 ? executions[0].startedAt : null,
      averageExecutionTime: 0
    };

    // Calculate average execution time
    const completedExecutions = executions.filter((e: any) => e.stoppedAt && e.startedAt);
    if (completedExecutions.length > 0) {
      const totalTime = completedExecutions.reduce((sum: number, e: any) => {
        return sum + (new Date(e.stoppedAt) - new Date(e.startedAt));
      }, 0);
      metrics.averageExecutionTime = totalTime / completedExecutions.length / 1000; // Convert to seconds
    }

    return NextResponse.json({
      success: true,
      agent: agent.name,
      metrics
    });

  } catch (error: any) {
    console.error(`❌ Failed to get metrics for ${agent.name}:`, error.message);
    
    return NextResponse.json({
      success: false,
      error: `Failed to get metrics for ${agent.name}`,
      details: error.message
    }, { status: 500 });
  }
}
