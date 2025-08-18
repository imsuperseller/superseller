import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    const healthChecks = {
      database: false,
      adminUser: false,
      collections: false,
      environment: false,
      timestamp: new Date().toISOString(),
    };

    // Check database connection
    try {
      const usersCollection = await getCollection(COLLECTIONS.USERS);
      await usersCollection.findOne({}); // Test query
      healthChecks.database = true;
    } catch (error) {
      console.error('Database connection failed:', error);
    }

    // Check if admin user exists
    try {
      const usersCollection = await getCollection(COLLECTIONS.USERS);
      const adminUser = await usersCollection.findOne({
        email: 'admin@rensto.com',
        role: 'admin',
      });
      healthChecks.adminUser = !!adminUser;
    } catch (error) {
      console.error('Admin user check failed:', error);
    }

    // Check if collections exist
    try {
      const collections = [
        COLLECTIONS.USERS,
        COLLECTIONS.ORGANIZATIONS,
        COLLECTIONS.AGENTS,
        COLLECTIONS.AGENT_RUNS,
        COLLECTIONS.DATA_SOURCES,
      ];

      for (const collectionName of collections) {
        try {
          const collection = await getCollection(collectionName);
          await collection.findOne({});
        } catch (error) {
          console.error(`Collection ${collectionName} check failed:`, error);
          healthChecks.collections = false;
          break;
        }
      }
      healthChecks.collections = true;
    } catch (error) {
      console.error('Collections check failed:', error);
    }

    // Check environment variables
    const requiredEnvVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );
    healthChecks.environment = missingEnvVars.length === 0;

    // Determine overall health
    const allHealthy = Object.values(healthChecks).every(check =>
      typeof check === 'boolean' ? check : true
    );

    const status = allHealthy ? 200 : 503;

    return NextResponse.json(
      {
        success: allHealthy,
        status: allHealthy ? 'healthy' : 'unhealthy',
        checks: healthChecks,
        issues: !allHealthy
          ? {
              database: !healthChecks.database
                ? 'Database connection failed'
                : null,
              adminUser: !healthChecks.adminUser
                ? 'Admin user not found'
                : null,
              collections: !healthChecks.collections
                ? 'Some collections are missing'
                : null,
              environment: !healthChecks.environment
                ? `Missing environment variables: ${missingEnvVars.join(', ')}`
                : null,
            }
          : null,
        recommendations: !allHealthy
          ? [
              !healthChecks.database && 'Check MongoDB connection string',
              !healthChecks.adminUser &&
                'Create admin user via /api/setup/admin',
              !healthChecks.collections && 'Run data population script',
              !healthChecks.environment && 'Set required environment variables',
            ].filter(Boolean)
          : [],
      },
      { status }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
