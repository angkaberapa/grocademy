import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCoursesService } from './user-courses.service';
import { UserCourse } from './user-courses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCourse])],
  providers: [UserCoursesService],
  exports: [UserCoursesService],
})
export class UserCoursesModule {}
