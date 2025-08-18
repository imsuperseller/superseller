import { writeFile, readFile, unlink, mkdir, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  organizationId: string;
  path: string;
  url?: string;
}

export interface UploadOptions {
  organizationId: string;
  uploadedBy: string;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}

class FileManager {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  private isAllowedType(filename: string, allowedTypes?: string[]): boolean {
    if (!allowedTypes || allowedTypes.length === 0) {
      return true;
    }
    const ext = this.getFileExtension(filename);
    return allowedTypes.includes(ext);
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): Promise<FileInfo> {
    // Validate file type
    if (!this.isAllowedType(filename, options.allowedTypes)) {
      throw new Error(`File type not allowed: ${this.getFileExtension(filename)}`);
    }

    // Validate file size
    if (options.maxSize && file.length > options.maxSize) {
      throw new Error(`File too large: ${file.length} bytes (max: ${options.maxSize})`);
    }

    const fileId = this.generateFileId();
    const ext = this.getFileExtension(filename);
    const newFilename = `${fileId}${ext}`;
    const filePath = path.join(this.uploadDir, options.organizationId, newFilename);

    // Create organization directory
    const orgDir = path.join(this.uploadDir, options.organizationId);
    if (!existsSync(orgDir)) {
      await mkdir(orgDir, { recursive: true });
    }

    // Write file
    await writeFile(filePath, file);

    const fileInfo: FileInfo = {
      id: fileId,
      name: filename,
      size: file.length,
      type: ext,
      uploadedAt: new Date(),
      uploadedBy: options.uploadedBy,
      organizationId: options.organizationId,
      path: filePath,
      url: `/api/files/${fileId}`,
    };

    return fileInfo;
  }

  async getFile(fileId: string, organizationId: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.uploadDir, organizationId, `${fileId}`);
      
      // Find file with any extension
      const files = await readdir(path.dirname(filePath));
      const file = files.find(f => f.startsWith(fileId));
      
      if (!file) {
        return null;
      }

      const fullPath = path.join(this.uploadDir, organizationId, file);
      return await readFile(fullPath);
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  async deleteFile(fileId: string, organizationId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, organizationId, `${fileId}`);
      
      // Find file with any extension
      const files = await readdir(path.dirname(filePath));
      const file = files.find(f => f.startsWith(fileId));
      
      if (!file) {
        return false;
      }

      const fullPath = path.join(this.uploadDir, organizationId, file);
      await unlink(fullPath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async listFiles(organizationId: string): Promise<FileInfo[]> {
    try {
      const orgDir = path.join(this.uploadDir, organizationId);
      if (!existsSync(orgDir)) {
        return [];
      }

      const files = await readdir(orgDir);
      const fileInfos: FileInfo[] = [];

      for (const file of files) {
        const filePath = path.join(orgDir, file);
        const stats = await stat(filePath);
        
        // Extract file ID from filename (remove extension)
        const fileId = path.parse(file).name;
        
        fileInfos.push({
          id: fileId,
          name: file, // You might want to store original filename in a database
          size: stats.size,
          type: path.extname(file),
          uploadedAt: stats.birthtime,
          uploadedBy: 'unknown', // You might want to store this in a database
          organizationId,
          path: filePath,
          url: `/api/files/${fileId}`,
        });
      }

      return fileInfos;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}

export const fileManager = new FileManager();
