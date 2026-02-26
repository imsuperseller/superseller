import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MCPTool {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'error';
  usage: number;
  revenue: number;
  lastUsed: string;
  description: string;
}

interface MCPToolCategory {
  name: string;
  tools: MCPTool[];
  totalRevenue: number;
  totalUsage: number;
}

export default function MCPToolsManagement() {
  const [mcpTools, setMcpTools] = useState<MCPToolCategory[]>([
    {
      name: "N8N Workflow Management",
      totalRevenue: 1450,
      totalUsage: 1250,
      tools: [
        {
          id: 'deploy_n8n_workflow',
          name: 'Deploy n8n Workflow',
          category: 'N8N Workflow Management',
          status: 'active',
          usage: 450,
          revenue: 580,
          lastUsed: '2025-08-19T03:30:00Z',
          description: 'Deploy workflows to n8n instance with environment-specific configuration'
        },
        {
          id: 'monitor_n8n_execution',
          name: 'Monitor n8n Execution',
          category: 'N8N Workflow Management',
          status: 'active',
          usage: 800,
          revenue: 870,
          lastUsed: '2025-08-19T03:25:00Z',
          description: 'Monitor workflow execution and performance metrics'
        }
      ]
    },
    {
      name: "Affiliate Commission Tracking",
      totalRevenue: 2200,
      totalUsage: 1800,
      tools: [
        {
          id: 'track_n8n_commissions',
          name: 'Track n8n Commissions',
          category: 'Affiliate Commission Tracking',
          status: 'active',
          usage: 950,
          revenue: 1100,
          lastUsed: '2025-08-19T03:20:00Z',
          description: 'Track n8n affiliate commissions by customer and time range'
        },
        {
          id: 'generate_affiliate_report',
          name: 'Generate Affiliate Report',
          category: 'Affiliate Commission Tracking',
          status: 'active',
          usage: 850,
          revenue: 1100,
          lastUsed: '2025-08-19T03:15:00Z',
          description: 'Generate comprehensive affiliate reports with predictions'
        }
      ]
    },
    {
      name: "Business Process Automation",
      totalRevenue: 870,
      totalUsage: 650,
      tools: [
        {
          id: 'create_business_process',
          name: 'Create Business Process',
          category: 'Business Process Automation',
          status: 'active',
          usage: 300,
          revenue: 435,
          lastUsed: '2025-08-19T03:10:00Z',
          description: 'Create automated business processes with AI-powered features'
        },
        {
          id: 'monitor_business_process',
          name: 'Monitor Business Process',
          category: 'Business Process Automation',
          status: 'active',
          usage: 350,
          revenue: 435,
          lastUsed: '2025-08-19T03:05:00Z',
          description: 'Monitor business process performance and efficiency'
        }
      ]
    },
    {
      name: "SuperSeller AI Data Management",
      totalRevenue: 725,
      totalUsage: 520,
      tools: [
        {
          id: 'manage_superseller_data',
          name: 'Manage SuperSeller AI Data',
          category: 'SuperSeller AI Data Management',
          status: 'active',
          usage: 250,
          revenue: 362.5,
          lastUsed: '2025-08-19T03:00:00Z',
          description: 'Manage SuperSeller AI system data with backup and export capabilities'
        },
        {
          id: 'analyze_superseller_performance',
          name: 'Analyze SuperSeller AI Performance',
          category: 'SuperSeller AI Data Management',
          status: 'active',
          usage: 270,
          revenue: 362.5,
          lastUsed: '2025-08-19T02:55:00Z',
          description: 'Analyze SuperSeller AI system performance with recommendations'
        }
      ]
    },
    {
      name: "Customer Data Management",
      totalRevenue: 1160,
      totalUsage: 980,
      tools: [
        {
          id: 'manage_customer_data',
          name: 'Manage Customer Data',
          category: 'Customer Data Management',
          status: 'active',
          usage: 480,
          revenue: 580,
          lastUsed: '2025-08-19T02:50:00Z',
          description: 'Manage customer data and profiles with comprehensive analytics'
        },
        {
          id: 'customer_analytics',
          name: 'Customer Analytics',
          category: 'Customer Data Management',
          status: 'active',
          usage: 500,
          revenue: 580,
          lastUsed: '2025-08-19T02:45:00Z',
          description: 'Customer analytics and insights with predictive capabilities'
        }
      ]
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('N8N Workflow Management');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const executeMCPTool = async (toolId: string) => {
    console.log(`Executing MCP tool: ${toolId}`);
    // Implementation for executing MCP tool
  };

  const viewToolDetails = async (toolId: string) => {
    console.log(`Viewing details for tool: ${toolId}`);
    // Implementation for viewing tool details
  };

  const totalRevenue = mcpTools.reduce((sum, category) => sum + category.totalRevenue, 0);
  const totalUsage = mcpTools.reduce((sum, category) => sum + category.totalUsage, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">MCP Tools Management</h2>
        <div className="flex space-x-4">
          <Badge variant="outline">Total Revenue: ${totalRevenue}</Badge>
          <Badge variant="outline">Total Usage: {totalUsage}</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">Active MCP Tools</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">All tools operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">From MCP tool usage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Tool executions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tool Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {mcpTools.map((category) => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {mcpTools.map((category) => (
          <TabsContent key={category.name} value={category.name} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <div className="flex space-x-2">
                <Badge variant="outline">Revenue: ${category.totalRevenue}</Badge>
                <Badge variant="outline">Usage: {category.totalUsage}</Badge>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {category.tools.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tool.name}
                      <Badge className={getStatusColor(tool.status)}>
                        {tool.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Usage:</span>
                        <span>{tool.usage} executions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span>${tool.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Used:</span>
                        <span>{new Date(tool.lastUsed).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => executeMCPTool(tool.id)}>
                        Execute
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => viewToolDetails(tool.id)}>
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
