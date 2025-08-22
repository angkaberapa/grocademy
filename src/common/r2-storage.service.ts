import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;

    if (!this.bucketName || !this.publicUrl) {
      throw new Error('R2 configuration missing. Please set R2_BUCKET_NAME and R2_PUBLIC_URL environment variables.');
    }

    this.s3Client = new S3Client({
      region: process.env.R2_REGION || 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Required for R2
    });

    this.logger.log(`Initialized R2 storage with bucket: ${this.bucketName}`);
  }

  /**
   * Upload file to R2 bucket
   */
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      });

      await this.s3Client.send(command);
      
      // Return public URL
      const publicUrl = `${this.publicUrl}/${key}`;
      this.logger.log(`Successfully uploaded file to R2: ${key}`);
      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file to R2: ${key}`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete file from R2 bucket
   */
  async deleteFile(key: string): Promise<void> {
    if (!key) return;

    try {
      // Extract key from URL if it's a full URL
      const cleanKey = this.extractKeyFromUrl(key);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: cleanKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file from R2: ${cleanKey}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file from R2: ${key}`, error.message);
      // Don't throw error for deletion failures to avoid breaking the application
    }
  }

  /**
   * Delete multiple files from R2 bucket
   */
  async deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.deleteFile(key)));
  }

  /**
   * Generate a presigned URL for temporary access
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for: ${key}`, error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Extract the object key from a full R2 URL
   */
  private extractKeyFromUrl(urlOrKey: string): string {
    if (!urlOrKey.includes('http')) {
      // Already a key, return as-is
      return urlOrKey;
    }

    try {
      const url = new URL(urlOrKey);
      // Remove leading slash
      return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    } catch {
      // If URL parsing fails, assume it's already a key
      return urlOrKey;
    }
  }

  /**
   * Check if R2 storage is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_ENDPOINT &&
      process.env.R2_PUBLIC_URL
    );
  }

  /**
   * Test R2 connection by attempting to list bucket contents
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to perform a simple operation to test connectivity
      const testKey = `test/connection-test-${Date.now()}.txt`;
      const testFile = {
        buffer: Buffer.from('connection test'),
        mimetype: 'text/plain',
        size: 15,
      } as Express.Multer.File;

      const url = await this.uploadFile(testFile, testKey);
      await this.deleteFile(testKey);
      
      this.logger.log('R2 connection test successful');
      return true;
    } catch (error) {
      this.logger.error('R2 connection test failed', error);
      return false;
    }
  }
}
