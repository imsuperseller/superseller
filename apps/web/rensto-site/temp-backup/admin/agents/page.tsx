'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Workflow, 
  Settings, 
  Eye, 
  Play, 
  Pause, 
  RefreshCw,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bot,
  Database
} from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  organizationId: string;
  capabilities: string[];
  schedule: string;
  isActive: boolean;
  successRate: number;
  avgDuration: number;
  costEst: number;
  roi: number;
  icon: string;
  tags: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockAgents: Agent[] = [
  {
    _id: '1',
    name: 'WordPress Content Agent',
    key: 'wordpress-content',
    description: 'Generates WordPress content including pages and posts',
    status: 'ready',
    organizationId: 'org-1',
    capabilities: ['content-generation', 'wordpress'],
    schedule: 'Daily',
    isActive: true,
    successRate: 95,
    avgDuration: 120,
    costEst: 0.50,
    roi: 300,
    icon: '📝',
    tags: ['content', 'wordpress'],
    dependencies: ['openai'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    _id: '2',
    name: 'Social Media Agent',
    key: 'social-media',
    description: 'Facebook and LinkedIn social media content',
    status: 'running',
    organizationId: 'org-1',
    capabilities: ['social-media', 'content-generation'],
    schedule: 'Weekly',
    isActive: true,
    successRate: 88,
    avgDuration: 180,
    costEst: 0.75,
    roi: 250,
    icon: '📱',
    tags: ['social', 'content'],
    dependencies: ['openai', 'facebook-api'],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-20T14:20:00Z'
  },
  {
    _id: '3',
    name: 'Podcast Agent',
    key: 'podcast-agent',
    description: 'Complete podcast creation for Apple and Spotify',
    status: 'ready',
    organizationId: 'org-2',
    capabilities: ['audio-generation', 'podcast'],
    schedule: 'Bi-weekly',
    isActive: true,
    successRate: 92,
    avgDuration: 300,
    costEst: 1.20,
    roi: 400,
    icon: '🎙️',
    tags: ['audio', 'podcast'],
    dependencies: ['openai', 'elevenlabs'],
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    _id: '4',
    name: 'Facebook Group Scraper',
    key: 'facebook-scraper',
    description: 'Scrapes Facebook groups for lead generation',
    status: 'error',
    organizationId: 'org-1',
    capabilities: ['scraping', 'lead-generation'],
    schedule: 'Daily',
    isActive: false,
    successRate: 65,
    avgDuration: 90,
    costEst: 0.30,
    roi: 150,
    icon: '🔍',
    tags: ['scraping', 'leads'],
    dependencies: ['facebook-api'],
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-20T13:15:00Z'
  }
];

const mockN8nHealth = {
  status: 'healthy',
  message: 'All systems operational',
  workflows: 12,
  activeWorkflows: 8
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [n8nHealth] = useState(mockN8nHealth);
  const [triggering, setTriggering] = useState<string | null>(null);

  const triggerAgent = async (agentId: string) => {
    try {
      setTriggering(agentId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent._id === agentId 
          ? { ...agent, status: 'running' }
          : agent
      ));
    } catch (error) {
      console.error('Error triggering agent:', error);
    } finally {
      setTriggering(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'stopped': return 'bg-rensto-card text-rensto-text';
      default: return 'bg-rensto-card text-rensto-text';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Activity className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'stopped': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Management</h1>
          <p className="text-slate-600 mt-1">Manage n8n workflows, customer agents, and system automation</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-rensto-red to-rensto-orange text-white shadow-rensto-glow-primary hover:shadow-rensto-glow-primary/80 transition-all duration-300 hover:scale-105 h-10 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Deploy New Agent
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border text-card-foreground shadow-sm border-rensto-cyan bg-rensto-bg-card shadow-rensto-glow-accent rensto-card-neon">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-600">Total Agents</h3>
            <Bot className="h-4 w-4 text-slate-400" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-slate-900">{agents.length}</div>
            <p className="text-xs text-slate-500">Active agents</p>
          </div>
        </div>

        <div className="rounded-lg border text-card-foreground shadow-sm border-rensto-cyan bg-rensto-bg-card shadow-rensto-glow-accent rensto-card-neon">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-600">n8n Workflows</h3>
            <Workflow className="h-4 w-4 text-slate-400" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-slate-900">{n8nHealth.workflows}</div>
            <p className="text-xs text-slate-500">{n8nHealth.activeWorkflows} active</p>
          </div>
        </div>

        <div className="rounded-lg border text-card-foreground shadow-sm border-rensto-cyan bg-rensto-bg-card shadow-rensto-glow-accent rensto-card-neon">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-600">n8n Status</h3>
            <Database className="h-4 w-4 text-slate-400" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-slate-900 capitalize">{n8nHealth.status}</div>
            <p className="text-xs text-slate-500">{n8nHealth.message}</p>
          </div>
        </div>

        <div className="rounded-lg border text-card-foreground shadow-sm border-rensto-cyan bg-rensto-bg-card shadow-rensto-glow-accent rensto-card-neon">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-600">Success Rate</h3>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {agents.length > 0 
                ? Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length)
                : 0}%
            </div>
            <p className="text-xs text-slate-500">Average across agents</p>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="rounded-lg border text-card-foreground shadow-sm border-rensto-cyan bg-rensto-bg-card shadow-rensto-glow-accent rensto-card-neon">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-rensto-text-primary flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Customer Agents ({agents.length})</span>
          </h3>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{agent.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                    <p className="text-sm text-slate-500">{agent.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(agent.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(agent.status)}
                          {agent.status}
                        </div>
                      </Badge>
                      <Badge variant="outline">{agent.schedule}</Badge>
                      <Badge variant="outline">{agent.successRate}% success</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => triggerAgent(agent._id)}
                    disabled={triggering === agent._id}
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-rensto-blue to-rensto-cyan text-white shadow-rensto-glow-secondary hover:shadow-rensto-glow-secondary/80 transition-all duration-300 hover:scale-105 h-9 rounded-md px-3"
                  >
                    {triggering === agent._id ? (
                      <RefreshCw className="h-4 w-4 rensto-animate-glow mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {triggering === agent._id ? 'Triggering...' : 'Trigger'}
                  </Button>
                  
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    Config
                  </Button>
                </div>
              </div>
            ))}
            
            {agents.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No agents found. Create your first agent to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
