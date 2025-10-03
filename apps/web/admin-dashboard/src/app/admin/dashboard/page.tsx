'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Database,
  Server,
  Globe,
  FileText,
  Settings,
  Workflow
} from 'lucide-react';

interface DashboardMetrics {
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
    breakdown: {
      starter: number;
      professional: number;
      enterprise: number;
    };
  };
  customers: {
    total: number;
    active: number;
    trial: number;
    churned: number;
    newThisMonth: number;
    churnedThisMonth: number;
    convertedThisMonth: number;
  };
  usage: {
    totalInteractions: number;
    totalTemplates: number;
    totalStorage: number;
    averageUsagePerCustomer: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    services: {
      api: { status: string; responseTime: number; lastCheck: string; uptime: number };
      database: { status: string; responseTime: number; lastCheck: string; uptime: number };
      payments: { status: string; responseTime: number; lastCheck: string; uptime: number };
      workflows: { status: string; responseTime: number; lastCheck: string; uptime: number };
    };
  };
  bmadProgress: {
    totalActivities: number;
    completedActivities: number;
    inProgressActivities: number;
    planningActivities: number;
    completionRate: number;
  };
  recentActivities: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    phase: string;
    lastUpdated: string;
  }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
      case 'active':
      case 'completed':
        return <Badge variant="success">Up</Badge>;
      case 'degraded':
      case 'in progress':
        return <Badge variant="warning">Degraded</Badge>;
      case 'down':
      case 'inactive':
      case 'planning':
      case 'not_configured':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log('Fetching metrics from:', '/api/admin/dashboard/metrics');
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/admin/dashboard/metrics', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Metrics data:', data);
          setMetrics(data);
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Request timed out');
        }
        // Don't use mock data - show error instead
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Rensto Universal Automation Platform admin dashboard</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Rensto Universal Automation Platform admin dashboard</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load dashboard metrics</p>
            <p className="text-sm text-gray-500 mt-2">Please check your API configuration</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Rensto Universal Automation Platform admin dashboard</p>
      </div>

      {/* Comprehensive Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenue.growth > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.revenue.growth}% from last month
                </span>
              ) : (
                <span className="text-gray-600">No growth data yet</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Customer Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customers.active}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics.customers.newThisMonth} new this month</span>
            </p>
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usage.totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics.usage.averageUsagePerCustomer}/customer
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Avg response: {metrics.system.responseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BMAD Progress Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              BMAD Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.bmadProgress?.completionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${metrics.bmadProgress?.completionRate || 0}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.bmadProgress?.completedActivities || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.bmadProgress?.inProgressActivities || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics.bmadProgress?.planningActivities || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Planning</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Annual Recurring Revenue</span>
                <span className="text-lg font-bold">${metrics.revenue.arr.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Churn Rate</span>
                <span className="text-lg font-bold">{metrics.revenue.churn}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className={`text-lg font-bold ${metrics.revenue.growth > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {metrics.revenue.growth > 0 ? '+' : ''}{metrics.revenue.growth}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Starter Plan</span>
                  <span className="text-sm font-bold">${metrics.revenue.breakdown.starter.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.revenue.breakdown.starter / Math.max(metrics.revenue.mrr, 1)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Professional Plan</span>
                  <span className="text-sm font-bold">${metrics.revenue.breakdown.professional.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.revenue.breakdown.professional / Math.max(metrics.revenue.mrr, 1)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enterprise Plan</span>
                  <span className="text-sm font-bold">${metrics.revenue.breakdown.enterprise.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.revenue.breakdown.enterprise / Math.max(metrics.revenue.mrr, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Customers</span>
                <span className="text-lg font-bold">{metrics.customers.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Customers</span>
                <span className="text-lg font-bold text-green-600">{metrics.customers.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial Customers</span>
                <span className="text-lg font-bold text-blue-600">{metrics.customers.trial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Churned Customers</span>
                <span className="text-lg font-bold text-red-600">{metrics.customers.churned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New This Month</span>
                <span className="text-lg font-bold text-green-600">+{metrics.customers.newThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Converted This Month</span>
                <span className="text-lg font-bold text-blue-600">+{metrics.customers.convertedThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Development Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activities Completed</span>
                <span className="text-lg font-bold">{metrics.bmadProgress?.completedActivities || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-lg font-bold">{metrics.bmadProgress?.inProgressActivities || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Planning Phase</span>
                <span className="text-lg font-bold">{metrics.bmadProgress?.planningActivities || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Activities</span>
                <span className="text-lg font-bold">{metrics.bmadProgress?.totalActivities || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Service</span>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(metrics.system.services.api.status)}
                  <span className="text-xs text-muted-foreground">{metrics.system.services.api.responseTime}ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(metrics.system.services.database.status)}
                  <span className="text-xs text-muted-foreground">{metrics.system.services.database.responseTime}ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payments (Stripe)</span>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(metrics.system.services.payments.status)}
                  <span className="text-xs text-muted-foreground">{metrics.system.services.payments.responseTime}ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Workflows (n8n)</span>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(metrics.system.services.workflows.status)}
                  <span className="text-xs text-muted-foreground">{metrics.system.services.workflows.responseTime}ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className={`text-sm font-bold ${metrics.system.errorRate < 1 ? 'text-green-600' : metrics.system.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.system.errorRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-sm font-bold">{metrics.system.activeUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivities?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{activity.name}</div>
                    <div className="text-xs text-muted-foreground">{activity.phase}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {activity.progress}%
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activities
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Revenue Breakdown by Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${metrics.revenue.breakdown.starter.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Starter Plan</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${metrics.revenue.breakdown.professional.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Professional Plan</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ${metrics.revenue.breakdown.enterprise.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Enterprise Plan</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}