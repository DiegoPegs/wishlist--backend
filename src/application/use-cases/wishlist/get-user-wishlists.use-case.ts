import { Injectable, Inject } from '@nestjs/common';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { Item } from '../../../domain/entities/item.entity';
import { WishlistWithItemsResponseDto } from '../../dtos/wishlist/wishlist-with-items-response.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';

@Injectable()
export class GetUserWishlistsUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(_userId: string): Promise<WishlistWithItemsResponseDto[]> {
    // 1. Buscar todas as wishlists do usuário
    const wishlists = await this.wishlistRepository.findByUserId(_userId);

    // 2. Para cada wishlist, buscar seus itens e mapear para DTOs limpos
    const wishlistsWithItems = await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await this.itemRepository.findByWishlistId(wishlist._id.toString());

        // 3. Converter wishlist para objeto JavaScript puro (POJO)
        const plainWishlist = this.convertToPlainObject(wishlist);

        // 4. Mapear wishlist para DTO limpo
        const wishlistDto: WishlistWithItemsResponseDto = {
          _id: plainWishlist._id.toString(),
          userId: plainWishlist.userId.toString(),
          title: plainWishlist.title,
          description: plainWishlist.description,
          sharing: {
            isPublic: plainWishlist.sharing.isPublic,
            publicLinkToken: plainWishlist.sharing.publicLinkToken,
          },
          status: plainWishlist.status,
          archivedAt: plainWishlist.archivedAt?.toISOString(),
          items: items.map(item => this.mapItemToDto(item)),
        };

        return wishlistDto;
      })
    );

    return wishlistsWithItems;
  }

  private convertToPlainObject(wishlist: Wishlist): any {
    // Converter para objeto JavaScript puro, removendo qualquer referência ao Mongoose
    return {
      _id: wishlist._id,
      userId: wishlist.userId,
      title: wishlist.title,
      description: wishlist.description,
      sharing: {
        isPublic: wishlist.sharing.isPublic,
        publicLinkToken: wishlist.sharing.publicLinkToken,
      },
      status: wishlist.status,
      archivedAt: wishlist.archivedAt,
    };
  }

  private mapItemToDto(item: Item) {
    // Converter item para objeto JavaScript puro
    const plainItem = this.convertItemToPlainObject(item);

    return {
      _id: plainItem._id.toString(),
      wishlistId: plainItem.wishlistId.toString(),
      title: plainItem.title,
      itemType: plainItem.itemType,
      quantity: plainItem.quantity ? {
        desired: plainItem.quantity.desired,
        reserved: plainItem.quantity.reserved,
        received: plainItem.quantity.received,
      } : undefined,
      link: plainItem.link,
      imageUrl: plainItem.imageUrl,
      price: plainItem.price ? {
        min: plainItem.price.min,
        max: plainItem.price.max,
      } : undefined,
      notes: plainItem.notes,
    };
  }

  private convertItemToPlainObject(item: Item): any {
    // Converter para objeto JavaScript puro, removendo qualquer referência ao Mongoose
    return {
      _id: item._id,
      wishlistId: item.wishlistId,
      title: item.title,
      itemType: item.itemType,
      quantity: item.quantity ? {
        desired: item.quantity.desired,
        reserved: item.quantity.reserved,
        received: item.quantity.received,
      } : undefined,
      link: item.link,
      imageUrl: item.imageUrl,
      price: item.price ? {
        min: item.price.min,
        max: item.price.max,
      } : undefined,
      notes: item.notes,
    };
  }
}
