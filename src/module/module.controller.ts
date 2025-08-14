import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { Module } from './module.entity';

@ApiTags('modules')
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  @ApiQuery({ name: 'courseId', description: 'Filter by course ID', required: false })
  @ApiResponse({ status: 200, description: 'Returns all modules', type: [Module] })
  async findAll(@Query('courseId') courseId?: string): Promise<Module[]> {
    if (courseId) {
      return this.moduleService.findByCourse(courseId);
    }
    return this.moduleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: 200, description: 'Returns a module', type: Module })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async findOne(@Param('id') id: string): Promise<Module> {
    return this.moduleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  @ApiBody({ type: Module })
  @ApiResponse({ status: 201, description: 'Module created successfully', type: Module })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() moduleData: Partial<Module>): Promise<Module> {
    return this.moduleService.create(moduleData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiBody({ type: Module })
  @ApiResponse({ status: 200, description: 'Module updated successfully', type: Module })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async update(@Param('id') id: string, @Body() moduleData: Partial<Module>): Promise<Module> {
    return this.moduleService.update(id, moduleData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.moduleService.remove(id);
  }
}
