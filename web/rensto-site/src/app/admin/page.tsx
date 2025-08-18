'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
  Users,
  Workflow,
  Activity,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockData = {
  kpis: {
    activeTenants: { current: 24, previous: 21, change: '+14.3%' },
    activeAgents: { current: 156, previous: 142, change: '+9.9%' },
    runs24h: { current: 1247, previous: 1189, change: '+4.9%' },
    errorRate: { current: 2.1, previous: 3.2, change: '-34.4%' },
    mrr: { current: 45200, previous: 38900, change: '+16.2%' },
    overageAlerts: { current: 3, previous: 7, change: '-57.1%' },
  },
  queues: {
    onboarding: [
      { id: 1, company: 'TechCorp Inc', email: 'admin@techcorp.com', status: 'pending', time: '2 hours ago' },
      { id: 2, company: 'StartupXYZ', email: 'ceo@startupxyz.com', status: 'pending', time: '4 hours ago' },
      { id: 3, company: 'DigitalAgency', email: 'manager@digitalagency.com', status: 'pending', time: '6 hours ago' },
    ],
    approvals: [
      { id: 1, tenant: 'Ortal Flanary', type: 'WordPress Post', title: 'New Blog Post', time: '1 hour ago' },
      { id: 2, tenant: 'Ben Ginati', type: 'Social Post', platform: 'LinkedIn', time: '3 hours ago' },
      { id: 3, tenant: 'Shelly Mizrahi', type: 'WordPress Post', title: 'Insurance Guide', time: '5 hours ago' },
    ],
  },
  recentActivity: [
    { id: 1, type: 'tenant', action: 'New tenant "TechCorp Inc" signed up', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'agent', action: 'Agent "Facebook Scraper" completed successfully', time: '4 hours ago', status: 'success' },
    { id: 3, type: 'billing', action: 'Payment received from "Ortal Flanary"', time: '6 hours ago', status: 'success' },
    { id: 4, type: 'error', action: 'Agent "WordPress Publisher" failed', time: '8 hours ago', status: 'error' },
  ],
};

export default function AdminOverviewPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getChangeIcon = (change: string) => {
    const isPositive = change.startsWith('+');
    return isPositive ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = (change: string) => {
    const isPositive = change.startsWith('+');
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-600 mt-1">System-wide KPIs and monitoring dashboard</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="renstoSecondary" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          <Button variant="renstoPrimary" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Tenants */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatNumber(mockData.kpis.activeTenants.current)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(mockData.kpis.activeTenants.change)}
              <span className={getChangeColor(mockData.kpis.activeTenants.change)}>
                {mockData.kpis.activeTenants.change}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Agents</CardTitle>
            <Workflow className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatNumber(mockData.kpis.activeAgents.current)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(mockData.kpis.activeAgents.change)}
              <span className={getChangeColor(mockData.kpis.activeAgents.change)}>
                {mockData.kpis.activeAgents.change}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* 24h Runs */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">24h Runs</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatNumber(mockData.kpis.runs24h.current)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(mockData.kpis.runs24h.change)}
              <span className={getChangeColor(mockData.kpis.runs24h.change)}>
                {mockData.kpis.runs24h.change}
              </span>
              <span className="text-slate-500">vs last 24h</span>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockData.kpis.errorRate.current}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(mockData.kpis.errorRate.change)}
              <span className={getChangeColor(mockData.kpis.errorRate.change)}>
                {mockData.kpis.errorRate.change}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(mockData.kpis.mrr.current)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(mockData.kpis.mrr.change)}
              <span className={getChangeColor(mockData.kpis.mrr.change)}>
                {mockData.kpis.mrr.change}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Overage Alerts */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overage Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mockData.kpis.overageAlerts.current}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(mockData.kpis.overageAlerts.change)}
              <span className={getChangeColor(mockData.kpis.overageAlerts.change)}>
                {mockData.kpis.overageAlerts.change}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queues and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Queue */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Onboarding Queue</span>
              <Badge variant="renstoNeon" className="ml-auto">
                {mockData.queues.onboarding.length}
              </Badge>
            </CardTitle>
            <CardDescription>New signups awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.queues.onboarding.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.company}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="renstoSecondary" className="mb-1">
                      {item.status}
                    </Badge>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="renstoPrimary" className="w-full mt-4">
              View All Pending
            </Button>
          </CardContent>
        </Card>

        {/* Approval Queue */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Approval Queue</span>
              <Badge variant="renstoNeon" className="ml-auto">
                {mockData.queues.approvals.length}
              </Badge>
            </CardTitle>
            <CardDescription>Content awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.queues.approvals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.tenant}</p>
                    <p className="text-sm text-slate-500">
                      {item.type} - {item.title || item.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="renstoSecondary" className="mb-1">
                      Pending
                    </Badge>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="renstoPrimary" className="w-full mt-4">
              Review All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Latest system events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  item.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {item.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.action}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
                <Badge variant={item.status === 'success' ? 'renstoSuccess' : 'renstoError'}>
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="renstoSecondary" className="w-full mt-4">
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
