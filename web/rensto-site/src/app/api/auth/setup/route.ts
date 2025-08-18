import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS, Organization, User, UserRole } from '@/lib/models';
import { createUser } from '@/lib/auth';
import { } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const db = await getCollection(COLLECTIONS.ORGANIZATIONS);

    // Check if setup is already complete
    const existingOrg = await db.findOne({ slug: 'demo-org' });
    if (existingOrg) {
      return NextResponse.json({
        success: false,
        message: 'Setup already completed',
        data: existingOrg,
      });
    }

    // Create demo organization
    const org: Omit<Organization, '_id'> = {
      name: 'Demo Organization',
      slug: 'demo-org',
      domain: 'demo.rensto.com',
      settings: {
        theme: {
          primaryColor: '#fe3d51',
          logo: '/logo.png',
          favicon: '/favicon.ico',
        },
        features: {
          aiInsights: true,
          marketplace: true,
          whiteLabel: false,
        },
        billing: {
          plan: 'growth',
        },
      },
      status: 'active',
      maxUsers: 10,
      maxAgents: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orgResult = await db.insertOne(org);
    const orgId = orgResult.insertedId;

    // Create demo users
    const demoUsers = [
      {
        email: 'admin@demo.com',
        name: 'Demo Admin',
        role: UserRole.ADMIN,
        orgId: orgId.toString(),
      },
      {
        email: 'manager@demo.com',
        name: 'Demo Manager',
        role: UserRole.MANAGER,
        orgId: orgId.toString(),
      },
      {
        email: 'user@demo.com',
        name: 'Demo User',
        role: UserRole.USER,
        orgId: orgId.toString(),
      },
    ];

    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = await createUser(userData);
      createdUsers.push(user);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data created successfully',
      data: {
        organization: { ...org, _id: orgId },
        users: createdUsers,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to setup demo data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
