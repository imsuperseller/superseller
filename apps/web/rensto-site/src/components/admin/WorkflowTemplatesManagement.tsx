import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Play, 
  Pause, 
  AlertTriangle,
  BarChart3,
  Users,
  Bot,
  FileText,
  Activity
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  templateId: string;
  name: string;
  type: 'n8n' | 'Email Persona' | 'Lightrag';
  status: 'Deployed' | 'Missing' | 'Error';
  deploymentStatus: 'Active' | 'Inactive' | 'Pending';
  documentationUrl: string;
  n8nWorkflowId?: string;
  webhookUrl?: string;
  lastDeployed?: string;
  successRate: number;
  errorCount: number;
  rgid: string;
}

export default function WorkflowTemplatesManagement() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // This would connect to your Airtable API
      // For now, using mock data based on the created records
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: 'rec42l8Kex0Ut5Cq5',
          templateId: 'n8n-01',
          name: 'Advanced Business Process Automation',
          type: 'n8n',
          status: 'Deployed',
          deploymentStatus: 'Active',
          documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/n8n-workflows/01-advanced-business-process-automation.md',
          n8nWorkflowId: 'rawczJckEDeStnVL',
          webhookUrl: 'http://n8n.rensto.com/webhook/business-process-automation',
          lastDeployed: '2025-01-25',
          successRate: 95,
          errorCount: 2,
          rgid: 'RGID_WORKFLOW_N8N_01_1737820800000_a1b2c3d4'
        },
        {
          id: 'recLuICkpnVWIJEi9',
          templateId: 'n8n-02',
          name: 'Real-Time Analytics Dashboard',
          type: 'n8n',
          status: 'Deployed',
          deploymentStatus: 'Active',
          documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/n8n-workflows/02-real-time-analytics-dashboard.md',
          n8nWorkflowId: 'yOH1RZI5ZaKc9zy4',
          webhookUrl: 'http://n8n.rensto.com/webhook/analytics-dashboard',
          lastDeployed: '2025-01-25',
          successRate: 98,
          errorCount: 1,
          rgid: 'RGID_WORKFLOW_N8N_02_1737820800000_b2c3d4e5'
        },
        {
          id: 'recwClM8Mt1VU9dgc',
          templateId: 'n8n-03',
          name: 'Customer Onboarding Automation',
          type: 'n8n',
          status: 'Missing',
          deploymentStatus: 'Pending',
          documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/n8n-workflows/03-customer-onboarding-automation.md',
          successRate: 0,
          errorCount: 0,
          rgid: 'RGID_WORKFLOW_N8N_03_1737820800000_c3d4e5f6'
        },
        // Add other templates...
      ];
      
      setTemplates(mockTemplates);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workflow templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Deployed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Deployed</Badge>;
      case 'Missing':
        return <Badge variant="destructive">Missing</Badge>;
      case 'Error':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDeploymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'n8n':
        return <Bot className="h-4 w-4 text-blue-500" />;
      case 'Email Persona':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'Lightrag':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDeploy = async (template: WorkflowTemplate) => {
    try {
      // This would trigger the deployment process
      console.log('Deploying template:', template.name);
      // Update the template status
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, status: 'Deployed', deploymentStatus: 'Active' }
          : t
      ));
    } catch (err) {
      console.error('Error deploying template:', err);
    }
  };

  const handleToggleStatus = async (template: WorkflowTemplate) => {
    try {
      const newStatus = template.deploymentStatus === 'Active' ? 'Inactive' : 'Active';
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, deploymentStatus: newStatus }
          : t
      ));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const n8nTemplates = templates.filter(t => t.type === 'n8n');
  const emailTemplates = templates.filter(t => t.type === 'Email Persona');
  const lightragTemplates = templates.filter(t => t.type === 'Lightrag');

  const deployedCount = templates.filter(t => t.status === 'Deployed').length;
  const totalCount = templates.length;
  const deploymentProgress = (deployedCount / totalCount) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading workflow templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">12 planned templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deployedCount}</div>
            <p className="text-xs text-muted-foreground">
              {deploymentProgress.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter(t => t.deploymentStatus === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {templates.length > 0 
                ? (templates.reduce((acc, t) => acc + t.successRate, 0) / templates.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{deployedCount}/{totalCount} templates deployed</span>
            </div>
            <Progress value={deploymentProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {totalCount - deployedCount} templates remaining
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates by Type */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="n8n">n8n Workflows ({n8nTemplates.length})</TabsTrigger>
          <TabsTrigger value="email">Email Personas ({emailTemplates.length})</TabsTrigger>
          <TabsTrigger value="lightrag">Lightrag ({lightragTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(template.type)}
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {template.templateId} • {template.rgid}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(template.status)}
                    {getStatusBadge(template.status)}
                    {getDeploymentStatusBadge(template.deploymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>{template.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Error Count</span>
                        <span>{template.errorCount}</span>
                      </div>
                      {template.lastDeployed && (
                        <div className="flex justify-between text-sm">
                          <span>Last Deployed</span>
                          <span>{template.lastDeployed}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Links</h4>
                    <div className="space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(template.documentationUrl, '_blank')}
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        Documentation
                      </Button>
                      {template.n8nWorkflowId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => window.open(`http://n8n.rensto.com/workflow/${template.n8nWorkflowId}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          n8n Workflow
                        </Button>
                      )}
                      {template.webhookUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => window.open(template.webhookUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Webhook
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-1">
                      {template.status === 'Missing' && (
                        <Button
                          onClick={() => handleDeploy(template)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="h-3 w-3 mr-2" />
                          Deploy
                        </Button>
                      )}
                      {template.status === 'Deployed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleToggleStatus(template)}
                          className="w-full"
                          size="sm"
                        >
                          {template.deploymentStatus === 'Active' ? (
                            <>
                              <Pause className="h-3 w-3 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="n8n" className="space-y-4">
          {n8nTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        n8n Workflow • {template.templateId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(template.status)}
                    {getDeploymentStatusBadge(template.deploymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Workflow Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Workflow ID:</span>
                        <span className="font-mono">{template.n8nWorkflowId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span>{template.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Count:</span>
                        <span>{template.errorCount}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(template.documentationUrl, '_blank')}
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        View Documentation
                      </Button>
                      {template.n8nWorkflowId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => window.open(`http://n8n.rensto.com/workflow/${template.n8nWorkflowId}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Open in n8n
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          {emailTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Email Persona • {template.templateId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(template.status)}
                    {getDeploymentStatusBadge(template.deploymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Persona Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>Email Persona</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span>{template.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RGID:</span>
                        <span className="font-mono text-xs">{template.rgid}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(template.documentationUrl, '_blank')}
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        View Documentation
                      </Button>
                      {template.status === 'Missing' && (
                        <Button
                          onClick={() => handleDeploy(template)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="h-3 w-3 mr-2" />
                          Deploy Persona
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lightrag" className="space-y-4">
          {lightragTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Lightrag AI • {template.templateId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(template.status)}
                    {getDeploymentStatusBadge(template.deploymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">AI Workflow Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>Lightrag AI</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span>{template.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RGID:</span>
                        <span className="font-mono text-xs">{template.rgid}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(template.documentationUrl, '_blank')}
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        View Documentation
                      </Button>
                      {template.status === 'Missing' && (
                        <Button
                          onClick={() => handleDeploy(template)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="h-3 w-3 mr-2" />
                          Deploy AI Workflow
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
