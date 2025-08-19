import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir = 'uploads';

  constructor() {
    this.ensureUploadDirectories();
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

    // Extract the actual file path from URL if it's a full URL
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
}
