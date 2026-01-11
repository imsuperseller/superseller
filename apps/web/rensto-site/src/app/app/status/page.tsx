'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Server,
  Database,
  Globe,
} from 'lucide-react';

const systemStatus = {
  overall: 'operational',
  services: [
    {
      name: 'n8n Workflows',
      status: 'operational',
      uptime: '99.9%',
      lastCheck: '2 minutes ago',
    },
    {
      name: 'OpenAI API',
      status: 'operational',
      uptime: '99.8%',
      lastCheck: '1 minute ago',
    },
    {
      name: 'WordPress API',
      status: 'operational',
      uptime: '99.7%',
      lastCheck: '3 minutes ago',
    },
    {
      name: 'Facebook Graph API',
      status: 'degraded',
      uptime: '95.2%',
      lastCheck: '5 minutes ago',
    },
    {
      name: 'LinkedIn API',
      status: 'operational',
      uptime: '99.5%',
      lastCheck: '2 minutes ago',
    },
  ],
};

export default function StatusPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="renstoSuccess">Operational</Badge>;
      case 'degraded':
        return <Badge variant="renstoWarning">Degraded</Badge>;
      case 'outage':
        return <Badge variant="renstoError">Outage</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-rensto-text-secondary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-rensto-text-primary">System Status</h1>
        <p className="text-rensto-text-secondary mt-2">
          Monitor the health and performance of your agent services
        </p>
      </div>

      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {getStatusIcon(systemStatus.overall)}
            <div>
              <CardTitle className="text-rensto-text-primary">All Systems Operational</CardTitle>
              <CardDescription className="text-rensto-text-secondary">
                All services are running normally
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemStatus.services.map((service, index) => (
          <Card key={index} variant="renstoNeon" className="rensto-card-neon">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <CardTitle className="text-lg text-rensto-text-primary">{service.name}</CardTitle>
                    <CardDescription className="text-rensto-text-secondary">
                      Last checked: {service.lastCheck}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(service.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-rensto-text-secondary">Uptime</span>
                  <span className="font-medium text-rensto-text-primary">{service.uptime}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500' :
                        service.status === 'degraded' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    style={{ width: service.uptime }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
