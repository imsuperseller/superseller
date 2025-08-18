import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAgentManagement from './AIAgentManagement';
import CustomerManagement from './CustomerManagement';
import WorkflowManagement from './WorkflowManagement';
import SystemMonitoring from './SystemMonitoring';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ai-agents');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Rensto Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive management system for AI agents, customers, workflows, and system monitoring
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-agents">AI Agents</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-agents" className="space-y-6">
          <AIAgentManagement />
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <CustomerManagement />
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-6">
          <WorkflowManagement />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <SystemMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}