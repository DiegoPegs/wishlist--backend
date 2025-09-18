import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ReserveItemDto } from '../../../application/dtos/reservation/reserve-item.dto';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import { ItemType } from '../../../domain/entities/item.entity';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class ReserveItemUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: ReserveItemDto,
    _requesterId: string,
  ): Promise<Reservation> {
    // a. Buscar o Item pelo dto.itemId
    const item = await this.itemRepository.findById(dto.itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // b. Buscar a Wishlist usando o item.wishlistId.toString()
    const wishlist = await this.wishlistRepository.findById(
      item.wishlistId.toString(),
    );
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // c. Buscar o User (o solicitante) usando o requesterId
    const requester = await this.userRepository.findById(_requesterId);
    if (!requester) {
      throw new NotFoundException('User not found');
    }

    // d. Verificação de auto-reserva: Compare wishlist.userId.toString() com requesterId
    if (wishlist.userId.toString() === _requesterId) {
      throw new ForbiddenException(
        'Você não pode reservar itens da sua própria lista.',
      );
    }

    // e. Verificação de amizade: Verificar se o dono da lista está no array following do solicitante
    const isFollowing =
      requester.following?.some(
        (followingId) => followingId.toString() === wishlist.userId.toString(),
      ) ?? false;
    if (!isFollowing) {
      throw new ForbiddenException(
        'Você só pode reservar itens de usuários que você segue.',
      );
    }

    // Verificar se o item é do tipo SPECIFIC_PRODUCT (apenas itens específicos podem ser reservados)
    if (item.itemType !== ItemType.SPECIFIC_PRODUCT) {
      throw new BadRequestException('Only specific products can be reserved');
    }

    // Verificar se o item tem quantidade definida
    if (!item.quantity) {
      throw new BadRequestException('Item does not have quantity information');
    }

    // Verificar se há quantidade suficiente disponível
    const availableQuantity = item.quantity.desired - item.quantity.reserved;
    if (availableQuantity < dto.quantity) {
      throw new BadRequestException(
        'Insufficient quantity available for reservation',
      );
    }

    // Verificar se o usuário já tem uma reserva ativa para este item
    const existingReservations =
      await this.reservationRepository.findByUserId(_requesterId);
    const activeReservation = existingReservations.find(
      (reservation) =>
        reservation.itemId.toString() === dto.itemId &&
        reservation.status === ReservationStatus.RESERVED,
    );

    if (activeReservation) {
      throw new BadRequestException(
        'User already has an active reservation for this item',
      );
    }

    // Criar a reserva e atualizar o item usando operações atômicas
    try {
      // Primeiro, incrementar atomicamente a quantidade reservada do item
      // Isso garante que não haverá condições de corrida
      if (item.itemType === ItemType.SPECIFIC_PRODUCT) {
        const updatedItem = await this.itemRepository.incrementReservedQuantity(
          dto.itemId,
          dto.quantity,
        );

        if (!updatedItem) {
          throw new BadRequestException('Failed to update item quantity');
        }

        // Verificar se ainda há quantidade suficiente após o incremento
        if (!updatedItem.quantity) {
          // Reverter o incremento se não há quantidade definida
          await this.itemRepository.incrementReservedQuantity(
            dto.itemId,
            -dto.quantity, // Decrementar para reverter
          );
          throw new BadRequestException('Item does not have quantity information');
        }

        const newAvailableQuantity = updatedItem.quantity.desired - updatedItem.quantity.reserved;
        if (newAvailableQuantity < 0) {
          // Reverter o incremento se não há quantidade suficiente
          await this.itemRepository.incrementReservedQuantity(
            dto.itemId,
            -dto.quantity, // Decrementar para reverter
          );
          throw new BadRequestException(
            'Insufficient quantity available for reservation',
          );
        }
      }

      // Criar a reserva
      const reservation = new Reservation();
      reservation.itemId = item._id.toString();
      reservation.wishlistId = item.wishlistId.toString();
      reservation.reservedByUserId = _requesterId;
      reservation.wishlistOwnerId = wishlist.userId.toString();
      reservation.quantity = dto.quantity;
      reservation.status = ReservationStatus.RESERVED;
      reservation.createdAt = new Date();

      // Salvar a reserva
      const createdReservation = await this.reservationRepository.create(reservation);

      return createdReservation;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred during reservation');
    }
  }
}
