import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check MongoDB connection
    await dbConnect();
    const mongoStatus = {
      status: 'healthy',
      message: 'MongoDB connection is operational',
      details: {
        database: mongoose.connection.db.databaseName,
        collections: await mongoose.connection.db.listCollections().toArray().then(cols => cols.map(c => c.name))
      }
    };

    // Check environment variables
    const envStatus = {
      mongodb: !!process.env.MONGODB_URI,
      nextauth: !!process.env.NEXTAUTH_SECRET && !!process.env.NEXTAUTH_URL,
    };

    // Calculate overall health
    const allServicesHealthy =
      mongoStatus.status === 'healthy' &&
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
          mongodb: mongoStatus,
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
            organizations: '/api/organizations',
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
