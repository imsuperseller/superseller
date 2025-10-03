'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Zap, 
  Database, 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

interface AnalyticsData {
  totalUsage: {
    interactions: number;
    apiCalls: number;
    dataProcessing: number;
    storage: number;
  };
  dailyUsage: Record<string, {
    interactions: number;
    apiCalls: number;
    dataProcessing: number;
    storage: number;
  }>;
  trends: {
    interactions: number;
    apiCalls: number;
    dataProcessing: number;
    storage: number;
  };
  healthScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
  }>;
  expansionOpportunities: string[];
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  period: '7d' | '30d' | '90d';
  onPeriodChange: (period: '7d' | '30d' | '90d') => void;
}

export default function AnalyticsDashboard({ 
  analytics, 
  period, 
  onPeriodChange 
}: AnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<'interactions' | 'apiCalls' | 'dataProcessing' | 'storage'>('interactions');

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)}GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`;
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)}KB`;
    return `${bytes}B`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor your automation performance and usage</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Health Score and Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Account Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Health Score</span>
                <span className="text-2xl font-bold">{analytics.healthScore}/100</span>
              </div>
              <Progress value={analytics.healthScore} className="h-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Churn Risk</span>
                <Badge className={getChurnRiskColor(analytics.churnRisk)}>
                  {analytics.churnRisk.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge className={getPriorityColor(rec.priority)} size="sm">
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Interactions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Interactions</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.interactions)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.interactions)}`}>
                    {Math.abs(analytics.trends.interactions).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalUsage.interactions)}</p>
              <p className="text-xs text-muted-foreground">Total this period</p>
            </div>

            {/* API Calls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">API Calls</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.apiCalls)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.apiCalls)}`}>
                    {Math.abs(analytics.trends.apiCalls).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalUsage.apiCalls)}</p>
              <p className="text-xs text-muted-foreground">Total this period</p>
            </div>

            {/* Data Processing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Data Processing</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.dataProcessing)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.dataProcessing)}`}>
                    {Math.abs(analytics.trends.dataProcessing).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{formatBytes(analytics.totalUsage.dataProcessing)}</p>
              <p className="text-xs text-muted-foreground">Total this period</p>
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.storage)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.storage)}`}>
                    {Math.abs(analytics.trends.storage).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{formatBytes(analytics.totalUsage.storage)}</p>
              <p className="text-xs text-muted-foreground">Total this period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Daily Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Metric Selector */}
            <div className="flex gap-2">
              {(['interactions', 'apiCalls', 'dataProcessing', 'storage'] as const).map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric(metric)}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Button>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Usage chart for {selectedMetric}</p>
                <p className="text-sm text-muted-foreground">Chart implementation needed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expansion Opportunities */}
      {analytics.expansionOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Expansion Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.expansionOpportunities.map((opportunity, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{opportunity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consider upgrading to unlock this feature
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
