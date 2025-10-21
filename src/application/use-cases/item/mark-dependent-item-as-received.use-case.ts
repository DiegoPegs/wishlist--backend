import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MarkAsReceivedDto } from '../../dtos/item/mark-as-received.dto';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Item } from '../../../domain/entities/item.entity';

@Injectable()
export class MarkDependentItemAsReceivedUseCase {
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
    markAsReceivedDto: MarkAsReceivedDto,
    requesterId: string,
  ): Promise<Item> {
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
        'Você não tem permissão para marcar itens como recebidos deste dependente',
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

    // 6. Validar quantidade recebida
    if (markAsReceivedDto.quantityReceived <= 0) {
      throw new ForbiddenException('Quantidade recebida deve ser maior que zero');
    }

    if (markAsReceivedDto.quantityReceived > (item.quantity?.desired || 1)) {
      throw new ForbiddenException(
        'Quantidade recebida não pode ser maior que a quantidade desejada',
      );
    }

    // 7. Atualizar o item
    const updatedItem = await this.itemRepository.update(itemId, {
      quantity: {
        desired: item.quantity?.desired || 1,
        reserved: item.quantity?.reserved || 0,
        received: markAsReceivedDto.quantityReceived,
      },
    });

    if (!updatedItem) {
      throw new Error('Failed to update item');
    }

    return updatedItem;
  }
}
