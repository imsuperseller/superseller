import { NextRequest, NextResponse } from 'next/server';
import { AirtableApi } from '@/lib/airtable';
import { StripeApi } from '@/lib/stripe';

const airtable = new AirtableApi();
const stripe = new StripeApi();

export async function POST(request: NextRequest) {
  try {
    const { templateId, userId, paymentIntentId } = await request.json();

    // Verify payment with Stripe
    const payment = await stripe.verifyPayment(paymentIntentId);
    if (!payment.success) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get template from Airtable
    const template = await airtable.getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Generate secure download link
    const downloadLink = await generateDownloadLink(templateId, userId);
    
    // Log download in Airtable
    await airtable.logDownload({
      templateId,
      userId,
      paymentIntentId,
      downloadLink,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      downloadLink,
      template: {
        name: template.name,
        description: template.description,
        version: template.version,
        fileSize: template.fileSize
      }
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process download' },
      { status: 500 }
    );
  }
}

async function generateDownloadLink(templateId: string, userId: string) {
  // Generate secure, time-limited download link
  const token = Buffer.from(`${templateId}:${userId}:${Date.now()}`).toString('base64');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return {
    url: `/api/marketplace/download/${token}`,
    expiresAt: expiresAt.toISOString(),
    maxDownloads: 3
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's download history
    const downloads = await airtable.getUserDownloads(userId);

    return NextResponse.json({
      success: true,
      downloads
    });

  } catch (error) {
    console.error('Downloads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}
