import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceIncrementBodyDto {
  @ApiProperty({
    description: 'Amount to increment the balance',
    example: 100000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;
}
