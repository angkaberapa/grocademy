import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../common/dto/response.dto';
import { PaginationMetaDto } from '../../users/dto';
import { ReorderModuleBodyDto } from './body.dto';

export class ModuleDataDto {
    @ApiProperty({ description: 'Module ID', example: 'uuid-string' })
    id: string;

    @ApiProperty({ description: 'Course ID', example: 'uuid-string' })
    course_id: string;

    @ApiProperty({ description: 'Module title', example: 'Introduction to Variables' })
    title: string;

    @ApiProperty({ description: 'Module description', example: 'Learn about variables in TypeScript' })
    description: string;

    @ApiProperty({ description: 'Module order', example: 1 })
    order: number;

    @ApiProperty({ description: 'PDF content path', example: '/uploads/modules/pdfs/module-123.pdf', nullable: true })
    pdf_content: string | null;

    @ApiProperty({ description: 'Video content path', example: '/uploads/modules/videos/module-123.mp4', nullable: true })
    video_content: string | null;

    @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00Z' })
    created_at: string;

    @ApiProperty({ description: 'Update timestamp', example: '2024-01-01T00:00:00Z' })
    updated_at: string;
}   

export class UserModuleProgressDataDto extends ModuleDataDto {
    @ApiProperty({ description: 'User completion status for this module', example: true })
    is_completed: boolean;
}

export class CourseProgressDataDto {
    @ApiProperty({ description: 'Total number of modules in the course', example: 10 })
    total_modules: number;

    @ApiProperty({ description: 'Number of completed modules', example: 7 })
    completed_modules: number;

    @ApiProperty({ description: 'Completion percentage', example: 70 })
    percentage: number;
}

export class UserModuleCompletedDataDto {
    @ApiProperty({ description: 'Module ID', example: 'uuid-string' })
    module_id: string;

    @ApiProperty({ description: 'Module completion status', example: true })
    is_completed: boolean;

    @ApiProperty({ type: CourseProgressDataDto, description: 'Course progress information' })
    course_progress: CourseProgressDataDto;

    @ApiProperty({ description: 'Certificate URL (if 100% completed)', example: '/uploads/certificates/module-123.pdf', nullable: true })
    certificate_url: string | null;
}

export class CreateUpdateModuleResponseDto extends BaseResponseDto {
    @ApiProperty({ type: ModuleDataDto, nullable: true })
    data: ModuleDataDto | null;
}

export class GetCourseModuleResponseDto extends BaseResponseDto {
    @ApiProperty({ type: UserModuleProgressDataDto, nullable: true })
    data: UserModuleProgressDataDto | null;
}

export class GetAllCourseModulesResponseDto extends BaseResponseDto {
    @ApiProperty({ type: [UserModuleProgressDataDto], description: 'List of course modules', nullable: true })
    data: UserModuleProgressDataDto[] | null;
    pagination: PaginationMetaDto;
}

export class ReorderModuleResponseDto extends BaseResponseDto {
    @ApiProperty({ type: ReorderModuleBodyDto, nullable: true })
    data: ReorderModuleBodyDto | null;
}

export class CompleteModuleResponseDto extends BaseResponseDto {
    @ApiProperty({ type: UserModuleCompletedDataDto, nullable: true })
    data: UserModuleCompletedDataDto | null;
}