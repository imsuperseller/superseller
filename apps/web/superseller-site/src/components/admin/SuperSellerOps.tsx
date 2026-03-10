'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw, CheckCircle, AlertTriangle, Clock, Pause, Play,
  Activity, Database, HardDrive, Cpu, Layers, Timer, XCircle,
  ChevronDown, ChevronUp, ExternalLink, Zap, DollarSign,
  Video, MessageSquare, ShoppingCart, Film, Users as UsersIcon
} from 'lucide-react';

// ─── Types ───

interface QueueJob {
  id: string;
  name: string;
  data: { jobId?: string; chatId?: string; productId?: string };
  status: string;
  createdAt: string | null;
  processedAt: string | null;
  finishedAt: string | null;
  duration: number | null;
  failedReason: string | null;
  attemptsMade: number;
  attemptsTotal: number;
}

interface QueueInfo {
  name: string;
  counts: { active: number; waiting: number; completed: number; failed: number; delayed: number; paused: number };
  isPaused: boolean;
  recentFailed: QueueJob[];
  recentActive: QueueJob[];
  recentCompleted: QueueJob[];
  recentWaiting: QueueJob[];
}

interface SchedulerJob {
  name: string;
  intervalMs: number;
  lastRun: string | null;
  lastError: string | null;
  runCount: number;
  registeredAt: string;
}

interface VideoJob {
  id: string;
  status: string;
  listing_address: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
  model_preference: string | null;
  progress_percent: number | null;
  total_api_cost: number | null;
}

interface Expense {
  service: string;
  operation: string;
  cost_usd: number;
  created_at: string;
}

interface OpsData {
  timestamp: string;
  latencyMs: number;
  infrastructure: {
    worker: { online: boolean; latencyMs: number | null };
    redis: boolean;
    postgres: boolean;
  };
  queues: QueueInfo[];
  schedulerJobs: SchedulerJob[];
  recentVideoJobs: VideoJob[];
  recentExpenses: Expense[];
  dbStats: { users: number; videoJobs: number; leads: number; todaySpend: number };
}

// ─── Helpers ───

const QUEUE_ICONS: Record<string, typeof Video> = {
  'video-pipeline': Video,
  'clip-generation': Film,
  'claudeclaw': MessageSquare,
  'remotion-composition': Layers,
  'crew-video': UsersIcon,
  'marketplace-replenisher': ShoppingCart,
};

function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
  return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}

function formatInterval(ms: number): string {
  if (ms < 60_000) return `${ms / 1000}s`;
  if (ms < 3_600_000) return `${ms / 60_000}m`;
  if (ms < 86_400_000) return `${ms / 3_600_000}h`;
  return `${ms / 86_400_000}d`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const STATUS_COLORS: Record<string, { text: string; bg: string; dot: string }> = {
  complete: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  completed: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  active: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400' },
  processing: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400' },
  waiting: { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  pending: { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  delayed: { text: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400' },
  failed: { text: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  paused: { text: 'text-slate-400', bg: 'bg-slate-500/10', dot: 'bg-slate-500' },
};

function getStatusColors(status: string) {
  return STATUS_COLORS[status] || STATUS_COLORS.paused;
}

// ─── Component ───

const AUTO_REFRESH_MS = 30_000;

export default function SuperSellerOps() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);
  const [expandedScheduler, setExpandedScheduler] = useState(false);
  const [activePanel, setActivePanel] = useState<'queues' | 'scheduler' | 'history'>('queues');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ops', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d: OpsData = await res.json();
      setData(d);
      setError(null);
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

  const totalActive = data?.queues.reduce((s, q) => s + q.counts.active, 0) || 0;
  const totalWaiting = data?.queues.reduce((s, q) => s + q.counts.waiting, 0) || 0;
  const totalFailed = data?.queues.reduce((s, q) => s + q.counts.failed, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            Ops Center
          </h2>
          <p className="text-slate-400 font-medium">
            Unified job orchestration, queue monitoring, and system intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              autoRefresh
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            {autoRefresh ? '30s Auto' : 'Paused'}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Infrastructure Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <InfraCard
          label="Worker"
          online={data?.infrastructure.worker.online ?? false}
          detail={data?.infrastructure.worker.latencyMs ? `${data.infrastructure.worker.latencyMs}ms` : '—'}
          icon={<HardDrive className="w-5 h-5" />}
        />
        <InfraCard
          label="Redis"
          online={data?.infrastructure.redis ?? false}
          detail={totalActive > 0 ? `${totalActive} active` : 'idle'}
          icon={<Zap className="w-5 h-5" />}
        />
        <InfraCard
          label="Postgres"
          online={data?.infrastructure.postgres ?? false}
          detail={data?.dbStats ? `${data.dbStats.videoJobs} jobs` : '—'}
          icon={<Database className="w-5 h-5" />}
        />
        <InfraCard
          label="Queues"
          online={totalFailed === 0}
          detail={totalFailed > 0 ? `${totalFailed} failed` : `${totalWaiting} queued`}
          icon={<Layers className="w-5 h-5" />}
          warn={totalFailed > 0}
        />
        <InfraCard
          label="Today Spend"
          online={true}
          detail={`$${(data?.dbStats.todaySpend || 0).toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      {/* Panel Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {(['queues', 'scheduler', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActivePanel(tab)}
            className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${
              activePanel === tab
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {tab === 'queues' ? 'Job Queues' : tab === 'scheduler' ? 'Scheduler' : 'Job History'}
            {tab === 'queues' && totalActive > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-md text-[9px]">{totalActive}</span>
            )}
            {tab === 'queues' && totalFailed > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[9px]">{totalFailed}</span>
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      {activePanel === 'queues' && (
        <div className="space-y-4">
          {(data?.queues || []).map(queue => (
            <QueueCard
              key={queue.name}
              queue={queue}
              expanded={expandedQueue === queue.name}
              onToggle={() => setExpandedQueue(expandedQueue === queue.name ? null : queue.name)}
            />
          ))}
          {!data && loading && (
            <div className="flex items-center justify-center p-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            </div>
          )}
        </div>
      )}

      {activePanel === 'scheduler' && (
        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/5">
            {(data?.schedulerJobs || []).map(job => (
              <SchedulerRow key={job.name} job={job} />
            ))}
            {(!data?.schedulerJobs || data.schedulerJobs.length === 0) && (
              <div className="p-12 text-center text-slate-500 text-sm">
                {loading ? 'Loading scheduler data...' : 'No scheduler jobs registered (worker may be offline)'}
              </div>
            )}
          </div>
        </div>
      )}

      {activePanel === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Jobs */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Recent Video Jobs
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {(data?.recentVideoJobs || []).map(job => (
                <VideoJobRow key={job.id} job={job} />
              ))}
              {(!data?.recentVideoJobs || data.recentVideoJobs.length === 0) && (
                <div className="p-8 text-center text-slate-500 text-sm">No recent video jobs</div>
              )}
            </div>
          </div>

          {/* API Expenses */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Recent API Expenses
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {(data?.recentExpenses || []).map((exp, i) => (
                <ExpenseRow key={i} expense={exp} />
              ))}
              {(!data?.recentExpenses || data.recentExpenses.length === 0) && (
                <div className="p-8 text-center text-slate-500 text-sm">No recent expenses</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {data && (
        <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium px-2">
          <span>Last fetch: {new Date(data.timestamp).toLocaleTimeString()} ({data.latencyMs}ms)</span>
          <span>{data.dbStats.users} users / {data.dbStats.leads} leads / {data.dbStats.videoJobs} total jobs</span>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function InfraCard({ label, online, detail, icon, warn }: {
  label: string; online: boolean; detail: string; icon: React.ReactNode; warn?: boolean;
}) {
  const isOk = online && !warn;
  return (
    <div className={`relative p-5 rounded-2xl border transition-all overflow-hidden ${
      isOk
        ? 'border-emerald-500/15 bg-emerald-500/[0.03]'
        : warn
          ? 'border-amber-500/20 bg-amber-500/[0.03]'
          : 'border-red-500/20 bg-red-500/[0.03]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`${isOk ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-red-400'}`}>
          {icon}
        </div>
        <div className={`w-2 h-2 rounded-full ${
          isOk ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : warn ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.6)]'
        }`} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">{detail}</p>
    </div>
  );
}

function QueueCard({ queue, expanded, onToggle }: {
  queue: QueueInfo; expanded: boolean; onToggle: () => void;
}) {
  const Icon = QUEUE_ICONS[queue.name] || Layers;
  const total = queue.counts.active + queue.counts.waiting + queue.counts.failed + queue.counts.delayed;
  const hasIssues = queue.counts.failed > 0;
  const isActive = queue.counts.active > 0;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      hasIssues
        ? 'border-red-500/20 bg-red-500/[0.02]'
        : isActive
          ? 'border-cyan-500/15 bg-cyan-500/[0.02]'
          : 'border-white/5 bg-white/[0.02]'
    }`}>
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          hasIssues ? 'bg-red-500/10 text-red-400' : isActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-slate-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-white">{queue.name}</span>
            {queue.isPaused && (
              <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded-lg text-[9px] font-bold uppercase">Paused</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CountBadge label="active" value={queue.counts.active} color="cyan" pulse={queue.counts.active > 0} />
          <CountBadge label="waiting" value={queue.counts.waiting} color="amber" />
          <CountBadge label="failed" value={queue.counts.failed} color="red" />
          <CountBadge label="done" value={queue.counts.completed} color="emerald" />
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-5 border-t border-white/5 pt-4 space-y-4">
          {queue.recentActive.length > 0 && (
            <JobSection title="Active Jobs" jobs={queue.recentActive} />
          )}
          {queue.recentFailed.length > 0 && (
            <JobSection title="Failed Jobs" jobs={queue.recentFailed} />
          )}
          {queue.recentWaiting.length > 0 && (
            <JobSection title="Waiting" jobs={queue.recentWaiting} />
          )}
          {queue.recentCompleted.length > 0 && (
            <JobSection title="Recently Completed" jobs={queue.recentCompleted} />
          )}
          {queue.recentActive.length === 0 && queue.recentFailed.length === 0 && queue.recentWaiting.length === 0 && queue.recentCompleted.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">No recent jobs in this queue</div>
          )}
        </div>
      )}
    </div>
  );
}

function CountBadge({ label, value, color, pulse }: {
  label: string; value: number; color: string; pulse?: boolean;
}) {
  if (value === 0) return (
    <div className="text-center min-w-[48px]">
      <div className="text-sm font-bold text-slate-600">0</div>
      <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">{label}</div>
    </div>
  );

  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className="text-center min-w-[48px]">
      <div className={`text-sm font-bold ${colorMap[color] || 'text-white'} ${pulse ? 'animate-pulse' : ''}`}>{value}</div>
      <div className={`text-[8px] font-bold uppercase tracking-wider ${colorMap[color] || 'text-slate-400'}`}>{label}</div>
    </div>
  );
}

function JobSection({ title, jobs }: { title: string; jobs: QueueJob[] }) {
  return (
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{title}</h4>
      <div className="space-y-1.5">
        {jobs.map(job => {
          const sc = getStatusColors(job.status);
          return (
            <div key={job.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${job.status === 'active' ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-mono text-slate-400 w-16 flex-shrink-0">#{job.id}</span>
              <span className="text-xs text-white flex-1 truncate">
                {job.data.jobId || job.data.chatId || job.data.productId || job.name}
              </span>
              {job.duration && (
                <span className="text-[10px] text-slate-500 font-mono">{formatDuration(job.duration)}</span>
              )}
              <span className="text-[10px] text-slate-500">{timeAgo(job.createdAt)}</span>
              {job.failedReason && (
                <span className="text-[10px] text-red-400 max-w-[200px] truncate" title={job.failedReason}>
                  {job.failedReason}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchedulerRow({ job }: { job: SchedulerJob }) {
  const hasError = !!job.lastError;
  const neverRan = !job.lastRun;

  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        hasError ? 'bg-red-500/10 text-red-400' : neverRan ? 'bg-slate-500/10 text-slate-400' : 'bg-emerald-500/10 text-emerald-400'
      }`}>
        <Timer className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-black uppercase tracking-wider text-white">{job.name}</div>
        {hasError && (
          <div className="text-[10px] text-red-400 mt-0.5 truncate max-w-md" title={job.lastError!}>
            {job.lastError}
          </div>
        )}
      </div>
      <div className="text-center min-w-[60px]">
        <div className="text-xs font-bold text-slate-300">{formatInterval(job.intervalMs)}</div>
        <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">interval</div>
      </div>
      <div className="text-center min-w-[60px]">
        <div className="text-xs font-bold text-slate-300">{job.runCount}</div>
        <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">runs</div>
      </div>
      <div className="text-center min-w-[80px]">
        <div className={`text-xs font-bold ${neverRan ? 'text-slate-500' : hasError ? 'text-red-400' : 'text-emerald-400'}`}>
          {timeAgo(job.lastRun)}
        </div>
        <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">last run</div>
      </div>
    </div>
  );
}

function VideoJobRow({ job }: { job: VideoJob }) {
  const sc = getStatusColors(job.status);
  return (
    <div className="px-6 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
      <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${job.status === 'processing' ? 'animate-pulse' : ''}`} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white truncate">{job.listing_address || job.id}</div>
        <div className="text-[10px] text-slate-500">
          {job.model_preference || 'kling'} — {timeAgo(job.created_at)}
          {job.total_api_cost != null && ` — $${Number(job.total_api_cost).toFixed(2)}`}
        </div>
      </div>
      {job.progress_percent != null && job.status !== 'complete' && job.status !== 'failed' && (
        <span className="text-[10px] text-cyan-400 font-mono">{job.progress_percent}%</span>
      )}
      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${sc.bg} ${sc.text}`}>
        {job.status}
      </span>
      {job.error_message && (
        <span className="text-[10px] text-red-400 max-w-[150px] truncate" title={job.error_message}>
          {job.error_message}
        </span>
      )}
    </div>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <div className="px-6 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
      <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
        <DollarSign className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white">{expense.service}</div>
        <div className="text-[10px] text-slate-500">{expense.operation}</div>
      </div>
      <span className="text-sm font-bold text-amber-400">${Number(expense.cost_usd).toFixed(3)}</span>
      <span className="text-[10px] text-slate-500 min-w-[60px] text-right">{timeAgo(expense.created_at)}</span>
    </div>
  );
}
