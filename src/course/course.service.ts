import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Course } from './course.entity';
import { CourseTopic } from './course-topic.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { User } from '../users/users.entity';
import { Module } from '../module/module.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';
import { FileStorageService } from '../common/file-storage.service';
import {
  CreateCourseBodyDto,
  CreateCourseResponseDto,
  CreateCourseDataDto,
  GetAllCoursesQueryDto,
  GetAllCoursesResponseDto,
  GetAllCourseItemDto,
  GetCourseByIdResponseDto,
  GetCourseByIdDataDto,
  UpdateCourseBodyDto,
  UpdateCourseResponseDto,
  GetUserCoursesQueryDto,
  GetUserCoursesResponseDto,
  GetUserCourseItemDto,
  BuyCourseResponseDto,
} from './dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
    @InjectRepository(UserCourse)
    private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserModuleProgress)
    private userModuleProgressRepository: Repository<UserModuleProgress>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    private fileStorageService: FileStorageService,
  ) {}

  async create(
    createCourseDto: CreateCourseBodyDto,
    thumbnailPath?: string,
  ): Promise<CreateCourseResponseDto> {
    // Create course
    const course = this.courseRepository.create({
      title: createCourseDto.title,
      description: createCourseDto.description,
      instructor: createCourseDto.instructor,
      price: createCourseDto.price,
      ...(thumbnailPath && { thumbnail_image: thumbnailPath }),
    });

    const savedCourse = await this.courseRepository.save(course);

    // Create course topics
    const courseTopics = createCourseDto.topics.map(topic =>
      this.courseTopicRepository.create({
        course_id: savedCourse.id,
        topic: topic.trim(),
      }),
    );

    await this.courseTopicRepository.save(courseTopics);
    
    const courseData : CreateCourseDataDto = {
      id: savedCourse.id,
      title: savedCourse.title,
      description: savedCourse.description,
      instructor: savedCourse.instructor,
      topics: createCourseDto.topics,
      price: savedCourse.price,
      thumbnail_image: savedCourse.thumbnail_image,
      created_at: savedCourse.created_at.toISOString(),
      updated_at: savedCourse.updated_at.toISOString(),
    };

    return {
      status: 'success',
      message: 'Course created successfully',
      data: courseData,
    };
  }

  async findAll(query: GetAllCoursesQueryDto): Promise<GetAllCoursesResponseDto> {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '15', 10), 50); 
    const skip = (page - 1) * limit;

    // Build where conditions for search
    let whereConditions: any = {};
    
    if (query.q) {
      const searchPattern = `%${query.q}%`;

      const [directMatches, topicMatches] = await Promise.all([
        this.courseRepository.find({
          where: [
            { title: Like(searchPattern) },
            { instructor: Like(searchPattern) },
          ],
          select: ['id'],
        }),
        this.courseTopicRepository.find({
          where: { topic: Like(searchPattern) },
          select: ['course_id'],
        })
      ]);

      const allCourseIds = new Set([
        ...directMatches.map(c => c.id),
        ...topicMatches.map(t => t.course_id),
      ]);

      if (allCourseIds.size > 0) {
        whereConditions = { id: In([...allCourseIds]) };
      } else {
        return {
          status: 'success',
          message: 'No courses found',
          data: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_items: 0,
          },
        };
      }
    }

    const [courses, total] = await this.courseRepository.findAndCount({
      where: whereConditions,
      relations: ['topics', 'modules'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const formattedCourses = courses.map(course => this.formatCourseListResponse(course));

    return {
      status: 'success',
      message: 'Courses retrieved successfully',
      data: formattedCourses,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async findById(id: string): Promise<GetCourseByIdResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['topics', 'modules'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      status: 'success',
      message: 'Course retrieved successfully',
      data: this.formatCourseDetailResponse(course),
    };
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseBodyDto,
    thumbnailPath?: string,
  ): Promise<UpdateCourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['topics'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Store old thumbnail path for cleanup if a new one is provided
    const oldThumbnailPath = course.thumbnail_image;

    // Update course fields
    course.title = updateCourseDto.title;
    course.description = updateCourseDto.description;
    course.instructor = updateCourseDto.instructor;
    course.price = updateCourseDto.price;
    if(thumbnailPath !== undefined) course.thumbnail_image = thumbnailPath;

    await this.courseRepository.save(course);

    // Clean up old thumbnail if a new one was uploaded
    if (thumbnailPath && oldThumbnailPath && oldThumbnailPath !== thumbnailPath) {
      await this.fileStorageService.deleteFile(oldThumbnailPath);
    }

    // delete all old topics
    await this.courseTopicRepository.delete({ course_id: id });

    const courseTopics = updateCourseDto.topics.map(topic =>
      this.courseTopicRepository.create({
        course_id: id,
        topic: topic.trim(),
      }),
    );

    // insert all new topics
    await this.courseTopicRepository.save(courseTopics);

    const courseData : CreateCourseDataDto = {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      topics: updateCourseDto.topics,
      price: course.price,
      thumbnail_image: course.thumbnail_image,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString(),
    }

    return {
      status: 'success',
      message: 'Course updated successfully',
      data: courseData,
    };
  }

  async delete(id: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['modules'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Collect all media files to delete
    const modulePaths = course.modules.map(module => ({
      pdf: module.pdf_content,
      video: module.video_content,
    }));

    // Delete the course (this will cascade delete modules due to onDelete: 'CASCADE')
    await this.courseRepository.remove(course);

    // Clean up all media files after successful deletion
    await this.fileStorageService.deleteCourseMediaFiles(
      course.thumbnail_image,
      modulePaths
    );
  }

  async buyCourse(userId: string, courseId: string): Promise<BuyCourseResponseDto> {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already owns the course
    const existingUserCourse = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (existingUserCourse) {
      throw new BadRequestException('User already owns this course');
    }

    // Check if user has sufficient balance
    if (user.balance < course.price) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct price from user balance
    user.balance -= course.price;

    await this.userRepository.save(user);

    // Create user course relationship (transaction)
    const userCourse = this.userCourseRepository.create({
      user_id: userId,
      course_id: courseId,
      user,
      course,
    });

    const savedUserCourse = await this.userCourseRepository.save(userCourse);

    return {
      status: 'success',
      message: 'Course purchased successfully',
      data: {
        course_id: courseId,
        user_balance: user.balance,
        transaction_id: savedUserCourse.transaction_id,
      },
    };
  }

  async getUserCourses(userId: string, query: GetUserCoursesQueryDto): Promise<GetUserCoursesResponseDto> {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '15', 10), 50); 
    const skip = (page - 1) * limit;
  
    const whereConditions: any = { user: { id: userId } };
  
    if (query.q) {
      const searchPattern = `%${query.q}%`;
      
      const [directMatches, topicMatches] = await Promise.all([
        this.courseRepository.find({
          where: [
            { title: Like(searchPattern) },
            { instructor: Like(searchPattern) },
          ],
          select: ['id'],
        }),
        this.courseTopicRepository.find({
          where: { topic: Like(searchPattern) },
          select: ['course_id'],
        })
      ]);

      const allCourseIds = new Set([
        ...directMatches.map(c => c.id),
        ...topicMatches.map(t => t.course_id),
      ]);

      if (allCourseIds.size === 0) {
        return {
          status: 'success',
          message: 'No courses found',
          data: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_items: 0,
          },
        };
      }
  
      whereConditions.course = { id: In([...allCourseIds]) };
    }
  
    const [userCourses, total] = await this.userCourseRepository.findAndCount({
      where: whereConditions,
      relations: ['course', 'course.topics'],
      order: { purchased_at: 'DESC' },
      skip,
      take: limit,
    });
  
    const formattedCourses = await Promise.all(
      userCourses.map(userCourse => this.formatUserCourseResponse(userCourse))
    );
  
    return {
      status: 'success',
      message: 'User courses retrieved successfully',
      data: formattedCourses,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  private formatCourseListResponse(course: Course): GetAllCourseItemDto {
    return {
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      description: course.description,
      topics: course.topics ? course.topics.map(topic => topic.topic) : [],
      price: course.price,
      thumbnail_image: course.thumbnail_image,
      total_modules: course.modules ? course.modules.length : 0,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString(),
    };
  }

  private formatCourseDetailResponse(course: Course): GetCourseByIdDataDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      topics: course.topics ? course.topics.map(topic => topic.topic) : [],
      price: course.price,
      thumbnail_image: course.thumbnail_image,
      total_modules: course.modules ? course.modules.length : 0,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString(),
    };
  }

  private async formatUserCourseResponse(userCourse: UserCourse): Promise<GetUserCourseItemDto> {
    const courseId = userCourse.course.id;
    const userId = userCourse.user_id;
    const [totalModules, completedModules] = await Promise.all([
      this.moduleRepository.count({
        where: { course_id: courseId }
      }),
      this.userModuleProgressRepository.count({
        where: { 
          user_id: userId,
          module: { course_id: courseId },
          is_completed: true
        }
      })
    ]);

    // Calculate progress percentage
    const progressPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0;

    return {
      id: userCourse.course.id,
      title: userCourse.course.title,
      instructor: userCourse.course.instructor,
      topics: userCourse.course.topics ? userCourse.course.topics.map(topic => topic.topic) : [],
      thumbnail_image: userCourse.course.thumbnail_image,
      progress_percentage: progressPercentage,
      purchased_at: userCourse.purchased_at.toISOString(),
    };
  }
}
