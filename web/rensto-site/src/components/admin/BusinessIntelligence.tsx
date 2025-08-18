'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { } from '@/components/ui/input-enhanced';
import { } from '@/components/ui/label';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  AlertTriangle,
  Download,
  RefreshCw,
  Plus,
  Settings,
  Eye,
  Clock,
} from 'lucide-react';
import { businessIntelligence } from '@/lib/business-intelligence';
import {
  MetricDefinition,
  ReportDefinition,
  Dashboard as DashboardType,
  ForecastModel,
  AlertRule,
} from '@/lib/business-intelligence';

interface BusinessIntelligenceProps {
  orgId: string;
}

export default function BusinessIntelligence({
  orgId,
}: BusinessIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'metrics' | 'reports' | 'dashboards' | 'forecasts' | 'alerts'
  >('overview');
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [dashboards, setDashboards] = useState<DashboardType[]>([]);
  const [forecasts, setForecasts] = useState<ForecastModel[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        metricsData,
        reportsData,
        dashboardsData,
        forecastsData,
        alertsData,
      ] = await Promise.all([
        businessIntelligence.getMetrics(),
        businessIntelligence.getReports(),
        businessIntelligence.getDashboards(),
        businessIntelligence.getForecasts(),
        businessIntelligence.getAlerts(),
      ]);

      setMetrics(metricsData);
      setReports(reportsData);
      setDashboards(dashboardsData);
      setForecasts(forecastsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading business intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (metricId: string) => {
    // Mock metric values - in production, these would come from the API
    const mockValues: Record<string, number> = {
      agent_execution_rate: 25,
      agent_success_rate: 92,
      workflow_completion_time: 18,
      user_engagement: 1250,
      system_uptime: 99.8,
      api_response_time: 245,
    };
    return mockValues[metricId] || 0;
  };

  const getMetricStatus = (metric: MetricDefinition) => {
    const value = getMetricValue(metric.id);
    if (!metric.thresholds) return 'normal';

    if (value <= metric.thresholds.critical) return 'critical';
    if (value <= metric.thresholds.warning) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'normal':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'metrics', name: 'Metrics', icon: Target },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
    { id: 'dashboards', name: 'Dashboards', icon: Activity },
    { id: 'forecasts', name: 'Forecasts', icon: TrendingUp },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="rensto-animate-glow rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Advanced analytics and reporting for data-driven decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Key Performance Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.slice(0, 6).map(metric => {
                  const value = getMetricValue(metric.id);
                  const status = getMetricStatus(metric);
                  return (
                    <Card key={metric.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {metric.name}
                          </CardTitle>
                          <Badge
                            className={`text-xs ${getStatusColor(status)}`}
                          >
                            {status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">
                          {metric.unit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {metric.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">
                        Agent "Lead Processor" completed successfully
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        2 min ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">
                        New user registered: john.doe@company.com
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        5 min ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">
                        Workflow "Daily Report" started
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        10 min ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">
                        System backup completed successfully
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        1 hour ago
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Metrics Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map(metric => {
                const value = getMetricValue(metric.id);
                const status = getMetricStatus(metric);
                return (
                  <Card key={metric.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-3xl font-bold">{value}</div>
                      <p className="text-sm text-muted-foreground">
                        {metric.unit}
                      </p>
                      <p className="text-sm">{metric.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Refreshes every {metric.refreshInterval} minutes
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reports</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map(report => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>{report.metrics.length} metrics</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dashboards</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboards.map(dashboard => (
                <Card key={dashboard.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {dashboard.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>{dashboard.reports.length} reports</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Forecasts</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Forecast
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forecasts.map(forecast => (
                <Card key={forecast.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{forecast.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {forecast.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{forecast.algorithm} algorithm</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Alerts</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alerts.map(alert => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{alert.name}</CardTitle>
                      <Badge
                        variant={alert.enabled ? 'default' : 'secondary'}
                        className={
                          alert.severity === 'critical'
                            ? 'style={{ backgroundColor: 'var(--rensto-bg-primary)' }} style={{ color: 'var(--rensto-red)' }}'
                            : ''
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        {alert.condition.operator} {alert.condition.threshold}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        {alert.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
