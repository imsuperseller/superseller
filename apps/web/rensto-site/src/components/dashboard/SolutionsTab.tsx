'use client';

import React from 'react';
import {
    Zap,
    Clock,
    CheckCircle2,
    Settings,
    ChevronRight,
    Play,
    Activity,
    ShieldCheck,
    AlertCircle,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Progress } from '@/components/ui/progress';
import { SolutionInstance } from '@/types/entitlements';
import { Card } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

interface SolutionsTabProps {
    engines: SolutionInstance[];
    onSolutionClick?: (id: string) => void;
    onAddMore?: () => void;
}

export default function SolutionsTab({ engines, onSolutionClick, onAddMore }: SolutionsTabProps) {
    const getStatusDetails = (status: SolutionInstance['status']) => {
        switch (status) {
            case 'active':
                return { label: 'Active', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: CheckCircle2, progress: 100 };
            case 'provisioning':
                return { label: 'Provisioning', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Zap, progress: 75 };
            case 'configuring':
                return { label: 'Configuring', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Settings, progress: 40 };
            case 'pending_setup':
                return { label: 'Pending Setup', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Clock, progress: 15 };
            case 'suspended':
                return { label: 'Suspended', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle, progress: 0 };
            default:
                return { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Activity, progress: 0 };
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-cyan-400" />
                        My Active Engines
                    </h2>
                    <p className="text-gray-400 mt-1">Monitor and manage your deployed Rensto solutions.</p>
                </div>
                <Button
                    variant="renstoPrimary"
                    className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-6"
                    onClick={onAddMore}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy New Engine
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {engines.map((engine) => {
                    const status = getStatusDetails(engine.status);
                    const StatusIcon = status.icon;

                    return (
                        <Card
                            key={engine.id}
                            className="bg-white/[0.02] border-white/5 hover:border-cyan-500/30 transition-all duration-300 p-6 rounded-3xl group cursor-pointer"
                            onClick={() => onSolutionClick?.(engine.id)}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] uppercase font-black tracking-widest">
                                            {engine.type}
                                        </Badge>
                                        <span className="text-[10px] text-gray-500 font-mono">ID: {engine.id.slice(0, 8)}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                        {engine.name}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${status.bg} border border-white/5`}>
                                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-xs font-bold text-white">{status.progress}%</span>
                                </div>
                                <Progress value={status.progress} className="h-2 bg-white/5" indicatorClassName={status.progress === 100 ? 'bg-cyan-500' : 'bg-blue-500'} />

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Performance</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-1">
                                            <Activity className="w-3 h-3 text-green-400" />
                                            Optimal
                                        </p>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Uptime</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                                            99.9%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-gray-500 group-hover:text-white transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest">Open Dashboard</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Card>
                    );
                })}

                {engines.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-white font-bold mb-2">No Engines Deployed</h3>
                        <p className="text-gray-500 text-sm mb-6">Visit the Solution Store to activate your first automation engine.</p>
                        <Button variant="outline" className="rounded-xl" onClick={onAddMore}>
                            Browse Solutions
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
