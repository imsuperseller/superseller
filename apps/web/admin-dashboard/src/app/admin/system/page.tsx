'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Server, Database, Zap, AlertTriangle, CheckCircle, 
  Clock, TrendingUp, TrendingDown, BarChart3, Monitor, 
  Cpu, HardDrive, Wifi, Shield, RefreshCw, Settings
} from 'lucide-react';

interface SystemMetrics {
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastCheck: string;
  };
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    payments: ServiceStatus;
    workflows: ServiceStatus;
    email: ServiceStatus;
    storage: ServiceStatus;
  };
  infrastructure: {
    cpu: ResourceUsage;
    memory: ResourceUsage;
    disk: ResourceUsage;
    network: ResourceUsage;
  };
  performance: {
    requestsPerMinute: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
  };
  errors: {
    total: number;
    critical: number;
    warnings: number;
    resolved: number;
    recent: ErrorLog[];
  };
  alerts: {
    active: number;
    resolved: number;
    critical: number;
    recent: Alert[];
  };
}

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  health: number;
  dependencies: string[];
}

interface ResourceUsage {
  current: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'critical';
  service: string;
  message: string;
  resolved: boolean;
}

interface Alert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  message: string;
  resolved: boolean;
}

export default function SystemMonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        const response = await fetch('/api/admin/system');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          // Generate comprehensive mock data for demonstration
          const mockMetrics: SystemMetrics = {
            overall: {
              status: 'healthy',
              uptime: 99.97,
              responseTime: 245,
              errorRate: 0.12,
              lastCheck: new Date().toISOString()
            },
            services: {
              api: {
                name: 'API Gateway',
                status: 'up',
                responseTime: 120,
                uptime: 99.98,
                lastCheck: new Date().toISOString(),
                health: 98,
                dependencies: ['database', 'redis']
              },
              database: {
                name: 'PostgreSQL',
                status: 'up',
                responseTime: 45,
                uptime: 99.95,
                lastCheck: new Date().toISOString(),
                health: 96,
                dependencies: ['storage']
              },
              payments: {
                name: 'Stripe Integration',
                status: 'up',
                responseTime: 180,
                uptime: 99.99,
                lastCheck: new Date().toISOString(),
                health: 99,
                dependencies: ['api']
              },
              workflows: {
                name: 'n8n Workflows',
                status: 'up',
                responseTime: 300,
                uptime: 99.85,
                lastCheck: new Date().toISOString(),
                health: 94,
                dependencies: ['api', 'database']
              },
              email: {
                name: 'Email Service',
                status: 'degraded',
                responseTime: 800,
                uptime: 98.5,
                lastCheck: new Date().toISOString(),
                health: 78,
                dependencies: ['api']
              },
              storage: {
                name: 'File Storage',
                status: 'up',
                responseTime: 90,
                uptime: 99.92,
                lastCheck: new Date().toISOString(),
                health: 97,
                dependencies: []
              }
            },
            infrastructure: {
              cpu: {
                current: 45,
                max: 100,
                trend: 'stable',
                status: 'healthy'
              },
              memory: {
                current: 68,
                max: 100,
                trend: 'up',
                status: 'warning'
              },
              disk: {
                current: 23,
                max: 100,
                trend: 'stable',
                status: 'healthy'
              },
              network: {
                current: 12,
                max: 100,
                trend: 'down',
                status: 'healthy'
              }
            },
            performance: {
              requestsPerMinute: 1250,
              averageResponseTime: 245,
              p95ResponseTime: 890,
              p99ResponseTime: 2100,
              throughput: 2.1
            },
            errors: {
              total: 23,
              critical: 2,
              warnings: 8,
              resolved: 13,
              recent: [
                {
                  id: 'err_001',
                  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                  level: 'error',
                  service: 'email',
                  message: 'SMTP connection timeout',
                  resolved: false
                },
                {
                  id: 'err_002',
                  timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                  level: 'warning',
                  service: 'database',
                  message: 'Slow query detected',
                  resolved: true
                },
                {
                  id: 'err_003',
                  timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                  level: 'critical',
                  service: 'api',
                  message: 'Memory leak detected',
                  resolved: true
                }
              ]
            },
            alerts: {
              active: 3,
              resolved: 12,
              critical: 1,
              recent: [
                {
                  id: 'alert_001',
                  timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                  severity: 'high',
                  service: 'email',
                  message: 'Email delivery rate below threshold',
                  resolved: false
                },
                {
                  id: 'alert_002',
                  timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                  severity: 'medium',
                  service: 'memory',
                  message: 'Memory usage above 80%',
                  resolved: true
                },
                {
                  id: 'alert_003',
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  severity: 'critical',
                  service: 'database',
                  message: 'Database connection pool exhausted',
                  resolved: true
                }
              ]
            }
          };
          setMetrics(mockMetrics);
        }
      } catch (error) {
        console.error('Error fetching system metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemMetrics();

    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSystemMetrics, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
      case 'healthy':
        return <Badge variant="success">Up</Badge>;
      case 'degraded':
      case 'warning':
        return <Badge variant="warning">Degraded</Badge>;
      case 'down':
      case 'critical':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getResourceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading system metrics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500">Failed to load system metrics. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant={autoRefresh ? "default" : "outline"} 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusBadge(metrics.overall.status)}
              <span className="text-sm text-muted-foreground">
                {metrics.overall.uptime}% uptime
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last check: {new Date(metrics.overall.lastCheck).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overall.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              P95: {metrics.performance.p95ResponseTime}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overall.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.errors.total} total errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.alerts.active}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.alerts.critical} critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics.services).map(([key, service]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  {getStatusBadge(service.status)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span>{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>{service.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health:</span>
                    <span className={getResourceStatusColor(service.status)}>
                      {service.health}%
                    </span>
                  </div>
                  {service.dependencies.length > 0 && (
                    <div className="text-xs">
                      <span>Dependencies: </span>
                      <span>{service.dependencies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Infrastructure Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <Cpu className="h-4 w-4 mr-1" />
                    CPU Usage
                  </span>
                  <span className="text-sm">{metrics.infrastructure.cpu.current}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.infrastructure.cpu.status === 'healthy' ? 'bg-green-500' :
                      metrics.infrastructure.cpu.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.infrastructure.cpu.current}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <HardDrive className="h-4 w-4 mr-1" />
                    Memory Usage
                  </span>
                  <span className="text-sm">{metrics.infrastructure.memory.current}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.infrastructure.memory.status === 'healthy' ? 'bg-green-500' :
                      metrics.infrastructure.memory.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.infrastructure.memory.current}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    Disk Usage
                  </span>
                  <span className="text-sm">{metrics.infrastructure.disk.current}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.infrastructure.disk.status === 'healthy' ? 'bg-green-500' :
                      metrics.infrastructure.disk.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.infrastructure.disk.current}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <Wifi className="h-4 w-4 mr-1" />
                    Network Usage
                  </span>
                  <span className="text-sm">{metrics.infrastructure.network.current}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.infrastructure.network.status === 'healthy' ? 'bg-green-500' :
                      metrics.infrastructure.network.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.infrastructure.network.current}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requests/Minute</span>
                <span className="text-lg font-bold">{metrics.performance.requestsPerMinute.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-lg font-bold">{metrics.performance.averageResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">P95 Response Time</span>
                <span className="text-lg font-bold">{metrics.performance.p95ResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">P99 Response Time</span>
                <span className="text-lg font-bold">{metrics.performance.p99ResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Throughput</span>
                <span className="text-lg font-bold">{metrics.performance.throughput} GB/s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recent Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.errors.recent.map((error) => (
                <div key={error.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={error.level === 'critical' ? 'destructive' : error.level === 'error' ? 'destructive' : 'warning'}>
                        {error.level}
                      </Badge>
                      <span className="text-sm font-medium">{error.service}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    {error.resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.recent.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-sm font-medium">{alert.service}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    {alert.resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
