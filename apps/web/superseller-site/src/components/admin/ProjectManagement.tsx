'use client';

import React, { useState, useEffect } from 'react';
import {
    FolderOpen,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Calendar,
    User,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';

interface Project {
    id: string;
    name: string;
    description?: string;
    type: 'internal' | 'customer' | 'infrastructure' | 'external';
    status: 'planning' | 'in_progress' | 'verification' | 'completed' | 'blocked';
    progress: number;
    pillar?: string;
    owner?: string;
    githubRepo?: string;
    vercelProjectId?: string;
    startDate?: string;
    dueDate?: string;
    outlookEventId?: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectStats {
    active: number;
    blocked: number;
    completed: number;
    upcoming: number;
}

export default function ProjectManagement() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<ProjectStats>({ active: 0, blocked: 0, completed: 0, upcoming: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/projects');
                const data = await response.json();
                if (data.success) {
                    setProjects(data.projects);
                    if (data.stats) setStats(data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const getTypeColor = (type: Project['type']) => {
        switch (type) {
            case 'customer':       return 'text-cyan-400';
            case 'infrastructure': return 'text-yellow-400';
            case 'external':       return 'text-purple-400';
            default:               return 'text-slate-500';
        }
    };

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'blocked': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'in_progress': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'planning': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Project Nexus</h2>
                    <p className="text-slate-400 font-medium tracking-tight">Active implementations and pillar deployments.</p>
                </div>
                <Button className="bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] px-8 py-6 shadow-xl shadow-cyan-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Initialize New Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active', count: stats.active, color: 'text-cyan-400' },
                    { label: 'Blocked', count: stats.blocked, color: 'text-red-500' },
                    { label: 'Completed', count: stats.completed, color: 'text-green-400' },
                    { label: 'Upcoming', count: stats.upcoming, color: 'text-purple-400' }
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search missions..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="px-4 py-2 rounded-xl border-white/10 text-slate-400 uppercase text-[9px] font-black tracking-widest cursor-pointer hover:bg-white/5">Filter</Badge>
                        <Badge variant="outline" className="px-4 py-2 rounded-xl border-white/10 text-slate-400 uppercase text-[9px] font-black tracking-widest cursor-pointer hover:bg-white/5">Sort</Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Project Mission</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Client / Pilot</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status Pulse</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Progress</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Target Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                <FolderOpen className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{project.name}</p>
                                                    {project.outlookEventId && (
                                                        <Calendar className="w-3 h-3 text-cyan-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {project.pillar && (
                                                        <p className="text-[10px] text-slate-500 font-medium">{project.pillar}</p>
                                                    )}
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${getTypeColor(project.type)}`}>
                                                        {project.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                                {(project.owner ?? '?')[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium">{project.owner ?? '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge className={`px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-32 space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>{project.progress}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cyan-500 transition-all duration-1000"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-400 font-mono">
                                        <div className="flex flex-col">
                                            <span>
                                                {project.dueDate
                                                    ? new Date(project.dueDate).toISOString().split('T')[0]
                                                    : '—'}
                                            </span>
                                            {project.outlookEventId && (
                                                <span className="text-[8px] text-cyan-500/50 uppercase font-black tracking-tighter">Synced</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
