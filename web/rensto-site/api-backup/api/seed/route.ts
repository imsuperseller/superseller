import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Organization } from '@/models/Organization';
import { Customer } from '@/models/Customer';
import { Onboarding } from '@/models/Onboarding';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Create or find the main organization
    let organization = await Organization.findOne({ slug: 'rensto' });
    
    if (!organization) {
      organization = new Organization({
        name: 'Rensto',
        slug: 'rensto',
        domain: 'rensto.com',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          features: ['ai_agents', 'automation', 'analytics']
        },
        billing: {
          plan: 'enterprise',
          status: 'active',
          totalSpent: 0
        }
      });
      await organization.save();
    }

    // Create test customers
    const customers = [
      {
        name: 'Ben Ginati',
        email: 'ben@ginati.com',
        phone: '+1-555-0123',
        company: 'Ginati Consulting',
        status: 'active',
        plan: 'premium',
        source: 'referral',
        tags: ['consulting', 'premium'],
        notes: 'High-value consulting client'
      },
      {
        name: 'Shelly Mizrahi',
        email: 'shelly@mizrahi.com',
        phone: '+1-555-0456',
        company: 'Mizrahi Solutions',
        status: 'active',
        plan: 'enterprise',
        source: 'website',
        tags: ['enterprise', 'solutions'],
        notes: 'Enterprise solutions provider'
      }
    ];

    const createdCustomers = [];
    
    for (const customerData of customers) {
      // Check if customer already exists
      let customer = await Customer.findOne({ 
        email: customerData.email,
        organizationId: organization._id
      });

      if (!customer) {
        customer = new Customer({
          ...customerData,
          organizationId: organization._id,
          totalSpent: 0
        });
        await customer.save();
      }

      // Create onboarding record for each customer
      let onboarding = await Onboarding.findOne({ customerId: customer._id });
      
      if (!onboarding) {
        onboarding = new Onboarding({
          customerId: customer._id,
          organizationId: organization._id,
          paid: true,
          plan: customerData.plan,
          trial: false,
          paymentStatus: 'paid',
          requiredFields: [
            'business_name',
            'contact_email', 
            'contact_phone',
            'business_address',
            'tax_id',
            'payment_method',
            'service_preferences',
            'integration_requirements'
          ],
          missing: [
            'business_address',
            'tax_id',
            'integration_requirements'
          ],
          validated: [
            'business_name',
            'contact_email',
            'contact_phone',
            'payment_method',
            'service_preferences'
          ],
          agents: [
            { name: 'intelligent_onboarding', status: 'not_configured' },
            { name: 'customer_success', status: 'not_configured' },
            { name: 'system_monitoring', status: 'not_configured' }
          ],
          handoffReady: false,
          nagsSent: 0
        });
        await onboarding.save();
      }

      createdCustomers.push({
        customer,
        onboarding
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug
      },
      customers: createdCustomers.map(({ customer, onboarding }) => ({
        id: customer._id,
        name: customer.name,
        email: customer.email,
        company: customer.company,
        status: customer.status,
        plan: customer.plan,
        onboarding: {
          progressPercent: onboarding.progressPercent,
          missing: onboarding.missing,
          validated: onboarding.validated,
          agents: onboarding.agents
        }
      }))
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
