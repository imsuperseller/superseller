import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { backupManager } from '@/lib/backup-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const backupId = params.id;
    const success = await backupManager.restoreBackup(backupId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Backup ${backupId} restored successfully`,
      });
    } else {
      return NextResponse.json(
        { error: `Failed to restore backup ${backupId}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
