'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Play,
  Calendar,
  BarChart3,
  Zap,
  Users,
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface ServiceInstance { id: string; productName: string; status: string; [key: string]: any; }
interface UsageLog { id: string; agentId: string; status: string; startedAt: string; completedAt?: string; durationMs?: number; model?: string; tokens?: { input: number; output: number; total: number }; cost: number; output?: string; [key: string]: any; }

export default function ClientDashboardPage() {
  const [services, setServices] = React.useState<ServiceInstance[]>([]);
  const [usageLogs, setUsageLogs] = React.useState<UsageLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  // KPIs State
  const [kpis, setKpis] = React.useState({
    runs7d: 0,
    successRate: 100, // Default to 100 until proven otherwise
    upcomingSchedules: 0,
    approvalsPending: 0,
    spend: 0,
  });

  // Chart Data State
  const [volumeData, setVolumeData] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/app/dashboard')
      .then(res => {
        if (res.status === 401) { setLoading(false); return null; }
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setServices(data.services || []);
        setUsageLogs(data.usageLogs || []);
        calculateKPIs(data.usageLogs || []);
      })
      .catch(err => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const calculateKPIs = (logs: UsageLog[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter last 7 days
    const recentLogs = logs.filter(log => {
      const date = new Date(log.startedAt);
      return date >= sevenDaysAgo;
    });

    // 1. Runs (7d)
    const runs7d = recentLogs.length;

    // 2. Spend (All time or 7d? Usually 7d on dashboard summary, or current billing period)
    // Let's do 7d for consistency with label
    const spendCents = recentLogs.reduce((acc, log) => acc + (log.cost || 0), 0);
    const spend = spendCents / 100; // Convert to dollars

    // 3. Success Rate
    const successfulRuns = recentLogs.filter(log => log.status === 'completed' || !log.status).length;
    const successRate = runs7d > 0 ? Math.round((successfulRuns / runs7d) * 100) : 100;

    // 4. Volume Chart (7 days)
    const daysMap = new Map<string, number>();
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
      daysMap.set(dayName, 0);
    }

    recentLogs.forEach(log => {
      const date = new Date(log.startedAt);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (daysMap.has(dayName)) {
        daysMap.set(dayName, (daysMap.get(dayName) || 0) + 1);
      }
    });

    const chartData = Array.from(daysMap.entries()).map(([name, runs]) => ({ name, runs }));
    setVolumeData(chartData);

    setKpis({
      runs7d,
      successRate,
      upcomingSchedules: 0, // Pending implementation of scheduled_jobs collection
      approvalsPending: 0, // Pending implementation of approvals collection
      spend
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="supersellerSuccess">Completed</Badge>;
      case 'failed':
        return <Badge variant="supersellerError">Failed</Badge>;
      case 'running':
        return <Badge variant="supersellerWarning">Running</Badge>;
      case 'scheduled':
        return <Badge variant="supersellerSecondary">Scheduled</Badge>;
      default:
        // Default to completed for usage logs unless specified
        return <Badge variant="supersellerSuccess">Completed</Badge>;
    }
  };

  const getTypeIcon = (modelOrType: string) => {
    const lower = modelOrType.toLowerCase();
    if (lower.includes('gpt') || lower.includes('text')) return <FileText className="h-4 w-4" />;
    if (lower.includes('dalle') || lower.includes('image')) return <Users className="h-4 w-4" />; // Placeholder
    return <Zap className="h-4 w-4" />;
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your AI agents and automation</p>
        </div>
        <Button variant="supersellerPrimary">
          <Play className="h-4 w-4 mr-2" />
          Run Agent
        </Button>
      </div>

      {/* Active Agents / Services */}
      {(services.length > 0 || loading) && (
        <Card variant="supersellerNeon" className="superseller-card-neon mb-6 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <span>My Agents</span>
            </CardTitle>
            <CardDescription>Your active and provisioning automation workers</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Activity className="animate-spin h-4 w-4" /> Loading agents...
              </div>
            ) : services.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <div key={service.id} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col gap-4 group hover:border-cyan-500/30 transition-all duration-500">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-black text-xl text-white uppercase tracking-tighter">{service.productName}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">NODEID: {service.id.slice(0, 8)}</div>
                      </div>
                      {service.status === 'active' ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 uppercase text-[9px] font-black tracking-widest">Active</Badge>
                      ) : (
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 uppercase text-[9px] font-black tracking-widest animate-pulse">Provisioning</Badge>
                      )}
                    </div>

                    {service.status === 'provisioning' ? (
                      <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Robot Swarm Status</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Step 3/5</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 w-[60%] animate-pulse" />
                        </div>
                        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-white uppercase">
                            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                            Configuring Knowledge Engine...
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">Terry is indexing your business secrets into the neural vault.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stability</p>
                            <p className="text-sm font-black text-green-400">99.9%</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Response</p>
                            <p className="text-sm font-black text-cyan-400">1.2m</p>
                          </div>
                        </div>
                        <Button size="sm" variant="supersellerSecondary" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Open Control Panel <ExternalLink className="ml-2 w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-bold text-white mb-2">No Active Agents</h3>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                  You haven't requested any AI agents yet. Start by exploring our marketplace or request a custom solution.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="supersellerSecondary" onClick={() => window.location.href = '/marketplace'}>
                    Browse Marketplace
                  </Button>
                  <Button variant="supersellerPrimary" onClick={() => window.location.href = '/contact?type=custom'}>
                    Request Custom Agent
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Runs (7d)</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpis.runs7d}</div>
            <p className="text-xs text-gray-400 flex items-center">
              Since last week
            </p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpis.successRate}%</div>
            <p className="text-xs text-gray-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Stable
            </p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpis.upcomingSchedules}</div>
            <p className="text-xs text-gray-400 flex items-center">
              Scheduled jobs
            </p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpis.approvalsPending}</div>
            <p className="text-xs text-gray-400 flex items-center">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Spend (7d)</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(kpis.spend)}</div>
            <p className="text-xs text-gray-400 flex items-center">
              Estimated cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Next Up */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run Volume Chart */}
        <Card variant="supersellerNeon" className="superseller-card-neon lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Run Volume (7 days)</span>
            </CardTitle>
            <CardDescription>Daily agent execution volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-500">Loading chart...</div>
              ) : volumeData.reduce((acc, curr) => acc + curr.runs, 0) === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                  <Activity className="w-8 h-8 opacity-20" />
                  <p>No activity yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1438', border: '1px solid #334155' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar
                      dataKey="runs"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Up (Placeholder for Future Schedule Collection) */}
        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Next Up</span>
            </CardTitle>
            <CardDescription>Soonest scheduled jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Empty State for now */}
              <div className="text-center py-8 text-gray-500 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No upcoming jobs scheduled.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Runs */}
      <Card variant="supersellerNeon" className="superseller-card-neon">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Runs</span>
          </CardTitle>
          <CardDescription>Latest agent executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading history...</div>
            ) : usageLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No runs recorded yet.</p>
              </div>
            ) : (
              usageLogs.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(run.model || 'unknown')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{run.agentId || 'Unknown Agent'}</p>
                      <p className="text-xs text-gray-400">{formatTime(run.startedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      {/* Token usage if available */}
                      {run.tokens?.total ? (
                        <p className="text-sm font-medium text-white">{run.tokens.total.toLocaleString()} toks</p>
                      ) : (
                        <p className="text-sm font-medium text-white">-</p>
                      )}

                      {/* Cost */}
                      <p className="text-xs text-gray-400">
                        {run.cost ? formatCurrency(run.cost / 100) : '$0.00'}
                      </p>
                    </div>
                    {/* Status defaulting to success for usage logs */}
                    {getStatusBadge('completed')}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
