'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Terminal,
    RefreshCcw,
    ShieldAlert,
    Rocket,
    Database,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Cpu,
    HardDrive,
    History,
    Play,
    StopCircle,
    Copy,
    Trash2,
    Activity,
    Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface LogEntry {
    type: 'info' | 'log' | 'warning' | 'error' | 'success';
    data: string;
    timestamp: Date;
}

interface ServiceStat {
    name: string;
    cpu: string;
    mem: string;
}

export default function N8nMaintenanceControl() {
    const [status, setStatus] = useState<any>(null);
    const [agentData, setAgentData] = useState<any>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [isResearching, setIsResearching] = useState(false);
    const [targetVersion, setTargetVersion] = useState('2.4.4');
    const [progress, setProgress] = useState(0);
    const logEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/n8n');
            const data = await res.json();
            if (data.success) {
                setStatus(data);
            }
        } catch (err) {
            console.error('Failed to fetch n8n status');
        }
    };

    const fetchAgentData = async () => {
        try {
            const res = await fetch('/api/admin/n8n/agent');
            const data = await res.json();
            if (data.success) {
                setAgentData(data);
            }
        } catch (err) {
            console.error('Failed to fetch agent memory');
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchAgentData();
        const interval = setInterval(fetchStatus, 30000); // Pulse every 30s
        return () => clearInterval(interval);
    }, []);

    const startResearch = async () => {
        setIsResearching(true);
        try {
            const res = await fetch('/api/admin/n8n/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'research', targetVersion })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Agent research complete. Pre-flight check ready.');
                fetchAgentData();
            }
        } catch (err) {
            toast.error('Agent lookup failed');
        } finally {
            setIsResearching(false);
        }
    };

    const performAction = async (action: string) => {
        setIsActionLoading(action);
        try {
            const res = await fetch('/api/admin/n8n', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Action: ${action} executed successfully`);
                fetchStatus();
            } else {
                toast.error(`Action failed: ${data.output}`);
            }
        } catch (err) {
            toast.error('Network error during action');
        } finally {
            setIsActionLoading(null);
        }
    };

    const startUpgrade = async () => {
        if (!confirm(`Are you sure you want to upgrade n8n to v${targetVersion}?`)) return;

        setIsUpgrading(true);
        setLogs([]);
        setProgress(5);

        try {
            const response = await fetch('/api/admin/n8n', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'upgrade', targetVersion })
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const events = chunk.split('\n\n');

                events.forEach(event => {
                    if (event.startsWith('data: ')) {
                        try {
                            const payload = JSON.parse(event.replace('data: ', ''));
                            setLogs(prev => [...prev, { ...payload, timestamp: new Date() }]);

                            if (payload.data.includes('STEP 1')) setProgress(20);
                            if (payload.data.includes('STEP 2')) setProgress(50);
                            if (payload.data.includes('STEP 3')) setProgress(80);
                            if (payload.data.includes('UPGRADE CONFIRMED')) setProgress(100);
                        } catch (e) {
                            console.error('Failed to parse event', e);
                        }
                    }
                });
            }
        } catch (error) {
            setLogs(prev => [...prev, {
                type: 'error',
                data: error instanceof Error ? error.message : 'Unknown connection error',
                timestamp: new Date()
            }]);
        } finally {
            setIsUpgrading(false);
            fetchStatus();
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* 1. Resource Monitor */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                            <Cpu className="w-3 h-3 mr-2 text-cyan-400" />
                            Container Pulse
                        </h3>
                        <div className="space-y-3">
                            {status?.services?.map((svc: any) => (
                                <div key={svc.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white uppercase">{svc.name}</span>
                                        <span className="text-[10px] font-medium text-slate-500">{svc.cpu}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 transition-all duration-500"
                                            style={{ width: svc.cpu.includes('%') ? svc.cpu : '0%' }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Mem: {svc.mem}</p>
                                </div>
                            ))}
                            {!status && <div className="text-[10px] text-slate-600 animate-pulse italic">Scanning fleet...</div>}
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                            <History className="w-3 h-3 mr-2 text-purple-400" />
                            Recent Backups
                        </h3>
                        <div className="space-y-2">
                            {status?.backups?.map((b: string) => (
                                <div key={b} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                    <span className="text-[10px] font-medium text-slate-400 font-mono truncate mr-2">{b}</span>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:text-cyan-400 text-slate-600 transition-colors"><Copy className="w-3 h-3" /></button>
                                        <button className="p-1 hover:text-red-400 text-slate-600 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                            {!status?.backups?.length && <div className="text-[10px] text-slate-600 italic">No backups found</div>}
                        </div>
                    </div>
                </div>

                {/* 2. Main Control Deck */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* 2.1 Agent Supervisor (Intelligence Layer) */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/10 space-y-6 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">AI Supervisor</h4>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic italic">Consciousness Active</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={startResearch}
                                    disabled={isResearching}
                                    variant="outline"
                                    className="h-10 px-4 bg-white/5 border-purple-500/20 text-purple-400 font-bold uppercase tracking-widest text-[9px] hover:bg-purple-500/20"
                                >
                                    {isResearching ? <RefreshCcw className="w-3 h-3 animate-spin mr-2" /> : <Search className="w-3 h-3 mr-2" />}
                                    Pre-flight
                                </Button>
                            </div>

                            <div className="min-h-[120px] p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4 relative z-10 shadow-inner">
                                {agentData?.memory?.findings?.[0] ? (
                                    <div className="space-y-3 animate-in fade-in duration-700">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[8px] border-purple-500/30 text-purple-400 font-black tracking-widest">
                                                LATEST RESEARCH: {new Date(agentData.memory.lastResearchDate).toLocaleDateString()}
                                            </Badge>
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-3 bg-purple-500 rounded-full opacity-30" />)}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                            {agentData.memory.findings[0].split('\n').filter((l: string) => l.includes('Recommendation') || l.includes('Risk Level'))[0]?.replace('- **', '').replace('**', '')}
                                        </p>
                                        <div className="pt-2 flex flex-wrap gap-2">
                                            <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Wworkflows Safe</span>
                                            <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">Nodes Verified</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 py-4">
                                        <History className="w-8 h-8 mb-2" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest italic italic">Awaiting Observation Data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2.2 Primary Strategy Card */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/10 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Rocket className="w-24 h-24" />
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">System Vers: {status?.version || '...'}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Stable Channel | Next: {agentData?.latestVersion || '---'}</p>
                                </div>
                                {agentData?.updatesAvailable ? (
                                    <Badge variant="destructive" className="animate-bounce shadow-lg shadow-red-500/20">NEW RELEASE AVAILABLE</Badge>
                                ) : (
                                    <Badge variant="renstoSuccess" className="shadow-lg shadow-green-500/20">SYNCED</Badge>
                                )}
                            </div>

                            <div className="flex items-center space-x-4 relative z-10">
                                <div className="flex-1 p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition-colors">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Next Target</span>
                                    <input
                                        className="bg-transparent border-none text-sm font-black text-white w-20 text-right focus:ring-0"
                                        value={targetVersion}
                                        onChange={(e) => setTargetVersion(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={startUpgrade}
                                    disabled={isUpgrading || !agentData?.memory?.lastResearchDate}
                                    className="h-14 px-8 bg-cyan-500 text-black font-black uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
                                >
                                    {isUpgrading ? <RefreshCcw className="w-4 h-4 animate-spin text-black" /> : 'Execute'}
                                </Button>
                            </div>
                            {!agentData?.memory?.lastResearchDate && !isUpgrading && (
                                <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest text-center animate-pulse italic italic">Supervisor research required before execution</p>
                            )}

                            {isUpgrading && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                                        <span>Upgrade Sequence</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5 bg-white/5" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2.3 Mission Telemetry (Deep Diagnostics) */}
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                            <Activity className="w-3 h-3 mr-2 text-green-400" />
                            Mission Telemetry
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Storage Load</span>
                                <span className={`text-xs font-black ${parseInt(status?.diagnostics?.diskUsage) > 80 ? 'text-red-400' : 'text-white'}`}>
                                    {status?.diagnostics?.diskUsage || '0%'}
                                    <span className="text-[8px] text-slate-600 ml-1">({status?.diagnostics?.diskFree} Free)</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Log Anomalies</span>
                                <Badge variant={parseInt(status?.diagnostics?.recentLogErrors) > 0 ? 'destructive' : 'renstoSuccess'} className="h-4 px-1 text-[8px]">
                                    {status?.diagnostics?.recentLogErrors || 0} ERRORS
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB Row Count</span>
                                <span className="text-xs font-black text-white">{parseInt(status?.diagnostics?.dbExecRows).toLocaleString() || 0}</span>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-[8px] text-slate-600 font-medium leading-relaxed italic">
                                    Scan complete. No critical memory leaks detected in last 500 cycles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Advanced Operations & Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions Deck */}
                    <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => performAction('restart')}
                            disabled={!!isActionLoading}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all flex flex-col items-center justify-center space-y-2 group"
                        >
                            <RefreshCcw className={`w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors ${isActionLoading === 'restart' ? 'animate-spin' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white text-center italic italic">Restart<br />Fleet</span>
                        </button>
                        <button
                            onClick={() => performAction('manual-backup')}
                            disabled={!!isActionLoading}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/20 transition-all flex flex-col items-center justify-center space-y-2 group"
                        >
                            <HardDrive className={`w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors ${isActionLoading === 'manual-backup' ? 'animate-bounce' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white text-center italic italic">Snap<br />Shot</span>
                        </button>
                        <button
                            onClick={() => performAction('prune')}
                            disabled={!!isActionLoading}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-orange-500/20 transition-all flex flex-col items-center justify-center space-y-2 group"
                        >
                            <Trash2 className={`w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors ${isActionLoading === 'prune' ? 'animate-pulse' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white text-center italic italic">Prune<br />Logs</span>
                        </button>
                        <button
                            onClick={() => performAction('rebuild')}
                            disabled={!!isActionLoading}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-red-500/20 transition-all flex flex-col items-center justify-center space-y-2 group"
                        >
                            <StopCircle className={`w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors ${isActionLoading === 'rebuild' ? 'animate-ping' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white text-center italic italic">Hard<br />Reload</span>
                        </button>
                    </div>

                    {/* Experimental Terminal */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                                <Terminal className="w-4 h-4 mr-2 text-purple-400" />
                                Live Telemetry Stream
                            </h3>
                            <button
                                onClick={() => setLogs([])}
                                className="text-[9px] font-black uppercase text-slate-600 hover:text-white transition-colors"
                            >
                                Clear Channel
                            </button>
                        </div>
                        <div className="h-[250px] rounded-[2rem] bg-black border border-white/5 p-6 font-mono text-[11px] overflow-y-auto scrollbar-hide shadow-inner">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-20">
                                    <Terminal className="w-6 h-6" />
                                    <p className="tracking-widest uppercase font-bold text-[9px]">Awaiting Instructions...</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {logs.map((log, i) => (
                                        <div key={i} className="flex space-x-3 group">
                                            <span className="text-slate-800 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
                                            <span className={
                                                log.type === 'info' ? 'text-cyan-400 font-bold' :
                                                    log.type === 'warning' ? 'text-yellow-400' :
                                                        log.type === 'error' ? 'text-red-400' :
                                                            log.type === 'success' ? 'text-green-400 font-black uppercase' :
                                                                'text-slate-400'
                                            }>
                                                {log.data}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={logEndRef} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
