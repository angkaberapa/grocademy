import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class GetAllCoursesQueryDto {
  @ApiPropertyOptional({ description: 'Search query for course title, topic, or instructor', example: 'TypeScript' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: 15, default: 15, maximum: 50 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}

export class GetAllCourseItemDto {
  @ApiProperty({ description: 'Course ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Course title', example: 'Introduction to TypeScript' })
  title: string;

  @ApiProperty({ description: 'Course instructor', example: 'John Smith' })
  instructor: string;

  @ApiProperty({ description: 'Course description', example: 'Learn TypeScript from basics to advanced' })
  description: string;

  @ApiProperty({ 
    description: 'Course topics', 
    example: ['TypeScript', 'Programming', 'Web Development']
  })
  topics: string[];

  @ApiProperty({ description: 'Course price', example: 99.99 })
  price: number;

  @ApiProperty({ description: 'Thumbnail image path', example: '/uploads/courses/thumbnails/course-123.jpg', nullable: true })
  thumbnail_image: string | null;

  @ApiProperty({ description: 'Total number of modules', example: 12 })
  total_modules: number;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

export class GetAllCoursesPaginationDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  current_page: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  total_pages: number;

  @ApiProperty({ description: 'Total number of items', example: 50 })
  total_items: number;
}

export class GetAllCoursesResponseDto {
  @ApiProperty({ description: 'Response status', example: 'success' })
  status: string;

  @ApiProperty({ description: 'Response message', example: 'Courses retrieved successfully' })
  message: string;

  @ApiProperty({ type: [GetAllCourseItemDto], nullable: true })
  data: GetAllCourseItemDto[] | null;

  @ApiProperty({ type: GetAllCoursesPaginationDto })
  pagination: GetAllCoursesPaginationDto;
}
