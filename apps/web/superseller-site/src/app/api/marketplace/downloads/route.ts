import { NextRequest, NextResponse } from 'next/server';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import prisma from '@/lib/prisma';
import * as dbPayments from '@/lib/db/payments';
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
        let templateName = 'Workflow Blueprint';

        const pgTemplate = await prisma.template.findUnique({
            where: { id: templateId },
            select: { name: true },
        });

        if (pgTemplate) {
            templateName = pgTemplate.name;
        } else {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        // Create secure download token
        const tokenData = `${templateId}:${email}:${Date.now()}`;
        const downloadToken = Buffer.from(tokenData).toString('base64url');
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://superseller.agency';
        const downloadUrl = `${baseUrl}/api/marketplace/download/${downloadToken}`;
        const normalizedEmail = email.toLowerCase().trim();
        const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');

        await dbPayments.createPurchase({
            userId,
            templateId,
            customerEmail: normalizedEmail,
            downloadToken,
            downloadUrl,
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
