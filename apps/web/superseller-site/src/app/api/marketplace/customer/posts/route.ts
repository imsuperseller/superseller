import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CreditService } from '@/lib/credits';

/**
 * GET /api/marketplace/customer/posts
 * List all posts for the authenticated customer
 * Query params: ?productId=<id>&limit=20&offset=0&status=posted
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Get customer's marketplace profile
    const customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        posts: [],
        total: 0,
      });
    }

    // Build where clause
    const where: any = {
      customerId: customer.id,
    };

    if (productId) {
      where.productId = productId;
    }

    if (status) {
      where.status = status;
    }

    // Fetch posts
    const [posts, total] = await Promise.all([
      prisma.marketplacePost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productType: true,
            },
          },
        },
      }),
      prisma.marketplacePost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      posts: posts.map(p => ({
        id: p.id,
        productId: p.productId,
        product: p.product,
        status: p.status,
        facebookUrl: p.facebookUrl,
        configData: p.configData,
        imageUrl: p.imageUrl,
        imageUrl2: p.imageUrl2,
        imageUrl3: p.imageUrl3,
        videoUrl: p.videoUrl,
        listingTitle: p.listingTitle,
        listingDescription: p.listingDescription,
        price: p.price,
        location: p.location,
        phoneNumber: p.phoneNumber,
        createdAt: p.createdAt,
        postedAt: p.postedAt,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('GET /api/marketplace/customer/posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/customer/posts
 * Create a new marketplace listing (deducts 25 credits)
 *
 * Body: {
 *   productId: string;
 *   configOverride?: object; // Optional custom config for this specific listing
 * }
 *
 * Credit Flow:
 * - Pre-check: User must have >= 25 credits
 * - Deduct: 25 credits (5 AI copy + 15 images + 2 overlay + 3 automation)
 * - Refund: If posting fails, 25 credits refunded via webhook
 */
export async function POST(request: NextRequest) {
  const LISTING_COST = 25; // Market agent cost (as defined in crew.ts)

  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { productId, configOverride } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Get or create MarketplaceCustomer
    let customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
    });

    if (!customer) {
      // Auto-create customer on first listing creation
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { businessName: true },
      });

      customer = await prisma.marketplaceCustomer.create({
        data: {
          userId: session.userId,
          businessName: user?.businessName || 'My Business',
          subscription: 'TRIAL',
          credits: 0, // Deprecated - will use Entitlement.creditsBalance
          status: 'ACTIVE',
        },
      });
    }

    // Validate product exists and belongs to customer
    const product = await prisma.marketplaceProduct.findFirst({
      where: {
        id: productId,
        customerId: customer.id,
        status: 'ACTIVE',
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Credit pre-check (from unified Entitlement.creditsBalance)
    const balance = await CreditService.checkBalance(session.userId);
    if (balance < LISTING_COST) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: LISTING_COST,
          available: balance,
        },
        { status: 402 } // Payment Required
      );
    }

    // Create listing and deduct credits in a transaction
    const post = await prisma.$transaction(async (tx) => {
      // Create MarketplacePost with status 'queued'
      const newPost = await tx.marketplacePost.create({
        data: {
          customerId: customer!.id,
          productId,
          status: 'queued',
          configData: configOverride || product.config,
        },
      });

      // Deduct 25 credits from unified balance
      await CreditService.deductCredits(
        session.userId!,
        LISTING_COST,
        'marketplace_listing',
        newPost.id,
        {
          productId,
          productType: product.productType,
          productName: product.name,
        }
      );

      return newPost;
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        productId: post.productId,
        status: post.status,
        creditsCharged: LISTING_COST,
      },
      message: `Listing queued. ${LISTING_COST} credits deducted.`,
    });
  } catch (error: any) {
    console.error('POST /api/marketplace/customer/posts error:', error);

    // Handle insufficient credits error from CreditService
    if (error.message?.includes('Insufficient credits')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
