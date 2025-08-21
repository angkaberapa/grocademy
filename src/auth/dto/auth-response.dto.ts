import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../common/dto/response.dto';

export class LoginResponseDataDto {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'JWT token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;
}

export class RegisterResponseDataDto {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  last_name: string;
}

export class UserResponseDataDto {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  last_name: string;

  @ApiProperty({ description: 'Account balance', example: 1000 })
  balance: number;
}
// Login Response
export class LoginResponseDto extends BaseResponseDto {
  @ApiProperty({ type: LoginResponseDataDto, nullable: true })
  data: LoginResponseDataDto | null;
}

// Register Response  
export class RegisterResponseDto extends BaseResponseDto {
  @ApiProperty({ type: RegisterResponseDataDto, nullable: true })
  data: RegisterResponseDataDto | null;
}

// User Profile Response
export class UserProfileResponseDto extends BaseResponseDto {
  @ApiProperty({ type: UserResponseDataDto, nullable: true })
  data: UserResponseDataDto | null;
}
