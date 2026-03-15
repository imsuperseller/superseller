'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, AlertCircle, CheckCircle, Clock, RefreshCw, Server,
  Database, Globe, Zap, Shield, TrendingUp, DollarSign, Bell
} from 'lucide-react';

interface ServiceHealthData {
  serviceId: string;
  name: string;
  category: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latencyMs: number;
  message?: string;
  checkedAt: string;
}

interface AlertData {
  id: string;
  serviceId: string;
  severity: string;
  condition: string;
  message: string;
  resolved: boolean;
  firedAt: string;
  resolvedAt?: string;
}

interface ExpenseData {
  total: number;
  byService: Record<string, number>;
}

interface AnomalyData {
  date: string;
  dailySpend: number;
  average: number;
  ratio: number;
}

interface WebhookMetricSummary {
  provider: string;
  total: number;
  completed: number;
  failed: number;
  processing: number;
  lastProcessed: string | null;
}

interface WebhookFailureSummary {
  id: string;
  provider: string;
  eventType: string;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

interface VoiceTranscriptionMetrics {
  totalCount: number;
  successCount: number;
  last24h: number;
  avgDurationSeconds: number;
  successRate: string;
}

interface MonitoringData {
  services: ServiceHealthData[];
  uptimes: Record<string, { h24: number; h168: number }>;
  activeAlerts: number;
  alerts: AlertData[];
  expenses: ExpenseData;
  anomalies: AnomalyData[];
  lastChecked: number | null;
}

const STATUS_CONFIG = {
  healthy: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400', label: 'Healthy' },
  degraded: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', dot: 'bg-yellow-400', label: 'Degraded' },
  down: { color: 'text-red-400', bg: 'bg-[#f47920]/10', border: 'border-[#f47920]/20', dot: 'bg-[#f47920]', label: 'Down' },
  unknown: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-400', label: 'Unknown' },
};

const CATEGORY_CONFIG: Record<string, { icon: any; label: string }> = {
  infrastructure: { icon: Server, label: 'Infrastructure' },
  api: { icon: Globe, label: 'External APIs' },
  database: { icon: Database, label: 'Database' },
  backup: { icon: Shield, label: 'Backup Systems' },
};

export default function SystemMonitor() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [view, setView] = useState<'services' | 'alerts' | 'expenses' | 'webhooks' | 'voice'>('services');
  const [webhookMetrics, setWebhookMetrics] = useState<WebhookMetricSummary[]>([]);
  const [webhookFailures, setWebhookFailures] = useState<WebhookFailureSummary[]>([]);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceTranscriptionMetrics | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [monRes, sysRes] = await Promise.all([
        fetch('/api/admin/monitoring'),
        fetch('/api/admin/system-monitoring', { cache: 'no-store' }),
      ]);
      const json = await monRes.json();
      if (json.success) setData(json);
      if (sysRes.ok) {
        const sysJson = await sysRes.json();
        if (sysJson.webhookMetrics) setWebhookMetrics(sysJson.webhookMetrics);
        if (sysJson.recentFailures) setWebhookFailures(sysJson.recentFailures);
        if (sysJson.voiceTranscriptions) setVoiceMetrics(sysJson.voiceTranscriptions);
      }
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runFullAudit = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_checks' }),
      });
      await res.json();
      await fetchData();
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const seedRules = async () => {
    try {
      const res = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_rules' }),
      });
      const json = await res.json();
      if (json.seeded > 0) alert(`Seeded ${json.seeded} default alert rules`);
      else alert('Alert rules already exist');
    } catch (err) {
      console.error('Seed failed:', err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', alertId }),
      });
      await fetchData();
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  };

  const groupedServices = data?.services.reduce<Record<string, ServiceHealthData[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {}) || {};

  const overallHealth = data?.services.every(s => s.status === 'healthy')
    ? 'healthy'
    : data?.services.some(s => s.status === 'down')
      ? 'down'
      : data?.services.some(s => s.status === 'degraded')
        ? 'degraded'
        : 'unknown';

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading System Monitor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            System Monitor
          </h2>
          <p className="text-slate-400 font-medium">
            Real-time connectivity status of all services, APIs, and infrastructure.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runFullAudit}
            disabled={running}
            className="px-5 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running...' : 'Run Full Audit'}
          </button>
          <button
            onClick={seedRules}
            className="px-5 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Seed Alert Rules
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-6 rounded-[2rem] border ${STATUS_CONFIG[overallHealth].border} ${STATUS_CONFIG[overallHealth].bg}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[overallHealth].dot} ${overallHealth === 'healthy' ? 'animate-pulse' : ''}`} />
            <span className={`text-lg font-black uppercase ${STATUS_CONFIG[overallHealth].color}`}>
              {STATUS_CONFIG[overallHealth].label}
            </span>
          </div>
        </div>
        <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Services</p>
          <p className="text-2xl font-black text-white">{data?.services.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            {data?.services.filter(s => s.status === 'healthy').length || 0} healthy
          </p>
        </div>
        <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Active Alerts</p>
          <p className={`text-2xl font-black ${(data?.activeAlerts || 0) > 0 ? 'text-[#f47920]' : 'text-white'}`}>
            {data?.activeAlerts || 0}
          </p>
        </div>
        <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">30d API Spend</p>
          <p className="text-2xl font-black text-white">${data?.expenses?.total?.toFixed(2) || '0.00'}</p>
          {(data?.anomalies?.length || 0) > 0 && (
            <p className="text-xs text-[#f47920] mt-1">{data!.anomalies.length} anomalies detected</p>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'services', label: 'Services', icon: Activity },
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'expenses', label: 'Expenses', icon: DollarSign },
          { id: 'webhooks', label: 'Webhook Health', icon: Zap },
          { id: 'voice', label: 'Voice Transcription', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
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

      {/* Services View */}
      {view === 'services' && (
        <div className="space-y-8">
          {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
            const services = groupedServices[category];
            if (!services?.length) return null;
            const CategoryIcon = config.icon;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    {config.label}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map(service => {
                    const statusCfg = STATUS_CONFIG[service.status];
                    const uptime = data?.uptimes?.[service.serviceId];

                    return (
                      <button
                        key={service.serviceId}
                        onClick={() => setSelectedService(
                          selectedService === service.serviceId ? null : service.serviceId
                        )}
                        className={`p-6 rounded-[2rem] border ${statusCfg.border} ${statusCfg.bg} text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-tight text-white">
                              {service.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                              <span className={`text-xs font-bold ${statusCfg.color}`}>
                                {statusCfg.label}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            {service.latencyMs}ms
                          </span>
                        </div>
                        {service.message && (
                          <p className="text-xs text-slate-500 truncate mb-3">{service.message}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>24h: {uptime?.h24?.toFixed(1) || '—'}%</span>
                          <span>7d: {uptime?.h168?.toFixed(1) || '—'}%</span>
                          <span>{service.checkedAt ? new Date(service.checkedAt).toLocaleTimeString() : 'Never'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {data?.services.length === 0 && (
            <div className="text-center py-16">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">No health data yet. Click "Run Full Audit" to start.</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts View */}
      {view === 'alerts' && (
        <div className="space-y-4">
          {data?.alerts && data.alerts.length > 0 ? (
            data.alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-6 rounded-[2rem] border ${
                  alert.resolved
                    ? 'border-white/5 bg-white/[0.01]'
                    : alert.severity === 'critical'
                      ? 'border-[#f47920]/20 bg-[#f47920]/5'
                      : 'border-yellow-500/20 bg-yellow-500/5'
                } flex items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    alert.resolved ? 'text-slate-500' : alert.severity === 'critical' ? 'text-[#f47920]' : 'text-yellow-400'
                  }`} />
                  <div>
                    <p className="text-sm font-black text-white">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(alert.firedAt).toLocaleString()}
                      </span>
                      {alert.resolved && (
                        <span className="text-[10px] text-green-400 font-bold">Resolved</span>
                      )}
                    </div>
                  </div>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">No active alerts. All systems operating normally.</p>
            </div>
          )}
        </div>
      )}

      {/* Expenses View */}
      {view === 'expenses' && (
        <div className="space-y-6">
          {/* Expense breakdown */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              30-Day Expense Breakdown
            </h3>
            <div className="space-y-4">
              {data?.expenses?.byService && Object.entries(data.expenses.byService).length > 0 ? (
                Object.entries(data.expenses.byService)
                  .sort(([, a], [, b]) => b - a)
                  .map(([service, cost]) => {
                    const maxCost = Math.max(...Object.values(data.expenses.byService));
                    const pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;

                    return (
                      <div key={service} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white capitalize">{service.replace('_', ' ')}</span>
                          <span className="text-sm font-mono text-cyan-400">${cost.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-slate-500 text-sm">No expense data yet. Expenses are tracked automatically as API calls are made.</p>
              )}
            </div>
            {data?.expenses?.total != null && data.expenses.total > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total</span>
                <span className="text-xl font-black text-white">${data.expenses.total.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Anomalies */}
          {(data?.anomalies?.length || 0) > 0 && (
            <div className="rounded-[2rem] border border-[#f47920]/20 bg-[#f47920]/5 p-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#f47920] mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Spending Anomalies
              </h3>
              <div className="space-y-3">
                {data!.anomalies.map((a, i) => (
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

      {/* Webhook Health View */}
      {view === 'webhooks' && (
        <div className="space-y-6">
          {/* Overall success rate badge */}
          {(() => {
            const totalAll = webhookMetrics.reduce((sum, r) => sum + r.total, 0);
            const totalCompleted = webhookMetrics.reduce((sum, r) => sum + r.completed, 0);
            const successRate = totalAll > 0 ? (totalCompleted / totalAll) * 100 : 100;
            const badgeColor =
              totalAll === 0 ? 'text-slate-400 bg-slate-500/10 border-slate-500/20' :
              successRate >= 95 ? 'text-green-400 bg-green-500/10 border-green-500/20' :
              successRate >= 80 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
              'text-red-400 bg-red-500/10 border-red-500/20';
            return (
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Last 24 Hours</p>
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${badgeColor}`}>
                  {totalAll === 0 ? 'No Events' : `${successRate.toFixed(1)}% Success Rate`}
                </span>
              </div>
            );
          })()}

          {/* Per-provider table */}
          {webhookMetrics.length === 0 ? (
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 text-center">
              <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No webhook events in the last 24 hours.</p>
              <p className="text-slate-600 text-xs mt-1">Events will appear here after the first payment webhook fires.</p>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 overflow-x-auto">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Per-Provider Summary</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="text-left pb-3 pr-6">Provider</th>
                    <th className="text-right pb-3 pr-6">Total (24h)</th>
                    <th className="text-right pb-3 pr-6">Success</th>
                    <th className="text-right pb-3 pr-6">Failed</th>
                    <th className="text-right pb-3 pr-6">Processing</th>
                    <th className="text-right pb-3">Last Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {webhookMetrics.map((row) => (
                    <tr key={row.provider} className="text-white">
                      <td className="py-3 pr-6 font-black uppercase text-xs tracking-widest">{row.provider}</td>
                      <td className="py-3 pr-6 text-right font-mono text-slate-300">{row.total}</td>
                      <td className="py-3 pr-6 text-right font-mono text-green-400">{row.completed}</td>
                      <td className="py-3 pr-6 text-right font-mono text-red-400">{row.failed}</td>
                      <td className="py-3 pr-6 text-right font-mono text-yellow-400">{row.processing}</td>
                      <td className="py-3 text-right font-mono text-slate-500 text-[10px]">
                        {row.lastProcessed ? new Date(row.lastProcessed).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent failures */}
          {webhookFailures.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recent Failures</h3>
              {webhookFailures.map((f) => (
                <div key={f.id} className="p-5 rounded-[2rem] border border-red-500/20 bg-red-500/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                        {f.provider}
                      </span>
                      <span className="text-[10px] text-slate-500 mx-2">&middot;</span>
                      <span className="text-[10px] text-slate-400">{f.eventType}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(f.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {f.errorMessage && (
                    <p className="text-xs text-slate-300 mb-1">{f.errorMessage}</p>
                  )}
                  {f.retryCount > 0 && (
                    <p className="text-[10px] text-slate-600">
                      {f.retryCount} retry attempt{f.retryCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : webhookMetrics.length > 0 ? (
            <div className="flex items-center gap-3 p-5 rounded-[2rem] border border-green-500/20 bg-green-500/5">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm font-bold">No failures in the last 24 hours.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Voice Transcription View */}
      {view === 'voice' && (
        <div className="space-y-6">
          {voiceMetrics === null ? (
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 text-center">
              <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No transcription data available.</p>
              <p className="text-slate-600 text-xs mt-1">Voice transcriptions will appear here after the first voice note is processed.</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total</p>
                  <p className="text-2xl font-black text-white">{voiceMetrics.totalCount}</p>
                  <p className="text-xs text-slate-500 mt-1">all time</p>
                </div>
                <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Last 24h</p>
                  <p className="text-2xl font-black text-white">{voiceMetrics.last24h}</p>
                </div>
                <div className={`p-6 rounded-[2rem] border ${voiceMetrics.successRate === 'N/A' ? 'border-white/5 bg-white/[0.02]' : voiceMetrics.totalCount > 0 && voiceMetrics.successCount / voiceMetrics.totalCount >= 0.95 ? 'border-green-500/20 bg-green-500/10' : 'border-yellow-500/20 bg-yellow-500/10'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Success Rate</p>
                  <p className={`text-2xl font-black ${voiceMetrics.successRate === 'N/A' ? 'text-slate-400' : voiceMetrics.totalCount > 0 && voiceMetrics.successCount / voiceMetrics.totalCount >= 0.95 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {voiceMetrics.successRate}
                  </p>
                  {voiceMetrics.totalCount > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{voiceMetrics.successCount} / {voiceMetrics.totalCount}</p>
                  )}
                </div>
                <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Avg Duration</p>
                  <p className="text-2xl font-black text-white">
                    {voiceMetrics.avgDurationSeconds > 0 ? `${voiceMetrics.avgDurationSeconds.toFixed(1)}s` : '—'}
                  </p>
                </div>
              </div>

              {voiceMetrics.totalCount === 0 && (
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 text-center">
                  <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">No voice notes transcribed yet.</p>
                  <p className="text-slate-600 text-xs mt-1">The table exists and is ready — stats will populate after the first voice note is processed.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Last checked footer */}
      {data?.lastChecked && (
        <p className="text-center text-[10px] text-slate-600 font-medium">
          Last checked: {new Date(data.lastChecked).toLocaleString()}
        </p>
      )}
    </div>
  );
}
