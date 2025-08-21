import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ 
      email: 'admin@rensto.com',
      role: 'admin'
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        data: {
          id: existingAdmin._id,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Create admin user
    const adminUser = {
      _id: new ObjectId(),
      email: 'admin@rensto.com',
      name: 'System Administrator',
      role: 'admin',
      organizationId: null, // Admin is not tied to any organization
      status: 'active',
      permissions: ['*'], // All permissions
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(adminUser);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Check if admin user exists
    const adminUser = await usersCollection.findOne({ 
      email: 'admin@rensto.com',
      role: 'admin'
    });

    return NextResponse.json({
      success: true,
      data: {
        exists: !!adminUser,
        admin: adminUser ? {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          status: adminUser.status
        } : null
      }
    });

  } catch (error) {
    console.error('Error checking admin user:', error);
    return NextResponse.json(
      { error: 'Failed to check admin user' },
      { status: 500 }
    );
  }
}
