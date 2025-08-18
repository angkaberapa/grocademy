import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { Module } from './module.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';
import { Course } from '../course/course.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { FileStorageService } from '../common/file-storage.service';

@NestModule({
  imports: [TypeOrmModule.forFeature([Module, UserModuleProgress, Course, UserCourse])],
  providers: [ModuleService, FileStorageService],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ModuleModule {}
