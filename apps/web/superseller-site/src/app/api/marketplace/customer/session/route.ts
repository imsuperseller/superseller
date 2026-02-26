import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/marketplace/customer/session
 * Get GoLogin session status for all customer products
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        sessions: [],
      });
    }

    const sessions = await prisma.facebookSession.findMany({
      where: { customerId: customer.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        productId: s.productId,
        profileId: s.profileId,
        status: s.status,
        lastUsed: s.lastUsed,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/marketplace/customer/session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/customer/session
 * Upload GoLogin session/cookies for a product
 *
 * Body:
 * {
 *   productId: string,
 *   profileId: string,
 *   cookies: string (encrypted)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, profileId, cookies } = body;

    if (!productId || !profileId || !cookies) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, profileId, cookies' },
        { status: 400 }
      );
    }

    // Verify product ownership
    const product = await prisma.marketplaceProduct.findFirst({
      where: {
        id: productId,
        customer: { userId: session.userId },
      },
      include: { customer: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Upsert session
    const fbSession = await prisma.facebookSession.upsert({
      where: {
        customerId_productId: {
          customerId: product.customerId,
          productId,
        },
      },
      create: {
        customerId: product.customerId,
        productId,
        profileId,
        cookies,
        status: 'ACTIVE',
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      update: {
        profileId,
        cookies,
        status: 'ACTIVE',
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // TODO: Write to RackNerd file system
    // /opt/fb-marketplace-bot/customers/<customerId>/session.json

    return NextResponse.json({
      success: true,
      session: {
        id: fbSession.id,
        productId: fbSession.productId,
        profileId: fbSession.profileId,
        status: fbSession.status,
        expiresAt: fbSession.expiresAt,
      },
    });
  } catch (error) {
    console.error('POST /api/marketplace/customer/session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload session' },
      { status: 500 }
    );
  }
}
