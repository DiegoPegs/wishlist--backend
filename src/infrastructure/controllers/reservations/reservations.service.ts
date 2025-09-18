import { Injectable } from '@nestjs/common';
import { ReserveItemDto } from '../../../application/dtos/reservation/reserve-item.dto';
import { ReserveItemUseCase } from '../../../application/use-cases/reservation/reserve-item.use-case';
import { GetUserReservationsUseCase } from '../../../application/use-cases/reservation/get-user-reservations.use-case';
import { ConfirmPurchaseUseCase } from '../../../application/use-cases/reservation/confirm-purchase.use-case';
import { CancelReservationUseCase } from '../../../application/use-cases/reservation/cancel-reservation.use-case';
import { Reservation } from '../../../domain/entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reserveItemUseCase: ReserveItemUseCase,
    private readonly getUserReservationsUseCase: GetUserReservationsUseCase,
    private readonly confirmPurchaseUseCase: ConfirmPurchaseUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
  ) {}

  async createReservation(
    reserveItemDto: ReserveItemDto,
    userId: string,
  ): Promise<Reservation> {
    return this.reserveItemUseCase.execute(reserveItemDto, userId);
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return this.getUserReservationsUseCase.execute(userId);
  }

  async confirmPurchase(
    reservationId: string,
    userId: string,
  ): Promise<Reservation> {
    return this.confirmPurchaseUseCase.execute(reservationId, userId);
  }

  async cancelReservation(
    reservationId: string,
    userId: string,
  ): Promise<Reservation> {
    return this.cancelReservationUseCase.execute(reservationId, userId);
  }
}
