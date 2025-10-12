import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { UpdateReservationQuantityDto } from '../../dtos/reservation/update-reservation-quantity.dto';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';

@Injectable()
export class UpdateReservationQuantityUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(
    reservationId: string,
    dto: UpdateReservationQuantityDto,
    requesterId: string,
  ): Promise<Reservation> {
    // a. Buscar a reserva
    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // b. Validar permissão do requesterId
    if (reservation.reservedByUserId.toString() !== requesterId) {
      throw new ForbiddenException('You can only update your own reservations');
    }

    // c. Validar status atual da reserva
    if (
      reservation.status !== ReservationStatus.RESERVED &&
      reservation.status !== ReservationStatus.PURCHASED
    ) {
      throw new BadRequestException(
        'Only RESERVED or PURCHASED reservations can have their quantity updated',
      );
    }

    // d. Calcular a diferença entre a quantidade antiga e a nova
    const currentQuantity = reservation.quantity;
    const newQuantity = dto.newQuantity;
    const quantityDifference = newQuantity - currentQuantity;

    // e. Validar se a nova quantidade não excede a disponibilidade
    const item = await this.itemRepository.findById(reservation.itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Verificar se há quantidade suficiente disponível
    if (!item.quantity) {
      throw new BadRequestException('Item does not have quantity information');
    }

    const availableQuantity = item.quantity.desired - item.quantity.reserved;
    if (quantityDifference > availableQuantity) {
      throw new BadRequestException(
        `Insufficient quantity available. Only ${availableQuantity} items available for reservation`,
      );
    }

    // f. Atualizar a reserva e o item usando operações atômicas
    try {
      // Atualizar a quantidade da reserva
      const updatedReservation = await this.reservationRepository.update(
        reservationId,
        {
          quantity: newQuantity,
        },
      );

      if (!updatedReservation) {
        throw new Error('Failed to update reservation');
      }

      // Atualizar atomicamente a quantidade reservada do item
      const updatedItem = await this.itemRepository.incrementReservedQuantity(
        reservation.itemId,
        quantityDifference,
      );

      if (!updatedItem) {
        throw new Error('Failed to update item quantity');
      }

      // Verificar se a quantidade reservada não excede a desejada após a atualização
      if (!updatedItem.quantity) {
        // Reverter as mudanças se não há quantidade definida
        await this.itemRepository.incrementReservedQuantity(
          reservation.itemId,
          -quantityDifference,
        );
        throw new BadRequestException(
          'Item does not have quantity information after update',
        );
      }

      const finalAvailableQuantity =
        updatedItem.quantity.desired - updatedItem.quantity.reserved;
      if (finalAvailableQuantity < 0) {
        // Reverter as mudanças se não há quantidade suficiente
        await this.itemRepository.incrementReservedQuantity(
          reservation.itemId,
          -quantityDifference,
        );
        throw new BadRequestException(
          'Insufficient quantity available after update',
        );
      }

      return updatedReservation;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred during reservation update');
    }
  }
}
