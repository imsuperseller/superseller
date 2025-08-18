'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import {
  Play,
  Pause,
  Trash2,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Settings,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  };
  lastExecution?: {
    startedAt: string;
    status: string;
  };
}

interface AgentMetrics {
  totalRuns: number;
  successRate: number;
  averageExecutionTime: number;
  lastRun: string | null;
  errorRate: number;
  totalExecutionTime: number;
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<
    Record<string, AgentMetrics>
  >({});

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/n8n/workflows?type=agents');
      const data = await response.json();

      if (data.success) {
        setAgents(data.data);

        // Fetch metrics for each agent
        const metrics: Record<string, AgentMetrics> = {};
        for (const agent of data.data) {
          try {
            const metricsResponse = await fetch(
              `/api/n8n/agents/${agent.id}/metrics`
            );
            const metricsData = await metricsResponse.json();
            if (metricsData.success) {
              metrics[agent.id] = metricsData.data;
            }
          } catch (error) {
            console.error(
              `Error fetching metrics for agent ${agent.id}:`,
              error
            );
          }
        }
        setAgentMetrics(metrics);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger agent
  const triggerAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/n8n/agents/${agentId}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual',
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh agents to get updated stats
        fetchAgents();
      }
    } catch (error) {
      console.error('Error triggering agent:', error);
    }
  };

  // Toggle agent status
  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/n8n/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !currentStatus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchAgents();
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
    }
  };

  // Delete agent
  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`/api/n8n/agents/${agentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchAgents();
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  // Load agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 rensto-animate-glow" />
        <span className="ml-2">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              </div>Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your n8n automation agents
          </p>
        </div>
        <Button onClick={fetchAgents} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => {
          const metrics = agentMetrics[agent.id];
          const isSelected = selectedAgent === agent.id;

          return (
            <Card
              key={agent.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={agent.active ? 'default' : 'secondary'}>
                      {agent.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {agent.tags.includes('agent') && (
                      <Badge variant="outline">Agent</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Metrics */}
                {metrics && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>{metrics.totalRuns} runs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{metrics.successRate.toFixed(1)}% success</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 style={{ color: 'var(--rensto-blue)' }}" />
                      <span>
                        {(metrics.averageExecutionTime / 1000).toFixed(1)}s avg
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 style={{ color: 'var(--rensto-red)' }}" />
                      <span>{metrics.errorRate.toFixed(1)}% error</span>
                    </div>
                  </div>
                )}

                {/* Last Execution */}
                {agent.lastExecution && (
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last run:{' '}
                        {new Date(
                          agent.lastExecution.startedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {agent.lastExecution.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 style={{ color: 'var(--rensto-red)' }}" />
                      )}
                      <span className="capitalize">
                        {agent.lastExecution.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      triggerAgent(agent.id);
                    }}
                    disabled={!agent.active}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={e => {
                      e.stopPropagation();
                      toggleAgentStatus(agent.id, agent.active);
                    }}
                  >
                    {agent.active ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {agent.active ? 'Pause' : 'Start'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={e => {
                      e.stopPropagation();
                      // Navigate to agent details
                      window.open(`/admin/agents/${agent.id}`, '_blank');
                    }}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={e => {
                      e.stopPropagation();
                      deleteAgent(agent.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No n8n workflows tagged as agents were found. Create workflows in
              n8n and tag them with "agent" to see them here.
            </p>
            <Button onClick={fetchAgents} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card variant="renstoNeon" className="mt-6 rensto-card hover:rensto-glow">
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Performance Metrics</h4>
                {agentMetrics[selectedAgent] && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Runs:</span>
                      <span>{agentMetrics[selectedAgent].totalRuns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span>
                        {agentMetrics[selectedAgent].successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span>
                        {agentMetrics[selectedAgent].errorRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Execution Time:</span>
                      <span>
                        {(
                          agentMetrics[selectedAgent].averageExecutionTime /
                          1000
                        ).toFixed(1)}
                        s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recent Activity</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const agent = agents.find(a => a.id === selectedAgent);
                    if (agent) {
                      window.open(`/admin/agents/${agent.id}`, '_blank');
                    }
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => triggerAgent(selectedAgent)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const agent = agents.find(a => a.id === selectedAgent);
                      if (agent) {
                        window.open(`/admin/agents/${agent.id}`, '_blank');
                      }
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
