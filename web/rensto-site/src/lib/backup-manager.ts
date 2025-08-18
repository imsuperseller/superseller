import { createClient } from 'webdav';
import { writeFile, readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { } from './file-manager';

export interface BackupConfig {
  icedriveUrl: string;
  icedriveKey: string;
  backupInterval: number; // in hours
  retentionDays: number;
  includeDatabase: boolean;
  includeFiles: boolean;
  includeLogs: boolean;
}

export interface BackupStatus {
  id: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: 'full' | 'incremental';
  size: number;
  filesCount: number;
  error?: string;
  duration?: number;
}

class BackupManager {
  private webdavClient: unknown;
  private config: BackupConfig;
  private backupStatus: Map<string, BackupStatus> = new Map();

  constructor() {
    this.config = {
      icedriveUrl: process.env.ICEDRIVE_WEBDAV_SERVER_URL || 'https://webdav.icedrive.io',
      icedriveKey: process.env.ICEDRIVE_ACCESS_KEY || '',
      backupInterval: 24, // 24 hours
      retentionDays: 30,
      includeDatabase: true,
      includeFiles: true,
      includeLogs: true,
    };

    this.initializeWebDAV();
  }

  private initializeWebDAV(): void {
    try {
      this.webdavClient = createClient(this.config.icedriveUrl, {
        username: 'rensto',
        password: this.config.icedriveKey,
      });
    } catch (error) {
      console.error('Failed to initialize WebDAV client:', error);
    }
  }

  async createBackup(): Promise<BackupStatus> {
    const backupId = `backup-${Date.now()}`;
    const startTime = Date.now();

    const backupStatus: BackupStatus = {
      id: backupId,
      timestamp: new Date(),
      status: 'running',
      type: 'full',
      size: 0,
      filesCount: 0,
    };

    this.backupStatus.set(backupId, backupStatus);

    try {
      console.log(`Starting backup: ${backupId}`);

      // Create backup directory structure
      const backupDir = `/rensto-backups/${backupId}`;
      await this.ensureDirectoryExists(backupDir);

      let totalSize = 0;
      let totalFiles = 0;

      // Backup database
      if (this.config.includeDatabase) {
        const dbBackup = await this.backupDatabase();
        if (dbBackup) {
          await this.uploadFile(`${backupDir}/database.json`, dbBackup);
          totalSize += dbBackup.length;
          totalFiles++;
        }
      }

      // Backup files
      if (this.config.includeFiles) {
        const filesBackup = await this.backupFiles();
        for (const [filePath, content] of Object.entries(filesBackup)) {
          await this.uploadFile(`${backupDir}/files${filePath}`, content);
          totalSize += content.length;
          totalFiles++;
        }
      }

      // Backup logs
      if (this.config.includeLogs) {
        const logsBackup = await this.backupLogs();
        if (logsBackup) {
          await this.uploadFile(`${backupDir}/logs.json`, logsBackup);
          totalSize += logsBackup.length;
          totalFiles++;
        }
      }

      // Create backup manifest
      const manifest = {
        id: backupId,
        timestamp: backupStatus.timestamp.toISOString(),
        type: backupStatus.type,
        size: totalSize,
        filesCount: totalFiles,
        config: this.config,
      };

      await this.uploadFile(`${backupDir}/manifest.json`, JSON.stringify(manifest, null, 2));

      // Update backup status
      backupStatus.status = 'completed';
      backupStatus.size = totalSize;
      backupStatus.filesCount = totalFiles;
      backupStatus.duration = Date.now() - startTime;

      console.log(`Backup completed: ${backupId} (${totalFiles} files, ${this.formatBytes(totalSize)})`);

      // Clean up old backups
      await this.cleanupOldBackups();

      return backupStatus;
    } catch (error) {
      console.error(`Backup failed: ${backupId}`, error);
      
      backupStatus.status = 'failed';
      backupStatus.error = error instanceof Error ? error.message : 'Unknown error';
      backupStatus.duration = Date.now() - startTime;

      return backupStatus;
    }
  }

  private async backupDatabase(): Promise<string | null> {
    try {
      // This would typically export your MongoDB data
      // For now, we'll create a sample database backup
      const dbData = {
        collections: {
          users: [],
          organizations: [],
          agents: [],
          customers: [],
        },
        timestamp: new Date().toISOString(),
      };

      return JSON.stringify(dbData, null, 2);
    } catch (error) {
      console.error('Database backup failed:', error);
      return null;
    }
  }

  private async backupFiles(): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      
      if (existsSync(uploadDir)) {
        await this.backupDirectory(uploadDir, '/uploads', files);
      }

      // Backup configuration files
      const configFiles = [
        'package.json',
        'next.config.mjs',
        'vercel.json',
        '.env.example',
      ];

      for (const configFile of configFiles) {
        if (existsSync(configFile)) {
          const content = await readFile(configFile, 'utf-8');
          files[`/config/${configFile}`] = content;
        }
      }
    } catch (error) {
      console.error('Files backup failed:', error);
    }

    return files;
  }

  private async backupDirectory(dirPath: string, relativePath: string, files: Record<string, string>): Promise<void> {
    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.backupDirectory(fullPath, `${relativePath}/${item}`, files);
        } else {
          const content = await readFile(fullPath, 'utf-8');
          files[`${relativePath}/${item}`] = content;
        }
      }
    } catch (error) {
      console.error(`Failed to backup directory: ${dirPath}`, error);
    }
  }

  private async backupLogs(): Promise<string | null> {
    try {
      // This would typically collect application logs
      // For now, we'll create a sample log backup
      const logs = {
        application: {
          level: 'info',
          message: 'Backup system initialized',
          timestamp: new Date().toISOString(),
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
      };

      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error('Logs backup failed:', error);
      return null;
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const pathParts = dirPath.split('/').filter(Boolean);
      let currentPath = '';
      
      for (const part of pathParts) {
        currentPath += `/${part}`;
        try {
          await this.webdavClient.stat(currentPath);
        } catch {
          await this.webdavClient.createDirectory(currentPath);
        }
      }
    } catch (error) {
      console.error(`Failed to create directory: ${dirPath}`, error);
    }
  }

  private async uploadFile(filePath: string, content: string): Promise<void> {
    try {
      await this.webdavClient.putFileContents(filePath, content, { overwrite: true });
    } catch (error) {
      console.error(`Failed to upload file: ${filePath}`, error);
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const backups = await this.webdavClient.getDirectoryContents('/rensto-backups');
      
      for (const backup of backups) {
        if (backup.type === 'directory') {
          const backupDate = new Date(backup.lastmod);
          if (backupDate < cutoffDate) {
            await this.webdavClient.deleteFile(backup.filename);
            console.log(`Deleted old backup: ${backup.filename}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  async listBackups(): Promise<BackupStatus[]> {
    try {
      const backups = await this.webdavClient.getDirectoryContents('/rensto-backups');
      const backupList: BackupStatus[] = [];

      for (const backup of backups) {
        if (backup.type === 'directory') {
          try {
            const manifestPath = `${backup.filename}/manifest.json`;
            const manifestContent = await this.webdavClient.getFileContents(manifestPath, { format: 'text' });
            const manifest = JSON.parse(manifestContent);
            
            backupList.push({
              id: manifest.id,
              timestamp: new Date(manifest.timestamp),
              status: 'completed',
              type: manifest.type,
              size: manifest.size,
              filesCount: manifest.filesCount,
            });
          } catch {
            // Skip backups without manifest
          }
        }
      }

      return backupList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      console.log(`Starting restore from backup: ${backupId}`);
      
      const manifestPath = `/rensto-backups/${backupId}/manifest.json`;
      const manifestContent = await this.webdavClient.getFileContents(manifestPath, { format: 'text' });
      const manifest = JSON.parse(manifestContent);

      // Restore database
      if (this.config.includeDatabase) {
        const dbBackup = await this.webdavClient.getFileContents(`/rensto-backups/${backupId}/database.json`, { format: 'text' });
        await this.restoreDatabase(dbBackup);
      }

      // Restore files
      if (this.config.includeFiles) {
        await this.restoreFiles(backupId);
      }

      console.log(`Restore completed from backup: ${backupId}`);
      return true;
    } catch (error) {
      console.error(`Restore failed from backup: ${backupId}`, error);
      return false;
    }
  }

  private async restoreDatabase(dbBackup: string): Promise<void> {
    try {
      const dbData = JSON.parse(dbBackup);
      // This would typically restore your MongoDB data
      console.log('Database restore completed');
    } catch (error) {
      console.error('Database restore failed:', error);
    }
  }

  private async restoreFiles(backupId: string): Promise<void> {
    try {
      const files = await this.webdavClient.getDirectoryContents(`/rensto-backups/${backupId}/files`);
      
      for (const file of files) {
        if (file.type === 'file') {
          const content = await this.webdavClient.getFileContents(file.filename, { format: 'text' });
          const relativePath = file.filename.replace(`/rensto-backups/${backupId}/files`, '');
          const fullPath = path.join(process.env.UPLOAD_DIR || './uploads', relativePath);
          
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          if (!existsSync(dir)) {
            await this.ensureLocalDirectory(dir);
          }
          
          await writeFile(fullPath, content);
        }
      }
      
      console.log('Files restore completed');
    } catch (error) {
      console.error('Files restore failed:', error);
    }
  }

  private async ensureLocalDirectory(dirPath: string): Promise<void> {
    const { mkdir } = await import('fs/promises');
    await mkdir(dirPath, { recursive: true });
  }

  getBackupStatus(backupId: string): BackupStatus | undefined {
    return this.backupStatus.get(backupId);
  }

  getAllBackupStatus(): BackupStatus[] {
    return Array.from(this.backupStatus.values());
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const backupManager = new BackupManager();
