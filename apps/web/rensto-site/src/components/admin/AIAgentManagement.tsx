import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Template } from '@/types/firestore';

interface AgentStatus {
  name: string;
  id: string;
  status: 'active' | 'inactive' | 'error';
  performance: number;
  lastExecution: string;
  errors: number;
  isRenstoCore?: boolean;
}

interface AIAgentManagementProps {
  templates?: Template[];
}

export default function AIAgentManagement({ templates = [] }: AIAgentManagementProps) {
  const initialAgents: AgentStatus[] = templates.length > 0 ? templates.map(t => ({
    id: t.id || 'unknown',
    name: t.name,
    status: 'active',
    performance: Math.floor(Math.random() * 20) + 80,
    lastExecution: new Date().toISOString(),
    errors: 0,
    isRenstoCore: t.name.toLowerCase().includes('rensto') || t.category === 'AI Agents'
  })) : [
    {
      id: 'rensto-master-controller',
      name: 'Rensto Master Controller',
      status: 'active',
      performance: 99,
      lastExecution: new Date().toISOString(),
      errors: 0,
      isRenstoCore: true
    },
    {
      id: 'rensto-audit-agent',
      name: 'Service Audit Agent',
      status: 'active',
      performance: 98,
      lastExecution: new Date().toISOString(),
      errors: 0,
      isRenstoCore: true
    }
  ];

  const [agents, setAgents] = useState<AgentStatus[]>(initialAgents);

  useEffect(() => {
    if (templates.length > 0) {
      setAgents(templates.map(t => ({
        id: t.id || 'unknown',
        name: t.name,
        status: 'active',
        performance: Math.floor(Math.random() * 20) + 80,
        lastExecution: new Date().toISOString(),
        errors: 0,
        isRenstoCore: t.name.toLowerCase().includes('rensto') || t.category === 'AI Agents'
      })));
    }
  }, [templates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 hover:bg-green-600';
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agent Management</h2>
          <p className="text-muted-foreground">Monitoring and deploying Rensto autonomous agents</p>
        </div>
        <Button onClick={() => deployAgent('all')} className="bg-[#fe3d51] hover:bg-[#ff4d5d]">Deploy All Agents</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className={agent.isRenstoCore ? 'border-[#fe3d51]/50 border-2' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  {agent.name}
                  {agent.isRenstoCore && (
                    <Badge variant="outline" className="text-[#fe3d51] border-[#fe3d51] text-[10px] py-0">RENSTO CORE</Badge>
                  )}
                </span>
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Health / Performance</span>
                  <span className="font-bold">{agent.performance}%</span>
                </div>
                <Progress value={agent.performance} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground block font-bold">LAST EXECUTION</span>
                  <span className="text-white bg-black/20 p-1 rounded inline-block">
                    {new Date(agent.lastExecution).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block font-bold">TOTAL ERRORS</span>
                  <span className={`p-1 rounded inline-block ${agent.errors > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    {agent.errors}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => deployAgent(agent.name)}>
                  Restart
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => viewLogs(agent.name)}>
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