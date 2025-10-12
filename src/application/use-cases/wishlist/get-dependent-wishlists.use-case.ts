import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WishlistWithItemsResponseDto } from '../../dtos/wishlist/wishlist-with-items-response.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetDependentWishlistsUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    requesterId: string,
  ): Promise<WishlistWithItemsResponseDto[]> {
    // 1. Primeiro verificar se o dependente existe
    const dependent = await this.userRepository.findById(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // 2. Verificar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar as wishlists deste dependente',
      );
    }

    // 3. Buscar todas as wishlists do dependente
    const wishlists = await this.wishlistRepository.findByUserId(dependentId);

    // 4. Se não encontrar nenhuma wishlist, retornar array vazio (não erro)
    if (!wishlists || wishlists.length === 0) {
      return [];
    }

    // 5. Para cada wishlist, buscar seus itens e mapear para DTOs limpos
    const wishlistsWithItems = await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await this.itemRepository.findByWishlistId(
          wishlist._id.toString(),
        );

        // 6. Converter wishlist para objeto JavaScript puro (POJO)
        const plainWishlist = this.convertToPlainObject(wishlist);

        // 7. Mapear wishlist para DTO limpo
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

  private convertToPlainObject(wishlist: any): any {
    // Converter para objeto JavaScript puro, removendo qualquer referência ao Mongoose
    return JSON.parse(JSON.stringify(wishlist));
  }

  private mapItemToDto(item: any): any {
    return {
      _id: item._id.toString(),
      wishlistId: item.wishlistId.toString(),
      title: item.title,
      itemType: item.itemType,
      quantity: item.quantity,
      desiredQuantity: item.desiredQuantity,
      receivedQuantity: item.receivedQuantity,
      link: item.link,
      imageUrl: item.imageUrl,
      price: item.price,
      notes: item.notes,
    };
  }
}
