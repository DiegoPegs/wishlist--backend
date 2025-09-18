import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';

@Injectable()
export class HardDeleteWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    _wishlistId: string,
    _requesterId: string,
  ): Promise<{ message: string }> {
    // Buscar a wishlist
    const wishlist = await this.wishlistRepository.findById(_wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário é o dono da wishlist
    if (wishlist.userId.toString() !== _requesterId) {
      throw new ForbiddenException('You can only delete your own wishlists');
    }

    try {
      // Buscar todos os itens da wishlist
      const items = await this.itemRepository.findByWishlistId(_wishlistId);
      const itemIds = items.map((item) => item._id.toString());

      // Executar exclusão em cascata na ordem correta:
      // 1. Deletar todas as Messages e Conversations vinculadas aos itens
      for (const itemId of itemIds) {
        await this.messageRepository.deleteByItemId(itemId);
        await this.conversationRepository.deleteByItemId(itemId);
      }

      // 2. Deletar todas as Reservations vinculadas aos itens
      for (const itemId of itemIds) {
        await this.reservationRepository.deleteByItemId(itemId);
      }

      // 3. Deletar todos os Items da wishlist
      for (const itemId of itemIds) {
        await this.itemRepository.delete(itemId);
      }

      // 4. Deletar a própria Wishlist
      const wishlistDeleted = await this.wishlistRepository.delete(_wishlistId);
      if (!wishlistDeleted) {
        throw new Error('Failed to delete wishlist');
      }

      return { message: 'Wishlist deleted permanently' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete wishlist: ${error.message}`);
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
      throw new Error('Erro desconhecido ao deletar wishlist');
    }
  }
}
