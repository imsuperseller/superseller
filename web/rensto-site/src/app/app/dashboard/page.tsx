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
} from 'lucide-react';

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
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart placeholder</p>
                <p className="text-sm">Run volume visualization</p>
              </div>
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
