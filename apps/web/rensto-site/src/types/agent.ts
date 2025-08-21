export interface Agent {
  _id: string;
  name: string;
  key: string;
  description: string;
  status: 'draft' | 'provisioning' | 'qa' | 'ready' | 'paused' | 'error';
  icon: string;
  tags: string[];
  capabilities: string[];
  pricing: {
    model: string;
    rate: number;
  };
  isActive: boolean;
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  dependencies: string[];
  progress?: {
    current: number;
    total: number;
    message: string;
  };
  lastRun?: Date;
  successRate?: number;
  avgDuration?: number;
  costEst?: number;
  roi?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRun {
  _id: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
}

export interface AgentMetrics {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  totalCost: number;
  roi: number;
}
