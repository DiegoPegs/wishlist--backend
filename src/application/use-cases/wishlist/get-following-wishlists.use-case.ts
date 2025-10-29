import { Injectable, Inject } from '@nestjs/common';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistWithItemsResponseDto } from '../../dtos/wishlist/wishlist-with-items-response.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';

@Injectable()
export class GetFollowingWishlistsUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(_userId: string): Promise<WishlistWithItemsResponseDto[]> {
    // 1. Buscar o usuário para obter a lista de following
    const user = await this.userRepository.findById(_userId);

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Se a lista following estiver vazia, retornar array vazio
    if (!user.following || user.following.length === 0) {
      return [];
    }

    // 3. Buscar todas as wishlists públicas dos usuários seguidos
    const wishlists = await this.wishlistRepository.findByUserIdsAndIsPublic(
      user.following,
    );

    // 4. Para cada wishlist, buscar seus itens e mapear para DTOs limpos
    const wishlistsWithItems = await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await this.itemRepository.findByWishlistId(
          wishlist._id.toString(),
        );

        // 5. Converter wishlist para objeto JavaScript puro (POJO)
        const plainWishlist = this.convertToPlainObject(wishlist);

        // 6. Mapear wishlist para DTO limpo
        const sharing = {
          isPublic: plainWishlist.sharing.isPublic,
          publicLinkToken: plainWishlist.sharing.publicLinkToken,
          publicLink:
            plainWishlist.sharing.isPublic &&
            plainWishlist.sharing.publicLinkToken
              ? `${process.env.FRONTEND_URL}/public/${plainWishlist.sharing.publicLinkToken}`
              : undefined,
        };

        const wishlistDto: WishlistWithItemsResponseDto = {
          _id: plainWishlist._id.toString(),
          userId: plainWishlist.userId.toString(),
          title: plainWishlist.title,
          description: plainWishlist.description,
          sharing,
          status: plainWishlist.status,
          archivedAt: plainWishlist.archivedAt?.toISOString(),
          items: items.map((item) => this.mapItemToDto(item)),
        };

        return wishlistDto;
      }),
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

  private mapItemToDto(item: any) {
    // Converter item para objeto JavaScript puro
    const plainItem = this.convertItemToPlainObject(item);

    return {
      _id: plainItem._id.toString(),
      wishlistId: plainItem.wishlistId.toString(),
      title: plainItem.title,
      itemType: plainItem.itemType,
      quantity: plainItem.quantity
        ? {
            desired: plainItem.quantity.desired,
            reserved: plainItem.quantity.reserved,
            received: plainItem.quantity.received,
          }
        : undefined,
      link: plainItem.link,
      imageUrl: plainItem.imageUrl,
      price: plainItem.price
        ? {
            min: plainItem.price.min,
            max: plainItem.price.max,
          }
        : undefined,
      notes: plainItem.notes,
    };
  }

  private convertItemToPlainObject(item: any): any {
    // Converter para objeto JavaScript puro, removendo qualquer referência ao Mongoose
    return {
      _id: item._id,
      wishlistId: item.wishlistId,
      title: item.title,
      itemType: item.itemType,
      quantity: item.quantity
        ? {
            desired: item.quantity.desired,
            reserved: item.quantity.reserved,
            received: item.quantity.received,
          }
        : undefined,
      link: item.link,
      imageUrl: item.imageUrl,
      price: item.price
        ? {
            min: item.price.min,
            max: item.price.max,
          }
        : undefined,
      notes: item.notes,
    };
  }
}

