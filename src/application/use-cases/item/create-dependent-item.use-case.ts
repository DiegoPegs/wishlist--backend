import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateItemDto } from '../../dtos/item/create-item.dto';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Item } from '../../../domain/entities/item.entity';

@Injectable()
export class CreateDependentItemUseCase {
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
    wishlistId: string,
    createItemDto: CreateItemDto,
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
        'Você não tem permissão para criar itens para este dependente',
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

    // 5. Criar o item
    const item = new Item();
    item.wishlistId = wishlistId;
    item.title = createItemDto.title;
    item.description = createItemDto.description;
    item.itemType = createItemDto.itemType;
    item.quantity = {
      desired: createItemDto.quantity?.desired || 1,
      reserved: 0,
      received: 0,
    };
    item.link = createItemDto.link;
    item.imageUrl = createItemDto.imageUrl;
    item.price = createItemDto.price ? {
      min: createItemDto.price.min,
      max: createItemDto.price.max,
    } : undefined;
    item.notes = createItemDto.notes;

    const createdItem = await this.itemRepository.create(item);
    return createdItem;
  }
}
