import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(reservationId: string, userId: string): Promise<Reservation> {
    // Buscar a reserva
    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Verificar se o usuário é o dono da reserva
    if (reservation.reservedByUserId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    // Verificar se a reserva não está já cancelada
    if (reservation.status === ReservationStatus.CANCELED) {
      throw new ForbiddenException('Reservation is already canceled');
    }

    // Cancelar a reserva
    const updatedReservation = await this.reservationRepository.update(
      reservationId,
      {
        status: ReservationStatus.CANCELED,
      },
    );

    if (!updatedReservation) {
      throw new Error('Failed to cancel reservation');
    }

    return updatedReservation;
  }
}
