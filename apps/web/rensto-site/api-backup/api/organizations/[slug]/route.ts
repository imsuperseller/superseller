import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';
import { withRBAC } from '@/lib/rbac';

// Get organization by slug
async function getOrganization(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { slug } = await params;

    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
    const organization = await orgsCollection.findOne({ slug });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// Update organization
async function updateOrganization(req: NextRequest, context: unknown) {
  try {
    const { params } = context;
    const { slug } = await params;
    const updateData = await req.json();

    const orgsCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);

    const result = await orgsCollection.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Organization updated successfully',
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = withRBAC(getOrganization, {
  resource: 'organizations',
  action: 'read',
});

export const PUT = withRBAC(updateOrganization, {
  resource: 'organizations',
  action: 'update',
});
