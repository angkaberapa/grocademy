import { ApiProperty } from '@nestjs/swagger';
import { CreateCourseBodyDto } from './create-course.dto';
import { UpdateCourseBodyDto } from './update-course.dto';

export class CreateCourseSwaggerDto extends CreateCourseBodyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Course thumbnail image file',
    required: false,
  })
  thumbnail_image?: any;
}

export class UpdateCourseSwaggerDto extends UpdateCourseBodyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Course thumbnail image file',
    required: false,
  })
  thumbnail_image?: any;
}
