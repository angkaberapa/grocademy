import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.entity';
import { Module } from '../module/module.entity';

@Entity('user_module_progress')
export class UserModuleProgress {
  @ApiProperty({ description: 'User ID' })
  @PrimaryColumn()
  user_id: string;

  @ApiProperty({ description: 'Module ID' })
  @PrimaryColumn()
  module_id: string;

  @ApiProperty({ description: 'Whether the module is completed', default: false })
  @Column({ default: false })
  is_completed: boolean;

  @ApiProperty({ description: 'Module completion timestamp', nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.moduleProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Module, module => module.userProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;
}
