import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { Course } from './course.entity';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Returns all courses', type: [Course] })
  async findAll(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Returns a course', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Introduction to TypeScript' },
        description: { type: 'string', example: 'Learn TypeScript from basics to advanced' },
        instructor: { type: 'string', example: 'John Smith' },
        price: { type: 'number', example: 99.99 },
        thumbnail_image: { type: 'string', example: '/uploads/courses/thumbnails/course-thumbnail.jpg' },
        topics: { type: 'array', items: { type: 'string' }, example: ['TypeScript', 'Programming'] }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() body: { course: Partial<Course>, topics?: string[] }): Promise<Course> {
    return this.courseService.create(body.course, body.topics);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Course Title' },
        description: { type: 'string', example: 'Updated description' },
        instructor: { type: 'string', example: 'Jane Smith' },
        price: { type: 'number', example: 149.99 },
        thumbnail_image: { type: 'string', example: '/uploads/courses/thumbnails/new-thumbnail.jpg' },
        topics: { type: 'array', items: { type: 'string' }, example: ['TypeScript', 'Advanced Programming'] }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Course updated successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(@Param('id') id: string, @Body() body: { course: Partial<Course>, topics?: string[] }): Promise<Course> {
    return this.courseService.update(id, body.course, body.topics);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.courseService.remove(id);
  }
}
