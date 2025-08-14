import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.entity';
import { Course } from '../course/course.entity';

@Entity('user_courses')
export class UserCourse {
  @ApiProperty({ description: 'Transaction unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @ApiProperty({ description: 'Course ID' })
  @Column()
  course_id: string;

  @ApiProperty({ description: 'User ID' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Course purchase timestamp' })
  @CreateDateColumn()
  purchased_at: Date;

  @ApiProperty({ description: 'Course completion timestamp', nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.userCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, course => course.userCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
