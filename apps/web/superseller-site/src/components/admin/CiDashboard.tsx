'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    GitBranch,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    RefreshCw,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';

interface CiRun {
    id: string;
    repo: string;
    branch: string;
    commitSha: string;
    commitMsg?: string;
    status: string;
    duration?: number;
    typeCheck?: string;
    lint?: string;
    build?: string;
    testCount?: number;
    failCount?: number;
    errorLog?: string;
    workflowUrl?: string;
    triggeredBy?: string;
    createdAt: string;
    project?: { name: string; type: string };
}

interface CiStats {
    passed: number;
    failed: number;
    running: number;
    total: number;
}

export default function CiDashboard() {
    const [runs, setRuns] = useState<CiRun[]>([]);
    const [stats, setStats] = useState<CiStats>({ passed: 0, failed: 0, running: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [expandedRun, setExpandedRun] = useState<string | null>(null);

    const fetchRuns = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/ci');
            const data = await res.json();
            if (data.success) {
                setRuns(data.runs);
                if (data.stats) setStats(data.stats);
            }
        } catch (e) {
            console.error('Failed to fetch CI runs:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRuns();
        // Auto-refresh every 30s
        const interval = setInterval(fetchRuns, 30000);
        return () => clearInterval(interval);
    }, [fetchRuns]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'passed':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-green-500/10 text-green-400 border-green-500/20">Passed</Badge>;
            case 'failed':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
            case 'running':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse">Running</Badge>;
            default:
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-slate-500/10 text-slate-400 border-slate-500/20">{status}</Badge>;
        }
    };

    const getStepIcon = (result?: string) => {
        if (result === 'success') return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
        if (result === 'failure') return <XCircle className="w-3.5 h-3.5 text-red-400" />;
        if (result === 'skipped') return <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />;
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    };

    const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">CI Pipeline</h2>
                    <p className="text-slate-400 font-medium tracking-tight">Automated build, lint, and type-check on every push.</p>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchRuns(); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pass Rate', count: `${passRate}%`, color: passRate >= 80 ? 'text-green-400' : passRate >= 50 ? 'text-yellow-400' : 'text-red-500' },
                    { label: 'Passed', count: stats.passed, color: 'text-green-400' },
                    { label: 'Failed', count: stats.failed, color: 'text-red-500' },
                    { label: 'Running', count: stats.running, color: 'text-cyan-400' },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Run list */}
            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                {loading && runs.length === 0 ? (
                    <div className="space-y-0 divide-y divide-white/5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/[0.02] animate-pulse" />
                        ))}
                    </div>
                ) : runs.length === 0 ? (
                    <div className="p-12 text-center">
                        <GitBranch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm font-medium">No CI runs yet. Push to main to trigger the first run.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {runs.map(run => {
                            const isExpanded = expandedRun === run.id;
                            return (
                                <div key={run.id}>
                                    <button
                                        onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                                        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {isExpanded
                                                ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                                : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                            }
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm font-black text-white truncate">
                                                        {run.commitMsg ?? run.commitSha.slice(0, 8)}
                                                    </p>
                                                    {getStatusBadge(run.status)}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                                                    <span className="font-mono">{run.commitSha.slice(0, 7)}</span>
                                                    <span>{run.branch}</span>
                                                    {run.project && (
                                                        <span className="text-cyan-400 font-black uppercase tracking-widest">{run.project.name}</span>
                                                    )}
                                                    <span>{new Date(run.createdAt).toLocaleString()}</span>
                                                    {run.triggeredBy && <span>by {run.triggeredBy}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            {/* Step indicators */}
                                            <div className="flex items-center gap-1.5" title="TypeCheck / Lint / Build">
                                                {getStepIcon(run.typeCheck ?? undefined)}
                                                {getStepIcon(run.lint ?? undefined)}
                                                {getStepIcon(run.build ?? undefined)}
                                            </div>
                                            {run.workflowUrl && (
                                                <a
                                                    href={run.workflowUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="px-14 pb-5 space-y-3">
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { label: 'Type Check', value: run.typeCheck },
                                                    { label: 'Lint', value: run.lint },
                                                    { label: 'Build', value: run.build },
                                                ].map(step => (
                                                    <div key={step.label} className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{step.label}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {getStepIcon(step.value ?? undefined)}
                                                            <span className="text-xs text-slate-300 capitalize">{step.value ?? 'pending'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {run.errorLog && (
                                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-2">Error Log</p>
                                                    <pre className="text-xs text-red-300/80 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                        {run.errorLog}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
