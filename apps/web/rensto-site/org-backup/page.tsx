import { } from 'react';
import { Activity, TrendingUp, Target, AlertCircle, DollarSign, Zap } from 'lucide-react';

interface OrgPageProps {
  params: Promise<{ org: string }>;
}

async function getOrgData(orgSlug: string) {
  try {
    const [orgResponse, agentsResponse, runsResponse] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/organizations?slug=${orgSlug}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXTAUTH_URL}/api/agents?orgSlug=${orgSlug}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXTAUTH_URL}/api/runs?orgSlug=${orgSlug}&limit=10`, { cache: 'no-store' })
    ]);

    const [organization, agents, recentRuns] = await Promise.all([
      orgResponse.json(),
      agentsResponse.json(),
      runsResponse.json()
    ]);

    // Calculate KPIs
    const totalRuns = recentRuns.length;
    const successfulRuns = recentRuns.filter((run: unknown) => run.status === 'success').length;
    const errorRuns = recentRuns.filter((run: unknown) => run.status === 'error').length;
    const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;
    const errorRate = totalRuns > 0 ? Math.round((errorRuns / totalRuns) * 100) : 0;
    
    const activeAgents = agents.filter((agent: unknown) => agent.status === 'ready').length;
    const totalCost = recentRuns.reduce((sum: number, run: unknown) => sum + (run.metrics?.costUSD || 0), 0);

    return {
      organization: organization[0] || null,
      agents,
      recentRuns,
      kpis: {
        mrr: { current: 2500, change: 12 },
        activeAgents: { total: activeAgents, change: 2 },
        runs: { rate: successRate, change: 5 },
        errorRate: { current: errorRate, change: -3 },
        invoices: { pending: 3, total: totalCost },
      }
    };
  } catch (error) {
    console.error('Error fetching org data:', error);
    return {
      organization: null,
      agents: [],
      recentRuns: [],
      kpis: {
        mrr: { current: 0, change: 0 },
        activeAgents: { total: 0, change: 0 },
        runs: { rate: 0, change: 0 },
        errorRate: { current: 0, change: 0 },
        invoices: { pending: 0, total: 0 },
      }
    };
  }
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { org } = await params;
  const { organization, agents, recentRuns, kpis } = await getOrgData(org);

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Organization Not Found</h1>
          <p className="text-slate-600">The organization @{org} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
          <p className="text-slate-600 mt-1">
            Here&apos;s what&apos;s happening with your automation today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            + New Agent
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">MRR</p>
              <p className="text-2xl font-bold text-slate-900">
                ${kpis.mrr.current.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{kpis.mrr.change}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Agents</p>
              <p className="text-2xl font-bold text-slate-900">
                {kpis.activeAgents.total}
              </p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Activity className="w-4 h-4 mr-1" />
                {kpis.activeAgents.total} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {kpis.runs.rate}%
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {kpis.runs.rate}% success rate
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {kpis.errorRate.current}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                {kpis.errorRate.change}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentRuns.slice(0, 5).map((run: unknown) => (
            <div
              key={run._id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  run.status === 'success'
                    ? 'bg-green-100 text-green-600'
                    : run.status === 'error'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {run.status === 'success' ? '✓' : run.status === 'error' ? '✗' : '⟳'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {agents.find((a: unknown) => a._id === run.agentId)?.name} - {run.status}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(run.startedAt).toLocaleString()} •{' '}
                  {run.metrics?.durationMs
                    ? `${run.metrics.durationMs / 1000}s`
                    : 'N/A'}{' '}
                  • ${run.metrics?.costUSD || 0}
                </p>
                {run.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {run.error.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
