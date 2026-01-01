import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Download token required' },
        { status: 400 }
      );
    }

    // 1. Decode token to get template info
    // Token structure (base64): templateId:customerEmail:timestamp
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

    // 2. Fetch the template from Firestore
    const db = getFirestoreAdmin();
    const docRef = db.collection(COLLECTIONS.TEMPLATES).doc(templateId);
    const doc = await docRef.get();

    if (!doc.exists) {
      await auditAgent.log({
        service: 'firebase',
        action: 'download_failed',
        status: 'error',
        errorMessage: `Template ${templateId} not found for download`,
        details: { templateId, customerEmail }
      });
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = doc.data();

    // Check if content exists
    if (!template?.content) {
      return NextResponse.json(
        { success: false, error: 'Template content is empty' },
        { status: 500 }
      );
    }

    // 3. Log the download event in Firestore
    try {
      await db.collection(COLLECTIONS.DOWNLOADS).add({
        templateId,
        userEmail: customerEmail || 'anonymous',
        timestamp: Timestamp.now(),
        status: 'success',
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to log download to Firestore:', logError);
      // Continue anyway as we have the content
    }

    await auditAgent.log({
      service: 'firebase',
      action: 'download_success',
      status: 'success',
      details: { templateId, customerEmail, templateName: template.name }
    });

    // 4. Return the file as a JSON download
    const filename = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;

    // If it's already a string, use it, otherwise stringify
    const content = typeof template.content === 'string'
      ? template.content
      : JSON.stringify(template.content, null, 2);

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error('Secure download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process secure download' },
      { status: 500 }
    );
  }
}
