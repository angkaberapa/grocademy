import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsNumber, Min, ArrayMinSize } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseResponseDto } from 'src/common/dto/response.dto';

export class CreateCourseBodyDto {
  @ApiProperty({ description: 'Course title', example: 'Introduction to TypeScript' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Course description', example: 'Learn TypeScript from basics to advanced' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Course instructor', example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  instructor: string;

  @ApiProperty({ 
    description: 'Course topics', 
    example: ['TypeScript', 'Programming', 'Web Development'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(topic => topic.trim());
      }
    }
    return value;
  })
  topics: string[];

  @ApiProperty({ description: 'Course price', example: 99.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateCourseDataDto {
  @ApiProperty({ description: 'Course ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Course title', example: 'Introduction to TypeScript' })
  title: string;

  @ApiProperty({ description: 'Course description', example: 'Learn TypeScript from basics to advanced' })
  description: string;

  @ApiProperty({ description: 'Course instructor', example: 'John Smith' })
  instructor: string;

  @ApiProperty({ 
    description: 'Course topics', 
    example: ['TypeScript', 'Programming', 'Web Development']
  })
  topics: string[];

  @ApiProperty({ description: 'Course price', example: 99.99 })
  price: number;

  @ApiProperty({ description: 'Thumbnail image path', example: '/uploads/courses/thumbnails/course-123.jpg', nullable: true })
  thumbnail_image: string | null;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

export class CreateCourseResponseDto extends BaseResponseDto {
  @ApiProperty({ type: CreateCourseDataDto, nullable: true })
  data: CreateCourseDataDto | null;
}
