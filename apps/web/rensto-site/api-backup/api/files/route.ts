import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fileManager } from '@/lib/file-manager';
import { withRateLimit, uploadRateLimiter, apiRateLimiter } from '@/lib/rate-limiter';

async function uploadHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileInfo = await fileManager.uploadFile(buffer, file.name, {
      organizationId,
      uploadedBy: session.user?.email || 'unknown',
      allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx', '.jpg', '.png', '.gif'],
      maxSize: 10 * 1024 * 1024, // 10MB
    });

    return NextResponse.json(fileInfo);
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

async function listHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('orgId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const files = await fileManager.listFiles(organizationId);
    return NextResponse.json(files);
  } catch (error) {
    console.error('File list error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(uploadHandler, uploadRateLimiter);
export const GET = withRateLimit(listHandler, apiRateLimiter);
