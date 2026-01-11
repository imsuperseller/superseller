'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    CheckSquare,
    AlertTriangle,
    RefreshCcw,
    ExternalLink,
    Rocket,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';

interface ServiceStatus {
    name: string;
    status: 'online' | 'degraded' | 'offline';
    latency: string;
    lastChecked: string;
}

interface LaunchTask {
    id: string;
    category: string;
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'blocked';
    order: number;
}

export default function LaunchControlCenter() {
    const [services, setServices] = useState<ServiceStatus[]>([]);
    const [tasks, setTasks] = useState<LaunchTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/health-check');
            const data = await res.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (error) {
            console.error('Failed to fetch health status', error);
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    };

    const fetchTasks = async () => {
        setTasksLoading(true);
        try {
            const res = await fetch('/api/admin/launch-tasks');
            const data = await res.json();
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Failed to fetch launch tasks', error);
        } finally {
            setTasksLoading(false);
        }
    };

    const toggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

        try {
            const res = await fetch('/api/admin/launch-tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, status: newStatus })
            });
            const data = await res.json();
            if (!data.success) {
                // Rollback if error
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to update task', error);
            fetchTasks();
        }
    };

    const seedTasks = async () => {
        if (!confirm('This will seed initial tasks. Proceed?')) return;
        try {
            const res = await fetch('/api/admin/launch-tasks/seed');
            const data = await res.json();
            if (data.success) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to seed tasks', error);
        }
    };

    useEffect(() => {
        fetchHealth();
        fetchTasks();
        const interval = setInterval(fetchHealth, 60000); // Health pings every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Launch Control Center</h2>
                    <p className="text-slate-400 font-medium tracking-tight">System validation and deployment orchestrator.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={seedTasks}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        Seed Initial Data
                    </button>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status</p>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-sm font-black text-white uppercase tracking-tighter">Mission Ready</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Health Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-cyan-400" />
                            System Pulse
                        </h3>
                        <button
                            onClick={fetchHealth}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                        >
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {services.map((service) => (
                            <div key={service.name} className="p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase tracking-widest">{service.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Lat: {service.latency}</p>
                                </div>
                                <div className="text-right">
                                    <Badge
                                        variant={service.status === 'online' ? 'renstoSuccess' : 'destructive'}
                                        className="text-[9px] px-2"
                                    >
                                        {service.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                                <Rocket className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase">Pre-Flight Check</h4>
                                <p className="text-[10px] text-slate-400">Automated integration audit</p>
                            </div>
                        </div>
                        <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] py-6 shadow-xl shadow-cyan-500/20">
                            Run Global Health Audit
                        </Button>
                    </div>
                </div>

                {/* Launch Checklist Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                        <CheckSquare className="w-4 h-4 mr-2 text-purple-400" />
                        Mission Checklist
                    </h3>

                    <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden min-h-[400px]">
                        {tasksLoading ? (
                            <div className="flex flex-col items-center justify-center h-full p-24 space-y-4">
                                <RefreshCcw className="w-8 h-8 text-cyan-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving Mission Specs...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-24 text-center space-y-4">
                                <AlertTriangle className="w-12 h-12 text-yellow-500/50" />
                                <div>
                                    <p className="text-sm font-black text-white uppercase">No Launch Tasks Found</p>
                                    <p className="text-xs text-slate-500 mt-1">Use the "Seed Initial Data" button to begin.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {tasks.map((task) => (
                                    <div key={task.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-start space-x-6 group">
                                        <button
                                            onClick={() => toggleTask(task.id, task.status)}
                                            className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${task.status === 'completed'
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                    : 'border-white/10 text-transparent hover:border-white/30'
                                                }`}>
                                            <ShieldCheck className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{task.category}</span>
                                                {task.status === 'completed' && <span className="text-[9px] font-black uppercase tracking-widest text-green-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Verified
                                                </span>}
                                            </div>
                                            <h4 className={`text-sm font-black uppercase tracking-tight mb-1 transition-colors ${task.status === 'completed' ? 'text-slate-500 line-through decoration-cyan-500/50' : 'text-white group-hover:text-cyan-400'}`}>
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                {task.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
