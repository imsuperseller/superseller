import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';

/**
 * GET /api/support/list
 * 
 * Lists support cases from Firestore.
 * Supports filtering by customerId.
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        const db = getFirestoreAdmin();
        let query: any = db.collection(COLLECTIONS.SUPPORT_CASES);

        if (customerId) {
            query = query.where('customerId', '==', customerId);
        }

        // Note: orderBy might require an index in Firestore if combined with a filter
        const snapshot = await query.orderBy('createdAt', 'desc').get();

        const cases = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore timestamps to ISO strings for JSON serializability
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return NextResponse.json({
            success: true,
            cases,
        });

    } catch (error: any) {
        console.error('Support case list error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
