import { ApiProperty } from '@nestjs/swagger';

export class BuyCourseDataDto {
  @ApiProperty({ description: 'Purchased course ID', example: 'uuid-string' })
  course_id: string;

  @ApiProperty({ description: 'User balance after purchase', example: 50.00 })
  user_balance: number;

  @ApiProperty({ description: 'Transaction ID', example: 'uuid-string' })
  transaction_id: string;
}

export class BuyCourseResponseDto {
  @ApiProperty({ description: 'Response status', example: 'success' })
  status: string;

  @ApiProperty({ description: 'Response message', example: 'Course purchased successfully' })
  message: string;

  @ApiProperty({ type: BuyCourseDataDto, nullable: true })
  data: BuyCourseDataDto | null;
}
