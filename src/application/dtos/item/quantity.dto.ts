import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuantityDto {
  @ApiProperty({
    description: 'Quantidade desejada do item',
    example: 2,
    type: 'number',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  desired: number;
}
