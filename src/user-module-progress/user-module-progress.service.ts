import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModuleProgress } from './user-module-progress.entity';

@Injectable()
export class UserModuleProgressService {
  constructor(
    @InjectRepository(UserModuleProgress)
    private userModuleProgressRepository: Repository<UserModuleProgress>,
  ) {}

  async findAll(): Promise<UserModuleProgress[]> {
    return this.userModuleProgressRepository.find({
      relations: ['user', 'module'],
    });
  }

  async findByUser(userId: string): Promise<UserModuleProgress[]> {
    return this.userModuleProgressRepository.find({
      where: { user_id: userId },
      relations: ['module'],
    });
  }

  async findByModule(moduleId: string): Promise<UserModuleProgress[]> {
    return this.userModuleProgressRepository.find({
      where: { module_id: moduleId },
      relations: ['user'],
    });
  }

  async findOne(userId: string, moduleId: string): Promise<UserModuleProgress> {
    const progress = await this.userModuleProgressRepository.findOne({
      where: { user_id: userId, module_id: moduleId },
      relations: ['user', 'module'],
    });
    if (!progress) {
      throw new NotFoundException(`Progress not found for user ${userId} and module ${moduleId}`);
    }
    return progress;
  }

  async createProgress(userId: string, moduleId: string): Promise<UserModuleProgress> {
    const progress = this.userModuleProgressRepository.create({
      user_id: userId,
      module_id: moduleId,
      is_completed: false,
    });
    return this.userModuleProgressRepository.save(progress);
  }

  async completeModule(userId: string, moduleId: string): Promise<UserModuleProgress> {
    let progress;
    try {
      progress = await this.findOne(userId, moduleId);
    } catch (error) {
      // Create progress if it doesn't exist
      progress = await this.createProgress(userId, moduleId);
    }
    
    progress.is_completed = true;
    progress.completed_at = new Date();
    return this.userModuleProgressRepository.save(progress);
  }

  async getUserProgress(userId: string, courseId: string): Promise<any> {
    const query = this.userModuleProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.module', 'module')
      .where('progress.user_id = :userId', { userId })
      .andWhere('module.course_id = :courseId', { courseId })
      .orderBy('module.order', 'ASC');

    const progress = await query.getMany();
    
    const totalModules = await this.userModuleProgressRepository
      .createQueryBuilder('progress')
      .leftJoin('progress.module', 'module')
      .where('module.course_id = :courseId', { courseId })
      .getCount();

    const completedModules = progress.filter(p => p.is_completed).length;

    return {
      progress,
      totalModules,
      completedModules,
      completionPercentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
    };
  }
}
