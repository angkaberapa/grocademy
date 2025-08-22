import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { R2StorageService } from './r2-storage.service';

export interface CertificateData {
  username: string;
  courseTitle: string;
  instructor: string;
  completionDate: Date; // Expects a formatted date string
  userId: string;
  courseId: string;
}

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly useR2: boolean;
  private r2StorageService: R2StorageService | null = null;

  constructor() {
    // Check if R2 is configured
    this.useR2 = this.isR2Configured();
    
    if (this.useR2) {
      try {
        this.r2StorageService = new R2StorageService();
        this.logger.log('Using Cloudflare R2 for certificate storage');
      } catch (error) {
        this.logger.warn('Failed to initialize R2 storage for certificates, falling back to local storage', error.message);
        this.useR2 = false;
      }
    }

    if (!this.useR2) {
      this.logger.log('Using local file storage for certificates');
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

  async generateCertificate(data: CertificateData): Promise<string> {
    const fileName = `certificate-${data.userId}-${data.courseId}.pdf`;
    
    // Create PDF document in memory
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
    });

    // Collect PDF data in memory
    const pdfBuffers: Buffer[] = [];
    doc.on('data', (chunk) => pdfBuffers.push(chunk));
    
    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(pdfBuffers);
          
          // Try to upload to R2 first, fallback to local
          if (this.useR2 && this.r2StorageService) {
            try {
              const key = `certificates/${fileName}`;
              const mockFile = {
                buffer: pdfBuffer,
                mimetype: 'application/pdf',
                size: pdfBuffer.length,
              } as Express.Multer.File;
              
              const url = await this.r2StorageService.uploadFile(mockFile, key);
              this.logger.log(`Certificate uploaded to R2: ${fileName}`);
              resolve(url);
              return;
            } catch (error) {
              this.logger.error('Failed to upload certificate to R2, falling back to local storage', error);
            }
          }

          // Fallback to local storage
          const fileDir = join(process.cwd(), 'uploads', 'certificates');
          const filePath = join(fileDir, fileName);

          // Ensure the directory exists
          await fs.mkdir(fileDir, { recursive: true });
          await fs.writeFile(filePath, pdfBuffer);

          // Return the public URL
          const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
          const url = `${baseUrl}/uploads/certificates/${fileName}`;
          this.logger.log(`Certificate saved locally: ${fileName}`);
          resolve(url);
        } catch (error) {
          this.logger.error('Failed to save certificate', error);
          reject(new Error('Failed to generate certificate'));
        }
      });

      doc.on('error', (error) => {
        this.logger.error('PDF generation error', error);
        reject(new Error('Failed to generate PDF'));
      });

      // --- Generate PDF content ---
      const logoPath = join(process.cwd(), 'public', 'logo.png');
      try {
        doc.image(logoPath, {
          fit: [100, 100],
          align: 'center',
          valign: 'center'
        });
      } catch (error) {
        this.logger.warn('Logo image not found or failed to load. Skipping.', error);
      }

      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(32).fillColor('black').text('Certificate of Completion', { align: 'center' });
      doc.moveDown(1.5);
      doc.font('Helvetica').fontSize(18).text('This is to certify that', { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#4a86e8').text(data.username, { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica').fontSize(18).fillColor('black').text('has successfully completed the course', { align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(22).text(data.courseTitle, { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(16).font('Helvetica').text(`Taught by `, { continued: true }).font('Helvetica-Bold').text(data.instructor);
      doc.moveDown(0.5);

      const date = data.completionDate;
      const day = date.getDate();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;

      doc.font('Helvetica').text(`Completed on `, { continued: true }).font('Helvetica-Bold').text(formattedDate);

      doc.end();
    });
  }

  /**
   * Delete certificate from storage
   */
  async deleteCertificate(userId: string, courseId: string): Promise<void> {
    const fileName = `certificate-${userId}-${courseId}.pdf`;
    
    if (this.useR2 && this.r2StorageService) {
      try {
        const key = `certificates/${fileName}`;
        await this.r2StorageService.deleteFile(key);
        this.logger.log(`Certificate deleted from R2: ${fileName}`);
        return;
      } catch (error) {
        this.logger.warn('Failed to delete certificate from R2', error.message);
      }
    }

    // Delete from local storage (fallback or default)
    try {
      const fileDir = join(process.cwd(), 'uploads', 'certificates');
      const filePath = join(fileDir, fileName);
      await fs.unlink(filePath);
      this.logger.log(`Certificate deleted locally: ${fileName}`);
    } catch (error) {
      this.logger.warn(`Failed to delete local certificate: ${fileName}`, error.message);
    }
  }

  /**
   * Test certificate storage connection
   */
  async testConnection(): Promise<{ storage: string; status: boolean }> {
    if (this.useR2 && this.r2StorageService) {
      const status = await this.r2StorageService.testConnection();
      return { storage: 'R2', status };
    }
    
    return { storage: 'Local', status: true };
  }
}