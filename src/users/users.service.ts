import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './users.entity';
import { UsersPaginationQueryDto } from './dto/users-query.dto';
import { UpdateUserBodyDto } from './dto/update-user.dto';
import { UserDetailResponseDto, UsersListResponseDto, PaginationMetaDto, UserDto, UserDetailDto, UserBalanceDto, UserBalanceResponseDto, UpdateUserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { UserCourse } from 'src/user-courses/user-courses.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserCourse)
    private userCoursesRepository: Repository<UserCourse>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: [
        { email: identifier },
        { username: identifier }
      ]
    });
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAllWithPagination(queryDto: UsersPaginationQueryDto): Promise<UsersListResponseDto> {
    const { q, page = 1, limit = 15 } = queryDto;
    const offset = (page - 1) * limit;

    let whereConditions = {};
    
    if (q) {
      whereConditions = [
      { username: Like(`%${q}%`), role: UserRole.USER },
      { first_name: Like(`%${q}%`), role: UserRole.USER },
      { last_name: Like(`%${q}%`), role: UserRole.USER },
      { email: Like(`%${q}%`), role: UserRole.USER },
      ];
    } else {
      whereConditions = { role: UserRole.USER };
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where: whereConditions,
      skip: offset,
      take: limit,
      order: { first_name: 'ASC' }
    });

    const totalPages = Math.ceil(total / limit);

    const userResponseData: UserDto[] = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
    }));

    const meta: PaginationMetaDto = {
      current_page: page,
      total_items: total,
      total_pages: totalPages,
    };

    return {
      message: 'User list retrieved successfully',
      status: 'success',
      data: userResponseData,
      pagination: meta,
    };
  }

  async getUserDetailById(id: string): Promise<UserDetailResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const coursesPurchased = await this.userCoursesRepository.count({
      where: { user: { id } }
    });

    const userDetailData: UserDetailDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
      courses_purchased: coursesPurchased,
    };

    return {
      message: 'User detail retrieved successfully',
      status: 'success',
      data: userDetailData,
    };
  }

  async incrementBalance(id: string, amount: number): Promise<UserBalanceResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.balance += amount;

    await this.usersRepository.save(user);
    
    const userBalanceData: UserBalanceDto = {
      id: user.id,
      username: user.username,
      balance: user.balance,
    };

    return {
      message: 'User balance added successfully',
      status: 'success',
      data: userBalanceData,
    };
  }

  async updateUser(id: string, updateDto: UpdateUserBodyDto): Promise<UpdateUserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.USER) {
      throw new ForbiddenException('Access denied');
    }

    // Check if email is being updated and if it already exists
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateDto.email }
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if username is being updated and if it already exists
    if (updateDto.username && updateDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateDto.username }
      });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }
    if (updateDto.email !== undefined) user.email = updateDto.email;
    if (updateDto.username !== undefined) user.username = updateDto.username;
    if (updateDto.first_name !== undefined) user.first_name = updateDto.first_name;
    if (updateDto.last_name !== undefined) user.last_name = updateDto.last_name;

    const updatedUser = await this.usersRepository.save(user);
    
    const UserData: UserDto = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      balance: updatedUser.balance,
    };

    return {
      message: 'User updated successfully',
      status: 'success',
      data: UserData,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.USER) {
      throw new ForbiddenException('Access denied');
    }

    await this.usersRepository.remove(user);
  }
}