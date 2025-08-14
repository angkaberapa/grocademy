import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../course/course.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';

@Entity('modules')
export class Module {
  @ApiProperty({ description: 'Module unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Course ID this module belongs to' })
  @Column()
  course_id: string;

  @ApiProperty({ description: 'Module title', example: 'Variables and Data Types' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Module description', example: 'Learn about TypeScript variables and data types' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Module order in course', example: 1 })
  @Column()
  order: number;

  @ApiProperty({ 
    description: 'PDF content file path (stored in object storage)', 
    example: '/uploads/modules/pdfs/module-123-content.pdf',
    nullable: true 
  })
  @Column({ nullable: true })
  pdf_content: string;

  @ApiProperty({ 
    description: 'Video content file path (stored in object storage)', 
    example: '/uploads/modules/videos/module-123-video.mp4',
    nullable: true 
  })
  @Column({ nullable: true })
  video_content: string;

  @ApiProperty({ description: 'Module creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Course, course => course.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => UserModuleProgress, userModuleProgress => userModuleProgress.module)
  userProgress: UserModuleProgress[];
}
