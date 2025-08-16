import { IsOptional, IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserBodyDto {
  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User username',
    example: 'johndoe',
    required: true,
  })
  @IsString()
  @MinLength(1)
  username: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    required: true,
  })
  @IsString()
  @MinLength(1)
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @MinLength(1)
  last_name: string;

  @ApiProperty({
    description: 'User new password (optional)',
    example: 'newPassword123',
    required: false,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    })
  password?: string;
}
