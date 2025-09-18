import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class SoftDeleteWishlistUseCase {
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
      throw new ForbiddenException('You can only delete your own wishlists');
    }

    // Verificar se a wishlist já está arquivada
    if (wishlist.status === WishlistStatus.ARCHIVED) {
      throw new ForbiddenException('Wishlist is already archived');
    }

    // Atualizar o status para ARCHIVED e definir archivedAt
    await this.wishlistRepository.update(wishlistId, {
      status: WishlistStatus.ARCHIVED,
      archivedAt: new Date(),
    });

    return { message: 'Wishlist archived successfully' };
  }
}
