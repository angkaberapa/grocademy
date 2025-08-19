import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { join } from 'path';

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

  async generateCertificate(data: CertificateData): Promise<string> {
    const fileName = `certificate-${data.userId}-${data.courseId}.pdf`;
    const fileDir = join(process.cwd(), 'uploads', 'certificates');
    const filePath = join(fileDir, fileName);

    // Ensure the directory exists
    await fs.mkdir(fileDir, { recursive: true });

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
    });

    doc.pipe(createWriteStream(filePath));

    // --- Your existing design ---
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

    // Return the public URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${baseUrl}/uploads/certificates/${fileName}`;
  }
}