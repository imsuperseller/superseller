'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Progress } from '@/components/ui/progress';
import { Play, Square, History, Plus, Layers, Zap } from 'lucide-react';

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
      errors: 0,
      tags: ['internal']
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
      case 'running': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'stopped': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Execution Layers</h2>
          <p className="text-slate-400 font-medium">Coordinate and monitor autonomous workflow sequences.</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-cyan-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" />
          <span>New Chain</span>
        </button>
      </div>

      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
        {[
          { id: 'all', label: 'All Engines', icon: Layers },
          { id: 'marketplace', label: 'Marketplace', icon: Zap },
          { id: 'internal', label: 'Internal Ops', icon: Plus },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${filter === item.id ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
          >
            <item.icon className="w-3 h-3" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{workflow.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                  {workflow.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Last Sync</p>
                  <p className="text-xs font-bold text-white truncate">{new Date(workflow.lastExecution).toLocaleTimeString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Latentcy</p>
                  <p className="text-xs font-bold text-white">{workflow.executionTime}ms</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stability Alpha</span>
                  <span className="text-sm font-black text-cyan-400">{workflow.successRate}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${workflow.successRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
              {workflow.status === 'running' ? (
                <button
                  onClick={() => stopWorkflow(workflow.id)}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-[#fe3d51]/10 border border-[#fe3d51]/20 rounded-xl text-[#fe3d51] hover:bg-[#fe3d51]/20 transition-all text-xs font-black uppercase tracking-widest"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Kill</span>
                </button>
              ) : (
                <button
                  onClick={() => startWorkflow(workflow.id)}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500/20 transition-all text-xs font-black uppercase tracking-widest"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Ignite</span>
                </button>
              )}
              <button
                onClick={() => viewExecutionHistory(workflow.id)}
                className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}