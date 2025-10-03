'use client';

import { useState, useEffect } from 'react';

export default function SystemMonitoringPage() {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: { upload: 125, download: 89 },
    database: { connections: 12, queries: 456, size: 2.4 },
    security: { failedLogins: 2, blockedIPs: 1, sslStatus: true }
  });
  
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: '2024-01-15T10:30:00Z',
    nextBackup: '2024-01-16T02:00:00Z',
    status: 'success',
    size: 2.4,
    location: 'AWS S3'
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics({
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      network: { 
        upload: Math.floor(Math.random() * 1000), 
        download: Math.floor(Math.random() * 1000) 
      },
      database: { 
        connections: Math.floor(Math.random() * 50), 
        queries: Math.floor(Math.random() * 1000), 
        size: Math.floor(Math.random() * 100) 
      },
      security: { 
        failedLogins: Math.floor(Math.random() * 10), 
        blockedIPs: Math.floor(Math.random() * 5), 
        sslStatus: true 
      }
    });
    setIsRefreshing(false);
  };

  const triggerBackup = async () => {
    setBackupStatus(prev => ({ ...prev, status: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    setBackupStatus(prev => ({ 
      ...prev, 
      status: 'success',
      lastBackup: new Date().toISOString()
    }));
  };

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Real-time system metrics and security monitoring</p>
        </div>
        <button 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium mb-4">CPU Usage</h3>
          <div className="text-2xl font-bold">{metrics.cpu}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium mb-4">Memory Usage</h3>
          <div className="text-2xl font-bold">{metrics.memory}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all" 
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium mb-4">Disk Usage</h3>
          <div className="text-2xl font-bold">{metrics.disk}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all" 
              style={{ width: `${metrics.disk}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium mb-4">Network</h3>
          <div className="text-2xl font-bold">{metrics.network.upload} MB/s</div>
          <p className="text-xs text-gray-500">
            ↑ {metrics.network.upload} MB/s ↓ {metrics.network.download} MB/s
          </p>
        </div>
      </div>

      {/* Database & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Database Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Active Connections</span>
              <span className="font-mono">{metrics.database.connections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Queries/sec</span>
              <span className="font-mono">{metrics.database.queries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database Size</span>
              <span className="font-mono">{metrics.database.size} GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>SSL Status</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Secure
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Security Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Failed Login Attempts</span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {metrics.security.failedLogins}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Blocked IP Addresses</span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {metrics.security.blockedIPs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>SSL Certificate</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Valid
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Management */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Backup Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Last Backup</span>
              <span className="text-sm text-gray-500">
                {new Date(backupStatus.lastBackup).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Next Scheduled Backup</span>
              <span className="text-sm text-gray-500">
                {new Date(backupStatus.nextBackup).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Backup Size</span>
              <span className="text-sm text-gray-500">{backupStatus.size} GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Storage Location</span>
              <span className="text-sm text-gray-500">{backupStatus.location}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                backupStatus.status === 'success' ? "bg-green-100 text-green-800" :
                backupStatus.status === 'running' ? "bg-blue-100 style={{ color: 'var(--rensto-blue)' }}" :
                "style={{ backgroundColor: 'var(--rensto-bg-primary)' }} style={{ color: 'var(--rensto-red)' }}"
              }`}>
                {backupStatus.status === 'running' && '🔄 '}
                {backupStatus.status.charAt(0).toUpperCase() + backupStatus.status.slice(1)}
              </span>
            </div>
            
            <button 
              onClick={triggerBackup} 
              disabled={backupStatus.status === 'running'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              📤 Trigger Manual Backup
            </button>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Security Alerts</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <p>No active security alerts</p>
        </div>
      </div>
    </div>
  );
}
