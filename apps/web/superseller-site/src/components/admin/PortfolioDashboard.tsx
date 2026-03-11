'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    GitBranch,
    ExternalLink,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Globe,
    GitCommit,
    Rocket,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Lock,
    Unlock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';

interface Commit {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
}

interface Deploy {
    id: string;
    state: string;
    url: string | null;
    createdAt: string | null;
    source: string;
    commitSha?: string;
}

interface RepoInfo {
    stars: number;
    openIssues: number;
    defaultBranch: string;
    pushedAt: string;
    language: string;
    private: boolean;
}

interface ProjectData {
    label: string;
    owner: string;
    repo: string;
    repoUrl: string;
    info: RepoInfo | null;
    commits: Commit[];
    commitError?: string;
    deploys: Deploy[];
    deployError?: string;
    latestDeploy: Deploy | null;
}

interface Summary {
    totalProjects: number;
    commitsToday: number;
    deployErrors: number;
    allHealthy: boolean;
}

export default function PortfolioDashboard() {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalProjects: 0, commitsToday: 0, deployErrors: 0, allHealthy: true });
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch('/api/admin/portfolio');
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
                setSummary(data.summary);
            } else {
                setError(data.error || 'Failed to load portfolio');
            }
        } catch (e) {
            setError('Network error fetching portfolio');
            console.error('Failed to fetch portfolio:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolio();
        // Refresh every 2 minutes (API rate limits)
        const interval = setInterval(fetchPortfolio, 120000);
        return () => clearInterval(interval);
    }, [fetchPortfolio]);

    const getDeployBadge = (state?: string) => {
        switch (state) {
            case 'READY':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-green-500/10 text-green-400 border-green-500/20">Live</Badge>;
            case 'ERROR':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
            case 'BUILDING':
            case 'INITIALIZING':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse">Building</Badge>;
            case 'QUEUED':
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Queued</Badge>;
            default:
                return <Badge className="px-3 py-1 rounded-lg border uppercase text-[9px] font-black tracking-widest bg-slate-500/10 text-slate-400 border-slate-500/20">No Deploy</Badge>;
        }
    };

    const timeAgo = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Portfolio</h2>
                    <p className="text-slate-400 font-medium tracking-tight">GitHub + Vercel status across all projects.</p>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchPortfolio(); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Projects', count: summary.totalProjects, color: 'text-white', icon: Globe },
                    { label: 'Commits Today', count: summary.commitsToday, color: 'text-cyan-400', icon: GitCommit },
                    { label: 'Deploy Errors', count: summary.deployErrors, color: summary.deployErrors > 0 ? 'text-red-500' : 'text-green-400', icon: Rocket },
                    { label: 'Status', count: summary.allHealthy ? 'Healthy' : 'Issues', color: summary.allHealthy ? 'text-green-400' : 'text-red-500', icon: CheckCircle2 },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className="w-3.5 h-3.5 text-slate-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                        </div>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Project Cards */}
            <div className="space-y-4">
                {loading && projects.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : projects.map(project => {
                    const isExpanded = expandedProject === project.repo;
                    const latestCommit = project.commits[0];
                    const deployState = project.latestDeploy?.state;

                    return (
                        <div key={project.repo} className="rounded-[2rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                            {/* Project Row */}
                            <button
                                onClick={() => setExpandedProject(isExpanded ? null : project.repo)}
                                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors text-left"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {isExpanded
                                        ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                        : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                    }
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black text-white">{project.label}</p>
                                            {project.info?.private
                                                ? <Lock className="w-3 h-3 text-slate-500" />
                                                : <Unlock className="w-3 h-3 text-slate-500" />
                                            }
                                            {getDeployBadge(deployState)}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                                            <span className="font-mono">{project.owner}/{project.repo}</span>
                                            {project.info?.language && (
                                                <span className="text-cyan-400/60">{project.info.language}</span>
                                            )}
                                            {latestCommit && (
                                                <>
                                                    <span className="font-mono">{latestCommit.sha}</span>
                                                    <span className="truncate max-w-[200px]">{latestCommit.message}</span>
                                                    <span>{timeAgo(latestCommit.date)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    {project.info && (
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                            {project.info.openIssues > 0 && (
                                                <span className="text-yellow-400">{project.info.openIssues} issues</span>
                                            )}
                                        </div>
                                    )}
                                    <a
                                        href={project.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </button>

                            {/* Expanded Detail */}
                            {isExpanded && (
                                <div className="px-14 pb-6 space-y-6">
                                    {/* Recent Commits */}
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">
                                            Recent Commits
                                        </p>
                                        {project.commitError ? (
                                            <p className="text-xs text-red-400">{project.commitError}</p>
                                        ) : project.commits.length === 0 ? (
                                            <p className="text-xs text-slate-500">No recent commits</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {project.commits.map((commit) => (
                                                    <div key={commit.sha} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                                        <GitCommit className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-300 truncate">{commit.message}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                                                <span className="font-mono">{commit.sha}</span>
                                                                <span>{commit.author}</span>
                                                                <span>{timeAgo(commit.date)}</span>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={commit.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-600 hover:text-cyan-400 transition-colors shrink-0"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Vercel Deploys */}
                                    {project.deploys.length > 0 && (
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">
                                                Vercel Deploys
                                            </p>
                                            <div className="space-y-2">
                                                {project.deploys.map((deploy) => (
                                                    <div key={deploy.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                                        {deploy.state === 'READY' ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                                        ) : deploy.state === 'ERROR' ? (
                                                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                        ) : (
                                                            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-300 truncate">{deploy.source}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                                                {deploy.commitSha && <span className="font-mono">{deploy.commitSha}</span>}
                                                                <span>{timeAgo(deploy.createdAt)}</span>
                                                                <span className={
                                                                    deploy.state === 'READY' ? 'text-green-400' :
                                                                    deploy.state === 'ERROR' ? 'text-red-400' :
                                                                    'text-cyan-400'
                                                                }>{deploy.state}</span>
                                                            </div>
                                                        </div>
                                                        {deploy.url && (
                                                            <a
                                                                href={deploy.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-slate-600 hover:text-cyan-400 transition-colors shrink-0"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Repo Info */}
                                    {project.info && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Branch', value: project.info.defaultBranch },
                                                { label: 'Open Issues', value: project.info.openIssues },
                                                { label: 'Last Push', value: timeAgo(project.info.pushedAt) },
                                                { label: 'Language', value: project.info.language || '—' },
                                            ].map(item => (
                                                <div key={item.label} className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                                                    <p className="text-xs text-slate-300 mt-1">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
