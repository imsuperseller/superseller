'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, Play, Pause, Settings, BarChart3, Clock, 
  CheckCircle, AlertCircle, Plus, Filter, Search, 
  Zap, Users, DollarSign, Activity, TrendingUp
} from 'lucide-react';

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error' | 'draft';
  category: 'automation' | 'integration' | 'notification' | 'data-processing';
  executions: {
    total: number;
    successful: number;
    failed: number;
    lastRun: string;
  };
  performance: {
    averageExecutionTime: number;
    successRate: number;
    cost: number;
  };
  triggers: string[];
  nodes: number;
  lastModified: string;
  createdBy: string;
}

export default function WorkflowManagementPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/admin/workflows');
        if (response.ok) {
          const data = await response.json();
          setWorkflows(data);
        } else {
          // Generate comprehensive mock data for demonstration
          const mockWorkflows: WorkflowData[] = [
            {
              id: 'wf_001',
              name: 'Customer Onboarding Automation',
              description: 'Automated customer onboarding process with email sequences and data collection',
              status: 'active',
              category: 'automation',
              executions: {
                total: 1247,
                successful: 1189,
                failed: 58,
                lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString()
              },
              performance: {
                averageExecutionTime: 45,
                successRate: 95.3,
                cost: 12.50
              },
              triggers: ['New Customer Signup', 'Form Submission'],
              nodes: 15,
              lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'Shai Friedman'
            },
            {
              id: 'wf_002',
              name: 'Stripe Payment Processing',
              description: 'Process payments and update customer records in Airtable',
              status: 'active',
              category: 'integration',
              executions: {
                total: 3421,
                successful: 3398,
                failed: 23,
                lastRun: new Date(Date.now() - 30 * 1000).toISOString()
              },
              performance: {
                averageExecutionTime: 2.3,
                successRate: 99.3,
                cost: 8.75
              },
              triggers: ['Payment Success', 'Payment Failed'],
              nodes: 8,
              lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'System'
            },
            {
              id: 'wf_003',
              name: 'Lead Nurturing Campaign',
              description: 'Automated email sequences for lead nurturing and conversion',
              status: 'paused',
              category: 'notification',
              executions: {
                total: 892,
                successful: 845,
                failed: 47,
                lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              performance: {
                averageExecutionTime: 12,
                successRate: 94.7,
                cost: 5.20
              },
              triggers: ['New Lead', 'Email Opened', 'Link Clicked'],
              nodes: 12,
              lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'Marketing Team'
            },
            {
              id: 'wf_004',
              name: 'Data Sync Airtable-Notion',
              description: 'Bidirectional sync between Airtable and Notion databases',
              status: 'error',
              category: 'data-processing',
              executions: {
                total: 156,
                successful: 134,
                failed: 22,
                lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString()
              },
              performance: {
                averageExecutionTime: 180,
                successRate: 85.9,
                cost: 15.80
              },
              triggers: ['Scheduled', 'Manual Trigger'],
              nodes: 20,
              lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'Data Team'
            },
            {
              id: 'wf_005',
              name: 'Support Ticket Automation',
              description: 'Automated support ticket routing and escalation',
              status: 'active',
              category: 'automation',
              executions: {
                total: 567,
                successful: 556,
                failed: 11,
                lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString()
              },
              performance: {
                averageExecutionTime: 8,
                successRate: 98.1,
                cost: 3.40
              },
              triggers: ['New Support Ticket', 'Ticket Update'],
              nodes: 10,
              lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: 'Support Team'
            }
          ];
          setWorkflows(mockWorkflows);
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case 'automation':
        return <Badge className="bg-blue-500 text-white">Automation</Badge>;
      case 'integration':
        return <Badge className="bg-green-500 text-white">Integration</Badge>;
      case 'notification':
        return <Badge className="bg-purple-500 text-white">Notification</Badge>;
      case 'data-processing':
        return <Badge className="bg-orange-500 text-white">Data Processing</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalExecutions = workflows.reduce((sum, w) => sum + w.executions.total, 0);
  const totalSuccessful = workflows.reduce((sum, w) => sum + w.executions.successful, 0);
  const totalFailed = workflows.reduce((sum, w) => sum + w.executions.failed, 0);
  const overallSuccessRate = totalExecutions > 0 ? (totalSuccessful / totalExecutions) * 100 : 0;
  const totalCost = workflows.reduce((sum, w) => sum + w.performance.cost, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">Manage and monitor your automation workflows</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workflows...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">Manage and monitor your automation workflows</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>

      {/* Workflow Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">
              {workflows.filter(w => w.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overallSuccessRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Executions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">
              {totalExecutions > 0 ? ((totalFailed / totalExecutions) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="error">Error</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="automation">Automation</option>
          <option value="integration">Integration</option>
          <option value="notification">Notification</option>
          <option value="data-processing">Data Processing</option>
        </select>
      </div>

      {/* Workflow List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Workflow className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(workflow.status)}
                  {getCategoryBadge(workflow.category)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Executions</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">{workflow.executions.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Successful:</span>
                      <span className="font-medium text-green-600">{workflow.executions.successful.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{workflow.executions.failed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate:</span>
                      <span className="font-medium">{workflow.performance.successRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Performance</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Avg Time:</span>
                      <span className="font-medium">{workflow.performance.averageExecutionTime}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost:</span>
                      <span className="font-medium">${workflow.performance.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nodes:</span>
                      <span className="font-medium">{workflow.nodes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Triggers:</span>
                      <span className="font-medium">{workflow.triggers.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Triggers</h4>
                  <div className="space-y-1">
                    {workflow.triggers.map((trigger, index) => (
                      <div key={index} className="text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {trigger}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Actions</h4>
                  <div className="flex space-x-2">
                    {workflow.status === 'active' ? (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Last run: {new Date(workflow.executions.lastRun).toLocaleString()}</p>
                    <p>Modified: {new Date(workflow.lastModified).toLocaleDateString()}</p>
                    <p>Created by: {workflow.createdBy}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first workflow.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
