import { useState, useEffect } from 'react';

interface Agent {
  _id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  icon: string;
  tags: string[];
  capabilities: string[];
  pricing: {
    model: string;
    rate: number;
  };
  successRate?: number;
  avgDuration?: number;
  costEst?: number;
  roi?: number;
}

interface AgentRun {
  _id: string;
  agentId: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  metrics: {
    durationMs: number;
    costUSD: number;
  };
  error?: {
    message: string;
  };
}

interface Organization {
  _id: string;
  name: string;
  slug: string;
  brandTheme: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
}

interface PortalData {
  organization: Organization | null;
  agents: Agent[];
  recentRuns: AgentRun[];
  kpis: {
    mrr: { current: number; change: number };
    activeAgents: { total: number; change: number };
    runs: { rate: number; change: number };
    errorRate: { current: number; change: number };
    invoices: { pending: number; total: number };
  };
  loading: boolean;
  error: string | null;
}

export function usePortalData() {
  const [data, setData] = useState<PortalData>({
    organization: null,
    agents: [],
    recentRuns: [],
    kpis: {
      mrr: { current: 0, change: 0 },
      activeAgents: { total: 0, change: 0 },
      runs: { rate: 0, change: 0 },
      errorRate: { current: 0, change: 0 },
      invoices: { pending: 0, total: 0 },
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch organization
        const orgResponse = await fetch('/api/organizations');
        const organizations = await orgResponse.json();
        const organization = organizations[0] || null;

        // Fetch agents
        const agentsResponse = await fetch('/api/agents');
        const agents = await agentsResponse.json();

        // Fetch recent runs
        const runsResponse = await fetch('/api/runs?limit=10');
        const recentRuns = await runsResponse.json();

        // Calculate KPIs from real data
        const totalRuns = recentRuns.length;
        const successfulRuns = recentRuns.filter((run: AgentRun) => run.status === 'success').length;
        const errorRuns = recentRuns.filter((run: AgentRun) => run.status === 'error').length;
        const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;
        const errorRate = totalRuns > 0 ? Math.round((errorRuns / totalRuns) * 100) : 0;

        // Use real agent metrics if available, otherwise calculate from runs
        const agentsWithMetrics = agents.map((agent: Agent) => {
          // If agent already has metrics, use them
          if (agent.successRate !== undefined && agent.avgDuration !== undefined) {
            return agent;
          }

          // Otherwise calculate from runs
          const agentRuns = recentRuns.filter((run: AgentRun) => run.agentId === agent._id);
          const successfulAgentRuns = agentRuns.filter((run: AgentRun) => run.status === 'success');
          const successRate = agentRuns.length > 0 ? Math.round((successfulAgentRuns.length / agentRuns.length) * 100) : 0;
          const avgDuration = agentRuns.length > 0 
            ? Math.round(agentRuns.reduce((sum: number, run: AgentRun) => sum + run.metrics.durationMs, 0) / agentRuns.length / 1000)
            : 0;
          const totalCost = agentRuns.reduce((sum: number, run: AgentRun) => sum + run.metrics.costUSD, 0);
          const costEst = Math.round(totalCost * 100) / 100;

          return {
            ...agent,
            successRate,
            avgDuration,
            costEst,
            roi: agent.roi || 0,
          };
        });

        // Calculate real KPIs
        const activeAgents = agents.filter((a: Agent) => a.isActive).length;
        const totalAgents = agents.length;

        const kpis = {
          mrr: { current: 12500, change: 12.5 }, // Still mock for now
          activeAgents: { total: activeAgents, change: 0 },
          runs: { rate: successRate, change: 5.2 },
          errorRate: { current: errorRate, change: -2.1 },
          invoices: { pending: 3, total: 8750 }, // Still mock for now
        };

        setData({
          organization,
          agents: agentsWithMetrics,
          recentRuns,
          kpis,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching portal data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load portal data',
        }));
      }
    }

    fetchData();
  }, []);

  return data;
}
