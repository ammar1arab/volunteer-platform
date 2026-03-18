import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import R2Client from "./R2Client";
import crypto from "crypto";

export interface UploadResult {
  success: boolean;
  key?:    string;
  url?:    string;
  error?:  string;
}

export type StorageFolder =
  | "activities"
  | "featured-posts"
  | "profiles"
  | "volunteer-spotlight"
  | "magazines"
  | "certificates";

class R2StorageService {
  private bucketName: string;
  private publicUrl:  string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || "volunteer-platform";
    this.publicUrl  = process.env.R2_PUBLIC_URL  || "";
    if (!this.publicUrl) throw new Error("R2_PUBLIC_URL not configured");
  }

  async upload(fileBuffer: Buffer, folder: StorageFolder, originalFileName: string): Promise<UploadResult> {
    try {
      const client    = R2Client.getInstance();
      const extension = this.extractExtension(originalFileName);
      const key       = `${folder}/${this.generateUniqueFileName(extension)}`;

      await client.send(new PutObjectCommand({
        Bucket:       this.bucketName,
        Key:          key,
        Body:         fileBuffer,
        ContentType:  this.getContentType(extension),
        CacheControl: "public, max-age=31536000, immutable",
      }));

      return { success: true, key, url: `${this.publicUrl}/${key}` };
    } catch (error) {
      console.error("R2 upload error:", error);
      return { success: false, error: "فشل رفع الملف إلى التخزين" };
    }
  }

  async getPresignedDownloadUrl(key: string, expiresIn = 120): Promise<string> {
    return getSignedUrl(
      R2Client.getInstance(),
      new GetObjectCommand({
        Bucket:                     this.bucketName,
        Key:                        key,
        ResponseContentDisposition: "attachment",
      }),
      { expiresIn }
    );
  }

  async getPresignedUploadUrl(folder: StorageFolder, fileName: string, contentType: string) {
    const key = `${folder}/${this.generateUniqueFileName(this.extractExtension(fileName))}`;
    const url = await getSignedUrl(
      R2Client.getInstance(),
      new PutObjectCommand({ Bucket: this.bucketName, Key: key, ContentType: contentType }),
      { expiresIn: 300 }
    );
    return { url, key };
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);
      if (!key) return false;
      await R2Client.getInstance().send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
      return true;
    } catch (error) {
      console.error("R2 delete error:", error);
      return false;
    }
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      if (!url.startsWith(this.publicUrl)) return null;
      return new URL(url).pathname.substring(1) || null;
    } catch {
      return null;
    }
  }

  extractKey(url: string): string | null {
    return this.extractKeyFromUrl(url);
  }

  private extractExtension(fileName: string): string {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "jpg";
  }

  private generateUniqueFileName(extension: string): string {
    return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  }

  private getContentType(extension: string): string {
    const map: Record<string, string> = {
      jpg:  "image/jpeg",
      jpeg: "image/jpeg",
      png:  "image/png",
      gif:  "image/gif",
      webp: "image/webp",
      svg:  "image/svg+xml",
      pdf:  "application/pdf",
    };
    return map[extension] || "application/octet-stream";
  }
}

export default R2StorageService;