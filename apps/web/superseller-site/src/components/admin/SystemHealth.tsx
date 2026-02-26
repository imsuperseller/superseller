'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    payments: ServiceStatus;
    workflows: ServiceStatus;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
}

export function SystemHealth() {
  // Mock data - replace with actual API call
  const systemStatus: SystemStatus = {
    overall: 'healthy',
    services: {
      api: {
        status: 'up',
        responseTime: 245,
        lastCheck: new Date(),
        uptime: 99.9,
      },
      database: {
        status: 'up',
        responseTime: 89,
        lastCheck: new Date(),
        uptime: 99.8,
      },
      payments: {
        status: 'up',
        responseTime: 156,
        lastCheck: new Date(),
        uptime: 99.9,
      },
      workflows: {
        status: 'degraded',
        responseTime: 1200,
        lastCheck: new Date(),
        uptime: 98.5,
      },
    },
    performance: {
      responseTime: 245,
      throughput: 1250,
      errorRate: 0.1,
      uptime: 99.9,
    },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOverallStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">All Systems Operational</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Some Issues Detected</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical Issues</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </div>
          {getOverallStatusBadge(systemStatus.overall)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Response Time</p>
            <p className="text-2xl font-bold">{systemStatus.performance.responseTime}ms</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Throughput</p>
            <p className="text-2xl font-bold">{systemStatus.performance.throughput.toLocaleString()}/min</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold">{systemStatus.performance.errorRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-2xl font-bold">{systemStatus.performance.uptime}%</p>
          </div>
        </div>

        {/* Service Status */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Service Status</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Server className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">API Gateway</p>
                  <p className="text-sm text-gray-600">Main API endpoints</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{systemStatus.services.api.responseTime}ms</p>
                  <p className="text-xs text-gray-600">{systemStatus.services.api.uptime}% uptime</p>
                </div>
                {getStatusIcon(systemStatus.services.api.status)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-gray-600">PostgreSQL + pgvector</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{systemStatus.services.database.responseTime}ms</p>
                  <p className="text-xs text-gray-600">{systemStatus.services.database.uptime}% uptime</p>
                </div>
                {getStatusIcon(systemStatus.services.database.status)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Payment Processing</p>
                  <p className="text-sm text-gray-600">PayPal integration</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{systemStatus.services.payments.responseTime}ms</p>
                  <p className="text-xs text-gray-600">{systemStatus.services.payments.uptime}% uptime</p>
                </div>
                {getStatusIcon(systemStatus.services.payments.status)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Workflow Engine</p>
                  <p className="text-sm text-gray-600">n8n automation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{systemStatus.services.workflows.responseTime}ms</p>
                  <p className="text-xs text-gray-600">{systemStatus.services.workflows.uptime}% uptime</p>
                </div>
                {getStatusIcon(systemStatus.services.workflows.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-3">Recent Alerts</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">Workflow engine response time elevated</span>
              <span className="text-gray-400">2h ago</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">All systems back to normal</span>
              <span className="text-gray-400">4h ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
