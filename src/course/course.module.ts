import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseTopic } from './course-topic.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { User } from '../users/users.entity';
import { FileStorageService } from '../common/file-storage.service';
import { UserModuleProgress } from 'src/user-module-progress/user-module-progress.entity';
import { Module as ModuleEntity } from '../module/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseTopic, UserCourse, User, UserModuleProgress, ModuleEntity])],
  providers: [CourseService, FileStorageService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
