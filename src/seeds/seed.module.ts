import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Course } from '../course/course.entity';
import { CourseTopic } from '../course/course-topic.entity';
import { Module as LessonModule } from '../module/module.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Course,
      CourseTopic,
      LessonModule,
      UserCourse,
      UserModuleProgress,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
