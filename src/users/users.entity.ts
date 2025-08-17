import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserCourse } from '../user-courses/user-courses.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';

const DecimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => parseFloat(value)
};

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'User unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @Column({ unique: true })
  email: string;
  
  @ApiProperty({ description: 'User password (hashed)' })
  @Column()
  password: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @Column()
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @Column()
  last_name: string;

  @ApiProperty({ description: 'Account balance', example: 1000, default: 0 })
  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0,
    transformer: DecimalTransformer
  })
  balance: number;

  @ApiProperty({ description: 'User role', enum: UserRole, default: UserRole.USER })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => UserCourse, userCourse => userCourse.user)
  userCourses: UserCourse[];

  @OneToMany(() => UserModuleProgress, userModuleProgress => userModuleProgress.user)
  moduleProgress: UserModuleProgress[];
}