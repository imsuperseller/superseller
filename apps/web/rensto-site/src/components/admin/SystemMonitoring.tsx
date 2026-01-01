import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Progress } from '@/components/ui/progress';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  alerts: number;
}

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 12,
    uptime: '15 days, 8 hours',
    alerts: 2
  });

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageStatus = (usage: number) => {
    if (usage < 50) return 'Good';
    if (usage < 80) return 'Warning';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">System Monitoring</h2>
        <Badge variant={metrics.alerts > 0 ? 'destructive' : 'default'}>
          {metrics.alerts} Alerts
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              CPU Usage
              <Badge className={getUsageColor(metrics.cpu)}>
                {getUsageStatus(metrics.cpu)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu}%</div>
            <Progress value={metrics.cpu} className="w-full mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Memory Usage
              <Badge className={getUsageColor(metrics.memory)}>
                {getUsageStatus(metrics.memory)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory}%</div>
            <Progress value={metrics.memory} className="w-full mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Disk Usage
              <Badge className={getUsageColor(metrics.disk)}>
                {getUsageStatus(metrics.disk)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.disk}%</div>
            <Progress value={metrics.disk} className="w-full mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Network Usage
              <Badge className={getUsageColor(metrics.network)}>
                {getUsageStatus(metrics.network)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.network}%</div>
            <Progress value={metrics.network} className="w-full mt-2" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span>{metrics.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Alerts:</span>
              <span>{metrics.alerts}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Backup:</span>
              <span>2025-08-18 17:00:00</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Firewall:</span>
              <Badge className="bg-green-500">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>SSL Certificate:</span>
              <Badge className="bg-green-500">Valid</Badge>
            </div>
            <div className="flex justify-between">
              <span>Updates:</span>
              <Badge className="bg-green-500">Up to Date</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}