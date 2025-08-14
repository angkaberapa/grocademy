import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './module.entity';
import { FileStorageService } from '../common/file-storage.service';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    private fileStorageService: FileStorageService,
  ) {}

  async findAll(): Promise<Module[]> {
    return this.moduleRepository.find({
      relations: ['course', 'userProgress'],
      order: { order: 'ASC' },
    });
  }

  async findByCourse(courseId: string): Promise<Module[]> {
    return this.moduleRepository.find({
      where: { course_id: courseId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['course', 'userProgress'],
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async create(moduleData: Partial<Module>): Promise<Module> {
    const module = this.moduleRepository.create(moduleData);
    return this.moduleRepository.save(module);
  }

  async update(id: string, moduleData: Partial<Module>): Promise<Module> {
    const module = await this.findOne(id);
    const oldPdf = module.pdf_content;
    const oldVideo = module.video_content;

    Object.assign(module, moduleData);
    const updatedModule = await this.moduleRepository.save(module);

    // Clean up old files if they were replaced
    const filesToDelete: string[] = [];
    if (moduleData.pdf_content && oldPdf && oldPdf !== moduleData.pdf_content) {
      filesToDelete.push(oldPdf);
    }
    if (moduleData.video_content && oldVideo && oldVideo !== moduleData.video_content) {
      filesToDelete.push(oldVideo);
    }

    if (filesToDelete.length > 0) {
      await this.fileStorageService.deleteFiles(filesToDelete);
    }

    return updatedModule;
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    
    // Clean up media files
    const filesToDelete: string[] = [];
    if (module.pdf_content) filesToDelete.push(module.pdf_content);
    if (module.video_content) filesToDelete.push(module.video_content);
    
    if (filesToDelete.length > 0) {
      await this.fileStorageService.deleteFiles(filesToDelete);
    }
    
    await this.moduleRepository.remove(module);
  }
}
