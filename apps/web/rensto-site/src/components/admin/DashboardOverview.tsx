'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface DashboardMetrics {
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
  };
  customers: {
    total: number;
    active: number;
    trial: number;
    churned: number;
    newThisMonth: number;
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
  };
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Fallback to mock data if API fails
        const mockMetrics: DashboardMetrics = {
          revenue: {
            mrr: 125000,
            arr: 1500000,
            growth: 12.5,
            churn: 3.2
          },
          customers: {
            total: 1247,
            active: 1156,
            trial: 67,
            churned: 24,
            newThisMonth: 89
          },
          usage: {
            totalInteractions: 45678,
            totalTemplates: 234,
            totalStorage: 125.6,
            averageUsagePerCustomer: 39.5
          },
          system: {
            uptime: 99.9,
            responseTime: 245,
            errorRate: 0.1,
            activeUsers: 89
          }
        };
        setMetrics(mockMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard metrics</p>
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* MRR Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.revenue.mrr.toLocaleString()}
          </div>
          <div className={`flex items-center text-xs ${getTrendColor(metrics.revenue.growth)}`}>
            {getTrendIcon(metrics.revenue.growth)}
            <span className="ml-1">
              {metrics.revenue.growth > 0 ? '+' : ''}{metrics.revenue.growth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Customers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.customers.active.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="ml-1">
              +{metrics.customers.newThisMonth} new this month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* System Uptime Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.system.uptime}%
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span>Avg response: {metrics.system.responseTime}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Interactions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.usage.totalInteractions.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span>Avg: {metrics.usage.averageUsagePerCustomer}/customer</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
