import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { WishlistWithItemsDto } from '../../dtos/wishlist/wishlist-with-items.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FindDependentWishlistByIdUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    wishlistId: string,
    requesterId: string,
  ): Promise<WishlistWithItemsDto> {
    // 1. Verificar se o dependente existe (incluindo inativos)
    const dependent = await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // 2. Verificar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar wishlists deste dependente',
      );
    }

    // 3. Buscar a wishlist específica
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 4. Verificar se a wishlist pertence ao dependente
    if (wishlist.userId !== dependentId) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 5. Buscar todos os itens associados a essa wishlist
    const items = await this.itemRepository.findByWishlistId(wishlistId);

    // 6. Buscar todas as reservas associadas aos itens encontrados
    const itemIds = items.map((item) => item._id.toString());
    const allReservations = await Promise.all(
      itemIds.map((itemId) => this.reservationRepository.findByItemId(itemId)),
    );

    // 7. Processar cada item para adicionar displayStatus
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

    // 8. Construir resposta com URL pública se a lista for pública
    const sharing = {
      ...wishlist.sharing,
      publicLink:
        wishlist.sharing.isPublic &&
        wishlist.sharing.publicLinkToken
          ? `${process.env.FRONTEND_URL}/public/${wishlist.sharing.publicLinkToken}`
          : undefined,
    };

    const wishlistWithItems: WishlistWithItemsDto = {
      _id: wishlist._id.toString(),
      userId: wishlist.userId.toString(),
      title: wishlist.title,
      description: wishlist.description,
      sharing,
      status: wishlist.status,
      archivedAt: wishlist.archivedAt,
      items: processedItems,
    };

    return wishlistWithItems;
  }

  private calculateDisplayStatus(
    item: any,
    reservations: any[],
    requesterId: string,
  ): string {
    const totalReserved = reservations.reduce(
      (sum, reservation) => sum + reservation.quantity,
      0,
    );

    if (totalReserved >= item.desiredQuantity) {
      return 'FULLY_RESERVED';
    }

    if (totalReserved > 0) {
      return 'PARTIALLY_RESERVED';
    }

    // Verificar se o usuário tem uma reserva neste item
    const userReservation = reservations.find(
      (reservation) => reservation.reservedByUserId.toString() === requesterId,
    );

    if (userReservation) {
      return 'RESERVED_BY_USER';
    }

    return 'AVAILABLE';
  }
}
