import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class GetWishlistByIdUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(wishlistId: string, userId: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findById(wishlistId);

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário é o dono da wishlist
    if (wishlist.userId.toString() !== userId) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }
}
