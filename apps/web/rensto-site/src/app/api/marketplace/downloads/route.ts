import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 3: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import * as dbPayments from '@/lib/db/payments';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

/**
 * API Endpoint: /api/marketplace/downloads
 * Purpose: Securely generate a download link for a marketplace template.
 * Typically called by n8n workflow after payment confirmation.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { templateId, email, secret } = body;

        if (!templateId || !email) {
            return NextResponse.json(
                { success: false, error: 'templateId and email are required' },
                { status: 400 }
            );
        }

        // [MIGRATION] Phase 3: Verify template exists in Postgres first
        let templateName = 'Workflow Blueprint';

        const pgTemplate = await prisma.template.findUnique({
            where: { id: templateId },
            select: { name: true },
        });

        if (pgTemplate) {
            templateName = pgTemplate.name;
        } else {
            // Fallback: Firestore
            console.info('[Migration] marketplace/downloads: Template not in Postgres');
            const db = getFirestoreAdmin();
            const templateRef = db.collection(COLLECTIONS.TEMPLATES).doc(templateId);
            const templateDoc = await templateRef.get();
            if (!templateDoc.exists) {
                return NextResponse.json(
                    { success: false, error: 'Template not found' },
                    { status: 404 }
                );
            }
            templateName = templateDoc.data()?.name || templateName;
        }

        // Create secure download token
        const tokenData = `${templateId}:${email}:${Date.now()}`;
        const downloadToken = Buffer.from(tokenData).toString('base64url');
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rensto.com';
        const downloadUrl = `${baseUrl}/api/marketplace/download/${downloadToken}`;

        // [MIGRATION] Phase 3: Record in Postgres (primary)
        const normalizedEmail = email.toLowerCase().trim();
        const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');

        await dbPayments.createPurchase({
            userId,
            templateId,
            customerEmail: normalizedEmail,
            downloadToken,
            downloadUrl,
        });

        // Backup: Firestore
        await firestoreBackupWrite('marketplace/downloads POST', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.PURCHASES).add({
                templateId,
                customerEmail: email,
                downloadToken,
                downloadUrl,
                source: 'n8n_fulfillment_api',
                timestamp: Timestamp.now(),
            });
        });

        await auditAgent.log({
            service: 'marketplace',
            action: 'fulfillment_link_generated',
            status: 'success',
            details: { templateId, email, downloadUrl },
        });

        return NextResponse.json({
            success: true,
            templateName,
            downloadUrl,
            expiresIn: '72 hours',
            token: downloadToken,
        });

    } catch (error: any) {
        console.error('Fulfillment API error:', error);
        await auditAgent.log({
            service: 'marketplace',
            action: 'fulfillment_api_failed',
            status: 'error',
            errorMessage: error.message,
        });
        return NextResponse.json(
            { success: false, error: 'Internal fulfillment error' },
            { status: 500 }
        );
    }
}
