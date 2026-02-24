import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreditService } from '@/lib/credits';
import { logger } from '@/lib/logger';

/**
 * POST /api/marketplace/webhook/refund
 * Webhook endpoint for FB bot to report listing failures and trigger credit refunds.
 *
 * Called by webhook-server.js on RackNerd when a listing fails to post.
 *
 * Body: {
 *   postId: string;
 *   status: 'failed' | 'posted';
 *   error?: string;
 *   facebookUrl?: string;
 * }
 *
 * Auth: API key in Authorization header (TODO: Add when integrating with bot)
 */
export async function POST(request: NextRequest) {
  const LISTING_COST = 25; // Market agent cost (must match posts/route.ts)

  try {
    // TODO: Add API key authentication
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.MARKETPLACE_WEBHOOK_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { postId, status, error, facebookUrl } = body;

    if (!postId || !status) {
      return NextResponse.json(
        { error: 'postId and status are required' },
        { status: 400 }
      );
    }

    // Find the post
    const post = await prisma.marketplacePost.findUnique({
      where: { id: postId },
      include: {
        customer: {
          select: {
            userId: true,
            businessName: true,
          },
        },
        product: {
          select: {
            name: true,
            productType: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Handle success case (posted)
    if (status === 'posted') {
      await prisma.marketplacePost.update({
        where: { id: postId },
        data: {
          status: 'posted',
          postedAt: new Date(),
          facebookUrl,
        },
      });

      logger.info(`Marketplace listing posted successfully`, {
        postId,
        userId: post.customer.userId,
        facebookUrl,
      });

      return NextResponse.json({
        success: true,
        message: 'Listing marked as posted',
      });
    }

    // Handle failure case (refund credits)
    if (status === 'failed') {
      await prisma.$transaction(async (tx) => {
        // Update post status
        await tx.marketplacePost.update({
          where: { id: postId },
          data: {
            status: 'failed',
          },
        });

        // Refund credits to user
        await CreditService.refundCredits(
          post.customer.userId,
          LISTING_COST,
          postId,
          error || 'Listing failed to post'
        );
      });

      logger.info(`Marketplace listing failed, credits refunded`, {
        postId,
        userId: post.customer.userId,
        creditsRefunded: LISTING_COST,
        error,
      });

      // TODO: Send notification to customer (email/WhatsApp)
      // await NotificationService.notifyMarketplaceFailed({
      //   userId: post.customer.userId,
      //   postId,
      //   productName: post.product.name,
      //   error,
      //   creditsRefunded: LISTING_COST,
      // });

      return NextResponse.json({
        success: true,
        message: 'Listing marked as failed, credits refunded',
        creditsRefunded: LISTING_COST,
      });
    }

    // Invalid status
    return NextResponse.json(
      { error: 'Invalid status. Must be "posted" or "failed"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST /api/marketplace/webhook/refund error:', error);
    logger.error('Marketplace webhook error', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
