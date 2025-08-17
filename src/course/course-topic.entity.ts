import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from './course.entity';

@Entity('course_topics')
export class CourseTopic {
  @ApiProperty({ description: 'Topic unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Course ID' })
  @Column()
  course_id: string;

  @ApiProperty({ description: 'Topic name', example: 'TypeScript' })
  @Column()
  topic: string;

  // Relations
  @ManyToOne(() => Course, course => course.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
