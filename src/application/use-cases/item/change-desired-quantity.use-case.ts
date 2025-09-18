import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ChangeDesiredQuantityDto } from '../../../application/dtos/item/change-desired-quantity.dto';
import { Item } from '../../../domain/entities/item.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class ChangeDesiredQuantityUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    itemId: string,
    dto: ChangeDesiredQuantityDto,
    requesterId: string,
  ): Promise<Item> {
    // a. Validar a permissão do dono
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const wishlist = await this.wishlistRepository.findById(
      item.wishlistId.toString(),
    );
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.userId.toString() !== requesterId) {
      throw new ForbiddenException(
        'You can only update items from your own wishlists',
      );
    }

    // b. Buscar o item atual
    const currentQuantity = item.quantity || {
      desired: 0,
      reserved: 0,
      received: 0,
    };
    const newDesiredQuantity = dto.desired;

    // c. Se a nova quantidade for menor que a quantidade já reservada
    if (newDesiredQuantity < currentQuantity.reserved) {
      // Encontrar e cancelar as reservas mais antigas
      const allReservations =
        await this.reservationRepository.findByItemId(itemId);
      const reservationsToCancel = allReservations.filter(
        (reservation) => reservation.status === ReservationStatus.RESERVED,
      );

      // Ordenar por data de criação (mais antigas primeiro)
      reservationsToCancel.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const reservationsToRemove =
        currentQuantity.reserved - newDesiredQuantity;
      const reservationsToCancelList = reservationsToCancel.slice(
        0,
        reservationsToRemove,
      );

      // Executar cancelamento das reservas em uma transação
      for (const reservation of reservationsToCancelList) {
        await this.reservationRepository.update(reservation._id.toString(), {
          status: ReservationStatus.CANCELED,
        });
      }

      // Atualizar o contador quantity.reserved
      const newReservedQuantity =
        currentQuantity.reserved - reservationsToCancelList.length;

      await this.itemRepository.update(itemId, {
        quantity: {
          desired: newDesiredQuantity,
          reserved: newReservedQuantity,
          received: currentQuantity.received,
        },
      });

      // TODO: Disparar notificações para os usuários afetados
      // await this.notificationService.notifyReservationCancelled(reservationsToCancelList);
    } else {
      // d. Se a nova quantidade for maior ou igual, apenas atualizar quantity.desired
      await this.itemRepository.update(itemId, {
        quantity: {
          desired: newDesiredQuantity,
          reserved: currentQuantity.reserved,
          received: currentQuantity.received,
        },
      });
    }

    // Retornar o item atualizado
    const updatedItem = await this.itemRepository.findById(itemId);
    if (!updatedItem) {
      throw new NotFoundException('Item not found after update');
    }

    return updatedItem;
  }
}
