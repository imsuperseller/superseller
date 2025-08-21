import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { DataSource } from '@/models/DataSource';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get data sources for the current user's organization
    // For now, we'll get all data sources since we don't have org-specific filtering yet
    const dataSources = await DataSource.find({}).sort({ createdAt: -1 });

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const dataSource = new DataSource({
      name: body.name,
      type: body.type,
      status: body.status || 'disconnected',
      icon: body.icon || '🔗',
      credentials: body.credentials || { isConfigured: false },
      setupInstructions: body.setupInstructions,
      organizationId: body.organizationId,
    });

    await dataSource.save();
    return NextResponse.json(dataSource, { status: 201 });
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}
