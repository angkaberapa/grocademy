import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'First name',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ 
    description: 'Last name',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ 
    description: 'Username',
    example: 'john_doe'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'john@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Password (minimum 6 characters)',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'Confirm password',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}
