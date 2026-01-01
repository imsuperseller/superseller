import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Workflow {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastExecution: string;
  executionTime: number;
  successRate: number;
  errors: number;
  tags?: string[];
}

import { Template } from '@/types/firestore';

interface WorkflowManagementProps {
  templates?: Template[];
}

export default function WorkflowManagement({ templates = [] }: WorkflowManagementProps) {
  // Map templates to Workflow interface, mocking status/stats for now
  const initialWorkflows: Workflow[] = templates.length > 0 ? templates.map(t => ({
    id: t.id || 'unknown',
    name: t.name,
    status: 'running', // Mock status
    lastExecution: new Date().toISOString(),
    executionTime: Math.floor(Math.random() * 100) + 20,
    successRate: Math.floor(Math.random() * 20) + 80,
    errors: 0,
    tags: t.tags || []
  })) : [
    // Fallback if no templates
    {
      id: 'ben-social-media-agent',
      name: 'Ben Social Media Agent',
      status: 'running',
      lastExecution: '2025-08-18T17:30:00Z',
      executionTime: 45,
      successRate: 95,
      errors: 0
    }
  ];

  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);

  useEffect(() => {
    if (templates.length > 0) {
      setWorkflows(templates.map(t => ({
        id: t.id || 'unknown',
        name: t.name,
        status: 'running',
        lastExecution: new Date().toISOString(),
        executionTime: Math.floor(Math.random() * 100) + 20,
        successRate: Math.floor(Math.random() * 20) + 80,
        errors: 0,
        tags: t.tags || []
      })));
    }
  }, [templates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const startWorkflow = async (workflowId: string) => {
    console.log(`Starting workflow ${workflowId}...`);
    // Implementation for starting workflow
  };

  const stopWorkflow = async (workflowId: string) => {
    console.log(`Stopping workflow ${workflowId}...`);
    // Implementation for stopping workflow
  };

  const viewExecutionHistory = async (workflowId: string) => {
    console.log(`Viewing execution history for ${workflowId}...`);
    // Implementation for viewing execution history
  };

  const [filter, setFilter] = useState<'all' | 'marketplace' | 'internal'>('all');

  const filteredWorkflows = workflows.filter(w => {
    if (filter === 'all') return true;
    if (filter === 'marketplace') return w.tags?.includes('marketplace');
    if (filter === 'internal') return w.tags?.includes('internal');
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Workflow Management</h2>
        <Button>Create New Workflow</Button>
      </div>

      <div className="flex space-x-2 border-b border-gray-700 pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All Workflows
        </Button>
        <Button
          variant={filter === 'marketplace' ? 'default' : 'ghost'}
          onClick={() => setFilter('marketplace')}
          size="sm"
        >
          Marketplace
        </Button>
        <Button
          variant={filter === 'internal' ? 'default' : 'ghost'}
          onClick={() => setFilter('internal')}
          size="sm"
        >
          Internal Tools
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{workflow.name}</span>
                <div className="flex gap-2">
                  {workflow.tags?.includes('internal') && (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Internal</Badge>
                  )}
                  {workflow.tags?.includes('marketplace') && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Marketplace</Badge>
                  )}
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div>Last Execution: {new Date(workflow.lastExecution).toLocaleString()}</div>
                <div>Execution Time: {workflow.executionTime}s</div>
                <div>Errors: {workflow.errors}</div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Success Rate</span>
                  <span>{workflow.successRate}%</span>
                </div>
                <Progress value={workflow.successRate} className="w-full" />
              </div>

              <div className="flex space-x-2">
                {workflow.status === 'running' ? (
                  <Button size="sm" variant="destructive" onClick={() => stopWorkflow(workflow.id)}>
                    Stop
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => startWorkflow(workflow.id)}>
                    Start
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => viewExecutionHistory(workflow.id)}>
                  History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}