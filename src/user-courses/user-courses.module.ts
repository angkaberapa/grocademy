import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCoursesService } from './user-courses.service';
import { UserCourse } from './user-courses.entity';
import { Module as ModuleEntity } from '../module/module.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCourse, ModuleEntity, UserModuleProgress])],
  providers: [UserCoursesService],
  exports: [UserCoursesService],
})
export class UserCoursesModule {}
