import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { Module } from './module.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';
import { Course } from '../course/course.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { User } from '../users/users.entity';
import { FileStorageService } from '../common/file-storage.service';
import { CertificateService } from '../common/certificate.service';

@NestModule({
  imports: [TypeOrmModule.forFeature([Module, UserModuleProgress, Course, UserCourse, User])],
  providers: [ModuleService, FileStorageService, CertificateService],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ModuleModule {}
