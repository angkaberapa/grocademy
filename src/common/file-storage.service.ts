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
   * Save uploaded file and return the file path
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
      return `/${filePath}`;
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

    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
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
   * Delete all media files associated with a course
   */
  async deleteCourseMedia(courseId: string): Promise<void> {
    // This would typically query the database to find all associated files
    // For now, this is a placeholder for the implementation
    this.logger.log(`Cleaning up media files for course: ${courseId}`);
  }

  /**
   * Delete all media files associated with a module
   */
  async deleteModuleMedia(moduleId: string): Promise<void> {
    // This would typically query the database to find all associated files
    // For now, this is a placeholder for the implementation
    this.logger.log(`Cleaning up media files for module: ${moduleId}`);
  }
}
