import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, Min, ArrayMinSize } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateCourseDataDto } from './create-course.dto';
import { BaseResponseDto } from 'src/common/dto/response.dto';

export class UpdateCourseBodyDto {
  @ApiPropertyOptional({ description: 'Course title', example: 'Advanced TypeScript' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Course description', example: 'Master advanced TypeScript concepts' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Course instructor', example: 'Jane Doe' })
  @IsString()
  instructor: string;

  @ApiPropertyOptional({ 
    description: 'Course topics', 
    example: ['TypeScript', 'Advanced Programming', 'Software Architecture'],
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

  @ApiPropertyOptional({ description: 'Course price', example: 149.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateCourseResponseDto extends BaseResponseDto {
  @ApiProperty({ type: CreateCourseDataDto, nullable: true })
  data: CreateCourseDataDto | null;
}