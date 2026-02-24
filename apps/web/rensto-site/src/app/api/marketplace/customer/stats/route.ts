import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CreditService } from '@/lib/credits';

/**
 * GET /api/marketplace/customer/stats
 * Get stats for the authenticated customer's marketplace activity
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
      include: {
        products: true,
      },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        stats: {
          totalProducts: 0,
          activeProducts: 0,
          totalPosts: 0,
          postsToday: 0,
          postsThisWeek: 0,
          postsThisMonth: 0,
          credits: 0,
          subscription: 'NONE',
        },
      });
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate stats
    const [totalPosts, postsToday, postsThisWeek, postsThisMonth] = await Promise.all([
      prisma.marketplacePost.count({
        where: { customerId: customer.id },
      }),
      prisma.marketplacePost.count({
        where: {
          customerId: customer.id,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.marketplacePost.count({
        where: {
          customerId: customer.id,
          createdAt: { gte: weekStart },
        },
      }),
      prisma.marketplacePost.count({
        where: {
          customerId: customer.id,
          createdAt: { gte: monthStart },
        },
      }),
    ]);

    const activeProducts = customer.products.filter(p => p.status === 'ACTIVE').length;

    // Get unified credits balance from Entitlement.creditsBalance (not MarketplaceCustomer.credits)
    const creditsBalance = await CreditService.getBalance(session.userId);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: customer.products.length,
        activeProducts,
        totalPosts,
        postsToday,
        postsThisWeek,
        postsThisMonth,
        credits: creditsBalance, // Changed from customer.credits to unified balance
        subscription: customer.subscription,
        businessName: customer.businessName,
        status: customer.status,
      },
    });
  } catch (error) {
    console.error('GET /api/marketplace/customer/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
