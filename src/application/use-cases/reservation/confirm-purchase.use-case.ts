import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class ConfirmPurchaseUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    reservationId: string,
    requesterId: string,
  ): Promise<Reservation> {
    // a. Buscar a reserva pelo reservationId
    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // b. Validar se o requesterId é o mesmo que reservation.reservedByUserId
    if (reservation.reservedByUserId.toString() !== requesterId) {
      throw new ForbiddenException(
        'You can only confirm purchases for your own reservations',
      );
    }

    // c. Validar se o status atual da reserva é RESERVED
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new BadRequestException(
        'Only RESERVED reservations can be confirmed as purchased',
      );
    }

    // d. Mudar o status da reserva para PURCHASED e salvá-la
    const updatedReservation = await this.reservationRepository.update(
      reservationId,
      {
        status: ReservationStatus.PURCHASED,
      },
    );

    if (!updatedReservation) {
      throw new NotFoundException('Reservation not found after update');
    }

    return updatedReservation;
  }
}
