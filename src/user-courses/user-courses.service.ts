import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCourse } from './user-courses.entity';
import { Module } from '../module/module.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';

@Injectable()
export class UserCoursesService {
  constructor(
    @InjectRepository(UserCourse)
    private userCoursesRepository: Repository<UserCourse>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(UserModuleProgress)
    private userModuleProgressRepository: Repository<UserModuleProgress>,
  ) {}

  async findAll(): Promise<UserCourse[]> {
    return this.userCoursesRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findByUser(userId: string): Promise<UserCourse[]> {
    return this.userCoursesRepository.find({
      where: { user_id: userId },
      relations: ['course'],
    });
  }

  async findByCourse(courseId: string): Promise<UserCourse[]> {
    return this.userCoursesRepository.find({
      where: { course_id: courseId },
      relations: ['user'],
    });
  }

  async findOne(transactionId: string): Promise<UserCourse> {
    const userCourse = await this.userCoursesRepository.findOne({
      where: { transaction_id: transactionId },
      relations: ['user', 'course'],
    });
    if (!userCourse) {
      throw new NotFoundException(`User course with transaction ID ${transactionId} not found`);
    }
    return userCourse;
  }

  async purchaseCourse(userId: string, courseId: string): Promise<UserCourse> {
    const userCourse = this.userCoursesRepository.create({
      user_id: userId,
      course_id: courseId,
    });
    return this.userCoursesRepository.save(userCourse);
  }

  async completeCourse(transactionId: string): Promise<UserCourse> {
    const userCourse = await this.findOne(transactionId);
    userCourse.completed_at = new Date();
    return this.userCoursesRepository.save(userCourse);
  }

  async buyStatus(courseId: string, userId: string): Promise<{ 
    owns_course: boolean; 
    transaction_id?: string; 
    progress_percentage?: number;
    is_completed?: boolean;
  }> {
    const userCourse = await this.userCoursesRepository.findOne({
      where: { 
        user_id: userId,
        course_id: courseId 
      },
    });
    
    if (!userCourse) {
      return { owns_course: false };
    }

    // Calculate progress if user owns the course
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

    const progressPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0;

    const isCompleted = progressPercentage === 100;
    
    return {
      owns_course: true,
      transaction_id: userCourse.transaction_id,
      progress_percentage: progressPercentage,
      is_completed: isCompleted
    };
  }

  async remove(transactionId: string): Promise<void> {
    const userCourse = await this.findOne(transactionId);
    await this.userCoursesRepository.remove(userCourse);
  }
}
