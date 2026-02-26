import { NextRequest, NextResponse } from 'next/server';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import prisma from '@/lib/prisma';
import * as dbPayments from '@/lib/db/payments';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Download token required' },
        { status: 400 }
      );
    }

    // 1. Decode token to get template info
    let templateId: string;
    let customerEmail: string;
    let timestampStr: string;

    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      [templateId, customerEmail, timestampStr] = decoded.split(':');
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Malformed download token' },
        { status: 400 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Invalid download token: missing template ID' },
        { status: 400 }
      );
    }

    const pgTemplate = await prisma.template.findUnique({ where: { id: templateId } });
    if (!pgTemplate) {
      await auditAgent.log({
        service: 'marketplace',
        action: 'download_failed',
        status: 'error',
        errorMessage: `Template ${templateId} not found for download`,
        details: { templateId, customerEmail },
      });
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!pgTemplate.content) {
      return NextResponse.json(
        { success: false, error: 'Template content is empty' },
        { status: 500 }
      );
    }

    // 3. Log download to Postgres
    try {
      await dbPayments.createDownload({
        templateId,
        userEmail: customerEmail || 'anonymous',
        status: 'success',
        userAgent: request.headers.get('user-agent') || null,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
    } catch (dlError) {
      console.error('Failed to log download to Postgres:', dlError);
    }
    await auditAgent.log({
      service: 'marketplace',
      action: 'download_success',
      status: 'success',
      details: { templateId, customerEmail, templateName: pgTemplate.name },
    });

    // 4. Return the file as a JSON download
    const filename = `${(pgTemplate.name || 'template').toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;

    const content = typeof pgTemplate.content === 'string'
      ? pgTemplate.content
      : JSON.stringify(pgTemplate.content, null, 2);

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('Secure download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process secure download' },
      { status: 500 }
    );
  }
}
