import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { CourseService } from './course.service';
import { FileStorageService } from '../common/file-storage.service';
import { UserCoursesService } from '../user-courses/user-courses.service';
import {
  CreateCourseBodyDto,
  CreateCourseResponseDto,
  GetCourseByIdResponseDto,
  GetAllCoursesQueryDto,
  GetAllCoursesResponseDto,
  UpdateCourseBodyDto,
  UpdateCourseResponseDto,
  BuyCourseResponseDto,
  GetUserCoursesQueryDto,
  GetUserCoursesResponseDto,
} from './dto';
import { CreateCourseSwaggerDto, UpdateCourseSwaggerDto } from './dto/swagger.dto';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly fileStorageService: FileStorageService,
    private readonly userCoursesService: UserCoursesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('thumbnail_image'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseSwaggerDto })
  @ApiResponse({ status: 201, description: 'Course created successfully', type: CreateCourseResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createCourse(
    @Body() createCourseDto: CreateCourseBodyDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateCourseResponseDto> {
    let thumbnailPath: string | undefined;

    if (file) {
      thumbnailPath = await this.fileStorageService.saveFile(file, 'thumbnail');
    }

    return this.courseService.create(createCourseDto, thumbnailPath);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all courses with pagination and search' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully', type: GetAllCoursesResponseDto })
  async getAllCourses(@Query() query: GetAllCoursesQueryDto): Promise<GetAllCoursesResponseDto> {
    return this.courseService.findAll(query);
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses owned by current user' })
  @ApiResponse({ status: 200, description: 'User courses retrieved successfully', type: GetUserCoursesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserCourses(
    @CurrentUserId() userId: string,
    @Query() query: GetUserCoursesQueryDto,
  ): Promise<GetUserCoursesResponseDto> {
    return this.courseService.getUserCourses(userId, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully', type: GetCourseByIdResponseDto })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(@Param('id') id: string): Promise<GetCourseByIdResponseDto> {
    return this.courseService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('thumbnail_image'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course by ID (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCourseSwaggerDto })
  @ApiResponse({ status: 200, description: 'Course updated successfully', type: UpdateCourseResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseBodyDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UpdateCourseResponseDto> {
    let thumbnailPath: string | undefined;

    if (file) {
      thumbnailPath = await this.fileStorageService.saveFile(file, 'thumbnail');
    }

    return this.courseService.update(id, updateCourseDto, thumbnailPath);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete course by ID (Admin only)' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully (No Content)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Param('id') id: string): Promise<void> {
    await this.courseService.delete(id);
    // Return nothing for 204 No Content
  }

  @Post(':id/buy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy a course' })
  @ApiResponse({ status: 201, description: 'Course purchased successfully', type: BuyCourseResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - User already owns course or insufficient balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async buyCourse(
    @Param('id') courseId: string,
    @CurrentUserId() userId: string,
  ): Promise<BuyCourseResponseDto> {
    return this.courseService.buyCourse(userId, courseId);
  }

  @Get(':id/buy-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user owns a course' })
  @ApiResponse({ status: 200, description: 'Buy status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getBuyStatus(
    @Param('id') courseId: string,
    @CurrentUserId() userId: string,
  ) {
    const buyStatus = await this.userCoursesService.buyStatus(courseId, userId);
    return {
      status: 'success',
      message: 'Buy status retrieved successfully',
      data: buyStatus
    };
  }

  @Get(':id/certificate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course certificate if completed' })
  @ApiResponse({ status: 200, description: 'Certificate URL retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Course not completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found or not purchased' })
  async getCourseCertificate(
    @Param('id') courseId: string,
    @CurrentUserId() userId: string,
  ) {
    const buyStatus = await this.userCoursesService.buyStatus(courseId, userId);
    
    if (!buyStatus.owns_course) {
      return {
        status: 'error',
        message: 'Course not purchased'
      };
    }
    
    if (!buyStatus.is_completed) {
      return {
        status: 'error',
        message: 'Course not completed. Complete all modules to get certificate.'
      };
    }
    
    // Find certificate from completed modules (certificates are generated when completing modules)
    const certificateUrl = `${process.env.R2_PUBLIC_URL}/certificates/certificate-${userId}-${courseId}.pdf`;
    
    return {
      status: 'success',
      message: 'Certificate URL retrieved successfully',
      data: {
        certificate_url: certificateUrl,
        progress_percentage: buyStatus.progress_percentage
      }
    };
  }
}
