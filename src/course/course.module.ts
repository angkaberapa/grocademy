import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseTopic } from './course-topic.entity';
import { FileStorageService } from '../common/file-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseTopic])],
  providers: [CourseService, FileStorageService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
