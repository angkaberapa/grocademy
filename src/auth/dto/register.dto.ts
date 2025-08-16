import { IsString, IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';
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
    description: 'Password (minimum 8 characters, 1 uppercase, 1 lowercase, 1 number)',
    example: 'Password123'
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
  })
  password: string;

  @ApiProperty({ 
    description: 'Confirm password',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}
