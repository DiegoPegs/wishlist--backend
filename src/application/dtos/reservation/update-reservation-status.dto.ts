import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: 'Novo status da reserva',
    example: ReservationStatus.RESERVED,
    enum: ReservationStatus,
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
