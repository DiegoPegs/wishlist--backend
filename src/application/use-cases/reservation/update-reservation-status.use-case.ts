import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { UpdateReservationStatusDto } from '../../../application/dtos/reservation/update-reservation-status.dto';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class UpdateReservationStatusUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    reservationId: string,
    updateReservationStatusDto: UpdateReservationStatusDto,
    userId: string,
  ): Promise<Reservation> {
    // Buscar a reserva
    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Verificar se o usuário é o dono da reserva
    if (reservation.reservedByUserId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reservations');
    }

    // Verificar se a reserva não está cancelada (exceto se for para cancelar)
    if (reservation.status === ReservationStatus.CANCELED &&
        updateReservationStatusDto.status !== ReservationStatus.CANCELED) {
      throw new ForbiddenException('Cannot update canceled reservations');
    }

    // Atualizar o status da reserva
    const updatedReservation = await this.reservationRepository.update(
      reservationId,
      {
        status: updateReservationStatusDto.status,
      },
    );

    if (!updatedReservation) {
      throw new Error('Failed to update reservation');
    }

    return updatedReservation;
  }
}
