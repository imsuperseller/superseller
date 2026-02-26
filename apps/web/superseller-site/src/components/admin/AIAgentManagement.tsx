'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Progress } from '@/components/ui/progress';
import { Template } from '@/types/legacy-types';
import { Activity, Shield, Terminal, RefreshCw, Zap, Cpu } from 'lucide-react';

interface AgentStatus {
  name: string;
  id: string;
  status: 'active' | 'inactive' | 'error';
  performance: number;
  lastExecution: string;
  errors: number;
  isSuperSellerCore?: boolean;
}

interface AIAgentManagementProps {
  products?: any[];
}

export default function AIAgentManagement({ products = [] }: AIAgentManagementProps) {
  const initialAgents: AgentStatus[] = products.length > 0 ? products.map(p => ({
    id: p.id || p['Product ID'] || 'unknown',
    name: p['Product Name'] || p.name || 'Unnamed Agent',
    status: (p['Status'] === 'active' || p.status === 'active') ? 'active' : 'inactive',
    performance: Math.floor(Math.random() * 20) + 80, // Mock for now
    lastExecution: new Date().toISOString(),
    errors: 0,
    isSuperSellerCore: (p['Product Name']?.toLowerCase()?.includes('superseller') || p['Category'] === 'AI Agents') ?? false
  })) : [
    {
      id: 'superseller-master-controller',
      name: 'SuperSeller AI Master Controller',
      status: 'active',
      performance: 99,
      lastExecution: new Date().toISOString(),
      errors: 0,
      isSuperSellerCore: true
    },
    // ... default mocked items can stay or be removed if products are expected 
  ];

  const [agents, setAgents] = useState<AgentStatus[]>(initialAgents);

  useEffect(() => {
    if (products.length > 0) {
      setAgents(products.map(p => ({
        id: p.id || p['Product ID'] || 'unknown',
        name: p['Product Name'] || p.name || 'Unnamed Agent',
        status: (p['Status'] === 'active' || p.status === 'active') ? 'active' : 'inactive',
        performance: Math.floor(Math.random() * 20) + 80,
        lastExecution: new Date().toISOString(),
        errors: 0,
        isSuperSellerCore: (p['Product Name']?.toLowerCase()?.includes('superseller') || p['Category'] === 'AI Agents') ?? false
      })));
    }
  }, [products]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const deployAgent = async (agentName: string) => {
    console.log(`Deploying ${agentName}...`);
  };

  const viewLogs = async (agentName: string) => {
    console.log(`Viewing logs for ${agentName}...`);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Net Core</h2>
          <p className="text-slate-400 font-medium">Coordinate and monitor the SuperSeller AI autonomous agent network.</p>
        </div>
        <button
          onClick={() => deployAgent('all')}
          className="flex items-center space-x-2 px-6 py-3 bg-[#f47920] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#f58a30] transition-all shadow-lg shadow-[#f47920]/20"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Sync Entire Web</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`group relative p-8 rounded-[2rem] border transition-all overflow-hidden flex flex-col ${agent.isSuperSellerCore
              ? 'border-[#f47920]/30 bg-[#f47920]/[0.02] hover:bg-[#f47920]/[0.04] shadow-[0_0_20px_rgba(244,121,32,0.05)]'
              : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
              }`}
          >
            {agent.isSuperSellerCore && (
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#f47920]/10 blur-[40px] rounded-full group-hover:bg-[#f47920]/20 transition-all duration-500" />
            )}

            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Cpu className={`w-6 h-6 ${agent.isSuperSellerCore ? 'text-[#f47920]' : 'text-cyan-400'}`} />
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase truncate">{agent.name}</h3>
                  {agent.isSuperSellerCore && (
                    <div className="px-1.5 py-0.5 bg-[#f47920] text-white text-[7px] font-black uppercase rounded shadow-[0_0_10px_rgba(244,121,32,0.5)]">
                      CORE
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {agent.id.slice(0, 16)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Compute Health</span>
                  <span className={`text-sm font-black ${agent.performance > 95 ? 'text-green-400' : 'text-cyan-400'}`}>{agent.performance}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.3)] ${agent.isSuperSellerCore ? 'bg-[#f47920]' : 'bg-cyan-500'}`}
                    style={{ width: `${agent.performance}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Pulse</p>
                  <p className="text-xs font-bold text-white uppercase">{new Date(agent.lastExecution).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Faults</p>
                  <p className={`text-xs font-bold ${agent.errors > 0 ? 'text-[#f47920]' : 'text-green-400'}`}>{agent.errors}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
              <button
                onClick={() => deployAgent(agent.name)}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reboot</span>
              </button>
              <button
                onClick={() => viewLogs(agent.name)}
                className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}