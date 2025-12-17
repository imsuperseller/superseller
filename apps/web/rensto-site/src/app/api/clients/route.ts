import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS, type CustomSolutionsClient } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            clientId,
            email,
            name,
            websiteUrl,
            qualificationScore,
            qualificationTier,
            answers,
            selectedTier,
            solutionPlan,
            stripeSessionId,
            stripeCustomerId,
            amountPaid,
            contractId,
            contractStatus,
            status = 'paid'
        } = body;

        if (!clientId || !email) {
            return NextResponse.json(
                { success: false, error: 'clientId and email are required' },
                { status: 400 }
            );
        }

        const db = getFirestoreAdmin();
        const now = Timestamp.now();

        const clientData: Partial<CustomSolutionsClient> = {
            id: clientId,
            email,
            name: name || email.split('@')[0],
            websiteUrl,
            qualificationScore: qualificationScore || 0,
            qualificationTier: qualificationTier || 'medium',
            answers: answers || {},
            selectedTier,
            solutionPlan,
            stripeSessionId,
            stripeCustomerId,
            amountPaid,
            contractId,
            contractStatus: contractStatus || 'pending',
            status,
            updatedAt: now
        };

        // Check if client exists
        const clientRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId);
        const existingDoc = await clientRef.get();

        if (existingDoc.exists) {
            // Update existing client
            await clientRef.update(clientData);
        } else {
            // Create new client
            await clientRef.set({
                ...clientData,
                createdAt: now
            });
        }

        return NextResponse.json({
            success: true,
            clientId,
            message: existingDoc.exists ? 'Client updated' : 'Client created'
        });

    } catch (error) {
        console.error('Client creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create/update client record' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const email = searchParams.get('email');

        if (!clientId && !email) {
            return NextResponse.json(
                { success: false, error: 'clientId or email is required' },
                { status: 400 }
            );
        }

        const db = getFirestoreAdmin();

        if (clientId) {
            const clientDoc = await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId).get();

            if (!clientDoc.exists) {
                return NextResponse.json(
                    { success: false, error: 'Client not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                client: { id: clientDoc.id, ...clientDoc.data() }
            });
        }

        // Search by email
        const querySnapshot = await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Client not found' },
                { status: 404 }
            );
        }

        const doc = querySnapshot.docs[0];
        return NextResponse.json({
            success: true,
            client: { id: doc.id, ...doc.data() }
        });

    } catch (error) {
        console.error('Client fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch client' },
            { status: 500 }
        );
    }
}
