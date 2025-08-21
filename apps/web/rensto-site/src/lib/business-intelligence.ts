'use client';

import { apiClient } from './api-client';

// Business Intelligence Types
export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'business' | 'operational' | 'financial';
  unit: string;
  calculation: string;
  dataSource: string;
  refreshInterval: number; // minutes
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export interface MetricValue {
  metricId: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'report' | 'alert' | 'forecast';
  metrics: string[];
  filters: ReportFilter[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  visualization: VisualizationConfig;
  permissions: string[];
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export interface VisualizationConfig {
  type: 'line' | 'bar' | 'pie' | 'table' | 'gauge' | 'heatmap';
  options: Record<string, string | number | boolean>;
  layout?: {
    width: number;
    height: number;
    position: { x: number; y: number };
  };
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  reports: string[];
  permissions: string[];
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
}

export interface DashboardLayout {
  grid: {
    columns: number;
    rows: number;
  };
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  reportId: string;
  position: { x: number; y: number; width: number; height: number };
  title: string;
  refreshInterval?: number;
}

export interface ForecastModel {
  id: string;
  name: string;
  description: string;
  metricId: string;
  algorithm: 'linear' | 'exponential' | 'arima' | 'prophet' | 'neural';
  parameters: Record<string, string | number | boolean>;
  trainingData: {
    startDate: Date;
    endDate: Date;
    dataPoints: number;
  };
  accuracy: {
    mse: number;
    mae: number;
    r2: number;
  };
  predictions: ForecastPrediction[];
}

export interface ForecastPrediction {
  timestamp: Date;
  value: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricId: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration: number; // minutes
  };
  actions: AlertAction[];
  enabled: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface AlertAction {
  type: 'email' | 'sms' | 'webhook' | 'notification';
  config: Record<string, any>;
}

// Business Intelligence Service
export class BusinessIntelligenceService {
  private metrics = new Map<string, MetricDefinition>();
  private reports = new Map<string, ReportDefinition>();
  private dashboards = new Map<string, Dashboard>();
  private forecasts = new Map<string, ForecastModel>();
  private alerts = new Map<string, AlertRule>();

  constructor() {
    this.initializeDefaultMetrics();
    this.initializeDefaultReports();
    this.initializeDefaultDashboards();
  }

  // Initialize default metrics
  private initializeDefaultMetrics() {
    const defaultMetrics: MetricDefinition[] = [
      {
        id: 'agent_execution_rate',
        name: 'Agent Execution Rate',
        description: 'Number of agent executions per hour',
        category: 'performance',
        unit: 'executions/hour',
        calculation: 'COUNT(agent_runs) / HOURS(time_period)',
        dataSource: 'agent_runs',
        refreshInterval: 5,
        thresholds: { warning: 10, critical: 5 },
      },
      {
        id: 'agent_success_rate',
        name: 'Agent Success Rate',
        description: 'Percentage of successful agent executions',
        category: 'performance',
        unit: '%',
        calculation: 'SUCCESSFUL_EXECUTIONS / TOTAL_EXECUTIONS * 100',
        dataSource: 'agent_runs',
        refreshInterval: 5,
        thresholds: { warning: 85, critical: 70 },
      },
      {
        id: 'workflow_completion_time',
        name: 'Workflow Completion Time',
        description: 'Average time to complete workflows',
        category: 'performance',
        unit: 'minutes',
        calculation: 'AVG(completion_time - start_time)',
        dataSource: 'workflow_executions',
        refreshInterval: 10,
        thresholds: { warning: 30, critical: 60 },
      },
      {
        id: 'user_engagement',
        name: 'User Engagement',
        description: 'Active users in the last 24 hours',
        category: 'business',
        unit: 'users',
        calculation:
          'COUNT(DISTINCT user_id) WHERE last_activity > NOW() - 24h',
        dataSource: 'user_sessions',
        refreshInterval: 15,
      },
      {
        id: 'system_uptime',
        name: 'System Uptime',
        description: 'System availability percentage',
        category: 'operational',
        unit: '%',
        calculation: 'UPTIME_TIME / TOTAL_TIME * 100',
        dataSource: 'system_health',
        refreshInterval: 1,
        thresholds: { warning: 99, critical: 95 },
      },
      {
        id: 'api_response_time',
        name: 'API Response Time',
        description: 'Average API response time',
        category: 'performance',
        unit: 'ms',
        calculation: 'AVG(response_time)',
        dataSource: 'api_logs',
        refreshInterval: 5,
        thresholds: { warning: 500, critical: 1000 },
      },
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.id, metric);
    });
  }

  // Initialize default reports
  private initializeDefaultReports() {
    const defaultReports: ReportDefinition[] = [
      {
        id: 'performance_overview',
        name: 'Performance Overview',
        description: 'Key performance indicators overview',
        type: 'dashboard',
        metrics: [
          'agent_execution_rate',
          'agent_success_rate',
          'workflow_completion_time',
        ],
        filters: [],
        visualization: {
          type: 'line',
          options: {
            title: 'Performance Trends',
            xAxis: { type: 'time' },
            yAxis: { type: 'value' },
          },
        },
        permissions: ['admin', 'manager'],
      },
      {
        id: 'system_health',
        name: 'System Health',
        description: 'System health and availability metrics',
        type: 'dashboard',
        metrics: ['system_uptime', 'api_response_time'],
        filters: [],
        visualization: {
          type: 'gauge',
          options: {
            title: 'System Health',
            min: 0,
            max: 100,
            threshold: 95,
          },
        },
        permissions: ['admin'],
      },
      {
        id: 'user_analytics',
        name: 'User Analytics',
        description: 'User engagement and activity metrics',
        type: 'report',
        metrics: ['user_engagement'],
        filters: [],
        visualization: {
          type: 'bar',
          options: {
            title: 'User Engagement',
            xAxis: { type: 'category' },
            yAxis: { type: 'value' },
          },
        },
        permissions: ['admin', 'manager'],
      },
    ];

    defaultReports.forEach(report => {
      this.reports.set(report.id, report);
    });
  }

  // Initialize default dashboards
  private initializeDefaultDashboards() {
    const defaultDashboards: Dashboard[] = [
      {
        id: 'executive_dashboard',
        name: 'Executive Dashboard',
        description: 'High-level business metrics for executives',
        layout: {
          grid: { columns: 3, rows: 2 },
          widgets: [
            {
              id: 'widget_1',
              reportId: 'performance_overview',
              position: { x: 0, y: 0, width: 2, height: 1 },
              title: 'Performance Overview',
            },
            {
              id: 'widget_2',
              reportId: 'system_health',
              position: { x: 2, y: 0, width: 1, height: 1 },
              title: 'System Health',
            },
            {
              id: 'widget_3',
              reportId: 'user_analytics',
              position: { x: 0, y: 1, width: 3, height: 1 },
              title: 'User Analytics',
            },
          ],
        },
        reports: ['performance_overview', 'system_health', 'user_analytics'],
        permissions: ['admin'],
        refreshInterval: 5,
        theme: 'auto',
      },
    ];

    defaultDashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.id, dashboard);
    });
  }

  // Metric Management
  async getMetrics(): Promise<MetricDefinition[]> {
    return Array.from(this.metrics.values());
  }

  async getMetric(id: string): Promise<MetricDefinition | undefined> {
    return this.metrics.get(id);
  }

  async createMetric(metric: MetricDefinition): Promise<MetricDefinition> {
    this.metrics.set(metric.id, metric);
    return metric;
  }

  async updateMetric(
    id: string,
    updates: Partial<MetricDefinition>
  ): Promise<MetricDefinition | undefined> {
    const metric = this.metrics.get(id);
    if (!metric) return undefined;

    const updatedMetric = { ...metric, ...updates };
    this.metrics.set(id, updatedMetric);
    return updatedMetric;
  }

  async deleteMetric(id: string): Promise<boolean> {
    return this.metrics.delete(id);
  }

  // Metric Value Management
  async getMetricValues(
    metricId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<MetricValue[]> {
    try {
      const response = await apiClient.get(
        `/analytics/metrics/${metricId}/values`,
        {
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString(),
        }
      );

      if (response.success) {
        return response.data.map((item: unknown) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching metric values:', error);
      return [];
    }
  }

  async calculateMetric(
    metricId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<number> {
    const metric = await this.getMetric(metricId);
    if (!metric) return 0;

    try {
      const response = await apiClient.post('/analytics/calculate', {
        metricId,
        timeRange,
        calculation: metric.calculation,
        dataSource: metric.dataSource,
      });

      if (response.success) {
        return response.data.value;
      }

      return 0;
    } catch (error) {
      console.error('Error calculating metric:', error);
      return 0;
    }
  }

  // Report Management
  async getReports(): Promise<ReportDefinition[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: string): Promise<ReportDefinition | undefined> {
    return this.reports.get(id);
  }

  async createReport(report: ReportDefinition): Promise<ReportDefinition> {
    this.reports.set(report.id, report);
    return report;
  }

  async updateReport(
    id: string,
    updates: Partial<ReportDefinition>
  ): Promise<ReportDefinition | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;

    const updatedReport = { ...report, ...updates };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }

  async generateReport(
    reportId: string,
    filters?: ReportFilter[]
  ): Promise<Record<string, unknown>> {
    const report = await this.getReport(reportId);
    if (!report) throw new Error('Report not found');

    try {
      const response = await apiClient.post('/analytics/reports/generate', {
        reportId,
        filters: filters || report.filters,
        visualization: report.visualization,
      });

      if (response.success) {
        return response.data;
      }

      throw new Error('Failed to generate report');
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Dashboard Management
  async getDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async createDashboard(dashboard: Dashboard): Promise<Dashboard> {
    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  async updateDashboard(
    id: string,
    updates: Partial<Dashboard>
  ): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return undefined;

    const updatedDashboard = { ...dashboard, ...updates };
    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    return this.dashboards.delete(id);
  }

  async getDashboardData(dashboardId: string): Promise<Record<string, unknown>> {
    const dashboard = await this.getDashboard(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    try {
      const response = await apiClient.get(
        `/analytics/dashboards/${dashboardId}/data`
      );

      if (response.success) {
        return response.data;
      }

      throw new Error('Failed to fetch dashboard data');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Forecast Management
  async getForecasts(): Promise<ForecastModel[]> {
    return Array.from(this.forecasts.values());
  }

  async getForecast(id: string): Promise<ForecastModel | undefined> {
    return this.forecasts.get(id);
  }

  async createForecast(forecast: ForecastModel): Promise<ForecastModel> {
    this.forecasts.set(forecast.id, forecast);
    return forecast;
  }

  async updateForecast(
    id: string,
    updates: Partial<ForecastModel>
  ): Promise<ForecastModel | undefined> {
    const forecast = this.forecasts.get(id);
    if (!forecast) return undefined;

    const updatedForecast = { ...forecast, ...updates };
    this.forecasts.set(id, updatedForecast);
    return updatedForecast;
  }

  async deleteForecast(id: string): Promise<boolean> {
    return this.forecasts.delete(id);
  }

  async generateForecast(
    forecastId: string,
    horizon: number
  ): Promise<ForecastPrediction[]> {
    const forecast = await this.getForecast(forecastId);
    if (!forecast) throw new Error('Forecast model not found');

    try {
      const response = await apiClient.post('/analytics/forecasts/generate', {
        forecastId,
        horizon,
        algorithm: forecast.algorithm,
        parameters: forecast.parameters,
      });

      if (response.success) {
        return response.data.predictions.map((pred: unknown) => ({
          ...pred,
          timestamp: new Date(pred.timestamp),
        }));
      }

      throw new Error('Failed to generate forecast');
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  }

  // Alert Management
  async getAlerts(): Promise<AlertRule[]> {
    return Array.from(this.alerts.values());
  }

  async getAlert(id: string): Promise<AlertRule | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: AlertRule): Promise<AlertRule> {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  async updateAlert(
    id: string,
    updates: Partial<AlertRule>
  ): Promise<AlertRule | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.alerts.delete(id);
  }

  async checkAlerts(): Promise<any[]> {
    try {
      const response = await apiClient.post('/analytics/alerts/check');

      if (response.success) {
        return response.data.alerts;
      }

      return [];
    } catch (error) {
      console.error('Error checking alerts:', error);
      return [];
    }
  }

  // Analytics Utilities
  async getAnalyticsSummary(
    orgId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/${orgId}`, {
        startDate: timeRange.start.toISOString(),
        endDate: timeRange.end.toISOString(),
      });

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return null;
    }
  }

  async exportReport(
    reportId: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<Blob | null> {
    try {
      const response = await apiClient.post(
        `/analytics/reports/${reportId}/export`,
        {
          format,
        },
        { responseType: 'blob' }
      );

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error exporting report:', error);
      return null;
    }
  }

  async scheduleReport(
    reportId: string,
    schedule: ReportDefinition['schedule']
  ): Promise<boolean> {
    try {
      const response = await apiClient.post(
        `/analytics/reports/${reportId}/schedule`,
        {
          schedule,
        }
      );

      return response.success;
    } catch (error) {
      console.error('Error scheduling report:', error);
      return false;
    }
  }
}

// Create singleton instance
export const businessIntelligence = new BusinessIntelligenceService();
