import { Controller, Post, Get, Body, UseGuards, Request, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto, RegisterResponseDto, UserProfileResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUserId } from './current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    type: LoginResponseDto
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(loginDto);
    
    return result;
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already exists',
    type: RegisterResponseDto
  })
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    type: UserProfileResponseDto
  })
  async getProfile(@CurrentUserId() userId: string): Promise<UserProfileResponseDto> {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    return {
      status: 'success',
      message: 'Logged out successfully'
    };
  }
}
