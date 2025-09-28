import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateItemDto } from '../../../application/dtos/item/create-item.dto';
import { Item, Quantity } from '../../../domain/entities/item.entity';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class CreateItemUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    createItemDto: CreateItemDto,
    wishlistId: string,
    userId: string,
  ): Promise<Item> {
    // Verificar se a wishlist existe e pertence ao usuário
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.userId.toString() !== userId) {
      throw new NotFoundException('Wishlist not found');
    }

    // Criar o item
    const item = new Item();
    item.wishlistId = wishlistId;
    item.title = createItemDto.title;
    item.description = createItemDto.description;
    item.itemType = createItemDto.itemType;

    // Converter QuantityDto para Quantity se fornecido
    if (createItemDto.quantity) {
      item.quantity = {
        desired: createItemDto.quantity.desired,
        reserved: 0, // Valor padrão
        received: 0, // Valor padrão
      } as Quantity;
    }

    item.link = createItemDto.link;
    item.imageUrl = createItemDto.imageUrl;
    item.price = createItemDto.price;
    item.notes = createItemDto.notes;

    return await this.itemRepository.create(item);
  }
}
