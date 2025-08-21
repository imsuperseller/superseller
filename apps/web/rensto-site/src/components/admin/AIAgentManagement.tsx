import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AgentStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  performance: number;
  lastExecution: string;
  errors: number;
}

export default function AIAgentManagement() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      name: 'Intelligent Onboarding Agent',
      status: 'active',
      performance: 95,
      lastExecution: '2025-08-18T17:30:00Z',
      errors: 0
    },
    {
      name: 'Customer Success Agent',
      status: 'active',
      performance: 88,
      lastExecution: '2025-08-18T17:25:00Z',
      errors: 2
    },
    {
      name: 'System Monitoring Agent',
      status: 'active',
      performance: 92,
      lastExecution: '2025-08-18T17:28:00Z',
      errors: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const deployAgent = async (agentName: string) => {
    console.log(`Deploying ${agentName}...`);
    // Implementation for agent deployment
  };

  const viewLogs = async (agentName: string) => {
    console.log(`Viewing logs for ${agentName}...`);
    // Implementation for viewing logs
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">AI Agent Management</h2>
        <Button onClick={() => deployAgent('all')}>Deploy All Agents</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {agent.name}
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Performance</span>
                  <span>{agent.performance}%</span>
                </div>
                <Progress value={agent.performance} className="w-full" />
              </div>
              
              <div className="text-sm space-y-2">
                <div>Last Execution: {new Date(agent.lastExecution).toLocaleString()}</div>
                <div>Errors: {agent.errors}</div>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => deployAgent(agent.name)}>
                  Deploy
                </Button>
                <Button size="sm" variant="outline" onClick={() => viewLogs(agent.name)}>
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}