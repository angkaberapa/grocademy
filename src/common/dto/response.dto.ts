import { ApiProperty } from "@nestjs/swagger";

export abstract class BaseResponseDto {
  @ApiProperty({ description: 'Response status', example: 'success' })
  status: string;
  
  @ApiProperty({ description: 'Response message', example: 'Login successful' })
  message: string;
}
