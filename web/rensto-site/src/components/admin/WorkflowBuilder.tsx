'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Play,
  Trash2,
  Settings,
  Save,
  Clock,
  Zap,
  Bell,
  Database,
  Globe,
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  Workflow,
  WorkflowStep,
} from '@/lib/workflow-automation';

interface WorkflowBuilderProps {
  orgId: string;
  onWorkflowCreated?: (workflow: Workflow) => void;
}

export default function WorkflowBuilder({
  orgId,
  onWorkflowCreated,
}: WorkflowBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    orgId,
    status: 'draft',
    trigger: {
      type: 'manual',
      config: {},
    },
    steps: [],
    variables: {},
  });

  const stepTypes = [
    {
      type: 'agent',
      name: 'Agent Execution',
      icon: Zap,
      description: 'Execute an automation agent',
    },
    {
      type: 'condition',
      name: 'Condition',
      icon: CheckCircle,
      description: 'Evaluate a condition',
    },
    {
      type: 'delay',
      name: 'Delay',
      icon: Clock,
      description: 'Wait for a specified time',
    },
    {
      type: 'notification',
      name: 'Notification',
      icon: Bell,
      description: 'Send a notification',
    },
    {
      type: 'data_sync',
      name: 'Data Sync',
      icon: Database,
      description: 'Sync data between systems',
    },
    {
      type: 'api_call',
      name: 'API Call',
      icon: Globe,
      description: 'Make an API request',
    },
  ];

  const triggerTypes = [
    { type: 'manual', name: 'Manual', description: 'Triggered manually' },
    {
      type: 'schedule',
      name: 'Schedule',
      description: 'Triggered on a schedule',
    },
    { type: 'event', name: 'Event', description: 'Triggered by an event' },
    { type: 'webhook', name: 'Webhook', description: 'Triggered by webhook' },
  ];

  useEffect(() => {
    fetchWorkflows();
  }, [orgId]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWorkflows({ orgId });
      if (response.success) {
        setWorkflows(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'agent',
      name: 'New Step',
      config: {},
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep],
    }));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps:
        prev.steps?.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        ) || [],
    }));
  };

  const removeStep = (stepId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || [],
    }));
  };

  const saveWorkflow = async () => {
    try {
      if (!currentWorkflow.name || !currentWorkflow.steps?.length) {
        alert('Please provide a name and at least one step');
        return;
      }

      const response = await apiClient.post('/workflows', currentWorkflow);
      if (response.success) {
        setWorkflows(prev => [...prev, response.data]);
        setShowBuilder(false);
        setCurrentWorkflow({
          name: '',
          description: '',
          orgId,
          status: 'draft',
          trigger: { type: 'manual', config: {} },
          steps: [],
          variables: {},
        });
        onWorkflowCreated?.(response.data);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await apiClient.post(
        `/workflows/${workflowId}/execute`,
        {}
      );
      if (response.success) {
        console.log('Workflow execution started:', response.data);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="rensto-animate-glow rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-muted-foreground">
            Create and manage advanced automation workflows
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Builder */}
      {showBuilder && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={currentWorkflow.name}
                  onChange={e =>
                    setCurrentWorkflow(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflow-status">Status</Label>
                <select
                  id="workflow-status"
                  value={currentWorkflow.status}
                  onChange={e =>
                    setCurrentWorkflow(prev => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">d</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Input
                id="workflow-description"
                value={currentWorkflow.description}
                onChange={e =>
                  setCurrentWorkflow(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter workflow description"
              />
            </div>

            {/* Trigger Configuration */}
            <div>
              <Label>Trigger Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {triggerTypes.map(trigger => (
                  <Button
                    key={trigger.type}
                    variant={
                      currentWorkflow.trigger?.type === trigger.type
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setCurrentWorkflow(prev => ({
                        ...prev,
                        trigger: { type: trigger.type as any, config: {} },
                      }))
                    }
                    className="justify-start"
                  >
                    {trigger.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Workflow Steps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Workflow Steps</Label>
                <Button size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {currentWorkflow.steps?.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <Input
                            value={step.name}
                            onChange={e =>
                              updateStep(step.id, { name: e.target.value })
                            }
                            className="w-48"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Step Type</Label>
                          <select
                            value={step.type}
                            onChange={e =>
                              updateStep(step.id, {
                                type: e.target.value as any,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                          >
                            {stepTypes.map(type => (
                              <option key={type.type} value={type.type}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>Next Step (Success)</Label>
                          <select
                            value={step.onSuccess || ''}
                            onChange={e =>
                              updateStep(step.id, { onSuccess: e.target.value })
                            }
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">End Workflow</option>
                            {currentWorkflow.steps?.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Cancel
              </Button>
              <Button onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map(workflow => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {workflow.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Steps:</span>
                  <span className="font-medium">{workflow.steps.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Executions:</span>
                  <span className="font-medium">
                    {workflow.metadata.executionCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Success Rate:</span>
                  <span className="font-medium">
                    {workflow.metadata.executionCount > 0
                      ? `${(
                          (workflow.metadata.successCount /
                            workflow.metadata.executionCount) *
                          100
                        ).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => executeWorkflow(workflow.id)}
                    disabled={workflow.status !== 'active'}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && !showBuilder && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first automation workflow to get started
            </p>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
