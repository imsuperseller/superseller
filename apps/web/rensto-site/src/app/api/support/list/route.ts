import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');
        try {
            const where = customerId ? { customerId } : {};
            const cases = await prisma.supportCase.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({
                success: true,
                cases: cases.map(c => ({
                    ...c,
                    createdAt: c.createdAt.toISOString(),
                    updatedAt: c.updatedAt.toISOString(),
                })),
            });
        } catch (pgError) {
            // Fallback: Firestore
            console.info('[Migration] support/list: Postgres fail, falling back to Firestore');
            const db = getFirestoreAdmin();
            let query: any = db.collection(COLLECTIONS.SUPPORT_CASES);
            if (customerId) query = query.where('customerId', '==', customerId);

            const snapshot = await query.orderBy('createdAt', 'desc').get();
            const cases = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                };
            });

            return NextResponse.json({ success: true, cases });
        }
    } catch (error: any) {
        console.error('Support case list error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
