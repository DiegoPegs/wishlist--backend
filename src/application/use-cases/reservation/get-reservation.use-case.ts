import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class GetReservationUseCase {
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
      throw new ForbiddenException('You can only view your own reservations');
    }

    return reservation;
  }
}
