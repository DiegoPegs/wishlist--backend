import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { MarkAsReceivedDto } from '../../../application/dtos/item/mark-as-received.dto';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class MarkAsReceivedUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    itemId: string,
    dto: MarkAsReceivedDto,
    _requesterId: string,
  ): Promise<{ message: string }> {
    // a. Validar permissão do dono
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Buscar a wishlist para verificar se o usuário é o dono
    const wishlist = await this.wishlistRepository.findById(
      item.wishlistId.toString(),
    );
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário é o dono da wishlist
    if (wishlist.userId.toString() !== _requesterId) {
      throw new ForbiddenException(
        'You can only mark items as received from your own wishlists',
      );
    }

    // b. Encontrar a reserva correspondente
    const reservations = await this.reservationRepository.findByItemId(itemId);
    const reservation = reservations.find(
      (r) =>
        r.reservedByUserId.toString() === dto.receivedFromUserId.toString() &&
        r.status === ReservationStatus.RESERVED,
    );

    if (!reservation) {
      throw new NotFoundException(
        'Active reservation not found for the specified user',
      );
    }

    // c. Validar se a quantidade recebida não excede a quantidade reservada
    const currentQuantity = item.quantity || {
      desired: 0,
      reserved: 0,
      received: 0,
    };
    const availableToReceive =
      currentQuantity.reserved - currentQuantity.received;

    if (dto.quantityReceived > availableToReceive) {
      throw new BadRequestException(
        `Cannot receive ${dto.quantityReceived} items. Only ${availableToReceive} items are available to be received.`,
      );
    }

    try {
      // d. Atualizar dentro de uma transação
      // i. Atualizar os contadores no item
      const newQuantity = {
        ...currentQuantity,
        received: currentQuantity.received + dto.quantityReceived,
        reserved: currentQuantity.reserved - dto.quantityReceived, // Reduzir reservados
      };

      await this.itemRepository.update(itemId, { quantity: newQuantity });

      // ii. Atualizar o status na reserva
      const newReservationStatus =
        newQuantity.reserved === 0
          ? ReservationStatus.RECEIVED
          : ReservationStatus.PURCHASED;
      await this.reservationRepository.update(reservation._id.toString(), {
        status: newReservationStatus,
      });

      // e. (Opcional) Placeholder para notificação
      // TODO: Implementar notificação para o usuário que enviou o item
      // await this.notificationService.notifyItemReceived(
      //   dto.receivedFromUserId,
      //   itemId,
      //   dto.quantityReceived
      // );

      return {
        message: `Successfully marked ${dto.quantityReceived} items as received from user ${dto.receivedFromUserId}`,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to mark item as received: ${error.message}`);
      }
      // Verificar se é erro de duplicação do MongoDB (código 11000)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new Error('Erro de duplicação: Operação não pode ser executada');
      }
      throw new Error('Erro desconhecido ao marcar item como recebido');
    }
  }
}
