import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/users.entity';
import { Course } from '../../course/course.entity';
import { CourseTopic } from '../../course/course-topic.entity';
import { Module as ModuleEntity } from '../../module/module.entity';
import { UserSeeder } from './user.seeder';
import { CourseSeeder } from './course.seeder';
import { ModuleSeeder } from './module.seeder';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Course,
      CourseTopic,
      ModuleEntity,
    ]),
  ],
  providers: [
    UserSeeder,
    CourseSeeder,
    ModuleSeeder,
    DatabaseSeeder,
  ],
  exports: [DatabaseSeeder],
})
export class SeederModule {}
