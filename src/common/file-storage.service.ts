import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { R2StorageService } from './r2-storage.service';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir = 'uploads';
  private readonly useR2: boolean;
  private r2StorageService: R2StorageService | null = null;

  constructor() {
    // Check if R2 is configured
    this.useR2 = this.isR2Configured();
    
    if (this.useR2) {
      try {
        this.r2StorageService = new R2StorageService();
        this.logger.log('Using Cloudflare R2 for file storage');
      } catch (error) {
        this.logger.warn('Failed to initialize R2 storage, falling back to local storage', error.message);
        this.useR2 = false;
      }
    }

    if (!this.useR2) {
      this.logger.log('Using local file storage');
      this.ensureUploadDirectories();
    }
  }

  private isR2Configured(): boolean {
    return !!(
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_ENDPOINT &&
      process.env.R2_PUBLIC_URL
    );
  }

  private async ensureUploadDirectories() {
    const directories = [
      'uploads/courses/thumbnails',
      'uploads/modules/pdfs',
      'uploads/modules/videos',
      'uploads/certificates',
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        this.logger.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  /**
   * Save uploaded file and return the full URL
   */
  async saveFile(file: any, category: 'thumbnail' | 'pdf' | 'video'): Promise<string> {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    
    let subDir: string;
    switch (category) {
      case 'thumbnail':
        subDir = 'courses/thumbnails';
        break;
      case 'pdf':
        subDir = 'modules/pdfs';
        break;
      case 'video':
        subDir = 'modules/videos';
        break;
    }

    if (this.useR2 && this.r2StorageService) {
      // Use R2 storage
      const key = `${subDir}/${filename}`;
      try {
        return await this.r2StorageService.uploadFile(file, key);
      } catch (error) {
        this.logger.error('Failed to upload to R2, falling back to local storage', error);
        // Fall back to local storage on error
      }
    }

    // Use local storage (fallback or default)
    const filePath = join(this.uploadDir, subDir, filename);
    
    try {
      await fs.writeFile(filePath, file.buffer);
      
      // Return full URL instead of just path
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      return `${baseUrl}/${filePath}`;
    } catch (error) {
      this.logger.error(`Failed to save file ${filePath}:`, error);
      throw new Error('Failed to save file');
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    if (!filePath) return;

    if (this.useR2 && this.r2StorageService && this.isR2Url(filePath)) {
      // Delete from R2
      try {
        await this.r2StorageService.deleteFile(filePath);
        return;
      } catch (error) {
        this.logger.warn('Failed to delete from R2', error.message);
      }
    }

    // Delete from local storage
    let cleanPath = filePath;
    
    // If it's a full URL (contains http), extract just the file path
    if (filePath.includes('http')) {
      const url = new URL(filePath);
      cleanPath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    } else {
      // Remove leading slash if present
      cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    }
    
    try {
      await fs.unlink(cleanPath);
      this.logger.log(`Deleted file: ${cleanPath}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file ${cleanPath}:`, error.message);
    }
  }

  /**
   * Check if a URL is an R2 URL
   */
  private isR2Url(url: string): boolean {
    if (!process.env.R2_PUBLIC_URL) return false;
    return url.includes(process.env.R2_PUBLIC_URL) || url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com');
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map(path => this.deleteFile(path)));
  }

  /**
   * Delete course thumbnail and all related module files
   */
  async deleteCourseMediaFiles(thumbnailPath: string | null, modulePaths: { pdf?: string, video?: string }[]): Promise<void> {
    const filesToDelete: string[] = [];

    // Add thumbnail if exists
    if (thumbnailPath) {
      filesToDelete.push(thumbnailPath);
    }

    // Add all module files
    modulePaths.forEach(paths => {
      if (paths.pdf) filesToDelete.push(paths.pdf);
      if (paths.video) filesToDelete.push(paths.video);
    });

    // Delete all files
    if (filesToDelete.length > 0) {
      await this.deleteFiles(filesToDelete);
      this.logger.log(`Deleted ${filesToDelete.length} media files for course`);
    }
  }

  /**
   * Delete module media files (PDF and video)
   */
  async deleteModuleMediaFiles(pdfPath: string | null, videoPath: string | null): Promise<void> {
    const filesToDelete: string[] = [];

    if (pdfPath) filesToDelete.push(pdfPath);
    if (videoPath) filesToDelete.push(videoPath);

    if (filesToDelete.length > 0) {
      await this.deleteFiles(filesToDelete);
      this.logger.log(`Deleted ${filesToDelete.length} media files for module`);
    }
  }

  /**
   * Test storage connection
   */
  async testConnection(): Promise<{ storage: string; status: boolean }> {
    if (this.useR2 && this.r2StorageService) {
      const status = await this.r2StorageService.testConnection();
      return { storage: 'R2', status };
    }
    
    return { storage: 'Local', status: true };
  }
}
