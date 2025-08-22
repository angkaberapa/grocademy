import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  UploadedFiles, 
  Patch,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiQuery, 
  ApiBearerAuth, 
  ApiConsumes 
} from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import {
  CreateUpdateModuleBodyDto,
  CreateUpdateModuleSwaggerDto,
  ReorderModuleBodyDto,
} from './dto/body.dto';
import {
  CreateUpdateModuleResponseDto,
  GetAllCourseModulesResponseDto,
  GetCourseModuleResponseDto,
  ReorderModuleResponseDto,
  CompleteModuleResponseDto,
} from './dto/response.dto';
import { GetAllCourseModulesQueryDto } from '../course/dto';

@ApiTags('modules')
@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  // 1. POST /api/courses/:courseId/modules (admin only)
  @Post('courses/:courseId/modules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pdf_content', maxCount: 1 },
    { name: 'video_content', maxCount: 1 }
  ]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new module for a course (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUpdateModuleSwaggerDto })
  @ApiResponse({ status: 201, description: 'Module created successfully', type: CreateUpdateModuleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async createModule(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateUpdateModuleBodyDto,
    @UploadedFiles() files: {
      pdf_content?: Express.Multer.File[],
      video_content?: Express.Multer.File[]
    },
  ): Promise<CreateUpdateModuleResponseDto> {
    return this.moduleService.createModule(
      courseId,
      createModuleDto,
      files.pdf_content?.[0],
      files.video_content?.[0],
    );
  }

  // 2. GET /api/courses/:courseId/modules
  @Get('courses/:courseId/modules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all modules for a course' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page (max 50)', required: false, example: 15 })
  @ApiResponse({ status: 200, description: 'Course modules retrieved successfully', type: GetAllCourseModulesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Must purchase course' })
  async getAllCourseModules(
    @Param('courseId') courseId: string,
    @CurrentUserId() userId: string,
    @Query() query: GetAllCourseModulesQueryDto,
  ): Promise<GetAllCourseModulesResponseDto> {
    return this.moduleService.getAllCourseModules(courseId, userId, query);
  }

  // 3. GET /api/modules/:id
  @Get('modules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully', type: GetCourseModuleResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Must purchase course' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async getModuleById(
    @Param('id') moduleId: string,
    @CurrentUserId() userId: string,
  ): Promise<GetCourseModuleResponseDto> {
    return this.moduleService.getModuleById(moduleId, userId);
  }

  // 4. PUT /api/modules/:id (admin only)
  @Put('modules/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pdf_content', maxCount: 1 },
    { name: 'video_content', maxCount: 1 }
  ]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update module by ID (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUpdateModuleSwaggerDto })
  @ApiResponse({ status: 200, description: 'Module updated successfully', type: CreateUpdateModuleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async updateModule(
    @Param('id') moduleId: string,
    @Body() updateModuleDto: CreateUpdateModuleBodyDto,
    @UploadedFiles() files: {
      pdf_content?: Express.Multer.File[],
      video_content?: Express.Multer.File[]
    },
  ): Promise<CreateUpdateModuleResponseDto> {
    return this.moduleService.updateModule(
      moduleId,
      updateModuleDto,
      files.pdf_content?.[0],
      files.video_content?.[0],
    );
  }

  // 5. DELETE /api/modules/:id (admin only)
  @Delete('modules/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete module by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: 204, description: 'Module deleted successfully (No Content)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async deleteModule(@Param('id') moduleId: string): Promise<void> {
    return this.moduleService.deleteModule(moduleId);
  }

  // 6. PATCH /api/courses/:courseId/modules/reorder
  @Patch('courses/:courseId/modules/reorder')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder modules in a course (Admin only)' })
  @ApiBody({ type: ReorderModuleBodyDto })
  @ApiResponse({ status: 200, description: 'Module order updated successfully', type: ReorderModuleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async reorderModules(
    @Param('courseId') courseId: string,
    @Body() reorderDto: ReorderModuleBodyDto,
  ): Promise<ReorderModuleResponseDto> {
    return this.moduleService.reorderModules(courseId, reorderDto);
  }

  // 7. PATCH /api/modules/:id/complete
  @Patch('modules/:id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark module as completed' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: 200, description: 'Module completed successfully', type: CompleteModuleResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Must purchase course' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async completeModule(
    @Param('id') moduleId: string,
    @CurrentUserId() userId: string,
  ): Promise<CompleteModuleResponseDto> {
    return this.moduleService.completeModule(moduleId, userId);
  }
}
