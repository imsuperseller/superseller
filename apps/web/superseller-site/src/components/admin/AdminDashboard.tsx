import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAgentManagement from './AIAgentManagement';
import CustomerManagement from './CustomerManagement';
import WorkflowManagement from './WorkflowManagement';
import WorkflowTemplatesManagement from './WorkflowTemplatesManagement';
import SystemMonitoring from './SystemMonitoring';
// QuickBooks CANCELLED Mar 8, 2026 (DECISIONS.md §20) — dashboard removed
import N8nMaintenanceControl from './N8nMaintenanceControl';
import MarketplaceManagement from './MarketplaceManagement';
import ProgressHub from './ProgressHub';
import AudienceInsightsTab from './AudienceInsightsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('progress');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight uppercase font-black italic italic">SuperSeller AI Admin Dashboard</h1>
        <p className="text-muted-foreground font-medium">
          Unified command systems for autonomous agents and infrastructure.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-9 h-auto md:h-12 bg-white/5 border border-white/5 p-1 rounded-2xl">
          <TabsTrigger value="progress" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest">Progress</TabsTrigger>
          <TabsTrigger value="ai-agents" className="rounded-xl data-[state=active]:bg-white/10 text-[10px] uppercase font-black tracking-widest">AI Agents</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-xl data-[state=active]:bg-white/10 text-[10px] uppercase font-black tracking-widest">Customers</TabsTrigger>
          <TabsTrigger value="audiences" className="rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest">Audiences</TabsTrigger>
          <TabsTrigger value="marketplace" className="rounded-xl data-[state=active]:bg-white/10 text-[10px] uppercase font-black tracking-widest">FB Bot</TabsTrigger>
          <TabsTrigger value="workflows" className="rounded-xl data-[state=active]:bg-white/10 text-[10px] uppercase font-black tracking-widest">Workflows</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-xl data-[state=active]:bg-white/10 text-[10px] uppercase font-black tracking-widest">Templates</TabsTrigger>
          <TabsTrigger value="n8n-control" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest">N8N Mission</TabsTrigger>
          <TabsTrigger value="system" className="rounded-xl data-[state=active]:bg-white/10 text-[10px] uppercase font-black tracking-widest">System</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <ProgressHub />
        </TabsContent>

        <TabsContent value="ai-agents" className="space-y-6">
          <AIAgentManagement />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerManagement />
        </TabsContent>

        <TabsContent value="audiences" className="space-y-6">
          <AudienceInsightsTab />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <MarketplaceManagement />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowManagement />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <WorkflowTemplatesManagement />
        </TabsContent>

        <TabsContent value="n8n-control" className="space-y-6">
          <N8nMaintenanceControl />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemMonitoring />
        </TabsContent>

        {/* QuickBooks tab removed — CANCELLED Mar 8, 2026 (DECISIONS.md §20) */}
      </Tabs>
    </div>
  );
}