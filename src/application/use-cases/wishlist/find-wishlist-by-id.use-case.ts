import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Item } from '../../../domain/entities/item.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { WishlistWithItemsDto } from '../../../application/dtos/wishlist/wishlist-with-items.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class FindWishlistByIdUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    wishlistId: string,
    requesterId: string,
  ): Promise<WishlistWithItemsDto> {
    // a. Buscar a wishlist principal pelo ID com populate do usuário
    const wishlistWithUser = await this.wishlistRepository.findByIdWithUser(wishlistId);
    if (!wishlistWithUser) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário é o dono da wishlist
    if (wishlistWithUser.userId._id.toString() !== requesterId) {
      throw new NotFoundException('Wishlist not found');
    }

    // b. Buscar todos os itens associados a essa wishlist
    const items = await this.itemRepository.findByWishlistId(wishlistId);

    // c. Buscar todas as reservas associadas aos itens encontrados
    const itemIds = items.map((item) => item._id.toString());
    const allReservations = await Promise.all(
      itemIds.map((itemId) => this.reservationRepository.findByItemId(itemId)),
    );

    // d. Processar cada item para adicionar displayStatus
    const processedItems = items.map((item) => {
      const itemReservations =
        allReservations.find((reservations) =>
          reservations.some(
            (reservation) =>
              reservation.itemId.toString() === item._id.toString(),
          ),
        ) || [];

      const displayStatus = this.calculateDisplayStatus(
        item,
        itemReservations,
        requesterId,
      );

      return {
        ...item,
        displayStatus,
      };
    });

    // e. Combinar os dados da wishlist e a lista de itens processados
    const wishlistWithItems: WishlistWithItemsDto = {
      _id: wishlistWithUser._id.toString(),
      userId: wishlistWithUser.userId, // Agora contém o objeto do usuário com name
      title: wishlistWithUser.title,
      description: wishlistWithUser.description,
      sharing: wishlistWithUser.sharing,
      status: wishlistWithUser.status,
      archivedAt: wishlistWithUser.archivedAt,
      items: processedItems,
    };

    return wishlistWithItems;
  }

  private calculateDisplayStatus(
    item: Item,
    reservations: Reservation[],
    requesterId: string,
  ): string {
    // Se não há reservas, o item está disponível
    if (reservations.length === 0) {
      return 'AVAILABLE';
    }

    // Verificar se o usuário atual já tem uma reserva para este item
    const userReservation = reservations.find(
      (reservation) => reservation.reservedByUserId.toString() === requesterId,
    );

    if (userReservation) {
      return 'RESERVED_BY_ME';
    }

    // Se há outras reservas, o item está reservado por outros
    return 'RESERVED_BY_OTHERS';
  }
}
