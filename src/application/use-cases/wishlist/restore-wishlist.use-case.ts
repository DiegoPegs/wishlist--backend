import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class RestoreWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    wishlistId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
    // Buscar a wishlist
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário é o dono da wishlist
    if (wishlist.userId.toString() !== requesterId) {
      throw new ForbiddenException('You can only restore your own wishlists');
    }

    // Verificar se a wishlist está arquivada
    if (wishlist.status !== WishlistStatus.ARCHIVED) {
      throw new ForbiddenException('Wishlist is not archived');
    }

    // Atualizar o status para ACTIVE e limpar archivedAt
    await this.wishlistRepository.update(wishlistId, {
      status: WishlistStatus.ACTIVE,
      archivedAt: undefined,
    });

    return { message: 'Wishlist restored successfully' };
  }
}
