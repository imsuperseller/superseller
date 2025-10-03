'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Database,
  Workflow,
  CreditCard,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  lastSync: string | null;
  conflicts: number;
  errors: string[];
}

interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
}

interface SyncAlert {
  system: string;
  conflictCount: number;
  conflicts: any[];
  timestamp: string;
}

interface SyncHealthData {
  timestamp: string;
  systems: {
    airtable: SystemStatus;
    notion: SystemStatus;
    n8n: SystemStatus;
    stripe: SystemStatus;
    quickbooks: SystemStatus;
  };
  metrics: SyncMetrics;
  alerts: SyncAlert[];
  overallHealth: 'healthy' | 'warning' | 'error';
}

export default function SyncHealthPage() {
  const [syncData, setSyncData] = useState<SyncHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSyncHealth();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchSyncHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSyncHealth = async () => {
    try {
      const response = await fetch('/api/sync-health');
      const result = await response.json();
      
      if (result.success) {
        setSyncData(result.data);
      }
    } catch (error) {
      console.error('Error fetching sync health:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSyncHealth();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="default" className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'airtable':
        return <Database className="h-5 w-5" />;
      case 'notion':
        return <FileText className="h-5 w-5" />;
      case 'n8n':
        return <Workflow className="h-5 w-5" />;
      case 'stripe':
        return <CreditCard className="h-5 w-5" />;
      case 'quickbooks':
        return <FileText className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sync health data...</p>
        </div>
      </div>
    );
  }

  if (!syncData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load sync health data</h2>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Sync System</h1>
          <p className="text-gray-600">Real-time data synchronization monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(syncData.overallHealth)}
            {getStatusBadge(syncData.overallHealth)}
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            {refreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncData.metrics.totalSyncs}</div>
            <p className="text-xs text-muted-foreground">
              {syncData.metrics.successfulSyncs} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncData.metrics.totalSyncs > 0 
                ? Math.round((syncData.metrics.successfulSyncs / syncData.metrics.totalSyncs) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {syncData.metrics.failedSyncs} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncData.metrics.conflictsResolved}</div>
            <p className="text-xs text-muted-foreground">
              Auto-resolved conflicts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {formatTimestamp(syncData.timestamp)}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(syncData.systems).map(([system, status]) => (
          <Card key={system}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                {getSystemIcon(system)}
                <CardTitle className="text-sm font-medium capitalize">{system}</CardTitle>
              </div>
              {getStatusIcon(status.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(status.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conflicts</span>
                  <span className="text-sm font-medium">{status.conflicts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Sync</span>
                  <span className="text-sm font-medium">{formatTimestamp(status.lastSync)}</span>
                </div>
                {status.errors.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-red-600">Errors:</span>
                    <ul className="text-xs text-red-600 mt-1">
                      {status.errors.slice(0, 2).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Latest sync alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {syncData.alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No recent alerts - all systems healthy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncData.alerts.slice(0, 10).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {alert.conflictCount > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{alert.system}</p>
                      <p className="text-sm text-gray-600">
                        {alert.conflictCount > 0 
                          ? `${alert.conflictCount} conflicts detected`
                          : 'Milestone completed successfully'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimestamp(alert.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
