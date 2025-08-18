import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Module } from './module.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';
import { Course } from '../course/course.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { User, UserRole } from '../users/users.entity';
import { FileStorageService } from '../common/file-storage.service';
import {
  CreateUpdateModuleBodyDto,
  ReorderModuleBodyDto,
} from './dto/body.dto';
import {
  CreateUpdateModuleResponseDto,
  GetAllCourseModulesResponseDto,
  GetCourseModuleResponseDto,
  ReorderModuleResponseDto,
  CompleteModuleResponseDto,
  ModuleDataDto,
  UserModuleProgressDataDto,
  UserModuleCompletedDataDto,
} from './dto/response.dto';
import { GetAllCoursesQueryDto } from '../course/dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(UserModuleProgress)
    private userModuleProgressRepository: Repository<UserModuleProgress>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserCourse)
    private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private fileStorageService: FileStorageService,
  ) {}

  async createModule(
    courseId: string,
    createModuleDto: CreateUpdateModuleBodyDto,
    pdfFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<CreateUpdateModuleResponseDto> {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get the next order number for this course
    const lastModule = await this.moduleRepository.findOne({
      where: { course_id: courseId },
      order: { order: 'DESC' },
    });

    const nextOrder = lastModule ? lastModule.order + 1 : 1;

    // Handle file uploads
    let pdfPath: string | null = null;
    let videoPath: string | null = null;

    if (pdfFile) {
      pdfPath = await this.fileStorageService.saveFile(pdfFile, 'pdf');
    }

    if (videoFile) {
      videoPath = await this.fileStorageService.saveFile(videoFile, 'video');
    }

    // Create the module
    const moduleData = {
      course_id: courseId,
      title: createModuleDto.title,
      description: createModuleDto.description,
      order: nextOrder,
      ...(pdfPath && { pdf_content: pdfPath }),
      ...(videoPath && { video_content: videoPath }),
    };

    const module = this.moduleRepository.create(moduleData);
    const savedModule = await this.moduleRepository.save(module);

    return {
      status: 'success',
      message: 'Module created successfully',
      data: this.formatModuleResponse(savedModule),
    };
  }

  async getAllCourseModules(
    courseId: string,
    userId: string,
    query: GetAllCoursesQueryDto,
  ): Promise<GetAllCourseModulesResponseDto> {
    // Check if user has access to this course (admin or purchased)
    const hasAccess = await this.checkCourseAccess(userId, courseId);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied. You must purchase this course to view its modules.');
    }

    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '15', 10), 50);
    const skip = (page - 1) * limit;

    // Get modules for this course with pagination, ordered by order
    const [modules, total] = await this.moduleRepository.findAndCount({
      where: { course_id: courseId },
      order: { order: 'ASC' },
      skip,
      take: limit,
    });

    // Get user progress for these modules
    const moduleIds = modules.map(m => m.id);
    const userProgressList = await this.userModuleProgressRepository.find({
      where: {
        user_id: userId,
        module_id: In(moduleIds),
      },
    });

    // Create a map of module progress
    const progressMap = new Map<string, boolean>();
    userProgressList.forEach(progress => {
      progressMap.set(progress.module_id, progress.is_completed);
    });

    // Format response with user progress
    const formattedModules = modules.map(module => ({
      ...this.formatModuleResponse(module),
      is_completed: progressMap.get(module.id) || false,
    }));

    return {
      status: 'success',
      message: 'Course modules retrieved successfully',
      data: formattedModules,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async getModuleById(
    moduleId: string,
    userId: string,
  ): Promise<GetCourseModuleResponseDto> {
    // Get module with course info
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check if user has access to this course (admin or purchased)
    const hasAccess = await this.checkCourseAccess(userId, module.course_id);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied. You must purchase this course to view this module.');
    }

    // Get user progress for this module
    const userProgress = await this.userModuleProgressRepository.findOne({
      where: {
        user_id: userId,
        module_id: moduleId,
      },
    });

    const moduleData: UserModuleProgressDataDto = {
      ...this.formatModuleResponse(module),
      is_completed: userProgress?.is_completed || false,
    };

    return {
      status: 'success',
      message: 'Module retrieved successfully',
      data: moduleData,
    };
  }

  async updateModule(
    moduleId: string,
    updateModuleDto: CreateUpdateModuleBodyDto,
    pdfFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<CreateUpdateModuleResponseDto> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Handle file uploads
    let pdfPath: string | null = module.pdf_content;
    let videoPath: string | null = module.video_content;

    if (pdfFile) {
      pdfPath = await this.fileStorageService.saveFile(pdfFile, 'pdf');
    }

    if (videoFile) {
      videoPath = await this.fileStorageService.saveFile(videoFile, 'video');
    }

    // Update module
    await this.moduleRepository.update(moduleId, {
      title: updateModuleDto.title,
      description: updateModuleDto.description,
      pdf_content: pdfPath,
      video_content: videoPath,
    });

    const updatedModule = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    return {
      status: 'success',
      message: 'Module updated successfully',
      data: this.formatModuleResponse(updatedModule!),
    };
  }

  async deleteModule(moduleId: string): Promise<void> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    await this.moduleRepository.delete(moduleId);
  }

  async reorderModules(
    courseId: string,
    reorderDto: ReorderModuleBodyDto,
  ): Promise<ReorderModuleResponseDto> {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Verify all modules belong to this course
    const moduleIds = reorderDto.module_order.map(item => item.id);
    const modules = await this.moduleRepository.find({
      where: {
        id: In(moduleIds),
        course_id: courseId,
      },
    });

    if (modules.length !== moduleIds.length) {
      throw new BadRequestException('Some modules do not belong to this course or are incomplete');
    }

    // Update module orders
    await Promise.all(
      reorderDto.module_order.map(orderItem =>
      this.moduleRepository.update(orderItem.id, {
        order: orderItem.order,
      })
      )
    );

    return {
      status: 'success',
      message: 'Module order updated successfully',
      data: {
        module_order: reorderDto.module_order,
      },
    };
  }

  async completeModule(
    moduleId: string,
    userId: string,
  ): Promise<CompleteModuleResponseDto> {
    // Get module with course info
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check if user has access to this course (admin or purchased)
    const hasAccess = await this.checkCourseAccess(userId, module.course_id);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied. You must purchase this course to complete this module.');
    }

    // Create or update user progress
    const existingProgress = await this.userModuleProgressRepository.findOne({
      where: {
        user_id: userId,
        module_id: moduleId,
      },
    });

    if (existingProgress) {
      if (!existingProgress.is_completed) {
        existingProgress.is_completed = true;
        existingProgress.completed_at = new Date();
        await this.userModuleProgressRepository.save(existingProgress);
      }
    } else {
      const newProgress = this.userModuleProgressRepository.create({
        user_id: userId,
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date(),
      });
      await this.userModuleProgressRepository.save(newProgress);
    }

    // Calculate course progress
    const totalModules = await this.moduleRepository.count({
      where: { course_id: module.course_id },
    });

    const completedModules = await this.userModuleProgressRepository.count({
      where: {
        user_id: userId,
        module: { course_id: module.course_id },
        is_completed: true,
      },
    });

    const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    // TODO: Implement certificate pdf generation
    const certificateUrl = percentage === 100 ? null : null;

    const responseData: UserModuleCompletedDataDto = {
      module_id: moduleId,
      is_completed: true,
      course_progress: {
        total_modules: totalModules,
        completed_modules: completedModules,
        percentage,
      },
      certificate_url: certificateUrl,
    };

    return {
      status: 'success',
      message: 'Module completed successfully',
      data: responseData,
    };
  }

  private async checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
    // Check if user is admin
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user && user.role === UserRole.ADMIN) {
      return true; // Admin has access to all courses
    }

    // Check if user has purchased the course
    const userCourse = await this.userCourseRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
    });

    return !!userCourse; // Return true if user course exists
  }

  private formatModuleResponse(module: Module): ModuleDataDto {
    return {
      id: module.id,
      course_id: module.course_id,
      title: module.title,
      description: module.description,
      order: module.order,
      pdf_content: module.pdf_content,
      video_content: module.video_content,
      created_at: module.created_at.toISOString(),
      updated_at: module.updated_at.toISOString(),
    };
  }
}
