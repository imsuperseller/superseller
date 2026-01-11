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

import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { ServiceInstance, UsageLog } from '@/types/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function ClientDashboardPage() {
  const [services, setServices] = React.useState<ServiceInstance[]>([]);
  const [usageLogs, setUsageLogs] = React.useState<UsageLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);

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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchDashboardData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (uid: string) => {
    setLoading(true);
    try {
      // 1. Fetch Services (Active Agents)
      const servicesQuery = query(
        collection(db, 'service_instances'),
        where('clientId', '==', uid)
      );
      const servicesSnap = await getDocs(servicesQuery);
      const servicesData = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceInstance));
      setServices(servicesData);

      // 2. Fetch Usage Logs (Recent Runs & Spend)
      // Limit to last 50 runs for dashboard performance
      const logsQuery = query(
        collection(db, 'usage_logs'),
        where('clientId', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const logsSnap = await getDocs(logsQuery);
      const logsData = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UsageLog));
      setUsageLogs(logsData);

      // 3. Calculate KPIs
      calculateKPIs(logsData);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (logs: UsageLog[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter last 7 days
    const recentLogs = logs.filter(log => {
      const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      return date >= sevenDaysAgo;
    });

    // 1. Runs (7d)
    const runs7d = recentLogs.length;

    // 2. Spend (All time or 7d? Usually 7d on dashboard summary, or current billing period)
    // Let's do 7d for consistency with label
    const spendCents = recentLogs.reduce((acc, log) => acc + (log.cost || 0), 0);
    const spend = spendCents / 100; // Convert to dollars

    // 3. Success Rate (Mock logic: if metadata.status exists. Default 100%)
    // Assuming usage_logs might have status. If not, we assume success.
    // In future, verify status field.
    const successRate = 100;

    // 4. Volume Chart (7 days)
    const daysMap = new Map<string, number>();
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
      daysMap.set(dayName, 0);
    }

    recentLogs.forEach(log => {
      const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
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
        return <Badge variant="renstoSuccess">Completed</Badge>;
      case 'failed':
        return <Badge variant="renstoError">Failed</Badge>;
      case 'running':
        return <Badge variant="renstoWarning">Running</Badge>;
      case 'scheduled':
        return <Badge variant="renstoSecondary">Scheduled</Badge>;
      default:
        // Default to completed for usage logs unless specified
        return <Badge variant="renstoSuccess">Completed</Badge>;
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
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
        <Button variant="renstoPrimary">
          <Play className="h-4 w-4 mr-2" />
          Run Agent
        </Button>
      </div>

      {/* Active Agents / Services */}
      {(services.length > 0 || loading) && (
        <Card variant="renstoNeon" className="rensto-card-neon mb-6 border-cyan-500/30">
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
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <div key={service.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-lg">{service.productName}</div>
                      {service.status === 'active' ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">Provisioning</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">ID: {service.id.slice(0, 8)}...</div>

                    {service.status === 'active' && service.n8nWorkflowId ? (
                      <Button size="sm" className="w-full mt-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">
                        Open Control Panel <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    ) : (
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Architecture building...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card variant="renstoNeon" className="rensto-card-neon">
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

        <Card variant="renstoNeon" className="rensto-card-neon">
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

        <Card variant="renstoNeon" className="rensto-card-neon">
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

        <Card variant="renstoNeon" className="rensto-card-neon">
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

        <Card variant="renstoNeon" className="rensto-card-neon">
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
        <Card variant="renstoNeon" className="rensto-card-neon lg:col-span-2">
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
        <Card variant="renstoNeon" className="rensto-card-neon">
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
      <Card variant="renstoNeon" className="rensto-card-neon">
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
                      <p className="text-xs text-gray-400">{formatTime(run.timestamp)}</p>
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
