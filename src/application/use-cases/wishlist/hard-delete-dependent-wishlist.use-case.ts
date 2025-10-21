import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class HardDeleteDependentWishlistUseCase {
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
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    wishlistId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
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
        'Você não tem permissão para excluir permanentemente wishlists deste dependente',
      );
    }

    // 3. Buscar a wishlist
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 4. Verificar se a wishlist pertence ao dependente
    if (wishlist.userId !== dependentId) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    try {
      // Buscar todos os itens da wishlist
      const items = await this.itemRepository.findByWishlistId(wishlistId);
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
      const wishlistDeleted = await this.wishlistRepository.delete(wishlistId);
      if (!wishlistDeleted) {
        throw new Error('Failed to delete wishlist');
      }

      return { message: 'Wishlist excluída permanentemente' };
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
