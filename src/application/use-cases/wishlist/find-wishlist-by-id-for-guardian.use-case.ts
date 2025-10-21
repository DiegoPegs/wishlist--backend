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
export class FindWishlistByIdForGuardianUseCase {
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
    wishlistId: string,
    requesterId: string,
  ): Promise<WishlistWithItemsDto> {
    // a. Buscar a wishlist principal pelo ID com populate do usuário
    const wishlistWithUser =
      await this.wishlistRepository.findByIdWithUser(wishlistId);
    if (!wishlistWithUser) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário é o dono da wishlist OU um guardião do dependente
    const isOwner = wishlistWithUser.userId === requesterId;

    if (!isOwner) {
      // Se não é o dono, verificar se é guardião do dependente
      const dependent = await this.userRepository.findByIdIncludingInactive(
        wishlistWithUser.userId
      );

      if (!dependent) {
        throw new NotFoundException('Wishlist not found');
      }

      // Verificar se o requesterId é um dos guardiões do dependente
      if (
        !dependent.guardianIds ||
        !dependent.guardianIds.includes(requesterId)
      ) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar esta wishlist'
        );
      }
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
    const sharing = {
      ...wishlistWithUser.sharing,
      publicLink:
        wishlistWithUser.sharing.isPublic &&
        wishlistWithUser.sharing.publicLinkToken
          ? `${process.env.FRONTEND_URL}/public/${wishlistWithUser.sharing.publicLinkToken}`
          : undefined,
    };

    const wishlistWithItems: WishlistWithItemsDto = {
      _id: wishlistWithUser._id.toString(),
      userId: wishlistWithUser.userId,
      title: wishlistWithUser.title,
      description: wishlistWithUser.description,
      sharing,
      status: wishlistWithUser.status,
      archivedAt: wishlistWithUser.archivedAt,
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
