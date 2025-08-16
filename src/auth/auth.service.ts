import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/users.entity';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    // Find user by email or username
    const user = await this.usersService.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { username: user.username, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      status: 'success',
      message: 'Login successful',
      data: {
        username: user.username,
        token,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { first_name, last_name, username, email, password, confirm_password } = registerDto;

    // Validate password confirmation
    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingEmail = await this.usersService.findByEmailOrUsername(email);
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUsername = await this.usersService.findByEmailOrUsername(username);
    if (existingUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const userData = {
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      role: UserRole.USER, // Default role
    };

    const user = await this.usersService.create(userData);

    return {
      status: 'success',
      message: 'Registration successful',
      data: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      status: 'success',
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        balance: user.balance,
      },
    };
  }

  async createAdminUser() {
    // Check if admin already exists
    const adminExists = await this.usersService.findByEmailOrUsername('admin');
    if (adminExists) {
      return;
    }

    // Create hardcoded admin user
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    const adminData = {
      first_name: 'Admin',
      last_name: 'User',
      username: 'admin',
      email: 'admin@grocademy.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      balance: 0,
    };

    await this.usersService.create(adminData);
    console.log('✅ Admin user created: admin@grocademy.com / admin123');
  }
}
