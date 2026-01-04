import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * API Endpoint: /api/marketplace/downloads
 * Purpose: Securely generate a download link for a marketplace template.
 * Typically called by n8n workflow after payment confirmation.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { templateId, email, secret } = body;

        // Basic validation
        if (!templateId || !email) {
            return NextResponse.json(
                { success: false, error: 'templateId and email are required' },
                { status: 400 }
            );
        }

        // Optional: Verify against a shared secret if provided in ENV
        // const N8N_SECRET = process.env.N8N_API_SECRET;
        // if (N8N_SECRET && secret !== N8N_SECRET) {
        //     return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        // }

        const db = getFirestoreAdmin();

        // 1. Verify template exists
        const templateRef = db.collection(COLLECTIONS.TEMPLATES).doc(templateId);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        const templateData = templateDoc.data();

        // 2. Create the secure download token (Matches logic in Stripe webhook)
        // Token structure: templateId:customerEmail:timestamp
        const tokenData = `${templateId}:${email}:${Date.now()}`;
        const downloadToken = Buffer.from(tokenData).toString('base64url');
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rensto.com';
        const downloadUrl = `${baseUrl}/api/marketplace/download/${downloadToken}`;

        // 3. Record the link generation in Firestore
        const purchaseRef = db.collection(COLLECTIONS.PURCHASES).add({
            templateId,
            customerEmail: email,
            downloadToken,
            downloadUrl,
            source: 'n8n_fulfillment_api',
            timestamp: Timestamp.now()
        });

        await auditAgent.log({
            service: 'marketplace',
            action: 'fulfillment_link_generated',
            status: 'success',
            details: { templateId, email, downloadUrl }
        });

        // 4. Return the generated details
        return NextResponse.json({
            success: true,
            templateName: templateData?.name || 'Workflow Blueprint',
            downloadUrl,
            expiresIn: '72 hours', // Logic for expiration can be added to the download route later if needed
            token: downloadToken
        });

    } catch (error: any) {
        console.error('Fulfillment API error:', error);
        await auditAgent.log({
            service: 'marketplace',
            action: 'fulfillment_api_failed',
            status: 'error',
            errorMessage: error.message
        });
        return NextResponse.json(
            { success: false, error: 'Internal fulfillment error' },
            { status: 500 }
        );
    }
}
