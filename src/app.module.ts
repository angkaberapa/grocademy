// src/app.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { Course } from './course/course.entity';
import { CourseTopic } from './course/course-topic.entity';
import { Module as LessonModule } from './module/module.entity';
import { UserCourse } from './user-courses/user-courses.entity';
import { UserModuleProgress } from './user-module-progress/user-module-progress.entity';
import { UsersModule } from './users/users.module';
import { CourseModule } from './course/course.module';
import { ModuleModule } from './module/module.module';
import { UserCoursesModule } from './user-courses/user-courses.module';
import { UserModuleProgressModule } from './user-module-progress/user-module-progress.module';
import { AuthModule } from './auth/auth.module';
import { SeederModule } from './database/seeders/seeder.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DatabaseSeeder } from './database/seeders/database.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: true,  // false kalau pakai migration
        entities: [User, Course, CourseTopic, LessonModule, UserCourse, UserModuleProgress],
        autoLoadEntities: true,
    }),
      inject: [ConfigService],
    }),
    UsersModule,
    CourseModule,
    ModuleModule,
    UserCoursesModule,
    UserModuleProgressModule,
    AuthModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  async onModuleInit() {
    // Only run seeder in development or if ENABLE_SEEDING is true
    const shouldSeed = process.env.NODE_ENV === 'development' || process.env.ENABLE_SEEDING === 'true';
    
    if (shouldSeed) {
      await this.databaseSeeder.seed();
    }
  }
}
