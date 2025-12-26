import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { sanitizeWorkflow } from '@/lib/n8n/sanitizer';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/imsuperseller/rensto/main';

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

    // Decode token to get purchase record ID
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [purchaseRecordId, customerEmail, timestamp, workflowPath] = decoded.split(':');

    if (!purchaseRecordId || !workflowPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid download token' },
        { status: 400 }
      );
    }

    // Determine GitHub URL
    const githubUrl = workflowPath.startsWith('http')
      ? workflowPath
      : `${GITHUB_RAW_BASE}/${workflowPath.startsWith('/') ? workflowPath.slice(1) : workflowPath}`;

    // 1. Fetch the raw workflow from GitHub
    const response = await axios.get(githubUrl);
    const workflowJson = response.data;

    // 2. SANITIZE the workflow using the Rensto Sanitizer
    // This removes passwords, API keys, and internal instance IDs
    const sanitizedWorkflow = sanitizeWorkflow(workflowJson);

    // 3. Update download count or log (async)
    // await logDownload(purchaseRecordId);

    // 4. Return the sanitized file as a download
    return new NextResponse(JSON.stringify(sanitizedWorkflow, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${workflowPath.split('/').pop() || 'rensto-workflow.json'}"`
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
