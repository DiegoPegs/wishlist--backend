import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class HardDeleteItemUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    itemId: string,
    _requesterId: string,
  ): Promise<{ message: string }> {
    // a. Validar a permissão do requesterId (se ele é o dono do item)
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
        'You can only delete items from your own wishlists',
      );
    }

    try {
      // b. Dentro de uma transação do banco de dados, executar a exclusão em cascata
      // i. Deletar todas as Messages e Conversations vinculadas ao itemId
      await this.messageRepository.deleteByItemId(itemId);
      await this.conversationRepository.deleteByItemId(itemId);

      // ii. Deletar todas as Reservations vinculadas ao itemId
      await this.reservationRepository.deleteByItemId(itemId);

      // iii. Deletar o próprio Item
      const itemDeleted = await this.itemRepository.delete(itemId);
      if (!itemDeleted) {
        throw new Error('Failed to delete item');
      }

      // c. Retornar sucesso se a transação for concluída
      return { message: 'Item deleted successfully' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete item: ${error.message}`);
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
      throw new Error('Erro desconhecido ao deletar item');
    }
  }
}
