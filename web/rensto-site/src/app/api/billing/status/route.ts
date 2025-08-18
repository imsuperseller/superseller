import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Customer } from '@/models/Customer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get billing status for the user's organization
    const customers = await Customer.find({ 
      organizationId: session.user?.organizationId 
    }).limit(1);

    if (customers.length === 0) {
      return NextResponse.json({
        status: 'no_subscription',
        message: 'No active subscription found'
      });
    }

    const customer = customers[0];
    
    return NextResponse.json({
      status: 'active',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        plan: customer.plan,
        status: customer.status,
        totalSpent: customer.totalSpent,
        lastContact: customer.lastContact,
      }
    });
  } catch (error) {
    console.error('Billing status error:', error);
    return NextResponse.json(
      { error: 'Failed to get billing status' },
      { status: 500 }
    );
  }
}
