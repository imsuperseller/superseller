'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Zap, Cpu, Terminal, MessageSquare, Brain, Users } from 'lucide-react';

interface AgentStats {
  totalMessages: number;
  messages24h: number;
  messages7d: number;
  agentReplies: number;
  lastMessageAt: string | null;
}

interface AgentMemory {
  memoryCount: number;
  lastMemoryAt: string | null;
}

interface Agent {
  id: string;
  groupJid: string;
  tenantSlug: string;
  tenantName: string;
  agentName: string;
  persona: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  stats: AgentStats;
  memory: AgentMemory;
  hasProfile: boolean;
  profileUpdatedAt: string | null;
  status: 'active' | 'idle' | 'disabled';
}

interface OverallStats {
  totalAgents: number;
  activeAgents: number;
  totalMessages: number;
  totalMemories: number;
}

interface AIAgentManagementProps {
  products?: any[];
}

export default function AIAgentManagement({ products = [] }: AIAgentManagementProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [overall, setOverall] = useState<OverallStats>({ totalAgents: 0, activeAgents: 0, totalMessages: 0, totalMemories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/agents', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAgents(json.agents || []);
      setOverall(json.overall || { totalAgents: 0, activeAgents: 0, totalMessages: 0, totalMemories: 0 });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'idle': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'disabled': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading && agents.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Net Core</h2>
        <div className="text-slate-400 animate-pulse">Loading agent configurations from database...</div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Net Core</h2>
          <p className="text-slate-400 font-medium">ClaudeClaw autonomous agent network &mdash; real-time status.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-6 py-3 bg-[#f47920] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#f58a30] transition-all shadow-lg shadow-[#f47920]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: overall.totalAgents, icon: Cpu, color: 'text-cyan-400' },
          { label: 'Active (24h)', value: overall.activeAgents, icon: Zap, color: 'text-green-400' },
          { label: 'Total Messages', value: overall.totalMessages, icon: MessageSquare, color: 'text-[#f47920]' },
          { label: 'Memories Stored', value: overall.totalMemories, icon: Brain, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-black text-white">{stat.value.toLocaleString()}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      {agents.length === 0 && !loading ? (
        <div className="text-center py-12 text-slate-500">
          No ClaudeClaw agents configured. Set up group_agent_config in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`group relative p-8 rounded-[2rem] border transition-all overflow-hidden flex flex-col ${
                agent.status === 'active'
                  ? 'border-[#f47920]/30 bg-[#f47920]/[0.02] hover:bg-[#f47920]/[0.04] shadow-[0_0_20px_rgba(244,121,32,0.05)]'
                  : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
              }`}
            >
              {agent.status === 'active' && (
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#f47920]/10 blur-[40px] rounded-full group-hover:bg-[#f47920]/20 transition-all duration-500" />
              )}

              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  <Cpu className={`w-6 h-6 ${agent.status === 'active' ? 'text-[#f47920]' : agent.status === 'idle' ? 'text-yellow-400' : 'text-slate-500'}`} />
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase truncate">{agent.agentName}</h3>
                    {agent.enabled && (
                      <div className="px-1.5 py-0.5 bg-[#f47920] text-white text-[7px] font-black uppercase rounded shadow-[0_0_10px_rgba(244,121,32,0.5)]">
                        ON
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{agent.tenantName}</p>
                  {agent.persona && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{agent.persona}</p>
                  )}
                </div>

                {/* Message Activity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity (24h)</span>
                    <span className={`text-sm font-black ${agent.stats.messages24h > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                      {agent.stats.messages24h} msg
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${agent.status === 'active' ? 'bg-[#f47920] shadow-[0_0_10px_rgba(244,121,32,0.3)]' : 'bg-cyan-500'}`}
                      style={{ width: `${Math.min(100, agent.stats.messages24h * 5)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">7d Messages</p>
                    <p className="text-xs font-bold text-white">{agent.stats.messages7d.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Agent Replies</p>
                    <p className="text-xs font-bold text-[#f47920]">{agent.stats.agentReplies.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Memories</p>
                    <p className="text-xs font-bold text-purple-400">{agent.memory.memoryCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Last Active</p>
                    <p className="text-xs font-bold text-white">
                      {agent.stats.lastMessageAt
                        ? new Date(agent.stats.lastMessageAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                <div className="flex-1 text-[10px] text-slate-500 uppercase tracking-widest self-center">
                  {agent.groupJid.split('@')[0].slice(0, 12)}...
                </div>
                <div className="flex items-center gap-1">
                  {agent.hasProfile && (
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Profile
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
