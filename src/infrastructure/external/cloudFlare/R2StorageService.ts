import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import R2Client from './R2Client';
import crypto from 'crypto';

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export type StorageFolder = 'activities' | 'featured-posts' | 'profiles';

class R2StorageService {
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'volunteer-platform';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    if (!this.publicUrl) {
      throw new Error('R2_PUBLIC_URL not configured');
    }
  }

  async upload(
    fileBuffer: Buffer,
    folder: StorageFolder,
    originalFileName: string
  ): Promise<UploadResult> {
    try {
      const client = R2Client.getInstance();
      const extension = this.extractExtension(originalFileName);
      const uniqueFileName = this.generateUniqueFileName(extension);
      const key = `${folder}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: this.getContentType(extension),
        CacheControl: 'public, max-age=31536000, immutable',
      });

      await client.send(command);

      const url = `${this.publicUrl}/${key}`;

      return { success: true, key, url };
    } catch (error) {
      console.error('R2 upload error:', error);
      return { 
        success: false, 
        error: 'فشل رفع الملف إلى التخزين' 
      };
    }
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);
      if (!key) {
        console.warn('Could not extract key from URL:', fileUrl);
        return false;
      }

      const client = R2Client.getInstance();
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await client.send(command);
      return true;
    } catch (error) {
      console.error('R2 delete error:', error);
      return false;
    }
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      if (!url.startsWith(this.publicUrl)) {
        return null;
      }

      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1);
      return key || null;
    } catch {
      return null;
    }
  }

  private extractExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
  }

  private generateUniqueFileName(extension: string): string {
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomHex}.${extension}`;
  }

  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };

    return contentTypes[extension] || 'application/octet-stream';
  }
}

export default R2StorageService;