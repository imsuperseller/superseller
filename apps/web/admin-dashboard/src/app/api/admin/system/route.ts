import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive system monitoring data
    // This would typically integrate with monitoring tools like DataDog, New Relic, or custom metrics
    
    // For now, return comprehensive mock data that demonstrates the full monitoring capability
    const systemMetrics = {
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

    return NextResponse.json(systemMetrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}
