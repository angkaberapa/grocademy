import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModuleProgressService } from './user-module-progress.service';
import { UserModuleProgress } from './user-module-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserModuleProgress])],
  providers: [UserModuleProgressService],
  exports: [UserModuleProgressService],
})
export class UserModuleProgressModule {}
