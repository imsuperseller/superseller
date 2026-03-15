'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Progress } from '@/components/ui/progress';

interface PM2Process {
  name: string;
  status: string;
  cpu: number;
  memory: string;
  uptime: string;
  restarts: number;
  pid: number;
}

interface DockerContainer {
  name: string;
  status: string;
  image: string;
  ports: string;
  state: 'running' | 'stopped' | 'error';
}

interface WebhookMetric {
  provider: string;
  total: number;
  completed: number;
  failed: number;
  processing: number;
  lastProcessed: string | null;
}

interface WebhookFailure {
  id: string;
  provider: string;
  eventType: string;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

interface SystemData {
  metrics: {
    cpu: number;
    memory: number;
    memoryUsedGb: string;
    memoryTotalGb: string;
    disk: number;
    diskUsedGb: string;
    diskTotalGb: string;
    uptime: string;
    loadAvg: number[];
    hostname: string;
    workerStatus: 'online' | 'offline';
    workerLatencyMs: number;
  };
  pm2: PM2Process[];
  docker: DockerContainer[];
  alerts: string[];
  webhookMetrics: WebhookMetric[];
  recentFailures: WebhookFailure[];
  fetchedAt: string;
}

export default function SystemMonitoring() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/system-monitoring', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-400';
    if (usage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getUsageBadge = (usage: number) => {
    if (usage < 50) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (usage < 80) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const getUsageLabel = (usage: number) => {
    if (usage < 50) return 'Good';
    if (usage < 80) return 'Warning';
    return 'Critical';
  };

  const getStateColor = (state: string) => {
    if (state === 'running' || state === 'online') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (state === 'stopped' || state === 'stopping') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System Monitoring</h2>
        <div className="text-slate-400 animate-pulse">Loading real-time metrics from RackNerd...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System Monitoring</h2>
        <div className="text-red-400">Error: {error}</div>
        <button onClick={fetchData} className="px-4 py-2 bg-white/10 rounded-xl text-white text-sm">Retry</button>
      </div>
    );
  }

  const m = data!.metrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System Monitoring</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            {m.hostname} &middot; Worker {m.workerStatus} ({m.workerLatencyMs}ms)
            {data?.fetchedAt && ` \u00b7 ${new Date(data.fetchedAt).toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <span className="text-[10px] text-cyan-400 animate-pulse uppercase tracking-widest">Refreshing...</span>}
          <Badge variant={data!.alerts.length > 0 ? 'destructive' : 'default'}>
            {data!.alerts.length} Alert{data!.alerts.length !== 1 ? 's' : ''}
          </Badge>
          <button onClick={fetchData} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all">
            Refresh
          </button>
        </div>
      </div>

      {/* Resource Gauges */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'CPU Usage', value: m.cpu, detail: `Load: ${m.loadAvg.map(l => l.toFixed(2)).join(', ')}` },
          { label: 'Memory', value: m.memory, detail: `${m.memoryUsedGb} / ${m.memoryTotalGb} GB` },
          { label: 'Disk', value: m.disk, detail: `${m.diskUsedGb} / ${m.diskTotalGb} GB` },
          { label: 'Uptime', value: -1, detail: m.uptime },
        ].map(item => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                {item.label}
                {item.value >= 0 && (
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getUsageBadge(item.value)}`}>
                    {getUsageLabel(item.value)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.value >= 0 ? (
                <>
                  <div className={`text-2xl font-black ${getUsageColor(item.value)}`}>{item.value}%</div>
                  <Progress value={item.value} className="w-full mt-2" />
                  <p className="text-[10px] text-slate-500 mt-1">{item.detail}</p>
                </>
              ) : (
                <div className="text-2xl font-black text-cyan-400">{item.detail}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {data!.alerts.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 text-sm">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {data!.alerts.map((alert, i) => (
                <li key={i} className="text-sm text-red-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {alert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* PM2 Processes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">PM2 Processes ({data!.pm2.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data!.pm2.length === 0 ? (
              <p className="text-slate-500 text-sm">No PM2 data available (diagnostics endpoint may not be exposed)</p>
            ) : (
              <div className="space-y-3">
                {data!.pm2.map((proc) => (
                  <div key={proc.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">{proc.name}</p>
                      <p className="text-[10px] text-slate-500">PID {proc.pid} &middot; {proc.memory} &middot; {proc.restarts} restarts</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStateColor(proc.status)}`}>
                      {proc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Docker Containers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Docker Containers ({data!.docker.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data!.docker.length === 0 ? (
              <p className="text-slate-500 text-sm">No Docker data available</p>
            ) : (
              <div className="space-y-3">
                {data!.docker.map((container) => (
                  <div key={container.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">{container.name}</p>
                      <p className="text-[10px] text-slate-500">{container.image} &middot; :{container.ports}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStateColor(container.state)}`}>
                      {container.state}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Webhook Health */}
      <WebhookHealthSection
        metrics={data!.webhookMetrics || []}
        recentFailures={data!.recentFailures || []}
      />
    </div>
  );
}

function WebhookHealthSection({
  metrics,
  recentFailures,
}: {
  metrics: WebhookMetric[];
  recentFailures: WebhookFailure[];
}) {
  const totalCompleted = metrics.reduce((sum, r) => sum + r.completed, 0);
  const totalAll = metrics.reduce((sum, r) => sum + r.total, 0);
  const successRate = totalAll > 0 ? (totalCompleted / totalAll) * 100 : 100;

  const successBadge =
    successRate >= 95
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : successRate >= 80
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Webhook Health (24h)</h3>
        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${successBadge}`}>
          {totalAll === 0 ? 'No Events' : `${successRate.toFixed(1)}% Success`}
        </span>
      </div>

      {/* Per-provider summary */}
      {metrics.length === 0 ? (
        <Card>
          <CardContent className="pt-4">
            <p className="text-slate-500 text-sm">No webhook events in the last 24 hours.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                <th className="text-left pb-2 pr-4">Provider</th>
                <th className="text-right pb-2 pr-4">Total</th>
                <th className="text-right pb-2 pr-4">Success</th>
                <th className="text-right pb-2 pr-4">Failed</th>
                <th className="text-right pb-2 pr-4">Processing</th>
                <th className="text-right pb-2">Last Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {metrics.map((row) => (
                <tr key={row.provider} className="text-white">
                  <td className="py-2 pr-4 font-bold uppercase text-xs">{row.provider}</td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-300">{row.total}</td>
                  <td className="py-2 pr-4 text-right font-mono text-green-400">{row.completed}</td>
                  <td className="py-2 pr-4 text-right font-mono text-red-400">{row.failed}</td>
                  <td className="py-2 pr-4 text-right font-mono text-yellow-400">{row.processing}</td>
                  <td className="py-2 text-right font-mono text-slate-500 text-[10px]">
                    {row.lastProcessed ? new Date(row.lastProcessed).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent failures */}
      {recentFailures.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 text-sm">Recent Webhook Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentFailures.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{f.provider} &middot; {f.eventType}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(f.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {f.errorMessage && (
                    <p className="text-xs text-slate-400 truncate">{f.errorMessage}</p>
                  )}
                  {f.retryCount > 0 && (
                    <p className="text-[10px] text-slate-600 mt-1">{f.retryCount} retry attempt{f.retryCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
