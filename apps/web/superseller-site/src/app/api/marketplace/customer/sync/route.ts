import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/marketplace/customer/sync
 * Sync customer/product config to RackNerd file system
 *
 * This endpoint is called after creating/updating products to push
 * the config to /opt/fb-marketplace-bot/customers/<customerId>/ on RackNerd
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer with all products
    const customer = await prisma.marketplaceCustomer.findUnique({
      where: { userId: session.userId },
      include: {
        products: {
          where: { status: 'ACTIVE' },
        },
        sessions: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Build file-based config structure
    const config = {
      customerId: customer.id,
      businessName: customer.businessName,
      status: (customer.status ?? 'active').toLowerCase(),
      products: customer.products.map(p => ({
        productId: p.id,
        productType: p.productType,
        name: p.name,
        config: p.config,
        pricing: p.pricing,
        schedule: p.schedule,
      })),
    };

    const schedule = {
      cycleIntervalMinutes: 20,
      operatingHours: {
        start: '6am',
        end: '10pm',
        timezone: 'America/Chicago',
      },
      products: customer.products.reduce((acc, p: any) => {
        const sched = p.schedule || {};
        acc[p.id] = {
          enabled: true,
          postLimit: sched.postLimit || 5,
          cooldownMinutes: sched.cooldownMinutes || 15,
        };
        return acc;
      }, {} as any),
    };

    const sessionData = {
      goLoginProfiles: customer.sessions.reduce((acc, s: any) => {
        acc[s.productId] = {
          profileId: s.profileId,
          status: s.status.toLowerCase(),
        };
        return acc;
      }, {} as any),
    };

    // TODO: Push to RackNerd via SSH/SCP or webhook
    // For now, return the config for manual deployment
    // In production, use:
    // 1. SSH key-based rsync: rsync config.json root@172.245.56.50:/opt/fb-marketplace-bot/customers/<customerId>/
    // 2. Or webhook endpoint on RackNerd that receives config via HTTP POST

    return NextResponse.json({
      success: true,
      message: 'Config generated (manual sync required)',
      config: {
        'config.json': config,
        'schedule.json': schedule,
        'session.json': sessionData,
      },
      instructions: [
        'SSH to RackNerd: ssh root@172.245.56.50',
        `Create directory: mkdir -p /opt/fb-marketplace-bot/customers/${customer.id}`,
        `Write config files to /opt/fb-marketplace-bot/customers/${customer.id}/`,
        'Restart scheduler: pm2 restart fb-scheduler',
      ],
    });
  } catch (error) {
    console.error('POST /api/marketplace/customer/sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync config' },
      { status: 500 }
    );
  }
}
