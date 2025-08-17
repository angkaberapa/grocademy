import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Module } from '../module/module.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { CourseTopic } from './course-topic.entity';

const DecimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => parseFloat(value)
};


@Entity('courses')
export class Course {
  @ApiProperty({ description: 'Course unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Course title', example: 'Introduction to TypeScript' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Course description', example: 'Learn TypeScript from basics to advanced' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Course instructor full name', example: 'John Smith' })
  @Column()
  instructor: string;

  @ApiProperty({ description: 'Course price', example: 99.99 })
  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2,
    transformer: DecimalTransformer
  })
  price: number;

  @ApiProperty({ 
    description: 'Course thumbnail image file path (stored in object storage)', 
    example: '/uploads/courses/thumbnails/course-123-thumbnail.jpg',
    nullable: true 
  })
  @Column({ nullable: true })
  thumbnail_image: string;

  @ApiProperty({ description: 'Course creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Module, module => module.course)
  modules: Module[];

  @OneToMany(() => UserCourse, userCourse => userCourse.course)
  userCourses: UserCourse[];

  @OneToMany(() => CourseTopic, courseTopic => courseTopic.course)
  topics: CourseTopic[];
}
