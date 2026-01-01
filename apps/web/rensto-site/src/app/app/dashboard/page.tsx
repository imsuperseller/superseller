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

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { ServiceInstance } from '@/types/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Mock data - replace with real API calls
const mockData = {
  kpis: {
    runs7d: { current: 47, previous: 42, change: '+11.9%' },
    successRate: { current: 94.2, previous: 91.8, change: '+2.4%' },
    upcomingSchedules: { current: 8, previous: 6, change: '+33.3%' },
    approvalsPending: { current: 3, previous: 5, change: '-40.0%' },
    spend: { current: 127.50, previous: 98.75, change: '+29.1%' },
  },
  nextUp: [
    {
      id: '1',
      name: 'WordPress Content Agent',
      type: 'content',
      scheduledFor: '2024-01-21T09:00:00Z',
      status: 'scheduled',
    },
    {
      id: '2',
      name: 'Social Media Posts',
      type: 'social',
      scheduledFor: '2024-01-21T14:30:00Z',
      status: 'scheduled',
    },
    {
      id: '3',
      name: 'Facebook Group Scraper',
      type: 'automation',
      scheduledFor: '2024-01-22T08:00:00Z',
      status: 'scheduled',
    },
  ],
  recentRuns: [
    {
      id: '1',
      name: 'WordPress Blog Post',
      status: 'completed',
      duration: '2m 34s',
      timestamp: '2024-01-20T16:30:00Z',
      cost: 0.25,
    },
    {
      id: '2',
      name: 'LinkedIn Post',
      status: 'completed',
      duration: '1m 12s',
      timestamp: '2024-01-20T14:15:00Z',
      cost: 0.15,
    },
    {
      id: '3',
      name: 'Facebook Group Scraper',
      status: 'failed',
      duration: '0m 45s',
      timestamp: '2024-01-20T12:00:00Z',
      cost: 0.10,
    },
  ],
};

export default function ClientDashboardPage() {
  const [services, setServices] = React.useState<ServiceInstance[]>([]);
  const [loadingServices, setLoadingServices] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchServices(user.uid);
      } else {
        // DEV: If no auth, fetch for a demo ID or handle redirect
        // fetchServices('demo_user');
        setLoadingServices(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchServices = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'service_instances'),
        where('clientId', '==', uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceInstance));
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoadingServices(false);
    }
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
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'automation':
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'In minutes';
    if (diffInHours < 24) return `In ${diffInHours}h`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your AI agents and automation</p>
        </div>
        <Button variant="renstoPrimary">
          <Play className="h-4 w-4 mr-2" />
          Run Agent
        </Button>
      </div>

      {/* Active Agents / Services */}
      {(services.length > 0 || loadingServices) && (
        <Card variant="renstoNeon" className="rensto-card-neon mb-6 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <span>My Agents</span>
            </CardTitle>
            <CardDescription>Your active and provisioning automation workers</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingServices ? (
              <div className="flex items-center gap-2 text-slate-500">
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
                    <div className="text-xs text-slate-500 font-mono">ID: {service.id.slice(0, 8)}...</div>

                    {service.status === 'active' && service.n8nWorkflowId ? (
                      <Button size="sm" className="w-full mt-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">
                        Open Control Panel <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    ) : (
                      <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
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
            <CardTitle className="text-sm font-medium text-slate-600">Runs (7d)</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockData.kpis.runs7d.current}</div>
            <p className="text-xs text-slate-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {mockData.kpis.runs7d.change} from last week
            </p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockData.kpis.successRate.current}%</div>
            <p className="text-xs text-slate-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {mockData.kpis.successRate.change} from last week
            </p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockData.kpis.upcomingSchedules.current}</div>
            <p className="text-xs text-slate-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {mockData.kpis.upcomingSchedules.change} from last week
            </p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockData.kpis.approvalsPending.current}</div>
            <p className="text-xs text-slate-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {mockData.kpis.approvalsPending.change} from last week
            </p>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${mockData.kpis.spend.current}</div>
            <p className="text-xs text-slate-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {mockData.kpis.spend.change} from last week
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Mon', runs: 4 },
                  { name: 'Tue', runs: 7 },
                  { name: 'Wed', runs: 5 },
                  { name: 'Thu', runs: 8 },
                  { name: 'Fri', runs: 12 },
                  { name: 'Sat', runs: 6 },
                  { name: 'Sun', runs: 5 },
                ]}>
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
            </div>
          </CardContent>
        </Card>

        {/* Next Up */}
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
              {mockData.nextUp.map((job) => (
                <div key={job.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getTypeIcon(job.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{job.name}</p>
                    <p className="text-xs text-slate-500">{formatScheduledTime(job.scheduledFor)}</p>
                  </div>
                  <Button variant="renstoSecondary" size="sm">
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              ))}
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
            {mockData.recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTypeIcon(run.name.toLowerCase().includes('wordpress') ? 'content' :
                      run.name.toLowerCase().includes('linkedin') ? 'social' : 'automation')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{run.name}</p>
                    <p className="text-xs text-slate-500">{formatTime(run.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{run.duration}</p>
                    <p className="text-xs text-slate-500">${run.cost}</p>
                  </div>
                  {getStatusBadge(run.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
