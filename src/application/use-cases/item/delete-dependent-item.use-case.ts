import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteDependentItemUseCase {
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    itemId: string,
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
        'Você não tem permissão para excluir itens deste dependente',
      );
    }

    // 3. Buscar o item
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }

    // 4. Buscar a wishlist do item
    const wishlist = await this.wishlistRepository.findById(item.wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 5. Verificar se a wishlist pertence ao dependente
    if (wishlist.userId !== dependentId) {
      throw new NotFoundException('Item não encontrado');
    }

    // 6. Deletar o item
    const deleted = await this.itemRepository.delete(itemId);
    if (!deleted) {
      throw new Error('Failed to delete item');
    }

    return { message: 'Item excluído com sucesso' };
  }
}
