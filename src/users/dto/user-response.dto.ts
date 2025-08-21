import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/response.dto';

export class UserDto {
  @ApiProperty({ example: 'uuid-string-here' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 100000 })
  balance: number;
}

export class UserDetailDto extends UserDto {
  @ApiProperty({ example: 5 })
  courses_purchased: number;
}

export class UserBalanceDto {
  @ApiProperty({ example: 'uuid-string-here' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 100000 })
  balance: number;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 15 })
  total_pages: number;

  @ApiProperty({ example: 100 })
  total_items: number;
}

export class UsersListResponseDto extends BaseResponseDto {
  @ApiProperty({ type: [UserDto] })
  data: UserDto[] | null;

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}

export class UserDetailResponseDto extends BaseResponseDto {
  @ApiProperty({ type: UserDetailDto })
  data: UserDetailDto | null;
}

export class UserBalanceResponseDto extends BaseResponseDto {
  @ApiProperty({ type: UserBalanceDto })
  data: UserBalanceDto | null;
}

export class UpdateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ type: UserDto })
  data: UserDto | null;
}