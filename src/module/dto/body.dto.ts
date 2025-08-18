import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsNumber, Min, ArrayMinSize } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUpdateModuleBodyDto {
  @ApiProperty({ description: 'Module title', example: 'Introduction to TypeScript' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Module description', example: 'What is TypeScript?' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateUpdateModuleSwaggerDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Course thumbnail image file',
    required: false,
  })
  pdf_content?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Course thumbnail image file',
    required: false,
  })
  video_content?: any;
}

export class ModuleOrderDto {
  @ApiProperty({ description: 'Module ID', example: 'module-1' })
  id: string;

  @ApiProperty({ description: 'Module order', example: 1 })
  @IsNumber()
  order: number;
}

export class ReorderModuleBodyDto {
  @ApiProperty({type: [ModuleOrderDto], description: 'List of modules order'})
  module_order: ModuleOrderDto[];
}