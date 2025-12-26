import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID required' },
                { status: 400 }
            );
        }

        const db = getFirestoreAdmin();
        const docRef = db.collection(COLLECTIONS.TEMPLATES).doc(id);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            return NextResponse.json({
                success: true,
                workflow: {
                    id: doc.id,
                    ...data,
                    // Map Firestore fields to frontend expected fields
                    downloadPrice: data?.price,
                    complexity: data?.complexity || 'Intermediate',
                    setupTime: data?.setupTime || '2 hours',
                    targetMarket: data?.targetMarket || 'General'
                }
            });
        }

        return NextResponse.json(
            { success: false, error: 'Workflow not found' },
            { status: 404 }
        );

    } catch (error: any) {
        console.error('Workflow API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch workflow details' },
            { status: 500 }
        );
    }
}
