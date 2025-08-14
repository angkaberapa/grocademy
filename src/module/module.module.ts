import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { Module } from './module.entity';
import { FileStorageService } from '../common/file-storage.service';

@NestModule({
  imports: [TypeOrmModule.forFeature([Module])],
  providers: [ModuleService, FileStorageService],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ModuleModule {}
