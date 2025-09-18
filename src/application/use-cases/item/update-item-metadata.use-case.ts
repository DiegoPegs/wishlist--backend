import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { UpdateItemMetadataDto } from '../../../application/dtos/item/update-item-metadata.dto';
import { Item } from '../../../domain/entities/item.entity';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class UpdateItemMetadataUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    itemId: string,
    updateItemDto: UpdateItemMetadataDto,
    requesterId: string,
  ): Promise<Item> {
    // a. Buscar o item pelo ID
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // b. Buscar a wishlist para validar permissão
    const wishlist = await this.wishlistRepository.findById(
      item.wishlistId.toString(),
    );
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // c. Validar se o requesterId é o dono da wishlist (e portanto do item)
    if (wishlist.userId.toString() !== requesterId) {
      throw new ForbiddenException(
        'You can only update items from your own wishlists',
      );
    }

    // d. Atualizar apenas os campos fornecidos no DTO
    const updateData: Partial<Item> = {};

    if (updateItemDto.title !== undefined) {
      updateData.title = updateItemDto.title;
    }

    if (updateItemDto.itemType !== undefined) {
      updateData.itemType = updateItemDto.itemType;
    }

    if (updateItemDto.link !== undefined) {
      updateData.link = updateItemDto.link;
    }

    if (updateItemDto.imageUrl !== undefined) {
      updateData.imageUrl = updateItemDto.imageUrl;
    }

    if (updateItemDto.price !== undefined) {
      updateData.price = updateItemDto.price;
    }

    if (updateItemDto.notes !== undefined) {
      updateData.notes = updateItemDto.notes;
    }

    // e. Atualizar o item no banco de dados
    const updatedItem = await this.itemRepository.update(itemId, updateData);
    if (!updatedItem) {
      throw new NotFoundException('Item not found after update');
    }

    return updatedItem;
  }
}
