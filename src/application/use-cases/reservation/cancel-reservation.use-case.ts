import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
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

    // Se a reserva já está cancelada, retornar a reserva atual
    if (reservation.status === ReservationStatus.CANCELED) {
      return reservation;
    }

    // Cancelar a reserva e decrementar a quantidade reservada do item
    try {
      // Atualizar o status da reserva para CANCELED
      const updatedReservation = await this.reservationRepository.update(
        reservationId,
        {
          status: ReservationStatus.CANCELED,
        },
      );

      if (!updatedReservation) {
        throw new Error('Failed to cancel reservation');
      }

      // Decrementar atomicamente a quantidade reservada do item
      await this.itemRepository.incrementReservedQuantity(
        reservation.itemId,
        -reservation.quantity, // Decrementar pela quantidade total da reserva
      );

      return updatedReservation;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred during reservation cancellation',
      );
    }
  }
}
