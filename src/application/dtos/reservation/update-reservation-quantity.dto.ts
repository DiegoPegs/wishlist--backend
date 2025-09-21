import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationQuantityDto {
  @ApiProperty({
    description: 'Nova quantidade de itens para a reserva',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  newQuantity: number;
}
