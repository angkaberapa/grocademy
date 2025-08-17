import { ApiProperty } from '@nestjs/swagger';

export class GetCourseByIdDataDto {
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

  @ApiProperty({ description: 'Total number of modules', example: 12 })
  total_modules: number;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

export class GetCourseByIdResponseDto {
  @ApiProperty({ description: 'Response status', example: 'success' })
  status: string;

  @ApiProperty({ description: 'Response message', example: 'Course retrieved successfully' })
  message: string;

  @ApiProperty({ type: GetCourseByIdDataDto, nullable: true })
  data: GetCourseByIdDataDto | null;
}
