import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category') || 'credentials';

        const items = await prisma.vaultItem.findMany({
            where: { category },
            orderBy: { key: 'asc' },
        });

        // Mask sensitive values — show only first 8 chars + "***"
        const masked = items.map((item: any) => ({
            ...item,
            value: item.value ? `${String(item.value).slice(0, 8)}***` : null,
        }));

        return NextResponse.json(masked);
    } catch (error) {
        console.error('Error fetching vault items:', error);
        return NextResponse.json({ error: 'Failed to fetch vault items' }, { status: 500 });
    }
}
