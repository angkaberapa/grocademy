import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { AdminGuard } from 'src/auth/admin.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersPaginationQueryDto } from './dto/users-query.dto';
import { BalanceIncrementBodyDto } from './dto/balance-increment.dto';
import { UpdateUserBodyDto } from './dto/update-user.dto';
import { UpdateUserResponseDto, UserBalanceResponseDto, UserDetailResponseDto, UsersListResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated users list', 
    type: UsersListResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(@Query() queryDto: UsersPaginationQueryDto): Promise<UsersListResponseDto> {
    return this.usersService.findAllWithPagination(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a user', 
    type: UserDetailResponseDto 
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findOne(@Param('id') id: string): Promise<UserDetailResponseDto> {
    return this.usersService.getUserDetailById(id);
  }

  @Post(':id/balance')
  @ApiOperation({ summary: 'Increment user balance' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiBody({ type: BalanceIncrementBodyDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance incremented successfully', 
    type: UserBalanceResponseDto 
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async incrementBalance(
    @Param('id') id: string,
    @Body() balanceDto: BalanceIncrementBodyDto
  ): Promise<UserBalanceResponseDto> {
    return this.usersService.incrementBalance(id, balanceDto.increment);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiBody({ type: UpdateUserBodyDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully', 
    type: UpdateUserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required or Admin can\'t be updated' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserBodyDto
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.updateUser(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required or Admin can\'t be deleted' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}