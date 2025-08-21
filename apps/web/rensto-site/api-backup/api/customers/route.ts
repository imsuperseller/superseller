import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('orgId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const customers = await Customer.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, phone, company, organizationId, plan, source, tags, notes } = body;

    if (!name || !email || !organizationId) {
      return NextResponse.json({ 
        error: 'Name, email, and organization ID are required' 
      }, { status: 400 });
    }

    const customer = new Customer({
      name,
      email,
      phone,
      company,
      organizationId,
      plan: plan || 'basic',
      source: source || 'website',
      tags: tags || [],
      notes,
      status: 'prospect',
      totalSpent: 0,
    });

    await customer.save();

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
