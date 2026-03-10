'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw, Search, AlertTriangle, CheckCircle, Clock,
  PauseCircle, CircleDot, ExternalLink, ChevronDown, ChevronUp,
  Crosshair, Bell, BellOff, ArrowRight
} from 'lucide-react';

type Status = 'green' | 'red' | 'amber' | 'blue' | 'gray';

interface MCNode {
  name: string;
  status: Status;
  detail: string;
  tooltip: string;
  url?: string;
  latencyMs?: number;
}

interface MCCategory {
  key: string;
  icon: string;
  label: string;
  items: MCNode[];
}

interface StatusChange {
  name: string;
  from: Status;
  to: Status;
  category: string;
}

interface MCData {
  timestamp: string;
  categories: MCCategory[];
  counts: { total: number; green: number; red: number; amber: number; blue: number; gray: number };
  changes: StatusChange[];
  serverInfo: {
    workerHealthy: boolean;
    workerLatency: number;
    dbConnected: boolean;
    redisConnected: boolean;
    disk: { used: string; total: string; percent: string } | null;
    memory: { total: string; used: string; available: string } | null;
    uptime: string | null;
  };
  businessSummary?: {
    users: number;
    videoJobs: number;
    leads: number;
    apiSpendToday: string;
    apiSpendMonth: string;
    ragDocs: number;
  };
}

const STATUS_META: Record<Status, { color: string; bg: string; border: string; dot: string; glow: string; label: string; Icon: typeof CheckCircle }> = {
  green:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400', glow: 'shadow-emerald-400/40', label: 'Healthy', Icon: CheckCircle },
  red:    { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400',     glow: 'shadow-red-400/60',     label: 'Critical', Icon: AlertTriangle },
  amber:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400',   glow: 'shadow-amber-400/40',   label: 'Warning', Icon: Clock },
  blue:   { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-400',    glow: 'shadow-blue-400/30',    label: 'Paused', Icon: PauseCircle },
  gray:   { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   dot: 'bg-slate-500',   glow: '',                       label: 'Not Started', Icon: CircleDot },
};

const AUTO_REFRESH_MS = 60_000;

export default function MissionControl() {
  const [data, setData] = useState<MCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [expandedTooltip, setExpandedTooltip] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [changeLog, setChangeLog] = useState<(StatusChange & { time: Date })[]>([]);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/mission-control', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d: MCData = await res.json();
      setData(d);
      setError(null);
      setLastRefresh(new Date());
      if (d.changes && d.changes.length > 0) {
        setChangeLog(prev => [
          ...d.changes.map(c => ({ ...c, time: new Date() })),
          ...prev,
        ].slice(0, 50));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(fetchData, AUTO_REFRESH_MS);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, fetchData]);

  const toggleCat = (key: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const matchesFilter = (item: MCNode) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q) || item.tooltip.toLowerCase().includes(q);
  };

  const filteredCategories = data?.categories.map(cat => ({
    ...cat,
    items: cat.items.filter(matchesFilter),
  })).filter(cat => cat.items.length > 0) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
            <Crosshair className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              Mission Control
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              {data ? `${data.counts.total} systems monitored across ${data.categories.length} categories` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastRefresh && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setShowChangeLog(!showChangeLog)}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              changeLog.length > 0 ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-white/10 text-slate-500 bg-white/5'
            }`}
          >
            <Bell className="w-3 h-3" />
            {changeLog.length > 0 ? `${changeLog.length} changes` : 'No changes'}
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
              autoRefresh ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-slate-500 bg-white/5'
            }`}
          >
            {autoRefresh ? 'Auto 60s' : 'Manual'}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Change Log Panel */}
      {showChangeLog && changeLog.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">Status Change Log (WhatsApp alerts sent)</h3>
            <button onClick={() => { setChangeLog([]); setShowChangeLog(false); }} className="text-[9px] text-slate-500 hover:text-white">Clear</button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {changeLog.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 text-[10px] font-mono w-16 flex-shrink-0">{c.time.toLocaleTimeString()}</span>
                <span className="font-bold text-white">{c.name}</span>
                <span className={`text-[9px] font-black uppercase ${STATUS_META[c.from].color}`}>{c.from}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className={`text-[9px] font-black uppercase ${STATUS_META[c.to].color}`}>{c.to}</span>
                <span className="text-slate-500 text-[10px] ml-auto">{c.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Counters */}
      {data && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {([
            { key: 'total' as const, label: 'Total', color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
            { key: 'green' as const, label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { key: 'red' as const, label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { key: 'amber' as const, label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { key: 'blue' as const, label: 'Paused', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { key: 'gray' as const, label: 'Not Started', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
          ] as const).map(s => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key === 'total' ? 'all' : s.key)}
              className={`p-3 rounded-xl border transition-all text-center ${
                statusFilter === s.key || (s.key === 'total' && statusFilter === 'all')
                  ? `${s.bg} ${s.border} shadow-lg`
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              <p className={`text-xl font-black ${s.color}`}>{data.counts[s.key]}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Business Summary Bar */}
      {data?.businessSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'Users', value: data.businessSummary.users, color: 'text-cyan-400' },
            { label: 'Video Jobs', value: data.businessSummary.videoJobs, color: 'text-purple-400' },
            { label: 'Leads', value: data.businessSummary.leads, color: 'text-emerald-400' },
            { label: 'API Today', value: `$${data.businessSummary.apiSpendToday}`, color: Number(data.businessSummary.apiSpendToday) > 10 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'API Month', value: `$${data.businessSummary.apiSpendMonth}`, color: Number(data.businessSummary.apiSpendMonth) > 100 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'RAG Docs', value: data.businessSummary.ragDocs, color: 'text-blue-400' },
          ].map(item => (
            <div key={item.label} className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
              <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search across all systems, services, keys, customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-slate-600 font-medium focus:outline-none focus:border-cyan-500/40 transition-colors"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          Failed to load: {error}
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCategories.map(cat => {
          const isCollapsed = collapsedCats.has(cat.key);
          const catCounts: Record<Status, number> = { green: 0, red: 0, amber: 0, blue: 0, gray: 0 };
          cat.items.forEach(i => catCounts[i.status]++);

          return (
            <div key={cat.key} className="rounded-2xl border border-white/5 bg-white/[0.015] overflow-hidden">
              <button
                onClick={() => toggleCat(cat.key)}
                className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex-1 text-left">
                  {cat.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {catCounts.red > 0 && <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black flex items-center justify-center">{catCounts.red}</span>}
                  {catCounts.amber > 0 && <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black flex items-center justify-center">{catCounts.amber}</span>}
                  <span className="text-[10px] text-slate-500 font-bold w-4 text-right">{cat.items.length}</span>
                  {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
                </div>
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-white/[0.03]">
                  {cat.items.map((item, idx) => {
                    const meta = STATUS_META[item.status];
                    const nodeKey = `${cat.key}-${idx}`;
                    const isExpanded = expandedTooltip === nodeKey;

                    return (
                      <div key={nodeKey}>
                        <button
                          onClick={() => setExpandedTooltip(isExpanded ? null : nodeKey)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.02] transition-colors text-left"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${meta.dot} flex-shrink-0 ${item.status === 'red' ? 'animate-pulse' : ''}`}
                            style={item.status === 'red' ? { boxShadow: '0 0 8px rgba(239,68,68,0.6)' } : item.status === 'green' ? { boxShadow: '0 0 4px rgba(16,185,129,0.3)' } : {}}
                          />
                          <span className="text-[12px] font-bold text-white/90 flex-1 truncate">{item.name}</span>
                          {item.latencyMs !== undefined && item.latencyMs > 0 && (
                            <span className={`text-[9px] font-mono ${item.latencyMs < 500 ? 'text-emerald-500/50' : item.latencyMs < 2000 ? 'text-amber-500/50' : 'text-red-500/50'}`}>
                              {item.latencyMs}ms
                            </span>
                          )}
                          <span className={`text-[9px] font-black uppercase tracking-wider ${meta.color} flex-shrink-0 max-w-[140px] truncate`}>
                            {item.detail}
                          </span>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-slate-600 hover:text-cyan-400 transition-colors">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-2.5 pt-0.5">
                            <div className={`p-3 rounded-lg ${meta.bg} border ${meta.border} text-[11px] space-y-0.5`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <meta.Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                              </div>
                              {item.tooltip.split('\n').map((line, i) => (
                                <p key={i} className="text-slate-400 leading-relaxed">{line}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Server Footer */}
      {data?.serverInfo && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${data.serverInfo.workerHealthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
            Worker {data.serverInfo.workerLatency}ms
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${data.serverInfo.dbConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            DB {data.serverInfo.disk ? data.serverInfo.disk.percent : ''}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${data.serverInfo.redisConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            Redis
          </div>
          {data.serverInfo.memory && (
            <div className="flex items-center gap-1.5">
              RAM {data.serverInfo.memory.available} free
            </div>
          )}
          {data.serverInfo.uptime && (
            <div className="flex items-center gap-1.5">
              {data.serverInfo.uptime}
            </div>
          )}
          <div className="ml-auto text-slate-600 normal-case tracking-normal">
            Last: {new Date(data.timestamp).toLocaleTimeString()} · WhatsApp alerts {changeLog.length > 0 ? 'active' : 'standby'}
          </div>
        </div>
      )}
    </div>
  );
}
