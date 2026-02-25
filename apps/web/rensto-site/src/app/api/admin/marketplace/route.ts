import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

/**
 * GET /api/admin/marketplace
 * List all marketplace customers with products, sessions, and post stats
 */
export async function GET(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const customers = await prisma.marketplaceCustomer.findMany({
            include: {
                user: { select: { email: true, name: true } },
                products: {
                    orderBy: { createdAt: 'desc' },
                },
                sessions: {
                    select: { id: true, profileId: true, status: true, lastUsed: true, expiresAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get post counts for each customer
        const customerIds = customers.map(c => c.id);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const postCounts = await Promise.all(
            customerIds.map(async (customerId) => {
                const [total, today, failed] = await Promise.all([
                    prisma.marketplacePost.count({ where: { customerId } }),
                    prisma.marketplacePost.count({ where: { customerId, createdAt: { gte: todayStart } } }),
                    prisma.marketplacePost.count({ where: { customerId, status: 'failed' } }),
                ]);
                return { customerId, total, today, failed };
            })
        );

        const postCountMap = Object.fromEntries(postCounts.map(p => [p.customerId, p]));

        return NextResponse.json({
            customers: customers.map(c => ({
                id: c.id,
                businessName: c.businessName,
                subscription: c.subscription,
                status: c.status,
                createdAt: c.createdAt,
                user: c.user,
                products: c.products.map(p => ({
                    id: p.id,
                    name: p.name,
                    productType: p.productType,
                    status: p.status,
                    config: p.config,
                    schedule: p.schedule,
                })),
                sessions: c.sessions.map(s => ({
                    id: s.id,
                    profileId: s.profileId,
                    status: s.status,
                    lastUsed: s.lastUsed,
                    expiresAt: s.expiresAt,
                })),
                posts: postCountMap[c.id] || { total: 0, today: 0, failed: 0 },
            })),
        });
    } catch (error) {
        console.error('GET /api/admin/marketplace error:', error);
        return NextResponse.json({ error: 'Failed to fetch marketplace data' }, { status: 500 });
    }
}

/**
 * POST /api/admin/marketplace
 * Update customer status (pause/resume/delete)
 */
export async function POST(req: NextRequest) {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { action, customerId, productId } = await req.json();

        if (action === 'pause' || action === 'resume') {
            const newStatus = action === 'pause' ? 'PAUSED' : 'ACTIVE';
            if (productId) {
                await prisma.marketplaceProduct.update({
                    where: { id: productId },
                    data: { status: newStatus },
                });
            } else {
                await prisma.marketplaceCustomer.update({
                    where: { id: customerId },
                    data: { status: newStatus },
                });
            }
            return NextResponse.json({ success: true, action, status: newStatus });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('POST /api/admin/marketplace error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
