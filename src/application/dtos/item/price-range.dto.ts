import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PriceRangeDto {
  @ApiPropertyOptional({
    description: 'Preço mínimo do item',
    example: 29.99,
    type: 'number',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  min?: number;

  @ApiPropertyOptional({
    description: 'Preço máximo do item',
    example: 49.99,
    type: 'number',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  max?: number;
}
