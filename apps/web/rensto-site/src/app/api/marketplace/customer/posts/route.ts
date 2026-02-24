import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
