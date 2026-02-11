import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 3: Firestore kept as fallback
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID required' },
                { status: 400 }
            );
        }

        // [MIGRATION] Phase 3: Read from Postgres first
        const pgTemplate = await prisma.template.findUnique({ where: { id } });

        if (pgTemplate) {
            return NextResponse.json({
                success: true,
                workflow: {
                    id: pgTemplate.id,
                    name: pgTemplate.name,
                    description: pgTemplate.description,
                    category: pgTemplate.category,
                    price: pgTemplate.price,
                    downloadPrice: pgTemplate.price,
                    installPrice: pgTemplate.installPrice,
                    customPrice: pgTemplate.customPrice,
                    complexity: pgTemplate.complexity || 'Intermediate',
                    setupTime: pgTemplate.setupTime || '2 hours',
                    targetMarket: pgTemplate.targetMarket || 'General',
                    features: pgTemplate.features,
                    integrations: pgTemplate.integrations,
                    metrics: pgTemplate.metrics,
                    rating: pgTemplate.rating,
                    downloads: pgTemplate.downloadCount,
                },
            });
        }

        // Fallback: Firestore
        console.info('[Migration] marketplace/[id]: Postgres miss, falling back to Firestore');
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
                    downloadPrice: data?.price,
                    complexity: data?.complexity || 'Intermediate',
                    setupTime: data?.setupTime || '2 hours',
                    targetMarket: data?.targetMarket || 'General',
                },
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
