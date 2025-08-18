import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Organization from '@/models/Organization';

export async function GET() {
  try {
    await dbConnect();
    const organizations = await Organization.find({}).sort({ createdAt: -1 });
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const organization = new Organization({
      name: body.name,
      slug: body.slug,
      brandTheme: body.brandTheme || {
        primaryColor: '#2F6A92',
        secondaryColor: '#FF6536',
      },
      stripeCustomerId: body.stripeCustomerId,
      qbCompanyId: body.qbCompanyId,
      features: body.features || [],
    });

    await organization.save();
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
