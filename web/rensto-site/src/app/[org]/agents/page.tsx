import { Plus, Play, Pause, Settings, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Agent } from '@/types/agent';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';

interface AgentsPageProps {
  params: Promise<{ org: string }>;
}

async function getAgents(orgSlug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/agents?orgSlug=${orgSlug}`, { cache: 'no-store' });
    const agents = await response.json();
    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
}

export default async function AgentsPage({ params }: AgentsPageProps) {
  const { org } = await params;
  const agents = await getAgents(org);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-rensto-cyan bg-green-100';
      case 'running':
        return 'text-rensto-blue bg-blue-100';
      case 'paused':
        return 'text-rensto-orange bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'draft':
        return 'text-rensto-text/70 bg-rensto-card';
      default:
        return 'text-rensto-text/70 bg-rensto-card';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return '✓';
      case 'running':
        return '⟳';
      case 'paused':
        return '⏸';
      case 'error':
        return '✗';
      case 'draft':
        return '📝';
      default:
        return '?';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-rensto-text flex items-center gap-3"><div className="w-6 h-6 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={24}
                  height={24}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>Agents</h1>
          <p className="text-rensto-text/70 mt-1">
            Manage your automation agents and workflows.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-gradient-to-r from-rensto-red to-rensto-orange text-white px-4 py-2 rounded-lg hover:rensto-glow transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Agent</span>
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent: Agent) => (
          <div
            key={agent._id}
            className="bg-rensto-card rounded-xl rensto-card border border-rensto-border p-6 shadow-sm rensto-glow hover:rensto-glow transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <h4 className="font-semibold text-rensto-text">
                    {agent.name}
                  </h4>
                  <p className="text-sm text-rensto-text/60">
                    @{agent.key}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                  {getStatusIcon(agent.status)} {agent.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-rensto-text/70 mb-4">
              {agent.description}
            </p>

            {/* Tags */}
            {agent.tags && agent.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-rensto-card text-rensto-text/70 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-rensto-text/60">Success Rate</p>
                <p className="font-semibold text-rensto-text">
                  {agent.successRate || 0}%
                </p>
              </div>
              <div>
                <p className="text-rensto-text/60">Avg Duration</p>
                <p className="font-semibold text-rensto-text">
                  {agent.avgDuration ? `${agent.avgDuration}s` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-rensto-text/60">Cost Est.</p>
                <p className="font-semibold text-rensto-text">
                  ${agent.costEst || 0}
                </p>
              </div>
              <div>
                <p className="text-rensto-text/60">ROI</p>
                <p className="font-semibold text-rensto-text">
                  {agent.roi ? `${agent.roi}x` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-rensto-border">
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-rensto-text/70 hover:text-rensto-text hover:bg-rensto-card rounded-lg transition-colors"
                  title="Run Agent"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-rensto-text/70 hover:text-rensto-text hover:bg-rensto-card rounded-lg transition-colors"
                  title="Pause/Resume"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-rensto-text/70 hover:text-rensto-text hover:bg-rensto-card rounded-lg transition-colors"
                  title="Configure"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-rensto-text/70 hover:text-rensto-text hover:bg-rensto-card rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-rensto-text/70 hover:text-rensto-text hover:bg-rensto-card rounded-lg transition-colors"
                  title="View Details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-rensto-red hover:style={{ color: 'var(--rensto-red)' }} hover:style={{ backgroundColor: 'var(--rensto-bg-primary)' }} rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-rensto-card rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-rensto-text mb-2">No agents yet</h3>
          <p className="text-rensto-text/70 mb-6">
            Create your first automation agent to get started.
          </p>
          <button className="bg-gradient-to-r from-rensto-red to-rensto-orange text-white px-6 py-3 rounded-lg hover:rensto-glow transition-colors">
            Create Your First Agent
          </button>
        </div>
      )}
    </div>
  );
}
