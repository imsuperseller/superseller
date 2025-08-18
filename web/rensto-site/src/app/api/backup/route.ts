import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { backupManager } from '@/lib/backup-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const backupStatus = await backupManager.createBackup();
    
    return NextResponse.json({
      success: true,
      backup: backupStatus,
      message: 'Backup started successfully',
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (backupId) {
      // Get specific backup status
      const backupStatus = backupManager.getBackupStatus(backupId);
      
      if (!backupStatus) {
        return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        backup: backupStatus,
      });
    } else {
      // List all backups
      const backups = await backupManager.listBackups();
      const activeBackups = backupManager.getAllBackupStatus();
      
      return NextResponse.json({
        success: true,
        backups: [...backups, ...activeBackups],
        total: backups.length + activeBackups.length,
      });
    }
  } catch (error) {
    console.error('Backup listing error:', error);
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}
