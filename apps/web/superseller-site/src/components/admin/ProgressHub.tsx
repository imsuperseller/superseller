'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity, DollarSign, Layers, Package, RefreshCw,
  AlertCircle, CheckCircle, Clock, Video, FileText, Users,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
interface PulseData {
  costToday: number;
  costWeek: number;
  cost30d: number;
  servicesTotal: number;
  servicesHealthy: number;
  activeAlerts: number;
  leadsToday: number;
  leads30d: number;
}

interface ActivityItem {
  id: string;
  type: 'expense' | 'alert' | 'job' | 'content';
  title: string;
  detail: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

interface CostsData {
  today: Record<string, number>;
  trend: Array<{ date: string; total: number; byService: Record<string, number> }>;
  total30d: { total: number; byService: Record<string, number> };
  anomalies: Array<{ date: string; dailySpend: number; average: number; ratio: number }>;
}

interface PipelineData {
  videoJobs: {
    active: number; completed: number; failed: number;
    recent: Array<{ id: string; status: string; progress: number; currentStep: string; createdAt: string }>;
  };
  contentPosts: { total: number; published: number; draft: number };
}

interface ProductData {
  id: string; name: string; status: 'live' | 'built' | 'partial' | 'spec';
  statusLabel: string; description: string; customers: string[]; completionPct: number;
}

interface ProgressData {
  pulse: PulseData;
  activity: ActivityItem[];
  costs: CostsData;
  pipeline: PipelineData;
  products: ProductData[];
  timestamp: number;
}

type SubView = 'pulse' | 'costs' | 'pipeline' | 'products';

const POLL_INTERVAL = 30_000;

const STATUS_DOT: Record<string, string> = {
  live: 'bg-green-400 animate-pulse',
  built: 'bg-yellow-400',
  partial: 'bg-orange-400',
  spec: 'bg-slate-500',
};

const STATUS_BORDER: Record<string, string> = {
  live: 'border-green-500/20',
  built: 'border-yellow-500/20',
  partial: 'border-orange-500/20',
  spec: 'border-white/5',
};

const SEVERITY_DOT: Record<string, string> = {
  info: 'bg-cyan-400',
  warning: 'bg-yellow-400',
  critical: 'bg-red-400',
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────
export default function ProgressHub() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<SubView>('pulse');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/progress');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to fetch progress data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // 30s polling only on Pulse view
  useEffect(() => {
    if (view === 'pulse') {
      intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [view, fetchData]);

  // ─── Loading ─────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading Progress Hub...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-sm font-medium">Failed to load progress data.</p>
      </div>
    );
  }

  const { pulse, activity, costs, pipeline, products } = data;

  // ─── Sub-view Nav ────────────────────────────────────────────────
  const NAV: Array<{ id: SubView; label: string; icon: any }> = [
    { id: 'pulse', label: 'Pulse', icon: Activity },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'pipeline', label: 'Pipeline', icon: Layers },
    { id: 'products', label: 'Products', icon: Package },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            Progress Hub
          </h2>
          <p className="text-slate-400 font-medium">
            Platform pulse, costs, pipeline, and product status at a glance.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="px-5 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Sub-view nav pills */}
      <div className="flex gap-2 flex-wrap">
        {NAV.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              view === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── PULSE VIEW ─────────────────────────────────────────── */}
      {view === 'pulse' && (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Cost Today" value={`$${pulse.costToday.toFixed(2)}`} sub={`$${pulse.cost30d.toFixed(2)} / 30d`} icon={DollarSign} />
            <StatCard
              label="Services"
              value={`${pulse.servicesHealthy}/${pulse.servicesTotal}`}
              sub="healthy"
              icon={CheckCircle}
              accent={pulse.servicesHealthy === pulse.servicesTotal ? 'green' : 'yellow'}
            />
            <StatCard
              label="Alerts"
              value={String(pulse.activeAlerts)}
              sub="active"
              icon={AlertCircle}
              accent={pulse.activeAlerts > 0 ? 'orange' : undefined}
            />
            <StatCard label="Leads Today" value={String(pulse.leadsToday)} sub={`${pulse.leads30d} / 30d`} icon={Users} />
          </div>

          {/* Activity feed */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Recent Activity</h3>
            {activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEVERITY_DOT[item.severity]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.detail}</p>
                    </div>
                    <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">{timeAgo(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── COSTS VIEW ──────────────────────────────────────────── */}
      {view === 'costs' && (
        <div className="space-y-6">
          {/* 14-day trend bars */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">14-Day Expense Trend</h3>
            {costs.trend.length > 0 ? (
              <div className="flex items-end gap-1.5 h-32">
                {costs.trend.map(day => {
                  const maxTotal = Math.max(...costs.trend.map(d => d.total), 0.01);
                  const pct = (day.total / maxTotal) * 100;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full bg-white/5 rounded-full overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
                        <div
                          className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-slate-600 hidden md:block">{day.date.slice(5)}</span>
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ${day.total.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">No expense data in the last 14 days.</p>
            )}
          </div>

          {/* 30-day breakdown */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">30-Day Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(costs.total30d.byService).length > 0 ? (
                Object.entries(costs.total30d.byService)
                  .sort(([, a], [, b]) => b - a)
                  .map(([service, cost]) => {
                    const maxCost = Math.max(...Object.values(costs.total30d.byService));
                    const pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
                    return (
                      <div key={service} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white capitalize">{service.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-mono text-cyan-400">${cost.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-slate-500 text-sm">No expenses recorded yet.</p>
              )}
            </div>
            {costs.total30d.total > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total</span>
                <span className="text-xl font-black text-white">${costs.total30d.total.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Anomalies */}
          {costs.anomalies.length > 0 && (
            <div className="rounded-[2rem] border border-[#f47920]/20 bg-[#f47920]/5 p-6 md:p-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#f47920] mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Spending Anomalies
              </h3>
              <div className="space-y-3">
                {costs.anomalies.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white font-mono">{a.date}</span>
                    <span className="text-slate-400">${a.dailySpend.toFixed(2)} vs avg ${a.average.toFixed(2)}</span>
                    <span className="text-[#f47920] font-bold">{a.ratio}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PIPELINE VIEW ───────────────────────────────────────── */}
      {view === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Active Jobs" value={String(pipeline.videoJobs.active)} icon={Video} accent="cyan" />
            <StatCard label="Completed" value={String(pipeline.videoJobs.completed)} icon={CheckCircle} accent="green" />
            <StatCard label="Failed" value={String(pipeline.videoJobs.failed)} icon={AlertCircle} accent={pipeline.videoJobs.failed > 0 ? 'orange' : undefined} />
            <StatCard label="Content Posts" value={String(pipeline.contentPosts.total)} sub={`${pipeline.contentPosts.published} published`} icon={FileText} />
            <StatCard label="Leads (30d)" value={String(pulse.leads30d)} icon={Users} />
          </div>

          {/* Recent jobs */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 md:p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Recent Video Jobs</h3>
            {pipeline.videoJobs.recent.length > 0 ? (
              <div className="space-y-4">
                {pipeline.videoJobs.recent.map(job => {
                  const isActive = ['queued', 'processing', 'generating'].includes(job.status);
                  const isDone = job.status === 'done';
                  const isFailed = job.status === 'failed';
                  return (
                    <div key={job.id} className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDone ? 'bg-green-400' : isFailed ? 'bg-red-400' : isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white truncate">{job.currentStep}</span>
                          <span className="text-[10px] text-slate-500 ml-2">{job.status}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">{timeAgo(job.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No video jobs found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── PRODUCTS VIEW ───────────────────────────────────────── */}
      {view === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className={`p-6 rounded-[2rem] border ${STATUS_BORDER[product.status]} bg-white/[0.02] space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[product.status]}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{product.statusLabel}</span>
                  </div>
                </div>
                <span className="text-lg font-black text-white">{product.completionPct}%</span>
              </div>
              <p className="text-xs text-slate-500">{product.description}</p>
              {/* Completion bar */}
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    product.status === 'live' ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : product.status === 'built' ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : product.status === 'partial' ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'bg-slate-600'
                  }`}
                  style={{ width: `${product.completionPct}%` }}
                />
              </div>
              {/* Customer tags */}
              {product.customers.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {product.customers.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer timestamp */}
      <p className="text-center text-[10px] text-slate-600 font-medium">
        Updated: {new Date(data.timestamp).toLocaleString()}
        {view === 'pulse' && ' • auto-refreshes every 30s'}
      </p>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  accent?: 'green' | 'yellow' | 'orange' | 'cyan';
}) {
  const accentMap: Record<string, string> = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    orange: 'text-[#f47920]',
    cyan: 'text-cyan-400',
  };
  const valueColor = accent ? accentMap[accent] : 'text-white';

  return (
    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      </div>
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
