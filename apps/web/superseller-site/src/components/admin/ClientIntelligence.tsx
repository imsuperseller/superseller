'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Activity,
    Zap,
    ShieldCheck,
    TrendingUp,
    AlertCircle,
    MessageSquare,
    Clock,
    ChevronRight,
    Star,
    DollarSign,
    MoreVertical,
    CheckCircle2,
    Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';

interface BusinessClient {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'onboarding' | 'churn_risk' | 'trial' | 'lead' | 'prospect' | 'qualified';
    revenue: number;
    healthScore: number;
    activeEngines: number;
    lastActive: string;
    responseTime: string;
}

export default function ClientCRM() {
    const [clients, setClients] = useState<BusinessClient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/clients');
            const data = await response.json();
            if (data.clients) {
                // Map Firestore fields to our UI interface
                const mappedClients = data.clients.map((c: any) => ({
                    id: c.id,
                    name: c.name || c.id,
                    email: c.email || (c.contact?.name ? `${c.contact.name}@example.com` : 'N/A'),
                    status: c.status || 'lead',
                    revenue: c.totalRevenue || (c.tier === 'custom' ? 2497 : 0),
                    healthScore: c.healthScore || 90, // Default to 90 if not set
                    activeEngines: c.activeWorkflows || 0,
                    lastActive: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'N/A',
                    responseTime: '1.2m' // Demo metric
                }));
                // Sort by revenue so active customers come first
                setClients(mappedClients.sort((a: any, b: any) => b.revenue - a.revenue));
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    const [filter, setFilter] = useState('');
    const [selectedClient, setSelectedClient] = useState<BusinessClient | null>(null);

    const getStatusColor = (status: BusinessClient['status']) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'onboarding': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'churn_risk': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'trial': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'lead': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'prospect': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'qualified': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-cyan-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Client Intelligence</h2>
                    <p className="text-slate-400 font-medium tracking-tight">Predictive health monitoring and relationship management.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search client nexus..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <Button variant="supersellerPrimary" className="rounded-xl text-[10px] font-black uppercase tracking-widest h-10">
                        Export CRM Data
                    </Button>
                </div>
            </div>

            {selectedClient ? (
                // Client 360 View
                <div className="animate-in fade-in slide-in-from-right duration-500 space-y-8">
                    <button onClick={() => setSelectedClient(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                        ← Back to Nexus
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[3rem]">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                                            {selectedClient.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedClient.name}</h3>
                                            <p className="text-slate-500 font-bold">{selectedClient.email}</p>
                                            <div className="flex gap-2">
                                                <Badge className={`mt-3 ${getStatusColor(selectedClient.status)}`}>
                                                    {selectedClient.status.replace('_', ' ')}
                                                </Badge>
                                                <Badge variant="outline" className="mt-3 border-cyan-500/30 text-cyan-400">
                                                    HE/EN Active
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Health Index (CHI)</p>
                                        <p className={`text-5xl font-black ${getHealthColor(selectedClient.healthScore)}`}>{selectedClient.healthScore}%</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-white/5">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">MRR</p>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase" dir="rtl">הכנסה חודשית</span>
                                        </div>
                                        <p className="text-xl font-black text-white">${selectedClient.revenue}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active Engines</p>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase" dir="rtl">מנועים פעילים</span>
                                        </div>
                                        <p className="text-xl font-black text-white">{selectedClient.activeEngines}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Avg Response</p>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase" dir="rtl">זמן תגובה</span>
                                        </div>
                                        <p className="text-xl font-black text-cyan-400">{selectedClient.responseTime}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Last Pulse</p>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase" dir="rtl">דירוג אחרון</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-300">{selectedClient.lastActive}</p>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-8 bg-white/[0.01] border-white/5 rounded-[2rem] space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-cyan-400" /> Active Infrastructure
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-4 h-4 text-yellow-500" />
                                                <span className="text-xs font-bold text-white">WAHA Pro Agent</span>
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[8px]">STABLE</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                                <span className="text-xs font-bold text-white">Lead Machine v3</span>
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[8px]">ACTIVE</Badge>
                                        </div>

                                        {/* n8n Cluster Info */}
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-4 h-4 text-purple-400" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">n8n Cluster</span>
                                                    <span className="text-xs font-bold text-white break-all">{(selectedClient as any).n8nInstance?.url || 'superseller-master'}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[8px]">
                                                {(selectedClient as any).n8nInstance ? 'REMOTE' : 'CORE'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-8 bg-white/[0.01] border-white/5 rounded-[2rem] space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3 text-green-400" /> Growth Trajectory
                                    </h4>
                                    <div className="space-y-4 text-center py-4">
                                        <p className="text-3xl font-black text-white">+15%</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Efficiency uplift since deployment</p>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[65%]" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                    <Bot className="w-4 h-4" /> Terry Assistant
                                </h4>
                                <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                    "I've noticed {selectedClient.name}'s response time degraded yesterday. I suggest we restart their Terry Supervisor worker and re-index their Knowledge Engine."
                                </p>
                                <Button variant="supersellerPrimary" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-12">
                                    Deploy Optimization
                                </Button>
                            </Card>

                            <Card className="p-8 bg-white/[0.01] border-white/5 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Ops Feed</h4>
                                <div className="space-y-6">
                                    {[
                                        { action: 'Invoice Paid', time: '12h ago', icon: DollarSign, color: 'text-green-400' },
                                        { action: 'Engine Updated', time: '1d ago', icon: Zap, color: 'text-cyan-400' },
                                        { action: 'Ticket Resolved', time: '3d ago', icon: CheckCircle2, color: 'text-blue-400' },
                                    ].map((feed, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                                                <feed.icon className={`w-4 h-4 ${feed.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">{feed.action}</p>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase">{feed.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                // Client List (Nexus Table)
                <Card className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Pilot / Entity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status Pulse</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Health (CHI)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Engines</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Revenue (MRR)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {clients.map(client => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-cyan-500/[0.02] transition-colors cursor-pointer group"
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-slate-400 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                                                    {client.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase group-hover:text-cyan-400 transition-colors">{client.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{client.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${getStatusColor(client.status)}`}>
                                                {client.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${client.healthScore >= 70 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className={`text-sm font-black ${getHealthColor(client.healthScore)}`}>{client.healthScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-white">
                                            {client.activeEngines}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-white">
                                            ${client.revenue}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}

// Sub-components as needed
function Bot(props: any) {
    return <Zap {...props} />; // Placeholder
}
