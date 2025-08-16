import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UserCourse } from 'src/user-courses/user-courses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCourse])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService] 
})
export class UsersModule {}
