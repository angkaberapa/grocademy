import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class GetUserCoursesQueryDto {
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

export class GetUserCourseItemDto {
  @ApiProperty({ description: 'Course ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Course title', example: 'Introduction to TypeScript' })
  title: string;

  @ApiProperty({ description: 'Course instructor', example: 'John Smith' })
  instructor: string;

  @ApiProperty({ 
    description: 'Course topics', 
    example: ['TypeScript', 'Programming', 'Web Development']
  })
  topics: string[];

  @ApiProperty({ description: 'Thumbnail image path', example: '/uploads/courses/thumbnails/course-123.jpg', nullable: true })
  thumbnail_image: string | null;

  @ApiProperty({ description: 'Course progress percentage', example: 75.5 })
  progress_percentage: number;

  @ApiProperty({ description: 'Course purchase timestamp', example: '2024-01-01T00:00:00Z' })
  purchased_at: string;
}

export class GetUserCoursesPaginationDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  current_page: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  total_pages: number;

  @ApiProperty({ description: 'Total number of items', example: 50 })
  total_items: number;
}

export class GetUserCoursesResponseDto {
  @ApiProperty({ description: 'Response status', example: 'success' })
  status: string;

  @ApiProperty({ description: 'Response message', example: 'User courses retrieved successfully' })
  message: string;

  @ApiProperty({ type: [GetUserCourseItemDto], nullable: true })
  data: GetUserCourseItemDto[] | null;

  @ApiProperty({ type: GetUserCoursesPaginationDto })
  pagination: GetUserCoursesPaginationDto;
}
