import { IsMongoId, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReceivedDto {
  @ApiProperty({
    description: 'Quantidade do item que foi recebida',
    example: 1,
    type: 'number',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantityReceived: number;

  @ApiProperty({
    description: 'ID do usuário que enviou/entregou o item',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsMongoId()
  receivedFromUserId: string;
}
