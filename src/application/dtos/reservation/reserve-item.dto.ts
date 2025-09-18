import { IsInt, IsMongoId, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReserveItemDto {
  @ApiProperty({
    description: 'ID do item a ser reservado',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
    format: 'ObjectId',
  })
  @IsMongoId()
  itemId: string;

  @ApiProperty({
    description: 'Quantidade do item a ser reservada',
    example: 2,
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}
