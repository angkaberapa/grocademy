import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ description: 'User unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @Column()
  email: string;
  
  @ApiProperty({ description: 'User password' })
  @Column()
  password: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @Column()
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @Column()
  last_name: string;

  @ApiProperty({ description: 'Account balance', example: 1000, default: 0 })
  @Column({ default: 0 })
  balance: number;
}