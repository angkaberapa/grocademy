import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/response.dto';

export class BuyCourseDataDto {
  @ApiProperty({ description: 'Purchased course ID', example: 'uuid-string' })
  course_id: string;

  @ApiProperty({ description: 'User balance after purchase', example: 50.00 })
  user_balance: number;

  @ApiProperty({ description: 'Transaction ID', example: 'uuid-string' })
  transaction_id: string;
}

export class BuyCourseResponseDto extends BaseResponseDto {
  @ApiProperty({ type: BuyCourseDataDto, nullable: true })
  data: BuyCourseDataDto | null;
}
