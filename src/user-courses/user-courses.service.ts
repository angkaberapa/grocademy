import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCourse } from './user-courses.entity';

@Injectable()
export class UserCoursesService {
  constructor(
    @InjectRepository(UserCourse)
    private userCoursesRepository: Repository<UserCourse>,
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

  async remove(transactionId: string): Promise<void> {
    const userCourse = await this.findOne(transactionId);
    await this.userCoursesRepository.remove(userCourse);
  }
}
