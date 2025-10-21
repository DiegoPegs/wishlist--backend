import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemQuantityDto {
  @ApiProperty({
    description: 'Nova quantidade desejada do item',
    example: 3,
    type: 'number',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  desired: number;
}
