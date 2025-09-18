import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';

@Injectable()
export class PermanentlyDeleteDependentUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
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
    _dependentId: string,
    _requesterId: string,
  ): Promise<{ message: string }> {
    // Buscar o dependente incluindo usuários inativos
    const dependent =
      await this.userRepository.findByIdIncludingInactive(_dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Validar se o dependente está inativo
    if (dependent.status !== UserStatus.INACTIVE) {
      throw new BadRequestException(
        'Este dependente não está desativado. Desative-o primeiro antes de excluí-lo permanentemente',
      );
    }

    // Validar se o requesterId está no array guardianIds do dependente
    if (!dependent.guardianIds?.includes(_requesterId)) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir permanentemente este dependente',
      );
    }

    // Executar exclusão permanente em cascata
    await this.permanentlyDeleteDependentTransaction(
      _dependentId,
      _requesterId,
    );

    return { message: 'Dependente excluído permanentemente com sucesso' };
  }

  private async permanentlyDeleteDependentTransaction(
    _dependentId: string,
    __requesterId: string,
  ): Promise<void> {
    try {
      // Buscar o dependente novamente para obter os dados atualizados
      const dependent =
        await this.userRepository.findByIdIncludingInactive(_dependentId);
      if (!dependent) {
        throw new Error('Dependente não encontrado durante a exclusão');
      }

      // 1. Buscar todas as wishlists do dependente
      const wishlists =
        await this.wishlistRepository.findByUserId(_dependentId);

      // 2. Para cada wishlist, deletar em cascata
      for (const wishlist of wishlists) {
        if (!wishlist._id) continue;

        // 2.1. Buscar todos os itens da wishlist
        const items = await this.itemRepository.findByWishlistId(
          wishlist._id.toString(),
        );

        // 2.2. Para cada item, deletar em cascata
        for (const item of items) {
          if (!item._id) continue;

          // 2.2.1. Deletar todas as conversas relacionadas ao item
          const conversations =
            await this.conversationRepository.findByUserId(_dependentId);
          for (const conversation of conversations) {
            if (!conversation._id) continue;

            // 2.2.1.1. Deletar todas as mensagens da conversa
            await this.messageRepository.deleteByConversationId(
              conversation._id.toString(),
            );

            // 2.2.1.2. Deletar a conversa
            await this.conversationRepository.delete(
              conversation._id.toString(),
            );
          }

          // 2.2.2. Deletar todas as reservas do item
          const reservations = await this.reservationRepository.findByItemId(
            item._id.toString(),
          );
          for (const reservation of reservations) {
            if (!reservation._id) continue;
            await this.reservationRepository.delete(reservation._id.toString());
          }

          // 2.2.3. Deletar o item
          await this.itemRepository.delete(item._id.toString());
        }

        // 2.3. Deletar a wishlist
        await this.wishlistRepository.delete(wishlist._id.toString());
      }

      // 3. Deletar todas as conversas restantes do dependente
      const remainingConversations =
        await this.conversationRepository.findByUserId(_dependentId);
      for (const conversation of remainingConversations) {
        if (!conversation._id) continue;

        // 3.1. Deletar todas as mensagens da conversa
        await this.messageRepository.deleteByConversationId(
          conversation._id.toString(),
        );

        // 3.2. Deletar a conversa
        await this.conversationRepository.delete(conversation._id.toString());
      }

      // 4. Deletar todas as reservas restantes do dependente
      await this.reservationRepository.deleteByUserId(_dependentId);

      // 5. Deletar todas as mensagens restantes do dependente
      await this.messageRepository.deleteByUserId(_dependentId);

      // 6. Remover referências do dependente nos guardiões
      if (dependent.guardianIds) {
        for (const guardianId of dependent.guardianIds) {
          const guardian = await this.userRepository.findById(
            guardianId.toString(),
          );
          if (guardian && guardian.dependents) {
            const updatedDependents = guardian.dependents.filter(
              (id) => id.toString() !== _dependentId,
            );
            await this.userRepository.update(guardianId.toString(), {
              dependents: updatedDependents,
            });
          }
        }
      }

      // 7. Finalmente, deletar o próprio documento do dependente
      await this.userRepository.delete(_dependentId);
    } catch (error: unknown) {
      // Em caso de erro, reverter as mudanças seria ideal, mas como não temos transação real,
      // vamos apenas relançar o erro
      if (error instanceof Error) {
        throw new Error(
          `Erro ao excluir permanentemente o dependente: ${error.message}`,
        );
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
      throw new Error(
        'Erro desconhecido ao excluir permanentemente o dependente',
      );
    }
  }
}
