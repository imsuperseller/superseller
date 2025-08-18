import { NextResponse } from 'next/server';
import { healthCheck as mongoHealthCheck } from '@/lib/mongodb';
import { n8nService } from '@/lib/n8n';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check MongoDB connection
    const mongoStatus = await mongoHealthCheck();

    // Check n8n service
    const n8nStatus = await n8nService.healthCheck();

    // Check environment variables
    const envStatus = {
      mongodb: !!process.env.MONGODB_URI,
      n8n: !!process.env.N8N_BASE_URL && !!process.env.N8N_API_KEY,
      nextauth: !!process.env.NEXTAUTH_SECRET && !!process.env.NEXTAUTH_URL,
    };

    // Calculate overall health
    const allServicesHealthy =
      mongoStatus.status === 'healthy' &&
      n8nStatus.status === 'healthy' &&
      Object.values(envStatus).every(Boolean);

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: allServicesHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
        services: {
          mongodb: {
            status: mongoStatus.status,
            message: mongoStatus.message,
            details: mongoStatus.details,
          },
          n8n: {
            status: n8nStatus.status,
            message: n8nStatus.message,
            workflows: n8nStatus.workflows,
            activeWorkflows: n8nStatus.activeWorkflows,
          },
          environment: {
            status: Object.values(envStatus).every(Boolean)
              ? 'healthy'
              : 'unhealthy',
            variables: envStatus,
          },
        },
        endpoints: {
          admin: '/admin',
          customerPortal: '/demo-org',
          api: {
            auth: '/api/auth',
            n8n: '/api/n8n',
            organizations: '/api/organizations',
            webhooks: '/api/hooks/n8n',
          },
        },
      },
      {
        status: allServicesHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
