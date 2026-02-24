import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/marketplace/customer/products
 * List all products for the authenticated customer
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer's marketplace profile
    const customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        products: [],
        message: 'No marketplace account found'
      });
    }

    return NextResponse.json({
      success: true,
      products: customer.products.map(p => ({
        id: p.id,
        customerId: p.customerId,
        productType: p.productType,
        name: p.name,
        status: p.status,
        config: p.config,
        pricing: p.pricing,
        schedule: p.schedule,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/marketplace/customer/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/customer/products
 * Create a new product for the authenticated customer
 *
 * Body:
 * {
 *   productType: 'DOORS' | 'BOUNCE_HOUSES' | 'FURNITURE',
 *   name: string,
 *   config: { collections, sizes, colors, ... },
 *   pricing: { basePrice, variationPercent, ... },
 *   schedule: { operatingHours, postLimit, cooldownMinutes },
 *   locations: string[],
 *   phoneNumbers: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productType, name, config, pricing, schedule, locations, phoneNumbers } = body;

    // Validate required fields
    if (!productType || !name || !config || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields: productType, name, config, pricing' },
        { status: 400 }
      );
    }

    // Get or create customer profile
    let customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
    });

    if (!customer) {
      // Create new customer on first product
      customer = await prisma.marketplaceCustomer.create({
        data: {
          userId: session.userId,
          businessName: 'My Business', // TODO: get from user profile
          subscription: 'TRIAL',
          credits: 100, // Free trial credits
          status: 'ACTIVE',
        },
      });
    }

    // Create product
    const product = await prisma.marketplaceProduct.create({
      data: {
        customerId: customer.id,
        productType,
        name,
        config,
        pricing,
        schedule: schedule || {
          operatingHours: { start: '6am', end: '10pm', timezone: 'America/Chicago' },
          postLimit: 5,
          cooldownMinutes: 15,
        },
        status: 'ACTIVE',
      },
    });

    // Write to file-based config for RackNerd worker
    // TODO: Trigger webhook to sync to /opt/fb-marketplace-bot/customers/<customerId>/

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        customerId: product.customerId,
        productType: product.productType,
        name: product.name,
        status: product.status,
        config: product.config,
        pricing: product.pricing,
        schedule: product.schedule,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('POST /api/marketplace/customer/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
