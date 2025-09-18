import { Injectable, Inject } from '@nestjs/common';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class GetUserReservationsUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(_userId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByUserId(_userId);
  }
}
